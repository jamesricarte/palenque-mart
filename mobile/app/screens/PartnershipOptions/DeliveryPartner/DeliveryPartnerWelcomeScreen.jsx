"use client";

import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

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
      color: "bg-green-500",
    },
    {
      id: "car",
      title: "Car",
      subtitle: "Comfortable for larger orders",
      icon: "car-sport",
      benefits: [
        "Weather protection",
        "Larger cargo capacity",
        "Professional appearance",
      ],
      requirements: [
        "Valid driver's license",
        "Registered vehicle",
        "Vehicle insurance",
      ],
      color: "bg-purple-500",
    },
    {
      id: "truck",
      title: "Truck/Van",
      subtitle: "Perfect for bulk deliveries",
      icon: "car",
      benefits: [
        "Maximum cargo space",
        "Bulk delivery capability",
        "Higher earning potential",
      ],
      requirements: [
        "Commercial driver's license",
        "Registered commercial vehicle",
        "Loading equipment",
      ],
      color: "bg-orange-500",
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
        <View className="px-6 py-8 bg-gradient-to-br from-green-50 to-blue-50">
          <View className="items-center mb-6">
            <View className="flex items-center justify-center w-20 h-20 mb-4 bg-green-500 rounded-full">
              <Feather name="truck" size={40} color="white" />
            </View>
            <Text className="mb-2 text-3xl font-bold text-center">
              Start Earning Today!
            </Text>
            <Text className="text-lg text-center text-gray-600">
              Join our delivery network and earn flexible income on your
              schedule
            </Text>
          </View>

          {/* Key Benefits */}
          <View className="space-y-3">
            <View className="flex flex-row items-center">
              <View className="flex items-center justify-center w-8 h-8 mr-3 bg-green-100 rounded-full">
                <AntDesign name="clockcircle" size={16} color="#10b981" />
              </View>
              <Text className="text-gray-700">
                Flexible working hours - work when you want
              </Text>
            </View>
            <View className="flex flex-row items-center">
              <View className="flex items-center justify-center w-8 h-8 mr-3 bg-green-100 rounded-full">
                <MaterialIcons name="attach-money" size={16} color="#10b981" />
              </View>
              <Text className="text-gray-700">
                Competitive rates with weekly payments
              </Text>
            </View>
            <View className="flex flex-row items-center">
              <View className="flex items-center justify-center w-8 h-8 mr-3 bg-green-100 rounded-full">
                <AntDesign name="Safety" size={16} color="#10b981" />
              </View>
              <Text className="text-gray-700">
                Insurance coverage and safety support
              </Text>
            </View>
          </View>
        </View>

        {/* Vehicle Selection */}
        <View className="px-6 py-6">
          <Text className="mb-2 text-2xl font-bold">
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
                    <AntDesign name="checkcircle" size={24} color="#10b981" />
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

        {/* How it Works */}
        <View className="px-6 py-6 bg-gray-50">
          <Text className="mb-4 text-xl font-semibold">How It Works</Text>
          <View className="space-y-4">
            <View className="flex flex-row items-start">
              <View className="flex items-center justify-center w-8 h-8 mr-4 bg-green-500 rounded-full">
                <Text className="font-bold text-white">1</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold">Complete Registration</Text>
                <Text className="text-sm text-gray-600">
                  Fill out your details and upload required documents
                </Text>
              </View>
            </View>
            <View className="flex flex-row items-start">
              <View className="flex items-center justify-center w-8 h-8 mr-4 bg-green-500 rounded-full">
                <Text className="font-bold text-white">2</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold">Get Verified</Text>
                <Text className="text-sm text-gray-600">
                  Our team will review and verify your application
                </Text>
              </View>
            </View>
            <View className="flex flex-row items-start">
              <View className="flex items-center justify-center w-8 h-8 mr-4 bg-green-500 rounded-full">
                <Text className="font-bold text-white">3</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold">Start Delivering</Text>
                <Text className="text-sm text-gray-600">
                  Accept orders and start earning immediately
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Requirements Overview */}
        <View className="px-6 py-6">
          <Text className="mb-4 text-xl font-semibold">
            General Requirements
          </Text>
          <View className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
            <View className="space-y-2">
              <View className="flex flex-row items-center">
                <Feather name="check" size={16} color="#f59e0b" />
                <Text className="ml-2 text-sm text-yellow-800">
                  Must be 18 years old or above
                </Text>
              </View>
              <View className="flex flex-row items-center">
                <Feather name="check" size={16} color="#f59e0b" />
                <Text className="ml-2 text-sm text-yellow-800">
                  Valid government-issued ID
                </Text>
              </View>
              <View className="flex flex-row items-center">
                <Feather name="check" size={16} color="#f59e0b" />
                <Text className="ml-2 text-sm text-yellow-800">
                  Smartphone with GPS capability
                </Text>
              </View>
              <View className="flex flex-row items-center">
                <Feather name="check" size={16} color="#f59e0b" />
                <Text className="ml-2 text-sm text-yellow-800">
                  Clean background check
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-6 py-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          className={`w-full py-4 rounded-lg ${selectedVehicle ? "bg-green-500" : "bg-gray-300"}`}
          onPress={handleContinue}
          disabled={!selectedVehicle}
        >
          <Text className="text-lg font-semibold text-center text-white">
            Continue Registration
          </Text>
        </TouchableOpacity>

        {!selectedVehicle && (
          <Text className="mt-2 text-sm text-center text-gray-500">
            Please select a vehicle type to continue
          </Text>
        )}
      </View>
    </View>
  );
};

export default DeliveryPartnerWelcomeScreen;
