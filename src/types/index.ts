export interface SystemStatus {
  status: string;
  uptime: string;
  micStatus: string;
  recognition: string;
}

export interface Command {
  name: string;
  description: string;
  action: () => void;
}

export interface CommandHistoryItem {
  timestamp: Date;
  message: string;
  type: 'command' | 'system' | 'error';
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
} 