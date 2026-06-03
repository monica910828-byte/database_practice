import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import StudentView from './components/StudentView';
import TeacherDashboard from './components/TeacherDashboard';

type ViewState = 'home' | 'student' | 'teacher';

function App() {
  const [view, setView] = useState<ViewState>('home');
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Check auth state on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google Login Error:", error);
      alert("로그인 중 오류가 발생했습니다.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setView('home');
  };

  if (isAuthChecking) {
    return <div className="app-container"><div className="message loading">인증 정보를 확인 중입니다...</div></div>;
  }

  // If not logged in, show login button
  if (!user) {
    return (
      <div className="home-container">
        <h1>🌈 내 마음 알리미</h1>
        <p className="home-subtitle">반갑습니다! 로그인을 먼저 해주세요.</p>
        <button className="btn btn-primary" onClick={handleGoogleLogin}>
          Google 계정으로 시작하기
        </button>
      </div>
    );
  }

  // Teacher check
  const isTeacher = user.uid === import.meta.env.VITE_TEACHER_UID;

  const renderView = () => {
    switch (view) {
      case 'student':
        return <StudentView onBack={() => setView('home')} />;
      case 'teacher':
        return <TeacherDashboard onLogout={handleLogout} />;
      case 'home':
      default:
        return (
          <div className="home-container">
            <h1>🌈 내 마음 알리미</h1>
            <p className="home-subtitle">환영합니다, {user.displayName}님!</p>
            
            <div className="entry-buttons">
              <button 
                className="btn btn-primary entry-btn student-btn"
                onClick={() => setView('student')}
              >
                👦👧 학생 입장
              </button>
              
              {isTeacher && (
                <button 
                  className="btn btn-secondary entry-btn teacher-btn"
                  onClick={() => setView('teacher')}
                >
                  👨‍🏫 선생님 입장
                </button>
              )}
            </div>

            <button 
              className="btn btn-secondary" 
              style={{ marginTop: '2rem', padding: '0.5rem 1rem', fontSize: '1rem', background: 'transparent', border: '1px solid #ccc' }} 
              onClick={handleLogout}
            >
              로그아웃
            </button>
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
