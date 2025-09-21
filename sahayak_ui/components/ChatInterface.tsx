"use client"

import React from 'react'
import { ChatMessage } from '@/lib/api'
import { FileIcon } from '@/components/icons'
import { formatFileSize, isImageFile, isPdfFile } from '@/lib/api'

interface ChatInterfaceProps {
  messages: ChatMessage[]
  isLoading?: boolean
}

export function ChatInterface({ messages, isLoading }: ChatInterfaceProps) {
  if (messages.length === 0) {
    return null
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[60vh]">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`flex gap-3 max-w-[80%] ${
              message.isUser ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.isUser
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {message.isUser ? (
                <UserIcon className="h-4 w-4" />
              ) : (
                <BotIcon className="h-4 w-4" />
              )}
            </div>

            {/* Message Content */}
            <div
              className={`rounded-lg p-3 ${
                message.isUser
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {/* Files */}
              {message.files && message.files.length > 0 && (
                <div className="mb-2 space-y-2">
                  {message.files.map((file, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 p-2 rounded border ${
                        message.isUser
                          ? 'border-primary-foreground/20 bg-primary-foreground/10'
                          : 'border-border bg-background'
                      }`}
                    >
                      {isImageFile(file) && (
                        <div className="w-16 h-16 rounded overflow-hidden">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FileIcon className="h-4 w-4" />
                          <span className="text-sm font-medium truncate">
                            {file.name}
                          </span>
                        </div>
                        <p className="text-xs opacity-70">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Text Content */}
              {message.content && (
                <div className="whitespace-pre-wrap text-sm">
                  {message.content}
                </div>
              )}

              {/* Loading State */}
              {message.isLoading && (
                <div className="flex items-center gap-2 text-sm opacity-70">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                  <span>Thinking...</span>
                </div>
              )}

              {/* Error State */}
              {message.error && (
                <div className="text-destructive text-sm mt-2">
                  <span className="font-medium">Error:</span> {message.error}
                </div>
              )}

              {/* Timestamp */}
              <div className="text-xs opacity-50 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Global Loading State */}
      {isLoading && (
        <div className="flex justify-start">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
              <BotIcon className="h-4 w-4" />
            </div>
            <div className="bg-muted text-muted-foreground rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                <span>Processing your request...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper component for user icon
const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

// Helper component for bot icon
const BotIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path d="M15 13v2" />
    <path d="M9 13v2" />
  </svg>
)