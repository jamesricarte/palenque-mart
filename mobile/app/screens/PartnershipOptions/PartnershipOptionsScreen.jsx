"use client";

import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import AntDesign from "@expo/vector-icons/AntDesign";
import axios from "axios";
import { API_URL } from "../../config/apiConfig";
import { useAuth } from "../../context/AuthContext";

const PartnershipOptionsScreen = ({ navigation }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasSellerApplication, setHasSellerApplication] = useState(false);
  const [sellerApplicationStatus, setSellerApplicationStatus] = useState(null);
  const [sellerData, setSellerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const [storeProfile, setStoreProfile] = useState(null);

  useEffect(() => {
    checkSellerApplicationStatus();
  }, []);

  const checkSellerApplicationStatus = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/seller/application-status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success && response.data.hasApplication) {
        setHasSellerApplication(true);
        setSellerApplicationStatus(response.data.data.status);
        setSellerData(response.data.data);

        if (response.data.data.status === "approved") {
          fetchStoreProfile();
        }
      }
    } catch (error) {
      // No application found or error - user can apply
      setHasSellerApplication(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/seller/store-profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setStoreProfile(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching store profile:", error);
    }
  };

  const partnershipOptions = [
    {
      id: 2,
      title: "Delivery Partner",
      subtitle: "Earn by delivering orders",
      description:
        "Become a delivery partner and earn flexible income by delivering orders in your area. Work on your own schedule.",
      icon: "truck",
      benefits: [
        "Flexible working hours",
        "Competitive delivery rates",
        "Weekly payments",
        "Fuel allowance",
        "Insurance coverage",
      ],
      requirements: [
        "Valid driver's license",
        "Own motorcycle/vehicle",
        "Smartphone with GPS",
        "Clean background check",
      ],
      color: "bg-green-500",
      actionText: "Apply Now",
    },
  ];

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case "store":
        return <FontAwesome6 name="store" size={40} color="white" />;
      case "truck":
        return <Feather name="truck" size={40} color="white" />;
      default:
        return <MaterialIcons name="business" size={40} color="white" />;
    }
  };

  const handleApplyNow = (option) => {
    if (option.id === 2) {
      // Handle delivery partner application
      console.log(`Applying for: ${option.title}`);
    }
  };

  const handleLearnMore = (option) => {
    setSelectedOption(selectedOption === option.id ? null : option.id);
  };

  const handleGoToSellerDashboard = () => {
    navigation.replace("SellerDashboard");
  };

  const handleSellerAction = () => {
    if (hasSellerApplication) {
      // Navigate to application status screen
      navigation.navigate("SellerApplicationStatus");
    } else {
      // Navigate to seller registration
      navigation.navigate("SellerWelcome");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-300">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold">Partnership Options</Text>
          <View className="w-6" />
        </View>
        <View className="items-center justify-center flex-1">
          <Text className="text-gray-500">Loading partnership options...</Text>
        </View>
      </View>
    );
  }

  return (
    <>
      {/* Header */}
      <View className="flex flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-300">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold">Partnership Options</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 bg-gray-50">
        <View className="p-4">
          {/* Approved Seller Dashboard Access - Show img 1.png design */}
          {hasSellerApplication && sellerApplicationStatus === "approved" && (
            <View className="mb-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <View className="p-6">
                <View className="flex flex-row items-center mb-4">
                  <View className="flex items-center justify-center w-16 h-16 mr-4 bg-blue-500 rounded-lg">
                    <FontAwesome6 name="store" size={40} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-semibold">Your Store</Text>
                    <Text className="text-sm text-gray-600">
                      {storeProfile?.storeName || "Loading..."}
                    </Text>
                  </View>
                </View>

                <Text className="mb-4 text-base text-gray-700">
                  Welcome to your seller dashboard! Manage your products, track
                  orders, and grow your business.
                </Text>

                <View className="flex flex-row items-center mb-4">
                  <View
                    className={`w-3 h-3 mr-2 rounded-full ${storeProfile?.isActive ? "bg-green-500" : "bg-red-500"}`}
                  />
                  <Text
                    className={`font-medium ${storeProfile?.isActive ? "text-green-600" : "text-red-600"}`}
                  >
                    {storeProfile?.isActive ? "Store Active" : "Store Inactive"}
                  </Text>
                </View>

                <TouchableOpacity
                  className="w-full py-3 bg-blue-600 rounded-lg"
                  onPress={handleGoToSellerDashboard}
                >
                  <Text className="font-semibold text-center text-white">
                    Go to Seller Dashboard
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Non-approved Seller Application or New Application */}
          {(!hasSellerApplication ||
            sellerApplicationStatus !== "approved") && (
            <View className="mb-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <View className="p-6">
                <View className="flex flex-row items-center mb-4">
                  <View className="flex items-center justify-center w-16 h-16 mr-4 bg-orange-500 rounded-lg">
                    <FontAwesome6 name="store" size={40} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-semibold">
                      {hasSellerApplication
                        ? "Seller Application"
                        : "Become a Seller"}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {hasSellerApplication
                        ? `Status: ${sellerApplicationStatus ? sellerApplicationStatus.replace("_", " ").toUpperCase() : "PENDING"}`
                        : "Start selling your products"}
                    </Text>
                  </View>
                </View>

                <Text className="mb-4 text-base text-gray-700">
                  {hasSellerApplication
                    ? "View your seller application status and track the review progress."
                    : "Join thousands of sellers and start your online business with Palenque Mart. Sell your products to millions of customers."}
                </Text>

                <View className="flex flex-row gap-3">
                  <TouchableOpacity
                    className="flex-1 py-3 bg-black rounded-lg"
                    onPress={handleSellerAction}
                  >
                    <Text className="font-semibold text-center text-white">
                      {hasSellerApplication ? "View Status" : "Apply Now"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 py-3 border border-gray-300 rounded-lg"
                    onPress={() =>
                      setSelectedOption(selectedOption === 1 ? null : 1)
                    }
                  >
                    <Text className="font-semibold text-center text-black">
                      {selectedOption === 1 ? "Hide Details" : "Learn More"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Expandable Details for Seller */}
              {selectedOption === 1 && (
                <View className="px-6 pb-6 border-t border-gray-100">
                  <View className="mt-4">
                    <Text className="mb-3 text-lg font-semibold">
                      {hasSellerApplication ? "Features" : "Benefits"}
                    </Text>
                    {(hasSellerApplication
                      ? [
                          "Track application progress",
                          "View document verification status",
                          "Get updates on review process",
                          "Contact support if needed",
                        ]
                      : [
                          "Zero listing fees for first 100 products",
                          "24/7 seller support",
                          "Marketing tools and analytics",
                          "Secure payment processing",
                          "Nationwide shipping network",
                        ]
                    ).map((benefit, index) => (
                      <View
                        key={index}
                        className="flex flex-row items-center mb-2"
                      >
                        <AntDesign
                          name="checkcircle"
                          size={16}
                          color="#10b981"
                        />
                        <Text className="ml-3 text-gray-700">{benefit}</Text>
                      </View>
                    ))}
                  </View>

                  <View className="mt-4">
                    <Text className="mb-3 text-lg font-semibold">
                      {hasSellerApplication ? "Current Status" : "Requirements"}
                    </Text>
                    {(hasSellerApplication
                      ? [
                          "Application submitted successfully",
                          "Documents under review",
                          "Waiting for admin approval",
                        ]
                      : [
                          "Valid business registration",
                          "Tax identification number",
                          "Bank account for payments",
                          "Product catalog ready",
                        ]
                    ).map((requirement, index) => (
                      <View
                        key={index}
                        className="flex flex-row items-center mb-2"
                      >
                        <Feather name="circle" size={16} color="#6b7280" />
                        <Text className="ml-3 text-gray-700">
                          {requirement}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Other Partnership Options */}
          {partnershipOptions.map((option) => (
            <View
              key={option.id}
              className="mb-4 bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              {/* Main Card */}
              <View className="p-6">
                <View className="flex flex-row items-center mb-4">
                  <View
                    className={`w-16 h-16 ${option.color} rounded-lg flex items-center justify-center mr-4`}
                  >
                    {getIconComponent(option.icon)}
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-semibold">
                      {option.title}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {option.subtitle}
                    </Text>
                  </View>
                </View>

                <Text className="mb-4 text-base text-gray-700">
                  {option.description}
                </Text>

                {/* Action Buttons */}
                <View className="flex flex-row gap-3">
                  <TouchableOpacity
                    className="flex-1 py-3 bg-black rounded-lg"
                    onPress={() => handleApplyNow(option)}
                  >
                    <Text className="font-semibold text-center text-white">
                      {option.actionText}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 py-3 border border-gray-300 rounded-lg"
                    onPress={() => handleLearnMore(option)}
                  >
                    <Text className="font-semibold text-center text-black">
                      {selectedOption === option.id
                        ? "Hide Details"
                        : "Learn More"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Expandable Details */}
              {selectedOption === option.id && (
                <View className="px-6 pb-6 border-t border-gray-100">
                  <View className="mt-4">
                    <Text className="mb-3 text-lg font-semibold">Benefits</Text>
                    {option.benefits.map((benefit, index) => (
                      <View
                        key={index}
                        className="flex flex-row items-center mb-2"
                      >
                        <AntDesign
                          name="checkcircle"
                          size={16}
                          color="#10b981"
                        />
                        <Text className="ml-3 text-gray-700">{benefit}</Text>
                      </View>
                    ))}
                  </View>

                  <View className="mt-4">
                    <Text className="mb-3 text-lg font-semibold">
                      Requirements
                    </Text>
                    {option.requirements.map((requirement, index) => (
                      <View
                        key={index}
                        className="flex flex-row items-center mb-2"
                      >
                        <Feather name="circle" size={16} color="#6b7280" />
                        <Text className="ml-3 text-gray-700">
                          {requirement}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
};

export default PartnershipOptionsScreen;
