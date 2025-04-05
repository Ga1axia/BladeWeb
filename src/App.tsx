import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import SpeechRecognitionService from './services/SpeechRecognition';
import CommandService from './services/CommandService';
import { SystemStatus, CommandHistoryItem } from './types';

// Components
const AppContainer = styled.div`
  background-color: #0a1017;
  min-height: 100vh;
  color: #00ffff;
  padding: 20px;
  font-family: 'Arial', sans-serif;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid #00ffff;
  border-radius: 5px;
  margin-bottom: 20px;
  background-color: rgba(0, 255, 255, 0.05);
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #00ffff;
`;

const StatusIndicator = styled.span<{ isReady: boolean }>`
  display: inline-flex;
  align-items: center;
  &::before {
    content: '';
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${props => props.isReady ? '#00ff00' : '#ff0000'};
    margin-right: 5px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  background-color: transparent;
  border: 1px solid #00ffff;
  color: #00ffff;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(0, 255, 255, 0.1);
  }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
`;

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Panel = styled.div`
  border: 1px solid #00ffff;
  border-radius: 5px;
  padding: 15px;
  background-color: rgba(0, 255, 255, 0.05);
`;

const PanelTitle = styled.h2`
  font-size: 18px;
  margin: 0 0 15px 0;
  color: #00ffff;
`;

const VoiceInput = styled.div`
  border: 1px solid #00ffff;
  border-radius: 4px;
  padding: 10px;
  min-height: 100px;
  margin-top: 10px;
  font-family: monospace;
`;

const CommandHistory = styled.div`
  max-height: 300px;
  overflow-y: auto;
  font-family: monospace;
`;

function App() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    status: 'Ready',
    uptime: '00:00:00',
    micStatus: 'Not active',
    recognition: 'Inactive'
  });

  const [isListening, setIsListening] = useState(false);
  const [wakeWordMode, setWakeWordMode] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [commandHistory, setCommandHistory] = useState<CommandHistoryItem[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');

  useEffect(() => {
    // Initialize speech recognition
    SpeechRecognitionService.setCallbacks({
      onStart: () => {
        setSystemStatus(prev => ({
          ...prev,
          micStatus: 'Active',
          recognition: 'Active'
        }));
      },
      onResult: (transcript) => {
        setCurrentTranscript(transcript);
      },
      onEnd: () => {
        setSystemStatus(prev => ({
          ...prev,
          micStatus: 'Not active',
          recognition: 'Inactive'
        }));
        setIsListening(false);
      },
      onError: (error) => {
        addToHistory(`Error: ${error}`, 'error');
      }
    });

    // Update uptime
    const timer = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        uptime: incrementUptime(prev.uptime)
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const incrementUptime = (uptime: string): string => {
    const [hours, minutes, seconds] = uptime.split(':').map(Number);
    let newSeconds = seconds + 1;
    let newMinutes = minutes;
    let newHours = hours;

    if (newSeconds >= 60) {
      newSeconds = 0;
      newMinutes++;
    }
    if (newMinutes >= 60) {
      newMinutes = 0;
      newHours++;
    }

    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}:${String(newSeconds).padStart(2, '0')}`;
  };

  const addToHistory = (message: string, type: 'command' | 'system' | 'error' = 'system') => {
    setCommandHistory(prev => [...prev, {
      timestamp: new Date(),
      message,
      type
    }]);
  };

  const toggleListening = () => {
    if (isListening) {
      SpeechRecognitionService.stop();
    } else {
      SpeechRecognitionService.start();
      setIsListening(true);
    }
  };

  return (
    <AppContainer>
      <Header>
        <Logo>BLADE</Logo>
        <StatusIndicator isReady={systemStatus.status === 'Ready'}>
          SYSTEM READY
        </StatusIndicator>
        <ButtonGroup>
          <Button>Transcriber</Button>
          <Button>SETTINGS</Button>
          <Button onClick={toggleListening}>
            {isListening ? 'STOP LISTENING' : 'START LISTENING'}
          </Button>
          <Button>TEST MIC</Button>
        </ButtonGroup>
      </Header>

      <MainGrid>
        <LeftPanel>
          <Panel>
            <PanelTitle>System Status</PanelTitle>
            <div>Status: {systemStatus.status}</div>
            <div>Uptime: {systemStatus.uptime}</div>
            <div>Mic Status: {systemStatus.micStatus}</div>
            <div>Recognition: {systemStatus.recognition}</div>
          </Panel>

          <Panel>
            <PanelTitle>Controls</PanelTitle>
            <Button style={{ width: '100%', marginBottom: '10px' }} onClick={toggleListening}>
              {isListening ? 'STOP LISTENING' : 'START LISTENING'}
            </Button>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Wake Word Mode</span>
              <input
                type="checkbox"
                checked={wakeWordMode}
                onChange={(e) => setWakeWordMode(e.target.checked)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Offline Mode</span>
              <input
                type="checkbox"
                checked={offlineMode}
                onChange={(e) => setOfflineMode(e.target.checked)}
              />
            </div>
          </Panel>

          <Panel>
            <PanelTitle>Command History</PanelTitle>
            <CommandHistory>
              {commandHistory.map((item, index) => (
                <div key={index} style={{ color: item.type === 'error' ? '#ff0000' : '#00ffff' }}>
                  [{item.timestamp.toLocaleTimeString()}] {item.message}
                </div>
              ))}
            </CommandHistory>
          </Panel>
        </LeftPanel>

        <RightPanel>
          <Panel>
            <PanelTitle>Voice Input</PanelTitle>
            <VoiceInput>
              {currentTranscript || '12:00 System initialized'}
            </VoiceInput>
          </Panel>

          <Panel>
            <PanelTitle>Available Commands</PanelTitle>
            {CommandService.getCommands().map((command, index) => (
              <div key={index}>{command.name} - {command.description}</div>
            ))}
          </Panel>
        </RightPanel>
      </MainGrid>
    </AppContainer>
  );
}

export default App; 