
import React, { useState } from 'react';
import { GUIDE_DATA } from '../constants/guideData';

interface ContextualHelpProps {
  section: keyof typeof GUIDE_DATA;
}

const ContextualHelp: React.FC<ContextualHelpProps> = ({ section }) => {
  const [isOpen, setIsOpen] = useState(false);
  const data = GUIDE_DATA[section];

  if (!data) return null;

  return (
    <div className="relative inline-block ml-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full bg-gray-700 hover:bg-gray-600 text-orange-500 transition-colors focus:outline-none"
        title="Ajuda sobre esta página"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 md:w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50 p-4 animate-fade-in">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-orange-500 flex items-center gap-2">
              <span>{data.icon}</span> {data.title}
            </h4>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-300 mb-3 leading-relaxed">
            {data.description}
          </p>
          <ul className="space-y-1">
            {data.tips.map((tip, idx) => (
              <li key={idx} className="text-[10px] text-gray-400 flex gap-2">
                <span className="text-orange-500">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ContextualHelp;
