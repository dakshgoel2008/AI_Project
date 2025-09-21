"use client"

import React, { useState, useRef, useCallback, useEffect } from 'react'
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
  const [isVideoReady, setIsVideoReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setIsVideoReady(false)

    try {
      console.log('Requesting camera access...')
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera by default
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        },
        audio: false
      })

      console.log('Camera access granted, setting up video...')
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded')
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              console.log('Video playing')
              setIsVideoReady(true)
              setIsLoading(false)
            }).catch((playError) => {
              console.error('Video play error:', playError)
              setError('Failed to start video preview')
              setIsLoading(false)
            })
          }
        }
      }
    } catch (err) {
      console.error('Camera access error:', err)
      setIsLoading(false)
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera permissions and try again.')
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device.')
        } else if (err.name === 'NotReadableError') {
          setError('Camera is already in use by another application.')
        } else {
          setError('Failed to access camera. Please check your camera permissions.')
        }
      } else {
        setError('An unexpected error occurred while accessing the camera.')
      }
    }
  }, [])

  const stopCamera = useCallback(() => {
    console.log('Stopping camera...')
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop()
        console.log('Stopped track:', track.kind)
      })
      setStream(null)
    }
    setIsVideoReady(false)
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [stream])

  const capturePhoto = useCallback(() => {
    console.log('Capturing photo...')
    if (!videoRef.current || !canvasRef.current || !isVideoReady) {
      console.error('Video not ready for capture')
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) {
      console.error('Cannot get canvas context')
      return
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    console.log('Canvas dimensions:', canvas.width, 'x', canvas.height)

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert canvas to blob and create file
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera-capture-${Date.now()}.jpg`, {
          type: 'image/jpeg'
        })
        console.log('Photo captured:', file.name, file.size, 'bytes')
        onCapture(file)
        handleClose()
      } else {
        console.error('Failed to create blob from canvas')
      }
    }, 'image/jpeg', 0.9)
  }, [onCapture, isVideoReady])

  const handleClose = useCallback(() => {
    stopCamera()
    setError(null)
    setIsLoading(false)
    onClose()
  }, [stopCamera, onClose])

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen && !stream && !isLoading) {
      console.log('Modal opened, starting camera...')
      startCamera()
    }
  }, [isOpen, stream, isLoading, startCamera])

  // Cleanup on unmount or modal close
  useEffect(() => {
    if (!isOpen && stream) {
      stopCamera()
    }
  }, [isOpen, stream, stopCamera])

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      console.log('Component unmounting, cleaning up...')
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

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
                {isLoading ? 'Trying...' : 'Try Again'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Video Stream */}
              <div className="relative rounded-lg overflow-hidden bg-muted aspect-video">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <p className="text-muted-foreground">Accessing camera...</p>
                  </div>
                )}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isVideoReady ? 'visible' : 'invisible'}`}
                />
              </div>

              {/* Capture Button */}
              <div className="flex justify-center space-x-2">
                <Button 
                  onClick={capturePhoto} 
                  className="flex-1" 
                  disabled={!isVideoReady || isLoading}
                >
                  <CameraIcon className="h-4 w-4 mr-2" />
                  {isLoading ? 'Starting Camera...' : 'Capture Photo'}
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