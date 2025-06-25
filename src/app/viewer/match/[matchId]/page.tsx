"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";

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
  tournament: {
    name: string;
    danceStyle: string;
  };
}

export default function ViewerMatchPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  // 폴링으로 매치 정보 주기적으로 fetch
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const fetchMatch = async () => {
      try {
        const res = await fetch(`/api/tournaments/matches/${matchId}`);
        if (res.ok) {
          const data = await res.json();
          setMatch(data);
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
    timer = setInterval(fetchMatch, 2000);
    return () => clearInterval(timer);
  }, [matchId]);

  if (loading || !match) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white text-2xl">
        Loading match info...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4 text-center">
        {match.tournament?.name} - {match.tournament?.danceStyle}
      </h1>
      <h2 className="text-2xl font-semibold mb-2 text-center">
        Round {match.round} - Match {match.matchNumber}
      </h2>
      <div className="flex gap-12 items-center justify-center mt-8">
        {match.participants.map((p, idx) => (
          <div
            key={p.id}
            className={`bg-gray-800 rounded-xl p-6 flex flex-col items-center w-64 border-4 ${
              match.winnerId === p.id
                ? "border-yellow-400"
                : idx === 0
                ? "border-red-600"
                : "border-blue-600"
            }`}
          >
            <div className="w-32 h-32 relative rounded-full overflow-hidden mb-4">
              <Image
                src={p.imageUrl}
                alt={p.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="text-xl font-bold mb-2">{p.name}</div>
            <div className="text-gray-400">#{p.registrationNumber}</div>
            {match.winnerId === p.id && (
              <div className="mt-2 text-yellow-400 font-bold text-lg">
                WINNER
              </div>
            )}
          </div>
        ))}
        {match.participants.length === 1 && <div className="w-64"></div>}
      </div>
      {match.winnerId && (
        <div className="mt-8 text-3xl font-bold text-yellow-400">
          Winner:{" "}
          {match.participants.find((p) => p.id === match.winnerId)?.name}
        </div>
      )}
    </div>
  );
}
