import React, {
  createContext,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { io, Socket } from 'socket.io-client';

import { env } from '../../shared/config/env';
import { useAuth } from './AuthProvider';

type SocketContextValue = {
  socket: Socket | null;
  connected: boolean;
};

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

type SocketProviderProps = {
  children: ReactNode;
};

export const SocketProvider = ({
  children,
}: SocketProviderProps): ReactElement => {
  const { accessToken, status } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const shouldConnect =
    env.enableSocket && status === 'authenticated' && Boolean(accessToken);

  useEffect(() => {
    if (!shouldConnect || !accessToken) {
      return undefined;
    }

    const nextSocket = io(env.socketUrl, {
      autoConnect: false,
      transports: ['websocket'],
      auth: { token: accessToken },
    });

    nextSocket.on('connect', () => {
      setSocket(nextSocket);
      setConnected(true);
    });
    nextSocket.on('disconnect', () => {
      setConnected(false);
      setSocket(currentSocket =>
        currentSocket === nextSocket ? null : currentSocket,
      );
    });
    nextSocket.connect();

    return () => {
      nextSocket.removeAllListeners();
      nextSocket.disconnect();
    };
  }, [accessToken, shouldConnect]);

  const value = useMemo<SocketContextValue>(
    () => ({
      socket: shouldConnect ? socket : null,
      connected: shouldConnect && connected,
    }),
    [connected, shouldConnect, socket],
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextValue => {
  const context = useContext(SocketContext);

  if (context === undefined) {
    throw new Error('useSocket must be used inside SocketProvider');
  }

  return context;
};
