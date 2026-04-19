import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, ChevronRight, MessageSquare, Star, Loader2, AlertCircle, CreditCard } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

interface Interview {
  _id: string;
  createdAt: string;
  transcript: { role: string; text: string }[];
  feedback: {
    overallScore: number;
    strengths: string[];
  };
}

export const InterviewHistory: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setError(null);
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch('/api/interviews', { 
          headers,
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setInterviews(data.interviews || []);
        } else {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Server returned ${res.status}`);
        }
      } catch (err: any) {
        console.error("Failed to fetch history:", err);
        setError(err.message || "Failed to connect to server");
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-zinc-500 text-sm animate-pulse">Loading your history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <section id="history" className="py-24 relative">
        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-12 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-red-500">Failed to load history</h3>
          <p className="text-zinc-500 max-w-sm mx-auto mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all font-bold text-sm"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (interviews.length === 0) {
    return (
      <section id="history" className="py-24 relative">
        <div className="space-y-4 mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Your Interview History</h2>
          <p className="text-zinc-500">Review your past performances and track your progress over time.</p>
        </div>
        <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-3xl p-12 text-center">
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-8 h-8 text-zinc-700" />
          </div>
          <h3 className="text-xl font-bold mb-2">No interviews yet</h3>
          <p className="text-zinc-500 max-w-sm mx-auto">Complete your first mock interview to start building your performance history.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="history" className="py-24 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">Your Interview History</h2>
          <p className="text-zinc-500">Review your past performances and track your progress over time.</p>
        </div>

        {user && user.plan !== 'free' && (
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-emerald-500 fill-emerald-500" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Active Plan</div>
              <div className="text-sm font-bold flex items-center space-x-2">
                <span>{user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 uppercase flex items-center space-x-1">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-2" referrerPolicy="no-referrer" />
                  <span>{user.payment_method || 'UPI/Card'}</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {interviews.map((interview) => (
          <motion.div
            key={interview._id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex flex-col items-center justify-center text-zinc-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-300">
                    {new Date(interview.createdAt).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </div>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center text-xs text-zinc-500">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      {interview.transcript.length} Exchanges
                    </div>
                    <div className="flex items-center text-xs text-emerald-500 font-bold">
                      <Star className="w-3 h-3 mr-1 fill-emerald-500" />
                      Score: {interview.feedback?.overallScore || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex -space-x-2">
                  {interview.feedback?.strengths?.slice(0, 2).map((s, i) => (
                    <div 
                      key={i}
                      className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-500 uppercase tracking-wider"
                    >
                      {s.split(' ')[0]}
                    </div>
                  ))}
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
