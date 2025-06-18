"use client";

import { useEffect, useState, use, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Participant {
  id: string;
  name: string;
  imageUrl: string;
  registrationNumber: number;
}

interface Judge {
  id: string;
  name: string;
  imageUrl: string;
}

interface Vote {
  id: string;
  judgeId: string;
  votedFor: string;
  judge: Judge;
}

interface Match {
  id: string;
  round: number;
  matchNumber: number;
  participants: Participant[];
  winnerId: string | null;
  tournament: {
    judges: Judge[];
  };
}

export default function VersusPage({
  params,
}: {
  params: Promise<{ id: string; matchId: string }>;
}) {
  const { id, matchId } = use(params);
  const router = useRouter();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [currentJudge, setCurrentJudge] = useState<Judge | null>(null);

  useEffect(() => {
    const judgeId = localStorage.getItem("judgeId");
    if (judgeId) {
      fetch(`/api/judges/${judgeId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.judge) {
            setCurrentJudge(data.judge);
          }
        })
        .catch(console.error);
    }
  }, []);

  const fetchMatchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/tournaments/${id}/matches/${matchId}`);
      if (response.ok) {
        const data = await response.json();
        setMatch(data);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching match data:", error);
      setLoading(false);
    }
  }, [id, matchId]);

  useEffect(() => {
    fetchMatchData();
    const interval = setInterval(fetchMatchData, 3000);
    return () => clearInterval(interval);
  }, [fetchMatchData]);

  const handleVote = async () => {
    if (!currentJudge || selecting) return;

    setSelecting(true);
    try {
      console.log("Voting functionality temporarily disabled");
      setSelecting(false);
    } catch (error) {
      console.error("Error voting:", error);
      setSelecting(false);
    }
  };

  const handleSelectWinner = async (winnerId: string) => {
    if (!match || selecting) return;

    setSelecting(true);
    try {
      const adminToken = atob(localStorage.getItem("adminToken") || "");
      const response = await fetch(
        `/api/tournaments/${id}/matches/${matchId}/winner`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            winnerId,
            adminPassword: adminToken,
          }),
        }
      );

      if (response.ok) {
        // 승자가 선택되면 토너먼트 페이지로 돌아감
        router.push(`/tournament/${id}`);
      } else {
        const error = await response.json();
        console.error("Failed to select winner:", error);
      }
    } catch (error) {
      console.error("Error selecting winner:", error);
    } finally {
      setSelecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8 flex items-center justify-center">
        <div className="text-2xl">Loading match...</div>
      </div>
    );
  }

  if (!match || match.participants.length !== 2) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8 flex items-center justify-center">
        <div className="text-2xl">Invalid match</div>
      </div>
    );
  }

  const [player1, player2] = match.participants;
  const isJudge = currentJudge !== null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <button
            onClick={() => router.push(`/tournament/${id}`)}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
          >
            ← Back to Tournament
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Round {match.round}</h1>
          <p className="text-xl text-gray-400">Match {match.matchNumber}</p>
          {isJudge && (
            <p className="mt-4 text-lg text-yellow-400">
              투표 기능이 일시적으로 비활성화되었습니다
            </p>
          )}
        </div>

        <div className="flex justify-center items-center gap-8">
          {/* Player 1 */}
          <div className="flex-1 max-w-md">
            <div
              className={`rounded-lg p-6 text-center ${
                currentJudge && currentJudge.id === player1.id
                  ? "bg-red-900/50 ring-2 ring-red-500"
                  : "bg-red-900/30"
              }`}
            >
              <div className="relative w-48 h-48 mx-auto mb-4">
                <Image
                  src={player1.imageUrl}
                  alt={player1.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <h2 className="text-2xl font-bold mb-2">{player1.name}</h2>
              <p className="text-gray-400 mb-4">
                #{player1.registrationNumber}
              </p>
              {isJudge ? (
                <button
                  onClick={handleVote}
                  disabled={selecting}
                  className="w-full bg-gray-600 cursor-not-allowed px-6 py-3 rounded-lg text-lg font-semibold"
                >
                  투표 기능이 비활성화되었습니다
                </button>
              ) : (
                <button
                  onClick={() => handleSelectWinner(player1.id)}
                  disabled={selecting}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-6 py-3 rounded-lg text-lg font-semibold"
                >
                  {selecting ? "Selecting..." : "Select as Winner"}
                </button>
              )}
            </div>
          </div>

          {/* VS and Judges */}
          <div className="flex flex-col items-center gap-6">
            <div className="text-6xl font-bold text-yellow-500">VS</div>

            {/* Judges Votes */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-lg font-medium text-gray-400">심사위원</p>
              <div className="flex gap-3">
                {match.tournament.judges.map((judge) => {
                  const isCurrentJudge = judge.id === currentJudge?.id;
                  return (
                    <div
                      key={judge.id}
                      className={`w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center ${
                        isCurrentJudge ? "ring-2 ring-yellow-400" : ""
                      }`}
                      title={`${judge.name}${isCurrentJudge ? " (나)" : ""}`}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <Image
                          src={judge.imageUrl}
                          alt={judge.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Player 2 */}
          <div className="flex-1 max-w-md">
            <div
              className={`rounded-lg p-6 text-center ${
                currentJudge && currentJudge.id === player2.id
                  ? "bg-blue-900/50 ring-2 ring-blue-500"
                  : "bg-blue-900/30"
              }`}
            >
              <div className="relative w-48 h-48 mx-auto mb-4">
                <Image
                  src={player2.imageUrl}
                  alt={player2.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <h2 className="text-2xl font-bold mb-2">{player2.name}</h2>
              <p className="text-gray-400 mb-4">
                #{player2.registrationNumber}
              </p>
              {isJudge ? (
                <button
                  onClick={handleVote}
                  disabled={selecting}
                  className="w-full bg-gray-600 cursor-not-allowed px-6 py-3 rounded-lg text-lg font-semibold"
                >
                  투표 기능이 비활성화되었습니다
                </button>
              ) : (
                <button
                  onClick={() => handleSelectWinner(player2.id)}
                  disabled={selecting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg text-lg font-semibold"
                >
                  {selecting ? "Selecting..." : "Select as Winner"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
