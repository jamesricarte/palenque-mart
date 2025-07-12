import { Modal, View, ActivityIndicator, Text } from "react-native";
import { Modal as ModalPaper } from "react-native-paper";

const DefaultLoadingAnimation = ({
  visible,
  size = "large",
  color = "black",
  version = 1,
}) => {
  if (version === 1) {
    return (
      <Modal transparent visible={visible}>
        <View className="absolute flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 rounded-xl left-1/2 top-1/2">
          <ActivityIndicator size={size} color={color} />
        </View>
      </Modal>
    );
  } else {
    return (
      <Modal transparent visible={visible}>
        <View className="absolute px-8 transform -translate-x-1/2 -translate-y-1/2 bg-black rounded-lg opacity-70 py-7 top-1/2 left-1/2">
          <ActivityIndicator size="large" color="white" />
        </View>
      </Modal>
    );
  }
};

export default DefaultLoadingAnimation;
