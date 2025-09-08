import Contants from "expo-constants";

let API_URL;
let WEBSOCKET_URL;
const port = 3000;

if (__DEV__) {
  // Check if we're in Expo Go or native build
  const hostUri = Contants.expoConfig?.hostUri;

  if (hostUri) {
    // Expo Go environment
    const debuggerHost = hostUri.split(":")[0];
    API_URL = `http://${debuggerHost}:${port}`;
    WEBSOCKET_URL = `ws://${debuggerHost}:${port}`;
  } else if (__LAN_IP__) {
    API_URL = `http://${__LAN_IP__}:${port}`;
    WEBSOCKET_URL = `ws://${__LAN_IP__}:${port}`;
  } else {
    // Native build environment - use localhost or your local IP
    // You can replace this with your actual local IP address
    API_URL = `http://192.168.1.7:${port}`;
    WEBSOCKET_URL = `ws://192.168.1.7:${port}`;
  }
} else {
  API_URL = "http://api.myapp.com";
  WEBSOCKET_URL = "ws://api.myapp.com";
}

export { API_URL, WEBSOCKET_URL };
