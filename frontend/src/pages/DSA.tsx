import React, { useState, useEffect } from 'react';
import { CodeSquare, ChevronRight, Search, ExternalLink, CheckCircle2, Circle, Youtube, X, Send, Sparkles, Brain, HomeIcon, LogOut, Code2, Play, Pause, RotateCcw, SkipForward, SkipBack, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/auth.store';
import { dsaService } from '../services/api';
import { useDSAStore } from '../context/dsa.store';

interface DSAProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  leetcodeUrl?: string;
  youtubeUrl?: string;
  articleUrl?: string;
  solved: boolean;
}

export const DSA: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [sheets] = useState<any[]>([
    { id: 'striver-a2z', name: 'Striver A2Z DSA', problems: 456 },
    { id: 'blind-75', name: 'Blind 75', problems: 75 },
    { id: 'neetcode-150', name: 'NeetCode 150', problems: 150 },
    { id: 'love-babbar', name: 'Love Babbar 450', problems: 450 },
    { id: 'striver-sde', name: 'Striver SDE Sheet', problems: 191 },
    { id: 'fraz', name: 'Fraz DSA Sheet', problems: 250 },
  ]);
  
  const selectedSheet = useDSAStore((s) => s.selectedSheet);
  const setSelectedSheet = useDSAStore((s) => s.setSelectedSheet);
  
  const [sheetData, setSheetData] = useState<any>(null);
  const [filteredProblems, setFilteredProblems] = useState<DSAProblem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [showSolvedOnly, setShowSolvedOnly] = useState(false);
  
  // AI Interaction Modal State
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<DSAProblem | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userApproach, setUserApproach] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [interactionComplete, setInteractionComplete] = useState(false);

  // Algorithm Visualizer State (embedded in page)
  const [userCode, setUserCode] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [visualizerSteps, setVisualizerSteps] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1000);

  const aiQuestions = [
    "Great job solving this problem! Can you describe your approach in detail?",
    "Can you think of a different approach to solve this problem? What would be the trade-offs?",
    "What would you do if the input constraints were doubled? How would your solution handle that?",
    "What if the constraints were reduced to half? Could you optimize your solution further?",
    "What edge cases did you consider while solving this problem?"
  ];

  useEffect(() => {
    fetchSheet();
  }, [selectedSheet]);

  useEffect(() => {
    filterProblems();
  }, [sheetData, searchQuery, difficultyFilter, topicFilter, showSolvedOnly]);

  useEffect(() => {
    if (isPlaying && currentStep < visualizerSteps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, playSpeed);
      return () => clearTimeout(timer);
    } else if (currentStep >= visualizerSteps.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, visualizerSteps.length, playSpeed]);

  const fetchSheet = async () => {
    setLoading(true);
    try {
      const data = await dsaService.getSheet(selectedSheet) as any;
      setSheetData(data);
      setFilteredProblems(data.problems || []);
    } catch (error) {
      console.error('Failed to fetch sheet:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProblems = () => {
    if (!sheetData?.problems) return;

    let filtered = [...sheetData.problems];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((p: DSAProblem) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.topic.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter((p: DSAProblem) => p.difficulty === difficultyFilter);
    }

    // Topic filter
    if (topicFilter !== 'all') {
      filtered = filtered.filter((p: DSAProblem) => p.topic === topicFilter);
    }

    // Solved filter
    if (showSolvedOnly) {
      filtered = filtered.filter((p: DSAProblem) => p.solved);
    }

    setFilteredProblems(filtered);
  };

  const handleToggleSolved = async (problemId: string) => {
    try {
      const problem = sheetData.problems.find((p: DSAProblem) => p.id === problemId);
      if (!problem) return;

      // If marking as solved, open AI interaction modal
      if (!problem.solved) {
        setSelectedProblem(problem);
        setShowAIModal(true);
        setCurrentQuestionIndex(0);
        setUserApproach('');
        setAiFeedback('');
        setInteractionComplete(false);
        return;
      }

      // If unmarking, just update the state
      await dsaService.trackProblem({
        questionId: problemId,
        sheetName: selectedSheet,
        questionTitle: problem.title,
        difficulty: problem.difficulty.toLowerCase(),
        solved: false,
      });

      setSheetData({
        ...sheetData,
        problems: sheetData.problems.map((p: DSAProblem) =>
          p.id === problemId ? { ...p, solved: false } : p
        ),
      });
    } catch (error) {
      console.error('Failed to toggle problem:', error);
    }
  };

  const handleSubmitApproach = async () => {
    if (!userApproach.trim() || !selectedProblem) return;

    setIsLoadingAI(true);
    try {
      const feedbackResponse = await dsaService.getAIFeedback({
        question: `${selectedProblem.title} (${selectedProblem.difficulty})
Topic: ${selectedProblem.topic}

AI Question: ${aiQuestions[currentQuestionIndex]}

User's Response: ${userApproach}`,
        userApproach: userApproach,
        constraints: `Difficulty: ${selectedProblem.difficulty}, Topic: ${selectedProblem.topic}`
      }) as { feedback: string };

      setAiFeedback(feedbackResponse.feedback);
      
      // If this is the last question, mark as complete
      if (currentQuestionIndex >= aiQuestions.length - 1) {
        setInteractionComplete(true);
      }
    } catch (error) {
      console.error('Failed to get AI feedback:', error);
      setAiFeedback('Sorry, I couldn\'t process your response. Please try again.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < aiQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserApproach('');
      setAiFeedback('');
    }
  };

  const handleSkipQuestion = () => {
    if (currentQuestionIndex < aiQuestions.length - 1) {
      handleNextQuestion();
    } else {
      setInteractionComplete(true);
    }
  };

  const handleCompleteInteraction = async () => {
    if (!selectedProblem) return;

    try {
      await dsaService.trackProblem({
        questionId: selectedProblem.id,
        sheetName: selectedSheet,
        questionTitle: selectedProblem.title,
        difficulty: selectedProblem.difficulty.toLowerCase(),
        solved: true,
      });

      setSheetData({
        ...sheetData,
        problems: sheetData.problems.map((p: DSAProblem) =>
          p.id === selectedProblem.id ? { ...p, solved: true } : p
        ),
      });

      setShowAIModal(false);
      setSelectedProblem(null);
    } catch (error) {
      console.error('Failed to mark problem as solved:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'Hard': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  // Visualizer functions
  const codeTemplates: Record<string, string> = {
    'bubble-sort': `// Bubble Sort\nfunction bubbleSort(arr) {\n  let n = arr.length;\n  for (let i = 0; i < n - 1; i++) {\n    for (let j = 0; j < n - i - 1; j++) {\n      if (arr[j] > arr[j + 1]) {\n        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];\n      }\n    }\n  }\n  return arr;\n}`,
    'selection-sort': `// Selection Sort\nfunction selectionSort(arr) {\n  for (let i = 0; i < arr.length - 1; i++) {\n    let minIdx = i;\n    for (let j = i + 1; j < arr.length; j++) {\n      if (arr[j] < arr[minIdx]) {\n        minIdx = j;\n      }\n    }\n    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];\n  }\n  return arr;\n}`,
    'insertion-sort': `// Insertion Sort\nfunction insertionSort(arr) {\n  for (let i = 1; i < arr.length; i++) {\n    let key = arr[i];\n    let j = i - 1;\n    while (j >= 0 && arr[j] > key) {\n      arr[j + 1] = arr[j];\n      j--;\n    }\n    arr[j + 1] = key;\n  }\n  return arr;\n}`,
    'binary-search': `// Binary Search\nfunction binarySearch(arr, target) {\n  let left = 0;\n  let right = arr.length - 1;\n  while (left <= right) {\n    let mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}`,
    'linear-search': `// Linear Search\nfunction linearSearch(arr, target) {\n  for (let i = 0; i < arr.length; i++) {\n    if (arr[i] === target) {\n      return i;\n    }\n  }\n  return -1;\n}`
  };

  const simulateExecution = () => {
    if (!userCode.trim()) {
      alert('Please paste some code or select a template first!');
      return;
    }
    
    const steps: any[] = [];
    const arr = [64, 34, 25, 12, 22, 11, 90];
    const code = userCode.toLowerCase();
    
    // Detect algorithm type
    if (code.includes('bubble') || code.includes('bubblesort')) {
      // Bubble Sort
      const n = arr.length;
      steps.push({
        line: 1,
        variables: { n },
        array: [...arr],
        highlightIndices: [],
        description: `Starting Bubble Sort with ${n} elements`
      });
      
      for (let i = 0; i < n - 1; i++) {
        steps.push({
          line: 3,
          variables: { i, n },
          array: [...arr],
          highlightIndices: [],
          description: `Pass ${i + 1}/${n - 1} - Bubbling largest unsorted element to position`
        });
        
        for (let j = 0; j < n - i - 1; j++) {
          steps.push({
            line: 4,
            variables: { i, j, n },
            array: [...arr],
            highlightIndices: [j, j + 1],
            description: `Comparing arr[${j}]=${arr[j]} with arr[${j + 1}]=${arr[j + 1]}`
          });
          
          if (arr[j] > arr[j + 1]) {
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            steps.push({
              line: 5,
              variables: { i, j, n },
              array: [...arr],
              highlightIndices: [j, j + 1],
              description: `✅ Swapped ${arr[j + 1]} and ${arr[j]}`
            });
          }
        }
        steps.push({
          line: 3,
          variables: { i, n },
          array: [...arr],
          highlightIndices: [n - i - 1],
          description: `Element ${arr[n - i - 1]} is now in correct position`
        });
      }
    } else if (code.includes('selection') || code.includes('selectionsort')) {
      // Selection Sort
      for (let i = 0; i < arr.length - 1; i++) {
        let minIdx = i;
        steps.push({
          line: 2,
          variables: { i, minIdx },
          array: [...arr],
          highlightIndices: [i],
          description: `Finding minimum from index ${i} onwards`
        });
        
        for (let j = i + 1; j < arr.length; j++) {
          steps.push({
            line: 3,
            variables: { i, j, minIdx },
            array: [...arr],
            highlightIndices: [minIdx, j],
            description: `Checking arr[${j}]=${arr[j]} with current min arr[${minIdx}]=${arr[minIdx]}`
          });
          
          if (arr[j] < arr[minIdx]) {
            minIdx = j;
            steps.push({
              line: 4,
              variables: { i, j, minIdx },
              array: [...arr],
              highlightIndices: [minIdx],
              description: `New minimum found at index ${minIdx}: ${arr[minIdx]}`
            });
          }
        }
        
        if (minIdx !== i) {
          [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
          steps.push({
            line: 6,
            variables: { i, minIdx },
            array: [...arr],
            highlightIndices: [i],
            description: `Swapped minimum ${arr[i]} to position ${i}`
          });
        }
      }
    } else if (code.includes('insertion') || code.includes('insertionsort')) {
      // Insertion Sort
      steps.push({
        line: 1,
        variables: { i: 0 },
        array: [...arr],
        highlightIndices: [0],
        description: `First element ${arr[0]} is already sorted`
      });
      
      for (let i = 1; i < arr.length; i++) {
        let key = arr[i];
        let j = i - 1;
        
        steps.push({
          line: 2,
          variables: { i, j, key },
          array: [...arr],
          highlightIndices: [i],
          description: `Inserting ${key} into sorted portion`
        });
        
        while (j >= 0 && arr[j] > key) {
          steps.push({
            line: 4,
            variables: { i, j, key },
            array: [...arr],
            highlightIndices: [j, j + 1],
            description: `Shifting ${arr[j]} to the right`
          });
          arr[j + 1] = arr[j];
          j--;
        }
        
        arr[j + 1] = key;
        steps.push({
          line: 7,
          variables: { i, j, key },
          array: [...arr],
          highlightIndices: [j + 1],
          description: `Placed ${key} at position ${j + 1}`
        });
      }
    } else if (code.includes('binary') && code.includes('search')) {
      // Binary Search
      const target = 22;
      let left = 0;
      let right = arr.length - 1;
      const sortedArr = [...arr].sort((a, b) => a - b);
      
      steps.push({
        line: 1,
        variables: { target, left, right },
        array: sortedArr,
        highlightIndices: [],
        description: `Searching for ${target} in sorted array`
      });
      
      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        steps.push({
          line: 4,
          variables: { left, mid, right, target },
          array: sortedArr,
          highlightIndices: [mid],
          description: `Check middle: arr[${mid}]=${sortedArr[mid]}`
        });
        
        if (sortedArr[mid] === target) {
          steps.push({
            line: 5,
            variables: { mid, target },
            array: sortedArr,
            highlightIndices: [mid],
            description: `✅ Found ${target} at index ${mid}!`
          });
          break;
        }
        
        if (sortedArr[mid] < target) {
          left = mid + 1;
          steps.push({
            line: 6,
            variables: { left, mid, right, target },
            array: sortedArr,
            highlightIndices: Array.from({length: right - left + 1}, (_, i) => left + i),
            description: `${sortedArr[mid]} < ${target}, search right half`
          });
        } else {
          right = mid - 1;
          steps.push({
            line: 7,
            variables: { left, mid, right, target },
            array: sortedArr,
            highlightIndices: Array.from({length: right - left + 1}, (_, i) => left + i),
            description: `${sortedArr[mid]} > ${target}, search left half`
          });
        }
      }
    } else if (code.includes('linear') && code.includes('search')) {
      // Linear Search
      const target = 22;
      steps.push({
        line: 1,
        variables: { target },
        array: [...arr],
        highlightIndices: [],
        description: `Searching for ${target} sequentially`
      });
      
      for (let i = 0; i < arr.length; i++) {
        steps.push({
          line: 2,
          variables: { i, target },
          array: [...arr],
          highlightIndices: [i],
          description: `Check arr[${i}]=${arr[i]}`
        });
        
        if (arr[i] === target) {
          steps.push({
            line: 3,
            variables: { i, target },
            array: [...arr],
            highlightIndices: [i],
            description: `✅ Found ${target} at index ${i}!`
          });
          break;
        }
      }
    } else {
      // Default: Generic sorting visualization
      for (let i = 0; i < arr.length - 1; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
          steps.push({
            line: -1,
            variables: { i, j },
            array: [...arr],
            highlightIndices: [j, j + 1],
            description: `Comparing elements at positions ${j} and ${j + 1}`
          });
          if (arr[j] > arr[j + 1]) {
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            steps.push({
              line: -1,
              variables: { i, j },
              array: [...arr],
              highlightIndices: [j, j + 1],
              description: `Swapped ${arr[j + 1]} and ${arr[j]}`
            });
          }
        }
      }
    }
    
    steps.push({
      line: -1,
      variables: {},
      array: [...arr],
      highlightIndices: [],
      description: '🎉 Algorithm Complete!'
    });
    
    setVisualizerSteps(steps);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handlePlay = () => setIsPlaying(!isPlaying);
  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };
  const handleNext = () => {
    if (currentStep < visualizerSteps.length - 1) setCurrentStep(prev => prev + 1);
  };
  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const currentStepData = visualizerSteps[currentStep];
  const codeLines = userCode.split('\n');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0f1629] p-6 relative">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0e27]/95 backdrop-blur-md border-b border-[#00d4ff]/30 shadow-[0_0_20px_rgba(0,212,255,0.1)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] rounded-lg flex items-center justify-center glow-cyan">
              <Brain className="w-6 h-6 text-[#0a0e27]" />
            </div>
            <span className="font-bold text-white text-2xl">Career AI</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-[#1a1f3a] hover:bg-[#1a1f3a]/80 border border-[#00d4ff]/30 rounded-lg text-white transition hover-glow-cyan"
            >
              <HomeIcon className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 pt-20">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-2">DSA Mastery</h1>
          <p className="text-[#00d4ff] text-xl">Master data structures and algorithms with AI feedback</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Algorithm Visualizer Section - LEFT SIDE */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-[#1a1f3a] to-[#0f1629] border-2 border-[#00d4ff] rounded-xl p-6 shadow-[0_0_30px_rgba(0,212,255,0.2)] sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] rounded-lg flex items-center justify-center shadow-lg shadow-[#00d4ff]/50">
                  <Zap className="w-6 h-6 text-[#0a0e27]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Algo Visualizer</h2>
                  <p className="text-[#00d4ff] text-sm">Step-by-step execution</p>
                </div>
              </div>

              {/* Code Editor */}
              <div className="space-y-4">
                <div className="bg-[#0f1629] border border-[#00d4ff]/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-[#00d4ff]" />
                      Code
                    </h3>
                    <select
                      onChange={(e) => setUserCode(codeTemplates[e.target.value] || '')}
                      className="bg-[#1a1f3a] border border-[#00d4ff]/30 rounded px-2 py-1 text-white text-xs"
                    >
                      <option value="">Template</option>
                      <option value="bubble-sort">Bubble Sort</option>
                      <option value="selection-sort">Selection Sort</option>
                      <option value="insertion-sort">Insertion Sort</option>
                      <option value="binary-search">Binary Search</option>
                      <option value="linear-search">Linear Search</option>
                    </select>
                  </div>
                  
                  <textarea
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    placeholder="Paste your algorithm code here or select a template above..."
                    className="w-full h-40 bg-[#0a0e27] border border-[#00d4ff]/30 rounded p-3 text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                    spellCheck={false}
                  />

                  <button
                    onClick={simulateExecution}
                    className="w-full mt-3 py-2 bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] hover:shadow-[0_0_20px_rgba(0,212,255,0.5)] text-[#0a0e27] font-bold rounded-lg transition flex items-center justify-center gap-2 text-sm"
                  >
                    <Zap className="w-4 h-4" />
                    Visualize
                  </button>
                </div>

                {/* Visualization */}
                {visualizerSteps.length > 0 && currentStepData ? (
                  <>
                    <div className="bg-[#0f1629] border border-[#00d4ff]/30 rounded-lg p-3">
                      <h3 className="text-sm font-bold text-white mb-3">Array</h3>
                      
                      <div className="flex items-end justify-center gap-1 mb-4 min-h-[100px]">
                        {currentStepData.array?.map((value: number, index: number) => {
                          const isHighlighted = currentStepData.highlightIndices?.includes(index);
                          const height = (value / Math.max(...(currentStepData.array || [1]))) * 80;
                          
                          return (
                            <div key={index} className="flex flex-col items-center gap-1">
                              <div
                                className={`w-7 rounded-t transition-all duration-300 flex items-end justify-center pb-1 font-bold text-xs ${
                                  isHighlighted
                                    ? 'bg-gradient-to-t from-[#00d4ff] to-[#0ea5e9] shadow-[0_0_10px_rgba(0,212,255,0.8)]'
                                    : 'bg-gradient-to-t from-purple-500 to-pink-500'
                                }`}
                                style={{ height: `${height}px` }}
                              >
                                <span className="text-white text-[10px]">{value}</span>
                              </div>
                              <div className="text-gray-400 text-[10px]">{index}</div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Variables */}
                      <div className="bg-[#0a0e27] rounded p-2 mb-2">
                        <div className="grid grid-cols-3 gap-1">
                          {Object.entries(currentStepData.variables).map(([key, value]) => (
                            <div key={key} className="bg-[#1a1f3a] rounded px-2 py-1 text-center">
                              <span className="text-gray-400 text-[10px]">{key}: </span>
                              <span className="text-white font-bold text-xs">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Description */}
                      <div className="bg-gradient-to-r from-[#00d4ff]/10 to-[#0ea5e9]/10 border border-[#00d4ff]/30 rounded p-2">
                        <p className="text-white text-center text-xs">{currentStepData.description}</p>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="bg-[#0f1629] border border-[#00d4ff]/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2 text-xs">
                        <span className="text-white">
                          Step <span className="text-[#00d4ff] font-bold">{currentStep + 1}</span>/{visualizerSteps.length}
                        </span>
                        <select
                          value={playSpeed}
                          onChange={(e) => setPlaySpeed(Number(e.target.value))}
                          className="bg-[#0a0e27] border border-[#00d4ff]/30 rounded px-2 py-1 text-white text-[10px]"
                        >
                          <option value={2000}>0.5x</option>
                          <option value={1000}>1x</option>
                          <option value={500}>2x</option>
                          <option value={250}>4x</option>
                        </select>
                      </div>

                      <div className="w-full bg-[#0a0e27] rounded-full h-1.5 mb-3">
                        <div
                          className="bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] h-1.5 rounded-full transition-all"
                          style={{ width: `${((currentStep + 1) / visualizerSteps.length) * 100}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-center gap-2">
                        <button onClick={handleReset} className="p-2 bg-[#0a0e27] hover:bg-[#1a1f3a] border border-[#00d4ff]/30 rounded text-white transition">
                          <RotateCcw className="w-3 h-3" />
                        </button>
                        <button onClick={handlePrev} disabled={currentStep === 0} className="p-2 bg-[#0a0e27] hover:bg-[#1a1f3a] border border-[#00d4ff]/30 rounded text-white transition disabled:opacity-30">
                          <SkipBack className="w-3 h-3" />
                        </button>
                        <button onClick={handlePlay} className="p-2 bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] hover:shadow-[0_0_15px_rgba(0,212,255,0.6)] rounded text-[#0a0e27] transition">
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button onClick={handleNext} disabled={currentStep >= visualizerSteps.length - 1} className="p-2 bg-[#0a0e27] hover:bg-[#1a1f3a] border border-[#00d4ff]/30 rounded text-white transition disabled:opacity-30">
                          <SkipForward className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-[#0f1629] border border-[#00d4ff]/30 rounded-lg p-8 text-center">
                    <Zap className="w-12 h-12 text-[#00d4ff]/50 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Paste code to visualize</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content - RIGHT SIDE */}
          <div className="lg:col-span-1 space-y-6">
            {/* Sheet Selector Dropdown & Filters */}
            <div className="bg-[#1a1f3a]/90 backdrop-blur-md border border-[#00d4ff]/30 rounded-lg p-4 card-glow">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Sheet Dropdown */}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">DSA Sheet</label>
                  <select
                    value={selectedSheet}
                    onChange={(e) => setSelectedSheet(e.target.value)}
                    className="w-full bg-[#0f1629] border border-[#00d4ff]/30 rounded-lg px-3 py-2 text-white text-sm hover-glow-cyan font-semibold"
                  >
                    {sheets.map((sheet) => (
                      <option key={sheet.id} value={sheet.id}>
                        {sheet.name} ({sheet.problems})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Difficulty</label>
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="w-full bg-[#0f1629] border border-[#00d4ff]/30 rounded-lg px-3 py-2 text-white text-sm hover-glow-cyan"
                  >
                    <option value="all">All Levels</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                {/* Topic Filter */}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Topic</label>
                  <select
                    value={topicFilter}
                    onChange={(e) => setTopicFilter(e.target.value)}
                    className="w-full bg-[#0f1629] border border-[#00d4ff]/30 rounded-lg px-3 py-2 text-white text-sm hover-glow-cyan"
                  >
                    <option value="all">All Topics</option>
                    {sheetData?.topics?.map((topic: string) => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
                </div>

                {/* Solved Filter */}
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={showSolvedOnly}
                      onChange={(e) => setShowSolvedOnly(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5"
                    />
                    Solved only
                  </label>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            {sheetData && (
              <div className="bg-[#1a1f3a]/90 backdrop-blur-md border border-[#00d4ff]/30 rounded-lg p-8 card-glow">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] rounded-lg flex items-center justify-center glow-cyan">
                    <CodeSquare className="w-7 h-7 text-[#0a0e27]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-white">{sheetData.name}</h3>
                    <p className="text-gray-400 text-base">{sheetData.description}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300 text-base">Progress: {sheetData.stats?.solved || 0} / {sheetData.stats?.total || 0}</span>
                    <span className="text-[#00d4ff] font-bold text-lg">{sheetData.stats?.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-[#0f1629] rounded-full h-3 border border-[#00d4ff]/20">
                    {/* eslint-disable-next-line */}
                    <div
                      className="bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] h-3 rounded-full transition-all duration-300 glow-cyan"
                      style={{ width: `${sheetData.stats?.progress || 0}%` }}
                      role="progressbar"
                      aria-label="Sheet progress"
                      aria-valuenow={Math.round(sheetData.stats?.progress || 0)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-[#0f1629] border border-[#00d4ff]/20 rounded-lg p-4">
                    <div className="text-3xl font-bold text-[#00d4ff]">{sheetData.stats?.easy || 0}</div>
                    <div className="text-sm text-gray-400">Easy</div>
                  </div>
                  <div className="bg-[#0f1629] border border-[#00d4ff]/20 rounded-lg p-4">
                    <div className="text-3xl font-bold text-[#00d4ff]">{sheetData.stats?.medium || 0}</div>
                    <div className="text-sm text-gray-400">Medium</div>
                  </div>
                  <div className="bg-[#0f1629] border border-[#00d4ff]/20 rounded-lg p-4">
                    <div className="text-3xl font-bold text-[#00d4ff]">{sheetData.stats?.hard || 0}</div>
                    <div className="text-sm text-gray-400">Hard</div>
                  </div>
                  <div className="bg-[#0f1629] border border-[#00d4ff]/20 rounded-lg p-4">
                    <div className="text-3xl font-bold text-[#00d4ff]">{sheetData.stats?.solved || 0}</div>
                    <div className="text-sm text-gray-400">Solved</div>
                  </div>
                </div>
              </div>
            )}

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#00d4ff]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search problems by title or topic..."
                className="w-full bg-[#1a1f3a]/90 backdrop-blur-md border border-[#00d4ff]/30 rounded-lg pl-12 pr-4 py-3 text-white text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d4ff] hover-glow-cyan"
              />
            </div>

            {/* Problems List */}
            <div className="bg-[#1a1f3a]/90 backdrop-blur-md border border-[#00d4ff]/30 rounded-lg overflow-hidden card-glow">
              {loading ? (
                <div className="p-8 text-center text-gray-400 text-base">Loading problems...</div>
              ) : filteredProblems.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-base">No problems found</div>
              ) : (
                <div className="divide-y divide-[#00d4ff]/10">
                  {filteredProblems.map((problem, index) => (
                    <div
                      key={problem.id}
                      className="p-4 hover:bg-[#0f1629]/50 transition group"
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <button
                          onClick={() => handleToggleSolved(problem.id)}
                          className="mt-1 flex-shrink-0"
                        >
                          {problem.solved ? (
                            <CheckCircle2 className="w-7 h-7 text-[#00d4ff]" />
                          ) : (
                            <Circle className="w-7 h-7 text-gray-500 group-hover:text-[#00d4ff]/50 transition" />
                          )}
                        </button>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h4 className={`font-medium text-base ${problem.solved ? 'text-gray-400 line-through' : 'text-white'}`}>
                              {index + 1}. {problem.title}
                            </h4>
                            <span className={`text-sm px-2 py-1 rounded-full whitespace-nowrap ${getDifficultyColor(problem.difficulty)}`}>
                              {problem.difficulty}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-base flex-wrap">
                            <span className="text-[#00d4ff]">{problem.topic}</span>
                            
                            <div className="flex items-center gap-2 flex-wrap">
                              {problem.leetcodeUrl && (
                                <a
                                  href={problem.leetcodeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#00d4ff] hover:text-[#0ea5e9] flex items-center gap-1"
                                >
                                  <ExternalLink className="w-5 h-5" />
                                  LeetCode
                                </a>
                              )}
                              {problem.youtubeUrl && (
                                <a
                                  href={problem.youtubeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-red-400 hover:text-red-300 flex items-center gap-1"
                                >
                                  <Youtube className="w-5 h-5" />
                                  Video
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Interaction Modal */}
      {showAIModal && selectedProblem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-purple-900 border border-white/20 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex items-center justify-between border-b border-white/20">

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedProblem.title}</h3>
                  <p className="text-sm text-purple-100">AI-Powered Learning Session</p>
                </div>
              </div>
              <button
                onClick={() => setShowAIModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition"
                aria-label="Close AI learning session"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="px-6 pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Question {currentQuestionIndex + 1} of {aiQuestions.length}</span>
                <span className="text-sm text-purple-400">{Math.round(((currentQuestionIndex + 1) / aiQuestions.length) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                {/* eslint-disable-next-line */}
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.round(((currentQuestionIndex + 1) / aiQuestions.length) * 100)}%` }}
                  role="progressbar"
                  aria-label="AI learning progress"
                  aria-valuenow={Math.round(((currentQuestionIndex + 1) / aiQuestions.length) * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {!interactionComplete ? (
                <>
                  {/* AI Question */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium mb-2">AI Mentor</p>
                        <p className="text-gray-300">{aiQuestions[currentQuestionIndex]}</p>
                      </div>
                    </div>
                  </div>

                  {/* User Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Your Response
                    </label>
                    <textarea
                      value={userApproach}
                      onChange={(e) => setUserApproach(e.target.value)}
                      placeholder="Share your thoughts, approach, or solution..."
                      rows={6}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleSubmitApproach}
                      disabled={!userApproach.trim() || isLoadingAI}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {isLoadingAI ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Get AI Feedback
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleSkipQuestion}
                      className="bg-white/5 hover:bg-white/10 text-gray-300 font-semibold py-3 px-6 rounded-lg transition"
                    >
                      Skip
                    </button>
                  </div>

                  {/* AI Feedback */}
                  {aiFeedback && (
                    <div className="bg-gradient-to-br from-green-500/10 to-cyan-500/10 border border-green-500/20 rounded-xl p-6 max-h-96 overflow-y-auto">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium mb-2">AI Feedback</p>
                          <div className="text-gray-200 whitespace-pre-wrap break-words">{aiFeedback}</div>
                        </div>
                      </div>
                      
                      {currentQuestionIndex < aiQuestions.length - 1 ? (
                        <button
                          onClick={handleNextQuestion}
                          className="mt-4 w-full bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                        >
                          Next Question
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setInteractionComplete(true)}
                          className="mt-4 w-full bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                        >
                          Complete Session
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Completion Message */}
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-3">Excellent Work! 🎉</h4>
                    <p className="text-gray-300 mb-6 max-w-md mx-auto">
                      You've completed the AI learning session for <span className="text-purple-400 font-semibold">{selectedProblem.title}</span>. 
                      Keep practicing to master more problems!
                    </p>
                    <button
                      onClick={handleCompleteInteraction}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-lg transition inline-flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Mark as Solved & Continue
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
