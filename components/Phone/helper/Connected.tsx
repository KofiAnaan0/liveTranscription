import AgentVisualizer from "@/components/Livekit/AgentVisualizer";
import { RoomAudioRenderer } from "@livekit/components-react";
import { motion } from "motion/react";
import React from "react";
import Transcription from "./Transcription";

// interface props {
//   onConnectButtonClicked: () => void;
// }

const Connected = () => {
  return (
    <>
      <motion.div
        key="connected"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: [0.09, 1.04, 0.245, 1.055] }}
        className="flex flex-col items-center gap-4 h-full"
      >
        <AgentVisualizer />
        <div className="flex-1 w-full">
          <Transcription />
        </div>
        {/* <div className="w-full">
          <ControlBar onConnectButtonClicked={onConnectButtonClicked} />
        </div> */}
        <RoomAudioRenderer />
      </motion.div>
    </>
  );
};

export default Connected;
