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
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  learningProgress: any; // Update this type as needed
  onNewChat: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  setActiveConversationId,
  isCollapsed,
  setIsCollapsed,
  learningProgress,
  onNewChat,
}) => {
  return (
    <div
      className={`${
        isCollapsed ? 'w-16' : 'w-72'
      } h-screen bg-white border-r border-gray-200 flex flex-col relative transition-all duration-300 shadow-sm`}
    >
      {/* UPDATED: Improved collapse toggle button styling */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-4 bg-white rounded-full p-2 shadow-md hover:shadow-lg 
  transition-all duration-300 border border-gray-100 group hover:border-blue-100 
  hover:bg-gradient-to-r hover:from-blue-50 hover:to-white"
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight
            size={16}
            className="text-gray-400 group-hover:text-blue-500 transition-colors duration-300"
          />
        ) : (
          <ChevronLeft
            size={16}
            className="text-gray-400 group-hover:text-blue-500 transition-colors duration-300"
          />
        )}
      </button>

      <div className="p-4 border-b border-gray-100">
        <button
          onClick={onNewChat}
          className={`${
            isCollapsed
              ? 'p-2.5 justify-center'
              : 'py-2.5 px-4 justify-center gap-2'
          } w-full flex items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-sm hover:shadow group`}
        >
          <Plus size={20} className="group-hover:scale-110 transition-transform" />
          {!isCollapsed && <span className="font-medium">New Chat</span>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => setActiveConversationId(conv.id)}
            className={`${
              isCollapsed ? 'px-3 py-4' : 'p-4'
            } cursor-pointer hover:bg-blue-50 transition-all duration-200 border-b border-gray-100 ${
              activeConversationId === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
            }`}
          >
            {isCollapsed ? (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-sm">
                <span className="text-blue-700 font-medium">
                  {conv.fileName.charAt(0).toUpperCase()}
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="font-medium text-gray-900 truncate">
                  {conv.fileName}
                </div>
                <div className="space-y-1.5">
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${conv.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-blue-600 font-medium">
                      {conv.progress}% Complete
                    </span>
                    <span className="text-gray-400">
                      {new Date(conv.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
