import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateChatResponse } from '../services/ai';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: any;
}

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, `users/${user.uid}/chats`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(fetchedMessages);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/chats`);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Save user message
    try {
      await addDoc(collection(db, `users/${user.uid}/chats`), {
        text: userMessage,
        sender: 'user',
        timestamp: serverTimestamp()
      });

      // Prepare history for AI
      const history = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      // Get AI response
      const aiResponseText = await generateChatResponse(history, userMessage);

      // Save AI message
      await addDoc(collection(db, `users/${user.uid}/chats`), {
        text: aiResponseText,
        sender: 'ai',
        timestamp: serverTimestamp()
      });

    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/chats`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm m-4 border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
            <Bot className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">MindMate AI</h2>
            <p className="text-sm text-teal-600 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
              Online & Ready to listen
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div 
              key="empty-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center h-full text-center space-y-4"
            >
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800">Hello, {user?.displayName?.split(' ')[0] || 'there'}</h3>
              <p className="text-slate-500 max-w-md">
                I'm your personal mental health companion. This is a safe, judgment-free space. How are you feeling today?
              </p>
            </motion.div>
          )}

          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.sender === 'user' ? 'bg-blue-100' : 'bg-teal-100'
              }`}>
                {msg.sender === 'user' ? (
                  <User className="w-5 h-5 text-blue-600" />
                ) : (
                  <Bot className="w-5 h-5 text-teal-600" />
                )}
              </div>
              
              <div className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                msg.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none shadow-sm' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
              }`}>
                {msg.text.includes('988') || msg.text.includes('emergency') ? (
                  <div className="flex items-start gap-2 mb-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-800">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                    <span className="text-sm font-medium">Important Resource Notice</span>
                  </div>
                ) : null}
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div
              key="loading-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-4"
            >
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-teal-600" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm flex items-center gap-2">
                <Loader2 className="w-5 h-5 text-teal-500 animate-spin" />
                <span className="text-slate-500 text-sm">MindMate is typing...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-700 placeholder:text-slate-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2.5 bg-teal-600 text-white rounded-full hover:bg-teal-700 disabled:opacity-50 disabled:hover:bg-teal-600 transition-colors shadow-sm"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </form>
        <p className="text-xs text-center text-slate-400 mt-3">
          MindMate is an AI companion, not a replacement for professional therapy.
        </p>
      </div>
    </div>
  );
}
