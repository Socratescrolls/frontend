import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Upload, Mic, MicOff, Send, Bot, BarChart2, ChevronLeft, ChevronRight, Minimize2, Maximize2, FileText } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import Sidebar, { ChatConversation } from './components/Sidebar';
import NotesPanel from './components/NotesPanel';
import WelcomeForm from './components/WelcomeForm';
import { v4 as uuidv4 } from 'uuid';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

// Add this interface near the top after imports
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

function MainAppContent() {
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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your AI Learning Assistant. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setIsLoading(true);
      setUploadedFile(file);
      setProgress(0);
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('start_page', '1');
        formData.append('professor_name', 'Andrew NG');

        const response = await fetch('http://localhost:8000/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        
        // Add initial response to messages
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);

        // Create new conversation
        const newConversation: ChatConversation = {
          id: data.object_id,
          fileName: file.name,
          progress: 100,
          lastUpdated: new Date()
        };
        
        setConversations(prev => [...prev, newConversation]);
        setActiveConversationId(newConversation.id);
        
        // Handle audio if enabled
        if (audioEnabled && data.audio_url) {
          const audio = new Audio(`http://localhost:8000${data.audio_url}`);
          audio.play();
        }
        
        setProgress(100);
        const fileUrl = URL.createObjectURL(file);
        setFileUrl(fileUrl);
        
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Failed to upload file. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleNewConversation = () => {
    // Reset states
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && activeConversationId) {
      setIsLoading(true);
      
      // Add user message immediately
      const userMessage: ChatMessage = {
        role: 'user',
        content: message.trim(),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      
      try {
        const response = await fetch('http://localhost:8000/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            object_id: activeConversationId,
            message: message.trim(),
            current_page: currentPage
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const data = await response.json();
        
        // Add assistant's response
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        // Handle audio if enabled
        if (audioEnabled && data.audio_url) {
          const audio = new Audio(`http://localhost:8000${data.audio_url}`);
          audio.play();
        }

        // Update current page if it changed
        if (data.current_page !== currentPage) {
          setCurrentPage(data.current_page);
        }

      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
      } finally {
        setMessage('');
        setIsLoading(false);
      }
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

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        setActiveConversationId={setActiveConversationId}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        learningProgress={learningProgress}
      />
      
      <main className="flex-1 flex flex-col">
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-7xl mx-auto">
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
                  {/* PDF Viewer - Fixed width */}
                  <div className="w-[800px] space-y-4">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      {!fileUrl ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                          <input
                            type="file"
                            id="file-upload"
                            accept=".pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <label
                            htmlFor="file-upload"
                            className="cursor-pointer flex flex-col items-center gap-4"
                          >
                            <Upload className="w-16 h-16 text-blue-500" />
                            <div className="text-gray-600">
                              <span className="text-blue-500 font-semibold text-lg">Click to upload</span> or drag and drop
                              <p className="text-sm text-gray-500">PDF files only</p>
                            </div>
                          </label>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="flex justify-center mb-4">
                            <Document
                              file={fileUrl}
                              onLoadSuccess={onDocumentLoadSuccess}
                              className="max-w-full"
                            >
                              <Page 
                                pageNumber={currentPage}
                                width={800}
                                className="shadow-lg"
                              />
                            </Document>
                          </div>
                          
                          {/* Navigation Controls */}
                          <div className="flex justify-center items-center gap-4 mt-4">
                            <button
                              onClick={goToPreviousPage}
                              disabled={currentPage <= 1}
                              className={`p-2 rounded-full ${
                                currentPage <= 1
                                  ? 'bg-gray-100 text-gray-400'
                                  : 'bg-blue-500 text-white hover:bg-blue-600'
                              } transition-colors`}
                            >
                              <ChevronLeft className="w-6 h-6" />
                            </button>
                            <span className="text-sm text-gray-600">
                              Page {currentPage} of {numPages}
                            </span>
                            <button
                              onClick={goToNextPage}
                              disabled={currentPage >= numPages}
                              className={`p-2 rounded-full ${
                                currentPage >= numPages
                                  ? 'bg-gray-100 text-gray-400'
                                  : 'bg-blue-500 text-white hover:bg-blue-600'
                              } transition-colors`}
                            >
                              <ChevronRight className="w-6 h-6" />
                            </button>
                          </div>
                        </div>
                      )}
                      {uploadedFile && progress < 100 && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 mb-2">{uploadedFile.name}</p>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-blue-500 h-1 rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Compact Learning Progress */}
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <div className="flex items-center gap-4">
                        <BarChart2 className="text-blue-500 w-5 h-5" />
                        <div className="flex-1">
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(learningProgress.completed / learningProgress.total) * 100}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {learningProgress.completed}/{learningProgress.total}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Chat Interface - Fixed width */}
                  {!isChatMinimized && (
                    <div className="w-[400px]">
                      <div className="bg-white p-4 rounded-xl shadow-sm h-[600px] flex flex-col">
                        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                          {messages.map((msg, index) => (
                            <div key={index} className="flex items-start gap-2">
                              {msg.role === 'assistant' ? (
                                <Bot className="w-8 h-8 text-blue-500" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-sm">You</span>
                                </div>
                              )}
                              <div className={`rounded-lg p-3 max-w-[80%] ${
                                msg.role === 'assistant' ? 'bg-gray-100' : 'bg-blue-500 text-white'
                              }`}>
                                <p className="text-sm">{msg.content}</p>
                                <span className="text-xs text-gray-500 mt-1 block">
                                  {msg.timestamp.toLocaleTimeString()}
                                </span>
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

                        <form onSubmit={handleSendMessage} className="flex gap-2">
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
                      </div>
                    </div>
                  )}

                  {/* Notes Panel - Fixed width */}
                  {isNotesOpen && (
                    <div className="w-[400px]">
                      <NotesPanel onClose={() => setIsNotesOpen(false)} />
                    </div>
                  )}
                </div>
              </div>

              {/* Quiz Section - Full width */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Quiz</h3>
                <div className="border-t pt-4">
                  <p className="text-gray-600">The quiz will appear here after processing your document.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {isNotesOpen && (
        <NotesPanel onClose={() => setIsNotesOpen(false)} />
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomeForm />} />
        <Route path="/app" element={<MainAppContent />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;