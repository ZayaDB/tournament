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

interface Match {
  id: string;
  round: number;
  matchNumber: number;
  participants: Participant[];
  winnerId: string | null;
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

  const fetchMatchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/tournaments/${id}/matches/${matchId}`);
      if (response.ok) {
        const data = await response.json();
        setMatch(data);
      }
    } catch (error) {
      console.error("Error fetching match data:", error);
    } finally {
      setLoading(false);
    }
  }, [id, matchId]);

  useEffect(() => {
    fetchMatchData();
  }, [fetchMatchData]);

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
        </div>

        <div className="flex justify-center items-center gap-8">
          {/* Player 1 */}
          <div className="flex-1 max-w-md">
            <div className="bg-red-900/30 rounded-lg p-6 text-center">
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
              <button
                onClick={() => handleSelectWinner(player1.id)}
                disabled={selecting}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-6 py-3 rounded-lg text-lg font-semibold"
              >
                {selecting ? "Selecting..." : "Select as Winner"}
              </button>
            </div>
          </div>

          {/* VS */}
          <div className="text-6xl font-bold text-yellow-500">VS</div>

          {/* Player 2 */}
          <div className="flex-1 max-w-md">
            <div className="bg-blue-900/30 rounded-lg p-6 text-center">
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
              <button
                onClick={() => handleSelectWinner(player2.id)}
                disabled={selecting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg text-lg font-semibold"
              >
                {selecting ? "Selecting..." : "Select as Winner"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
