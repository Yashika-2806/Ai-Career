import React, { useState, useEffect, useRef } from 'react';
import { Target, PlayCircle, StopCircle, CheckCircle, Clock, Brain, TrendingUp, Calendar, History, Award, AlertCircle, Home as HomeIcon, LogOut, Camera, CameraOff, Monitor, AlertTriangle } from 'lucide-react';
import { interviewService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/auth.store';
import { getAllCompanies, getCompanyByCode } from '../data/company-interview-questions';

interface InterviewSession {
  conversationId: string;
  question: string;
  answer?: string;
  feedback?: string;
  score?: number;
}

interface SuspiciousActivity {
  type: 'tab-switch' | 'copy-paste' | 'ai-pattern';
  timestamp: Date;
  description: string;
}

export const Interview: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [interviewType, setInterviewType] = useState('technical');
  const [targetRole, setTargetRole] = useState('sde');
  const [targetCompany, setTargetCompany] = useState('google');
  const [sessionHistory, setSessionHistory] = useState<InterviewSession[]>([]);
  const [pastInterviews, setPastInterviews] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Camera states
  const [showCameraPrompt, setShowCameraPrompt] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Proctoring states
  const [suspiciousActivities, setSuspiciousActivities] = useState<SuspiciousActivity[]>([]);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isAnswering, setIsAnswering] = useState(false);
  const [plagiarismScore, setPlagiarismScore] = useState(0);
  const [isPlagiarized, setIsPlagiarized] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(0);
  const [lastTypingTime, setLastTypingTime] = useState(Date.now());
  const [characterCount, setCharacterCount] = useState(0);

  const companies = getAllCompanies();

  useEffect(() => {
    fetchHistory();
  }, []);

  // Detect tab switches (potential cheating)
  useEffect(() => {
    if (!isAnswering) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        setSuspiciousActivities(prev => [...prev, {
          type: 'tab-switch',
          timestamp: new Date(),
          description: 'User switched to another tab or window'
        }]);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAnswering]);

  // Detect copy-paste (potential cheating)
  useEffect(() => {
    if (!isAnswering) return;

    const handlePaste = (e: ClipboardEvent) => {
      const pastedText = e.clipboardData?.getData('text');
      if (pastedText && pastedText.length > 50) {
        setSuspiciousActivities(prev => [...prev, {
          type: 'copy-paste',
          timestamp: new Date(),
          description: `Large text pasted (${pastedText.length} characters)`
        }]);
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [isAnswering]);

  // Request camera access
  const requestCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      setCameraStream(stream);
      setCameraEnabled(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCameraPrompt(false);
    } catch (error) {
      console.error('Failed to access camera:', error);
      alert('Camera access is required for interview proctoring. Please allow camera access and try again.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setCameraEnabled(false);
    }
  };

  // Enter fullscreen
  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
    }
  };

  // Exit fullscreen
  const exitFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      
      // If user exits fullscreen during interview, log it
      if (!document.fullscreenElement && interviewStarted && isAnswering) {
        setSuspiciousActivities(prev => [...prev, {
          type: 'tab-switch',
          timestamp: new Date(),
          description: 'User exited fullscreen mode'
        }]);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [interviewStarted, isAnswering]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Analyze answer for AI patterns
  const analyzeAnswerForAI = (text: string): boolean => {
    const aiPatterns = [
      /as an ai/i,
      /i am an ai/i,
      /language model/i,
      /i don't have personal/i,
      /i cannot (feel|experience)/i,
      /^(sure|certainly|of course),? here('s| is)/i
    ];
    
    return aiPatterns.some(pattern => pattern.test(text));
  };

  // Plagiarism detection system
  const detectPlagiarism = (text: string): number => {
    let score = 0;
    
    // Check for overly formal/perfect grammar (potential copy-paste)
    const formalPatterns = [
      /\b(furthermore|moreover|consequently|nevertheless|notwithstanding)\b/gi,
      /\b(pursuant to|in accordance with|with respect to|in light of)\b/gi,
      /\b(it is worth noting|it should be noted|it is important to mention)\b/gi
    ];
    
    formalPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) score += matches.length * 10;
    });

    // Check for code-like perfection in technical answers
    const technicalPatterns = [
      /\b(implement|algorithm|complexity|optimization)\b.*\b(as follows|is as follows|would be)\b/i,
      /\bstep \d+:/gi,
      /\b(first|second|third|finally),?\s+(we|you)\s+(need to|should|must)/gi
    ];
    
    technicalPatterns.forEach(pattern => {
      if (pattern.test(text)) score += 15;
    });

    // Check for unusual vocabulary for typical interview response
    const unusualWords = [
      'aforementioned', 'heretofore', 'wherein', 'thereof', 'hereby',
      'notwithstanding', 'aforestated', 'hereinafter'
    ];
    
    unusualWords.forEach(word => {
      if (new RegExp(`\\b${word}\\b`, 'i').test(text)) score += 20;
    });

    // Check typing speed anomalies (if text appears too fast)
    const timeSinceStart = Date.now() - lastTypingTime;
    const charsAdded = text.length - characterCount;
    
    if (charsAdded > 100 && timeSinceStart < 1000) {
      // More than 100 chars in less than 1 second = likely paste
      score += 50;
    }

    // Check for perfect code blocks (rarely typed by humans in interviews)
    const codeBlockPattern = /```[\s\S]*?```/g;
    const codeBlocks = text.match(codeBlockPattern);
    if (codeBlocks && codeBlocks.length > 0) {
      score += 30;
    }

    return Math.min(score, 100);
  };

  // Handle answer change with plagiarism detection
  const handleAnswerChange = (text: string) => {
    setAnswer(text);
    
    if (isAnswering && text.length > 50) {
      const plagScore = detectPlagiarism(text);
      setPlagiarismScore(plagScore);
      
      if (plagScore > 50) {
        setIsPlagiarized(true);
        setSuspiciousActivities(prev => [...prev, {
          type: 'copy-paste',
          timestamp: new Date(),
          description: `High plagiarism score detected: ${plagScore}%`
        }]);
      }

      // Calculate typing speed
      const currentTime = Date.now();
      const timeDiff = (currentTime - lastTypingTime) / 1000; // seconds
      const charDiff = text.length - characterCount;
      
      if (timeDiff > 0 && charDiff > 0) {
        const speed = charDiff / timeDiff;
        setTypingSpeed(speed);
        
        // Suspiciously fast typing (>10 chars/sec sustained)
        if (speed > 10 && charDiff > 20) {
          setSuspiciousActivities(prev => [...prev, {
            type: 'copy-paste',
            timestamp: new Date(),
            description: `Unusually fast typing detected: ${speed.toFixed(1)} chars/sec`
          }]);
        }
      }
      
      setLastTypingTime(currentTime);
      setCharacterCount(text.length);
    }
  };

  const fetchHistory = async () => {
    try {
      const history = await interviewService.getHistory() as any[];
      setPastInterviews(history);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const handleStartInterview = async () => {
    setLoading(true);
    try {
      const selectedCompany = getCompanyByCode(targetCompany);
      
      const result = await interviewService.startInterview({
        jobRole: targetRole,
        interviewType,
        company: targetCompany,
        companyName: selectedCompany?.name
      }) as { conversationId: string; question: string };
      
      setCurrentSession({
        conversationId: result.conversationId,
        question: result.question,
      });
      setSessionHistory([{
        conversationId: result.conversationId,
        question: result.question,
      }]);
      setInterviewStarted(true);
      setSuspiciousActivities([]);
      setTabSwitchCount(0);
      
      // Show camera prompt
      setShowCameraPrompt(true);
    } catch (error) {
      console.error('Failed to start interview:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAnswering = async () => {
    // Request camera and fullscreen when user starts typing
    setIsAnswering(true);
    setLastTypingTime(Date.now());
    setCharacterCount(0);
    setPlagiarismScore(0);
    setIsPlagiarized(false);
    
    if (!cameraEnabled && !showCameraPrompt) {
      setShowCameraPrompt(true);
    }
    
    // Force fullscreen immediately
    if (!isFullscreen) {
      await enterFullscreen();
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer || !currentSession) return;
    setLoading(true);
    
    // Check for AI patterns
    if (analyzeAnswerForAI(answer)) {
      setSuspiciousActivities(prev => [...prev, {
        type: 'ai-pattern',
        timestamp: new Date(),
        description: 'Answer contains AI-generated text patterns'
      }]);
    }
    
    try {
      const result = await interviewService.submitAnswer({
        conversationId: currentSession.conversationId,
        answer,
        suspiciousActivities: suspiciousActivities.length,
        tabSwitches: tabSwitchCount,
        plagiarismScore: plagiarismScore,
        typingSpeed: typingSpeed
      }) as { feedback: string; score: number };
      
      const updatedSession = {
        ...currentSession,
        answer,
        feedback: result.feedback,
        score: result.score,
      };
      
      setCurrentSession(updatedSession);
      setSessionHistory([...sessionHistory, updatedSession]);
      setAnswer('');
      setIsAnswering(false);
      setPlagiarismScore(0);
      setIsPlagiarized(false);
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    setCurrentSession({
      conversationId: currentSession?.conversationId || '',
      question: "Let's continue with the next question...",
    });
  };

  const handleEndInterview = async () => {
    setInterviewStarted(false);
    setCurrentSession(null);
    setSessionHistory([]);
    setIsAnswering(false);
    setSuspiciousActivities([]);
    setTabSwitchCount(0);
    
    // Stop camera
    stopCamera();
    
    // Exit fullscreen
    await exitFullscreen();
    
    fetchHistory();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0f1629] p-6 relative">
      {/* Camera Permission Popup */}
      {showCameraPrompt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1a1f3a] border-2 border-[#00d4ff] rounded-lg p-8 max-w-md w-full shadow-[0_0_50px_rgba(0,212,255,0.3)]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] rounded-full flex items-center justify-center">
                <Camera className="w-8 h-8 text-[#0a0e27]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Camera Access Required</h3>
                <p className="text-gray-400 mt-1">For interview proctoring</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6">
              We need to monitor you during the interview to ensure fairness and prevent cheating. 
              Your video will be used only for proctoring purposes.
            </p>
            <div className="flex gap-3">
              <button
                onClick={requestCameraAccess}
                className="flex-1 bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] text-[#0a0e27] font-bold py-3 px-6 rounded-lg transition"
              >
                Allow Camera
              </button>
              <button
                onClick={() => {
                  setShowCameraPrompt(false);
                  handleEndInterview();
                }}
                className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 transition"
              >
                Deny
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Preview (when enabled and answering) */}
      {cameraEnabled && isAnswering && (
        <div className="fixed bottom-6 right-6 z-50 w-64 h-48 bg-black rounded-lg overflow-hidden border-2 border-[#00d4ff] shadow-[0_0_30px_rgba(0,212,255,0.3)]">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 flex items-center gap-2 bg-red-500 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-white text-xs font-bold">RECORDING</span>
          </div>
          <div className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
            Proctoring Active
          </div>
        </div>
      )}

      {/* Suspicious Activity Alert */}
      {suspiciousActivities.length > 0 && interviewStarted && (
        <div className="fixed top-24 right-6 z-50 max-w-sm">
          <div className="bg-yellow-500/20 border-2 border-yellow-500 rounded-lg p-4 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-yellow-400 font-bold mb-1">Suspicious Activity Detected</h4>
                <p className="text-white text-sm mb-2">
                  {suspiciousActivities.length} suspicious {suspiciousActivities.length === 1 ? 'activity' : 'activities'} detected
                </p>
                <ul className="text-xs text-gray-300 space-y-1">
                  {suspiciousActivities.slice(-3).map((activity, idx) => (
                    <li key={idx}>• {activity.description}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0e27]/95 backdrop-blur-md border-b border-[#00d4ff]/30 shadow-[0_0_20px_rgba(0,212,255,0.1)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] rounded-lg flex items-center justify-center glow-cyan">
              <Brain className="w-6 h-6 text-[#0a0e27]" />
            </div>
            <span className="font-bold text-white text-2xl">Career AI</span>
            {isFullscreen && (
              <span className="ml-4 px-3 py-1 bg-green-500/20 border border-green-500 rounded-full text-green-400 text-sm flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                Fullscreen Mode
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {cameraEnabled && (
              <span className="px-3 py-1 bg-red-500/20 border border-red-500 rounded-full text-red-400 text-sm flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Camera Active
              </span>
            )}
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

      <div className="max-w-6xl mx-auto relative z-10 pt-20">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold text-white mb-2">Interview Preparation</h1>
            <p className="text-[#00d4ff] text-xl">Practice with AI-powered mock interviews</p>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-6 py-3 bg-[#1a1f3a]/90 hover:bg-[#1a1f3a] border border-[#00d4ff]/30 rounded-lg text-white transition hover-glow-cyan text-base"
          >
            <History className="w-6 h-6" />
            History
          </button>
        </div>

        {!interviewStarted ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Start Interview Card */}
            <div className="lg:col-span-2">
              <div className="bg-[#1a1f3a]/90 backdrop-blur-md border border-[#00d4ff]/30 rounded-lg p-8 card-glow">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] rounded-lg flex items-center justify-center glow-cyan">
                    <PlayCircle className="w-7 h-7 text-[#0a0e27]" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">Start Mock Interview</h2>
                    <p className="text-gray-300 text-base">Get real-time AI feedback</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-base font-medium text-gray-300 mb-2">Target Company</label>
                    <select
                      value={targetCompany}
                      onChange={(e) => setTargetCompany(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0f1629] border border-[#00d4ff]/30 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-[#00d4ff] hover-glow-cyan"
                      aria-label="Select target company"
                    >
                      {companies.map((company) => (
                        <option key={company.code} value={company.code}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                    {targetCompany && (
                      <p className="mt-2 text-sm text-gray-400">
                        Focus: {getCompanyByCode(targetCompany)?.focus.join(', ')}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-300 mb-2">Interview Type</label>
                    <select 
                      value={interviewType}
                      onChange={(e) => setInterviewType(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0f1629] border border-[#00d4ff]/30 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-[#00d4ff] hover-glow-cyan"
                      aria-label="Select interview type"
                    >
                      <option value="technical">Technical Coding</option>
                      <option value="hr">HR & Behavioral</option>
                      <option value="system-design">System Design</option>
                      <option value="behavioral">Leadership & Behavioral</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-300 mb-2">Target Role</label>
                    <select
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0f1629] border border-[#00d4ff]/30 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-[#00d4ff] hover-glow-cyan"
                      aria-label="Select target role"
                    >
                      <option value="sde">Software Engineer</option>
                      <option value="aiml">AI/ML Engineer</option>
                      <option value="data-scientist">Data Scientist</option>
                      <option value="frontend">Frontend Developer</option>
                      <option value="backend">Backend Developer</option>
                      <option value="fullstack">Full Stack Developer</option>
                    </select>
                  </div>

                  <button
                    onClick={handleStartInterview}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] disabled:opacity-50 text-[#0a0e27] font-bold py-4 px-6 rounded-lg transition flex items-center justify-center gap-2 text-lg btn-primary-glow"
                  >
                    {loading ? (
                      'Starting Interview...'
                    ) : (
                      <>
                        <PlayCircle className="w-5 h-5" />
                        Start Interview
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <div className="bg-[#1a1f3a]/90 backdrop-blur-md border border-[#00d4ff]/30 rounded-lg p-6 card-glow">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-7 h-7 text-[#00d4ff]" />
                  <h3 className="text-xl font-semibold text-white">Your Progress</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Total Interviews</span>
                    <span className="text-white font-bold">{pastInterviews.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">This Week</span>
                    <span className="text-white font-bold">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Avg Score</span>
                    <span className="text-green-400 font-bold">-</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-6">
                <AlertCircle className="w-8 h-8 text-blue-400 mb-3" />
                <h4 className="text-white font-semibold mb-2">Pro Tips</h4>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>• Think out loud during coding</li>
                  <li>• Ask clarifying questions</li>
                  <li>• Discuss trade-offs</li>
                  <li>• Test your solution</li>
                </ul>
              </div>
            </div>

            {/* Past Interviews */}
            {showHistory && pastInterviews.length > 0 && (
              <div className="lg:col-span-3">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Past Interviews
                  </h3>
                  <div className="space-y-3">
                    {pastInterviews.slice(0, 5).map((interview, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{interview.metadata?.interviewType || 'Interview'}</p>
                            <p className="text-gray-400 text-sm">{new Date(interview.createdAt).toLocaleDateString()}</p>
                          </div>
                          <Award className="w-5 h-5 text-yellow-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Active Interview Interface
          <div className="space-y-6">
            {/* Current Question */}
            <div className="bg-[#1a1f3a]/90 backdrop-blur-md border border-[#00d4ff]/30 rounded-lg p-8 card-glow">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] rounded-full flex items-center justify-center flex-shrink-0 glow-cyan">
                  <Brain className="w-6 h-6 text-[#0a0e27]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-white mb-3">Interview Question</h3>
                  <p className="text-gray-200 whitespace-pre-wrap break-words text-base leading-relaxed">{currentSession?.question}</p>
                </div>
              </div>

              {!currentSession?.feedback ? (
                <>
                  <div className="mb-4">
                    <label className="block text-base font-medium text-gray-300 mb-2">Your Answer</label>
                    <textarea
                      value={answer}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      onFocus={handleStartAnswering}
                      placeholder="Type your answer here... Be clear and detailed."
                      rows={8}
                      className="w-full bg-[#0f1629] border border-[#00d4ff]/30 rounded-lg px-4 py-3 text-white text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d4ff] resize-none"
                    />
                    {isAnswering && (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-red-400">Interview in progress - Your activity is being monitored</span>
                        </div>
                        
                        {/* Plagiarism Detection Display */}
                        {answer.length > 50 && (
                          <div className={`flex items-center justify-between p-3 rounded-lg border ${
                            plagiarismScore > 70 ? 'bg-red-500/10 border-red-500' :
                            plagiarismScore > 40 ? 'bg-yellow-500/10 border-yellow-500' :
                            'bg-green-500/10 border-green-500'
                          }`}>
                            <div className="flex items-center gap-2">
                              <AlertTriangle className={`w-5 h-5 ${
                                plagiarismScore > 70 ? 'text-red-400' :
                                plagiarismScore > 40 ? 'text-yellow-400' :
                                'text-green-400'
                              }`} />
                              <span className={`text-sm font-medium ${
                                plagiarismScore > 70 ? 'text-red-400' :
                                plagiarismScore > 40 ? 'text-yellow-400' :
                                'text-green-400'
                              }`}>
                                {plagiarismScore > 70 ? '⚠️ High Plagiarism Risk' :
                                 plagiarismScore > 40 ? '⚠️ Moderate Plagiarism Risk' :
                                 '✓ Original Content'}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`text-sm ${
                                plagiarismScore > 70 ? 'text-red-400' :
                                plagiarismScore > 40 ? 'text-yellow-400' :
                                'text-green-400'
                              }`}>
                                Score: {plagiarismScore}%
                              </span>
                              {typingSpeed > 0 && (
                                <span className="text-sm text-gray-400">
                                  Speed: {typingSpeed.toFixed(1)} chars/sec
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {tabSwitchCount > 0 && (
                      <div className="mt-2 text-sm text-yellow-400">
                        ⚠️ Tab switches detected: {tabSwitchCount}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={!answer.trim() || loading}
                      className="flex-1 bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0e27] font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2 text-base btn-primary-glow"
                    >
                      {loading ? 'Evaluating...' : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Submit Answer
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleEndInterview}
                      className="bg-[#1a1f3a]/90 hover:bg-[#1a1f3a] text-gray-300 font-semibold py-3 px-6 rounded-lg transition border border-[#00d4ff]/20 text-base"
                    >
                      End Interview
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* AI Feedback */}
                  <div className="bg-gradient-to-br from-[#00d4ff]/10 to-[#0ea5e9]/10 border border-[#00d4ff]/30 rounded-lg p-6 mb-4 glow-cyan">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] rounded-full flex items-center justify-center flex-shrink-0 glow-cyan">
                        <Target className="w-5 h-5 text-[#0a0e27]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold mb-3 text-lg">AI Feedback</h4>
                        <div className="text-gray-200 whitespace-pre-wrap break-words text-base leading-relaxed max-h-96 overflow-y-auto">{currentSession.feedback}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleNextQuestion}
                      className="flex-1 bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] text-[#0a0e27] font-bold py-3 px-6 rounded-lg transition text-base btn-primary-glow"
                    >
                      Next Question
                    </button>
                    <button
                      onClick={handleEndInterview}
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] text-white font-bold py-3 px-6 rounded-lg transition flex items-center gap-2 text-base"
                    >
                      <StopCircle className="w-5 h-5" />
                      End Interview
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Session Progress */}
            <div className="bg-[#1a1f3a]/90 backdrop-blur-md border border-[#00d4ff]/30 rounded-lg p-6 card-glow">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-[#00d4ff]" />
                Interview Progress
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-[#0f1629] rounded-full h-3 border border-[#00d4ff]/20">
                  <div 
                    className="bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] h-3 rounded-full transition-all glow-cyan"
                    style={{ width: `${Math.round((sessionHistory.length / 5) * 100)}%` }}
                    role="progressbar"
                    aria-label="Interview progress"
                    aria-valuenow={Math.round((sessionHistory.length / 5) * 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <span className="text-white font-bold text-lg">{sessionHistory.length}/5</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
