import { useState, useEffect } from 'react';
import { ArrowLeft, Mic, Volume2, TrendingUp, Heart, Zap, HelpCircle } from 'lucide-react';
import { AIAvatar } from './AIAvatar';
import { motion, AnimatePresence } from 'motion/react';

interface LessonViewProps {
  onBack: () => void;
}

export function LessonView({ onBack }: LessonViewProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isListening, setIsListening] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('gemini_api_key');
    if (stored) {
      setApiKey(stored);
    }
  }, []);

  const questions = [
    {
      question: "What is 7 × 8?",
      options: ["54", "56", "58", "52"],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: "What is 12 × 5?",
      options: ["50", "55", "60", "65"],
      correct: 2,
      difficulty: 'medium'
    },
    {
      question: "What is 9 × 6?",
      options: ["48", "52", "54", "56"],
      correct: 2,
      difficulty: 'medium'
    }
  ];

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
    const correct = index === questions[currentQuestion].correct;
    setIsCorrect(correct);
    
    // Simulate difficulty adjustment
    setTimeout(() => {
      if (!correct && difficulty === 'medium') {
        setDifficulty('easy');
      } else if (correct && difficulty === 'medium') {
        setDifficulty('hard');
      }
    }, 1000);

    // Move to next question
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      }
    }, 2000);
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
  };

  const fetchExplanation = async () => {
    if (!apiKey) {
      alert('API key not set. Please set your API key in the settings.');
      return;
    }
    const response = await fetch('https://api.gemini.com/v1/explain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        question: questions[currentQuestion].question,
        correctAnswer: questions[currentQuestion].options[questions[currentQuestion].correct],
        userAnswer: questions[currentQuestion].options[selectedAnswer!]
      })
    });
    const data = await response.json();
    setAiExplanation(data.explanation);
    setShowExplanation(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        {/* Difficulty Indicator */}
        <motion.div
          key={difficulty}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-full px-4 py-2 shadow-md flex items-center gap-2"
        >
          <TrendingUp className={`w-4 h-4 ${
            difficulty === 'easy' ? 'text-green-500' :
            difficulty === 'medium' ? 'text-yellow-500' :
            'text-orange-500'
          }`} />
          <span className="text-sm text-gray-700">
            {difficulty === 'easy' && 'Getting Easier'}
            {difficulty === 'medium' && 'Just Right'}
            {difficulty === 'hard' && 'Challenge Boosted! 🚀'}
          </span>
        </motion.div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm text-gray-900">{currentQuestion + 1} of {questions.length}</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
          />
        </div>
      </div>

      {/* AI Avatar */}
      <AIAvatar 
        message={
          isCorrect === null 
            ? "Take your time and think carefully. You've got this!" 
            : isCorrect 
            ? "Awesome! You're doing great! 🌟" 
            : "That's okay! Let's try again. Remember, mistakes help us learn!"
        }
        mood={isCorrect === null ? 'thinking' : isCorrect ? 'celebrating' : 'encouraging'}
      />

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="bg-white rounded-3xl p-8 shadow-xl"
        >
          {/* Question */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <span className="text-2xl">🔢</span>
            </div>
            <h2 className="text-gray-900 mb-2">{questions[currentQuestion].question}</h2>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {questions[currentQuestion].options.map((option, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: selectedAnswer === null ? 1.02 : 1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => selectedAnswer === null && handleAnswerSelect(index)}
                disabled={selectedAnswer !== null}
                className={`p-6 rounded-2xl transition-all ${
                  selectedAnswer === index
                    ? isCorrect
                      ? 'bg-green-500 text-white ring-4 ring-green-200'
                      : 'bg-red-500 text-white ring-4 ring-red-200'
                    : selectedAnswer !== null && index === questions[currentQuestion].correct
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                }`}
              >
                {option}
                {selectedAnswer === index && isCorrect && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-2"
                  >
                    ✓
                  </motion.span>
                )}
                {selectedAnswer === index && !isCorrect && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-2"
                  >
                    ✗
                  </motion.span>
                )}
              </motion.button>
            ))}
          </div>

          {/* Voice Input Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm text-gray-600">Or speak your answer:</span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleVoiceInput}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
                  isListening
                    ? 'bg-red-500 text-white ring-4 ring-red-200'
                    : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:shadow-xl'
                }`}
              >
                {isListening ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Mic className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </motion.button>
              {isListening && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-600"
                >
                  Listening... 🎤
                </motion.span>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-md text-center">
          <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <div className="text-sm text-gray-600">Lives</div>
          <div className="text-gray-900">3 / 3</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md text-center">
          <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <div className="text-sm text-gray-600">Streak</div>
          <div className="text-gray-900">5 correct</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md text-center">
          <Volume2 className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <div className="text-sm text-gray-600">Points</div>
          <div className="text-gray-900">+150</div>
        </div>
      </div>

      {/* Explanation Section */}
      {showExplanation && (
        <div className="bg-white rounded-2xl p-4 shadow-md mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Explanation</span>
            <button
              onClick={() => setShowExplanation(false)}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Hide</span>
            </button>
          </div>
          <p className="text-gray-900">{aiExplanation}</p>
        </div>
      )}
    </div>
  );
}