"use client";
import { motion } from "motion/react";
import { HeroHighlight, Highlight } from "./ui/hero-highlight";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="relative h-screen w-full bg-black">
      {/* Top Right Buttons - Outside HeroHighlight */}
      <div className="fixed top-6 right-6 flex gap-3 z-[100]">
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300"
        >
          Login
        </button>
        
        <button
          onClick={() => router.push('/signup')}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300"
        >
          Sign Up
        </button>
      </div>

      {/* HeroHighlight for background and main content */}
      <HeroHighlight containerClassName="bg-black">
        <div className="text-center">
          <motion.h1
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: [20, -5, 0],
            }}
            transition={{
              duration: 0.5,
              ease: [0.4, 0.0, 0.2, 1],
            }}
            className="text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-wider uppercase bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-8"
          >
            DEVDUEL AI
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-4 max-w-2xl mx-auto"
          >
            <Highlight className="text-white">
              Code. Compete. Dominate.
            </Highlight>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto"
          >
            Compete live. Learn faster. Rank higher.
          </motion.p>
        </div>
      </HeroHighlight>
    </div>
  );
}
