import { NavigationContainer } from "@react-navigation/native";
import MainStackNavigator from "./navigation/MainStackNavigator";
import { AuthProvider } from "./context/AuthContext";

import "../global.css";

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <MainStackNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
