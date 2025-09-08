const os = require("os");

// same function as before
function getLanIp() {
  const interfaces = os.networkInterfaces();
  for (let name of Object.keys(interfaces)) {
    for (let net of interfaces[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
}

const LAN_IP = getLanIp();

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "transform-define",
        {
          __LAN_IP__: LAN_IP,
          "process.env.EXPO_OS": JSON.stringify("ios"), // or "android"
          "process.env.EXPO_ROUTER_ABS_APP_ROOT": JSON.stringify(""),
        },
      ],
      [
        "inline-dotenv",
        {
          path: ".env",
        },
      ],
    ],
  };
};
