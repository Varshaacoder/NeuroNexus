import React, { useState } from 'react';
import { UserProfile } from '../types';
import { RANK_LEADERBOARD } from '../mockData';
import { Trophy, Medal, ArrowUp, ArrowDown, Minus, Search, Filter } from 'lucide-react';

export const LeaderboardPage: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [departmentFilter, setDepartmentFilter] = useState<string>('All Departments');

  const filteredLeaderboard = departmentFilter === 'All Departments' 
    ? RANK_LEADERBOARD 
    : RANK_LEADERBOARD.filter(r => r.dept === departmentFilter);

  const top3 = filteredLeaderboard.slice(0, 3);
  // Reorder for podium: 2nd, 1st, 3rd
  const podium = [
    top3[1], // Rank 2
    top3[0], // Rank 1
    top3[2], // Rank 3
  ].filter(Boolean);

  const userRank = RANK_LEADERBOARD.find(r => r.name === user.name)?.rank || '-';

  const getBadgeColor = (badge: string) => {
    switch(badge) {
      case 'Platinum Master': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Gold Learner': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Silver Rising': return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'Bronze Scholar': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch(rank) {
      case 1: return 'bg-amber-400 text-white';
      case 2: return 'bg-slate-300 text-slate-700';
      case 3: return 'bg-orange-400 text-white';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Trophy className="text-amber-500" size={32} />
              Academic Leaderboard
            </h1>
            <p className="text-slate-500 mt-1">See how you rank among your peers</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
            <span className="text-sm text-slate-500 font-medium">Your Rank:</span>
            <span className="text-xl font-bold text-indigo-600">#{userRank}</span>
          </div>
        </div>

        {/* Podium Section */}
        {podium.length > 0 && (
          <div className="bg-white rounded-2xl p-8 mb-8 border border-slate-200 shadow-sm flex items-end justify-center gap-4 md:gap-8 min-h-[300px]">
            {podium.map((student, index) => {
              if (!student) return null;
              const isFirst = student.rank === 1;
              const heightClass = isFirst ? 'h-48' : student.rank === 2 ? 'h-36' : 'h-28';
              const podiumColorClass = isFirst ? 'bg-amber-100 border-amber-200' : student.rank === 2 ? 'bg-slate-100 border-slate-200' : 'bg-orange-50 border-orange-200';
              
              return (
                <div key={student.rank} className="flex flex-col items-center w-24 md:w-32 relative">
                  {isFirst && <Trophy className="text-amber-500 absolute -top-8" size={24} />}
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-4 ${isFirst ? 'border-amber-400' : student.rank === 2 ? 'border-slate-300' : 'border-orange-400'} mb-3 overflow-hidden bg-slate-200 shadow-md`}>
                    <img src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`} alt={student.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-center mb-4 z-10 bg-white/80 backdrop-blur px-2 py-1 rounded-md">
                    <p className="font-bold text-slate-900 text-sm md:text-base truncate w-full">{student.name}</p>
                    <p className="text-indigo-600 font-semibold text-xs md:text-sm">{student.score} pts</p>
                  </div>
                  <div className={`w-full ${heightClass} ${podiumColorClass} border-t-2 border-l-2 border-r-2 rounded-t-lg flex items-start justify-center pt-4 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent"></div>
                    <span className="text-4xl md:text-5xl font-black text-slate-800 opacity-20">{student.rank}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Filters and List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
            <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-hide">
              {['All Departments', 'CSE', 'IT', 'ECE', 'AI&DS', 'AI&ML', 'EEE', 'E&I'].map(dept => (
                <button
                  key={dept}
                  onClick={() => setDepartmentFilter(dept)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    departmentFilter === dept 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search students..." 
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Rank</th>
                  <th className="px-6 py-4 font-medium">Student</th>
                  <th className="px-6 py-4 font-medium">Badge</th>
                  <th className="px-6 py-4 font-medium text-right">Score</th>
                  <th className="px-6 py-4 font-medium text-center">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeaderboard.map((student, i) => {
                  const isCurrentUser = student.name === user.name;
                  
                  return (
                    <tr 
                      key={i} 
                      className={`hover:bg-slate-50 transition-colors ${isCurrentUser ? 'bg-indigo-50/50 hover:bg-indigo-50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankBadgeColor(student.rank)}`}>
                          {student.rank}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img className="h-10 w-10 rounded-full bg-slate-200 object-cover" src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}`} alt="" />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900 flex items-center gap-2">
                              {student.name}
                              {isCurrentUser && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 tracking-wide uppercase">You</span>}
                            </div>
                            <div className="text-xs text-slate-500">{student.dept}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getBadgeColor(student.badge)}`}>
                          {student.badge}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-slate-700">
                        {student.score.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center items-center gap-0.5">
                          {student.change > 0 && <><ArrowUp size={14} className="text-emerald-500" /><span className="text-[11px] text-emerald-600 font-bold">{student.change}</span></>}
                          {student.change < 0 && <><ArrowDown size={14} className="text-rose-500" /><span className="text-[11px] text-rose-600 font-bold">{Math.abs(student.change)}</span></>}
                          {student.change === 0 && <Minus size={14} className="text-slate-400" />}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Badge Legend */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-4 items-center justify-center text-xs">
            <span className="font-semibold text-slate-600 mr-2">Badges:</span>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-500"></span> Platinum Master</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400"></span> Gold Learner</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-400"></span> Silver Rising</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-700"></span> Bronze Scholar</div>
          </div>
        </div>
      </div>
    </div>
  );
};
