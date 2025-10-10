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
  const [authProcessing, setAuthProcessing] = useState(false);
  const [approvalStatusUpdated, setApprovalStatusUpdated] = useState(false);
  const [deliveryPartnerId, setDeliveryPartnerId] = useState(null);
  const [trackDeliveryPartner, setTrackDeliveryPartner] = useState(false);
  const [deliveryPartnerLocation, setDeliveryPartnerLocation] = useState(null);
  const [socketMessage, setSocketMessage] = useState(null);

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

  // Socket connection
  const { socket, isConnected } = useWebSocket(
    token && user ? WEBSOCKET_URL : null
  );

  useEffect(() => {
    if (socket && isConnected && user) {
      const userData = {
        type: "user_data",
        userId: user.id,
      };

      try {
        socket.send(JSON.stringify(userData));
      } catch (error) {
        console.error("Error sending consumer user data via WebSocket:", error);
      }

      const handleMessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (
            message.type === "SELLER_APP_APPROVED" ||
            message.type === "DELIVERY_PARTNER_APP_APPROVED"
          ) {
            Alert.alert(message.title, message.body);
            setApprovalStatusUpdated(true);
          }

          if (message.type === "REFRESH_USER_CONVERSATIONS") {
            setSocketMessage(message);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      socket.onmessage = handleMessage;
    }

    return () => {
      if (socket) {
        socket.onmessage = null;
      }
    };
  }, [socket, isConnected, user]);

  // Track delivery socket connection
  const { socket: trackDeliverySocket, isConnected: trackDeliveryConnection } =
    useWebSocket(token && user && trackDeliveryPartner ? WEBSOCKET_URL : null);

  useEffect(() => {
    if (trackDeliverySocket && trackDeliveryConnection && user) {
      const trackData = {
        type: "track_delivery_partner",
        deliveryPartnerId: deliveryPartnerId,
        role: "user",
        id: user.id,
      };

      try {
        trackDeliverySocket.send(JSON.stringify(trackData));
      } catch (error) {
        console.error("Error tracking delivery partner:", error);
      }

      const handleMessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === "delivery_partner_location_update") {
            setDeliveryPartnerLocation(message.deliveryPartnerLocation);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      trackDeliverySocket.onmessage = handleMessage;
    }

    return () => {
      if (trackDeliverySocket) {
        trackDeliverySocket.onmessage = null;
      }
    };
  }, [trackDeliverySocket, trackDeliveryConnection, user]);

  const resetApprovalStatus = () => setApprovalStatusUpdated(false);

  const startTrackingDeliveryPartner = (deliveryPartnerId) => {
    setTrackDeliveryPartner(true);
    setDeliveryPartnerId(deliveryPartnerId);
  };

  const stopTrackingDeliveryPartner = () => {
    setTrackDeliveryPartner(false);
    setDeliveryPartnerId(null);
    setDeliveryPartnerLocation(null);
  };

  const login = async (newToken) => {
    setAuthProcessing(true);

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
    } finally {
      setAuthProcessing(false);
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
        socketMessage,
        setSocketMessage,
        authProcessing,
        deliveryPartnerLocation,
        startTrackingDeliveryPartner,
        stopTrackingDeliveryPartner,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
