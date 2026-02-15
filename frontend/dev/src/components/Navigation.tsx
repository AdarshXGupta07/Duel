"use client";
import { Button } from "./ui/stateful-button";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Don't show navigation on auth pages or dashboard
  if (pathname === "/login" || pathname === "/signup" || pathname === "/dashboard") {
    return null;
  }

  return (
    <div className="fixed top-8 right-8 z-[9999] flex gap-4">
      {user ? (
        <button 
          className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
          onClick={() => router.push('/dashboard')}
        >
          Dashboard
        </button>
      ) : (
        <>
          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-white hover:text-purple-400 transition-colors">
              Home
            </a>
            <a href="/leaderboard" className="text-gray-300 hover:text-white transition-colors">
              Leaderboard
            </a>
            <a href="/problems" className="text-gray-300 hover:text-white transition-colors">
              Problems
            </a>
            <a href="/compete" className="text-purple-400 hover:text-purple-300 transition-colors font-semibold">
              🏆 Compete
            </a>
          </div>
          <button 
            className="px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
            onClick={() => router.push('/login')}
          >
            Login
          </button>
          <button 
            className="px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
            onClick={() => router.push('/signup')}
          >
            Sign Up
          </button>
        </>
      )}
    </div>
  );
}
