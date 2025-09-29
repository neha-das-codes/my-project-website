import React from 'react';
import ChatInterface from '../components/chat/chatinterface';
import { useAuth } from '../contexts/AuthContext';

const ChatPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600">You need to be logged in to access the chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ChatInterface />
    </div>
  );
};

export default ChatPage;