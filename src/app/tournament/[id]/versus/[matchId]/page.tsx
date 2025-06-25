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
  status: string;
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

  // Rematch states
  const [showRematchCountdown, setShowRematchCountdown] =
    useState<boolean>(false);
  const [rematchCountdown, setRematchCountdown] = useState<number>(3);
  const [isRematch, setIsRematch] = useState<boolean>(false);

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
    // Only run once on mount or when rematch starts
    if (firstPlayer !== null && !isRematch) return;
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
  }, [match, firstPlayer, isRematch]);

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
  const isTied = match && match.status === "TIE";

  // Handle rematch when tie is detected
  const resetMatchForRematch = useCallback(async () => {
    try {
      await fetch(`/api/tournaments/${id}/matches/${matchId}/reset-rematch`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Error resetting match for rematch:", error);
    }
  }, [id, matchId]);

  useEffect(() => {
    if (isTied && !showRematchCountdown && !isRematch) {
      // Start rematch countdown after 3 seconds
      setTimeout(() => {
        setShowRematchCountdown(true);
        setRematchCountdown(3);

        // Countdown: 3, 2, 1
        const countdownInterval = setInterval(() => {
          setRematchCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              setShowRematchCountdown(false);
              setIsRematch(true);

              // Reset match status to PENDING for rematch
              resetMatchForRematch();

              // Reset match state for rematch
              setFirstPlayer(null);
              setShowRoulette(true);
              setShowFirstPlayerAnim(true);
              setCurrentPlayer(0);
              setTimeLeft(60);
              setIsRunning(false);
              setIsPaused(false);
              return 3;
            }
            return prev - 1;
          });
        }, 1000);
      }, 3000);
    }
  }, [isTied, showRematchCountdown, isRematch, resetMatchForRematch]);

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
        <div className="text-4xl font-bold mb-8">
          {isRematch ? "Rematch - Who goes first?" : "Who goes first?"}
        </div>
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
          <div className="text-5xl font-extrabold text-yellow-400">VS</div>
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
        {showRematchCountdown ? (
          <>
            <div className="text-8xl font-bold mb-8 animate-pulse text-yellow-400 drop-shadow-lg">
              {rematchCountdown}
            </div>
            <div className="text-4xl text-gray-300 mb-8">REMATCH STARTING!</div>
            <div className="text-2xl text-gray-400">Get Ready...</div>
          </>
        ) : (
          <>
            <div className="text-8xl font-bold mb-8 animate-pulse text-yellow-400 drop-shadow-lg">
              TIE!
            </div>
            <div className="text-4xl text-gray-300 mb-8">
              Both dancers were amazing!
            </div>
            <div className="text-2xl text-gray-400">
              Preparing for rematch...
            </div>
          </>
        )}
      </div>
    );
  }

  if (showFirstPlayerAnim && firstPlayer !== null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        {isRematch && (
          <div className="text-2xl font-bold mb-4 text-yellow-400">REMATCH</div>
        )}
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto p-8">
        {/* Judges Panel */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {match.tournament.judges.map((judge) => {
              const vote = getJudgeVote(judge.id);

              return (
                <div
                  key={judge.id}
                  className={`bg-gray-700 rounded-lg p-4 ${
                    vote?.votedFor === player1.id
                      ? "border-2 border-red-500"
                      : vote?.votedFor === player2.id
                      ? "border-2 border-blue-500"
                      : vote?.votedFor === "tie"
                      ? "border-2 border-yellow-500"
                      : "border border-gray-600"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative w-12 h-12">
                      <Image
                        src={judge.imageUrl}
                        alt={judge.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold">{judge.name}</h4>
                      <p className="text-sm text-gray-400">Judge</p>
                    </div>
                  </div>

                  {/* Vote Status */}
                  <div className="text-center">
                    {vote ? (
                      <div
                        className={`text-sm font-semibold ${
                          vote.votedFor === player1.id
                            ? "text-red-400"
                            : vote.votedFor === player2.id
                            ? "text-blue-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {vote.votedFor === "tie"
                          ? "Voted for Tie"
                          : `Voted for ${
                              vote.votedFor === player1.id
                                ? player1.name
                                : player2.name
                            }`}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">No vote yet</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Round {match.round}</h1>
          <p className="text-xl text-gray-400">Match {match.matchNumber}</p>
        </div>

        {/* Timer Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Performance Timer</h3>
            {/* Current Player Indicator */}
            <div className="mb-4">
              <div
                className={`text-lg font-semibold ${
                  currentPlayer === 0 ? "text-red-400" : "text-blue-400"
                }`}
              >
                {currentPlayer === 0 ? player1.name : player2.name}'s Turn
              </div>
            </div>
            {/* Timer Display */}
            <div className="text-6xl font-mono font-bold mb-6">
              <span
                className={
                  timeLeft <= 10
                    ? "text-red-500 animate-pulse"
                    : "text-yellow-400"
                }
              >
                {formatTime(timeLeft)}
              </span>
            </div>
            {/* Timer Controls - hidden */}
            {/* <div className="flex justify-center gap-4">
              {!isRunning ? (
                <button
                  onClick={startTimer}
                  className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold"
                >
                  Start Performance
                </button>
              ) : (
                <>
                  <button
                    onClick={pauseTimer}
                    className={`px-6 py-3 rounded-lg font-semibold ${
                      isPaused 
                        ? 'bg-yellow-600 hover:bg-yellow-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    onClick={resetTimer}
                    className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold"
                  >
                    Reset
                  </button>
                </>
              )}
            </div> */}
            {/* Performance Status */}
            <div className="mt-4 text-sm text-gray-400">
              {isRunning && currentPlayer === 0 && "Player 1 performing"}
              {isRunning && currentPlayer === 1 && "Player 2 performing"}
              {!isRunning &&
                currentPlayer === 1 &&
                timeLeft === 60 &&
                "Both performances completed"}
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center gap-8 mb-12">
          {/* Player 1 */}
          <div className="flex-1 max-w-md">
            <div
              className={`rounded-lg p-6 text-center transition-all duration-300 ${
                match.winnerId === player1.id
                  ? "bg-green-900/30 border-2 border-green-500"
                  : currentPlayer === 0 && isRunning
                  ? "bg-red-900/50 border-2 border-red-400 shadow-lg shadow-red-500/20"
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
              {match.winnerId === player1.id && (
                <div className="text-green-400 font-semibold text-lg">1</div>
              )}
            </div>
          </div>

          {/* VS */}
          <div className="text-6xl font-bold text-yellow-500">VS</div>

          {/* Player 2 */}
          <div className="flex-1 max-w-md">
            <div
              className={`rounded-lg p-6 text-center transition-all duration-300 ${
                match.winnerId === player2.id
                  ? "bg-green-900/30 border-2 border-green-500"
                  : currentPlayer === 1 && isRunning
                  ? "bg-blue-900/50 border-2 border-blue-400 shadow-lg shadow-blue-500/20"
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
              {match.winnerId === player2.id && (
                <div className="text-green-400 font-semibold text-lg">1</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
