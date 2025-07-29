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
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import { API_URL } from "../../../config/apiConfig";

const DeliveryPartnerReviewSubmitScreen = ({ navigation, route }) => {
  const { formData } = route.params;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, token } = useAuth();

  const handleSubmit = () => {
    Alert.alert(
      "Submit Application",
      "Are you sure you want to submit your delivery partner application?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Submit", onPress: () => submitApplication() },
      ]
    );
  };

  const submitApplication = async () => {
    try {
      setIsSubmitting(true);

      const formDataToSend = new FormData();

      // Add form fields
      formDataToSend.append("vehicleType", formData.vehicleType);
      formDataToSend.append("licenseNumber", formData.licenseNumber);
      formDataToSend.append(
        "vehicleRegistration",
        formData.vehicleRegistration
      );
      formDataToSend.append("vehicleMake", formData.vehicleMake);
      formDataToSend.append("vehicleModel", formData.vehicleModel);
      formDataToSend.append("vehicleYear", formData.vehicleYear);
      formDataToSend.append("vehicleColor", formData.vehicleColor);
      formDataToSend.append("companyName", formData.companyName);
      formDataToSend.append(
        "serviceAreas",
        JSON.stringify(formData.serviceAreas)
      );
      formDataToSend.append(
        "availabilityHours",
        JSON.stringify(formData.availabilityHours)
      );
      formDataToSend.append(
        "emergencyContactName",
        formData.emergencyContactName
      );
      formDataToSend.append(
        "emergencyContactPhone",
        formData.emergencyContactPhone
      );
      formDataToSend.append(
        "emergencyContactRelation",
        formData.emergencyContactRelation
      );

      // Add documents
      const documentTypes = [
        "drivers_license",
        "vehicle_registration",
        "profile_photo",
        "insurance",
        "background_check",
      ];

      documentTypes.forEach((docType) => {
        const document =
          formData[
            docType === "vehicle_registration"
              ? "vehicleRegistrationDoc"
              : docType
          ];
        if (document) {
          formDataToSend.append(docType, {
            uri: document.uri,
            name:
              document.name || `${docType}.${document.uri.split(".").pop()}`,
            type:
              document.mimeType || document.type || "application/octet-stream",
          });
        }
      });

      const response = await axios.post(
        `${API_URL}/api/delivery-partner/submit-application`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        navigation.navigate("DeliveryPartnerSubmissionSuccess", {
          applicationId: response.data.data.applicationId,
        });
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to submit application. Please try again."
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
          <Feather name="edit-2" size={18} color="#10b981" />
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
          <Ionicons name="document-text" size={20} color="#10b981" />
          <Text className="ml-2 text-xs font-semibold text-green-600 uppercase">
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
          <Feather name="edit-2" size={18} color="#10b981" />
        </TouchableOpacity>
      </View>
      <View>
        {renderDocumentPreview("drivers_license", formData.driversLicense)}
        {renderDocumentPreview(
          "vehicle_registration",
          formData.vehicleRegistrationDoc
        )}
        {renderDocumentPreview("profile_photo", formData.profilePhoto)}
        {renderDocumentPreview("insurance", formData.insurance)}
        {renderDocumentPreview("background_check", formData.backgroundCheck)}
      </View>
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

        {/* Vehicle Type */}
        <View className="p-4 mb-6 border border-green-200 rounded-lg bg-green-50">
          <Text className="mb-1 text-lg font-semibold text-green-800">
            Vehicle Type
          </Text>
          <Text className="text-green-600 capitalize">
            {formData.vehicleType.replace("_", " ")}
          </Text>
        </View>

        {/* Personal Details */}
        {renderSection(
          "Personal Details",
          {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth,
          },
          "personal"
        )}

        {/* Vehicle & License Details */}
        {renderSection(
          "Vehicle & License Information",
          {
            licenseNumber: formData.licenseNumber,
            vehicleRegistration: formData.vehicleRegistration,
            vehicleMake: formData.vehicleMake,
            vehicleModel: formData.vehicleModel,
            vehicleYear: formData.vehicleYear,
            vehicleColor: formData.vehicleColor,
            companyName: formData.companyName,
          },
          "vehicle"
        )}

        {/* Emergency Contact */}
        {renderSection(
          "Emergency Contact",
          {
            emergencyContactName: formData.emergencyContactName,
            emergencyContactPhone: formData.emergencyContactPhone,
            emergencyContactRelation: formData.emergencyContactRelation,
          },
          "emergency"
        )}

        {/* Service Areas & Availability */}
        {renderSection(
          "Service Areas & Availability",
          {
            serviceAreas: formData.serviceAreas?.join(", ") || "Not specified",
            availableDays:
              Object.entries(formData.availabilityHours || {})
                .filter(([day, schedule]) => schedule.available)
                .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1))
                .join(", ") || "Not specified",
          },
          "availability"
        )}

        {/* Documents */}
        {(formData.driversLicense ||
          formData.vehicleRegistrationDoc ||
          formData.profilePhoto ||
          formData.insurance ||
          formData.backgroundCheck) &&
          renderDocumentSection()}

        {/* Terms and Conditions */}
        <View className="p-4 mb-6 border border-gray-200 rounded-lg">
          <View className="flex flex-row items-start">
            <AntDesign name="infocirlce" size={20} color="#10b981" />
            <View className="flex-1 ml-3">
              <Text className="mb-2 font-semibold">Terms & Conditions</Text>
              <Text className="mb-3 text-sm text-gray-600">
                By submitting this application, you agree to our delivery
                partner terms and conditions, privacy policy, and commission
                structure.
              </Text>
              <TouchableOpacity>
                <Text className="text-sm text-green-500">
                  Read full terms →
                </Text>
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
                Document verification and background check
              </Text>
            </View>
            <View className="flex flex-row items-center">
              <View className="w-2 h-2 mr-3 bg-yellow-500 rounded-full" />
              <Text className="text-sm text-yellow-700">
                Account activation and onboarding
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

export default DeliveryPartnerReviewSubmitScreen;
