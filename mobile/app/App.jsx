"use client";

import { NavigationContainer } from "@react-navigation/native";
import MainStackNavigator from "./navigation/MainStackNavigator";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoadingScreen from "./screens/LoadingScreen";

import "../global.css";

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
      <AppContent />
    </AuthProvider>
  );
};

export default App;
