import { useEffect, useRef, useState } from "react";

export default function useWebSocket(url) {
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = () => {
    socketRef.current = new WebSocket(url);

    socketRef.current.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    };

    socketRef.current.onclose = () => {
      console.warn("WebSocket disconnected");
      setIsConnected(false);
      reconnect();
    };

    socketRef.current.onerror = (err) => {
      console.log("WebSocket error");
      socketRef.current.close();
    };
  };

  const reconnect = () => {
    ((reconnectTimeoutRef.current = setTimeout(() => {
      if (!isConnected) {
        // console.log("Reconnecting...");
        connect();
      }
    })),
      1000);
  };

  useEffect(() => {
    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      clearTimeout(reconnectTimeoutRef.current);
    };
  }, [url]);

  return {
    socket: socketRef.current,
    isConnected,
  };
}
