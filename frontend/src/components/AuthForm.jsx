import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";
import { Button } from "./Button";
import { Mail, Lock, User, AlertCircle, CheckCircle2, Loader2, KeyRound, ArrowLeft } from "lucide-react";

export const AuthForm = ({ onSuccess }) => {
  const { login, signup, authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: enter email, 2: enter OTP & new pass

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Forgot password states
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpNotice, setOtpNotice] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Feedback
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!isLogin) {
      if (!name.trim()) {
        setError("Please enter your name.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(name.trim(), email, password);
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setOtpNotice("");
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to request password reset OTP.");
      }

      setOtpNotice(data.message || `Verification OTP sent to ${email}`);
      if (data.otp) {
        setResetOtp(data.otp); // Pre-fill for convenience
      }
      setForgotStep(2);
    } catch (err) {
      setError(err.message || "Could not generate reset OTP.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Reset Password Submit
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!resetOtp) {
      setError("Please enter the 6-digit verification OTP.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: resetOtp, new_password: newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Password reset failed.");
      }

      setSuccessMsg("Password reset successfully! Please sign in with your new password.");
      setIsForgot(false);
      setIsLogin(true);
      setPassword(newPassword);
    } catch (err) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = submitting || authLoading;

  // Render Forgot Password View
  if (isForgot) {
    return (
      <div className="w-full max-w-md bg-white text-left">
        <button
          type="button"
          onClick={() => {
            setIsForgot(false);
            setError("");
            setOtpNotice("");
          }}
          className="inline-flex items-center gap-1.5 text-xs text-brand-grey hover:text-brand-dark mb-6 font-semibold transition"
        >
          <ArrowLeft size={14} /> Back to Sign In
        </button>

        <h3 className="font-serif text-xl font-medium text-brand-dark mb-2">
          Forgot Password
        </h3>
        <p className="text-xs text-brand-grey mb-6">
          {forgotStep === 1
            ? "Enter your registered email address to receive a 6-digit reset code."
            : "Enter the verification OTP and your new password below."}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {otpNotice && (
          <div className="mb-4 p-3 bg-brand-green/10 border border-brand-green/20 rounded-xl text-brand-green text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 size={16} className="flex-shrink-0" />
            <span>{otpNotice}</span>
          </div>
        )}

        {forgotStep === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-brand-dark block mb-1">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-grey/60">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="emma@example.com"
                  required
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3 bg-brand-bg/50 border border-brand-card rounded-xl text-sm focus:outline-none focus:border-brand-dark focus:bg-white transition-all disabled:opacity-60"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-4 text-xs uppercase tracking-widest bg-brand-dark text-white hover:bg-black font-semibold transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Requesting OTP...
                </>
              ) : (
                "Send Reset OTP"
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-brand-dark block mb-1">
                6-Digit Verification OTP
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-grey/60">
                  <KeyRound size={16} />
                </span>
                <input
                  type="text"
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value)}
                  placeholder="123456"
                  required
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3 bg-brand-bg/50 border border-brand-card rounded-xl text-sm focus:outline-none focus:border-brand-dark focus:bg-white transition-all tracking-widest font-mono disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-brand-dark block mb-1">
                New Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-grey/60">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3 bg-brand-bg/50 border border-brand-card rounded-xl text-sm focus:outline-none focus:border-brand-dark focus:bg-white transition-all disabled:opacity-60"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-4 text-xs uppercase tracking-widest bg-brand-dark text-white hover:bg-black font-semibold transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>

            <button
              type="button"
              onClick={() => setForgotStep(1)}
              className="w-full text-center text-xs text-brand-grey hover:text-brand-dark mt-2 block"
            >
              Request a new code
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white text-left">
      {/* Tab Switcher */}
      <div className="flex border-b border-brand-card mb-6">
        <button
          onClick={() => {
            setIsLogin(true);
            setError("");
            setSuccessMsg("");
          }}
          disabled={isLoading}
          className={`flex-1 pb-3 text-sm font-semibold uppercase tracking-wider transition-all duration-300 border-b-2 ${
            isLogin ? "border-brand-dark text-brand-dark" : "border-transparent text-brand-grey/60 hover:text-brand-dark"
          }`}
        >
          Login
        </button>
        <button
          onClick={() => {
            setIsLogin(false);
            setError("");
            setSuccessMsg("");
          }}
          disabled={isLoading}
          className={`flex-1 pb-3 text-sm font-semibold uppercase tracking-wider transition-all duration-300 border-b-2 ${
            !isLogin ? "border-brand-dark text-brand-dark" : "border-transparent text-brand-grey/60 hover:text-brand-dark"
          }`}
        >
          Sign Up
        </button>
      </div>

      <h3 className="font-serif text-xl font-medium text-brand-dark mb-2">
        {isLogin ? "Welcome back" : "Create an account"}
      </h3>
      <p className="text-xs text-brand-grey mb-6">
        {isLogin ? "Enter your email and password to access your account." : "Start your daily skin health journey with us."}
      </p>

      {successMsg && (
        <div className="mb-4 p-3 bg-brand-green/10 border border-brand-green/20 rounded-xl text-brand-green text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name (Signup only) */}
        {!isLogin && (
          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-brand-dark block mb-1">
              Your Name
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-grey/60">
                <User size={16} />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Emma Watson"
                disabled={isLoading}
                className="w-full pl-11 pr-4 py-3 bg-brand-bg/50 border border-brand-card rounded-xl text-sm focus:outline-none focus:border-brand-dark focus:bg-white transition-all disabled:opacity-60"
              />
            </div>
          </div>
        )}

        {/* Email */}
        <div>
          <label className="text-xs uppercase tracking-wider font-semibold text-brand-dark block mb-1">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-grey/60">
              <Mail size={16} />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="emma@example.com"
              required
              disabled={isLoading}
              className="w-full pl-11 pr-4 py-3 bg-brand-bg/50 border border-brand-card rounded-xl text-sm focus:outline-none focus:border-brand-dark focus:bg-white transition-all disabled:opacity-60"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs uppercase tracking-wider font-semibold text-brand-dark block">
              Password
            </label>
            {isLogin && (
              <button
                type="button"
                onClick={() => {
                  setIsForgot(true);
                  setForgotStep(1);
                  setError("");
                }}
                className="text-[10px] text-brand-grey hover:text-brand-dark hover:underline font-semibold"
              >
                Forgot password?
              </button>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-grey/60">
              <Lock size={16} />
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="w-full pl-11 pr-4 py-3 bg-brand-bg/50 border border-brand-card rounded-xl text-sm focus:outline-none focus:border-brand-dark focus:bg-white transition-all disabled:opacity-60"
            />
          </div>
        </div>

        {/* Confirm Password (Signup only) */}
        {!isLogin && (
          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-brand-dark block mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-grey/60">
                <Lock size={16} />
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="w-full pl-11 pr-4 py-3 bg-brand-bg/50 border border-brand-card rounded-xl text-sm focus:outline-none focus:border-brand-dark focus:bg-white transition-all disabled:opacity-60"
              />
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 mt-6 text-xs uppercase tracking-widest bg-brand-dark text-white hover:bg-black font-semibold transition-all duration-300 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              {isLogin ? "Signing In..." : "Creating Account..."}
            </>
          ) : (
            isLogin ? "Sign In" : "Create Account"
          )}
        </Button>
      </form>

      {/* Bottom helper text */}
      <div className="mt-6 text-center">
        <p className="text-xs text-brand-grey">
          {isLogin ? (
            <>Don't have an account?{" "}
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(""); }}
                className="text-brand-dark font-semibold hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>Already have an account?{" "}
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(""); }}
                className="text-brand-dark font-semibold hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};
export default AuthForm;
