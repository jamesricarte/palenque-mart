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
const reviewRoutes = require("./routes/reviewRoutes"); // Added review routes import
const bargainRoutes = require("./routes/bargainRoutes"); // Added bargain routes import
const livestreamRoutes = require("./routes/livestreamRoutes"); // Added livestream routes import
const userRoutes = require("./routes/userRoutes");

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
app.use("/api/reviews", reviewRoutes); // Added review routes registration
app.use("/api/bargain", bargainRoutes); // Added review routes registration
app.use("/api/livestream", livestreamRoutes); // Added livestream routes registration

// Livepeer webhook route
app.post(
  "/api/livestream/webhook",
  require("./controllers/livestreamControllers/handleWebhook")
);

app.use("/api", userRoutes);

const socketStore = require("./utils/socketStore");
const {
  users,
  deliveryPartners,
  sellers,
  trackingMap,
} = require("./utils/socketStore");

const wss = new WebSocket.Server({ server });

wss.on("connection", (socket) => {
  socketStore.sockets.push(socket);
  console.log("WebSocket client connected");

  socket.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      // User socket
      if (data.type === "user_data") {
        const { userId } = data;

        users.set(userId, {
          socket: socket,
        });

        console.log("Connected users by id:", [...users.keys()]);
      }

      // Seller socket
      if (data.type === "seller_user_data") {
        const { sellerId } = data;

        sellers.set(sellerId, {
          socket: socket,
        });

        console.log("Connected sellers by id:", [...sellers.keys()]);
      }

      // Delivery partner location socket
      if (data.type === "delivery_partner_location") {
        const { deliveryPartnerId, location } = data;

        const trackers = trackingMap.get(deliveryPartnerId);

        if (trackers) {
          trackers.forEach((tracker) => {
            if (tracker.socket && tracker.socket.readyState === 1) {
              tracker.socket.send(
                JSON.stringify({
                  type: "delivery_partner_location_update",
                  deliveryPartnerId,
                  role: tracker.role,
                  deliveryPartnerLocation: location,
                })
              );

              console.log(
                `delivery partner's location sent to tracker with role of ${tracker.role} and id ${tracker.id}`
              );
            }
          });
        }

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

      // Trackers socket
      if (data.type === "track_delivery_partner") {
        const { deliveryPartnerId, role, id } = data;

        if (!trackingMap.has(deliveryPartnerId))
          trackingMap.set(deliveryPartnerId, new Set());

        trackingMap.get(deliveryPartnerId).add({ role, id, socket });

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

          console.log(`delivery partner's location sent to ${role} id: ${id}`);
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

    // Remove tracker from tracking map when socket closes
    for (const [deliveryPartnerId, trackerSet] of trackingMap) {
      for (const tracker of trackerSet) {
        if (tracker.socket === socket) {
          trackerSet.delete(tracker);
          console.log(
            `Removed ${tracker.role} ${tracker.id} from trackingMap for deliveryPartnerId ${deliveryPartnerId}`
          );

          // If this delivery partner has no more trackers, remove the entire entry
          if (trackerSet.size === 0) {
            trackingMap.delete(deliveryPartnerId);
            console.log("Remaining track map:", [...trackingMap]);
          } else {
            console.log("Remaining trackingMap:", [...trackingMap]);
          }
        }
      }
    }

    console.log("Websocket client disconnected");
  });
});

app.set("sockets", socketStore.sockets);
app.set("wss", wss);
app.set("deliveryPartners", deliveryPartners);
app.set("sellers", sellers);
app.set("users", users);

server.listen(port, "0.0.0.0", () => {
  console.log(`Server is running at port ${port}`);
  console.log(`Wifi ip address: ${getLocalIp()}`);
});
