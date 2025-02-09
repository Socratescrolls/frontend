import React, { useState, useEffect } from 'react';
import { MessageInput } from './MessageInput';
import { Bot } from 'lucide-react';
import { ProfessorHeader } from './ProfessorHeader';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  understanding?: any;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onPlayAudio: (text: string) => Promise<void>;
  currentFileId: string;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  audioEnabled: boolean;
  professorName: string;
  initialMessages?: ChatMessage[];
  setShowFeedback: (show: boolean) => void;
  setUnderstandingAssessment: (assessment: any) => void;
  setHasFirstResponse: (has: boolean) => void;
  onChatResponse: (data: any) => void;
}

function ChatInterface({ 
  onPlayAudio, 
  currentFileId, 
  currentPage, 
  setCurrentPage,
  audioEnabled,
  professorName,
  initialMessages = [],
  setShowFeedback,
  setUnderstandingAssessment,
  setHasFirstResponse,
  onChatResponse,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your AI Learning Assistant. Please upload a PDF to begin our discussion.",
      timestamp: new Date()
    }
  ]);
  const [isConversationEnded, setIsConversationEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    if (!currentFileId) {
      setMessages([{
        role: 'assistant',
        content: "Hello! I'm your AI Learning Assistant. Please upload a PDF to begin our discussion.",
        timestamp: new Date()
      }]);
    }
  }, [currentFileId]);

  const handleSubmit = async (message: string) => {
    if (!currentFileId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          object_id: currentFileId,
          message: message,
          current_page: currentPage
        })
      });

      const data = await response.json();
      
      const newMessages = [
        ...messages,
        { 
          role: 'user', 
          content: message,
          timestamp: new Date()
        }
      ];

      if (data.message) {
        newMessages.push({ 
          role: 'assistant', 
          content: data.message,
          understanding: data.understanding_assessment,
          timestamp: new Date()
        });
      }

      if (data.verification_question) {
        newMessages.push({
          role: 'assistant',
          content: '🤔 Verification Question:\n' + data.verification_question,
          timestamp: new Date()
        });
      }

      setMessages(newMessages);

      if (audioEnabled && data.audio_url) {
        const audioUrl = `http://localhost:8000${data.audio_url}`;
        await onPlayAudio(data.message);
      }

      if (data.current_page !== currentPage) {
        setCurrentPage(data.current_page);
      }

      if (data.end_of_conversation) {
        setIsConversationEnded(true);
      }

      onChatResponse(data);

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your message. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm h-[600px] flex flex-col">
      <ProfessorHeader professorName={professorName} />
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex items-start gap-2 ${
                message.content.startsWith('🤔 Verification Question:') ? 'bg-blue-50 p-4 rounded-lg' : ''
              }`}
            >
              {message.role === 'assistant' ? (
                <Bot className="w-8 h-8 text-blue-500" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600">U</span>
                </div>
              )}
              <div className={`${
                message.role === 'assistant' ? 'bg-gray-100' : 'bg-blue-100'
              } rounded-lg p-3 max-w-[80%]`}>
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.role === 'assistant' && message.understanding && (
                  <div className="mt-2 text-sm text-gray-600">
                    {/* Add understanding visualization here if needed */}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2">
              <Bot className="w-8 h-8 text-blue-500" />
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="animate-pulse">Typing...</div>
              </div>
            </div>
          )}
        </div>
        
        {!isConversationEnded && currentFileId && (
          <MessageInput onSubmit={handleSubmit} />
        )}
      </div>
    </div>
  );
}

export default ChatInterface;