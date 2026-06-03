import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import StudentView from './components/StudentView';
import TeacherLogin from './components/TeacherLogin';
import TeacherDashboard from './components/TeacherDashboard';

type ViewState = 'home' | 'student' | 'login' | 'teacher';

function App() {
  const [view, setView] = useState<ViewState>('home');
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Check auth state on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && view === 'login') {
        setView('teacher');
      }
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, [view]);

  if (isAuthChecking) {
    return <div className="app-container"><div className="message loading">인증 정보를 확인 중입니다...</div></div>;
  }

  const renderView = () => {
    switch (view) {
      case 'student':
        return <StudentView onBack={() => setView('home')} />;
      case 'login':
        return <TeacherLogin onBack={() => setView('home')} onLoginSuccess={() => setView('teacher')} />;
      case 'teacher':
        return <TeacherDashboard onLogout={() => setView('home')} />;
      case 'home':
      default:
        return (
          <div className="home-container">
            <h1>🌈 내 마음 알리미</h1>
            <p className="home-subtitle">반갑습니다! 어떻게 오셨나요?</p>
            
            <div className="entry-buttons">
              <button 
                className="btn btn-primary entry-btn student-btn"
                onClick={() => setView('student')}
              >
                👦👧 학생 입장
              </button>
              
              <button 
                className="btn btn-secondary entry-btn teacher-btn"
                onClick={() => {
                  // If already logged in, go straight to dashboard
                  if (auth.currentUser) {
                    setView('teacher');
                  } else {
                    setView('login');
                  }
                }}
              >
                👨‍🏫 선생님 입장
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`app-container ${view === 'teacher' ? 'dashboard-layout' : ''}`}>
      {renderView()}
    </div>
  );
}

export default App;
