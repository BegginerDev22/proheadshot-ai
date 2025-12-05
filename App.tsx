import React, { useState, useRef, useCallback } from 'react';
import { AppState, StyleOption } from './types';
import { generateHeadshot } from './services/gemini';
import { Button } from './components/Button';
import { StyleCard } from './components/StyleCard';

// Icons
const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
);
const BuildingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M16 18h.01"/></svg>
);
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/></svg>
);
const BriefcaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
);
const WandIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h0"/><path d="M17.8 6.2 19 5"/><path d="M3 21l9-9"/><path d="M12.2 6.2 11 5"/></svg>
);
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);
const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
);
const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);

const STYLES: StyleOption[] = [
  {
    id: 'corporate',
    name: 'Corporate Studio',
    description: 'Professional grey backdrop, suit/business attire, studio lighting.',
    prompt: 'Change the background to a professional solid dark grey studio backdrop. Change the outfit to a high-end charcoal business suit and white shirt. Ensure clean, even studio lighting with a rim light effect.',
    icon: <BriefcaseIcon />,
  },
  {
    id: 'tech',
    name: 'Modern Tech Office',
    description: 'Blurred modern office, smart casual, bright and airy.',
    prompt: 'Change the background to a blurred, modern open-plan tech office with glass walls. Change the outfit to smart casual business attire (e.g., a navy blazer over a crisp t-shirt or modern shirt). Bright, natural, soft lighting.',
    icon: <BuildingIcon />,
  },
  {
    id: 'outdoor',
    name: 'Outdoor Natural',
    description: 'Golden hour city park, warm tones, relaxed professional.',
    prompt: 'Change the background to a soft-focus city park background during golden hour with beautiful bokeh. Change the outfit to professional but approachable layered clothing. Warm, golden natural lighting.',
    icon: <SunIcon />,
  },
  {
    id: 'custom',
    name: 'Custom Edit',
    description: 'Describe your own background and style.',
    prompt: '', // Will be filled by user
    icon: <WandIcon />,
  },
];

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StyleOption>(STYLES[0]);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size too large. Please select an image under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setError(null);
        setGeneratedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;

    setAppState(AppState.GENERATING);
    setError(null);

    const finalPrompt = selectedStyle.id === 'custom' ? customPrompt : selectedStyle.prompt;

    if (selectedStyle.id === 'custom' && !finalPrompt.trim()) {
      setError("Please enter a description for your custom style.");
      setAppState(AppState.IDLE);
      return;
    }

    try {
      // Basic MIME type detection from base64 string
      const match = selectedImage.match(/^data:(image\/[a-zA-Z]+);base64,/);
      const mimeType = match ? match[1] : 'image/jpeg';

      const result = await generateHeadshot(selectedImage, mimeType, finalPrompt);
      setGeneratedImage(result);
      setAppState(AppState.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate image. Please try again.");
      setAppState(AppState.ERROR);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `pro-headshot-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
              <CameraIcon />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              ProHeadshot AI
            </h1>
          </div>
          <div className="text-sm text-gray-400 hidden sm:block">
            Powered by Gemini 2.5 Flash
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-center gap-3">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* LEFT COLUMN: Controls & Input */}
          <div className="space-y-8">
            
            {/* 1. Upload Section */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="bg-gray-700 text-xs px-2 py-1 rounded text-gray-300">Step 1</span>
                Upload Selfie
              </h2>
              
              <div 
                onClick={triggerFileUpload}
                className={`relative group border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer overflow-hidden ${
                  selectedImage 
                    ? 'border-indigo-500/50 bg-gray-800/50' 
                    : 'border-gray-600 hover:border-indigo-400 hover:bg-gray-800/80 bg-gray-800/30'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  accept="image/*" 
                  className="hidden" 
                />
                
                {selectedImage ? (
                  <div className="relative h-64 w-full flex items-center justify-center">
                    <img 
                      src={selectedImage} 
                      alt="Selected" 
                      className="max-h-full max-w-full object-contain rounded-lg shadow-lg" 
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                      <span className="flex items-center gap-2 text-white font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                        <RefreshIcon /> Change Image
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                    <div className="bg-gray-700/50 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                      <UploadIcon />
                    </div>
                    <p className="text-lg font-medium text-gray-300">Click to upload a casual selfie</p>
                    <p className="text-sm mt-2 text-gray-500">JPG, PNG, WEBP up to 5MB</p>
                  </div>
                )}
              </div>
            </section>

            {/* 2. Style Selection */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="bg-gray-700 text-xs px-2 py-1 rounded text-gray-300">Step 2</span>
                Choose Style
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {STYLES.map(style => (
                  <StyleCard 
                    key={style.id} 
                    styleOption={style} 
                    isSelected={selectedStyle.id === style.id}
                    onSelect={setSelectedStyle}
                  />
                ))}
              </div>

              {/* Custom Prompt Input */}
              <div className={`transition-all duration-300 overflow-hidden ${selectedStyle.id === 'custom' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g. 'Add a retro filter' or 'Remove the person in the background'..."
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-24"
                />
              </div>
            </section>

            {/* Generate Action */}
            <div className="pt-4 sticky bottom-6 z-30">
              <Button 
                onClick={handleGenerate} 
                disabled={!selectedImage || (selectedStyle.id === 'custom' && !customPrompt)}
                isLoading={appState === AppState.GENERATING}
                className="w-full py-4 text-lg shadow-lg shadow-indigo-500/20"
              >
                {appState === AppState.GENERATING ? 'Generating Headshot...' : 'Generate Professional Headshot'}
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN: Results */}
          <div className="space-y-4 min-h-[500px]">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="bg-gray-700 text-xs px-2 py-1 rounded text-gray-300">Result</span>
              Professional Headshot
            </h2>

            <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl h-full min-h-[500px] flex items-center justify-center relative overflow-hidden">
              {appState === AppState.GENERATING && (
                <div className="absolute inset-0 z-20 bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <WandIcon />
                    </div>
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-white">AI is working its magic...</h3>
                  <p className="mt-2 text-gray-400 max-w-xs">Enhancing lighting, changing background, and upgrading wardrobe.</p>
                </div>
              )}

              {generatedImage ? (
                <div className="relative w-full h-full p-4 flex flex-col items-center">
                   {/* Comparison View (Simple toggle or side-by-side logic could go here, but simple result is robust) */}
                   <img 
                      src={generatedImage} 
                      alt="AI Generated Headshot" 
                      className="max-w-full max-h-[600px] object-contain rounded-lg shadow-2xl border border-gray-700"
                   />
                   
                   <div className="mt-6 flex flex-wrap gap-4 justify-center">
                      <Button onClick={handleDownload} variant="primary" className="flex items-center gap-2">
                        <DownloadIcon /> Download Image
                      </Button>
                      <Button onClick={() => setGeneratedImage(null)} variant="secondary" className="flex items-center gap-2">
                        <RefreshIcon /> Start Over
                      </Button>
                   </div>
                </div>
              ) : (
                <div className="text-center p-12 text-gray-500 max-w-sm">
                   <div className="bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                      <CameraIcon />
                   </div>
                   <h3 className="text-lg font-medium text-gray-300 mb-2">No Headshot Yet</h3>
                   <p>Upload your selfie and select a style to generate your professional profile picture.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
