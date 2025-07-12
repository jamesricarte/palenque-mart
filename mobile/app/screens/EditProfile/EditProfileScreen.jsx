import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from "@expo/vector-icons/Feather";

import axios from "axios";

import PersonalizedLoadingAnimation from "../../components/PersonalizedLoadingAnimation";
import Snackbar from "../../components/Snackbar";

import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/apiConfig";

const EditProfileScreen = ({ navigation }) => {
  const { user, setUser, token } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({ ...user });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [snackBarVisible, setSnackBarVisible] = useState(false);

  const handleSave = async () => {
    const { profile_picture, ...newProfileData } = profileData;

    if (
      Object.values(newProfileData).includes("") |
      Object.values(newProfileData).includes(null) |
      Object.values(newProfileData).includes(undefined)
    ) {
      setMessage({ message: "All fields required!" });
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
          }
          setMessage(responseData);
          setSnackBarVisible(true);
          setIsEditing(false);
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

  return (
    <View className="flex-1">
      <View className="flex flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-300">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 bg-gray-50">
        <View className="items-center py-8 bg-white border-b border-gray-200">
          <View className="relative">
            <MaterialIcons name="account-circle" size={100} color="black" />
            <TouchableOpacity className="absolute bottom-0 right-0 p-2 bg-black rounded-full">
              <Feather name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>

          <Text className="mt-3 text-lg font-semibold">
            {user.first_name} {user.last_name}
          </Text>

          <Text className="text-sm text-gray-600">
            {user.email ? user.email : user.phone}
          </Text>

          <View className="flex-row w-full mt-4 justify-evenly">
            <TouchableOpacity className="items-center">
              <Text>0</Text>
              <Text>Likes</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center">
              <Text>0</Text>
              <Text>Followers</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center">
              <Text>0</Text>
              <Text>Followings</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="p-6 mt-4 bg-white">
          <View className="flex-row justify-between mb-6">
            <Text className="text-xl font-semibold">Personal Information</Text>

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
              {isEditing ? (
                <TextInput
                  className="p-3 text-base bg-white border border-gray-300 rounded-lg"
                  value={profileData.first_name}
                  onChangeText={(text) => handleInputChange("first_name", text)}
                />
              ) : (
                <View className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <Text className="text-base">{profileData.first_name}</Text>
                </View>
              )}
            </View>

            <View className="flex-1">
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Last Name
              </Text>
              {isEditing ? (
                <TextInput
                  className="p-3 text-base bg-white border border-gray-300 rounded-lg"
                  value={profileData.last_name}
                  onChangeText={(text) => handleInputChange("last_name", text)}
                />
              ) : (
                <View className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <Text className="text-base">{profileData.last_name}</Text>
                </View>
              )}
            </View>
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-700">
              Email Address
            </Text>

            <TouchableOpacity onPress={() => navigation.navigate("EditEmail")}>
              <View>
                <Text className="p-3 text-base bg-white border border-gray-300 rounded-lg">
                  {profileData.email}
                </Text>

                <Feather
                  className="absolute transform -translate-y-1/2 top-1/2 right-5"
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
              <View>
                <Text className="p-3 text-base bg-white border border-gray-300 rounded-lg">
                  {profileData.phone}
                </Text>

                <Feather
                  className="absolute transform -translate-y-1/2 top-1/2 right-5"
                  name="edit-2"
                  size={16}
                  color="black"
                />
              </View>
            </TouchableOpacity>
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-700">
              Birth Date
            </Text>
            {isEditing ? (
              <TextInput
                className="p-3 text-base bg-white border border-gray-300 rounded-lg"
                keyboardType="phone-pad"
                value={profileData.birth_date}
                onChangeText={(text) => handleInputChange("birth_date", text)}
              />
            ) : (
              <View className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                <Text className="text-base">{profileData.birth_date}</Text>
              </View>
            )}
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-700">
              Gender
            </Text>
            {isEditing ? (
              <TextInput
                className="p-3 text-base bg-white border border-gray-300 rounded-lg"
                keyboardType="phone-pad"
                value={profileData.gender}
                onChangeText={(text) => handleInputChange("gender", text)}
              />
            ) : (
              <View className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                <Text className="text-base">{profileData.gender}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {isEditing && (
        <View className="flex flex-row gap-3 p-4 bg-white border-t border-gray-300">
          <TouchableOpacity
            className="flex-1 py-3 bg-black rounded-lg"
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
    </View>
  );
};

export default EditProfileScreen;
