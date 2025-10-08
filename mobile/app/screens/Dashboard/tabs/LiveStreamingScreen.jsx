import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const LiveStreamingScreen = () => {
  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      de
      <View className="items-center justify-center flex-1 p-8">
        <View className="items-center justify-center w-20 h-20 mb-6 bg-orange-100 rounded-full">
          <Ionicons name="videocam" size={40} color="#f97316" />
        </View>

        <Text className="mb-2 text-xl font-semibold text-center text-gray-900">
          Live Selling
        </Text>

        <Text className="mb-8 text-lg text-center text-gray-600">
          This feature will be coming soon
        </Text>

        <Text className="text-sm leading-6 text-center text-gray-500">
          We're working hard to bring you live streaming capabilities. Stay
          tuned for updates!
        </Text>
      </View>
    </View>
  );
};

export default LiveStreamingScreen;
