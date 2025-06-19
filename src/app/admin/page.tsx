"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Plus,
  Trash2,
  Users,
  Calendar,
  Trophy,
  LogOut,
  Settings,
  Sparkles,
  Zap,
  Flame,
} from "lucide-react";

interface Event {
  id: string;
  name: string;
  date: string;
  tournaments: Tournament[];
}

interface Tournament {
  id: string;
  name: string;
  danceStyle: string;
  participantCount: number;
  status: string;
  participants: Participant[];
}

interface Participant {
  id: string;
  name: string;
  imageUrl: string;
  registrationNumber: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showCreateTournamentModal, setShowCreateTournamentModal] =
    useState(false);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedTournament, setSelectedTournament] =
    useState<Tournament | null>(null);

  // Event form state
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");

  // Tournament form state
  const [danceStyle, setDanceStyle] = useState("Hiphop");
  const [participantCount, setParticipantCount] = useState(8);

  const danceStyles = ["Hiphop", "Break", "Popping", "Locking", "House"];
  const participantCounts = [4, 8, 16, 32];

  useEffect(() => {
    // Check admin authentication
    const adminMode = localStorage.getItem("adminMode");
    if (adminMode !== "true") {
      router.push("/");
      return;
    }

    fetchEvents();
  }, [router]);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: eventName,
          date: eventDate,
        }),
      });

      if (response.ok) {
        setEventName("");
        setEventDate("");
        setShowCreateEventModal(false);
        await fetchEvents();
      }
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/tournaments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          danceStyle,
          participantCount,
          eventId: selectedEventId,
        }),
      });

      if (response.ok) {
        setDanceStyle("Hiphop");
        setParticipantCount(8);
        setShowCreateTournamentModal(false);
        await fetchEvents();
      }
    } catch (error) {
      console.error("Error creating tournament:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminMode");
    localStorage.removeItem("adminToken");
    router.push("/");
  };

  // Event 삭제
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("정말로 이 이벤트를 삭제하시겠습니까?")) return;
    try {
      await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      await fetchEvents();
    } catch {
      alert("이벤트 삭제 중 오류 발생");
    }
  };

  // Tournament 삭제
  const handleDeleteTournament = async (tournamentId: string) => {
    if (!confirm("정말로 이 토너먼트를 삭제하시겠습니까?")) return;
    try {
      await fetch(`/api/tournaments/${tournamentId}`, { method: "DELETE" });
      await fetchEvents();
    } catch {
      alert("토너먼트 삭제 중 오류 발생");
    }
  };

  // Bracket 생성 함수 추가
  const handleGenerateBrackets = async (tournamentId: string) => {
    const tournament = events
      .flatMap((e) => e.tournaments)
      .find((t) => t.id === tournamentId);

    if (!tournament) return;

    if (tournament.status !== "READY_TO_BRACKET") {
      alert(
        "Cannot generate brackets yet. Please wait for judges to complete preselection."
      );
      return;
    }

    if (
      !confirm(
        "브래킷을 생성하시겠습니까? 생성 후에는 더 이상 참가자를 추가할 수 없습니다."
      )
    )
      return;

    try {
      const response = await fetch(
        `/api/tournaments/${tournamentId}/generate-brackets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            adminPassword: localStorage.getItem("adminToken"),
          }),
        }
      );

      if (response.ok) {
        await fetchEvents();
      }
    } catch (error) {
      console.error("Error generating brackets:", error);
      alert("브래킷 생성 중 오류가 발생했습니다.");
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
                className="absolute w-1 h-1 bg-purple-400 rounded-full"
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
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full" />
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
              className="absolute w-1 h-1 bg-purple-400 rounded-full"
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

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 glass-dark border-b border-purple-500/30"
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="text-4xl"
              >
                👑
              </motion.div>
              <div>
                <h1 className="text-3xl font-orbitron font-black neon-text text-purple-400">
                  ADMIN PANEL
                </h1>
                <p className="text-gray-300 font-rajdhani">
                  Manage your legendary tournaments
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
                <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="btn-neon"
                style={{
                  background: "linear-gradient(45deg, #ef4444, #dc2626)",
                  padding: "8px 16px",
                  fontSize: "14px",
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                LOGOUT
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex flex-wrap gap-4 mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateEventModal(true)}
            className="btn-neon glow-purple"
            style={{
              background:
                "linear-gradient(45deg, var(--neon-purple), var(--neon-pink))",
            }}
          >
            <Plus className="w-5 h-5 mr-2" />
            CREATE EVENT
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateTournamentModal(true)}
            className="btn-neon glow"
          >
            <Trophy className="w-5 h-5 mr-2" />
            CREATE TOURNAMENT
          </motion.button>
        </motion.div>

        {/* Events list */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="space-y-8"
        >
          {events.map((event) => (
            <div key={event.id} className="card-neon spotlight">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-3xl"
                  >
                    🎪
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-orbitron font-bold text-cyan-400 neon-text">
                      {event.name}
                    </h2>
                    <p className="text-gray-300 font-rajdhani flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDeleteEvent(event.id)}
                  className="btn-neon"
                  style={{
                    background: "linear-gradient(45deg, #ef4444, #dc2626)",
                    padding: "8px 16px",
                    fontSize: "14px",
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  DELETE
                </motion.button>
              </div>

              {/* Tournaments */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {event.tournaments.map((tournament) => (
                  <div
                    key={tournament.id}
                    className="glass border border-purple-500/30 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="text-2xl"
                        >
                          🏆
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-orbitron font-bold text-purple-400">
                            {tournament.name}
                          </h3>
                          <p className="text-sm text-gray-400 font-rajdhani">
                            {tournament.danceStyle}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">Participants:</span>
                        <span className="text-cyan-400 font-bold">
                          {tournament.participantCount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">Status:</span>
                        <span
                          className={`font-bold ${
                            tournament.status === "READY_TO_BRACKET"
                              ? "text-green-400"
                              : tournament.status === "BRACKET_GENERATED"
                              ? "text-orange-400"
                              : "text-yellow-400"
                          }`}
                        >
                          {tournament.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedTournament(tournament);
                          setShowParticipantsModal(true);
                        }}
                        className="btn-neon flex-1"
                        style={{
                          background:
                            "linear-gradient(45deg, var(--neon-blue), var(--neon-purple))",
                          padding: "8px 12px",
                          fontSize: "12px",
                        }}
                      >
                        <Users className="w-4 h-4 mr-1" />
                        VIEW
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteTournament(tournament.id)}
                        className="btn-neon"
                        style={{
                          background:
                            "linear-gradient(45deg, #ef4444, #dc2626)",
                          padding: "8px 12px",
                          fontSize: "12px",
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>

                    {tournament.status === "READY_TO_BRACKET" && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleGenerateBrackets(tournament.id)}
                        className="btn-neon w-full mt-3 glow"
                        style={{
                          background:
                            "linear-gradient(45deg, #10b981, #059669)",
                          padding: "8px 12px",
                          fontSize: "12px",
                        }}
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        GENERATE BRACKETS
                      </motion.button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Create Event Modal */}
      <AnimatePresence>
        {showCreateEventModal && (
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
                  🎪
                </motion.div>
                <h2 className="text-3xl font-orbitron font-bold neon-text text-purple-400">
                  CREATE EVENT
                </h2>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-6">
                <div>
                  <label className="block text-sm font-rajdhani font-medium mb-3 text-gray-300">
                    Event Name
                  </label>
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="input-neon w-full"
                    placeholder="Enter event name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-rajdhani font-medium mb-3 text-gray-300">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="input-neon w-full"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="flex-1 btn-neon glow-purple"
                    style={{
                      background:
                        "linear-gradient(45deg, var(--neon-purple), var(--neon-pink))",
                    }}
                  >
                    CREATE
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setShowCreateEventModal(false)}
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

      {/* Create Tournament Modal */}
      <AnimatePresence>
        {showCreateTournamentModal && (
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
              className="glass-dark rounded-2xl p-8 max-w-md w-full border border-cyan-500/30"
            >
              <div className="text-center mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="text-4xl mb-4"
                >
                  🏆
                </motion.div>
                <h2 className="text-3xl font-orbitron font-bold neon-text text-cyan-400">
                  CREATE TOURNAMENT
                </h2>
              </div>

              <form onSubmit={handleCreateTournament} className="space-y-6">
                <div>
                  <label className="block text-sm font-rajdhani font-medium mb-3 text-gray-300">
                    Select Event
                  </label>
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="input-neon w-full"
                    required
                  >
                    <option value="">Choose an event...</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-rajdhani font-medium mb-3 text-gray-300">
                    Dance Style
                  </label>
                  <select
                    value={danceStyle}
                    onChange={(e) => setDanceStyle(e.target.value)}
                    className="input-neon w-full"
                    required
                  >
                    {danceStyles.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-rajdhani font-medium mb-3 text-gray-300">
                    Participant Count
                  </label>
                  <select
                    value={participantCount}
                    onChange={(e) =>
                      setParticipantCount(Number(e.target.value))
                    }
                    className="input-neon w-full"
                    required
                  >
                    {participantCounts.map((count) => (
                      <option key={count} value={count}>
                        {count} Participants
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="flex-1 btn-neon glow"
                  >
                    CREATE
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setShowCreateTournamentModal(false)}
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

      {/* Participants Modal */}
      <AnimatePresence>
        {showParticipantsModal && selectedTournament && (
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
              className="glass-dark rounded-2xl p-8 max-w-4xl w-full border border-pink-500/30 max-h-[80vh] overflow-y-auto"
            >
              <div className="text-center mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="text-4xl mb-4"
                >
                  👥
                </motion.div>
                <h2 className="text-3xl font-orbitron font-bold neon-text text-pink-400">
                  PARTICIPANTS
                </h2>
                <p className="text-gray-300 font-rajdhani mt-2">
                  {selectedTournament.name} - {selectedTournament.danceStyle}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedTournament.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="glass border border-pink-500/30 rounded-xl p-4"
                  >
                    <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-pink-400 glow-pink">
                      <Image
                        src={participant.imageUrl}
                        alt={participant.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-orbitron font-bold text-pink-400">
                        {participant.name}
                      </h3>
                      <p className="text-sm text-gray-400 font-rajdhani">
                        #{participant.registrationNumber}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowParticipantsModal(false)}
                  className="btn-neon"
                  style={{
                    background: "linear-gradient(45deg, #6b7280, #4b5563)",
                  }}
                >
                  CLOSE
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
