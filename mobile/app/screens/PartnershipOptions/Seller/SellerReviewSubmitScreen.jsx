"use client"

import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native"
import { useState } from "react"
import Ionicons from "@expo/vector-icons/Ionicons"
import Feather from "@expo/vector-icons/Feather"
import AntDesign from "@expo/vector-icons/AntDesign"

const SellerReviewSubmitScreen = ({ navigation, route }) => {
  const { formData, accountType } = route.params
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = () => {
    Alert.alert("Submit Application", "Are you sure you want to submit your seller application?", [
      { text: "Cancel", style: "cancel" },
      { text: "Submit", onPress: () => submitApplication() },
    ])
  }

  const submitApplication = () => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      navigation.navigate("SellerSubmissionSuccess")
    }, 2000)
  }

  const handleEdit = (section) => {
    // Navigate back to specific step for editing
    navigation.goBack()
  }

  const renderSection = (title, data, editSection) => (
    <View className="mb-6 p-4 bg-gray-50 rounded-lg">
      <View className="flex flex-row items-center justify-between mb-3">
        <Text className="text-lg font-semibold">{title}</Text>
        <TouchableOpacity onPress={() => handleEdit(editSection)}>
          <Feather name="edit-2" size={18} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {Object.entries(data).map(
        ([key, value]) =>
          value && (
            <View key={key} className="flex flex-row justify-between mb-2">
              <Text className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</Text>
              <Text className="font-medium flex-1 text-right">{value}</Text>
            </View>
          ),
      )}
    </View>
  )

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold">Review & Submit</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        <Text className="text-2xl font-bold mb-2">Review Your Information</Text>
        <Text className="text-gray-600 mb-6">Please review all information before submitting your application</Text>

        {/* Account Type */}
        <View className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Text className="text-lg font-semibold text-blue-800 mb-1">Account Type</Text>
          <Text className="text-blue-600 capitalize">{accountType} Seller</Text>
        </View>

        {/* Personal/Business Details */}
        {renderSection(
          accountType === "individual" ? "Personal Details" : "Business Details",
          {
            firstName: formData.firstName,
            lastName: formData.lastName,
            businessName: formData.businessName,
            businessRegNumber: formData.businessRegNumber,
            contactPerson: formData.contactPerson,
            email: formData.email,
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth,
            businessAddress: formData.businessAddress,
          },
          "details",
        )}

        {/* Terms and Conditions */}
        <View className="mb-6 p-4 border border-gray-200 rounded-lg">
          <View className="flex flex-row items-start">
            <AntDesign name="infocirlce" size={20} color="#3b82f6" />
            <View className="ml-3 flex-1">
              <Text className="font-semibold mb-2">Terms & Conditions</Text>
              <Text className="text-gray-600 text-sm mb-3">
                By submitting this application, you agree to our seller terms and conditions, privacy policy, and
                commission structure.
              </Text>
              <TouchableOpacity>
                <Text className="text-blue-500 text-sm">Read full terms →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* What happens next */}
        <View className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <Text className="font-semibold mb-2 text-yellow-800">What happens next?</Text>
          <View className="space-y-2">
            <View className="flex flex-row items-center">
              <View className="w-2 h-2 bg-yellow-500 rounded-full mr-3" />
              <Text className="text-yellow-700 text-sm">Application review (1-3 business days)</Text>
            </View>
            <View className="flex flex-row items-center">
              <View className="w-2 h-2 bg-yellow-500 rounded-full mr-3" />
              <Text className="text-yellow-700 text-sm">Document verification</Text>
            </View>
            <View className="flex flex-row items-center">
              <View className="w-2 h-2 bg-yellow-500 rounded-full mr-3" />
              <Text className="text-yellow-700 text-sm">Account activation notification</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-6 py-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          className={`w-full py-4 rounded-lg ${isSubmitting ? "bg-gray-400" : "bg-green-500"}`}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default SellerReviewSubmitScreen
