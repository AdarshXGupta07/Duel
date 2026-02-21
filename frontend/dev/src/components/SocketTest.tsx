"use client";

import { useSocket } from "../providers/SocketProvider";

export const SocketTest = () => {
  const { socket, isConnected } = useSocket();

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: isConnected ? '#22c55e' : '#ef4444', 
      color: 'white', 
      padding: '8px 12px', 
      borderRadius: '4px',
      fontSize: '12px'
    }}>
      Socket: {isConnected ? 'Connected' : 'Disconnected'}
      {socket && <div>ID: {socket.id}</div>}
    </div>
  );
};
