import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from "@expo/vector-icons/Feather";

import { useAuth } from "../../context/AuthContext";

const EditProfileScreen = ({ navigation }) => {
  const { user } = useAuth();

  const [profileData, setProfileData] = useState({
    firstName: "James Mickel",
    lastName: "Ricarte",
    email: "uhenyou@gmail.com",
    phone: "+639123456789",
    address: "123 Main Street, Barangay San Jose",
    city: "Quezon City",
    zipCode: "1100",
    birthDate: "January 15, 1995",
    gender: "Male",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempData, setTempData] = useState({ ...user });

  const handleSave = () => {
    // Temporary save functionality
    setProfileData({ ...user });
    setIsEditing(false);
    Alert.alert("Success", "Profile updated successfully!");
  };

  const handleCancel = () => {
    setTempData({ ...profileData });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setTempData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const ProfileField = ({
    label,
    value,
    field,
    keyboardType = "default",
    multiline = false,
  }) => (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-medium text-gray-700">{label}</Text>
      {isEditing ? (
        <TextInput
          className="p-3 text-base bg-white border border-gray-300 rounded-lg"
          value={tempData[field]}
          onChangeText={(text) => handleInputChange(field, text)}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
        />
      ) : (
        <View className="p-3 border border-gray-200 rounded-lg bg-gray-50">
          <Text className="text-base">{value}</Text>
        </View>
      )}
    </View>
  );

  return (
    <>
      {/* Header */}
      <View className="flex flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-300">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold">Edit Profile</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Feather name={isEditing ? "x" : "edit-2"} size={20} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 bg-gray-50">
        {/* Profile Picture Section */}
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
        </View>
        {/* Profile Information */}
        <View className="p-6 mt-4 bg-white">
          <Text className="mb-6 text-xl font-semibold">
            Personal Information
          </Text>

          <View className="flex flex-row gap-4 mb-4">
            <View className="flex-1">
              <Text className="mb-2 text-sm font-medium text-gray-700">
                First Name
              </Text>
              {isEditing ? (
                <TextInput
                  className="p-3 text-base bg-white border border-gray-300 rounded-lg"
                  value={user.first_name}
                  onChangeText={(text) => handleInputChange("firstName", text)}
                />
              ) : (
                <View className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <Text className="text-base">{user.first_name}</Text>
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
                  value={user.last_name}
                  onChangeText={(text) => handleInputChange("lastName", text)}
                />
              ) : (
                <View className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <Text className="text-base">{user.last_name}</Text>
                </View>
              )}
            </View>
          </View>

          <ProfileField
            label="Email Address"
            value={user.email}
            field="email"
            keyboardType="email-address"
          />

          <ProfileField
            label="Phone Number"
            value={profileData.phone}
            field="phone"
            keyboardType="phone-pad"
          />

          <ProfileField label="Birth Date" value={null} field="birthDate" />

          <ProfileField label="Gender" value={null} field="gender" />
        </View>
      </ScrollView>

      {/* Save/Cancel Buttons */}
      {isEditing && (
        <View className="flex flex-row gap-3 p-4 bg-white border-t border-gray-300">
          <TouchableOpacity
            className="flex-1 py-3 border border-gray-400 rounded-lg"
            onPress={handleCancel}
          >
            <Text className="text-lg text-center text-gray-600">Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 py-3 bg-black rounded-lg"
            onPress={handleSave}
          >
            <Text className="text-lg text-center text-white">Save Changes</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

export default EditProfileScreen;
