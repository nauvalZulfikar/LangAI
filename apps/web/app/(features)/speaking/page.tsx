'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Volume2, RefreshCw } from 'lucide-react';
import { ConversationMessage } from '@/types';

const SCENARIOS = [
  { id: 'cafe', label: '☕ At a Café', prompt: 'You are at a café in Madrid. Practice ordering food and drinks.' },
  { id: 'airport', label: '✈️ At the Airport', prompt: 'You are at Madrid-Barajas airport. Practice asking for directions and flight information.' },
  { id: 'doctor', label: '🏥 At the Doctor', prompt: 'You have a mild illness. Practice describing symptoms and understanding medical advice.' },
  { id: 'shopping', label: '🛍️ Shopping', prompt: 'You are shopping in a market. Practice asking about prices and making purchases.' },
  { id: 'meeting', label: '🤝 Business Meeting', prompt: 'You are in a business meeting in a Spanish-speaking country. Practice professional conversation.' },
  { id: 'hotel', label: '🏨 Hotel Check-in', prompt: 'You are checking into a hotel. Practice making reservations and asking about amenities.' },
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function SpeakingPage() {
  const [selectedScenario, setSelectedScenario] = useState<(typeof SCENARIOS)[0] | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const startSession = async (scenario: (typeof SCENARIOS)[0]) => {
    setSelectedScenario(scenario);
    setSessionStarted(true);
    setMessages([]);
    setIsSending(true);
    try {
      const res = await fetch('/api/ai/speaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: scenario.id,
          messages: [],
          isStart: true,
        }),
      });
      const data = await res.json();
      setMessages([{ role: 'assistant', content: data.message }]);
      speakText(data.message);
    } catch {
      setMessages([{ role: 'assistant', content: `¡Hola! ${scenario.prompt} ¿Cómo puedo ayudarte?` }]);
    } finally {
      setIsSending(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isSending) return;
    const userMessage: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsSending(true);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    try {
      const res = await fetch('/api/ai/speaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: selectedScenario?.id,
          messages: newMessages,
        }),
      });
      const data = await res.json();
      const aiMessage: Message = { role: 'assistant', content: data.message };
      setMessages([...newMessages, aiMessage]);
      speakText(data.message);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Lo siento, hubo un error. Por favor, inténtalo de nuevo.' }]);
    } finally {
      setIsSending(false);
    }
  };

  const speakText = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser. Please type your response.');
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  if (!sessionStarted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Conversation Partner</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Practice speaking Spanish with an AI that gives real-time feedback
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SCENARIOS.map((scenario) => (
            <motion.button
              key={scenario.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startSession(scenario)}
              className="text-left p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-primary-300 hover:shadow-md transition-all"
            >
              <div className="text-2xl mb-2">{scenario.label.split(' ')[0]}</div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{scenario.label.slice(2)}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{scenario.prompt}</p>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-10rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-bold text-gray-900 dark:text-white">{selectedScenario?.label}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">{messages.length} messages</p>
        </div>
        <button
          onClick={() => { setSessionStarted(false); setMessages([]); }}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> New Scenario
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-hide">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'gradient-primary text-white rounded-br-sm'
                    : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm'
                }`}
              >
                <p className="leading-relaxed">{msg.content}</p>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => speakText(msg.content)}
                    className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-primary-500 transition-colors"
                  >
                    <Volume2 className="w-3 h-3" /> Listen
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isSending && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-300 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-300 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-300 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-2">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-2.5 rounded-xl transition-colors flex-shrink-0 ${
            isRecording
              ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-primary-500'
          }`}
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
          placeholder="Escribe o habla en español..."
          className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none text-sm"
        />

        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isSending}
          className="p-2.5 gradient-primary text-white rounded-xl hover:opacity-90 disabled:opacity-40 transition-all flex-shrink-0"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
