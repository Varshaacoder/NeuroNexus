import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Users, Bot, BookOpen, ChevronDown, Video, Presentation } from 'lucide-react';
import { UserProfile } from '../types';

interface AIClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

interface Message {
  id: string;
  senderName: string;
  senderRole: 'faculty' | 'mentor' | 'student' | 'ai';
  content: string;
  timestamp: string;
}

export const AIClassroomModal: React.FC<AIClassroomModalProps> = ({ isOpen, onClose, user }) => {
  const [topic, setTopic] = useState('Pointer Arithmetic');
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', senderName: 'Dr. Aris Thorne', senderRole: 'faculty', content: 'Welcome class. Today we discuss pointers.', timestamp: '10:00 AM' },
    { id: '2', senderName: 'Yumi Tanaka', senderRole: 'student', content: 'I am confused about double pointers.', timestamp: '10:05 AM' },
    { id: '3', senderName: 'Rachel Torres', senderRole: 'mentor', content: 'A double pointer just stores the address of another pointer.', timestamp: '10:06 AM' }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      senderName: user.name,
      senderRole: 'student',
      content: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newUserMsg]);
    setChatInput('');

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        senderName: 'AI Teaching Assistant',
        senderRole: 'ai',
        content: `Great point, ${user.name}! Let me illustrate that on the whiteboard.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-7xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <Presentation className="text-indigo-600 w-6 h-6" />
            <h2 className="text-lg font-bold text-gray-800">AI Interactive Classroom</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          {/* Left Sidebar - Participants */}
          <div className="w-full md:w-60 border-r border-gray-200 bg-gray-50/50 flex flex-col h-full overflow-y-auto hidden md:flex">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4" /> Participants (6)
              </h3>
            </div>
            
            <div className="p-4 space-y-6">
              {/* Faculty */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Faculty</h4>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                      AT
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Dr. Aris Thorne</p>
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Professor</span>
                  </div>
                </div>
              </div>

              {/* Mentors */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Senior Mentors</h4>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                      RT
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Rachel Torres</p>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">TA</span>
                  </div>
                </div>
              </div>

              {/* Students */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Students Online</h4>
                <div className="space-y-4">
                  {[
                    { initials: 'YT', name: 'Yumi Tanaka', online: true },
                    { initials: 'DS', name: 'Demo Student', online: true },
                    { initials: 'MK', name: 'Mark Kline', online: false },
                    { initials: 'SL', name: 'Sarah Lee', online: true },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-sm">
                          {s.initials}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${s.online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      </div>
                      <p className={`text-sm ${s.online ? 'text-gray-700' : 'text-gray-400'}`}>{s.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Center - Whiteboard */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
            <div className="absolute top-4 left-4 z-10">
              <div className="relative">
                <button 
                  onClick={() => setShowTopicDropdown(!showTopicDropdown)}
                  className="bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  {topic}
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {showTopicDropdown && (
                  <div className="absolute top-full mt-1 w-56 bg-white border border-gray-200 shadow-lg rounded-lg py-1">
                    {['Pointer Arithmetic', 'Functions', 'DBMS Normalization', 'Probability'].map((t) => (
                      <button
                        key={t}
                        onClick={() => { setTopic(t); setShowTopicDropdown(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Whiteboard Canvas Area */}
            <div className="flex-1 bg-slate-50 relative flex items-center justify-center p-8 overflow-auto">
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              
              <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 relative z-0 w-full max-w-2xl">
                <h3 className="text-xl font-bold text-slate-800 mb-6 text-center border-b pb-4">Memory Representation</h3>
                <div className="flex flex-col items-center gap-8">
                  
                  {/* Diagram */}
                  <svg width="400" height="250" viewBox="0 0 400 250" className="overflow-visible">
                    <defs>
                      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
                      </marker>
                    </defs>

                    {/* Variable 'a' */}
                    <g transform="translate(50, 50)">
                      <rect width="100" height="60" rx="4" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
                      <text x="50" y="-10" textAnchor="middle" className="text-sm font-semibold fill-slate-700">int a = 42;</text>
                      <text x="50" y="35" textAnchor="middle" className="text-lg font-bold fill-indigo-600">42</text>
                      <text x="50" y="80" textAnchor="middle" className="text-xs fill-slate-500">0x1000</text>
                    </g>

                    {/* Pointer 'ptr' */}
                    <g transform="translate(250, 50)">
                      <rect width="100" height="60" rx="4" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
                      <text x="50" y="-10" textAnchor="middle" className="text-sm font-semibold fill-slate-700">int* ptr = &amp;a;</text>
                      <text x="50" y="35" textAnchor="middle" className="text-base font-bold fill-indigo-600">0x1000</text>
                      <text x="50" y="80" textAnchor="middle" className="text-xs fill-slate-500">0x2000</text>
                    </g>

                    {/* Double Pointer 'dptr' */}
                    <g transform="translate(150, 160)">
                      <rect width="100" height="60" rx="4" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
                      <text x="50" y="-10" textAnchor="middle" className="text-sm font-semibold fill-slate-700">int** dptr = &amp;ptr;</text>
                      <text x="50" y="35" textAnchor="middle" className="text-base font-bold fill-indigo-600">0x2000</text>
                      <text x="50" y="80" textAnchor="middle" className="text-xs fill-slate-500">0x3000</text>
                    </g>

                    {/* Arrows */}
                    <path d="M 250 80 Q 175 80 150 80" fill="none" stroke="#6366f1" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <path d="M 200 160 Q 200 135 250 110" fill="none" stroke="#6366f1" strokeWidth="2" markerEnd="url(#arrowhead)" />
                  </svg>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 text-sm text-indigo-900 w-full">
                    <p className="font-medium mb-1">Key Concept:</p>
                    <p><code>*ptr</code> dereferences to get 42.</p>
                    <p><code>**dptr</code> dereferences twice: <code>dptr -&gt; ptr -&gt; a (42)</code>.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Chat */}
          <div className="w-full md:w-80 border-l border-gray-200 bg-white flex flex-col h-1/2 md:h-full">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-700">Class Discussion</h3>
              <Bot className="w-5 h-5 text-indigo-500" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.senderRole === 'student' && msg.senderName === user.name ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-700">{msg.senderName}</span>
                    <span className="text-[10px] text-gray-400">{msg.timestamp}</span>
                  </div>
                  <div className={`p-3 rounded-2xl max-w-[90%] text-sm ${
                    msg.senderRole === 'faculty' ? 'bg-indigo-100 text-indigo-900 rounded-tl-sm' :
                    msg.senderRole === 'ai' ? 'bg-violet-100 text-violet-900 rounded-tl-sm border border-violet-200' :
                    msg.senderRole === 'mentor' ? 'bg-emerald-100 text-emerald-900 rounded-tl-sm' :
                    msg.senderName === user.name ? 'bg-blue-600 text-white rounded-tr-sm' :
                    'bg-gray-100 text-gray-800 rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-full px-4 py-2 text-sm transition-all"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIClassroomModal;
