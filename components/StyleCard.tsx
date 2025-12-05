import React from 'react';
import { StyleOption } from '../types';

interface StyleCardProps {
  styleOption: StyleOption;
  isSelected: boolean;
  onSelect: (style: StyleOption) => void;
}

export const StyleCard: React.FC<StyleCardProps> = ({ styleOption, isSelected, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(styleOption)}
      className={`relative cursor-pointer group rounded-xl border p-4 transition-all duration-300 ${
        isSelected
          ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]'
          : 'bg-gray-800 border-gray-700 hover:border-gray-500 hover:bg-gray-750'
      }`}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${isSelected ? 'bg-indigo-600' : 'bg-gray-700 group-hover:bg-gray-600'}`}>
          {styleOption.icon}
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-200'}`}>
            {styleOption.name}
          </h3>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
            {styleOption.description}
          </p>
        </div>
        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
          isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-600'
        }`}>
          {isSelected && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};
