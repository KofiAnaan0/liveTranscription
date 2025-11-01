export interface TranscriptionSegment {
    text: string;
    start?: number;
    end?: number;
  }

  export interface WhisperLiveMessage {
    uid?: string;
    language?: string;
    task?: string;
    model?: string;
    use_vad?: boolean;
    segments?: TranscriptionSegment[];
    text?: string;
    message?: string;
  }