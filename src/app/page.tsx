"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Crown, Sparkles, Zap, Flame } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: adminPassword }),
      });

      const data = await response.json();

      if (data.success) {
        const token = btoa(adminPassword);
        localStorage.setItem("adminMode", "true");
        localStorage.setItem("adminToken", token);
        setShowAdminModal(false);
        setAdminPassword("");
        router.push("/admin");
      } else {
        setAuthError("Invalid password");
      }
    } catch {
      setAuthError("Authentication failed");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(0, 212, 255, 0.3) 0%, transparent 50%)`,
          }}
        />
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
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

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <div className="flex items-center justify-center mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="text-6xl mr-4"
              >
                🕺
              </motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="text-6xl"
              >
                💃
              </motion.div>
            </div>

            <h1 className="text-7xl md:text-8xl font-orbitron font-black mb-6 neon-text text-cyan-400">
              DANCE BATTLE
            </h1>
            <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-4 neon-text text-purple-400">
              TOURNAMENT
            </h2>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="flex items-center justify-center gap-4 mb-8"
            >
              <Flame className="w-8 h-8 text-orange-400 animate-pulse" />
              <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
              <Zap className="w-8 h-8 text-cyan-400 animate-pulse" />
            </motion.div>

            <p className="text-2xl md:text-3xl font-rajdhani font-medium text-gray-300 mb-12 max-w-2xl mx-auto">
              Join the ultimate dance battle experience where legends are born
            </p>
          </motion.div>

          {/* Action cards */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          >
            {/* Participant Card */}
            <motion.div
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.95 }}
              className="card-neon spotlight group cursor-pointer"
              onClick={() => router.push("/register")}
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-8xl mb-6"
                >
                  🎭
                </motion.div>
                <div className="absolute top-0 right-0">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Trophy className="w-12 h-12 text-yellow-400" />
                  </motion.div>
                </div>
              </div>

              <h2 className="text-3xl font-orbitron font-bold mb-4 text-cyan-400 neon-text">
                PARTICIPANT
              </h2>
              <p className="text-lg text-gray-300 mb-8 font-rajdhani">
                View tournaments and register for epic dance battles
              </p>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="btn-neon w-full group-hover:glow"
              >
                JOIN BATTLE
              </motion.button>
            </motion.div>

            {/* Admin Card */}
            <motion.div
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.95 }}
              className="card-neon spotlight group cursor-pointer"
              onClick={() => setShowAdminModal(true)}
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-8xl mb-6"
                >
                  👑
                </motion.div>
                <div className="absolute top-0 right-0">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  >
                    <Crown className="w-12 h-12 text-purple-400" />
                  </motion.div>
                </div>
              </div>

              <h2 className="text-3xl font-orbitron font-bold mb-4 text-purple-400 neon-text">
                ADMIN
              </h2>
              <p className="text-lg text-gray-300 mb-8 font-rajdhani">
                Create events and manage legendary tournaments
              </p>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="btn-neon w-full group-hover:glow-purple"
                style={{
                  background:
                    "linear-gradient(45deg, var(--neon-purple), var(--neon-pink))",
                }}
              >
                ADMIN PANEL
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Admin Authentication Modal */}
      <AnimatePresence>
        {showAdminModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="glass-dark rounded-2xl p-8 max-w-md w-full border border-purple-500/30"
            >
              <div className="text-center mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="text-4xl mb-4"
                >
                  👑
                </motion.div>
                <h2 className="text-3xl font-orbitron font-bold neon-text text-purple-400">
                  ADMIN ACCESS
                </h2>
              </div>

              <form onSubmit={handleAdminAuth} className="space-y-6">
                <div>
                  <label className="block text-sm font-rajdhani font-medium mb-3 text-gray-300">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="input-neon w-full text-lg"
                    placeholder="Enter admin password"
                    required
                  />
                </div>

                {authError && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-center font-rajdhani"
                  >
                    {authError}
                  </motion.p>
                )}

                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="flex-1 btn-neon"
                    style={{
                      background:
                        "linear-gradient(45deg, var(--neon-purple), var(--neon-pink))",
                    }}
                  >
                    LOGIN
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => {
                      setShowAdminModal(false);
                      setAdminPassword("");
                      setAuthError("");
                    }}
                    className="flex-1 btn-neon"
                    style={{
                      background: "linear-gradient(45deg, #6b7280, #4b5563)",
                    }}
                  >
                    CANCEL
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
