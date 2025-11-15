// Gemini API utility with dynamic model discovery
export interface GeminiRequest {
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
}

// Cache for working configuration
let cachedConfig: { version: string; model: string } | null = null;
let availableModelsCache: Array<{ version: string; model: string }> | null = null;

// Model priority scoring - prefer stable, high-quota models
function getModelPriority(modelName: string): number {
  // Higher score = higher priority
  
  // Stable, high-quota models (best)
  if (modelName.includes('1.5-flash') && !modelName.includes('preview')) return 100;
  if (modelName.includes('1.0-pro') && !modelName.includes('preview')) return 95;
  
  // Stable, medium-quota models
  if (modelName.includes('1.5-pro') && !modelName.includes('preview')) return 90;
  if (modelName === 'gemini-pro') return 85;
  
  // Flash preview models (newer but may be overloaded)
  if (modelName.includes('1.5-flash') && modelName.includes('preview')) return 70;
  if (modelName.includes('2.0-flash')) return 65;
  
  // Pro preview models (lower quota, may be overloaded)
  if (modelName.includes('1.5-pro') && modelName.includes('preview')) return 50;
  if (modelName.includes('2.5-flash')) return 45;
  
  // Experimental/newest models (most likely overloaded, lowest quota)
  if (modelName.includes('2.5-pro')) return 20;
  if (modelName.includes('preview')) return 10;
  
  // Unknown/other models
  return 30;
}

// Discover available models dynamically
async function discoverAvailableModels(apiKey: string): Promise<Array<{ version: string; model: string }>> {
  // Return cached models if available
  if (availableModelsCache && availableModelsCache.length > 0) {
    console.log('📦 Using cached models:', availableModelsCache);
    return availableModelsCache;
  }

  console.log('🔍 Discovering available models...');
  const versions = ['v1beta', 'v1'];
  const availableModels: Array<{ version: string; model: string }> = [];

  for (const version of versions) {
    try {
      const url = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`Could not list ${version} models:`, response.status);
        continue;
      }

      const data = await response.json();

      if (data.models && Array.isArray(data.models)) {
        for (const modelInfo of data.models) {
          // Check if model supports generateContent
          if (modelInfo.supportedGenerationMethods?.includes('generateContent')) {
            // Extract model name from full path (e.g., "models/gemini-pro" -> "gemini-pro")
            const modelName = modelInfo.name.replace('models/', '');
            availableModels.push({ version, model: modelName });
            console.log(`✅ Found: ${version}/${modelName}`);
          }
        }
      }
    } catch (error: any) {
      console.warn(`Error listing ${version} models:`, error.message);
    }
  }

  // Sort models by priority (stable, high-quota models first)
  availableModels.sort((a, b) => {
    const priorityA = getModelPriority(a.model);
    const priorityB = getModelPriority(b.model);
    return priorityB - priorityA; // Higher priority first
  });

  console.log('📊 Models sorted by priority:', availableModels.map(m => 
    `${m.model} (priority: ${getModelPriority(m.model)})`
  ));

  // Cache the results
  if (availableModels.length > 0) {
    availableModelsCache = availableModels;
    console.log(`📦 Cached ${availableModels.length} available models`);
  } else {
    console.error('⚠️ No models found! API might not be enabled or ready.');
  }

  return availableModels;
}

export async function callGeminiAPI(
  apiKey: string,
  request: GeminiRequest
): Promise<string> {
  // Validate API key
  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_API_KEY_HERE') {
    throw new Error(
      '⚠️ Invalid API Key\n\n' +
      'Please set up your Gemini API key:\n' +
      '1. Go to https://aistudio.google.com/app/apikey\n' +
      '2. Create a new API key\n' +
      '3. Copy and paste it in settings'
    );
  }

  // If we have a cached working config, try it first
  if (cachedConfig) {
    try {
      const result = await tryApiCall(apiKey, request, cachedConfig);
      return result;
    } catch (error: any) {
      console.warn('Cached config failed, rediscovering models...', error.message);
      cachedConfig = null;
      availableModelsCache = null; // Clear model cache too
    }
  }

  // Discover available models
  const availableModels = await discoverAvailableModels(apiKey);

  if (availableModels.length === 0) {
    throw new Error(
      '⚠️ No Models Available\n\n' +
      'The Generative Language API appears to be enabled, but no models are available.\n\n' +
      'This usually means:\n' +
      '1. The API was just enabled and needs 2-5 more minutes to fully activate\n' +
      '2. Your API key has restrictions that prevent model access\n' +
      '3. There might be a regional availability issue\n\n' +
      'Please:\n' +
      '• Wait 5 minutes and try again\n' +
      '• Check API key restrictions at https://console.cloud.google.com/apis/credentials\n' +
      '• Try creating a new API key in a new project'
    );
  }

  // Try each available model
  let lastError: Error | null = null;
  let quotaExceededCount = 0;
  let quotaExceededModels: string[] = [];
  let overloadedCount = 0;
  let overloadedModels: string[] = [];
  
  for (const config of availableModels) {
    try {
      console.log(`Trying ${config.version}/models/${config.model}...`);
      const result = await tryApiCall(apiKey, request, config);
      
      // Success! Cache this configuration
      cachedConfig = config;
      console.log(`✅ Success with ${config.version}/models/${config.model}`);
      
      // If we had issues but this model worked, notify user
      if (quotaExceededCount > 0 || overloadedCount > 0) {
        console.log(`ℹ️ Note: Skipped ${quotaExceededCount} quota-exceeded and ${overloadedCount} overloaded models, but ${config.model} is working`);
      }
      
      return result;
    } catch (error: any) {
      lastError = error;
      
      // If it's a quota error, try the next model
      if (error.message.includes('QUOTA_EXCEEDED') || error.message.includes('quota') || error.message.includes('Quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
        quotaExceededCount++;
        quotaExceededModels.push(config.model);
        console.warn(`⚠️ Quota exceeded for ${config.model}, trying next model...`);
        continue;
      }
      
      // If model is overloaded, try next model (with optional retry)
      if (error.message.includes('overloaded') || error.message.includes('OVERLOADED') || error.message.includes('503') || error.message.includes('UNAVAILABLE')) {
        overloadedCount++;
        overloadedModels.push(config.model);
        console.warn(`⚠️ Model ${config.model} is overloaded, trying next model...`);
        continue;
      }
      
      // If it's an invalid API key, stop trying
      if (error.message.includes('API key not valid') || error.message.includes('API_KEY_INVALID')) {
        throw new Error(
          '⚠️ Invalid API Key\n\n' +
          'Your API key is not valid. Please:\n' +
          '1. Double-check you copied the entire key (starts with "AIza")\n' +
          '2. Make sure there are no extra spaces\n' +
          '3. Go to https://aistudio.google.com/app/apikey\n' +
          '4. Create a new API key in a new project\n' +
          '5. Wait 1-2 minutes after creating before testing'
        );
      }
      
      console.warn(`Failed with ${config.version}/models/${config.model}:`, error.message);
    }
  }
  
  // All models failed - check why and provide specific guidance
  const totalFailures = quotaExceededCount + overloadedCount;
  
  // Case 1: All models are overloaded (Google server issue)
  if (overloadedCount === availableModels.length) {
    throw new Error(
      '🚦 All Models Currently Overloaded\n\n' +
      `All ${availableModels.length} available models are experiencing high traffic on Google's servers.\n\n` +
      '💡 Quick Solutions:\n\n' +
      '1. WAIT & RETRY (Recommended):\n' +
      '   • Wait 30-60 seconds and try again\n' +
      '   • Server load usually clears quickly\n' +
      '   • This is temporary - not your fault!\n\n' +
      '2. Try different time:\n' +
      '   • Peak hours have more traffic\n' +
      '   • Try early morning or late evening\n\n' +
      '3. Check Google AI Status:\n' +
      '   • Visit https://status.cloud.google.com/\n' +
      '   • See if there are known issues\n\n' +
      `Overloaded models: ${overloadedModels.join(', ')}\n\n` +
      `⏰ This is usually temporary. Please try again in a minute!`
    );
  }
  
  // Case 2: All models quota exceeded
  if (quotaExceededCount === availableModels.length) {
    throw new Error(
      '⚠️ All Models Quota Exceeded\n\n' +
      `All ${availableModels.length} available models have exceeded their quota limits.\n\n` +
      '💡 Quick Fix (2 minutes):\n\n' +
      '1. CREATE NEW API KEY IN NEW PROJECT:\n' +
      '   • Go to https://aistudio.google.com/app/apikey\n' +
      '   • Click "Create API Key"\n' +
      '   • Select "Create API key in NEW PROJECT" ← Important!\n' +
      '   • Each new project gets fresh quota limits!\n\n' +
      '2. Enable API in new project:\n' +
      '   • https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com\n' +
      '   • Make sure you\'re in the new project\n' +
      '   • Click ENABLE and wait 2 minutes\n\n' +
      '3. Use the new key in Tod AI\n\n' +
      'Alternative: Wait for daily quota reset (midnight UTC)\n\n' +
      `Models that hit quota: ${quotaExceededModels.join(', ')}`
    );
  }
  
  // Case 3: Mix of overloaded and quota exceeded
  if (overloadedCount > 0 && quotaExceededCount > 0) {
    throw new Error(
      '⚠️ Mixed Issues Detected\n\n' +
      `• ${quotaExceededCount} model(s) hit quota limits\n` +
      `• ${overloadedCount} model(s) are overloaded\n` +
      `• Other models had different errors\n\n` +
      '💡 Best Solution:\n\n' +
      '1. CREATE NEW API KEY (fixes quota):\n' +
      '   • https://aistudio.google.com/app/apikey\n' +
      '   • "Create API key in new project"\n\n' +
      '2. WAIT 1 MINUTE (fixes overload):\n' +
      '   • Server overload is temporary\n' +
      '   • Then test with new key\n\n' +
      `Quota exceeded: ${quotaExceededModels.join(', ')}\n` +
      `Overloaded: ${overloadedModels.join(', ')}\n\n` +
      `Last error: ${lastError?.message || 'Unknown error'}`
    );
  }
  
  // Case 4: Some overloaded, other failures
  if (overloadedCount > 0) {
    throw new Error(
      '🚦 Models Overloaded or Unavailable\n\n' +
      `${overloadedCount} model(s) are overloaded, and other models failed.\n\n` +
      '💡 Solutions:\n\n' +
      '1. WAIT & RETRY (30-60 seconds):\n' +
      '   • Server overload is usually temporary\n' +
      '   • Try again in a minute\n\n' +
      '2. Create new API key if needed:\n' +
      '   • https://aistudio.google.com/app/apikey\n\n' +
      `Overloaded models: ${overloadedModels.join(', ')}\n\n` +
      `Last error: ${lastError?.message || 'Unknown error'}`
    );
  }
  
  // Case 5: Some quota, other failures
  if (quotaExceededCount > 0) {
    throw new Error(
      '⚠️ API Quota Issues\n\n' +
      `${quotaExceededCount} model(s) exceeded quota, and other models failed.\n\n` +
      '💡 Solutions:\n\n' +
      '1. Create a new API key:\n' +
      '   • https://aistudio.google.com/app/apikey\n' +
      '   • Select "Create API key in new project"\n\n' +
      '2. Wait and retry in 1-2 hours\n\n' +
      `Models with quota issues: ${quotaExceededModels.join(', ')}\n\n` +
      `Last error: ${lastError?.message || 'Unknown error'}`
    );
  }

  // All configurations failed
  throw new Error(
    '⚠️ All Available Models Failed\n\n' +
    `Found ${availableModels.length} model(s) but none worked.\n\n` +
    'This might mean:\n' +
    '1. The API is still activating (wait 5 more minutes)\n' +
    '2. There are temporary issues with the API\n' +
    '3. Your API key has usage restrictions\n\n' +
    `Last error: ${lastError?.message || 'Unknown error'}`
  );
}

async function tryApiCall(
  apiKey: string,
  request: GeminiRequest,
  config: { version: string; model: string },
  retryCount: number = 0
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/${config.version}/models/${config.model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: request.prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: request.temperature ?? 0.7,
        maxOutputTokens: request.maxOutputTokens ?? 1024,
      },
    }),
  });

  const data = await response.json();

  // Check for API errors
  if (data.error) {
    const errorMessage = data.error.message || 'API Error';
    const errorCode = data.error.code || '';
    const errorStatus = data.error.status || '';
    
    // Enhanced error messages for common issues
    if (errorMessage.includes('API key not valid') || errorStatus === 'INVALID_ARGUMENT') {
      throw new Error('API_KEY_INVALID');
    }
    
    if (errorMessage.includes('quota') || errorStatus === 'RESOURCE_EXHAUSTED') {
      throw new Error('QUOTA_EXCEEDED');
    }
    
    // Handle overloaded/unavailable models with retry
    if (errorMessage.includes('overloaded') || errorMessage.includes('OVERLOADED') || 
        errorStatus === 'UNAVAILABLE' || response.status === 503) {
      
      // Retry once after a short delay for overloaded models
      if (retryCount === 0) {
        console.log(`⏳ Model ${config.model} overloaded, retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return tryApiCall(apiKey, request, config, retryCount + 1);
      }
      
      throw new Error('OVERLOADED');
    }
    
    if (errorMessage.includes('not found') || errorMessage.includes('not available') || response.status === 404) {
      throw new Error(`Model ${config.model} not available`);
    }
    
    if (errorMessage.includes('API has not been used') || errorMessage.includes('not enabled')) {
      throw new Error('API_NOT_ENABLED');
    }
    
    // Return the actual error message
    throw new Error(errorMessage);
  }

  // Extract the response text with better error handling
  try {
    if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
      throw new Error('No response candidates returned');
    }

    const candidate = data.candidates[0];
    
    if (!candidate.content) {
      throw new Error('No content in response');
    }

    if (!candidate.content.parts || !Array.isArray(candidate.content.parts) || candidate.content.parts.length === 0) {
      throw new Error('No parts in response content');
    }

    const text = candidate.content.parts[0].text;
    
    if (typeof text !== 'string') {
      throw new Error('Response text is not a string');
    }

    if (text.trim() === '') {
      throw new Error('Empty response text');
    }

    return text;
  } catch (parseError: any) {
    console.error('Response parsing error:', parseError);
    console.error('Response data:', JSON.stringify(data, null, 2));
    throw new Error(`Invalid response format: ${parseError.message}`);
  }
}

// List available models
export async function listAvailableModels(apiKey: string): Promise<string[]> {
  const models = await discoverAvailableModels(apiKey);
  return models.map(m => `${m.version}:${m.model}`);
}

// Test the API connection with dynamic model discovery
export async function testGeminiConnection(apiKey: string): Promise<{
  success: boolean;
  model?: string;
  version?: string;
  message?: string;
  error?: string;
  availableModels?: string[];
}> {
  try {
    console.log('🔍 Testing API connection...');
    console.log('📝 API Key format:', apiKey.substring(0, 10) + '...');
    console.log('📏 API Key length:', apiKey.length);
    
    // Clear caches for fresh test
    cachedConfig = null;
    availableModelsCache = null;
    
    // Discover available models
    console.log('📋 Discovering available models...');
    const models = await discoverAvailableModels(apiKey);
    
    if (models.length === 0) {
      return {
        success: false,
        error: 
          '⚠️ API Not Enabled or Not Ready\n\n' +
          'No models are available. This means:\n\n' +
          '1. The Generative Language API is NOT enabled yet\n' +
          '2. The API was just enabled and needs 2-5 more minutes\n' +
          '3. Your API key has restrictions\n\n' +
          'Please:\n' +
          '• Enable at: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com\n' +
          '• Wait 5 full minutes after enabling\n' +
          '• Try again',
        availableModels: [],
      };
    }
    
    console.log(`✅ Found ${models.length} available models`);
    const availableModelsList = models.map(m => `${m.version}:${m.model}`);
    
    // Now try to actually call the API with the first available model
    const result = await callGeminiAPI(apiKey, {
      prompt: 'Say "Hello! Your API is working!" in a friendly way.',
      temperature: 0.5,
      maxOutputTokens: 50,
    });

    console.log('✅ Test successful!');
    console.log('📤 Response received:', result.substring(0, 50) + '...');

    if (cachedConfig) {
      return {
        success: true,
        model: cachedConfig.model,
        version: cachedConfig.version,
        message: result,
        availableModels: availableModelsList,
      };
    }

    return {
      success: true,
      message: result,
      availableModels: availableModelsList,
    };
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Get the currently working configuration (for debugging)
export function getWorkingConfig(): { version: string; model: string } | null {
  return cachedConfig;
}

// Clear all caches
export function clearCache(): void {
  cachedConfig = null;
  availableModelsCache = null;
  console.log('✨ API cache cleared');
}
