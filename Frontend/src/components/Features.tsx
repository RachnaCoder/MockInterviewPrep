import React from 'react';
import { User, Briefcase, Zap, Shield, Cpu, BarChart3 } from 'lucide-react';

const features = [
  {
    title: 'Realistic AI Avatar',
    description: 'Interact with a high-fidelity AI interviewer that reacts to your answers in real-time with natural body language.',
    icon: User,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    title: 'Contextual Questions',
    description: 'Questions are dynamically generated based on your specific experience and the job requirements you provide.',
    icon: Briefcase,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    title: 'Instant Feedback',
    description: 'Receive a comprehensive breakdown of your performance, including score, strengths, and areas for improvement.',
    icon: Zap,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
  },
  {
    title: 'Privacy First',
    description: 'Your data is encrypted and never shared. We prioritize your privacy and security throughout the entire process.',
    icon: Shield,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    title: 'Gemini 2.5 Engine',
    description: 'Powered by the latest Gemini 2.5 Flash model for ultra-low latency and highly intelligent conversation.',
    icon: Cpu,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
  },
  {
    title: 'Performance Tracking',
    description: 'Track your progress over time with detailed analytics and see how your interview skills are evolving.',
    icon: BarChart3,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 border-t border-zinc-800">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold tracking-tight mb-4">Advanced Interview Features</h2>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          Everything you need to ace your next big interview, powered by cutting-edge artificial intelligence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="p-6 md:p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all group"
          >
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl ${feature.bg} flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform`}>
              <feature.icon className={`w-5 h-5 md:w-6 md:h-6 ${feature.color}`} />
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">{feature.title}</h3>
            <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
