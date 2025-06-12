'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { 
  Bell, 
  Settings, 
  Check, 
  Trash2, 
  MoreVertical,
  X,
  CheckCheck
} from 'lucide-react'
import { notificationService, Notification, NotificationPreferences } from '@/lib/notifications'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface NotificationCenterProps {
  userId: string
}

export function NotificationCenter({ userId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    loadNotifications()
    loadPreferences()
    
    // Subscribe to real-time notifications
    const unsubscribe = notificationService.subscribeToRealtime(userId, (notification) => {
      setNotifications(prev => [notification, ...prev])
      setUnreadCount(prev => prev + 1)
    })

    return unsubscribe
  }, [userId])

  const loadNotifications = async () => {
    try {
      const [notificationsData, unreadCountData] = await Promise.all([
        notificationService.getNotifications(userId),
        notificationService.getUnreadCount(userId)
      ])
      
      setNotifications(notificationsData)
      setUnreadCount(unreadCountData)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPreferences = async () => {
    try {
      const preferencesData = await notificationService.getPreferences(userId)
      setPreferences(preferencesData)
    } catch (error) {
      console.error('Failed to load preferences:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId)
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(userId)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      
      // Update unread count if the deleted notification was unread
      const notification = notifications.find(n => n.id === notificationId)
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    try {
      const updatedPreferences = await notificationService.updatePreferences(userId, updates)
      setPreferences(updatedPreferences)
    } catch (error) {
      console.error('Failed to update preferences:', error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id)
    }
    
    if (notification.action_url) {
      window.location.href = notification.action_url
    }
    
    setIsOpen(false)
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

  const groupedNotifications = {
    unread: notifications.filter(n => !n.is_read),
    read: notifications.filter(n => n.is_read)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Notifications
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-blue-600 hover:text-blue-700"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
          </SheetTitle>
          <SheetDescription>
            Stay updated with your latest activities
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="all" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-2">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                    onMarkAsRead={() => markAsRead(notification.id)}
                    onDelete={() => deleteNotification(notification.id)}
                    getTimeAgo={getTimeAgo}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="unread" className="mt-4 space-y-2">
            {groupedNotifications.unread.length === 0 ? (
              <div className="text-center py-8">
                <Check className="h-12 w-12 text-green-400 mx-auto mb-3" />
                <p className="text-gray-600">All caught up!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {groupedNotifications.unread.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                    onMarkAsRead={() => markAsRead(notification.id)}
                    onDelete={() => deleteNotification(notification.id)}
                    getTimeAgo={getTimeAgo}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notification Preferences</CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {preferences && (
                  <>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <Switch
                        id="email-notifications"
                        checked={preferences.email_notifications}
                        onCheckedChange={(checked) =>
                          updatePreferences({ email_notifications: checked })
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <Switch
                        id="push-notifications"
                        checked={preferences.push_notifications}
                        onCheckedChange={(checked) =>
                          updatePreferences({ push_notifications: checked })
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="application-updates">Application Updates</Label>
                      <Switch
                        id="application-updates"
                        checked={preferences.application_updates}
                        onCheckedChange={(checked) =>
                          updatePreferences({ application_updates: checked })
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="message-notifications">Message Notifications</Label>
                      <Switch
                        id="message-notifications"
                        checked={preferences.message_notifications}
                        onCheckedChange={(checked) =>
                          updatePreferences({ message_notifications: checked })
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="job-recommendations">Job Recommendations</Label>
                      <Switch
                        id="job-recommendations"
                        checked={preferences.job_recommendations}
                        onCheckedChange={(checked) =>
                          updatePreferences({ job_recommendations: checked })
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="marketing-emails">Marketing Emails</Label>
                      <Switch
                        id="marketing-emails"
                        checked={preferences.marketing_emails}
                        onCheckedChange={(checked) =>
                          updatePreferences({ marketing_emails: checked })
                        }
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

interface NotificationItemProps {
  notification: Notification
  onClick: () => void
  onMarkAsRead: () => void
  onDelete: () => void
  getTimeAgo: (date: string) => string
}

function NotificationItem({
  notification,
  onClick,
  onMarkAsRead,
  onDelete,
  getTimeAgo
}: NotificationItemProps) {
  return (
    <div
      className={cn(
        'p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50',
        !notification.is_read && 'bg-blue-50 border-blue-200'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-lg">
              {notificationService.getNotificationIcon(notification.type)}
            </span>
            <h4 className="text-sm font-medium truncate">
              {notification.title}
            </h4>
            {!notification.is_read && (
              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {notification.message}
          </p>
          <p className="text-xs text-gray-500">
            {getTimeAgo(notification.created_at)}
          </p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!notification.is_read && (
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                onMarkAsRead()
              }}>
                <Check className="h-4 w-4 mr-2" />
                Mark as read
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}