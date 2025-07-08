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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-float">🎭</div>
          <div className="text-2xl font-bold dance-gradient-text">
            Loading tournament...
          </div>
        </div>
      </div>
    );
  }

  const maxRound = Math.max(...matches.map((m) => m.round));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8 overflow-x-auto">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-black mb-8 text-center dance-gradient-text tracking-tight">
          Tournament Bracket
        </h1>
        <div className="flex gap-8 justify-start min-w-max p-4">
          {Array.from({ length: maxRound }, (_, i) => i + 1).map((round) => (
            <div key={round} className="flex flex-col gap-8">
              <h2 className="text-2xl font-bold text-center gradient-text">
                Round {round}
              </h2>
              {getMatchesByRound(round).map((match) => (
                <div
                  key={match.id}
                  className="w-72 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-105"
                >
                  {match.participants.map((participant, idx) => (
                    <div
                      key={participant.id}
                      className={`p-4 flex items-center gap-4 ${
                        idx === 0 ? "bg-red-900/30" : "bg-blue-900/30"
                      } ${
                        match.winnerId === participant.id
                          ? "border-l-4 border-yellow-400 bg-yellow-900/20"
                          : ""
                      } transition-all duration-300`}
                    >
                      <div className="w-12 h-12 relative rounded-full overflow-hidden border-2 border-white/20 shadow-lg">
                        <Image
                          src={participant.imageUrl}
                          alt={participant.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="font-bold text-white">
                        {participant.name}
                      </span>
                      {match.winnerId === participant.id && (
                        <div className="ml-auto text-2xl">👑</div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
