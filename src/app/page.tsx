"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: adminPassword }),
      });

      const data = await response.json();

      if (data.success) {
        const token = btoa(adminPassword);
        localStorage.setItem("adminMode", "true");
        localStorage.setItem("adminToken", token);
        setShowAdminModal(false);
        setAdminPassword("");
        router.push("/admin");
      } else {
        setAuthError("Invalid password");
      }
    } catch {
      setAuthError("Authentication failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-6xl font-bold mb-8">
          Mongolia Dance Battle Portal
        </h1>

        <p className="text-xl text-gray-300 mb-12">
          Join the ultimate dance battle experience
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Participant Button */}
          <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-8 hover:bg-blue-900/50 transition-colors">
            <div className="text-6xl mb-4">🎭</div>
            <h2 className="text-2xl font-bold mb-4">Participant</h2>
            <p className="text-gray-300 mb-6">
              View tournaments and register for dance battles
            </p>
            <button
              onClick={() => router.push("/register")}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Join Battle
            </button>
          </div>

          {/* Admin Button */}
          <div className="bg-green-900/30 border border-green-500 rounded-lg p-8 hover:bg-green-900/50 transition-colors">
            <div className="text-6xl mb-4">👑</div>
            <h2 className="text-2xl font-bold mb-4">Admin</h2>
            <p className="text-gray-300 mb-6">
              Create events and manage tournaments
            </p>
            <button
              onClick={() => setShowAdminModal(true)}
              className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Admin Panel
            </button>
          </div>
        </div>

        {/* Admin Authentication Modal */}
        {showAdminModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
              <h2 className="text-3xl font-bold mb-6 text-center">
                Admin Access
              </h2>
              <form onSubmit={handleAdminAuth} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full p-4 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-green-500 text-lg"
                    placeholder="Enter admin password"
                    required
                  />
                </div>
                {authError && (
                  <p className="text-red-400 text-center">{authError}</p>
                )}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 p-4 rounded-lg font-semibold text-lg"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminModal(false);
                      setAdminPassword("");
                      setAuthError("");
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 p-4 rounded-lg font-semibold text-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
