import React from 'react';
import { motion } from 'framer-motion';

export const Loader = ({ text = "Loading Luscent Glow..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-transparent">
      {/* Outer Glow Ring */}
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-24 h-24 rounded-full bg-brand-accent/20 blur-xl"
        />
        
        {/* Inner Spinner */}
        <div className="relative w-12 h-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-[3px] border-brand-accent/20 border-t-brand-accent"
          />
          {/* Inner pulse dot */}
          <motion.div
            animate={{ scale: [0.8, 1, 0.8], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-brand-accent"
          />
        </div>
      </div>
      
      {/* Loading Text */}
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="mt-6 text-brand-dark font-serif text-sm tracking-widest uppercase"
      >
        {text}
      </motion.p>
    </div>
  );
};
