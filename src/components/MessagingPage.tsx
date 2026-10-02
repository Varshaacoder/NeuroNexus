import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { INITIAL_MESSAGES, AVAILABLE_MENTORS } from '../mockData';
import { Search, Edit, Send, Info, ChevronLeft, Check, CheckCheck, MessageSquare, Bot, Sparkles, UserPlus } from 'lucide-react';

const AI_CAMPUS_ADVISOR = {
  id: 'campus_ai_advisor',
  name: 'NexusAI Campus Guide',
  role: 'AI Academic & Mentorship Advisor',
  specialty: 'Department Guide, Mentorship Matching & Diagnostic Calibration',
  avatar: 'https://ui-avatars.com/api/?name=AI+Advisor&background=6366f1&color=ffffff&bold=true',
  available: true,
  department: 'Campus AI Center',
  badge: 'AI Assistant',
  bio: 'Official university intelligent guide. Helps new students navigate courses, calibrate diagnostic mock tests, and connect with faculty mentors and senior peers.'
};

export const MessagingPage: React.FC<{ user: UserProfile }> = ({ user }) => {
  const isFreshUser = (!user.email?.toLowerCase().includes('demo')) && (user.enrolledCourses?.length === 0);

  const [connectedMentors, setConnectedMentors] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(isFreshUser ? 'campus_ai_advisor' : null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Record<string, any[]>>(() => {
    const initial: Record<string, any[]> = {};
    if (isFreshUser) {
      initial['campus_ai_advisor'] = [
        {
          id: 'ai_welcome_1',
          senderId: 'campus_ai_advisor',
          text: `Hello ${user.name.split(' ')[0]}! 👋 Welcome to Apex Institute of Science & Technology.\n\nSince you are a new student with no courses enrolled or mentors selected yet, I am your Campus AI Advisor! Here is how I can guide you:\n\n1. 📚 Course Suggestions: I can recommend core subjects like CS201 (C Systems), CS202 (Data Structures), and CS204 (DBMS).\n2. 🤝 Connect with Mentors & Seniors: I can introduce you to Dr. Aris Thorne (Faculty Mentor) or Rachel Torres (Senior Mentor).\n3. 📝 Diagnostic Mock Tests: Attend a 15-minute test to analyze your baseline knowledge.\n\nClick one of the suggested prompts below or ask me any question!`,
          timestamp: 'Just now',
          isRead: true
        }
      ];
    }
    return initial;
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Combine mentors and any existing chat partners for the sidebar
  const chatList = isFreshUser
    ? [AI_CAMPUS_ADVISOR, ...connectedMentors].filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.role.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : AVAILABLE_MENTORS.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.role.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const activePartner = chatList.find(m => m.id === activeChat) || (activeChat === 'campus_ai_advisor' ? AI_CAMPUS_ADVISOR : null);
  const currentMessages = activeChat ? (messages[activeChat] || []) : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const sendCustomMessage = (textToSend: string) => {
    if (!textToSend.trim() || !activeChat) return;

    const newMsg = {
      id: Date.now().toString(),
      senderId: user.id,
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };

    setMessages(prev => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), newMsg]
    }));

    if (activeChat === 'campus_ai_advisor') {
      const lower = textToSend.toLowerCase();
      setTimeout(() => {
        let replyText = '';
        if (lower.includes('thorne') || lower.includes('faculty') || lower.includes('connect with dr')) {
          const thorne = AVAILABLE_MENTORS.find(m => m.name.includes('Thorne'));
          if (thorne) {
            setConnectedMentors(prev => prev.some(m => m.id === thorne.id) ? prev : [...prev, thorne]);
          }
          replyText = `I would be glad to connect you with Dr. Aris Thorne! 👨‍🏫\n\n• Role: Course Director & Faculty Lead (Systems Architecture)\n• Specialization: Low-level C Programming, Pointers, Memory Management\n• Office Hours: Mon & Wed 3:00 PM – 4:00 PM (Office B-12 / Virtual)\n\n✅ I have connected Dr. Thorne to your active mentors list! You can now select him from the sidebar to chat directly.`;
        } else if (lower.includes('rachel') || lower.includes('senior') || lower.includes('connect with rachel')) {
          const rachel = AVAILABLE_MENTORS.find(m => m.name.includes('Rachel'));
          if (rachel) {
            setConnectedMentors(prev => prev.some(m => m.id === rachel.id) ? prev : [...prev, rachel]);
          }
          replyText = `Rachel Torres is our top Senior Peer Mentor! 👩‍🎓\n\n• Role: 4th-Year Graduate Fellow\n• Specialization: Data Structures, Algorithms & Exam Preparation\n• Sessions: 45+ students mentored with a 4.9 ⭐ rating\n\n✅ I have connected Rachel Torres to your active mentors list! You can now select her in the sidebar to send messages.`;
        } else if (lower.includes('course') || lower.includes('enroll') || lower.includes('subject')) {
          replyText = `Here are the recommended foundational courses for your department (${user.department}):\n\n• CS201: C Programming & Systems (Prof. Dr. Aris Thorne, 4 Credits)\n• CS202: Data Structures & Algorithms (Prof. Elena Rostova, 4 Credits)\n• CS204: Database Management Systems (Prof. Marcus Vance, 3 Credits)\n\n👉 Head to the 'Courses' page in the top navigation bar to explore the syllabus and enroll!`;
        } else if (lower.includes('mock') || lower.includes('test') || lower.includes('diagnostic') || lower.includes('calibrat')) {
          replyText = `Attending a diagnostic mock test is the best way to evaluate your knowledge! 📝\n\n• 5 multiple-choice questions covering memory, pointers, and structures.\n• Takes only 10–15 minutes.\n• Immediately builds your personal Topic Mastery Radar and identifies topics needing revision.\n\n👉 Click 'Take Mock Test' on your Dashboard to get started!`;
        } else if (lower.includes('group') || lower.includes('community') || lower.includes('circle')) {
          replyText = `You can join active batch circles in the 'Community Q&A' section! There are active study groups for CSE Semester IV, C Programming Discussion, and DBMS Study Circles.`;
        } else if (lower.includes('mentor') || lower.includes('senior')) {
          replyText = `At Apex Institute, we have distinguished faculty and senior mentors available:\n\n1. 👨‍🏫 Dr. Aris Thorne — Course Director & Systems Programming Lead\n2. 👩‍🎓 Rachel Torres — Senior Peer Mentor (Year IV Fellow)\n3. 👨‍💻 Devin Patel — Teaching Assistant for Data Structures Labs\n\nWould you like me to connect you with Dr. Thorne or Rachel Torres? You can simply click the quick buttons below!`;
        } else {
          replyText = `As your Campus AI Advisor, I can help you with:\n• Recommending courses for ${user.department}\n• Connecting you with university faculty (Dr. Aris Thorne) or senior mentors (Rachel Torres)\n• Guiding you on taking diagnostic mock tests to calibrate your skill radar\n\nFeel free to choose one of the quick suggestions below or ask me any question!`;
        }

        const replyMsg = {
          id: (Date.now() + 1).toString(),
          senderId: 'campus_ai_advisor',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: true
        };
        
        setMessages(prev => ({
          ...prev,
          campus_ai_advisor: [...(prev.campus_ai_advisor || []), replyMsg]
        }));
      }, 700);
    } else {
      // Simulate reply from human mentor
      setTimeout(() => {
        const replyMsg = {
          id: (Date.now() + 1).toString(),
          senderId: activeChat,
          text: "Hello! Thanks for reaching out. Welcome to Apex! Feel free to ask any questions about course materials, lab assignments, or exam preparation.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: true
        };
        
        setMessages(prev => ({
          ...prev,
          [activeChat]: [...(prev[activeChat] || []), replyMsg]
        }));
      }, 1000);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    const text = messageInput.trim();
    setMessageInput('');
    sendCustomMessage(text);
  };

  const getRoleColor = (role: string) => {
    if (role.includes('AI') || role.includes('Nexus')) return 'bg-violet-100 text-violet-700';
    if (role.includes('Faculty')) return 'bg-emerald-100 text-emerald-700';
    if (role.includes('Senior')) return 'bg-indigo-100 text-indigo-700';
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-white flex overflow-hidden">
      {/* Sidebar - hidden on mobile if chat is active */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-900">Messages</h2>
            <button className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors">
              <Edit size={18} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chatList.map(partner => {
            const partnerMsgs = messages[partner.id] || [];
            const lastMsg = partnerMsgs[partnerMsgs.length - 1];
            const isUnread = lastMsg && lastMsg.senderId !== user.id && !lastMsg.isRead;
            
            return (
              <div 
                key={partner.id}
                onClick={() => setActiveChat(partner.id)}
                className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors flex items-start gap-3 ${activeChat === partner.id ? 'bg-indigo-50/50' : ''}`}
              >
                <div className="relative flex-shrink-0">
                  <img 
                    src={partner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.name)}`} 
                    alt={partner.name} 
                    className="w-12 h-12 rounded-full object-cover bg-slate-200"
                  />
                  <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${partner.available ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-semibold text-slate-900 truncate pr-2">{partner.name}</h3>
                    {lastMsg && <span className="text-xs text-slate-500 whitespace-nowrap">{lastMsg.timestamp}</span>}
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${getRoleColor(partner.role)}`}>
                      {partner.role}
                    </span>
                  </div>
                  {lastMsg && (
                    <p className={`text-sm truncate ${isUnread ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>
                      {lastMsg.senderId === user.id ? 'You: ' : ''}{lastMsg.text}
                    </p>
                  )}
                </div>
                
                {isUnread && (
                  <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full mt-2"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-slate-50 ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        {activeChat && activePartner ? (
          <>
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-slate-200 bg-white flex justify-between items-center shadow-sm z-10">
              <div className="flex items-center gap-3">
                <button 
                  className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-full mr-1"
                  onClick={() => setActiveChat(null)}
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="relative">
                  <img 
                    src={activePartner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activePartner.name)}`} 
                    alt={activePartner.name} 
                    className="w-10 h-10 rounded-full object-cover bg-slate-200"
                  />
                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${activePartner.available ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{activePartner.name}</h3>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <span>{activePartner.role}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span className={activePartner.available ? 'text-emerald-600' : 'text-slate-400'}>
                      {activePartner.available ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
              
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">
                <Info size={16} />
                <span className="hidden sm:inline">Profile</span>
              </button>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <div className="bg-white p-4 rounded-full shadow-sm border border-slate-100 mb-3">
                    <Send size={24} className="text-slate-300" />
                  </div>
                  <p>No messages yet.</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              ) : (
                currentMessages.map((msg, idx) => {
                  const isMe = msg.senderId === user.id;
                  const showAvatar = !isMe && (idx === 0 || currentMessages[idx - 1].senderId !== msg.senderId);
                  
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} max-w-full`}>
                      {!isMe && (
                        <div className="w-8 flex-shrink-0 mr-2">
                          {showAvatar && (
                            <img 
                              src={activePartner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activePartner.name)}`} 
                              alt="" 
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                        </div>
                      )}
                      
                      <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div 
                          className={`px-4 py-2 rounded-2xl ${
                            isMe 
                              ? 'bg-indigo-600 text-white rounded-tr-sm' 
                              : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-tl-sm'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400 px-1">
                          {msg.timestamp}
                          {isMe && (
                            msg.isRead ? <CheckCheck size={12} className="text-indigo-400" /> : <Check size={12} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200">
              {activeChat === 'campus_ai_advisor' && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-2 scrollbar-none">
                  {[
                    '💡 Suggest courses to enroll in',
                    '👨‍🏫 Connect with Dr. Aris Thorne (Faculty)',
                    '👩‍🎓 Connect with Rachel Torres (Senior Mentor)',
                    '📝 How to take a diagnostic mock test?',
                    '👥 Join batch study groups',
                  ].map((prompt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => sendCustomMessage(prompt)}
                      className="shrink-0 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors shadow-2xs"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                  <textarea
                    rows={1}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Type a message..."
                    className="w-full max-h-32 p-3 bg-transparent resize-none outline-none text-sm"
                    style={{ minHeight: '44px' }}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex-shrink-0"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="hidden md:flex h-full flex-col items-center justify-center text-slate-400 bg-slate-50">
            <div className="bg-white p-6 rounded-full shadow-sm border border-slate-100 mb-4">
              <MessageSquare size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-600 mb-1">Your Messages</h3>
            <p className="text-sm text-slate-500">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};
