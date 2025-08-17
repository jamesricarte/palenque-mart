import { useEffect, useRef, useState } from "react";

export default function useWebSocket(url) {
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const stopRef = useRef(false);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = () => {
    socketRef.current = new WebSocket(url);

    socketRef.current.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      setSocket(socketRef.current);
    };

    socketRef.current.onclose = () => {
      console.warn("WebSocket disconnected");
      setIsConnected(false);
      setSocket(null);
      if (!stopRef.current) reconnect();
    };

    socketRef.current.onerror = (err) => {
      console.warn("WebSocket error");
      socketRef.current.close();
    };
  };

  const reconnect = () => {
    ((reconnectTimeoutRef.current = setTimeout(() => {
      if (!isConnected) {
        console.log("Websocket reconnecting...");
        connect();
      }
    })),
      1000);
  };

  useEffect(() => {
    if (!url) {
      stopRef.current = true;
      if (socketRef.current) socketRef.current.close();
      clearTimeout(reconnectTimeoutRef.current);
      return;
    } else {
      stopRef.current = false;
    }

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      clearTimeout(reconnectTimeoutRef.current);
    };
  }, [url]);

  return {
    socket,
    isConnected,
  };
}
