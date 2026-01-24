import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward, SkipBack, Code2, X, Zap } from 'lucide-react';

interface VisualizerProps {
  isOpen: boolean;
  onClose: () => void;
  problemTitle: string;
}

interface ExecutionStep {
  line: number;
  variables: Record<string, any>;
  array?: number[];
  highlightIndices?: number[];
  description: string;
}

export const AlgorithmVisualizer: React.FC<VisualizerProps> = ({ isOpen, onClose, problemTitle }) => {
  const [userCode, setUserCode] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1000);
  const [visualizationType, setVisualizationType] = useState<'array' | 'tree' | 'graph'>('array');

  // Example code templates
  const codeTemplates = {
    'bubble-sort': `// Bubble Sort
function bubbleSort(arr) {
  let n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
    'binary-search': `// Binary Search
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
    'quick-sort': `// Quick Sort
function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    let pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
  return arr;
}`,
    'merge-sort': `// Merge Sort
function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  let mid = Math.floor(arr.length / 2);
  let left = mergeSort(arr.slice(0, mid));
  let right = mergeSort(arr.slice(mid));
  return merge(left, right);
}`,
    'insertion-sort': `// Insertion Sort
function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}`,
    'selection-sort': `// Selection Sort
function selectionSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
  }
  return arr;
}`,
    'linear-search': `// Linear Search
function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i;
    }
  }
  return -1;
}`,
    'two-pointer': `// Two Pointer - Two Sum Sorted
function twoSum(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    let sum = arr[left] + arr[right];
    if (sum === target) return [left, right];
    if (sum < target) left++;
    else right--;
  }
  return [-1, -1];
}`,
    'reverse-array': `// Reverse Array
function reverseArray(arr) {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++;
    right--;
  }
  return arr;
}`,
    'find-max': `// Find Maximum Element
function findMax(arr) {
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  return max;
}`
  };

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, playSpeed);
      return () => clearTimeout(timer);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, steps.length, playSpeed]);

  const simulateExecution = () => {
    if (!userCode.trim()) return;
    
    const mockSteps: ExecutionStep[] = [];
    const arr = [64, 34, 25, 12, 22, 11, 90];
    const codeLines = userCode.split('\n');
    
    // Parse user's code and simulate execution
    try {
      // Extract variable declarations and initialize them
      const variables: Record<string, any> = { n: arr.length, arr: [...arr] };
      
      // Process each line of code
      for (let lineIdx = 0; lineIdx < codeLines.length; lineIdx++) {
        const line = codeLines[lineIdx].trim();
        
        // Skip comments and empty lines
        if (!line || line.startsWith('//') || line.startsWith('function') || line === '}' || line === '{') {
          continue;
        }
        
        // Variable declarations
        if (line.includes('let ') || line.includes('const ')) {
          const match = line.match(/(?:let|const)\s+(\w+)\s*=\s*(.+?)[;,]/);
          if (match) {
            const varName = match[1];
            const varValue = match[2].trim();
            
            // Evaluate the value
            if (varValue.includes('arr.length')) {
              variables[varName] = arr.length;
            } else if (varValue.includes('Math.floor')) {
              const expr = varValue.replace(/(\w+)/g, (m) => variables[m] !== undefined ? variables[m] : m);
              try {
                variables[varName] = eval(expr);
              } catch {
                variables[varName] = 0;
              }
            } else if (!isNaN(Number(varValue))) {
              variables[varName] = Number(varValue);
            } else {
              variables[varName] = varValue;
            }
            
            mockSteps.push({
              line: lineIdx + 1,
              variables: { ...variables },
              array: [...arr],
              highlightIndices: [],
              description: `Initialized ${varName} = ${variables[varName]}`
            });
          }
        }
        
        // For loops
        if (line.includes('for (')) {
          const match = line.match(/for\s*\(\s*let\s+(\w+)\s*=\s*(\d+)/);
          if (match) {
            const loopVar = match[1];
            variables[loopVar] = Number(match[2]);
            
            mockSteps.push({
              line: lineIdx + 1,
              variables: { ...variables },
              array: [...arr],
              highlightIndices: [],
              description: `Starting loop with ${loopVar} = ${variables[loopVar]}`
            });
          }
        }
        
        // Comparisons
        if (line.includes('if (') && line.includes('[') && line.includes('>')) {
          const match = line.match(/arr\[(\w+)\]\s*>\s*arr\[(\w+)\s*\+\s*1\]/);
          if (match) {
            const idx1 = match[1];
            const val1 = variables[idx1] !== undefined ? variables[idx1] : 0;
            const val2 = val1 + 1;
            
            if (val2 < arr.length) {
              mockSteps.push({
                line: lineIdx + 1,
                variables: { ...variables },
                array: [...arr],
                highlightIndices: [val1, val2],
                description: `Comparing arr[${val1}] (${arr[val1]}) with arr[${val2}] (${arr[val2]})`
              });
            }
          }
        }
        
        // Array swaps
        if (line.includes('[arr[') && line.includes(']=')) {
          const match = line.match(/\[arr\[(\w+)\],\s*arr\[(\w+)\s*\+\s*1\]\]\s*=\s*\[arr\[(\w+)\s*\+\s*1\],\s*arr\[(\w+)\]\]/);
          if (match) {
            const idx = match[1];
            const val = variables[idx] !== undefined ? variables[idx] : 0;
            
            if (val < arr.length - 1) {
              [arr[val], arr[val + 1]] = [arr[val + 1], arr[val]];
              
              mockSteps.push({
                line: lineIdx + 1,
                variables: { ...variables },
                array: [...arr],
                highlightIndices: [val, val + 1],
                description: `Swapped! arr[${val}] ⇄ arr[${val + 1}]`
              });
            }
          }
        }
        
        // While loops
        if (line.includes('while (')) {
          const match = line.match(/while\s*\(\s*(\w+)\s*(<|>|<=|>=|===|!==)\s*(\w+)/);
          if (match) {
            const var1 = match[1];
            const operator = match[2];
            const var2 = match[3];
            
            mockSteps.push({
              line: lineIdx + 1,
              variables: { ...variables },
              array: [...arr],
              highlightIndices: [],
              description: `While loop: checking ${var1} ${operator} ${var2}`
            });
          }
        }
        
        // Variable updates (i++, j--, etc.)
        if (line.match(/^\w+\+\+/) || line.match(/^\w+--/)) {
          const varName = line.replace(/(\+\+|--|;)/g, '').trim();
          if (variables[varName] !== undefined) {
            variables[varName] += line.includes('++') ? 1 : -1;
            
            mockSteps.push({
              line: lineIdx + 1,
              variables: { ...variables },
              array: [...arr],
              highlightIndices: [],
              description: `Updated ${varName} = ${variables[varName]}`
            });
          }
        }
      }
      
      // Add completion step
      mockSteps.push({
        line: -1,
        variables: { ...variables },
        array: [...arr],
        highlightIndices: [],
        description: 'Execution Complete! ✅'
      });
      
    } catch (error) {
      console.error('Error parsing code:', error);
      // Fallback to simple bubble sort simulation
      for (let i = 0; i < arr.length - 1; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
          mockSteps.push({
            line: -1,
            variables: { i, j },
            array: [...arr],
            highlightIndices: [j, j + 1],
            description: `Comparing elements at positions ${j} and ${j + 1}`
          });

          if (arr[j] > arr[j + 1]) {
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            mockSteps.push({
              line: -1,
              variables: { i, j },
              array: [...arr],
              highlightIndices: [j, j + 1],
              description: `Swapped elements!`
            });
          }
        }
      }
      
      mockSteps.push({
        line: -1,
        variables: {},
        array: [...arr],
        highlightIndices: [],
        description: 'Execution Complete! ✅'
      });
    }

    setSteps(mockSteps);
    setCurrentStep(0);
  };

  const handlePlay = () => setIsPlaying(!isPlaying);
  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };
  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(prev => prev + 1);
  };
  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const currentStepData = steps[currentStep];
  const codeLines = userCode.split('\n');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0f1629] border-2 border-[#00d4ff] rounded-2xl w-full max-w-7xl h-[90vh] overflow-hidden shadow-2xl shadow-[#00d4ff]/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00d4ff]/20 to-[#0ea5e9]/20 border-b-2 border-[#00d4ff]/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] rounded-xl flex items-center justify-center shadow-lg shadow-[#00d4ff]/50">
                <Zap className="w-7 h-7 text-[#0a0e27]" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Algorithm Visualizer</h2>
                <p className="text-[#00d4ff]">{problemTitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/10 rounded-xl transition text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 h-[calc(90vh-120px)] overflow-auto">
          {/* Code Editor Section */}
          <div className="space-y-4">
            <div className="bg-[#1a1f3a]/90 backdrop-blur-md border border-[#00d4ff]/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-[#00d4ff]" />
                  Your Code
                </h3>
                <select
                  onChange={(e) => setUserCode(codeTemplates[e.target.value as keyof typeof codeTemplates] || '')}
                  className="bg-[#0f1629] border border-[#00d4ff]/30 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="">Select Template</option>
                  <option value="bubble-sort">🔵 Bubble Sort</option>
                  <option value="selection-sort">🎯 Selection Sort</option>
                  <option value="insertion-sort">📌 Insertion Sort</option>
                  <option value="merge-sort">🔀 Merge Sort</option>
                  <option value="quick-sort">⚡ Quick Sort</option>
                  <option value="binary-search">🔍 Binary Search</option>
                  <option value="linear-search">➡️ Linear Search</option>
                  <option value="two-pointer">👉👈 Two Pointer</option>
                  <option value="reverse-array">🔄 Reverse Array</option>
                  <option value="find-max">🏆 Find Maximum</option>
                </select>
              </div>
              
              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                placeholder="Paste your algorithm code here (JavaScript/Python)..."
                className="w-full h-[400px] bg-[#0f1629] border border-[#00d4ff]/30 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                spellCheck={false}
              />

              <div className="mt-4">
                <button
                  onClick={simulateExecution}
                  className="w-full py-3 bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] text-[#0a0e27] font-bold rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Visualize Algorithm
                </button>
              </div>
            </div>

            {/* Line-by-Line Execution */}
            {steps.length > 0 && (
              <div className="bg-[#1a1f3a]/90 backdrop-blur-md border border-[#00d4ff]/30 rounded-xl p-4">
                <h3 className="text-xl font-bold text-white mb-4">Code Execution (Line-by-Line)</h3>
                <div className="bg-[#0f1629] rounded-lg p-4 font-mono text-sm overflow-auto max-h-[200px]">
                  {codeLines.map((line, index) => (
                    <div
                      key={index}
                      className={`py-1 px-2 transition-all rounded ${
                        currentStepData?.line === index + 1
                          ? 'bg-gradient-to-r from-[#00d4ff]/30 to-[#0ea5e9]/30 border-l-4 border-[#00d4ff] text-white font-bold shadow-lg shadow-[#00d4ff]/20 scale-[1.02]'
                          : 'text-gray-400 hover:bg-white/5'
                      }`}
                    >
                      <span className="text-gray-600 mr-4 select-none">{String(index + 1).padStart(2, '0')}</span>
                      <span className={currentStepData?.line === index + 1 ? 'text-[#00d4ff]' : ''}>{line || ' '}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-gray-400 flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#00d4ff] rounded-full animate-pulse"></div>
                  Currently executing line {currentStepData?.line > 0 ? currentStepData.line : 'N/A'}
                </div>
              </div>
            )}
          </div>

          {/* Visualization Section */}
          <div className="space-y-4">
            {/* Array Visualization */}
            {steps.length > 0 && currentStepData && (
              <>
                <div className="bg-[#1a1f3a]/90 backdrop-blur-md border border-[#00d4ff]/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Array Visualization</h3>
                  
                  <div className="flex items-end justify-center gap-2 mb-8 min-h-[200px]">
                    {currentStepData.array?.map((value, index) => {
                      const isHighlighted = currentStepData.highlightIndices?.includes(index);
                      const height = (value / Math.max(...(currentStepData.array || [1]))) * 150;
                      
                      return (
                        <div key={index} className="flex flex-col items-center gap-2">
                          <div
                            className={`w-12 rounded-t-lg transition-all duration-300 flex items-end justify-center pb-2 font-bold ${
                              isHighlighted
                                ? 'bg-gradient-to-t from-[#00d4ff] to-[#0ea5e9] shadow-[0_0_20px_rgba(0,212,255,0.8)] scale-110'
                                : 'bg-gradient-to-t from-purple-500 to-pink-500'
                            }`}
                            style={{ height: `${height}px` }}
                          >
                            <span className="text-white text-sm">{value}</span>
                          </div>
                          <div className="text-gray-400 text-xs">[{index}]</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Variables Display */}
                  <div className="bg-[#0f1629] border border-[#00d4ff]/20 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-semibold text-[#00d4ff] mb-2">Variables</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(currentStepData.variables).map(([key, value]) => (
                        <div key={key} className="bg-[#1a1f3a] rounded-lg p-2">
                          <span className="text-gray-400 text-xs">{key}</span>
                          <span className="text-white font-bold ml-2">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-gradient-to-r from-[#00d4ff]/10 to-[#0ea5e9]/10 border border-[#00d4ff]/30 rounded-lg p-4">
                    <p className="text-white text-center font-medium">{currentStepData.description}</p>
                  </div>
                </div>

                {/* Controls */}
                <div className="bg-[#1a1f3a]/90 backdrop-blur-md border border-[#00d4ff]/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-white">
                      Step <span className="text-[#00d4ff] font-bold">{currentStep + 1}</span> / {steps.length}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">Speed:</span>
                      <select
                        value={playSpeed}
                        onChange={(e) => setPlaySpeed(Number(e.target.value))}
                        className="bg-[#0f1629] border border-[#00d4ff]/30 rounded-lg px-2 py-1 text-white text-sm"
                      >
                        <option value={2000}>0.5x</option>
                        <option value={1000}>1x</option>
                        <option value={500}>2x</option>
                        <option value={250}>4x</option>
                      </select>
                    </div>
                  </div>

                  <div className="w-full bg-[#0f1629] rounded-full h-2 mb-4">
                    <div
                      className="bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={handleReset}
                      className="p-3 bg-[#0f1629] hover:bg-[#1a1f3a] border border-[#00d4ff]/30 rounded-lg text-white transition"
                      title="Reset"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={handlePrev}
                      disabled={currentStep === 0}
                      className="p-3 bg-[#0f1629] hover:bg-[#1a1f3a] border border-[#00d4ff]/30 rounded-lg text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Previous Step"
                    >
                      <SkipBack className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={handlePlay}
                      className="p-4 bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] rounded-lg text-[#0a0e27] transition"
                      title={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>
                    
                    <button
                      onClick={handleNext}
                      disabled={currentStep >= steps.length - 1}
                      className="p-3 bg-[#0f1629] hover:bg-[#1a1f3a] border border-[#00d4ff]/30 rounded-lg text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Next Step"
                    >
                      <SkipForward className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {steps.length === 0 && (
              <div className="bg-[#1a1f3a]/90 backdrop-blur-md border border-[#00d4ff]/30 rounded-xl p-12 text-center">
                <Zap className="w-16 h-16 text-[#00d4ff]/50 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Ready to Visualize!</h3>
                <p className="text-gray-400">
                  Paste your algorithm code or select a template, then click "Visualize Algorithm" to see it execute step-by-step.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
