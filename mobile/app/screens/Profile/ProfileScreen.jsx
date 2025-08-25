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
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from "@expo/vector-icons/Feather";

import axios from "axios";

import PersonalizedLoadingAnimation from "../../components/PersonalizedLoadingAnimation";
import Snackbar from "../../components/Snackbar";
import CustomDatePicker from "./components/CustomDatePicker";
import GenderPicker from "./components/GenderPicker";

import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/apiConfig";

const ProfileScreen = ({ navigation }) => {
  const { user, setUser, token } = useAuth();

  const [profileChanges, setProfileChanges] = useState(false);
  const [profileData, setProfileData] = useState({ ...user });
  const [isEditing, setIsEditing] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [snackBarVisible, setSnackBarVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [genderPickerVisible, setGenderPickerVisible] = useState(false);

  const [keyBoardVisibility, setKeyboardVisibility] = useState(false);

  const handleSave = async () => {
    const { profile_picture, ...newProfileData } = profileData;

    if (!profileData.first_name || !profileData.last_name) {
      setMessage({ message: "These fields are required!" });
      console.log("These fields are required!");
      return;
    }

    setLoading(true);
    const startTime = Date.now();
    let responseData;

    try {
      const response = await axios.post(
        `${API_URL}/api/update-profile`,
        newProfileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data);
      responseData = response.data;
    } catch (error) {
      console.error(error.response.data);
      responseData = error.response.data;
    } finally {
      const elapseTime = Date.now() - startTime;
      const minimumTime = 2000;

      setTimeout(
        () => {
          setLoading(false);
          if (responseData?.success) {
            setUser(responseData.data);
            setProfileData(responseData.data);
            setIsEditing(false);
          }
          setMessage(responseData);
          setSnackBarVisible(true);
        },
        Math.max(0, minimumTime - elapseTime)
      );
    }
  };

  const handleCancel = () => {
    setProfileData({ ...user });
  };

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "Select birth date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDisplayGender = (gender) => {
    if (!gender) return "Select gender";
    const genderMap = {
      male: "Male",
      female: "Female",
      "non-binary": "Non-binary",
      "prefer-not-to-say": "Prefer not to say",
    };
    return genderMap[gender] || gender;
  };

  useEffect(() => {
    if (JSON.stringify(profileData) !== JSON.stringify(user)) {
      setProfileChanges(true);
      setIsEditing(true);
    } else {
      setProfileChanges(false);
    }
  }, [profileData]);

  useEffect(() => {
    const keyboardDidHide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisibility(false);
    });

    const keyboardDidShow = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisibility(true);
    });
    return () => {
      keyboardDidHide.remove();
      keyboardDidShow.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={
        Platform.OS === "android" && !keyBoardVisibility ? null : "padding"
      }
      keyboardVerticalOffset={0}
    >
      <View className="flex flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <View className="flex flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="ml-4 text-xl font-semibold text-gray-900">
            Profile
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        <View className="items-center py-8 bg-white border-b border-gray-200">
          <View className="relative">
            <View className="flex items-center justify-center w-24 h-24 overflow-hidden bg-gray-100 rounded-full">
              {user?.profile_picture ? (
                <Image
                  source={{
                    uri: deliveryPartnerProfile.profile_picture_url,
                  }}
                  className="w-full h-full"
                  style={{ resizeMode: "cover" }}
                />
              ) : (
                <Feather name="user" size={50} color="black" />
              )}
            </View>
            <TouchableOpacity className="absolute bottom-0 right-0 p-2 bg-orange-600 border-2 border-white rounded-full">
              <Feather name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>

          <Text className="mt-4 text-xl font-semibold text-gray-900">
            {user.first_name} {user.last_name}
          </Text>

          <Text className="mt-1 text-sm text-gray-600">
            {user.email ? user.email : user.phone}
          </Text>
        </View>

        <View className="p-6 mx-4 mt-6 bg-white shadow-sm rounded-xl">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-semibold text-gray-900">
              Personal Information
            </Text>

            <TouchableOpacity
              onPress={() => {
                setIsEditing(!isEditing);
                handleCancel();
              }}
            >
              <Feather
                name={isEditing ? "x" : "edit-2"}
                size={20}
                color="black"
              />
            </TouchableOpacity>
          </View>

          <View className="flex flex-row gap-4 mb-4">
            <View className="flex-1">
              <Text className="mb-2 text-sm font-medium text-gray-700">
                First Name
              </Text>

              <TextInput
                className={`p-3 text-base border rounded-xl border-gray-200 ${isEditing ? "bg-white" : "bg-gray-100"}`}
                value={profileData.first_name}
                onChangeText={(text) => handleInputChange("first_name", text)}
                editable={isEditing}
              />
            </View>

            <View className="flex-1">
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Last Name
              </Text>

              <TextInput
                className={`p-3 text-base border rounded-xl border-gray-200 ${isEditing ? "bg-white" : "bg-gray-100"}`}
                value={profileData.last_name}
                onChangeText={(text) => handleInputChange("last_name", text)}
                editable={isEditing}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-700">
              Email Address
            </Text>

            <TouchableOpacity onPress={() => navigation.navigate("EditEmail")}>
              <View className="relative">
                <Text className="p-3 text-base bg-white border border-gray-200 rounded-xl">
                  {profileData.email}
                </Text>

                <Feather
                  className="absolute transform -translate-y-1/2 top-1/2 right-4"
                  name="edit-2"
                  size={16}
                  color="black"
                />
              </View>
            </TouchableOpacity>
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-700">
              Phone
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate("EditMobileNumber")}
            >
              <View className="relative">
                <Text className="p-3 text-base bg-white border border-gray-200 rounded-xl">
                  {profileData.phone}
                </Text>

                <Feather
                  className="absolute transform -translate-y-1/2 top-1/2 right-4"
                  name="edit-2"
                  size={16}
                  color="black"
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Custom Birth Date Picker */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-700">
              Birth Date
            </Text>

            <TouchableOpacity
              className="relative"
              onPress={() => {
                if (!user.birth_date) setDatePickerVisible(true);
                else isEditing && setDatePickerVisible(true);
              }}
              disabled={!user.birth_date ? false : !isEditing}
            >
              <View
                className={`flex-row items-center justify-between p-3 border rounded-xl border-gray-200 ${isEditing ? "bg-white" : "bg-gray-100"}`}
              >
                <Text
                  className={`text-base ${profileData.birth_date ? "text-gray-900" : "text-gray-500"}`}
                >
                  {formatDisplayDate(profileData.birth_date)}
                </Text>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={isEditing ? "black" : "#6b7280"}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Custom Gender Picker */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-700">
              Gender
            </Text>

            <TouchableOpacity
              className="relative"
              onPress={() => {
                if (!user.birth_date) setGenderPickerVisible(true);
                else isEditing && setGenderPickerVisible(true);
              }}
              disabled={!user.birth_date ? false : !isEditing}
            >
              <View
                className={`flex-row items-center justify-between p-3 border rounded-xl border-gray-200 ${isEditing ? "bg-white" : "bg-gray-100"}`}
              >
                <Text
                  className={`text-base ${profileData.gender ? "text-gray-900" : "text-gray-500"}`}
                >
                  {formatDisplayGender(profileData.gender)}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={isEditing ? "black" : "#6b7280"}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>

      {profileChanges && (
        <View className="p-4 bg-white border-t border-gray-200">
          <TouchableOpacity
            className="py-4 bg-orange-600 rounded-xl"
            onPress={handleSave}
            disabled={!profileChanges}
          >
            <Text className="text-lg font-semibold text-center text-white">
              Save Changes
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Custom Date Picker Modal */}
      <CustomDatePicker
        visible={datePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        onDateSelect={(date) => handleInputChange("birth_date", date)}
        initialDate={profileData.birth_date}
      />

      {/* Custom Gender Picker Modal */}
      <GenderPicker
        visible={genderPickerVisible}
        onClose={() => setGenderPickerVisible(false)}
        onGenderSelect={(gender) => handleInputChange("gender", gender)}
        selectedGender={profileData.gender}
      />

      <PersonalizedLoadingAnimation visible={loading} />

      <Snackbar
        visible={snackBarVisible}
        onDismiss={setSnackBarVisible}
        text={message?.message}
      />
    </KeyboardAvoidingView>
  );
};

export default ProfileScreen;
