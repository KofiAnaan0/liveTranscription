"use client";

import { tabs } from "@/data/tabsData";
import { WhisperLiveMessage } from "@/types/backendType";
import React, { useRef, useState, useEffect, useCallback } from "react";
import H2 from "./ui/H2";
import Summary from "./helper/Summary";
import Insight from "./helper/Insight";
import Upload from "./helper/Upload";
import Mic from "./helper/Mic";

const Transcription = () => {
  const [activeTab, setActiveTab] = useState<
    "transcript" | "summary" | "insights"
  >("transcript");

  // Separate confirmed and live text for real-time display
  const [confirmedTranscript, setConfirmedTranscript] = useState<string>("");
  const [liveText, setLiveText] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [micError, setMicError] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);

  // Upload states
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeError, setTranscribeError] = useState<string>("");

  // Audio playback states
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [, setCurrentWordIndex] = useState<number>(-1);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll textarea to bottom
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [confirmedTranscript, liveText]);

  // WebSocket connection with reconnection logic
  const connectWebSocket = useCallback(() => {
    // Clear any existing reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    try {
      const ws = new WebSocket("ws://localhost:9090");

      ws.onopen = () => {
        console.log("Connected to Whisper Live server");
        setIsConnected(true);
        setMicError("");

        // Send initial configuration message
        const config = {
          uid: "web-client-" + Date.now(),
          language: null, // Auto-detect language
          task: "transcribe",
          use_vad: true, // Enable VAD for better real-time performance
          model: "small",
          send_last_n_segments: 10,
        };
        ws.send(JSON.stringify(config));
        console.log("Sent config:", config);
      };

      ws.onmessage = (event) => {
        try {
          const data: WhisperLiveMessage = JSON.parse(event.data);
          console.log("Received:", data);

          // Handle server ready message
          if (data.message === "SERVER_READY") {
            console.log("Server is ready");
            return;
          }

          // Handle language detection
          if (data.language) {
            console.log(`Detected language: ${data.language}`);
            return;
          }

          // Handle segments - this is the key for real-time transcription
          if (data.segments && data.segments.length > 0) {
            let completedText = "";
            let partialText = "";
            const segments = data.segments; // Store in variable for type safety

            segments.forEach((seg, index) => {
              const text = seg.text || "";
              
              // Last segment that's not completed is the "live" text
              if (index === segments.length - 1 && !seg.end) {
                partialText = text;
              } 
              // Completed segments get added to confirmed transcript
              else if (seg.end) {
                completedText += (completedText ? " " : "") + text;
              }
            });

            // Update confirmed transcript if we have new completed segments
            if (completedText) {
              setConfirmedTranscript((prev) => {
                const newText = prev ? `${prev} ${completedText}` : completedText;
                return newText.trim();
              });
            }

            // Always update live text (this creates the real-time effect)
            setLiveText(partialText.trim());
          }
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
        setMicError("Connection error. Please check if server is running.");
      };

      ws.onclose = () => {
        console.log("Disconnected from server");
        setIsConnected(false);
        wsRef.current = null;
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Failed to connect:", error);
      setMicError("Failed to connect to transcription server");
      setIsConnected(false);
    }
  }, []);

  // Convert audio to PCM format
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
      setConfirmedTranscript("");
      setLiveText("");

      // Connect to WebSocket if not connected
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        connectWebSocket();
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        setMicError("Failed to connect to server. Please ensure the server is running on port 9090.");
        return;
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
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
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);

        // Convert float32 to int16
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        // Send PCM data as binary
        try {
          wsRef.current.send(pcmData.buffer);
        } catch (error) {
          console.error("Error sending audio data:", error);
        }
      };

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);
      processorRef.current = processor;

      console.log("Recording started - speak now!");
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

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Disconnect processor
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Merge live text into confirmed transcript before stopping
    if (liveText) {
      setConfirmedTranscript((prev) => {
        const combined = prev ? `${prev} ${liveText}` : liveText;
        return combined.trim();
      });
      setLiveText("");
    }

    // Send END_OF_AUDIO signal
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send("END_OF_AUDIO");
      } catch (error) {
        console.error("Error sending END_OF_AUDIO:", error);
      }
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

      // Validate file type
      const validTypes = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/m4a', 'video/mp4'];
      if (!validTypes.some(type => file.type.startsWith('audio')) && file.type !== 'video/mp4') {
        setTranscribeError("Invalid file type. Please upload an audio or video file.");
        return;
      }

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
      setConfirmedTranscript("");
      setLiveText("");
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

      // Convert audio file to PCM format
      const audioBlob = new Blob([await uploadedFile.arrayBuffer()], {
        type: uploadedFile.type,
      });
      const pcmData = await convertAudioToPCM(audioBlob);

      // Send PCM data in chunks with proper timing
      const chunkSize = 8192;
      const totalChunks = Math.ceil(pcmData.length / chunkSize);
      
      for (let i = 0; i < pcmData.length; i += chunkSize) {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const chunk = pcmData.slice(i, i + chunkSize);
          wsRef.current.send(chunk.buffer);
          
          // Log progress
          const progress = Math.round((i / pcmData.length) * 100);
          console.log(`Sending audio chunks: ${progress}%`);
          
          // Small delay to prevent overwhelming the server
          await new Promise((resolve) => setTimeout(resolve, 50));
        } else {
          throw new Error("Connection lost during transcription");
        }
      }

      // Send END_OF_AUDIO signal
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send("END_OF_AUDIO");
      }

      console.log("Transcription streaming completed");
      
      // Auto-stop after completion
      setTimeout(() => {
        setIsTranscribing(false);
      }, 2000);
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
    // Merge live text into confirmed before stopping
    if (liveText) {
      setConfirmedTranscript((prev) => {
        const combined = prev ? `${prev} ${liveText}` : liveText;
        return combined.trim();
      });
      setLiveText("");
    }
    
    setIsTranscribing(false);
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send("END_OF_AUDIO");
      } catch (error) {
        console.error("Error sending END_OF_AUDIO:", error);
      }
    }
    
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
    setCurrentWordIndex(-1);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl("");
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Close WebSocket
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      
      // Stop media stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      
      // Close audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      
      // Revoke audio URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      // Clear reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [audioUrl]);

  // Combine confirmed and live text for display
  const displayText = confirmedTranscript + (liveText ? (confirmedTranscript ? " " : "") + liveText : "");

  return (
    <div className="w-full max-w-4xl mx-auto p-6 max-h-screen">
      <H2 className="text-[#7AE2CF] mb-8">All in One Assistant</H2>

      {/* Connection status indicator */}
      {!isConnected && (isRecording || isTranscribing) && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-yellow-800">
            Connecting to server...
          </span>
        </div>
      )}

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
                ref={textareaRef}
                className="w-full h-96 p-4 border border-gray-300 rounded-lg overflow-y-auto focus:outline-none focus:ring-2 focus:ring-[#7AE2CF] bg-gray-50 text-gray-900 resize-none"
                placeholder="Click 'Start Mic' for real-time transcription or upload an audio file..."
                value={displayText}
                readOnly
              />
              {(isRecording || isTranscribing) && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-md">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-red-500 font-medium">
                    {isRecording ? "Recording - Speak now!" : "Transcribing"}
                  </span>
                </div>
              )}
              {liveText && (
                <div className="absolute bottom-4 left-4 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                  Live
                </div>
              )}
            </div>

            <div className="flex flex-col items-center justify-center md:flex-row gap-4">
              {/* Microphone Component */}
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

              {/* Upload Component */}
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

            {/* Hidden audio element for playback */}
            {audioUrl && (
              <audio ref={audioRef} src={audioUrl} className="hidden" />
            )}
          </div>
        )}

        {activeTab === "summary" && <Summary />}

        {activeTab === "insights" && <Insight />}
      </div>
    </div>
  );
};

export default Transcription;