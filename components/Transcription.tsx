"use client";

import { tabs } from "@/data/tabsData";
import { WhisperLiveMessage } from "@/types/backendType";
import React, { useRef, useState, useEffect } from "react";
import H2 from "./ui/H2";
import Summary from "./helper/Summary";
import Insight from "./helper/Insight";
import Upload from "./helper/Upload";
import Mic from "./helper/Mic";

const Transcription = () => {
  const [activeTab, setActiveTab] = useState<
    "transcript" | "summary" | "insights"
  >("transcript");

  const [transcription, setTranscription] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [micError, setMicError] = useState<string>("");
  const [, setIsConnected] = useState(false);

  // New states for upload progress and transcription
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeError, setTranscribeError] = useState<string>("");

  const [audioUrl, setAudioUrl] = useState<string>("");
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
  const [words, setWords] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Uint8Array[]>([]);
  const transcriptionWsRef = useRef<WebSocket | null>(null);

  // WebSocket connection to Whisper Live server
  const connectWebSocket = () => {
    try {
      const ws = new WebSocket("ws://localhost:9090");

      ws.onopen = () => {
        console.log("Connected to Whisper Live server");
        setIsConnected(true);
        setMicError("");

        // Send initial configuration message
        const config = {
          uid: "web-client-" + Date.now(),
          language: "en",
          task: "transcribe",
          model: "small",
          use_vad: false,
        };
        ws.send(JSON.stringify(config));
        console.log("Sent config:", config);
      };

      ws.onmessage = (event) => {
        try {
          const data: WhisperLiveMessage = JSON.parse(event.data);
          console.log("Received:", data);

          if (data.message === "SERVER_READY") {
            console.log("Server is ready");
            return;
          }

          if (data.segments && data.segments.length > 0) {
            const text = data.segments.map((seg) => seg.text).join(" ");
            setTranscription((prev) => prev + " " + text);
            // Update words array for playback highlighting
            setWords((prev) => [...prev, ...text.split(" ")]);
          } else if (data.text !== undefined) {
            setTranscription((prev) => prev + " " + data.text);
            setWords((prev) => [...prev, ...data.text!.split(" ")]);
          }
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log("Disconnected from server");
        setIsConnected(false);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Failed to connect:", error);
      setMicError("Failed to connect to transcription server");
    }
  };

  // Convert audio to the format whisper-live expects (PCM 16-bit)
  const convertAudioToPCM = async (audioBlob: Blob): Promise<Int16Array> => {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Get the audio data from the first channel
    const channelData = audioBuffer.getChannelData(0);

    // Convert float32 to int16
    const pcmData = new Int16Array(channelData.length);
    for (let i = 0; i < channelData.length; i++) {
      const s = Math.max(-1, Math.min(1, channelData[i]));
      pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    await audioContext.close();
    return pcmData;
  };

  // Handle microphone recording
  const handleStartMic = async () => {
    try {
      setMicError("");
      setTranscription("");
      setWords([]);
      audioChunksRef.current = [];

      // Connect to WebSocket if not connected
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        connectWebSocket();
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        setMicError("Failed to connect to server");
        return;
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      streamRef.current = stream;
      setIsRecording(true);

      // Create audio context for processing
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);

      // Create ScriptProcessor for manual audio processing
      const processor = audioContextRef.current.createScriptProcessor(
        4096,
        1,
        1
      );

      processor.onaudioprocess = (e) => {
        if (!isRecording || wsRef.current?.readyState !== WebSocket.OPEN)
          return;

        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);

        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        // Send PCM data as binary
        wsRef.current?.send(pcmData.buffer);
      };

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);

      console.log("Recording started");
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.name === "NotAllowedError" ||
          error.name === "PermissionDeniedError"
        ) {
          setMicError(
            "Microphone access denied. Please allow microphone access in your browser settings."
          );
        } else if (error.name === "NotFoundError") {
          setMicError(
            "No microphone found. Please connect a microphone and try again."
          );
        } else {
          setMicError("Error accessing microphone: " + error.message);
        }
      }
      console.error("Microphone error:", error);
      setIsRecording(false);
    }
  };

  const handleStopMic = () => {
    setIsRecording(false);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    console.log("Recording stopped");
  };

  // Handle file upload with progress
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setTranscribeError("");
      setUploadProgress(0);

      // Create audio URL for playback
      const url = URL.createObjectURL(file);
      setAudioUrl(url);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);

      // Wait for progress to complete
      await new Promise((resolve) => setTimeout(resolve, 1100));

      setUploadedFile(file);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      setTranscribeError("Failed to upload file. Please try again.");
      setUploadProgress(0);
    }
  };

  // Handle transcription with real-time streaming
  const handleTranscribe = async () => {
    if (!uploadedFile) return;

    try {
      setIsTranscribing(true);
      setTranscribeError("");
      setTranscription("");
      setWords([]);
      setCurrentWordIndex(-1);

      // Connect to WebSocket if not connected
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        connectWebSocket();
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        throw new Error(
          "Failed to connect to server. Please make sure the server is running on port 9090."
        );
      }

      // Store reference for streaming updates
      transcriptionWsRef.current = wsRef.current;

      // Convert audio file to PCM format
      const audioBlob = new Blob([await uploadedFile.arrayBuffer()], {
        type: uploadedFile.type,
      });
      const pcmData = await convertAudioToPCM(audioBlob);

      // Send PCM data in chunks - transcription will stream via WebSocket onmessage
      const chunkSize = 8192;
      for (let i = 0; i < pcmData.length; i += chunkSize) {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const chunk = pcmData.slice(i, i + chunkSize);
          wsRef.current.send(chunk.buffer);
          await new Promise((resolve) => setTimeout(resolve, 50));
        } else {
          throw new Error("Connection lost during transcription");
        }
      }

      // Keep transcribing state active until user stops or completes
      console.log("Transcription streaming started");
    } catch (error) {
      console.error("Transcription error:", error);
      if (error instanceof Error) {
        setTranscribeError(error.message);
      } else {
        setTranscribeError("Failed to transcribe audio. Please try again.");
      }
      setIsTranscribing(false);
    }
  };

  // Stop transcription
  const handleStopTranscription = () => {
    setIsTranscribing(false);
    setUploadedFile(null);
    setUploadProgress(0);
    setMicError("");
    console.log("Transcription stopped");
  };

  // Handle audio end
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => {
        setCurrentWordIndex(-1);
      };

      audio.addEventListener("ended", handleEnded);
      return () => audio.removeEventListener("ended", handleEnded);
    }
  }, []);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setTranscribeError("");
    setMicError("");
    setAudioUrl("");
    setCurrentWordIndex(-1);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Render transcription with word highlighting
  const renderTranscription = () => {
    if (!transcription) return transcription;

    const wordsArray = transcription.split(" ");
    return wordsArray.map((word, index) => (
      <span
        key={index}
        className={`${
          index === currentWordIndex
            ? "bg-[#7AE2CF] text-gray-900 px-1 rounded"
            : ""
        }`}
      >
        {word}{" "}
      </span>
    ));
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 max-h-screen">
      <H2 className="text-[#7AE2CF] mb-8">All in One Assistant</H2>

      {/* tab navigation */}
      <div className="flex gap-6 border-b border-gray-400 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-1 relative cursor-pointer transition-colors text-sm md:text-base ${
              activeTab === tab.id
                ? "text-[#7AE2CF]"
                : "text-gray-500 hover:text-gray-600"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute left-0 bottom-0 right-0 h-0.5 bg-[#7AE2CF]" />
            )}
          </button>
        ))}
      </div>

      {/* tab content */}
      <div className="min-h-[500px]">
        {activeTab === "transcript" && (
          <div className="flex flex-col gap-4 h-full">
            <div className="relative">
              <textarea
                className="w-full h-96 p-4 border border-gray-300 rounded-lg overflow-y-auto focus:outline-none focus:ring-2 focus:ring-[#7AE2CF] bg-gray-50 text-gray-900"
                placeholder="Click (Start Mic) for real-time transcription or upload an
                    audio file..."
              >
                {transcription && (
                  <div className="whitespace-pre-wrap">
                    {renderTranscription()}
                  </div>
                )}
              </textarea>
              {(isRecording || isTranscribing) && (
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-red-500 font-medium">
                    {isRecording ? "Recording" : "Transcribing"}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center justify-center md:flex-row gap-4">
              {/* Microphone Error or Button - Hidden during file upload flow */}
              <Mic
                isRecording={isRecording}
                isTranscribing={isTranscribing}
                micError={micError}
                uploadedFile={uploadedFile}
                uploadProgress={uploadProgress}
                handleStartMic={handleStartMic}
                handleStopMic={handleStopMic}
              />

              {/* File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,.mp4,.wav,.m4a,audio/*,video/mp4"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Upload Progress */}
              <Upload
                uploadProgress={uploadProgress}
                uploadedFile={uploadedFile}
                isTranscribing={isTranscribing}
                isRecording={isRecording}
                transcribeError={transcribeError}
                handleButtonClick={handleButtonClick}
                handleClearFile={handleClearFile}
                handleTranscribe={handleTranscribe}
                handleStopTranscription={handleStopTranscription}
              />
            </div>
          </div>
        )}

        {activeTab === "summary" && <Summary />}

        {activeTab === "insights" && <Insight />}
      </div>
    </div>
  );
};

export default Transcription;
