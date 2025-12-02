import React, { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { Button } from './Button';
import { generatePuzzle, speakText } from '../services/gemini';
import { PuzzleData } from '../types';

interface PuzzleGameProps {
  onHome: () => void;
}

export const PuzzleGame: React.FC<PuzzleGameProps> = ({ onHome }) => {
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const loadPuzzle = async () => {
    setLoading(true);
    setFeedback(null);
    setPuzzle(null);
    speakText("Let me find a puzzle for you.");
    try {
      const data = await generatePuzzle();
      setPuzzle(data);
      // Wait a tiny bit for render then speak
      setTimeout(() => {
        speakText("Look at the pattern. What comes next?");
      }, 500);
    } catch (e) {
      console.error(e);
      speakText("I am confused. Let's try another one.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPuzzle();
  }, []);

  const handleAnswer = (index: number) => {
    if (!puzzle) return;
    if (index === puzzle.correctIndex) {
      setFeedback('correct');
      speakText("Yay! You are smart!");
    } else {
      setFeedback('wrong');
      speakText("Oops, try again!");
    }
  };

  return (
    <Layout 
      onHome={onHome} 
      title="Secret Codes" 
      icon="🕵️"
      color="bg-green-100"
    >
      <div className="flex flex-col items-center gap-6 max-w-2xl mx-auto">
        
        {loading && <div className="text-8xl animate-spin">🧩</div>}
        
        {!loading && puzzle && (
          <>
            <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-green-300 text-center w-full">
              <h2 className="text-2xl font-bold mb-4 text-green-800">What comes next?</h2>
              
              {/* Question Display (Big Emojis) */}
              <div className="text-5xl md:text-7xl mb-12 font-medium tracking-widest bg-green-50 p-6 rounded-2xl">
                  {puzzle.question}
              </div>
              
              {/* Options */}
              <div className="grid grid-cols-3 gap-4">
                {puzzle.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={feedback === 'correct'}
                    className={`text-6xl p-6 rounded-2xl border-b-8 transition-all active:translate-y-0 active:border-b-0 ${
                        feedback === 'correct' && idx === puzzle.correctIndex 
                        ? 'bg-green-500 border-green-700 scale-110 rotate-12'
                        : feedback === 'wrong' && feedback !== null
                        ? 'opacity-50 grayscale' 
                        : 'bg-white border-gray-200 hover:bg-green-50 hover:border-green-300 hover:-translate-y-2'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {feedback === 'correct' && (
              <div className="animate-bounce text-center">
                <div className="text-8xl mb-2">🎉</div>
                <Button onClick={loadPuzzle} variant="primary" size="lg">
                    Next Puzzle ➡️
                </Button>
              </div>
            )}
            
             {feedback === 'wrong' && (
              <div className="animate-shake text-center">
                 <h3 className="text-4xl">🤔</h3>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};