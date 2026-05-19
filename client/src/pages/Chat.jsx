import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import useAuthStore, { api } from '../store/authStore';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';
import { Send, User, MessageSquare, Loader2, AlertTriangle } from 'lucide-react';

const Chat = () => {
  const { user } = useAuthStore();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  // Mobile: 'contacts' | 'messages'
  const [mobileView, setMobileView] = useState('contacts');

  const [isContactsLoading, setIsContactsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);

  const socketRef = useRef(null);
  const chatEndRef = useRef(null);
  useEffect(() => {
    let SOCKET_URL = import.meta.env.VITE_API_URL ||
      (import.meta.env.MODE === 'development' ? 'http://localhost:5000' : 'https://freelance-marketplace-dk90.onrender.com');

    // Clean up trailing slash and /api suffix so Socket.io connects to the root domain
    if (SOCKET_URL.endsWith('/')) {
      SOCKET_URL = SOCKET_URL.slice(0, -1);
    }
    if (SOCKET_URL.endsWith('/api')) {
      SOCKET_URL = SOCKET_URL.slice(0, -4);
    }

    socketRef.current = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected successfully with ID:', socketRef.current.id);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error occurred:', error);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.warn('Socket disconnected. Reason:', reason);
    });

    // Fetch contacts and handle auto-selecting target user from query param
    const initChat = async () => {
      setIsContactsLoading(true);
      try {
        const response = await api.get(`/messages/contacts/list?t=${Date.now()}`);
        const currentContacts = response.data || [];
        setContacts(currentContacts);

        const queryParams = new URLSearchParams(window.location.search);
        const queryUserId = queryParams.get('userId');

        if (queryUserId) {
          // Check if contact already exists in the list
          const matchedContact = currentContacts.find(c => c._id === queryUserId);
          if (matchedContact) {
            handleSelectContact(matchedContact);
          } else {
            // Contact is new (no chat history yet). Fetch user details from our new API.
            try {
              const userRes = await api.get(`/auth/users/${queryUserId}`);
              const tempContact = {
                _id: userRes.data._id,
                name: userRes.data.name,
                role: userRes.data.role,
                title: userRes.data.title,
                email: userRes.data.email
              };
              // Prepended to contacts sidebar list
              setContacts(prev => [tempContact, ...prev]);
              handleSelectContact(tempContact);
            } catch (err) {
              console.error('Failed to load query user profile details', err);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load contacts list', error);
      } finally {
        setIsContactsLoading(false);
      }
    };

    initChat();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!socketRef.current || !user || !selectedContact) return;

    const joinCurrentRoom = () => {
      console.log('Socket connect/reconnect event: Emitting join_room for contact:', selectedContact._id);
      socketRef.current.emit('join_room', {
        userId: user._id,
        contactId: selectedContact._id
      });
    };

    // Join room immediately if socket is already connected
    if (socketRef.current.connected) {
      joinCurrentRoom();
    }

    // Join room on connect or reconnect
    socketRef.current.on('connect', joinCurrentRoom);

    const handleIncomingMessage = (message) => {
      // Append if the message is from currently selected contact
      const senderId = message.sender?._id || message.sender;
      if (selectedContact && senderId === selectedContact._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
    };

    // Listen for incoming messages
    socketRef.current.on('receive_message', handleIncomingMessage);

    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect', joinCurrentRoom);
        socketRef.current.off('receive_message', handleIncomingMessage);
      }
    };
  }, [user, selectedContact]);

  useEffect(() => {
    // Scroll to bottom when messages update
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!selectedContact) return;

    const pollChatHistory = async () => {
      try {
        const response = await api.get(`/messages/${selectedContact._id}?t=${Date.now()}`);
        setMessages((prev) => {
          if (JSON.stringify(prev) !== JSON.stringify(response.data)) {
            return response.data;
          }
          return prev;
        });
      } catch (error) {
        console.error('Failed to poll chat history', error);
      }
    };

    const interval = setInterval(pollChatHistory, 4000);

    return () => clearInterval(interval);
  }, [selectedContact]);

  const handleSelectContact = async (contact) => {
    setSelectedContact(contact);
    setMobileView('messages'); // Switch to messages panel on mobile
    setIsMessagesLoading(true);
    try {
      const response = await api.get(`/messages/${contact._id}?t=${Date.now()}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to load chat history', error);
    } finally {
      setIsMessagesLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !selectedContact) return;

    const payload = {
      receiver: selectedContact._id,
      content: typedMessage,
    };

    try {
      // 1. Save message to database
      const response = await api.post('/messages', payload);

      // 2. Emit via socket
      socketRef.current.emit('send_message', response.data);

      // 3. Update UI state locally
      setMessages((prev) => [...prev, response.data]);
      setTypedMessage('');
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  return (
    <div className="min-h-screen relative bg-slate-50 dark:bg-dark-bg transition-colors duration-200 aurora-mesh tech-grid flex flex-col">
      {/* Premium Tech Glow blobs */}
      <div className="glow-blob w-[500px] h-[500px] bg-primary/10 top-[-100px] left-[-100px] dark:bg-primary/5 pointer-events-none" />
      <div className="glow-blob w-[600px] h-[600px] bg-secondary/10 bottom-[-150px] right-[-100px] dark:bg-secondary/5 pointer-events-none" />
      
      {/* Centerpiece Tech Vector & Pulse Effect */}
      <div className="tech-centerpiece">
        <div className="tech-radar-pulse" />
      </div>
      
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-2 sm:px-4 lg:px-8 py-4 sm:py-8 flex gap-0 sm:gap-6 overflow-hidden h-[calc(100vh-4rem)] page-fade-in">
        
        {/* Contacts Sidebar — full width on mobile when mobileView='contacts', hidden on mobile when mobileView='messages' */}
        <div className={`
          ${mobileView === 'contacts' ? 'flex' : 'hidden'} sm:flex
          w-full sm:w-80 lg:w-1/3
          glass-card rounded-2xl flex-col overflow-hidden flex-shrink-0
        `}>
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">Messages</h2>
            <span className="text-xs text-slate-400 font-medium">{contacts.length} contacts</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1.5">
            {isContactsLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="animate-spin text-primary w-6 h-6" />
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-xs">No conversations yet.</p>
              </div>
            ) : (
              contacts.map((contact) => (
                <button
                  key={contact._id}
                  onClick={() => handleSelectContact(contact)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition text-left ${selectedContact?._id === contact._id
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary flex-shrink-0">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold text-sm truncate">{contact.name}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate capitalize">{contact.role}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message Window — full width on mobile when mobileView='messages', hidden on mobile when mobileView='contacts' */}
        <div className={`
          ${mobileView === 'messages' ? 'flex' : 'hidden'} sm:flex
          flex-1 glass-card rounded-2xl flex-col overflow-hidden min-w-0
        `}>
          {selectedContact ? (
            <>
              {/* Header with back button on mobile */}
              <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/10">
                {/* Back button — only visible on mobile */}
                <button
                  onClick={() => setMobileView('contacts')}
                  className="sm:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex-shrink-0 bg-transparent border-0"
                  aria-label="Back to contacts"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary flex-shrink-0">
                  {selectedContact.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">{selectedContact.name}</h3>
                  <span className="text-[10px] text-slate-400 capitalize">{selectedContact.role}</span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
                {isMessagesLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="animate-spin text-primary w-6 h-6" />
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.sender._id === user._id || msg.sender === user._id;
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] sm:max-w-[70%] p-3 sm:p-3.5 rounded-2xl text-sm relative ${isOwn
                              ? 'bg-primary text-white rounded-tr-none'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                            }`}
                        >
                          {msg.isSuspicious && (
                            <div className="flex items-center gap-1.5 text-xs bg-red-500/20 text-red-600 dark:text-red-400 p-1.5 rounded-md mb-2 border border-red-500/30">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="font-semibold">Suspicious message detected</span>
                            </div>
                          )}
                          <p className="leading-relaxed break-words">{msg.content}</p>
                          <span className={`text-[9px] block text-right mt-1 ${isOwn ? 'text-white/70' : 'text-slate-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Typed Message Input Form */}
              <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  className="flex-1 px-3 sm:px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition min-w-0"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl transition flex items-center justify-center flex-shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
              <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="font-bold text-slate-700 dark:text-slate-300">Your Chatbox</h3>
              <p className="text-xs mt-1 text-center">Select a contact from the list to start talking.</p>
              {/* Prompt mobile user to go to contacts list */}
              <button
                onClick={() => setMobileView('contacts')}
                className="sm:hidden mt-4 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold transition bg-transparent border-0"
              >
                View Contacts
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Chat;

