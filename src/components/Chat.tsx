import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatProps {
  isAdmin: boolean;
}

interface Message {
  id: number;
  user: string;
  text: string;
  timestamp: Date;
}

const Chat: React.FC<ChatProps> = ({ isAdmin }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now(),
      user: isAdmin ? 'Admin' : 'Viewer',
      text: newMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage('');
    console.log('New message sent:', message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 h-[calc(100vh-2rem)] flex flex-col">
      <h2 className="text-xl font-bold mb-4">Chat</h2>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${
              message.user === 'Admin' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.user === 'Admin'
                  ? 'bg-stream-primary text-white'
                  : 'bg-gray-800 text-white'
              }`}
            >
              <div className="font-bold text-sm mb-1">{message.user}</div>
              <div className="text-sm">{message.text}</div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white"
        >
          <Smile className="h-5 w-5" />
        </Button>
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 bg-gray-800 border-gray-700 text-white"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSend}
          className="text-gray-400 hover:text-white"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default Chat;