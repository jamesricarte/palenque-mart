"use client";

import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const SellerAccountTypeScreen = ({ navigation }) => {
  const [selectedType, setSelectedType] = useState(null);

  const accountTypes = [
    {
      id: "individual",
      title: "Individual Vendor",
      subtitle: "Sell as an individual",
      description:
        "Perfect for personal vendors, freelancers, or small-scale businesses",
      icon: "person",
      features: [
        "Quick setup process",
        "Personal tax reporting",
        "Suitable for occasional selling",
        "Lower documentation requirements",
      ],
    },
    {
      id: "business",
      title: "Business Vendor",
      subtitle: "Sell as a registered business",
      description:
        "Ideal for established businesses, companies, or professional vendors",
      icon: "business",
      features: [
        "Business verification",
        "Corporate tax benefits",
        "Higher selling limits",
        "Advanced seller tools",
      ],
    },
  ];

  const handleContinue = () => {
    if (selectedType) {
      navigation.navigate("SellerRegistrationForm", {
        accountType: selectedType,
      });
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold">Account Type</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        <Text className="text-2xl font-bold mb-2">
          Choose Your Account Type
        </Text>
        <Text className="text-gray-600 mb-8">
          Select the type that best describes your selling business
        </Text>

        {accountTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            className={`mb-4 p-6 border-2 rounded-lg ${
              selectedType === type.id
                ? "border-primary bg-orange-50"
                : "border-gray-200 bg-white"
            }`}
            onPress={() => setSelectedType(type.id)}
          >
            <View className="flex flex-row items-start">
              <View
                className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                  selectedType === type.id ? "bg-primary" : "bg-gray-100"
                }`}
              >
                <MaterialIcons
                  name={type.icon}
                  size={24}
                  color={selectedType === type.id ? "white" : "gray"}
                />
              </View>

              <View className="flex-1">
                <View className="flex flex-row items-center justify-between mb-2">
                  <Text className="text-lg font-semibold">{type.title}</Text>
                  {selectedType === type.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#F16B44"
                    />
                  )}
                </View>

                <Text className="text-gray-600 mb-3">{type.description}</Text>

                {type.features.map((feature, index) => (
                  <View key={index} className="flex flex-row items-center mb-1">
                    <View className="w-1 h-1 bg-gray-400 rounded-full mr-2" />
                    <Text className="text-sm text-gray-600">{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-6 py-6 bg-primary border-t border-gray-200">
        <TouchableOpacity
          className={`w-full py-4 rounded-lg ${selectedType ? "bg-white" : "bg-gray-300"}`}
          onPress={handleContinue}
          disabled={!selectedType}
        >
          <Text
            className={`text-center font-semibold text-lg ${selectedType ? "text-primary" : "text-gray-500"}`}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SellerAccountTypeScreen;
