import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "../components/Button";
import { CheckCircle2 } from "lucide-react";

export const ThankYouPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id") || "N/A";

  return (
    <div className="pt-28 pb-20 px-6 max-w-xl mx-auto text-center space-y-8 animate-fade-in">
      <div className="bg-white rounded-3xl border border-brand-card/50 shadow-xl p-8 md:p-12 space-y-6">
        <div className="w-16 h-16 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center mx-auto">
          <CheckCircle2 size={36} className="stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] tracking-widest uppercase font-bold text-brand-green block">ORDER PLACED SUCCESSFULLY</span>
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-brand-dark">Thank You for Your Order!</h2>
          <p className="text-xs text-brand-grey">Your transaction was secure. A confirmation email has been sent to you.</p>
        </div>

        <div className="bg-brand-bg rounded-2xl p-5 border border-brand-card/30 text-left space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-brand-grey">Order Number</span>
            <span className="font-semibold text-brand-dark">{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-grey">Estimated Delivery</span>
            <span className="font-semibold text-brand-dark">3 - 5 Business Days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-grey">Shipping Method</span>
            <span className="font-semibold text-brand-dark">Standard Free Shipping</span>
          </div>
        </div>

        <div className="pt-4">
          <Link to="/">
            <Button variant="primary" className="w-full py-3 text-xs uppercase tracking-wider">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
