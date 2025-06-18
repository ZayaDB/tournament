"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Event {
  id: string;
  name: string;
  date: string;
  tournaments: Tournament[];
}

interface Tournament {
  id: string;
  name: string;
  danceStyle: string;
  participantCount: number;
  status: string;
  participants: Participant[];
}

interface Participant {
  id: string;
  name: string;
  imageUrl: string;
  registrationNumber: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showCreateTournamentModal, setShowCreateTournamentModal] =
    useState(false);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedTournament, setSelectedTournament] =
    useState<Tournament | null>(null);

  // Event form state
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");

  // Tournament form state
  const [danceStyle, setDanceStyle] = useState("Hiphop");
  const [participantCount, setParticipantCount] = useState(8);

  const danceStyles = ["Hiphop", "Break", "Popping", "Locking", "House"];
  const participantCounts = [4, 8, 16, 32];

  useEffect(() => {
    // Check admin authentication
    const adminMode = localStorage.getItem("adminMode");
    if (adminMode !== "true") {
      router.push("/");
      return;
    }

    fetchEvents();
  }, [router]);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: eventName,
          date: eventDate,
        }),
      });

      if (response.ok) {
        setEventName("");
        setEventDate("");
        setShowCreateEventModal(false);
        await fetchEvents();
      }
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/tournaments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          danceStyle,
          participantCount,
          eventId: selectedEventId,
        }),
      });

      if (response.ok) {
        setDanceStyle("Hiphop");
        setParticipantCount(8);
        setShowCreateTournamentModal(false);
        await fetchEvents();
      }
    } catch (error) {
      console.error("Error creating tournament:", error);
    }
  };

  const handleViewParticipants = async (tournament: Tournament) => {
    try {
      // Fetch participants for this tournament
      const response = await fetch(
        `/api/tournaments/${tournament.id}/participants`
      );
      if (response.ok) {
        const participants = await response.json();
        setSelectedTournament({
          ...tournament,
          participants: participants,
        });
        setShowParticipantsModal(true);
      }
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminMode");
    localStorage.removeItem("adminToken");
    router.push("/");
  };

  // Event 삭제
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("정말로 이 이벤트를 삭제하시겠습니까?")) return;
    try {
      await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      await fetchEvents();
    } catch (e) {
      alert("이벤트 삭제 중 오류 발생");
    }
  };

  // Tournament 삭제
  const handleDeleteTournament = async (tournamentId: string) => {
    if (!confirm("정말로 이 토너먼트를 삭제하시겠습니까?")) return;
    try {
      await fetch(`/api/tournaments/${tournamentId}`, { method: "DELETE" });
      await fetchEvents();
    } catch (e) {
      alert("토너먼트 삭제 중 오류 발생");
    }
  };

  // Bracket 생성 함수 추가
  const handleGenerateBrackets = async (tournamentId: string) => {
    const tournament = events
      .flatMap((e) => e.tournaments)
      .find((t) => t.id === tournamentId);

    if (!tournament) return;

    if (tournament.status !== "READY_TO_BRACKET") {
      alert(
        "Cannot generate brackets yet. Please wait for judges to complete preselection."
      );
      return;
    }

    if (
      !confirm(
        "브래킷을 생성하시겠습니까? 생성 후에는 더 이상 참가자를 추가할 수 없습니다."
      )
    )
      return;

    try {
      const response = await fetch(
        `/api/tournaments/${tournamentId}/generate-brackets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            adminPassword: localStorage.getItem("adminToken"),
          }),
        }
      );

      if (response.ok) {
        await fetchEvents();
      }
    } catch (error) {
      console.error("Error generating brackets:", error);
      alert("브래킷 생성 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8 flex items-center justify-center">
        <div className="text-2xl">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
            <p className="text-gray-300">Manage events and tournaments</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setShowCreateEventModal(true)}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Create Event
          </button>
        </div>

        {/* Events List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Events</h2>
          {events.length === 0 ? (
            <div className="text-center py-8 bg-gray-800 rounded-lg">
              <p className="text-gray-400">No events created yet.</p>
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-purple-400">
                      {event.name}
                    </h3>
                    <p className="text-gray-400">
                      Date: {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href="/judge/register"
                      className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Judge
                    </Link>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Delete Event
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEventId(event.id);
                        setShowCreateTournamentModal(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Add Tournament
                    </button>
                  </div>
                </div>

                {event.tournaments.length === 0 ? (
                  <p className="text-gray-400 italic">
                    No tournaments in this event.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {event.tournaments.map((tournament) => (
                      <div
                        key={tournament.id}
                        className="bg-gray-700 rounded-lg p-4"
                      >
                        <h4 className="font-semibold mb-2">
                          {tournament.name}
                        </h4>
                        <p className="text-sm text-gray-300 mb-2">
                          {tournament.danceStyle}
                        </p>
                        <p className="text-sm text-gray-400 mb-3">
                          {tournament.participantCount} participants
                        </p>
                        <div className="flex justify-between items-center mb-3">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              tournament.status === "ACTIVE"
                                ? "bg-green-600 text-green-100"
                                : tournament.status === "READY_TO_BRACKET"
                                ? "bg-purple-600 text-purple-100"
                                : tournament.status === "PRESELECTION"
                                ? "bg-yellow-600 text-yellow-100"
                                : "bg-gray-600 text-gray-100"
                            }`}
                          >
                            {tournament.status === "READY_TO_BRACKET"
                              ? "Ready for Brackets"
                              : tournament.status === "PRESELECTION"
                              ? "Preselection"
                              : tournament.status}
                          </span>
                          <div className="flex gap-2">
                            <Link
                              href={`/tournament/${tournament.id}`}
                              className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-xs font-semibold transition-colors"
                            >
                              View Participants
                            </Link>
                            <button
                              onClick={() =>
                                handleDeleteTournament(tournament.id)
                              }
                              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs font-semibold transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Create Event Modal */}
        {showCreateEventModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Create New Event</h2>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Event Name
                  </label>
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 p-3 rounded-lg font-semibold"
                  >
                    Create Event
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateEventModal(false);
                      setEventName("");
                      setEventDate("");
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 p-3 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Tournament Modal */}
        {showCreateTournamentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Create New Tournament</h2>
              <form onSubmit={handleCreateTournament} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Dance Style
                  </label>
                  <select
                    value={danceStyle}
                    onChange={(e) => setDanceStyle(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500"
                  >
                    {danceStyles.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Participant Count
                  </label>
                  <select
                    value={participantCount}
                    onChange={(e) =>
                      setParticipantCount(Number(e.target.value))
                    }
                    className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500"
                  >
                    {participantCounts.map((count) => (
                      <option key={count} value={count}>
                        {count} participants
                      </option>
                    ))}
                  </select>
                </div>
                {!selectedEventId && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Event
                    </label>
                    <select
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                      className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select an event</option>
                      {events.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-semibold"
                  >
                    Create Tournament
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateTournamentModal(false);
                      setDanceStyle("Hiphop");
                      setParticipantCount(8);
                      setSelectedEventId("");
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 p-3 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Participants Modal */}
        {showParticipantsModal && selectedTournament && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    Participants -{" "}
                    {selectedTournament.name ||
                      `${selectedTournament.danceStyle} Battle`}
                  </h2>
                  <p className="text-gray-400">
                    {selectedTournament.participants.length} /{" "}
                    {selectedTournament.participantCount} participants
                  </p>
                </div>
                <div className="flex gap-2">
                  {selectedTournament.participants.length ===
                    selectedTournament.participantCount && (
                    <button
                      onClick={() =>
                        handleGenerateBrackets(selectedTournament.id)
                      }
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Generate Bracket
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowParticipantsModal(false);
                      setSelectedTournament(null);
                    }}
                    className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>

              {selectedTournament.participants.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">
                    No participants registered yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedTournament.participants
                    .sort((a, b) => a.registrationNumber - b.registrationNumber)
                    .map((participant) => (
                      <div
                        key={participant.id}
                        className="bg-gray-700 rounded-lg p-4 flex items-center gap-4"
                      >
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <Image
                            src={participant.imageUrl}
                            alt={participant.name}
                            fill
                            className="rounded-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">
                            #{participant.registrationNumber} {participant.name}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
