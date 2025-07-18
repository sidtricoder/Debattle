import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Bot, Clock, RotateCcw, Zap, Brain, Minus, Plus } from 'lucide-react';
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
    aiProvider: 'gemini',
    timeoutSeconds: 300, // 5 minutes default
    numberOfRounds: 3,
    userStance: 'pro'
  });

  const handleStart = () => {
    onStart(settings);
    onClose();
  };

  const aiProviders = [
    {
      id: 'gemini' as const,
      name: 'Gemini (Google)',
      description: 'Advanced reasoning and analysis',
      icon: <Brain className="w-5 h-5" />
    },
    {
      id: 'llama' as const,
      name: 'Llama-70b (Groq)',
      description: 'Fast and versatile responses',
      icon: <Zap className="w-5 h-5" />
    },
    {
      id: 'gemma' as const,
      name: 'Gemma2-9b (Groq)',
      description: 'Efficient and reliable',
      icon: <Bot className="w-5 h-5" />
    }
  ];

  const roundOptions = [
    { value: 2, label: '2 rounds' },
    { value: 3, label: '3 rounds' },
    { value: 4, label: '4 rounds' },
    { value: 5, label: '5 rounds' },
    { value: 6, label: '6 rounds' }
  ];

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleTimeoutChange = (newValue: number) => {
    if (newValue >= 30 && newValue <= 300) {
      setSettings(prev => ({ ...prev, timeoutSeconds: newValue }));
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
          <div className="grid grid-cols-1 gap-3">
            {aiProviders.map((provider) => (
              <div
                key={provider.id}
                className={`p-5 rounded-lg border-2 cursor-pointer transition-colors select-none 
                  ${settings.aiProvider === provider.id
                    ? 'border-blue-500 bg-gradient-to-r from-blue-100 via-blue-50 to-blue-200 dark:from-blue-900 dark:via-blue-800 dark:to-blue-900'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:via-white hover:to-gray-200 dark:hover:from-gray-800 dark:hover:via-gray-900 dark:hover:to-gray-800'}
                `}
                onClick={() => setSettings(prev => ({ ...prev, aiProvider: provider.id }))}
                style={{ minWidth: 0 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    settings.aiProvider === provider.id
                      ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                    {provider.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {provider.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {provider.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeout Selection with Number Stepper */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <Clock className="w-4 h-4 inline mr-2" />
            Argument Timeout (User Only)
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handleTimeoutChange(settings.timeoutSeconds - 1)}
              disabled={settings.timeoutSeconds <= 30}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              min={30}
              max={300}
              step={1}
              value={settings.timeoutSeconds}
              onChange={e => handleTimeoutChange(Number(e.target.value))}
              className="w-20 text-center rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-lg font-bold px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={() => handleTimeoutChange(settings.timeoutSeconds + 1)}
              disabled={settings.timeoutSeconds >= 300}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
            Range: 30 seconds - 5 minutes
          </div>
        </div>

        {/* Number of Rounds */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <RotateCcw className="w-4 h-4 inline mr-2" />
            Number of Rounds
          </label>
          <div className="grid grid-cols-3 gap-2">
            {roundOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSettings(prev => ({ ...prev, numberOfRounds: option.value }))}
                className={`p-4 rounded-lg border text-sm font-medium transition-colors ${
                  settings.numberOfRounds === option.value
                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-600 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800/20 dark:hover:to-gray-700/20'
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
