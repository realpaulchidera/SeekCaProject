'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  File, 
  X, 
  Download,
  Eye,
  AlertCircle
} from 'lucide-react'
import { fileUpload, UploadedFile, FileUploadError } from '@/lib/file-upload'
import { cn } from '@/lib/utils'

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
  className
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const handleFiles = useCallback(async (files: FileList) => {
    if (uploadedFiles.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    setUploading(true)
    setError('')
    setUploadProgress(0)

    try {
      const totalFiles = files.length
      let completedFiles = 0

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        try {
          const uploadedFile = await fileUpload.uploadFile(file, userId, {
            folder,
            maxSize,
            allowedTypes
          })

          setUploadedFiles(prev => [...prev, uploadedFile])
          onFileUploaded?.(uploadedFile)
          
          completedFiles++
          setUploadProgress((completedFiles / totalFiles) * 100)
        } catch (error) {
          if (error instanceof FileUploadError) {
            setError(`${file.name}: ${error.message}`)
          } else {
            setError(`Failed to upload ${file.name}`)
          }
        }
      }
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [userId, folder, maxSize, allowedTypes, maxFiles, uploadedFiles.length, onFileUploaded])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }, [handleFiles])

  const handleRemoveFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
    onFileRemoved?.(fileId)
  }, [onFileRemoved])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
          uploading ? 'opacity-50 pointer-events-none' : 'hover:border-gray-400'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
          accept={allowedTypes?.join(',')}
          disabled={uploading || uploadedFiles.length >= maxFiles}
        />
        
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-2">
          Drag and drop files here, or{' '}
          <label htmlFor="file-upload" className="text-blue-600 hover:underline cursor-pointer">
            browse
          </label>
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
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <FileDisplay 
          files={uploadedFiles} 
          onRemove={handleRemoveFile}
        />
      )}
    </div>
  )
}

export function FileDisplay({ files, onDownload, onRemove, className }: FileDisplayProps) {
  const handleDownload = async (file: UploadedFile) => {
    try {
      await fileUpload.downloadFile(file.id)
      onDownload?.(file)
      
      // Open file in new tab
      window.open(file.file_url, '_blank')
    } catch (error) {
      console.error('Error downloading file:', error)
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <h4 className="text-sm font-medium text-gray-900">
        Uploaded Files ({files.length})
      </h4>
      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <span className="text-lg">
                {fileUpload.getFileIcon(file.file_type)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
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
                onClick={() => handleDownload(file)}
                className="h-8 w-8 p-0"
              >
                <Download className="w-4 h-4" />
              </Button>
              
              {onRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(file.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}