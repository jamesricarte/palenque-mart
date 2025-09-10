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
import CategoryProductsScreen from "../screens/Dashboard/CategoryProductsScreen";

import ProfileScreen from "../screens/Profile/ProfileScreen";
import EditEmailScreen from "../screens/Profile/EditEmailScreen";
import EditMobileNumberScreen from "../screens/Profile/EditMobileNumberScreen";

import SellerWelcomeScreen from "../screens/PartnershipOptions/Seller/SellerWelcomeScreen";
import SellerAccountTypeScreen from "../screens/PartnershipOptions/Seller/SellerAccountTypeScreen";
import SellerRegistrationFormScreen from "../screens/PartnershipOptions/Seller/SellerRegistrationFormScreen";
import SellerAddressSetupScreen from "../screens/PartnershipOptions/Seller/SellerAddressSetupScreen";
import SellerReviewSubmitScreen from "../screens/PartnershipOptions/Seller/SellerReviewSubmitScreen";
import SellerSubmissionSuccessScreen from "../screens/PartnershipOptions/Seller/SellerSubmissionSuccessScreen";
import SellerApplicationStatusScreen from "../screens/PartnershipOptions/Seller/SellerApplicationStatusScreen";

import DeliveryPartnerWelcomeScreen from "../screens/PartnershipOptions/DeliveryPartner/DeliveryPartnerWelcomeScreen";
import DeliveryPartnerRegistrationFormScreen from "../screens/PartnershipOptions/DeliveryPartner/DeliveryPartnerRegistrationFormScreen";
import DeliveryPartnerReviewSubmitScreen from "../screens/PartnershipOptions/DeliveryPartner/DeliveryPartnerReviewSubmitScreen";
import DeliveryPartnerSubmissionSuccessScreen from "../screens/PartnershipOptions/DeliveryPartner/DeliveryPartnerSubmissionSuccessScreen";
import DeliveryPartnerApplicationStatusScreen from "../screens/PartnershipOptions/DeliveryPartner/DeliveryPartnerApplicationStatusScreen";

import AdminDashboardScreen from "../screens/Admin/AdminDashboardScreen";
import AdminSellerApplicationDetailsScreen from "../screens/Admin/AdminSellerApplicationDetailsScreen";
import AdminDeliveryPartnerApplicationDetailsScreen from "../screens/Admin/AdminDeliveryPartnerApplicationDetailsScreen";

import SellerDashboardScreen from "../screens/SellerDashboard/SellerDashboardScreen";
import AddProductScreen from "../screens/SellerDashboard/AddProductScreen";
import SellerOrderDetailsScreen from "../screens/SellerDashboard/SellerOrderDetailsScreen";
import EditStoreProfileScreen from "../screens/SellerDashboard/EditStoreProfileScreen";
import SellerChatConversationScreen from "../screens/SellerDashboard/SellerChatConversationScreen";
import EditProductScreen from "../screens/SellerDashboard/EditProductScreen";

import DeliveryPartnerDashboardScreen from "../screens/DeliveryPartnerDashboard/DeliveryPartnerDashboardScreen";
import EditDeliveryPartnerProfileScreen from "../screens/DeliveryPartnerDashboard/EditDeliveryPartnerProfileScreen";
import DeliveryPartnerDeliveryDetailsScreen from "../screens/DeliveryPartnerDashboard/DeliveryPartnerDeliveryDetailsScreen";

import ProductDetailsScreen from "../screens/ProductDetails/ProductDetailsScreen";

import CheckoutScreen from "../screens/Checkout/CheckoutScreen";
import OrderConfirmationScreen from "../screens/Orders/OrderConfirmationScreen";
import OrdersScreen from "../screens/Orders/OrdersScreen";
import OrderDetailsScreen from "../screens/Orders/OrderDetailsScreen";
import PreOrdersScreen from "../screens/PreOrders/PreOrdersScreen";

import AddressManagementScreen from "../screens/AddressManagement/AddressManagementScreen";
import AddNewAddressScreen from "../screens/AddressManagement/AddNewAddressScreen";

import ChatConversationScreen from "../screens/Chat/ChatConversationScreen";

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
      <Stack.Screen
        name="CategoryProducts"
        component={CategoryProductsScreen}
      />

      {/* Profile */}
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditEmail" component={EditEmailScreen} />
      <Stack.Screen
        name="EditMobileNumber"
        component={EditMobileNumberScreen}
      />

      {/* Partnership Options*/}
      {/* Seller */}
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
        name="SellerAddressSetup"
        component={SellerAddressSetupScreen}
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

      {/* Delivery Partner */}
      <Stack.Screen
        name="DeliveryPartnerWelcome"
        component={DeliveryPartnerWelcomeScreen}
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
        name="DeliveryPartnerApplicationStatus"
        component={DeliveryPartnerApplicationStatusScreen}
      />

      {/* Admin */}
      <Stack.Screen
        name="AdminSellerApplicationDetails"
        component={AdminSellerApplicationDetailsScreen}
      />
      <Stack.Screen
        name="AdminDeliveryPartnerApplicationDetails"
        component={AdminDeliveryPartnerApplicationDetailsScreen}
      />

      {/* Seller Dashboard */}
      <Stack.Screen name="SellerDashboard" component={SellerDashboardScreen} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} />
      <Stack.Screen
        name="SellerOrderDetails"
        component={SellerOrderDetailsScreen}
      />
      <Stack.Screen
        name="EditStoreProfile"
        component={EditStoreProfileScreen}
      />
      <Stack.Screen
        name="SellerChatConversation"
        component={SellerChatConversationScreen}
      />
      <Stack.Screen name="EditProduct" component={EditProductScreen} />

      {/* Delivery Partner Dashboard */}
      <Stack.Screen
        name="DeliveryPartnerDashboard"
        component={DeliveryPartnerDashboardScreen}
      />
      <Stack.Screen
        name="EditDeliveryPartnerProfile"
        component={EditDeliveryPartnerProfileScreen}
      />
      <Stack.Screen
        name="DeliveryPartnerDeliveryDetails"
        component={DeliveryPartnerDeliveryDetailsScreen}
      />

      {/* Product Details */}
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />

      {/* Order */}
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen
        name="OrderConfirmation"
        component={OrderConfirmationScreen}
      />
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen name="PreOrders" component={PreOrdersScreen} />

      {/* Settings */}
      {/* Address Management */}
      <Stack.Screen
        name="AddressManagement"
        component={AddressManagementScreen}
      />
      <Stack.Screen name="AddNewAddress" component={AddNewAddressScreen} />

      {/* Chat */}
      <Stack.Screen
        name="ChatConversation"
        component={ChatConversationScreen}
      />
    </Stack.Navigator>
  );
};

export default MainStackNavigator;
