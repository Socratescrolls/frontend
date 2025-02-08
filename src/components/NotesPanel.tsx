import React, { useState } from 'react';
import { Save } from 'lucide-react';

interface NotesPanelProps {
  isOpen: boolean;
}

const NotesPanel: React.FC<NotesPanelProps> = ({ isOpen }) => {
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving notes:', notes);
  };

  if (!isOpen) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Notes</h2>
        <button
          onClick={handleSave}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Save notes"
        >
          <Save size={20} className="text-gray-600" />
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
