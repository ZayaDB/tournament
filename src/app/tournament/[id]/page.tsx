"use client";

import { useEffect, useState, use, useCallback } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

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

export default function TournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
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
  const searchParams = useSearchParams();
  const isViewer = searchParams.get("viewer") === "1";

  // Calculate derived state
  const hasMatchesWithParticipants = matches.some(
    (match) => match.participants.length > 0
  );
  const isFullTournament =
    tournament && participants.length === tournament.participantCount;
  const showBracketView = hasMatchesWithParticipants || isFullTournament;
  const canGenerateBrackets =
    tournament?.status === "READY_TO_BRACKET" ||
    (tournament?.status === "PENDING" && participants.length >= 2);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8 flex items-center justify-center">
        <div className="text-2xl">Loading tournament...</div>
      </div>
    );
  }

  const maxRound = Math.max(...matches.map((m) => m.round), 0);
  const hasParticipants = participants.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
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
        {!isViewer && (
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
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="bg-gray-800 rounded-lg p-4 text-center hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-16 h-16 relative rounded-full overflow-hidden mx-auto mb-2">
                      <Image
                        src={participant.imageUrl}
                        alt={participant.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="font-medium text-sm">{participant.name}</p>
                    <p className="text-gray-400 text-xs">
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
        )}

        {/* Generate Brackets Button */}
        {canGenerateBrackets && !hasMatchesWithParticipants && (
          <div className="mb-8 text-center">
            <button
              onClick={generateBrackets}
              disabled={generatingBrackets}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold text-lg"
            >
              {generatingBrackets
                ? "Generating Brackets..."
                : `🎯 Generate Brackets (${participants.length} participants)`}
            </button>
          </div>
        )}

        {/* Start Battle Button */}
        {hasMatchesWithParticipants &&
          tournament?.status === "READY_TO_BRACKET" && (
            <div className="mb-8 text-center">
              <button
                onClick={handleStartBattle}
                className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold text-lg"
              >
                🥊 Start Battle!
              </button>
            </div>
          )}

        {/* Bracket Section - Show when we have matches OR when tournament is full */}
        {showBracketView && (
          <div className="overflow-x-auto">
            <h2 className="text-2xl font-semibold mb-4">Tournament Bracket</h2>

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
                      <p className="font-medium text-xs">{participant.name}</p>
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
              <div className="flex gap-8 justify-start min-w-max p-4">
                {Array.from({ length: maxRound }, (_, i) => i + 1).map(
                  (round) => (
                    <div key={round} className="flex flex-col gap-8">
                      <h3 className="text-xl font-semibold text-center">
                        Round {round}
                      </h3>
                      {getMatchesByRound(round).map((match) => (
                        <div
                          key={match.id}
                          data-round={round}
                          className={`w-64 bg-gray-800 rounded-lg overflow-hidden shadow-lg ${
                            tournament?.status === "ACTIVE" &&
                            !match.winnerId &&
                            match.participants.length === 2
                              ? "ring-2 ring-yellow-500"
                              : ""
                          } ${
                            tournament?.status === "ACTIVE" &&
                            !match.winnerId &&
                            match.participants.length === 2
                              ? "cursor-pointer hover:bg-gray-700"
                              : ""
                          }`}
                          onClick={() => {
                            if (
                              tournament?.status === "ACTIVE" &&
                              !match.winnerId &&
                              match.participants.length === 2
                            ) {
                              window.open(
                                `/tournament/${id}/versus/${match.id}`,
                                "_blank",
                                "noopener"
                              );
                            }
                          }}
                        >
                          {match.participants.length > 0 ? (
                            match.participants.map((participant, idx) => (
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
                                <span className="font-medium">
                                  {participant.name}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-gray-400">
                              TBD
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                )}
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
  );
}
