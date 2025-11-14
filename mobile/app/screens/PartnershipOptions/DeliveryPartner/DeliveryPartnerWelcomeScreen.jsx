"use client";

import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const DeliveryPartnerWelcomeScreen = ({ navigation }) => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const vehicleTypes = [
    {
      id: "motorcycle",
      title: "Motorcycle",
      subtitle: "Fast and efficient for city deliveries",
      icon: "motorcycle",
      benefits: [
        "Quick navigation through traffic",
        "Lower fuel costs",
        "Higher delivery frequency",
      ],
      requirements: [
        "Valid motorcycle license",
        "Registered motorcycle",
        "Helmet and safety gear",
      ],
      color: "bg-blue-500",
    },
    {
      id: "tricycle",
      title: "Tricycle",
      subtitle: "Fast and efficient for local deliveries",
      icon: "bicycle",
      benefits: [
        "Quick navigation through local roads",
        "Moderate fuel costs",
        "Good cargo capacity",
      ],
      requirements: [
        "Valid driver's license",
        "Registered tricycle",
        "Safety equipment",
      ],
      color: "bg-secondary",
    },
  ];

  const handleContinue = () => {
    if (selectedVehicle) {
      navigation.navigate("DeliveryPartnerRegistrationForm", {
        vehicleType: selectedVehicle,
      });
    }
  };

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case "motorcycle":
        return <Ionicons name="bicycle" size={40} color="white" />;
      case "bicycle":
        return <Ionicons name="bicycle" size={40} color="white" />;
      case "car-sport":
        return <Ionicons name="car-sport" size={40} color="white" />;
      case "car":
        return <Ionicons name="car" size={40} color="white" />;
      default:
        return <Feather name="truck" size={40} color="white" />;
    }
  };

  const requirements = [
    "Must be 18 years old or above",
    "Valid government-issued ID",
    "Smartphone with GPS capability",
    "Clean background check",
  ];

  const process = [
    {
      icon: "users",
      title: "Complete Registration",
      description: "Fill out your details and upload required documents",
    },
    {
      icon: "shield",
      title: "Get Verified",
      description: "Our team will review and verify your application",
    },
    {
      icon: "truck",
      title: "Start Delivering",
      description: "Accept orders and start earning immediately",
    },
  ];
  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold">Become a Delivery Partner</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1">
        {/* Welcome Section */}
        <View className="px-6 py-8">
          <View className="items-center">
            <View className="flex items-center justify-center w-20 h-20 mb-4 bg-green-500 rounded-full">
              <Feather name="truck" size={40} color="white" />
            </View>
            <Text className="mb-1 text-3xl font-bold text-center">
              Start Earning Today!
            </Text>
            <Text className="text-lg text-center text-gray-600">
              Join our delivery network and earn flexible income on your
              schedule
            </Text>
          </View>
        </View>

        <View className="mx-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          {/* Requirements Section */}
          <View className="px-6 py-4 bg-white">
            <Text className="mb-4 text-xl font-semibold">
              General Requirements
            </Text>
            {requirements.map((requirement, index) => (
              <View key={index} className="flex flex-row items-center mb-3">
                <Feather name="check" size={16} color="#10b981" />
                <Text className="ml-3 text-gray-700">{requirement}</Text>
              </View>
            ))}
          </View>
        </View>
        {/* Vehicle Selection */}
        <View className="px-6 py-4">
          <Text className="mb-1 text-2xl font-bold">
            Choose Your Vehicle Type
          </Text>
          <Text className="mb-6 text-gray-600">
            Select the vehicle you'll use for deliveries. You can change this
            later.
          </Text>

          <View className="flex gap-3">
            {vehicleTypes.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.id}
                className={`border-2 rounded-lg p-4 ${
                  selectedVehicle === vehicle.id
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white"
                }`}
                onPress={() => setSelectedVehicle(vehicle.id)}
              >
                <View className="flex flex-row items-center mb-3">
                  <View
                    className={`w-12 h-12 ${vehicle.color} rounded-lg flex items-center justify-center mr-4`}
                  >
                    {getIconComponent(vehicle.icon)}
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold">
                      {vehicle.title}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {vehicle.subtitle}
                    </Text>
                  </View>
                  {selectedVehicle === vehicle.id && (
                    <FontAwesome
                      name="check-circle"
                      size={16}
                      color="#10b981"
                    />
                  )}
                </View>

                {selectedVehicle === vehicle.id && (
                  <View className="pt-3 mt-3 border-t border-green-200">
                    <View className="mb-3">
                      <Text className="mb-2 font-semibold text-green-800">
                        Benefits:
                      </Text>
                      {vehicle.benefits.map((benefit, index) => (
                        <View
                          key={index}
                          className="flex flex-row items-center mb-1"
                        >
                          <View className="w-1 h-1 mr-2 bg-green-500 rounded-full" />
                          <Text className="text-sm text-green-700">
                            {benefit}
                          </Text>
                        </View>
                      ))}
                    </View>
                    <View>
                      <Text className="mb-2 font-semibold text-green-800">
                        Requirements:
                      </Text>
                      {vehicle.requirements.map((requirement, index) => (
                        <View
                          key={index}
                          className="flex flex-row items-center mb-1"
                        >
                          <View className="w-1 h-1 mr-2 bg-green-500 rounded-full" />
                          <Text className="text-sm text-green-700">
                            {requirement}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mx-6 mb-4 bg-white border border-gray-200 shadow-sm rounded-xl">
          {/* Process Section */}
          <View className="px-6 py-4">
            <Text className="mb-4 text-xl font-semibold">How It Works:</Text>
            {process.map((process, index) => (
              <View key={index} className="flex flex-row items-start mb-4">
                <View className="flex items-center justify-center w-10 h-10 mr-3 bg-green-100 rounded-lg">
                  <Feather name={process.icon} size={20} color="#39B54A" />
                </View>
                <View className="flex-1">
                  <Text className="mb-1 font-semibold">{process.title}</Text>
                  <Text className="text-sm text-gray-600">
                    {process.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-4 py-6 bg-secondary">
        <TouchableOpacity
          className={`w-full py-4 rounded-lg ${selectedVehicle ? "bg-white" : "bg-gray-200"}`}
          onPress={handleContinue}
          disabled={!selectedVehicle}
        >
          <Text
            className={`font-semibold text-center ${selectedVehicle ? "text-secondary" : "text-gray-400"}`}
          >
            Continue Registration
          </Text>
        </TouchableOpacity>

        {!selectedVehicle && (
          <Text className="mt-1 text-base text-center text-white">
            Please select a vehicle type to continue
          </Text>
        )}
      </View>
    </View>
  );
};

export default DeliveryPartnerWelcomeScreen;
