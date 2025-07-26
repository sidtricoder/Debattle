import React from 'react';

interface ChatLoadingAnimationProps {
  message?: string;
  className?: string;
}

export const ChatLoadingAnimation: React.FC<ChatLoadingAnimationProps> = ({ 
  message = "Loading...",
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center w-full ${className}`}>
      <div className="mb-6">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 320 200" 
          width="240" 
          height="150"
          className="mx-auto"
        >
          <defs>
            <clipPath id="bubbleClip">
              <path d="M20 40 Q20 20 40 20 H280 Q300 20 300 40 V120 Q300 140 280 140 H100 L70 170 L80 140 H40 Q20 140 20 120 Z"/>
            </clipPath>
          </defs>
          <path 
            d="M20 40 Q20 20 40 20 H280 Q300 20 300 40 V120 Q300 140 280 140 H100 L70 170 L80 140 H40 Q20 140 20 120 Z"
            fill="none" 
            stroke="currentColor" 
            className="text-gray-300 dark:text-gray-700"
            strokeWidth="4.5"
          />
          <path 
            d="M20 40 Q20 20 40 20 H280 Q300 20 300 40 V120 Q300 140 280 140 H100 L70 170 L80 140 H40 Q20 140 20 120 Z"
            fill="none" 
            stroke="currentColor"
            className="text-blue-400 dark:text-blue-600"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="10 20"
            opacity="0.8"
          >
            <animate attributeName="stroke-dashoffset" dur="1.5s" values="0;-30;0" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite"/>
          </path>
          <g clipPath="url(#bubbleClip)">
            <path 
              fill="none" 
              stroke="currentColor"
              className="text-blue-500 dark:text-blue-400"
              strokeWidth="8" 
              strokeLinecap="round"
              strokeDasharray="200 250" 
              strokeDashoffset="0"
              d="M235 80c0 20-18 32-32 32-38 0-60-65-98-65-18 0-32 14-32 32s15 32 32 32c38 0 60-65 98-65 16 0 32 12 32 32Z"
            >
              <animate attributeName="stroke-dashoffset" calcMode="spline" dur="2s" values="450;-450" keySplines="0 0 1 1" repeatCount="indefinite"/>
            </path>
          </g>
        </svg>
      </div>
      <div className="text-xl font-medium text-gray-600 dark:text-gray-400 text-center">
        {message}
      </div>
    </div>
  );
};
