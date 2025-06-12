'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FileUpload, FileDisplay } from '@/components/ui/file-upload'
import { 
  MessageSquare, 
  Send, 
  Search, 
  Phone, 
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Clock,
  CheckCheck,
  X
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { messageQueries } from '@/lib/database'
import { fileUpload, UploadedFile } from '@/lib/file-upload'

export default function MessagesPage() {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [messageFiles, setMessageFiles] = useState<{[key: string]: UploadedFile[]}>({})

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/auth/login')
          return
        }

        setUser(user)

        // Get user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setProfile(profileData)

        // Get conversations
        const conversationsData = await messageQueries.getConversations(user.id)
        setConversations(conversationsData)

        // Select first conversation if available
        if (conversationsData.length > 0) {
          setSelectedConversation(conversationsData[0])
          loadMessages(conversationsData[0].id)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async (conversationId: string) => {
    try {
      const messagesData = await messageQueries.getMessages(conversationId)
      setMessages(messagesData)
      
      // Load files for each message
      const filesMap: {[key: string]: UploadedFile[]} = {}
      for (const message of messagesData) {
        const files = await fileUpload.getFilesByMessage(message.id)
        if (files.length > 0) {
          filesMap[message.id] = files
        }
      }
      setMessageFiles(filesMap)
      
      // Mark messages as read
      await messageQueries.markMessagesAsRead(conversationId, user.id)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return

    setSending(true)
    try {
      const messageData = {
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        content: newMessage.trim(),
        message_type: 'text'
      }

      const sentMessage = await messageQueries.sendMessage(messageData)
      setMessages(prev => [...prev, sentMessage])
      setNewMessage('')
      setShowFileUpload(false)
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileUploaded = async (file: UploadedFile) => {
    if (!selectedConversation) return

    try {
      // Create a message for the file
      const messageData = {
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        content: `Shared a file: ${file.file_name}`,
        message_type: 'file'
      }

      const sentMessage = await messageQueries.sendMessage(messageData)
      
      // Attach file to message
      await fileUpload.attachToMessage(file.id, sentMessage.id)
      
      setMessages(prev => [...prev, sentMessage])
      setMessageFiles(prev => ({
        ...prev,
        [sentMessage.id]: [file]
      }))
    } catch (error) {
      console.error('Error sending file:', error)
    }
  }

  const getOtherParticipant = (conversation: any) => {
    if (profile?.role === 'professional') {
      return conversation.hirer
    } else {
      return conversation.professional
    }
  }

  const getParticipantName = (participant: any) => {
    if (participant.first_name && participant.last_name) {
      return `${participant.first_name} ${participant.last_name}`
    }
    return participant.company_name || 'User'
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString()
  }

  const filteredConversations = conversations.filter(conv => {
    const participant = getOtherParticipant(conv)
    const name = getParticipantName(participant)
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           conv.job?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
          <div className="flex h-full">
            {/* Conversations Sidebar */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <h1 className="text-xl font-semibold text-gray-900 mb-4">Messages</h1>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="p-6 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="font-medium text-gray-900 mb-2">No conversations</h3>
                    <p className="text-sm text-gray-600">
                      Start a conversation by applying to jobs or contacting professionals
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {filteredConversations.map((conversation) => {
                      const participant = getOtherParticipant(conversation)
                      const isSelected = selectedConversation?.id === conversation.id
                      
                      return (
                        <div
                          key={conversation.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => {
                            setSelectedConversation(conversation)
                            loadMessages(conversation.id)
                          }}
                        >
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={participant?.avatar_url} alt={getParticipantName(participant)} />
                              <AvatarFallback className="bg-blue-100 text-blue-700">
                                {getParticipantName(participant)[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {getParticipantName(participant)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {getTimeAgo(conversation.last_message_at)}
                                </p>
                              </div>
                              {conversation.job && (
                                <p className="text-xs text-blue-600 truncate">
                                  Re: {conversation.job.title}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 truncate mt-1">
                                Click to view conversation
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={getOtherParticipant(selectedConversation)?.avatar_url} 
                            alt={getParticipantName(getOtherParticipant(selectedConversation))} 
                          />
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {getParticipantName(getOtherParticipant(selectedConversation))[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h2 className="font-medium text-gray-900">
                            {getParticipantName(getOtherParticipant(selectedConversation))}
                          </h2>
                          {selectedConversation.job && (
                            <p className="text-sm text-blue-600">
                              Re: {selectedConversation.job.title}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Video className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => {
                      const isOwnMessage = message.sender_id === user.id
                      const files = messageFiles[message.id] || []
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isOwnMessage 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            {message.message_type === 'file' ? (
                              <div className="space-y-2">
                                <p className="text-sm">{message.content}</p>
                                {files.length > 0 && (
                                  <FileDisplay
                                    files={files}
                                    onDownload={(file) => window.open(file.file_url, '_blank')}
                                    className="mt-2"
                                  />
                                )}
                              </div>
                            ) : (
                              <p className="text-sm">{message.content}</p>
                            )}
                            <div className={`flex items-center justify-end mt-1 space-x-1 ${
                              isOwnMessage ? 'text-blue-200' : 'text-gray-500'
                            }`}>
                              <span className="text-xs">
                                {new Date(message.created_at).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                              {isOwnMessage && (
                                <CheckCheck className="h-3 w-3" />
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    {/* File Upload Area */}
                    {showFileUpload && (
                      <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium">Share Files</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFileUpload(false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <FileUpload
                          userId={user.id}
                          folder="messages"
                          maxFiles={3}
                          onFileUploaded={handleFileUploaded}
                          className="max-w-none"
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Paperclip 
                          className="h-4 w-4" 
                          onClick={() => setShowFileUpload(!showFileUpload)}
                        />
                      </Button>
                      <div className="flex-1 relative">
                        <Input
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          disabled={sending}
                        />
                      </div>
                      <Button variant="ghost" size="sm">
                        <Smile className="h-4 w-4" />
                      </Button>
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sending}
                        size="sm"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-gray-600">
                      Choose a conversation from the sidebar to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}