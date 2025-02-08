import React from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

export interface ChatConversation {
  id: string;
  fileName: string;
  progress: number;
  lastUpdated: Date;
}

interface SidebarProps {
  conversations: ChatConversation[];
  activeConversation: string | null;
  isCollapsed: boolean;
  onConversationSelect: (id: string) => void;
  onNewConversation: () => void;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversation,
  isCollapsed,
  onConversationSelect,
  onNewConversation,
  onToggleCollapse,
}) => {
  return (
    <div 
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } h-screen bg-gray-100 border-r border-gray-200 flex flex-col relative transition-all duration-300`}
    >
      {/* Collapse toggle button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-4 bg-white rounded-full p-1 shadow-md hover:shadow-lg transition-shadow"
      >
        {isCollapsed ? (
          <ChevronRight size={16} className="text-gray-600" />
        ) : (
          <ChevronLeft size={16} className="text-gray-600" />
        )}
      </button>

      <div className="p-4">
        <button
          onClick={onNewConversation}
          className={`${
            isCollapsed 
              ? 'p-2 justify-center'
              : 'py-2 px-4 justify-center gap-2'
          } w-full flex items-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors`}
        >
          <Plus size={20} />
          {!isCollapsed && <span>New Chat</span>}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => onConversationSelect(conv.id)}
            className={`${
              isCollapsed ? 'px-2 py-3' : 'p-3'
            } cursor-pointer hover:bg-gray-200 transition-colors ${
              activeConversation === conv.id ? 'bg-gray-200' : ''
            }`}
          >
            {isCollapsed ? (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                {conv.fileName.charAt(0).toUpperCase()}
              </div>
            ) : (
              <>
                <div className="font-medium truncate">{conv.fileName}</div>
                <div className="text-sm text-gray-500 mt-1">
                  Progress: {conv.progress}%
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(conv.lastUpdated).toLocaleDateString()}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
