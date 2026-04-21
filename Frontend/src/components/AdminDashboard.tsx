import React, { useEffect, useState } from "react";
import { Users, Trash2, BarChart3, Video } from "lucide-react";

export default function AdminDashboard() {

  const [users, setUsers] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, interviews: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const usersRes = await fetch("/api/admin/users", {
    headers: {
    Authorization: `Bearer ${token}`,
   },
  });

  const usersData = await usersRes.json();

if (!usersRes.ok) {
  console.error("Users API error:", usersData);
  return;
}


    const interviewsRes = await fetch("/api/admin/interviews", {
    headers: {
    Authorization: `Bearer ${token}`,
  },
});
const interviewsData = await interviewsRes.json();

if (!interviewsRes.ok) {
  console.error("Interview API error:", interviewsData);
  return;
}
    setUsers(usersData);
    setInterviews(interviewsData);
    setStats({
      users: usersData.length,
      interviews: interviewsData.length,
    });
  };

  // const deleteUser = async (id: string) => {
  //   if (!confirm("Delete this user?")) return;

  //   await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
  //   setUsers(users.filter(u => u._id !== id));
  // };


  const deleteUser = async (id: string) => {
  if (!confirm("Delete this user?")) return;

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Delete failed:", data);
      alert(data.message || "Delete failed");
      return;
    }

    // remove from UI
    setUsers(users.filter(u => u._id !== id));

  } catch (err) {
    console.error(err);
  }
};



const deleteInterview = async (id: string) => {
  if (!confirm("Delete this interview?")) return;

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`/api/admin/interviews/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Delete failed");
      return;
    }

    setInterviews(interviews.filter(i => i._id !== id));

  } catch (err) {
    console.error(err);
  }
};


  return (
    <div className="flex min-h-screen bg-black text-white">
      
      {/* Sidebar */}
      <div className="w-64 bg-zinc-900 p-6 border-r border-zinc-800">
        <h2 className="text-2xl font-bold text-emerald-500 mb-8">
          Admin Panel
        </h2>

        <nav className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-300 hover:text-emerald-500 cursor-pointer">
            <BarChart3 size={18} /> Dashboard
          </div>
          <div className="flex items-center gap-2 text-zinc-300 hover:text-emerald-500 cursor-pointer">
            <Users size={18} /> Users
          </div>
          <div className="flex items-center gap-2 text-zinc-300 hover:text-emerald-500 cursor-pointer">
            <Video size={18} /> Interviews
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">

        {/* Header */}
        <h1 className="text-3xl font-bold mb-6 text-emerald-500">
          Dashboard Overview
        </h1>

        <button
    onClick={() => window.location.href = "/"}
    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm mb-5"
  >
    ← Back to Home
  </button>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow">
            <h3 className="text-zinc-400">Total Users</h3>
            <p className="text-2xl font-bold">{stats.users}</p>
          </div>

          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow">
            <h3 className="text-zinc-400">Total Interviews</h3>
            <p className="text-2xl font-bold">{stats.interviews}</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 mb-10">
          <h2 className="text-xl font-semibold mb-4 text-emerald-400">
            Users
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-zinc-400 border-b border-zinc-700">
                  <th className="py-2">Name</th>
                  <th>Email</th>
                  <th>Plan</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map(user => (
                  <tr key={user._id} className="border-b border-zinc-800">
                    <td className="py-2">{user.name}</td>
                    <td>{user.email}</td>
                    <td className="capitalize">{user.plan}</td>
                    <td>
                      <button
                        onClick={() => deleteUser(user._id)}
                        className="text-red-500 hover:text-red-400 flex items-center gap-1"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Interviews Table */}
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          <h2 className="text-xl font-semibold mb-4 text-emerald-400">
            Interview Sessions
          </h2>

          <div className="space-y-3">
            {interviews.map(i => (
              <div
                key={i._id}
                className="flex justify-between items-center bg-zinc-800 p-4 rounded-lg"
              >
                <div>
                  <p className="text-sm text-zinc-400">
                    {i.userId?.email}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Duration: {i.duration || 0}s
                  </p>
                </div>

                <button className="text-red-500 hover:text-red-400"
                onClick={() => deleteInterview(i._id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}