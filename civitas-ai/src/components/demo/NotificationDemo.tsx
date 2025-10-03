import React, { useState } from 'react';
import { Card } from '../primitives/Card';
import { Button } from '../primitives/Button';
import Notification from '../primitives/Notification';
import type { NotificationType } from '../primitives/Notification';

/**
 * A demo component to showcase the animated notification components
 */
export const NotificationDemo: React.FC = () => {
  // Track active notifications
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    animation: 'fade' | 'slide-right' | 'slide-left' | 'scale';
  }>>([]);

  // Add a notification with a unique ID
  const addNotification = (
    type: NotificationType, 
    animation: 'fade' | 'slide-right' | 'slide-left' | 'scale' = 'fade'
  ) => {
    const id = `notification-${Date.now()}`;
    const notificationTypes = {
      'info': {
        title: 'Information',
        message: 'This is an informational notification with important details.'
      },
      'success': {
        title: 'Success!',
        message: 'Your action was completed successfully.'
      },
      'warning': {
        title: 'Warning',
        message: 'Please be aware of this potential issue.'
      },
      'error': {
        title: 'Error',
        message: 'There was a problem with your request. Please try again.'
      }
    };
    
    const { title, message } = notificationTypes[type];
    
    setNotifications([
      ...notifications,
      { id, title, message, type, animation }
    ]);
  };

  // Remove a notification by ID
  const removeNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  return (
    <div>
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-6">Animated Notifications</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="space-y-2">
            <h3 className="text-sm font-medium mb-2">Notification Types</h3>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => addNotification('info')} variant="outline" size="sm">Info</Button>
              <Button onClick={() => addNotification('success')} variant="outline" size="sm">Success</Button>
              <Button onClick={() => addNotification('warning')} variant="outline" size="sm">Warning</Button>
              <Button onClick={() => addNotification('error')} variant="outline" size="sm">Error</Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium mb-2">Animation Styles</h3>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => addNotification('info', 'fade')} variant="outline" size="sm">Fade</Button>
              <Button onClick={() => addNotification('info', 'slide-right')} variant="outline" size="sm">Slide Right</Button>
              <Button onClick={() => addNotification('info', 'slide-left')} variant="outline" size="sm">Slide Left</Button>
              <Button onClick={() => addNotification('info', 'scale')} variant="outline" size="sm">Scale</Button>
            </div>
          </div>
        </div>
        
        <div className="space-y-4" aria-live="polite">
          {notifications.map(notification => (
            <Notification
              key={notification.id}
              title={notification.title}
              message={notification.message}
              type={notification.type}
              animation={notification.animation}
              duration={5000}
              onDismiss={() => removeNotification(notification.id)}
            />
          ))}
          
          {notifications.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Click the buttons above to show notifications with different animations.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default NotificationDemo;