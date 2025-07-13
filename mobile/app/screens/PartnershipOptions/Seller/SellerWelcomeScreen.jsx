import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";

const SellerWelcomeScreen = ({ navigation }) => {
  const benefits = [
    {
      icon: "users",
      title: "Reach Millions",
      description: "Access to millions of active customers",
    },
    {
      icon: "trending-up",
      title: "Easy Management",
      description: "Simple tools to manage products and orders",
    },
    {
      icon: "shield",
      title: "Secure Payments",
      description: "Safe and timely payment processing",
    },
    {
      icon: "truck",
      title: "Logistics Support",
      description: "Nationwide shipping and delivery network",
    },
  ];

  const requirements = [
    "Valid government ID or business registration",
    "Bank account for payments",
    "Product catalog ready to upload",
    "Business address for verification",
  ];

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold">Become a Seller</Text>
        <View className="w-6" />
      </View>

      <>
        <ScrollView className="flex-1">
          {/* Hero Section */}
          <View className="px-6 py-8 bg-gradient-to-r from-blue-50 to-blue-100">
            <View className="items-center mb-6">
              <View className="flex items-center justify-center w-20 h-20 mb-4 bg-blue-500 rounded-full">
                <Feather name="store" size={40} color="white" />
              </View>
              <Text className="mb-2 text-2xl font-bold text-center">
                Start Your Online Business
              </Text>
              <Text className="text-center text-gray-600">
                Join thousands of successful sellers on Palenque Mart
              </Text>
            </View>
          </View>

          {/* Benefits Section */}
          <View className="px-6 py-6">
            <Text className="mb-4 text-xl font-semibold">
              Why Sell With Us?
            </Text>
            {benefits.map((benefit, index) => (
              <View key={index} className="flex flex-row items-start mb-4">
                <View className="flex items-center justify-center w-10 h-10 mr-3 bg-blue-100 rounded-lg">
                  <Feather name={benefit.icon} size={20} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className="mb-1 font-semibold">{benefit.title}</Text>
                  <Text className="text-sm text-gray-600">
                    {benefit.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Requirements Section */}
          <View className="px-6 py-6 bg-gray-50">
            <Text className="mb-4 text-xl font-semibold">What You'll Need</Text>
            {requirements.map((requirement, index) => (
              <View key={index} className="flex flex-row items-center mb-3">
                <AntDesign name="checkcircle" size={16} color="#10b981" />
                <Text className="ml-3 text-gray-700">{requirement}</Text>
              </View>
            ))}
          </View>

          {/* FAQ Link */}
          <TouchableOpacity className="p-4 mx-6 my-4 border border-gray-200 rounded-lg">
            <View className="flex flex-row items-center justify-between">
              <View>
                <Text className="font-semibold">Have Questions?</Text>
                <Text className="text-sm text-gray-600">
                  Check our seller FAQ
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="gray" />
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Bottom CTA */}
        <View className="px-6 py-4 bg-white border-t border-gray-200">
          <TouchableOpacity
            className="w-full py-4 bg-blue-500 rounded-lg"
            onPress={() => navigation.navigate("SellerAccountType")}
          >
            <Text className="text-lg font-semibold text-center text-white">
              Start Registration
            </Text>
          </TouchableOpacity>
        </View>
      </>
    </View>
  );
};

export default SellerWelcomeScreen;
