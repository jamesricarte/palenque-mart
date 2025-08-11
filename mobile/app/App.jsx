"use client";

import { NavigationContainer } from "@react-navigation/native";
import MainStackNavigator from "./navigation/MainStackNavigator";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DeliveryPartnerProvider } from "./context/DeliveryPartnerContext";
import { SellerProvider } from "./context/SellerContext";
import LoadingScreen from "./screens/LoadingScreen";
import { prettyLog } from "./utils/prettyLog";

import "../global.css";
global.prettyLog = prettyLog;

const AppContent = () => {
  const { isLoading } = useAuth();

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
    <AuthProvider>
      <SellerProvider>
        <DeliveryPartnerProvider>
          <AppContent />
        </DeliveryPartnerProvider>
      </SellerProvider>
    </AuthProvider>
  );
};

export default App;
