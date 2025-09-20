"use client";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from "react-native";
import { useState, useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { API_URL } from "../../config/apiConfig";
import { StatusBar } from "expo-status-bar";

const EditDeliveryPartnerProfileScreen = ({ route, navigation }) => {
  const { token } = useAuth();
  const { deliveryPartnerProfile, onProfileUpdate } = route.params;

  const [formData, setFormData] = useState({
    vehicle_make: "",
    vehicle_model: "",
    vehicle_year: "",
    vehicle_color: "",
    company_name: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relation: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (deliveryPartnerProfile) {
      setFormData({
        vehicle_make: deliveryPartnerProfile.vehicle_make || "",
        vehicle_model: deliveryPartnerProfile.vehicle_model || "",
        vehicle_year: deliveryPartnerProfile.vehicle_year || "",
        vehicle_color: deliveryPartnerProfile.vehicle_color || "",
        company_name: deliveryPartnerProfile.company_name || "",
        emergency_contact_name:
          deliveryPartnerProfile.emergency_contact_name || "",
        emergency_contact_phone:
          deliveryPartnerProfile.emergency_contact_phone || "",
        emergency_contact_relation:
          deliveryPartnerProfile.emergency_contact_relation || "",
      });
    }
  }, [deliveryPartnerProfile]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const response = await axios.put(
        `${API_URL}/api/delivery-partner/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        Alert.alert("Success", "Profile updated successfully", [
          {
            text: "OK",
            onPress: () => {
              if (onProfileUpdate) {
                onProfileUpdate();
              }
              navigation.goBack();
            },
          },
        ]);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangeProfilePicture = () => {
    Alert.alert(
      "Change Profile Picture",
      "This feature will be available soon!",
      [{ text: "OK" }]
    );
  };

  return (
    <>
      <StatusBar style="dark" />
      {/* Header */}
      <View className="flex flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-300">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold">Edit Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className={`px-4 py-2 rounded-lg ${loading ? "bg-gray-400" : "bg-green-600"}`}
        >
          <Text className="font-semibold text-white">
            {loading ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 bg-gray-50">
        <View className="p-4">
          {/* Profile Picture Section */}
          <View className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <Text className="mb-4 text-lg font-semibold text-gray-900">
              Profile Picture
            </Text>

            <View className="items-center mb-4">
              <View className="relative">
                <View className="flex items-center justify-center w-24 h-24 overflow-hidden bg-green-100 rounded-full">
                  {deliveryPartnerProfile?.profile_picture_url ? (
                    <Image
                      source={{
                        uri: deliveryPartnerProfile.profile_picture_url,
                      }}
                      className="w-full h-full"
                      style={{ resizeMode: "cover" }}
                    />
                  ) : (
                    <Feather name="user" size={40} color="#16a34a" />
                  )}
                </View>

                <TouchableOpacity
                  onPress={handleChangeProfilePicture}
                  className="absolute bottom-0 right-0 p-2 bg-green-600 rounded-full"
                >
                  <Feather name="camera" size={16} color="white" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleChangeProfilePicture}
                className="px-4 py-2 mt-3 bg-green-100 rounded-lg"
              >
                <Text className="text-sm font-medium text-green-700">
                  Change Profile Picture
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Vehicle Information */}
          <View className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <Text className="mb-4 text-lg font-semibold text-gray-900">
              Vehicle Information
            </Text>

            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Vehicle Make
              </Text>
              <TextInput
                value={formData.vehicle_make}
                onChangeText={(value) =>
                  handleInputChange("vehicle_make", value)
                }
                placeholder="e.g., Honda, Yamaha"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-50"
              />
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Vehicle Model
              </Text>
              <TextInput
                value={formData.vehicle_model}
                onChangeText={(value) =>
                  handleInputChange("vehicle_model", value)
                }
                placeholder="e.g., Click, Vios"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-50"
              />
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Vehicle Year
              </Text>
              <TextInput
                value={formData.vehicle_year}
                onChangeText={(value) =>
                  handleInputChange("vehicle_year", value)
                }
                placeholder="e.g., 2020"
                keyboardType="numeric"
                maxLength={4}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-50"
              />
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Vehicle Color
              </Text>
              <TextInput
                value={formData.vehicle_color}
                onChangeText={(value) =>
                  handleInputChange("vehicle_color", value)
                }
                placeholder="e.g., Red, Blue"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-50"
              />
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Company Name (Optional)
              </Text>
              <TextInput
                value={formData.company_name}
                onChangeText={(value) =>
                  handleInputChange("company_name", value)
                }
                placeholder="e.g., Independent, Grab"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-50"
              />
            </View>
          </View>

          {/* Emergency Contact */}
          <View className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <Text className="mb-4 text-lg font-semibold text-gray-900">
              Emergency Contact
            </Text>

            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Contact Name
              </Text>
              <TextInput
                value={formData.emergency_contact_name}
                onChangeText={(value) =>
                  handleInputChange("emergency_contact_name", value)
                }
                placeholder="Full name of emergency contact"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-50"
              />
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Contact Phone
              </Text>
              <TextInput
                value={formData.emergency_contact_phone}
                onChangeText={(value) =>
                  handleInputChange("emergency_contact_phone", value)
                }
                placeholder="e.g., +639123456789"
                keyboardType="phone-pad"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-50"
              />
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Relationship
              </Text>
              <TextInput
                value={formData.emergency_contact_relation}
                onChangeText={(value) =>
                  handleInputChange("emergency_contact_relation", value)
                }
                placeholder="e.g., Parent, Spouse, Sibling"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-50"
              />
            </View>
          </View>

          {/* Note */}
          <View className="p-4 mb-4 border border-blue-200 rounded-lg bg-blue-50">
            <View className="flex flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#3b82f6" />
              <View className="flex-1 ml-3">
                <Text className="mb-1 font-semibold text-blue-800">Note</Text>
                <Text className="text-sm text-blue-700">
                  Some information like vehicle type, license number, and
                  registration cannot be changed here. Contact support if you
                  need to update these details.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default EditDeliveryPartnerProfileScreen;
