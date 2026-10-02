import React, { useState } from 'react';
import { UserProfile } from '../types';
import { AVAILABLE_COURSES } from '../mockData';
import { BookOpen, Users, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';

export const CoursesPage: React.FC<{ user: UserProfile; onSelectCourse?: (course: any) => void }> = ({ user, onSelectCourse }) => {
  const [activeTab, setActiveTab] = useState<'my_courses' | 'explore'>('my_courses');

  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-500',
    rose: 'bg-rose-500',
    cyan: 'bg-cyan-500',
  };

  const textMap: Record<string, string> = {
    indigo: 'text-indigo-700',
    emerald: 'text-emerald-700',
    amber: 'text-amber-700',
    purple: 'text-purple-700',
    rose: 'text-rose-700',
    cyan: 'text-cyan-700',
  };
  
  const bgLightMap: Record<string, string> = {
    indigo: 'bg-indigo-50',
    emerald: 'bg-emerald-50',
    amber: 'bg-amber-50',
    purple: 'bg-purple-50',
    rose: 'bg-rose-50',
    cyan: 'bg-cyan-50',
  };

  const displayedCourses = activeTab === 'my_courses' 
    ? AVAILABLE_COURSES.filter(c => user.enrolledCourses.includes(c.id))
    : AVAILABLE_COURSES;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Courses & Curriculum</h1>
            <p className="text-slate-500 mt-1">Track your progress and discover new subjects</p>
          </div>
          
          <div className="flex bg-white rounded-lg p-1 shadow-sm border border-slate-200">
            <button
              onClick={() => setActiveTab('my_courses')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'my_courses' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              My Courses
              <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">
                {user.enrolledCourses.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'explore' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Explore All Courses
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedCourses.map(course => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className={`h-2 w-full ${colorMap[course.color] || 'bg-slate-500'}`} />
              
              <div className="p-5 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-2 ${bgLightMap[course.color] || 'bg-slate-50'} ${textMap[course.color] || 'text-slate-700'}`}>
                      {course.code}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">{course.name}</h3>
                  </div>
                  {user.enrolledCourses.includes(course.id) && (
                    <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-xs font-medium">
                      <CheckCircle2 size={14} />
                      Enrolled
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-slate-600">
                    <Users size={16} className="mr-2 text-slate-400" />
                    <span>Prof. {course.faculty}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <BookOpen size={16} className="mr-2 text-slate-400" />
                    <span>{course.credits} Credits</span>
                  </div>
                </div>

                {user.enrolledCourses.includes(course.id) && course.progress !== undefined && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700">Progress</span>
                      <span className="text-slate-600">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${colorMap[course.color] || 'bg-slate-500'}`}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {course.weakTopics && course.weakTopics.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Needs Attention</p>
                    <div className="flex flex-wrap gap-2">
                      {course.weakTopics.map((topic, i) => (
                        <span key={i} className="bg-rose-50 text-rose-700 px-2 py-1 rounded text-xs font-medium border border-rose-100">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center text-xs text-slate-500">
                    <Clock size={14} className="mr-1" />
                    Next: {course.nextClass || 'TBA'}
                  </div>
                  <button
                    onClick={() => onSelectCourse?.(course)}
                    className={`flex items-center gap-1 text-sm font-bold ${textMap[course.color] || 'text-slate-700'} hover:opacity-80 transition-opacity`}
                  >
                    Open Course & Topic Breakdown
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {displayedCourses.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
            <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">No courses found</h3>
            <p className="text-slate-500">You haven't enrolled in any courses yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
