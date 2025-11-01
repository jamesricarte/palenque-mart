"use client";

import { NavigationContainer } from "@react-navigation/native";
import MainStackNavigator from "./navigation/MainStackNavigator";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DeliveryPartnerProvider } from "./context/DeliveryPartnerContext";
import { SellerProvider } from "./context/SellerContext";
import LoadingScreen from "./screens/LoadingScreen";
import { prettyLog } from "./utils/prettyLog";
import { StatusBar } from "expo-status-bar";

import DeliveryPartnerGlobalModal from "./components/DeliveryPartnerGlobalModal";

import "../global.css";
global.prettyLog = prettyLog;

import { NativeModules, Platform } from "react-native";
const { RtmpTestModule } = NativeModules;

import { useEffect } from "react";

import { PermissionsAndroid } from "react-native";

const AppContent = () => {
  const { isLoading } = useAuth();

  const RTMP_URL = "rtmp://rtmp.livepeer.com/live/f848-rv6a-wxrw-j35o";

  async function requestPermissions() {
    try {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ];

      // Only request storage on older Androids (< 10)
      if (Platform.Version < 29) {
        permissions.push(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      }

      const granted = await PermissionsAndroid.requestMultiple(permissions);

      const allGranted = Object.values(granted).every(
        (res) => res === PermissionsAndroid.RESULTS.GRANTED
      );

      if (!allGranted) {
        console.warn("❌ Some permissions were not granted!");
        return false;
      }

      console.log("✅ All permissions granted!");
      return true;
    } catch (err) {
      console.error("Permission request error:", err);
      return false;
    }
  }

  async function testStream() {
    try {
      const res = await RtmpTestModule.startStream(RTMP_URL);
      console.log(res);
    } catch (e) {
      console.error(e);
    }
  }

  async function stopStream() {
    await RtmpTestModule.stopStream();
  }

  useEffect(() => {
    (async () => {
      const granted = await requestPermissions();
      // if (granted) {
      //   await testStream();
      // }
    })();
  }, []);

  // Show a loading screen while checking for auth token
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <MainStackNavigator />
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <>
      <StatusBar style="dark" />
      <AuthProvider>
        <SellerProvider>
          <DeliveryPartnerProvider>
            <AppContent />
            <DeliveryPartnerGlobalModal />
          </DeliveryPartnerProvider>
        </SellerProvider>
      </AuthProvider>
    </>
  );
};

export default App;
