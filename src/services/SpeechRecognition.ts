interface Command {
  name: string;
  description: string;
  action: () => void;
}

class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private commands: Map<string, Command> = new Map();
  private callbacks: {
    onStart?: () => void;
    onResult?: (transcript: string) => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
  } = {};

  constructor() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    this.recognition.onstart = () => {
      this.callbacks.onStart?.();
    };

    this.recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      
      this.callbacks.onResult?.(transcript);
      this.processCommand(transcript.toLowerCase().trim());
    };

    this.recognition.onend = () => {
      this.callbacks.onEnd?.();
    };

    this.recognition.onerror = (event) => {
      this.callbacks.onError?.(event.error);
    };
  }

  public registerCommand(name: string, description: string, action: () => void) {
    this.commands.set(name.toLowerCase(), { name, description, action });
  }

  public start() {
    if (!this.recognition) {
      this.callbacks.onError?.('Speech recognition not supported');
      return;
    }
    this.recognition.start();
  }

  public stop() {
    if (!this.recognition) return;
    this.recognition.stop();
  }

  public setCallbacks(callbacks: {
    onStart?: () => void;
    onResult?: (transcript: string) => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
  }) {
    this.callbacks = callbacks;
  }

  private processCommand(transcript: string) {
    for (const [trigger, command] of this.commands.entries()) {
      if (transcript.includes(trigger)) {
        command.action();
        break;
      }
    }
  }

  public isSupported(): boolean {
    return this.recognition !== null;
  }
}

export default new SpeechRecognitionService(); 