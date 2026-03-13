'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2, ChevronRight } from 'lucide-react';
import { SpeakingPromptExercise } from '@/types';

interface SpeakingPromptProps {
  exercise: SpeakingPromptExercise;
  onAnswer: (isCorrect: boolean) => void;
}

export function SpeakingPrompt({ exercise, onAnswer }: SpeakingPromptProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [showSample, setShowSample] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'es-ES';
    recognition.onend = () => {
      setIsRecording(false);
      setHasRecorded(true);
    };
    recognition.onerror = () => {
      setIsRecording(false);
    };
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const speakSample = () => {
    const utterance = new SpeechSynthesisUtterance(exercise.sampleAnswer);
    utterance.lang = 'es-ES';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Speaking Practice</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Record your answer in Spanish</p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5">
        <p className="text-gray-800 dark:text-gray-200 font-medium">{exercise.prompt}</p>
      </div>

      {/* Recording button */}
      <div className="flex flex-col items-center gap-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          animate={isRecording ? { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 1 } } : {}}
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all ${
            isRecording
              ? 'bg-red-500 shadow-red-200 dark:shadow-red-900/50'
              : 'gradient-primary shadow-primary-200 dark:shadow-primary-900/50'
          }`}
        >
          {isRecording ? (
            <MicOff className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}
        </motion.button>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isRecording ? 'Recording... Tap to stop' : 'Tap to start recording'}
        </p>
      </div>

      {/* Sample answer */}
      <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sample Answer</span>
          <button
            onClick={speakSample}
            className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600"
          >
            <Volume2 className="w-3.5 h-3.5" /> Listen
          </button>
        </div>
        {showSample ? (
          <p className="text-sm text-gray-600 dark:text-gray-400 italic">{exercise.sampleAnswer}</p>
        ) : (
          <button
            onClick={() => setShowSample(true)}
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            Tap to reveal sample answer
          </button>
        )}
      </div>

      {hasRecorded && (
        <button
          onClick={() => onAnswer(true)}
          className="w-full flex items-center justify-center gap-2 gradient-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
        >
          Continue <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {!hasRecorded && (
        <button
          onClick={() => onAnswer(true)}
          className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 w-full text-center"
        >
          Skip this exercise →
        </button>
      )}
    </div>
  );
}
