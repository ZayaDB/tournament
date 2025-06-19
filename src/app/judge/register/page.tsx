"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Camera,
  Trophy,
  ArrowLeft,
  Sparkles,
  Zap,
  Flame,
  Users,
  Star,
} from "lucide-react";

interface Tournament {
  id: string;
  name: string;
  danceStyle: string;
  participantCount: number;
  status: string;
  event: {
    name: string;
  };
  judges: {
    id: string;
    name: string;
    imageUrl: string;
  }[];
}

export default function JudgeRegisterPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [judgeData, setJudgeData] = useState({
    name: "",
    image: null as File | null,
    tournamentId: "",
  });
  const router = useRouter();

  useEffect(() => {
    fetchTournaments();
  }, [router]);

  const fetchTournaments = async () => {
    try {
      const response = await fetch("/api/tournaments");
      if (response.ok) {
        const data = await response.json();
        setTournaments(data);
      }
    } catch (error) {
      console.error("Error fetching tournaments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setJudgeData((prev) => ({ ...prev, image: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judgeData.name || !judgeData.image || !judgeData.tournamentId) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", judgeData.name);
      formData.append("image", judgeData.image);
      formData.append("tournamentId", judgeData.tournamentId);

      const response = await fetch("/api/judges", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to judge panel
        router.push(`/judge/panel/${data.judge.id}`);
      } else {
        const errorData = await response.json();
        console.error("Failed to register judge:", errorData.error);
        alert("Failed to register judge. Please try again.");
      }
    } catch (error) {
      console.error("Error registering judge:", error);
      alert("Error registering judge. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-orange-400 rounded-full"
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

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="relative z-10"
        >
          <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-orange-400 rounded-full"
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
      <div className="relative z-10 min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-between items-center mb-12"
          >
            <div className="flex items-center space-x-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="text-4xl"
              >
                👨‍⚖️
              </motion.div>
              <div>
                <h1 className="text-4xl font-orbitron font-black neon-text text-orange-400">
                  JUDGE REGISTRATION
                </h1>
                <p className="text-gray-300 font-rajdhani">
                  Join the elite panel of dance battle judges
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                localStorage.removeItem("judgeMode");
                localStorage.removeItem("judgeToken");
                router.push("/");
              }}
              className="btn-neon"
              style={{
                background: "linear-gradient(45deg, #6b7280, #4b5563)",
                padding: "8px 16px",
                fontSize: "14px",
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              BACK
            </motion.button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Registration Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="card-neon spotlight"
            >
              <div className="text-center mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="text-4xl mb-4"
                >
                  ⚖️
                </motion.div>
                <h2 className="text-2xl font-orbitron font-bold neon-text text-orange-400">
                  REGISTER AS JUDGE
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-rajdhani font-semibold mb-4 text-cyan-400 uppercase tracking-wider">
                    <User className="w-5 h-5 inline mr-2" />
                    Judge Name
                  </label>
                  <input
                    type="text"
                    value={judgeData.name}
                    onChange={(e) =>
                      setJudgeData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="input-neon w-full"
                    placeholder="Enter your judge name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-rajdhani font-semibold mb-4 text-purple-400 uppercase tracking-wider">
                    <Camera className="w-5 h-5 inline mr-2" />
                    Profile Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="input-neon w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-rajdhani font-semibold mb-4 text-pink-400 uppercase tracking-wider">
                    <Trophy className="w-5 h-5 inline mr-2" />
                    Select Tournament
                  </label>
                  <select
                    value={judgeData.tournamentId}
                    onChange={(e) =>
                      setJudgeData((prev) => ({
                        ...prev,
                        tournamentId: e.target.value,
                      }))
                    }
                    className="input-neon w-full"
                    required
                  >
                    <option value="">Choose a tournament...</option>
                    {tournaments.map((tournament) => (
                      <option key={tournament.id} value={tournament.id}>
                        {tournament.event?.name || "Unknown Event"} -{" "}
                        {tournament.name || tournament.danceStyle} (
                        {tournament.danceStyle})
                      </option>
                    ))}
                  </select>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={submitting}
                  className="btn-neon w-full glow"
                  style={{
                    background:
                      "linear-gradient(45deg, var(--neon-orange), #f97316)",
                    padding: "16px 32px",
                    fontSize: "18px",
                  }}
                >
                  {submitting ? (
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
                    "REGISTER AS JUDGE"
                  )}
                </motion.button>
              </form>
            </motion.div>

            {/* Current Judges List */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="card-neon spotlight"
            >
              <div className="text-center mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="text-4xl mb-4"
                >
                  👥
                </motion.div>
                <h2 className="text-2xl font-orbitron font-bold neon-text text-cyan-400">
                  CURRENT JUDGES
                </h2>
              </div>

              <div className="space-y-6 max-h-96 overflow-y-auto">
                {tournaments.map((tournament) => (
                  <div
                    key={tournament.id}
                    className="glass border border-cyan-500/30 rounded-xl p-6"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="text-2xl"
                      >
                        🏆
                      </motion.div>
                      <div>
                        <h3 className="text-lg font-orbitron font-bold text-cyan-400">
                          {tournament.event?.name} -{" "}
                          {tournament.name || tournament.danceStyle}
                        </h3>
                        <p className="text-sm text-gray-400 font-rajdhani">
                          {tournament.danceStyle}
                        </p>
                      </div>
                    </div>

                    {tournament.judges && tournament.judges.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {tournament.judges.map((judge) => (
                          <div
                            key={judge.id}
                            className="glass border border-purple-500/30 rounded-lg p-4"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-purple-400 glow-purple">
                                <Image
                                  src={judge.imageUrl}
                                  alt={judge.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <h4 className="font-orbitron font-bold text-purple-400">
                                  {judge.name}
                                </h4>
                                <div className="flex items-center">
                                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                  <span className="text-xs text-gray-400 font-rajdhani">
                                    Judge
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-4xl mb-4"
                        >
                          🤔
                        </motion.div>
                        <p className="text-gray-400 font-rajdhani">
                          No judges registered yet for this tournament.
                        </p>
                        <p className="text-sm text-gray-500 font-rajdhani mt-2">
                          Be the first to join!
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
