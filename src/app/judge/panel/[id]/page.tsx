"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Judge {
  id: string;
  name: string;
  imageUrl: string;
  tournament: {
    id: string;
    name: string;
    danceStyle: string;
    status: string;
    participants: Participant[];
    judges: Judge[];
    matches: Match[];
  };
}

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
}

interface Vote {
  id: string;
  judgeId: string;
  votedFor: string;
  judge: {
    name: string;
    imageUrl: string;
  };
}

interface Match {
  id: string;
  round: number;
  matchNumber: number;
  participants: Participant[];
  winnerId: string | null;
  votes: Vote[];
}

export default function JudgePanelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [judge, setJudge] = useState<Judge | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedParticipant, setSelectedParticipant] = useState<string>("");
  const [score, setScore] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [finishingScoring, setFinishingScoring] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [voting, setVoting] = useState(false);
  const router = useRouter();

  const fetchJudgeData = useCallback(
    async (judgeId: string) => {
      try {
        const response = await fetch(`/api/judges/${judgeId}`);
        if (response.ok) {
          const data = await response.json();
          setJudge(data.judge);

          // Fetch current match if tournament is ACTIVE
          if (data.judge.tournament.status === "ACTIVE") {
            const activeMatch = data.judge.tournament.matches?.find(
              (m: Match) => !m.winnerId && m.participants.length === 2
            );
            if (activeMatch) {
              setCurrentMatch(activeMatch);
            }
          }
        } else {
          console.error("Failed to fetch judge data");
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching judge data:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    const unwrapParams = async () => {
      const { id } = await params;
      fetchJudgeData(id);
    };
    unwrapParams();
  }, [params, fetchJudgeData]);

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParticipant || !score || !judge) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          judgeId: judge.id,
          participantId: selectedParticipant,
          tournamentId: judge.tournament.id,
          value: parseInt(score),
        }),
      });

      if (response.ok) {
        // Refresh judge data to get updated scores
        fetchJudgeData(judge.id);
        setSelectedParticipant("");
        setScore("");
      } else {
        console.error("Failed to submit score");
      }
    } catch (error) {
      console.error("Error submitting score:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishScoring = async () => {
    if (!judge) return;

    if (
      !confirm(
        "모든 참가자의 점수 입력을 완료하시겠습니까? 이후에는 점수를 수정할 수 없습니다."
      )
    ) {
      return;
    }

    setFinishingScoring(true);
    try {
      const response = await fetch(`/api/judges/${judge.id}/finish-scoring`, {
        method: "POST",
      });

      if (response.ok) {
        alert("점수 입력이 완료되었습니다.");
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "점수 입력 완료 처리 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Error finishing scoring:", error);
      alert("점수 입력 완료 처리 중 오류가 발생했습니다.");
    } finally {
      setFinishingScoring(false);
    }
  };

  const hasAllParticipantsScored = () => {
    if (!judge) return false;
    const allScored = judge.tournament.participants.every((participant) =>
      participant.scores.some((score) => score.judgeId === judge.id)
    );
    console.log("Judge:", judge.id);
    console.log("Tournament status:", judge.tournament.status);
    console.log("All participants scored:", allScored);
    console.log(
      "Participants scores:",
      judge.tournament.participants.map((p) => ({
        name: p.name,
        scores: p.scores.filter((s) => s.judgeId === judge.id),
      }))
    );
    return allScored;
  };

  const getAverageScore = (participant: Participant) => {
    if (participant.scores.length === 0) return 0;
    const total = participant.scores.reduce(
      (sum, score) => sum + score.value,
      0
    );
    return (total / participant.scores.length).toFixed(1);
  };

  const handleVote = async (participantId: string) => {
    if (!judge || !currentMatch) return;

    if (!confirm("이 참가자를 승자로 선택하시겠습니까?")) {
      return;
    }

    setVoting(true);
    try {
      const response = await fetch("/api/tournament/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          judgeId: judge.id,
          matchId: currentMatch.id,
          participantId: participantId,
        }),
      });

      if (response.ok) {
        alert("투표가 완료되었습니다.");
        fetchJudgeData(judge.id);
      } else {
        const error = await response.json();
        alert(error.message || "투표 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Error voting:", error);
      alert("투표 중 오류가 발생했습니다.");
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8 flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (!judge) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8 flex items-center justify-center">
        <div className="text-2xl">Judge not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden">
              <Image
                src={judge.imageUrl}
                alt={judge.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold">👨‍⚖️ {judge.name}</h1>
              <p className="text-gray-300">
                Judging: {judge.tournament.name} ({judge.tournament.danceStyle})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {hasAllParticipantsScored() &&
              judge.tournament.status === "PRESELECTION" && (
                <button
                  onClick={handleFinishScoring}
                  disabled={finishingScoring}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold"
                >
                  {finishingScoring ? "처리 중..." : "점수 입력 완료"}
                </button>
              )}
            <button
              onClick={() => {
                localStorage.removeItem("judgeMode");
                localStorage.removeItem("judgeToken");
                router.push("/");
              }}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Current Match Section */}
        {judge.tournament.status === "ACTIVE" && currentMatch && (
          <div className="mb-8 bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Current Battle</h2>
            <div className="flex items-center justify-between gap-8">
              {/* Red Corner */}
              <div className="flex-1 bg-red-900/30 rounded-lg p-4 text-center">
                <div className="w-20 h-20 relative mx-auto mb-2">
                  <Image
                    src={currentMatch.participants[0].imageUrl}
                    alt={currentMatch.participants[0].name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <p className="font-semibold">
                  {currentMatch.participants[0].name}
                </p>
                <p className="text-sm text-gray-400">
                  #{currentMatch.participants[0].registrationNumber}
                </p>
                <button
                  onClick={() => handleVote(currentMatch.participants[0].id)}
                  disabled={
                    voting ||
                    currentMatch.votes?.some((v) => v.judgeId === judge.id)
                  }
                  className="mt-4 w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-4 py-2 rounded-lg font-medium text-sm"
                >
                  {voting ? "투표 중..." : "승자로 선택"}
                </button>
              </div>

              {/* VS */}
              <div className="flex flex-col items-center gap-4">
                <div className="text-4xl font-bold text-yellow-500">VS</div>
                {/* Judges Votes */}
                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm font-medium text-gray-400">
                    심사위원 투표
                  </p>
                  <div className="flex gap-2">
                    {judge.tournament.judges.map((j) => {
                      const vote = currentMatch.votes?.find(
                        (v) => v.judgeId === j.id
                      );
                      const votedColor = vote
                        ? vote.votedFor === currentMatch.participants[0].id
                          ? "bg-red-500"
                          : "bg-blue-500"
                        : "bg-gray-600";
                      return (
                        <div
                          key={j.id}
                          className={`w-8 h-8 rounded-full ${votedColor} flex items-center justify-center`}
                          title={`${j.name}${
                            vote
                              ? vote.votedFor ===
                                currentMatch.participants[0].id
                                ? " - Red"
                                : " - Blue"
                              : " - 미투표"
                          }`}
                        >
                          <div className="w-6 h-6 rounded-full overflow-hidden">
                            <Image
                              src={j.imageUrl}
                              alt={j.name}
                              width={24}
                              height={24}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Blue Corner */}
              <div className="flex-1 bg-blue-900/30 rounded-lg p-4 text-center">
                <div className="w-20 h-20 relative mx-auto mb-2">
                  <Image
                    src={currentMatch.participants[1].imageUrl}
                    alt={currentMatch.participants[1].name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <p className="font-semibold">
                  {currentMatch.participants[1].name}
                </p>
                <p className="text-sm text-gray-400">
                  #{currentMatch.participants[1].registrationNumber}
                </p>
                <button
                  onClick={() => handleVote(currentMatch.participants[1].id)}
                  disabled={
                    voting ||
                    currentMatch.votes?.some((v) => v.judgeId === judge.id)
                  }
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded-lg font-medium text-sm"
                >
                  {voting ? "투표 중..." : "승자로 선택"}
                </button>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-gray-400">
                Round {currentMatch.round} - Match {currentMatch.matchNumber}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Score Submission */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Submit Score</h2>
            <form onSubmit={handleScoreSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Participant
                </label>
                <select
                  value={selectedParticipant}
                  onChange={(e) => setSelectedParticipant(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Choose a participant...</option>
                  {judge.tournament.participants.map((participant) => (
                    <option key={participant.id} value={participant.id}>
                      #{participant.registrationNumber} - {participant.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Score (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold"
              >
                {submitting ? "Submitting..." : "Submit Score"}
              </button>
            </form>
          </div>

          {/* Participants List */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">
              Participants & Scores
            </h2>
            <div className="space-y-4">
              {judge.tournament.participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src={participant.imageUrl}
                        alt={participant.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold">
                        #{participant.registrationNumber} - {participant.name}
                      </p>
                      <p className="text-sm text-gray-300">
                        Your score:{" "}
                        {participant.scores.find((s) => s.judgeId === judge.id)
                          ?.value || "Not scored"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-400">
                      Avg: {getAverageScore(participant)}
                    </p>
                    <p className="text-sm text-gray-300">
                      {participant.scores.length} scores
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tournament Status */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Tournament Status</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  judge.tournament.status === "ACTIVE"
                    ? "bg-green-600 text-white"
                    : judge.tournament.status === "READY_TO_BRACKET"
                    ? "bg-purple-600 text-white"
                    : "bg-yellow-600 text-white"
                }`}
              >
                {judge.tournament.status}
              </span>
              <span className="text-gray-300">
                {judge.tournament.participants.length} participants registered
              </span>
            </div>
            {judge.tournament.status === "PRESELECTION" &&
              hasAllParticipantsScored() && (
                <button
                  onClick={handleFinishScoring}
                  disabled={finishingScoring}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-4 py-2 rounded-lg font-medium"
                >
                  {finishingScoring ? "Finishing..." : "점수 입력 완료"}
                </button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
