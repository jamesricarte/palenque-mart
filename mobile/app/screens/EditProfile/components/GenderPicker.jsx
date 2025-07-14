import { Modal, TouchableOpacity, View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

// Custom Gender Picker Component
const GenderPicker = ({ visible, onClose, onGenderSelect, selectedGender }) => {
  const genderOptions = [
    { label: "Male", value: "male", icon: "male" },
    { label: "Female", value: "female", icon: "female" },
    { label: "Non-binary", value: "non-binary", icon: "transgender" },
    {
      label: "Prefer not to say",
      value: "prefer-not-to-say",
      icon: "help-circle",
    },
  ];

  const handleGenderSelect = (gender) => {
    onGenderSelect(gender.value);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="justify-end flex-1 bg-black/50">
        <View className="p-6 bg-white rounded-t-3xl">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-semibold">Select Gender</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <View className="space-y-3">
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                className={`flex-row items-center p-4 rounded-lg border ${
                  selectedGender === option.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 bg-white"
                }`}
                onPress={() => handleGenderSelect(option)}
              >
                <Ionicons
                  name={option.icon}
                  size={24}
                  color={
                    selectedGender === option.value ? "#3B82F6" : "#6B7280"
                  }
                />
                <Text
                  className={`ml-3 text-base ${
                    selectedGender === option.value
                      ? "text-blue-600 font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  {option.label}
                </Text>
                {selectedGender === option.value && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#3B82F6"
                    className="ml-auto"
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            className="py-3 mt-6 bg-gray-200 rounded-lg"
            onPress={onClose}
          >
            <Text className="font-medium text-center text-gray-700">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default GenderPicker;
