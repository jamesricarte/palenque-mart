"use client";

import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";

const SellerSubmissionSuccessScreen = ({ navigation, route }) => {
  const [applicationId] = useState(`APP${Date.now().toString().slice(-8)}`);

  const handleBackToHome = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: "Dashboard",
          params: {
            screen: "Home",
          },
        },
      ],
    });
  };

  const handleCheckStatus = () => {
    navigation.navigate("SellerApplicationStatus", { applicationId });
  };

  const handleContactSupport = () => {
    // Navigate to support or open email/chat
    console.log("Contact support");
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <View className="w-6" />
        <Text className="text-xl font-semibold">Application Submitted</Text>
        <TouchableOpacity onPress={handleBackToHome}>
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {/* Success Icon and Message */}
        <View className="items-center px-6 py-6">
          <View className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <Ionicons name="checkmark-circle" size={60} color="#10b981" />
          </View>

          <Text className="text-3xl font-bold text-center mb-4">
            Thank You!
          </Text>
          <Text className="text-lg text-gray-600 text-center mb-8">
            Your seller application has been submitted successfully
          </Text>

          <TouchableOpacity
            className="w-full py-4 mb-4 bg-primary rounded-lg"
            onPress={handleCheckStatus}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Check Application Status
            </Text>
          </TouchableOpacity>

          {/* Application ID */}
          <View className="w-full p-4 bg-white rounded-lg border border-gray-200 ">
            <Text className="text-sm font-medium mb-1">Application ID</Text>
            <Text className="text-lg font-bold ">{applicationId}</Text>
            <Text className="text-xs text-gray-600 mt-1">
              Save this ID for future reference
            </Text>
          </View>
        </View>

        {/* What's Next Section */}
        <View className="px-6 mb-6">
          <Text className="text-xl font-semibold mb-4">What happens next?</Text>

          <View className="space-y-4">
            <View className="flex flex-row items-start">
              <View className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-4 mt-1">
                <Text className="text-primary font-bold text-sm">1</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold mb-1">Application Review</Text>
                <Text className="text-gray-600 text-sm">
                  Our team will review your application and documents within 1-3
                  business days
                </Text>
              </View>
            </View>

            <View className="flex flex-row items-start">
              <View className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-4 mt-1">
                <Text className="text-primary font-bold text-sm">2</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold mb-1">
                  Document Verification
                </Text>
                <Text className="text-gray-600 text-sm">
                  We'll verify your identity and business documents for security
                </Text>
              </View>
            </View>

            <View className="flex flex-row items-start">
              <View className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-4 mt-1">
                <Text className="text-primary font-bold text-sm">3</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold mb-1">Account Activation</Text>
                <Text className="text-gray-600 text-sm">
                  Once approved, you'll receive an email with your seller
                  dashboard access
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Timeline */}
        <View className="px-6 mb-8">
          <View className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <View className="flex flex-row items-center mb-2">
              <Ionicons name="time-outline" size={20} color="#f59e0b" />
              <Text className="ml-2 font-semibold text-yellow-800">
                Expected Timeline
              </Text>
            </View>
            <Text className="text-yellow-700 text-sm">
              We'll notify you within 1-3 business days about your application
              status. You can track your progress anytime using your application
              ID.
            </Text>
          </View>
        </View>

        {/* Additional Info */}
        <View className="px-6 mb-8">
          <View className="p-4 bg-gray-50 rounded-lg">
            <Text className="font-semibold mb-2">Need Help?</Text>
            <Text className="text-gray-600 text-sm mb-3">
              If you have any questions about your application or need
              assistance, our support team is here to help.
            </Text>
            <TouchableOpacity onPress={handleContactSupport}>
              <Text className="text-primary text-sm font-medium">
                Get Support →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-6 py-6 bg-primary border-t border-gray-200">
        <TouchableOpacity
          className="w-full py-4 bg-white rounded-lg"
          onPress={handleBackToHome}
        >
          <Text className="text-primary text-center font-semibold text-lg">
            Back to Home
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SellerSubmissionSuccessScreen;
