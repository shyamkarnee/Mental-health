import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wind, BookOpen, Brain, Play, Pause, RotateCcw } from 'lucide-react';

export default function Tools() {
  const [activeTool, setActiveTool] = useState<'breathing' | 'journaling' | 'reframing' | null>(null);

  const tools = [
    { id: 'breathing', title: 'Guided Breathing', icon: Wind, color: 'bg-blue-100 text-blue-600', desc: '4-7-8 breathing technique to reduce anxiety.' },
    { id: 'journaling', title: 'Guided Journaling', icon: BookOpen, color: 'bg-purple-100 text-purple-600', desc: 'Prompts to help you process your thoughts.' },
    { id: 'reframing', title: 'Thought Reframing', icon: Brain, color: 'bg-teal-100 text-teal-600', desc: 'CBT exercise to challenge negative thoughts.' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
      <div className="max-w-5xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-slate-800">Mental Health Tools</h1>
          <p className="text-slate-500 mt-2">Evidence-based exercises to help you manage stress and anxiety.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <motion.button
              key={tool.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTool(tool.id as any)}
              className={`p-6 rounded-2xl border text-left transition-all ${
                activeTool === tool.id 
                  ? 'bg-white border-teal-500 shadow-md ring-1 ring-teal-500' 
                  : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${tool.color}`}>
                <tool.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">{tool.title}</h3>
              <p className="text-sm text-slate-500">{tool.desc}</p>
            </motion.button>
          ))}
        </div>

        <div className="mt-8">
          {activeTool === 'breathing' && <BreathingExercise />}
          {activeTool === 'journaling' && <JournalingExercise />}
          {activeTool === 'reframing' && <ReframingExercise />}
        </div>
      </div>
    </div>
  );
}

function BreathingExercise() {
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [timeLeft, setTimeLeft] = useState(4);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (phase === 'Inhale') { setPhase('Hold'); return 7; }
            if (phase === 'Hold') { setPhase('Exhale'); return 8; }
            if (phase === 'Exhale') { setPhase('Inhale'); return 4; }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, phase]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setPhase('Inhale');
    setTimeLeft(4);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[400px]"
    >
      <h2 className="text-2xl font-bold text-slate-800 mb-8">4-7-8 Breathing</h2>
      
      <div className="relative w-64 h-64 flex items-center justify-center mb-8">
        <motion.div
          animate={{
            scale: phase === 'Inhale' ? 1.5 : phase === 'Exhale' ? 1 : 1.5,
            opacity: phase === 'Hold' ? 0.8 : 1
          }}
          transition={{ duration: phase === 'Inhale' ? 4 : phase === 'Exhale' ? 8 : 7, ease: "easeInOut" }}
          className="absolute inset-0 bg-blue-100 rounded-full opacity-50"
        />
        <div className="z-10 flex flex-col items-center">
          <span className="text-4xl font-bold text-blue-600 mb-2">{timeLeft}</span>
          <span className="text-lg font-medium text-slate-600 uppercase tracking-widest">{phase}</span>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={toggleTimer}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={resetTimer}
          className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-full font-medium hover:bg-slate-200 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Reset
        </button>
      </div>
    </motion.div>
  );
}

function JournalingExercise() {
  const prompts = [
    "What is one thing that brought you joy today?",
    "Describe a recent challenge and how you handled it.",
    "What are three things you are grateful for right now?",
    "Write a letter of forgiveness to yourself.",
    "What is a worry you have, and what is the worst-case scenario? How likely is it?"
  ];
  const [prompt, setPrompt] = useState(prompts[0]);
  const [entry, setEntry] = useState('');

  const newPrompt = () => {
    const next = prompts[(prompts.indexOf(prompt) + 1) % prompts.length];
    setPrompt(next);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Guided Journaling</h2>
          <p className="text-purple-600 font-medium text-lg italic">"{prompt}"</p>
        </div>
        <button onClick={newPrompt} className="text-sm text-slate-500 hover:text-purple-600 flex items-center gap-1">
          <RotateCcw className="w-4 h-4" /> New Prompt
        </button>
      </div>
      
      <textarea
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="Start writing here..."
        className="w-full h-64 p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none transition-all text-slate-700 leading-relaxed"
      />
      
      <div className="mt-4 flex justify-end">
        <button className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors shadow-sm">
          Save Entry
        </button>
      </div>
    </motion.div>
  );
}

function ReframingExercise() {
  const [negative, setNegative] = useState('');
  const [evidenceFor, setEvidenceFor] = useState('');
  const [evidenceAgainst, setEvidenceAgainst] = useState('');
  const [reframed, setReframed] = useState('');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
    >
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Thought Reframing (CBT)</h2>
      <p className="text-slate-500 mb-8">Challenge negative automatic thoughts by examining the evidence.</p>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">1. Identify the negative thought</label>
          <input
            type="text"
            value={negative}
            onChange={(e) => setNegative(e.target.value)}
            placeholder="e.g., I always mess things up."
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">2. Evidence supporting it</label>
            <textarea
              value={evidenceFor}
              onChange={(e) => setEvidenceFor(e.target.value)}
              placeholder="Facts that support this thought..."
              className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">3. Evidence against it</label>
            <textarea
              value={evidenceAgainst}
              onChange={(e) => setEvidenceAgainst(e.target.value)}
              placeholder="Facts that contradict this thought..."
              className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">4. A more balanced, realistic thought</label>
          <input
            type="text"
            value={reframed}
            onChange={(e) => setReframed(e.target.value)}
            placeholder="e.g., I made a mistake this time, but I usually do well."
            className="w-full p-4 bg-teal-50 border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-teal-900"
          />
        </div>
      </div>
    </motion.div>
  );
}
