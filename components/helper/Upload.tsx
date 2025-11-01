import React from "react";
import { Button } from "../ui/Button";

type UploadProps = {
  uploadProgress: number;
  uploadedFile: File | null;
  isTranscribing: boolean;
  isRecording: boolean;
  transcribeError: string | null;
  handleButtonClick: () => void;
  handleClearFile: () => void;
  handleTranscribe: () => void;
  handleStopTranscription: () => void;
};

const Upload = ({
  uploadProgress,
  uploadedFile,
  handleClearFile,
  isTranscribing,
  isRecording,
  transcribeError,
  handleButtonClick,
  handleTranscribe,
  handleStopTranscription,
}: UploadProps) => {
  return (
    <>
      {uploadProgress > 0 && uploadProgress < 100 ? (
        <div className="w-full max-w-xs space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#7AE2CF] h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 text-center">
            Uploading... {uploadProgress}%
          </p>
        </div>
      ) : uploadedFile ? (
        /* Uploaded File Display */
        <div className="flex flex-col items-center gap-2">
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="text-green-700 text-sm font-medium">
              {uploadedFile.name.length > 30
                ? uploadedFile.name.substring(0, 27) + "..."
                : uploadedFile.name}
            </p>
            <button
              onClick={handleClearFile}
              className="ml-2 text-green-600 hover:text-green-800"
              disabled={isTranscribing}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          {isTranscribing ? (
            <Button
              onClick={handleStopTranscription}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2"
            >
              Stop Transcription
            </Button>
          ) : (
            <Button
              onClick={handleTranscribe}
              disabled={isRecording}
              className="bg-[#7AE2CF] hover:bg-[#6BD1BF] text-gray-900 px-6 py-2"
            >
              Transcribe
            </Button>
          )}
        </div>
      ) : transcribeError ? (
        /* Transcription Error Display */
        <div className="flex flex-col gap-2 items-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-w-xs">
            <p className="text-red-600 text-sm text-center">
              {transcribeError}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleButtonClick}
            disabled={isRecording}
            className="text-sm"
          >
            Try Again
          </Button>
        </div>
      ) : (
        /* Upload Button */
        <Button
          variant="outline"
          onClick={handleButtonClick}
          disabled={isRecording || isTranscribing}
        >
          Upload Audio
        </Button>
      )}
    </>
  );
};

export default Upload;
