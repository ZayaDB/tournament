"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Trophy, Star, Sparkles, Zap, Home } from "lucide-react";

export default function RegistrationCompletePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 2 + 1,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="mb-12"
          >
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-32 h-32 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 glow"
                style={{
                  boxShadow: "0 0 40px rgba(34, 197, 94, 0.5)",
                }}
              >
                <CheckCircle className="w-16 h-16 text-white" />
              </motion.div>

              {/* Floating icons */}
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute -top-4 -right-4"
              >
                <Star className="w-8 h-8 text-yellow-400" />
              </motion.div>

              <motion.div
                animate={{
                  rotate: -360,
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute -top-4 -left-4"
              >
                <Sparkles className="w-8 h-8 text-cyan-400" />
              </motion.div>

              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute -bottom-4 -right-4"
              >
                <Zap className="w-8 h-8 text-purple-400" />
              </motion.div>

              <motion.div
                animate={{
                  rotate: -360,
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute -bottom-4 -left-4"
              >
                <Trophy className="w-8 h-8 text-orange-400" />
              </motion.div>
            </div>
          </motion.div>

          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-orbitron font-black mb-6 neon-text text-green-400">
              REGISTRATION
            </h1>
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-8 neon-text text-cyan-400">
              COMPLETE!
            </h2>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: "spring" }}
              className="flex items-center justify-center gap-4 mb-8"
            >
              <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
              <Zap className="w-8 h-8 text-cyan-400 animate-pulse" />
              <Trophy className="w-8 h-8 text-orange-400 animate-pulse" />
            </motion.div>

            <p className="text-xl md:text-2xl font-rajdhani font-medium text-gray-300 mb-6 max-w-lg mx-auto">
              Welcome to the ultimate dance battle! Your registration has been
              successfully submitted.
            </p>

            <p className="text-lg font-rajdhani text-gray-400 mb-8">
              Get ready to showcase your moves and become a legend!
            </p>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="space-y-6"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/"
                className="btn-neon inline-flex items-center justify-center w-full md:w-auto px-12 py-4 text-xl font-orbitron font-bold glow"
                style={{
                  background:
                    "linear-gradient(45deg, var(--neon-blue), var(--neon-purple))",
                }}
              >
                <Home className="w-6 h-6 mr-3" />
                BACK TO HOME
              </Link>
            </motion.div>
          </motion.div>

          {/* Celebration particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -200],
                  opacity: [1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
