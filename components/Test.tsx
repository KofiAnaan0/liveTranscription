import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Upload,
  Download,
  Volume2,
  VolumeX,
} from "lucide-react";

interface TranscriptSegment {
  text: string;
  timestamp: number;
  completed: boolean;
}

const TranscriptionApp: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingBackground, setIsPlayingBackground] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [wsStatus, setWsStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [completeTranscript, setCompleteTranscript] = useState("");
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const transcriptEndRef = useRef(null);

  // Initialize WebSocket connection
  const connectWebSocket = () => {
    setWsStatus("connecting");
    const ws = new WebSocket("ws://localhost:9090"); // Replace with your server URL

    ws.onopen = () => {
      console.log("WebSocket connected");
      setWsStatus("connected");

      // Send initial configuration
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

        if (data.message === "SERVER_READY") {
          console.log("Server ready");
        }

        if (data.language) {
          console.log(`Detected language: ${data.language}`);
        }

        if (data.segments) {
          handleTranscriptionSegments(data.segments);
        }
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

  // Handle transcription segments
  const handleTranscriptionSegments = (segments: TranscriptSegment[]) => {
    let completedText = '';
    let inProgressText = '';

    segments.forEach((seg, idx) => {
      if (idx === segments.length - 1 && !seg.completed) {
        inProgressText = seg.text.trim();
      } else if (seg.completed) {
        completedText += (completedText ? ' ' : '') + seg.text.trim();
      }
    });

    if (completedText) {
      setCompleteTranscript(completedText);
      setLastUpdateTime(Date.now());
    }
    setCurrentText(inProgressText);
  };

  // Start recording from microphone
  const startRecording = async () => {
    try {
      if (wsStatus !== "connected") {
        connectWebSocket();
        // Wait a bit for connection
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

  // Stop recording
  const stopRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send("END_OF_AUDIO");
    }
    setIsRecording(false);
  };

  // Handle background audio file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      setBackgroundFile(file);
      const url = URL.createObjectURL(file);
      if (backgroundAudioRef.current) {
        backgroundAudioRef.current.src = url;
      }
    }
  };

  // Toggle background audio playback
  const toggleBackgroundAudio = () => {
    if (!backgroundAudioRef.current || !backgroundFile) return;

    if (isPlayingBackground) {
      backgroundAudioRef.current.pause();
    } else {
      backgroundAudioRef.current.play();
    }
    setIsPlayingBackground(!isPlayingBackground);
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (backgroundAudioRef.current) {
      backgroundAudioRef.current.volume = isMuted ? 0 : newVolume;
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (backgroundAudioRef.current) {
      backgroundAudioRef.current.volume = !isMuted ? 0 : volume;
    }
  };

  // Download transcript
  const downloadTranscript = () => {
    const fullTranscript = transcript
      .map((seg, idx) => `${idx + 1}. ${seg.text}`)
      .join("\n\n");

    const blob = new Blob([fullTranscript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearTranscript = () => {
    setCompleteTranscript('');
    setCurrentText('');
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
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Real-time Audio Transcription
          </h1>
          <p className="text-gray-600">
            Transcribe from microphone while playing background audio
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Connection Status
                </h2>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      wsStatus === 'connected'
                        ? 'bg-green-500'
                        : wsStatus === 'connecting'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                  />
                  <span className="text-sm text-gray-600 capitalize">
                    {wsStatus}
                  </span>
                </div>
              </div>
              {wsStatus === 'disconnected' && (
                <button
                  onClick={connectWebSocket}
                  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  Connect to Server
                </button>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Microphone Recording
              </h2>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={wsStatus !== 'connected'}
                className={`w-full py-4 rounded-lg font-semibold text-white transition flex items-center justify-center gap-2 ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed'
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
                Background Audio
              </h2>

              <div className="mb-4">
                <label className="block w-full">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition">
                    <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                    <span className="text-sm text-gray-600">
                      {backgroundFile
                        ? backgroundFile.name
                        : 'Click to upload audio file'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {backgroundFile && (
                <div className="space-y-4">
                  <button
                    onClick={toggleBackgroundAudio}
                    className="w-full bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 transition flex items-center justify-center gap-2"
                  >
                    {isPlayingBackground ? (
                      <>
                        <Pause size={20} />
                        Pause Background Audio
                      </>
                    ) : (
                      <>
                        <Play size={20} />
                        Play Background Audio
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={toggleMute}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 w-12">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>
                </div>
              )}

              <audio
                ref={backgroundAudioRef}
                loop
                onPlay={() => setIsPlayingBackground(true)}
                onPause={() => setIsPlayingBackground(false)}
                className="hidden"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Live Transcript
              </h2>
              <div className="flex gap-2">
                {(completeTranscript || currentText) && (
                  <>
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

            <div className="flex-1 h-[600px] overflow-y-auto bg-gray-50 rounded-lg p-6">
              {!completeTranscript && !currentText && (
                <div className="text-center text-gray-400 mt-20">
                  <Mic size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Start recording to see transcription...</p>
                </div>
              )}

              {(completeTranscript || currentText) && (
                <div>
                  <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                    {completeTranscript}
                    {currentText && (
                      <span className="bg-yellow-100 px-1 animate-pulse">
                        {' ' + currentText}
                      </span>
                    )}
                  </p>
                  {lastUpdateTime && (
                    <p className="text-xs text-gray-500 mt-4">
                      Last updated: {new Date(lastUpdateTime).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              )}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscriptionApp;
