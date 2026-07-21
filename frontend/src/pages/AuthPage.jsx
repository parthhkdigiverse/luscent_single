import React from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "../components/AuthForm";
import { Sparkles, Heart } from "lucide-react";

export const AuthPage = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Check if we came from checkout
    navigate(-1);
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center p-6 bg-brand-bg relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-brand-accent/5 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-brand-secondary/5 rounded-full filter blur-[80px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-5xl bg-white rounded-[32px] overflow-hidden shadow-xl border border-brand-card/40 grid grid-cols-1 lg:grid-cols-12 min-h-[600px] relative z-10">
        {/* Left Column - Image Cover */}
        <div className="hidden lg:block lg:col-span-5 relative overflow-hidden select-none">
          <img
            src="/images/sunscreen_beach_banner.jpg"
            alt="Skincare Aesthetic"
            className="w-full h-full object-cover absolute inset-0"
          />
          {/* Elegant Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          <div className="absolute bottom-10 left-10 right-10 text-left text-white space-y-3 z-10">
            <span className="font-serif text-2xl font-bold tracking-tight">Luscent Glow.</span>
            <p className="text-[11px] uppercase tracking-widest text-brand-accent font-semibold">
              Powerful Protection. Effective Gentle Care.
            </p>
            <p className="text-xs text-white/80 leading-relaxed max-w-sm">
              Formulated in clinical labs to protect and cleanse your skin without compromise.
            </p>
          </div>
        </div>

        {/* Right Column - Auth Tab Forms */}
        <div className="lg:col-span-7 flex items-center justify-center p-8 md:p-16 bg-white">
          <AuthForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
};
export default AuthPage;
