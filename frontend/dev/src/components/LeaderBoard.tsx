"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type LeaderboardUser = {
  _id: string;
  username: string;
  email: string;
  rating: number;
  matches: number;
  wins: number;
  winPct: number;
  rank?: number;
  avatar?: string;
  createdAt: string;
};

type LeaderboardStats = {
  totalUsers: number;
  activeUsers: number;
  avgRating: number;
  topRating: number;
};

export default function LeaderBoard() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "top100" | "friends">("all");

  const usersPerPage = 20;

  useEffect(() => {
    fetchLeaderboard();
  }, [currentPage, filter, searchTerm]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: usersPerPage.toString(),
        filter,
        search: searchTerm,
      });

      const response = await fetch(`/api/leaderboard?${params}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        setLeaderboard(result.data.users || []);
        setStats(result.data.stats || null);
        setTotalPages(Math.ceil(result.data.total / usersPerPage));
      } else {
        setError(result.error || "Failed to fetch leaderboard");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
      console.error("Leaderboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { bg: "bg-gradient-to-r from-yellow-400 to-yellow-600", text: "text-black", icon: "👑" };
    if (rank === 2) return { bg: "bg-gradient-to-r from-gray-300 to-gray-400", text: "text-black", icon: "🥈" };
    if (rank === 3) return { bg: "bg-gradient-to-r from-orange-400 to-orange-600", text: "text-black", icon: "🥉" };
    if (rank <= 10) return { bg: "bg-purple-600", text: "text-white", icon: rank.toString() };
    return { bg: "bg-gray-600", text: "text-white", icon: rank.toString() };
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 2400) return "text-red-400";
    if (rating >= 2100) return "text-orange-400";
    if (rating >= 1800) return "text-purple-400";
    if (rating >= 1500) return "text-blue-400";
    if (rating >= 1200) return "text-green-400";
    return "text-gray-400";
  };

  const getWinRateColor = (winPct: number) => {
    if (winPct >= 70) return "text-green-400";
    if (winPct >= 60) return "text-yellow-400";
    if (winPct >= 50) return "text-orange-400";
    return "text-red-400";
  };

  const getCurrentUser = () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  };

  const currentUser = getCurrentUser();

  if (loading && leaderboard.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">Loading Leaderboard...</div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 to-black/50 z-0" />
      
      {/* Header */}
      <header className="relative z-10 border-b border-purple-500/20 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.back()}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                ← Back
              </button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                🏆 Global Leaderboard
              </h1>
            </div>
            
            {currentUser && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-400">Your Rating</div>
                  <div className={`text-xl font-bold ${getRatingColor(currentUser.rating)}`}>
                    {currentUser.rating}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center font-bold text-sm">
                  {currentUser.username.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      {stats && (
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-purple-950/20 border border-purple-500/20 rounded-lg p-4">
              <div className="text-sm text-gray-400">Total Users</div>
              <div className="text-2xl font-bold text-purple-400">{stats.totalUsers.toLocaleString()}</div>
            </div>
            <div className="bg-purple-950/20 border border-purple-500/20 rounded-lg p-4">
              <div className="text-sm text-gray-400">Active Users</div>
              <div className="text-2xl font-bold text-green-400">{stats.activeUsers.toLocaleString()}</div>
            </div>
            <div className="bg-purple-950/20 border border-purple-500/20 rounded-lg p-4">
              <div className="text-sm text-gray-400">Average Rating</div>
              <div className="text-2xl font-bold text-blue-400">{Math.round(stats.avgRating)}</div>
            </div>
            <div className="bg-purple-950/20 border border-purple-500/20 rounded-lg p-4">
              <div className="text-sm text-gray-400">Top Rating</div>
              <div className="text-2xl font-bold text-red-400">{stats.topRating}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            {[
              { id: "all", label: "All Users" },
              { id: "top100", label: "Top 100" },
              { id: "friends", label: "Friends" }
            ].map((filterOption) => (
              <button
                key={filterOption.id}
                onClick={() => setFilter(filterOption.id as any)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filter === filterOption.id
                    ? "bg-purple-600 text-white"
                    : "bg-purple-950/30 text-gray-400 hover:text-white hover:bg-purple-900/30"
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-purple-950/30 border border-purple-500/20 rounded-lg focus:outline-none focus:border-purple-500 text-white w-64"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">🔍</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-4">
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-purple-500/20 bg-purple-950/30">
                  <th className="text-left py-4 px-6">Rank</th>
                  <th className="text-left py-4 px-6">User</th>
                  <th className="text-center py-4 px-6">Rating</th>
                  <th className="text-center py-4 px-6">Matches</th>
                  <th className="text-center py-4 px-6">Wins</th>
                  <th className="text-center py-4 px-6">Win Rate</th>
                  <th className="text-center py-4 px-6">Joined</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((user, index) => {
                  const rankBadge = getRankBadge(user.rank || index + 1);
                  const isCurrentUser = currentUser && user._id === currentUser._id;
                  
                  return (
                    <tr 
                      key={user._id} 
                      className={`border-b border-purple-500/10 transition-colors ${
                        isCurrentUser 
                          ? "bg-purple-600/20 border-purple-500" 
                          : "hover:bg-purple-950/10"
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${rankBadge.bg} ${rankBadge.text}`}>
                          {rankBadge.icon}
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {user.username}
                              {isCurrentUser && <span className="text-xs bg-purple-600 px-2 py-1 rounded-full">YOU</span>}
                            </div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6 text-center">
                        <div className={`font-bold text-lg ${getRatingColor(user.rating)}`}>
                          {user.rating}
                        </div>
                      </td>
                      
                      <td className="py-4 px-6 text-center">
                        <div className="text-gray-300">{user.matches}</div>
                      </td>
                      
                      <td className="py-4 px-6 text-center">
                        <div className="text-green-400 font-medium">{user.wins}</div>
                      </td>
                      
                      <td className="py-4 px-6 text-center">
                        <div className={`font-medium ${getWinRateColor(user.winPct)}`}>
                          {user.winPct}%
                        </div>
                      </td>
                      
                      <td className="py-4 px-6 text-center">
                        <div className="text-sm text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-purple-500/20">
              <div className="text-sm text-gray-400">
                Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, leaderboard.length)} of {totalPages * usersPerPage} users
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-purple-950/30 border border-purple-500/20 rounded hover:bg-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded ${
                          currentPage === pageNum
                            ? "bg-purple-600 text-white"
                            : "bg-purple-950/30 text-gray-400 hover:text-white hover:bg-purple-900/30"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-purple-950/30 border border-purple-500/20 rounded hover:bg-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {!loading && leaderboard.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="text-2xl text-gray-400 mb-4">No users found</div>
            <div className="text-gray-500">Try adjusting your search or filters</div>
          </div>
        )}
      </main>
    </div>
  );
}
