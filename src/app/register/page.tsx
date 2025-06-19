"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, Camera, Trophy, ArrowLeft, Sparkles, Zap } from "lucide-react";

interface Tournament {
  id: string;
  name: string;
  danceStyle: string;
  status: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await fetch("/api/tournaments");
      if (response.ok) {
        const data = await response.json();
        setTournaments(data);
      }
    } catch (error) {
      console.error("Error fetching tournaments:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !selectedImage || !selectedTournament) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("image", selectedImage);
    formData.append("tournamentId", selectedTournament);

    try {
      const response = await fetch("/api/participants", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        router.push("/registration-complete");
      }
    } catch (error) {
      console.error("Error registering participant:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(15)].map((_, i) => (
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
        <div className="max-w-2xl w-full">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => router.push("/")}
              className="absolute top-8 left-8 btn-neon"
              style={{
                background: "linear-gradient(45deg, #6b7280, #4b5563)",
                padding: "8px 16px",
                fontSize: "14px",
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              BACK
            </motion.button>

            <div className="flex items-center justify-center mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="text-6xl mr-4"
              >
                🎭
              </motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="text-6xl"
              >
                ⚡
              </motion.div>
            </div>

            <h1 className="text-5xl md:text-6xl font-orbitron font-black mb-4 neon-text text-cyan-400">
              REGISTER
            </h1>
            <h2 className="text-2xl md:text-3xl font-orbitron font-bold mb-6 neon-text text-purple-400">
              FOR BATTLE
            </h2>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="flex items-center justify-center gap-4 mb-8"
            >
              <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
              <Zap className="w-6 h-6 text-cyan-400 animate-pulse" />
              <Trophy className="w-6 h-6 text-orange-400 animate-pulse" />
            </motion.div>

            <p className="text-xl font-rajdhani font-medium text-gray-300">
              Join the ultimate dance battle and become a legend
            </p>
          </motion.div>

          {/* Registration form */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="card-neon spotlight"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Tournament Selection */}
              <div>
                <label className="block text-sm font-rajdhani font-semibold mb-4 text-cyan-400 uppercase tracking-wider">
                  <Trophy className="w-5 h-5 inline mr-2" />
                  Select Battle
                </label>
                <select
                  value={selectedTournament}
                  onChange={(e) => setSelectedTournament(e.target.value)}
                  className="input-neon w-full text-lg"
                  required
                >
                  <option value="">Choose your battle...</option>
                  {tournaments.map((tournament) => (
                    <option key={tournament.id} value={tournament.id}>
                      {tournament.name} - {tournament.danceStyle}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-sm font-rajdhani font-semibold mb-4 text-purple-400 uppercase tracking-wider">
                  <User className="w-5 h-5 inline mr-2" />
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-neon w-full text-lg"
                  placeholder="Enter your legendary name"
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-rajdhani font-semibold mb-4 text-pink-400 uppercase tracking-wider">
                  <Camera className="w-5 h-5 inline mr-2" />
                  Your Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="input-neon w-full text-lg"
                  required
                />

                <AnimatePresence>
                  {imagePreview && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="mt-6 flex justify-center"
                    >
                      <div className="relative w-40 h-40 rounded-2xl overflow-hidden border-2 border-cyan-400 glow">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading}
                className="btn-neon w-full text-xl font-orbitron font-bold glow"
                style={{
                  background:
                    "linear-gradient(45deg, var(--neon-blue), var(--neon-purple))",
                  padding: "16px 32px",
                }}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="flex items-center justify-center"
                  >
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mr-3" />
                    REGISTERING...
                  </motion.div>
                ) : (
                  "JOIN THE BATTLE"
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
