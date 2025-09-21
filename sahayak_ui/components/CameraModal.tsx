"use client"

import React, { useState, useRef, useCallback } from 'react'
import { Button } from './ui/button'
import { CameraIcon, XIcon } from './icons'

interface CameraModalProps {
  isOpen: boolean
  onClose: () => void
  onCapture: (file: File) => void
}

export function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera by default
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      })

      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
      }
    } catch (err) {
      console.error('Camera access error:', err)
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera permissions and try again.')
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device.')
        } else {
          setError('Failed to access camera. Please check your camera permissions.')
        }
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert canvas to blob and create file
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera-capture-${Date.now()}.jpg`, {
          type: 'image/jpeg'
        })
        onCapture(file)
        handleClose()
      }
    }, 'image/jpeg', 0.9)
  }, [onCapture])

  const handleClose = useCallback(() => {
    stopCamera()
    setError(null)
    onClose()
  }, [stopCamera, onClose])

  // Start camera when modal opens
  React.useEffect(() => {
    if (isOpen && !stream && !isLoading) {
      startCamera()
    }
  }, [isOpen, stream, isLoading, startCamera])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold">Take a Photo</h3>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <XIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          {error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={startCamera} disabled={isLoading}>
                Try Again
              </Button>
            </div>
          ) : isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Accessing camera...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Video Stream */}
              <div className="relative rounded-lg overflow-hidden bg-muted">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                />
              </div>

              {/* Capture Button */}
              <div className="flex justify-center space-x-2">
                <Button onClick={capturePhoto} className="flex-1" disabled={!stream}>
                  <CameraIcon className="h-4 w-4 mr-2" />
                  Capture Photo
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}