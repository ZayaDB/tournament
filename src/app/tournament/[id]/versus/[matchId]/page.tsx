"use client";

import { useEffect, useState, use, useCallback } from "react";
import Image from "next/image";
import NeuralNetworkBackground from "@/app/components/NeuralNetworkBackground";

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

interface Score {
  id: string;
  value: number;
  judgeId: string;
  participantId: string;
  participant: {
    id: string;
    name: string;
  };
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
  votes: Vote[];
  participantScores: Score[];
}

export default function VersusPage({
  params,
}: {
  params: Promise<{ id: string; matchId: string }>;
}) {
  const { id, matchId } = use(params);
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  // Timer states
  const [currentPlayer, setCurrentPlayer] = useState<number>(0); // 0 for player1, 1 for player2
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  // Animation states
  const [showFirstPlayerAnim, setShowFirstPlayerAnim] = useState<boolean>(true);
  const [firstPlayer, setFirstPlayer] = useState<number | null>(null);
  const [showRoulette, setShowRoulette] = useState<boolean>(true);
  const [roulettePlayer, setRoulettePlayer] = useState<number>(0);

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
    // Auto-refresh every 3 seconds
    const interval = setInterval(fetchMatchData, 3000);
    return () => clearInterval(interval);
  }, [fetchMatchData]);

  // On mount: randomly select first player and show animation
  useEffect(() => {
    if (!match || match.participants.length !== 2) return;
    // Only run once on mount
    if (firstPlayer !== null) return;
    // Start roulette animation
    setShowRoulette(true);
    let spinCount = 0;
    const spinInterval = setInterval(() => {
      setRoulettePlayer((prev) => (prev === 0 ? 1 : 0));
      spinCount++;
      // Spin for ~2 seconds (20 times at 100ms)
      if (spinCount > 20) {
        clearInterval(spinInterval);
        // Randomly select first player
        const randomFirst = Math.random() < 0.5 ? 0 : 1;
        setFirstPlayer(randomFirst);
        setRoulettePlayer(randomFirst);
        setShowRoulette(false);
        setShowFirstPlayerAnim(true);
        // Show first player for 2 seconds, then start timer
        setTimeout(() => {
          setShowFirstPlayerAnim(false);
          setIsRunning(true);
          setIsPaused(false);
          setTimeLeft(60);
        }, 2000);
      }
    }, 100);
    // Cleanup
    return () => clearInterval(spinInterval);
  }, [match, firstPlayer]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Time's up for current player
            if (currentPlayer === 0) {
              // Switch to player 2
              setCurrentPlayer(1);
              setTimeLeft(60);
              return 60;
            } else {
              // Both players finished
              setIsRunning(false);
              return 0;
            }
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isPaused, timeLeft, currentPlayer]);

  const getJudgeVote = (judgeId: string) => {
    return match?.votes.find((vote) => vote.judgeId === judgeId);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Check if match is tied (all judges voted for tie)
  const isTied =
    match &&
    match.votes &&
    match.votes.length > 0 &&
    match.votes.every((vote) => vote.votedFor === "tie");

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

  // Animation overlay
  if (showRoulette && match && match.participants.length === 2) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <div className="text-4xl font-bold mb-8">Who goes first?</div>
        <div className="flex gap-16 items-center mb-8">
          <div
            className={`transition-all duration-200 ${
              roulettePlayer === 0 ? "scale-125 drop-shadow-lg" : "opacity-60"
            }`}
          >
            <div className="w-32 h-32 rounded-full bg-red-700 flex items-center justify-center text-2xl font-bold border-4 border-red-400">
              {player1.name}
            </div>
          </div>
          <div className="text-5xl font-extrabold text-yellow-400">
            <Image
              src="/uploads/vs.png"
              alt="versus"
              width={400}
              height={400}
              className="w-10 h-10"
            />
          </div>
          <div
            className={`transition-all duration-200 ${
              roulettePlayer === 1 ? "scale-125 drop-shadow-lg" : "opacity-60"
            }`}
          >
            <div className="w-32 h-32 rounded-full bg-blue-700 flex items-center justify-center text-2xl font-bold border-4 border-blue-400">
              {player2.name}
            </div>
          </div>
        </div>
        <div className="text-xl text-gray-300 animate-pulse">Spinning...</div>
      </div>
    );
  }

  // Show tie animation if all judges voted for tie
  if (isTied) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <div className="text-8xl font-bold mb-8 animate-pulse text-yellow-400 drop-shadow-lg">
          TIE!
        </div>
        <div className="text-4xl text-gray-300 mb-8">
          Both dancers were amazing!
        </div>
        <div className="text-2xl text-gray-400">Preparing for rematch...</div>
      </div>
    );
  }

  if (showFirstPlayerAnim && firstPlayer !== null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <div className="text-4xl font-bold mb-8 animate-pulse">
          {firstPlayer === 0 ? (
            <span className="text-red-400 drop-shadow-lg">
              {player1.name} (Red) FIRST!
            </span>
          ) : (
            <span className="text-blue-400 drop-shadow-lg">
              {player2.name} (Blue) FIRST!
            </span>
          )}
        </div>
        <div className="text-2xl text-gray-300">Get Ready...</div>
      </div>
    );
  }

  return (
    <>
      <NeuralNetworkBackground />
      <div className="min-h-screen text-white relative z-10">
        <div className="max-w-7xl mx-auto p-8">
          {/* Judges Panel */}
          <div className="bg-black/40 rounded-xl p-6 flex gap-6 shadow-2xl backdrop-blur-md justify-center">
            {match.tournament.judges.map((judge) => {
              const vote = getJudgeVote(judge.id);
              return (
                <div
                  key={judge.id}
                  className={`rounded-lg p-4 flex flex-col items-center min-w-[180px] max-w-[220px]
                    ${
                      vote?.votedFor === player1.id
                        ? "border-4 border-red-400 shadow-red-400/40"
                        : vote?.votedFor === player2.id
                        ? "border-4 border-blue-400 shadow-blue-400/40"
                        : vote?.votedFor === "tie"
                        ? "border-4 border-yellow-400 shadow-yellow-400/40"
                        : "border-2 border-gray-600"
                    }
                    bg-gradient-to-br from-gray-900/80 to-black/80
                    transition-all duration-300`}
                >
                  {/* Judge 프로필 이미지 */}
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-yellow-300 shadow-lg mb-2">
                    <Image
                      src={judge.imageUrl}
                      alt={judge.name}
                      width={48}
                      height={48}
                      className="object-cover w-24 h-24 rounded-full"
                    />
                  </div>
                  <div className="font-bold text-lg text-white drop-shadow">
                    {judge.name}
                  </div>

                  {vote ? (
                    <div
                      className={`mt-2 font-extrabold
                      ${
                        vote.votedFor === player1.id
                          ? "text-red-400"
                          : vote.votedFor === player2.id
                          ? "text-blue-400"
                          : "text-yellow-400"
                      }
                      drop-shadow-[0_2px_8px_rgba(255,255,0,0.7)]`}
                    >
                      VOTED
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500"></div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-center mb-8">
            <div className="px-8 py-2 rounded-full bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 shadow-lg text-black font-extrabold text-2xl tracking-widest uppercase inline-block">
              ROUND {match.round}
            </div>
            <div className="mt-2 text-6xl font-extrabold text-yellow-300 drop-shadow-[0_2px_16px_rgba(255,255,0,0.7)]">
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Timer Section */}

          <div
            className="flex flex-col justify-center items-center"
            style={{ minHeight: "100vh", transform: "translateY(-20%)" }}
          >
            <div
              className="flex justify-between items-center w-full max-w-[1800px] mx-auto px-8"
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "120px",
              }}
            >
              {/* Player 1 (왼쪽) */}
              <div style={{ perspective: "1200px" }}>
                <div
                  className="w-[600px] h-[700px] rounded-3xl border-4 border-red-800 bg-red-600 shadow-2xl flex flex-col justify-between items-center overflow-hidden"
                  style={{ transform: "rotateY(15deg)" }}
                >
                  {/* Player 1 이름 */}
                  <div className="w-full py-4 text-center">
                    <span className="font-extrabold text-5xl tracking-widest text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] uppercase bg-black/30 px-6 py-2 rounded-lg inline-block animate-subtle-bounce">
                      {player1.name}
                    </span>
                  </div>
                  {/* Player 1 이미지 */}
                  <div className="flex-1 flex items-center justify-center w-full h-full relative">
                    <Image
                      src={player1.imageUrl}
                      alt={player1.name}
                      fill
                      className="object-cover rounded-2xl border-4 border-white/30 shadow-lg"
                      style={{ width: "100%", height: "100%" }}
                    />
                  </div>
                  {match.winnerId === player1.id && (
                    <div className="w-full py-2 text-center text-lg font-extrabold tracking-widest bg-red-800/90 text-yellow-300">
                      WIN
                    </div>
                  )}
                </div>
              </div>
              {/* VS */}
              <div className="flex-shrink-0">
                <Image
                  src="/uploads/vs.png"
                  alt="versus"
                  width={400}
                  height={400}
                  className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[400px] h-[400px] pointer-events-none select-none"
                />
              </div>
              {/* Player 2 (오른쪽) */}
              <div style={{ perspective: "1200px" }}>
                <div
                  className="w-[600px] h-[700px] rounded-3xl border-4 border-blue-800 bg-blue-600 shadow-2xl flex flex-col justify-between items-center overflow-hidden"
                  style={{ transform: "rotateY(-15deg)" }}
                >
                  {/* Player 2 이름 */}
                  <div className="w-full py-4 text-center">
                    <span className="font-extrabold text-5xl tracking-widest text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] uppercase bg-black/30 px-6 py-2 rounded-lg inline-block animate-subtle-bounce">
                      {player2.name}
                    </span>
                  </div>
                  {/* Player 2 이미지 */}
                  <div className="flex-1 flex items-center justify-center w-full h-full relative">
                    <Image
                      src={player2.imageUrl}
                      alt={player2.name}
                      fill
                      className="object-cover rounded-2xl border-4 border-white/30 shadow-lg"
                      style={{ width: "100%", height: "100%" }}
                    />
                  </div>
                  {match.winnerId === player2.id && (
                    <div className="w-full py-2 text-center text-lg font-extrabold tracking-widest bg-blue-800/90 text-yellow-300">
                      WIN
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
