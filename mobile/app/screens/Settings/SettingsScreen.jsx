import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from "react-native"
import { useState } from "react"
import Ionicons from "@expo/vector-icons/Ionicons"
import Feather from "@expo/vector-icons/Feather"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import AntDesign from "@expo/vector-icons/AntDesign"

const SettingsScreen = ({ navigation }) => {
  const [notificationSettings, setNotificationSettings] = useState({
    pushNotifications: true,
    emailNotifications: false,
    smsNotifications: true,
    orderUpdates: true,
    promotions: false,
    newProducts: true,
  })

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: true,
    activityStatus: false,
    dataSharing: false,
    locationServices: true,
  })

  const [appSettings, setAppSettings] = useState({
    darkMode: false,
    autoPlayVideos: true,
    highQualityImages: false,
    offlineMode: false,
  })

  const handleNotificationToggle = (setting) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }))
  }

  const handlePrivacyToggle = (setting) => {
    setPrivacySettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }))
  }

  const handleAppToggle = (setting) => {
    setAppSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }))
  }

  const handleClearCache = () => {
    Alert.alert("Clear Cache", "This will clear all cached data and may slow down the app temporarily. Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          // Temporary functionality
          Alert.alert("Success", "Cache cleared successfully!")
        },
      },
    ])
  }

  const handleResetSettings = () => {
    Alert.alert(
      "Reset All Settings",
      "This will reset all settings to their default values. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            // Reset all settings to default
            setNotificationSettings({
              pushNotifications: true,
              emailNotifications: false,
              smsNotifications: true,
              orderUpdates: true,
              promotions: false,
              newProducts: true,
            })
            setPrivacySettings({
              profileVisibility: true,
              activityStatus: false,
              dataSharing: false,
              locationServices: true,
            })
            setAppSettings({
              darkMode: false,
              autoPlayVideos: true,
              highQualityImages: false,
              offlineMode: false,
            })
            Alert.alert("Success", "All settings have been reset to default values!")
          },
        },
      ],
    )
  }

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          // Temporary functionality - would handle actual logout
          Alert.alert("Logged Out", "You have been successfully logged out!")
          // navigation.navigate('Login')
        },
      },
    ])
  }

  const SettingItem = ({ icon, title, subtitle, onPress, rightComponent, iconColor = "black" }) => (
    <TouchableOpacity
      className="flex flex-row items-center gap-4 p-4 border-b border-gray-100"
      onPress={onPress}
      disabled={!onPress}
    >
      <View className="w-8 h-8 flex items-center justify-center">{icon}</View>
      <View className="flex-1">
        <Text className="text-base font-medium">{title}</Text>
        {subtitle && <Text className="text-sm text-gray-600 mt-1">{subtitle}</Text>}
      </View>
      {rightComponent || <Feather name="chevron-right" size={20} color="gray" />}
    </TouchableOpacity>
  )

  const ToggleItem = ({ icon, title, subtitle, value, onToggle, iconColor = "black" }) => (
    <View className="flex flex-row items-center gap-4 p-4 border-b border-gray-100">
      <View className="w-8 h-8 flex items-center justify-center">{icon}</View>
      <View className="flex-1">
        <Text className="text-base font-medium">{title}</Text>
        {subtitle && <Text className="text-sm text-gray-600 mt-1">{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#d1d5db", true: "#F16B44" }}
        thumbColor={value ? "#ffffff" : "#f4f3f4"}
      />
    </View>
  )

  return (
    <>
      {/* Header */}
      <View className="flex flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-300">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold">Settings</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 bg-gray-50">
        {/* Account Section */}
        <View className="mt-4 bg-white">
          <View className="p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold">Account</Text>
          </View>

          <SettingItem
            icon={<MaterialIcons name="account-circle" size={24} color="black" />}
            title="Profile Information"
            subtitle="Update your personal details"
            onPress={() => navigation.navigate("EditProfile")}
          />

          <SettingItem
            icon={<Feather name="lock" size={24} color="black" />}
            title="Change Password"
            subtitle="Update your account password"
            onPress={() => Alert.alert("Coming Soon", "Password change feature will be available soon!")}
          />

          <SettingItem
            icon={<Feather name="credit-card" size={24} color="black" />}
            title="Payment Methods"
            subtitle="Manage your payment options"
            onPress={() => Alert.alert("Coming Soon", "Payment methods management coming soon!")}
          />

          <SettingItem
            icon={<Feather name="map-pin" size={24} color="black" />}
            title="Addresses"
            subtitle="Manage delivery addresses"
            onPress={() => Alert.alert("Coming Soon", "Address management coming soon!")}
          />
        </View>

        {/* Notification Settings */}
        <View className="mt-4 bg-white">
          <View className="p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold">Notifications</Text>
          </View>

          <ToggleItem
            icon={<Feather name="bell" size={24} color="black" />}
            title="Push Notifications"
            subtitle="Receive notifications on your device"
            value={notificationSettings.pushNotifications}
            onToggle={() => handleNotificationToggle("pushNotifications")}
          />

          <ToggleItem
            icon={<Feather name="mail" size={24} color="black" />}
            title="Email Notifications"
            subtitle="Receive updates via email"
            value={notificationSettings.emailNotifications}
            onToggle={() => handleNotificationToggle("emailNotifications")}
          />

          <ToggleItem
            icon={<Feather name="message-square" size={24} color="black" />}
            title="SMS Notifications"
            subtitle="Receive text message updates"
            value={notificationSettings.smsNotifications}
            onToggle={() => handleNotificationToggle("smsNotifications")}
          />

          <ToggleItem
            icon={<Feather name="package" size={24} color="black" />}
            title="Order Updates"
            subtitle="Get notified about order status"
            value={notificationSettings.orderUpdates}
            onToggle={() => handleNotificationToggle("orderUpdates")}
          />

          <ToggleItem
            icon={<Feather name="tag" size={24} color="black" />}
            title="Promotions & Offers"
            subtitle="Receive deals and discount notifications"
            value={notificationSettings.promotions}
            onToggle={() => handleNotificationToggle("promotions")}
          />
        </View>

        {/* Privacy Settings */}
        <View className="mt-4 bg-white">
          <View className="p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold">Privacy & Security</Text>
          </View>

          <ToggleItem
            icon={<Feather name="eye" size={24} color="black" />}
            title="Profile Visibility"
            subtitle="Make your profile visible to others"
            value={privacySettings.profileVisibility}
            onToggle={() => handlePrivacyToggle("profileVisibility")}
          />

          <ToggleItem
            icon={<Feather name="activity" size={24} color="black" />}
            title="Activity Status"
            subtitle="Show when you're active"
            value={privacySettings.activityStatus}
            onToggle={() => handlePrivacyToggle("activityStatus")}
          />

          <ToggleItem
            icon={<Feather name="share-2" size={24} color="black" />}
            title="Data Sharing"
            subtitle="Share data for personalized experience"
            value={privacySettings.dataSharing}
            onToggle={() => handlePrivacyToggle("dataSharing")}
          />

          <ToggleItem
            icon={<Feather name="map-pin" size={24} color="black" />}
            title="Location Services"
            subtitle="Allow location-based features"
            value={privacySettings.locationServices}
            onToggle={() => handlePrivacyToggle("locationServices")}
          />
        </View>

        {/* App Preferences */}
        <View className="mt-4 bg-white">
          <View className="p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold">App Preferences</Text>
          </View>

          <ToggleItem
            icon={<Feather name="moon" size={24} color="black" />}
            title="Dark Mode"
            subtitle="Use dark theme"
            value={appSettings.darkMode}
            onToggle={() => handleAppToggle("darkMode")}
          />

          <ToggleItem
            icon={<Feather name="play" size={24} color="black" />}
            title="Auto-play Videos"
            subtitle="Automatically play videos in feeds"
            value={appSettings.autoPlayVideos}
            onToggle={() => handleAppToggle("autoPlayVideos")}
          />

          <ToggleItem
            icon={<Feather name="image" size={24} color="black" />}
            title="High Quality Images"
            subtitle="Load images in high resolution"
            value={appSettings.highQualityImages}
            onToggle={() => handleAppToggle("highQualityImages")}
          />

          <ToggleItem
            icon={<Feather name="wifi-off" size={24} color="black" />}
            title="Offline Mode"
            subtitle="Save data for offline viewing"
            value={appSettings.offlineMode}
            onToggle={() => handleAppToggle("offlineMode")}
          />
        </View>

        {/* Support & About */}
        <View className="mt-4 bg-white">
          <View className="p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold">Support & About</Text>
          </View>

          <SettingItem
            icon={<Feather name="help-circle" size={24} color="black" />}
            title="Help Center"
            subtitle="Get help and support"
            onPress={() => Alert.alert("Help Center", "Help center feature coming soon!")}
          />

          <SettingItem
            icon={<Feather name="message-circle" size={24} color="black" />}
            title="Contact Us"
            subtitle="Send feedback or report issues"
            onPress={() => Alert.alert("Contact Us", "Contact feature coming soon!")}
          />

          <SettingItem
            icon={<Feather name="file-text" size={24} color="black" />}
            title="Terms of Service"
            subtitle="Read our terms and conditions"
            onPress={() => Alert.alert("Terms of Service", "Terms of service will be displayed here.")}
          />

          <SettingItem
            icon={<Feather name="shield" size={24} color="black" />}
            title="Privacy Policy"
            subtitle="Learn about our privacy practices"
            onPress={() => Alert.alert("Privacy Policy", "Privacy policy will be displayed here.")}
          />

          <SettingItem
            icon={<Feather name="info" size={24} color="black" />}
            title="About Palenque Mart"
            subtitle="App version 1.0.0"
            onPress={() => Alert.alert("About", "Palenque Mart v1.0.0\nBuilt with React Native")}
          />
        </View>

        {/* Advanced Settings */}
        <View className="mt-4 bg-white">
          <View className="p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold">Advanced</Text>
          </View>

          <SettingItem
            icon={<Feather name="trash-2" size={24} color="#ef4444" />}
            title="Clear Cache"
            subtitle="Free up storage space"
            onPress={handleClearCache}
            rightComponent={<Text className="text-sm text-gray-500">2.3 MB</Text>}
          />

          <SettingItem
            icon={<Feather name="download" size={24} color="black" />}
            title="Download Data"
            subtitle="Export your account data"
            onPress={() => Alert.alert("Download Data", "Data export feature coming soon!")}
          />

          <SettingItem
            icon={<Feather name="refresh-cw" size={24} color="#ef4444" />}
            title="Reset Settings"
            subtitle="Reset all settings to default"
            onPress={handleResetSettings}
          />
        </View>

        {/* Logout */}
        <View className="mt-4 mb-8 bg-white">
          <SettingItem
            icon={<AntDesign name="logout" size={24} color="#ef4444" />}
            title="Logout"
            subtitle="Sign out of your account"
            onPress={handleLogout}
            rightComponent={null}
          />
        </View>
      </ScrollView>
    </>
  )
}

export default SettingsScreen
