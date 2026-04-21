import React, { useState } from "react";

export default function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      // Save token
      localStorage.setItem("token", data.token);

      // ✅ Check admin role
      if (data.user.role !== "admin") {
        alert("You are not admin!");
        return;
      }

      onSuccess(); // open dashboard
    } catch (err) {
      console.error(err);
      alert("Error logging in");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
    <button
    onClick={() => window.location.href = "/"}
    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm mb-5"
  >
    ← Back to Home
  </button>



      <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 w-96">
        <h2 className="text-2xl font-bold mb-6 text-emerald-500">
          Admin Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-3 rounded bg-zinc-800"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-3 rounded bg-zinc-800"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-emerald-500 text-black py-3 rounded font-bold"
        >
          Login as Admin
        </button>
      </div>
    </div>
  );
}