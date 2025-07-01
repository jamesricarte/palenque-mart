import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from "react-native"
import { useState } from "react"
import Ionicons from "@expo/vector-icons/Ionicons"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import Feather from "@expo/vector-icons/Feather"

const EditProfileScreen = ({ navigation }) => {
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
  })

  const [isEditing, setIsEditing] = useState(false)
  const [tempData, setTempData] = useState({ ...profileData })

  const handleSave = () => {
    // Temporary save functionality
    setProfileData({ ...tempData })
    setIsEditing(false)
    Alert.alert("Success", "Profile updated successfully!")
  }

  const handleCancel = () => {
    setTempData({ ...profileData })
    setIsEditing(false)
  }

  const handleInputChange = (field, value) => {
    setTempData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const ProfileField = ({ label, value, field, keyboardType = "default", multiline = false }) => (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-medium text-gray-700">{label}</Text>
      {isEditing ? (
        <TextInput
          className="p-3 text-base border border-gray-300 rounded-lg bg-white"
          value={tempData[field]}
          onChangeText={(text) => handleInputChange(field, text)}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
        />
      ) : (
        <View className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <Text className="text-base">{value}</Text>
        </View>
      )}
    </View>
  )

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
            {profileData.firstName} {profileData.lastName}
          </Text>
          <Text className="text-sm text-gray-600">{profileData.email}</Text>
        </View>

        {/* Profile Information */}
        <View className="p-6 mt-4 bg-white">
          <Text className="mb-6 text-xl font-semibold">Personal Information</Text>

          <View className="flex flex-row gap-4 mb-4">
            <View className="flex-1">
              <Text className="mb-2 text-sm font-medium text-gray-700">First Name</Text>
              {isEditing ? (
                <TextInput
                  className="p-3 text-base border border-gray-300 rounded-lg bg-white"
                  value={tempData.firstName}
                  onChangeText={(text) => handleInputChange("firstName", text)}
                />
              ) : (
                <View className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <Text className="text-base">{profileData.firstName}</Text>
                </View>
              )}
            </View>

            <View className="flex-1">
              <Text className="mb-2 text-sm font-medium text-gray-700">Last Name</Text>
              {isEditing ? (
                <TextInput
                  className="p-3 text-base border border-gray-300 rounded-lg bg-white"
                  value={tempData.lastName}
                  onChangeText={(text) => handleInputChange("lastName", text)}
                />
              ) : (
                <View className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <Text className="text-base">{profileData.lastName}</Text>
                </View>
              )}
            </View>
          </View>

          <ProfileField label="Email Address" value={profileData.email} field="email" keyboardType="email-address" />

          <ProfileField label="Phone Number" value={profileData.phone} field="phone" keyboardType="phone-pad" />

          <ProfileField label="Birth Date" value={profileData.birthDate} field="birthDate" />

          <ProfileField label="Gender" value={profileData.gender} field="gender" />
        </View>

        {/* Address Information */}
        <View className="p-6 mt-4 bg-white">
          <Text className="mb-6 text-xl font-semibold">Address Information</Text>

          <ProfileField label="Street Address" value={profileData.address} field="address" multiline={true} />

          <View className="flex flex-row gap-4">
            <View className="flex-1">
              <ProfileField label="City" value={profileData.city} field="city" />
            </View>

            <View className="w-24">
              <ProfileField label="Zip Code" value={profileData.zipCode} field="zipCode" keyboardType="numeric" />
            </View>
          </View>
        </View>

        {/* Account Settings */}
        <View className="p-6 mt-4 bg-white">
          <Text className="mb-6 text-xl font-semibold">Account Settings</Text>

          <TouchableOpacity className="flex flex-row items-center justify-between p-4 mb-3 border border-gray-200 rounded-lg">
            <View className="flex flex-row items-center gap-3">
              <Feather name="lock" size={20} color="black" />
              <Text className="text-base">Change Password</Text>
            </View>
            <Feather name="chevron-right" size={20} color="gray" />
          </TouchableOpacity>

          <TouchableOpacity className="flex flex-row items-center justify-between p-4 mb-3 border border-gray-200 rounded-lg">
            <View className="flex flex-row items-center gap-3">
              <Feather name="bell" size={20} color="black" />
              <Text className="text-base">Notification Settings</Text>
            </View>
            <Feather name="chevron-right" size={20} color="gray" />
          </TouchableOpacity>

          <TouchableOpacity className="flex flex-row items-center justify-between p-4 border border-gray-200 rounded-lg">
            <View className="flex flex-row items-center gap-3">
              <Feather name="shield" size={20} color="black" />
              <Text className="text-base">Privacy Settings</Text>
            </View>
            <Feather name="chevron-right" size={20} color="gray" />
          </TouchableOpacity>
        </View>

        <View className="h-8" />
      </ScrollView>

      {/* Save/Cancel Buttons */}
      {isEditing && (
        <View className="flex flex-row gap-3 p-4 bg-white border-t border-gray-300">
          <TouchableOpacity className="flex-1 py-3 border border-gray-400 rounded-lg" onPress={handleCancel}>
            <Text className="text-lg text-center text-gray-600">Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 py-3 bg-black rounded-lg" onPress={handleSave}>
            <Text className="text-lg text-center text-white">Save Changes</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  )
}

export default EditProfileScreen
