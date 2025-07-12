import { Modal, View } from "react-native";

import LottieView from "lottie-react-native";
import { Modal as ModalPaper } from "react-native-paper";

const PersonalizedLoadingAnimation = ({ visible, modalType = "paper" }) => {
  if (modalType === "paper") {
    return (
      <ModalPaper transparent visible={visible}>
        <View className="absolute flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl left-1/2 top-1/2">
          <LottieView
            source={require("../assets/animations/loading/loading-animation-2-2differentcolors.json")}
            autoPlay
            loop
            style={{ width: 70, height: 30 }}
          />
        </View>
      </ModalPaper>
    );
  } else {
    return (
      <Modal transparent visible={visible}>
        <View className="absolute flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl left-1/2 top-1/2">
          <LottieView
            source={require("../assets/animations/loading/loading-animation-2-2differentcolors.json")}
            autoPlay
            loop
            style={{ width: 70, height: 30 }}
          />
        </View>
      </Modal>
    );
  }
};

export default PersonalizedLoadingAnimation;
