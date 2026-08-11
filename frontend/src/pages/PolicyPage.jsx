import React from "react";
import { useParams, Navigate, Link } from "react-router-dom";

const policies = {
  "privacy-policy": {
    title: "Privacy Policy",
    content: `
At Luscent Glow, your privacy is our priority. This Privacy Policy outlines how we collect, use, and protect your personal information when you visit or make a purchase from our website.

**1. Information We Collect**
We may collect personal information such as your name, email address, shipping address, and payment details when you place an order or sign up for our newsletter.

**2. How We Use Your Information**
Your information is used to process your orders, communicate with you about your purchase, and, with your permission, send you marketing updates. We do not sell or rent your personal information to third parties.

**3. Data Security**
We employ industry-standard security measures to ensure that your personal information is kept safe. All transactions are encrypted and processed securely.

**4. Cookies**
Our website uses cookies to enhance your browsing experience, remember your preferences, and analyze site traffic. You can choose to disable cookies through your browser settings, though this may affect your ability to use certain features of our site.

**5. Changes to This Policy**
We may update this privacy policy from time to time in order to reflect changes to our practices or for other operational, legal, or regulatory reasons.

For any questions regarding our privacy practices, please contact us at theluscentglow@gmail.com.
    `
  },
  "terms-of-service": {
    title: "Terms of Service",
    content: `
Welcome to Luscent Glow. By accessing or using our website, you agree to be bound by the following terms and conditions. Please read them carefully before making a purchase.

**1. General Conditions**
We reserve the right to refuse service to anyone for any reason at any time. You understand that your content (not including credit card information), may be transferred unencrypted and involve transmissions over various networks.

**2. Products and Services**
Certain products or services may be available exclusively online through the website. These products or services may have limited quantities and are subject to return or exchange only according to our Refund Policy.

**3. Accuracy of Billing and Account Information**
We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order. 

**4. Modifications to the Service and Prices**
Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.

**5. Contact Information**
Questions about the Terms of Service should be sent to us at theluscentglow@gmail.com.
    `
  },
  "refund-policy": {
    title: "Refund & Return Policy",
    content: `
Since our products are premium skincare formulations, strict hygiene and safety standards apply.

**1. No Returns & No Refunds**
- We do not offer returns or exchanges on any products once they have been purchased or shipped.
- All sales are final. We do not issue refunds for change of mind or personal preference.

**2. Damaged or Defective Items**
- In the rare event that you receive a damaged, defective, or incorrect item, please notify us within 24 hours of delivery.
- To report a damaged item, please email us at theluscentglow@gmail.com with your order number and clear photos/videos showing the damage.
- Upon receiving your request, our team will evaluate the case. We reserve the right to decide on a case-by-case basis whether to offer a replacement, store credit, or other resolution.
    `
  },
  "contact-support": {
    title: "Contact & Customer Support Policy",
    content: `
At Luscent Glow, we are committed to providing you with the best possible support and care.

**1. Support Hours**
- Our customer support team is available from Monday to Saturday, 10:00 AM to 6:00 PM (IST).
- We aim to respond to all inquiries within 24 to 48 hours, excluding public holidays.

**2. How to Reach Us**
- **Email Support:** For any queries regarding orders, products, shipping, or returns, please email us at theluscentglow@gmail.com.
- **Order Queries:** When reaching out about an order, please include your Order ID (e.g., #LUSCENT-1234) for faster assistance.

**3. Address & Location**
- For physical correspondence, please write to us at:
  *Luscent Glow Support Team, Nadiad, Gujarat, India.*
    `
  },
  "shipping-policy": {
    title: "Shipping Policy",
    content: `
Here is everything you need to know about how we deliver Luscent Glow products to your doorstep.

**1. Processing Time**
All orders are processed within 1 to 2 business days (excluding weekends and holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped.

**2. Domestic Shipping Rates and Estimates**
We offer standard shipping across India. Shipping charges for your order will be calculated and displayed at checkout. Free shipping is often available for orders above a certain value, as promoted on our website.

**3. Delivery Time**
Estimated delivery time is 3 to 7 business days, depending on your location. Please note that delivery times may be longer during public holidays or extreme weather conditions.

**4. International Shipping**
At this time, we only ship within India. We are working on expanding our delivery network globally in the near future.

**5. Order Tracking**
When your order has shipped, you will receive an email notification from us which will include a tracking number you can use to check its status. Please allow 24-48 hours for the tracking information to become available.

If you haven’t received your order within 7 days of receiving your shipping confirmation email, please contact us at theluscentglow@gmail.com with your name and order number.
    `
  }
};

export const PolicyPage = () => {
  const { policyId } = useParams();
  const policy = policies[policyId];

  if (!policy) {
    return <Navigate to="/" replace />;
  }

  const renderContent = (text) => {
    return text.split('\n').map((paragraph, idx) => {
      if (!paragraph.trim()) return null;
      // Simple bold parsing: **text**
      const parts = paragraph.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={idx} className="mb-4">
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="text-brand-dark">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="pt-24 pb-16 px-6 max-w-4xl mx-auto min-h-screen">
      <div className="text-center space-y-4 mb-12">
        <span className="text-[10px] tracking-widest uppercase font-bold text-brand-accent block">
          LUSCENT GLOW
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-medium text-brand-dark">
          {policy.title}
        </h1>
        <div className="w-16 h-[2px] bg-brand-accent mx-auto" />
      </div>

      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-brand-card/50 text-sm md:text-base text-brand-grey leading-relaxed">
        {renderContent(policy.content)}
      </div>

      <div className="mt-12 text-center">
        <Link to="/" className="text-xs font-semibold text-brand-accent uppercase tracking-widest hover:underline">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
};

export default PolicyPage;
