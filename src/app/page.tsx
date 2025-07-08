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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center p-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-pink-500/20 rounded-full blur-xl animate-float"></div>
        <div
          className="absolute top-40 right-32 w-24 h-24 bg-blue-500/20 rounded-full blur-xl animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-32 left-1/3 w-28 h-28 bg-purple-500/20 rounded-full blur-xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="mb-12">
          <h1 className="text-7xl font-black mb-6 dance-gradient-text tracking-tight">
            Mongolia Dance Battle
          </h1>
          <div className="text-8xl mb-6 animate-float">🎭</div>
          <p className="text-2xl text-gray-300 mb-4 font-light">
            Join the ultimate dance battle experience
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Experience the rhythm, feel the beat, and battle for glory in
            Mongolia's premier dance competition
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Participant Button */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8 hover:scale-105 transition-all duration-300 hover:border-blue-400/60">
              <div className="text-7xl mb-6 group-hover:scale-110 transition-transform duration-300">
                💃
              </div>
              <h2 className="text-3xl font-bold mb-4 text-blue-300">
                Participant
              </h2>
              <p className="text-gray-300 mb-8 leading-relaxed">
                View tournaments and register for epic dance battles
              </p>
              <button
                onClick={() => router.push("/register")}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
              >
                Join Battle
              </button>
            </div>
          </div>

          {/* Admin Button */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-sm border border-green-500/30 rounded-2xl p-8 hover:scale-105 transition-all duration-300 hover:border-green-400/60">
              <div className="text-7xl mb-6 group-hover:scale-110 transition-transform duration-300">
                👑
              </div>
              <h2 className="text-3xl font-bold mb-4 text-green-300">Admin</h2>
              <p className="text-gray-300 mb-8 leading-relaxed">
                Create events and manage tournaments
              </p>
              <button
                onClick={() => setShowAdminModal(true)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
              >
                Admin Panel
              </button>
            </div>
          </div>
        </div>

        {/* Admin Authentication Modal */}
        {showAdminModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full border border-gray-600/50 shadow-2xl">
              <h2 className="text-3xl font-bold mb-6 text-center gradient-text">
                Admin Access
              </h2>
              <form onSubmit={handleAdminAuth} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-300">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full p-4 rounded-xl bg-gray-700/50 border border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg backdrop-blur-sm transition-all"
                    placeholder="Enter admin password"
                    required
                  />
                </div>
                {authError && (
                  <p className="text-red-400 text-center font-medium">
                    {authError}
                  </p>
                )}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 p-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
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
                    className="flex-1 bg-gray-600 hover:bg-gray-700 p-4 rounded-xl font-bold text-lg transition-all duration-300"
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
