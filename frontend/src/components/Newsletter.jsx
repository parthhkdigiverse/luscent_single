import React, { useState } from "react";
import { Button } from "./Button";
import { Send, CheckCircle2 } from "lucide-react";

export const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email) {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/subscribe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });
        
        if (response.ok) {
          setSubscribed(true);
          setEmail("");
        } else {
          setError("Subscription failed. Please try again later.");
        }
      } catch (err) {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <section className="bg-brand-card/30 border-y border-brand-card py-16 px-6 text-center">
      <div className="max-w-2xl mx-auto">
        <span className="text-[10px] tracking-widest uppercase font-semibold text-brand-grey mb-3 block">
          JOIN THE LUSCENT GLOW CLUB
        </span>
        <h2 className="font-serif text-2xl md:text-3xl font-semibold text-brand-dark mb-4">
          Stay Radiant, Stay Protected
        </h2>
        <p className="text-xs md:text-sm text-brand-grey max-w-lg mx-auto mb-8 leading-relaxed">
          Subscribe to receive dermatologist tips, science-backed skin tutorials, and exclusive access to new product releases.
        </p>

        {subscribed ? (
          <div className="flex flex-col items-center justify-center gap-2 bg-white border border-brand-card/50 p-6 rounded-2xl max-w-md mx-auto shadow-sm">
            <CheckCircle2 className="text-brand-green" size={24} />
            <p className="text-sm font-semibold text-brand-dark">You're on the list!</p>
            <p className="text-xs text-brand-grey">Thank you for subscribing. We've sent a welcome email to your inbox!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                disabled={loading}
                className="flex-grow px-5 py-3 rounded-full bg-white border border-brand-card focus:outline-none focus:border-brand-dark text-sm placeholder-brand-grey/70 transition-colors disabled:opacity-50"
              />
              <Button type="submit" disabled={loading} className="flex items-center justify-center gap-1.5 py-3 px-6">
                {loading ? "Subscribing..." : "Subscribe"} {!loading && <Send size={14} />}
              </Button>
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </form>
        )}
      </div>
    </section>
  );
};
export default Newsletter;
