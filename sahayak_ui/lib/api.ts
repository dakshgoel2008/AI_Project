// API service for Sahayak backend communication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4444/api'
const SAHAYAK_API_URL = process.env.NEXT_PUBLIC_SAHAYAK_API_URL || 'http://localhost:8000'

export interface ChatMessage {
  id: string
  content: string
  files?: File[]
  timestamp: Date
  isUser: boolean
  isLoading?: boolean
  error?: string
}

export interface ApiResponse {
  success: boolean
  data?: any
  message?: string
  error?: string
}

export class SahayakApiService {
  // Send message with text and files to the AI model
  static async sendMessage(
    message: string, 
    files: File[] = []
  ): Promise<ApiResponse> {
    try {
      // For text-only messages, use generate-content endpoint
      if (files.length === 0) {
        const response = await fetch(`${SAHAYAK_API_URL}/generate-content`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: message,
            grade_levels: [1, 2, 3], // Default grade levels
            subject: "general",
            location: "India"
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return {
          success: true,
          data: data,
          message: 'Message sent successfully'
        }
      }
      
      // For messages with files, we need to handle them differently
      const imageFiles = files.filter(file => file.type.startsWith('image/'))
      const pdfFiles = files.filter(file => file.type === 'application/pdf')
      
      // Process first image if available
      if (imageFiles.length > 0) {
        return await this.processImage(imageFiles[0], message)
      }
      
      // Process first PDF if available
      if (pdfFiles.length > 0) {
        return await this.processPdf(pdfFiles[0], message)
      }

      // Fallback to text-only
      return await this.sendMessage(message, [])
      
    } catch (error) {
      console.error('Error sending message:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // Check health of backend services
  static async checkHealth(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/sahayak/health`)
      const data = await response.json()
      
      return {
        success: response.ok,
        data: data,
        message: response.ok ? 'Services healthy' : 'Some services unavailable'
      }
    } catch (error) {
      return {
        success: false,
        error: 'Unable to connect to backend services'
      }
    }
  }

  // Upload file and get processed response
  static async uploadFile(file: File, prompt?: string): Promise<ApiResponse> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (prompt) {
        formData.append('prompt', prompt)
      }

      const response = await fetch(`${SAHAYAK_API_URL}/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        data: data,
        message: 'File uploaded and processed successfully'
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'File upload failed'
      }
    }
  }

  // Process image with AI
  static async processImage(
    image: File, 
    prompt: string = "Analyze this image"
  ): Promise<ApiResponse> {
    try {
      const formData = new FormData()
      formData.append('file', image)
      formData.append('grade_levels', '1,2,3') // Default grade levels

      const response = await fetch(`${SAHAYAK_API_URL}/analyze-image`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        data: {
          response: data.analysis || 'Image analysis completed',
          metadata: data.metadata
        },
        message: 'Image processed successfully'
      }
    } catch (error) {
      console.error('Error processing image:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Image processing failed'
      }
    }
  }

  // Process PDF with AI
  static async processPdf(
    pdf: File, 
    prompt: string = "Analyze this document"
  ): Promise<ApiResponse> {
    try {
      const formData = new FormData()
      formData.append('pdf', pdf)
      formData.append('prompt', prompt)

      const response = await fetch(`${SAHAYAK_API_URL}/analyze-pdf`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        data: data,
        message: 'PDF processed successfully'
      }
    } catch (error) {
      console.error('Error processing PDF:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PDF processing failed'
      }
    }
  }

  // Get chat history (if implemented in backend)
  static async getChatHistory(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/sahayak/history`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return {
        success: true,
        data: data,
        message: 'Chat history retrieved successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to retrieve chat history'
      }
    }
  }
}

// Utility functions
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/')
}

export const isPdfFile = (file: File): boolean => {
  return file.type === 'application/pdf'
}

export const getSupportedFileTypes = (): string[] => {
  return ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
}

export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const supportedTypes = getSupportedFileTypes()
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' }
  }
  
  if (!supportedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not supported. Please use images or PDFs.' }
  }
  
  return { valid: true }
}