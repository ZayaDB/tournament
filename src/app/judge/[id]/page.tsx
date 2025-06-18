"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";

interface Participant {
  id: string;
  name: string;
  imageUrl: string;
  registrationNumber: number;
  tournamentId: string;
  scores: Score[];
}

interface Score {
  id: string;
  value: number;
  judgeId: string;
}

interface Tournament {
  id: string;
  name: string;
  danceStyle: string;
  participantCount: number;
  status: string;
}

export default function JudgePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState<number>(5);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTournamentData();
  }, [id]);

  const fetchTournamentData = async () => {
    try {
      // Fetch tournament info
      const tournamentResponse = await fetch(`/api/tournaments/${id}`);
      if (tournamentResponse.ok) {
        const tournamentData = await tournamentResponse.json();
        setTournament(tournamentData);
      }

      // Fetch participants
      const participantsResponse = await fetch(
        `/api/tournaments/${id}/participants`
      );
      if (participantsResponse.ok) {
        const participantsData = await participantsResponse.json();
        setParticipants(participantsData);
      }
    } catch (error) {
      console.error("Error fetching tournament data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreSubmit = async (participantId: string) => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantId,
          tournamentId: id,
          score,
          judgeId: "judge-1", // In a real app, this would come from authentication
        }),
      });

      if (response.ok) {
        await fetchTournamentData(); // Refresh participants to show updated scores
      }
    } catch (error) {
      console.error("Error submitting score:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getAverageScore = (scores: Score[]) => {
    if (scores.length === 0) return 0;
    return scores.reduce((sum, score) => sum + score.value, 0) / scores.length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8 flex items-center justify-center">
        <div className="text-2xl">Loading tournament...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Judge Panel - {tournament?.name}
            </h1>
            <p className="text-gray-300">
              Score participants for the {tournament?.danceStyle} battle
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("judgeMode");
              window.location.href = "/";
            }}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Logout
          </button>
        </div>

        {participants.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎭</div>
            <h2 className="text-2xl font-semibold mb-4">No Participants Yet</h2>
            <p className="text-gray-400">
              Participants need to register before you can score them.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {participants
              .sort((a, b) => a.registrationNumber - b.registrationNumber)
              .map((participant) => (
                <div
                  key={participant.id}
                  className="bg-gray-800 rounded-lg p-6 space-y-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16">
                      <Image
                        src={participant.imageUrl}
                        alt={participant.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg">
                        #{participant.registrationNumber} {participant.name}
                      </div>
                      <div className="text-gray-400">
                        Average Score:{" "}
                        <span className="text-yellow-400 font-semibold">
                          {getAverageScore(participant.scores).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-medium">
                        Score (1-10):
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={score}
                        onChange={(e) => setScore(Number(e.target.value))}
                        className="w-20 p-2 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={() => handleScoreSubmit(participant.id)}
                      disabled={submitting}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
                    >
                      {submitting ? "Submitting..." : "Submit Score"}
                    </button>
                  </div>

                  {/* Show existing scores */}
                  {participant.scores.length > 0 && (
                    <div className="pt-4 border-t border-gray-700">
                      <h4 className="text-sm font-medium mb-2">
                        Previous Scores:
                      </h4>
                      <div className="space-y-1">
                        {participant.scores.map((score, index) => (
                          <div key={score.id} className="text-sm text-gray-400">
                            Score {index + 1}: {score.value}/10
                          </div>
                        ))}
                      </div>
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
