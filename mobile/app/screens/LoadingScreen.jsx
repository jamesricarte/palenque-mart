import { View, ActivityIndicator } from "react-native"

const LoadingScreen = () => {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#F16B44" />
    </View>
  )
}

export default LoadingScreen
