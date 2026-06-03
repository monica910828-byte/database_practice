import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { db, auth } from '../firebase';
import { type Emotion } from './EmotionSelector';

interface EmotionLog {
  id: string;
  studentName: string;
  emotion: Emotion;
  imageUrl: string;
  createdAt: any;
}

interface TeacherDashboardProps {
  onLogout: () => void;
}

const COLORS: Record<Emotion, string> = {
  '행복': '#FFD700',
  '평온': '#98FB98',
  '불안': '#DDA0DD',
  '슬픔': '#87CEFA',
  '화남': '#FF6347',
  '피곤': '#D3D3D3',
};

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onLogout }) => {
  const [logs, setLogs] = useState<EmotionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const q = query(collection(db, 'emotion_logs'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedLogs: EmotionLog[] = [];
        querySnapshot.forEach((doc) => {
          fetchedLogs.push({ id: doc.id, ...doc.data() } as EmotionLog);
        });
        setLogs(fetchedLogs);
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    onLogout();
  };

  // Prepare data for chart
  const emotionCounts = logs.reduce((acc, log) => {
    acc[log.emotion] = (acc[log.emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(COLORS).map(emotion => ({
    name: emotion,
    count: emotionCounts[emotion] || 0
  }));

  if (loading) {
    return <div className="message loading">데이터를 불러오는 중입니다...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>📊 선생님 대시보드</h1>
        <button className="btn btn-secondary" onClick={handleLogout}>로그아웃</button>
      </header>

      <div className="dashboard-grid">
        {/* Left Side: Statistics */}
        <div className="card stat-card">
          <h2>오늘의 감정 통계</h2>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as Emotion] || '#ccc'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side: Gallery */}
        <div className="card gallery-card">
          <h2>학생들의 마음 갤러리</h2>
          <div className="gallery-grid">
            {logs.length === 0 ? (
              <p>아직 제출된 그림이 없습니다.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="gallery-item">
                  <img src={log.imageUrl} alt={`${log.studentName}의 그림`} loading="lazy" />
                  <div className="gallery-info">
                    <strong>{log.studentName}</strong>
                    <span className="emotion-badge" style={{ backgroundColor: COLORS[log.emotion] }}>
                      {log.emotion}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
