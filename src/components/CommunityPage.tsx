import React, { useState } from 'react';
import { UserProfile } from '../types';
import { COMMUNITY_POSTS, AVAILABLE_COURSES } from '../mockData';
import { Search, Plus, MessageSquare, ThumbsUp, Pin, BadgeCheck, Clock, Tag } from 'lucide-react';

export const CommunityPage: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [filter, setFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);

  // New post form state
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    courseId: '',
    tags: ''
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    // Normally would dispatch to state/API
    setShowNewPost(false);
    setNewPost({ title: '', content: '', courseId: '', tags: '' });
  };

  const filteredPosts = COMMUNITY_POSTS.filter(post => {
    const matchesFilter = filter === 'All' 
      || (filter === 'Questions' && post.type === 'question')
      || (filter === 'Announcements' && post.type === 'announcement')
      || (filter === 'Resources' && post.type === 'resource');
      
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase())
      || post.content.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesFilter && matchesSearch;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Faculty': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Senior Mentor': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Community Q&A & Announcements</h1>
            <p className="text-slate-500 mt-1">Connect with peers, mentors, and faculty</p>
          </div>
          <button 
            onClick={() => setShowNewPost(!showNewPost)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={20} />
            New Post
          </button>
        </div>

        {/* New Post Form */}
        {showNewPost && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 animate-in slide-in-from-top-4 fade-in duration-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Create a New Post</h2>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Related Course (Optional)</label>
                  <select 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    value={newPost.courseId}
                    onChange={e => setNewPost({...newPost, courseId: e.target.value})}
                  >
                    <option value="">Select a course</option>
                    {AVAILABLE_COURSES.map(c => (
                      <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. homework, midterm, help" 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    value={newPost.tags}
                    onChange={e => setNewPost({...newPost, tags: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="What is your question or announcement?" 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  value={newPost.title}
                  onChange={e => setNewPost({...newPost, title: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Provide more details here..." 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y"
                  value={newPost.content}
                  onChange={e => setNewPost({...newPost, content: e.target.value})}
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowNewPost(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Post
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="flex bg-white rounded-lg p-1 shadow-sm border border-slate-200 overflow-x-auto w-full sm:w-auto">
            {['All', 'Questions', 'Announcements', 'Resources'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === tab ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search discussions..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>
        </div>

        {/* Post Feed */}
        <div className="space-y-4">
          {filteredPosts.map(post => {
            const isAnnouncement = post.type === 'announcement';
            
            return (
              <div 
                key={post.id} 
                className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
                  isAnnouncement ? 'border-amber-200 border-l-4 border-l-amber-400' : 'border-slate-200'
                } hover:shadow-md transition-shadow`}
              >
                <div className="p-5">
                  {/* Post Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={post.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}`} 
                        alt={post.author.name} 
                        className="w-10 h-10 rounded-full bg-slate-200 object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{post.author.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getRoleBadge(post.author.role)}`}>
                            {post.author.role}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {post.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {post.isPinned && (
                        <span className="flex items-center gap-1 text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-md">
                          <Pin size={12} className="fill-current" /> Pinned
                        </span>
                      )}
                      {post.verified && (
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                          <BadgeCheck size={14} className="text-emerald-600" /> Faculty Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">{post.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {post.content.length > 150 ? (
                        <>
                          {post.content.substring(0, 150)}...
                          <button className="text-indigo-600 font-medium hover:underline ml-1">Read more</button>
                        </>
                      ) : (
                        post.content
                      )}
                    </p>
                  </div>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                          <Tag size={10} /> {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors group">
                        <div className="p-1.5 rounded-full group-hover:bg-indigo-50 transition-colors">
                          <ThumbsUp size={16} />
                        </div>
                        {post.upvotes}
                      </button>
                      <button className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors group">
                        <div className="p-1.5 rounded-full group-hover:bg-indigo-50 transition-colors">
                          <MessageSquare size={16} />
                        </div>
                        {post.replies}
                      </button>
                    </div>
                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-md transition-colors">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredPosts.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
              <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">No posts found</h3>
              <p className="text-slate-500">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
