"use client";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useAuth } from "../../../context/AuthContext";

const SellerRegistrationFormScreen = ({ navigation, route }) => {
  const { user } = useAuth();

  const { accountType } = route.params;
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Form state
  const [formData, setFormData] = useState({
    // Personal/Business Details
    firstName: user.first_name,
    lastName: user.last_name,
    businessName: "",
    businessRegNumber: "",
    businessType: "",
    contactPerson: "",
    email: user.email,
    phone: user.phone,
    dateOfBirth: "",
    businessAddress: "",

    // Address Details
    pickupAddress: "",
    returnAddress: "",
    storeLocation: "",

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
  });

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
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
          className="h-2 transition-all duration-300 bg-blue-500 rounded-full"
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

      {accountType === "individual" ? (
        <>
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium">First Name *</Text>
            <TextInput
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={formData.firstName}
              onChangeText={(value) => updateFormData("firstName", value)}
              placeholder="Enter your first name"
            />
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium">Last Name *</Text>
            <TextInput
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={formData.lastName}
              onChangeText={(value) => updateFormData("lastName", value)}
              placeholder="Enter your last name"
            />
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium">Date of Birth *</Text>
            <TextInput
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={formData.dateOfBirth}
              onChangeText={(value) => updateFormData("dateOfBirth", value)}
              placeholder="DD/MM/YYYY"
            />
          </View>
        </>
      ) : (
        <>
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium">Business Name *</Text>
            <TextInput
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={formData.businessName}
              onChangeText={(value) => updateFormData("businessName", value)}
              placeholder="Enter your business name"
            />
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium">
              Business Registration Number *
            </Text>
            <TextInput
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={formData.businessRegNumber}
              onChangeText={(value) =>
                updateFormData("businessRegNumber", value)
              }
              placeholder="Enter registration number"
            />
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium">Contact Person *</Text>
            <TextInput
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={formData.contactPerson}
              onChangeText={(value) => updateFormData("contactPerson", value)}
              placeholder="Enter contact person name"
            />
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium">Business Address *</Text>
            <TextInput
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={formData.businessAddress}
              onChangeText={(value) => updateFormData("businessAddress", value)}
              placeholder="Enter business address"
              multiline
              numberOfLines={3}
            />
          </View>
        </>
      )}

      <View className="mb-4">
        <Text className="mb-2 text-sm font-medium">Email Address *</Text>
        <TextInput
          className="w-full p-3 border border-gray-300 rounded-lg"
          value={formData.email}
          onChangeText={(value) => updateFormData("email", value)}
          placeholder="Enter your email"
          keyboardType="email-address"
        />
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-sm font-medium">Phone Number *</Text>
        <TextInput
          className="w-full p-3 border border-gray-300 rounded-lg"
          value={formData.phone}
          onChangeText={(value) => updateFormData("phone", value)}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View className="px-6 py-6">
      <Text className="mb-2 text-2xl font-bold">Address Details</Text>
      <Text className="mb-6 text-gray-600">
        Provide your business and shipping addresses
      </Text>

      <View className="mb-4">
        <Text className="mb-2 text-sm font-medium">Pickup Address *</Text>
        <Text className="mb-2 text-xs text-gray-500">
          Where couriers will collect your items
        </Text>
        <TextInput
          className="w-full p-3 border border-gray-300 rounded-lg"
          value={formData.pickupAddress}
          onChangeText={(value) => updateFormData("pickupAddress", value)}
          placeholder="Enter pickup address"
          multiline
          numberOfLines={3}
        />
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-sm font-medium">Return Address *</Text>
        <Text className="mb-2 text-xs text-gray-500">
          Address for returned items
        </Text>
        <TextInput
          className="w-full p-3 border border-gray-300 rounded-lg"
          value={formData.returnAddress}
          onChangeText={(value) => updateFormData("returnAddress", value)}
          placeholder="Enter return address"
          multiline
          numberOfLines={3}
        />
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-sm font-medium">
          Store Location (Optional)
        </Text>
        <Text className="mb-2 text-xs text-gray-500">
          Physical store location for customer pickup
        </Text>
        <TextInput
          className="w-full p-3 border border-gray-300 rounded-lg"
          value={formData.storeLocation}
          onChangeText={(value) => updateFormData("storeLocation", value)}
          placeholder="Enter store location (if applicable)"
          multiline
          numberOfLines={3}
        />
      </View>

      <View className="p-4 border border-blue-200 rounded-lg bg-blue-50">
        <View className="flex flex-row items-start">
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
          <Text className="ml-2 text-sm text-blue-700">
            Make sure your pickup address is accurate as this is where our
            delivery partners will collect your orders.
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View className="px-6 py-6">
      <Text className="mb-2 text-2xl font-bold">Bank & Payment Details</Text>
      <Text className="mb-6 text-gray-600">
        Add your payment information for receiving payments
      </Text>

      <View className="mb-4">
        <Text className="mb-2 text-sm font-medium">Bank Name *</Text>
        <TextInput
          className="w-full p-3 border border-gray-300 rounded-lg"
          value={formData.bankName}
          onChangeText={(value) => updateFormData("bankName", value)}
          placeholder="Enter your bank name"
        />
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-sm font-medium">Account Number *</Text>
        <TextInput
          className="w-full p-3 border border-gray-300 rounded-lg"
          value={formData.accountNumber}
          onChangeText={(value) => updateFormData("accountNumber", value)}
          placeholder="Enter account number"
          keyboardType="numeric"
          secureTextEntry={true}
        />
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-sm font-medium">Account Holder Name *</Text>
        <Text className="mb-2 text-xs text-gray-500">
          Must match the name on your bank account
        </Text>
        <TextInput
          className="w-full p-3 border border-gray-300 rounded-lg"
          value={formData.accountName}
          onChangeText={(value) => updateFormData("accountName", value)}
          placeholder="Enter account holder name"
        />
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-sm font-medium">
          Bank Branch/IFSC Code *
        </Text>
        <TextInput
          className="w-full p-3 border border-gray-300 rounded-lg"
          value={formData.bankCode}
          onChangeText={(value) => updateFormData("bankCode", value)}
          placeholder="Enter IFSC/routing code"
        />
      </View>

      <View className="mb-6">
        <Text className="mb-2 text-sm font-medium">Account Type *</Text>
        <View className="flex flex-row gap-3">
          <TouchableOpacity
            className={`flex-1 p-3 border rounded-lg ${
              formData.accountType === "savings"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300"
            }`}
            onPress={() => updateFormData("accountType", "savings")}
          >
            <Text
              className={`text-center ${formData.accountType === "savings" ? "text-blue-600 font-medium" : "text-gray-700"}`}
            >
              Savings
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 p-3 border rounded-lg ${
              formData.accountType === "current"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300"
            }`}
            onPress={() => updateFormData("accountType", "current")}
          >
            <Text
              className={`text-center ${formData.accountType === "current" ? "text-blue-600 font-medium" : "text-gray-700"}`}
            >
              Current
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
        <View className="flex flex-row items-start">
          <Ionicons name="shield-checkmark" size={20} color="#f59e0b" />
          <Text className="ml-2 text-sm text-yellow-700">
            Your banking information is encrypted and secure. We use this only
            for payment processing.
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

        <TouchableOpacity className="w-full p-4 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50">
          <View className="items-center">
            <Ionicons name="cloud-upload-outline" size={40} color="#6b7280" />
            <Text className="mt-2 text-gray-600">Tap to upload document</Text>
            <Text className="mt-1 text-xs text-gray-500">
              PDF, JPG, PNG (Max 5MB)
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Selfie with ID */}
      <View className="mb-6">
        <Text className="mb-2 text-sm font-medium">Selfie with ID *</Text>
        <Text className="mb-3 text-xs text-gray-500">
          Take a clear photo holding your ID next to your face
        </Text>

        <TouchableOpacity className="w-full p-4 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50">
          <View className="items-center">
            <Ionicons name="camera-outline" size={40} color="#6b7280" />
            <Text className="mt-2 text-gray-600">Take selfie with ID</Text>
            <Text className="mt-1 text-xs text-gray-500">
              JPG, PNG (Max 5MB)
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Business Documents (if business account) */}
      {accountType === "business" && (
        <View className="mb-6">
          <Text className="mb-2 text-sm font-medium">Business Documents</Text>
          <Text className="mb-3 text-xs text-gray-500">
            Tax certificate, business license, or incorporation documents
          </Text>

          <TouchableOpacity className="w-full p-4 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50">
            <View className="items-center">
              <Ionicons name="document-outline" size={40} color="#6b7280" />
              <Text className="mt-2 text-gray-600">
                Upload business documents
              </Text>
              <Text className="mt-1 text-xs text-gray-500">
                PDF, JPG, PNG (Max 5MB each)
              </Text>
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

        <TouchableOpacity className="w-full p-4 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50">
          <View className="items-center">
            <Ionicons name="receipt-outline" size={40} color="#6b7280" />
            <Text className="mt-2 text-gray-600">Upload bank statement</Text>
            <Text className="mt-1 text-xs text-gray-500">PDF (Max 5MB)</Text>
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
    const categories = [
      "Electronics",
      "Fashion",
      "Home & Garden",
      "Sports",
      "Books",
      "Beauty",
      "Automotive",
      "Toys",
      "Food",
      "Health",
    ];

    const shippingOptions = [
      { id: "standard", name: "Standard Shipping (3-5 days)", selected: false },
      { id: "express", name: "Express Shipping (1-2 days)", selected: false },
      { id: "overnight", name: "Overnight Shipping", selected: false },
      { id: "pickup", name: "Customer Pickup", selected: false },
    ];

    return (
      <View className="px-6 py-6">
        <Text className="mb-2 text-2xl font-bold">Store Profile</Text>
        <Text className="mb-6 text-gray-600">
          Set up your store information and policies
        </Text>

        <View className="mb-4">
          <Text className="mb-2 text-sm font-medium">Store Name *</Text>
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={formData.storeName}
            onChangeText={(value) => updateFormData("storeName", value)}
            placeholder="Enter your store name"
          />
        </View>

        <View className="mb-4">
          <Text className="mb-2 text-sm font-medium">Store Logo</Text>
          <TouchableOpacity className="items-center justify-center w-24 h-24 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50">
            <Ionicons name="image-outline" size={30} color="#6b7280" />
            <Text className="mt-1 text-xs text-gray-500">Upload</Text>
          </TouchableOpacity>
        </View>

        <View className="mb-4">
          <Text className="mb-2 text-sm font-medium">Store Description *</Text>
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={formData.storeDescription}
            onChangeText={(value) => updateFormData("storeDescription", value)}
            placeholder="Describe your store and what you sell..."
            multiline
            numberOfLines={4}
          />
        </View>

        <View className="mb-4">
          <Text className="mb-2 text-sm font-medium">Product Categories *</Text>
          <Text className="mb-3 text-xs text-gray-500">
            Select categories you plan to sell in
          </Text>
          <View className="flex flex-row flex-wrap gap-2">
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                className={`px-3 py-2 border rounded-full ${
                  formData.categories.includes(category)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 bg-white"
                }`}
                onPress={() => {
                  const updatedCategories = formData.categories.includes(
                    category
                  )
                    ? formData.categories.filter((c) => c !== category)
                    : [...formData.categories, category];
                  updateFormData("categories", updatedCategories);
                }}
              >
                <Text
                  className={`text-sm ${formData.categories.includes(category) ? "text-blue-600" : "text-gray-700"}`}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mb-4">
          <Text className="mb-2 text-sm font-medium">
            Return/Refund Policy *
          </Text>
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={formData.returnPolicy}
            onChangeText={(value) => updateFormData("returnPolicy", value)}
            placeholder="e.g., 30-day return policy, no questions asked..."
            multiline
            numberOfLines={3}
          />
        </View>

        <View className="mb-6">
          <Text className="mb-2 text-sm font-medium">Shipping Options *</Text>
          <Text className="mb-3 text-xs text-gray-500">
            Select shipping methods you'll offer
          </Text>
          {shippingOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              className="flex flex-row items-center p-3 mb-2 border border-gray-200 rounded-lg"
              onPress={() => {
                const updatedOptions = formData.shippingOptions.includes(
                  option.id
                )
                  ? formData.shippingOptions.filter((o) => o !== option.id)
                  : [...formData.shippingOptions, option.id];
                updateFormData("shippingOptions", updatedOptions);
              }}
            >
              <View
                className={`w-5 h-5 border-2 rounded mr-3 ${
                  formData.shippingOptions.includes(option.id)
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-300"
                }`}
              >
                {formData.shippingOptions.includes(option.id) && (
                  <Ionicons name="checkmark" size={12} color="white" />
                )}
              </View>
              <Text className="flex-1">{option.name}</Text>
            </TouchableOpacity>
          ))}
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
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
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
            className="flex-1 py-4 bg-blue-500 rounded-lg"
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

export default SellerRegistrationFormScreen;
