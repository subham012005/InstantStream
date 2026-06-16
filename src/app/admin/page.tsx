"use client";

import { useEffect, useState } from "react";

export default function AdminSettingsPage() {
  const [proxyUrl, setProxyUrl] = useState("");
  const [showAdFree, setShowAdFree] = useState(true);
  const [defaultServer, setDefaultServer] = useState("auto");
  const [disabledServers, setDisabledServers] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const NATIVE_SERVER_OPTIONS = [
    { id: "auto", label: "Shadow Auto (All Servers)" },
    { id: "moviebox", label: "Ghost (MovieBox)" },
    { id: "holly", label: "Skull (Holly)" },
    { id: "air", label: "Wraith (Air)" },
    { id: "net", label: "Demon (Net)" },
    { id: "gemma", label: "Phantom (Gemma)" },
    { id: "server1", label: "Vidsrc (Ads)" },
    { id: "server2", label: "Alternative (Ads)" },
    { id: "server3", label: "Alternative 2 (Ads)" },
  ];

  useEffect(() => {
    fetch(`/api/admin/settings?t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setProxyUrl(data.proxyUrl || "");
        setShowAdFree(data.showAdFree ?? true);
        setDefaultServer(data.defaultServer || "auto");
        setDisabledServers(data.disabledServers || {});
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching admin settings:", err);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proxyUrl, showAdFree, defaultServer, disabledServers }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Settings saved successfully!");
      } else {
        setMessage(data.error || "Failed to save settings.");
      }
    } catch (err) {
      console.error(err);
      setMessage("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#141414] text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#E50914] selection:text-white">
      <div className="w-full max-w-2xl mx-auto">
        <h1 className="text-4xl font-black text-white tracking-tight mb-8" style={{ fontFamily: "var(--font-sora)" }}>
          Admin Dashboard
        </h1>

        <div className="bg-[#181818] border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-[#E50914] mb-6 border-b border-white/10 pb-4">
            System Configuration
          </h2>

          <div className="space-y-8">
            {/* Proxy Settings */}
            <div>
              <label className="block text-sm font-bold text-white/70 tracking-wider uppercase mb-2">
                Proxy URL (HTTP/HTTPS)
              </label>
              <input
                type="text"
                value={proxyUrl}
                onChange={(e) => setProxyUrl(e.target.value)}
                placeholder="http://ip:port or empty to bypass"
                className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E50914]/50 focus:border-[#E50914] transition-all"
              />
              <p className="mt-2 text-xs text-white/40">
                Residential Proxy used for fetch requests to external providers (e.g., MovieBox, Net). Leave blank for default Vercel IP.
              </p>
            </div>

            {/* Ad-Free App Settings */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-white/70 tracking-wider uppercase mb-2">
                  Enable Ad-Free Servers (Kill-Switch)
                </label>
                <button
                  onClick={() => setShowAdFree(!showAdFree)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    showAdFree ? "bg-[#E50914]" : "bg-white/20"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showAdFree ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <p className="mt-1 text-xs text-white/40">
                If the proxy fails, toggle this OFF to hide all Ad-Free custom servers and fallback strictly to third-party ad-based providers.
              </p>
            </div>

            {/* Individual Server Status */}
            <div>
              <label className="block text-sm font-bold text-white/70 tracking-wider uppercase mb-4">
                Individual Server Kill-Switch
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {NATIVE_SERVER_OPTIONS.filter((opt) => opt.id !== "auto").map((server) => {
                  const isEnabled = !disabledServers[server.id];
                  return (
                    <div key={server.id} className="flex items-center justify-between bg-black/30 p-3 rounded-xl border border-white/10">
                      <span className="text-sm font-medium text-white/90">{server.label}</span>
                      <button
                        onClick={() => {
                          setDisabledServers((prev) => ({
                            ...prev,
                            [server.id]: isEnabled,
                          }));
                        }}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                          isEnabled ? "bg-[#E50914]" : "bg-white/20"
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            isEnabled ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-white/40">
                Toggle individual servers ON (red) or OFF (grey) to dynamically remove them from the player and shadow auto rotation.
              </p>
            </div>

            {/* Default Server */}
            <div>
              <label className="block text-sm font-bold text-white/70 tracking-wider uppercase mb-2">
                Default Server Selection
              </label>
              <select
                value={defaultServer}
                onChange={(e) => setDefaultServer(e.target.value)}
                className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#E50914]/50 focus:border-[#E50914] transition-all"
              >
                {NATIVE_SERVER_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id} className="bg-[#181818] text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-white/40">
                The initial server that auto-plays when a user clicks &quot;Play&quot;.
              </p>
            </div>

            {/* Save Button */}
            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <span
                className={`text-sm font-medium ${
                  message.includes("success") ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {message}
              </span>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-[#E50914] hover:bg-[#B20710] text-white font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
