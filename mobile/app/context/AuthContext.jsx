"use client";

import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL, WEBSOCKET_URL } from "../config/apiConfig";
import { Alert } from "react-native";
import useWebSocket from "../hooks/useWebSocket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [approvalStatusUpdated, setApprovalStatusUpdated] = useState(false);

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("token");
        if (savedToken) {
          // Set token for subsequent requests
          axios.defaults.headers.common["Authorization"] =
            `Bearer ${savedToken}`;
          const response = await axios.get(`${API_URL}/api/profile`);
          setUser(response.data.data);
          setToken(savedToken);
        }
      } catch (error) {
        console.error("Failed to load auth data:", error);
        // Clear potentially invalid token
        await AsyncStorage.removeItem("token");
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthData();
  }, []);

  const { socket, isConnected } = useWebSocket(
    token && user ? WEBSOCKET_URL : null
  );

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleMessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("WebSocket message received:", message);

        if (
          (message.type === "SELLER_APP_APPROVED" ||
            message.type === "DELIVERY_PARTNER_APP_APPROVED") &&
          message.targetUserId === user.id
        ) {
          Alert.alert(message.title, message.body);
          setApprovalStatusUpdated(true);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    socket.onmessage = handleMessage;

    return () => {
      if (socket) {
        socket.onmessage = null;
      }
    };
  }, [socket, isConnected, user]);

  const resetApprovalStatus = () => setApprovalStatusUpdated(false);

  const login = async (newToken) => {
    setToken(newToken);
    axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    await AsyncStorage.setItem("token", newToken);
    try {
      const response = await axios.get(`${API_URL}/api/profile`);
      setUser(response.data.data);
    } catch (error) {
      console.error("Failed to fetch profile after login:", error);
      // Handle error if profile fetch fails
      setUser(null);
    }
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
    await AsyncStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        setUser,
        approvalStatusUpdated,
        resetApprovalStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
