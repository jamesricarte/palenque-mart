"use client";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";

// Address Management
import AddressManagementScreen from "../screens/AddressManagement/AddressManagementScreen";
import AddNewAddressScreen from "../screens/AddressManagement/AddNewAddressScreen";

// Admin
import AdminDashboardScreen from "../screens/Admin/AdminDashboardScreen";
import AdminDeliveryPartnerApplicationDetailsScreen from "../screens/Admin/AdminDeliveryPartnerApplicationDetailsScreen";
import AdminSellerApplicationDetailsScreen from "../screens/Admin/AdminSellerApplicationDetailsScreen";

// Auth
import LoginScreen from "../screens/Auth/Login/LoginScreen";
import SignUpScreen from "../screens/Auth/SignUp/SignUpScreen";

import AccountDetailsCreationScreen from "../screens/Auth/SignUp/AccountDetailsCreationScreen";
import MobileNumberRegistrationScreen from "../screens/Auth/SignUp/MobileNumberRegistrationScreen";

import EmailSentVerificationScreen from "../screens/Auth/Verification/EmailSentVerificationScreen";
import MobileNumberVerificationScreen from "../screens/Auth/Verification/MobileNumberVerificationScreen";

// Cart
import CartScreen from "../screens/Cart/CartScreen";

// Chat
import ChatConversationScreen from "../screens/Chat/ChatConversationScreen";
import UserDeliveryPartnerChatScreen from "../screens/Chat/UserDeliveryPartnerChatScreen";

// Checkout
import CheckoutScreen from "../screens/Checkout/CheckoutScreen";

// Dashboard
import AllVendorsScreen from "../screens/Dashboard/AllVendorsScreen";
import DashboardScreen from "../screens/Dashboard/DashboardScreen";
import ProductListingScreen from "../screens/Dashboard/ProductListingScreen";
import SearchOverlayScreen from "../screens/Dashboard/SearchOverlayScreen";

// Delivery Partner Dashboard
import DeliveryPartnerChatConversationScreen from "../screens/DeliveryPartnerDashboard/DeliveryPartnerChatConversationScreen";
import DeliveryPartnerDashboardScreen from "../screens/DeliveryPartnerDashboard/DeliveryPartnerDashboardScreen";
import DeliveryPartnerDeliveryDetailsScreen from "../screens/DeliveryPartnerDashboard/DeliveryPartnerDeliveryDetailsScreen";
import EditDeliveryPartnerProfileScreen from "../screens/DeliveryPartnerDashboard/EditDeliveryPartnerProfileScreen";

// Orders
import DeliveryTrackingScreen from "../screens/Orders/DeliveryTrackingScreen";
import OrderConfirmationScreen from "../screens/Orders/OrderConfirmationScreen";
import OrderDetailsScreen from "../screens/Orders/OrderDetailsScreen";
import OrdersScreen from "../screens/Orders/OrdersScreen";

// Partnership Options
import PartnershipOptionsScreen from "../screens/PartnershipOptions/PartnershipOptionsScreen";

import DeliveryPartnerApplicationStatusScreen from "../screens/PartnershipOptions/DeliveryPartner/DeliveryPartnerApplicationStatusScreen";
import DeliveryPartnerRegistrationFormScreen from "../screens/PartnershipOptions/DeliveryPartner/DeliveryPartnerRegistrationFormScreen";
import DeliveryPartnerReviewSubmitScreen from "../screens/PartnershipOptions/DeliveryPartner/DeliveryPartnerReviewSubmitScreen";
import DeliveryPartnerSubmissionSuccessScreen from "../screens/PartnershipOptions/DeliveryPartner/DeliveryPartnerSubmissionSuccessScreen";
import DeliveryPartnerWelcomeScreen from "../screens/PartnershipOptions/DeliveryPartner/DeliveryPartnerWelcomeScreen";

import SellerAccountTypeScreen from "../screens/PartnershipOptions/Seller/SellerAccountTypeScreen";
import SellerAddressSetupScreen from "../screens/PartnershipOptions/Seller/SellerAddressSetupScreen";
import SellerApplicationStatusScreen from "../screens/PartnershipOptions/Seller/SellerApplicationStatusScreen";
import SellerRegistrationFormScreen from "../screens/PartnershipOptions/Seller/SellerRegistrationFormScreen";
import SellerReviewSubmitScreen from "../screens/PartnershipOptions/Seller/SellerReviewSubmitScreen";
import SellerSubmissionSuccessScreen from "../screens/PartnershipOptions/Seller/SellerSubmissionSuccessScreen";
import SellerWelcomeScreen from "../screens/PartnershipOptions/Seller/SellerWelcomeScreen";

// Pre Orders
import PreOrdersScreen from "../screens/PreOrders/PreOrdersScreen";

// Product Details
import ProductDetailsScreen from "../screens/ProductDetails/ProductDetailsScreen";

// Profile
import EditEmailScreen from "../screens/Profile/EditEmailScreen";
import EditMobileNumberScreen from "../screens/Profile/EditMobileNumberScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";

// Seller Dashboard
import AddProductScreen from "../screens/SellerDashboard/AddProductScreen";
import EditProductScreen from "../screens/SellerDashboard/EditProductScreen";
import EditStoreProfileScreen from "../screens/SellerDashboard/EditStoreProfileScreen";
import SellerChatConversationScreen from "../screens/SellerDashboard/SellerChatConversationScreen";
import SellerDashboardScreen from "../screens/SellerDashboard/SellerDashboardScreen";
import SellerDeliveryPartnerChatScreen from "../screens/SellerDashboard/SellerDeliveryPartnerChatScreen";
import SellerOrderDetailsScreen from "../screens/SellerDashboard/SellerOrderDetailsScreen";

// Seller Store
import SellerStoreScreen from "../screens/SellerStore/SellerStoreScreen";

// Settings
import SettingsScreen from "../screens/Settings/SettingsScreen";

const Stack = createNativeStackNavigator();

const MainStackNavigator = () => {
  const { user } = useAuth();

  // Determine the initial route based on user role
  const initialRouteName =
    user?.role === "admin" ? "AdminDashboard" : "Dashboard";

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      {/* Address Management */}
      <Stack.Screen
        name="AddressManagement"
        component={AddressManagementScreen}
      />
      <Stack.Screen name="AddNewAddress" component={AddNewAddressScreen} />

      {/* Admin */}
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen
        name="AdminDeliveryPartnerApplicationDetails"
        component={AdminDeliveryPartnerApplicationDetailsScreen}
      />
      <Stack.Screen
        name="AdminSellerApplicationDetails"
        component={AdminSellerApplicationDetailsScreen}
      />

      {/* Auth */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />

      <Stack.Screen
        name="AccountDetailsCreation"
        component={AccountDetailsCreationScreen}
      />
      <Stack.Screen
        name="MobileNumberRegistration"
        component={MobileNumberRegistrationScreen}
      />

      <Stack.Screen
        name="EmailSentVerification"
        component={EmailSentVerificationScreen}
      />
      <Stack.Screen
        name="MobileNumberVerification"
        component={MobileNumberVerificationScreen}
      />

      {/* Cart */}
      <Stack.Screen name="Cart" component={CartScreen} />

      {/* Chat */}
      <Stack.Screen
        name="ChatConversation"
        component={ChatConversationScreen}
      />
      <Stack.Screen
        name="UserDeliveryPartnerChat"
        component={UserDeliveryPartnerChatScreen}
      />

      {/* Checkout */}
      <Stack.Screen name="Checkout" component={CheckoutScreen} />

      {/* Dashboard */}
      <Stack.Screen
        name="AllVendors"
        component={AllVendorsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="ProductListing" component={ProductListingScreen} />
      <Stack.Screen
        name="SearchOverlay"
        component={SearchOverlayScreen}
        options={{
          presentation: "card",
          animation: "fade_from_bottom",
          animationDuration: 300,
        }}
      />

      {/* DeliveryPartnerDashboard */}
      <Stack.Screen
        name="DeliveryPartnerChatConversation"
        component={DeliveryPartnerChatConversationScreen}
      />
      <Stack.Screen
        name="DeliveryPartnerDashboard"
        component={DeliveryPartnerDashboardScreen}
      />
      <Stack.Screen
        name="DeliveryPartnerDeliveryDetails"
        component={DeliveryPartnerDeliveryDetailsScreen}
      />
      <Stack.Screen
        name="EditDeliveryPartnerProfile"
        component={EditDeliveryPartnerProfileScreen}
      />

      {/* Orders */}
      <Stack.Screen
        name="DeliveryTracking"
        component={DeliveryTrackingScreen}
      />
      <Stack.Screen
        name="OrderConfirmation"
        component={OrderConfirmationScreen}
      />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen name="Orders" component={OrdersScreen} />

      {/* Partnership Options */}
      <Stack.Screen
        name="PartnershipOptions"
        component={PartnershipOptionsScreen}
      />

      {/* Delivery Partner Partnership Options */}
      <Stack.Screen
        name="DeliveryPartnerApplicationStatus"
        component={DeliveryPartnerApplicationStatusScreen}
      />
      <Stack.Screen
        name="DeliveryPartnerRegistrationForm"
        component={DeliveryPartnerRegistrationFormScreen}
      />
      <Stack.Screen
        name="DeliveryPartnerReviewSubmit"
        component={DeliveryPartnerReviewSubmitScreen}
      />
      <Stack.Screen
        name="DeliveryPartnerSubmissionSuccess"
        component={DeliveryPartnerSubmissionSuccessScreen}
      />
      <Stack.Screen
        name="DeliveryPartnerWelcome"
        component={DeliveryPartnerWelcomeScreen}
      />

      {/* Seller Partnership Options*/}
      <Stack.Screen
        name="SellerAccountType"
        component={SellerAccountTypeScreen}
      />
      <Stack.Screen
        name="SellerAddressSetup"
        component={SellerAddressSetupScreen}
      />
      <Stack.Screen
        name="SellerApplicationStatus"
        component={SellerApplicationStatusScreen}
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
      <Stack.Screen name="SellerWelcome" component={SellerWelcomeScreen} />

      {/* Pre Orders */}
      <Stack.Screen name="PreOrders" component={PreOrdersScreen} />

      {/* Product Details */}
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />

      {/* Profile */}
      <Stack.Screen name="EditEmail" component={EditEmailScreen} />
      <Stack.Screen
        name="EditMobileNumber"
        component={EditMobileNumberScreen}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} />

      {/* Seller Dashboard */}
      <Stack.Screen name="AddProduct" component={AddProductScreen} />
      <Stack.Screen name="EditProduct" component={EditProductScreen} />
      <Stack.Screen
        name="EditStoreProfile"
        component={EditStoreProfileScreen}
      />
      <Stack.Screen
        name="SellerChatConversation"
        component={SellerChatConversationScreen}
      />
      <Stack.Screen name="SellerDashboard" component={SellerDashboardScreen} />
      <Stack.Screen
        name="SellerDeliveryPartnerChat"
        component={SellerDeliveryPartnerChatScreen}
      />
      <Stack.Screen
        name="SellerOrderDetails"
        component={SellerOrderDetailsScreen}
      />

      {/* Seller Store */}
      <Stack.Screen name="SellerStore" component={SellerStoreScreen} />

      {/* Settings */}
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};

export default MainStackNavigator;
