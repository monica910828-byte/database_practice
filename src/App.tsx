import React, { useState, useRef } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import EmotionSelector, { type Emotion } from './components/EmotionSelector';
import DrawingCanvas, { type DrawingCanvasHandle } from './components/DrawingCanvas';

function App() {
  const [name, setName] = useState('');
  const [emotion, setEmotion] = useState<Emotion | null>(null);
  const canvasRef = useRef<DrawingCanvasHandle>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'loading', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setMessage({ type: 'error', text: '이름을 입력해주세요!' });
      return;
    }
    if (!emotion) {
      setMessage({ type: 'error', text: '기분을 선택해주세요!' });
      return;
    }
    if (!canvasRef.current || canvasRef.current.isEmpty()) {
      setMessage({ type: 'error', text: '마음속 기분을 그려주세요!' });
      return;
    }

    const imageData = canvasRef.current.getImageData();
    if (!imageData) {
      setMessage({ type: 'error', text: '그림을 가져오는데 실패했습니다.' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: 'loading', text: '소중한 마음을 저장하는 중이에요...' });

    try {
      // 1. Upload Image to Storage
      const filename = `emotions/${Date.now()}_${name}.jpg`;
      const storageRef = ref(storage, filename);
      await uploadString(storageRef, imageData, 'data_url');
      const imageUrl = await getDownloadURL(storageRef);

      // 2. Save data to Firestore
      await addDoc(collection(db, 'emotion_logs'), {
        studentName: name,
        emotion: emotion,
        imageUrl: imageUrl,
        createdAt: serverTimestamp(),
      });

      setMessage({ type: 'success', text: '성공적으로 저장되었어요! 참 잘했어요 🌟' });
      
      // Reset form
      setName('');
      setEmotion(null);
      canvasRef.current.clear();
      
      // Clear success message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
      
    } catch (error) {
      console.error("Error saving data:", error);
      setMessage({ type: 'error', text: '저장 중 오류가 발생했어요. 선생님께 알려주세요!' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      <h1>🌈 내 마음 알리미</h1>
      
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="input-group">
            <label htmlFor="studentName">이름이 무엇인가요?</label>
            <input
              type="text"
              id="studentName"
              placeholder="이름을 입력해주세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <EmotionSelector 
          selectedEmotion={emotion} 
          onSelect={isSubmitting ? () => {} : setEmotion} 
        />
        
        <div style={{ marginTop: '2rem' }}>
          <DrawingCanvas ref={canvasRef} />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? '저장 중...' : '제출하기'}
        </button>
      </form>
    </div>
  );
}

export default App;
