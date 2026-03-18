import { useState, useEffect, useRef } from 'react';
import { Send, Phone, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ChatMessage {
  id: string;
  senderId: number;
  senderName: string;
  senderType: 'user' | 'driver';
  content: string;
  timestamp: Date;
  isRead: boolean;
}

interface ChatBoxProps {
  driverId: number;
  driverName: string;
  currentUserId: number;
  currentUserName: string;
  onClose: () => void;
  onCall?: () => void;
  theme?: 'light' | 'dark';
}

export function ChatBox({
  driverId,
  driverName,
  currentUserId,
  currentUserName,
  onClose,
  onCall,
  theme = 'light',
}: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate loading initial messages
  useEffect(() => {
    setIsLoading(true);
    // Simulate fetching messages from database
    setTimeout(() => {
      setMessages([
        {
          id: '1',
          senderId: driverId,
          senderName: driverName,
          senderType: 'driver',
          content: 'Hi! I am 5 minutes away from your location.',
          timestamp: new Date(Date.now() - 5 * 60000),
          isRead: true,
        },
        {
          id: '2',
          senderId: currentUserId,
          senderName: currentUserName,
          senderType: 'user',
          content: 'Great! I am ready. See you soon!',
          timestamp: new Date(Date.now() - 3 * 60000),
          isRead: true,
        },
        {
          id: '3',
          senderId: driverId,
          senderName: driverName,
          senderType: 'driver',
          content: 'I am arriving now. Look for a green car.',
          timestamp: new Date(Date.now() - 1 * 60000),
          isRead: true,
        },
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: currentUserName,
      senderType: 'user',
      content: inputValue,
      timestamp: new Date(),
      isRead: false,
    };

    setMessages([...messages, newMessage]);
    setInputValue('');

    // Simulate driver response after 2 seconds
    setTimeout(() => {
      const driverResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: driverId,
        senderName: driverName,
        senderType: 'driver',
        content: 'Thanks for the message! I will be there shortly.',
        timestamp: new Date(),
        isRead: false,
      };
      setMessages((prev) => [...prev, driverResponse]);
    }, 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div
      className={cn(
        'flex flex-col h-full rounded-lg shadow-xl',
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between p-4 border-b',
          theme === 'dark' ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
        )}
      >
        <div className="flex-1">
          <h3 className={cn('font-bold text-lg', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
            {driverName}
          </h3>
          <p className={cn('text-sm', theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}>
            Driver
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onCall && (
            <button
              onClick={onCall}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
              title="Call driver"
            >
              <Phone className="w-5 h-5 text-green-500" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
            title="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        className={cn(
          'flex-1 overflow-y-auto p-4 space-y-3',
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        )}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
              <p className={cn('text-sm', theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}>
                Loading messages...
              </p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className={cn('text-sm', theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}>
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn('flex', message.senderType === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-xs px-4 py-2 rounded-lg',
                  message.senderType === 'user'
                    ? 'bg-green-500 text-white rounded-br-none'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-white rounded-bl-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                )}
              >
                <p className="text-sm break-words">{message.content}</p>
                <p
                  className={cn(
                    'text-xs mt-1',
                    message.senderType === 'user'
                      ? 'text-green-100'
                      : theme === 'dark'
                      ? 'text-gray-400'
                      : 'text-gray-500'
                  )}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className={cn(
          'border-t p-3',
          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        )}
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            placeholder="Type a message..."
            className={cn(
              'flex-1 px-3 py-2 rounded-lg outline-none text-sm',
              theme === 'dark'
                ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400'
                : 'bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-500'
            )}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
