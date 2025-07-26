import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Bot, Clock, RotateCcw, Zap, Brain, Check } from 'lucide-react';
import { Modal } from '../ui/Modal';
import Button from '../ui/Button';

interface PracticeSettings {
  aiProvider: 'gemini' | 'llama' | 'gemma';
  timeoutSeconds: number;
  numberOfRounds: number;
  userStance: 'pro' | 'con';
}

interface PracticeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (settings: PracticeSettings) => void;
  topic: {
    title: string;
    category: string;
    difficulty: string;
  };
}

export const PracticeSettingsModal: React.FC<PracticeSettingsModalProps> = ({
  isOpen,
  onClose,
  onStart,
  topic
}) => {
  const [settings, setSettings] = useState<PracticeSettings>({
    aiProvider: 'llama',
    timeoutSeconds: 120, // 2 minutes default
    numberOfRounds: 3,
    userStance: 'pro'
  });
  
  const [minutes, setMinutes] = useState(2);
  const [seconds, setSeconds] = useState(0);
  
  // Update timeoutSeconds when minutes or seconds change
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      timeoutSeconds: (minutes * 60) + seconds
    }));
  }, [minutes, seconds]);

  const handleStart = () => {
    onStart(settings);
    onClose();
  };

  const aiProviders = [
    {
      id: 'llama' as const,
      name: 'Llama-70b (Groq)',
      description: 'Fast and versatile responses',
      icon: <Zap className="w-5 h-5" />
    },
    {
      id: 'gemini' as const,
      name: 'Gemini (Google)',
      description: 'Advanced reasoning and analysis',
      icon: <Brain className="w-5 h-5" />
    },
    {
      id: 'gemma' as const,
      name: 'Gemma2-9b (Groq)',
      description: 'Efficient and reliable',
      icon: <Bot className="w-5 h-5" />
    }
  ];

  const roundOptions = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 5, label: '5' },
    { value: 6, label: '6' }
  ];

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleTimeChange = (type: 'minutes' | 'seconds', value: number) => {
    if (type === 'minutes') {
      const newMinutes = Math.max(0, Math.min(10, value));
      setMinutes(newMinutes);
      // If we're at 10 minutes, cap seconds at 0
      if (newMinutes === 10) setSeconds(0);
    } else {
      // Only allow seconds if minutes < 10
      if (minutes < 10) {
        setSeconds(Math.max(0, Math.min(59, value)));
      } else {
        setSeconds(0);
      }
    }
  };
  
  const handleIncrement = (type: 'minutes' | 'seconds') => {
    if (type === 'minutes' && minutes < 10) {
      setMinutes(minutes + 1);
      if (minutes + 1 === 10) setSeconds(0);
    } else if (type === 'seconds' && minutes < 10) {
      setSeconds(prev => (prev < 59 ? prev + 1 : 0));
    }
  };
  
  const handleDecrement = (type: 'minutes' | 'seconds') => {
    if (type === 'minutes' && minutes > 0) {
      setMinutes(minutes - 1);
    } else if (type === 'seconds' && seconds > 0) {
      setSeconds(seconds - 1);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="space-y-6 overflow-y-auto overflow-x-hidden max-h-[80vh] py-2">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Practice Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        {/* Topic Display */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            {topic.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
              {topic.category}
            </span>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded capitalize">
              {topic.difficulty}
            </span>
          </div>
        </div>

        {/* AI Provider Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <Bot className="w-4 h-4 inline mr-2" />
            AI Opponent
          </label>
          <div className="grid grid-cols-1 gap-2">
            {aiProviders.map((provider) => (
              <div
                key={provider.id}
                className={`p-4 rounded-lg cursor-pointer transition-colors select-none 
                  ${settings.aiProvider === provider.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500'
                    : 'border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}
                `}
                onClick={() => setSettings(prev => ({ ...prev, aiProvider: provider.id }))}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-md mt-0.5 ${
                    settings.aiProvider === provider.id
                      ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    {provider.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium ${
                        settings.aiProvider === provider.id 
                          ? 'text-blue-700 dark:text-blue-300' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {provider.name}
                      </h4>
                      {settings.aiProvider === provider.id && (
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      {provider.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeout Selection with Minutes/Seconds */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <Clock className="w-4 h-4 inline mr-2" />
            Time per Turn
          </label>
          <div className="flex items-center justify-center gap-4">
            {/* Minutes */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Minutes</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDecrement('minutes')}
                  disabled={minutes <= 0}
                  className="p-1 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed w-8 h-8 flex items-center justify-center"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={minutes}
                  onChange={(e) => handleTimeChange('minutes', parseInt(e.target.value) || 0)}
                  className="w-12 text-center rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-lg font-bold py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  onClick={() => handleIncrement('minutes')}
                  disabled={minutes >= 10}
                  className="p-1 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed w-8 h-8 flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Seconds */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Seconds</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDecrement('seconds')}
                  disabled={seconds <= 0 || minutes >= 10}
                  className="p-1 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed w-8 h-8 flex items-center justify-center"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  disabled={minutes >= 10}
                  onChange={(e) => handleTimeChange('seconds', parseInt(e.target.value) || 0)}
                  className="w-12 text-center rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-lg font-bold py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                />
                <button
                  onClick={() => handleIncrement('seconds')}
                  disabled={seconds >= 59 || minutes >= 10}
                  className="p-1 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed w-8 h-8 flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
            Max 10 minutes total
          </div>
        </div>

        {/* Number of Rounds with Segmented Buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <RotateCcw className="w-4 h-4 inline mr-2" />
            Number of Rounds
          </label>
          <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-1 bg-gray-100 dark:bg-gray-800">
            {roundOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSettings(prev => ({ ...prev, numberOfRounds: option.value }))}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  settings.numberOfRounds === option.value
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stance Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Your Stance
          </label>
          <div className="flex items-center justify-center">
            <div className="relative bg-gray-100 dark:bg-gray-800 rounded-full p-1">
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-2px)] rounded-full transition-transform duration-200 ${
                  settings.userStance === 'pro' 
                    ? 'translate-x-[2px] bg-gradient-to-r from-green-500 to-green-600' 
                    : 'translate-x-[calc(100%-2px)] bg-gradient-to-r from-red-500 to-red-600'
                }`}
              />
              <div className="relative flex w-full">
                <button
                  onClick={() => setSettings(prev => ({ ...prev, userStance: 'pro' }))}
                  className={`flex-1 px-6 py-2 rounded-full text-sm font-medium transition-colors text-center ${
                    settings.userStance === 'pro'
                      ? 'text-white'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Pro
                </button>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, userStance: 'con' }))}
                  className={`flex-1 px-6 py-2 rounded-full text-sm font-medium transition-colors text-center ${
                    settings.userStance === 'con'
                      ? 'text-white'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Con
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleStart}
            className="flex-1"
          >
            Start Practice
          </Button>
        </div>
      </div>
    </Modal>
  );
};
