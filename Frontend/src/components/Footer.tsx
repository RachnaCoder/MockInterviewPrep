import { Sparkles, Github, Linkedin, Mail, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="relative mt-24 border-t border-zinc-900 bg-[#050505] text-white overflow-hidden">

      {/* 🔥 Glow Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] opacity-40 pointer-events-none" />

      {/* ✨ Top Gradient Line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-40" />

      <div className="relative max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-5 gap-10">

        {/* 🧠 Brand Section */}
        <div className="md:col-span-2">
          <div className="flex items-center space-x-2 mb-5">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              InterviewPro AI
            </span>
          </div>

          <p className="text-zinc-400 text-sm leading-relaxed max-w-md mb-6">
            Practice smarter with AI-powered mock interviews tailored to your
            resume and job role. Improve faster, get hired sooner.
          </p>

          {/* 📊 Stats */}
          <div className="flex gap-6 text-sm">
            {/* <div>
              <p className="text-xl font-bold text-emerald-500">10K+</p>
              <p className="text-zinc-500">Users</p>
            </div>
            <div>
              <p className="text-xl font-bold text-emerald-500">25K+</p>
              <p className="text-zinc-500">Interviews</p>
            </div> */}
          </div>
        </div>

        {/* 📦 Product */}
        <div>
          <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-white">
            Product
          </h3>
          <ul className="space-y-3 text-sm text-zinc-400">
            <li className="hover:text-emerald-500 cursor-pointer">Features</li>
            <li className="hover:text-emerald-500 cursor-pointer">Pricing</li>
            <li className="hover:text-emerald-500 cursor-pointer">Mock Interviews</li>
            <li className="hover:text-emerald-500 cursor-pointer">AI Feedback</li>
          </ul>
        </div>

        {/* 🏢 Company */}
        <div>
          <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-white">
            Company
          </h3>
          <ul className="space-y-3 text-sm text-zinc-400">
            <li className="hover:text-emerald-500 cursor-pointer">About</li>
            <li className="hover:text-emerald-500 cursor-pointer">Careers</li>
            <li className="hover:text-emerald-500 cursor-pointer">Contact</li>
            <li className="hover:text-emerald-500 cursor-pointer">Privacy Policy</li>
          </ul>
        </div>

        {/* 📩 Newsletter */}
        <div>
          <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-white">
            Stay Updated
          </h3>

          <p className="text-sm text-zinc-400 mb-4">
            Get interview tips & product updates.
          </p>

          {!subscribed ? (
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent px-4 py-2 text-sm outline-none"
              />
              <button
                onClick={handleSubscribe}
                className="px-4 py-2 bg-emerald-500 text-black hover:bg-emerald-400 transition"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <p className="text-emerald-500 text-sm font-medium">
              Subscribed successfully!
            </p>
          )}

          {/* 🌐 Social */}
          <div className="flex space-x-3 mt-5">
            <a className="p-2 bg-zinc-800 rounded-lg hover:bg-emerald-500/20 transition">
              <Github size={18} />
            </a>
            <a className="p-2 bg-zinc-800 rounded-lg hover:bg-emerald-500/20 transition">
              <Linkedin size={18} />
            </a>
            <a className="p-2 bg-zinc-800 rounded-lg hover:bg-emerald-500/20 transition">
              <Mail size={18} />
            </a>
          </div>
        </div>
      </div>

      {/* ⚡ Bottom Bar */}
      <div className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} InterviewPro AI · Built with ❤️ for developers
      </div>
    </footer>
  );
}