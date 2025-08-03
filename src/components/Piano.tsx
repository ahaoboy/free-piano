import React, { useEffect, useState } from 'react';
import Notes from '../notes';
import './Piano.css';

interface Note {
  id: number;
  name: string;
  keyCode: string;
  key: string;
  url: string;
  type: string;
}

const Piano: React.FC = () => {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play().catch(err => {
      console.error("播放失败:", err);
    });
  };

  const handleKeyDown = (note: Note) => {
    if (!pressedKeys.has(note.keyCode)) {
      setPressedKeys(prev => new Set([...prev, note.keyCode]));
      playAudio(note.url);
    }
  };

  const handleKeyUp = (keyCode: string) => {
    setPressedKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(keyCode);
      return newSet;
    });
  };

  const handleMouseDown = (note: Note) => {
    handleKeyDown(note);
  };

  const handleMouseUp = (note: Note) => {
    handleKeyUp(note.keyCode);
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      let keyCode = e.keyCode.toString();
      
      // 处理黑键 (Shift + 白键)
      if (e.shiftKey) {
        keyCode = 'b' + e.keyCode.toString();
      }
      
      const note = Notes.find(n => n.keyCode === keyCode);
      if (note) {
        e.preventDefault();
        handleKeyDown(note);
      }
    };

    const handleGlobalKeyUp = (e: KeyboardEvent) => {
      let keyCode = e.keyCode.toString();
      
      // 处理黑键 (Shift + 白键)
      if (e.shiftKey) {
        keyCode = 'b' + e.keyCode.toString();
      }
      
      const note = Notes.find(n => n.keyCode === keyCode);
      if (note) {
        e.preventDefault();
        handleKeyUp(note.keyCode);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    document.addEventListener('keyup', handleGlobalKeyUp);

    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
      document.removeEventListener('keyup', handleGlobalKeyUp);
    };
  }, [pressedKeys]);

  // Separate white and black keys
  const whiteKeys = Notes.filter(note => note.type === 'white');
  const blackKeys = Notes.filter(note => note.type === 'black');

  // Calculate black key positions based on white key positions
  const getBlackKeyPosition = (blackKey: Note) => {
    const whiteKeyIndex = whiteKeys.findIndex(whiteKey => {
      // Find the white key that comes before this black key
      const blackKeyName = blackKey.name;
      const whiteKeyName = whiteKey.name;
      
      // Map black keys to their corresponding white key positions
      const blackToWhiteMap: { [key: string]: number } = {
        'C#2': 0, 'D#2': 1, 'F#2': 3, 'G#2': 4, 'A#2': 5,
        'C#3': 7, 'D#3': 8, 'F#3': 10, 'G#3': 11, 'A#3': 12,
        'C#4': 14, 'D#4': 15, 'F#4': 17, 'G#4': 18, 'A#4': 19,
        'C#5': 21, 'D#5': 22, 'F#5': 24, 'G#5': 25, 'A#5': 26,
        'C#6': 28, 'D#6': 29, 'F#6': 31, 'G#6': 32, 'A#6': 33
      };
      
      return blackToWhiteMap[blackKeyName] === whiteKeys.indexOf(whiteKey);
    });
    
    if (whiteKeyIndex !== -1) {
      return whiteKeyIndex * 62 - 20; // 62px per white key (60px width + 2px margin)
    }
    return 0;
  };

  return (
    <div className="piano-container">
      <div className="piano">
        {/* Piano keys container with relative positioning */}
        <div className="piano-keys">
          {/* White keys */}
          <div className="white-keys">
            {whiteKeys.map((note) => (
              <div
                key={note.id}
                className={`white-key ${pressedKeys.has(note.keyCode) ? 'pressed' : ''}`}
                onMouseDown={() => handleMouseDown(note)}
                onMouseUp={() => handleMouseUp(note)}
                onMouseLeave={() => handleMouseUp(note)}
              >
                <div className="key-label" dangerouslySetInnerHTML={{ __html: note.key }} />
                <div className="note-name">{note.name}</div>
              </div>
            ))}
          </div>
          
          {/* Black keys positioned absolutely */}
          <div className="black-keys">
            {blackKeys.map((note) => (
              <div
                key={note.id}
                className={`black-key ${pressedKeys.has(note.keyCode) ? 'pressed' : ''}`}
                style={{ left: `${getBlackKeyPosition(note)}px` }}
                onMouseDown={() => handleMouseDown(note)}
                onMouseUp={() => handleMouseUp(note)}
                onMouseLeave={() => handleMouseUp(note)}
              >
                <div className="key-label" dangerouslySetInnerHTML={{ __html: note.key }} />
                <div className="note-name">{note.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="piano-info">
        <h2>虚拟钢琴</h2>
        <p>使用键盘或鼠标点击来演奏钢琴</p>
        <div className="instructions">
          <h3>键盘映射:</h3>
          <p>白键: 数字键 1-0, 字母键 A-Z</p>
          <p>黑键: Shift + 对应的白键</p>
        </div>
      </div>
    </div>
  );
};

export default Piano; 