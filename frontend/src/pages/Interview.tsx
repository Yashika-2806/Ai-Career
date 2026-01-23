import React, { useState, useEffect } from 'react';
import { Target, PlayCircle, StopCircle, CheckCircle, Clock, Brain, TrendingUp, Calendar, History, Award, AlertCircle, Home as HomeIcon, LogOut } from 'lucide-react';
import { interviewService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/auth.store';

interface InterviewSession {
  conversationId: string;
  question: string;
  answer?: string;
  feedback?: string;
  score?: number;
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
  const [sessionHistory, setSessionHistory] = useState<InterviewSession[]>([]);
  const [pastInterviews, setPastInterviews] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

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
      const result = await interviewService.startInterview({
        jobRole: targetRole,
        interviewType,
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
    } catch (error) {
      console.error('Failed to start interview:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer || !currentSession) return;
    setLoading(true);
    try {
      const result = await interviewService.submitAnswer({
        conversationId: currentSession.conversationId,
        answer,
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

  const handleEndInterview = () => {
    setInterviewStarted(false);
    setCurrentSession(null);
    setSessionHistory([]);
    fetchHistory();
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
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Type your answer here... Be clear and detailed."
                      rows={8}
                      className="w-full bg-[#0f1629] border border-[#00d4ff]/30 rounded-lg px-4 py-3 text-white text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d4ff] resize-none"
                    />
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
                  {/* eslint-disable-next-line */}
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
