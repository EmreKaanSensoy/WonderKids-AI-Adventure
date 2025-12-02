import React, { useState, useRef, useEffect } from 'react';
import { Layout } from './Layout';
import { Button } from './Button';
import { editImage, speakText } from '../services/gemini';

interface MagicCanvasProps {
  onHome: () => void;
}

export const MagicCanvas: React.FC<MagicCanvasProps> = ({ onHome }) => {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      speakText("Magic Photo Lab! First, upload a picture.");
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const matches = result.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
            setMimeType(matches[1]);
            setImage(matches[2]);
            setEditedImage(null);
            speakText("Now choose a magic spell!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMagic = async (prompt: string, label: string) => {
    if (!image) return;
    setLoading(true);
    speakText(`Adding ${label} magic!`);
    try {
      const result = await editImage(image, prompt, mimeType);
      if (result) {
        setEditedImage(result);
        speakText("Ta-da! Look at that!");
      }
    } catch (e) {
      speakText("Oops, the magic fizzled out. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const spells = [
    { icon: '🌈', label: 'Rainbows', prompt: 'Add rainbows and sparkles everywhere' },
    { icon: '🖍️', label: 'Cartoon', prompt: 'Turn this into a colorful cartoon drawing' },
    { icon: '🦸', label: 'Hero', prompt: 'Add a superhero cape and mask to the character' },
    { icon: '❄️', label: 'Snow', prompt: 'Make it snowy and wintery' },
    { icon: '🤠', label: 'Cowboy', prompt: 'Add a cowboy hat' },
    { icon: '👽', label: 'Alien', prompt: 'Make it look like outer space with aliens' },
  ];

  return (
    <Layout 
      onHome={onHome} 
      title="Magic Photo" 
      icon="🎨"
      color="bg-pink-100"
    >
      <div className="flex flex-col gap-6 items-center max-w-4xl mx-auto">
        
        {/* Upload Section */}
        {!image && (
             <div className="w-full h-64 bg-white rounded-3xl shadow-lg border-4 border-dashed border-pink-300 flex flex-col items-center justify-center cursor-pointer hover:bg-pink-50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                <span className="text-8xl mb-4">📸</span>
                <span className="text-2xl font-bold text-pink-400">Touch to take a photo</span>
             </div>
        )}

        {/* Display Area */}
        {image && (
            <div className="flex flex-col md:flex-row gap-4 w-full justify-center items-center">
                <div className="relative group">
                    <img src={`data:${mimeType};base64,${image}`} alt="Original" className="rounded-3xl shadow-xl border-4 border-white max-h-64 object-contain" />
                    <button onClick={() => {setImage(null); setEditedImage(null);}} className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full shadow-lg font-bold">✖️</button>
                </div>

                {loading ? (
                    <div className="text-6xl animate-spin">🪄</div>
                ) : (
                    <div className="text-4xl text-pink-300 font-black">➡️</div>
                )}

                {editedImage ? (
                    <img src={editedImage} alt="Edited" className="rounded-3xl shadow-xl border-4 border-pink-400 max-h-80 object-contain animate-pop-in" />
                ) : (
                    <div className="w-64 h-64 bg-pink-50 rounded-3xl border-4 border-pink-200 flex items-center justify-center text-pink-200">
                        <span className="text-6xl">?</span>
                    </div>
                )}
            </div>
        )}

        {/* Spell Bar */}
        {image && !loading && (
            <div className="w-full">
                <h3 className="text-center text-2xl font-bold text-pink-600 mb-4">Pick a Spell</h3>
                <div className="flex flex-wrap justify-center gap-4">
                    {spells.map(spell => (
                        <button
                            key={spell.label}
                            onClick={() => handleMagic(spell.prompt, spell.label)}
                            className="flex flex-col items-center gap-2 bg-white p-4 rounded-2xl border-b-8 border-pink-200 hover:border-pink-400 hover:-translate-y-2 transition-all active:border-b-0 active:translate-y-0"
                        >
                            <span className="text-5xl">{spell.icon}</span>
                            {/* Visuals only for non-readers, but label kept for accessibility/parents */}
                        </button>
                    ))}
                </div>
            </div>
        )}
      </div>
    </Layout>
  );
};