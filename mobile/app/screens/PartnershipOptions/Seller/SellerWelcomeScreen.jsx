import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

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
        <Text className="text-xl font-semibold">Became a Vendor Partner</Text>
        <View className="w-6" />
      </View>
      <ScrollView>
        <View className="flex-1">
          {/* Hero Section */}
          <View className="px-6 py-8 bg-gradient-to-r from-blue-50 to-blue-100">
            <View className="items-center">
              <View className="flex items-center justify-center w-20 h-20 mb-4 bg-primary rounded-full">
                <MaterialCommunityIcons
                  name="storefront-outline"
                  size={40}
                  color="white"
                />
              </View>
              <Text className="mb-1 text-2xl font-bold text-center">
                Start Your Online Store
              </Text>
              <Text className="text-center text-gray-600">
                Become one of successful vendors on PalenqueMart
              </Text>
            </View>
          </View>

          <View className="mx-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            {/* Benefits Section */}
            <View className="px-6 py-4">
              <Text className="mb-4 text-xl font-semibold">
                Why Partner With Us?
              </Text>
              {benefits.map((benefit, index) => (
                <View key={index} className="flex flex-row items-start mb-4">
                  <View className="flex items-center justify-center w-10 h-10 mr-3 bg-orange-100 rounded-lg">
                    <Feather name={benefit.icon} size={20} color="#EA580C" />
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
          </View>
          <View className="mx-6 mt-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            {/* Requirements Section */}
            <View className="px-6 py-4 bg-white">
              <Text className="mb-4 text-xl font-semibold">
                What You'll Need
              </Text>
              {requirements.map((requirement, index) => (
                <View key={index} className="flex flex-row items-center mb-3">
                  <Feather name="check" size={16} color="#10b981" />
                  <Text className="ml-3 text-gray-700">{requirement}</Text>
                </View>
              ))}
            </View>
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
        </View>
      </ScrollView>
      {/* Bottom CTA */}
      <View className="px-6 pt-6 pb-8 bg-primary">
        <TouchableOpacity
          className="w-full py-4 bg-white rounded-lg"
          onPress={() => navigation.navigate("SellerAccountType")}
        >
          <Text className="text-lg font-semibold text-center text-primary">
            Start Registration
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SellerWelcomeScreen;
