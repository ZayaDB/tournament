"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Participant {
  id: string;
  name: string;
  imageUrl: string;
}

interface Match {
  id: string;
  round: number;
  matchNumber: number;
  participants: Participant[];
  winnerId: string | null;
}

export default function TournamentPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch("/api/tournament/matches");
      if (response.ok) {
        const data = await response.json();
        setMatches(data);
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMatchesByRound = (round: number) => {
    return matches.filter((match) => match.round === round);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8 flex items-center justify-center">
        <div className="text-2xl">Loading tournament...</div>
      </div>
    );
  }

  const maxRound = Math.max(...matches.map((m) => m.round));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8 overflow-x-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Tournament Bracket
      </h1>
      <div className="flex gap-8 justify-start min-w-max p-4">
        {Array.from({ length: maxRound }, (_, i) => i + 1).map((round) => (
          <div key={round} className="flex flex-col gap-8">
            <h2 className="text-xl font-semibold text-center">Round {round}</h2>
            {getMatchesByRound(round).map((match) => (
              <div
                key={match.id}
                className="w-64 bg-gray-800 rounded-lg overflow-hidden shadow-lg"
              >
                {match.participants.map((participant, idx) => (
                  <div
                    key={participant.id}
                    className={`p-4 flex items-center gap-3 ${
                      idx === 0 ? "bg-red-900/30" : "bg-blue-900/30"
                    } ${
                      match.winnerId === participant.id
                        ? "border-2 border-yellow-500"
                        : ""
                    }`}
                  >
                    <div className="w-10 h-10 relative rounded-full overflow-hidden">
                      <Image
                        src={participant.imageUrl}
                        alt={participant.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="font-medium">{participant.name}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
