'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  File, 
  X, 
  Download, 
  Eye,
  FileText,
  Image,
  FileArchive,
  AlertCircle
} from 'lucide-react'
import { fileUpload, UploadedFile, FileUploadError } from '@/lib/file-upload'

interface FileUploadProps {
  userId: string
  folder?: string
  maxFiles?: number
  maxSize?: number
  allowedTypes?: string[]
  onFileUploaded?: (file: UploadedFile) => void
  onFileRemoved?: (fileId: string) => void
  className?: string
}

interface FileDisplayProps {
  files: UploadedFile[]
  onDownload?: (file: UploadedFile) => void
  onRemove?: (fileId: string) => void
  showActions?: boolean
  className?: string
}

export function FileUpload({
  userId,
  folder = 'general',
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  allowedTypes,
  onFileUploaded,
  onFileRemoved,
  className = ''
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({})
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList) => {
    setError('')
    
    if (uploadedFiles.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileId = `${Date.now()}-${i}`
      
      try {
        setUploading(prev => [...prev, fileId])
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [fileId]: Math.min((prev[fileId] || 0) + 10, 90)
          }))
        }, 100)

        const uploadedFile = await fileUpload.uploadFile(file, userId, {
          folder,
          maxSize,
          allowedTypes
        })

        clearInterval(progressInterval)
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }))
        
        setUploadedFiles(prev => [...prev, uploadedFile])
        onFileUploaded?.(uploadedFile)
        
        setTimeout(() => {
          setUploading(prev => prev.filter(id => id !== fileId))
          setUploadProgress(prev => {
            const newProgress = { ...prev }
            delete newProgress[fileId]
            return newProgress
          })
        }, 1000)

      } catch (error) {
        console.error('Upload error:', error)
        setUploading(prev => prev.filter(id => id !== fileId))
        setUploadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[fileId]
          return newProgress
        })
        
        if (error instanceof FileUploadError) {
          setError(error.message)
        } else {
          setError('Upload failed. Please try again.')
        }
      }
    }
  }

  const handleRemoveFile = async (fileId: string) => {
    try {
      await fileUpload.deleteFile(fileId)
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
      onFileRemoved?.(fileId)
    } catch (error) {
      console.error('Error removing file:', error)
      setError('Failed to remove file')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-2">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-gray-500">
          {allowedTypes ? 
            `Allowed: ${allowedTypes.map(type => type.split('/')[1]).join(', ')}` :
            'All file types allowed'
          } • Max {fileUpload.formatFileSize(maxSize)}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          accept={allowedTypes?.join(',')}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Progress */}
      {uploading.length > 0 && (
        <div className="space-y-2">
          {uploading.map(fileId => (
            <div key={fileId} className="flex items-center space-x-3">
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress[fileId] || 0}%</span>
                </div>
                <Progress value={uploadProgress[fileId] || 0} className="h-2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <FileDisplay
          files={uploadedFiles}
          onRemove={handleRemoveFile}
          showActions={true}
        />
      )}
    </div>
  )
}

export function FileDisplay({
  files,
  onDownload,
  onRemove,
  showActions = true,
  className = ''
}: FileDisplayProps) {
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="w-4 h-4 text-blue-600" />
    } else if (fileType === 'application/pdf') {
      return <FileText className="w-4 h-4 text-red-600" />
    } else if (fileType.includes('zip') || fileType.includes('archive')) {
      return <FileArchive className="w-4 h-4 text-yellow-600" />
    } else {
      return <File className="w-4 h-4 text-gray-600" />
    }
  }

  const handleDownload = async (file: UploadedFile) => {
    try {
      await fileUpload.downloadFile(file.id)
      window.open(file.file_url, '_blank')
      onDownload?.(file)
    } catch (error) {
      console.error('Error downloading file:', error)
    }
  }

  if (files.length === 0) {
    return null
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {getFileIcon(file.file_type)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.file_name}
              </p>
              <p className="text-xs text-gray-500">
                {fileUpload.formatFileSize(file.file_size)}
                {file.download_count > 0 && ` • ${file.download_count} downloads`}
              </p>
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(file)}
                className="h-8 w-8 p-0"
              >
                <Download className="w-4 h-4" />
              </Button>
              
              {file.file_type.startsWith('image/') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(file.file_url, '_blank')}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}
              
              {onRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(file.id)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}