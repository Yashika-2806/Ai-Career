import React, { useState, useRef } from 'react';
import { Upload, FileText, MessageCircle, Brain, Sparkles, X, CheckCircle, XCircle, Home as HomeIcon, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/auth.store';

type StudyMode = 'chat' | 'quiz' | null;
type Difficulty = 'easy' | 'moderate' | 'hard';

export const PDFStudy: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [mode, setMode] = useState<StudyMode>(null);
  const [chatMessages, setChatMessages] = useState<Array<{role: string, content: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [pdfContext, setPdfContext] = useState('');
  const [conversationId, setConversationId] = useState('');
  const [quizData, setQuizData] = useState<any>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // New states for settings
  const [showSettings, setShowSettings] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState<Difficulty>('moderate');
  const [userAnswers, setUserAnswers] = useState<{[key: number]: number}>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showFlashcard, setShowFlashcard] = useState(false);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setMode(null);
      } else {
        alert('Please upload a PDF file');
      }
    }
  };

  const handleModeSelect = async (selectedMode: StudyMode) => {
    if (!file) return;
    
    // Show settings for quiz mode
    if (selectedMode === 'quiz') {
      setMode(selectedMode);
      setShowSettings(true);
      return;
    }
    
    // For chat mode, proceed directly
    setMode(selectedMode);
    setAnalyzing(true);
    
    try {
      const API_BASE = import.meta.env.VITE_API_URL || '/api';
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', selectedMode as string);
      
      const response = await fetch(`${API_BASE}/pdf/analyze`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Analysis failed');
      
      const data = await response.json();
      
      setPdfContext(data.pdfText || '');
      const newConvId = `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setConversationId(newConvId);
      setChatMessages([{
        role: 'assistant',
        content: data.summary || `I've analyzed "${file.name}". Ask me anything!`
      }]);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze PDF');
      setMode(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!file || !mode) return;
    
    setShowSettings(false);
    setAnalyzing(true);
    
    try {
      const API_BASE = import.meta.env.VITE_API_URL || '/api';
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', mode);
      formData.append('numQuestions', numQuestions.toString());
      formData.append('difficulty', difficulty);
      
      const response = await fetch(`${API_BASE}/pdf/analyze`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Analysis failed');
      
      const data = await response.json();
      
      if (mode === 'quiz') {
        setQuizData({ questions: data.questions || [] });
        setCurrentQuizIndex(0);
        setUserAnswers({});
        setQuizSubmitted(false);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze PDF');
      setMode(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput('');
    
    try {
      const API_BASE = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${API_BASE}/pdf/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: currentInput,
          pdfContext,
          conversationId
        })
      });
      
      const data = await response.json();
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    }
  };

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
        <h1 className="text-5xl font-bold text-white mb-8 flex items-center gap-3">
          <FileText className="w-12 h-12 text-[#00d4ff] glow-cyan" />
          PDF Study Assistant
        </h1>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#1a1f3a]/95 border border-[#00d4ff]/30 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl card-glow">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-3xl font-bold text-white">Configure Quiz</h3>
                <button onClick={() => {setShowSettings(false); setMode(null);}} className="text-gray-400 hover:text-[#00d4ff]" aria-label="Close settings">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Number of Questions
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(parseInt(e.target.value) || 5)}
                    className="w-full px-4 py-3 bg-[#0f1629] border border-[#00d4ff]/30 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-[#00d4ff] hover-glow-cyan"
                    placeholder="Enter number of questions"
                    aria-label="Number of Questions"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['easy', 'moderate', 'hard'] as Difficulty[]).map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`py-3 rounded-lg font-medium transition text-base ${
                          difficulty === level
                            ? 'bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] text-[#0a0e27] font-bold glow-cyan'
                            : 'bg-[#0f1629] border border-[#00d4ff]/20 text-gray-300 hover:bg-[#1a1f3a]'
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerateContent}
                  disabled={analyzing}
                  className="w-full bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] disabled:opacity-50 text-[#0a0e27] font-bold py-4 rounded-lg transition text-base btn-primary-glow"
                >
                  {analyzing ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>
          </div>
        )}

        {!mode ? (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <div className="bg-[#1a1f3a]/90 backdrop-blur-md border border-[#00d4ff]/30 rounded-lg p-8 card-glow">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] rounded-lg flex items-center justify-center glow-cyan">
                  <FileText className="w-7 h-7 text-[#0a0e27]" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Upload PDF</h2>
                  <p className="text-gray-400 text-base">Your study material</p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Upload PDF file"
              />
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400 transition"
              >
                <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                {file ? (
                  <div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-gray-400 text-sm mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-white font-medium">Click to upload</p>
                    <p className="text-gray-400 text-sm mt-1">PDF files only</p>
                  </div>
                )}
              </div>
            </div>

            {/* Mode Selection */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-4">Choose Study Mode</h2>
              
              <button
                onClick={() => handleModeSelect('chat')}
                disabled={!file || analyzing}
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Chat with PDF</h3>
                    <p className="text-gray-400 text-sm">Ask questions and get instant answers</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleModeSelect('quiz')}
                disabled={!file || analyzing}
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Interactive Quiz</h3>
                    <p className="text-gray-400 text-sm">Test your knowledge with custom difficulty</p>
                  </div>
                </div>
              </button>

              {analyzing && (
                <div className="text-center py-4">
                  <Brain className="w-8 h-8 text-purple-400 mx-auto mb-2 animate-pulse" />
                  <p className="text-purple-300">Analyzing PDF with AI...</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            {/* Chat Mode */}
            {mode === 'chat' && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Chat: {file?.name}</h3>
                  <button
                    onClick={() => setMode(null)}
                    className="text-gray-400 hover:text-white transition"
                    aria-label="Close chat"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-4 py-3 rounded-lg ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                          : 'bg-slate-800/90 text-gray-200'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about the PDF..."
                    className="flex-1 px-4 py-3 bg-slate-800/90 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}

            {/* Quiz Mode */}
            {mode === 'quiz' && quizData && quizData.questions.length > 0 && (() => {
              const progress = Math.round(((currentQuizIndex + 1) / quizData.questions.length) * 100);
              return (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Interactive Quiz</h3>
                    <p className="text-gray-400 text-sm mt-1">Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
                  </div>
                  <button onClick={() => setMode(null)} className="text-gray-400 hover:text-white" aria-label="Close quiz"><X className="w-5 h-5" /></button>
                </div>

                {!quizSubmitted && (
                  <>
                    <div className="mb-6 bg-slate-800/50 rounded-lg p-4">
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Question {currentQuizIndex + 1} of {quizData.questions.length}</span>
                        <span>Answered: {Object.keys(userAnswers).length}/{quizData.questions.length}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        {/* eslint-disable-next-line */}
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.round(progress)}%` }}
                          role="progressbar"
                          aria-label="Quiz progress"
                          aria-valuenow={Math.round(progress)}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </div>

                    <div className="bg-slate-800/50 rounded-lg p-8 mb-6">
                      <h4 className="text-2xl font-semibold text-white mb-8 leading-relaxed">
                        {quizData.questions[currentQuizIndex].question}
                      </h4>

                      <div className="space-y-3">
                        {quizData.questions[currentQuizIndex].options.map((option: string, idx: number) => {
                          const isAnswered = userAnswers[currentQuizIndex] !== undefined;
                          const isSelected = userAnswers[currentQuizIndex] === idx;
                          const isCorrect = quizData.questions[currentQuizIndex].correctAnswer === idx;
                          const showResult = isAnswered && showFlashcard;
                          
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                if (!isAnswered) {
                                  setUserAnswers({...userAnswers, [currentQuizIndex]: idx});
                                  setShowFlashcard(true);
                                  setFlashcardFlipped(false);
                                }
                              }}
                              disabled={isAnswered}
                              className={`w-full px-6 py-4 rounded-lg text-left transition border-2 ${
                                showResult && isCorrect
                                  ? 'bg-green-600/30 border-green-400 text-white'
                                  : showResult && isSelected && !isCorrect
                                  ? 'bg-red-600/30 border-red-400 text-white'
                                  : isSelected
                                  ? 'bg-purple-600/30 border-purple-400 text-white'
                                  : 'bg-slate-700/30 border-white/10 text-gray-300 hover:bg-slate-600/30 hover:border-purple-400/50'
                              } ${isAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              <span className="font-medium mr-3">{String.fromCharCode(65 + idx)}.</span>
                              {option}
                              {showResult && isCorrect && (
                                <span className="ml-2 text-green-400">✓ Correct</span>
                              )}
                              {showResult && isSelected && !isCorrect && (
                                <span className="ml-2 text-red-400">✗ Wrong</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Flashcard Answer Reveal */}
                    {showFlashcard && userAnswers[currentQuizIndex] !== undefined && (
                      <div className="mb-6 animate-fade-in">
                        <div 
                          className="relative w-full h-64 cursor-pointer perspective-1000"
                          onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                        >
                          <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${flashcardFlipped ? 'rotate-y-180' : ''}`}>
                            {/* Front of flashcard */}
                            <div className="absolute w-full h-full backface-hidden">
                              <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-8 flex flex-col items-center justify-center shadow-2xl border-2 border-purple-400">
                                <Sparkles className="w-16 h-16 text-white mb-4 animate-pulse" />
                                <h3 className="text-3xl font-bold text-white text-center mb-4">
                                  {userAnswers[currentQuizIndex] === quizData.questions[currentQuizIndex].correctAnswer 
                                    ? '🎉 Correct!'
                                    : '📚 Review Answer'}
                                </h3>
                                <p className="text-white text-lg text-center mb-4">
                                  Click to see explanation
                                </p>
                                <div className="text-white/70 text-sm">Tap card to flip →</div>
                              </div>
                            </div>
                            
                            {/* Back of flashcard */}
                            <div className="absolute w-full h-full backface-hidden rotate-y-180">
                              <div className="w-full h-full bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl p-8 shadow-2xl border-2 border-cyan-400 overflow-y-auto">
                                <div className="flex items-start gap-3 mb-4">
                                  <CheckCircle className="w-8 h-8 text-white flex-shrink-0" />
                                  <div>
                                    <h4 className="text-xl font-bold text-white mb-2">Correct Answer:</h4>
                                    <p className="text-white text-lg font-semibold mb-4">
                                      {quizData.questions[currentQuizIndex].options[quizData.questions[currentQuizIndex].correctAnswer]}
                                    </p>
                                  </div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-4">
                                  <h5 className="text-white font-semibold mb-2">💡 Explanation:</h5>
                                  <p className="text-white/90 leading-relaxed">
                                    {quizData.questions[currentQuizIndex].explanation}
                                  </p>
                                </div>
                                <div className="text-white/70 text-sm mt-4 text-center">Tap to flip back ←</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <button
                        disabled={currentQuizIndex === 0}
                        onClick={() => {
                          setCurrentQuizIndex(prev => prev - 1);
                          setShowFlashcard(false);
                          setFlashcardFlipped(false);
                        }}
                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition"
                      >
                        ← Previous
                      </button>
                      
                      {currentQuizIndex === quizData.questions.length - 1 ? (
                        <button
                          onClick={() => setQuizSubmitted(true)}
                          disabled={Object.keys(userAnswers).length !== quizData.questions.length}
                          className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition"
                        >
                          Submit Quiz
                        </button>
                      ) : (
                        <button
                          disabled={currentQuizIndex === quizData.questions.length - 1 || userAnswers[currentQuizIndex] === undefined}
                          onClick={() => {
                            setCurrentQuizIndex(prev => prev + 1);
                            setShowFlashcard(false);
                            setFlashcardFlipped(false);
                          }}
                          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition"
                        >
                          Next →
                        </button>
                      )}
                    </div>
                  </>
                )}

                {/* Results View */}
                {quizSubmitted && (
                  <div>
                    <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-400/50 rounded-xl p-8 mb-6">
                      <h4 className="text-3xl font-bold text-white mb-4">Quiz Results</h4>
                      {(() => {
                        const score = quizData.questions.reduce((acc: number, q: any, idx: number) => 
                          userAnswers[idx] === q.correctAnswer ? acc + 1 : acc, 0
                        );
                        const percentage = (score / quizData.questions.length) * 100;
                        return (
                          <div>
                            <div className="flex items-center gap-4 mb-4">
                              <div className="text-6xl font-bold text-white">{score}/{quizData.questions.length}</div>
                              <div>
                                <div className="text-3xl font-bold text-purple-300">{percentage.toFixed(0)}%</div>
                                <div className="text-gray-400">
                                  {percentage >= 80 ? '🎉 Excellent!' : percentage >= 60 ? '👍 Good Job!' : '📚 Keep Learning!'}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="space-y-4">
                      {quizData.questions.map((q: any, idx: number) => {
                        const isCorrect = userAnswers[idx] === q.correctAnswer;
                        return (
                          <div key={idx} className={`rounded-lg p-6 border-2 ${
                            isCorrect ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'
                          }`}>
                            <div className="flex items-start gap-3 mb-3">
                              {isCorrect ? (
                                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                              ) : (
                                <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                              )}
                              <div className="flex-1">
                                <h5 className="text-lg font-semibold text-white mb-3">{q.question}</h5>
                                <div className="space-y-2">
                                  <div className={`px-4 py-2 rounded ${
                                    userAnswers[idx] === q.correctAnswer ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                                  }`}>
                                    <span className="font-medium">Your answer:</span> {q.options[userAnswers[idx]]}
                                  </div>
                                  {!isCorrect && (
                                    <div className="px-4 py-2 rounded bg-green-500/20 text-green-300">
                                      <span className="font-medium">Correct answer:</span> {q.options[q.correctAnswer]}
                                    </div>
                                  )}
                                  <p className="text-gray-400 text-sm mt-2 px-4">{q.explanation}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => {setMode(null); setQuizSubmitted(false);}}
                      className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition"
                    >
                      Start New Quiz
                    </button>
                  </div>
                )}
              </div>
              );
            })()}


          </div>
        )}
      </div>
    </div>
  );
};
