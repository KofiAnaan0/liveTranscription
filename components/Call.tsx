"use client";
import React, { useState } from "react";
import { X, Phone } from "lucide-react";
import Transcription from "./Phone/helper/Transcription";
import { useVoiceAssistant } from "@livekit/components-react";
import Dail from "./Phone/helper/Dail";
import Connected from "./Phone/helper/Connected";

interface ChatWidgetProps {
  onConnectButtonClicked: () => void;
}

export default function ChatWidget({
  onConnectButtonClicked,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { state: agentState } = useVoiceAssistant();

  const handleButtonClick = () => {
    if (!isOpen) {
      onConnectButtonClicked();
    }
    setIsOpen(!isOpen);
  };

  const handleOverlayClick = () => {
    setIsOpen(false);
  };

  const renderContent = () => {
    switch (agentState) {
      case "disconnected":
        return <Transcription />;
      case "connecting":
        return <Dail />;
      default:
        return <Connected />;
    }
  };

  // Add this useEffect to listen for the custom event
  React.useEffect(() => {
    const handleOpenWidget = () => {
      if (!isOpen) {
        setIsOpen(true);
        onConnectButtonClicked();
      }
    };

    window.addEventListener("openChatWidget", handleOpenWidget);
    return () => window.removeEventListener("openChatWidget", handleOpenWidget);
  }, [isOpen, onConnectButtonClicked]);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={handleButtonClick}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        className="fixed bottom-6 right-6 flex justify-center items-center h-14 w-14 bg-[#7AE2CF] rounded-full cursor-pointer shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 z-50 group"
      >
        <div className="relative">
          <Phone
            className={`text-black w-5 h-5 transition-all duration-300 ${
              isOpen
                ? "rotate-90 opacity-0 scale-0"
                : "rotate-0 opacity-100 scale-100"
            }`}
          />
          <X
            className={`text-white w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
              isOpen
                ? "rotate-0 opacity-100 scale-100"
                : "-rotate-90 opacity-0 scale-0"
            }`}
          />
        </div>

        {/* Pulse animation when disconnected */}
        {agentState === "disconnected" && !isOpen && (
          <span className="absolute inset-0 rounded-full bg-[#7AE2CF] animate-ping opacity-75" />
        )}
      </button>

      {/* Chat Modal with Animation */}
      {isOpen && (
        <div
          className={`fixed bottom-24 right-6 w-80 sm:w-96 h-[450px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col transition-all duration-300 ease-out ${
            isOpen
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-4 scale-95"
          }`}
        >
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between flex-shrink-0 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="text-blue-600 font-semibold text-sm">
                  Voice Assistant
                </h3>
                <p className="text-blue-600 text-xs capitalize">{agentState}</p>
              </div>
            </div>
            <button
              onClick={handleOverlayClick}
              aria-label="Close chat"
              className="text-gray-400 hover:text-gray-600 rounded-full p-1.5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {renderContent()}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex-shrink-0">
            <p className="text-gray-500 text-xs text-center">
              Powered by{" "}
              <a
                href="mailto:santosisadru@gmail.com"
                className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                santosisadru@gmail.com
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Overlay with Animation */}
      {isOpen && (
        <div
          onClick={handleOverlayClick}
          className={`fixed inset-0 bg-transparent z-40 transition-opacity duration-300 ${
            isOpen ? "bg-opacity-30" : "bg-opacity-0"
          }`}
        />
      )}
    </>
  );
}
