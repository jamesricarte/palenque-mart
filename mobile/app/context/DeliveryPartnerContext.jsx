"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { AppState } from "react-native";
import * as Location from "expo-location";
import { useAuth } from "./AuthContext";
import useWebSocket from "../hooks/useWebSocket";
import { API_URL, WEBSOCKET_URL } from "../config/apiConfig";
import axios from "axios";

const DeliveryPartnerContext = createContext();

export const DeliveryPartnerProvider = ({ children }) => {
  const { token } = useAuth();
  const [isInDeliveryDashboard, setIsInDeliveryDashboard] = useState(false);

  const { socket, isConnected } = useWebSocket(
    token && isInDeliveryDashboard ? WEBSOCKET_URL : null
  );

  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const appStateRef = useRef(AppState.currentState);
  const [deliveryPartnerId, setDeliveryPartnerId] = useState(null);
  const [refreshOrderData, setRefreshOrderData] = useState(false);
  const [socketMessage, setSocketMessage] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState(null);

  let refreshOrderDataTimeout;

  const showModal = (data) => {
    setModalData(data);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    setModalData(null);
  };

  const refreshDeliveries = () => {
    if (!refreshOrderData) {
      setRefreshOrderData(true);

      refreshOrderDataTimeout = setTimeout(() => {
        setRefreshOrderData(false);
      }, 2000);
    }
  };

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (isInDeliveryDashboard) {
        if (
          appStateRef.current === "active" &&
          nextAppState.match(/inactive|background/)
        ) {
          setDeliveryPartnerOffline();
        }

        if (
          appStateRef.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          setOnlineStatus(true);
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
    };
  }, [isInDeliveryDashboard]);

  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "REFRESH_DELIVERY_PARTNER_ORDERS") {
            console.log(data.message);
            refreshDeliveries();
          }

          if (data.type === "NEW_DELIVERY_AVAILABLE") {
            showModal(data.data);
          }

          if (data.type === "REFRESH_DELIVERY_PARTNER_CONVERSATIONS") {
            setSocketMessage(data);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };
    }

    return () => {
      if (socket) {
        socket.onmessage = null;
      }

      clearTimeout(refreshOrderDataTimeout);
    };
  }, [socket, isConnected]);

  useEffect(() => {
    if (isConnected && isInDeliveryDashboard && deliveryPartnerId) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }
  }, [isConnected, isInDeliveryDashboard, deliveryPartnerId]);

  const setOnlineStatus = async (isOnline, location = null) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/delivery-partner/toggle-online-status`,
        {
          is_online: isOnline,
          current_location_lat: location?.latitude || null,
          current_location_lng: location?.longitude || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsOnline(response.data.data.is_online);
    } catch (error) {
      console.error("Error updating online status:", error.response.data.data);
    }
  };

  const updateLocation = async (newLocation) => {
    try {
      await axios.put(`${API_URL}/api/delivery-partner/update-location`, {
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
      });
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  const setDeliveryPartnerOffline = async () => {
    await setOnlineStatus(false);
  };

  const enterDeliveryDashboard = async () => {
    setIsInDeliveryDashboard(true);
  };

  const exitDeliveryDashboard = async () => {
    setIsInDeliveryDashboard(false);
    await setDeliveryPartnerOffline();
    stopLocationTracking();
  };

  const startLocationTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Location permission not granted");
        return;
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10,
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          const newLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: location.timestamp,
          };

          setCurrentLocation(newLocation);
          updateLocation(newLocation);

          if (socket && isConnected) {
            const locationData = {
              type: "delivery_partner_location",
              deliveryPartnerId: deliveryPartnerId,
              location: newLocation,
            };

            try {
              socket.send(JSON.stringify(locationData));
            } catch (error) {
              console.error("Error sending location via WebSocket:", error);
            }
          }
        }
      );

      setLocationSubscription(subscription);
      setOnlineStatus(true);
      console.log(
        `Delivery partner id: ${deliveryPartnerId} - location tracked`
      );
    } catch (error) {
      console.error("Error starting location tracking:", error);
    }
  };

  const stopLocationTracking = () => {
    if (locationSubscription) {
      console.log(
        `Stopped location tracking to delivery partner id: ${deliveryPartnerId}`
      );
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    setCurrentLocation(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isInDeliveryDashboard) {
        setDeliveryPartnerOffline();
        stopLocationTracking();
      }
    };
  }, []);

  const value = {
    isInDeliveryDashboard,
    currentLocation,
    enterDeliveryDashboard,
    exitDeliveryDashboard,
    isOnline,
    deliveryPartnerId,
    setDeliveryPartnerId,
    refreshOrderData,
    socketMessage,
    setSocketMessage,
    modalVisible,
    modalData,
    showModal,
    hideModal,
    refreshDeliveries,
  };

  return (
    <DeliveryPartnerContext.Provider value={value}>
      {children}
    </DeliveryPartnerContext.Provider>
  );
};

export const useDeliveryPartner = () => {
  const context = useContext(DeliveryPartnerContext);
  if (!context) {
    throw new Error(
      "useDeliveryPartner must be used within a DeliveryPartnerProvider"
    );
  }
  return context;
};
