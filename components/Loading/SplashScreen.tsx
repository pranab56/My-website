"use client";

import { AnimatePresence, motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if splash has already been shown in this session
    const hasShownSplash = sessionStorage.getItem("hasShownSplash");

    if (!hasShownSplash) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        sessionStorage.setItem("hasShownSplash", "true");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.8,
              ease: "circOut",
              delay: 0.2
            }}
            className="relative"
          >
            {/* Pulsing Background */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 -m-8 bg-primary rounded-full blur-3xl"
            />

            <div className="relative z-10 flex flex-col items-center">
              <div className="p-5 rounded-3xl bg-primary shadow-2xl shadow-primary/40">
                <TrendingUp className="w-16 h-16 text-primary-foreground" />
              </div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-8 text-center"
              >
                <h1 className="text-4xl font-black tracking-tighter sm:text-5xl">
                  TRADE<span className="text-primary">LOG</span>
                </h1>
                <p className="mt-2 text-sm font-medium text-muted-foreground uppercase tracking-[0.3em]">
                  Pro Dashboard
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Loading Bar */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2, ease: "easeInOut", delay: 0.3 }}
            className="absolute bottom-0 left-0 right-0 h-1 bg-primary origin-left"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
