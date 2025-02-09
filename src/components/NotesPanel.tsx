import React from 'react';
import { X } from 'lucide-react';

interface NotesPanelProps {
  currentPage: number;
  keyPoints: string[];
  onClose: () => void;
}

export function NotesPanel({ currentPage, keyPoints, onClose }: NotesPanelProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 h-[calc(100vh-200px)] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Notes - Page {currentPage}</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-2">
        {keyPoints.map((point, index) => (
          <div key={index} className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <p className="text-sm text-gray-700">{point}</p>
          </div>
        ))}
        {keyPoints.length === 0 && (
          <p className="text-sm text-gray-500 italic">
            No key points available for this page yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default NotesPanel;
