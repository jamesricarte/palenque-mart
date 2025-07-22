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

const wss = new WebSocket.Server({ server });
let sockets = [];

wss.on("connection", (socket) => {
  sockets.push(socket);
  console.log("WebSocket client connected");

  socket.on("close", () => {
    sockets = sockets.filter((s) => s !== socket);
    console.log("Websocket client disconnected");
  });
});

app.set("sockets", sockets);
app.set("wss", wss);

server.listen(port, "0.0.0.0", () => {
  console.log(`Server is running at port ${port}`);
  console.log(`Wifi ip address: ${getLocalIp()}`);
});
