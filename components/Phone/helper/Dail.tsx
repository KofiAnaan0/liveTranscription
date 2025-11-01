import { motion } from "motion/react";
import React from "react";

const Dail = () => {
  return (
    <>
      {/* Content Container */}
      <div className="flex flex-col items-center backdrop-blur-xl bg-white/10">
        {/* Connecting Icon with Animation */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-6"
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-fg0 size-12"
          >
            <path
              d="M32 8C18.745 8 8 18.745 8 32s10.745 24 24 24 24-10.745 24-24S45.255 8 32 8zm0 4c11.046 0 20 8.954 20 20s-8.954 20-20 20S12 43.046 12 32 20.954 12 32 12z"
              fill="currentColor"
              opacity="0.3"
            />
            <path
              d="M32 8c13.255 0 24 10.745 24 24"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>

        {/* Connecting Text */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-fg0 text-xl font-semibold mb-2"
        >
          Dailing...
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-fg1 text-sm mb-6 text-center"
        >
          Please wait as we connect you to our AI assistant
        </motion.p>

        {/* Progress Bar */}
        <div className="w-full max-w-xs">
          <div className="bg-white/20 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: 3,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
          </div>
        </div>

        {/* Optional: Animated dots */}
        <motion.div
          className="flex space-x-1 mt-4"
          initial="hidden"
          animate="visible"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-fg1 rounded-full"
              variants={{
                hidden: { opacity: 0.3, scale: 0.8 },
                visible: {
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1, 0.8],
                  transition: {
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  },
                },
              }}
            />
          ))}
        </motion.div>
      </div>
    </>
  );
};

export default Dail;
