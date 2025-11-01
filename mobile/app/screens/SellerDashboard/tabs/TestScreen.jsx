import React, { useState } from "react";
import { View, Button, StyleSheet } from "react-native";
import CameraPreview from "../../../utils/cameraPreview";
import { NativeModules } from "react-native";
const { RtmpTestModule } = NativeModules;

const RTMP_URL = "rtmp://rtmp.livepeer.com/live/f848-rv6a-wxrw-j35o";

const TestScreen = () => {
  const [isStreaming, setStreaming] = useState(false);
  const [cameraType, setCameraType] = useState("back");
  const [isMuted, setIsMuted] = useState(false);

  const handleChangeCamera = async () => {
    try {
      await RtmpTestModule.switchCamera();
    } catch (e) {
      console.error(e);
    }
  };

  async function toggleMute() {
    const currentlyMuted = await RtmpTestModule.isMuted();
    if (currentlyMuted) {
      await RtmpTestModule.unmuteAudio();
      console.log("🔊 Unmuted");
      setIsMuted(!currentlyMuted);
    } else {
      await RtmpTestModule.muteAudio();
      console.log("🔇 Muted");
      setIsMuted(!currentlyMuted);
    }
  }

  const startStream = async () => {
    try {
      await RtmpTestModule.startStream(RTMP_URL);
      setStreaming(true);
    } catch (e) {
      console.error(e);
    }
  };

  const stopStream = async () => {
    await RtmpTestModule.stopStream();
    setStreaming(false);
  };

  return (
    <View style={styles.container}>
      <CameraPreview
        style={styles.preview}
        camera="back" // or "back"
      />
      <Button title="Change Camera" onPress={handleChangeCamera} />
      <Button
        title={isMuted ? "Unmute Audio" : "Mute Audio"}
        onPress={toggleMute}
      />
      <Button
        title={isStreaming ? "Stop Stream" : "Start Stream"}
        onPress={isStreaming ? stopStream : startStream}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  preview: {
    flex: 1,
  },
});

export default TestScreen;
