"use client";

import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  Alert,
  Image,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

import axios from "axios";

import PersonalizedLoadingAnimation from "../../components/PersonalizedLoadingAnimation";
import Snackbar from "../../components/Snackbar";

import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/apiConfig";

const EditStoreProfileScreen = ({ navigation }) => {
  const { user, token } = useAuth();

  const [storeData, setStoreData] = useState({
    storeName: "",
    storeDescription: "",
    accountType: "",
    contactEmail: "",
    contactPhone: "",
    pickupAddress: "",
    returnAddress: "",
    storeLocation: "",
    storeLogoUrl: null,
  });

  const [originalData, setOriginalData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [snackBarVisible, setSnackBarVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const accountTypes = ["individual", "business"];

  const dayNames = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

  useEffect(() => {
    fetchStoreData();
  }, []);

  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });

    const keyboardDidHide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

  useEffect(() => {
    if (JSON.stringify(storeData) !== JSON.stringify(originalData)) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [storeData, originalData]);

  const fetchStoreData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/seller/store-profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const data = response.data.data;
        setStoreData(data);
        setOriginalData(data);
      }
    } catch (error) {
      console.error("Error fetching store data:", error);
      setMessage({
        message: "Failed to load store data",
        success: false,
      });
      setSnackBarVisible(true);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async () => {
    if (!storeData.storeName.trim()) {
      setMessage({
        message: "Store name is required",
        success: false,
      });
      setSnackBarVisible(true);
      return;
    }

    setLoading(true);
    const startTime = Date.now();
    let responseData;

    try {
      const response = await axios.put(
        `${API_URL}/api/seller/store-profile`,
        storeData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data);
      responseData = response.data;
    } catch (error) {
      console.error(error.response?.data || error);
      responseData = error.response?.data || {
        success: false,
        message: "Failed to update store profile",
      };
    } finally {
      const elapsedTime = Date.now() - startTime;
      const minimumTime = 2000;

      setTimeout(
        () => {
          setLoading(false);
          if (responseData?.success) {
            setOriginalData(storeData);
            setHasChanges(false);
          }
          setMessage(responseData);
          setSnackBarVisible(true);
        },
        Math.max(0, minimumTime - elapsedTime)
      );
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        "Discard Changes",
        "Are you sure you want to discard your changes?",
        [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              setStoreData(originalData);
              navigation.goBack();
            },
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setStoreData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setStoreData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleBusinessHoursChange = (day, field, value) => {
    setStoreData((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value,
        },
      },
    }));
  };

  if (initialLoading) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-300">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold">Edit Store Profile</Text>
          <View style={{ width: 24 }} />
        </View>
        <View className="items-center justify-center flex-1">
          <PersonalizedLoadingAnimation visible={true} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={
        Platform.OS === "android" && !keyboardVisible ? null : "padding"
      }
      keyboardVerticalOffset={0}
    >
      <View className="flex flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-300">
        <TouchableOpacity onPress={handleCancel}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold">Edit Store Profile</Text>
        <TouchableOpacity
          onPress={() => {
            setIsEditing(!isEditing);
            if (isEditing) {
              setStoreData(originalData);
            }
          }}
        >
          <Feather name={isEditing ? "x" : "edit-2"} size={20} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 bg-gray-50">
        {/* Store Logo Section */}
        <View className="items-center py-8 bg-white border-b border-gray-200">
          <View className="relative">
            {storeData.storeLogoUrl ? (
              <Image
                source={{ uri: storeData.storeLogoUrl }}
                className="w-24 h-24 rounded-full"
                style={{ width: 96, height: 96, borderRadius: 48 }}
              />
            ) : (
              <View className="flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full">
                <FontAwesome6 name="store" size={32} color="#3b82f6" />
              </View>
            )}
            <TouchableOpacity className="absolute bottom-0 right-0 p-2 bg-black rounded-full">
              <Feather name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="mt-3 text-sm text-gray-600">
            Tap to change store logo
          </Text>
        </View>

        {/* Basic Information */}
        <View className="p-6 mt-4 bg-white">
          <Text className="mb-6 text-xl font-semibold">Basic Information</Text>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-700">
              Store Name *
            </Text>
            <TextInput
              className={`p-3 text-base border border-gray-300 rounded-lg ${isEditing ? "bg-white" : "bg-gray-100"}`}
              value={storeData.storeName}
              onChangeText={(text) => handleInputChange("storeName", text)}
              placeholder="Enter your store name"
              editable={isEditing}
            />
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-700">
              Store Description
            </Text>
            <TextInput
              className={`p-3 text-base border border-gray-300 rounded-lg ${isEditing ? "bg-white" : "bg-gray-100"}`}
              value={storeData.storeDescription}
              onChangeText={(text) =>
                handleInputChange("storeDescription", text)
              }
              placeholder="Describe your store and products"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={isEditing}
            />
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-700">
              Account Type
            </Text>
            <View className="p-3 bg-gray-100 border border-gray-300 rounded-lg">
              <Text className="text-base text-gray-600 capitalize">
                {storeData.accountType}
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View className="p-6 mt-4 bg-white">
          <Text className="mb-6 text-xl font-semibold">
            Contact Information
          </Text>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-700">
              Contact Email
            </Text>
            <View className="p-3 bg-gray-100 border border-gray-300 rounded-lg">
              <Text className="text-base text-gray-600">
                {storeData.contactEmail}
              </Text>
            </View>
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-700">
              Contact Phone
            </Text>
            <View className="p-3 bg-gray-100 border border-gray-300 rounded-lg">
              <Text className="text-base text-gray-600">
                {storeData.contactPhone}
              </Text>
            </View>
          </View>
        </View>

        {/* Store Addresses */}
        <View className="p-6 mt-4 bg-white">
          <Text className="mb-6 text-xl font-semibold">Store Addresses</Text>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-700">
              Pickup Address
            </Text>
            <TextInput
              className={`p-3 text-base border border-gray-300 rounded-lg ${isEditing ? "bg-white" : "bg-gray-100"}`}
              value={storeData.pickupAddress}
              onChangeText={(text) => handleInputChange("pickupAddress", text)}
              placeholder="Enter pickup address"
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              editable={isEditing}
            />
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-700">
              Return Address
            </Text>
            <TextInput
              className={`p-3 text-base border border-gray-300 rounded-lg ${isEditing ? "bg-white" : "bg-gray-100"}`}
              value={storeData.returnAddress}
              onChangeText={(text) => handleInputChange("returnAddress", text)}
              placeholder="Enter return address"
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              editable={isEditing}
            />
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-700">
              Store Location (Optional)
            </Text>
            <TextInput
              className={`p-3 text-base border border-gray-300 rounded-lg ${isEditing ? "bg-white" : "bg-gray-100"}`}
              value={storeData.storeLocation}
              onChangeText={(text) => handleInputChange("storeLocation", text)}
              placeholder="Enter store location"
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              editable={isEditing}
            />
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>

      {hasChanges && isEditing && (
        <View className="flex flex-row gap-3 p-4 bg-white border-t border-gray-300">
          <TouchableOpacity
            className="flex-1 py-3 bg-gray-200 rounded-lg"
            onPress={handleCancel}
          >
            <Text className="text-lg text-center text-gray-700">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 py-3 bg-blue-600 rounded-lg"
            onPress={handleSave}
          >
            <Text className="text-lg text-center text-white">Save Changes</Text>
          </TouchableOpacity>
        </View>
      )}

      <PersonalizedLoadingAnimation visible={loading} />

      <Snackbar
        visible={snackBarVisible}
        onDismiss={setSnackBarVisible}
        text={message?.message}
      />
    </KeyboardAvoidingView>
  );
};

export default EditStoreProfileScreen;
