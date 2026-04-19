import React, { useEffect, useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle, TrendingUp, Award, ArrowLeft, Loader2, Star, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';


interface FeedbackPageProps {
  transcript: { role: 'user' | 'ai', text: string }[];
  resumeText: string;
  jobDescriptionText: string;
  onBack: () => void;
}

interface FeedbackData {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  improvementTips: string[];
  detailedAnalysis: string;
}

export const FeedbackPage: React.FC<FeedbackPageProps> = ({
  transcript,
  resumeText,
  jobDescriptionText,
  onBack,
}) => {
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateFeedback = async () => {
      if (transcript.length === 0) {
        setError("No interview data found to generate feedback.");
        setLoading(false);
        return;
      }

      try {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
        
        const prompt = `
          You are an expert interview coach. Analyze the following interview transcript between an AI Interviewer (Sarah) and a Candidate.
          
          CANDIDATE RESUME: ${resumeText}
          JOB DESCRIPTION: ${jobDescriptionText}
          
          TRANSCRIPT:
          ${transcript.map(t => `${t.role === 'ai' ? 'Sarah' : 'Candidate'}: ${t.text}`).join('\n')}
          
          Provide a detailed feedback report in JSON format.
        `;

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                overallScore: { type: Type.NUMBER, description: "Score from 0 to 100" },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 3-4 key strengths observed" },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 2-3 areas for improvement" },
                improvementTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actionable tips for the next interview" },
                detailedAnalysis: { type: Type.STRING, description: "A few paragraphs of detailed qualitative analysis" }
              },
              required: ["overallScore", "strengths", "weaknesses", "improvementTips", "detailedAnalysis"]
            }
          }
        });

        let data: FeedbackData;
        try {
          const text = response.text || '{}';
          // Clean up potential markdown code blocks if they exist
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          const jsonString = jsonMatch ? jsonMatch[0] : text;
          data = JSON.parse(jsonString);
        } catch (parseErr) {
          console.error("Failed to parse AI response as JSON:", response.text);
          throw new Error("Invalid feedback format received from AI.");
        }

        setFeedback(data);

        // Save to database
        try {
          const token = localStorage.getItem('token');
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          await fetch('/api/interviews', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              transcript,
              resumeText,
              jobDescriptionText,
              feedback: data
            })
          });
        } catch (saveErr) {
          console.error("Failed to save interview to history:", saveErr);
        }
      } catch (err: any) {
        console.error("Feedback generation failed:", err);
        setError("Failed to generate feedback. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    generateFeedback();
  }, [transcript, resumeText, jobDescriptionText]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
          <div className="relative flex flex-col items-center space-y-6">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight mb-2">Analyzing Your Performance</h2>
              <p className="text-zinc-500 max-w-xs">Our AI is reviewing your responses and comparing them to industry standards...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !feedback) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 max-w-md text-center space-y-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <div>
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-zinc-400">{error || "We couldn't generate your feedback report."}</p>
          </div>
          <button
            onClick={onBack}
            className="w-full py-3 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-12">
      <div className="max-w-5xl mx-auto space-y-12 pb-24">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <button 
              onClick={onBack}
              className="flex items-center text-zinc-500 hover:text-white transition-colors text-sm font-medium mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Start
            </button>
            <h1 className="text-4xl font-bold tracking-tight">Interview Feedback</h1>
            <p className="text-zinc-400">Comprehensive analysis of your performance with Sarah.</p>
          </div>
          
          <div className="flex items-center space-x-4 bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-zinc-800"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 36}
                  strokeDashoffset={2 * Math.PI * 36 * (1 - feedback.overallScore / 100)}
                  className="text-emerald-500"
                />
              </svg>
              <span className="absolute text-xl font-bold">{feedback.overallScore}</span>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Overall Score</div>
              <div className="text-sm font-medium text-emerald-500">
                {feedback.overallScore >= 80 ? 'Excellent Performance' : feedback.overallScore >= 60 ? 'Good Progress' : 'Needs Practice'}
              </div>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Analysis */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8 space-y-6">
              <div className="flex items-center space-x-3">
                < Award className="w-6 h-6 text-emerald-500" />
                <h2 className="text-xl font-bold">Detailed Analysis</h2>
              </div>
              <div className="prose prose-invert max-w-none text-zinc-400 leading-relaxed">
                {feedback.detailedAnalysis.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </section>

            <section className="grid md:grid-cols-2 gap-6">
              <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8 space-y-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-lg font-bold">Key Strengths</h2>
                </div>
                <ul className="space-y-4">
                  {feedback.strengths.map((s, i) => (
                    <li key={i} className="flex items-start space-x-3 text-sm text-zinc-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8 space-y-6">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <h2 className="text-lg font-bold">Areas for Growth</h2>
                </div>
                <ul className="space-y-4">
                  {feedback.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start space-x-3 text-sm text-zinc-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <section className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-8 space-y-6">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-bold">Actionable Tips</h2>
              </div>
              <div className="space-y-6">
                {feedback.improvementTips.map((tip, i) => (
                  <div key={i} className="space-y-2">
                    <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Tip #{i + 1}</div>
                    <p className="text-sm text-zinc-400 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8 text-center space-y-4">
              <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto">
                <Star className="w-6 h-6 text-yellow-500" />
              </div>
              <h3 className="font-bold">Ready for another round?</h3>
              <p className="text-xs text-zinc-500">Practice makes perfect. Try another session to see your score improve.</p>
              <button
                onClick={onBack}
                className="w-full py-3 rounded-xl bg-white text-black text-sm font-bold hover:bg-zinc-200 transition-all"
              >
                Start New Session
              </button>
            </section>
          </div>
        </div>

        {/* Transcript Section */}
        <section className="bg-zinc-900/30 border border-zinc-800 rounded-3xl overflow-hidden">
          <div className="p-8 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-bold">Interview Transcript</h2>
            </div>
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
              {transcript.length} Exchanges
            </div>
          </div>
          <div className="p-8 max-h-[600px] overflow-y-auto custom-scrollbar space-y-6">
            {transcript.map((entry, i) => (
              <div key={i} className={cn(
                "flex flex-col space-y-2",
                entry.role === 'user' ? "items-end" : "items-start"
              )}>
                <div className="flex items-center space-x-2">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
                    entry.role === 'user' ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                  )}>
                    {entry.role === 'user' ? 'You' : 'Sarah'}
                  </span>
                </div>
                <div className={cn(
                  "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                  entry.role === 'user' 
                    ? "bg-zinc-800 text-zinc-200 rounded-tr-none" 
                    : "bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none"
                )}>
                  {entry.text}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
