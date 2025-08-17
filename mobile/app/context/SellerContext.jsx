import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { API_URL, WEBSOCKET_URL } from "../config/apiConfig";
import { useAuth } from "./AuthContext";
import useWebSocket from "../hooks/useWebSocket";

const SellerContext = createContext();

export const useSeller = () => {
  const context = useContext(SellerContext);
  if (!context) {
    throw new Error("useSeller must be used within a SellerProvider");
  }
  return context;
};

export const SellerProvider = ({ children }) => {
  const { token } = useAuth();
  const [isInSellerDashboard, setIsInSellerDashboard] = useState(false);
  const [triggerWebsocket, setTriggerWebSocket] = useState(false);
  const [refreshOrdersData, setRefreshOrdersData] = useState(false);
  const [sellerId, setSellerId] = useState(null);
  const [deliveryPartnerId, setDeliveryPartnerId] = useState(null);
  const [trackDeliveryPartner, setTrackDeliveryPartner] = useState(false);
  const [deliveryPartnerLocation, setDeliveryPartnerLocation] = useState(null);
  const [socketMessage, setSocketMessage] = useState(null);

  const { socket, isConnected } = useWebSocket(
    token && isInSellerDashboard && triggerWebsocket ? WEBSOCKET_URL : null
  );

  const { socket: socket2, isConnected: isConnected2 } = useWebSocket(
    token && isInSellerDashboard && trackDeliveryPartner ? WEBSOCKET_URL : null
  );

  useEffect(() => {
    if (socket && isConnected) {
      const sellerUser = {
        type: "seller_user_data",
        sellerId: sellerId,
      };

      try {
        socket.send(JSON.stringify(sellerUser));
      } catch (error) {
        console.error("Error sending seller user data via WebSocket:", error);
      }

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "REFRESH_SELLER_ORDERS") {
            setRefreshOrdersData(true);
          }

          if (data.type === "REFRESH_SELLER_CONVERSATIONS") {
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
    };
  }, [socket, isConnected]);

  useEffect(() => {
    if (socket2 && isConnected2) {
      const trackData = {
        type: "track_delivery_partner",
        deliveryPartnerId: deliveryPartnerId,
        sellerId: sellerId,
      };

      try {
        socket2.send(JSON.stringify(trackData));
      } catch (error) {
        console.error("Error sending seller user data via WebSocket:", error);
      }

      socket2.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "delivery_partner_location_update") {
            setDeliveryPartnerLocation(data.deliveryPartnerLocation);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };
    }

    return () => {
      if (socket2) {
        socket2.onmessage = null;
      }

      setDeliveryPartnerLocation(null);
    };
  }, [socket2, isConnected2]);

  useEffect(() => {
    let timer;
    if (refreshOrdersData) {
      timer = setTimeout(() => {
        setRefreshOrdersData(false);
      }, 2000);
    }

    return () => clearTimeout(timer);
  }, [refreshOrdersData]);

  const createDeliveryAssignment = async (orderId) => {
    if (!token) return null;

    try {
      const response = await axios.post(
        `${API_URL}/api/seller/create-delivery-assignment`,
        {
          orderId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to create delivery assignment"
        );
      }
    } catch (error) {
      console.error("Error creating delivery assignment:", error.response.data);
      throw error;
    }
  };

  const startTrackingDeliveryPartner = (deliveryPartnerId) => {
    setTrackDeliveryPartner(true);
    setDeliveryPartnerId(deliveryPartnerId);
  };

  const stopTrackingDeliveryPartner = () => {
    setTrackDeliveryPartner(false);
    setDeliveryPartnerId(null);
    setDeliveryPartnerLocation(null);
  };

  const enterSellerDashboard = () => {
    setIsInSellerDashboard(true);
  };

  const exitSellerDashboard = () => {
    setIsInSellerDashboard(false);
  };

  const value = {
    createDeliveryAssignment,
    enterSellerDashboard,
    exitSellerDashboard,
    setTriggerWebSocket,
    refreshOrdersData,
    setRefreshOrdersData,
    setSellerId,
    startTrackingDeliveryPartner,
    stopTrackingDeliveryPartner,
    deliveryPartnerLocation,
    socketMessage,
  };

  return (
    <SellerContext.Provider value={value}>{children}</SellerContext.Provider>
  );
};
