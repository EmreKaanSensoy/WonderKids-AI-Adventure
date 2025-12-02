import React, { useState, useEffect } from 'react';
import { AppScreen, Character } from './types';
import { StoryTime } from './components/StoryTime';
import { MagicCanvas } from './components/MagicCanvas';
import { VideoStudio } from './components/VideoStudio';
import { PuzzleGame } from './components/PuzzleGame';
import { Button } from './components/Button';

const characters: Character[] = [
  { id: '1', name: 'Robo-Beep', emoji: '🤖', description: 'Friendly Robot', color: 'bg-blue-100' },
  { id: '2', name: 'Rexy', emoji: '🦖', description: 'Happy Dino', color: 'bg-green-100' },
  { id: '3', name: 'Sparkles', emoji: '🦄', description: 'Magic Unicorn', color: 'bg-pink-100' },
  { id: '4', name: 'Zoomer', emoji: '🚀', description: 'Space Explorer', color: 'bg-purple-100' },
];

export default function App() {
  const [hasKey, setHasKey] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.HOME);
  const [selectedCharacter, setSelectedCharacter] = useState<Character>(characters[0]);

  const checkKey = async () => {
    // Cast window to any to avoid TypeScript errors with existing global types
    const win = window as any;
    if (win.aistudio && win.aistudio.hasSelectedApiKey) {
      const selected = await win.aistudio.hasSelectedApiKey();
      setHasKey(selected);
    } else {
      // Fallback for dev environments without the wrapper
      setHasKey(true); 
    }
  };

  useEffect(() => {
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    const win = window as any;
    if (win.aistudio && win.aistudio.openSelectKey) {
      await win.aistudio.openSelectKey();
      // Assume success as per guidelines
      setHasKey(true);
    }
  };

  if (!hasKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full">
          <h1 className="text-4xl font-black mb-4 text-gray-800">Welcome Parents!</h1>
          <p className="text-gray-600 mb-8 text-lg">
            To use the advanced AI features (Video & Image generation), please select a Google Cloud Project with billing enabled.
          </p>
          <Button onClick={handleSelectKey} size="lg" className="w-full">
            🔑 Unlock the Magic
          </Button>
          <p className="mt-4 text-xs text-gray-400">
            Check <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline">billing docs</a> for info.
          </p>
        </div>
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case AppScreen.STORY:
        return <StoryTime character={selectedCharacter} onHome={() => setCurrentScreen(AppScreen.HOME)} />;
      case AppScreen.VIDEO:
        return <VideoStudio onHome={() => setCurrentScreen(AppScreen.HOME)} />;
      case AppScreen.IMAGE_MAGIC:
        return <MagicCanvas onHome={() => setCurrentScreen(AppScreen.HOME)} />;
      case AppScreen.PUZZLE:
        return <PuzzleGame onHome={() => setCurrentScreen(AppScreen.HOME)} />;
      case AppScreen.HOME:
      default:
        return (
          <div className="min-h-screen bg-yellow-50 p-6 md:p-12">
            <header className="flex justify-between items-center mb-8">
               <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-full shadow-md text-3xl">🌟</div>
                  <h1 className="text-3xl md:text-5xl font-black text-gray-800 tracking-tight">WonderKids</h1>
               </div>
               <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border-2 border-yellow-200">
                  <span className="text-2xl">{selectedCharacter.emoji}</span>
                  <span className="font-bold text-gray-700 hidden md:block">Hi, {selectedCharacter.name}!</span>
               </div>
            </header>

            <main className="max-w-5xl mx-auto">
              {/* Character Selector */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-700 ml-2">Choose Your Buddy</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {characters.map(char => (
                    <button
                      key={char.id}
                      onClick={() => setSelectedCharacter(char)}
                      className={`p-4 rounded-3xl transition-all transform hover:scale-105 border-4 ${
                        selectedCharacter.id === char.id 
                          ? 'border-blue-500 bg-white shadow-xl scale-105' 
                          : 'border-transparent bg-white/60 hover:bg-white shadow-sm'
                      }`}
                    >
                      <div className="text-5xl mb-2">{char.emoji}</div>
                      <div className="font-bold text-gray-800">{char.name}</div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Activities Grid */}
              <h2 className="text-2xl font-bold mb-4 text-gray-700 ml-2">Let's Play!</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div onClick={() => setCurrentScreen(AppScreen.STORY)} className="cursor-pointer group">
                  <div className="bg-purple-100 p-8 rounded-3xl border-4 border-purple-200 group-hover:border-purple-400 group-hover:shadow-xl transition-all h-full flex items-center gap-6">
                    <div className="text-6xl group-hover:scale-110 transition-transform">📚</div>
                    <div>
                      <h3 className="text-2xl font-black text-purple-800">Story Time</h3>
                      <p className="text-purple-600 font-medium">Create stories & listen!</p>
                    </div>
                  </div>
                </div>

                <div onClick={() => setCurrentScreen(AppScreen.VIDEO)} className="cursor-pointer group">
                  <div className="bg-indigo-100 p-8 rounded-3xl border-4 border-indigo-200 group-hover:border-indigo-400 group-hover:shadow-xl transition-all h-full flex items-center gap-6">
                    <div className="text-6xl group-hover:scale-110 transition-transform">🎬</div>
                    <div>
                      <h3 className="text-2xl font-black text-indigo-800">Movie Maker</h3>
                      <p className="text-indigo-600 font-medium">Turn ideas into video!</p>
                    </div>
                  </div>
                </div>

                <div onClick={() => setCurrentScreen(AppScreen.IMAGE_MAGIC)} className="cursor-pointer group">
                  <div className="bg-pink-100 p-8 rounded-3xl border-4 border-pink-200 group-hover:border-pink-400 group-hover:shadow-xl transition-all h-full flex items-center gap-6">
                    <div className="text-6xl group-hover:scale-110 transition-transform">🎨</div>
                    <div>
                      <h3 className="text-2xl font-black text-pink-800">Magic Photo</h3>
                      <p className="text-pink-600 font-medium">Edit photos with magic!</p>
                    </div>
                  </div>
                </div>

                <div onClick={() => setCurrentScreen(AppScreen.PUZZLE)} className="cursor-pointer group">
                  <div className="bg-green-100 p-8 rounded-3xl border-4 border-green-200 group-hover:border-green-400 group-hover:shadow-xl transition-all h-full flex items-center gap-6">
                    <div className="text-6xl group-hover:scale-110 transition-transform">🕵️</div>
                    <div>
                      <h3 className="text-2xl font-black text-green-800">Secret Codes</h3>
                      <p className="text-green-600 font-medium">Solve the puzzles!</p>
                    </div>
                  </div>
                </div>

              </div>
            </main>
          </div>
        );
    }
  };

  return renderScreen();
}