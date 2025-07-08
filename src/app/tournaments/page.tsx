"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  registrationNumber: number;
}

export default function TournamentsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

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

  const getParticipantCount = (tournament: Tournament) => {
    return tournament.participants?.length || 0;
  };

  const isTournamentFull = (tournament: Tournament) => {
    return getParticipantCount(tournament) >= tournament.participantCount;
  };

  const getStatusColor = (tournament: Tournament) => {
    if (tournament.status === "ACTIVE") return "text-green-400";
    if (isTournamentFull(tournament)) return "text-yellow-400";
    return "text-blue-400";
  };

  const getStatusText = (tournament: Tournament) => {
    if (tournament.status === "ACTIVE") return "In Progress";
    if (isTournamentFull(tournament)) return "Full";
    return "Open for Registration";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-float">🎭</div>
          <div className="text-2xl font-bold dance-gradient-text">
            Loading tournaments...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-5xl font-black mb-4 dance-gradient-text tracking-tight">
              Available Tournaments
            </h1>
            <p className="text-xl text-gray-300 font-light">
              Choose a tournament to join the ultimate dance battle
            </p>
          </div>
          <Link
            href="/"
            className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 px-8 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Events and Tournaments */}
        {events.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6 animate-float">🎭</div>
            <h2 className="text-3xl font-bold mb-6 dance-gradient-text">
              No Events Available
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Check back later for upcoming dance battle tournaments. The stage
              is being prepared for epic battles!
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-2xl"
              >
                <h2 className="text-3xl font-bold mb-6 gradient-text">
                  {event.name}
                </h2>

                {event.tournaments.length === 0 ? (
                  <p className="text-gray-400 italic text-lg">
                    No tournaments in this event yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {event.tournaments.map((tournament) => (
                      <div
                        key={tournament.id}
                        className="group relative bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-sm rounded-xl p-6 hover:scale-105 transition-all duration-300 border border-gray-600/50 hover:border-purple-500/50 shadow-lg hover:shadow-purple-500/25"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-3 text-white group-hover:text-purple-300 transition-colors">
                              {tournament.name}
                              <span className="ml-3 text-sm font-mono px-3 py-1 rounded-full bg-gray-900/60 border border-gray-700 text-yellow-300 align-middle">
                                {getParticipantCount(tournament)}/
                                {tournament.participantCount}
                              </span>
                            </h3>
                            <p className="text-gray-300 text-sm font-medium">
                              {tournament.danceStyle}
                            </p>
                          </div>
                          <span
                            className={`text-sm font-bold px-3 py-1 rounded-full ${
                              tournament.status === "ACTIVE"
                                ? "bg-green-600/20 text-green-400 border border-green-500/30"
                                : isTournamentFull(tournament)
                                ? "bg-yellow-600/20 text-yellow-400 border border-yellow-500/30"
                                : "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                            }`}
                          >
                            {getStatusText(tournament)}
                          </span>
                        </div>

                        <div className="mb-6">
                          <div className="flex justify-between text-sm text-gray-400 mb-3">
                            <span className="font-medium">Participants</span>
                            <span className="font-bold">
                              {getParticipantCount(tournament)}/
                              {tournament.participantCount}
                            </span>
                          </div>
                          <div className="w-full bg-gray-600/50 rounded-full h-3 backdrop-blur-sm">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                              style={{
                                width: `${
                                  (getParticipantCount(tournament) /
                                    tournament.participantCount) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <button
                            onClick={() =>
                              router.push(`/tournament/${tournament.id}`)
                            }
                            className={`w-full py-4 px-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                              isTournamentFull(tournament)
                                ? "bg-gray-500 cursor-not-allowed opacity-50"
                                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-blue-500/25"
                            }`}
                            disabled={isTournamentFull(tournament)}
                          >
                            {isTournamentFull(tournament)
                              ? "Tournament Full"
                              : "Join Tournament"}
                          </button>

                          <button
                            onClick={() =>
                              router.push(`/judge/${tournament.id}`)
                            }
                            className="w-full py-4 px-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:shadow-purple-500/25"
                          >
                            Judge Tournament
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
