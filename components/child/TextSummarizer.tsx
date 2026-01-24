import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Sparkles, Copy, RotateCcw, Upload, FileText, FileImage } from 'lucide-react';
import { AIAvatar } from './AIAvatar';
import { motion, AnimatePresence } from 'motion/react';
import { VoiceAssistant } from '../VoiceAssistant';
import axios from 'axios';

interface TextSummarizerProps {
  onBack: () => void;
}

export function TextSummarizer({ onBack }: TextSummarizerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState<'file' | 'text'>('file');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

  const sampleText = "The water cycle is the continuous movement of water on, above, and below the surface of the Earth. Water can change states among liquid, vapor, and ice at various places in the water cycle. The sun heats up water in rivers, lakes, and oceans and turns it into vapor or steam. The water vapor leaves the river, lake, or ocean and goes into the air. This process is called evaporation. When the water vapor in the air gets cold, it turns back into liquid, forming clouds. This process is called condensation. When the clouds get heavy with water, the water falls back to the earth as rain, snow, sleet, or hail. This is called precipitation.";

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = [
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];
      
      if (validTypes.includes(file.type)) {
        setSelectedFile(file);
        setSummary('');
      } else {
        alert('Please select a PDF or PowerPoint file');
      }
    }
  };

  const handleSummarizeFile = async () => {
    if (!selectedFile) return;

    setIsSummarizing(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('mode', 'summary');

      const token = localStorage.getItem('auth_token');
      
      const response = await axios.post(`${API_BASE_URL}/api/pdf/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (response.data.summary) {
        setSummary(response.data.summary);
      } else {
        throw new Error('No summary returned from server');
      }
    } catch (error: any) {
      console.error('Error summarizing file:', error);
      alert(
        'Error: ' + (error.response?.data?.error || error.message || 'Failed to summarize file. Please try again.')
      );
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSummarizeText = async () => {
    if (!inputText.trim()) return;

    setIsSummarizing(true);

    try {
      const token = localStorage.getItem('auth_token');
      // If no token, use client-side API key
      const apiKey = localStorage.getItem('gemini_api_key');
      
      if (apiKey) {
        // Use Gemini API directly
        const { callGeminiAPI } = await import('../../utils/gemini-api');
        const aiSummary = await callGeminiAPI(apiKey, {
          prompt: `Please provide a clear and concise summary of the following text. Keep the main ideas and important information. Organize it with clear sections:\n\n${inputText}`,
          temperature: 0.3,
          maxOutputTokens: 800,
        });
        setSummary(aiSummary.trim());
      } else {
        // Fallback to simple summarization
        const sentences = inputText.match(/[^\.!\?]+[\.!\?]+/g) || [];
        const shortSummary = sentences.slice(0, Math.min(3, Math.ceil(sentences.length / 2))).join(' ');
        setSummary(shortSummary || inputText.substring(0, 300) + '...');
      }
    } catch (error: any) {
      console.error('Error summarizing text:', error);
      // Fallback
      const sentences = inputText.match(/[^\.!\?]+[\.!\?]+/g) || [];
      const shortSummary = sentences.slice(0, Math.min(3, Math.ceil(sentences.length / 2))).join(' ');
      setSummary(shortSummary || inputText.substring(0, 300) + '...');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSummarize = () => {
    if (mode === 'file') {
      handleSummarizeFile();
    } else {
      handleSummarizeText();
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setInputText('');
    setSummary('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUseSample = () => {
    setMode('text');
    setInputText(sampleText);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
  };

  const getFileIcon = () => {
    if (!selectedFile) return <Upload className="w-12 h-12" />;
    
    if (selectedFile.type === 'application/pdf') {
      return <FileText className="w-12 h-12 text-red-500" />;
    } else {
      return <FileImage className="w-12 h-12 text-orange-500" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
        <div className="flex items-center gap-2 text-purple-600">
          <Sparkles className="w-5 h-5" />
          <span>Document Summarizer</span>
        </div>
      </div>

      {/* AI Avatar */}
      <AIAvatar 
        message="Hi! I can summarize PDF files, PowerPoint presentations, or any text you provide. Upload a document or type/paste text to get started!"
        mood="happy"
      />

      {/* Mode Toggle */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setMode('file')}
          className={`px-6 py-2 rounded-full transition-all ${
            mode === 'file'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Upload File
        </button>
        <button
          onClick={() => setMode('text')}
          className={`px-6 py-2 rounded-full transition-all ${
            mode === 'text'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Type Text
        </button>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-900">
              {mode === 'file' ? 'Upload Document' : 'Your Text'}
            </h3>
            {mode === 'text' && (
              <button
                onClick={handleUseSample}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                Use Sample Text
              </button>
            )}
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {mode === 'file' ? (
              <>
                <div className="h-80 p-6 flex flex-col items-center justify-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-4 p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 transition-colors"
                  >
                    {getFileIcon()}
                    <div className="text-center">
                      <p className="text-gray-900 font-medium mb-1">
                        {selectedFile ? selectedFile.name : 'Click to upload'}
                      </p>
                      <p className="text-sm text-gray-500">
                        PDF or PowerPoint (Max 10MB)
                      </p>
                    </div>
                  </label>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t">
                  <span className="text-sm text-gray-600">
                    {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'No file selected'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Clear
                    </button>
                    <button
                      onClick={handleSummarize}
                      disabled={!selectedFile || isSummarizing}
                      className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      Summarize
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste or type the text you want to summarize here..."
                  className="w-full h-80 p-6 text-gray-900 resize-none focus:outline-none"
                />
                <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t">
                  <span className="text-sm text-gray-600">
                    {inputText.split(' ').filter(w => w).length} words
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Clear
                    </button>
                    <button
                      onClick={handleSummarize}
                      disabled={!inputText.trim() || isSummarizing}
                      className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      Summarize
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          <h3 className="text-gray-900">Summary</h3>
          
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-[400px] flex flex-col">
            <div className="flex-1 p-6 overflow-y-auto">
              <AnimatePresence mode="wait">
                {isSummarizing ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center gap-4"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center"
                    >
                      <Sparkles className="w-8 h-8 text-white" />
                    </motion.div>
                    <p className="text-gray-600">Summarizing your {mode === 'file' ? 'document' : 'text'}...</p>
                    
                    {/* Animated shrinking paragraph */}
                    <div className="w-full max-w-xs space-y-2 mt-4">
                      <motion.div
                        animate={{ width: ['100%', '100%', '60%'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="h-2 bg-purple-200 rounded"
                      />
                      <motion.div
                        animate={{ width: ['100%', '100%', '50%'] }}
                        transition={{ duration: 2, delay: 0.2, repeat: Infinity }}
                        className="h-2 bg-purple-200 rounded"
                      />
                      <motion.div
                        animate={{ width: ['100%', '100%', '40%'] }}
                        transition={{ duration: 2, delay: 0.4, repeat: Infinity }}
                        className="h-2 bg-purple-200 rounded"
                      />
                    </div>
                  </motion.div>
                ) : summary ? (
                  <motion.div
                    key="summary"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-full"
                  >
                    <div className="text-gray-900 leading-relaxed whitespace-pre-wrap">{summary}</div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex items-center justify-center text-gray-400"
                  >
                    Your summary will appear here
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {summary && !isSummarizing && (
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t">
                <span className="text-sm text-gray-600">
                  {summary.split(' ').filter(w => w).length} words
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 hover:text-purple-700 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6">
        <h3 className="text-gray-900 mb-3">💡 Tips for Better Summaries</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-cyan-600 mt-1">•</span>
            <span>Upload PDFs or PowerPoint files for automatic text extraction</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-600 mt-1">•</span>
            <span>The AI keeps the most important information and key concepts</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-600 mt-1">•</span>
            <span>Perfect for studying and understanding complex documents!</span>
          </li>
        </ul>
      </div>

      {/* Voice Assistant */}
      <VoiceAssistant 
        onCommand={(cmd) => {
          if (cmd.toLowerCase().includes('summarize') || cmd.toLowerCase().includes('summary')) {
            handleSummarize();
            (window as any).todaiSpeak?.('Summarizing now');
          } else if (cmd.toLowerCase().includes('sample') || cmd.toLowerCase().includes('example')) {
            handleUseSample();
            (window as any).todaiSpeak?.('Sample text loaded');
          } else if (cmd.toLowerCase().includes('clear') || cmd.toLowerCase().includes('reset')) {
            handleReset();
            (window as any).todaiSpeak?.('Cleared');
          } else if (cmd.toLowerCase().includes('copy')) {
            handleCopy();
          }
        }}
      />
    </div>
  );
}
