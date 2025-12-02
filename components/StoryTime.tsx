import React, { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { Button } from './Button';
import { generateStory, speakText } from '../services/gemini';
import { Character } from '../types';

interface StoryTimeProps {
  onHome: () => void;
  character: Character;
}

export const StoryTime: React.FC<StoryTimeProps> = ({ onHome, character }) => {
  const [theme, setTheme] = useState('');
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      speakText(`Hi! I am ${character.name}. Pick a picture to hear a story!`);
  }, [character.name]);

  const handleGenerate = async (selectedTheme: string, themeLabel: string) => {
    setTheme(selectedTheme);
    setLoading(true);
    setStory('');
    speakText("Thinking of a story...");
    try {
      const newStory = await generateStory(character.name, themeLabel);
      setStory(newStory);
      await speakText(newStory);
    } catch (e) {
      console.error(e);
      speakText("I forgot the story. Can we try again?");
    } finally {
      setLoading(false);
    }
  };

  const themes = [
      { icon: '🚀', label: "Space" },
      { icon: '🦖', label: "Dinosaurs" },
      { icon: '🍦', label: "Ice Cream" },
      { icon: '🧙‍♀️', label: "Magic" },
      { icon: '🐙', label: "Ocean" },
      { icon: '🏰', label: "Castle" }
  ];

  return (
    <Layout 
      onHome={onHome} 
      title="Story Time" 
      icon="📚"
      color="bg-purple-100"
    >
      <div className="flex flex-col items-center gap-8 max-w-4xl mx-auto">
        
        {/* Character Header */}
        <div className="text-center animate-bounce">
            <span className="text-8xl filter drop-shadow-xl">{character.emoji}</span>
        </div>

        {/* Theme Grid */}
        {!story && !loading && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full">
                {themes.map(t => (
                <button
                    key={t.label}
                    onClick={() => handleGenerate(t.icon, t.label)}
                    className="bg-white p-6 rounded-3xl border-b-8 border-purple-200 hover:border-purple-400 hover:-translate-y-2 transition-all active:border-b-0 active:translate-y-0 flex flex-col items-center"
                >
                    <span className="text-6xl mb-2">{t.icon}</span>
                </button>
                ))}
            </div>
        )}

        {/* Loading State */}
        {loading && (
             <div className="text-4xl font-bold text-purple-600 animate-pulse">
                 📖 Reading...
             </div>
        )}

        {/* Story Display */}
        {story && (
          <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-yellow-300 relative w-full animate-fade-in-up text-center">
            <div className="text-6xl mb-4">{theme}</div>
            <p className="text-2xl md:text-3xl leading-relaxed font-medium text-gray-700 font-sans">
              {story}
            </p>
            <div className="mt-8 flex justify-center gap-4">
                <Button onClick={() => speakText(story)} variant="success" size="lg">
                    🔊 Listen Again
                </Button>
                <Button onClick={() => setStory('')} variant="secondary" size="lg">
                    🔄 New Story
                </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};