import { useState, useEffect } from 'react';
import { SchoolDashboard } from './components/school/SchoolDashboard';
import { CollegeDashboard } from './components/college/CollegeDashboard';
import { LessonView } from './components/child/LessonView';
import { TextSummarizer } from './components/child/TextSummarizer';
import { PatternGame } from './components/child/PatternGame';
import { MemoryGame } from './components/child/MemoryGame';
import { DoubtClearing } from './components/child/DoubtClearing';
import { QuizGenerator } from './components/child/QuizGenerator';
import { ParentLogin } from './components/parent/LoginScreen';
import { ParentDashboard } from './components/parent/ParentDashboard';
import { StudentAuth } from './components/auth/StudentAuth';
import { StudentTypeSelection } from './components/auth/StudentTypeSelection';
import { GlobalAIAssistant } from './components/GlobalAIAssistant';
import { FirstTimeSetup } from './components/FirstTimeSetup';
import { LogOut } from 'lucide-react';

type View = 'auth' | 'student-type-selection' | 'child-dashboard' | 'lesson' | 'text-summarizer' | 'pattern-game' | 'memory-game' | 'doubt-clearing' | 'quiz-generator' | 'parent-login' | 'parent-dashboard';

interface UserData {
  name: string;
  email: string;
  studentType?: 'school' | 'college';
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>(() => {
    // Check if user is already authenticated
    const authToken = localStorage.getItem('todai_auth_token');
    return authToken ? 'child-dashboard' : 'auth';
  });
  const [isParentMode, setIsParentMode] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(() => {
    const storedUser = localStorage.getItem('todai_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Show helpful console message on app load
  useEffect(() => {
    const hasShownMessage = sessionStorage.getItem('todai_welcome_shown');
    
    if (!hasShownMessage) {
      console.log(
        '%c🎓 Welcome to Tod AI! 🚀',
        'font-size: 24px; font-weight: bold; color: #667eea; padding: 10px;'
      );
      console.log(
        '%c📝 To use AI features, you need to set up the Gemini API:',
        'font-size: 16px; color: #764ba2; padding: 5px;'
      );
      console.log(
        '%c1️⃣ Open "api-setup-guide.html" in your browser\n' +
        '2️⃣ Follow the setup steps\n' +
        '3️⃣ Enable the Generative Language API\n' +
        '4️⃣ Test your API key\n' +
        '5️⃣ Save it to Tod AI',
        'font-size: 14px; color: #333; padding: 5px; line-height: 1.8;'
      );
      console.log(
        '%c📖 Read START_HERE.md for detailed instructions',
        'font-size: 14px; color: #10b981; padding: 5px;'
      );
      console.log(
        '%c🔑 Demo Login: student@todai.com / demo123',
        'font-size: 14px; color: #f59e0b; padding: 5px;'
      );
      
      sessionStorage.setItem('todai_welcome_shown', 'true');
    }
  }, []);

  const handleAuthSuccess = (user: UserData) => {
    setUserData(user);
    localStorage.setItem('todai_user', JSON.stringify(user));
    setCurrentView('student-type-selection');
  };

  const handleLogout = () => {
    localStorage.removeItem('todai_auth_token');
    setUserData(null);
    setIsParentMode(false);
    setCurrentView('auth');
  };

  const handleParentLogin = (success: boolean) => {
    if (success) {
      setIsParentMode(true);
      setCurrentView('parent-dashboard');
    }
  };

  const switchToParentMode = () => {
    setCurrentView('parent-login');
  };

  const switchToChildMode = () => {
    setIsParentMode(false);
    setCurrentView('child-dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Top Controls - Fixed in corner */}
      {currentView !== 'auth' && currentView !== 'student-type-selection' && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
          {/* User Info & Logout */}
          {userData && currentView !== 'parent-login' && currentView !== 'parent-dashboard' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md">
              <span className="text-sm text-gray-700">Hi, {userData.name.split(' ')[0]}!</span>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* Mode Toggle */}
          {!isParentMode ? (
            <button
              onClick={switchToParentMode}
              className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all text-sm text-gray-600 hover:text-gray-900"
            >
              Parent View
            </button>
          ) : (
            <button
              onClick={switchToChildMode}
              className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all text-sm text-gray-600 hover:text-gray-900"
            >
              Student View
            </button>
          )}
        </div>
      )}

      {/* Render appropriate view */}
      {currentView === 'auth' && (
        <StudentAuth onAuthSuccess={handleAuthSuccess} />
      )}
      
      {currentView === 'student-type-selection' && userData && (
        <StudentTypeSelection
          userName={userData.name}
          onSelect={(type) => {
            const updatedUser = { ...userData, studentType: type };
            setUserData(updatedUser);
            localStorage.setItem('todai_user', JSON.stringify(updatedUser));
            setCurrentView('child-dashboard');
          }}
        />
      )}
      
      {currentView === 'child-dashboard' && userData && (
        userData.studentType === 'school' ? (
          <SchoolDashboard onNavigate={setCurrentView} />
        ) : (
          <CollegeDashboard onNavigate={setCurrentView} />
        )
      )}
      
      {currentView === 'lesson' && (
        <LessonView onBack={() => setCurrentView('child-dashboard')} />
      )}
      
      {currentView === 'text-summarizer' && (
        <TextSummarizer onBack={() => setCurrentView('child-dashboard')} />
      )}
      
      {currentView === 'pattern-game' && (
        <PatternGame onBack={() => setCurrentView('child-dashboard')} />
      )}
      
      {currentView === 'memory-game' && (
        <MemoryGame onBack={() => setCurrentView('child-dashboard')} />
      )}
      
      {currentView === 'doubt-clearing' && (
        <DoubtClearing onBack={() => setCurrentView('child-dashboard')} />
      )}
      
      {currentView === 'quiz-generator' && (
        <QuizGenerator onBack={() => setCurrentView('child-dashboard')} />
      )}
      
      {currentView === 'parent-login' && (
        <ParentLogin 
          onLogin={handleParentLogin}
          onBack={() => setCurrentView('child-dashboard')}
        />
      )}
      
      {currentView === 'parent-dashboard' && (
        <ParentDashboard onBack={() => setCurrentView('child-dashboard')} />
      )}

      {/* Global AI Assistant - Available on all screens except auth */}
      {currentView !== 'auth' && currentView !== 'student-type-selection' && userData && (
        <GlobalAIAssistant
          currentContext={currentView}
          userName={userData.name}
          studentType={userData.studentType}
        />
      )}

      {/* First Time Setup Modal */}
      {currentView !== 'auth' && <FirstTimeSetup />}
    </div>
  );
}