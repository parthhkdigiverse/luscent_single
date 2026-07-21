import React, { useState } from "react";
import { API_URL } from "../config";
import { Button } from "../components/Button";
import { Search, MapPin, Truck, CheckCircle2, Calendar, Link as LinkIcon, ShieldCheck } from "lucide-react";

export const TrackPage = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [trackData, setTrackData] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setError("");
    setTrackData(null);

    try {
      const res = await fetch(`${API_URL}/api/orders/track/${query.trim().toUpperCase()}`);
      if (!res.ok) {
        throw new Error("Tracking number or order not found. Check the code and try again.");
      }
      const data = await res.json();
      setTrackData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    const s = status?.toLowerCase();
    if (s === "delivered") return 3;
    if (s === "shipped") return 2;
    if (s === "processing") return 1;
    return 0; // pending
  };

  const activeStep = trackData ? getStatusStep(trackData.status) : 0;

  return (
    <div className="pt-32 pb-24 px-4 max-w-lg mx-auto text-center space-y-8 min-h-[70vh]">
      <div className="space-y-2">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-brand-dark">Track Your Order</h1>
        <p className="text-xs text-brand-grey max-w-sm mx-auto leading-relaxed">
          Enter your Order ID (e.g. LG-123456) or Delhivery Tracking Number (AWB) to view shipment logs.
        </p>
      </div>

      <form onSubmit={handleTrack} className="flex gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-grey" size={16} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Order ID / Delhivery AWB"
            className="w-full pl-10 pr-4 py-3 border border-brand-card rounded-2xl focus:outline-none focus:border-brand-dark text-xs uppercase font-medium tracking-wide"
          />
        </div>
        <Button type="submit" disabled={loading} className="text-xs uppercase font-bold px-6 py-3">
          {loading ? "Searching..." : "Track"}
        </Button>
      </form>

      {error && (
        <div className="p-4 bg-[#c24b4b]/5 border border-[#c24b4b]/20 text-[#c24b4b] text-xs font-semibold rounded-2xl text-left animate-fade-in">
          {error}
        </div>
      )}

      {trackData && (
        <div className="bg-white rounded-3xl border border-brand-card/50 shadow-sm p-6 text-left space-y-6 animate-fade-in">
          {/* Order Header */}
          <div className="border-b border-brand-card/30 pb-4 flex justify-between items-start">
            <div>
              <span className="text-[10px] text-brand-grey uppercase font-bold tracking-widest">Order Number</span>
              <h3 className="font-serif text-base font-bold text-brand-dark">{trackData.order_number}</h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-brand-grey uppercase font-bold tracking-widest">Status</span>
              <span className="block text-xs font-bold text-brand-accent uppercase mt-0.5">{trackData.status}</span>
            </div>
          </div>

          {/* Delhivery details if shipped */}
          {trackData.tracking_number && (
            <div className="bg-brand-bg rounded-2xl p-4 space-y-2 border border-brand-card/30">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                  <Truck size={14} className="text-brand-accent" /> {trackData.carrier || "Delhivery"}
                </span>
                <span className="text-[10px] text-brand-grey select-all font-mono">AWB: {trackData.tracking_number}</span>
              </div>
              <p className="text-[10px] text-brand-grey">Your package is processed and handled by Delhivery Express.</p>
              {trackData.carrier?.toLowerCase() === "delhivery" && (
                <a
                  href={`https://www.delhivery.com/track/package/${trackData.tracking_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-accent hover:underline mt-1.5"
                >
                  Go to Delhivery Live Tracking <LinkIcon size={10} />
                </a>
              )}
            </div>
          )}

          {/* Timeline Stepper */}
          <div className="space-y-4">
            <h4 className="font-serif text-xs font-bold text-brand-dark">Shipment Progress</h4>
            <div className="relative pl-6 space-y-6 border-l border-brand-card/60 ml-2">
              {/* Delivered Step */}
              <div className="relative">
                <span className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full flex items-center justify-center border-2 ${
                  activeStep >= 3 ? "bg-brand-green border-brand-green text-white" : "bg-white border-brand-card"
                }`}>
                  {activeStep >= 3 && <CheckCircle2 size={10} />}
                </span>
                <div>
                  <h5 className={`text-xs font-bold ${activeStep >= 3 ? "text-brand-dark" : "text-brand-grey"}`}>Delivered</h5>
                  <p className="text-[10px] text-brand-grey leading-tight">Package has been dropped off at the shipping location.</p>
                </div>
              </div>

              {/* Shipped Step */}
              <div className="relative">
                <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center border-2 ${
                  activeStep >= 2 ? "bg-brand-green border-brand-green text-white" : "bg-white border-brand-card"
                }`}>
                  {activeStep >= 2 && <CheckCircle2 size={10} />}
                </span>
                <div>
                  <h5 className={`text-xs font-bold ${activeStep >= 2 ? "text-brand-dark" : "text-brand-grey"}`}>Shipped & In Transit</h5>
                  <p className="text-[10px] text-brand-grey leading-tight">Consignment booked and handed to Delhivery carrier.</p>
                </div>
              </div>

              {/* Processing Step */}
              <div className="relative">
                <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center border-2 ${
                  activeStep >= 1 ? "bg-brand-green border-brand-green text-white" : "bg-white border-brand-card"
                }`}>
                  {activeStep >= 1 && <CheckCircle2 size={10} />}
                </span>
                <div>
                  <h5 className={`text-xs font-bold ${activeStep >= 1 ? "text-brand-dark" : "text-brand-grey"}`}>Processing</h5>
                  <p className="text-[10px] text-brand-grey leading-tight">Warehouse preparing to pack and label package items.</p>
                </div>
              </div>

              {/* Pending Step */}
              <div className="relative">
                <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center border-2 bg-brand-green border-brand-green text-white">
                  <CheckCircle2 size={10} />
                </span>
                <div>
                  <h5 className="text-xs font-bold text-brand-dark">Order Confirmed</h5>
                  <p className="text-[10px] text-brand-grey leading-tight">Payment verified and awaiting order dispatch.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
