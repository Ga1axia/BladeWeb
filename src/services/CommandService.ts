interface Command {
  name: string;
  description: string;
  action: () => void;
}

class CommandService {
  private commands: Command[] = [];

  constructor() {
    this.initializeCommands();
  }

  private initializeCommands() {
    this.registerCommand('time', 'Shows current time', () => {
      const time = new Date().toLocaleTimeString();
      this.addToHistory(`Current time is ${time}`);
    });

    this.registerCommand('date', 'Shows today\'s date', () => {
      const date = new Date().toLocaleDateString();
      this.addToHistory(`Today's date is ${date}`);
    });

    this.registerCommand('weather', 'Checks local weather', async () => {
      try {
        // This would need an API key and proper implementation
        this.addToHistory('Weather feature requires API configuration');
      } catch (error) {
        this.addToHistory('Error fetching weather data');
      }
    });

    this.registerCommand('open notes', 'Opens the notes application', () => {
      // Implement notes functionality
      this.addToHistory('Opening notes application');
    });

    this.registerCommand('search web', 'Starts a web search', (query?: string) => {
      if (query) {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
        this.addToHistory(`Searching for: ${query}`);
      } else {
        this.addToHistory('No search query provided');
      }
    });

    this.registerCommand('toggle', 'Switches between modes', () => {
      // Implement mode toggle
      this.addToHistory('Toggling mode');
    });

    this.registerCommand('help', 'Shows all available commands', () => {
      const commandList = this.commands
        .map(cmd => `${cmd.name} - ${cmd.description}`)
        .join('\n');
      this.addToHistory('Available commands:\n' + commandList);
    });
  }

  public registerCommand(name: string, description: string, action: () => void) {
    this.commands.push({ name, description, action });
  }

  public getCommands(): Command[] {
    return this.commands;
  }

  public executeCommand(name: string) {
    const command = this.commands.find(cmd => cmd.name.toLowerCase() === name.toLowerCase());
    if (command) {
      command.action();
      return true;
    }
    return false;
  }

  private addToHistory(message: string) {
    // This should be implemented to update the UI
    console.log(message);
    // You would typically emit an event or use a state management solution
    // to update the command history in the UI
  }
}

export default new CommandService(); 