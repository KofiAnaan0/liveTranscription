import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Trash2 } from "lucide-react";

interface Transcription {
  id: string;
  text: string;
  timestamp: number;
}

interface AudioProcessor {
  processor: ScriptProcessorNode;
  source: MediaStreamAudioSourceNode;
}

interface TranscriptionSegment {
  text: string;
  final?: boolean;
}

interface TranscriptionMessage {
  segments?: TranscriptionSegment[];
  [key: string]: unknown;
}

const WhisperLiveTranscription = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [currentText, setCurrentText] = useState<string>("");
  const [error, setError] = useState<string>("");

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<AudioProcessor | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const transcriptionEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    transcriptionEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcriptions]);

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket("ws://localhost:9090");
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("Connected to Whisper server");
        setIsConnected(true);
        setError("");

        const config = {
          uid: "browser-client-" + Date.now(),
          language: "fr",
          task: "translate",
          model: "base",
          use_vad: false,
        };
        ws.send(JSON.stringify(config));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as TranscriptionMessage;
          console.log("Received:", data);

          if (data.segments) {
            const text = data.segments
              .map((s: TranscriptionSegment) => s.text)
              .join(" ");
            if (text.trim()) {
              setCurrentText(text);
              if (data.segments.some((s: TranscriptionSegment) => s.final)) {
                const newTranscription: Transcription = {
                  id: Date.now().toString(),
                  text: text,
                  timestamp: Date.now(),
                };
                setTranscriptions((prev) => [...prev, newTranscription]);
              }
            }
          }
        } catch (e) {
          console.error("Error parsing message:", e);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        setError(
          "Connection error. Make sure Whisper server is running on port 9090"
        );
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log("Disconnected from Whisper server");
        setIsConnected(false);
      };
    } catch (err) {
      const error = err as Error;
      setError("Failed to connect: " + error.message);
    }
  };

  const startRecording = async () => {
    try {
      setError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        connectWebSocket();
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const audioContext = new AudioContextClass({
        sampleRate: 16000,
      });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      source.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = (e: AudioProcessingEvent) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);

          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }

          wsRef.current.send(pcmData.buffer);
        }
      };

      mediaRecorderRef.current = { processor, source };
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Microphone access denied or not available");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      const { processor, source } = mediaRecorderRef.current;
      processor.disconnect();
      source.disconnect();
      mediaRecorderRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
  };

  const clearTranscriptions = () => {
    setTranscriptions([]);
    setCurrentText("");
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  useEffect(() => {
    return () => {
      stopRecording();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div
                  className={`w-4 h-4 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {isConnected && (
                    <span className="absolute inset-0 w-4 h-4 rounded-full bg-green-500 animate-ping opacity-75" />
                  )}
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Whisper Live Transcription
                </h1>
                <p className="text-sm text-white/60">
                  {isConnected ? "Connected" : "Disconnected"} • French →
                  English
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={toggleRecording}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff size={20} />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic size={20} />
                    Start
                  </>
                )}
              </button>

              <button
                onClick={clearTranscriptions}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}
        </div>

        {isRecording && (
          <div className="bg-red-500/20 backdrop-blur-lg rounded-2xl p-4 mb-6 border border-red-500/50 flex items-center gap-3">
            <div className="flex gap-1">
              <div
                className="w-1 h-8 bg-red-500 rounded-full animate-pulse"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-1 h-8 bg-red-500 rounded-full animate-pulse"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-1 h-8 bg-red-500 rounded-full animate-pulse"
                style={{ animationDelay: "300ms" }}
              />
            </div>
            <span className="text-red-200 font-semibold">
              Recording in progress...
            </span>
          </div>
        )}

        {currentText && (
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl p-8 mb-6 border border-white/20">
            <p className="text-white/40 text-sm mb-2 uppercase tracking-wider">
              Current
            </p>
            <p className="text-white text-2xl md:text-3xl font-light leading-relaxed">
              {currentText}
            </p>
          </div>
        )}

        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-white font-semibold">
              History ({transcriptions.length})
            </h2>
          </div>

          <div className="h-[500px] overflow-y-auto p-4 space-y-3">
            {transcriptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Mic size={48} className="text-white/20 mb-4" />
                <p className="text-white/40">
                  {isRecording
                    ? "Listening... Start speaking!"
                    : 'Click "Start" to begin recording'}
                </p>
              </div>
            ) : (
              transcriptions.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-white leading-relaxed">{item.text}</p>
                      <p className="text-white/40 text-xs mt-2">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={transcriptionEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhisperLiveTranscription;
