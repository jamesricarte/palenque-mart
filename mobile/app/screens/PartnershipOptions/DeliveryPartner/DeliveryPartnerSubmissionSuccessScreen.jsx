"use client";

import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";

const DeliveryPartnerSubmissionSuccessScreen = ({ navigation, route }) => {
  const { applicationId } = route.params;

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
    navigation.navigate("DeliveryPartnerApplicationStatus", { applicationId });
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
        <View className="w-6" />
        {/* <TouchableOpacity onPress={handleBackToHome}>
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity> */}
      </View>

      <ScrollView className="flex-1">
        {/* Success Icon and Message */}
        <View className="items-center px-6 py-12">
          <View className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <Ionicons name="checkmark-circle" size={60} color="#10b981" />
          </View>

          <Text className="text-3xl font-bold text-center mb-4">
            Thank You!
          </Text>
          <Text className="text-lg text-gray-600 text-center mb-8">
            Your delivery partner application has been submitted successfully
          </Text>

          {/* Application ID */}
          <View className="w-full p-4 bg-green-50 rounded-lg border border-green-200 mb-1">
            <Text className="text-sm font-medium text-green-800 mb-1">
              Application ID
            </Text>
            <Text className="text-lg font-bold text-green-900">
              {applicationId}
            </Text>
            <Text className="text-xs text-green-600 mt-1">
              Save this ID for future reference
            </Text>
          </View>
        </View>

        {/* What's Next Section */}
        <View className="px-6 mb-4">
          <Text className="text-xl font-semibold mb-4">What happens next?</Text>

          <View className="space-y-4">
            <View className="flex flex-row items-start">
              <View className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
                <Text className="text-green-600 font-bold text-sm">1</Text>
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
              <View className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
                <Text className="text-green-600 font-bold text-sm">2</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold mb-1">
                  Background Verification
                </Text>
                <Text className="text-gray-600 text-sm">
                  We'll verify your identity, license, and conduct a background
                  check
                </Text>
              </View>
            </View>

            <View className="flex flex-row items-start">
              <View className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
                <Text className="text-green-600 font-bold text-sm">3</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold mb-1">
                  Onboarding & Training
                </Text>
                <Text className="text-gray-600 text-sm">
                  Once approved, you'll receive training materials and app
                  access
                </Text>
              </View>
            </View>

            <View className="flex flex-row items-start">
              <View className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
                <Text className="text-green-600 font-bold text-sm">4</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold mb-1">Start Delivering</Text>
                <Text className="text-gray-600 text-sm">
                  Begin accepting delivery requests and start earning
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

        {/* Earning Potential */}
        <View className="px-6 mb-8">
          <View className="p-4 bg-green-50 rounded-lg border border-green-200">
            <View className="flex flex-row items-center mb-2">
              <Ionicons name="cash-outline" size={20} color="#10b981" />
              <Text className="ml-2 font-semibold text-green-800">
                Earning Potential
              </Text>
            </View>
            <Text className="text-green-700 text-sm mb-2">
              Start earning immediately once approved:
            </Text>
            <View className="space-y-1">
              <Text className="text-green-700 text-sm">
                • ₱50-100 per delivery
              </Text>
              <Text className="text-green-700 text-sm">
                • Weekly payments every Friday
              </Text>
              <Text className="text-green-700 text-sm">
                • Bonus incentives for peak hours
              </Text>
            </View>
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
              <Text className="text-green-500 text-sm font-medium">
                Get Support →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-4 py-6 bg-secondary">
        <View className="flex flex-row gap-3">
          <TouchableOpacity
            className="flex-1 py-4 border border-white rounded-lg"
            onPress={handleBackToHome}
          >
            <Text className="font-semibold text-center text-white">
              Back to Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 py-4 bg-white rounded-lg"
            onPress={handleCheckStatus}
          >
            <Text className="font-semibold text-center text-secondary">
              Check Status
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default DeliveryPartnerSubmissionSuccessScreen;
