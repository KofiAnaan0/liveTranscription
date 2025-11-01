import React from "react";
import { Button } from "../ui/Button";

type MicProps = {
  isRecording: boolean;
  isTranscribing: boolean;
  micError: string | null;
  uploadedFile: File | null;
  uploadProgress: number;
  handleStartMic: () => void;
  handleStopMic: () => void;
};

const Mic = ({
  isRecording,
  isTranscribing,
  micError,
  uploadedFile,
  uploadProgress,
  handleStartMic,
  handleStopMic,
}: MicProps) => {
  return (
    <>
      {!uploadedFile && uploadProgress === 0 && (
        <>
          {micError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-w-xs">
              <p className="text-red-600 text-sm text-center">{micError}</p>
            </div>
          ) : (
            <Button
              onClick={isRecording ? handleStopMic : handleStartMic}
              disabled={isTranscribing}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-[#7AE2CF] hover:bg-[#6BD1BF] text-gray-900"
              }`}
            >
              {isRecording ? "Stop Mic" : "Start Mic"}
            </Button>
          )}
        </>
      )}
    </>
  );
};

export default Mic;
