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
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8 flex items-center justify-center">
        <div className="text-2xl">Loading tournaments...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Available Tournaments</h1>
            <p className="text-gray-300">
              Choose a tournament to join the battle
            </p>
          </div>
          <Link
            href="/"
            className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Events and Tournaments */}
        {events.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎭</div>
            <h2 className="text-2xl font-semibold mb-4">No Events Available</h2>
            <p className="text-gray-400">
              Check back later for upcoming dance battle tournaments.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <h2 className="text-2xl font-bold mb-4 text-purple-400">
                  {event.name}
                </h2>

                {event.tournaments.length === 0 ? (
                  <p className="text-gray-400 italic">
                    No tournaments in this event yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {event.tournaments.map((tournament) => (
                      <div
                        key={tournament.id}
                        className="bg-gray-700 rounded-lg p-6 hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-semibold mb-2">
                              {tournament.name}
                            </h3>
                            <p className="text-gray-300 text-sm">
                              {tournament.danceStyle}
                            </p>
                          </div>
                          <span
                            className={`text-sm font-medium ${getStatusColor(
                              tournament
                            )}`}
                          >
                            {getStatusText(tournament)}
                          </span>
                        </div>

                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-400 mb-2">
                            <span>Participants</span>
                            <span>
                              {getParticipantCount(tournament)}/
                              {tournament.participantCount}
                            </span>
                          </div>
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
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

                        <div className="space-y-3">
                          <button
                            onClick={() =>
                              router.push(`/tournament/${tournament.id}`)
                            }
                            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                              isTournamentFull(tournament)
                                ? "bg-gray-500 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
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
                            className="w-full py-3 px-4 rounded-lg font-semibold transition-colors bg-purple-600 hover:bg-purple-700"
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
