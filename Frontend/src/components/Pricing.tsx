import React, { useState } from 'react';
import { Check, Zap, Star, Crown, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    displayPrice: '₹0',
    description: 'Perfect for a quick practice session.',
    features: ['2 Mock Interview / month', 'Basic Feedback', 'Standard AI Voice', 'Email Support'],
    icon: Zap,
    color: 'text-zinc-400',
    buttonText: 'Current Plan',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 299,
    displayPrice: '₹299',
    description: 'For serious job seekers.',
    features: ['15 Mock Interviews', 'Detailed AI Feedback', 'Premium AI Voices', 'Transcript History', 'UPI & Card Support'],
    icon: Star,
    color: 'text-emerald-500',
    buttonText: 'Upgrade to Pro',
    popular: true,
  },
  {
    id: 'custom',
    name: 'Custom',
    price: 499,
    displayPrice: '₹499',
    description: 'For teams and organizations.',
    features: ['25 Mock Interviews','Custom Interview Personas', 'Team Analytics',  'Dedicated Account Manager',],
    icon: Crown,
    color: 'text-blue-500',
    buttonText: 'Upgrade to Custom',
  },
];

export const Pricing = ({ onSignInClick }: { onSignInClick?: () => void }) => {
  const { user, signIn } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const getButtonState = (planId: string) => {
    if (!user) return { text: planId === 'free' ? 'Current Plan' : `Upgrade to ${planId.charAt(0).toUpperCase() + planId.slice(1)}`, disabled: false };
    
    if (user.plan === planId) return { text: 'Current Plan', disabled: true };
    
    if (user.plan === 'custom') return { text: 'Included', disabled: true };
    
    if (user.plan === 'pro' && planId === 'free') return { text: 'Included', disabled: true };
    
    return { text: `Upgrade to ${planId.charAt(0).toUpperCase() + planId.slice(1)}`, disabled: false };
  };

  const handleUpgrade = async (plan: typeof plans[0]) => {
    if (!user) {
      alert("you are not logged in first login and then access the features");
      onSignInClick?.();
      return;
    }

    if (user.plan === plan.id) {
      return;
    }

    if (plan.id === 'free') return;

    setProcessingId(plan.id);

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ planId: plan.id }),
      });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch (e) {
          const text = await res.text();
          console.error("Non-JSON error response:", text);
          throw new Error(`Server error: ${res.status} ${res.statusText}`);
        }
        throw new Error(errorData.message || "Failed to create subscription");
      }

      let data;
      try {
        data = await res.json();
      } catch (e) {
        const text = await res.text();
        console.error("Non-JSON success response:", text);
        throw new Error("Invalid response from server");
      }
      const { subscriptionId } = data;

const key = import.meta.env.VITE_RAZORPAY_KEY_ID;

if (!key) {
  alert("Razorpay key missing");
  return;
}

      const options = {
        key: key,
        subscription_id: subscriptionId,
        name: "InterviewPro AI",
        description: `Upgrade to ${plan.name} Plan`,
        handler: async (response: any) => {
          // Sync subscription status from server
          try {
            const token = localStorage.getItem('token');
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) {
              headers['Authorization'] = `Bearer ${token}`;
            }

            // Give Razorpay a moment to process
            await new Promise(resolve => setTimeout(resolve, 1500));

            const syncRes = await fetch('/api/subscriptions/sync', {
              method: 'POST',
              headers,
              credentials: 'include'
            });
            
            if (syncRes.ok) {
              const syncData = await syncRes.json();
              if (syncData.success) {
                signIn(syncData.user, syncData.token || token || undefined);
                alert("Payment successful! Your " + syncData.user.plan.toUpperCase() + " plan is now active.");
                return;
              }
            }
            
            // Fallback to /me if sync fails or is not yet active
            const meRes = await fetch('/api/auth/me', { 
              headers,
              credentials: 'include'
            });
            if (meRes.ok) {
              const meData = await meRes.json();
              signIn(meData.user, meData.token || token || undefined);
              if (meData.user.plan !== 'free') {
                alert("Payment successful! Your plan is now active.");
              } else {
                alert("Payment received! It may take a minute for your plan to activate. Please refresh if it doesn't update shortly.");
              }
            }
          } catch (err) {
            console.error("Sync error:", err);
            alert("Payment successful! Please refresh the page if your plan doesn't update automatically.");
          }
        },
        config: {
          display: {
            blocks: {
              banks: {
                name: 'All payment methods',
                instruments: [
                  {
                    method: 'upi'
                  },
                  {
                    method: 'card'
                  },
                  {
                    method: 'netbanking'
                  }
                ]
              }
            },
            sequence: ['block.banks'],
            preferences: {
              show_default_blocks: true
            }
          }
        },
        prefill: {
          name: user.name || "",
          email: user.email,
          contact: user.phone || "",
          method: 'upi'
        },
        theme: {
          color: "#10b981",
        },
      };

      if (!(window as any).Razorpay) {
  alert("Razorpay SDK not loaded. Please refresh.");
  return;
}


      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error("Payment error:", err);
      alert(err.message || "Failed to initiate payment. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <section id="pricing" className="py-24 relative px-4 md:px-0">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Simple, Transparent Pricing</h2>
        <p className="text-zinc-400 max-w-2xl mx-auto text-sm md:text-base mb-8">
          Choose the plan that's right for your career goals. No hidden fees.
        </p>

        {user && user.plan !== 'free' && (
          <div className="max-w-md mx-auto mb-12 p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Star className="w-5 h-5 text-emerald-500 fill-emerald-500" />
              <span className="font-bold text-emerald-500 uppercase tracking-widest text-sm">Active Subscription</span>
            </div>
            <h3 className="text-xl font-bold mb-1">{user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} Plan</h3>
            <p className="text-zinc-500 text-sm">
              Paid via <span className="text-white font-medium uppercase">{user.payment_method || 'Card/UPI'}</span>
            </p>
          </div>
        )}

        <div className="flex items-center justify-center space-x-6 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex flex-col items-center">
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-6 mb-1" referrerPolicy="no-referrer" />
            <span className="text-[10px] uppercase tracking-widest font-bold">UPI</span>
          </div>
          <div className="flex flex-col items-center">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 mb-2" referrerPolicy="no-referrer" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Cards</span>
          </div>
          <div className="flex flex-col items-center">
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 mb-1" referrerPolicy="no-referrer" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Netbanking</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isActive = selectedPlan === plan.name;
          return (
            <div
              key={plan.name}
              onClick={() => setSelectedPlan(plan.name)}
              className={cn(
                "relative p-8 rounded-3xl border transition-all duration-300 cursor-pointer",
                isActive 
                  ? "bg-zinc-900 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.1)] md:scale-105 z-10" 
                  : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              {plan.id !== 'free' && (
                <div className="absolute top-4 right-4 flex items-center space-x-1 px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-3" referrerPolicy="no-referrer" />
                  <span className="text-[8px] font-bold text-zinc-400">UPI</span>
                </div>
              )}

              <div className="flex items-center justify-between mb-8">
                <div className={cn("p-3 rounded-2xl bg-zinc-800", plan.color)}>
                  <plan.icon className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{plan.displayPrice}</div>
                  {plan.id !== 'free' && <div className="text-xs text-zinc-500">monthly</div>}
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-sm text-zinc-500 mb-8">{plan.description}</p>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center space-x-3 text-sm text-zinc-300">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpgrade(plan);
                }}
                disabled={processingId === plan.id || getButtonState(plan.id).disabled}
                className={cn(
                  "w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center space-x-2",
                  getButtonState(plan.id).disabled
                    ? "bg-zinc-800 text-zinc-500 cursor-default"
                    : isActive
                    ? "bg-emerald-500 text-black hover:bg-emerald-400"
                    : "bg-zinc-800 text-white hover:bg-zinc-700"
                )}
              >
                {processingId === plan.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  getButtonState(plan.id).text
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
