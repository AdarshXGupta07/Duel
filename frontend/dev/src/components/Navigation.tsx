"use client";
import { Button } from "./ui/stateful-button";
import { useRouter, usePathname } from "next/navigation";

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  // Only show buttons on home page
  if (pathname !== "/") {
    return null;
  }

  return (
    <div className="fixed top-8 right-8 z-[9999] flex gap-4">
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
    </div>
  );
}
