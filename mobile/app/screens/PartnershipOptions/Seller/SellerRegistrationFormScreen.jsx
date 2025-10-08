"use client";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Pressable,
  Modal,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

import { useAuth } from "../../../context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";

const SellerRegistrationFormScreen = ({ navigation, route }) => {
  const { user } = useAuth();

  const { accountType } = route.params;
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [currentTimeField, setCurrentTimeField] = useState(null);
  const [selectedHour, setSelectedHour] = useState("08");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [selectedPeriod, setSelectedPeriod] = useState("AM"); // Add this

  // Form state
  const [formData, setFormData] = useState({
    // Personal/Business Details
    firstName: "",
    lastName: "",
    businessName: "",
    businessRegNumber: "",
    businessType: "",
    contactPerson: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    businessAddress: "",

    // Address Details - New structure
    addresses: {
      pickup: null,
      return: null,
      store: null,
    },

    // Bank Details
    bankName: "",
    accountNumber: "",
    accountName: "",
    bankCode: "",
    accountType: "",

    // Store Profile
    storeName: "",
    storeDescription: "",
    categories: [],
    returnPolicy: "",
    shippingOptions: [],

    weekdayOpeningTime: "",
    weekdayClosingTime: "",
    weekendOpeningTime: "",
    weekendClosingTime: "",

    // Document uploads
    governmentId: null,
    selfieWithId: null,
    businessDocuments: null,
    bankStatement: null,
    storeLogo: null,
  });

  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setFormData((prev) => ({
        ...prev,
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        dateOfBirth: user.birth_date || "",
      }));
      setShowErrors(false);
    }, [user])
  );

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to upload images!");
      return false;
    }

    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus.status !== "granted") {
      alert("Sorry, we need camera permissions to take photos!");
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
          alert("File size must be less than 5MB");
          return;
        }
        updateFormData(field, file);
      }
    } catch (error) {
      console.error("Error picking document:", error);
      alert("Error selecting document");
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
      alert("Error taking photo");
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
      alert("Error selecting image");
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
      if (accountType === "individual") {
        // Exclude disabled fields from validation
        if (!formData.firstName.trim())
          newErrors.firstName = "First name is required";
        if (!formData.lastName.trim())
          newErrors.lastName = "Last name is required";
        if (!formData.dateOfBirth.trim())
          newErrors.dateOfBirth = "Date of birth is required";
      } else {
        if (!formData.businessName.trim())
          newErrors.businessName = "Business name is required";
        if (!formData.businessRegNumber.trim())
          newErrors.businessRegNumber = "Registration number is required";
        if (!formData.contactPerson.trim())
          newErrors.contactPerson = "Contact person is required";
        if (!formData.businessAddress.trim())
          newErrors.businessAddress = "Business address is required";
      }
      if (!formData.email.trim()) newErrors.email = "Email is required";
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    }

    if (currentStep === 2) {
      if (!formData.addresses?.pickup)
        newErrors.pickupAddress = "Pickup address is required";
      if (!formData.addresses?.return)
        newErrors.returnAddress = "Return address is required";
      if (!formData.addresses?.store)
        newErrors.storeLocation = "Store location is required";
    }

    if (currentStep === 3) {
      if (!formData.governmentId)
        newErrors.governmentId = "Government ID is required";
      if (!formData.selfieWithId)
        newErrors.selfieWithId = "Selfie with ID is required";
    }

    if (currentStep === 4) {
      if (!formData.storeName.trim())
        newErrors.storeName = "Store name is required";
      if (!formData.storeDescription.trim())
        newErrors.storeDescription = "Store description is required";

      // Check if weekday hours are partially filled
      const hasWeekdayOpening = formData.weekdayOpeningTime?.trim();
      const hasWeekdayClosing = formData.weekdayClosingTime?.trim();
      const weekdayPartiallyFilled = hasWeekdayOpening || hasWeekdayClosing;
      const weekdayCompletelyFilled = hasWeekdayOpening && hasWeekdayClosing;

      // Check if weekend hours are partially filled
      const hasWeekendOpening = formData.weekendOpeningTime?.trim();
      const hasWeekendClosing = formData.weekendClosingTime?.trim();
      const weekendPartiallyFilled = hasWeekendOpening || hasWeekendClosing;
      const weekendCompletelyFilled = hasWeekendOpening && hasWeekendClosing;

      // If weekday is partially filled, both fields must be filled
      if (weekdayPartiallyFilled && !weekdayCompletelyFilled) {
        if (!hasWeekdayOpening) {
          newErrors.weekdayOpeningTime = "Please complete weekday hours";
        }
        if (!hasWeekdayClosing) {
          newErrors.weekdayClosingTime = "Please complete weekday hours";
        }
      }

      // If weekend is partially filled, both fields must be filled
      if (weekendPartiallyFilled && !weekendCompletelyFilled) {
        if (!hasWeekendOpening) {
          newErrors.weekendOpeningTime = "Please complete weekend hours";
        }
        if (!hasWeekendClosing) {
          newErrors.weekendClosingTime = "Please complete weekend hours";
        }
      }

      // At least one complete set (weekday OR weekend) must be filled
      if (!weekdayCompletelyFilled && !weekendCompletelyFilled) {
        newErrors.weekdayOpeningTime = "At least one set of hours required";
        newErrors.weekdayClosingTime = "At least one set of hours required";
        newErrors.weekendOpeningTime = "At least one set of hours required";
        newErrors.weekendClosingTime = "At least one set of hours required";

        if (formData.storeName.trim() && formData.storeDescription.trim())
          Alert.alert(
            "Incomplete Store Hours",
            "Please provide at least one complete set of operating hours (either weekday or weekend hours with both opening and closing times)."
          );
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const changeInProfileAlert = (nextAlert = false) => {
    Alert.alert(
      `${nextAlert ? "All fields required!" : "Notice"}`,
      `${!nextAlert ? "Your personal details are pre-filled from your account. " : ""}To change these details, please update them in your Profile Settings.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Go to Profile Settings",
          onPress: () => navigation.navigate("Profile"),
        },
      ]
    );
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      setShowErrors(true);

      if (currentStep === 1) {
        changeInProfileAlert(true);
      }

      return;
    }

    setShowErrors(false);
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      navigation.navigate("SellerReviewSubmit", { formData, accountType });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const formatTimeTo12Hour = (time24) => {
    if (!time24 || !time24.includes(":")) return "";

    const [hour24, minute] = time24.split(":");
    const hourNum = parseInt(hour24);

    let hour12 = hourNum % 12;
    if (hour12 === 0) hour12 = 12;
    const period = hourNum >= 12 ? "PM" : "AM";

    return `${hour12.toString().padStart(2, "0")}:${minute} ${period}`;
  };

  const openTimePicker = (fieldName, currentValue) => {
    setCurrentTimeField(fieldName);

    // Parse existing time or use defaults
    if (currentValue && currentValue.includes(":")) {
      const [hour24, minute] = currentValue.split(":");
      const hourNum = parseInt(hour24);

      // Convert 24-hour to 12-hour format
      let hour12 = hourNum % 12;
      if (hour12 === 0) hour12 = 12;
      const period = hourNum >= 12 ? "PM" : "AM";

      setSelectedHour(hour12.toString().padStart(2, "0"));
      setSelectedMinute(minute.padStart(2, "0"));
      setSelectedPeriod(period);
    } else {
      setSelectedHour("08");
      setSelectedMinute("00");
      setSelectedPeriod("AM");
    }

    setTimePickerVisible(true);
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
          className="h-2 transition-all duration-300 bg-primary rounded-full"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View className="px-6 py-6">
      <Text className="mb-2 text-2xl font-bold">
        {accountType === "individual" ? "Personal Details" : "Business Details"}
      </Text>
      <Text className="mb-6 text-gray-600">
        Please provide your{" "}
        {accountType === "individual" ? "personal" : "business"} information
      </Text>

      {/* Identity Verification Warning */}
      <View className="p-4 mb-6 border rounded-lg bg-amber-50 border-amber-200">
        <View className="flex flex-row items-start">
          <Ionicons name="warning" size={20} color="#f59e0b" />
          <View className="flex-1 ml-3">
            <Text className="mb-1 font-semibold text-amber-800">
              Important Notice
            </Text>
            <Text className="text-sm text-amber-700">
              Please ensure all information matches your real identity details
              exactly as they appear on your official documents. This
              information will be verified against the documents you submit in
              the next steps.
            </Text>
          </View>
        </View>
      </View>

      {/* Pre-filled Fields Notice */}
      <View className="p-4 mb-6 border border-orange-200 rounded-lg bg-orange-50">
        <View className="flex flex-row items-start">
          <Ionicons name="information-circle" size={20} color="#F16B44" />
          <View className="flex-1 ml-3">
            <Text className="mb-1 font-semibold text-primary">
              Personal Information
            </Text>
            <Text className="text-sm text-primary">
              Your personal details are pre-filled from your account. To change
              these details, please update them in your Profile Settings.
            </Text>
          </View>
        </View>
      </View>

      {accountType === "individual" ? (
        <>
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium">First Name *</Text>
            <Pressable onPress={() => changeInProfileAlert()}>
              <TextInput
                className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg"
                value={formData.firstName}
                editable={false}
                placeholder="Enter your first name"
              />
            </Pressable>
            <Text className="mt-1 text-xs text-gray-500">
              Change in Profile Settings
            </Text>
            {errors.firstName && showErrors && (
              <Text className="mt-1 text-sm text-red-500">
                {errors.firstName}
              </Text>
            )}
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium">Last Name *</Text>
            <Pressable onPress={() => changeInProfileAlert()}>
              <TextInput
                className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg"
                value={formData.lastName}
                editable={false}
                placeholder="Enter your last name"
              />
            </Pressable>
            <Text className="mt-1 text-xs text-gray-500">
              Change in Profile Settings
            </Text>
            {errors.lastName && showErrors && (
              <Text className="mt-1 text-sm text-red-500">
                {errors.lastName}
              </Text>
            )}
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium">Date of Birth *</Text>
            <Pressable onPress={() => changeInProfileAlert()}>
              <TextInput
                className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg"
                value={formData.dateOfBirth}
                editable={false}
                placeholder="DD/MM/YYYY"
              />
            </Pressable>
            <Text className="mt-1 text-xs text-gray-500">
              Change in Profile Settings
            </Text>
            {errors.dateOfBirth && showErrors && (
              <Text className="mt-1 text-sm text-red-500">
                {errors.dateOfBirth}
              </Text>
            )}
          </View>
        </>
      ) : (
        <>
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium">Business Name *</Text>
            <TextInput
              className={`w-full p-3 border rounded-lg ${errors.businessName && showErrors ? "border-red-500 bg-red-50" : "border-gray-300"}`}
              value={formData.businessName}
              onChangeText={(value) => updateFormData("businessName", value)}
              placeholder="Enter your business name"
            />
            {errors.businessName && showErrors && (
              <Text className="mt-1 text-sm text-red-500">
                {errors.businessName}
              </Text>
            )}
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium">
              Business Registration Number *
            </Text>
            <TextInput
              className={`w-full p-3 border rounded-lg ${errors.businessRegNumber && showErrors ? "border-red-500 bg-red-50" : "border-gray-300"}`}
              value={formData.businessRegNumber}
              onChangeText={(value) =>
                updateFormData("businessRegNumber", value)
              }
              placeholder="Enter registration number"
            />
            {errors.businessRegNumber && showErrors && (
              <Text className="mt-1 text-sm text-red-500">
                {errors.businessRegNumber}
              </Text>
            )}
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium">Contact Person *</Text>
            <TextInput
              className={`w-full p-3 border rounded-lg ${errors.contactPerson && showErrors ? "border-red-500 bg-red-50" : "border-gray-300"}`}
              value={formData.contactPerson}
              onChangeText={(value) => updateFormData("contactPerson", value)}
              placeholder="Enter contact person name"
            />
            {errors.contactPerson && showErrors && (
              <Text className="mt-1 text-sm text-red-500">
                {errors.contactPerson}
              </Text>
            )}
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium">Business Address *</Text>
            <TextInput
              className={`w-full p-3 border rounded-lg ${errors.businessAddress && showErrors ? "border-red-500 bg-red-50" : "border-gray-300"}`}
              value={formData.businessAddress}
              onChangeText={(value) => updateFormData("businessAddress", value)}
              placeholder="Enter business address"
              multiline
              numberOfLines={3}
            />
            {errors.businessAddress && showErrors && (
              <Text className="mt-1 text-sm text-red-500">
                {errors.businessAddress}
              </Text>
            )}
          </View>
        </>
      )}

      <View className="mb-4">
        <Text className="mb-2 text-sm font-medium">Email Address *</Text>
        <Pressable onPress={() => changeInProfileAlert()}>
          <TextInput
            className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg"
            value={formData.email}
            editable={false}
            placeholder="Enter your email"
            keyboardType="email-address"
          />
        </Pressable>
        <Text className="mt-1 text-xs text-gray-500">
          Change in Profile Settings
        </Text>
        {errors.email && showErrors && (
          <Text className="mt-1 text-sm text-red-500">{errors.email}</Text>
        )}
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-sm font-medium">Phone Number *</Text>
        <Pressable onPress={() => changeInProfileAlert()}>
          <TextInput
            className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg"
            value={formData.phone}
            editable={false}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />
        </Pressable>
        <Text className="mt-1 text-xs text-gray-500">
          Change in Profile Settings
        </Text>
        {errors.phone && showErrors && (
          <Text className="mt-1 text-sm text-red-500">{errors.phone}</Text>
        )}
      </View>
    </View>
  );

  const renderAddressCard = (addressType, title, icon) => {
    const address = formData.addresses?.[addressType];

    return (
      <View className="p-4 mb-4 bg-white border border-gray-200 rounded-lg">
        <View className="flex flex-row items-center justify-between mb-3">
          <View className="flex flex-row items-center">
            <Ionicons name={icon} size={20} color="#374151" />
            <Text className="ml-2 text-base font-semibold text-gray-800">
              {title}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("SellerAddressSetup", {
                addressType: addressType,
                existingAddress: address,
                onAddressSet: (addressData) => {
                  setFormData((prev) => ({
                    ...prev,
                    addresses: {
                      ...prev.addresses,
                      [addressType]: addressData,
                    },
                  }));
                },
              })
            }
            className="p-2"
          >
            <Ionicons name="pencil" size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {address ? (
          <View>
            <Text className="text-sm font-medium text-gray-900">
              {address.streetAddress}
            </Text>
            <Text className="text-sm text-gray-600">
              {address.barangay}, {address.city}
            </Text>
            <Text className="text-sm text-gray-600">
              {address.province}, Philippines
            </Text>
          </View>
        ) : (
          <View className="py-4">
            <Text className="text-sm text-center text-gray-500">
              No address set
            </Text>
            <Text className="mt-1 text-xs text-center text-gray-400">
              Tap edit to set address
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderStep2 = () => (
    <View className="px-6 py-6">
      <Text className="mb-2 text-2xl font-bold">Address Details</Text>
      <Text className="mb-6 text-gray-600">
        Set up your business addresses with precise locations
      </Text>

      {/* Pickup Address */}
      <View className="mb-6">
        <Text className="mb-2 text-sm font-medium">Pickup Address *</Text>
        <Text className="mb-3 text-xs text-gray-500">
          Where couriers will collect your items
        </Text>

        {renderAddressCard("pickup", "Pickup Address", "location-outline")}

        {errors.pickupAddress && showErrors && (
          <Text className="mt-1 text-sm text-red-500">
            {errors.pickupAddress}
          </Text>
        )}
      </View>

      {/* Return Address */}
      <View className="mb-6">
        <Text className="mb-2 text-sm font-medium">Return Address *</Text>
        <Text className="mb-3 text-xs text-gray-500">
          Address for returned items
        </Text>

        {renderAddressCard(
          "return",
          "Return Address",
          "return-up-back-outline"
        )}

        {errors.returnAddress && showErrors && (
          <Text className="mt-1 text-sm text-red-500">
            {errors.returnAddress}
          </Text>
        )}
      </View>

      {/* Store Location */}
      <View className="mb-6">
        <Text className="mb-2 text-sm font-medium">Store Location *</Text>
        <Text className="mb-3 text-xs text-gray-500">
          Physical store location for customer pickup
        </Text>

        {renderAddressCard("store", "Store Location", "storefront-outline")}

        {errors.storeLocation && showErrors && (
          <Text className="mt-1 text-sm text-red-500">
            {errors.storeLocation}
          </Text>
        )}
      </View>

      <View className="p-4 border border-blue-200 rounded-lg bg-blue-50">
        <View className="flex flex-row items-start">
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
          <Text className="ml-2 text-sm text-blue-700">
            All addresses will be verified and used for order processing and
            delivery coordination.
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

      {/* Government ID */}
      <View className="mb-6">
        <Text className="mb-2 text-sm font-medium">Government ID *</Text>
        <Text className="mb-3 text-xs text-gray-500">
          {accountType === "individual"
            ? "National ID, Passport, or Driver's License"
            : "Business Registration Certificate"}
        </Text>

        <TouchableOpacity
          className="w-full p-4 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50"
          onPress={() => showUploadOptions("governmentId")}
        >
          <View className="items-center">
            {formData.governmentId ? (
              <Text className="mt-2 text-gray-600">
                {formData.governmentId.name || "Uploaded"}
              </Text>
            ) : (
              <>
                <Ionicons
                  name="cloud-upload-outline"
                  size={40}
                  color="#6b7280"
                />
                <Text className="mt-2 text-gray-600">
                  Tap to upload document
                </Text>
                <Text className="mt-1 text-xs text-gray-500">
                  PDF, JPG, PNG (Max 5MB)
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>
        {errors.governmentId && showErrors && (
          <Text className="mt-1 text-sm text-red-500">
            {errors.governmentId}
          </Text>
        )}
      </View>

      {/* Selfie with ID */}
      <View className="mb-6">
        <Text className="mb-2 text-sm font-medium">Selfie with ID *</Text>
        <Text className="mb-3 text-xs text-gray-500">
          Take a clear photo holding your ID next to your face
        </Text>

        <TouchableOpacity
          className="w-full p-4 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50"
          onPress={() => showUploadOptions("selfieWithId", "camera")}
        >
          <View className="items-center">
            {formData.selfieWithId ? (
              <Text className="mt-2 text-gray-600">
                {formData.selfieWithId.name || "Uploaded"}
              </Text>
            ) : (
              <>
                <Ionicons name="camera-outline" size={40} color="#6b7280" />
                <Text className="mt-2 text-gray-600">Take selfie with ID</Text>
                <Text className="mt-1 text-xs text-gray-500">
                  JPG, PNG (Max 5MB)
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>
        {errors.selfieWithId && showErrors && (
          <Text className="mt-1 text-sm text-red-500">
            {errors.selfieWithId}
          </Text>
        )}
      </View>

      {/* Business Documents (if business account) */}
      {accountType === "business" && (
        <View className="mb-6">
          <Text className="mb-2 text-sm font-medium">Business Documents</Text>
          <Text className="mb-3 text-xs text-gray-500">
            Tax certificate, business license, or incorporation documents
          </Text>

          <TouchableOpacity
            className="w-full p-4 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50"
            onPress={() => showUploadOptions("businessDocuments")}
          >
            <View className="items-center">
              {formData.businessDocuments ? (
                <Text className="mt-2 text-gray-600">
                  {formData.businessDocuments.name || "Uploaded"}
                </Text>
              ) : (
                <>
                  <Ionicons name="document-outline" size={40} color="#6b7280" />
                  <Text className="mt-2 text-gray-600">
                    Upload business documents
                  </Text>
                  <Text className="mt-1 text-xs text-gray-500">
                    PDF, JPG, PNG (Max 5MB each)
                  </Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Bank Statement (Optional) */}
      <View className="mb-6">
        <Text className="mb-2 text-sm font-medium">
          Bank Statement (Optional)
        </Text>
        <Text className="mb-3 text-xs text-gray-500">
          Recent bank statement for account verification
        </Text>

        <TouchableOpacity
          className="w-full p-4 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50"
          onPress={() => showUploadOptions("bankStatement")}
        >
          <View className="items-center">
            {formData.bankStatement ? (
              <Text className="mt-2 text-gray-600">
                {formData.bankStatement.name || "Uploaded"}
              </Text>
            ) : (
              <>
                <Ionicons name="receipt-outline" size={40} color="#6b7280" />
                <Text className="mt-2 text-gray-600">
                  Upload bank statement
                </Text>
                <Text className="mt-1 text-xs text-gray-500">
                  PDF (Max 5MB)
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

  const renderStep5 = () => {
    return (
      <View className="px-6 py-6">
        <Text className="mb-2 text-2xl font-bold">Store Profile</Text>
        <Text className="mb-6 text-gray-600">
          Set up your basic store information
        </Text>

        <View className="mb-4">
          <Text className="mb-2 text-sm font-medium">Store Name *</Text>
          <TextInput
            className={`w-full p-3 border rounded-lg ${errors.storeName && showErrors ? "border-red-500 bg-red-50" : "border-gray-300"}`}
            value={formData.storeName}
            onChangeText={(value) => updateFormData("storeName", value)}
            placeholder="Enter your store name"
          />
          {errors.storeName && showErrors && (
            <Text className="mt-1 text-sm text-red-500">
              {errors.storeName}
            </Text>
          )}
        </View>

        <View className="mb-4">
          <Text className="mb-2 text-sm font-medium">Store Logo</Text>
          <TouchableOpacity
            className="items-center justify-center w-24 h-24 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50"
            onPress={() => showUploadOptions("storeLogo", "image")}
          >
            {formData.storeLogo ? (
              <View className="items-center">
                <Ionicons name="checkmark-circle" size={30} color="#10b981" />
                <Text className="mt-1 text-xs text-green-600">Uploaded</Text>
              </View>
            ) : (
              <>
                <Ionicons name="image-outline" size={30} color="#6b7280" />
                <Text className="mt-1 text-xs text-gray-500">Upload</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View className="mb-6">
          <Text className="mb-2 text-sm font-medium">Store Description *</Text>
          <TextInput
            className={`w-full p-3 border rounded-lg ${errors.storeDescription && showErrors ? "border-red-500 bg-red-50" : "border-gray-300"}`}
            value={formData.storeDescription}
            onChangeText={(value) => updateFormData("storeDescription", value)}
            placeholder="Describe your store and what you sell..."
            multiline
            numberOfLines={4}
          />
          {errors.storeDescription && showErrors && (
            <Text className="mt-1 text-sm text-red-500">
              {errors.storeDescription}
            </Text>
          )}
        </View>

        <View className="mb-4">
          <Text className="mb-3 text-lg font-semibold">
            Store Operating Hours
          </Text>

          {/* Weekday Hours */}
          <View className="p-4 mb-4 border border-gray-200 rounded-lg bg-gray-50">
            <View className="flex flex-row items-center mb-3">
              <Ionicons name="calendar-outline" size={18} color="#374151" />
              <Text className="ml-2 font-medium text-gray-800">
                Weekday Hours (Mon-Fri)
              </Text>
            </View>

            <View className="flex flex-row gap-3">
              {/* Weekday Opening Time */}
              <View className="flex-1">
                <Text className="mb-2 text-xs font-medium text-gray-600">
                  Opening Time *
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    openTimePicker(
                      "weekdayOpeningTime",
                      formData.weekdayOpeningTime
                    )
                  }
                  className={`w-full px-3 py-3 border rounded-lg flex-row items-center justify-between ${
                    errors.weekdayOpeningTime && showErrors
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  <Text
                    className={
                      formData.weekdayOpeningTime
                        ? "text-sm text-gray-800"
                        : "text-sm text-gray-400"
                    }
                  >
                    {formData.weekdayOpeningTime
                      ? formatTimeTo12Hour(formData.weekdayOpeningTime)
                      : "Select time"}
                  </Text>
                  {formData.weekdayOpeningTime ? (
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        updateFormData("weekdayOpeningTime", "");
                      }}
                    >
                      <Ionicons name="close-circle" size={20} color="#6b7280" />
                    </TouchableOpacity>
                  ) : (
                    <Ionicons name="chevron-down" size={20} color="#6b7280" />
                  )}
                </TouchableOpacity>
                {errors.weekdayOpeningTime && showErrors && (
                  <Text className="mt-1 text-xs text-red-500">
                    {errors.weekdayOpeningTime}
                  </Text>
                )}
              </View>

              {/* Weekday Closing Time */}
              <View className="flex-1">
                <Text className="mb-2 text-xs font-medium text-gray-600">
                  Closing Time *
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    openTimePicker(
                      "weekdayClosingTime",
                      formData.weekdayClosingTime
                    )
                  }
                  className={`w-full px-3 py-3 border rounded-lg flex-row items-center justify-between ${
                    errors.weekdayClosingTime && showErrors
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  <Text
                    className={
                      formData.weekdayClosingTime
                        ? "text-sm text-gray-800"
                        : "text-sm text-gray-400"
                    }
                  >
                    {formData.weekdayClosingTime
                      ? formatTimeTo12Hour(formData.weekdayClosingTime)
                      : "Select time"}
                  </Text>
                  {formData.weekdayClosingTime ? (
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        updateFormData("weekdayClosingTime", "");
                      }}
                    >
                      <Ionicons name="close-circle" size={20} color="#6b7280" />
                    </TouchableOpacity>
                  ) : (
                    <Ionicons name="chevron-down" size={20} color="#6b7280" />
                  )}
                </TouchableOpacity>
                {errors.weekdayClosingTime && showErrors && (
                  <Text className="mt-1 text-xs text-red-500">
                    {errors.weekdayClosingTime}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Weekend Hours */}
          <View className="p-4 mb-4 border border-gray-200 rounded-lg bg-gray-50">
            <View className="flex flex-row items-center mb-3">
              <Ionicons name="calendar-outline" size={18} color="#374151" />
              <Text className="ml-2 font-medium text-gray-800">
                Weekend Hours (Sat-Sun)
              </Text>
            </View>

            <View className="flex flex-row gap-3">
              {/* Weekend Opening Time */}
              <View className="flex-1">
                <Text className="mb-2 text-xs font-medium text-gray-600">
                  Opening Time *
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    openTimePicker(
                      "weekendOpeningTime",
                      formData.weekendOpeningTime
                    )
                  }
                  className={`w-full px-3 py-3 border rounded-lg flex-row items-center justify-between ${
                    errors.weekendOpeningTime && showErrors
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  <Text
                    className={
                      formData.weekendOpeningTime
                        ? "text-sm text-gray-800"
                        : "text-sm text-gray-400"
                    }
                  >
                    {formData.weekendOpeningTime
                      ? formatTimeTo12Hour(formData.weekendOpeningTime)
                      : "Select time"}
                  </Text>
                  {formData.weekendOpeningTime ? (
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        updateFormData("weekendOpeningTime", "");
                      }}
                    >
                      <Ionicons name="close-circle" size={20} color="#6b7280" />
                    </TouchableOpacity>
                  ) : (
                    <Ionicons name="chevron-down" size={20} color="#6b7280" />
                  )}
                </TouchableOpacity>
                {errors.weekendOpeningTime && showErrors && (
                  <Text className="mt-1 text-xs text-red-500">
                    {errors.weekendOpeningTime}
                  </Text>
                )}
              </View>

              {/* Weekend Closing Time */}
              <View className="flex-1">
                <Text className="mb-2 text-xs font-medium text-gray-600">
                  Closing Time *
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    openTimePicker(
                      "weekendClosingTime",
                      formData.weekendClosingTime
                    )
                  }
                  className={`w-full px-3 py-3 border rounded-lg flex-row items-center justify-between ${
                    errors.weekendClosingTime && showErrors
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  <Text
                    className={
                      formData.weekendClosingTime
                        ? "text-sm text-gray-800"
                        : "text-sm text-gray-400"
                    }
                  >
                    {formData.weekendClosingTime
                      ? formatTimeTo12Hour(formData.weekendClosingTime)
                      : "Select time"}
                  </Text>
                  {formData.weekendClosingTime ? (
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        updateFormData("weekendClosingTime", "");
                      }}
                    >
                      <Ionicons name="close-circle" size={20} color="#6b7280" />
                    </TouchableOpacity>
                  ) : (
                    <Ionicons name="chevron-down" size={20} color="#6b7280" />
                  )}
                </TouchableOpacity>
                {errors.weekendClosingTime && showErrors && (
                  <Text className="mt-1 text-xs text-red-500">
                    {errors.weekendClosingTime}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        <View className="p-4 border border-purple-200 rounded-lg bg-purple-50">
          <View className="flex flex-row items-start">
            <Ionicons name="bulb-outline" size={20} color="#8b5cf6" />
            <Text className="ml-2 text-sm text-purple-700">
              A complete store profile helps customers trust your business and
              increases sales.
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep4(); // Document upload (was step 4)
      case 4:
        return renderStep5(); // Store profile (was step 5)
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
        <Text className="text-xl font-semibold">Seller Registration</Text>
        <View className="w-6" />
      </View>

      {renderProgressBar()}

      <ScrollView className="flex-1">{renderCurrentStep()}</ScrollView>

      {/* Bottom Navigation */}
      <View className="px-6 py-6 bg-primary border-t border-gray-200">
        <View className="flex flex-row gap-3">
          {currentStep > 1 && (
            <TouchableOpacity
              className="flex-1 py-4 border border-white rounded-lg"
              onPress={handleBack}
            >
              <Text className="font-semibold text-center text-white">Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            className="flex-1 py-4 bg-white rounded-lg"
            onPress={handleNext}
          >
            <Text className="font-semibold text-center text-primary">
              {currentStep === totalSteps ? "Review & Submit" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Time Picker Modal - Moved inside return */}
      <Modal
        visible={timePickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setTimePickerVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setTimePickerVisible(false)}
        >
          <View className="justify-end flex-1">
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View className="bg-white rounded-t-3xl">
                {/* Header */}
                <View className="flex flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
                  <TouchableOpacity onPress={() => setTimePickerVisible(false)}>
                    <Text className="text-base text-gray-600">Cancel</Text>
                  </TouchableOpacity>
                  <Text className="text-lg font-semibold">Select Time</Text>

                  <TouchableOpacity
                    onPress={() => {
                      // Convert 12-hour to 24-hour format
                      let hour24 = parseInt(selectedHour);
                      if (selectedPeriod === "PM" && hour24 !== 12) {
                        hour24 += 12;
                      } else if (selectedPeriod === "AM" && hour24 === 12) {
                        hour24 = 0;
                      }
                      const timeValue = `${hour24.toString().padStart(2, "0")}:${selectedMinute}`;

                      // Validation logic
                      let isValid = true;
                      let errorMessage = "";

                      if (currentTimeField === "weekdayOpeningTime") {
                        const closingTime = formData.weekdayClosingTime;
                        if (closingTime && timeValue >= closingTime) {
                          isValid = false;
                          errorMessage =
                            "Opening time must be earlier than closing time";
                        }
                      } else if (currentTimeField === "weekdayClosingTime") {
                        const openingTime = formData.weekdayOpeningTime;
                        if (openingTime && timeValue <= openingTime) {
                          isValid = false;
                          errorMessage =
                            "Closing time must be later than opening time";
                        }
                      } else if (currentTimeField === "weekendOpeningTime") {
                        const closingTime = formData.weekendClosingTime;
                        if (closingTime && timeValue >= closingTime) {
                          isValid = false;
                          errorMessage =
                            "Opening time must be earlier than closing time";
                        }
                      } else if (currentTimeField === "weekendClosingTime") {
                        const openingTime = formData.weekendOpeningTime;
                        if (openingTime && timeValue <= openingTime) {
                          isValid = false;
                          errorMessage =
                            "Closing time must be later than opening time";
                        }
                      }

                      if (!isValid) {
                        Alert.alert("Invalid Time", errorMessage);
                        return;
                      }

                      updateFormData(currentTimeField, timeValue);
                      setTimePickerVisible(false);
                    }}
                  >
                    <Text className="text-base font-semibold text-blue-500">
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Time Display */}
                <View className="items-center py-4 bg-gray-50">
                  <Text className="text-4xl font-bold text-gray-800">
                    {selectedHour}:{selectedMinute} {selectedPeriod}
                  </Text>
                  <Text className="mt-1 text-sm text-gray-500">
                    12-hour format
                  </Text>
                </View>

                {/* Time Picker */}
                <View className="flex flex-row items-center justify-center py-6">
                  {/* Hours Picker */}
                  <View className="flex-1">
                    <Text className="mb-2 text-sm font-medium text-center text-gray-600">
                      Hour
                    </Text>
                    <ScrollView
                      className="h-48"
                      showsVerticalScrollIndicator={false}
                    >
                      {Array.from({ length: 12 }, (_, i) =>
                        (i + 1).toString().padStart(2, "0")
                      ).map((hour) => (
                        <TouchableOpacity
                          key={hour}
                          onPress={() => setSelectedHour(hour)}
                          className={`py-3 ${selectedHour === hour ? "bg-blue-50" : ""}`}
                        >
                          <Text
                            className={`text-center text-lg ${
                              selectedHour === hour
                                ? "font-bold text-blue-500"
                                : "text-gray-600"
                            }`}
                          >
                            {hour}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Separator */}
                  <Text className="px-2 text-2xl font-bold text-gray-400">
                    :
                  </Text>

                  {/* Minutes Picker */}
                  <View className="flex-1">
                    <Text className="mb-2 text-sm font-medium text-center text-gray-600">
                      Minute
                    </Text>
                    <ScrollView
                      className="h-48"
                      showsVerticalScrollIndicator={false}
                    >
                      {Array.from({ length: 60 }, (_, i) =>
                        i.toString().padStart(2, "0")
                      ).map((minute) => (
                        <TouchableOpacity
                          key={minute}
                          onPress={() => setSelectedMinute(minute)}
                          className={`py-3 ${selectedMinute === minute ? "bg-blue-50" : ""}`}
                        >
                          <Text
                            className={`text-center text-lg ${
                              selectedMinute === minute
                                ? "font-bold text-blue-500"
                                : "text-gray-600"
                            }`}
                          >
                            {minute}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Separator */}
                  <Text className="px-2 text-2xl font-bold text-gray-400">
                    {" "}
                  </Text>

                  {/* AM/PM Picker */}
                  <View className="flex-1">
                    <Text className="mb-2 text-sm font-medium text-center text-gray-600">
                      Period
                    </Text>
                    <ScrollView
                      className="h-48"
                      showsVerticalScrollIndicator={false}
                    >
                      {["AM", "PM"].map((period) => (
                        <TouchableOpacity
                          key={period}
                          onPress={() => setSelectedPeriod(period)}
                          className={`py-3 ${selectedPeriod === period ? "bg-blue-50" : ""}`}
                        >
                          <Text
                            className={`text-center text-lg ${
                              selectedPeriod === period
                                ? "font-bold text-blue-500"
                                : "text-gray-600"
                            }`}
                          >
                            {period}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default SellerRegistrationFormScreen;
