'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  X, 
  File, 
  Image, 
  FileText, 
  Download,
  Trash2,
  AlertCircle
} from 'lucide-react'
import { fileUpload, FileUploadError, UploadedFile } from '@/lib/file-upload'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFileUploaded?: (file: UploadedFile) => void
  onFileRemoved?: (fileId: string) => void
  maxFiles?: number
  maxSize?: number
  allowedTypes?: string[]
  className?: string
  disabled?: boolean
  userId: string
  folder?: string
}

interface FileUploadState {
  files: UploadedFile[]
  uploading: boolean
  progress: number
  error: string | null
}

export function FileUpload({
  onFileUploaded,
  onFileRemoved,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  allowedTypes,
  className,
  disabled = false,
  userId,
  folder = 'general'
}: FileUploadProps) {
  const [state, setState] = useState<FileUploadState>({
    files: [],
    uploading: false,
    progress: 0,
    error: null
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(async (files: FileList) => {
    if (disabled || state.uploading) return

    const fileArray = Array.from(files)
    
    // Check file count limit
    if (state.files.length + fileArray.length > maxFiles) {
      setState(prev => ({
        ...prev,
        error: `Maximum ${maxFiles} files allowed`
      }))
      return
    }

    setState(prev => ({ ...prev, uploading: true, error: null, progress: 0 }))

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]
        
        setState(prev => ({
          ...prev,
          progress: ((i + 1) / fileArray.length) * 100
        }))

        const uploadedFile = await fileUpload.uploadFile(file, userId, {
          folder,
          maxSize,
          allowedTypes
        })

        setState(prev => ({
          ...prev,
          files: [...prev.files, uploadedFile]
        }))

        onFileUploaded?.(uploadedFile)
      }
    } catch (error) {
      const errorMessage = error instanceof FileUploadError 
        ? error.message 
        : 'Upload failed'
      
      setState(prev => ({
        ...prev,
        error: errorMessage
      }))
    } finally {
      setState(prev => ({
        ...prev,
        uploading: false,
        progress: 0
      }))
    }
  }, [disabled, state.uploading, state.files.length, maxFiles, userId, folder, maxSize, allowedTypes, onFileUploaded])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (disabled || state.uploading) return
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }, [disabled, state.uploading, handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const removeFile = async (fileId: string) => {
    try {
      await fileUpload.deleteFile(fileId)
      setState(prev => ({
        ...prev,
        files: prev.files.filter(f => f.id !== fileId)
      }))
      onFileRemoved?.(fileId)
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to remove file'
      }))
    }
  }

  const downloadFile = async (file: UploadedFile) => {
    try {
      await fileUpload.downloadFile(file.id)
      window.open(file.file_url, '_blank')
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />
    if (fileType === 'application/pdf') return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          disabled || state.uploading
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer',
          state.error && 'border-red-300 bg-red-50'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !disabled && !state.uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          accept={allowedTypes?.join(',')}
          disabled={disabled || state.uploading}
        />
        
        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-1">
          {state.uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
        </p>
        <p className="text-xs text-gray-500">
          Max {maxFiles} files, {fileUpload.formatFileSize(maxSize)} each
        </p>
        
        {allowedTypes && (
          <p className="text-xs text-gray-500 mt-1">
            Supported: {allowedTypes.map(type => type.split('/')[1]).join(', ')}
          </p>
        )}
      </div>

      {/* Upload Progress */}
      {state.uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading files...</span>
            <span>{Math.round(state.progress)}%</span>
          </div>
          <Progress value={state.progress} />
        </div>
      )}

      {/* Error Message */}
      {state.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* File List */}
      {state.files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files</h4>
          <div className="space-y-2">
            {state.files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.file_type)}
                  <div>
                    <p className="text-sm font-medium truncate max-w-xs">
                      {file.file_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {fileUpload.formatFileSize(file.file_size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadFile(file)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface FileDisplayProps {
  files: UploadedFile[]
  onDownload?: (file: UploadedFile) => void
  onRemove?: (fileId: string) => void
  showRemove?: boolean
  className?: string
}

export function FileDisplay({
  files,
  onDownload,
  onRemove,
  showRemove = false,
  className
}: FileDisplayProps) {
  if (files.length === 0) return null

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />
    if (fileType === 'application/pdf') return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  return (
    <div className={cn('space-y-2', className)}>
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between p-2 bg-gray-50 rounded border"
        >
          <div className="flex items-center space-x-2">
            {getFileIcon(file.file_type)}
            <div>
              <p className="text-sm font-medium truncate max-w-xs">
                {file.file_name}
              </p>
              <p className="text-xs text-gray-500">
                {fileUpload.formatFileSize(file.file_size)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDownload?.(file)}
            >
              <Download className="h-3 w-3" />
            </Button>
            {showRemove && onRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(file.id)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}