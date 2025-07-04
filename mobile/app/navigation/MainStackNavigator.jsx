import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/Auth/Login/LoginScreen";

import SignUpScreen from "../screens/Auth/SignUp/SignUpScreen";
import MobileNumberRegistrationScreen from "../screens/Auth/SignUp/MobileNumberRegistrationScreen";
import AccountDetailsCreationScreen from "../screens/Auth/SignUp/AccountDetailsCreationScreen";

import EmailSentVerificationScreen from "../screens/Auth/Verification/EmailSentVerificationScreen";
import MobileNumberVerificationScreen from "../screens/Auth/Verification/MobileNumberVerificationScreen";

import DashboardScreen from "../screens/Dashboard/DashboardScreen";
import CartScreen from "../screens/Cart/CartScreen";
import EditProfileScreen from "../screens/EditProfile/EditProfileScreen";
import PartnershipOptionsScreen from "../screens/PartnershipOptions/PartnershipOptionsScreen";
import NotificationsScreen from "../screens/Dashboard/tabs/NotificationsScreen";
import SettingsScreen from "../screens/Settings/SettingsScreen";

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

      {/* Auth */}
      {/* Login */}
      <Stack.Screen name="Login" component={LoginScreen} />

      {/* Sign up */}
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen
        name="MobileNumberRegistration"
        component={MobileNumberRegistrationScreen}
      />
      <Stack.Screen
        name="AccountDetailsCreation"
        component={AccountDetailsCreationScreen}
      />

      {/* Verification */}
      <Stack.Screen
        name="EmailSentVerification"
        component={EmailSentVerificationScreen}
      />
      <Stack.Screen
        name="MobileNumberVerification"
        component={MobileNumberVerificationScreen}
      />

      {/* Dashboard */}
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen
        name="PartnershipOptions"
        component={PartnershipOptionsScreen}
      />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};

export default MainStackNavigator;
