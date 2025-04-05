import { 
  Command, 
  SpeechRecognition,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
  SpeechRecognitionResult,
  SpeechRecognitionAlternative
} from '../types';

class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private commands: Map<string, Command> = new Map();
  private callbacks: {
    onStart?: () => void;
    onResult?: (transcript: string) => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
  } = {};
  private readonly WAKE_WORD = 'blade';
  private isWakeWordEnabled = true;

  constructor() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionConstructor();
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

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = Array.from(event.results);
      const transcript = results
        .map(result => {
          const alternative = result[0] as SpeechRecognitionAlternative;
          return alternative?.transcript || '';
        })
        .join('');
      
      this.callbacks.onResult?.(transcript);
      
      const trimmedTranscript = transcript.toLowerCase().trim();
      if (this.isWakeWordEnabled) {
        if (trimmedTranscript.startsWith(this.WAKE_WORD)) {
          // Extract the command after the wake word
          const commandText = trimmedTranscript.substring(this.WAKE_WORD.length).trim();
          if (commandText) {
            this.processCommand(commandText);
          }
        }
      } else {
        // If wake word is disabled, process all speech as commands
        this.processCommand(trimmedTranscript);
      }
    };

    this.recognition.onend = () => {
      this.callbacks.onEnd?.();
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
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

  public setWakeWordEnabled(enabled: boolean) {
    this.isWakeWordEnabled = enabled;
  }

  private processCommand(transcript: string) {
    // First, try to match exact commands
    const entries = Array.from(this.commands.entries());
    for (const [trigger, command] of entries) {
      if (transcript === trigger) {
        command.action();
        return;
      }
    }

    // If no exact match, try to extract command and parameters
    const words = transcript.split(' ');
    const possibleCommands = ['search', 'open', 'show', 'time', 'date', 'weather', 'help'];
    
    for (const cmd of possibleCommands) {
      if (transcript.startsWith(cmd)) {
        const params = transcript.substring(cmd.length).trim();
        switch (cmd) {
          case 'search':
            if (params.startsWith('images of ')) {
              const searchQuery = params.substring('images of '.length);
              window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&tbm=isch`, '_blank');
            } else {
              window.open(`https://www.google.com/search?q=${encodeURIComponent(params)}`, '_blank');
            }
            break;
          case 'time':
            this.commands.get('time')?.action();
            break;
          case 'date':
            this.commands.get('date')?.action();
            break;
          case 'weather':
            this.commands.get('weather')?.action();
            break;
          case 'help':
            this.commands.get('help')?.action();
            break;
          // Add more command handlers as needed
        }
        return;
      }
    }
  }

  public isSupported(): boolean {
    return this.recognition !== null;
  }
}

export default new SpeechRecognitionService(); 