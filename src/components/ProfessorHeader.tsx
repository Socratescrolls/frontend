import React from 'react';
import { Bot } from 'lucide-react';

interface ProfessorHeaderProps {
  professorName: string;
}

export function ProfessorHeader({ professorName }: ProfessorHeaderProps) {
  return (
    <div className="border-b border-gray-200 p-4 flex items-center gap-3">
      <Bot className="w-8 h-8 text-blue-500" />
      <div>
        <h3 className="font-medium text-gray-900">{professorName}</h3>
        <p className="text-sm text-gray-500">AI Learning Assistant</p>
      </div>
    </div>
  );
} 