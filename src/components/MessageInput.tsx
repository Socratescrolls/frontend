import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSubmit: (message: string) => Promise<void>;
}

export function MessageInput({ onSubmit }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      await onSubmit(message);
      setMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isLoading}
      />
      <button
        type="submit"
        className={`${
          isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
        } text-white p-2 rounded-lg transition-colors`}
        disabled={isLoading}
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  );
} 