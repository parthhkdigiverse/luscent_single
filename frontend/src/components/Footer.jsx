import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, ShieldCheck } from "lucide-react";
import { API_URL } from "../config";

export const Footer = () => {
  const [settings, setSettings] = React.useState({
    contact_email: "theluscentglow@gmail.com",
    contact_phone: "+91 63521 63607",
    contact_address: "Mfg. by Basilica Biotech, Surat, Gujarat, India."
  });

  React.useEffect(() => {
    fetch(`${API_URL}/api/content/contact_info`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.content) {
          setSettings({
            contact_email: data.content.email || "theluscentglow@gmail.com",
            contact_phone: data.content.phone || "+91 63521 63607",
            contact_address: data.content.address || "Mfg. by Basilica Biotech, Surat, Gujarat, India."
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-brand-dark text-white pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-white/10 pb-12">
        {/* Brand Blurb */}
        <div className="space-y-4">
          <Link to="/" className="flex flex-col text-left">
            <h3 className="font-serif text-xl font-bold tracking-[0.2em] text-white m-0">
              LUSCENT
            </h3>
            <span className="text-[9px] tracking-[0.45em] uppercase font-sans font-semibold text-brand-accent mt-0.5 pl-[2px]">
              GLOW
            </span>
          </Link>
          <p className="text-xs text-brand-card/70 leading-relaxed font-sans max-w-sm">
            Science-backed formulations for daily sun protection and gentle, effective skin barrier health. Dermatologist friendly, minimal formulations.
          </p>
          {/* Social Icons */}
          <div className="flex gap-4 pt-2">
            <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-brand-accent transition-colors">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-brand-accent transition-colors">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-brand-accent transition-colors">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
            </a>
          </div>
        </div>

        {/* Shop Links */}
        <div>
          <h4 className="text-xs uppercase tracking-widest font-semibold text-white/50 mb-4">Shop</h4>
          <ul className="space-y-2.5 text-xs text-brand-card/80">
            <li>
              <Link to="/product/sunscreen" className="hover:text-brand-accent transition-colors">
                Ultra Light Sunscreen SPF 50+
              </Link>
            </li>
            <li>
              <Link to="/product/face-wash" className="hover:text-brand-accent transition-colors">
                Bright Skin Face Wash
              </Link>
            </li>
            <li>
              <Link to="/product/combo" className="hover:text-brand-accent transition-colors font-semibold text-brand-accent">
                The Glow Duo (Save ₹86)
              </Link>
            </li>
          </ul>
        </div>

        {/* Help / Links */}
        <div>
          <h4 className="text-xs uppercase tracking-widest font-semibold text-white/50 mb-4">Help & Company</h4>
          <ul className="space-y-2.5 text-xs text-brand-card/80">
            <li>
              <Link to="/our-story" className="hover:text-brand-accent transition-colors">
                Our Story
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-brand-accent transition-colors">
                FAQ & Shipping
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-brand-accent transition-colors">
                Contact Us
              </Link>
            </li>
            <li>
              <Link to="/track" className="hover:text-brand-accent transition-colors font-semibold">
                Track Order
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact info from physical label */}
        <div className="space-y-3 text-xs text-brand-card/80">
          <h4 className="text-xs uppercase tracking-widest font-semibold text-white/50 mb-4">Manufacturer Info</h4>
          <div className="flex gap-2.5 items-start">
            <Phone size={14} className="mt-0.5 text-brand-accent flex-shrink-0" />
            <span>{settings.contact_phone}</span>
          </div>
          <div className="flex gap-2.5 items-start">
            <Mail size={14} className="mt-0.5 text-brand-accent flex-shrink-0" />
            <a href={`mailto:${settings.contact_email}`} className="hover:underline">
              {settings.contact_email}
            </a>
          </div>
          <div className="flex gap-2.5 items-start">
            <MapPin size={14} className="mt-0.5 text-brand-accent flex-shrink-0" />
            <span>
              {settings.contact_address}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-white/40">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-center sm:text-left">
          <span>Marketed by Luscent Glow</span>
          <span className="hidden sm:inline">•</span>
          <span>Made in India (Surat, Gujarat)</span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1 justify-center"><ShieldCheck size={10} className="text-brand-accent" /> Clinical Quality</span>
        </div>

        {/* Payment Icons Mock */}
        <div className="flex items-center gap-2.5">
          <span className="bg-white/5 px-2 py-1 rounded">UPI</span>
          <span className="bg-white/5 px-2 py-1 rounded">Visa</span>
          <span className="bg-white/5 px-2 py-1 rounded">Mastercard</span>
          <span className="bg-white/5 px-2 py-1 rounded">COD</span>
        </div>

        <p className="text-center">
          &copy; {new Date().getFullYear()} Luscent Glow. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
export default Footer;
