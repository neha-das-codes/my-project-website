import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  where,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';
import { uploadToCloudinary, validateFile, getFileType } from '../../utils/cloudinary';
import MessageBubble from './messagebubble';
import { 
  Send, 
  Paperclip, 
  ArrowLeft,
  Search,
  MessageCircle,
  Phone,
  Video,
  Users,
  AlertCircle,
  Calendar
} from 'lucide-react';

const ChatInterface = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meetingLink, setMeetingLink] = useState(null);
  const [isSending, setIsSending] = useState(false); // Prevent duplicate sends
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const lastMessageRef = useRef(null); // Prevent duplicate sends
  const { user } = useAuth();

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Real-time presence management
  useEffect(() => {
    if (!currentUser || currentUser.isGuest) return;

    let presenceRef;
    let unsubscribePresence;

    const setupPresence = async () => {
      try {
        presenceRef = doc(db, 'users', currentUser.uid);
        
        // Set user online
        await updateDoc(presenceRef, {
          isOnline: true,
          lastSeen: serverTimestamp()
        });

        // Listen for when user goes offline
        const handleBeforeUnload = async () => {
          await updateDoc(presenceRef, {
            isOnline: false,
            lastSeen: serverTimestamp()
          });
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('unload', handleBeforeUnload);

        // Update last seen every 30 seconds while online
        const presenceInterval = setInterval(async () => {
          try {
            await updateDoc(presenceRef, {
              isOnline: true,
              lastSeen: serverTimestamp()
            });
          } catch (error) {
            console.warn('Could not update presence:', error);
          }
        }, 30000);

        return () => {
          clearInterval(presenceInterval);
          window.removeEventListener('beforeunload', handleBeforeUnload);
          window.removeEventListener('unload', handleBeforeUnload);
          // Set offline when component unmounts
          if (presenceRef) {
            updateDoc(presenceRef, {
              isOnline: false,
              lastSeen: serverTimestamp()
            }).catch(console.warn);
          }
        };
      } catch (error) {
        console.warn('Could not setup presence:', error);
      }
    };

    setupPresence();
  }, [currentUser]);

  // Set current user info and handle authentication
  useEffect(() => {
    const initializeUser = async () => {
      try {
        if (user) {
          // Authenticated user
          let userData = {
            uid: user.uid,
            email: user.email,
            name: user.displayName || user.email
          };

          // Try to get additional user data from Firestore
          try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              userData = { ...userData, ...userDoc.data() };
            }
          } catch (firestoreError) {
            console.warn('Could not fetch user data from Firestore:', firestoreError);
          }

          setCurrentUser(userData);
        } else {
          // Guest user - create a temporary session
          const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const guestUser = {
            uid: guestId,
            email: 'guest@example.com',
            name: 'Guest User',
            role: 'guest',
            isGuest: true
          };
          setCurrentUser(guestUser);
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        setError('Failed to initialize user session');
      } finally {
        setAuthLoading(false);
      }
    };

    initializeUser();
  }, [user]);

  // Load users based on role-based filtering with real-time presence
  useEffect(() => {
    if (!currentUser || authLoading) return;

    const loadFilteredUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        let q = query(usersRef);
        
        const unsubscribe = onSnapshot(q, async (snapshot) => {
          const allUsers = [];
          snapshot.forEach((doc) => {
            const userData = { uid: doc.id, ...doc.data() };
            // Don't show current user in the list
            if (doc.id !== currentUser.uid) {
              allUsers.push(userData);
            }
          });

          // Apply role-based filtering
          let filteredUsers = await applyRoleBasedFilter(allUsers, currentUser);
          setAllUsers(filteredUsers);
          setLoading(false);
        }, (error) => {
          console.error('Error loading users:', error);
          // If Firestore fails, show dummy users for testing based on role
          const dummyUsers = getDummyUsersByRole(currentUser.role);
          setAllUsers(dummyUsers);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error setting up users listener:', error);
        setLoading(false);
        setError('Failed to load users');
      }
    };

    loadFilteredUsers();
  }, [currentUser, authLoading]);

  // Role-based filtering function
  const applyRoleBasedFilter = async (users, currentUser) => {
    switch (currentUser.role) {
      case 'admin':
        // Admin sees all users
        return users;
        
      case 'student':
        try {
          // Student sees only:
          // 1. Tutors they have requested demos from
          // 2. Tutors available for online classes
          // 3. Admin profiles
          const demoRequestsRef = collection(db, 'demoRequests');
          const studentRequestsQuery = query(
            demoRequestsRef, 
            where('studentId', '==', currentUser.uid)
          );
          const requestsSnapshot = await getDocs(studentRequestsQuery);
          
          const requestedTutorIds = new Set();
          requestsSnapshot.forEach(doc => {
            const data = doc.data();
            const tutorId = data.tutorId || data.tutor_id || data.tutorUid;
            if (tutorId) {
              requestedTutorIds.add(tutorId);
            }
          });

          return users.filter(user => 
            user.role === 'admin' || 
            (user.role === 'tutor' && (requestedTutorIds.has(user.uid) || user.availableForOnlineClasses))
          );
        } catch (error) {
          console.error('Error filtering student users:', error);
          // Fallback: show admins and tutors available for online classes
          return users.filter(user => 
            user.role === 'admin' || 
            (user.role === 'tutor' && user.availableForOnlineClasses)
          );
        }
        
      case 'tutor':
        try {
          // Tutor sees only:
          // 1. Students under them (who have requested demos)
          // 2. Admin profiles
          const demoRequestsRef = collection(db, 'demoRequests');
          const tutorRequestsQuery = query(
            demoRequestsRef, 
            where('tutorId', '==', currentUser.uid)
          );
          const requestsSnapshot = await getDocs(tutorRequestsQuery);
          
          const assignedStudentIds = new Set();
          requestsSnapshot.forEach(doc => {
            const data = doc.data();
            const studentId = data.studentId || data.student_id || data.studentUid;
            if (studentId) {
              assignedStudentIds.add(studentId);
            }
          });

          return users.filter(user => 
            user.role === 'admin' || 
            (user.role === 'student' && assignedStudentIds.has(user.uid))
          );
        } catch (error) {
          console.error('Error filtering tutor users:', error);
          // Fallback: show only admins
          return users.filter(user => user.role === 'admin');
        }
        
      default:
        // Guest or other roles see all users (for demo purposes)
        return users;
    }
  };

  // Get dummy users based on role for fallback
  const getDummyUsersByRole = (userRole) => {
    const baseDummyUsers = [
      {
        uid: 'admin1',
        name: 'Admin User',
        role: 'admin',
        verified: true,
        isOnline: true,
        lastSeen: new Date()
      }
    ];

    switch (userRole) {
      case 'admin':
        return [
          ...baseDummyUsers,
          {
            uid: 'tutor1',
            name: 'Demo Tutor',
            role: 'tutor',
            verified: true,
            isOnline: false,
            lastSeen: new Date(Date.now() - 5 * 60000)
          },
          {
            uid: 'student1',
            name: 'Demo Student',
            role: 'student',
            verified: false,
            isOnline: true,
            lastSeen: new Date()
          }
        ];
      case 'student':
        return [
          ...baseDummyUsers,
          {
            uid: 'tutor1',
            name: 'Your Tutor',
            role: 'tutor',
            verified: true,
            isOnline: true,
            lastSeen: new Date()
          }
        ];
      case 'tutor':
        return [
          ...baseDummyUsers,
          {
            uid: 'student1',
            name: 'Your Student',
            role: 'student',
            verified: false,
            isOnline: false,
            lastSeen: new Date(Date.now() - 10 * 60000)
          }
        ];
      default:
        return baseDummyUsers;
    }
  };

  // Check for meeting link when chat is selected
  useEffect(() => {
    if (!selectedChat || !currentUser) return;

    const checkForMeetingLink = async () => {
      try {
        let link = null;

        // For students: check demo requests first, then tutor's regular meeting link
        if (currentUser.role === 'student') {
          // Check demo requests
          const demoRequestsRef = collection(db, 'demoRequests');
          const demoQuery = query(
            demoRequestsRef,
            where('studentId', '==', currentUser.uid),
            where('tutorId', '==', selectedChat.uid)
          );
          const demoSnapshot = await getDocs(demoQuery);
          
          if (!demoSnapshot.empty) {
            const demoData = demoSnapshot.docs[0].data();
            if (demoData.meetingLink) {
              link = {
                url: demoData.meetingLink,
                type: 'demo',
                status: demoData.status || 'pending'
              };
            }
          }

          // If no demo link, check tutor's regular meeting link for online classes
          if (!link && selectedChat.role === 'tutor') {
            const tutorDoc = await getDoc(doc(db, 'users', selectedChat.uid));
            if (tutorDoc.exists() && tutorDoc.data().meetingLink) {
              link = {
                url: tutorDoc.data().meetingLink,
                type: 'regular',
                status: 'available'
              };
            }
          }
        }

        // For tutors: check if they have a regular meeting link
        else if (currentUser.role === 'tutor' && selectedChat.role === 'student') {
          const tutorDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (tutorDoc.exists() && tutorDoc.data().meetingLink) {
            link = {
              url: tutorDoc.data().meetingLink,
              type: 'regular',
              status: 'available'
            };
          }
        }

        setMeetingLink(link);
      } catch (error) {
        console.error('Error checking meeting link:', error);
        setMeetingLink(null);
      }
    };

    checkForMeetingLink();
  }, [selectedChat, currentUser]);

  // Load messages for selected chat - FIXED VERSION
  useEffect(() => {
    if (!selectedChat || !currentUser || authLoading) return;

    const chatId = createChatId(currentUser.uid, selectedChat.uid);
    
    // Ensure chat exists first
    const ensureChat = async () => {
      const chatRef = doc(db, 'chats', chatId);
      await setDoc(chatRef, {
        participants: [currentUser.uid, selectedChat.uid],
        createdAt: serverTimestamp(),
        lastMessage: '',
        lastMessageTime: serverTimestamp()
      }, { merge: true });
    };

    ensureChat().then(() => {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messagesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMessages(messagesData);
        setTimeout(scrollToBottom, 100);
      }, (error) => {
        console.error('Error loading messages:', error);
        setMessages([]);
      });

      return () => unsubscribe();
    }).catch(error => {
      console.error('Error ensuring chat exists:', error);
      setMessages([]);
    });
  }, [selectedChat, currentUser, authLoading]);

  // Create chat ID
  const createChatId = (uid1, uid2) => {
    return [uid1, uid2].sort().join('_');
  };

  // Start chat with user
  const startChat = async (otherUser) => {
    if (!currentUser) return;

    try {
      const chatId = createChatId(currentUser.uid, otherUser.uid);
      const chatRef = doc(db, 'chats', chatId);
      
      // Check if chat exists, if not create it
      try {
        const chatSnap = await getDoc(chatRef);
        if (!chatSnap.exists()) {
          await setDoc(chatRef, {
            participants: [currentUser.uid, otherUser.uid],
            createdAt: serverTimestamp(),
            lastMessage: '',
            lastMessageTime: serverTimestamp()
          });
        }
      } catch (firestoreError) {
        console.warn('Could not create chat in Firestore, using local chat:', firestoreError);
      }

      setSelectedChat(otherUser);
    } catch (error) {
      console.error('Error starting chat:', error);
      // Still allow local chat even if Firestore fails
      setSelectedChat(otherUser);
    }
  };

  // Handle join meeting
  const handleJoinMeeting = () => {
    if (meetingLink && meetingLink.url) {
      window.open(meetingLink.url, '_blank');
    }
  };

  // Upload to Cloudinary
  const handleFileUpload = async (file) => {
    const validation = validateFile(file);
    if (!validation.isValid) {
      alert(validation.errors.join('\n'));
      return null;
    }

    try {
      const result = await uploadToCloudinary(file);
      return {
        url: result.url,
        type: getFileType(file),
        name: file.name,
        size: file.size
      };
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload file. Please try again.');
      return null;
    }
  };

  // Enhanced send message with duplicate prevention
  const sendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;
    if (!selectedChat || !currentUser) return;
    if (isSending) return; // Prevent duplicate sends

    // Create message hash to prevent duplicates
    const messageContent = newMessage.trim() + (selectedFile ? selectedFile.name : '');
    if (lastMessageRef.current === messageContent) return;
    
    setIsSending(true);
    lastMessageRef.current = messageContent;

    try {
      let attachment = null;
      if (selectedFile) {
        attachment = await handleFileUpload(selectedFile);
        if (!attachment) {
          setIsSending(false);
          return;
        }
      }

      const messageData = {
        text: newMessage.trim(),
        senderId: currentUser.uid,
        senderName: currentUser.name,
        timestamp: serverTimestamp(),
        attachment: attachment
      };

      const chatId = createChatId(currentUser.uid, selectedChat.uid);
      
      // First ensure chat document exists
      const chatRef = doc(db, 'chats', chatId);
      await setDoc(chatRef, {
        participants: [currentUser.uid, selectedChat.uid],
        createdAt: serverTimestamp(),
        lastMessage: newMessage.trim() || 'Attachment',
        lastMessageTime: serverTimestamp()
      }, { merge: true });

      // Then add message
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, messageData);

      setNewMessage('');
      setSelectedFile(null);
      
      // Clear duplicate prevention after 2 seconds
      setTimeout(() => {
        lastMessageRef.current = null;
      }, 2000);

    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please check your internet connection.');
    } finally {
      setIsSending(false);
    }
  };

  // Delete message function
  const deleteMessage = async (messageId, deleteForEveryone = false) => {
    if (!selectedChat || !currentUser) return;

    try {
      const chatId = createChatId(currentUser.uid, selectedChat.uid);
      const messageRef = doc(db, 'chats', chatId, 'messages', messageId);

      if (deleteForEveryone) {
        // Delete the message document entirely
        await deleteDoc(messageRef);
      } else {
        // Update message to mark as deleted for current user
        await updateDoc(messageRef, {
          [`deletedFor.${currentUser.uid}`]: true,
          deletedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredUsers = allUsers.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatLastSeen = (lastSeen, isOnline) => {
    // If isOnline field exists and is true
    if (isOnline === true) return 'Online';
    
    // If isOnline field exists and is false, but no lastSeen
    if (isOnline === false && !lastSeen) return 'Last seen: Recently';
    
    // If no online status fields exist at all or isOnline is undefined
    if (isOnline === undefined || isOnline === null) {
      if (!lastSeen) return 'Last seen: Recently';
    }
    
    // If lastSeen exists, calculate time difference
    if (lastSeen) {
      try {
        const now = new Date();
        const lastSeenDate = lastSeen instanceof Date ? lastSeen : lastSeen.toDate();
        const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Last seen: Just now';
        if (diffInMinutes < 60) return `Last seen: ${diffInMinutes}m ago`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `Last seen: ${diffInHours}h ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `Last seen: ${diffInDays}d ago`;
        
        return lastSeenDate.toLocaleDateString();
      } catch (error) {
        return 'Last seen: Recently';
      }
    }
    
    return 'Last seen: Recently';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate();
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing chat...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center text-red-600">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <p className="text-lg mb-2">Error loading chat</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Users List Sidebar */}
      <div className={`w-full md:w-80 bg-white border-r ${selectedChat ? 'hidden md:block' : 'block'}`}>
        {/* Header - More compact on desktop */}
        <div className="p-3 md:p-4 border-b bg-gradient-to-r from-teal-50 to-cyan-50">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="text-lg md:text-xl font-semibold flex items-center text-slate-800">
              <Users className="h-5 w-5 md:h-6 md:w-6 mr-2 text-teal-500" />
              Start Chat
            </h2>
            
            {currentUser?.isGuest && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full border border-yellow-200">
                Guest Mode
              </span>
            )}
          </div>
          
          {/* Current User Info - More compact */}
          {currentUser && (
            <div className="mb-3 md:mb-4 p-2 md:p-3 bg-white rounded-lg border border-teal-100 shadow-sm">
              <p className="text-sm font-medium text-slate-800">{currentUser.name}</p>
              <p className="text-xs text-teal-600 capitalize">{currentUser.role || 'user'}</p>
            </div>
          )}
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 md:top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Users List - Optimized height */}
        <div className="overflow-y-auto" style={{ height: 'calc(100vh - 200px)' }}>
          {filteredUsers.length === 0 ? (
            <div className="p-6 md:p-8 text-center text-gray-500">
              <Users className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg md:text-xl font-semibold mb-2 text-slate-700">No users found</p>
              <div className="text-xs mt-2 space-y-1">
                {currentUser?.role === 'student' && (
                  <p>Request demos from tutors to chat with them</p>
                )}
                {currentUser?.role === 'tutor' && (
                  <p>Students will appear here after demo requests</p>
                )}
                {currentUser?.role === 'admin' && (
                  <p>All users will appear here</p>
                )}
                {currentUser?.isGuest && (
                  <p>In guest mode - some features may be limited</p>
                )}
              </div>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.uid}
                onClick={() => startChat(user)}
                className={`p-3 md:p-4 border-b cursor-pointer hover:bg-teal-50 transition-colors ${
                  selectedChat?.uid === user.uid ? 'bg-teal-50 border-l-4 border-l-teal-500' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-1 min-w-0">
                    {/* Name */}
                    <h3 className="font-semibold text-gray-900 truncate mb-1">
                      {user.name || 'Unknown User'}
                    </h3>
                    
                    {/* Phone Number - only show if exists */}
                    {user.phone && (
                      <p className="text-sm text-gray-600 truncate mb-2">
                        📞 {user.phone}
                      </p>
                    )}
                    
                    {/* Status and Role Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {/* Role Badge */}
                        <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                          user.role === 'tutor' 
                            ? 'bg-green-100 text-green-800' 
                            : user.role === 'student'
                            ? 'bg-blue-100 text-blue-800'
                            : user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role || 'user'}
                        </span>
                        
                        {/* Verified Badge - only show if verified */}
                        {user.verified && (
                          <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full border border-yellow-200">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Online Status */}
                    <div className="flex items-center mt-2">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        user.isOnline === true ? 'bg-green-400' : 'bg-gray-400'
                      }`}></div>
                      <span className={`text-xs ${
                        user.isOnline === true ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {formatLastSeen(user.lastSeen, user.isOnline)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Window - Optimized for desktop */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col h-screen">
          {/* Chat Header - More compact */}
          <div className="p-3 md:p-4 border-b bg-white flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedChat(null)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              
              <div>
                <h3 className="font-semibold text-slate-800">{selectedChat.name || 'Unknown User'}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  {/* Online Status */}
                  <div className={`w-2 h-2 rounded-full ${
                    selectedChat.isOnline === true ? 'bg-green-400' : 'bg-gray-400'
                  }`}></div>
                  <span className={`text-sm ${
                    selectedChat.isOnline === true ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {formatLastSeen(selectedChat.lastSeen, selectedChat.isOnline)}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    selectedChat.role === 'tutor' 
                      ? 'bg-green-100 text-green-800' 
                      : selectedChat.role === 'student'
                      ? 'bg-blue-100 text-blue-800'
                      : selectedChat.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedChat.role}
                  </span>
                  {selectedChat.verified && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full border border-yellow-200">
                      ✓
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              {/* Join Meeting Button */}
              {meetingLink && (
                <button
                  onClick={handleJoinMeeting}
                  className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
                  title={`Join ${meetingLink.type === 'demo' ? 'Demo' : 'Regular'} Meeting`}
                >
                  <Calendar className="h-5 w-5" />
                </button>
              )}
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Video className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Phone className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Meeting Link Card */}
          {meetingLink && (
            <div className="p-2 md:p-3 bg-green-50 border-b border-green-200">
              <div 
                onClick={handleJoinMeeting}
                className="flex items-center justify-between p-2 md:p-3 bg-white rounded-lg border border-green-200 cursor-pointer hover:bg-green-50 transition-colors shadow-sm hover:shadow-md"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Calendar className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-800 text-sm md:text-base">
                      {meetingLink.type === 'demo' ? 'Join Demo Meeting' : 'Join Meeting'}
                    </p>
                    <p className="text-xs md:text-sm text-green-600">
                      {meetingLink.type === 'demo' 
                        ? `Demo session with ${selectedChat.name}`
                        : `Online class with ${selectedChat.name}`
                      }
                    </p>
                    <p className="text-xs text-green-500 mt-1">
                      Click to join in new tab
                    </p>
                  </div>
                </div>
                <div className="text-green-600">
                  <Video className="h-4 w-4 md:h-5 md:w-5" />
                </div>
              </div>
            </div>
          )}

          {/* Messages - Optimized height for desktop */}
          <div 
            className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 bg-gray-50" 
            style={{ 
              height: meetingLink 
                ? 'calc(100vh - 280px)' 
                : 'calc(100vh - 220px)' 
            }}
          >
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <MessageCircle className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium mb-2">Start your conversation with {selectedChat.name || 'Unknown User'}</p>
                  <p className="text-sm mt-2">Say hello! 👋</p>
                  {currentUser?.isGuest && (
                    <p className="text-xs mt-2 text-yellow-600">
                      Note: Messages in guest mode may not persist
                    </p>
                  )}
                </div>
              </div>
            ) : (
              messages
                .filter(message => !message.deletedFor || !message.deletedFor[currentUser.uid])
                .map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.senderId === currentUser?.uid}
                    onDelete={deleteMessage}
                    currentUserId={currentUser?.uid}
                  />
                ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input - Fixed height */}
          <div className="p-3 md:p-4 bg-white border-t">
            {selectedFile && (
              <div className="mb-2 p-2 bg-gray-100 rounded flex items-center justify-between">
                <span className="text-sm truncate">{selectedFile.name}</span>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  ×
                </button>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-500 hover:text-teal-600 rounded-full hover:bg-teal-50 transition-colors"
                disabled={isSending}
              >
                <Paperclip className="h-5 w-5" />
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx"
              />

              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${selectedChat.name || 'Unknown User'}...`}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                disabled={isSending}
              />

              <button
                onClick={sendMessage}
                disabled={isSending || (!newMessage.trim() && !selectedFile)}
                className={`p-2 rounded-full text-white transition-all shadow-md hover:shadow-lg transform hover:scale-105 ${
                  isSending || (!newMessage.trim() && !selectedFile)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600'
                }`}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50">
          <div className="text-center text-gray-500 max-w-md mx-auto p-8">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-10 w-10 md:h-12 md:w-12 text-teal-600" />
            </div>
            <p className="text-lg md:text-xl font-semibold mb-2 text-slate-700">Welcome to TeachHunt Chat</p>
            <p className="text-gray-600 mb-4">Select a user to start messaging</p>
            <p className="text-sm text-slate-500">Connect with tutors, students, and admins!</p>
            {currentUser?.isGuest && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-700">
                  Running in guest mode - consider logging in for full features
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;