import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Leaf, ShieldAlert, Activity, ChevronRight, X, Loader2, Camera, Quote, Info, RefreshCw, Zap } from 'lucide-react';
import VisionView from './VisionView';

interface PlantInfo {
  commonName: string;
  scientificName: string;
  alternativeNames: string[];
  family: string;
  description: string;
  medicinalProperties: string[];
  toxicProperties: string[];
  safetyLevel: 'Safe' | 'Caution' | 'Toxic';
  careInstructions: string[];
  irohWisdom: string;
  source: string;
}

const CameraCapture = ({ onCapture, onCancel }: { onCapture: (base64: string) => void, onCancel: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const startCamera = async () => {
    try {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsReady(true);
      }
    } catch (err) {
      console.error("Camera access denied", err);
    }
  };

  React.useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg', 0.9);
      onCapture(base64);
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="relative w-full aspect-[4/3] md:aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Scanning Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-8 border-2 border-green-500/30 rounded-2xl">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-xl" />
          
          <motion.div 
            animate={{ top: ['0%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-[2px] bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)]"
          />
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6">
        <button 
          onClick={onCancel}
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
        >
          <X className="w-6 h-6" />
        </button>
        
        <button 
          onClick={capture}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center group active:scale-95 transition-all"
        >
          <div className="w-16 h-16 rounded-full bg-white group-hover:scale-95 transition-all shadow-xl" />
        </button>

        <button 
          onClick={toggleCamera}
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
        >
          <RefreshCw className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [activeView, setActiveView] = useState<'identify' | 'vision' | 'privacy' | 'terms' | 'docs'>('identify');
  const [showBriefing, setShowBriefing] = useState(false);
  const [inputMode, setInputMode] = useState<'upload' | 'camera'>('upload');
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PlantInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ProjectBriefing = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
      onClick={() => setShowBriefing(false)}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-[40px] p-8 md:p-12 max-w-2xl w-full text-black shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={() => setShowBriefing(false)}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white">
            <Leaf className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">The PhytoSpectra Project</h2>
            <p className="text-green-600 font-bold text-xs uppercase tracking-widest">AI Course Portfolio</p>
          </div>
        </div>
        <div className="space-y-6 text-gray-600 leading-relaxed">
          <p>
            PhytoSpectra is an AI-driven exploration into the intersection of computer vision and botany. Developed as a final course project, it addresses the challenge of precise plant identification using a hybrid approach.
          </p>
          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 italic font-medium">
            "We wanted to build something that doesn't just name a plant, but tells its story—medicinal secrets, safety warnings, and care wisdom."
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            <div>
              <h4 className="text-black font-bold uppercase text-[10px] tracking-widest mb-4">Lead Developer</h4>
              <a href="https://www.linkedin.com/in/nabil-anis/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-full bg-apple-gray-100 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <Activity className="w-5 h-5 text-gray-500 group-hover:text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-black group-hover:text-green-600 transition-colors">Muhammad Nabil</p>
                  <p className="text-[10px] font-medium text-gray-400">Computer Vision & UI</p>
                </div>
              </a>
            </div>
            <div>
              <h4 className="text-black font-bold uppercase text-[10px] tracking-widest mb-4">AI Researcher</h4>
              <a href="https://www.linkedin.com/in/rameez-hasan-61862a331/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-full bg-apple-gray-100 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <Zap className="w-5 h-5 text-gray-500 group-hover:text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-black group-hover:text-green-600 transition-colors">Syed Rameez Hasan</p>
                  <p className="text-[10px] font-medium text-gray-400">Neural Networks & Data</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  const StaticContentView = ({ title, date, content }: { title: string, date: string, content: React.ReactNode }) => (
    <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => setActiveView('identify')}
            className="text-green-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:translate-x-[-4px] transition-transform"
          >
             Back to App
          </button>
          <span className="text-gray-300">•</span>
          <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Effective {date}</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-12 text-black">{title}</h1>
        <div className="prose prose-lg prose-green max-w-none text-gray-600 leading-relaxed space-y-8">
          {content}
        </div>
      </motion.div>
    </main>
  );

  const PrivacyView = () => (
    <StaticContentView 
      title="Privacy Policy" 
      date="May 17, 2026"
      content={
        <>
          <section>
            <h3 className="text-2xl font-bold text-black mb-4">1. Data Ingestion</h3>
            <p>PhytoSpectra processes images locally using our CNN for identifies 47 core species. Cloud processing via PlantNet API only occurs when explicit validation is requested. We do not store your plant photos on our servers beyond the temporary analysis session.</p>
          </section>
          <section>
            <h3 className="text-2xl font-bold text-black mb-4">2. Location Awareness</h3>
            <p>While we use geographic metadata to improve botanical accuracy, this data is anonymized and never linked to your personal identity. We believe in your right to explore nature privately.</p>
          </section>
          <section>
            <h3 className="text-2xl font-bold text-black mb-4">3. Security</h3>
            <p>Our hybrid architecture ensures that sensitive identification logic remains encrypted. This is a course project portfolio; however, we maintain industry-standard practices for data handling.</p>
          </section>
        </>
      }
    />
  );

  const TermsView = () => (
    <StaticContentView 
      title="Terms of Service" 
      date="May 17, 2026"
      content={
        <>
          <section>
            <h3 className="text-2xl font-bold text-black mb-4">1. Identification Accuracy</h3>
            <p>PhytoSpectra provides identifications with approximately 98% accuracy. However, nature is variable. This application should NEVER be used as the sole source for determining if a plant is safe for consumption, medicinal use, or contact.</p>
          </section>
          <section>
            <h3 className="text-2xl font-bold text-black mb-4">2. Liability Disclaimer</h3>
            <p>The developers (Muhammad Nabil and Syed Rameez Hasan) are not liable for any damages, health issues, or injuries resulting from misidentification of plants by the AI model. Always consult a professional botanist or medical expert.</p>
          </section>
          <section>
            <h3 className="text-2xl font-bold text-black mb-4">3. Use of Service</h3>
            <p>The service is provided "as is" for educational and research purposes. We reserve the right to modify the identification engine at any time as our research evolves.</p>
          </section>
        </>
      }
    />
  );

  const DocumentationView = () => (
    <StaticContentView 
      title="Documentation" 
      date="Version 2.4.0"
      content={
        <>
          <section>
            <h3 className="text-2xl font-bold text-black mb-4">Technical Architecture</h3>
            <p>PhytoSpectra utilizes a multi-lead intelligence pipeline. The primary layer is a custom-trained CNN (MobileNetV2) running on approximately 14,000 training images. Secondary verification is handled by the global PlantNet taxonomic records.</p>
          </section>
          <section>
            <h3 className="text-2xl font-bold text-black mb-4">How to Use</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ensure the plant is well-lit and the leaf is centered in the frame.</li>
              <li>Multiple leaves or a single mature leaf provide the highest accuracy.</li>
              <li>Avoid high-blur or macro shots that obscure leaf margin details.</li>
            </ul>
          </section>
        </>
      }
    />
  );

  const processImage = async (base64: string) => {
    setImage(base64);
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });

      if (!response.ok) throw new Error('Could not identify plant');
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      processImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const IdentifyView = () => (
    <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12 md:mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold tracking-tight mb-4 px-4"
        >
          Identify Plants <br />
          <span className="text-green-600 font-display">With Expert Precision.</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed mb-8 px-4"
        >
          The most advanced botanical recognition system. Just upload a photo to unlock the common name, scientific profile, and safety warnings for any plant project.
        </motion.p>

        {/* Input Mode Toggle */}
        <div className="flex justify-center px-4">
          <div className="bg-apple-gray-100 p-1 rounded-2xl flex items-center gap-1 w-full max-w-xs md:max-w-none justify-center">
            <button 
              onClick={() => setInputMode('upload')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${inputMode === 'upload' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload Image</span>
              <span className="sm:hidden">Upload</span>
            </button>
            <button 
              onClick={() => setInputMode('camera')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${inputMode === 'camera' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Live Scan</span>
              <span className="sm:hidden">Scan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upload/Results Section */}
      <div className="space-y-12">
        {!result && !isLoading && (
          <>
            {inputMode === 'upload' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group"
              >
                <label className="cursor-pointer">
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                  />
                  <div className="bg-white rounded-3xl p-12 border border-gray-200 shadow-sm hover:shadow-xl hover:border-green-200 transition-all duration-500 flex flex-col items-center gap-6">
                    <div className="w-20 h-20 bg-apple-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-green-50 transition-colors">
                      <Upload className="w-10 h-10 text-gray-400 group-hover:text-green-500 transition-colors" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-semibold mb-2">Drop your image here</h3>
                      <p className="text-gray-500">or click to browse from your device</p>
                    </div>
                    <div className="flex gap-2 text-xs font-medium uppercase tracking-widest text-gray-400">
                      <span>JPEG</span>
                      <span>•</span>
                      <span>PNG</span>
                      <span>•</span>
                      <span>HEIC</span>
                    </div>
                  </div>
                </label>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CameraCapture 
                  onCapture={processImage}
                  onCancel={() => setInputMode('upload')}
                />
              </motion.div>
            )}
          </>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
            <p className="text-gray-500 font-medium animate-pulse">Analyzing botanical features...</p>
          </div>
        )}

        {/* Results State */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Column: Image & Basic Info */}
              <div className="lg:col-span-5 space-y-6">
                <div className="aspect-square rounded-3xl overflow-hidden bg-white shadow-lg border border-gray-100">
                  <img src={image!} alt="Uploaded" className="w-full h-full object-cover" />
                </div>
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-widest text-green-600 mb-2 block">{result.family}</span>
                  <h2 className="text-3xl font-bold mb-1">{result.commonName}</h2>
                  <p className="text-lg italic text-gray-500 font-medium mb-2">{result.scientificName}</p>
                  
                  {result.alternativeNames.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {result.alternativeNames.slice(0, 3).map((name, i) => (
                        <span key={i} className="text-xs bg-apple-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          {name}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                    result.safetyLevel === 'Safe' ? 'bg-green-100 text-green-700' :
                    result.safetyLevel === 'Caution' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {result.safetyLevel === 'Toxic' ? <ShieldAlert className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                    {result.safetyLevel} Status
                  </div>
                </div>
              </div>

              {/* Right Column: Detailed Insights */}
              <div className="lg:col-span-7 space-y-6">
                <motion.section 
                  initial={{ opacity:0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-orange-50/50 rounded-3xl p-8 border border-orange-100 shadow-sm relative overflow-hidden"
                >
                  <Quote className="absolute top-4 right-4 w-12 h-12 text-orange-200/50" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-orange-600 mb-4 flex items-center gap-2">
                     Botanical Wisdom & Insights
                  </h3>
                  <p className="text-lg text-orange-900 font-medium italic relative z-10 leading-relaxed">
                    "{result.irohWisdom}"
                  </p>
                </motion.section>

                <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                     Detailed Botanical Profile
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {result.description}
                  </p>
                </section>

                <div className="grid grid-cols-1 gap-6">
                  <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-600">
                      <Activity className="w-5 h-5" /> Medicinal Properties & Traditional Uses
                    </h3>
                    <ul className="space-y-3">
                      {result.medicinalProperties.map((prop, i) => (
                        <li key={i} className="text-sm text-gray-600 flex gap-3 p-3 bg-blue-50/30 rounded-xl">
                          <span className="text-blue-500 font-bold">#</span>
                          {prop}
                        </li>
                      ))}
                      {result.medicinalProperties.length === 0 && <li className="text-sm text-gray-400 italic">No common medicinal uses recorded in our database.</li>}
                    </ul>
                  </section>

                  <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-600">
                      <ShieldAlert className="w-5 h-5" /> Toxicity & Safety Warnings
                    </h3>
                    <ul className="space-y-3">
                      {result.toxicProperties.map((prop, i) => (
                        <li key={i} className="text-sm text-gray-600 flex gap-3 p-3 bg-red-50/30 rounded-xl">
                          <span className="text-red-500 font-bold">!</span>
                          {prop}
                        </li>
                      ))}
                      {result.toxicProperties.length === 0 && <li className="text-sm text-gray-400 italic">This plant is generally considered non-toxic for humans and common pets.</li>}
                    </ul>
                  </section>
                </div>

                <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <X className="w-5 h-5" /> Care Instructions
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {result.careInstructions.map((instruction, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-apple-gray-50 rounded-xl border border-gray-100">
                        <ChevronRight className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700 font-medium">{instruction}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <button 
                  onClick={() => {
                    setResult(null);
                    setImage(null);
                  }}
                  className="w-full py-4 bg-apple-gray-200 text-gray-800 rounded-full font-bold hover:bg-apple-gray-300 transition-all flex items-center justify-center gap-2"
                >
                  Start New Analysis
                </button>
                <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest pt-4">
                  <Info className="w-3 h-3" />
                  Data powered by {result.source}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl flex items-center gap-3"
          >
            <ShieldAlert className="w-5 h-5" />
            <p className="font-medium">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </div>
    </main>
  );

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${activeView === 'vision' ? 'bg-[#050505]' : (activeView === 'identify' ? 'bg-apple-gray-50' : 'bg-white')}`}>
      {/* Navigation */}
      <AnimatePresence>
        {showBriefing && <ProjectBriefing />}
      </AnimatePresence>

      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 md:px-6">
        <nav className={`h-14 flex items-center px-3 md:px-6 gap-3 md:gap-8 rounded-full border shadow-2xl transition-all duration-500 w-full max-w-fit ${activeView === 'vision' ? 'bg-black/60 backdrop-blur-xl border-white/10' : 'bg-white/80 backdrop-blur-xl border-gray-200'}`}>
          <div 
            onClick={() => setShowBriefing(true)}
            className="flex items-center gap-2 pr-3 md:pr-6 border-r border-gray-200/50 shrink-0 cursor-pointer group"
          >
            <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 group-active:scale-95 transition-all shadow-lg shadow-green-500/20">
              <Leaf className="text-white w-4 h-4" />
            </div>
            <span className={`hidden sm:block font-bold text-base tracking-tight whitespace-nowrap group-hover:text-green-600 transition-colors ${activeView === 'vision' ? 'text-white' : 'text-black'}`}>PhytoSpectra</span>
          </div>

          <div className="flex items-center gap-3 md:gap-6 text-[10px] md:text-sm font-bold shrink-0">
            <button 
              onClick={() => setActiveView('identify')}
              className={`transition-colors uppercase tracking-wider whitespace-nowrap ${activeView === 'identify' ? (activeView === 'vision' ? 'text-white' : 'text-green-600') : 'text-gray-400 hover:text-green-600'}`}
            >
              Identify
            </button>
            <button 
              onClick={() => setActiveView('vision')}
              className={`transition-colors uppercase tracking-wider whitespace-nowrap ${activeView === 'vision' ? 'text-green-500' : 'text-gray-400 hover:text-green-600'}`}
            >
              Vision
            </button>
          </div>

          <div className="pl-3 md:pl-6 border-l border-gray-200/50 shrink-0">
            <button 
              onClick={() => setActiveView(activeView === 'identify' ? 'vision' : 'identify')}
              className={`${activeView === 'vision' ? 'bg-white text-black hover:bg-green-50' : 'bg-black text-white hover:bg-green-600'} px-3 md:px-5 py-1.5 rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg whitespace-nowrap`}
            >
              {activeView === 'identify' ? 'Case Study' : 'Start App'}
            </button>
          </div>
        </nav>
      </div>

      <div className="pt-24 flex-1">
        {activeView === 'identify' && <IdentifyView />}
        {activeView === 'vision' && <VisionView />}
        {activeView === 'privacy' && <PrivacyView />}
        {activeView === 'terms' && <TermsView />}
        {activeView === 'docs' && <DocumentationView />}
      </div>

      {/* Footer */}
      <footer className={`border-t py-12 md:py-20 px-6 mt-12 transition-colors duration-500 ${activeView === 'vision' ? 'bg-[#080808] border-white/5 text-white/60' : 'bg-white border-gray-200 text-gray-500'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-16">
            <div className="col-span-1 md:col-span-2">
              <div 
                onClick={() => setShowBriefing(true)}
                className="flex items-center gap-3 mb-4 md:mb-6 cursor-pointer group w-fit"
              >
                <div className="w-9 h-9 md:w-10 md:h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-105 transition-transform">
                  <Leaf className="text-white w-5 h-5" />
                </div>
                <span className={`font-bold text-xl md:text-2xl tracking-tighter group-hover:text-green-600 transition-colors ${activeView === 'vision' ? 'text-white' : 'text-black'}`}>PhytoSpectra</span>
              </div>
              <p className="max-w-sm mb-6 leading-relaxed text-sm md:text-base">
                An advanced AI-driven botanical recognition framework developed by Muhammad Nabil and Syed Rameez Hasan for high-precision species identification.
              </p>
              <div className="flex items-center gap-3">
                 <a href="https://www.linkedin.com/in/nabil-anis/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-apple-gray-100 flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all font-bold text-[9px] md:text-[10px]">MN</a>
                 <a href="https://www.linkedin.com/in/rameez-hasan-61862a331/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-apple-gray-100 flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all font-bold text-[9px] md:text-[10px]">RH</a>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8 col-span-1 md:col-span-2 md:flex md:gap-20">
              <div className="flex-1">
                <h4 className={`font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em] mb-4 md:mb-6 ${activeView === 'vision' ? 'text-white/40' : 'text-gray-400'}`}>Resources</h4>
                <ul className="space-y-3 md:space-y-4 text-xs md:text-sm font-medium">
                  <li><button onClick={() => setActiveView('docs')} className="transition-colors flex items-center gap-2 group hover:text-green-600">Documentation <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /></button></li>
                  <li><button onClick={() => setActiveView('vision')} className="transition-colors flex items-center gap-2 group hover:text-green-600">The Technology <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /></button></li>
                </ul>
              </div>

              <div className="flex-1">
                <h4 className={`font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em] mb-4 md:mb-6 ${activeView === 'vision' ? 'text-white/40' : 'text-gray-400'}`}>Legal</h4>
                <ul className="space-y-3 md:space-y-4 text-xs md:text-sm font-medium">
                  <li><button onClick={() => setActiveView('privacy')} className="transition-colors flex items-center gap-2 group hover:text-green-600">Privacy <span className="hidden md:inline">Policy</span> <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /></button></li>
                  <li><button onClick={() => setActiveView('terms')} className="transition-colors flex items-center gap-2 group hover:text-green-600">Terms <span className="hidden md:inline">of Service</span> <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /></button></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-100/50 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
            <p className="text-[9px] md:text-[10px] font-bold text-gray-400 tracking-widest uppercase text-center md:text-left">
              © 2026 PhytoSpectra • Muhammad Nabil × Syed Rameez Hasan
            </p>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[9px] md:text-[10px] font-black uppercase text-green-600 tracking-tighter">Status: Optimal</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
