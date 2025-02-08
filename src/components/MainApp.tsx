import React, { useState, useEffect } from 'react';
import { Upload, Mic, MicOff, Send, Bot, BarChart2, ChevronLeft, ChevronRight, Minimize2, Maximize2, FileText } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import Sidebar, { ChatConversation } from './Sidebar';
import NotesPanel from './NotesPanel';
import { v4 as uuidv4 } from 'uuid';
import { FormData } from './WelcomeForm';
import { useNavigate } from 'react-router-dom';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

function MainApp() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<FormData | null>(null);

  useEffect(() => {
    // Check if user data exists
    const storedData = localStorage.getItem('userFormData');
    if (!storedData) {
      // Redirect to welcome form if no user data
      navigate('/');
      return;
    }
    setUserData(JSON.parse(storedData));
  }, [navigate]);

  // Your existing state declarations
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [learningProgress, setLearningProgress] = useState({
    completed: 3,
    total: 10,
    currentTopic: 'Introduction to React',
    timeSpent: '45 minutes'
  });

  // Your existing handlers and functions
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      setProgress(0);
      const fileUrl = URL.createObjectURL(file);
      setFileUrl(fileUrl);
      
      const newConversation: ChatConversation = {
        id: uuidv4(),
        fileName: file.name,
        progress: 0,
        lastUpdated: new Date()
      };
      
      setConversations(prev => [...prev, newConversation]);
      setActiveConversationId(newConversation.id);
      
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);
    }
  };

  const handleNewConversation = () => {
    setUploadedFile(null);
    setFileUrl(null);
    setProgress(0);
    setMessage('');
    setActiveConversationId(null);
  };

  const handleConversationSelect = (id: string) => {
    setActiveConversationId(id);
    const conversation = conversations.find(conv => conv.id === id);
    // TODO: Load conversation data, messages, and file
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      setMessage('');
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, numPages));
  };

  if (!userData) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar
        conversations={conversations}
        activeConversation={activeConversationId}
        isCollapsed={isSidebarCollapsed}
        onConversationSelect={handleConversationSelect}
        onNewConversation={handleNewConversation}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col">
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-7xl mx-auto">
            {/* User Info */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
              <p className="text-gray-600">Welcome, {userData.fullName}</p>
              <p className="text-sm text-gray-500">{userData.major} - {userData.yearLevel}</p>
            </div>

            {/* Header with Audio Toggle and Notes Toggle */}
            <div className="flex justify-end mb-6 gap-4">
              <button
                onClick={() => setIsChatMinimized(!isChatMinimized)}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                {isChatMinimized ? <Maximize2 className="text-blue-500" /> : <Minimize2 className="text-blue-500" />}
                {isChatMinimized ? 'Show Chat' : 'Minimize Chat'}
              </button>
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                {audioEnabled ? <Mic className="text-green-500" /> : <MicOff className="text-red-500" />}
                {audioEnabled ? 'Audio Enabled' : 'Audio Disabled'}
              </button>
              <button
                onClick={() => setIsNotesOpen(!isNotesOpen)}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                <FileText className={isNotesOpen ? "text-blue-500" : "text-gray-500"} />
                Notes
              </button>
            </div>

            <div className="space-y-8">
              {/* Horizontally scrollable container for main components */}
              <div className="overflow-x-auto">
                <div className="flex gap-8 min-w-max pb-4">
                  {/* Rest of your existing JSX */}
                  {/* ... */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainApp;
