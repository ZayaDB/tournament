"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Tournament {
  id: string;
  name: string;
  danceStyle: string;
  participantCount: number;
  status: string;
  event: {
    name: string;
  };
  judges: {
    id: string;
    name: string;
    imageUrl: string;
  }[];
}

export default function JudgeRegisterPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [judgeData, setJudgeData] = useState({
    name: "",
    image: null as File | null,
    tournamentId: "",
  });
  const router = useRouter();

  useEffect(() => {
    fetchTournaments();
  }, [router]);

  const fetchTournaments = async () => {
    try {
      const response = await fetch("/api/tournaments");
      if (response.ok) {
        const data = await response.json();
        setTournaments(data);
      }
    } catch (error) {
      console.error("Error fetching tournaments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setJudgeData((prev) => ({ ...prev, image: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judgeData.name || !judgeData.image || !judgeData.tournamentId) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", judgeData.name);
      formData.append("image", judgeData.image);
      formData.append("tournamentId", judgeData.tournamentId);

      const response = await fetch("/api/judges", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to judge panel
        router.push(`/judge/panel/${data.judge.id}`);
      } else {
        const errorData = await response.json();
        console.error("Failed to register judge:", errorData.error);
        alert("Failed to register judge. Please try again.");
      }
    } catch (error) {
      console.error("Error registering judge:", error);
      alert("Error registering judge. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8 flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">👨‍⚖️ Judge Registration</h1>
          <button
            onClick={() => {
              localStorage.removeItem("judgeMode");
              localStorage.removeItem("judgeToken");
              router.push("/");
            }}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg"
          >
            Back to Home
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Registration Form */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">
              Register as New Judge
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Judge Name
                </label>
                <input
                  type="text"
                  value={judgeData.name}
                  onChange={(e) =>
                    setJudgeData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-purple-500"
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
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Tournament to Judge
                </label>
                <select
                  value={judgeData.tournamentId}
                  onChange={(e) =>
                    setJudgeData((prev) => ({
                      ...prev,
                      tournamentId: e.target.value,
                    }))
                  }
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Choose a tournament...</option>
                  {tournaments.map((tournament) => (
                    <option key={tournament.id} value={tournament.id}>
                      {tournament.event?.name || "Unknown Event"} -{" "}
                      {tournament.name || tournament.danceStyle} (
                      {tournament.danceStyle})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold"
              >
                {submitting ? "Registering..." : "Register as Judge"}
              </button>
            </form>
          </div>

          {/* Current Judges List */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Current Judges</h2>
            {tournaments.map((tournament) => (
              <div key={tournament.id} className="mb-6">
                <h3 className="text-lg font-medium text-purple-400 mb-3">
                  {tournament.event?.name} -{" "}
                  {tournament.name || tournament.danceStyle}
                </h3>
                {tournament.judges && tournament.judges.length > 0 ? (
                  <div className="space-y-3">
                    {tournament.judges.map((judge) => (
                      <div
                        key={judge.id}
                        className="flex items-center justify-between bg-gray-700 p-3 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            <Image
                              src={judge.imageUrl}
                              alt={judge.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="font-medium">{judge.name}</span>
                        </div>
                        <button
                          onClick={() =>
                            router.push(`/judge/panel/${judge.id}`)
                          }
                          className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm"
                        >
                          Go to Panel
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No judges registered yet</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
