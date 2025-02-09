import { useAudioController } from '/hooks/useAudioController';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
import React, { useState, useEffect } from 'react';
import { Upload, Mic, MicOff, Send, Bot, BarChart2, ChevronLeft, ChevronRight, Minimize2, Maximize2, FileText } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import Sidebar from './Sidebar';
import NotesPanel from './NotesPanel';
import UnderstandingFeedback from './UnderstandingFeedback';
import ChatInterface from './ChatInterface';
import { ChatMessage, ChatConversation, Quiz, UnderstandingAssessmentType } from '../types';

function MainAppContent() {
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [message, setMessage] = useState('');
    const [progress, setProgress] = useState(0);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    // const [isChatMinimized, setIsChatMinimized] = useState(false); // Removed
    const [isNotesOpen, setIsNotesOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [numPages, setNumPages] = useState(0);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    // const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Removed
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
    const [hasFirstResponse, setHasFirstResponse] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [quizResults, setQuizResults] = useState<any>(null);
    const [professorName, setProfessorName] = useState('Andrew NG');
    // const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
    const { playAudio, stopCurrentAudio, isPlaying } = useAudioController(audioEnabled);
    const [understandingAssessment, setUnderstandingAssessment] = useState<UnderstandingAssessmentType | null>(null);
  // At the top of MainAppContent.tsx with other state declarations
  const [layout, setLayout] = useState({
    isChatMinimized: false,
    isSidebarCollapsed: false
  });

  const handleLayoutChange = (change: {
    isChatMinimized?: boolean;
    isSidebarCollapsed?: boolean;
  }) => {
    setLayout(prev => ({
      ...prev,
      ...change
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      setHasFirstResponse(false);
      setUnderstandingAssessment(null);
      setShowFeedback(false);
      
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
          formData.append('professor_name', professorName);
  
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
            await handlePlayAudio(data.message);
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
  
          const data = await response.json();
          
          // Handle audio if enabled and audio_url is provided
          if (audioEnabled && data.audio_url) {
            await handlePlayAudio(data.message);
          }
  
          // Add assistant messages
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
            setUnderstandingAssessment(data);
          }
  
          setMessages(prev => {
            const updated = [...prev, ...newMessages];
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
  const handlePlayAudio = async (text: string) => {
    await playAudio(text);
  };

    // Update the handleSubmit function in ChatInterface to properly handle the response
    const handleChatResponse = (data: any) => {
      if (data.understanding_assessment) {
        setUnderstandingAssessment(data);
        setHasFirstResponse(true);
        setShowFeedback(true);
      }
    };

  const handleAudioToggle = () => {
    if (audioEnabled) {
      stopCurrentAudio();
    }
    setAudioEnabled(!audioEnabled);
  };
  
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          setActiveConversationId={setActiveConversationId}
          isCollapsed={layout.isSidebarCollapsed}
          setIsCollapsed={(collapsed) => handleLayoutChange({ isSidebarCollapsed: collapsed })}
          learningProgress={learningProgress}
          onNewChat={handleNewConversation}
        />
        
        <main className="flex-1 flex flex-col">
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-[95%] mx-auto">
              {/* Header with Audio Toggle and Notes Toggle */}
              <div className="flex justify-end mb-6 gap-4">
                <button
                  onClick={() => handleLayoutChange({ isChatMinimized: !layout.isChatMinimized })}
                  className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  {layout.isChatMinimized ? <Maximize2 className="text-blue-500" /> : <Minimize2 className="text-blue-500" />}
                  {layout.isChatMinimized ? 'Show Chat' : 'Minimize Chat'}
                </button>
                <button
                  onClick={handleAudioToggle}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all ${
                    audioEnabled 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white text-gray-500'
                  }`}
                  title={audioEnabled ? 'Click to disable voice responses' : 'Click to enable voice responses'}
                >
                  {audioEnabled ? (
                    <Mic className="w-5 h-5" />
                  ) : (
                    <MicOff className="w-5 h-5" />
                  )}
                  {audioEnabled ? 'Voice Enabled' : 'Voice Disabled'}
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
                {/* Main content area */}
                <div className="flex gap-4">
                  {/* Left side - PDF Viewer */}
                  <div className="flex-1">
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
                    <div className="bg-white p-4 rounded-xl shadow-sm mt-4">
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
  
                  {/* Middle - Chat Interface */}
                  <div className="w-[450px]">
                    {!layout.isChatMinimized && (
                      // Updated ChatInterface component with handlePlayAudio
                      <ChatInterface
                        onPlayAudio={handlePlayAudio}
                        currentFileId={activeConversationId}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        audioEnabled={audioEnabled}
                        professorName={professorName}
                        initialMessages={messages}
                        setShowFeedback={setShowFeedback}
                        setUnderstandingAssessment={setUnderstandingAssessment}
                        setHasFirstResponse={setHasFirstResponse}
                        onChatResponse={handleChatResponse}
                      />
                    )}
                  </div>
  
                  {/* Right side - Understanding Feedback and Notes */}
                  <div className="w-[350px] space-y-4">
                    {hasFirstResponse && showFeedback && understandingAssessment?.understanding_assessment && (
                      <UnderstandingFeedback
                        assessment={understandingAssessment}
                        onClose={() => setShowFeedback(false)}
                      />
                    )}
                    {isNotesOpen && (
                      <NotesPanel
                        currentPage={currentPage}
                        keyPoints={keyPoints}
                        onClose={() => setIsNotesOpen(false)}
                      />
                    )}
                  </div>
                </div>
              </div>
  
              {/* Quiz Component */}
              {currentQuiz && (
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <h3 className="text-lg font-medium mb-4">
                    {currentQuiz.quiz_title}
                  </h3>
                  {currentQuiz.questions[currentQuestionIndex] && (
                    <div className="space-y-4">
                      <p className="text-gray-700">
                        {currentQuiz.questions[currentQuestionIndex].question}
                      </p>
                      <div className="space-y-2">
                        {currentQuiz.questions[currentQuestionIndex].options.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handleAnswerSelect(
                              currentQuiz.questions[currentQuestionIndex].id,
                              option.id
                            )}
                            className="w-full text-left p-3 rounded-lg border hover:bg-blue-50 hover:border-blue-500 transition-colors"
                          >
                            {option.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
  
              {/* Quiz Results */}
              {quizResults && (
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <h3 className="text-lg font-medium mb-4">Quiz Results</h3>
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      Score: {quizResults.score_percentage}%
                    </p>
                    <p className="text-gray-700">
                      {quizResults.recommendation_for_professor}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }


export default MainAppContent;