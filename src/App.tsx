import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Upload, Mic, MicOff, Send, Bot, BarChart2, ChevronLeft, ChevronRight, Minimize2, Maximize2, FileText, X } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import Sidebar, { ChatConversation } from './components/Sidebar';
import NotesPanel from './components/NotesPanel';
import WelcomeForm from './components/WelcomeForm';
import { v4 as uuidv4 } from 'uuid';
import UnderstandingFeedback from './components/UnderstandingFeedback';
import FeedbackPanel from './components/FeedbackPanel';
import QuizResults from './components/QuizResults';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

// Add this interface near the top after imports
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Add these interfaces at the top with other interfaces
interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

interface Quiz {
  quiz_title: string;
  questions: QuizQuestion[];
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
    currentPage: 1,
    totalPages: 1
  });
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your AI Learning Assistant. Please upload a PDF to begin our discussion.",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [understandingAssessment, setUnderstandingAssessment] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState(true);
  const [quizResults, setQuizResults] = useState<any>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log("File selected:", file);
    
    if (file && file.type === 'application/pdf') {
      setIsLoading(true);
      setUploadedFile(file);
      setProgress(0);
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('start_page', '1');
        formData.append('professor_name', 'Andrew NG');

        console.log("Uploading file...");
        const response = await fetch('http://localhost:8000/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Upload error:", errorText);
          throw new Error('Upload failed');
        }

        const data = await response.json();
        console.log("Upload response:", data);
        
        // Create new messages array starting fresh
        const newMessages: ChatMessage[] = [
          {
            role: 'assistant',
            content: data.message,
            timestamp: new Date()
          }
        ];

        // Add verification question if present
        if (data.verification_question) {
          newMessages.push({
            role: 'assistant',
            content: '🤔 Verification Question:\n' + data.verification_question,
            timestamp: new Date()
          });
        }

        // Store key points in state instead of adding to messages
        if (data.key_points && data.key_points.length > 0) {
          setKeyPoints(data.key_points);
        }

        // Replace all messages with new ones
        setMessages(newMessages);

        // Create new conversation
        const newConversation: ChatConversation = {
          id: data.object_id,
          fileName: file.name,
          progress: 100,
          lastUpdated: new Date()
        };
        
        console.log("Setting new conversation:", newConversation);
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
    console.log("Sending message:", message, "ConversationId:", activeConversationId);
    
    if (message.trim() && activeConversationId) {
      setIsLoading(true);
      
      // Add user message immediately
      const userMessage: ChatMessage = {
        role: 'user',
        content: message.trim(),
        timestamp: new Date()
      };
      console.log("Adding user message:", userMessage);
      setMessages(prev => {
        console.log("Previous messages before adding user message:", prev);
        return [...prev, userMessage];
      });
      
      try {
        console.log("Making API request with:", {
          object_id: activeConversationId,
          message: message.trim(),
          current_page: currentPage
        });

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
          const errorText = await response.text();
          console.error("API Error:", errorText);
          throw new Error('Failed to send message');
        }

        const data = await response.json();
        console.log("Received chat response:", data);
        
        const newMessages: ChatMessage[] = [];
        
        if (data.message) {
          newMessages.push({
            role: 'assistant',
            content: data.message,
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

        // Update key points if present
        if (data.key_points && data.key_points.length > 0) {
          setKeyPoints(prev => [...prev, ...data.key_points]);
        }

        // Store understanding assessment
        if (data.understanding_assessment) {
          setUnderstandingAssessment(data.understanding_assessment);
        }

        setMessages(prev => {
          console.log("Previous messages:", prev);
          const updated = [...prev, ...newMessages];
          console.log("Updated messages:", updated);
          return updated;
        });

        // Handle recommended action
        if (data.understanding_assessment?.recommended_action === 'next') {
          console.log("Moving to next page");
          setCurrentPage(prev => Math.min(prev + 1, numPages));
        } else if (data.understanding_assessment?.recommended_action === 'stay') {
          console.log("Staying on current page");
        }

        // Check quiz readiness after processing the chat response
        if (activeConversationId) {
          try {
            const quizCheckResponse = await fetch(
              `http://localhost:8000/check-quiz-readiness/${activeConversationId}/${currentPage}`
            );
            const quizCheckData = await quizCheckResponse.json();
            
            if (quizCheckData.quiz_recommended) {
              // Fetch quiz when recommended
              const quizResponse = await fetch(
                `http://localhost:8000/generate-quiz/${activeConversationId}/${currentPage}`
              );
              const quizData = await quizResponse.json();
              
              // Set quiz data and show quiz UI
              setCurrentQuiz(quizData);
              setShowQuiz(true);
              setCurrentQuestionIndex(0);
              setQuizAnswers({});
              
              // Add a message about quiz availability
              setMessages(prev => [...prev, {
                role: 'assistant',
                content: '📝 You\'re ready for a quiz! Scroll down to test your understanding.',
                timestamp: new Date()
              }]);
            }
          } catch (error) {
            console.error('Error checking quiz readiness:', error);
          }
        }

      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
      } finally {
        setMessage('');
        setIsLoading(false);
      }
    } else {
      console.log("Message or conversationId missing:", { message, activeConversationId });
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLearningProgress(prev => ({
      ...prev,
      totalPages: numPages
    }));
  };

  useEffect(() => {
    setLearningProgress(prev => ({
      ...prev,
      currentPage: currentPage
    }));
  }, [currentPage]);

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, numPages));
  };

  // Add this function to check quiz readiness
  const checkQuizReadiness = async () => {
    if (!activeConversationId) return;
    
    try {
      const response = await fetch(
        `http://localhost:8000/check-quiz-readiness/${activeConversationId}/${currentPage}`
      );
      const data = await response.json();
      
      if (data.quiz_recommended) {
        const quizResponse = await fetch(
          `http://localhost:8000/generate-quiz/${activeConversationId}/${currentPage}`
        );
        const quizData = await quizResponse.json();
        setCurrentQuiz(quizData);
        setShowQuiz(true);
        setCurrentQuestionIndex(0);
        setQuizAnswers({});
      }
    } catch (error) {
      console.error('Error checking quiz readiness:', error);
    }
  };

  // Add this function to handle answer selection
  const handleAnswerSelect = async (questionId: string, answerId: string) => {
    const newAnswers = { ...quizAnswers, [questionId]: answerId };
    setQuizAnswers(newAnswers);

    // If this was the last question, submit the quiz
    if (currentQuiz && currentQuestionIndex === currentQuiz.questions.length - 1) {
      try {
        const response = await fetch('http://localhost:8000/evaluate-quiz', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            object_id: activeConversationId,
            current_page: currentPage,
            answers: newAnswers,
          }),
        });
        
        const results = await response.json();
        setQuizResults(results);
        
        // Move to next page if allowed
        if (results.can_move_forward) {
          setTimeout(() => {
            setCurrentPage(prev => Math.min(prev + 1, numPages));
          }, 2000); // Wait 2 seconds before moving to next page
        }
      } catch (error) {
        console.error('Error submitting quiz:', error);
      }
    } else {
      // Move to next question
      setCurrentQuestionIndex(prev => prev + 1);
    }
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
        onNewChat={handleNewConversation}
      />
      
      <main className="flex-1 flex flex-col">
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-[95%] mx-auto">
            {/* Header with Audio Toggle and Notes Toggle */}
            <div className="flex justify-end mb-6 gap-4">
              <button
                onClick={() => {
                  setIsChatMinimized(!isChatMinimized);
                  if (!isChatMinimized) {
                    setIsSidebarCollapsed(true);
                  }
                }}
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
                <div className="flex gap-4 min-w-max pb-4">
                  {/* PDF Viewer - Fixed width */}
                  <div className="w-[1000px] space-y-4">
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
                                width={1000}
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
                              style={{ width: `${(currentPage / numPages) * 100}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          Page {currentPage} of {numPages}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Chat Interface - Fixed width */}
                  {!isChatMinimized && (
                    <div className="w-[450px]">
                      <div className="bg-white p-4 rounded-xl shadow-sm h-[600px] flex flex-col">
                        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                          {messages.map((msg, index) => {
                            console.log("Rendering message:", msg);
                            return (
                              <div 
                                key={index} 
                                className={`flex items-start gap-2 ${
                                  msg.content.startsWith('🤔 Verification Question:') ? 'bg-blue-50 p-4 rounded-lg' : ''
                                }`}
                              >
                                {msg.role === 'assistant' ? (
                                  <Bot className="w-8 h-8 text-blue-500" />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-600">U</span>
                                  </div>
                                )}
                                <div className={`${
                                  msg.role === 'assistant' ? 'bg-gray-100' : 'bg-blue-100'
                                } rounded-lg p-3 max-w-[80%]`}>
                                  <div className="whitespace-pre-wrap">{msg.content}</div>
                                </div>
                              </div>
                            );
                          })}
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

                  {/* Feedback Panel */}
                  {understandingAssessment && showFeedback && (
                    <div className="w-[450px]">
                      <FeedbackPanel 
                        assessment={understandingAssessment} 
                        onClose={() => setShowFeedback(false)}
                      />
                    </div>
                  )}

                  {/* Notes Panel - Fixed width */}
                  {isNotesOpen && (
                    <div className="w-[450px]">
                      <NotesPanel 
                        onClose={() => setIsNotesOpen(false)} 
                        keyPoints={keyPoints}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Quiz Section with Results */}
              <div className="flex gap-4">
                {showQuiz && currentQuiz && (
                  <div className="flex-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">{currentQuiz.quiz_title}</h3>
                        <button
                          onClick={() => setShowQuiz(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="border-t pt-4">
                        <div className="space-y-6">
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-500">
                              Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full w-48">
                              <div 
                                className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                                style={{ width: `${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <p className="text-lg font-medium">
                              {currentQuiz.questions[currentQuestionIndex].question}
                            </p>
                            
                            <div className="space-y-3">
                              {currentQuiz.questions[currentQuestionIndex].options.map((option) => (
                                <button
                                  key={option.id}
                                  onClick={() => handleAnswerSelect(
                                    currentQuiz.questions[currentQuestionIndex].id,
                                    option.id
                                  )}
                                  className={`w-full text-left p-4 rounded-lg border transition-all
                                    ${
                                      quizAnswers[currentQuiz.questions[currentQuestionIndex].id] === option.id
                                        ? 'bg-blue-50 border-blue-500'
                                        : 'hover:bg-gray-50'
                                    }
                                  `}
                                >
                                  <span className="font-medium">{option.id.toUpperCase()}.</span> {option.text}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {quizResults && (
                  <div className="w-[400px]">
                    <QuizResults 
                      results={quizResults}
                      onClose={() => setQuizResults(null)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add a button to show feedback panel when minimized */}
      {understandingAssessment && !showFeedback && (
        <button
          onClick={() => setShowFeedback(true)}
          className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-lg shadow-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <BarChart2 className="w-5 h-5" />
          Show Assessment
        </button>
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