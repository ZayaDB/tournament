"use client";

import { useEffect, useState, use, useCallback } from "react";
import Image from "next/image";

interface Participant {
  id: string;
  name: string;
  imageUrl: string;
  registrationNumber: number;
  scores: Score[];
}

interface Score {
  id: string;
  value: number;
  judgeId: string;
  createdAt: string;
}

interface Match {
  id: string;
  round: number;
  matchNumber: number;
  participants: Participant[];
  winnerId: string | null;
}

interface Tournament {
  id: string;
  name: string;
  danceStyle: string;
  participantCount: number;
  status: string;
}

interface CurrentMatchData {
  currentMatch: Match;
  tournament: Tournament;
  totalRounds: number;
  currentRound: number;
}

export default function JudgePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [currentMatchData, setCurrentMatchData] =
    useState<CurrentMatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<{ [participantId: string]: number }>({});
  const [submitting, setSubmitting] = useState(false);
  const [judgeId] = useState("judge-1"); // In real app, this would come from authentication
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchCurrentMatch = useCallback(async () => {
    try {
      const response = await fetch(`/api/tournaments/${id}/current-match`);
      if (response.ok) {
        const data = await response.json();
        if (data.message === "No active matches found") {
          setCurrentMatchData(null);
        } else {
          setCurrentMatchData(data);
          // Initialize scores for current participants
          const initialScores: { [key: string]: number } = {};
          data.currentMatch.participants.forEach((participant: Participant) => {
            const existingScore = participant.scores.find(
              (s) => s.judgeId === judgeId
            );
            initialScores[participant.id] = existingScore?.value || 5;
          });
          setScores(initialScores);
        }
      }
    } catch (error) {
      console.error("Error fetching current match:", error);
    } finally {
      setLoading(false);
    }
  }, [id, judgeId]);

  useEffect(() => {
    fetchCurrentMatch();
  }, [fetchCurrentMatch]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchCurrentMatch();
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchCurrentMatch]);

  const handleScoreChange = (participantId: string, value: number) => {
    setScores((prev) => ({
      ...prev,
      [participantId]: value,
    }));
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
          score: scores[participantId],
          judgeId,
        }),
      });

      if (response.ok) {
        // Refresh current match data
        await fetchCurrentMatch();
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

  const getJudgeScore = (participant: Participant) => {
    return participant.scores.find((s) => s.judgeId === judgeId)?.value || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8 flex items-center justify-center">
        <div className="text-2xl">Loading tournament...</div>
      </div>
    );
  }

  if (!currentMatchData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6">🏆</div>
          <h1 className="text-4xl font-bold mb-4">Tournament Completed!</h1>
          <p className="text-xl text-gray-300 mb-8">
            All matches have been completed. Check the results in the admin
            panel.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem("judgeMode");
              window.location.href = "/";
            }}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const { currentMatch, tournament, totalRounds, currentRound } =
    currentMatchData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Judge Panel - {tournament.name}
            </h1>
            <p className="text-gray-300">
              {tournament.danceStyle} Battle - Round {currentRound} of{" "}
              {totalRounds}
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                autoRefresh
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-600 hover:bg-gray-700"
              }`}
            >
              {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
            </button>
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
        </div>

        {/* Current Match Info */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2">
              Match #{currentMatch.matchNumber} - Round {currentMatch.round}
            </h2>
            <p className="text-gray-400">
              {currentMatch.participants.length === 2
                ? "Battle Mode"
                : "Waiting for participants..."}
            </p>
          </div>

          {currentMatch.participants.length === 2 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {currentMatch.participants.map((participant, index) => (
                <div
                  key={participant.id}
                  className={`bg-gray-700 rounded-lg p-6 ${
                    index === 0
                      ? "border-l-4 border-red-500"
                      : "border-l-4 border-blue-500"
                  }`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-20 h-20">
                      <Image
                        src={participant.imageUrl}
                        alt={participant.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-xl">
                        #{participant.registrationNumber} {participant.name}
                      </div>
                      <div className="text-gray-400">
                        Average Score:{" "}
                        <span className="text-yellow-400 font-semibold text-lg">
                          {getAverageScore(participant.scores).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score Input */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-medium">
                        Your Score (1-10):
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={scores[participant.id] || 5}
                        onChange={(e) =>
                          handleScoreChange(
                            participant.id,
                            Number(e.target.value)
                          )
                        }
                        className="w-20 p-2 rounded bg-gray-600 border border-gray-500 focus:ring-2 focus:ring-blue-500 text-center"
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

                  {/* All Judges' Scores */}
                  {participant.scores.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-600">
                      <h4 className="text-sm font-medium mb-2">
                        All Judges' Scores:
                      </h4>
                      <div className="space-y-1">
                        {participant.scores.map((score) => (
                          <div
                            key={score.id}
                            className="text-sm text-gray-400 flex justify-between"
                          >
                            <span>Judge {score.judgeId}:</span>
                            <span
                              className={
                                score.judgeId === judgeId
                                  ? "text-blue-400 font-semibold"
                                  : ""
                              }
                            >
                              {score.value}/10
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">⏳</div>
              <h3 className="text-xl font-semibold mb-2">
                Waiting for Participants
              </h3>
              <p className="text-gray-400">
                This match needs 2 participants to begin scoring.
              </p>
            </div>
          )}
        </div>

        {/* Tournament Progress */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Tournament Progress</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-700 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${(currentRound / totalRounds) * 100}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">
              Round {currentRound} of {totalRounds}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
