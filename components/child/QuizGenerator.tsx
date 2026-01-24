import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Sparkles, Trophy, Settings, RefreshCw, Upload, FileText, FileImage } from 'lucide-react';
import { AIAvatar } from './AIAvatar';
import { motion, AnimatePresence } from 'motion/react';
import { callGeminiAPI } from '../../utils/gemini-api';
import { VoiceAssistant } from '../VoiceAssistant';
import axios from 'axios';

interface QuizGeneratorProps {
  onBack: () => void;
}

type Question = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
};

type QuizResult = {
  score: number;
  totalQuestions: number;
  answers: boolean[];
};

export function QuizGenerator({ onBack }: QuizGeneratorProps) {
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'file' | 'text'>('file');
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

  useEffect(() => {
    const stored = localStorage.getItem('gemini_api_key');
    if (stored) {
      setApiKey(stored);
    }
  }, []);

  const saveApiKey = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    setShowSettings(false);
  };

  const sampleContent = "Photosynthesis is the process by which green plants use sunlight to make their own food. Plants take in carbon dioxide from the air and water from the soil. Using the energy from sunlight, they convert these into glucose (sugar) and oxygen. The oxygen is released into the air, which we breathe. Chlorophyll, the green pigment in plants, plays a crucial role in capturing sunlight.";

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
      } else {
        alert('Please select a PDF or PowerPoint file');
      }
    }
  };

  const generateQuizFromFile = async () => {
    if (!selectedFile) return;

    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('mode', 'quiz');
      formData.append('numQuestions', '5');
      formData.append('difficulty', 'moderate');

      const token = localStorage.getItem('auth_token');
      
      const response = await axios.post(`${API_BASE_URL}/api/pdf/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (response.data.questions && response.data.questions.length > 0) {
        setQuestions(response.data.questions);
        setQuizStarted(true);
      } else {
        throw new Error('No questions returned from server');
      }
    } catch (error: any) {
      console.error('Error generating quiz from file:', error);
      alert(
        'Error: ' + (error.response?.data?.error || error.message || 'Failed to generate quiz. Please try again.')
      );
      
      // Fallback to demo questions
      const demoQuestions: Question[] = [
        {
          question: "Based on the document, what is the main topic?",
          options: ["Understanding the subject", "Learning new things", "Exploring ideas", "All of the above"],
          correctAnswer: 3
        }
      ];
      setQuestions(demoQuestions);
      setQuizStarted(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateQuizFromText = async () => {
    if (!content.trim()) return;

    setIsGenerating(true);

    try {
      if (!apiKey) {
        // Generate demo quiz without API
        const demoQuestions: Question[] = [
          {
            question: "What is photosynthesis?",
            options: [
              "A process where plants eat insects",
              "A process where plants make their own food using sunlight",
              "A process where plants drink water",
              "A process where plants sleep"
            ],
            correctAnswer: 1
          },
          {
            question: "What do plants take in from the air during photosynthesis?",
            options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"],
            correctAnswer: 2
          },
          {
            question: "What is the green pigment in plants called?",
            options: ["Melanin", "Chlorophyll", "Hemoglobin", "Carotene"],
            correctAnswer: 1
          }
        ];

        setTimeout(() => {
          setQuestions(demoQuestions);
          setQuizStarted(true);
          setIsGenerating(false);
        }, 2000);
        return;
      }

      // Call Gemini API to generate quiz using utility
      const responseText = await callGeminiAPI(apiKey, {
        prompt: `Based on the following content, create exactly 5 multiple-choice questions suitable for students. Format your response as a JSON array with this exact structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of the correct answer"
  }
]

Make questions simple, fun, and educational. The correctAnswer should be the index (0-3) of the correct option.

Content: ${content}

Respond ONLY with the JSON array, no other text.`,
        temperature: 0.7,
        maxOutputTokens: 1500,
      });

      // Extract JSON from the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsedQuestions = JSON.parse(jsonMatch[0]);
        
        if (parsedQuestions.length >= 5) {
          setQuestions(parsedQuestions.slice(0, 5));
        } else {
          setQuestions(parsedQuestions);
        }
        setQuizStarted(true);
      } else {
        throw new Error('Invalid response format - no JSON found');
      }
    } catch (error: any) {
      console.error('Error generating quiz:', error);
      
      // Fallback to demo questions
      const demoQuestions: Question[] = [
        {
          question: "Based on the content, what is the main topic?",
          options: ["Understanding the subject", "Learning new things", "Exploring ideas", "All of the above"],
          correctAnswer: 3
        },
        {
          question: "What can we learn from this content?",
          options: ["New information", "Important concepts", "Key ideas", "All of the above"],
          correctAnswer: 3
        },
        {
          question: "How would you describe this topic?",
          options: ["Interesting", "Educational", "Informative", "All of the above"],
          correctAnswer: 3
        }
      ];
      setQuestions(demoQuestions);
      setQuizStarted(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateQuiz = () => {
    if (mode === 'file') {
      generateQuizFromFile();
    } else {
      generateQuizFromText();
    }
  };

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);
    const isCorrect = index === questions[currentQuestion].correctAnswer;
    setAnswers([...answers, isCorrect]);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  const resetQuiz = () => {
    setContent('');
    setSelectedFile(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowResult(false);
    setQuizStarted(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const retryQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowResult(false);
  };

  const calculateScore = () => {
    return answers.filter(a => a).length;
  };

  const handleUseSample = () => {
    setMode('text');
    setContent(sampleContent);
  };

  const getFileIcon = () => {
    if (!selectedFile) return <Upload className="w-12 h-12" />;
    
    if (selectedFile.type === 'application/pdf') {
      return <FileText className="w-12 h-12 text-red-500" />;
    } else {
      return <FileImage className="w-12 h-12 text-orange-500" />;
    }
  };

  if (showResult) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-12 shadow-xl text-white text-center"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2 }}
            className="text-6xl mb-4"
          >
            {percentage >= 80 ? '🏆' : percentage >= 60 ? '🌟' : '💪'}
          </motion.div>
          <h2 className="mb-4">Quiz Complete!</h2>
          <p className="text-xl mb-6">
            You scored {score} out of {questions.length}
          </p>
          <div className="text-3xl mb-8">{percentage}%</div>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={retryQuiz}
              className="bg-white text-purple-600 px-8 py-3 rounded-full hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
            <button
              onClick={resetQuiz}
              className="bg-purple-600 text-white px-8 py-3 rounded-full hover:shadow-lg transition-all"
            >
              New Quiz
            </button>
          </div>
        </motion.div>

        <AIAvatar 
          message={
            percentage >= 80 
              ? "Excellent work! You really understood the material! 🌟" 
              : percentage >= 60
              ? "Good job! Keep practicing and you'll get even better!"
              : "That's okay! Learning takes time. Try reviewing the content and take the quiz again!"
          }
          mood={percentage >= 80 ? 'celebrating' : percentage >= 60 ? 'happy' : 'encouraging'}
        />
      </div>
    );
  }

  if (quizStarted && questions.length > 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full px-4 py-2 shadow-md">
              <span className="text-gray-900">
                Question {currentQuestion + 1} of {questions.length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-md">
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            />
          </div>
        </div>

        <AIAvatar 
          message={
            selectedAnswer === null
              ? "Take your time and think about the answer carefully!"
              : selectedAnswer === questions[currentQuestion].correctAnswer
              ? "Perfect! That's the right answer! 🎉"
              : "Not quite, but that's okay! Let's keep going!"
          }
          mood={
            selectedAnswer === null
              ? 'thinking'
              : selectedAnswer === questions[currentQuestion].correctAnswer
              ? 'celebrating'
              : 'encouraging'
          }
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white rounded-3xl p-8 shadow-xl"
          >
            <div className="text-center mb-8">
              <h2 className="text-gray-900 mb-2">{questions[currentQuestion].question}</h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {questions[currentQuestion].options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: selectedAnswer === null ? 1.02 : 1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={selectedAnswer !== null}
                  className={`p-4 rounded-2xl text-left transition-all ${
                    selectedAnswer === index
                      ? index === questions[currentQuestion].correctAnswer
                        ? 'bg-green-500 text-white ring-4 ring-green-200'
                        : 'bg-red-500 text-white ring-4 ring-red-200'
                      : selectedAnswer !== null && index === questions[currentQuestion].correctAnswer
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      selectedAnswer === index
                        ? 'bg-white/20'
                        : 'bg-gray-200'
                    }`}>
                      <span className={selectedAnswer === index ? 'text-white' : 'text-gray-600'}>
                        {String.fromCharCode(65 + index)}
                      </span>
                    </div>
                    <span>{option}</span>
                  </div>
                </motion.button>
              ))}
            </div>

            {selectedAnswer !== null && questions[currentQuestion].explanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-blue-50 rounded-xl"
              >
                <p className="text-sm text-blue-900">
                  <strong>Explanation:</strong> {questions[currentQuestion].explanation}
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-purple-600">
            <Sparkles className="w-5 h-5" />
            <span>Quiz Generator</span>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
            aria-label="Settings"
            title="API Settings"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-gray-900 mb-4">API Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button
                onClick={saveApiKey}
                className="px-6 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
              >
                Save API Key
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AIAvatar 
        message="Upload a PDF or PowerPoint file, or paste text below, and I'll create a fun quiz to test your understanding! 📝"
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

      <div className="bg-white rounded-2xl p-6 shadow-xl">
        {mode === 'file' ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Upload Document</h3>
            </div>

            <div className="min-h-[200px] flex flex-col items-center justify-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                onChange={handleFileSelect}
                className="hidden"
                id="quiz-file-upload"
              />
              <label
                htmlFor="quiz-file-upload"
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

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'No file selected'}
              </span>
              <button
                onClick={generateQuiz}
                disabled={!selectedFile || isGenerating}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                    <span>Generating Quiz...</span>
                  </>
                ) : (
                  <>
                    <Trophy className="w-5 h-5" />
                    <span>Generate Quiz</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Your Content</h3>
              <button
                onClick={handleUseSample}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                Use Sample Text
              </button>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste the text, article, or lesson content you want to create a quiz from..."
              className="w-full h-64 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {content.split(' ').filter(w => w).length} words
              </span>
              <button
                onClick={generateQuiz}
                disabled={!content.trim() || isGenerating}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                    <span>Generating Quiz...</span>
                  </>
                ) : (
                  <>
                    <Trophy className="w-5 h-5" />
                    <span>Generate Quiz</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6">
        <h3 className="text-gray-900 mb-3">🎯 How It Works</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-orange-600 mt-1">1.</span>
            <span>Upload a PDF or PowerPoint file, or paste text directly</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-600 mt-1">2.</span>
            <span>Click "Generate Quiz" to create questions automatically</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-600 mt-1">3.</span>
            <span>Answer the questions and see how much you've learned!</span>
          </li>
        </ul>
      </div>

      {/* Voice Assistant */}
      <VoiceAssistant 
        onCommand={(cmd) => {
          const command = cmd.toLowerCase();
          if (command.includes('generate') || command.includes('create quiz')) {
            generateQuiz();
            (window as any).todaiSpeak?.('Generating your quiz now');
          } else if (command.includes('restart') || command.includes('reset')) {
            resetQuiz();
            (window as any).todaiSpeak?.('Quiz reset. Ready to create a new one!');
          } else if (command.includes('sample') || command.includes('example')) {
            handleUseSample();
            (window as any).todaiSpeak?.('Sample text loaded');
          }
        }}
      />
    </div>
  );
}
