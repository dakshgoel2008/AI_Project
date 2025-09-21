"use client"

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sidebar } from "@/components/Sidebar";
import { CameraModal } from "@/components/CameraModal";
import { ChatInterface } from "@/components/ChatInterface";
import { GalleryIcon, MicIcon, PlusIcon, SendIcon, CameraIcon, FileIcon, XIcon } from "@/components/icons";
import { useTimeBasedGreeting } from "@/hooks/useTimeBasedGreeting";
import { SahayakApiService, ChatMessage, validateFile } from "@/lib/api";

export default function SahayakHomePage() {
  const greeting = useTimeBasedGreeting();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const validFiles: File[] = [];
      const errors: string[] = [];
      
      Array.from(files).forEach(file => {
        const validation = validateFile(file);
        if (validation.valid) {
          validFiles.push(file);
        } else {
          errors.push(`${file.name}: ${validation.error}`);
        }
      });
      
      if (validFiles.length > 0) {
        setUploadedFiles(prev => [...prev, ...validFiles]);
      }
      
      if (errors.length > 0) {
        // You could show these errors in a toast or alert
        console.error('File validation errors:', errors);
      }
    }
  };

  const handleCameraCapture = (file: File) => {
    setUploadedFiles(prev => [...prev, file]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() && uploadedFiles.length === 0) return;
    
    // Create user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      files: [...uploadedFiles],
      timestamp: new Date(),
      isUser: true,
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    
    // Create loading message for AI response
    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: "",
      timestamp: new Date(),
      isUser: false,
      isLoading: true,
    };
    
    setMessages(prev => [...prev, loadingMessage]);
    setIsLoading(true);

    // Clear input and files
    const currentInput = inputValue.trim();
    const currentFiles = [...uploadedFiles];
    setInputValue("");
    setUploadedFiles([]);

    try {
      // Send to API
      const response = await SahayakApiService.sendMessage(currentInput, currentFiles);
      
      // Update loading message with response
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id 
          ? {
              ...msg,
              content: response.success ? response.data?.response || response.data?.content || 'Response received' : '',
              isLoading: false,
              error: response.success ? undefined : response.error,
            }
          : msg
      ));
    } catch (error) {
      // Update loading message with error
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id 
          ? {
              ...msg,
              content: '',
              isLoading: false,
              error: error instanceof Error ? error.message : 'An unexpected error occurred',
            }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, uploadedFiles]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInputValue(prompt);
  };

  const suggestedPrompts = [
    "Create a story in Marathi about farmers",
    "Explain different soil types",
    "Design a visual aid for the water cycle",
    "Create a worksheet for grade 3 math",
    "Brainstorm ideas for a science fair",
    "Practice reading assessment",
  ];

  return (
    <Sidebar>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="absolute top-0 right-0 p-4 z-40">
          <ThemeToggle />
        </header>
        
        <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-6 lg:p-8 pt-16 md:pt-4">
          {messages.length === 0 ? (
            // Welcome Screen
            <div className="w-full max-w-4xl mx-auto text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">{greeting}</h1>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-foreground/80 mb-8 lg:mb-12">What can I help you with today?</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-12 sm:mb-16">
                {suggestedPrompts.map((prompt) => (
                  <Button 
                    key={prompt} 
                    variant="outline" 
                    onClick={() => handleSuggestedPrompt(prompt)}
                    className="h-auto text-left justify-start p-3 sm:p-4 bg-card hover:bg-muted whitespace-normal break-words min-h-[3rem] text-xs sm:text-sm transition-colors"
                  >
                    <span className="line-clamp-2 leading-relaxed">{prompt}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            // Chat Interface
            <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col">
              <ChatInterface messages={messages} isLoading={isLoading} />
            </div>
          )}
        </main>

        {/* Input Bar Footer */}
        <footer className="sticky bottom-0 w-full p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl mx-auto">
            {/* File Upload Previews */}
            {uploadedFiles.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-card rounded-lg p-2 border">
                    <FileIcon className="h-4 w-4 text-foreground/60" />
                    <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-foreground/50 hover:text-foreground/80"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative">
              <Input
                placeholder="Ask anything..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full h-12 md:h-14 pl-12 pr-32 md:pr-36 rounded-full bg-card/80 backdrop-blur-sm focus-visible:ring-1 focus-visible:ring-ring text-sm md:text-base"
              />
              
              {/* File upload input (hidden) */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2">
                <button 
                  className="p-1 rounded-full hover:bg-muted transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload files (images, PDFs)"
                >
                  <PlusIcon className="h-4 w-4 md:h-5 md:w-5 text-foreground/70" />
                </button>
              </div>
              
              <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                <button 
                  className="p-1 rounded-full hover:bg-muted transition-colors"
                  title="Record audio"
                >
                  <MicIcon className="h-4 w-4 md:h-5 md:w-5 text-foreground/70" />
                </button>
                <button 
                  className="p-1 rounded-full hover:bg-muted transition-colors"
                  onClick={() => setIsCameraOpen(true)}
                  title="Take a photo"
                >
                  <CameraIcon className="h-4 w-4 md:h-5 md:w-5 text-foreground/70" />
                </button>
                <button 
                  className="p-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors disabled:opacity-50"
                  onClick={handleSend}
                  disabled={!inputValue.trim() && uploadedFiles.length === 0}
                  title="Send message"
                >
                  <SendIcon className="h-4 w-4 md:h-5 md:w-5" />
                </button>
              </div>
            </div>
            <p className="text-xs text-center text-foreground/50 mt-2">
              Sahayak may make mistakes. Consider checking important information.
            </p>
          </div>
        </footer>
      </div>

      {/* Camera Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </Sidebar>
  );
}