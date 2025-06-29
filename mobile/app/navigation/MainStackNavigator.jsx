import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DashboardScreen from "../screens/Dashboard/DashboardScreen";
import LoginScreen from "../screens/Auth/Login/LoginScreen";
import SignUpScreen from "../screens/Auth/SignUp/SignUpScreen";
import EmailSentVerificationScreen from "../screens/Auth/Verification/EmailSentVerificationScreen";
import AccountDetailsCreationScreen from "../screens/Auth/SignUp/AccountDetailsCreationScreen";
import MobileRegistrationScreen from "../screens/Auth/SignUp/MobileNumberRegistrationScreen";
import MobileNumberVerificationScreen from "../screens/Auth/Verification/MobileNumberVerificationScreen";

const Stack = createNativeStackNavigator();

const MainStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="MobileNumberRegistration"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />

      {/* Auth */}
      {/* Login */}
      <Stack.Screen name="Login" component={LoginScreen} />

      {/* Sign up */}
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen
        name="EmailSentVerification"
        component={EmailSentVerificationScreen}
      />
      <Stack.Screen
        name="AccountDetailsCreation"
        component={AccountDetailsCreationScreen}
      />
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
