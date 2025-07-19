import { useState } from "react";
import { Modal, ScrollView, TouchableOpacity, View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

// Custom Date Picker Component
const CustomDatePicker = ({ visible, onClose, onDateSelect, initialDate }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Parse initial date safely without timezone conversion
  const parseInitialDate = (dateString) => {
    if (!dateString) return null;

    // If it's already in YYYY-MM-DD format, parse it directly
    if (
      typeof dateString === "string" &&
      dateString.match(/^\d{4}-\d{2}-\d{2}$/)
    ) {
      const [year, month, day] = dateString.split("-").map(Number);
      return { year, month: month - 1, day }; // month is 0-indexed
    }

    // Otherwise, create date object and extract components
    const date = new Date(dateString);
    return {
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate(),
    };
  };

  const initialParsed = parseInitialDate(initialDate);

  const [selectedYear, setSelectedYear] = useState(
    initialParsed ? initialParsed.year : currentYear - 25
  );
  const [selectedMonth, setSelectedMonth] = useState(
    initialParsed ? initialParsed.month : 0
  );
  const [selectedDay, setSelectedDay] = useState(
    initialParsed ? initialParsed.day : 1
  );

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const days = Array.from(
    { length: getDaysInMonth(selectedYear, selectedMonth) },
    (_, i) => i + 1
  );

  const handleConfirm = () => {
    // Create date string directly without timezone conversion
    const year = selectedYear.toString();
    const month = (selectedMonth + 1).toString().padStart(2, "0");
    const day = selectedDay.toString().padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    onDateSelect(formattedDate);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="justify-end flex-1 bg-black/50">
        <View className="p-6 bg-white rounded-t-3xl">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-semibold">Select Birth Date</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between mb-6">
            {/* Year Picker */}
            <View className="flex-1 mr-2">
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Year
              </Text>
              <ScrollView className="h-32 border border-gray-300 rounded-lg">
                {years.map((year) => (
                  <TouchableOpacity
                    key={year}
                    className={`p-3 ${selectedYear === year ? "bg-blue-100" : ""}`}
                    onPress={() => setSelectedYear(year)}
                  >
                    <Text
                      className={`text-center ${selectedYear === year ? "font-semibold text-blue-600" : ""}`}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Month Picker */}
            <View className="flex-1 mx-1">
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Month
              </Text>
              <ScrollView className="h-32 border border-gray-300 rounded-lg">
                {months.map((month, index) => (
                  <TouchableOpacity
                    key={month}
                    className={`p-3 ${selectedMonth === index ? "bg-blue-100" : ""}`}
                    onPress={() => setSelectedMonth(index)}
                  >
                    <Text
                      className={`text-center text-xs ${selectedMonth === index ? "font-semibold text-blue-600" : ""}`}
                    >
                      {month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Day Picker */}
            <View className="flex-1 ml-2">
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Day
              </Text>
              <ScrollView className="h-32 border border-gray-300 rounded-lg">
                {days.map((day) => (
                  <TouchableOpacity
                    key={day}
                    className={`p-3 ${selectedDay === day ? "bg-blue-100" : ""}`}
                    onPress={() => setSelectedDay(day)}
                  >
                    <Text
                      className={`text-center ${selectedDay === day ? "font-semibold text-blue-600" : ""}`}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 py-3 bg-gray-200 rounded-lg"
              onPress={onClose}
            >
              <Text className="font-medium text-center text-gray-700">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 bg-black rounded-lg"
              onPress={handleConfirm}
            >
              <Text className="font-medium text-center text-white">
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomDatePicker;
