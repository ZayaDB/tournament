"use client";

import { useEffect, useState, use, useCallback } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import NeuralNetworkBackground from "@/app/components/NeuralNetworkBackground";

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

interface Tournament {
  id: string;
  name: string;
  danceStyle: string;
  participantCount: number;
  status: string;
}

// SVG 네온 그라디언트 배경 컴포넌트
function NeonGradientBackground() {
  const BRACKET_WIDTH = 1920;
  const BRACKET_HEIGHT = 1080;
  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${BRACKET_WIDTH} ${BRACKET_HEIGHT}`}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none"
      style={{ position: "fixed", top: 0, left: 0 }}
    >
      <defs>
        <linearGradient id="neon-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0ff" />
          <stop offset="50%" stopColor="#181828" />
          <stop offset="100%" stopColor="#ff0080" />
        </linearGradient>
      </defs>
      <rect
        x="0"
        y="0"
        width={BRACKET_WIDTH}
        height={BRACKET_HEIGHT}
        fill="url(#neon-bg)"
      />
    </svg>
  );
}

export default function TournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const viewMode = searchParams.get("view");
  const [matches, setMatches] = useState<Match[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingBrackets, setGeneratingBrackets] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [newParticipant, setNewParticipant] = useState({
    name: "",
    image: null as File | null,
  });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  // Calculate derived state
  const hasMatchesWithParticipants = matches.some(
    (match) => match.participants.length > 0
  );
  const isFullTournament =
    tournament && participants.length === tournament.participantCount;
  const showBracketView = hasMatchesWithParticipants || isFullTournament;
  const canGenerateBrackets = tournament?.status === "READY_TO_BRACKET";

  const fetchTournamentData = useCallback(async () => {
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

      // Fetch matches
      const matchesResponse = await fetch(`/api/tournaments/${id}/matches`);
      if (matchesResponse.ok) {
        const matchesData = await matchesResponse.json();
        setMatches(matchesData);
      }
    } catch (error) {
      console.error("Error fetching tournament data:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const generateBrackets = useCallback(async () => {
    setGeneratingBrackets(true);
    try {
      const adminToken = localStorage.getItem("adminToken");
      const response = await fetch(`/api/tournaments/${id}/generate-brackets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminPassword: adminToken }),
      });
      if (response.ok) {
        // Refresh matches after generating brackets
        const matchesResponse = await fetch(`/api/tournaments/${id}/matches`);
        if (matchesResponse.ok) {
          const matchesData = await matchesResponse.json();
          setMatches(matchesData);
        }
      } else {
        console.error("Failed to generate brackets");
      }
    } catch (error) {
      console.error("Error generating brackets:", error);
    } finally {
      setGeneratingBrackets(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTournamentData();
  }, [fetchTournamentData]);

  // Auto-generate brackets when we have exactly the required number of participants
  useEffect(() => {
    if (
      tournament &&
      participants.length === tournament.participantCount &&
      tournament.status === "PENDING" &&
      !hasMatchesWithParticipants
    ) {
      generateBrackets();
    }
  }, [
    tournament,
    participants.length,
    hasMatchesWithParticipants,
    generateBrackets,
  ]);

  const handleParticipantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticipant.name || !newParticipant.image) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", newParticipant.name);
      formData.append("image", newParticipant.image);
      formData.append("tournamentId", id);

      const response = await fetch("/api/participants", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setNewParticipant({ name: "", image: null });
        setShowRegistrationForm(false);
        fetchTournamentData(); // Refresh participants
      }
    } catch (error) {
      console.error("Error registering participant:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewParticipant((prev) => ({ ...prev, image: file }));
    }
  };

  const getMatchesByRound = (round: number) => {
    return matches.filter((match) => match.round === round);
  };

  const handleStartBattle = async () => {
    try {
      const adminToken = atob(localStorage.getItem("adminToken") || "");
      const response = await fetch(`/api/tournaments/${id}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminPassword: adminToken }),
      });

      if (response.ok) {
        const updatedTournament = await response.json();
        setTournament(updatedTournament);
        // 토너먼트가 시작되면 첫 번째 라운드의 첫 번째 매치로 스크롤
        const firstMatch = document.querySelector('[data-round="1"]');
        if (firstMatch) {
          firstMatch.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        const error = await response.json();
        console.error("Failed to start tournament:", error);
      }
    } catch (error) {
      console.error("Error starting tournament:", error);
    }
  };

  // getBracketLabel 함수 공통 정의 (상세/브래킷 모두에서 사용)
  function getBracketLabel(roundIdx: number, totalParticipants: number) {
    const roundSizes = [];
    let n = totalParticipants;
    while (n > 1) {
      roundSizes.push(n);
      n = n / 2;
    }
    if (roundIdx === roundSizes.length - 1) return "Final";
    return `Top ${roundSizes[roundIdx]}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8 flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-32 h-32 bg-pink-500/10 rounded-full blur-xl animate-float"></div>
          <div
            className="absolute top-40 right-32 w-24 h-24 bg-blue-500/10 rounded-full blur-xl animate-float"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-32 left-1/3 w-28 h-28 bg-purple-500/10 rounded-full blur-xl animate-float"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="text-center relative z-10">
          <div className="text-6xl mb-4 animate-float">🎭</div>
          <div className="text-2xl font-bold dance-gradient-text">
            Loading tournament...
          </div>
        </div>
      </div>
    );
  }

  // 브래킷만 보여주는 모드
  if (viewMode === "bracket") {
    const maxRound = Math.max(...matches.map((m) => m.round), 0);
    const hasParticipants = participants.length > 0;
    const hasMatchesWithParticipants = matches.some(
      (match) => match.participants.length > 0
    );
    const showBracketView =
      hasMatchesWithParticipants ||
      (tournament && participants.length === tournament.participantCount);

    return (
      <>
        <NeuralNetworkBackground />
        <div className="min-h-screen text-white p-4 relative">
          <div className="max-w-6xl mx-auto relative z-10">
            {showBracketView && (
              <div className="overflow-x-auto">
                <div className="text-center mb-12">
                  <h1 className="text-6xl font-black mb-4 tracking-wider dance-gradient-text uppercase">
                    Street Dance Battle
                  </h1>
                  <h2 className="text-3xl font-bold mb-2 tracking-wider gradient-text uppercase">
                    Tournament Brackets
                  </h2>
                </div>
                {hasMatchesWithParticipants && (
                  <div className="flex gap-8 justify-start min-w-max p-4">
                    {Array.from({ length: maxRound }, (_, i) => {
                      const isFinalRound = i === maxRound - 1;
                      const top4Matches = getMatchesByRound(maxRound - 1); // Top 4 라운드 매치들
                      const top4BoxHeight = 200; // Top 4 박스 대략 높이
                      const gap = 32; // gap-8 = 32px
                      const top4TotalHeight =
                        top4Matches.length * (top4BoxHeight + gap) - gap;
                      const finalBoxMarginTop = top4TotalHeight / 2 - 100; // 결승 박스 높이의 절반을 빼서 중앙 정렬

                      return (
                        <div key={i} className="flex flex-col gap-8">
                          <div className="text-center">
                            <h3 className="text-xl font-black mb-2 tracking-wider gradient-text uppercase">
                              {getBracketLabel(
                                i,
                                tournament?.participantCount || 2
                              )}
                            </h3>
                            <div className="w-16 h-1 bg-gradient-to-r from-pink-500 to-blue-500 mx-auto rounded-full"></div>
                          </div>
                          {getMatchesByRound(i + 1).map((match) => (
                            <div
                              key={match.id}
                              data-round={i + 1}
                              className={`w-64 rounded-2xl shadow-2xl border-2 transition-all duration-300 mb-4 group relative overflow-hidden
                                ${
                                  match.winnerId
                                    ? "border-green-400 shadow-green-500/50"
                                    : "border-gray-700/50"
                                }
                                bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm
                                hover:scale-105 hover:border-pink-500/80 hover:shadow-pink-500/25
                                before:absolute before:inset-0 before:bg-gradient-to-r before:from-pink-500/10 before:to-blue-500/10 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100`}
                              style={
                                isFinalRound
                                  ? { marginTop: `${finalBoxMarginTop}px` }
                                  : {}
                              }
                            >
                              {match.participants.length > 0 ? (
                                match.participants.map((participant, idx) => (
                                  <div
                                    key={participant.id}
                                    className={`p-4 flex items-center gap-3 relative ${
                                      match.winnerId === participant.id
                                        ? "bg-gradient-to-r from-green-700/80 to-green-800/60 border-l-4 border-green-400"
                                        : idx === 0
                                        ? "bg-gradient-to-r from-red-900/80 to-red-800/60 border-l-4 border-red-500"
                                        : "bg-gradient-to-r from-blue-900/80 to-blue-800/60 border-l-4 border-blue-500"
                                    } rounded-lg mb-2 transition-all duration-300 group-hover:bg-opacity-90`}
                                  >
                                    {/* 승자 글로우 효과 */}
                                    {match.winnerId === participant.id && (
                                      <div className="absolute inset-0 bg-green-400/20 rounded-lg animate-pulse-glow"></div>
                                    )}

                                    <div className="w-12 h-12 relative rounded-full overflow-hidden border-2 border-white/30 shadow-lg">
                                      <Image
                                        src={participant.imageUrl}
                                        alt={participant.name}
                                        fill
                                        className="object-cover"
                                      />
                                      {match.winnerId === participant.id && (
                                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-2xl animate-float">
                                          👑
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex-1 flex items-center">
                                      <span className="font-extrabold text-lg md:text-2xl lg:text-3xl tracking-wide bg-gradient-to-r from-pink-400 via-yellow-200 to-blue-400 text-transparent bg-clip-text drop-shadow-lg uppercase">
                                        {participant.name}
                                      </span>
                                    </div>
                                    {match.winnerId === participant.id && (
                                      <div className="text-green-400 text-xl">
                                        🏆
                                      </div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <div className="p-8 text-center text-gray-400 text-sm font-medium">
                                  <div className="text-2xl mb-2">⏳</div>
                                  TBD
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  const maxRound = Math.max(...matches.map((m) => m.round), 0);
  const hasParticipants = participants.length > 0;

  return (
    <>
      <div className="min-h-screen text-white p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => router.push("/admin")}
              className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 hover:from-pink-700 hover:to-blue-700 px-3 py-1.5 rounded-md font-semibold text-xs mr-2 shadow border border-pink-500/30 hover:border-pink-500/80 transition-all"
            >
              ← Admin Panel
            </button>
            <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-400 text-transparent bg-clip-text drop-shadow-lg uppercase">
              {tournament?.name} - {tournament?.danceStyle}
            </h1>
          </div>

          {/* Tournament Status Banner */}
          {isFullTournament && !hasMatchesWithParticipants && (
            <div className="mb-6 bg-green-900/30 border border-green-500 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <h3 className="text-lg font-semibold text-green-400">
                    Tournament Full!
                  </h3>
                  <p className="text-green-300">
                    All {tournament?.participantCount} slots are filled. Click
                    &apos;Generate Brackets&apos; to start the tournament.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Participants Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">
                Registered Participants ({participants.length}/
                {tournament?.participantCount})
              </h2>
              {canGenerateBrackets && (
                <button
                  onClick={() => setShowRegistrationForm(!showRegistrationForm)}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                >
                  {showRegistrationForm ? "Cancel" : "Add Participant"}
                </button>
              )}
            </div>

            {/* Registration Form */}
            {showRegistrationForm && canGenerateBrackets && (
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">
                  Register New Participant
                </h3>
                <form onSubmit={handleParticipantSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={newParticipant.name}
                      onChange={(e) =>
                        setNewParticipant((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Profile Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-2 rounded-lg"
                    >
                      {submitting ? "Registering..." : "Register"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRegistrationForm(false)}
                      className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Participants Grid */}
            {hasParticipants && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="bg-gradient-to-br from-[#1a0036] via-[#222] to-[#0a001a] rounded-md p-2 text-center hover:bg-pink-900/40 transition-colors border border-blue-900/60 hover:border-pink-500/80 shadow"
                  >
                    <div className="w-10 h-10 relative rounded-full overflow-hidden mx-auto mb-1 border-2 border-white shadow">
                      <Image
                        src={participant.imageUrl}
                        alt={participant.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="font-medium text-xs text-white drop-shadow">
                      {participant.name}
                    </p>
                    <p className="text-pink-400 text-[10px] font-bold">
                      #{participant.registrationNumber}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {!hasParticipants && (
              <div className="text-center text-gray-400 py-8">
                <p className="text-xl">No participants registered yet.</p>
                <p className="mt-2">
                  Click &quot;Add Participant&quot; to register the first
                  participant.
                </p>
              </div>
            )}
          </div>

          {/* Generate Brackets Button */}
          {((participants.length === tournament?.participantCount &&
            canGenerateBrackets &&
            !hasMatchesWithParticipants) ||
            (participants.length > (tournament?.participantCount || 0) &&
              canGenerateBrackets &&
              !hasMatchesWithParticipants)) && (
            <div className="mb-4 text-center">
              <button
                onClick={generateBrackets}
                disabled={generatingBrackets}
                className="bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-400 hover:from-yellow-400 hover:to-pink-500 disabled:bg-gray-600 px-4 py-2 rounded-md font-extrabold text-sm text-black shadow tracking-wider uppercase transition-all"
              >
                {generatingBrackets
                  ? "Generating Brackets..."
                  : "🎯 Generate Brackets"}
              </button>
            </div>
          )}

          {/* Start Battle Button */}
          {hasMatchesWithParticipants &&
            tournament?.status === "READY_TO_BRACKET" && (
              <div className="mb-4 text-center">
                <button
                  onClick={handleStartBattle}
                  className="bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-400 hover:from-pink-500 hover:to-yellow-400 px-4 py-2 rounded-md font-extrabold text-sm text-black shadow tracking-wider uppercase transition-all"
                >
                  🥊 Start Battle!
                </button>
              </div>
            )}

          {/* Bracket Section - Show when we have matches OR when tournament is full */}
          {showBracketView && (
            <div className="overflow-x-auto">
              <h2 className="text-2xl font-semibold mb-4">
                Tournament Brackets
              </h2>

              {/* Show participant list in bracket view when tournament is full but no matches yet */}
              {isFullTournament && !hasMatchesWithParticipants && (
                <div className="mb-6 bg-gray-800 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4 text-center">
                    All Participants Ready for Tournament
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                    {participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="bg-gray-700 rounded-lg p-3 text-center"
                      >
                        <div className="w-12 h-12 relative rounded-full overflow-hidden mx-auto mb-2">
                          <Image
                            src={participant.imageUrl}
                            alt={participant.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <p className="font-medium text-xs">
                          {participant.name}
                        </p>
                        <p className="text-gray-400 text-xs">
                          #{participant.registrationNumber}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="text-center mt-4">
                    <p className="text-gray-400 mb-2">
                      Click &quot;Generate Brackets&quot; above to create the
                      tournament bracket
                    </p>
                  </div>
                </div>
              )}

              {/* Actual Bracket Display */}
              {hasMatchesWithParticipants && (
                <div className="flex gap-4 justify-start min-w-max p-2">
                  {Array.from({ length: maxRound }, (_, i) => (
                    <div key={i} className="flex flex-col gap-4">
                      <h3 className="text-base font-extrabold text-center mb-2 tracking-wider bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-400 text-transparent bg-clip-text drop-shadow-lg uppercase">
                        {getBracketLabel(i, tournament?.participantCount || 2)}
                      </h3>
                      {getMatchesByRound(i + 1).map((match) => (
                        <div
                          key={match.id}
                          data-round={i + 1}
                          className={`w-48 rounded-xl shadow-md border-2 transition-all duration-200 mb-3
                            ${
                              match.winnerId
                                ? "border-green-400"
                                : "border-blue-900/60"
                            }
                            bg-gradient-to-br from-[#1a0036] via-[#222] to-[#0a001a] relative overflow-hidden
                            hover:scale-105 hover:border-pink-500/80`}
                          onClick={() => {
                            if (
                              tournament?.status === "ACTIVE" &&
                              !match.winnerId &&
                              match.participants.length === 2
                            ) {
                              window.open(
                                `/tournament/${id}/versus/${match.id}`,
                                "_blank"
                              );
                            }
                          }}
                        >
                          {match.participants.length > 0 ? (
                            match.participants.map((participant, idx) => (
                              <div
                                key={participant.id}
                                className={`p-3 flex items-center gap-2 ${
                                  idx === 0
                                    ? "bg-gradient-to-r from-pink-900/40 to-gray-900/10"
                                    : "bg-gradient-to-r from-blue-900/40 to-gray-900/10"
                                } ${
                                  match.winnerId === participant.id
                                    ? "border border-green-400 relative"
                                    : ""
                                } rounded-lg mb-1`}
                              >
                                <div className="w-8 h-8 relative rounded-full overflow-hidden border-2 border-white shadow">
                                  <Image
                                    src={participant.imageUrl}
                                    alt={participant.name}
                                    fill
                                    className="object-cover"
                                  />
                                  {match.winnerId === participant.id && (
                                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-lg">
                                      👑
                                    </span>
                                  )}
                                </div>
                                <span className="font-bold text-xs drop-shadow text-white">
                                  {participant.name}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="p-3 text-center text-gray-400 text-xs">
                              TBD
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Show message when tournament is not full and no brackets */}
          {!showBracketView && hasParticipants && (
            <div className="text-center text-gray-400 py-12">
              <div className="text-6xl mb-4">🎭</div>
              <h3 className="text-xl font-semibold mb-2">
                Waiting for More Participants
              </h3>
              <p className="text-lg">
                Need{" "}
                {tournament
                  ? tournament.participantCount - participants.length
                  : 0}{" "}
                more participants to start the tournament bracket.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
