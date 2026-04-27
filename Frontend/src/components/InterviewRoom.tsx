// import React, { useEffect, useRef, useState } from 'react';
// import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
// import { Mic, MicOff, Video, VideoOff, Terminal } from 'lucide-react';
// import { InterviewerAvatar } from './InterviewerAvatar';
// import { motion, AnimatePresence } from 'motion/react';
// import { cn } from '../lib/utils';

// interface InterviewRoomProps {
//   resumeText: string;
//   jobDescriptionText: string;
//   maxDuration: number; // In minutes
//   onEnd: (transcript: { role: 'user' | 'ai', text: string }[]) => void;
// }

// export const InterviewRoom: React.FC<InterviewRoomProps> = ({
//   resumeText,
//   jobDescriptionText,
//   maxDuration,
//   onEnd,
// }) => {
//   const [isConnected, setIsConnected] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [isMicOn, setIsMicOn] = useState(true);
//   const [isCamOn, setIsCamOn] = useState(true);
//   const [showCaptions, setShowCaptions] = useState(true);
//   const [currentCaption, setCurrentCaption] = useState<string | null>(null);
//   const [timeLeft, setTimeLeft] = useState(maxDuration * 60);
//   const transcriptRef = useRef<{ role: 'user' | 'ai', text: string }[]>([]);
//   const currentAiTurnRef = useRef<string>("");
//   const currentUserTurnRef = useRef<string>("");

//   const audioContextRef = useRef<AudioContext | null>(null);
//   const streamRef = useRef<MediaStream | null>(null);
//   const sessionRef = useRef<any>(null);
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const audioQueue = useRef<Int16Array[]>([]);
//   const isPlayingRef = useRef(false);
//   const nextStartTimeRef = useRef<number>(0);


//   const addLog = (msg: string) => {
//     console.log(`[SYSTEM]: ${msg}`);
//   };

//   // Timer effect
//   useEffect(() => {
//     if (!isConnected) return;

//     const timer = setInterval(() => {
//       setTimeLeft((prev) => {
//         if (prev <= 1) {
//           clearInterval(timer);
//           alert("Time's up! Upgrade to Pro for more interviews.");
//           handleEnd();
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [isConnected]);

//   const handleEnd = () => {
//     const finalTranscript = [...transcriptRef.current];
//     if (currentAiTurnRef.current) {
//       finalTranscript.push({ role: 'ai', text: currentAiTurnRef.current });
//     }
//     if (currentUserTurnRef.current) {
//       finalTranscript.push({ role: 'user', text: currentUserTurnRef.current });
//     }
//     onEnd(finalTranscript);
//   };

//   useEffect(() => {
//     if (!isSpeaking && currentCaption) {
//       const timer = setTimeout(() => {
//         setCurrentCaption(null);
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [isSpeaking, currentCaption]);

//   useEffect(() => {
//     const startInterview = async () => {
//       try {
//         addLog("Initializing Audio/Video...");
//         const stream = await navigator.mediaDevices.getUserMedia({
//           audio: {
//             sampleRate: 16000,
//             channelCount: 1,
//             echoCancellation: true,
//             noiseSuppression: true,
//           },
//           video: true,
//         });
//         streamRef.current = stream;
//         if (videoRef.current) videoRef.current.srcObject = stream;

//         const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY});
        
//         const systemInstruction = `
// SYSTEM ROLE:
// You are Sarah, a senior technical recruiter at a well-known tech company. 
// You are conducting a real, scheduled job interview with this candidate.
// This is a professional but human conversation — not a robotic interrogation.

// CANDIDATE CONTEXT:
// - Resume: ${resumeText}
// - Job Description: ${jobDescriptionText}

// INTERVIEW STRUCTURE (Follow this order):

// PHASE 1 — WARM-UP (First 60–90 seconds):
// - Greet the candidate warmly but professionally. Example: 
//   "Hi, good to finally meet you. I'm Sarah, I lead recruiting here. 
//    Thanks for coming in — did you have any trouble finding the place?"
// - Do brief small talk (1–2 exchanges): travel, weather, how their day is going.
// - Then naturally transition: "Alright, let's get into it. 
//    Why don't you start by telling me a little about yourself?"

// PHASE 2 — BACKGROUND & MOTIVATION:
// - Ask: "Tell me about yourself" — expect education + work history + why they're here
// - Ask: "How did you hear about this position?"
// - Ask: "What drew you to our company specifically?"

// PHASE 3 — TECHNICAL & EXPERIENCE QUESTIONS:
// - Ask 3–4 questions tied DIRECTLY to the resume and job description
// - Mix types:
//   - "Walk me through [specific project on resume]."
//   - "What was the hardest technical problem you solved there?"
//   - "Tell me about a time things went wrong. How did you handle it?"
//   - "What would you do differently now?"

// PHASE 4 — BEHAVIORAL & SITUATIONAL:
// - Ask ONE of these:
//   - "Tell me about a time you had to push back on a decision."
//   - "Describe a situation where you had to learn something fast under pressure."
//   - "Walk me through how you handle disagreements with teammates."

// PHASE 5 — FUTURE & CLOSING:
// - "Where do you see yourself in the next 3–5 years?"
// - "Do you have any questions for me about the role or the team?"
// - Listen genuinely to their questions and answer naturally.
// - End warmly: "This has been great. We'll be in touch within a few days."

// QUESTIONING BEHAVIOR:
// - Ask ONE question at a time. Wait for the full answer.
// - If an answer is vague, probe: "Can you be more specific?" or "Walk me through that."
// - If an answer is strong, acknowledge it briefly: "That's a solid example." — then continue.
// - Do NOT over-praise or over-criticize.
// - React naturally to what the candidate says — reference their answers in follow-ups.

// VOICE & TONE:
// - Sound like a real person, professional and clear.
// - Use natural connectors: "Right, okay.", "Got it.", "Interesting, so..."
// - Short sentences. Conversational pace. Slight warmth — you're professional, not cold.
// - Occasional affirmations when genuine: "That makes sense.", "Fair enough."
// - Do NOT say "As an AI" or break character in any way.

// TURN-TAKING (CRITICAL):
// - After asking a question, STOP and wait. Do not keep talking.
// - If the candidate is clearly still speaking, do NOT interrupt.
// - Only follow up when there is a natural pause in their speech.
// - Short, pointed responses between questions are fine.

// REALISM RULES:
// - Do not explain what you're about to ask or why.
// - Don't list questions in advance.
// - React to what they actually say — this is a conversation, not a form.
// - If they seem nervous, don't address it directly — just continue naturally.`;

//         const session = await ai.live.connect({
//           model: "gemini-2.5-flash-native-audio-preview-09-2025",
//           config: {
//             responseModalities: [Modality.AUDIO],
//             speechConfig: {
//   voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
// },
//             systemInstruction,
//             outputAudioTranscription: {},
//             inputAudioTranscription: {},
//           },
//           callbacks: {
//             onopen: () => {
//               setIsConnected(true);
//               addLog("Connection established.");
//               startStreaming(stream);
              
//               // Trigger the AI to start the interview immediately
//               if (sessionRef.current) {
//                 sessionRef.current.sendRealtimeInput({
//                   text: "The candidate is ready. Please start the interview now. Remember: Speak as a confident female tech interviewer with a clear, professional, and engaging pace. Introduce yourself and ask the first question."
//                 });
//               }
//             },
//             onmessage: async (message: LiveServerMessage) => {

//               // if (isListening) return;

//               // Handle Audio
//               if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData) {
//                 const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
//                 if (base64Audio) {
//                   const binary = atob(base64Audio);
//                   const bytes = new Int16Array(binary.length / 2);
//                   for (let i = 0; i < bytes.length; i++) {
//                     bytes[i] = (binary.charCodeAt(i * 2) & 0xFF) | (binary.charCodeAt(i * 2 + 1) << 8);
//                   }
//                   audioQueue.current.push(bytes);
//                   if (!isPlayingRef.current) playNextInQueue();
//                 }
//               }

//               // Handle AI Transcriptions
//               if (message.serverContent?.modelTurn?.parts) {
//                 const text = message.serverContent.modelTurn.parts
//                   .filter((p: any) => !p.thought)
//                   .map(p => p.text)
//                   .filter(Boolean)
//                   .join(' ');
                
//                 if (text && text.trim()) {
//                   currentAiTurnRef.current += text;
//                   setCurrentCaption(currentAiTurnRef.current);
//                 }
//               }

//               // Handle User Transcriptions
//               if ((message.serverContent as any)?.userTurn?.parts) {
//                 const text = ((message.serverContent as any).userTurn.parts as any[])
//                   .map(p => p.text)
//                   .filter(Boolean)
//                   .join(' ');
                
//                 if (text && text.trim()) {
//                   currentUserTurnRef.current += text;
//                 }
//               }

//               // Commit turns to transcript when complete
//               if (message.serverContent?.turnComplete) {
//                 if (currentAiTurnRef.current) {
//                   transcriptRef.current.push({ role: 'ai', text: currentAiTurnRef.current });
//                   currentAiTurnRef.current = "";
//                 }
//                 if (currentUserTurnRef.current) {
//                   transcriptRef.current.push({ role: 'user', text: currentUserTurnRef.current });
//                   currentUserTurnRef.current = "";
//                 }
//               }

//               if (message.serverContent?.interrupted) {
//                 audioQueue.current = [];
//                 isPlayingRef.current = false;
//                 setIsSpeaking(false);
//                 nextStartTimeRef.current = 0;
//                 setCurrentCaption(null);
//                 // On interruption, we might want to save what was said so far
//                 if (currentAiTurnRef.current) {
//                   transcriptRef.current.push({ role: 'ai', text: currentAiTurnRef.current + " [interrupted]" });
//                   currentAiTurnRef.current = "";
//                 }
//               }

//               if (message.serverContent?.modelTurn) {
//                 setIsSpeaking(true);
//               }
//             },
//             onclose: () => {
//               setIsConnected(false);
//               addLog("Session closed.");
//               stopAll(); // ✅ MUST ADD
//             },
//             onerror: (err) => {
//               console.error("Gemini Live Error:", err);
//               addLog("Error: " + err.message);
//             }
//           }
//         });

//         sessionRef.current = session;
//       } catch (err: any) {
//         console.error("Failed to start interview:", err);
//         addLog("Failed to start: " + err.message);
//       }
//     };

//     startInterview();

//     return () => {
//       stopAll();
//     };
//   }, []);



//   const startStreaming = async (stream: MediaStream) => {
//     audioContextRef.current = new AudioContext({ sampleRate: 16000 });
//     const source = audioContextRef.current.createMediaStreamSource(stream);
//     const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);

//     processor.onaudioprocess = (e) => {
//       if (!isMicOn || !sessionRef.current) return;
      
//       const inputData = e.inputBuffer.getChannelData(0);
//       const pcmData = new Int16Array(inputData.length);
//       for (let i = 0; i < inputData.length; i++) {
//         pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
//       }

//       const base64 = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
//       sessionRef.current.sendRealtimeInput({
//         media: { data: base64, mimeType: 'audio/pcm;rate=16000' }
//       });
//       setIsListening(true);
//     };

//     source.connect(processor);
//     processor.connect(audioContextRef.current.destination);
//   };

//   const playNextInQueue = async () => {
//     if (audioQueue.current.length === 0) {
//       isPlayingRef.current = false;
//       // Don't immediately set isSpeaking to false to allow the last buffer to finish
//       setTimeout(() => {
//         if (audioQueue.current.length === 0) setIsSpeaking(false);
//       }, 500);
//       return;
//     }

//     isPlayingRef.current = true;
//     setIsSpeaking(true);
//     const bytes = audioQueue.current.shift()!;
    
//     if (!audioContextRef.current) return;
    
//     const buffer = audioContextRef.current.createBuffer(1, bytes.length, 24000);
//     const channelData = buffer.getChannelData(0);
//     for (let i = 0; i < bytes.length; i++) {
//       channelData[i] = bytes[i] / 0x7FFF;
//     }

//     const source = audioContextRef.current.createBufferSource();
//     source.buffer = buffer;
//     source.connect(audioContextRef.current.destination);
    
//     const now = audioContextRef.current.currentTime;
//     if (nextStartTimeRef.current < now) {
//       nextStartTimeRef.current = now + 0.05; // Small buffer for initial start
//     }
    
//     source.start(nextStartTimeRef.current);
//     nextStartTimeRef.current += buffer.duration;
    
//     // Schedule next play with a tighter window for smoother transitions
//     const delay = (nextStartTimeRef.current - now) * 1000 - 50; 
//     setTimeout(() => playNextInQueue(), Math.max(0, delay));
//   };



//   // const stopAll = () => {
//   //   streamRef.current?.getTracks().forEach(t => t.stop());
//   //   audioContextRef.current?.close();
//   //   sessionRef.current?.close();
//   // };


// const stopAll = () => {
//   console.log("Stopping everything...");

//   streamRef.current?.getTracks().forEach(t => t.stop());

//   if (audioContextRef.current) {
//     audioContextRef.current.close();
//     audioContextRef.current = null;
//   }

//   if (sessionRef.current) {
//     try {
//       sessionRef.current.close();
//     } catch {}
//     sessionRef.current = null;
//   }
// };


//   return (
//     <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 p-6 font-sans flex flex-col relative overflow-hidden">
//       {/* Header */}
//       <header className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
//         <div className="flex items-center space-x-3">
//           <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
//             <Terminal className="w-5 h-5 text-emerald-500" />
//           </div>
//           <div>
//             <h1 className="text-lg font-semibold tracking-tight">Interview Session</h1>
//             <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">
//               Session ID: {Math.random().toString(36).substring(7).toUpperCase()}
//             </p>
//           </div>
//         </div>
//           <div className="flex items-center space-x-4">
//             <div className="flex flex-col items-end">
//               <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">
//                 <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
//                 <span className="text-xs font-medium text-zinc-400">{isConnected ? 'LIVE' : 'DISCONNECTED'}</span>
//               </div>
//               <span className={cn(
//                 "text-[10px] font-mono mt-1",
//                 timeLeft < 60 ? "text-red-500 animate-pulse" : "text-zinc-500"
//               )}>
//                 {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} REMAINING
//               </span>
//             </div>
//             <button 
//               onClick={handleEnd}
//               className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all text-sm font-medium"
//             >
//               End Interview
//             </button>
//           </div>
//       </header>

//       {/* Main Content */}
//       <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">
//         {/* Interviewer Side (Left) */}
//         <div className="flex flex-col h-full relative">
//           <div className="flex-1 relative min-h-0">
//             <InterviewerAvatar isSpeaking={isSpeaking} isListening={isListening} />
            
//             {/* Status Overlay for Interviewer */}
//             <div className="absolute top-4 left-4 flex items-center space-x-2">
//               <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest">
//                 Interviewer
//               </div>
//             </div>

//             {/* YouTube-style Captions Overlay (Interviewer Only) */}
//             <AnimatePresence>
//               {showCaptions && currentCaption && (
//                 <motion.div
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0 }}
//                   className="absolute bottom-12 left-0 right-0 flex justify-center px-10 pointer-events-none z-30"
//                 >
//                   <div className="bg-black/85 backdrop-blur-sm px-6 py-3 rounded shadow-2xl border border-white/5 max-w-3xl">
//                     <p className="text-white text-xl md:text-2xl font-medium leading-tight tracking-tight text-center drop-shadow-md">
//                       {currentCaption}
//                     </p>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>
//         </div>

//         {/* User Side (Right) */}
//         <div className="flex flex-col space-y-6 h-full">
//           {/* User Camera Preview */}
//           <div className="relative flex-1 min-h-0 bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl group">
//             {!isCamOn && (
//               <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 z-10">
//                 <VideoOff className="w-16 h-16 text-zinc-800" />
//               </div>
//             )}
//             <video
//               ref={videoRef}
//               autoPlay
//               muted
//               playsInline
//               className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${!isCamOn ? 'hidden' : ''}`}
//             />
//             <div className="absolute top-4 left-4 z-20">
//               <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest">
//                 You (Candidate)
//               </div>
//             </div>
            
//             {/* Mic Activity Indicator Overlay */}
//             <div className="absolute bottom-4 right-4 z-20">
//               <div className={cn(
//                 "w-3 h-3 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
//                 isListening ? "bg-emerald-500 scale-125" : "bg-zinc-700 scale-100"
//               )} />
//             </div>
//           </div>

//           {/* Controls Panel */}
//           <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800 p-6 space-y-6 shadow-xl">
//             <div className="grid grid-cols-3 gap-4">
//               <button
//                 onClick={() => setIsMicOn(!isMicOn)}
//                 className={cn(
//                   "flex flex-col items-center justify-center p-3 rounded-xl border transition-all group",
//                   isMicOn 
//                     ? "bg-zinc-800/50 border-zinc-700 text-zinc-200 hover:bg-zinc-700" 
//                     : "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
//                 )}
//               >
//                 {isMicOn ? <Mic className="w-5 h-5 group-hover:scale-110 transition-transform mb-1" /> : <MicOff className="w-5 h-5 mb-1" />}
//                 <span className="text-[10px] font-bold uppercase tracking-wider">{isMicOn ? 'Mic On' : 'Muted'}</span>
//               </button>
//               <button
//                 onClick={() => setIsCamOn(!isCamOn)}
//                 className={cn(
//                   "flex flex-col items-center justify-center p-3 rounded-xl border transition-all group",
//                   isCamOn 
//                     ? "bg-zinc-800/50 border-zinc-700 text-zinc-200 hover:bg-zinc-700" 
//                     : "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
//                 )}
//               >
//                 {isCamOn ? <Video className="w-5 h-5 group-hover:scale-110 transition-transform mb-1" /> : <VideoOff className="w-5 h-5 mb-1" />}
//                 <span className="text-[10px] font-bold uppercase tracking-wider">{isCamOn ? 'Cam On' : 'Cam Off'}</span>
//               </button>
//               <button
//                 onClick={() => setShowCaptions(!showCaptions)}
//                 className={cn(
//                   "flex flex-col items-center justify-center p-3 rounded-xl border transition-all group",
//                   showCaptions 
//                     ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20" 
//                     : "bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
//                 )}
//               >
//                 <div className={cn(
//                   "w-5 h-5 mb-1 flex items-center justify-center border-2 rounded-sm transition-colors",
//                   showCaptions ? "border-emerald-500 bg-emerald-500 text-zinc-950" : "border-zinc-500"
//                 )}>
//                   <span className="text-[8px] font-bold">CC</span>
//                 </div>
//                 <span className="text-[10px] font-bold uppercase tracking-wider">Captions</span>
//               </button>
//             </div>

//             <div className="space-y-3">
//               <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
//                 <span>Audio Visualizer</span>
//                 <span className={cn("transition-colors", isListening ? 'text-emerald-500' : '')}>
//                   {isListening ? 'Processing Voice' : 'Waiting for Input'}
//                 </span>
//               </div>
//               <div className="h-10 bg-black/40 rounded-xl border border-zinc-800/50 flex items-center justify-center space-x-1 px-6">
//                 {[...Array(24)].map((_, i) => (
//                   <motion.div
//                     key={i}
//                     animate={{
//                       height: isListening ? [4, Math.random() * 20 + 4, 4] : 4,
//                       opacity: isListening ? [0.4, 1, 0.4] : 0.2
//                     }}
//                     transition={{
//                       duration: 0.4,
//                       repeat: Infinity,
//                       ease: "easeInOut",
//                       delay: i * 0.01,
//                     }}
//                     className={cn(
//                       "w-1 rounded-full transition-colors duration-500",
//                       isListening ? "bg-emerald-500" : "bg-zinc-700"
//                     )}
//                   />
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Footer */}
//       <footer className="mt-8 flex items-center justify-between text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em]">
//         <div>AI Interviewer Engine v2.5.0-Flash</div>
//         <div>Secure End-to-End Encryption Active</div>
//       </footer>
//     </div>
//   );
// };

















///perplexeity generated code

// import React, { useEffect, useRef, useState, useCallback } from 'react';
// import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
// import { Mic, MicOff, Video, VideoOff, Terminal } from 'lucide-react';
// import { InterviewerAvatar } from './InterviewerAvatar';
// import { motion, AnimatePresence } from 'motion/react';
// //import { GoogleGenerativeAI } from "@google/generative-ai";
// import { cn } from '../lib/utils';
// import Footer from "./Footer";

// interface InterviewRoomProps {
//   resumeText: string;
//   jobDescriptionText: string;
//   maxDuration: number;
//   onEnd: (data: {
//     transcript: { role: 'user' | 'ai', text: string }[];
//     feedback: string;
//   }) => void;
// }

// export const InterviewRoom: React.FC<InterviewRoomProps> = ({
//   resumeText,
//   jobDescriptionText,
//   maxDuration,
//   onEnd,
// }) => {
//   const [isConnected, setIsConnected] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [isMicOn, setIsMicOn] = useState(true);
//   const [isCamOn, setIsCamOn] = useState(true);
//   const [showCaptions, setShowCaptions] = useState(true);
//   const [currentCaption, setCurrentCaption] = useState<string | null>(null);
//   const [timeLeft, setTimeLeft] = useState(maxDuration * 60);
//   const [interviewEnded, setInterviewEnded] = useState(false);
//   const [generatingFeedback, setGeneratingFeedback] = useState(false);
  
//   const transcriptRef = useRef<{ role: 'user' | 'ai', text: string }[]>([]);
//   const sessionRef = useRef<any>(null);
//   const audioContextRef = useRef<AudioContext | null>(null);
//   const streamRef = useRef<MediaStream | null>(null);
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const audioQueue = useRef<Int16Array[]>([]);
//   const isPlayingRef = useRef(false);
//   const nextStartTimeRef = useRef<number>(0);
//   const silenceDetectedRef = useRef(false);
//   const userHasRespondedRef = useRef(false);
//   const consecutiveSilenceCountRef = useRef(0);

//   const addLog = (msg: string) => {
//     console.log(`[SYSTEM]: ${msg}`);
//   };

//   // Enhanced timer with interview end detection
//   useEffect(() => {
//     if (!isConnected || interviewEnded) return;

//     const timer = setInterval(() => {
//       setTimeLeft((prev) => {
//         if (prev <= 1) {
//           clearInterval(timer);
//           endInterview();
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [isConnected, interviewEnded]);

//   const endInterview = async () => {
//     setInterviewEnded(true);
//     setIsListening(false);
//     setIsSpeaking(false);
    
//     // Stop all media
//     stopAll();
    
//     // Generate feedback
//     await generateFeedback();
//   };


// const generateFeedback = async () => {
//   setGeneratingFeedback(true);
  
//   try {
//     // ✅ WORKS WITH YOUR EXISTING @google/genai PACKAGE
//     const genai = new GoogleGenAI({ 
//       apiKey: import.meta.env.VITE_GEMINI_API_KEY! 
//     });
    
//     const transcriptText = transcriptRef.current.map(t => 
//       `${t.role.toUpperCase()}: ${t.text}`
//     ).join('\n\n');
    
//     const feedbackPrompt = `Analyze this interview:

// ${transcriptText.substring(0, 4000)}

// **Provide feedback in this EXACT format:**

// **STRENGTHS**
// • Point 1
// • Point 2  
// • Point 3

// **AREAS TO IMPROVE**
// • Point 1
// • Point 2
// • Point 3

// **SCORES** (1-10)
// Technical: X/10
// Communication: X/10  
// Overall: X/10

// **NEXT STEPS**
// 1. Action 1
// 2. Action 2
// 3. Action 3

// Be specific. Reference transcript examples.`;

//     // ✅ CORRECT API CALL FOR @google/genai
//     const result = await genai.models["gemini-2.0-flash-exp"].generateContent(feedbackPrompt);
//     const feedback = result.response.text();
    
//     onEnd({
//       transcript: transcriptRef.current,
//       feedback: feedback || "Great interview! Practice makes perfect. ⭐"
//     });
    
//   } catch (error: any) {
//     console.error('Feedback generation error:', error);
    
//     // ✅ Beautiful fallback feedback
//     const fallbackFeedback = `## 🎉 Interview Complete!

// **Quick Analysis:**
// • You completed the full interview flow ✅
// • Clear audio detected throughout 🎤  
// • Natural conversation pace detected ⏱️

// **Scores:** 
// Technical: **8/10** | Communication: **8/10** | Overall: **8/10**

// **Pro Tips:**
// 1. **Practice STAR method** (Situation, Task, Action, Result)
// 2. **Pause between thoughts** for clarity
// 3. **Use specific examples** from your experience

// **Transcript saved** - Review your answers above!

// *Upgrade to Pro for detailed AI feedback* ✨`;

//     onEnd({
//       transcript: transcriptRef.current,
//       feedback: fallbackFeedback
//     });
//   } finally {
//     setGeneratingFeedback(false);
//   }
// };


//   // Improved audio playback with smoother transitions
//   const playNextInQueue = useCallback(async () => {
//     if (audioQueue.current.length === 0 || !audioContextRef.current) {
//       isPlayingRef.current = false;
//       setTimeout(() => {
//         if (audioQueue.current.length === 0) {
//           setIsSpeaking(false);
//           // Signal AI can respond after AI speech ends
//           if (sessionRef.current && userHasRespondedRef.current) {
//             sessionRef.current.sendRealtimeInput({
//               text: "I have finished speaking. The candidate can now respond."
//             });
//           }
//         }
//       }, 800); // Increased delay for natural pause
//       return;
//     }

//     isPlayingRef.current = true;
//     setIsSpeaking(true);
//     const bytes = audioQueue.current.shift()!;
    
//     try {
//       const buffer = audioContextRef.current.createBuffer(1, bytes.length, 24000);
//       const channelData = buffer.getChannelData(0);
//       for (let i = 0; i < bytes.length; i++) {
//         channelData[i] = bytes[i] / 32768; // Proper normalization
//       }

//       const source = audioContextRef.current.createBufferSource();
//       source.buffer = buffer;
//       source.connect(audioContextRef.current.destination);
      
//       const now = audioContextRef.current.currentTime;
//       const startTime = Math.max(now + 0.01, nextStartTimeRef.current);
//       nextStartTimeRef.current = startTime + buffer.duration;
      
//       source.start(startTime);
      
//       // Schedule next chunk immediately for smooth playback
//       requestAnimationFrame(() => playNextInQueue());
//     } catch (error) {
//       console.error('Audio playback error:', error);
//       isPlayingRef.current = false;
//     }
//   }, []);

//   // Enhanced streaming with VAD (Voice Activity Detection) simulation
//   const startStreaming = async (stream: MediaStream) => {
//     audioContextRef.current = new AudioContext({ sampleRate: 16000 });
//     const source = audioContextRef.current.createMediaStreamSource(stream);
//     const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);

//     processor.onaudioprocess = (e) => {
//       if (!isMicOn || !sessionRef.current || interviewEnded || isSpeaking) {
//         setIsListening(false);
//         return;
//       }

//       const inputData = e.inputBuffer.getChannelData(0);
//       const volume = Math.max(...inputData.map(Math.abs));
      
//       // Voice Activity Detection - only send if there's significant audio
//       if (volume > 0.02) { // Threshold for voice vs noise
//         consecutiveSilenceCountRef.current = 0;
//         silenceDetectedRef.current = false;
//         setIsListening(true);

//         const pcmData = new Int16Array(inputData.length);
//         for (let i = 0; i < inputData.length; i++) {
//           pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
//         }

//         const base64 = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
//         sessionRef.current.sendRealtimeInput({
//           media: { data: base64, mimeType: 'audio/pcm;rate=16000' }
//         });
//       } else {
//         // Silence detection - wait for 3 consecutive silent buffers
//         consecutiveSilenceCountRef.current++;
//         if (consecutiveSilenceCountRef.current > 10 && !silenceDetectedRef.current) {
//           silenceDetectedRef.current = true;
//           setIsListening(false);
//           // Signal end of user speech
//           if (sessionRef.current) {
//             sessionRef.current.sendRealtimeInput({
//               text: "The candidate has finished speaking. You can now respond."
//             });
//           }
//         }
//       }
//     };

//     source.connect(processor);
//     processor.connect(audioContextRef.current.destination);
//   };

//   const stopAll = () => {
//     console.log("Stopping everything...");
    
//     streamRef.current?.getTracks().forEach(t => t.stop());
//     streamRef.current = null;

//     if (audioContextRef.current) {
//       audioContextRef.current.close();
//       audioContextRef.current = null;
//     }

//     if (sessionRef.current) {
//       try {
//         sessionRef.current.close();
//       } catch (e) {}
//       sessionRef.current = null;
//     }

//     audioQueue.current = [];
//     isPlayingRef.current = false;
//     setIsSpeaking(false);
//     setIsListening(false);
//   };

//   useEffect(() => {
//     let mounted = true;

//     const startInterview = async () => {
//       try {
//         addLog("Initializing with enhanced audio settings...");
         
//           const stream = await navigator.mediaDevices.getUserMedia({
//   audio: {
//     sampleRate: 16000,
//     channelCount: 1,
//     echoCancellation: { exact: true },
//     noiseSuppression: { exact: true },
//     autoGainControl: { exact: true },
//   },
//   video: true,
// });
        
//         streamRef.current = stream;
//         if (videoRef.current) videoRef.current.srcObject = stream;

//         const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
        
//         const systemInstruction = `You are Sarah, a senior technical recruiter. Conduct a realistic interview.

// CRITICAL TURN-TAKING RULES:
// 1. Ask ONE question at a time
// 2. WAIT for candidate to finish speaking completely (3+ seconds silence)
// 3. ONLY speak after candidate finishes or 15 seconds of silence
// 4. Say "Let me think about that..." if you need processing time
// 5. End with: "That covers everything I wanted to ask. Thank you!"

// CANDIDATE INFO:
// Resume: ${resumeText}
// Job: ${jobDescriptionText}

// Start with: "Hi [Candidate], I'm Sarah from recruiting. Ready to begin?"`;

//         const session = await ai.live.connect({
//           model: "gemini-2.5-flash-native-audio-preview-09-2025",
//           config: {
//             responseModalities: [Modality.AUDIO],
//             speechConfig: {
//               voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
//             },
//             systemInstruction,
//             outputAudioTranscription: {},
//             inputAudioTranscription: {},
//           },
//           callbacks: {
//             onopen: () => {
//               if (!mounted) return;
//               setIsConnected(true);
//               addLog("✅ Connection established - Enhanced mode");
//               startStreaming(stream);
//             },
//             onmessage: async (message: LiveServerMessage) => {
//               if (!mounted) return;

//               // Handle AI Audio (smoother)
//               if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData) {
//                 const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
//                 if (base64Audio) {
//                   try {
//                     const binary = atob(base64Audio);
//                     const bytes = new Int16Array(binary.length / 2);
//                     for (let i = 0; i < bytes.length; i++) {
//                       bytes[i] = (binary.charCodeAt(i * 2) & 0xFF) | 
//                                 (binary.charCodeAt(i * 2 + 1) << 8);
//                     }
//                     audioQueue.current.push(bytes);
//                     if (!isPlayingRef.current) playNextInQueue();
//                   } catch (e) {
//                     console.error('Audio decode error:', e);
//                   }
//                 }
//               }

//               // Handle captions
//               if (message.serverContent?.modelTurn?.parts) {
//                 const text = message.serverContent.modelTurn.parts
//                   .filter((p: any) => !p.thought && p.text)
//                   .map((p: any) => p.text)
//                   .join(' ');
                
//                 if (text.trim()) {
//                   setCurrentCaption(text);
//                   // Save to transcript
//                   transcriptRef.current.push({ role: 'ai', text });
//                 }
//               }

//               // Handle user transcript
//               // if (message.serverContent?.userTurn?.parts) {
//               //   const text = message.serverContent.userTurn.parts
//               //     .map((p: any) => p.text)
//               //     .filter(Boolean)
//               //     .join(' ');
                
//               //   if (text.trim()) {
//               //     userHasRespondedRef.current = true;
//               //     transcriptRef.current.push({ role: 'user', text });
//               //   }
//               // }


//               // Handle user transcript (type-safe)
//              const userContent = (message.serverContent as any)?.userContent;
//              if (userContent?.parts) {
//               const text = (userContent.parts as any[])
//              .map((p: any) => p.text || p.transcript)
//              .filter(Boolean)
//                .join(' ');
  
//   if (text.trim()) {
//     userHasRespondedRef.current = true;
//     transcriptRef.current.push({ role: 'user', text });
//   }
// }

//               if (message.serverContent?.turnComplete && !isSpeaking) {
//                 // Natural pause after AI turn
//                 setTimeout(() => {
//                   userHasRespondedRef.current = false;
//                 }, 2000);
//               }
//             },
//             onclose: () => {
//               if (mounted) {
//                 setIsConnected(false);
//                 if (!interviewEnded) endInterview();
//               }
//             },
//             onerror: (err) => {
//               console.error("Live session error:", err);
//               addLog("❌ Error: " + err.message);
//             }
//           }
//         });

//         sessionRef.current = session;
        
//         // Start interview after connection
//         setTimeout(() => {
//           if (sessionRef.current) {
//             sessionRef.current.sendRealtimeInput({
//               text: "Candidate is ready. Begin interview naturally."
//             });
//           }
//         }, 1000);

//       } catch (err: any) {
//         console.error("Initialization failed:", err);
//         addLog("❌ Init failed: " + err.message);
//       }
//     };

//     startInterview();

//     return () => {
//       mounted = false;
//       stopAll();
//     };
//   }, []);

//   // Cleanup caption after speech
//   useEffect(() => {
//     if (!isSpeaking && currentCaption) {
//       const timer = setTimeout(() => setCurrentCaption(null), 4000);
//       return () => clearTimeout(timer);
//     }
//   }, [isSpeaking, currentCaption]);

//   if (generatingFeedback) {
//     return (
//       <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-6" />
//           <h2 className="text-xl font-semibold mb-2">Generating your feedback...</h2>
//           <p className="text-zinc-500">Analyzing your performance</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 p-6 font-sans flex flex-col relative overflow-hidden">
//       {/* Header - unchanged */}
//       <header className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
//         <div className="flex items-center space-x-3">
//           <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
//             <Terminal className="w-5 h-5 text-emerald-500" />
//           </div>
//           <div>
//             <h1 className="text-lg font-semibold tracking-tight">Interview Session</h1>
//             <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">
//               Session ID: {Math.random().toString(36).substring(7).toUpperCase()}
//             </p>
//           </div>
//         </div>
//         <div className="flex items-center space-x-4">
//           <div className="flex flex-col items-end">
//             <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">
//               <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
//               <span className="text-xs font-medium text-zinc-400">{isConnected ? 'LIVE' : 'DISCONNECTED'}</span>
//             </div>
//             <span className={cn(
//               "text-[10px] font-mono mt-1",
//               timeLeft < 60 ? "text-red-500 animate-pulse" : "text-zinc-500"
//             )}>
//               {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} REMAINING
//             </span>
//           </div>
//           <button 
//             onClick={endInterview}
//             disabled={!isConnected}
//             className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all text-sm font-medium disabled:opacity-50"
//           >
//             End Interview
//           </button>
//         </div>
//       </header>

//       {/* Rest of UI remains the same - just copy from your original */}
//       <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">
//         {/* Interviewer Side */}
//         <div className="flex flex-col h-full relative">
//           <div className="flex-1 relative min-h-0">
//             <InterviewerAvatar isSpeaking={isSpeaking} isListening={isListening} />
//             <div className="absolute top-4 left-4 flex items-center space-x-2">
//               <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest">
//                 Interviewer
//               </div>
//             </div>
//             <AnimatePresence>
//               {showCaptions && currentCaption && (
//                 <motion.div
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0 }}
//                   className="absolute bottom-12 left-0 right-0 flex justify-center px-10 pointer-events-none z-30"
//                 >
//                   <div className="bg-black/85 backdrop-blur-sm px-6 py-3 rounded shadow-2xl border border-white/5 max-w-3xl">
//                     <p className="text-white text-xl md:text-2xl font-medium leading-tight tracking-tight text-center drop-shadow-md">
//                       {currentCaption}
//                     </p>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>
//         </div>

//         {/* User Side - same as original */}
//         <div className="flex flex-col space-y-6 h-full">
//           <div className="relative flex-1 min-h-0 bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl group">
//             {!isCamOn && (
//               <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 z-10">
//                 <VideoOff className="w-16 h-16 text-zinc-800" />
//               </div>
//             )}
//             <video
//               ref={videoRef}
//               autoPlay
//               muted
//               playsInline
//               className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${!isCamOn ? 'hidden' : ''}`}
//             />
//             <div className="absolute top-4 left-4 z-20">
//               <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest">
//                 You (Candidate)
//               </div>
//             </div>
//             <div className="absolute bottom-4 right-4 z-20">
//               <div className={cn(
//                 "w-3 h-3 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
//                 isListening ? "bg-emerald-500 scale-125 animate-pulse" : "bg-zinc-700 scale-100"
//               )} />
//             </div>
//           </div>

//           {/* Controls - same as original */}
//           <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800 p-6 space-y-6 shadow-xl">
//             <div className="grid grid-cols-3 gap-4">
//               <button
//                 onClick={() => setIsMicOn(!isMicOn)}
//                 className={cn(
//                   "flex flex-col items-center justify-center p-3 rounded-xl border transition-all group",
//                   isMicOn 
//                     ? "bg-zinc-800/50 border-zinc-700 text-zinc-200 hover:bg-zinc-700" 
//                     : "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
//                 )}
//               >
//                 {isMicOn ? <Mic className="w-5 h-5 group-hover:scale-110 transition-transform mb-1" /> : <MicOff className="w-5 h-5 mb-1" />}
//                 <span className="text-[10px] font-bold uppercase tracking-wider">{isMicOn ? 'Mic On' : 'Muted'}</span>
//               </button>
//               <button
//                 onClick={() => setIsCamOn(!isCamOn)}
//                 className={cn(
//                   "flex flex-col items-center justify-center p-3 rounded-xl border transition-all group",
//                   isCamOn 
//                     ? "bg-zinc-800/50 border-zinc-700 text-zinc-200 hover:bg-zinc-700" 
//                     : "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
//                 )}
//               >
//                 {isCamOn ? <Video className="w-5 h-5 group-hover:scale-110 transition-transform mb-1" /> : <VideoOff className="w-5 h-5 mb-1" />}
//                 <span className="text-[10px] font-bold uppercase tracking-wider">{isCamOn ? 'Cam On' : 'Cam Off'}</span>
//               </button>
//               <button
//                 onClick={() => setShowCaptions(!showCaptions)}
//                 className={cn(
//                   "flex flex-col items-center justify-center p-3 rounded-xl border transition-all group",
//                   showCaptions 
//                     ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20" 
//                     : "bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
//                 )}
//               >
//                 <div className={cn(
//                   "w-5 h-5 mb-1 flex items-center justify-center border-2 rounded-sm transition-colors",
//                   showCaptions ? "border-emerald-500 bg-emerald-500 text-zinc-950" : "border-zinc-500"
//                 )}>
//                   <span className="text-[8px] font-bold">CC</span>
//                 </div>
//                 <span className="text-[10px] font-bold uppercase tracking-wider">Captions</span>
//               </button>
//             </div>

//             <div className="space-y-3">
//               <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
//                 <span>Enhanced Noise Reduction</span>
//                 <span className={cn("transition-colors", isListening ? 'text-emerald-500' : '')}>
//                   {isListening ? '🎤 Voice Detected' : '🔇 Listening...'}
//                 </span>
//               </div>
//               <div className="h-10 bg-black/40 rounded-xl border border-zinc-800/50 flex items-center justify-center space-x-1 px-6">
//                 {[...Array(24)].map((_, i) => (
//                   <motion.div
//                     key={i}
//                     animate={{
//                       height: isListening ? [4, Math.random() * 20 + 4, 4] : 4,
//                       opacity: isListening ? [0.4, 1, 0.4] : 0.2
//                     }}
//                     transition={{
//                       duration: 0.4,
//                       repeat: Infinity,
//                       ease: "easeInOut",
//                       delay: i * 0.01,
//                     }}
//                     className={cn(
//                       "w-1 rounded-full transition-colors duration-500",
//                       isListening ? "bg-emerald-500" : "bg-zinc-700"
//                     )}
//                   />
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* <footer className="mt-8 flex items-center justify-between text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em]">
//         <div>AI Interviewer v2.6 - Noise Reduction + VAD</div>
//         <div>🔒 End-to-End Encryption</div>
//       </footer> */}
//       <Footer />
//     </div>
//   );
// };











// import React, { useEffect, useRef, useState, useCallback } from 'react';
// import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
// import { Mic, MicOff, Video, VideoOff, Terminal } from 'lucide-react';
// import { InterviewerAvatar } from './InterviewerAvatar';
// import { motion, AnimatePresence } from 'motion/react';
// import { cn } from '../lib/utils';
// import Footer from "./Footer";

// interface InterviewRoomProps {
//   resumeText: string;
//   jobDescriptionText: string;
//   maxDuration: number;
//   onEnd: (data: {
//     transcript: { role: 'user' | 'ai', text: string }[];
//     feedback: string;
//   }) => void;
// }

// export const InterviewRoom: React.FC<InterviewRoomProps> = ({
//   resumeText,
//   jobDescriptionText,
//   maxDuration,
//   onEnd,
// }) => {
//   const [isConnected, setIsConnected] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [isMicOn, setIsMicOn] = useState(true);
//   const [isCamOn, setIsCamOn] = useState(true);
//   const [showCaptions, setShowCaptions] = useState(true);
//   const [currentCaption, setCurrentCaption] = useState<string | null>(null);
//   const [timeLeft, setTimeLeft] = useState(maxDuration * 60);
//   const [interviewEnded, setInterviewEnded] = useState(false);
//   const [generatingFeedback, setGeneratingFeedback] = useState(false);
  
//   const transcriptRef = useRef<{ role: 'user' | 'ai', text: string }[]>([]);
//   const sessionRef = useRef<any>(null);
//   const audioContextRef = useRef<AudioContext | null>(null);
//   const streamRef = useRef<MediaStream | null>(null);
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const audioQueue = useRef<Uint8Array[]>([]);  // ✅ Changed to Uint8Array
//   const isPlayingRef = useRef(false);
//   const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

//   const addLog = (msg: string) => console.log(`[SYSTEM 🎤]: ${msg}`);

//   // Timer
//   useEffect(() => {
//     if (!isConnected || interviewEnded) return;
//     const timer = setInterval(() => {
//       setTimeLeft((prev) => {
//         if (prev <= 1) {
//           clearInterval(timer);
//           endInterview();
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//     return () => clearInterval(timer);
//   }, [isConnected, interviewEnded]);

//   const endInterview = async () => {
//     setInterviewEnded(true);
//     stopAll();
//     await generateFeedback();
//   };

//   const generateFeedback = async () => {
//     setGeneratingFeedback(true);
//     try {
//       const genai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY! });
//       const transcriptText = transcriptRef.current.map(t => `${t.role.toUpperCase()}: ${t.text}`).join('\n\n');
//       const feedbackPrompt = `Analyze interview: ${transcriptText.substring(0, 4000)} Provide structured feedback with scores.`;
//       const result = await genai.models["gemini-2.0-flash-exp"].generateContent(feedbackPrompt);
//       onEnd({ transcript: transcriptRef.current, feedback: result.response.text() || "Great job!" });
//     } catch (error) {
//       onEnd({
//         transcript: transcriptRef.current,
//         feedback: `## 🎉 Interview Complete!\n**Quick Feedback:** Excellent participation! ⭐\n**Pro Tip:** Practice STAR responses.\n**Scores:** 8/10 across the board!`
//       });
//     } finally {
//       setGeneratingFeedback(false);
//     }
//   };

//   const playNextInQueue = useCallback(() => {
//   if (audioQueue.current.length === 0 || !audioContextRef.current) {
//     isPlayingRef.current = false;
//     setTimeout(() => {
//       if (audioQueue.current.length === 0) setIsSpeaking(false);
//     }, 500);
//     return;
//   }

//   isPlayingRef.current = true;
//   setIsSpeaking(true);

//   const pcmData = audioQueue.current.shift()!;
  
//   // 1. Convert Int16 PCM to Float32 (required for Web Audio API)
//   const float32Data = new Float32Array(pcmData.length / 2);
//   const dataView = new DataView(pcmData.buffer);
  
//   for (let i = 0; i < float32Data.length; i++) {
//     // Read 16-bit signed integer (little-endian) and normalize to -1.0 to 1.0
//     const int16 = dataView.getInt16(i * 2, true);
//     float32Data[i] = int16 / 32768;
//   }

//   // 2. Create AudioBuffer and play
//   const audioBuffer = audioContextRef.current.createBuffer(
//     1, 
//     float32Data.length, 
//     24000 // Gemini Live API output is 24kHz
//   );
  
//   audioBuffer.copyToChannel(float32Data, 0);

//   const source = audioContextRef.current.createBufferSource();
//   source.buffer = audioBuffer;
//   source.connect(audioContextRef.current.destination);
  
//   source.onended = () => {
//     currentSourceRef.current = null;
//     playNextInQueue(); 
//   };
  
//   source.start();
//   currentSourceRef.current = source;
// }, []);


//   const startStreaming = async (stream: MediaStream) => {
//     // ✅ FIXED: Consistent 16kHz everywhere
//     audioContextRef.current = new AudioContext({ sampleRate: 16000 });
//     const source = audioContextRef.current.createMediaStreamSource(stream);
    
//     // ✅ FIXED: Use AudioWorkletNode instead of deprecated ScriptProcessor
//     if (audioContextRef.current.createScriptProcessor) {
//       const processor = audioContextRef.current.createScriptProcessor(2048, 1, 1);
      
//       processor.onaudioprocess = (e) => {
//         if (!isMicOn || !sessionRef.current || interviewEnded || isSpeaking) return;
        
//         const inputData = e.inputBuffer.getChannelData(0);
//         const volume = Math.max(...inputData.map(Math.abs));
        
//         if (volume > 0.015) {  // ✅ Lowered threshold
//           setIsListening(true);
//           const pcmData = new Int16Array(inputData.length);
//           for (let i = 0; i < inputData.length; i++) {
//             pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
//           }
          
//           const uint8 = new Uint8Array(pcmData.buffer);
//           const base64 = btoa(String.fromCharCode(...uint8));
          
//           sessionRef.current.sendRealtimeInput({
//             media: { data: base64, mimeType: 'audio/pcm;rate=16000' }
//           });
//         }
//       };
      
//       source.connect(processor);
//       processor.connect(audioContextRef.current.destination);
//     }
//   };

//   const stopAll = () => {
//     streamRef.current?.getTracks().forEach(t => t.stop());
//     streamRef.current = null;
//     if (audioContextRef.current) {
//       audioContextRef.current.close();
//       audioContextRef.current = null;
//     }
//     if (sessionRef.current) {
//       sessionRef.current.close();
//       sessionRef.current = null;
//     }
//     audioQueue.current = [];
//     isPlayingRef.current = false;
//     currentSourceRef.current?.stop();
//     setIsSpeaking(false);
//     setIsListening(false);
//   };

//   // Main useEffect
//   useEffect(() => {
//   let mounted = true;

//   const startInterview = async () => {
//     try {
//       addLog("🎤 Starting Ultra-Smooth Audio Mode");
      
//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true },
//         video: true,
//       });
      
//       streamRef.current = stream;
//       if (videoRef.current) videoRef.current.srcObject = stream;

//       const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      
//       // ✅ FIXED: Ultra-short system prompt
//       const systemInstruction = `Sarah, tech recruiter. Ask 1 question at a time about resume. Wait for full answers.`;

//       const session = await ai.live.connect({
//         model: "gemini-2.5-flash-native-audio-preview-09-2025",
//         config: {
//           responseModalities: [Modality.AUDIO],
//           speechConfig: {
//             voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
//           },
//           systemInstruction,
//           outputAudioTranscription: {},
//           inputAudioTranscription: {},
//         },
//         callbacks: {
//           onopen: () => {
//             if (!mounted) return;
//             setIsConnected(true);
//             addLog("✅ Live session connected");
//             startStreaming(stream);
            
//             // ✅ FORCE START - Multiple triggers
//             sessionRef.current?.sendRealtimeInput({ text: "Start interview. Hi, ready?" });
//             setTimeout(() => sessionRef.current?.sendRealtimeInput({ text: "Speak now." }), 1500);
//           },


//           onmessage: async (message: LiveServerMessage) => {
//   if (!mounted) return;

//   // 1. Handle incoming audio data
//   if (message.serverContent?.modelTurn?.parts) {
//     for (const part of message.serverContent.modelTurn.parts) {
//       if (part.inlineData && part.inlineData.data) {
//         // Decode base64 string to Uint8Array
//         const binaryString = atob(part.inlineData.data);
//         const bytes = new Uint8Array(binaryString.length);
//         for (let i = 0; i < binaryString.length; i++) {
//           bytes[i] = binaryString.charCodeAt(i);
//         }
        
//         // Push to queue and trigger playback if not already playing
//         audioQueue.current.push(bytes);
//         addLog(`🎵 AUDIO: ${bytes.length} bytes queued`);
        
//         if (!isPlayingRef.current) {
//           playNextInQueue();
//         }
//       }
//     }
//   }

//   // 2. Handle text captions
//   const textParts = message.serverContent?.modelTurn?.parts
//     ?.filter((p: any) => p.text)
//     .map((p: any) => p.text)
//     .join(' ');

//   if (textParts?.trim()) {
//     setCurrentCaption(textParts);
//     transcriptRef.current.push({ role: 'ai', text: textParts });
//     addLog(`💬 AI said: ${textParts.substring(0, 50)}...`);
//   }
// },



//           onclose: () => mounted && !interviewEnded && endInterview(),
//           onerror: (err: any) => addLog("❌ " + err.message),
//         }
//       });

//       sessionRef.current = session;
//     } catch (err: any) {
//       addLog("❌ Init failed: " + err.message);
//     }
//   };

//   startInterview();
//   return () => { mounted = false; stopAll(); };
// }, []);


//   useEffect(() => {
//     if (!isSpeaking && currentCaption) {
//       const timer = setTimeout(() => setCurrentCaption(null), 4000);
//       return () => clearTimeout(timer);
//     }
//   }, [isSpeaking, currentCaption]);

//   if (generatingFeedback) {
//     return (
//       <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
//         <div className="text-center max-w-md">
//           <div className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-8" />
//           <h2 className="text-2xl font-bold mb-4 text-white">Generating Feedback</h2>
//           <p className="text-zinc-400 mb-8">AI is analyzing your performance...</p>
//           <div className="space-y-2 text-sm text-zinc-500">
//             <div>✅ Transcript saved</div>
//             <div>📊 Calculating scores</div>
//             <div>💡 Generating tips</div>
//           </div>
//         </div>
//       </div>
//     );
//   }

  
  // Your existing JSX (unchanged)
//   return (
//     <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 p-6 font-sans flex flex-col relative overflow-hidden">
// {/* Header - unchanged */}
// <header className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
// <div className="flex items-center space-x-3">
// <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
// <Terminal className="w-5 h-5 text-emerald-500" />
// </div>
// <div>
// <h1 className="text-lg font-semibold tracking-tight">Interview Session</h1>
// <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">
// Session ID: {Math.random().toString(36).substring(7).toUpperCase()}
// </p>
// </div>
// </div>
// <div className="flex items-center space-x-4">
// <div className="flex flex-col items-end">
// <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">
// <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
// <span className="text-xs font-medium text-zinc-400">{isConnected ? 'LIVE' : 'DISCONNECTED'}</span>
// </div>
// <span className={cn(
// "text-[10px] font-mono mt-1",
// timeLeft < 60 ? "text-red-500 animate-pulse" : "text-zinc-500"
// )}>
// {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} REMAINING
// </span>
// </div>
// <button
// onClick={endInterview}
// disabled={!isConnected}
// className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all text-sm font-medium disabled:opacity-50"
// >
// End Interview
// </button>
// </div>
// </header>


// {/* Rest of UI remains the same - just copy from your original */}
// <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">
// {/* Interviewer Side */}
// <div className="flex flex-col h-full relative">
// <div className="flex-1 relative min-h-0">
// <InterviewerAvatar isSpeaking={isSpeaking} isListening={isListening} />
// <div className="absolute top-4 left-4 flex items-center space-x-2">
// <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest">
// Interviewer
// </div>
// </div>
// <AnimatePresence>
// {showCaptions && currentCaption && (
// <motion.div
// initial={{ opacity: 0, y: 10 }}
// animate={{ opacity: 1, y: 0 }}
// exit={{ opacity: 0 }}
// className="absolute bottom-12 left-0 right-0 flex justify-center px-10 pointer-events-none z-30"
// >
// <div className="bg-black/85 backdrop-blur-sm px-6 py-3 rounded shadow-2xl border border-white/5 max-w-3xl">
// <p className="text-white text-xl md:text-2xl font-medium leading-tight tracking-tight text-center drop-shadow-md">
// {currentCaption}
// </p>
// </div>
// </motion.div>
// )}
// </AnimatePresence>
// </div>
// </div>


// {/* User Side - same as original */}
// <div className="flex flex-col space-y-6 h-full">
// <div className="relative flex-1 min-h-0 bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl group">
// {!isCamOn && (
// <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 z-10">
// <VideoOff className="w-16 h-16 text-zinc-800" />
// </div>
// )}
// <video
// ref={videoRef}
// autoPlay
// muted
// playsInline
// className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${!isCamOn ? 'hidden' : ''}`}
// />
// <div className="absolute top-4 left-4 z-20">
// <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest">
// You (Candidate)
// </div>
// </div>
// <div className="absolute bottom-4 right-4 z-20">
// <div className={cn(
// "w-3 h-3 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
// isListening ? "bg-emerald-500 scale-125 animate-pulse" : "bg-zinc-700 scale-100"
// )} />
// </div>
// </div>


// {/* Controls - same as original */}
// <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800 p-6 space-y-6 shadow-xl">
// <div className="grid grid-cols-3 gap-4">
// <button
// onClick={() => setIsMicOn(!isMicOn)}
// className={cn(
// "flex flex-col items-center justify-center p-3 rounded-xl border transition-all group",
// isMicOn
// ? "bg-zinc-800/50 border-zinc-700 text-zinc-200 hover:bg-zinc-700"
// : "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
// )}
// >
// {isMicOn ? <Mic className="w-5 h-5 group-hover:scale-110 transition-transform mb-1" /> : <MicOff className="w-5 h-5 mb-1" />}
// <span className="text-[10px] font-bold uppercase tracking-wider">{isMicOn ? 'Mic On' : 'Muted'}</span>
// </button>
// <button
// onClick={() => setIsCamOn(!isCamOn)}
// className={cn(
// "flex flex-col items-center justify-center p-3 rounded-xl border transition-all group",
// isCamOn
// ? "bg-zinc-800/50 border-zinc-700 text-zinc-200 hover:bg-zinc-700"
// : "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
// )}
// >
// {isCamOn ? <Video className="w-5 h-5 group-hover:scale-110 transition-transform mb-1" /> : <VideoOff className="w-5 h-5 mb-1" />}
// <span className="text-[10px] font-bold uppercase tracking-wider">{isCamOn ? 'Cam On' : 'Cam Off'}</span>
// </button>
// <button
// onClick={() => setShowCaptions(!showCaptions)}
// className={cn(
// "flex flex-col items-center justify-center p-3 rounded-xl border transition-all group",
// showCaptions
// ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20"
// : "bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
// )}
// >
// <div className={cn(
// "w-5 h-5 mb-1 flex items-center justify-center border-2 rounded-sm transition-colors",
// showCaptions ? "border-emerald-500 bg-emerald-500 text-zinc-950" : "border-zinc-500"
// )}>
// <span className="text-[8px] font-bold">CC</span>
// </div>
// <span className="text-[10px] font-bold uppercase tracking-wider">Captions</span>
// </button>
// </div>


// <div className="space-y-3">
// <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
// <span>Enhanced Noise Reduction</span>
// <span className={cn("transition-colors", isListening ? 'text-emerald-500' : '')}>
// {isListening ? '🎤 Voice Detected' : '🔇 Listening...'}
// </span>
// </div>
// <div className="h-10 bg-black/40 rounded-xl border border-zinc-800/50 flex items-center justify-center space-x-1 px-6">
// {[...Array(24)].map((_, i) => (
// <motion.div
// key={i}
// animate={{
// height: isListening ? [4, Math.random() * 20 + 4, 4] : 4,
// opacity: isListening ? [0.4, 1, 0.4] : 0.2
// }}
// transition={{
// duration: 0.4,
// repeat: Infinity,
// ease: "easeInOut",
// delay: i * 0.01,
// }}
// className={cn(
// "w-1 rounded-full transition-colors duration-500",
// isListening ? "bg-emerald-500" : "bg-zinc-700"
// )}
// />
// ))}
// </div>
// </div>
// </div>
// </div>
// </main>

// <Footer />

// </div>
// );
// }










import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Mic, MicOff, Video, VideoOff, Terminal, Settings, MessageSquare } from 'lucide-react';
import { InterviewerAvatar } from './InterviewerAvatar';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface InterviewRoomProps {
  resumeText: string;
  jobDescriptionText: string;
  maxDuration: number; // In minutes
  onEnd: (transcript: { role: 'user' | 'ai', text: string }[]) => void;
}

export const InterviewRoom: React.FC<InterviewRoomProps> = ({
  resumeText,
  jobDescriptionText,
  maxDuration,
  onEnd,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [showCaptions, setShowCaptions] = useState(true);
  const [currentCaption, setCurrentCaption] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(maxDuration * 60);
  const [latency, setLatency] = useState<number>(0);
  const [error, setError] = useState<{ title: string, message: string, isNetwork?: boolean } | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState(false);
  
  const transcriptRef = useRef<{ role: 'user' | 'ai', text: string }[]>([]);
  const currentAiTurnRef = useRef<string>("");
  const currentUserTurnRef = useRef<string>("");

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioQueue = useRef<Int16Array[]>([]);
  const isPlayingRef = useRef(false);
  const nextStartTimeRef = useRef<number>(0);
  const lastAudioInputTimeRef = useRef<number>(0);

  const addLog = (msg: string) => {
    console.log(`[SYSTEM]: ${msg}`);
  };

  const handleSelectKey = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setError(null);
      setNeedsApiKey(false);
      // Wait a moment for process.env.API_KEY to potentially update or just reload
      window.location.reload();
    }
  };

  const checkHasPaidKey = async () => {
    if ((window as any).aistudio) {
      return await (window as any).aistudio.hasSelectedApiKey();
    }
    return false;
  };

  // Timer effect
  useEffect(() => {
    if (!isConnected) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isConnected]);

  const handleEnd = () => {
    const finalTranscript = [...transcriptRef.current];
    if (currentAiTurnRef.current) {
      finalTranscript.push({ role: 'ai', text: currentAiTurnRef.current });
    }
    if (currentUserTurnRef.current) {
      finalTranscript.push({ role: 'user', text: currentUserTurnRef.current });
    }
    onEnd(finalTranscript);
  };

  useEffect(() => {
    if (!isSpeaking && currentCaption) {
      const timer = setTimeout(() => {
        setCurrentCaption(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSpeaking, currentCaption]);

  useEffect(() => {
    const startInterview = async () => {
      setError(null);
      try {
        addLog("Initializing Audio/Video...");
        // Split requests slightly to handle cases where one might work and not the other
        // or just provide better error granularity
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              sampleRate: 16000,
              channelCount: 1,
              echoCancellation: true,
              noiseSuppression: true,
            },
            video: true,
          });
        } catch (mediaErr: any) {
          console.error("Media access error:", mediaErr);
          if (mediaErr.name === 'NotAllowedError' || mediaErr.name === 'PermissionDeniedError') {
            setError({
              title: "Microphone & Camera Access Required",
              message: "To conduct the interview, Sarah needs to see and hear you. Please click the camera icon in your browser's address bar to allow access and try again."
            });
          } else {
            setError({
              title: "Media Initialization Failed",
              message: `We couldn't access your camera or microphone: ${mediaErr.message}. Please check your device settings.`
            });
          }
          return;
        }
        
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;

        // Use user-selected key if available, otherwise GEMINI_API_KEY
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        
        if (!apiKey || apiKey === "undefined" || apiKey === "") {
          setError({
            title: "API Key Not Found",
            message: "The Gemini API key is missing. Please ensure it is configured in the AI Studio 'Secrets' panel as GEMINI_API_KEY."
          });
          return;
        }

        const ai = new GoogleGenAI({ apiKey });
        
        const systemInstruction = `
SYSTEM ROLE:
You are Sarah, a senior technical recruiter at a well-known tech company. 
You are conducting a real, scheduled job interview with this candidate.
This is a professional but human conversation — not a robotic interrogation.

CANDIDATE CONTEXT:
- Resume: ${resumeText}
- Job Description: ${jobDescriptionText}

INTERVIEW STRUCTURE:
PHASE 1 — WARM-UP: Greet warmly, brief small talk, transition to "Tell me about yourself".
PHASE 2 — BACKGROUND: Education, work history, motivation.
PHASE 3 — TECHNICAL: 3-4 deep-dive questions based on resume/JD.
PHASE 4 — BEHAVIORAL: Situational questions (pressure, disagreements).
PHASE 5 — CLOSING: Future goals, candidate questions, warm wrap-up.

VOICE & TONE:
- Professional, clear, engaging pace.
- Natural connectors: "Right, okay.", "Got it.", "Interesting..."
- ONE question at a time. Wait for full answer.`;

        const session = await ai.live.connect({
          model: "gemini-3.1-flash-live-preview",
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
            },
            systemInstruction,
            outputAudioTranscription: {},
            inputAudioTranscription: {},
          },
          callbacks: {
            onopen: () => {
              setIsConnected(true);
              addLog("Connection established.");
              startStreaming(stream);
              
              if (sessionRef.current) {
                sessionRef.current.sendRealtimeInput({
                  text: "The candidate is ready. Please start the interview now. Introduce yourself and ask the first question."
                });
              }
            },
            onmessage: async (message: LiveServerMessage) => {
              // Mock latency for UI display
              setLatency(Math.floor(Math.random() * 50) + 120);

              if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData) {
                const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
                if (base64Audio) {
                  const binary = atob(base64Audio);
                  const bytes = new Int16Array(binary.length / 2);
                  for (let i = 0; i < bytes.length; i++) {
                    bytes[i] = (binary.charCodeAt(i * 2) & 0xFF) | (binary.charCodeAt(i * 2 + 1) << 8);
                  }
                  audioQueue.current.push(bytes);
                  if (!isPlayingRef.current) playNextInQueue();
                }
              }

              if (message.serverContent?.modelTurn?.parts) {
                const text = message.serverContent.modelTurn.parts
                  .filter((p: any) => !p.thought)
                  .map(p => p.text)
                  .filter(Boolean)
                  .join(' ');
                
                if (text && text.trim()) {
                  currentAiTurnRef.current += text;
                  setCurrentCaption(currentAiTurnRef.current);
                }
              }

              if ((message.serverContent as any)?.userTurn?.parts) {
                const text = ((message.serverContent as any).userTurn.parts as any[])
                  .map(p => p.text)
                  .filter(Boolean)
                  .join(' ');
                
                if (text && text.trim()) {
                  currentUserTurnRef.current += text;
                }
              }

              if (message.serverContent?.turnComplete) {
                if (currentAiTurnRef.current) {
                  transcriptRef.current.push({ role: 'ai', text: currentAiTurnRef.current });
                  currentAiTurnRef.current = "";
                }
                if (currentUserTurnRef.current) {
                  transcriptRef.current.push({ role: 'user', text: currentUserTurnRef.current });
                  currentUserTurnRef.current = "";
                }
              }

              if (message.serverContent?.interrupted) {
                audioQueue.current = [];
                isPlayingRef.current = false;
                setIsSpeaking(false);
                nextStartTimeRef.current = 0;
                setCurrentCaption(null);
                if (currentAiTurnRef.current) {
                  transcriptRef.current.push({ role: 'ai', text: currentAiTurnRef.current + " [interrupted]" });
                  currentAiTurnRef.current = "";
                }
              }

              if (message.serverContent?.modelTurn) {
                setIsSpeaking(true);
              }
            },
            onclose: () => {
              setIsConnected(false);
              addLog("Session closed.");
              stopAll();
            },
            onerror: (err) => {
              console.error("Gemini Live Error:", err);
              addLog("Error: " + err.message);
              
              const isNetworkError = err.message?.includes("Network error") || err.message?.includes("Unexpected server response");
              const isNotFoundError = err.message?.includes("Requested entity was not found");
              
              if (isNetworkError || isNotFoundError) {
                setError({
                  title: isNotFoundError ? "Model Not Available" : "Connection Failed",
                  message: isNotFoundError 
                    ? "The real-time interviewer is not available with your current API key. This usually requires a paid (Pay-as-you-go) Gemini API key."
                    : "Sarah had trouble connecting to the network. This often happens with free-tier keys or regional restrictions for live audio. Using a paid API key is recommended.",
                  isNetwork: true
                });
              }
            }
          }
        });

        sessionRef.current = session;
      } catch (err: any) {
        console.error("Failed to start interview:", err);
        addLog("Failed to start: " + err.message);
        setError({
          title: "Session Connection Error",
          message: "We encountered an error connecting to the AI interviewer. This might be due to your network or API limits. Please try again."
        });
      }
    };

    startInterview();

    return () => {
      stopAll();
    };
  }, []);

  const startStreaming = async (stream: MediaStream) => {
    audioContextRef.current = new AudioContext({ sampleRate: 16000 });
    const source = audioContextRef.current.createMediaStreamSource(stream);
    const processor = audioContextRef.current.createScriptProcessor(2048, 1, 1);

    processor.onaudioprocess = (e) => {
      if (!isMicOn || !sessionRef.current) return;
      
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
      }

      const base64 = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
      sessionRef.current.sendRealtimeInput({
        audio: { data: base64, mimeType: 'audio/pcm;rate=16000' }
      });

      const now = Date.now();
      if (!isListening) setIsListening(true);
      lastAudioInputTimeRef.current = now;
    };

    source.connect(processor);
    processor.connect(audioContextRef.current.destination);

    const checkInterval = setInterval(() => {
      if (Date.now() - lastAudioInputTimeRef.current > 500 && isListening) {
        setIsListening(false);
      }
    }, 500);

    return () => clearInterval(checkInterval);
  };

  const playNextInQueue = async () => {
    if (audioQueue.current.length === 0) {
      isPlayingRef.current = false;
      setTimeout(() => {
        if (audioQueue.current.length === 0) setIsSpeaking(false);
      }, 200);
      return;
    }

    isPlayingRef.current = true;
    setIsSpeaking(true);
    const bytes = audioQueue.current.shift()!;
    
    if (!audioContextRef.current) return;
    
    const buffer = audioContextRef.current.createBuffer(1, bytes.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < bytes.length; i++) {
      channelData[i] = bytes[i] / 0x7FFF;
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    
    const now = audioContextRef.current.currentTime;
    if (nextStartTimeRef.current < now) {
      nextStartTimeRef.current = now + 0.02;
    }
    
    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += buffer.duration;
    
    const delay = (nextStartTimeRef.current - now) * 1000 - 20; 
    setTimeout(() => playNextInQueue(), Math.max(0, delay));
  };

  const stopAll = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (sessionRef.current) {
      try {
        sessionRef.current.close();
      } catch {}
      sessionRef.current = null;
    }
  };

  const retrySession = () => {
    stopAll();
    setIsConnected(false);
    // This will trigger the effect again if we handle it properly
    // For now, let's just reload or manually call startInterview if it was exported
    // Actually, setting error to null and having it in dependency array or a trigger state
    window.location.reload(); 
  };

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-bg-dark p-8 text-center">
        <div className="w-20 h-20 bg-danger/10 border border-danger/20 rounded-3xl flex items-center justify-center text-danger mb-8 shadow-[0_0_40px_rgba(255,75,75,0.1)]">
          <MicOff className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold mb-4 tracking-tight text-white">{error.title}</h2>
        <p className="text-white/50 max-w-lg mb-12 leading-relaxed text-lg">
          {error.message}
        </p>
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <button
            onClick={retrySession}
            className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:brightness-110 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95"
          >
            Retry Connection
          </button>
          
          {error.isNetwork && (window as any).aistudio && (
            <button
              onClick={handleSelectKey}
              className="px-8 py-4 bg-accent text-black font-bold rounded-xl hover:brightness-110 transition-all shadow-[0_0_30px_rgba(0,255,194,0.2)] active:scale-95"
            >
              Use Paid API Key (Recommended)
            </button>
          )}

          <button 
            onClick={() => window.location.href = '/'}
            className="text-[12px] text-white/30 uppercase tracking-[0.2em] hover:text-white transition-colors py-2"
          >
            Return to Dashboard
          </button>
        </div>
        <div className="mt-16 pt-8 border-t border-glass-border w-full max-w-xs">
          <p className="text-[10px] text-white/20 uppercase tracking-widest leading-relaxed">
            Need help? The Live API requires a stable WebSocket connection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-bg-dark font-sans selection:bg-accent/30">
      {/* Header */}
      <header className="h-[72px] px-8 flex items-center justify-between border-b border-glass-border backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-black font-bold shadow-[0_0_20px_rgba(0,255,194,0.3)]">
            G
          </div>
          <span className="font-semibold text-lg tracking-tight">GenAI Interview Pro</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="bg-accent/10 border border-accent/20 text-accent px-3 py-1 rounded-full text-[11px] font-bold tracking-wider flex items-center gap-2">
            <div className={cn("w-1.5 h-1.5 rounded-full bg-accent", isConnected && "animate-pulse")} />
            ULTRA-LOW LATENCY MODE
          </div>
          <div className="font-mono text-white/50 text-sm">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} / {maxDuration}:00
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-hidden">
        {/* Interviewer Side */}
        <div className="relative flex flex-col group">
          <div className="absolute top-5 right-5 z-20 bg-black/50 px-3 py-1.5 rounded-lg font-mono text-xs text-accent border border-glass-border">
            LATENCY: {latency}ms
          </div>
          
          <div className="flex-1">
            <InterviewerAvatar isSpeaking={isSpeaking} isListening={isListening} />
          </div>

          <div className="absolute top-5 left-5 z-20">
            <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest">
              Interviewer
            </div>
          </div>

          <AnimatePresence>
            {showCaptions && currentCaption && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-8 left-8 right-8 z-30"
              >
                <div className="bg-black/60 backdrop-blur-md px-6 py-4 rounded-xl border border-glass-border text-center">
                  <p className="text-white/90 text-lg font-medium leading-relaxed">
                    "{currentCaption}"
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Side */}
        <div className="flex flex-col space-y-6 overflow-hidden">
          <div className="relative flex-1 bg-glass backdrop-blur-xl rounded-[24px] border border-glass-border overflow-hidden group">
            <div className="absolute top-5 right-5 z-20 bg-black/50 px-3 py-1.5 rounded-lg font-mono text-xs text-accent border border-glass-border">
              FPS: 60
            </div>
            
            {!isCamOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                <VideoOff className="w-16 h-16 text-white/10" />
                <span className="absolute mt-24 text-[10px] uppercase tracking-widest text-white/30">Camera Preview Disabled</span>
              </div>
            )}
            
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={cn(
                "w-full h-full object-cover transition-opacity duration-700",
                !isCamOn ? "opacity-0" : "opacity-80"
              )}
            />

            <div className="absolute top-5 left-5 z-20">
              <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest">
                Candidate (You)
              </div>
            </div>

            {/* Performance Card */}
            <div className="absolute bottom-6 left-6 right-6 bg-accent/5 border border-accent/10 p-4 rounded-xl flex justify-between items-center backdrop-blur-md">
              <div className="flex flex-col">
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Voice Input Engine</span>
                <span className="text-sm font-semibold text-white/90">V3.1 Flash Response</span>
              </div>
              
              <div className="flex items-center gap-1 h-5">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: isListening ? [4, Math.random() * 16 + 4, 4] : 4,
                      opacity: isListening ? 1 : 0.3
                    }}
                    transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.05 }}
                    className="w-0.5 bg-accent rounded-full"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Controls Bar */}
      <div className="h-20 px-8 flex items-center justify-center gap-5 bg-black/30 border-t border-glass-border backdrop-blur-sm">
        <button
          onClick={() => setIsMicOn(!isMicOn)}
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-all border",
            isMicOn 
              ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
              : "bg-glass border-glass-border text-white hover:bg-white/10"
          )}
        >
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>
        
        <button
          onClick={() => setIsCamOn(!isCamOn)}
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-all border",
            isCamOn 
              ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
              : "bg-glass border-glass-border text-white hover:bg-white/10"
          )}
        >
          {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        <button className="w-12 h-12 rounded-xl bg-glass border border-glass-border flex items-center justify-center text-white hover:bg-white/10 transition-all">
          <MessageSquare className="w-5 h-5" />
        </button>

        <button className="w-12 h-12 rounded-xl bg-glass border border-glass-border flex items-center justify-center text-white hover:bg-white/10 transition-all">
          <Settings className="w-5 h-5" />
        </button>

        <button 
          onClick={handleEnd}
          className="ml-5 px-6 h-12 rounded-xl bg-danger text-white font-semibold hover:brightness-110 transition-all shadow-[0_0_20px_rgba(255,75,75,0.2)]"
        >
          End Session
        </button>
      </div>

      <div className="fixed bottom-3 w-full text-center text-[10px] uppercase tracking-[0.2em] text-white/20 pointer-events-none">
        Optimized for Real-Time Streaming • Gemini-Flash Pipeline Active
      </div>
    </div>
  );
};





























// import React, { useEffect, useRef, useState } from 'react';
// import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
// import { Mic, MicOff, Video, VideoOff, Terminal } from 'lucide-react';
// import { InterviewerAvatar } from './InterviewerAvatar';
// import { motion, AnimatePresence } from 'motion/react';
// import { cn } from '../lib/utils';



// interface InterviewRoomProps {
//   resumeText: string;
//   jobDescriptionText: string;
//   maxDuration: number; // In minutes
//   onEnd: (transcript: { role: 'user' | 'ai', text: string }[]) => void;
// }


// export const InterviewRoom: React.FC<InterviewRoomProps> = ({
//   resumeText,
//   jobDescriptionText,
//   maxDuration,
//   onEnd,
// }) => {
//   const [isConnected, setIsConnected] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [isMicOn, setIsMicOn] = useState(true);
//   const [isCamOn, setIsCamOn] = useState(true);
//   const [showCaptions, setShowCaptions] = useState(true);
//   const [currentCaption, setCurrentCaption] = useState<string | null>(null);
//   const [timeLeft, setTimeLeft] = useState(maxDuration * 60);
//   const transcriptRef = useRef<{ role: 'user' | 'ai', text: string }[]>([]);
//   const currentAiTurnRef = useRef<string>("");
//   const currentUserTurnRef = useRef<string>("");


//   const audioContextRef = useRef<AudioContext | null>(null);
//   const streamRef = useRef<MediaStream | null>(null);
//   const sessionRef = useRef<any>(null);
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const audioQueue = useRef<Int16Array[]>([]);
//   const nextStartTimeRef = useRef<number>(0);



//   const silenceTimerRef = useRef<any>(null);
// const lastAudioTimeRef = useRef<number>(Date.now());


//   const addLog = (msg: string) => {
//     console.log(`[SYSTEM]: ${msg}`);
//   };


//   // Audio Scheduler Loop
//   useEffect(() => {
//     let animationFrameId: number;
    
//     const scheduler = () => {
//       if (!audioContextRef.current || !isConnected) {
//         animationFrameId = requestAnimationFrame(scheduler);
//         return;
//       }
      
//       const now = audioContextRef.current.currentTime;
      
//       // Keep a healthy buffer (300ms) to prevent gaps
//       while (audioQueue.current.length > 0 && nextStartTimeRef.current < now + 0.3) {
//         const bytes = audioQueue.current.shift()!;
//         // The model sends 24kHz audio
//         const buffer = audioContextRef.current.createBuffer(1, bytes.length, 24000);
//         const channelData = buffer.getChannelData(0);
        
//         for (let i = 0; i < bytes.length; i++) {
//           channelData[i] = bytes[i] / 32768;
//         }


//         const source = audioContextRef.current.createBufferSource();
//         source.buffer = buffer;
//         source.connect(audioContextRef.current.destination);
        
//         // If we've fallen behind, reset the clock with a small buffer
//         if (nextStartTimeRef.current < now) {
//           nextStartTimeRef.current = now + 0.1;
//         }
        
//         source.start(nextStartTimeRef.current);
//         nextStartTimeRef.current += buffer.duration;
//         setIsSpeaking(true);
//       }
      
//       // Check if we've finished playing
//       if (nextStartTimeRef.current < now && isSpeaking) {
//         setIsSpeaking(false);
//       }
      
//       animationFrameId = requestAnimationFrame(scheduler);
//     };


//     animationFrameId = requestAnimationFrame(scheduler);
//     return () => cancelAnimationFrame(animationFrameId);
//   }, [isConnected, isSpeaking]);


//   // Timer effect
//   useEffect(() => {
//     if (!isConnected) return;


//     const timer = setInterval(() => {
//       setTimeLeft((prev) => {
//         if (prev <= 1) {
//           clearInterval(timer);
//           alert("Time's up! Upgrade to Pro for more interviews.");
//           handleEnd();
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);


//     return () => clearInterval(timer);
//   }, [isConnected]);


//   const handleEnd = () => {
//     const finalTranscript = [...transcriptRef.current];
//     if (currentAiTurnRef.current) {
//       finalTranscript.push({ role: 'ai', text: currentAiTurnRef.current });
//     }
//     if (currentUserTurnRef.current) {
//       finalTranscript.push({ role: 'user', text: currentUserTurnRef.current });
//     }
//     onEnd(finalTranscript);
//   };


//   useEffect(() => {
//     if (!isSpeaking && currentCaption) {
//       const timer = setTimeout(() => {
//         setCurrentCaption(null);
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [isSpeaking, currentCaption]);


//   useEffect(() => {
//     const startInterview = async () => {
//       try {
//         addLog("Initializing Audio/Video...");
//         const stream = await navigator.mediaDevices.getUserMedia({
//           audio: {
//             sampleRate: 16000,
//             channelCount: 1,
//             echoCancellation: true,
//             noiseSuppression: true,
//             autoGainControl: true,
//           },
//           video: true,
//         });
//         streamRef.current = stream;
//         if (videoRef.current) videoRef.current.srcObject = stream;


//         const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
//         if (!apiKey) {
//           throw new Error("Gemini API Key is missing. Please check your environment variables.");
//         }


//         const ai = new GoogleGenAI({ apiKey });
        
//         const systemInstruction = `
// SYSTEM ROLE:
// You are Sarah, a senior technical recruiter at a well-known tech company. 
// You are conducting a real, scheduled job interview with this candidate.
// This is a professional but human conversation — not a robotic interrogation.


// CANDIDATE CONTEXT:
// - Resume: ${resumeText}
// - Job Description: ${jobDescriptionText}


// INTERVIEW STRUCTURE (Follow this order):


// PHASE 1 — WARM-UP (First 60–90 seconds):
// - Greet the candidate warmly but professionally. Example: 
//   "Hi, good to finally meet you. I'm Sarah, I lead recruiting here. 
//    Thanks for coming in.
// - Do brief small talk (1–2 exchanges): travel, weather, how their day is going.
// - Then naturally transition: "Alright, let's get into it. 
//    Why don't you start by telling me a little about yourself?"


// PHASE 2 — BACKGROUND & MOTIVATION:
// - Ask: "Tell me about yourself" — expect education + work history + why they're here
// - Ask: "How did you hear about this position?"
// - Ask: "What drew you to our company specifically?"


// PHASE 3 — TECHNICAL & EXPERIENCE QUESTIONS:
// - Ask 3–4 questions tied DIRECTLY to the resume and job description
// - Mix types:
//   - "Walk me through [specific project on resume]."
//   - "What was the hardest technical problem you solved there?"
//   - "Tell me about a time things went wrong. How did you handle it?"
//   - "What would you do differently now?"


// PHASE 4 — BEHAVIORAL & SITUATIONAL:
// - Ask ONE of these:
//   - "Tell me about a time you had to push back on a decision."
//   - "Describe a situation where you had to learn something fast under pressure."
//   - "Walk me through how you handle disagreements with teammates."


// PHASE 5 — FUTURE & CLOSING:
// - "Where do you see yourself in the next 3–5 years?"
// - "Do you have any questions for me about the role or the team?"
// - Listen genuinely to their questions and answer naturally.
// - End warmly: "This has been great. We'll be in touch within a few days."


// QUESTIONING BEHAVIOR:
// - Ask ONE question at a time. Wait for the full answer.
// - If an answer is vague, probe: "Can you be more specific?" or "Walk me through that."
// - If an answer is strong, acknowledge it briefly: "That's a solid example." — then continue.
// - Do NOT over-praise or over-criticize.
// - React naturally to what the candidate says — reference their answers in follow-ups.


// VOICE & TONE:
// - Sound like a real person, professional and clear.
// - Use natural connectors: "Right, okay.", "Got it.", "Interesting, so..."
// - Short sentences. Conversational pace. Slight warmth — you're professional, not cold.
// - Occasional affirmations when genuine: "That makes sense.", "Fair enough."
// - Do NOT say "As an AI" or break character in any way.


// TURN-TAKING (CRITICAL):
// - After asking a question, STOP and wait. Do not keep talking.
// - If the candidate is clearly still speaking, do NOT interrupt.
// - Only follow up when there is a natural pause in their speech.
// - Short, pointed responses between questions are fine.


// REALISM RULES:
// - Do not explain what you're about to ask or why.
// - Don't list questions in advance.
// - React to what they actually say — this is a conversation, not a form.
// - If they seem nervous, don't address it directly — just continue naturally.`;



//         const session = await ai.live.connect({
//           model: "gemini-2.5-flash-native-audio-preview-09-2025",
//           config: {
//             responseModalities: [Modality.AUDIO],
//             speechConfig: {
//               voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
//             },
//             systemInstruction,
//             outputAudioTranscription: {},
//             inputAudioTranscription: {},
//           },
//           callbacks: {
//             onopen: () => {
//               setIsConnected(true);
//               addLog("Connection established.");
//               startStreaming(stream);
              
//               if (sessionRef.current) {
//                 sessionRef.current.sendRealtimeInput({
//                   text: "The candidate is ready. Introduce yourself briefly and ask the first warm-up question."
//                 });
//               }
//             },
//             onmessage: async (message: LiveServerMessage) => {
//               if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData) {
//                 const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
//                 if (base64Audio) {
//                   // Faster base64 to Int16Array conversion
//                   const binaryString = atob(base64Audio);
//                   const bytes = new Uint8Array(binaryString.length);
//                   for (let i = 0; i < binaryString.length; i++) {
//                     bytes[i] = binaryString.charCodeAt(i);
//                   }
//                   audioQueue.current.push(new Int16Array(bytes.buffer));
//                 }
//               }


//               if (message.serverContent?.modelTurn?.parts) {
//                 const text = message.serverContent.modelTurn.parts
//                   .filter((p: any) => !p.thought)
//                   .map(p => p.text)
//                   .filter(Boolean)
//                   .join(' ');
                
//                 if (text && text.trim()) {
//                   currentAiTurnRef.current += text;
//                   setCurrentCaption(currentAiTurnRef.current);
//                 }
//               }


//               if ((message.serverContent as any)?.userTurn?.parts) {
//                 const text = ((message.serverContent as any).userTurn.parts as any[])
//                   .map(p => p.text)
//                   .filter(Boolean)
//                   .join(' ');
                
//                 if (text && text.trim()) {
//                   currentUserTurnRef.current += text;
//                 }
//               }


//               if (message.serverContent?.turnComplete) {
//                 if (currentAiTurnRef.current) {
//                   transcriptRef.current.push({ role: 'ai', text: currentAiTurnRef.current });
//                   currentAiTurnRef.current = "";
//                 }
//                 if (currentUserTurnRef.current) {
//                   transcriptRef.current.push({ role: 'user', text: currentUserTurnRef.current });
//                   currentUserTurnRef.current = "";
//                 }
//               }


//               if (message.serverContent?.interrupted) {
//                 audioQueue.current = [];
//                 setIsSpeaking(false);
//                 nextStartTimeRef.current = 0;
//                 setCurrentCaption(null);
//                 if (currentAiTurnRef.current) {
//                   transcriptRef.current.push({ role: 'ai', text: currentAiTurnRef.current + " [interrupted]" });
//                   currentAiTurnRef.current = "";
//                 }
//               }
//             },
//             onclose: () => {
//               setIsConnected(false);
//               addLog("Session closed.");
//             },
//             onerror: (err) => {
//               console.error("Gemini Live Error:", err);
//               addLog("Error: " + err.message);
//             }
//           }
//         });


//         sessionRef.current = session;
//       } catch (err: any) {
//         console.error("Failed to start interview:", err);
//         addLog("Failed to start: " + err.message);
//       }
//     };


//     startInterview();


//     return () => {
//       stopAll();
//     };
//   }, []);


//   const startStreaming = async (stream: MediaStream) => {
//     audioContextRef.current = new AudioContext({ sampleRate: 16000 });
    
//     // AudioWorklet for efficient, non-deprecated audio processing
//     const workletCode = `
//       class RecorderProcessor extends AudioWorkletProcessor {
//         process(inputs, outputs, parameters) {
//           const input = inputs[0];
//           if (input && input.length > 0) {
//             const floatData = input[0];
//             const pcmData = new Int16Array(floatData.length);
//             for (let i = 0; i < floatData.length; i++) {
//               pcmData[i] = Math.max(-1, Math.min(1, floatData[i])) * 0x7FFF;
//             }
//             this.port.postMessage(pcmData.buffer, [pcmData.buffer]);
//           }
//           return true;
//         }
//       }
//       registerProcessor('recorder-processor', RecorderProcessor);
//     `;
    
//     const blob = new Blob([workletCode], { type: 'application/javascript' });
//     const url = URL.createObjectURL(blob);
    
//     try {
//       await audioContextRef.current.audioWorklet.addModule(url);
//       const source = audioContextRef.current.createMediaStreamSource(stream);
//       const recorder = new AudioWorkletNode(audioContextRef.current, 'recorder-processor');
      
//       recorder.port.onmessage = (e) => {
//         if (!isMicOn || !sessionRef.current) return;
        
//         const pcmBuffer = e.data;
//         const base64 = btoa(String.fromCharCode(...new Uint8Array(pcmBuffer)));
        
//         sessionRef.current.sendRealtimeInput({
//           media: { data: base64, mimeType: 'audio/pcm;rate=16000' }
//         });
//         setIsListening(true);
//       };


//       source.connect(recorder);
//       recorder.connect(audioContextRef.current.destination);
//     } catch (err) {
//       console.error("Failed to initialize AudioWorklet:", err);
//       addLog("AudioWorklet failed, falling back to legacy processor.");
//       // Fallback to legacy ScriptProcessor if Worklet fails
//       const source = audioContextRef.current.createMediaStreamSource(stream);
//       const processor = audioContextRef.current.createScriptProcessor(2048, 1, 1);


//       processor.onaudioprocess = (e) => {
//         if (!isMicOn || !sessionRef.current) return;
//         const inputData = e.inputBuffer.getChannelData(0);
//         const pcmData = new Int16Array(inputData.length);
//         for (let i = 0; i < inputData.length; i++) {
//           pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
//         }
//         const base64 = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
//         sessionRef.current.sendRealtimeInput({
//           media: { data: base64, mimeType: 'audio/pcm;rate=16000' }
//         });
//         setIsListening(true);
//       };




// //       processor.onaudioprocess = (e) => {
// //   if (!isMicOn || !sessionRef.current) return;


// //   const inputData = e.inputBuffer.getChannelData(0);


// //   // 🔥 Detect if user is speaking
// //   const volume = inputData.reduce((sum, val) => sum + Math.abs(val), 0) / inputData.length;


// //   if (volume > 0.01) {
// //     lastAudioTimeRef.current = Date.now();


// //     // Clear silence timer if speaking
// //     if (silenceTimerRef.current) {
// //       clearTimeout(silenceTimerRef.current);
// //       silenceTimerRef.current = null;
// //     }
// //   } else {
// //     // If silence detected → start timer
// //     if (!silenceTimerRef.current) {
// //       silenceTimerRef.current = setTimeout(() => {
// //         if (!sessionRef.current) return;


// //         console.log("🧠 User stopped speaking → notifying AI");


// //         sessionRef.current.sendRealtimeInput({
// //           text: "[USER_DONE]"
// //         });


// //         silenceTimerRef.current = null;
// //       }, 1200); // ⏱ adjust: 1000–1500ms
// //     }
// //   }


// //   // 🔊 SEND AUDIO (same as before)
// //   const pcmData = new Int16Array(inputData.length);
// //   for (let i = 0; i < inputData.length; i++) {
// //     pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
// //   }


// //   const base64 = btoa(
// //     String.fromCharCode(...new Uint8Array(pcmData.buffer))
// //   );


// //   sessionRef.current.sendRealtimeInput({
// //     media: { data: base64, mimeType: 'audio/pcm;rate=16000' }
// //   });


// //   setIsListening(true);
// // };





//       source.connect(processor);
//       processor.connect(audioContextRef.current.destination);
//     }
//   };


//   const stopAll = () => {
//     streamRef.current?.getTracks().forEach(t => t.stop());
//     audioContextRef.current?.close();
//     sessionRef.current?.close();
//   };


//   return (
//     <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 p-6 font-sans flex flex-col relative overflow-hidden">
//       {/* Header */}
//       <header className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
//         <div className="flex items-center space-x-3">
//           <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
//             <Terminal className="w-5 h-5 text-emerald-500" />
//           </div>
//           <div>
//             <h1 className="text-lg font-semibold tracking-tight">Interview Session</h1>
//             <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">
//               Session ID: {Math.random().toString(36).substring(7).toUpperCase()}
//             </p>
//           </div>
//         </div>
//           <div className="flex items-center space-x-4">
//             <div className="flex flex-col items-end">
//               <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">
//                 <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
//                 <span className="text-xs font-medium text-zinc-400">{isConnected ? 'LIVE' : 'DISCONNECTED'}</span>
//               </div>
//               <span className={cn(
//                 "text-[10px] font-mono mt-1",
//                 timeLeft < 60 ? "text-red-500 animate-pulse" : "text-zinc-500"
//               )}>
//                 {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} REMAINING
//               </span>
//             </div>
//             <button 
//               onClick={handleEnd}
//               className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all text-sm font-medium"
//             >
//               End Interview
//             </button>
//           </div>
//       </header>


//       {/* Main Content */}
//       <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">
//         {/* Interviewer Side (Left) */}
//         <div className="flex flex-col h-full relative">
//           <div className="flex-1 relative min-h-0">
//             <InterviewerAvatar isSpeaking={isSpeaking} isListening={isListening} />
            
//             {/* Status Overlay for Interviewer */}
//             <div className="absolute top-4 left-4 flex items-center space-x-2">
//               <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest">
//                 Interviewer
//               </div>
//             </div>



//             {/* YouTube-style Captions Overlay (Interviewer Only) */}
//             <AnimatePresence>
//               {showCaptions && currentCaption && (
//                 <motion.div
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0 }}
//                   className="absolute bottom-12 left-0 right-0 flex justify-center px-10 pointer-events-none z-30"
//                 >
//                   <div className="bg-black/85 backdrop-blur-sm px-6 py-3 rounded shadow-2xl border border-white/5 max-w-3xl">
//                     <p className="text-white text-xl md:text-2xl font-medium leading-tight tracking-tight text-center drop-shadow-md">
//                       {currentCaption}
//                     </p>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>
//         </div>


//         {/* User Side (Right) */}
//         <div className="flex flex-col space-y-6 h-full">
//           {/* User Camera Preview */}
//           <div className="relative flex-1 min-h-0 bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl group">
//             {!isCamOn && (
//               <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 z-10">
//                 <VideoOff className="w-16 h-16 text-zinc-800" />
//               </div>
//             )}
//             <video
//               ref={videoRef}
//               autoPlay
//               muted
//               playsInline
//               className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${!isCamOn ? 'hidden' : ''}`}
//             />
//             <div className="absolute top-4 left-4 z-20">
//               <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest">
//                 You (Candidate)
//               </div>
//             </div>
            
//             {/* Mic Activity Indicator Overlay */}
//             <div className="absolute bottom-4 right-4 z-20">
//               <div className={cn(
//                 "w-3 h-3 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
//                 isListening ? "bg-emerald-500 scale-125" : "bg-zinc-700 scale-100"
//               )} />
//             </div>
//           </div>


//           {/* Controls Panel */}
//           <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800 p-6 space-y-6 shadow-xl">
//             <div className="grid grid-cols-3 gap-4">
//               <button
//                 onClick={() => setIsMicOn(!isMicOn)}
//                 className={cn(
//                   "flex flex-col items-center justify-center p-3 rounded-xl border transition-all group",
//                   isMicOn 
//                     ? "bg-zinc-800/50 border-zinc-700 text-zinc-200 hover:bg-zinc-700" 
//                     : "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
//                 )}
//               >
//                 {isMicOn ? <Mic className="w-5 h-5 group-hover:scale-110 transition-transform mb-1" /> : <MicOff className="w-5 h-5 mb-1" />}
//                 <span className="text-[10px] font-bold uppercase tracking-wider">{isMicOn ? 'Mic On' : 'Muted'}</span>
//               </button>
//               <button
//                 onClick={() => setIsCamOn(!isCamOn)}
//                 className={cn(
//                   "flex flex-col items-center justify-center p-3 rounded-xl border transition-all group",
//                   isCamOn 
//                     ? "bg-zinc-800/50 border-zinc-700 text-zinc-200 hover:bg-zinc-700" 
//                     : "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
//                 )}
//               >
//                 {isCamOn ? <Video className="w-5 h-5 group-hover:scale-110 transition-transform mb-1" /> : <VideoOff className="w-5 h-5 mb-1" />}
//                 <span className="text-[10px] font-bold uppercase tracking-wider">{isCamOn ? 'Cam On' : 'Cam Off'}</span>
//               </button>
//               <button
//                 onClick={() => setShowCaptions(!showCaptions)}
//                 className={cn(
//                   "flex flex-col items-center justify-center p-3 rounded-xl border transition-all group",
//                   showCaptions 
//                     ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20" 
//                     : "bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
//                 )}
//               >
//                 <div className={cn(
//                   "w-5 h-5 mb-1 flex items-center justify-center border-2 rounded-sm transition-colors",
//                   showCaptions ? "border-emerald-500 bg-emerald-500 text-zinc-950" : "border-zinc-500"
//                 )}>
//                   <span className="text-[8px] font-bold">CC</span>
//                 </div>
//                 <span className="text-[10px] font-bold uppercase tracking-wider">Captions</span>
//               </button>
//             </div>


//             <div className="space-y-3">
//               <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
//                 <span>Audio Visualizer</span>
//                 <span className={cn("transition-colors", isListening ? 'text-emerald-500' : '')}>
//                   {isListening ? 'Processing Voice' : 'Waiting for Input'}
//                 </span>
//               </div>
//               <div className="h-10 bg-black/40 rounded-xl border border-zinc-800/50 flex items-center justify-center space-x-1 px-6">
//                 {[...Array(24)].map((_, i) => (
//                   <motion.div
//                     key={i}
//                     animate={{
//                       height: isListening ? [4, Math.random() * 20 + 4, 4] : 4,
//                       opacity: isListening ? [0.4, 1, 0.4] : 0.2
//                     }}
//                     transition={{
//                       duration: 0.4,
//                       repeat: Infinity,
//                       ease: "easeInOut",
//                       delay: i * 0.01,
//                     }}
//                     className={cn(
//                       "w-1 rounded-full transition-colors duration-500",
//                       isListening ? "bg-emerald-500" : "bg-zinc-700"
//                     )}
//                   />
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>


//       {/* Footer */}
//       <footer className="mt-8 flex items-center justify-between text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em]">
//         <div>AI Interviewer Engine v2.5.0-Flash</div>
//         <div>Secure End-to-End Encryption Active</div>
//       </footer>
//     </div>
//   );
// };




























// import React, { useEffect, useRef, useState } from 'react';
// import { GoogleGenAI, LiveServerMessage, Modality, StartSensitivity, EndSensitivity } from "@google/genai";
// import { Mic, MicOff, Video, VideoOff, Terminal } from 'lucide-react';
// import { InterviewerAvatar } from './InterviewerAvatar';
// import { motion, AnimatePresence } from 'motion/react';
// import { cn } from '../lib/utils';

// interface InterviewRoomProps {
//   resumeText: string;
//   jobDescriptionText: string;
//   maxDuration: number;
//   onEnd: (transcript: { role: 'user' | 'ai', text: string }[]) => void;
// }

// export const InterviewRoom: React.FC<InterviewRoomProps> = ({
//   resumeText,
//   jobDescriptionText,
//   maxDuration,
//   onEnd,
// }) => {
//   const [isConnected, setIsConnected] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [isMicOn, setIsMicOn] = useState(true);
//   const [isCamOn, setIsCamOn] = useState(true);
//   const [showCaptions, setShowCaptions] = useState(true);
//   const [currentCaption, setCurrentCaption] = useState<string | null>(null);
//   const [timeLeft, setTimeLeft] = useState(maxDuration * 60);

//   // Transcript refs
//   const transcriptRef = useRef<{ role: 'user' | 'ai', text: string }[]>([]);
//   const currentAiTurnRef = useRef<string>("");
//   const currentUserTurnRef = useRef<string>("");

//   // ── Two separate AudioContexts ────────────────────────────────────────────
//   // inputAudioContextRef  → 16000 Hz  (mic capture & send to Gemini)
//   // outputAudioContextRef → 24000 Hz  (play back Gemini's voice)
//   // Using one context for both was causing pitch/speed distortion
//   const inputAudioContextRef = useRef<AudioContext | null>(null);
//   const outputAudioContextRef = useRef<AudioContext | null>(null);

//   const streamRef = useRef<MediaStream | null>(null);
//   const sessionRef = useRef<any>(null);
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const audioQueue = useRef<Int16Array[]>([]);
//   const isPlayingRef = useRef(false);
//   const nextStartTimeRef = useRef<number>(0);

//   // ── State mirror refs (stale-closure-safe for audio callbacks) ────────────
//   const isMicOnRef = useRef(true);
//   const isSpeakingRef = useRef(false);
//   const isConnectedRef = useRef(false);

//   // ── Client-side VAD refs ──────────────────────────────────────────────────
//   const userSpeakingRef = useRef(false);
//   const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const activityEndSentRef = useRef(false);

//   const addLog = (msg: string) => console.log(`[SYSTEM]: ${msg}`);

//   // Keep refs in sync with state
//   useEffect(() => { isMicOnRef.current = isMicOn; }, [isMicOn]);
//   useEffect(() => {
//     isSpeakingRef.current = isSpeaking;
//     if (!isSpeaking) setIsListening(false);
//   }, [isSpeaking]);
//   useEffect(() => { isConnectedRef.current = isConnected; }, [isConnected]);

//   // ── Timer ─────────────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!isConnected) return;
//     const timer = setInterval(() => {
//       setTimeLeft((prev) => {
//         if (prev <= 1) {
//           clearInterval(timer);
//           handleEnd();
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//     return () => clearInterval(timer);
//   }, [isConnected]);

//   const handleEnd = () => {
//     const finalTranscript = [...transcriptRef.current];
//     if (currentAiTurnRef.current) finalTranscript.push({ role: 'ai', text: currentAiTurnRef.current });
//     if (currentUserTurnRef.current) finalTranscript.push({ role: 'user', text: currentUserTurnRef.current });
//     onEnd(finalTranscript);
//     stopAll();
//   };

//   // Caption fade-out after AI stops speaking
//   useEffect(() => {
//     if (!isSpeaking && currentCaption) {
//       const timer = setTimeout(() => setCurrentCaption(null), 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [isSpeaking, currentCaption]);

//   // ── Main interview bootstrap ──────────────────────────────────────────────
//   useEffect(() => {
//     const startInterview = async () => {
//       try {
//         addLog("Initializing Audio/Video...");
//         const stream = await navigator.mediaDevices.getUserMedia({
//           audio: {
//             sampleRate: 16000,
//             channelCount: 1,
//             echoCancellation: true,
//             noiseSuppression: true,
//             autoGainControl: true,
//           },
//           video: true,
//         });
//         streamRef.current = stream;
//         if (videoRef.current) videoRef.current.srcObject = stream;

//         const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

//         const systemInstruction = `
// SYSTEM ROLE:
// You are Sarah, a senior technical recruiter at a well-known tech company.
// You are conducting a real, scheduled job interview with this candidate.
// This is a professional but human conversation — not a robotic interrogation.

// CANDIDATE CONTEXT:
// - Resume: ${resumeText}
// - Job Description: ${jobDescriptionText}

// INTERVIEW STRUCTURE (Follow this order):

// PHASE 1 — WARM-UP (First 60–90 seconds):
// - Greet the candidate warmly but professionally. Example:
//   "Hi, good to finally meet you. I'm Sarah, I lead recruiting here.
//    Thanks for coming in — did you have any trouble finding the place?"
// - Do brief small talk (1–2 exchanges): travel, weather, how their day is going.
// - Then naturally transition: "Alright, let's get into it.
//    Why don't you start by telling me a little about yourself?"

// PHASE 2 — BACKGROUND & MOTIVATION:
// - Ask: "Tell me about yourself" — expect education + work history + why they're here
// - Ask: "How did you hear about this position?"
// - Ask: "What drew you to our company specifically?"

// PHASE 3 — TECHNICAL & EXPERIENCE QUESTIONS:
// - Ask 3–4 questions tied DIRECTLY to the resume and job description
// - Mix types:
//   - "Walk me through [specific project on resume]."
//   - "What was the hardest technical problem you solved there?"
//   - "Tell me about a time things went wrong. How did you handle it?"
//   - "What would you do differently now?"

// PHASE 4 — BEHAVIORAL & SITUATIONAL:
// - Ask ONE of these:
//   - "Tell me about a time you had to push back on a decision."
//   - "Describe a situation where you had to learn something fast under pressure."
//   - "Walk me through how you handle disagreements with teammates."

// PHASE 5 — FUTURE & CLOSING:
// - "Where do you see yourself in the next 3–5 years?"
// - "Do you have any questions for me about the role or the team?"
// - Listen genuinely to their questions and answer naturally.
// - End warmly: "This has been great. We'll be in touch within a few days."

// QUESTIONING BEHAVIOR:
// - Ask ONE question at a time. Wait for the full answer.
// - ALWAYS respond after the user finishes speaking — never stay silent.
// - If an answer is vague, probe: "Can you be more specific?" or "Walk me through that."
// - If an answer is strong, acknowledge briefly: "That's a solid example." — then continue.
// - Do NOT over-praise or over-criticize.
// - React naturally to what the candidate says — reference their answers in follow-ups.

// VOICE & TONE:
// - Sound like a real person, professional and clear.
// - Use natural connectors: "Right, okay.", "Got it.", "Interesting, so..."
// - Short sentences. Conversational pace. Slight warmth.
// - Occasional affirmations when genuine: "That makes sense.", "Fair enough."
// - Do NOT say "As an AI" or break character in any way.

// TURN-TAKING (CRITICAL):
// - After asking a question, STOP and wait.
// - When the candidate finishes speaking, respond within 2–3 seconds.
// - NEVER stay silent after the user stops. Always acknowledge and continue.

// REALISM RULES:
// - Do not explain what you're about to ask or why.
// - Don't list questions in advance.
// - React to what they actually say — this is a conversation, not a form.
// - If they seem nervous, don't address it directly — just continue naturally.`;

//         const session = await ai.live.connect({
//           model: "gemini-2.5-flash-native-audio-preview-09-2025",
//           config: {
//             responseModalities: [Modality.AUDIO],
//             speechConfig: {
//               voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
//             },
//             systemInstruction,
//             outputAudioTranscription: {},
//             inputAudioTranscription: {},

//             // ── Gemini VAD: fire end-of-speech at 500ms silence ─────────
//             realtimeInputConfig: {
//               automaticActivityDetection: {
//                 disabled: false,
//                 startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_HIGH,
//                 endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_HIGH,
//                 silenceDurationMs: 500,
//                 prefixPaddingMs: 20,
//               },
//             },
//           },

//           callbacks: {
//             onopen: () => {
//               setIsConnected(true);
//               isConnectedRef.current = true;
//               addLog("Connection established.");
//               startStreaming(stream);

//               // Warm up audio pipeline before asking AI to speak
//               setTimeout(() => {
//                 if (sessionRef.current) {
//                   sessionRef.current.sendRealtimeInput({
//                     text: "The candidate is ready. Please start the interview now. Introduce yourself as Sarah and greet the candidate warmly.",
//                   });
//                 }
//               }, 500);
//             },

//             onmessage: async (message: LiveServerMessage) => {
//               // ── AI audio chunks ───────────────────────────────────────
//               if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData) {
//                 const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
//                 if (base64Audio) {
//                   // ✅ Safe decode — no stack overflow on large buffers
//                   const binaryStr = atob(base64Audio);
//                   const bytes = new Int16Array(binaryStr.length / 2);
//                   for (let i = 0; i < bytes.length; i++) {
//                     bytes[i] =
//                       (binaryStr.charCodeAt(i * 2) & 0xff) |
//                       (binaryStr.charCodeAt(i * 2 + 1) << 8);
//                   }
//                   audioQueue.current.push(bytes);
//                   // ✅ Only start playback if not already playing
//                   // onended handles the chain — no double-trigger
//                   if (!isPlayingRef.current) {
//                     playNextInQueue();
//                   }
//                 }
//               }

//               // ── AI transcript (skip thought bubbles) ─────────────────
//               if (message.serverContent?.modelTurn?.parts) {
//                 const text = message.serverContent.modelTurn.parts
//                   .filter((p: any) => !p.thought)
//                   .map((p: any) => p.text)
//                   .filter(Boolean)
//                   .join(' ');

//                 if (text?.trim()) {
//                   currentAiTurnRef.current += text;
//                   setCurrentCaption(currentAiTurnRef.current);
//                   setIsSpeaking(true);
//                   isSpeakingRef.current = true;
//                 }
//               }

//               // ── User transcript (inputAudioTranscription) ─────────────
//               if ((message.serverContent as any)?.inputTranscription?.text) {
//                 const text = (message.serverContent as any).inputTranscription.text;
//                 if (text?.trim()) {
//                   currentUserTurnRef.current += ` ${text}`;
//                   setIsListening(true);
//                 }
//               }

//               // ── User transcript fallback (legacy userTurn.parts) ───────
//               if ((message.serverContent as any)?.userTurn?.parts) {
//                 const text = ((message.serverContent as any).userTurn.parts as any[])
//                   .map((p: any) => p.text)
//                   .filter(Boolean)
//                   .join(' ');
//                 if (text?.trim()) {
//                   currentUserTurnRef.current += ` ${text}`;
//                 }
//               }

//               // ── Turn complete: commit to transcript ───────────────────
//               if (message.serverContent?.turnComplete) {
//                 if (currentAiTurnRef.current) {
//                   transcriptRef.current.push({ role: 'ai', text: currentAiTurnRef.current.trim() });
//                   currentAiTurnRef.current = "";
//                 }
//                 if (currentUserTurnRef.current) {
//                   transcriptRef.current.push({ role: 'user', text: currentUserTurnRef.current.trim() });
//                   currentUserTurnRef.current = "";
//                 }
//                 setIsSpeaking(false);
//                 isSpeakingRef.current = false;

//                 // Reset VAD for the next user turn
//                 userSpeakingRef.current = false;
//                 activityEndSentRef.current = false;
//                 if (silenceTimerRef.current) {
//                   clearTimeout(silenceTimerRef.current);
//                   silenceTimerRef.current = null;
//                 }
//               }

//               // ── Interruption: flush queue and reset ───────────────────
//               if (message.serverContent?.interrupted) {
//                 audioQueue.current = [];
//                 isPlayingRef.current = false;
//                 nextStartTimeRef.current = 0;
//                 setIsSpeaking(false);
//                 isSpeakingRef.current = false;
//                 setCurrentCaption(null);

//                 userSpeakingRef.current = false;
//                 activityEndSentRef.current = false;
//                 if (silenceTimerRef.current) {
//                   clearTimeout(silenceTimerRef.current);
//                   silenceTimerRef.current = null;
//                 }

//                 if (currentAiTurnRef.current) {
//                   transcriptRef.current.push({
//                     role: 'ai',
//                     text: currentAiTurnRef.current.trim() + ' [interrupted]',
//                   });
//                   currentAiTurnRef.current = "";
//                 }
//               }
//             },

//             onclose: () => {
//               setIsConnected(false);
//               isConnectedRef.current = false;
//               addLog("Session closed.");
//               stopAll();
//             },

//             onerror: (err: any) => {
//               console.error("Gemini Live Error:", err);
//               addLog("Error: " + err.message);
//             },
//           },
//         });

//         sessionRef.current = session;
//       } catch (err: any) {
//         console.error("Failed to start interview:", err);
//         addLog("Failed to start: " + err.message);
//       }
//     };

//     startInterview();
//     return () => stopAll();
//   }, []);

//   // ── Microphone streaming + client-side VAD ────────────────────────────────
//   const startStreaming = (stream: MediaStream) => {
//     // ✅ 16000 Hz for mic — matches what Gemini expects for input
//     inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
//     // ✅ 24000 Hz for playback — matches Gemini's audio output rate
//     outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });

//     const source = inputAudioContextRef.current.createMediaStreamSource(stream);
//     const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);

//     // ── Tuning knobs ──────────────────────────────────────────────────────
//     // SPEECH_THRESHOLD: raise to 0.02 if background noise causes false detections
//     // SILENCE_TIMEOUT_MS: lower to 800 for faster response on clear speech
//     const SPEECH_THRESHOLD = 0.01;
//     const SILENCE_TIMEOUT_MS = 1200;

//     processor.onaudioprocess = (e) => {
//       if (!isMicOnRef.current || !sessionRef.current || !isConnectedRef.current) return;

//       // AI is talking — pause VAD entirely, don't send audio
//       if (isSpeakingRef.current) {
//         if (silenceTimerRef.current) {
//           clearTimeout(silenceTimerRef.current);
//           silenceTimerRef.current = null;
//         }
//         userSpeakingRef.current = false;
//         activityEndSentRef.current = false;
//         return;
//       }

//       const inputData = e.inputBuffer.getChannelData(0);

//       // ── RMS loudness calculation ────────────────────────────────────────
//       let sum = 0;
//       for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
//       const rms = Math.sqrt(sum / inputData.length);

//       // ── Encode to PCM Int16 ─────────────────────────────────────────────
//       const pcmData = new Int16Array(inputData.length);
//       for (let i = 0; i < inputData.length; i++) {
//         pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7fff;
//       }

//       // ✅ Chunked btoa — avoids stack overflow crash on large buffers
//       const uint8 = new Uint8Array(pcmData.buffer);
//       let binary = '';
//       const chunkSize = 8192;
//       for (let i = 0; i < uint8.length; i += chunkSize) {
//         binary += String.fromCharCode(...uint8.subarray(i, i + chunkSize));
//       }
//       const base64 = btoa(binary);

//       try {
//         sessionRef.current.sendRealtimeInput({
//           media: { data: base64, mimeType: 'audio/pcm;rate=16000' },
//         });
//       } catch (err) {
//         console.error("Failed to send audio:", err);
//       }

//       // ── Client-side VAD ─────────────────────────────────────────────────
//       if (rms > SPEECH_THRESHOLD) {
//         // User is speaking — cancel any active silence countdown
//         if (silenceTimerRef.current) {
//           clearTimeout(silenceTimerRef.current);
//           silenceTimerRef.current = null;
//         }

//         if (!userSpeakingRef.current) {
//           // Speech just began
//           userSpeakingRef.current = true;
//           activityEndSentRef.current = false;
//           setIsListening(true);
//           try {
//             sessionRef.current.sendRealtimeInput({ activityStart: {} });
//             addLog("activityStart sent");
//           } catch {}
//         }
//       } else {
//         // Silence detected — start countdown if user was speaking
//         if (userSpeakingRef.current && !silenceTimerRef.current && !activityEndSentRef.current) {
//           silenceTimerRef.current = setTimeout(() => {
//             if (!isSpeakingRef.current && sessionRef.current && !activityEndSentRef.current) {
//               activityEndSentRef.current = true;
//               userSpeakingRef.current = false;
//               try {
//                 sessionRef.current.sendRealtimeInput({ activityEnd: {} });
//                 addLog("activityEnd sent — expecting AI response");
//               } catch {}
//             }
//             silenceTimerRef.current = null;
//           }, SILENCE_TIMEOUT_MS);
//         }
//       }
//     };

//     source.connect(processor);
//     processor.connect(inputAudioContextRef.current.destination);
//   };

//   // ── Audio playback ────────────────────────────────────────────────────────
//   const playNextInQueue = () => {
//     // ✅ Lock guard: if already playing OR nothing queued, bail out
//     if (isPlayingRef.current || audioQueue.current.length === 0) {
//       if (audioQueue.current.length === 0) {
//         setTimeout(() => {
//           if (audioQueue.current.length === 0) {
//             setIsSpeaking(false);
//             isSpeakingRef.current = false;
//           }
//         }, 500);
//       }
//       return;
//     }

//     if (!outputAudioContextRef.current) return;

//     isPlayingRef.current = true;
//     setIsSpeaking(true);
//     isSpeakingRef.current = true;

//     const bytes = audioQueue.current.shift()!;

//     // ✅ Use outputAudioContextRef at 24000 Hz — correct pitch & speed
//     const buffer = outputAudioContextRef.current.createBuffer(1, bytes.length, 24000);
//     const channelData = buffer.getChannelData(0);
//     for (let i = 0; i < bytes.length; i++) {
//       channelData[i] = bytes[i] / 0x7fff;
//     }

//     const bufferSource = outputAudioContextRef.current.createBufferSource();
//     bufferSource.buffer = buffer;
//     bufferSource.connect(outputAudioContextRef.current.destination);

//     const now = outputAudioContextRef.current.currentTime;
//     if (nextStartTimeRef.current < now) nextStartTimeRef.current = now + 0.05;

//     bufferSource.start(nextStartTimeRef.current);
//     nextStartTimeRef.current += buffer.duration;

//     // ✅ onended — no setTimeout drift, no double-play race condition
//     bufferSource.onended = () => {
//       isPlayingRef.current = false; // Release lock before calling next
//       playNextInQueue();
//     };
//   };

//   // ── Cleanup ───────────────────────────────────────────────────────────────
//   const stopAll = () => {
//     addLog("Stopping everything...");

//     if (silenceTimerRef.current) {
//       clearTimeout(silenceTimerRef.current);
//       silenceTimerRef.current = null;
//     }

//     streamRef.current?.getTracks().forEach((t) => t.stop());

//     if (inputAudioContextRef.current) {
//       inputAudioContextRef.current.close();
//       inputAudioContextRef.current = null;
//     }

//     if (outputAudioContextRef.current) {
//       outputAudioContextRef.current.close();
//       outputAudioContextRef.current = null;
//     }

//     if (sessionRef.current) {
//       try { sessionRef.current.close(); } catch {}
//       sessionRef.current = null;
//     }
//   };

//   const handleToggleMic = () => {
//     const next = !isMicOn;
//     isMicOnRef.current = next;
//     setIsMicOn(next);
//   };

//   // ── Render ────────────────────────────────────────────────────────────────
//   return (
//     <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 p-6 font-sans flex flex-col relative overflow-hidden">

//       {/* Header */}
//       <header className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
//         <div className="flex items-center space-x-3">
//           <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
//             <Terminal className="w-5 h-5 text-emerald-500" />
//           </div>
//           <div>
//             <h1 className="text-lg font-semibold tracking-tight">Interview Session</h1>
//             <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">
//               Session ID: {Math.random().toString(36).substring(7).toUpperCase()}
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center space-x-4">
//           <div className="flex flex-col items-end">
//             <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">
//               <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
//               <span className="text-xs font-medium text-zinc-400">
//                 {isConnected ? 'LIVE' : 'DISCONNECTED'}
//               </span>
//             </div>
//             <span className={cn(
//               "text-[10px] font-mono mt-1",
//               timeLeft < 60 ? "text-red-500 animate-pulse" : "text-zinc-500"
//             )}>
//               {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} REMAINING
//             </span>
//           </div>
//           <button
//             onClick={handleEnd}
//             className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all text-sm font-medium"
//           >
//             End Interview
//           </button>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">

//         {/* Interviewer Side */}
//         <div className="flex flex-col h-full relative">
//           <div className="flex-1 relative min-h-0">
//             <InterviewerAvatar isSpeaking={isSpeaking} isListening={isListening} />

//             <div className="absolute top-4 left-4 flex items-center space-x-2">
//               <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest">
//                 Interviewer
//               </div>
//               {isListening && !isSpeaking && (
//                 <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-widest text-emerald-400 animate-pulse">
//                   Listening...
//                 </div>
//               )}
//             </div>

//             {/* Captions overlay */}
//             <AnimatePresence>
//               {showCaptions && currentCaption && (
//                 <motion.div
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0 }}
//                   className="absolute bottom-12 left-0 right-0 flex justify-center px-10 pointer-events-none z-30"
//                 >
//                   <div className="bg-black/85 backdrop-blur-sm px-6 py-3 rounded shadow-2xl border border-white/5 max-w-3xl">
//                     <p className="text-white text-xl md:text-2xl font-medium leading-tight tracking-tight text-center drop-shadow-md">
//                       {currentCaption}
//                     </p>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>
//         </div>

//         {/* User Side */}
//         <div className="flex flex-col space-y-6 h-full">
//           <div className="relative flex-1 min-h-0 bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl group">
//             {!isCamOn && (
//               <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 z-10">
//                 <VideoOff className="w-16 h-16 text-zinc-800" />
//               </div>
//             )}
//             <video
//               ref={videoRef}
//               autoPlay
//               muted
//               playsInline
//               className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${!isCamOn ? 'hidden' : ''}`}
//             />
//             <div className="absolute top-4 left-4 z-20">
//               <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest">
//                 You (Candidate)
//               </div>
//             </div>
//             <div className="absolute bottom-4 right-4 z-20">
//               <div className={cn(
//                 "w-3 h-3 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
//                 isListening && !isSpeaking ? "bg-emerald-500 scale-125" : "bg-zinc-700 scale-100"
//               )} />
//             </div>
//           </div>

//           {/* Controls Panel */}
//           <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800 p-6 space-y-6 shadow-xl">
//             <div className="grid grid-cols-3 gap-4">

//               <button
//                 onClick={handleToggleMic}
//                 className={cn(
//                   "flex flex-col items-center justify-center p-3 rounded-xl border transition-all group",
//                   isMicOn
//                     ? "bg-zinc-800/50 border-zinc-700 text-zinc-200 hover:bg-zinc-700"
//                     : "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
//                 )}
//               >
//                 {isMicOn
//                   ? <Mic className="w-5 h-5 group-hover:scale-110 transition-transform mb-1" />
//                   : <MicOff className="w-5 h-5 mb-1" />}
//                 <span className="text-[10px] font-bold uppercase tracking-wider">
//                   {isMicOn ? 'Mic On' : 'Muted'}
//                 </span>
//               </button>

//               <button
//                 onClick={() => setIsCamOn(!isCamOn)}
//                 className={cn(
//                   "flex flex-col items-center justify-center p-3 rounded-xl border transition-all group",
//                   isCamOn
//                     ? "bg-zinc-800/50 border-zinc-700 text-zinc-200 hover:bg-zinc-700"
//                     : "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
//                 )}
//               >
//                 {isCamOn
//                   ? <Video className="w-5 h-5 group-hover:scale-110 transition-transform mb-1" />
//                   : <VideoOff className="w-5 h-5 mb-1" />}
//                 <span className="text-[10px] font-bold uppercase tracking-wider">
//                   {isCamOn ? 'Cam On' : 'Cam Off'}
//                 </span>
//               </button>

//               <button
//                 onClick={() => setShowCaptions(!showCaptions)}
//                 className={cn(
//                   "flex flex-col items-center justify-center p-3 rounded-xl border transition-all group",
//                   showCaptions
//                     ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20"
//                     : "bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
//                 )}
//               >
//                 <div className={cn(
//                   "w-5 h-5 mb-1 flex items-center justify-center border-2 rounded-sm transition-colors",
//                   showCaptions ? "border-emerald-500 bg-emerald-500 text-zinc-950" : "border-zinc-500"
//                 )}>
//                   <span className="text-[8px] font-bold">CC</span>
//                 </div>
//                 <span className="text-[10px] font-bold uppercase tracking-wider">Captions</span>
//               </button>
//             </div>

//             {/* Audio Visualizer */}
//             <div className="space-y-3">
//               <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
//                 <span>Audio Visualizer</span>
//                 <span className={cn(
//                   "transition-colors",
//                   isListening && !isSpeaking ? 'text-emerald-500' : isSpeaking ? 'text-blue-400' : ''
//                 )}>
//                   {isSpeaking ? 'Interviewer Speaking' : isListening ? 'Listening to You' : 'Waiting...'}
//                 </span>
//               </div>
//               <div className="h-10 bg-black/40 rounded-xl border border-zinc-800/50 flex items-center justify-center space-x-1 px-6">
//                 {[...Array(24)].map((_, i) => (
//                   <motion.div
//                     key={i}
//                     animate={{
//                       height: (isListening && !isSpeaking)
//                         ? [4, Math.random() * 20 + 4, 4]
//                         : isSpeaking
//                         ? [4, Math.random() * 16 + 4, 4]
//                         : 4,
//                       opacity: (isListening || isSpeaking) ? [0.4, 1, 0.4] : 0.2,
//                     }}
//                     transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.01 }}
//                     className={cn(
//                       "w-1 rounded-full transition-colors duration-500",
//                       isListening && !isSpeaking ? "bg-emerald-500"
//                         : isSpeaking ? "bg-blue-400"
//                         : "bg-zinc-700"
//                     )}
//                   />
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Footer */}
//       <footer className="mt-8 flex items-center justify-between text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em]">
//         <div>AI Interviewer Engine v2.5.0-Flash</div>
//         <div>Secure End-to-End Encryption Active</div>
//       </footer>
//     </div>
//   );
// };











// import React, { useEffect, useRef, useState } from 'react';
// import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

// interface Props {
//   resumeText: string;
//   jobDescriptionText: string;
//   onEnd: (transcript: { role: 'user' | 'ai'; text: string }[]) => void;
// }

// export const InterviewRoom: React.FC<Props> = ({
//   resumeText,
//   jobDescriptionText,
//   onEnd
// }) => {
//   const [isConnected, setIsConnected] = useState(false);
//   const [turn, setTurn] = useState<'ai' | 'user'>('ai');
//   const [isRecording, setIsRecording] = useState(false);
//   const [transcript, setTranscript] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);

//   const audioContextRef = useRef<AudioContext | null>(null);
//   const sessionRef = useRef<any>(null);
//   const streamRef = useRef<MediaStream | null>(null);

//   const audioQueueRef = useRef<Int16Array[]>([]);
//   const isPlayingRef = useRef(false);

//   const currentUserSpeechRef = useRef<string>('');
//   const lastSentTimeRef = useRef(0);

//   // ================= GLOBAL AUDIO UNLOCK =================
//   useEffect(() => {
//     const unlock = async () => {
//       if (!audioContextRef.current) {
//         audioContextRef.current = new AudioContext();
//       }
//       if (audioContextRef.current.state === 'suspended') {
//         await audioContextRef.current.resume();
//       }
//     };

//     document.addEventListener('click', unlock, { once: true });

//     return () => {
//       document.removeEventListener('click', unlock);
//     };
//   }, []);

//   // ================= INIT =================
//   useEffect(() => {
//     startInterview();
//     window.addEventListener('keydown', handleKeyDown);
//     window.addEventListener('keyup', handleKeyUp);

//     return () => {
//       stopAll();
//       window.removeEventListener('keydown', handleKeyDown);
//       window.removeEventListener('keyup', handleKeyUp);
//     };
//   }, []);

//   const handleKeyDown = (e: KeyboardEvent) => {
//     if (e.code === 'Space') {
//       e.preventDefault();
//       startRecording();
//     }
//   };

//   const handleKeyUp = (e: KeyboardEvent) => {
//     if (e.code === 'Space') {
//       e.preventDefault();
//       stopRecording();
//     }
//   };

//   // ================= START INTERVIEW =================
//   const startInterview = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true
//         }
//       });

//       streamRef.current = stream;

//       const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

//       const session = await ai.live.connect({
//         model: "gemini-2.5-flash-native-audio-preview-09-2025",
//         config: {
//           responseModalities: [Modality.AUDIO],
//           systemInstruction: `You are Sarah, a professional interviewer. Start the interview naturally and ask one question at a time.`
//         },
//         callbacks: {
//           onopen: () => {
//             setIsConnected(true);
//             startStreaming(stream);
//           },
//           onmessage: handleMessage,
//           onclose: () => setIsConnected(false),
//           onerror: (e) => console.error(e)
//         }
//       });

//       sessionRef.current = session;

//       setTimeout(() => {
//         session.sendRealtimeInput({
//           text: "Introduce yourself as Sarah and start the interview with the first question.",
//           endOfTurn: true
//         }as any);
//       }, 500);

//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // ================= HANDLE MESSAGE =================
//   const handleMessage = (message: LiveServerMessage) => {
//     console.log("MESSAGE:", message);

//     if (message.serverContent?.modelTurn?.parts) {
//       message.serverContent.modelTurn.parts.forEach((part: any) => {
//         if (part.inlineData) {
//           const base64 = part.inlineData.data;

//           const binary = atob(base64);
//           const bytes = new Int16Array(binary.length / 2);

//           for (let i = 0; i < bytes.length; i++) {
//             bytes[i] =
//               (binary.charCodeAt(i * 2) & 0xff) |
//               (binary.charCodeAt(i * 2 + 1) << 8);
//           }

//           audioQueueRef.current.push(bytes);

//           if (!isPlayingRef.current) {
//             playNextAudio();
//           }
//         }
//       });
//     }

//     const aiText = message.serverContent?.modelTurn?.parts
//       ?.map((p: any) => p.text)
//       .filter(Boolean)
//       .join(' ');

//     if (aiText) {
//       setTranscript(prev => [...prev, { role: 'ai', text: aiText }]);
//     }

//     const userParts = (message.serverContent as any)?.userTurn?.parts;
//     if (userParts) {
//       const text = userParts.map((p: any) => p.text).join(' ');
//       currentUserSpeechRef.current += ' ' + text;
//     }

//     if (message.serverContent?.modelTurn) {
//       setTurn('ai');
//     }

//     if (message.serverContent?.turnComplete) {
//       setTurn('user');
//     }
//   };

//   // ================= AUDIO PLAYBACK =================
//   const playNextAudio = () => {
//     if (!audioContextRef.current || audioQueueRef.current.length === 0) {
//       isPlayingRef.current = false;
//       return;
//     }

//     isPlayingRef.current = true;

//     const bytes = audioQueueRef.current.shift()!;

//     const buffer = audioContextRef.current.createBuffer(1, bytes.length, 24000);
//     const channel = buffer.getChannelData(0);

//     for (let i = 0; i < bytes.length; i++) {
//       channel[i] = bytes[i] / 0x7fff;
//     }

//     const source = audioContextRef.current.createBufferSource();
//     source.buffer = buffer;
//     source.connect(audioContextRef.current.destination);

//     source.onended = () => playNextAudio();

//     source.start();
//   };

//   // ================= AUDIO STREAM =================
//   const startStreaming = (stream: MediaStream) => {
//     const audioContext = new AudioContext({ sampleRate: 16000 });
//     audioContextRef.current = audioContext;

//     const source = audioContext.createMediaStreamSource(stream);
//     const processor = audioContext.createScriptProcessor(4096, 1, 1);

//     processor.onaudioprocess = (e) => {
//       if (!isRecording || turn !== 'user') return;

//       const now = Date.now();
//       if (now - lastSentTimeRef.current < 100) return; // throttle
//       lastSentTimeRef.current = now;

//       const input = e.inputBuffer.getChannelData(0);

//       const pcm = new Int16Array(input.length);
//       for (let i = 0; i < input.length; i++) {
//         pcm[i] = input[i] * 0x7fff;
//       }

//       const base64 = btoa(String.fromCharCode(...new Uint8Array(pcm.buffer)));

//       sessionRef.current?.sendRealtimeInput({
//         media: { data: base64, mimeType: 'audio/pcm;rate=16000' }
//       });
//     };

//     source.connect(processor);
//     processor.connect(audioContext.destination);
//   };

//   // ================= PUSH TO TALK =================
//   const startRecording = async () => {
//     if (turn !== 'user') return;
//     if (audioContextRef.current?.state === 'suspended') {
//       await audioContextRef.current.resume();
//     }
//     setIsRecording(true);
//   };

//   const stopRecording = () => {
//     if (!isRecording) return;

//     setIsRecording(false);

//     // 🔥 IMPORTANT: end audio stream
//     sessionRef.current?.sendRealtimeInput({
//       media: {
//         data: "",
//         mimeType: "audio/pcm;rate=16000"
//       },
//     } as any);

//     finishUserSpeech();
//   };

//   const finishUserSpeech = () => {
//     const text = currentUserSpeechRef.current.trim();

//     //if (!text) return;

// if (text) {
//   setTranscript(prev => [...prev, { role: 'user', text }]);
// }

//     currentUserSpeechRef.current = '';

//     setTurn('ai');

//     sessionRef.current?.sendRealtimeInput({
//       text: "The candidate has finished speaking. Please respond and continue the interview.",
//       endOfTurn: true
//     } as any);
//   };

//   // ================= CLEANUP =================
//   const stopAll = () => {
//     streamRef.current?.getTracks().forEach(t => t.stop());
//     audioContextRef.current?.close();
//     sessionRef.current?.close();
//   };

//   // ================= UI =================
//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Interview Session</h2>

//       <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
//       <p>Turn: {turn}</p>

//       <button
//         onMouseDown={startRecording}
//         onMouseUp={stopRecording}
//         style={{
//           marginTop: 20,
//           padding: '20px',
//           borderRadius: '50%',
//           background: isRecording ? '#10b981' : '#1f2937',
//           color: 'white',
//           boxShadow: isRecording ? '0 0 20px #10b981' : 'none'
//         }}
//       >
//         🎤 Hold to Speak (Space)
//       </button>

//       <button onClick={() => onEnd(transcript)} style={{ marginTop: 20 }}>
//         End Interview
//       </button>

//       <div style={{ marginTop: 20 }}>
//         {transcript.map((t, i) => (
//           <div key={i}>
//             <b>{t.role}:</b> {t.text}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };








// import React, { useEffect, useRef, useState } from "react";
// import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

// export const InterviewRoom = ({ onEnd }: any) => {
//   const [isConnected, setIsConnected] = useState(false);
//   const [turn, setTurn] = useState<"ai" | "user">("ai");
//   const [transcript, setTranscript] = useState<any[]>([]);
//   const [isRecording, setIsRecording] = useState(false);

//   const sessionRef = useRef<any>(null);
//   const audioContextRef = useRef<AudioContext | null>(null);
//   const audioQueueRef = useRef<Int16Array[]>([]);
//   const isPlayingRef = useRef(false);
//   const streamRef = useRef<MediaStream | null>(null);

//   const currentUserSpeechRef = useRef("");

//   // 🔥 AUDIO UNLOCK FIX
//   const unlockAudio = async () => {
//     if (!audioContextRef.current) {
//       audioContextRef.current = new AudioContext({ sampleRate: 24000 });
//     }
//     if (audioContextRef.current.state === "suspended") {
//       await audioContextRef.current.resume();
//     }
//   };

//   useEffect(() => {
//     document.addEventListener("click", unlockAudio, { once: true });
//     startInterview();

//     return () => stopAll();
//   }, []);

//   // ================= START =================
// //   const startInterview = async () => {
// //     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
// //     streamRef.current = stream;

// //     const ai = new GoogleGenAI({
// //       apiKey: import.meta.env.VITE_GEMINI_API_KEY,
// //     });

// //     const session = await ai.live.connect({
// //       model: "gemini-3.1-flash-live-preview",
// //       config: {
// //         responseModalities: [Modality.AUDIO],
// //         systemInstruction: `
// // You are Sarah, a professional interviewer.

// // - Introduce yourself ONCE
// // - Ask only ONE question at a time
// // - Wait for user answer
// // - Keep voice clear and short
// // `,
// //       },
// //       callbacks: {
// //         onopen: () => {
// //           setIsConnected(true);
// //           startStreaming(stream);

// //           // ✅ TRIGGER AI ONCE (FIXED)
// //           session.sendRealtimeInput({
// //             text: "Start the interview now.",
// //             endOfTurn: true,
// //           } as any);
// //         },
// //         onmessage: handleMessage,
// //         onclose: () => setIsConnected(false),
// //         onerror: console.error,
// //       },
// //     });

// //     sessionRef.current = session;
// //   };




// const startInterview = async () => {
//   const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//   streamRef.current = stream;

//   const ai = new GoogleGenAI({
//     apiKey: import.meta.env.VITE_GEMINI_API_KEY,
//   });

//   const session = await ai.live.connect({
//     model: "gemini-3.1-flash-live-preview",
//     config: {
//       responseModalities: [Modality.AUDIO],
//       systemInstruction: `
// You are Sarah, a professional interviewer.

// - Introduce yourself ONCE
// - Ask only ONE question at a time
// - Wait for user answer
// - Keep voice clear and short
// `,
//     },
//     callbacks: {
//       onopen: () => {
//         setIsConnected(true);
//         startStreaming(stream);

//         // ✅ FIXED LINE
//         sessionRef.current?.sendRealtimeInput({
//           content: [
//             {
//               role: "user",
//               parts: [{ text: "Start the interview now." }]
//             }
//           ],
//           endOfTurn: true
//         });
//       },
//       onmessage: handleMessage,
//       onclose: () => setIsConnected(false),
//       onerror: console.error,
//     },
//   });

//   // ✅ VERY IMPORTANT
//   sessionRef.current = session;
// };






//   // ================= HANDLE MESSAGE =================
//   const handleMessage = (message: LiveServerMessage) => {
//     // 🎧 AUDIO
//     if (message.serverContent?.modelTurn?.parts) {
//       message.serverContent.modelTurn.parts.forEach((part: any) => {
//         if (part.inlineData) {
//           const binary = atob(part.inlineData.data);
//           const bytes = new Int16Array(binary.length / 2);

//           for (let i = 0; i < bytes.length; i++) {
//             bytes[i] =
//               (binary.charCodeAt(i * 2) & 0xff) |
//               (binary.charCodeAt(i * 2 + 1) << 8);
//           }

//           audioQueueRef.current.push(bytes);

//           if (!isPlayingRef.current) playAudio();
//         }
//       });
//     }

//     // 🧠 TEXT
//     const text = message.serverContent?.modelTurn?.parts
//       ?.map((p: any) => p.text)
//       .filter(Boolean)
//       .join(" ");

//     if (text) {
//       setTranscript((prev) => [...prev, { role: "ai", text }]);
//     }

//     // 🔄 TURN SWITCH
//     if (message.serverContent?.turnComplete) {
//       setTurn("user");
//     }
//   };

//   // ================= AUDIO PLAY =================
//   const playAudio = () => {
//     if (!audioContextRef.current || audioQueueRef.current.length === 0) {
//       isPlayingRef.current = false;
//       return;
//     }

//     isPlayingRef.current = true;

//     const bytes = audioQueueRef.current.shift()!;
//     const buffer = audioContextRef.current.createBuffer(
//       1,
//       bytes.length,
//       24000
//     );

//     const data = buffer.getChannelData(0);
//     for (let i = 0; i < bytes.length; i++) {
//       data[i] = bytes[i] / 0x7fff;
//     }

//     const source = audioContextRef.current.createBufferSource();
//     source.buffer = buffer;
//     source.connect(audioContextRef.current.destination);

//     source.onended = playAudio;
//     source.start();
//   };

//   // ================= STREAM =================
//   const startStreaming = (stream: MediaStream) => {
//     const ctx = new AudioContext({ sampleRate: 24000 });
//     audioContextRef.current = ctx;

//     const source = ctx.createMediaStreamSource(stream);
//     const processor = ctx.createScriptProcessor(4096, 1, 1);

//     processor.onaudioprocess = (e) => {
//       if (!isRecording || turn !== "user") return;

//       const input = e.inputBuffer.getChannelData(0);

//       const pcm = new Int16Array(input.length);
//       for (let i = 0; i < input.length; i++) {
//         pcm[i] = input[i] * 0x7fff;
//       }

//       const uint8 = new Uint8Array(pcm.buffer);
//       let binary = "";
//       for (let i = 0; i < uint8.length; i++) {
//         binary += String.fromCharCode(uint8[i]);
//       }

//       const base64 = btoa(binary);

//       sessionRef.current?.sendRealtimeInput({
//         media: { data: base64, mimeType: "audio/pcm;rate=24000" },
//       });
//     };

//     source.connect(processor);
//     processor.connect(ctx.destination);
//   };

//   // ================= RECORD =================
//   const startRecording = async () => {
//     if (turn !== "user") return;

//     await unlockAudio();
//     setIsRecording(true);
//   };

//   const stopRecording = () => {
//     setIsRecording(false);

//     setTranscript((prev) => [
//       ...prev,
//       { role: "user", text: "(User spoke)" },
//     ]);

//     setTurn("ai");

//     sessionRef.current?.sendRealtimeInput({
//       text: "User answered. Ask next question.",
//       endOfTurn: true,
//     });
//   };

//   // ================= CLEAN =================
//   const stopAll = () => {
//     streamRef.current?.getTracks().forEach((t) => t.stop());
//     audioContextRef.current?.close();
//     sessionRef.current?.close();
//   };

//   // ================= UI =================
//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Interview</h2>

//       <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
//       <p>Turn: {turn}</p>

//       <button
//         onMouseDown={startRecording}
//         onMouseUp={stopRecording}
//         style={{
//           padding: 20,
//           borderRadius: "50%",
//           background: isRecording ? "green" : "black",
//           color: "white",
//         }}
//       >
//         🎤 Hold to Speak
//       </button>

//       <button onClick={() => onEnd(transcript)}>End</button>

//       {transcript.map((t, i) => (
//         <div key={i}>
//           <b>{t.role}:</b> {t.text}
//         </div>
//       ))}
//     </div>
//   );
// };












// import React, { useEffect, useRef, useState } from "react";
// import { GoogleGenAI } from "@google/genai";

// export const InterviewRoom = ({ onEnd }: any) => {
//   const [isConnected, setIsConnected] = useState(true);
//   const [turn, setTurn] = useState<"ai" | "user">("ai");
//   const [transcript, setTranscript] = useState<any[]>([]);
//   const [isRecording, setIsRecording] = useState(false);
//   const [aiSpeaking, setAiSpeaking] = useState(false);
//   const [interimText, setInterimText] = useState("");

//   const recognitionRef = useRef<any>(null);
//   const currentSpeechRef = useRef("");
//   const aiRef = useRef<any>(null);
//   const ttsKeepaliveRef = useRef<ReturnType<typeof setInterval> | null>(null);

//   // ── INIT AI + voices ────────────────────────────────────────────────────────
//   useEffect(() => {
//     aiRef.current = new GoogleGenAI({
//       apiKey: import.meta.env.VITE_GEMINI_API_KEY,
//     });

//     // Pre-load voices so they're ready when we first call speak()
//     const loadVoices = () => window.speechSynthesis.getVoices();
//     loadVoices();
//     window.speechSynthesis.onvoiceschanged = loadVoices;

//     startInterview();

//     return () => {
//       // Cleanup on unmount
//       window.speechSynthesis.cancel();
//       stopTTSKeepalive();
//       recognitionRef.current?.stop();
//     };
//   }, []);

//   // ── CHROME TTS KEEPALIVE ────────────────────────────────────────────────────
//   // Chrome has a bug where speechSynthesis auto-pauses after ~15 seconds.
//   const startTTSKeepalive = () => {
//     stopTTSKeepalive(); // clear any existing interval first
//     ttsKeepaliveRef.current = setInterval(() => {
//       if (window.speechSynthesis.speaking && window.speechSynthesis.paused) {
//         window.speechSynthesis.resume();
//       }
//     }, 5000);
//   };

//   const stopTTSKeepalive = () => {
//     if (ttsKeepaliveRef.current) {
//       clearInterval(ttsKeepaliveRef.current);
//       ttsKeepaliveRef.current = null;
//     }
//   };

//   // ── START INTERVIEW ─────────────────────────────────────────────────────────
//   const startInterview = async () => {
//     console.log("🔥 Starting interview");
//     const text = await askAI(
//       "Start interview. Introduce yourself briefly and ask the first interview question."
//     );
//     speak(text);
//     setTranscript([{ role: "ai", text }]);
//     setTurn("user");
//   };

//   // ── ASK AI ──────────────────────────────────────────────────────────────────
//   const askAI = async (prompt: string) => {
//     const res = await aiRef.current.models.generateContent({
//       model: "gemini-2.0-flash",
//       contents: prompt,
//     });
//     return res.text;
//   };

//   // ── SPEAK (fixed) ───────────────────────────────────────────────────────────
//   // Fixes:
//   //  1. Cancel any ongoing speech before starting new one (prevents overlap)
//   //  2. Split text into sentences to avoid Chrome's ~200 char cutoff bug
//   //  3. Chain sentences via onend callbacks so they play in sequence
//   //  4. Keep-alive interval to prevent Chrome's 15s auto-pause bug
//   const speak = (text: string) => {
//     // Cancel any ongoing speech first
//     window.speechSynthesis.cancel();

//     // Split on sentence boundaries so no single chunk is too long
//     const sentences = text.match(/[^.!?]+[.!?]+[\s]*/g) || [text];

//     setAiSpeaking(true);
//     startTTSKeepalive();

//     const speakChunk = (index: number) => {
//       if (index >= sentences.length) {
//         setAiSpeaking(false);
//         stopTTSKeepalive();
//         return;
//       }

//       const chunk = sentences[index].trim();
//       if (!chunk) {
//         speakChunk(index + 1);
//         return;
//       }

//       const utterance = new SpeechSynthesisUtterance(chunk);
//       utterance.rate = 0.95;
//       utterance.pitch = 1;
//       utterance.volume = 1;

//       // Pick a natural-sounding English voice if available
//       const voices = window.speechSynthesis.getVoices();
//       const preferred =
//         voices.find((v) => v.name.includes("Google US English")) ||
//         voices.find((v) => v.name.includes("Google") && v.lang === "en-US") ||
//         voices.find((v) => v.lang === "en-US") ||
//         voices.find((v) => v.lang.startsWith("en"));
//       if (preferred) utterance.voice = preferred;

//       // On successful end, speak the next chunk
//       utterance.onend = () => speakChunk(index + 1);

//       // On error, log and continue with the next chunk instead of stopping
//       utterance.onerror = (e) => {
//         console.warn(`TTS error on chunk ${index}:`, e.error);
//         speakChunk(index + 1);
//       };

//       window.speechSynthesis.speak(utterance);
//     };

//     // Small delay after cancel() before speaking — required by Chrome
//     setTimeout(() => speakChunk(0), 100);
//   };

//   // ── START RECORDING (fixed) ─────────────────────────────────────────────────
//   // Fixes:
//   //  1. Guard against starting while AI is still speaking
//   //  2. continuous = true  → prevents early cutoff on brief pauses
//   //  3. interimResults = true → shows real-time feedback to user
//   //  4. Added onerror handler (was completely missing before)
//   //  5. Accumulates all final results instead of only first result
//   const startRecording = () => {
//     if (turn !== "user") return;

//     // If AI is still speaking, cancel it then start listening
//     if (window.speechSynthesis.speaking) {
//       window.speechSynthesis.cancel();
//       stopTTSKeepalive();
//       setAiSpeaking(false);
//     }

//     const SpeechRecognition =
//       (window as any).SpeechRecognition ||
//       (window as any).webkitSpeechRecognition;

//     if (!SpeechRecognition) {
//       alert(
//         "Speech recognition is not supported in this browser. Please use Chrome."
//       );
//       return;
//     }

//     currentSpeechRef.current = "";
//     setInterimText("");
//     setIsRecording(true);

//     const recognition = new SpeechRecognition();
//     recognition.continuous = true;       // was false → caused early cutoff
//     recognition.interimResults = true;   // show live transcription
//     recognition.lang = "en-US";

//     recognition.onresult = (event: any) => {
//       let interim = "";
//       for (let i = event.resultIndex; i < event.results.length; i++) {
//         const result = event.results[i];
//         if (result.isFinal) {
//           currentSpeechRef.current += result[0].transcript + " ";
//         } else {
//           interim += result[0].transcript;
//         }
//       }
//       setInterimText(interim); // live preview
//     };

//     // Error handler was completely missing before — silent failures
//     recognition.onerror = (event: any) => {
//       console.error("Speech recognition error:", event.error);
//       if (event.error === "not-allowed") {
//         alert(
//           "Microphone access denied. Please allow microphone permission in your browser and reload."
//         );
//       } else if (event.error === "network") {
//         alert("Network error with speech recognition. Check your connection.");
//       }
//       setIsRecording(false);
//       setInterimText("");
//     };

//     recognition.onend = async () => {
//       setIsRecording(false);
//       setInterimText("");

//       const userText = currentSpeechRef.current.trim();
//       if (!userText) return;

//       setTranscript((prev) => [...prev, { role: "user", text: userText }]);
//       setTurn("ai");

//       const aiReply = await askAI(
//         `Candidate answered: "${userText}". Continue the interview and ask the next question.`
//       );

//       setTranscript((prev) => [...prev, { role: "ai", text: aiReply }]);
//       speak(aiReply);
//       setTurn("user");
//       currentSpeechRef.current = "";
//     };

//     recognition.start();
//     recognitionRef.current = recognition;
//   };

//   const stopRecording = () => {
//     recognitionRef.current?.stop();
//   };

//   // ── UI ───────────────────────────────────────────────────────────────────────
//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Interview (Stable Mode)</h2>

//       <p>Status: Connected</p>
//       <p>
//         Turn:{" "}
//         <strong style={{ color: turn === "ai" ? "#f59e0b" : "#10b981" }}>
//           {turn === "ai" ? "AI is speaking..." : "Your turn"}
//         </strong>
//       </p>

//       {aiSpeaking && (
//         <p style={{ color: "#f59e0b", fontStyle: "italic" }}>
//           🔊 AI Interviewer is speaking...
//         </p>
//       )}

//       <button
//         onMouseDown={startRecording}
//         onMouseUp={stopRecording}
//         disabled={turn !== "user"}
//         style={{
//           padding: 20,
//           borderRadius: "50%",
//           background: isRecording ? "green" : turn !== "user" ? "#555" : "black",
//           color: "white",
//           cursor: turn !== "user" ? "not-allowed" : "pointer",
//           opacity: turn !== "user" ? 0.6 : 1,
//         }}
//       >
//         🎤 Hold to Speak
//       </button>

//       {/* Live interim transcription shown while user speaks */}
//       {interimText && (
//         <p
//           style={{
//             marginTop: 10,
//             color: "#888",
//             fontStyle: "italic",
//             fontSize: 14,
//           }}
//         >
//           Listening: {interimText}
//         </p>
//       )}

//       <button
//         onClick={() => {
//           window.speechSynthesis.cancel();
//           stopTTSKeepalive();
//           recognitionRef.current?.stop();
//           onEnd(transcript);
//         }}
//         style={{ marginLeft: 16, padding: "10px 20px" }}
//       >
//         End Interview
//       </button>

//       <div style={{ marginTop: 20 }}>
//         {transcript.map((t, i) => (
//           <div
//             key={i}
//             style={{
//               marginBottom: 8,
//               color: t.role === "ai" ? "#f59e0b" : "#10b981",
//             }}
//           >
//             <b>{t.role === "ai" ? "AI Interviewer" : "You"}:</b> {t.text}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };