import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DashboardScreen from "../screens/Dashboard/DashboardScreen";
import LoginScreen from "../screens/Auth/Login/LoginScreen";
import RegisterScreen from "../screens/Auth/Register/RegisterScreen";
import EmailSentVerificationScreen from "../screens/Auth/Verification/EmailSentVerificationScreen";
import AccountCreationScreen from "../screens/Auth/Register/AccountCreationScreen";
import MobileRegistrationScreen from "../screens/Auth/Register/MobileNumberRegistrationScreen";
import MobileNumberVerificationScreen from "../screens/Auth/Verification/MobileNumberVerificationScreen";

const Stack = createNativeStackNavigator();

const MainStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen
        name="EmailSentVerification"
        component={EmailSentVerificationScreen}
      />
      <Stack.Screen name="AccountCreation" component={AccountCreationScreen} />
      <Stack.Screen
        name="MobileNumberRegistration"
        component={MobileRegistrationScreen}
      />
      <Stack.Screen
        name="MobileNumberVerification"
        component={MobileNumberVerificationScreen}
      />
    </Stack.Navigator>
  );
};

export default MainStackNavigator;
