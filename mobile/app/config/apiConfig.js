import Contants from "expo-constants";

let API_URL;
let WEBSOCKET_URL;
const port = 3000;

if (__DEV__) {
  const debuggerHost = Contants.expoConfig.hostUri.split(":")[0];
  API_URL = `http://${debuggerHost}:${port}`;
  WEBSOCKET_URL = `ws://${debuggerHost}:${port}`;
} else {
  API_URL = "http://api.myapp.com";
  WEBSOCKET_URL = "ws://api.myapp.com";
}

export { API_URL, WEBSOCKET_URL };
