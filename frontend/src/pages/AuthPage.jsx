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
        {/* Left Column - Styled Product Display */}
        <div className="hidden lg:flex lg:col-span-5 relative overflow-hidden select-none bg-brand-bg flex-col items-center justify-between p-10 text-center border-r border-brand-card/25 min-h-[600px]">
          <div className="w-full text-left">
            <span className="font-serif text-2xl font-semibold tracking-tight text-brand-dark">Luscent Glow.</span>
          </div>

          <div className="my-auto py-8 flex items-center justify-center">
            <img
              src="/images/combo.png"
              alt="Luscent Glow Combo"
              className="max-h-64 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
            />
          </div>
          
          <div className="text-left w-full space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-brand-accent font-bold">
              Powerful Protection. Effective Gentle Care.
            </p>
            <p className="text-xs text-brand-dark/70 leading-relaxed">
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
