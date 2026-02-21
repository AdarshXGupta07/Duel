"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type User = {
  _id: string;
  username: string;
  email: string;
  rating: number;
  matches: number;
  winPct: number;
  rank?: number;
};

type ProblemHistory = {
  problemId: string;
  problemTitle: string;
  difficulty: "Easy" | "Medium" | "Hard";
  status: "Solved" | "Attempted" | "Failed";
  timeTaken: string;
  date: string;
};

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "history" | "rank">("profile");
  
  // Form states
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Mock data - replace with actual API calls
  const problemHistory: ProblemHistory[] = [
    { problemId: "P001", problemTitle: "Two Sum", difficulty: "Easy", status: "Solved", timeTaken: "5:23", date: "2024-01-15" },
    { problemId: "P002", problemTitle: "Binary Search", difficulty: "Medium", status: "Solved", timeTaken: "12:45", date: "2024-01-14" },
    { problemId: "P003", problemTitle: "Dynamic Programming", difficulty: "Hard", status: "Attempted", timeTaken: "25:10", date: "2024-01-13" },
    { problemId: "P004", problemTitle: "Graph Traversal", difficulty: "Medium", status: "Solved", timeTaken: "8:30", date: "2024-01-12" },
    { problemId: "P005", problemTitle: "String Manipulation", difficulty: "Easy", status: "Solved", timeTaken: "3:15", date: "2024-01-11" },
    { problemId: "P006", problemTitle: "Tree Algorithms", difficulty: "Hard", status: "Failed", timeTaken: "30:00", date: "2024-01-10" },
    { problemId: "P007", problemTitle: "Hash Tables", difficulty: "Medium", status: "Solved", timeTaken: "10:20", date: "2024-01-09" },
    { problemId: "P008", problemTitle: "Recursion", difficulty: "Medium", status: "Solved", timeTaken: "15:45", date: "2024-01-08" },
    { problemId: "P009", problemTitle: "Sorting Algorithms", difficulty: "Easy", status: "Solved", timeTaken: "6:30", date: "2024-01-07" },
    { problemId: "P010", problemTitle: "Backtracking", difficulty: "Hard", status: "Attempted", timeTaken: "28:15", date: "2024-01-06" }
  ];

  const leaderboardData = [
    { rank: 1, username: "CodeMaster", rating: 2450, matches: 142, winPct: 78 },
    { rank: 2, username: "AlgoKing", rating: 2380, matches: 128, winPct: 75 },
    { rank: 3, username: "ProCoder", rating: 2290, matches: 115, winPct: 72 },
    { rank: 4, username: "TechNinja", rating: 2150, matches: 98, winPct: 69 },
    { rank: 5, username: "ByteWarrior", rating: 2080, matches: 87, winPct: 66 },
    { rank: 6, username: "DataWizard", rating: 1950, matches: 76, winPct: 63 },
    { rank: 7, username: "LogicMaster", rating: 1820, matches: 65, winPct: 60 },
    { rank: 8, username: "CodeNinja", rating: 1750, matches: 58, winPct: 58 },
    { rank: 9, username: "AlgoExpert", rating: 1680, matches: 52, winPct: 55 },
    { rank: 10, username: "DevDueler", rating: 1600, matches: 45, winPct: 52 }
  ];

  useEffect(() => {
    // Load user data from localStorage or API
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        username: parsedUser.username || "",
        email: parsedUser.email || "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } else {
      // Redirect to login if no user data
      router.push('/login');
    }
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Validate passwords if changing
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        setMessage("New passwords don't match");
        setLoading(false);
        return;
      }

      const updateData: any = {
        username: formData.username,
        email: formData.email
      };

      // Add password update if provided
      if (formData.newPassword && formData.oldPassword) {
        updateData.oldPassword = formData.oldPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (response.ok) {
        // Update local storage
        const updatedUser = { ...user!, ...result.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setMessage("Profile updated successfully!");
        setIsEditing(false);
        
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          oldPassword: "",
          newPassword: "",
          confirmPassword: ""
        }));
      } else {
        setMessage(result.error || "Update failed");
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "text-green-400";
      case "Medium": return "text-yellow-400";
      case "Hard": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Solved": return "text-green-400 bg-green-400/20";
      case "Attempted": return "text-yellow-400 bg-yellow-400/20";
      case "Failed": return "text-red-400 bg-red-400/20";
      default: return "text-gray-400 bg-gray-400/20";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 to-black/50 z-0" />
      
      {/* Header */}
      <header className="relative z-10 border-b border-purple-500/20 bg-black/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Profile
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-gray-400">Rating</div>
              <div className="text-xl font-bold text-purple-400">{user.rating}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-purple-950/30 p-1 rounded-lg border border-purple-500/20">
          {[
            { id: "profile", label: "Profile Settings" },
            { id: "history", label: "Problem History" },
            { id: "rank", label: "Leaderboard" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-4 rounded-md transition-all ${
                activeTab === tab.id
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-purple-900/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Profile Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>

            {message && (
              <div className={`mb-4 p-3 rounded-lg ${
                message.includes("success") ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
              }`}>
                {message}
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Username</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full px-4 py-2 bg-purple-950/30 border border-purple-500/20 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2 bg-purple-950/30 border border-purple-500/20 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="border-t border-purple-500/20 pt-6">
                  <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Current Password</label>
                      <input
                        type="password"
                        value={formData.oldPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, oldPassword: e.target.value }))}
                        className="w-full px-4 py-2 bg-purple-950/30 border border-purple-500/20 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">New Password</label>
                        <input
                          type="password"
                          value={formData.newPassword}
                          onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full px-4 py-2 bg-purple-950/30 border border-purple-500/20 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-4 py-2 bg-purple-950/30 border border-purple-500/20 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Username</div>
                    <div className="text-lg">{user.username}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Email</div>
                    <div className="text-lg">{user.email}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Rating</div>
                    <div className="text-lg text-purple-400 font-bold">{user.rating}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Matches</div>
                    <div className="text-lg">{user.matches}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Win Rate</div>
                    <div className="text-lg">{user.winPct}%</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Global Rank</div>
                    <div className="text-lg text-purple-400 font-bold">#{user.rank || "N/A"}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-8">
            <h2 className="text-xl font-bold mb-6">Problem History (Top 10)</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-500/20">
                    <th className="text-left py-3 px-4">Problem</th>
                    <th className="text-left py-3 px-4">Difficulty</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Time</th>
                    <th className="text-left py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {problemHistory.map((problem, index) => (
                    <tr key={index} className="border-b border-purple-500/10 hover:bg-purple-950/10 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{problem.problemTitle}</div>
                          <div className="text-sm text-gray-400">{problem.problemId}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${getDifficultyColor(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(problem.status)}`}>
                          {problem.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{problem.timeTaken}</td>
                      <td className="py-3 px-4 text-gray-300">{problem.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Rank Tab */}
        {activeTab === "rank" && (
          <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-8">
            <h2 className="text-xl font-bold mb-6">Global Leaderboard (Top 10)</h2>
            
            <div className="space-y-3">
              {leaderboardData.map((player) => (
                <div 
                  key={player.rank} 
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    player.username === user.username 
                      ? "bg-purple-600/20 border-purple-500" 
                      : "bg-purple-950/10 border-purple-500/20 hover:bg-purple-950/20"
                  } transition-colors`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      player.rank <= 3 ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-black" : "bg-purple-600 text-white"
                    }`}>
                      {player.rank}
                    </div>
                    <div>
                      <div className="font-medium">{player.username}</div>
                      <div className="text-sm text-gray-400">Rating: {player.rating}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="text-gray-400">Matches</div>
                      <div className="font-medium">{player.matches}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">Win %</div>
                      <div className="font-medium">{player.winPct}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}