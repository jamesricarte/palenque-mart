"use client";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";

import LoginScreen from "../screens/Auth/Login/LoginScreen";

import SignUpScreen from "../screens/Auth/SignUp/SignUpScreen";
import MobileNumberRegistrationScreen from "../screens/Auth/SignUp/MobileNumberRegistrationScreen";
import AccountDetailsCreationScreen from "../screens/Auth/SignUp/AccountDetailsCreationScreen";

import EmailSentVerificationScreen from "../screens/Auth/Verification/EmailSentVerificationScreen";
import MobileNumberVerificationScreen from "../screens/Auth/Verification/MobileNumberVerificationScreen";

import DashboardScreen from "../screens/Dashboard/DashboardScreen";
import CartScreen from "../screens/Cart/CartScreen";
import PartnershipOptionsScreen from "../screens/PartnershipOptions/PartnershipOptionsScreen";
import NotificationsScreen from "../screens/Dashboard/tabs/NotificationsScreen";
import SettingsScreen from "../screens/Settings/SettingsScreen";

import ProfileScreen from "../screens/Profile/ProfileScreen";
import EditEmailScreen from "../screens/Profile/EditEmailScreen";
import EditMobileNumberScreen from "../screens/Profile/EditMobileNumberScreen";

import SellerWelcomeScreen from "../screens/PartnershipOptions/Seller/SellerWelcomeScreen";
import SellerAccountTypeScreen from "../screens/PartnershipOptions/Seller/SellerAccountTypeScreen";
import SellerRegistrationFormScreen from "../screens/PartnershipOptions/Seller/SellerRegistrationFormScreen";
import SellerReviewSubmitScreen from "../screens/PartnershipOptions/Seller/SellerReviewSubmitScreen";
import SellerSubmissionSuccessScreen from "../screens/PartnershipOptions/Seller/SellerSubmissionSuccessScreen";
import SellerApplicationStatusScreen from "../screens/PartnershipOptions/Seller/SellerApplicationStatusScreen";

import AdminDashboardScreen from "../screens/Admin/AdminDashboardScreen";
import AdminSellerApplicationDetailsScreen from "../screens/Admin/AdminSellerApplicationDetailsScreen";

import SellerDashboardScreen from "../screens/SellerDashboard/SellerDashboardScreen";
import AddProductScreen from "../screens/SellerDashboard/AddProductScreen";
import EditStoreProfileScreen from "../screens/SellerDashboard/EditStoreProfileScreen";

const Stack = createNativeStackNavigator();

const MainStackNavigator = () => {
  const { user } = useAuth();

  // Determine the initial route based on user role
  const initialRouteName =
    user?.role === "admin" ? "AdminDashboard" : "Dashboard";

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />

      {/* Auth */}
      <Stack.Screen name="Login" component={LoginScreen} />
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
      <Stack.Screen
        name="PartnershipOptions"
        component={PartnershipOptionsScreen}
      />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />

      {/* Profile */}
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditEmail" component={EditEmailScreen} />
      <Stack.Screen
        name="EditMobileNumber"
        component={EditMobileNumberScreen}
      />

      {/* Partnership */}
      <Stack.Screen name="SellerWelcome" component={SellerWelcomeScreen} />
      <Stack.Screen
        name="SellerAccountType"
        component={SellerAccountTypeScreen}
      />
      <Stack.Screen
        name="SellerRegistrationForm"
        component={SellerRegistrationFormScreen}
      />
      <Stack.Screen
        name="SellerReviewSubmit"
        component={SellerReviewSubmitScreen}
      />
      <Stack.Screen
        name="SellerSubmissionSuccess"
        component={SellerSubmissionSuccessScreen}
      />
      <Stack.Screen
        name="SellerApplicationStatus"
        component={SellerApplicationStatusScreen}
      />

      {/* Admin */}
      <Stack.Screen
        name="AdminSellerApplicationDetails"
        component={AdminSellerApplicationDetailsScreen}
      />

      {/* Seller Dashboard */}
      <Stack.Screen name="SellerDashboard" component={SellerDashboardScreen} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} />
      <Stack.Screen
        name="EditStoreProfile"
        component={EditStoreProfileScreen}
      />
    </Stack.Navigator>
  );
};

export default MainStackNavigator;
