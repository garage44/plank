/**
 * Type definitions for the application state
 */

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'insert' | 'update' | 'delete' | 'error';
}

export interface AppState {
  // WebSocket state
  ws: WebSocket | null;
  connected: boolean;
  
  // Log entries
  logs: LogEntry[];
  
  // Form state
  itemName: string;
  itemValue: string;
}

export interface BackendConfig {
  wsUrl: string;
  apiUrl: string;
}

