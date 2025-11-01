"use client";

import { createContext, useContext, useState, useEffect } from "react";
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
  const [sellerProfileData, setSellerProfileData] = useState(null);
  const [deliveryPartnerId, setDeliveryPartnerId] = useState(null);
  const [trackDeliveryPartner, setTrackDeliveryPartner] = useState(false);
  const [deliveryPartnerLocation, setDeliveryPartnerLocation] = useState(null);
  const [socketMessage, setSocketMessage] = useState(null);

  const [refreshTransactionData, setRefreshTransactionData] = useState(false);
  const [refreshAnalyticsData, setRefreshAnalyticsData] = useState(false);

  const [updateLivestreamViewerCount, setUpdateLivestreamViewerCount] =
    useState(false);

  const { socket, isConnected } = useWebSocket(
    token && isInSellerDashboard && triggerWebsocket ? WEBSOCKET_URL : null
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

          if (data.type === "SELLER_TRANSACTION_UPDATE") {
            setRefreshTransactionData(true);
            setRefreshAnalyticsData(true);
          }

          if (data.type === "SELLER_ORDER_PAID") {
            setRefreshTransactionData(true);
            setRefreshAnalyticsData(true);
          }

          if (data.type === "SELLER_PAYMENT_STATUS_CHANGED") {
            setRefreshTransactionData(true);
            setRefreshAnalyticsData(true);
          }

          if (data.type === "UPDATE_VIEWER_COUNT") {
            setUpdateLivestreamViewerCount(true);
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

  const { socket: trackDeliverySocket, isConnected: trackDeliveryConnection } =
    useWebSocket(
      token && isInSellerDashboard && trackDeliveryPartner
        ? WEBSOCKET_URL
        : null
    );

  useEffect(() => {
    if (trackDeliverySocket && trackDeliveryConnection) {
      const trackData = {
        type: "track_delivery_partner",
        deliveryPartnerId: deliveryPartnerId,
        role: "seller",
        id: sellerId,
      };

      try {
        trackDeliverySocket.send(JSON.stringify(trackData));
      } catch (error) {
        console.error("Error sending seller user data via WebSocket:", error);
      }

      trackDeliverySocket.onmessage = (event) => {
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
      if (trackDeliverySocket) {
        trackDeliverySocket.onmessage = null;
      }

      setDeliveryPartnerLocation(null);
    };
  }, [trackDeliverySocket, trackDeliveryConnection]);

  useEffect(() => {
    let timer;
    if (refreshOrdersData) {
      timer = setTimeout(() => {
        setRefreshOrdersData(false);
      }, 2000);
    }

    return () => clearTimeout(timer);
  }, [refreshOrdersData]);

  useEffect(() => {
    let timer;
    if (refreshTransactionData) {
      timer = setTimeout(() => {
        setRefreshTransactionData(false);
      }, 2000);
    }

    return () => clearTimeout(timer);
  }, [refreshTransactionData]);

  useEffect(() => {
    let timer;
    if (refreshAnalyticsData) {
      timer = setTimeout(() => {
        setRefreshAnalyticsData(false);
      }, 2000);
    }

    return () => clearTimeout(timer);
  }, [refreshAnalyticsData]);

  useEffect(() => {
    let timer;
    if (updateLivestreamViewerCount) {
      timer = setTimeout(() => {
        setUpdateLivestreamViewerCount(false);
      }, 200);
    }

    return () => clearTimeout(timer);
  }, [updateLivestreamViewerCount]);

  const createDeliveryAssignment = async (orderId, deliveryFee) => {
    if (!token) return null;

    try {
      const response = await axios.post(
        `${API_URL}/api/seller/create-delivery-assignment`,
        {
          orderId,
          deliveryFee,
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
    sellerId,
    setSellerId,
    sellerProfileData,
    setSellerProfileData,
    startTrackingDeliveryPartner,
    stopTrackingDeliveryPartner,
    deliveryPartnerLocation,
    socketMessage,
    setSocketMessage,
    refreshTransactionData,
    setRefreshTransactionData,
    refreshAnalyticsData,
    setRefreshAnalyticsData,
    updateLivestreamViewerCount,
    setUpdateLivestreamViewerCount,
  };

  return (
    <SellerContext.Provider value={value}>{children}</SellerContext.Provider>
  );
};
