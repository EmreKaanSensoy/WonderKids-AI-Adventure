import React, { useState, useRef, useEffect } from 'react';
import { Layout } from './Layout';
import { Button } from './Button';
import { generateVeoVideo, speakText } from '../services/gemini';

interface VideoStudioProps {
  onHome: () => void;
}

export const VideoStudio: React.FC<VideoStudioProps> = ({ onHome }) => {
  // Simple visual prompt builder
  const [selectedSubject, setSelectedSubject] = useState<string>('🐱');
  const [selectedAction, setSelectedAction] = useState<string>('💃');
  
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    speakText("Welcome to the Movie Maker! Choose a character and what they are doing.");
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Parse base64 and mime type correctly
        const matches = result.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
            setMimeType(matches[1]);
            setImage(matches[2]);
            speakText("Great photo!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    setVideoUrl(null);
    speakText("I am making your movie. Wait a moment!");
    
    // Construct prompt from emojis for the model
    // Mapping emojis to descriptive text for better generation
    const subjectMap: Record<string, string> = {
        '🐱': 'a cute fluffy cat',
        '🐶': 'a happy puppy',
        '🤖': 'a friendly robot',
        '🦖': 'a green dinosaur',
        '🦄': 'a magical unicorn',
        '👽': 'a funny alien'
    };
    const actionMap: Record<string, string> = {
        '💃': 'dancing happily',
        '🚀': 'flying in space',
        '⚽': 'playing soccer',
        '🏖️': 'relaxing on the beach',
        '🎸': 'playing a guitar',
        '🍕': 'eating pizza'
    };

    const finalPrompt = `A 3D cartoon style video of ${subjectMap[selectedSubject] || 'a character'} ${actionMap[selectedAction] || 'moving'}. Vibrant colors, high quality.`;

    try {
      const url = await generateVeoVideo(finalPrompt, image || undefined, mimeType, '16:9');
      setVideoUrl(url);
      speakText("Your movie is ready!");
    } catch (e) {
      console.error(e);
      speakText("Oh no, something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const subjects = ['🐱', '🐶', '🤖', '🦖', '🦄', '👽'];
  const actions = ['💃', '🚀', '⚽', '🏖️', '🎸', '🍕'];

  return (
    <Layout 
      onHome={onHome} 
      title="Movie Maker" 
      icon="🎬"
      color="bg-indigo-100"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Input Card */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border-4 border-indigo-200">
           
           {/* Step 1: Image (Optional) */}
           <div className="mb-8 text-center">
             <div 
                onClick={() => fileInputRef.current?.click()}
                className="mx-auto w-24 h-24 bg-indigo-50 border-4 border-dashed border-indigo-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-100 transition-all active:scale-95"
             >
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                {image ? (
                    <img src={`data:${mimeType};base64,${image}`} className="w-full h-full object-cover rounded-full" alt="Source" />
                ) : (
                    <span className="text-4xl">📸</span>
                )}
             </div>
             <p className="text-gray-400 font-bold mt-2">Add Photo?</p>
           </div>

           {/* Step 2: Visual Prompt Builder */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
             <div className="bg-indigo-50 p-4 rounded-3xl">
                <h3 className="text-center font-bold text-indigo-400 mb-2 uppercase tracking-wider">Who?</h3>
                <div className="grid grid-cols-3 gap-2">
                    {subjects.map(s => (
                        <button 
                            key={s}
                            onClick={() => { setSelectedSubject(s); speakText("Selected " + s); }}
                            className={`text-5xl p-4 rounded-2xl transition-all ${selectedSubject === s ? 'bg-white shadow-xl scale-110 border-4 border-indigo-400' : 'hover:bg-white/50 opacity-70'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
             </div>

             <div className="bg-indigo-50 p-4 rounded-3xl">
                <h3 className="text-center font-bold text-indigo-400 mb-2 uppercase tracking-wider">Doing What?</h3>
                <div className="grid grid-cols-3 gap-2">
                    {actions.map(a => (
                        <button 
                            key={a}
                            onClick={() => { setSelectedAction(a); speakText("Selected " + a); }}
                            className={`text-5xl p-4 rounded-2xl transition-all ${selectedAction === a ? 'bg-white shadow-xl scale-110 border-4 border-indigo-400' : 'hover:bg-white/50 opacity-70'}`}
                        >
                            {a}
                        </button>
                    ))}
                </div>
             </div>
           </div>

           {/* Step 3: GO Button */}
           <Button onClick={handleCreate} disabled={loading} size="lg" className="w-full text-3xl py-6 rounded-full shadow-[0_10px_0_rgb(0,0,0,0.2)]">
               {loading ? "✨ Magic Happening..." : "🎬 ACTION!"}
           </Button>
        </div>

        {/* Output */}
        {loading && (
            <div className="bg-white p-8 rounded-3xl text-center animate-pulse">
                <div className="text-8xl mb-4">🍿</div>
                <h3 className="text-2xl font-bold text-indigo-600">Cooking your movie...</h3>
            </div>
        )}

        {videoUrl && (
            <div className="bg-black p-4 rounded-3xl shadow-2xl border-4 border-indigo-600 animate-fade-in-up">
                <video 
                    src={videoUrl} 
                    controls 
                    autoPlay 
                    loop 
                    className="w-full rounded-xl"
                />
            </div>
        )}
      </div>
    </Layout>
  );
};