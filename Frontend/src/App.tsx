/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { FileUploader } from './components/FileUploader';
import { InterviewRoom } from './components/InterviewRoom';
import { FeedbackPage } from './components/FeedbackPage';
import { Pricing } from './components/Pricing';
import { Features } from './components/Features';
import { InterviewHistory } from './components/InterviewHistory';
import { SignInModal } from './components/SignInModal';
import { parseFile } from './services/fileParser';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, User, Sparkles, ArrowRight, Loader2, ShieldCheck, Zap, Globe, Menu, X as CloseIcon } from 'lucide-react';
import { cn } from './lib/utils';

import AdminDashboard from "./components/AdminDashboard";

import AdminLogin from "./components/AdminLogin";


import { useAuth } from './contexts/AuthContext';

type AppState = 'landing' | 'processing' | 'interview' | 'feedback'|'admin'| 'admin-login';

export default function App() {
  const [state, setState] = useState<AppState>('landing');
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<File | null>(null);
  const [manualJdText, setManualJdText] = useState('');
  const [jdInputMode, setJdInputMode] = useState<'file' | 'text'>('file');
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [maxDuration, setMaxDuration] = useState(6); // Default to 6
  const [transcript, setTranscript] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [error, setError] = useState<string | null>(null);





  const handleStartInterview = async () => {
    if (!user) {
      alert("you are not logged in first login and then access the features");
      setIsSignInOpen(true);
      return;
    }
    if (!resume) {
      setError('Please upload your resume.');
      return;
    }

    setState('processing');
    setError(null);

    try {
      // Call backend to check limits and register interview start
      // const token = localStorage.getItem('token');
      // const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      // if (token) {
      //   headers['Authorization'] = `Bearer ${token}`;
      // }

      //const API = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      
      const response = await fetch("/api/interviews/start", {
        method: 'POST',
        headers:{"Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },
        credentials: 'include',
      })

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          const text = await response.text();
          console.error("Non-JSON error response from start interview:", text);
          throw new Error(`Server error: ${response.status}`);
        }
        if (errorData.code === 'LIMIT_REACHED') {
          alert(errorData.message);
          setState('landing');
          scrollToSection('pricing');
          return;
        }
        if (errorData.code === 'PLAN_EXPIRED') {
          alert(errorData.message);
          setState('landing');
          scrollToSection('pricing');
          return;
        }
        throw new Error(errorData.message || 'Failed to start interview');
      }

      let data;
      try {
        data = await response.json();
      } catch (e) {
        const text = await response.text();
        console.error("Non-JSON success response from start interview:", text);
        throw new Error("Invalid response from server");
      }
      setMaxDuration(data.maxDuration || 6);

      const rText = await parseFile(resume);
      let jText = '';

      if (jdInputMode === 'file' && jobDescription) {
        jText = await parseFile(jobDescription);
      } else if (jdInputMode === 'text' && manualJdText.trim()) {
        jText = manualJdText;
      }

      setResumeText(rText);
      setJdText(jText || 'General interview based on resume.');
      setState('interview');
    } catch (err: any) {
      setError(err.message || 'Failed to start interview. Please try again.');
      setState('landing');
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };


if (state === 'admin-login') {
  return <AdminLogin onSuccess={() => setState('admin')} />;
}

if (state === 'admin') {
  return <AdminDashboard />;
}


  if (state === 'interview') {
    return (
      <InterviewRoom 
        resumeText={resumeText} 
        jobDescriptionText={jdText} 
        maxDuration={maxDuration}
        onEnd={(t) => {
          setTranscript(t);
          setState('feedback');
        }} 
      />
    );
  }

  if (state === 'feedback') {
    return (
      <FeedbackPage
        transcript={transcript}
        resumeText={resumeText}
        jobDescriptionText={jdText}
        onBack={() => setState('landing')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 blur-[160px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 blur-[160px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-purple-500/5 blur-[200px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-24">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-12 md:mb-24 relative">
          <div className="flex items-center space-x-2 z-50">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold tracking-tight">InterviewPro AI</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-zinc-400">
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button>
            {user && <button onClick={() => scrollToSection('history')} className="hover:text-white transition-colors">History</button>}
            <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Pricing</button>
            <button className="hover:text-white transition-colors">About</button>
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-end">
                  <span className="text-emerald-500 font-bold">Hi, {user.name || user.email.split('@')[0]}</span>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{user.plan} Plan</span>
                </div>
                <button 
                  onClick={signOut}
                  className="px-4 py-2 rounded-full bg-zinc-800 text-white hover:bg-zinc-700 transition-all"
                >
                  Sign Out
                </button>

                <button 
               onClick={() => setState('admin-login')}
               className="px-4 py-2 rounded-full bg-emerald-500 text-black hover:bg-emerald-400"
                >
                Admin
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsSignInOpen(true)}
                className="px-4 py-2 rounded-full bg-white text-black hover:bg-zinc-200 transition-all"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-zinc-400 hover:text-white z-50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Mobile Menu Overlay */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-full left-0 right-0 mt-4 p-6 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl z-40 flex flex-col space-y-4 md:hidden"
              >
                <button onClick={() => scrollToSection('features')} className="text-left py-2 text-zinc-400 hover:text-white transition-colors font-medium">Features</button>
                {user && <button onClick={() => scrollToSection('history')} className="text-left py-2 text-zinc-400 hover:text-white transition-colors font-medium">History</button>}
                <button onClick={() => scrollToSection('pricing')} className="text-left py-2 text-zinc-400 hover:text-white transition-colors font-medium">Pricing</button>
                <button className="text-left py-2 text-zinc-400 hover:text-white transition-colors font-medium">About</button>
                {user ? (
                  <div className="pt-4 border-t border-zinc-800 space-y-4">
                    <div className="flex flex-col">
                      <span className="text-emerald-500 font-bold">Hi, {user.name || user.email.split('@')[0]}</span>
                      <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{user.plan} Plan</span>
                    </div>
                    <button 
                      onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-3 rounded-xl bg-zinc-800 text-white font-bold hover:bg-zinc-700 transition-all"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setIsSignInOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-3 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-all"
                  >
                    Sign In
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Left Column: Content */}
          <div className="space-y-6 md:space-y-8 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 md:mb-6">
                <Zap className="w-3 h-3" />
                <span></span>
              </div> */}

              <h1 className="text-5xl md:text-7xl lg:text-8xl xl:text-8xl font-bold tracking-tighter leading-[0.85] mb-6 md:mb-8">
                PRACTICE <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">PERFECT</span> <br />
                INTERVIEWS
              </h1>
              <p className="text-lg md:text-xl text-zinc-400 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Upload your resume and job description. Get a realistic, AI-powered mock interview tailored specifically to the role you're applying for.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-wrap justify-center lg:justify-start gap-4 md:gap-6"
            >
              <div className="flex items-center space-x-2 text-zinc-500">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-sm font-medium">Privacy Focused</span>
              </div>
              <div className="flex items-center space-x-2 text-zinc-500">
                <Globe className="w-5 h-5" />
                <span className="text-sm font-medium">Global Standards</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Upload Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full opacity-50" />
            <div className="relative bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl">
              <div className="space-y-8">
                <div className="grid gap-6">
                  <FileUploader
                    label="Your Resume"
                    description="PDF, DOCX or TXT (Max 5MB)"
                    file={resume}
                    onFileSelect={setResume}
                  />
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                        Job Description (Optional)
                      </label>
                      <div className="flex bg-zinc-800 rounded-lg p-1">
                        <button
                          onClick={() => setJdInputMode('file')}
                          className={cn(
                            "px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                            jdInputMode === 'file' ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
                          )}
                        >
                          File
                        </button>
                        <button
                          onClick={() => setJdInputMode('text')}
                          className={cn(
                            "px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                            jdInputMode === 'text' ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
                          )}
                        >
                          Text
                        </button>
                      </div>
                    </div>

                    {jdInputMode === 'file' ? (
                      <FileUploader
                        label=""
                        description="The role you're targeting"
                        file={jobDescription}
                        onFileSelect={setJobDescription}
                      />
                    ) : (
                      <textarea
                        value={manualJdText}
                        onChange={(e) => setManualJdText(e.target.value)}
                        placeholder="Paste the job description here..."
                        className="w-full h-32 bg-zinc-900/50 border-2 border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 focus:border-emerald-500/50 focus:outline-none transition-all resize-none"
                      />
                    )}
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleStartInterview}
                  disabled={state === 'processing' || !resume}
                  className={cn(
                    "w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center space-x-3",
                    state === 'processing' || !resume
                      ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                      : "bg-emerald-500 text-black hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  )}
                >
                  {state === 'processing' ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Analyzing Documents...</span>
                    </>
                  ) : (
                    <>
                      <span>Start Mock Interview</span>
                      <ArrowRight className="w-6 h-6" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-zinc-500">
                  By starting, you agree to allow camera and microphone access for the simulation.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <Features />

        {/* History Section (Only for logged in users) */}
        {user && <InterviewHistory />}

        {/* Pricing Section */}
        <Pricing onSignInClick={() => setIsSignInOpen(true)} />
      </main>

      <SignInModal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-900 py-12 text-center text-zinc-600 text-sm">
        <p>&copy; 2026 InterviewPro AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
