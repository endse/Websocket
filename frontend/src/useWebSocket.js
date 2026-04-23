import { useEffect, useRef, useCallback, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

export function useWebSocket(user) {
  const clientRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const subscriptionsRef = useRef([]);

  useEffect(() => {
    if (!user) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {},
    });

    client.onConnect = () => {
      setConnected(true);
      subscriptionsRef.current.forEach(({ destination, callback }) => {
        client.subscribe(destination, callback);
      });
    };

    client.onDisconnect = () => {
      setConnected(false);
    };

    client.onStompError = (frame) => {
      console.error('STOMP error:', frame);
      setConnected(false);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [user]);

  const subscribe = useCallback((destination, callback) => {
    const client = clientRef.current;
    if (client && client.connected) {
      const sub = client.subscribe(destination, (message) => {
        const body = JSON.parse(message.body);
        callback(body);
      });
      return sub;
    }
    subscriptionsRef.current.push({
      destination,
      callback: (message) => {
        const body = JSON.parse(message.body);
        callback(body);
      },
    });
    return null;
  }, []);

  const publish = useCallback((destination, body) => {
    const client = clientRef.current;
    if (client && client.connected) {
      client.publish({
        destination,
        body: JSON.stringify(body),
      });
    }
  }, []);

  return { connected, subscribe, publish };
}
