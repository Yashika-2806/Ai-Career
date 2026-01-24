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
    
    try {
      // Detect algorithm type from code
      const code = userCode.toLowerCase();
      
      if (code.includes('bubble')) {
        // BUBBLE SORT - Complete execution
        const n = arr.length;
        for (let i = 0; i < n - 1; i++) {
          mockSteps.push({
            line: 3,
            variables: { i, n },
            array: [...arr],
            highlightIndices: [],
            description: `Starting outer loop pass ${i + 1} of ${n - 1}`
          });
          
          for (let j = 0; j < n - i - 1; j++) {
            mockSteps.push({
              line: 4,
              variables: { i, j, n },
              array: [...arr],
              highlightIndices: [],
              description: `Inner loop: j = ${j}`
            });
            
            mockSteps.push({
              line: 5,
              variables: { i, j, n },
              array: [...arr],
              highlightIndices: [j, j + 1],
              description: `Comparing arr[${j}] (${arr[j]}) with arr[${j + 1}] (${arr[j + 1]})`
            });
            
            if (arr[j] > arr[j + 1]) {
              [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
              mockSteps.push({
                line: 6,
                variables: { i, j, n },
                array: [...arr],
                highlightIndices: [j, j + 1],
                description: `✅ Swapped! arr[${j}] ⇄ arr[${j + 1}]`
              });
            } else {
              mockSteps.push({
                line: 6,
                variables: { i, j, n },
                array: [...arr],
                highlightIndices: [j, j + 1],
                description: `No swap needed (already in order)`
              });
            }
          }
          
          mockSteps.push({
            line: 9,
            variables: { i, n },
            array: [...arr],
            highlightIndices: [n - i - 1],
            description: `✨ Pass ${i + 1} complete! Element at position ${n - i - 1} is now sorted`
          });
        }
      } else if (code.includes('selection')) {
        // SELECTION SORT - Complete execution
        for (let i = 0; i < arr.length - 1; i++) {
          let minIdx = i;
          
          mockSteps.push({
            line: 2,
            variables: { i, minIdx },
            array: [...arr],
            highlightIndices: [i],
            description: `Starting pass ${i + 1}, assuming minimum is at index ${i}`
          });
          
          for (let j = i + 1; j < arr.length; j++) {
            mockSteps.push({
              line: 4,
              variables: { i, j, minIdx },
              array: [...arr],
              highlightIndices: [minIdx, j],
              description: `Comparing arr[${j}] (${arr[j]}) with current min arr[${minIdx}] (${arr[minIdx]})`
            });
            
            if (arr[j] < arr[minIdx]) {
              minIdx = j;
              mockSteps.push({
                line: 5,
                variables: { i, j, minIdx },
                array: [...arr],
                highlightIndices: [minIdx],
                description: `🔍 Found new minimum at index ${minIdx}!`
              });
            }
          }
          
          if (minIdx !== i) {
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
            mockSteps.push({
              line: 9,
              variables: { i, minIdx },
              array: [...arr],
              highlightIndices: [i, minIdx],
              description: `✅ Swapped arr[${i}] with arr[${minIdx}]`
            });
          } else {
            mockSteps.push({
              line: 9,
              variables: { i, minIdx },
              array: [...arr],
              highlightIndices: [i],
              description: `Element at index ${i} is already in correct position`
            });
          }
        }
      } else if (code.includes('insertion')) {
        // INSERTION SORT - Complete execution
        for (let i = 1; i < arr.length; i++) {
          const key = arr[i];
          let j = i - 1;
          
          mockSteps.push({
            line: 2,
            variables: { i, key, j },
            array: [...arr],
            highlightIndices: [i],
            description: `Picking element arr[${i}] = ${key} to insert`
          });
          
          let shifts = 0;
          while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            
            mockSteps.push({
              line: 5,
              variables: { i, key, j },
              array: [...arr],
              highlightIndices: [j, j + 1],
              description: `Shifting arr[${j}] (${arr[j]}) to position ${j + 1}`
            });
            
            j--;
            shifts++;
          }
          
          arr[j + 1] = key;
          mockSteps.push({
            line: 8,
            variables: { i, key, j: j + 1 },
            array: [...arr],
            highlightIndices: [j + 1],
            description: shifts > 0 ? `✅ Inserted ${key} at position ${j + 1} after ${shifts} shifts` : `Element ${key} already in correct position`
          });
        }
      } else if (code.includes('linear')) {
        // LINEAR SEARCH - Complete execution
        const target = arr[3]; // Search for 4th element
        
        for (let i = 0; i < arr.length; i++) {
          mockSteps.push({
            line: 2,
            variables: { i, target },
            array: [...arr],
            highlightIndices: [i],
            description: `Checking arr[${i}] = ${arr[i]}, looking for ${target}`
          });
          
          if (arr[i] === target) {
            mockSteps.push({
              line: 3,
              variables: { i, target },
              array: [...arr],
              highlightIndices: [i],
              description: `🎯 Found ${target} at index ${i}!`
            });
            break;
          }
        }
      } else if (code.includes('binary')) {
        // BINARY SEARCH - Complete execution
        const sortedArr = [...arr].sort((a, b) => a - b);
        arr.length = 0;
        arr.push(...sortedArr);
        
        const target = arr[3];
        let left = 0;
        let right = arr.length - 1;
        let iteration = 0;
        
        while (left <= right) {
          const mid = Math.floor((left + right) / 2);
          iteration++;
          
          mockSteps.push({
            line: 5,
            variables: { left, right, mid, target, iteration },
            array: [...arr],
            highlightIndices: [left, mid, right],
            description: `Iteration ${iteration}: Searching in range [${left}, ${right}], checking middle at ${mid}`
          });
          
          mockSteps.push({
            line: 6,
            variables: { left, right, mid, target },
            array: [...arr],
            highlightIndices: [mid],
            description: `Comparing arr[${mid}] (${arr[mid]}) with target ${target}`
          });
          
          if (arr[mid] === target) {
            mockSteps.push({
              line: 7,
              variables: { left, right, mid, target },
              array: [...arr],
              highlightIndices: [mid],
              description: `🎯 Found ${target} at index ${mid}!`
            });
            break;
          }
          
          if (arr[mid] < target) {
            left = mid + 1;
            mockSteps.push({
              line: 8,
              variables: { left, right, mid, target },
              array: [...arr],
              highlightIndices: [mid],
              description: `arr[${mid}] < ${target}, searching right half`
            });
          } else {
            right = mid - 1;
            mockSteps.push({
              line: 9,
              variables: { left, right, mid, target },
              array: [...arr],
              highlightIndices: [mid],
              description: `arr[${mid}] > ${target}, searching left half`
            });
          }
        }
      } else if (code.includes('reverse')) {
        // REVERSE ARRAY - Complete execution
        let left = 0;
        let right = arr.length - 1;
        
        while (left < right) {
          mockSteps.push({
            line: 3,
            variables: { left, right },
            array: [...arr],
            highlightIndices: [left, right],
            description: `Swapping arr[${left}] (${arr[left]}) with arr[${right}] (${arr[right]})`
          });
          
          [arr[left], arr[right]] = [arr[right], arr[left]];
          
          mockSteps.push({
            line: 4,
            variables: { left, right },
            array: [...arr],
            highlightIndices: [left, right],
            description: `✅ Swapped! Moving pointers inward`
          });
          
          left++;
          right--;
          
          mockSteps.push({
            line: 5,
            variables: { left, right },
            array: [...arr],
            highlightIndices: [left, right],
            description: `Updated pointers: left = ${left}, right = ${right}`
          });
        }
      } else {
        // DEFAULT: Try to parse as bubble sort
        const n = arr.length;
        for (let i = 0; i < n - 1; i++) {
          for (let j = 0; j < n - i - 1; j++) {
            mockSteps.push({
              line: Math.min(5 + j, codeLines.length),
              variables: { i, j, n },
              array: [...arr],
              highlightIndices: [j, j + 1],
              description: `Comparing arr[${j}] (${arr[j]}) with arr[${j + 1}] (${arr[j + 1]})`
            });

            if (arr[j] > arr[j + 1]) {
              [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
              mockSteps.push({
                line: Math.min(6 + j, codeLines.length),
                variables: { i, j, n },
                array: [...arr],
                highlightIndices: [j, j + 1],
                description: `✅ Swapped!`
              });
            }
          }
        }
      }
      
      // Add completion step
      mockSteps.push({
        line: -1,
        variables: {},
        array: [...arr],
        highlightIndices: [],
        description: '🎉 Algorithm Execution Complete! All steps shown.'
      });
      
    } catch (error) {
      console.error('Error during execution:', error);
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
