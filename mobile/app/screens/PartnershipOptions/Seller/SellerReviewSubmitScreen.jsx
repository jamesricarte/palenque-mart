"use client";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import axios from "axios";
import { API_URL } from "../../../config/apiConfig";
import { useAuth } from "../../../context/AuthContext";

const SellerReviewSubmitScreen = ({ navigation, route }) => {
  const { formData, accountType } = route.params;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, token } = useAuth();

  const handleSubmit = () => {
    Alert.alert(
      "Submit Application",
      "Are you sure you want to submit your seller application?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Submit", onPress: () => submitApplication() },
      ]
    );
  };

  const submitApplication = async () => {
    try {
      setIsSubmitting(true);

      // Create FormData for multipart/form-data submission
      const formDataToSend = new FormData();

      // Add basic application data
      formDataToSend.append("accountType", accountType);
      formDataToSend.append("storeName", formData.storeName);
      formDataToSend.append("storeDescription", formData.storeDescription);

      formDataToSend.append(
        "weekdayOpeningTime",
        formData.weekdayOpeningTime || ""
      );
      formDataToSend.append(
        "weekdayClosingTime",
        formData.weekdayClosingTime || ""
      );
      formDataToSend.append(
        "weekendOpeningTime",
        formData.weekendOpeningTime || ""
      );
      formDataToSend.append(
        "weekendClosingTime",
        formData.weekendClosingTime || ""
      );

      // Add address data in new format
      if (formData.addresses) {
        formDataToSend.append("addresses", JSON.stringify(formData.addresses));
      }

      // Add business details if business account
      if (accountType === "business") {
        formDataToSend.append("businessName", formData.businessName);
        formDataToSend.append("businessRegNumber", formData.businessRegNumber);
        formDataToSend.append("contactPerson", formData.contactPerson);
        formDataToSend.append("businessAddress", formData.businessAddress);
      }

      // Add document files
      const documentFields = {
        government_id: formData.governmentId,
        selfie_with_id: formData.selfieWithId,
        business_documents: formData.businessDocuments,
        bank_statement: formData.bankStatement,
        store_logo: formData.storeLogo,
      };

      for (const [fieldName, file] of Object.entries(documentFields)) {
        if (file) {
          // Create file object for FormData
          const fileToUpload = {
            uri: file.uri,
            type: file.mimeType || file.type || "application/octet-stream",
            name: file.name || `${fieldName}.${file.uri.split(".").pop()}`,
          };

          formDataToSend.append(fieldName, fileToUpload);
        }
      }

      const response = await axios.post(
        `${API_URL}/api/seller/submit-application`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        navigation.navigate("SellerSubmissionSuccess", {
          applicationId: response.data.data.applicationId,
        });
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Failed to submit application"
        );
      }
    } catch (error) {
      console.error("Error submitting application:", error.response.data);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to submit application"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (section) => {
    // Navigate back to specific step for editing
    navigation.goBack();
  };

  const renderSection = (title, data, editSection) => (
    <View className="p-4 mb-6 rounded-lg bg-gray-50">
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
              <Text className="text-gray-600 capitalize">
                {key.replace(/([A-Z])/g, " $1").trim()}:
              </Text>
              <Text className="flex-1 font-medium text-right">{value}</Text>
            </View>
          )
      )}
    </View>
  );

  const renderDocumentPreview = (docType, document) => {
    if (!document) return null;
    return (
      <View
        key={docType}
        className="p-3 mb-3 bg-white border border-gray-200 rounded-lg"
      >
        <View className="flex-row items-center mb-2">
          <Ionicons name="document-text" size={20} color="#007AFF" />
          <Text className="ml-2 text-xs font-semibold text-blue-600 uppercase">
            {docType.replace(/_/g, " ")}
          </Text>
        </View>
        {document.uri && (
          <Image
            source={{ uri: document.uri }}
            className="w-full h-24 mb-2 rounded"
            resizeMode="cover"
          />
        )}
        <Text className="text-sm font-medium text-gray-900">
          {document.name || "Document"}
        </Text>
        <Text className="text-xs text-gray-500">
          {document.size
            ? `${(document.size / 1024 / 1024).toFixed(2)} MB`
            : "Size unknown"}
        </Text>
      </View>
    );
  };

  const renderDocumentSection = () => (
    <View className="p-4 mb-6 rounded-lg bg-gray-50">
      <View className="flex flex-row items-center justify-between mb-3">
        <Text className="text-lg font-semibold">Documents</Text>
        <TouchableOpacity onPress={() => handleEdit("documents")}>
          <Feather name="edit-2" size={18} color="#3b82f6" />
        </TouchableOpacity>
      </View>
      <View>
        {renderDocumentPreview("government_id", formData.governmentId)}
        {renderDocumentPreview("selfie_with_id", formData.selfieWithId)}
        {renderDocumentPreview(
          "business_documents",
          formData.businessDocuments
        )}
        {renderDocumentPreview("bank_statement", formData.bankStatement)}
        {renderDocumentPreview("store_logo", formData.storeLogo)}
      </View>
    </View>
  );

  const renderAddressSection = () => (
    <View className="p-4 mb-6 rounded-lg bg-gray-50">
      <View className="flex flex-row items-center justify-between mb-3">
        <Text className="text-lg font-semibold">Address Information</Text>
        <TouchableOpacity onPress={() => handleEdit("address")}>
          <Feather name="edit-2" size={18} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {/* Pickup Address */}
      {formData.addresses?.pickup && (
        <View className="p-3 mb-3 bg-white border border-gray-200 rounded-lg">
          <View className="flex flex-row items-center mb-2">
            <Ionicons name="location" size={16} color="#059669" />
            <Text className="ml-2 text-sm font-semibold text-green-700">
              PICKUP ADDRESS
            </Text>
          </View>
          <Text className="text-sm text-gray-900">
            {formData.addresses.pickup.streetAddress}
          </Text>
          <Text className="text-sm text-gray-600">
            {formData.addresses.pickup.barangay},{" "}
            {formData.addresses.pickup.city},{" "}
            {formData.addresses.pickup.province}
          </Text>
          {formData.addresses.pickup.landmark && (
            <Text className="text-xs text-gray-500">
              Landmark: {formData.addresses.pickup.landmark}
            </Text>
          )}
        </View>
      )}

      {/* Return Address */}
      {formData.addresses?.return && (
        <View className="p-3 mb-3 bg-white border border-gray-200 rounded-lg">
          <View className="flex flex-row items-center mb-2">
            <Ionicons name="return-up-back" size={16} color="#dc2626" />
            <Text className="ml-2 text-sm font-semibold text-red-700">
              RETURN ADDRESS
            </Text>
          </View>
          <Text className="text-sm text-gray-900">
            {formData.addresses.return.streetAddress}
          </Text>
          <Text className="text-sm text-gray-600">
            {formData.addresses.return.barangay},{" "}
            {formData.addresses.return.city},{" "}
            {formData.addresses.return.province}
          </Text>
          {formData.addresses.return.landmark && (
            <Text className="text-xs text-gray-500">
              Landmark: {formData.addresses.return.landmark}
            </Text>
          )}
        </View>
      )}

      {/* Store Location */}
      {formData.addresses?.store && (
        <View className="p-3 mb-3 bg-white border border-gray-200 rounded-lg">
          <View className="flex flex-row items-center mb-2">
            <Ionicons name="storefront" size={16} color="#7c3aed" />
            <Text className="ml-2 text-sm font-semibold text-purple-700">
              STORE LOCATION
            </Text>
          </View>
          <Text className="text-sm text-gray-900">
            {formData.addresses.store.streetAddress}
          </Text>
          <Text className="text-sm text-gray-600">
            {formData.addresses.store.barangay}, {formData.addresses.store.city}
            , {formData.addresses.store.province}
          </Text>
          {formData.addresses.store.landmark && (
            <Text className="text-xs text-gray-500">
              Landmark: {formData.addresses.store.landmark}
            </Text>
          )}
        </View>
      )}
    </View>
  );

  const renderOperatingHoursSection = () => (
    <View className="p-4 mb-6 rounded-lg bg-gray-50">
      <View className="flex flex-row items-center justify-between mb-3">
        <Text className="text-lg font-semibold">Store Operating Hours</Text>
        <TouchableOpacity onPress={() => handleEdit("store")}>
          <Feather name="edit-2" size={18} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {formData.is247 ? (
        <View className="p-3 bg-white border border-green-200 rounded-lg">
          <View className="flex flex-row items-center">
            <Ionicons name="time" size={20} color="#059669" />
            <Text className="ml-2 font-semibold text-green-700">Open 24/7</Text>
          </View>
          <Text className="mt-1 text-sm text-gray-600">
            Store operates all day, every day
          </Text>
        </View>
      ) : (
        <>
          {/* Weekday Hours */}
          <View className="p-3 mb-3 bg-white border border-gray-200 rounded-lg">
            <View className="flex flex-row items-center mb-2">
              <Ionicons name="calendar" size={16} color="#3b82f6" />
              <Text className="ml-2 text-sm font-semibold text-blue-700">
                WEEKDAYS (MON-FRI)
              </Text>
            </View>
            <View className="flex flex-row justify-between">
              <View>
                <Text className="text-xs text-gray-500">Opening</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {formData.weekdayOpeningTime || "Not set"}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-xs text-gray-500">Closing</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {formData.weekdayClosingTime || "Not set"}
                </Text>
              </View>
            </View>
          </View>

          {/* Weekend Hours */}
          <View className="p-3 bg-white border border-gray-200 rounded-lg">
            <View className="flex flex-row items-center mb-2">
              <Ionicons name="calendar" size={16} color="#7c3aed" />
              <Text className="ml-2 text-sm font-semibold text-purple-700">
                WEEKENDS (SAT-SUN)
              </Text>
            </View>
            <View className="flex flex-row justify-between">
              <View>
                <Text className="text-xs text-gray-500">Opening</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {formData.weekendOpeningTime || "Not set"}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-xs text-gray-500">Closing</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {formData.weekendClosingTime || "Not set"}
                </Text>
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  );

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
        <Text className="mb-2 text-2xl font-bold">Review Your Information</Text>
        <Text className="mb-6 text-gray-600">
          Please review all information before submitting your application
        </Text>

        {/* Account Type */}
        <View className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
          <Text className="mb-1 text-lg font-semibold text-blue-800">
            Account Type
          </Text>
          <Text className="text-blue-600 capitalize">{accountType} Seller</Text>
        </View>

        {/* Personal/Business Details */}
        {renderSection(
          accountType === "individual"
            ? "Personal Details"
            : "Business Details",
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
          "details"
        )}

        {/* Address Details */}
        {renderAddressSection()}

        {/* Store Profile */}
        {renderSection(
          "Store Profile",
          {
            storeName: formData.storeName,
            storeDescription: formData.storeDescription,
          },
          "store"
        )}

        {/* Store Operating Hours */}
        {renderOperatingHoursSection()}

        {/* Documents */}
        {(formData.governmentId ||
          formData.selfieWithId ||
          formData.businessDocuments ||
          formData.bankStatement ||
          formData.storeLogo) &&
          renderDocumentSection()}

        {/* Terms and Conditions */}
        <View className="p-4 mb-6 border border-gray-200 rounded-lg">
          <View className="flex flex-row items-start">
            <AntDesign name="infocirlce" size={20} color="#3b82f6" />
            <View className="flex-1 ml-3">
              <Text className="mb-2 font-semibold">Terms & Conditions</Text>
              <Text className="mb-3 text-sm text-gray-600">
                By submitting this application, you agree to our seller terms
                and conditions, privacy policy, and commission structure.
              </Text>
              <TouchableOpacity>
                <Text className="text-sm text-blue-500">Read full terms →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* What happens next */}
        <View className="p-4 mb-6 border border-yellow-200 rounded-lg bg-yellow-50">
          <Text className="mb-2 font-semibold text-yellow-800">
            What happens next?
          </Text>
          <View className="space-y-2">
            <View className="flex flex-row items-center">
              <View className="w-2 h-2 mr-3 bg-yellow-500 rounded-full" />
              <Text className="text-sm text-yellow-700">
                Application review (1-3 business days)
              </Text>
            </View>
            <View className="flex flex-row items-center">
              <View className="w-2 h-2 mr-3 bg-yellow-500 rounded-full" />
              <Text className="text-sm text-yellow-700">
                Document verification
              </Text>
            </View>
            <View className="flex flex-row items-center">
              <View className="w-2 h-2 mr-3 bg-yellow-500 rounded-full" />
              <Text className="text-sm text-yellow-700">
                Account activation notification
              </Text>
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
          <Text className="text-lg font-semibold text-center text-white">
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SellerReviewSubmitScreen;
