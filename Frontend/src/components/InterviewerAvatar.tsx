import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface InterviewerAvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
}

export const InterviewerAvatar: React.FC<InterviewerAvatarProps> = ({ isSpeaking, isListening }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#1e293b_0%,#0f172a_100%)]" />
      </div>

      {/* Professional Interviewer Image - Centered and not too big */}
      <div className="relative z-10 w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-zinc-800 overflow-hidden shadow-2xl bg-zinc-800">
        <img
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop"
          alt="AI Interviewer"
          className="w-full h-full object-cover grayscale-[10%]"
          referrerPolicy="no-referrer"
        />
        
        {/* Speaking Ring */}
        <AnimatePresence>
          {isSpeaking && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 border-4 border-emerald-500 rounded-full animate-pulse"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Status Indicators */}
      <div className="absolute bottom-6 left-6 flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            {isSpeaking ? 'Interviewer Speaking' : 'Interviewer Idle'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-blue-500 animate-pulse' : 'bg-zinc-600'}`} />
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            {isListening ? 'Listening to you' : 'Mic Standby'}
          </span>
        </div>
      </div>

      {/* Voice Waveform Overlay (when speaking) */}
      {isSpeaking && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-end space-x-1 h-8">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                height: [8, Math.random() * 32 + 8, 8],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.05,
              }}
              className="w-1 bg-emerald-500/60 rounded-full"
            />
          ))}
        </div>
      )}
    </div>
  );
};
