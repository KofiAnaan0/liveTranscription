import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  MicOff,
  Upload,
  Download,
  Play,
  Pause,
  FileAudio,
  Send,
} from "lucide-react";

interface TranscriptSegment {
  text: string;
  timestamp: number;
  completed: boolean;
}

const TranscriptionSummaryApp = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [wsStatus, setWsStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [completeTranscript, setCompleteTranscript] = useState("");
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [processingProgress, setProcessingProgress] = useState(0);
  
  // Summary states
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const fileProcessingRef = useRef<boolean>(false);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const connectWebSocket = () => {
    setWsStatus("connecting");
    const ws = new WebSocket("ws://localhost:9090");

    ws.onopen = () => {
      console.log("WebSocket connected");
      setWsStatus("connected");
      ws.send(
        JSON.stringify({
          uid: Math.random().toString(36).substring(7),
          language: "en",
          task: "transcribe",
          use_vad: true,
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.message === "SERVER_READY") console.log("Server ready");
        if (data.language) console.log(`Detected language: ${data.language}`);
        if (data.segments) handleTranscriptionSegments(data.segments);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setWsStatus("disconnected");
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setWsStatus("disconnected");
    };

    wsRef.current = ws;
  };

  const handleTranscriptionSegments = (segments: TranscriptSegment[]) => {
    let completedText = "";
    let inProgressText = "";

    segments.forEach((seg, idx) => {
      if (idx === segments.length - 1 && !seg.completed) {
        inProgressText = seg.text.trim();
      } else if (seg.completed) {
        completedText += (completedText ? " " : "") + seg.text.trim();
      }
    });

    if (completedText) {
      setCompleteTranscript(completedText);
      setLastUpdateTime(Date.now());
    }
    setCurrentText(inProgressText);
  };

  const startRecording = async () => {
    try {
      if (wsStatus !== "connected") {
        connectWebSocket();
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      streamRef.current = stream;
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      source.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = (e) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          const audioData = new Float32Array(inputData);
          wsRef.current.send(audioData.buffer);
        }
      };

      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (streamRef.current)
      streamRef.current.getTracks().forEach((track) => track.stop());
    if (audioContextRef.current) audioContextRef.current.close();
    if (wsRef.current?.readyState === WebSocket.OPEN)
      wsRef.current.send("END_OF_AUDIO");
    setIsRecording(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file);
    }
  };

  const processAudioFile = async () => {
    if (!audioFile || fileProcessingRef.current) return;

    try {
      if (wsStatus !== "connected") {
        connectWebSocket();
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      fileProcessingRef.current = true;
      setIsProcessingFile(true);
      setProcessingProgress(0);
      setCompleteTranscript("");
      setCurrentText("");

      const audioUrl = URL.createObjectURL(audioFile);
      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;
      
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
      });

      const arrayBuffer = await audioFile.arrayBuffer();
      const audioContext = new AudioContext({ sampleRate: 16000 });
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const offlineContext = new OfflineAudioContext(
        1,
        audioBuffer.duration * 16000,
        16000
      );
      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineContext.destination);
      source.start(0);

      const resampledBuffer = await offlineContext.startRendering();
      const audioData = resampledBuffer.getChannelData(0);

      const chunkSize = 4096;
      const chunkDuration = chunkSize / 16000;
      
      for (let i = 0; i < audioData.length; i += chunkSize) {
        if (!fileProcessingRef.current) break;

        const chunk = audioData.slice(i, i + chunkSize);
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(chunk.buffer);
        }

        setProcessingProgress(Math.round((i / audioData.length) * 100));
        await new Promise((resolve) => setTimeout(resolve, chunkDuration * 1000));
      }

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send("END_OF_AUDIO");
      }

      setProcessingProgress(100);
      
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        URL.revokeObjectURL(audioUrl);
        audioElementRef.current = null;
      }
      
      setTimeout(() => {
        setIsProcessingFile(false);
        setProcessingProgress(0);
        fileProcessingRef.current = false;
      }, 1000);
    } catch (error) {
      console.error("Error processing audio file:", error);
      alert("Error processing audio file. Please try again.");
      setIsProcessingFile(false);
      setProcessingProgress(0);
      fileProcessingRef.current = false;
      
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
    }
  };

  const stopFileProcessing = () => {
    fileProcessingRef.current = false;
    setIsProcessingFile(false);
    setProcessingProgress(0);
    
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send("END_OF_AUDIO");
    }
  };

  const downloadTranscript = () => {
    const fullTranscript =
      completeTranscript + (currentText ? " " + currentText : "");
    const blob = new Blob([fullTranscript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearTranscript = () => {
    setCompleteTranscript("");
    setCurrentText("");
    setSummary("");
    setShowSummary(false);
  };

  const handleSendToSummary = async () => {
    const fullTranscript = completeTranscript + (currentText ? " " + currentText : "");
    
    if (!fullTranscript.trim()) {
      alert("No transcript available to summarize.");
      return;
    }

    setShowSummary(true);
    setLoadingSummary(true);
    setSummary("");

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullTranscript, language: 'en' }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.summary && data.summary.trim()) {
        setSummary(data.summary.trim());
      } else {
        console.error('Empty or invalid summary:', data);
        setSummary('Error: Received empty summary from API. Please check your llama.cpp server.');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummary('Error generating summary. Please check that your /api/summarize endpoint and llama.cpp server are working.');
    } finally {
      setLoadingSummary(false);
    }
  };

  const downloadSummary = () => {
    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `summary-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [completeTranscript, currentText]);

  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (streamRef.current)
        streamRef.current.getTracks().forEach((track) => track.stop());
      if (audioContextRef.current) audioContextRef.current.close();
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">
          Eliminate Tedious Note-Taking
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Real-time audio transcription with AI-powered summarization
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">Connection Status</p>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      wsStatus === "connected"
                        ? "bg-green-500"
                        : wsStatus === "connecting"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  />
                  <span className="text-sm text-gray-600 capitalize">
                    {wsStatus}
                  </span>
                </div>
              </div>
              {wsStatus === "disconnected" && (
                <button
                  onClick={connectWebSocket}
                  className="w-full bg-blue-500 text-white py-2 cursor-pointer rounded-lg hover:bg-blue-600 transition"
                >
                  Connect to Server
                </button>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Microphone Recording</h3>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={wsStatus !== "connected" || isProcessingFile}
                className={`w-full py-4 rounded-lg font-semibold text-white transition flex items-center justify-center gap-2 ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff size={24} />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic size={24} />
                    Start Recording
                  </>
                )}
              </button>
              {isRecording && (
                <div className="mt-4 flex items-center justify-center gap-2 text-red-500">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="font-medium">Recording in progress...</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Upload Audio File
              </h2>
              <div className="mb-4">
                <label className="block w-full">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition">
                    <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                    <span className="text-sm text-gray-600">
                      {audioFile
                        ? audioFile.name
                        : "Click to upload audio file"}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isRecording || isProcessingFile}
                  />
                </label>
              </div>

              {audioFile && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <FileAudio size={20} />
                    <span className="flex-1 truncate">{audioFile.name}</span>
                  </div>

                  <button
                    onClick={
                      isProcessingFile ? stopFileProcessing : processAudioFile
                    }
                    disabled={wsStatus !== "connected" || isRecording}
                    className={`w-full py-3 rounded-lg font-semibold text-white transition flex items-center justify-center gap-2 ${
                      isProcessingFile
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    }`}
                  >
                    {isProcessingFile ? (
                      <>
                        <Pause size={20} />
                        Stop Processing
                      </>
                    ) : (
                      <>
                        <Play size={20} />
                        Process Audio
                      </>
                    )}
                  </button>

                  {isProcessingFile && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Processing...</span>
                        <span>{processingProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${processingProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Live Transcript
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(completeTranscript || currentText) && (
                    <>
                      <button
                        onClick={handleSendToSummary}
                        disabled={loadingSummary}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        <Send size={16} />
                        Summarize
                      </button>
                      <button
                        onClick={clearTranscript}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm"
                      >
                        Clear
                      </button>
                      <button
                        onClick={downloadTranscript}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                      >
                        <Download size={16} />
                        Download
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex-1 h-[400px] overflow-y-auto bg-gray-50 rounded-lg p-6">
                {!completeTranscript && !currentText && (
                  <div className="text-center text-gray-400 mt-20">
                    <Mic size={48} className="mx-auto mb-4 opacity-50" />
                    <p>
                      Start recording or process an audio file to see
                      transcription...
                    </p>
                  </div>
                )}

                {(completeTranscript || currentText) && (
                  <div className="w-full">
                    <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                      {completeTranscript}
                      {currentText && (
                        <span className="bg-yellow-100 px-1 animate-pulse">
                          {" " + currentText}
                        </span>
                      )}
                    </p>
                    {lastUpdateTime && (
                      <p className="text-xs text-gray-500 mt-4">
                        Last updated:{" "}
                        {new Date(lastUpdateTime).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                )}
                <div ref={transcriptEndRef} />
              </div>
            </div>

            {showSummary && (
              <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    AI Summary
                  </h2>
                  {summary && (
                    <button
                      onClick={downloadSummary}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  )}
                </div>

                <div className="flex-1 min-h-[200px] overflow-y-auto bg-gray-50 rounded-lg p-6">
                  {loadingSummary ? (
                    <div className="flex items-center justify-center h-full">
                      <span className="animate-pulse text-gray-500">
                        Generating summary...
                      </span>
                    </div>
                  ) : summary ? (
                    <div className="w-full">
                      <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
                        {summary}
                      </p>
                      <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                        <p>Original: {(completeTranscript + currentText).length} characters</p>
                        <p>Summary: {summary.length} characters</p>
                        <p>Reduction: {Math.round((1 - summary.length / (completeTranscript + currentText).length) * 100)}%</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">
                      Summary will appear here...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscriptionSummaryApp;