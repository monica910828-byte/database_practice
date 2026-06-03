import React from 'react';

export type Emotion = '행복' | '평온' | '불안' | '슬픔' | '화남' | '피곤';

interface EmotionOption {
  value: Emotion;
  emoji: string;
}

const emotions: EmotionOption[] = [
  { value: '행복', emoji: '😊' },
  { value: '평온', emoji: '😌' },
  { value: '불안', emoji: '😰' },
  { value: '슬픔', emoji: '😢' },
  { value: '화남', emoji: '😡' },
  { value: '피곤', emoji: '🥱' },
];

interface EmotionSelectorProps {
  selectedEmotion: Emotion | null;
  onSelect: (emotion: Emotion) => void;
}

const EmotionSelector: React.FC<EmotionSelectorProps> = ({ selectedEmotion, onSelect }) => {
  return (
    <div className="card">
      <div className="input-group">
        <label>지금 기분이 어때요?</label>
        <div className="emotion-grid">
          {emotions.map((emotion) => (
            <div
              key={emotion.value}
              className={`emotion-card ${selectedEmotion === emotion.value ? 'selected' : ''}`}
              onClick={() => onSelect(emotion.value)}
            >
              <span className="emotion-emoji">{emotion.emoji}</span>
              <span className="emotion-label">{emotion.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmotionSelector;
