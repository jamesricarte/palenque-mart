"use client";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Image,
  Keyboard,
  ActivityIndicator,
  NativeModules,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { Camera } from "expo-camera";
import { API_URL } from "../../config/apiConfig";
import { useAuth } from "../../context/AuthContext";
import { useSeller } from "../../context/SellerContext";
import CameraPreview from "../../utils/cameraPreview";

import axios from "axios";

const { RtmpTestModule } = NativeModules;

const LivestreamSessionScreen = ({ route, navigation }) => {
  const navigationHook = useNavigation();
  const { user } = useAuth();
  const { sellerId, sellerProfileData, updateLivestreamViewerCount } =
    useSeller();
  const { streamTitle, streamDescription, thumbnail, selectedProducts } =
    route.params;

  const [showPreLive, setShowPreLive] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [showLiveStream, setShowLiveStream] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showProductSelectionModal, setShowProductSelectionModal] =
    useState(false);
  const [showProductPanel, setShowProductPanel] = useState(false);
  const [streamDuration, setStreamDuration] = useState(0);
  const [viewers, setViewers] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [cameraType, setCameraType] = useState("back");
  const [chatMessage, setChatMessage] = useState("");
  const [showChat, setShowChat] = useState(true);
  const [pinnedProduct, setPinnedProduct] = useState(null);
  const [keyBoardVisibility, setKeyboardVisibility] = useState(false);
  const [keyBoardHeight, setKeyBoardHeight] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const scrollViewRef = useRef(null);

  const [livestreamData, setLivestreamData] = useState(null);
  const [isCreatingLivestream, setIsCreatingLivestream] = useState(false);
  const [streamStarted, setStreamStarted] = useState(false);
  const [isStreamLive, setIsStreamLive] = useState(false);
  const [broadcastStartTime, setBroadcastStartTime] = useState(null);

  const [hasPermission, setHasPermission] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  const timerRef = useRef(null);
  const durationTimerRef = useRef(null);
  const webhookPollRef = useRef(null);

  const isEndingStreamRef = useRef(false);

  const [currentSelectedProducts, setCurrentSelectedProducts] =
    useState(selectedProducts);
  const [availableProducts, setAvailableProducts] = useState([
    {
      id: 1,
      name: "Fresh Lettuce",
      price: "₱50",
      emoji: "🥬",
      selected: false,
    },
    { id: 2, name: "Tilapia", price: "₱120", emoji: "🐟", selected: false },
    { id: 3, name: "Pork Belly", price: "₱280", emoji: "🥩", selected: false },
    {
      id: 4,
      name: "Fresh Tomatoes",
      price: "₱40",
      emoji: "🍅",
      selected: false,
    },
    {
      id: 5,
      name: "Chicken Breast",
      price: "₱200",
      emoji: "🐔",
      selected: false,
    },
    {
      id: 6,
      name: "Fresh Carrots",
      price: "₱35",
      emoji: "🥕",
      selected: false,
    },
  ]);

  const chatMessages = [
    { id: 1, user: "Buyer123", message: "Is the tilapia fresh?" },
    { id: 2, user: "AnaKusina", message: "Can I order 2kg pork belly?" },
    { id: 3, user: "FoodiePH", message: "How much for delivery?" },
  ];

  const storeInfo = {
    name: "Aling Nena Store",
    logo: "🏪",
    image_keys: null,
  };

  const fetchViewerCount = async (livestreamId) => {
    if (!livestreamId) return;

    try {
      const response = await axios.get(
        `${API_URL}/api/livestream/${livestreamId}/viewer-count`
      );

      if (response.data.success) {
        setViewers(response.data.data.viewerCount);
      }
    } catch (error) {
      console.error(
        "Error fetching viewer count:",
        error?.response?.error || error
      );
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  useEffect(() => {
    const keyboardDidHide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisibility(false);
      setKeyBoardHeight(0);
    });

    const keyboardDidShow = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyBoardHeight(e.endCoordinates.height);
      setKeyboardVisibility(true);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 0);
    });

    return () => {
      keyboardDidHide.remove();
      keyboardDidShow.remove();
    };
  }, []);

  useEffect(() => {
    if (showLiveStream) {
      const unsubscribe = navigationHook.addListener("beforeRemove", (e) => {
        if (!isEndingStreamRef.current) {
          e.preventDefault();
          Alert.alert(
            "End Stream?",
            "You are currently live. Please end the stream first.",
            [{ text: "OK", style: "cancel" }]
          );
        }
      });
      return unsubscribe;
    }
  }, [navigationHook, showLiveStream]);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(durationTimerRef.current);
      clearInterval(webhookPollRef.current);
    };
  }, []);

  useEffect(() => {
    if (showPreLive) {
      setCameraReady(true);
    }
  }, [showPreLive]);

  useEffect(() => {
    if (isStreamLive && broadcastStartTime) {
      durationTimerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - broadcastStartTime) / 1000);
        setStreamDuration(elapsed);
      }, 1000);

      return () => clearInterval(durationTimerRef.current);
    }
  }, [isStreamLive, broadcastStartTime]);

  // Check viewerCount update
  useEffect(() => {
    if (updateLivestreamViewerCount) {
      if (livestreamData?.livestreamId) {
        fetchViewerCount(livestreamData.livestreamId);
      }
    }
  }, [updateLivestreamViewerCount, livestreamData]);

  const initializeCamera = async () => {
    try {
      setCameraReady(true);
    } catch (error) {
      console.error("Failed to initialize camera:", error);
      Alert.alert("Error", "Failed to access camera");
    }
  };

  const createAndStartLivestream = async () => {
    if (!user || !user.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    try {
      setIsCreatingLivestream(true);

      const productIds = currentSelectedProducts.map((p) => p.id);

      // Step 1: Create livestream in backend (Livepeer + database)
      console.log(
        "Creating livestream via API:",
        `${API_URL}/api/livestream/create`
      );

      const createResponse = await axios.post(
        `${API_URL}/api/livestream/create`,
        {
          sellerId,
          title: streamTitle,
          description: streamDescription,
          thumbnailUrl: thumbnail,
          productIds: productIds,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const createData = createResponse.data;

      if (!createData.success) {
        Alert.alert(
          "Error",
          createData.message || "Failed to create livestream"
        );
        setIsCreatingLivestream(false);
        return;
      }

      const { livestreamId, streamKey, rtmpUrl } = createData.data;
      setLivestreamData({ livestreamId, streamKey, rtmpUrl });

      // Step 2: Start RTMP streaming from native module
      console.log("Starting RTMP stream with URL:", rtmpUrl);
      let rtmpStreamStarted = false;

      try {
        await RtmpTestModule.startStream(rtmpUrl);
        rtmpStreamStarted = true;
        console.log("RTMP stream started successfully");
      } catch (rtmpError) {
        console.error("RTMP start error:", rtmpError);
        Alert.alert("Error", "Failed to start camera stream");
        setShowPreLive(true);
        setIsCreatingLivestream(false);
        navigation.goBack();
        return;
      }

      // Step 3: Poll for webhook confirmation that stream is ready in Livepeer
      if (rtmpStreamStarted) {
        console.log("Waiting for stream.started webhook event...");
        let streamReady = false;
        let pollCount = 0;
        const maxPolls = 120; //  2 minutes timeout

        webhookPollRef.current = setInterval(async () => {
          pollCount++;
          try {
            const statusResponse = await axios.get(
              `${API_URL}/api/livestream/${livestreamId}/status`,
              {
                headers: {
                  Authorization: `Bearer ${user.token}`,
                },
              }
            );

            const statusData = statusResponse.data;

            if (statusData.data?.isReady) {
              streamReady = true;
              clearInterval(webhookPollRef.current);
              console.log("Stream is ready in Livepeer!");

              // Step 4: Mark as live and set broadcast start time
              const now = Date.now();
              const startTimeFromBackend = new Date(
                statusData.data?.startTime
              ).getTime();

              setShowLiveStream(true);
              setBroadcastStartTime(startTimeFromBackend);
              setIsStreamLive(true);
              setStreamStarted(true);
              setIsCreatingLivestream(false);
            } else if (pollCount >= maxPolls) {
              clearInterval(webhookPollRef.current);

              // Immediately update state and let React refresh UI
              setIsCreatingLivestream(false);
              setShowPreLive(true);

              // Give React a frame to update before heavy stuff
              setTimeout(async () => {
                await RtmpTestModule.stopStream();
                Alert.alert("Error", "Stream setup timeout. Please try again.");

                try {
                  await axios.post(
                    `${API_URL}/api/livestream/${livestreamId}/end`,
                    {
                      status: "cancelled",
                    }
                  );
                } catch (err) {
                  console.error("Failed to cancel stream:", err);
                }
              }, 100);
            }
          } catch (error) {
            console.error("Status poll error:", error);
          }
        }, 1000);
      }
    } catch (error) {
      console.error(
        "Create and start livestream error:",
        error?.response?.data || error
      );
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to start livestream. Please try again."
      );
      setIsCreatingLivestream(false);
    }
  };

  const handleGoLive = () => {
    setShowPreLive(false);
    setShowCountdown(true);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setShowCountdown(false);

          createAndStartLivestream();

          return 3;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCancelLivestream = () => {
    clearInterval(timerRef.current);
    setShowCountdown(false);
    setCountdown(3);
    setShowPreLive(true);
  };

  const handleCancelFromPreLive = () => {
    setCameraReady(false);
    navigation.goBack();
  };

  const handleEndStream = () => {
    Alert.alert("End Stream", "Are you sure you want to end this livestream?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "End Stream",
        onPress: async () => {
          try {
            // Step 1: Stop RTMP stream from native module
            console.log("Stopping RTMP stream...");
            await RtmpTestModule.stopStream();

            // Step 2: Notify backend to end stream and wait for stream.idle webhook
            console.log("Notifying backend to end stream...");

            const endResponse = await axios.post(
              `${API_URL}/api/livestream/${livestreamData.livestreamId}/end`,
              { status: "ended" }
            );

            const endData = endResponse.data;

            if (endData.success) {
              setCameraReady(false);
              clearInterval(durationTimerRef.current);
              isEndingStreamRef.current = true;

              navigation.replace("LivestreamSummary", {
                streamTitle,
                streamDuration,
                totalViewers: viewers,
                productsSold: 0,
              });
            } else {
              Alert.alert("Error", "Failed to end stream");
            }
          } catch (error) {
            console.error("Failed to end livestream:", error);
            Alert.alert("Error", "Failed to end stream");
          }
        },
      },
    ]);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleProductSelection = (productId) => {
    setAvailableProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? { ...product, selected: !product.selected }
          : product
      )
    );

    setCurrentSelectedProducts((prev) => {
      const product = availableProducts.find((p) => p.id === productId);
      const isCurrentlySelected = prev.some((p) => p.id === productId);

      if (isCurrentlySelected) {
        return prev.filter((p) => p.id !== productId);
      } else {
        return [...prev, product];
      }
    });
  };

  const handlePinProduct = (product) => {
    if (pinnedProduct && pinnedProduct.id === product.id) {
      setPinnedProduct(null);
    } else {
      setPinnedProduct(product);
    }
  };

  const handleChatToggle = (show) => {
    setShowChat(show);
    if (show) {
      setUnreadMessages(0);
    }
  };

  const handleSwitchCamera = async () => {
    try {
      await RtmpTestModule.switchCamera();
      const newCameraType = cameraType === "front" ? "back" : "front";
      setCameraType(newCameraType);
    } catch (error) {
      console.error("Switch camera error:", error);
      Alert.alert("Error", "Failed to switch camera");
    }
  };

  const handleToggleMic = async () => {
    try {
      const currentlyMuted = await RtmpTestModule.isMuted();
      if (currentlyMuted) {
        await RtmpTestModule.unmuteAudio();
        console.log("Audio unmuted");
      } else {
        await RtmpTestModule.muteAudio();
        console.log("Audio muted");
      }
      setMicOn(currentlyMuted);
    } catch (error) {
      console.error("Toggle mic error:", error);
      Alert.alert("Error", "Failed to toggle microphone");
    }
  };

  useEffect(() => {
    if (showLiveStream && !showChat) {
      const interval = setInterval(() => {
        setUnreadMessages((prev) => prev + 1);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [showLiveStream, showChat]);

  const StoreInfoCard = () => {
    if (isCreatingLivestream || showCountdown) {
      return null;
    }

    return (
      <View className="absolute z-10 px-3 py-2 rounded-lg top-28 left-4 bg-black/70">
        <View className="flex-row items-center gap-2 mb-1">
          {sellerProfileData.storeLogoUrl ? (
            <Image
              source={{ uri: sellerProfileData.storeLogoUrl }}
              className="w-8 h-8 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <View className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full">
              <Feather name="image" size={14} color="#9CA3AF" />
            </View>
          )}

          <Text className="text-sm font-medium text-white">
            {sellerProfileData.storeName}
          </Text>
        </View>
        <Text className="text-lg font-semibold text-white">{streamTitle}</Text>
      </View>
    );
  };

  const PinnedProductOverlay = ({ product }) => (
    <TouchableOpacity
      className={`absolute z-20 p-2 rounded-lg left-4 bg-white shadow-lg ${showLiveStream ? "top-64 mt-4" : "top-52"}`}
    >
      <View className="flex-row items-center">
        <View className="items-center justify-center w-12 h-12 mr-3 bg-gray-100 border border-gray-200 rounded-lg">
          <Text className="text-lg">{product.emoji}</Text>
        </View>
        <View>
          <Text className="text-sm font-medium text-black">{product.name}</Text>
          <Text className="text-sm font-bold text-green-400">
            {product.price}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setPinnedProduct(null)}
          className="ml-2"
        >
          <Ionicons name="close" size={16} color="black" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (hasPermission === null) {
    return (
      <View className="items-center justify-center flex-1 bg-gray-50">
        <ActivityIndicator size="large" color="#ea580c" />
        <Text className="mt-4 text-gray-600">
          Requesting camera permissions...
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View className="items-center justify-center flex-1 bg-gray-50">
        <Ionicons name="camera-off" size={48} color="#ef4444" />
        <Text className="mt-4 text-lg font-semibold text-gray-900">
          No Camera Access
        </Text>
        <Text className="mt-2 text-center text-gray-600">
          Please enable camera permissions in your device settings.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      <View className="items-center justify-center flex-1">
        <View
          className="w-full"
          style={{ aspectRatio: 9 / 16, maxHeight: "100%" }}
        >
          {cameraReady && (
            <CameraPreview
              style={{ width: "100%", height: "100%" }}
              camera={cameraType}
            />
          )}
        </View>
      </View>

      {isCreatingLivestream && (
        <View className="absolute inset-0 items-center justify-center bg-black/50">
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="mt-4 text-white">Starting stream...</Text>
        </View>
      )}

      {showPreLive && (
        <View className="absolute top-0 flex-row items-center justify-between w-full px-4 pt-16 pb-5">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={handleCancelFromPreLive}
              className="mr-3"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-xl font-semibold text-white">
              Ready to Go Live
            </Text>
          </View>
        </View>
      )}

      {isStreamLive && (
        <View className="absolute top-0 left-0 right-0 z-10 flex-row items-center justify-between px-4 pt-16 pb-4 ">
          <View className="flex-row items-center">
            <View className="w-3 h-3 mr-2 bg-red-500 rounded-full" />
            <Text className="font-semibold text-white">
              LIVE – {formatDuration(streamDuration)} elapsed
            </Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center px-3 py-2 bg-red-600 rounded-lg"
            onPress={handleEndStream}
          >
            <Text className="mr-1 font-medium text-white">End Stream</Text>
            <Ionicons name="close" size={16} color="white" />
          </TouchableOpacity>
        </View>
      )}

      <StoreInfoCard />

      {isStreamLive && (
        <View className="absolute px-3 py-2 rounded-full top-52 left-4 bg-black/50">
          <View className="flex-row items-center">
            <Ionicons name="people" size={16} color="white" />
            <Text className="ml-2 font-medium text-white">
              Viewers: {viewers}
            </Text>
          </View>
        </View>
      )}

      {pinnedProduct && !showCountdown && (
        <PinnedProductOverlay product={pinnedProduct} />
      )}

      <View className="absolute -translate-y-1/2 right-4 top-1/2">
        <View className="p-3 mb-3 rounded-full bg-black/50">
          <TouchableOpacity onPress={handleToggleMic}>
            <Ionicons
              name={micOn ? "mic" : "mic-off"}
              size={24}
              color={micOn ? "white" : "#ef4444"}
            />
          </TouchableOpacity>
        </View>
        <View className="p-3 mb-3 rounded-full bg-black/50">
          <TouchableOpacity onPress={handleSwitchCamera}>
            <Ionicons name="camera-reverse" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Hidden for now */}
        <View className="hidden p-3 mb-3 rounded-full bg-black/50">
          <TouchableOpacity
            onPress={() => setShowProductPanel(!showProductPanel)}
          >
            <MaterialCommunityIcons
              name="package-variant"
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </View>

      {showPreLive && (
        <View className="absolute bottom-0 w-full p-4 bg-black/50">
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 py-3 border rounded-lg border-white/30"
              onPress={handleCancelFromPreLive}
            >
              <Text className="font-medium text-center text-white">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 bg-orange-600 rounded-lg shadow-sm"
              onPress={handleGoLive}
            >
              <Text className="font-medium text-center text-white">
                Go Live
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showCountdown && (
        <View className="absolute inset-0 items-center justify-center bg-black/50">
          <TouchableOpacity
            className="absolute p-2 rounded-full top-16 right-4 bg-black/70"
            onPress={handleCancelLivestream}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>

          <Text className="font-bold text-white text-8xl">{countdown}</Text>
          <Text className="mt-4 text-xl text-white">Going live...</Text>
        </View>
      )}

      {/* Hidden for now / intentionally added false */}
      {showLiveStream && !showChat && false && (
        <TouchableOpacity
          className="absolute p-3 rounded-full bottom-4 right-4 bg-black/50"
          onPress={() => handleChatToggle(true)}
        >
          <Ionicons name="chatbubbles" size={24} color="white" />
          {unreadMessages > 0 && (
            <View className="absolute flex items-center justify-center h-5 bg-red-500 rounded-full -top-1 -right-1 min-w-5">
              <View className="w-3 h-3 bg-red-500 rounded-full" />
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* Hidden for now / intentionally added false */}
      {showLiveStream && showChat && false && (
        <View
          className="absolute left-0 right-0 p-3 rounded-lg bg-black/70"
          style={{ bottom: keyBoardHeight + 16 }}
        >
          <View
            className={`flex-row gap-3 h-52 ${keyBoardVisibility ? "max-h-64" : "max-h-96"}`}
          >
            <View className="justify-center">
              <TouchableOpacity
                className="p-1"
                onPress={() => handleChatToggle(false)}
              >
                <Ionicons name="chevron-forward" size={16} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView
              ref={scrollViewRef}
              className="mb-2"
              showsVerticalScrollIndicator={false}
            >
              {chatMessages.map((msg) => (
                <View key={msg.id} className="mb-2">
                  <Text className="text-sm text-white">
                    <Text className="font-semibold">{msg.user}:</Text>{" "}
                    {msg.message}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          <TextInput
            className="px-3 py-2 text-sm text-white rounded-full bg-white/20"
            placeholder="Type a message..."
            placeholderTextColor="#ffffff80"
            value={chatMessage}
            onChangeText={setChatMessage}
          />
        </View>
      )}

      <Modal
        visible={showProductPanel}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowProductPanel(false)}
      >
        <View className="justify-end flex-1 bg-black/50">
          <View className="bg-white rounded-t-lg">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold">Featured Products</Text>
              <TouchableOpacity onPress={() => setShowProductPanel(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView className="p-4">
              {currentSelectedProducts.map((product) => (
                <View
                  key={product.id}
                  className="flex-row items-center justify-between p-4 mb-3 bg-white border border-gray-200 rounded-lg shadow-sm"
                >
                  <View className="flex-row items-center flex-1">
                    <View className="items-center justify-center w-12 h-12 mr-3 bg-gray-100 border border-gray-200 rounded-lg">
                      <Text className="text-lg">{product.emoji}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-medium text-gray-900">
                        {product.name}
                      </Text>
                      <Text className="font-bold text-green-600">
                        {product.price}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    className={`px-3 py-2 rounded-lg ${
                      pinnedProduct && pinnedProduct.id === product.id
                        ? "bg-orange-600"
                        : "bg-orange-100"
                    }`}
                    onPress={() => handlePinProduct(product)}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        pinnedProduct && pinnedProduct.id === product.id
                          ? "text-white"
                          : "text-orange-600"
                      }`}
                    >
                      {pinnedProduct && pinnedProduct.id === product.id
                        ? "Unpin"
                        : "Pin"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                className="flex-row items-center justify-center p-4 mt-2 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50"
                onPress={() => {
                  setShowProductSelectionModal(true);
                }}
              >
                <Ionicons name="add" size={20} color="#ea580c" />
                <Text className="ml-2 font-medium text-orange-600">
                  Add More Products
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showProductSelectionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowProductSelectionModal(false)}
      >
        <View className="justify-end flex-1 bg-black/50">
          <View className="bg-white rounded-t-lg max-h-96">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold">Select Products</Text>
              <TouchableOpacity
                onPress={() => setShowProductSelectionModal(false)}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView className="p-4">
              {availableProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  className="flex-row items-center p-4 mb-3 bg-white border border-gray-200 rounded-lg shadow-sm"
                  onPress={() => handleProductSelection(product.id)}
                >
                  <View className="items-center justify-center w-12 h-12 mr-3 bg-gray-100 border border-gray-200 rounded-lg">
                    <Text className="text-lg">{product.emoji}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">
                      {product.name}
                    </Text>
                    <Text className="font-bold text-green-600">
                      {product.price}
                    </Text>
                  </View>
                  <View className="w-6 h-6 border-2 border-gray-300 rounded-full">
                    {product.selected && (
                      <View className="w-full h-full bg-orange-600 rounded-full" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LivestreamSessionScreen;
