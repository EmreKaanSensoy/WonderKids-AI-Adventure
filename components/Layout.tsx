import React from 'react';
import { AppScreen } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  onHome: () => void;
  title: string;
  icon: string;
  color: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, onHome, title, icon, color }) => {
  return (
    <div className={`min-h-screen ${color} flex flex-col`}>
      <header className="p-4 flex items-center justify-between bg-white/30 backdrop-blur-md sticky top-0 z-50 border-b-4 border-black/10">
        <div className="flex items-center gap-3">
          <span className="text-4xl filter drop-shadow-lg">{icon}</span>
          <h1 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">{title}</h1>
        </div>
        <button 
          onClick={onHome}
          className="bg-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
          aria-label="Go Home"
        >
          🏠
        </button>
      </header>
      <main className="flex-1 container mx-auto p-4 md:p-8 max-w-5xl">
        {children}
      </main>
    </div>
  );
};