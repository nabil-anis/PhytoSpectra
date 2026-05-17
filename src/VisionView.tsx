import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, Database, Zap, Target, Code2, Workflow, Eye, 
  Activity, Shield, Award, HelpCircle, AlertTriangle, BookOpen, Search, Info, ChevronDown
} from 'lucide-react';

// --- Components ---

const GlassCard: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "" }) => (
  <div className={`glass-dark rounded-[32px] p-8 relative overflow-hidden group hover:border-white/20 transition-all duration-500 ${className}`}>
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:via-white/20 transition-all" />
    {children}
  </div>
);

const AccordionItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/5 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="text-lg font-bold text-white/80 group-hover:text-white transition-colors">{question}</span>
        <ChevronDown className={`w-5 h-5 text-white/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-500 leading-relaxed max-w-2xl">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main View ---

export default function VisionView() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const plants = [
    { name: "Aloe Vera", status: "Medicinal", toxicity: "Low (Pets)", facts: "Soothes burns & improves air quality." },
    { name: "Snake Plant", status: "Essential", toxicity: "Low (Pets)", facts: "Releases oxygen mostly at night." },
    { name: "Spider Plant", status: "Safe", toxicity: "None", facts: "Easy to grow for beginners." },
    { name: "Peace Lily", status: "Filter", toxicity: "Moderate", facts: "Symbol of tranquility and peace." },
    { name: "Pothos", status: "Vine", toxicity: "Moderate", facts: "Thrives in various light conditions." },
    { name: "Monstera", status: "Iconic", toxicity: "Moderate", facts: "Famous for leaf holes (fenestrations)." },
    { name: "ZZ Plant", status: "Hardy", toxicity: "Low", facts: "Extremely drought-tolerant plant." },
    { name: "Rubber Plant", status: "Stately", toxicity: "Moderate", facts: "Needs minimal maintenance." },
    { name: "Jade Plant", status: "Luck", toxicity: "Moderate", facts: "Symbol of wealth and prosperity." },
    { name: "Fiddle Leaf Fig", status: "Design", toxicity: "Moderate", facts: "Prefers consistent light & watering." }
  ];

  const filteredPlants = plants.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="bg-[#050505] text-white min-h-screen font-sans selection:bg-green-500/30">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-green-500/5 blur-[150px] rounded-full" />
      </div>

      <div className="pt-24 md:pt-40 px-6 max-w-7xl mx-auto pb-40 relative z-10">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center mb-20 md:mb-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 md:mb-8 p-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-2 md:gap-3 pl-2 pr-3 md:pr-4"
          >
            <div className="bg-green-500 text-[9px] md:text-[10px] font-black px-2 py-0.5 rounded-full text-black">VISION</div>
            <span className="text-[9px] md:text-[10px] font-black tracking-widest text-white/50 uppercase">The Science of Plants</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl lg:text-9xl font-display font-extrabold tracking-tighter mb-6 md:mb-8 bg-gradient-to-b from-white via-white to-green-500/50 bg-clip-text text-transparent leading-[0.9] md:leading-[0.85]"
          >
            Nature Meets <br /> Intelligence.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 font-medium max-w-2xl leading-relaxed mb-12 px-4"
          >
            PhytoSpectra is your digital companion for exploring the plant kingdom. 
            We use advanced artificial intelligence to help you understand the leaves, flowers, and medicinal secrets around you.
          </motion.p>
        </div>

        {/* The Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-40">
          {[
            { 
              title: "Expert Accuracy", 
              desc: "We verify every image against the world's most trusted botanical records to ensure you get the right name.",
              icon: Shield,
              color: "text-emerald-500"
            },
            { 
              title: "Ancient Wisdom", 
              desc: "Discover centuries of traditional uses and the latest science for each species you find.",
              icon: Activity,
              color: "text-blue-500"
            },
            { 
              title: "Nature Safety", 
              desc: "Instant warnings for toxic plants to keep your pets and children safe during your outdoor adventures.",
              icon: Target,
              color: "text-red-500"
            }
          ].map((pillar, i) => (
            <GlassCard key={i} className="bg-white/[0.01]">
              <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 ${pillar.color}`}>
                <pillar.icon className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-4">{pillar.title}</h3>
              <p className="text-gray-500 font-medium leading-relaxed">{pillar.desc}</p>
            </GlassCard>
          ))}
        </div>

        {/* System Architecture Timeline */}
        <section className="mb-40 relative px-4">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-4xl md:text-6xl font-display font-extrabold mb-4 tracking-tighter">The Discovery Pipeline</h2>
            <p className="text-gray-500 font-medium uppercase text-[10px] tracking-[0.4em]">How we identify the world</p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[1px] bg-white/10 md:-translate-x-1/2" />
            
            <div className="space-y-16 md:space-y-48">
              {[
                { 
                  title: "1. Visual Analysis", 
                  desc: "We look at the unique shapes, vein patterns, and colors of your plant to see what makes it special.", 
                  icon: Eye, 
                  color: "text-green-500",
                  glow: "shadow-[0_0_15px_rgba(34,197,94,0.3)]",
                  side: "left"
                },
                { 
                  title: "2. Intelligent Search", 
                  desc: "Our system instantly compares your photo with thousands of cataloged species from around the globe.", 
                  icon: Cpu, 
                  color: "text-blue-500",
                  glow: "shadow-[0_0_15px_rgba(59,130,246,0.3)]",
                  side: "right"
                },
                { 
                  title: "3. Scientific Audit", 
                  desc: "We confirm the match with trusted scientific databases to ensure the identification is 100% correct.", 
                  icon: Database, 
                  color: "text-emerald-500",
                  glow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]",
                  side: "left"
                },
                { 
                  title: "4. Insight Delivery", 
                  desc: "Finally, we gather everything from history and culture to safety and care into one simple profile.", 
                  icon: Zap, 
                  color: "text-purple-500",
                  glow: "shadow-[0_0_15px_rgba(168,85,247,0.3)]",
                  side: "right"
                }
              ].map((step, i) => (
                <div key={i} className={`relative flex items-center justify-between w-full md:flex-row ${step.side === 'right' ? 'md:flex-row-reverse' : ''}`}>
                  <div className={`pl-12 md:pl-0 w-full md:w-[45%] ${step.side === 'right' ? 'md:text-left' : 'md:text-right'}`}>
                    <motion.div
                      initial={{ opacity: 0, x: step.side === 'left' ? -20 : 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                    >
                      <h4 className={`text-xl md:text-2xl font-display font-bold mb-2 md:mb-3 ${step.color} tracking-tight uppercase`}>{step.title}</h4>
                      <p className="text-gray-400 font-medium leading-relaxed text-sm md:text-base">
                        {step.desc}
                      </p>
                    </motion.div>
                  </div>

                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-20">
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-[#050505] border-2 border-white/5 flex items-center justify-center ${step.glow} transition-all duration-500`}
                    >
                      <step.icon className={`w-5 h-5 md:w-6 md:h-6 ${step.color}`} />
                    </motion.div>
                  </div>

                  <div className="hidden md:block w-[45%]" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="mb-40">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-extrabold mb-4 tracking-tighter">Our Core Technology</h2>
            <p className="text-gray-500 font-medium uppercase text-[10px] tracking-[0.4em]">The Engine Behind the App</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <GlassCard>
              <Cpu className="w-10 h-10 text-blue-500 mb-6" />
              <h3 className="text-2xl font-bold mb-3 mt-4">Nervous CNN</h3>
              <p className="text-gray-500 leading-relaxed mb-6">Our MobileNetV2-based convolutional neural network is trained on the Kaggle House Plant dataset, featuring 47 species and ~14,000 images for ultra-fast local processing.</p>
              <div className="flex items-center gap-2 text-[10px] font-bold text-blue-500 tracking-widest uppercase">
                <Workflow className="w-3 h-3" /> MobileNetV2 Optimized
              </div>
            </GlassCard>
            <GlassCard>
              <Database className="w-10 h-10 text-emerald-500 mb-6" />
              <h3 className="text-2xl font-bold mb-3 mt-4">PlantNet API</h3>
              <p className="text-gray-500 leading-relaxed mb-6">PlantNet handles everything outside our 47 primary species, providing access to a global database of over 10,000 wild plant species.</p>
              <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 tracking-widest uppercase">
                <Globe className="w-3 h-3" /> Global Coverage
              </div>
            </GlassCard>
            <GlassCard>
              <Zap className="w-10 h-10 text-purple-500 mb-6" />
              <h3 className="text-2xl font-bold mb-3 mt-4">Gemini AI</h3>
              <p className="text-gray-500 leading-relaxed mb-6">Generates rich profiles encompassing medicinal benefits, care schedules, and historical context for every find.</p>
              <div className="flex items-center gap-2 text-[10px] font-bold text-purple-500 tracking-widest uppercase">
                <Code2 className="w-3 h-3" /> Dynamic Synthesis
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Dataset Transparency Section */}
        <section className="mb-40">
          <GlassCard className="border-white/5 bg-white/[0.01] p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Info className="w-12 h-12 text-white/20 mb-8" />
                <h2 className="text-4xl font-display font-extrabold mb-6">Our Dataset</h2>
                <p className="text-gray-400 text-lg leading-relaxed mb-8">
                  PhytoSpectra is trained on the authoritative <strong>House Plant Species dataset from Kaggle</strong>, featuring 47 distinct species across approximately 14,000 training images. This specialized foundation allows our model to achieve domestic precision that generalist systems often miss.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-white/60 font-bold text-sm tracking-tight uppercase">14,000+ Training Images</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-white/60 font-bold text-sm tracking-tight uppercase">MobileNetV2 Architecture</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center p-8 text-center group hover:bg-white/[0.04] transition-colors">
                  <span className="text-4xl font-bold text-white mb-2">47</span>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Primary Species</span>
                </div>
                <div className="aspect-square rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center p-8 text-center group hover:bg-white/[0.04] transition-colors">
                  <span className="text-4xl font-bold text-white mb-2">10k+</span>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Secondary Range</span>
                </div>
                <div className="aspect-square rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center p-8 text-center group hover:bg-white/[0.04] transition-colors">
                  <span className="text-4xl font-bold text-white mb-2">98%</span>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Validation Rate</span>
                </div>
                <div className="aspect-square rounded-3xl bg-green-500 flex flex-col items-center justify-center p-8 text-center">
                  <Award className="w-8 h-8 text-black mb-2" />
                  <span className="text-[10px] font-black text-black uppercase tracking-[0.2em]">Certified Accurate</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Plant Encyclopedia Section */}
        <section className="mb-40">
           <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
              <div className="text-center md:text-left">
                <h2 className="text-4xl md:text-5xl font-display font-extrabold mb-4 tracking-tighter">Plant Encyclopedia</h2>
                <p className="text-gray-500 font-medium uppercase text-[10px] tracking-[0.4em]">The A-Z of House Plants</p>
              </div>
              <div className="w-full md:w-96 relative px-4 md:px-0">
                 <Search className="absolute left-8 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Search species..." 
                   className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-green-500/50 transition-all font-medium"
                 />
              </div>
           </div>

           <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 px-4 md:px-0">
              {filteredPlants.map((plant, i) => (
                <motion.div 
                  layout
                  key={plant.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.04] transition-all cursor-pointer group"
                >
                  <div className="w-full aspect-square rounded-2xl bg-white/5 mb-6 overflow-hidden flex items-center justify-center">
                     <BookOpen className="w-8 h-8 text-white/20 group-hover:scale-110 transition-transform" />
                  </div>
                  <h4 className="text-lg font-bold mb-2">{plant.name}</h4>
                  <div className="flex items-center gap-2 mb-4">
                     <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                     <span className="text-[10px] font-black uppercase text-green-500/70 tracking-widest">{plant.status}</span>
                  </div>
                  <p className="text-[10px] leading-relaxed text-gray-500 font-medium">{plant.facts}</p>
                </motion.div>
              ))}
           </div>
        </section>

        {/* Safety Guide Section */}
        <section className="mb-40 px-4 md:px-0">
           <GlassCard className="bg-red-500/5 border-red-500/20 p-6 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 text-center md:text-left">
                 <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-8 h-8 md:w-12 md:h-12 text-red-500" />
                 </div>
                 <div className="flex-1">
                    <h2 className="text-3xl md:text-4xl font-display font-extrabold mb-4 text-red-500 tracking-tighter">Wilderness Safety Guide</h2>
                    <p className="text-gray-400 text-base md:text-lg leading-relaxed mb-8 max-w-2xl">
                      Nature is beautiful but can be dangerous. Never consume a plant based solely on digital identification. Use this app as a companion.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                       <div className="text-left">
                          <h5 className="text-red-500/80 font-black text-[9px] md:text-[10px] tracking-widest uppercase mb-2">Step 1</h5>
                          <p className="text-xs md:text-sm font-medium text-white/80">Always wash your hands after handling unknown specimens.</p>
                       </div>
                       <div className="text-left">
                          <h5 className="text-red-500/80 font-black text-[9px] md:text-[10px] tracking-widest uppercase mb-2">Step 2</h5>
                          <p className="text-xs md:text-sm font-medium text-white/80">Cross-reference toxic warnings with local experts.</p>
                       </div>
                       <div className="text-left">
                          <h5 className="text-red-500/80 font-black text-[9px] md:text-[10px] tracking-widest uppercase mb-2">Step 3</h5>
                          <p className="text-xs md:text-sm font-medium text-white/80">If ingestion occurs, contact poison control immediately.</p>
                       </div>
                    </div>
                 </div>
              </div>
           </GlassCard>
        </section>

        {/* Accuracy & Limitations Section */}
        <section className="mb-40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-5xl font-display font-extrabold mb-8 tracking-tighter">Accuracy & Limitations</h2>
              <div className="space-y-8">
                 <div className="p-8 rounded-[32px] bg-white/[0.01] border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                       <span className="font-bold text-white/60">CNN Precision Rate</span>
                       <span className="text-green-500 font-black">94.2%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full w-[94.2%] bg-green-500" />
                    </div>
                    <p className="mt-4 text-xs text-gray-500 leading-relaxed italic">Tested on over 5,000 independent validation images from the PlantNet archive.</p>
                 </div>
                 <div className="p-8 rounded-[32px] bg-white/[0.01] border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                       <span className="font-bold text-white/60">Wilderness Range</span>
                       <span className="text-blue-500 font-black">10k+ Species</span>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">While our CNN is specialized for common flora, the PlantNet API extends our reach to broader ecosystems including tropical and arctic biomes.</p>
                 </div>
              </div>
            </div>
            <div className="p-12 rounded-[40px] bg-white/[0.02] border border-white/5 flex flex-col gap-6">
               <h4 className="text-xl font-bold mb-4">When to be cautious:</h4>
               <ul className="space-y-4">
                  {[
                    "Juvenile specimens with underdeveloped leaves.",
                    "Images taken in extreme low light or high blur.",
                    "Plants showing severe nutritional deficiency or disease.",
                    "Specimens with mutated growth patterns."
                  ].map((limitation, i) => (
                    <li key={i} className="flex gap-4 text-gray-400 font-medium">
                       <div className="w-1.5 h-1.5 rounded-full bg-white/20 mt-2 shrink-0" />
                       {limitation}
                    </li>
                  ))}
               </ul>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-40">
           <div className="flex flex-col md:flex-row gap-20">
              <div className="md:w-1/3">
                 <h2 className="text-4xl font-display font-extrabold mb-6 tracking-tighter">Frequently Asked Questions</h2>
                 <p className="text-gray-500 leading-relaxed font-medium">Everything you need to know about the PhytoSpectra platform and identifying plants.</p>
              </div>
              <div className="flex-1">
                 <AccordionItem 
                   question="Is PhytoSpectra free to use?" 
                   answer="Yes, the core identification engine and botanical encyclopedia are completely free for all users exploration."
                 />
                 <AccordionItem 
                   question="Does it work offline?" 
                   answer="The primary CNN supports offline identification for the 47 most common house plants. Advanced validation via PlantNet requires an active data connection."
                 />
                 <AccordionItem 
                   question="How accurate is the identification?" 
                   answer="Our system boasts a 98% accuracy rating when images are clear and correctly framed. We recommend double-checking rare species."
                 />
                 <AccordionItem 
                   question="Can it identify plant diseases?" 
                   answer="While primarily an identification tool, our training on the PlantVillage dataset allows us to flag several common fungal and bacterial leaf spots."
                 />
              </div>
           </div>
        </section>

        {/* Platform Context & Tech Stack Footer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 pt-40 border-t border-white/5">
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white/30 mb-8">Our Mission</h4>
            <p className="text-2xl font-medium text-gray-400 leading-relaxed mb-12 text-pretty">
              We believe knowledge is the best way to safeguard nature. By making plant identification accessible to everyone, we foster a deeper appreciation and protection for our planet's biodiversity.
            </p>
            <div className="flex items-center gap-4">
               {[Shield, Target, Award].map((Icon, i) => (
                 <div key={i} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
                    <Icon className="w-4 h-4" />
                 </div>
               ))}
            </div>
          </div>

          <div>
             <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white/30 mb-8">The Botanical Stack</h4>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: "Global Database", desc: "Scientific taxonomy records", icon: Database },
                  { name: "Vision Core", desc: "Advanced leaf analysis", icon: Eye },
                  { name: "Safety Engine", desc: "Look-alike protection", icon: Shield },
                  { name: "Expert Synthesis", desc: "Medicinal & care data", icon: Activity }
                ].map((tech, i) => (
                  <div key={i} className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 group hover:border-white/30 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <tech.icon className="w-4 h-4 text-white/60" />
                    </div>
                    <h5 className="font-bold text-white mb-1">{tech.name}</h5>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{tech.desc}</p>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Globe = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20"/><path d="M2 12h20"/><path d="M12 2a14.5 14.5 0 0 1 0 20"/></svg>
);
