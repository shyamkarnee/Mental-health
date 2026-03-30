import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import { analyzeMood } from '../services/ai';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Smile, Meh, Frown, AlertCircle, Loader2 } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

interface MoodEntry {
  id: string;
  text: string;
  mood: string;
  score: number;
  timestamp: any;
}

export default function MoodTracker() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, `users/${user.uid}/moods`),
      orderBy('timestamp', 'desc'),
      limit(30)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEntries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MoodEntry[];
      setEntries(fetchedEntries);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/moods`);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeMood(input);
      
      await addDoc(collection(db, `users/${user.uid}/moods`), {
        text: input,
        mood: analysis.mood,
        score: analysis.score,
        timestamp: serverTimestamp()
      });
      
      setInput('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/moods`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const chartData = entries.map(entry => ({
    date: entry.timestamp?.toDate() ? format(entry.timestamp.toDate(), 'MMM dd') : '',
    score: entry.score,
    mood: entry.mood
  })).reverse();

  const getMoodIcon = (score: number) => {
    if (score >= 7) return <Smile className="w-6 h-6 text-green-500" />;
    if (score >= 4) return <Meh className="w-6 h-6 text-yellow-500" />;
    return <Frown className="w-6 h-6 text-red-500" />;
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header>
          <h1 className="text-3xl font-bold text-slate-800">Mood Tracker</h1>
          <p className="text-slate-500 mt-2">Log your daily feelings and track your emotional journey.</p>
        </header>

        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
        >
          <h2 className="text-lg font-semibold text-slate-800 mb-4">How are you feeling today?</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Write a few sentences about your day, your thoughts, or your feelings..."
              className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none transition-all"
              disabled={isAnalyzing}
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                AI will analyze your text to detect your mood.
              </p>
              <button
                type="submit"
                disabled={!input.trim() || isAnalyzing}
                className="px-6 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Log Mood'
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
          >
            <h2 className="text-lg font-semibold text-slate-800 mb-6">Emotional Trends (Last 30 Entries)</h2>
            <div className="h-72 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      domain={[0, 10]} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#0d9488" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#0d9488', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, fill: '#0d9488', strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                  Not enough data yet. Log your mood to see trends.
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Entries */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col"
          >
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Logs</h2>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {entries.length > 0 ? entries.slice(0, 5).map((entry) => (
                <div key={entry.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getMoodIcon(entry.score)}
                      <span className="font-medium text-slate-700 capitalize">{entry.mood}</span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {entry.timestamp?.toDate() ? format(entry.timestamp.toDate(), 'MMM dd, h:mm a') : 'Just now'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-3">{entry.text}</p>
                </div>
              )) : (
                <p className="text-slate-400 text-center py-8">No entries yet.</p>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
