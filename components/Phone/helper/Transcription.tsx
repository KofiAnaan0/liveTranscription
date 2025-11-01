import useCombinedTranscriptions from "@/hooks/useCombinedTranscriptions";
import React from "react";

const Transcription = () => {
  const combinedTranscriptions = useCombinedTranscriptions();
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Debug: Log when transcriptions change
  React.useEffect(() => {
    console.log(
      "📋 Transcription component - count:",
      combinedTranscriptions.length
    );
  }, [combinedTranscriptions]);

  // Scroll to bottom when new transcription is added
  React.useEffect(() => {
    if (containerRef.current) {
      // Use smooth scrolling
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [combinedTranscriptions]);

  return (
    <div className="relative h-full w-full">
      {/* Fade-out gradient mask */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />

      {/* Scrollable content */}
      <div
        ref={containerRef}
        className="h-full flex flex-col gap-2 overflow-y-auto px-6 py-8 scroll-smooth"
      >
        {combinedTranscriptions.map((segment) => (
          <div
            id={segment.id}
            key={segment.id}
            className={
              segment.role === "assistant"
                ? "p-3 self-start w-fit text-left bg-gray-100 rounded-lg max-w-[80%] text-sm"
                : "bg-blue-600 text-white rounded-lg p-3 self-end w-fit text-left max-w-[80%] text-sm"
            }
          >
            {segment.text}
          </div>
        ))}
        {/* Invisible element to ensure scroll anchor */}
        <div
          ref={(el) => el?.scrollIntoView({ behavior: "smooth", block: "end" })}
        />
      </div>
    </div>
  );
};

export default Transcription;
