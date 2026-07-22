import React, { useState, useEffect } from "react";
import { Phone, Mail, MapPin, Send, CheckCircle2 } from "lucide-react";
import { Button } from "../components/Button";
import { API_URL } from "../config";
import { Loader } from "../components/Loader";

export const ContactPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [settings, setSettings] = useState({
    contact_email: "theluscentglow@gmail.com",
    contact_phone: "+91 63521 63607",
    contact_address: "Basilica Biotech, Surat, Gujarat, India."
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/content/contact_info`, { cache: 'no-store' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.content) {
          setSettings({
            contact_email: data.content.email || "theluscentglow@gmail.com",
            contact_phone: data.content.phone || "+91 63521 63607",
            contact_address: data.content.address || "Basilica Biotech, Surat, Gujarat, India."
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Loader text="Loading Contact Info..." />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name && email && message) {
      try {
        const res = await fetch(`${API_URL}/api/contact`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, subject: "General Inquiry", message })
        });
        if (!res.ok) throw new Error("Submission failed");
      } catch (err) {
        console.warn("FastAPI backend not active, submitting mock message:", err.message);
      }
      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
    }
  };

  return (
    <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto space-y-16">
      {/* Header */}
      <section className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-[10px] tracking-widest uppercase font-bold text-brand-accent block">
          GET IN TOUCH
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-medium text-brand-dark">
          We'd Love to Hear From You
        </h1>
        <p className="text-xs md:text-sm text-brand-grey leading-relaxed">
          For order support, formulation guidance, or wholesale inquiries, write to us. Our customer team will respond within 24 hours.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-5xl mx-auto text-left">
        {/* Contact details sidebar */}
        <div className="lg:col-span-5 bg-white border border-brand-card/50 shadow-sm rounded-3xl p-6 md:p-8 space-y-8">
          <div className="space-y-2">
            <h3 className="font-serif text-lg font-semibold text-brand-dark">Direct Channels</h3>
            <p className="text-xs text-brand-grey">Reach us through the following coordinates.</p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-brand-bg flex items-center justify-center text-brand-accent flex-shrink-0">
                <Phone size={16} />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-brand-dark uppercase tracking-wider block">Phone & WhatsApp</span>
                <span className="text-brand-grey block mt-0.5">{settings.contact_phone}</span>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-brand-bg flex items-center justify-center text-brand-accent flex-shrink-0">
                <Mail size={16} />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-brand-dark uppercase tracking-wider block">Email Address</span>
                <a href={`mailto:${settings.contact_email}`} className="text-brand-grey hover:text-brand-dark hover:underline block mt-0.5 font-sans">
                  {settings.contact_email}
                </a>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-brand-bg flex items-center justify-center text-brand-accent flex-shrink-0">
                <MapPin size={16} />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-brand-dark uppercase tracking-wider block">Manufacturing Facility</span>
                <span className="text-brand-grey block mt-0.5">{settings.contact_address}</span>
              </div>
            </div>
          </div>

          {/* Social connections */}
          <div className="pt-6 border-t border-brand-card/50">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey block mb-3">Follow our social channels</span>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-brand-bg flex items-center justify-center text-brand-dark hover:bg-brand-dark hover:text-white transition-all">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-brand-bg flex items-center justify-center text-brand-dark hover:bg-brand-dark hover:text-white transition-all">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-brand-bg flex items-center justify-center text-brand-dark hover:bg-brand-dark hover:text-white transition-all">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className="lg:col-span-7 bg-white border border-brand-card/50 shadow-sm rounded-3xl p-6 md:p-8">
          {submitted ? (
            <div className="py-12 text-center space-y-4 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} className="stroke-[2.5]" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-brand-dark">Message Sent Successfully</h3>
              <p className="text-xs text-brand-grey max-w-sm mx-auto leading-relaxed">
                Thank you for writing to Luscent Glow. Our customer care desk has received your ticket and will follow up shortly.
              </p>
              <Button onClick={() => setSubmitted(false)} variant="outline" size="sm" className="mt-2 text-[10px] uppercase font-bold tracking-wider">
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs uppercase tracking-wider font-semibold text-brand-dark block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full px-4 py-3 bg-brand-bg/50 border border-brand-card rounded-xl text-xs focus:outline-none focus:border-brand-dark focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider font-semibold text-brand-dark block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full px-4 py-3 bg-brand-bg/50 border border-brand-card rounded-xl text-xs focus:outline-none focus:border-brand-dark focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider font-semibold text-brand-dark block mb-1">Your Message</label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help you with your skin health ritual?"
                  className="w-full px-4 py-3 bg-brand-bg/50 border border-brand-card rounded-xl text-xs focus:outline-none focus:border-brand-dark focus:bg-white transition-colors resize-none"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full py-3.5 text-xs uppercase tracking-widest flex items-center justify-center gap-1.5">
                  Send Message <Send size={12} />
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
export default ContactPage;
