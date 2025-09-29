import React, { useState, useRef } from 'react';
import { Download, FileText, MoreVertical, Trash2, Copy, Reply } from 'lucide-react';

const MessageBubble = ({ message, isOwn, onDelete, currentUserId }) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const messageRef = useRef(null);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate();
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const downloadFile = (url, filename) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    const rect = messageRef.current.getBoundingClientRect();
    const x = Math.min(e.clientX, window.innerWidth - 200); // Prevent menu from going off-screen
    const y = Math.min(e.clientY, window.innerHeight - 150);
    
    setContextMenuPosition({ x, y });
    setShowContextMenu(true);
  };

  const handleCopyMessage = () => {
    if (message.text) {
      navigator.clipboard.writeText(message.text).then(() => {
        // Optional: Show a toast notification
        console.log('Message copied to clipboard');
      }).catch(err => {
        console.error('Failed to copy message:', err);
      });
    }
    setShowContextMenu(false);
  };

  const handleDeleteForMe = () => {
    if (onDelete) {
      onDelete(message.id, false); // Delete for me only
    }
    setShowContextMenu(false);
  };

  const handleDeleteForEveryone = () => {
    if (onDelete && isOwn) {
      onDelete(message.id, true); // Delete for everyone
    }
    setShowContextMenu(false);
  };

  // Close context menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (showContextMenu && !e.target.closest('.context-menu')) {
        setShowContextMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showContextMenu]);

  // Check if message is deleted for current user
  if (message.deletedFor && message.deletedFor[currentUserId]) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
          isOwn 
            ? 'bg-gray-300 text-gray-600 rounded-br-md' 
            : 'bg-gray-200 text-gray-600 border border-gray-300 rounded-bl-md'
        }`}>
          <p className="text-sm italic">
            🚫 This message was deleted
          </p>
          <div className={`text-xs mt-1 ${
            isOwn ? 'text-gray-500' : 'text-gray-400'
          }`}>
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        ref={messageRef}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 group relative`}
        onContextMenu={handleRightClick}
      >
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl relative ${
          isOwn 
            ? 'bg-blue-500 text-white rounded-br-md' 
            : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
        }`}>
          {/* Three dots menu button - appears on hover */}
          <button
            onClick={(e) => {
              e.preventDefault();
              const rect = e.currentTarget.getBoundingClientRect();
              const x = rect.left;
              const y = rect.bottom + 5;
              setContextMenuPosition({ x, y });
              setShowContextMenu(true);
            }}
            className={`absolute top-2 ${isOwn ? 'left-2' : 'right-2'} opacity-0 group-hover:opacity-100 p-1 rounded-full transition-opacity ${
              isOwn ? 'hover:bg-blue-600' : 'hover:bg-gray-100'
            }`}
          >
            <MoreVertical className="h-3 w-3" />
          </button>

          {/* Attachment */}
          {message.attachment && (
            <div className="mb-2">
              {message.attachment.type === 'image' ? (
                <div className="relative group/image">
                  <img
                    src={message.attachment.url}
                    alt={message.attachment.name}
                    className="max-w-full rounded-lg cursor-pointer"
                    loading="lazy"
                  />
                  <button
                    onClick={() => downloadFile(message.attachment.url, message.attachment.name)}
                    className="absolute top-2 right-2 opacity-0 group-hover/image:opacity-100 p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-opacity"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              ) : message.attachment.type === 'video' ? (
                <div className="relative group/video">
                  <video
                    src={message.attachment.url}
                    controls
                    className="max-w-full rounded-lg"
                    preload="metadata"
                  />
                  <button
                    onClick={() => downloadFile(message.attachment.url, message.attachment.name)}
                    className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 opacity-0 group-hover/video:opacity-100 transition-opacity"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                // Other files
                <div 
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    isOwn 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => downloadFile(message.attachment.url, message.attachment.name)}
                >
                  <FileText className={`h-6 w-6 ${isOwn ? 'text-blue-200' : 'text-blue-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      isOwn ? 'text-white' : 'text-gray-900'
                    }`}>
                      {message.attachment.name}
                    </p>
                    {message.attachment.size && (
                      <p className={`text-xs ${
                        isOwn ? 'text-blue-200' : 'text-gray-500'
                      }`}>
                        {getFileSize(message.attachment.size)}
                      </p>
                    )}
                  </div>
                  <Download className={`h-4 w-4 ${isOwn ? 'text-blue-200' : 'text-gray-600'}`} />
                </div>
              )}
            </div>
          )}

          {/* Text Message */}
          {message.text && (
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.text}
            </p>
          )}

          {/* Timestamp */}
          <div className={`text-xs mt-1 ${
            isOwn ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <div
          className="context-menu fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[160px]"
          style={{
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
          }}
        >
          {/* Copy Message */}
          {message.text && (
            <button
              onClick={handleCopyMessage}
              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 transition-colors"
            >
              <Copy className="h-4 w-4" />
              <span>Copy message</span>
            </button>
          )}

          {/* Reply (placeholder for future implementation) */}
          <button
            onClick={() => {
              setShowContextMenu(false);
              // TODO: Implement reply functionality
              console.log('Reply to message:', message.id);
            }}
            className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 transition-colors"
          >
            <Reply className="h-4 w-4" />
            <span>Reply</span>
          </button>

          {/* Divider */}
          <div className="border-t border-gray-200 my-1" />

          {/* Delete for Me */}
          <button
            onClick={handleDeleteForMe}
            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete for me</span>
          </button>

          {/* Delete for Everyone - only show if user owns the message */}
          {isOwn && (
            <button
              onClick={handleDeleteForEveryone}
              className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete for everyone</span>
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default MessageBubble;