// import { Brain, Briefcase, Mic, Code, CheckCircle } from "lucide-react";

// const tips = [
//   {
//     category: "Preparation",
//     icon: Brain,
//     items: [
//       "Research the company and role deeply",
//       "Understand job description keywords",
//       "Prepare 2–3 strong project explanations",
//       "Practice common HR questions",
//     ],
//   },
//   {
//     category: "Technical",
//     icon: Code,
//     items: [
//       "Revise core concepts (DSA, DBMS, OS)",
//       "Practice coding problems daily",
//       "Explain logic clearly while coding",
//       "Focus on problem-solving approach",
//     ],
//   },
//   {
//     category: "Communication",
//     icon: Mic,
//     items: [
//       "Speak clearly and confidently",
//       "Maintain eye contact (camera for online)",
//       "Avoid filler words like 'umm'",
//       "Structure answers (STAR method)",
//     ],
//   },
//   {
//     category: "Job Strategy",
//     icon: Briefcase,
//     items: [
//       "Apply to multiple companies consistently",
//       "Customize resume for each role",
//       "Follow up after interviews",
//       "Build strong LinkedIn presence",
//     ],
//   },
// ];

// export default function ServicesPage() {
//   return (
//     <div className="min-h-screen bg-[#050505] text-white px-6 py-20">

//       {/* 🔥 HERO */}
//       <div className="text-center max-w-3xl mx-auto mb-20">
//         <h1 className="text-4xl md:text-5xl font-bold mb-6">
//           Interview <span className="text-emerald-500">Preparation Hub</span>
//         </h1>
//         <p className="text-zinc-400 text-lg">
//           Master interviews with expert tips, proven strategies, and AI-powered guidance.
//         </p>
//       </div>

//       {/* 💡 TIPS GRID */}
//       <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">

//         {tips.map((section, index) => (
//           <div
//             key={index}
//             className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-emerald-500/40 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] transition-all duration-300"
//           >
//             {/* Icon */}
//             <div className="mb-4">
//               <section.icon className="w-8 h-8 text-emerald-500" />
//             </div>

//             {/* Title */}
//             <h3 className="text-xl font-semibold mb-4">
//               {section.category}
//             </h3>

//             {/* List */}
//             <ul className="space-y-3 text-sm text-zinc-400">
//               {section.items.map((tip, i) => (
//                 <li key={i} className="flex items-start gap-2">
//                   <CheckCircle className="w-4 h-4 text-emerald-500 mt-1" />
//                   <span>{tip}</span>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         ))}
//       </div>

//       {/* 🚀 CTA SECTION */}
//       <div className="mt-24 text-center">
//         <h2 className="text-2xl md:text-3xl font-bold mb-4">
//           Ready to Practice?
//         </h2>
//         <p className="text-zinc-400 mb-6">
//           Put these tips into action with AI-powered mock interviews.
//         </p>

//         <button className="px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition">
//           Start Interview
//         </button>
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import { ChevronDown, Search, Bookmark } from "lucide-react";

export default function ServicesPage() {
  const [tips, setTips] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  const categories = ["All", "HR", "Technical", "Preparation", "Strategy"];

//   useEffect(() => {
//     fetchTips();
//   }, []);

//   const fetchTips = async () => {
//     const res = await fetch("/api/tips");
//     const data = await res.json();
//     setTips(data);
//   };


useEffect(() => {
  fetch("/api/tips")
    .then(res => res.json())
    .then(data => setTips(data));
}, []);

  // 🔍 Filter
  const filtered = tips.filter((tip) => {
    return (
      (category === "All" || tip.category === category) &&
      (tip.title.toLowerCase().includes(search.toLowerCase()) ||
        tip.content.toLowerCase().includes(search.toLowerCase()))
    );
  });

  // 🔖 Bookmark
  const toggleBookmark = async (id: string) => {
    const token = localStorage.getItem("token");

    if (bookmarks.includes(id)) {
      await fetch(`/api/user/bookmark/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookmarks(bookmarks.filter((b) => b !== id));
    } else {
      await fetch(`/api/user/bookmark/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookmarks([...bookmarks, id]);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-20">

      {/* 🔥 HEADER */}
      <h1 className="text-4xl font-bold text-center mb-10">
        Interview <span className="text-emerald-500">Tips Hub</span>
      </h1>

      {/* 🔍 SEARCH */}
      <div className="max-w-xl mx-auto mb-6 relative">
        <Search className="absolute left-3 top-3 text-zinc-500" />
        <input
          className="w-full bg-zinc-900 pl-10 py-3 rounded-xl border border-zinc-800"
          placeholder="Search tips..."
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 🎯 FILTER */}
      <div className="flex justify-center gap-3 mb-10 flex-wrap">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-2 rounded-full ${
              category === c
                ? "bg-emerald-500 text-black"
                : "bg-zinc-800 text-zinc-400"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* 📂 ACCORDION */}
      <div className="max-w-3xl mx-auto space-y-4">
        {filtered.map((tip, i) => (
          <div
            key={tip._id}
            className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
          >
            <div className="flex justify-between items-center p-4">

              {/* Title */}
              <button
                onClick={() =>
                  setOpenIndex(openIndex === i ? null : i)
                }
                className="flex-1 text-left"
              >
                {tip.title}
              </button>

              {/* Bookmark */}
              <Bookmark
                onClick={() => toggleBookmark(tip._id)}
                className={`cursor-pointer ${
                  bookmarks.includes(tip._id)
                    ? "text-emerald-500"
                    : "text-zinc-500"
                }`}
              />

              {/* Arrow */}
              <ChevronDown
                className={`ml-2 transition-transform ${
                  openIndex === i ? "rotate-180" : ""
                }`}
              />
            </div>

            {/* ✨ SMOOTH ANIMATION */}
            <div
              className={`transition-all duration-300 overflow-hidden ${
                openIndex === i ? "max-h-40 p-4" : "max-h-0"
              }`}
            >
              <p className="text-sm text-zinc-400">{tip.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}