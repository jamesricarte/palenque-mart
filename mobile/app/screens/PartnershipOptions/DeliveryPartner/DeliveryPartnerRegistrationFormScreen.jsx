"use client";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useAuth } from "../../../context/AuthContext";

const DeliveryPartnerRegistrationFormScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { vehicleType } = route.params;

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Form state
  const [formData, setFormData] = useState({
    // Personal Details (pre-filled from user account)
    firstName: user.first_name || "",
    lastName: user.last_name || "",
    email: user.email || "",
    phone: user.phone || "",
    dateOfBirth: user.birth_date || "",

    // Vehicle & License Details
    vehicleType: vehicleType,
    licenseNumber: "",
    vehicleRegistration: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    vehicleColor: "",

    // Company Details
    companyName: "",
    companyType: "independent", // independent, company_driver, franchise

    // Service Areas & Availability
    serviceAreas: [],
    availabilityHours: {
      monday: { available: false, start: "09:00", end: "17:00" },
      tuesday: { available: false, start: "09:00", end: "17:00" },
      wednesday: { available: false, start: "09:00", end: "17:00" },
      thursday: { available: false, start: "09:00", end: "17:00" },
      friday: { available: false, start: "09:00", end: "17:00" },
      saturday: { available: false, start: "09:00", end: "17:00" },
      sunday: { available: false, start: "09:00", end: "17:00" },
    },

    // Emergency Contact
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",

    // Document uploads
    driversLicense: null,
    vehicleRegistrationDoc: null,
    insurance: null,
    backgroundCheck: null,
    profilePhoto: null,
  });

  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Sorry, we need camera roll permissions to upload images!"
      );
      return false;
    }

    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus.status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Sorry, we need camera permissions to take photos!"
      );
      return false;
    }

    return true;
  };

  const pickDocument = async (field) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        if (file.size > 5 * 1024 * 1024) {
          Alert.alert("File too large", "File size must be less than 5MB");
          return;
        }
        updateFormData(field, file);
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Error selecting document");
    }
  };

  const takePhoto = async (field) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        updateFormData(field, file);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Error taking photo");
    }
  };

  const pickImage = async (field) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        updateFormData(field, file);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Error selecting image");
    }
  };

  const showUploadOptions = (field, type = "document") => {
    if (type === "camera") {
      takePhoto(field);
    } else if (type === "image") {
      pickImage(field);
    } else {
      pickDocument(field);
    }
  };

  const validateCurrentStep = () => {
    const newErrors = {};

    if (currentStep === 1) {
      // Personal details validation (most are pre-filled)
      if (!formData.firstName.trim())
        newErrors.firstName = "First name is required";
      if (!formData.lastName.trim())
        newErrors.lastName = "Last name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      if (!formData.dateOfBirth.trim())
        newErrors.dateOfBirth = "Date of birth is required";
    }

    if (currentStep === 2) {
      // Vehicle & license validation
      if (!formData.licenseNumber.trim())
        newErrors.licenseNumber = "License number is required";
      if (!formData.vehicleRegistration.trim())
        newErrors.vehicleRegistration = "Vehicle registration is required";
      if (!formData.vehicleMake.trim())
        newErrors.vehicleMake = "Vehicle make is required";
      if (!formData.vehicleModel.trim())
        newErrors.vehicleModel = "Vehicle model is required";
      if (!formData.vehicleYear.trim())
        newErrors.vehicleYear = "Vehicle year is required";
      if (!formData.companyName.trim())
        newErrors.companyName = "Company name is required";
    }

    if (currentStep === 3) {
      // Emergency contact validation
      if (!formData.emergencyContactName.trim())
        newErrors.emergencyContactName = "Emergency contact name is required";
      if (!formData.emergencyContactPhone.trim())
        newErrors.emergencyContactPhone = "Emergency contact phone is required";
      if (!formData.emergencyContactRelation.trim())
        newErrors.emergencyContactRelation = "Relationship is required";
    }

    if (currentStep === 4) {
      // Document validation
      if (!formData.driversLicense)
        newErrors.driversLicense = "Driver's license is required";
      if (!formData.vehicleRegistrationDoc)
        newErrors.vehicleRegistrationDoc =
          "Vehicle registration document is required";
      if (!formData.profilePhoto)
        newErrors.profilePhoto = "Profile photo is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      setShowErrors(true);
      return;
    }

    setShowErrors(false);
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      navigation.navigate("DeliveryPartnerReviewSubmit", { formData });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const renderProgressBar = () => (
    <View className="px-6 py-4 bg-white border-b border-gray-200">
      <View className="flex flex-row items-center justify-between mb-2">
        <Text className="text-sm text-gray-600">
          Step {currentStep} of {totalSteps}
        </Text>
        <Text className="text-sm text-gray-600">
          {Math.round((currentStep / totalSteps) * 100)}%
        </Text>
      </View>
      <View className="w-full h-2 bg-gray-200 rounded-full">
        <View
          className="h-2 transition-all duration-300 bg-green-500 rounded-full"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View className="px-6 py-6">
      <Text className="mb-2 text-2xl font-bold">Personal Information</Text>
      <Text className="mb-6 text-gray-600">
        Please verify your personal details
      </Text>

      {/* Pre-filled Fields Notice */}
      <View className="p-4 mb-6 border border-green-200 rounded-lg bg-green-50">
        <View className="flex flex-row items-start">
          <Ionicons name="information-circle" size={20} color="#10b981" />
          <View className="flex-1 ml-3">
            <Text className="mb-1 font-semibold text-green-800">
              Personal Information
            </Text>
            <Text className="text-sm text-green-700">
              Your personal details are pre-filled from your account. To change
              these details, please update them in your Profile Settings.
            </Text>
          </View>
        </View>
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-sm font-medium">First Name *</Text>
        <TextInput
          className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg"
          value={formData.firstName}
          editable={false}
          placeholder="Enter your first name"
        />
        <Text className="mt-1 text-xs text-gray-500">
          Change in Profile Settings
        </Text>
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-sm font-medium">Last Name *</Text>
        <TextInput
          className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg"
          value={formData.lastName}
          editable={false}
          placeholder="Enter your last name"
        />
        <Text className="mt-1 text-xs text-gray-500">
          Change in Profile Settings
        </Text>
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-sm font-medium">Email Address *</Text>
        <TextInput
          className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg"
          value={formData.email}
          editable={false}
          placeholder="Enter your email"
          keyboardType="email-address"
        />
        <Text className="mt-1 text-xs text-gray-500">
          Change in Profile Settings
        </Text>
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-sm font-medium">Phone Number *</Text>
        <TextInput
          className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg"
          value={formData.phone}
          editable={false}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
        />
        <Text className="mt-1 text-xs text-gray-500">
          Change in Profile Settings
        </Text>
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-sm font-medium">Date of Birth *</Text>
        <TextInput
          className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg"
          value={formData.dateOfBirth}
          editable={false}
          placeholder="DD/MM/YYYY"
        />
        <Text className="mt-1 text-xs text-gray-500">
          Change in Profile Settings
        </Text>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View className="px-6 py-6">
      <Text className="mb-2 text-2xl font-bold">Vehicle & License Details</Text>
      <Text className="mb-6 text-gray-600">
        Provide your vehicle and license information
      </Text>

      {/* Selected Vehicle Type */}
      <View className="p-4 mb-6 border border-green-200 rounded-lg bg-green-50">
        <Text className="mb-1 font-semibold text-green-800">
          Selected Vehicle Type
        </Text>
        <Text className="text-green-700 capitalize">
          {vehicleType.replace("_", " ")}
        </Text>
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-sm font-medium">
          Driver's License Number *
        </Text>
        <TextInput
          className={`w-full p-3 border rounded-lg ${errors.licenseNumber && showErrors ? "border-red-500 bg-red-50" : "border-gray-300"}`}
          value={formData.licenseNumber}
          onChangeText={(value) => updateFormData("licenseNumber", value)}
          placeholder="Enter your license number"
        />
        {errors.licenseNumber && showErrors && (
          <Text className="mt-1 text-sm text-red-500">
            {errors.licenseNumber}
          </Text>
        )}
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-sm font-medium">
          Vehicle Registration Number *
        </Text>
        <TextInput
          className={`w-full p-3 border rounded-lg ${errors.vehicleRegistration && showErrors ? "border-red-500 bg-red-50" : "border-gray-300"}`}
          value={formData.vehicleRegistration}
          onChangeText={(value) => updateFormData("vehicleRegistration", value)}
          placeholder="Enter vehicle registration number"
        />
        {errors.vehicleRegistration && showErrors && (
          <Text className="mt-1 text-sm text-red-500">
            {errors.vehicleRegistration}
          </Text>
        )}
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-sm font-medium">Vehicle Make *</Text>
        <TextInput
          className={`w-full p-3 border rounded-lg ${errors.vehicleMake && showErrors ? "border-red-500 bg-red-50" : "border-gray-300"}`}
          value={formData.vehicleMake}
          onChangeText={(value) => updateFormData("vehicleMake", value)}
          placeholder="e.g., Honda, Toyota, Yamaha"
        />
        {errors.vehicleMake && showErrors && (
          <Text className="mt-1 text-sm text-red-500">
            {errors.vehicleMake}
          </Text>
        )}
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-sm font-medium">Vehicle Model *</Text>
        <TextInput
          className={`w-full p-3 border rounded-lg ${errors.vehicleModel && showErrors ? "border-red-500 bg-red-50" : "border-gray-300"}`}
          value={formData.vehicleModel}
          onChangeText={(value) => updateFormData("vehicleModel", value)}
          placeholder="e.g., Civic, Vios, Wave"
        />
        {errors.vehicleModel && showErrors && (
          <Text className="mt-1 text-sm text-red-500">
            {errors.vehicleModel}
          </Text>
        )}
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-sm font-medium">Vehicle Year *</Text>
        <TextInput
          className={`w-full p-3 border rounded-lg ${errors.vehicleYear && showErrors ? "border-red-500 bg-red-50" : "border-gray-300"}`}
          value={formData.vehicleYear}
          onChangeText={(value) => updateFormData("vehicleYear", value)}
          placeholder="e.g., 2020"
          keyboardType="numeric"
        />
        {errors.vehicleYear && showErrors && (
          <Text className="mt-1 text-sm text-red-500">
            {errors.vehicleYear}
          </Text>
        )}
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-sm font-medium">Vehicle Color</Text>
        <TextInput
          className="w-full p-3 border border-gray-300 rounded-lg"
          value={formData.vehicleColor}
          onChangeText={(value) => updateFormData("vehicleColor", value)}
          placeholder="e.g., Red, Blue, White"
        />
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-sm font-medium">Company/Partnership *</Text>
        <Text className="mb-2 text-xs text-gray-500">
          Are you working independently or with a delivery company?
        </Text>
        <TextInput
          className={`w-full p-3 border rounded-lg ${errors.companyName && showErrors ? "border-red-500 bg-red-50" : "border-gray-300"}`}
          value={formData.companyName}
          onChangeText={(value) => updateFormData("companyName", value)}
          placeholder="e.g., Independent, Grab, Foodpanda, etc."
        />
        {errors.companyName && showErrors && (
          <Text className="mt-1 text-sm text-red-500">
            {errors.companyName}
          </Text>
        )}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View className="px-6 py-6">
      <Text className="mb-2 text-2xl font-bold">Emergency Contact</Text>
      <Text className="mb-6 text-gray-600">
        Provide emergency contact information for safety purposes
      </Text>

      <View className="mb-4">
        <Text className="mb-2 text-sm font-medium">
          Emergency Contact Name *
        </Text>
        <TextInput
          className={`w-full p-3 border rounded-lg ${errors.emergencyContactName && showErrors ? "border-red-500 bg-red-50" : "border-gray-300"}`}
          value={formData.emergencyContactName}
          onChangeText={(value) =>
            updateFormData("emergencyContactName", value)
          }
          placeholder="Enter emergency contact name"
        />
        {errors.emergencyContactName && showErrors && (
          <Text className="mt-1 text-sm text-red-500">
            {errors.emergencyContactName}
          </Text>
        )}
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-sm font-medium">
          Emergency Contact Phone *
        </Text>
        <TextInput
          className={`w-full p-3 border rounded-lg ${errors.emergencyContactPhone && showErrors ? "border-red-500 bg-red-50" : "border-gray-300"}`}
          value={formData.emergencyContactPhone}
          onChangeText={(value) =>
            updateFormData("emergencyContactPhone", value)
          }
          placeholder="Enter emergency contact phone"
          keyboardType="phone-pad"
        />
        {errors.emergencyContactPhone && showErrors && (
          <Text className="mt-1 text-sm text-red-500">
            {errors.emergencyContactPhone}
          </Text>
        )}
      </View>

      <View className="mb-6">
        <Text className="mb-2 text-sm font-medium">Relationship *</Text>
        <TextInput
          className={`w-full p-3 border rounded-lg ${errors.emergencyContactRelation && showErrors ? "border-red-500 bg-red-50" : "border-gray-300"}`}
          value={formData.emergencyContactRelation}
          onChangeText={(value) =>
            updateFormData("emergencyContactRelation", value)
          }
          placeholder="e.g., Spouse, Parent, Sibling"
        />
        {errors.emergencyContactRelation && showErrors && (
          <Text className="mt-1 text-sm text-red-500">
            {errors.emergencyContactRelation}
          </Text>
        )}
      </View>

      <View className="p-4 border border-blue-200 rounded-lg bg-blue-50">
        <View className="flex flex-row items-start">
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
          <Text className="ml-2 text-sm text-blue-700">
            This information will only be used in case of emergencies during
            delivery operations. Your emergency contact will not receive
            marketing communications.
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View className="px-6 py-6">
      <Text className="mb-2 text-2xl font-bold">Document Upload</Text>
      <Text className="mb-6 text-gray-600">
        Upload required documents for verification
      </Text>

      {/* Driver's License */}
      <View className="mb-6">
        <Text className="mb-2 text-sm font-medium">Driver's License *</Text>
        <Text className="mb-3 text-xs text-gray-500">
          Upload a clear photo of your valid driver's license
        </Text>

        <TouchableOpacity
          className="w-full p-4 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50"
          onPress={() => showUploadOptions("driversLicense")}
        >
          <View className="items-center">
            {formData.driversLicense ? (
              <Text className="mt-2 text-gray-600">
                {formData.driversLicense.name || "Uploaded"}
              </Text>
            ) : (
              <>
                <Ionicons
                  name="cloud-upload-outline"
                  size={40}
                  color="#6b7280"
                />
                <Text className="mt-2 text-gray-600">
                  Tap to upload license
                </Text>
                <Text className="mt-1 text-xs text-gray-500">
                  PDF, JPG, PNG (Max 5MB)
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>
        {errors.driversLicense && showErrors && (
          <Text className="mt-1 text-sm text-red-500">
            {errors.driversLicense}
          </Text>
        )}
      </View>

      {/* Vehicle Registration */}
      <View className="mb-6">
        <Text className="mb-2 text-sm font-medium">Vehicle Registration *</Text>
        <Text className="mb-3 text-xs text-gray-500">
          Upload your vehicle registration certificate (OR/CR)
        </Text>

        <TouchableOpacity
          className="w-full p-4 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50"
          onPress={() => showUploadOptions("vehicleRegistrationDoc")}
        >
          <View className="items-center">
            {formData.vehicleRegistrationDoc ? (
              <Text className="mt-2 text-gray-600">
                {formData.vehicleRegistrationDoc.name || "Uploaded"}
              </Text>
            ) : (
              <>
                <Ionicons name="document-outline" size={40} color="#6b7280" />
                <Text className="mt-2 text-gray-600">
                  Tap to upload registration
                </Text>
                <Text className="mt-1 text-xs text-gray-500">
                  PDF, JPG, PNG (Max 5MB)
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>
        {errors.vehicleRegistrationDoc && showErrors && (
          <Text className="mt-1 text-sm text-red-500">
            {errors.vehicleRegistrationDoc}
          </Text>
        )}
      </View>

      {/* Profile Photo */}
      <View className="mb-6">
        <Text className="mb-2 text-sm font-medium">Profile Photo *</Text>
        <Text className="mb-3 text-xs text-gray-500">
          Take a clear photo of yourself for your delivery profile
        </Text>

        <TouchableOpacity
          className="w-full p-4 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50"
          onPress={() => showUploadOptions("profilePhoto", "camera")}
        >
          <View className="items-center">
            {formData.profilePhoto ? (
              <Text className="mt-2 text-gray-600">
                {formData.profilePhoto.name || "Uploaded"}
              </Text>
            ) : (
              <>
                <Ionicons name="camera-outline" size={40} color="#6b7280" />
                <Text className="mt-2 text-gray-600">Take profile photo</Text>
                <Text className="mt-1 text-xs text-gray-500">
                  JPG, PNG (Max 5MB)
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>
        {errors.profilePhoto && showErrors && (
          <Text className="mt-1 text-sm text-red-500">
            {errors.profilePhoto}
          </Text>
        )}
      </View>

      {/* Insurance (Optional) */}
      <View className="mb-6">
        <Text className="mb-2 text-sm font-medium">
          Vehicle Insurance (Optional)
        </Text>
        <Text className="mb-3 text-xs text-gray-500">
          Upload your vehicle insurance certificate if available
        </Text>

        <TouchableOpacity
          className="w-full p-4 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50"
          onPress={() => showUploadOptions("insurance")}
        >
          <View className="items-center">
            {formData.insurance ? (
              <Text className="mt-2 text-gray-600">
                {formData.insurance.name || "Uploaded"}
              </Text>
            ) : (
              <>
                <Ionicons name="shield-outline" size={40} color="#6b7280" />
                <Text className="mt-2 text-gray-600">
                  Upload insurance certificate
                </Text>
                <Text className="mt-1 text-xs text-gray-500">
                  PDF, JPG, PNG (Max 5MB)
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <View className="p-4 border border-green-200 rounded-lg bg-green-50">
        <View className="flex flex-row items-start">
          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          <Text className="ml-2 text-sm text-green-700">
            All documents are reviewed within 24-48 hours. You'll be notified
            once verification is complete.
          </Text>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold">
          Delivery Partner Registration
        </Text>
        <View className="w-6" />
      </View>

      {renderProgressBar()}

      <ScrollView className="flex-1">{renderCurrentStep()}</ScrollView>

      {/* Bottom Navigation */}
      <View className="px-6 py-4 bg-white border-t border-gray-200">
        <View className="flex flex-row gap-3">
          {currentStep > 1 && (
            <TouchableOpacity
              className="flex-1 py-4 border border-gray-300 rounded-lg"
              onPress={handleBack}
            >
              <Text className="font-semibold text-center">Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            className="flex-1 py-4 bg-green-500 rounded-lg"
            onPress={handleNext}
          >
            <Text className="font-semibold text-center text-white">
              {currentStep === totalSteps ? "Review & Submit" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default DeliveryPartnerRegistrationFormScreen;
