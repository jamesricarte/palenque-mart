const http = require("http");

const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");
require("dotenv").config();

require("./config/db");
const authRoutes = require("./routes/authRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const getLocalIp = require("./utils/getLocalIp");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const addressRoutes = require("./routes/addressRoutes");
const deliveryPartnerRoutes = require("./routes/deliveryPartnerRoutes"); // Added import
const chatRoutes = require("./routes/chatRoutes"); // Added chat routes import
const notificationRoutes = require("./routes/notificationRoutes"); // Added notification routes import

// Requiring whole socketStore for usage of let sockets assignment
const socketStore = require("./utils/socketStore");
const {
  users,
  deliveryPartners,
  sellers,
  trackingMap,
} = require("./utils/socketStore");

const app = express();
const server = http.createServer(app);
const port = process.env.PORT;

app.use(express.json());
app.use(cors());

app.use("/api", authRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/delivery-partner", deliveryPartnerRoutes); // Added route registration
app.use("/api/chat", chatRoutes); // Added chat routes registration
app.use("/api/notifications", notificationRoutes); // Added notification routes registration

const wss = new WebSocket.Server({ server });

wss.on("connection", (socket) => {
  socketStore.sockets.push(socket);
  console.log("WebSocket client connected");

  // Handle delivery partner location updates
  socket.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === "delivery_partner_location") {
        const { deliveryPartnerId, location } = data;

        const sellers = trackingMap.get(deliveryPartnerId);
        if (sellers) {
          sellers.forEach((seller) => {
            if (seller.socket && seller.socket.readyState === 1) {
              seller.socket.send(
                JSON.stringify({
                  type: "delivery_partner_location_update",
                  deliveryPartnerId: deliveryPartnerId,
                  deliveryPartnerLocation: location,
                })
              );

              console.log(
                `delivery partner's location sent to seller id: ${seller.sellerId}`
              );
            }
          });
        }

        // Update delivery partner location in Map
        deliveryPartners.set(deliveryPartnerId, {
          socket: socket,
          latitude: location.latitude,
          longitude: location.longitude,
          lastUpdated: new Date(),
        });

        console.log("Tracked delivery partners by id:", [
          ...deliveryPartners.keys(),
        ]);
      }

      if (data.type === "user_data") {
        const { userId } = data;

        users.set(userId, {
          socket: socket,
        });

        console.log("Connected users by id:", [...users.keys()]);
      }

      if (data.type === "seller_user_data") {
        const { sellerId } = data;

        sellers.set(sellerId, {
          socket: socket,
        });

        console.log("Connected sellers by id:", [...sellers.keys()]);
      }

      if (data.type === "track_delivery_partner") {
        const { deliveryPartnerId, sellerId } = data;

        if (!trackingMap.has(deliveryPartnerId))
          trackingMap.set(deliveryPartnerId, new Set());

        trackingMap.get(deliveryPartnerId).add({ sellerId, socket });

        const deliveryPartnerData = deliveryPartners.get(deliveryPartnerId);

        if (deliveryPartnerData) {
          const deliveryPartnerLocation = {
            latitude: deliveryPartnerData.latitude,
            longitude: deliveryPartnerData.longitude,
            lastUpdated: deliveryPartnerData.lastUpdated,
          };

          socket.send(
            JSON.stringify({
              type: "delivery_partner_location_update",
              deliveryPartnerId: deliveryPartnerId,
              deliveryPartnerLocation: deliveryPartnerLocation,
            })
          );

          console.log(
            `delivery partner's location sent to seller id: ${sellerId}`
          );
        } else {
          console.log("Delivery Partner is offline.");
        }

        console.log("Track map:", [...trackingMap]);
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  });

  socket.on("close", () => {
    socketStore.sockets = socketStore.sockets.filter((s) => s !== socket);

    // Remove delivery partner from Map when socket closes
    for (const [partnerId, partnerData] of deliveryPartners.entries()) {
      if (partnerData.socket === socket) {
        deliveryPartners.delete(partnerId);
        console.log("Remaining tracked delivery partners:", [
          ...deliveryPartners.keys(),
        ]);
        break;
      }
    }

    // Remove user from Map when socket closes
    for (const [userId, userData] of users.entries()) {
      if (userData.socket === socket) {
        users.delete(userId);
        console.log("Remaining connected users:", [...users.keys()]);
        break;
      }
    }

    // Remove seller from Map when socket closes
    for (const [sellerId, sellerData] of sellers.entries()) {
      if (sellerData.socket === socket) {
        sellers.delete(sellerId);
        console.log("Remaining connected sellers:", [...sellers.keys()]);
        break;
      }
    }

    // Remove seller in all tracking map when socket closes
    for (const [, sellerSet] of trackingMap) {
      for (const seller of sellerSet) {
        if (seller.socket === socket) {
          sellerSet.delete(seller);
          if (sellerSet.size !== 0)
            console.log("Remaining track map:", [...trackingMap]);
        }
      }
    }

    for (const [partnerId, sellerSet] of trackingMap) {
      if (sellerSet.size === 0) {
        trackingMap.delete(partnerId);
        console.log("Remaining track map:", [...trackingMap]);
      }
    }

    console.log("Websocket client disconnected");
  });
});

app.set("sockets", socketStore.sockets);
app.set("wss", wss);
app.set("deliveryPartners", deliveryPartners); // Add this line
app.set("sellers", sellers); // Add this line
app.set("users", users); // Add this line

server.listen(port, "0.0.0.0", () => {
  console.log(`Server is running at port ${port}`);
  console.log(`Wifi ip address: ${getLocalIp()}`);
});
