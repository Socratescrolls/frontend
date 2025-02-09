import React, { useState } from 'react';
import { Save, X } from 'lucide-react';

interface NotesPanelProps {
  onClose: () => void;
  keyPoints: string[];
}

const NotesPanel: React.FC<NotesPanelProps> = ({ onClose, keyPoints }) => {
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving notes:', notes);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm h-[600px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Notes</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
      </div>
      {/* Notes Content */}
      <div className="flex-1 p-4">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full h-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your notes here..."
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {keyPoints.length > 0 ? (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Key Points:</h4>
            <ul className="space-y-2">
              {keyPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-500">No key points available yet.</p>
        )}
      </div>
    </div>
  );
};

export default NotesPanel;
