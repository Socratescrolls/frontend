import React, { useState } from 'react';
import { Save, X } from 'lucide-react';

interface NotesPanelProps {
  onClose: () => void;
}

const NotesPanel: React.FC<NotesPanelProps> = ({ onClose }) => {
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
    </div>
  );
};

export default NotesPanel;
