"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Image,
} from "react-native";
import Video from "react-native-video";
import { VLCPlayer } from "react-native-vlc-media-player";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { API_URL } from "../../../config/apiConfig";
import { useFocusEffect } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");

const LiveStreamingScreen = ({ navigation }) => {
  const tabBarHeight = useBottomTabBarHeight(); // get tab bar height dynamically
  const { user, token } = useAuth();

  const dummyData = [
    {
      livestream_id: 29,
      color: "red",
      hls_url: null,
      title: "Stream 1",
      status: "live",
      peak_viewers: 60,
      seller_id: 1,
      store_name: "Aling Nena Store",
      store_logo_key:
        "https://ipvbxclkwidxsjvdyolb.supabase.co/storage/v1/object/public/vendor-assets/sellers/SELL70204724/store_logos/store_logo_1755770205878.jpeg",
      first_name: "Juan",
      last_name: "Luna",
    },
    {
      livestream_id: 30,
      color: "blue",
      hls_url: null,
      title: "Stream 2",
      status: "live",
      peak_viewers: 32,
      seller_id: 1,
      store_name: "Kanding Store",
      store_logo_key:
        "https://ipvbxclkwidxsjvdyolb.supabase.co/storage/v1/object/public/vendor-assets/sellers/SELL70204724/store_logos/store_logo_1755770205878.jpeg",
    },
    {
      livestream_id: 31,
      color: "green",
      hls_url: null,
      title: "Stream 3",
      status: "live",
      peak_viewers: 9,
      seller_id: 1,
      store_name: "Bingbong Store",
      store_logo_key:
        "https://ipvbxclkwidxsjvdyolb.supabase.co/storage/v1/object/public/vendor-assets/sellers/SELL70204724/store_logos/store_logo_1755770205878.jpeg",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [livestreams, setLivestreams] = useState([]);
  const [currentViewerId, setCurrentViewerId] = useState(null);
  const [videoStyle, setVideoStyle] = useState({
    width: screenWidth,
    height: screenHeight,
  });
  const [isLivestreamBuffering, setIslivestreamBuffering] = useState(false);

  const isInitialLivestreamRef = useRef(true);

  // For clean up function
  const currentViewerIdRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      const fetchLivestreams = async () => {
        try {
          setLoading(true);
          const response = await axios.get(
            `${API_URL}/api/livestream/active/all`
          );
          if (response.data.success) {
            setLivestreams(response.data.data.livestreams);
          }
        } catch (error) {
          console.error(
            "Error fetching livestreams:",
            error?.response?.data || error
          );
        } finally {
          setLoading(false);
        }
      };

      fetchLivestreams();

      return () => {
        const viewerId = currentViewerIdRef.current;
        if (viewerId) {
          console.log("Cleanup on livestreaming screen loses focus");
          removeViewerFromLivestream(viewerId);
          setCurrentViewerId(null);
          currentViewerIdRef.current = null;
          isInitialLivestreamRef.current = true;
        }
      };
    }, [])
  );

  const fetchViewerCount = async (livestreamId) => {
    if (!livestreamId) return;

    try {
      const response = await axios.get(
        `${API_URL}/api/livestream/${livestreamId}/viewer-count`
      );

      if (response.data.success) {
        setLivestreams((prev) =>
          prev.map((stream) =>
            stream.livestream_id === livestreamId
              ? { ...stream, peak_viewers: response.data.data.viewerCount }
              : stream
          )
        );
      }
    } catch (error) {
      console.error(
        "Error fetching viewer count:",
        error?.response?.error || error
      );
    }
  };

  const addViewerToLivestream = async (livestreamId) => {
    if (!user?.id || !livestreamId) return;

    console.log(`Adding livestream id ${livestreamId} as viewer`);

    try {
      await axios.post(
        `${API_URL}/api/livestream/${livestreamId}/viewer/add`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the viewers count
      fetchViewerCount(livestreamId);
    } catch (error) {
      console.error("Error adding viewer:", error?.response?.data || error);
    }
  };

  const removeViewerFromLivestream = async (livestreamId) => {
    if (!user?.id || !livestreamId) return;

    console.log(`Removing livestream id ${livestreamId} as viewer`);

    try {
      await axios.post(
        `${API_URL}/api/livestream/${livestreamId}/viewer/remove`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the viewers count
      fetchViewerCount(livestreamId);
    } catch (error) {
      console.error("Error removing viewer:", error?.response?.data || error);
    }
  };

  // ✅ Viewability config and callbacks
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 }).current;

  const onViewableItemsChanged = useCallback(
    async ({ viewableItems }) => {
      if (viewableItems.length > 0) {
        const newIndex = viewableItems[0].index;
        const previousIndex = currentIndex;

        const newId = viewableItems[0].item.livestream_id;
        const previousId = isInitialLivestreamRef.current
          ? viewableItems[0].item.livestream_id
          : currentViewerId;

        // Add viewer to initial livestream
        if (newIndex === previousIndex && isInitialLivestreamRef.current) {
          isInitialLivestreamRef.current = false;
          await addViewerToLivestream(newId);
        }

        // Remove viewer to previous livestream and add viewer to livestream
        if (newIndex !== previousIndex) {
          if (newId !== previousId) {
            await removeViewerFromLivestream(previousId);
          }

          // If not the "no more livestream" placeholder item
          if (newIndex < livestreams.length) await addViewerToLivestream(newId);
        }

        setCurrentIndex(newIndex);
        setCurrentViewerId(newId);
      }
    },
    [livestreams, currentIndex, currentViewerId]
  );

  useEffect(() => {
    currentViewerIdRef.current = currentViewerId;
  }, [currentViewerId]);

  useEffect(() => {
    return () => {
      const viewerId = currentViewerIdRef.current;
      if (viewerId) {
        console.log("Cleanup on unmount for livestreaming screen");
        removeViewerFromLivestream(viewerId);
        setCurrentViewerId(null);
        currentViewerIdRef.current = null;
        isInitialLivestreamRef.current = true;
      }
    };
  }, []);

  const handleVideoSizeChange = (event) => {
    if (event?.videoSize) {
      const { width: videoWidth, height: videoHeight } = event.videoSize;

      if (videoWidth && videoHeight) {
        const videoRatio = videoWidth / videoHeight;
        const screenRatio = screenWidth / screenHeight;
        const diff = Math.abs(videoRatio - screenRatio);

        let width, height;

        if (videoRatio > screenRatio) {
          // Video is wider than screen → scale by height
          height = screenHeight - tabBarHeight;
          width = height * videoRatio;
        } else {
          // Video is taller or same ratio → scale by width
          width = screenWidth;
          height = width / videoRatio;
        }

        setVideoStyle({
          width,
          height,
          alignSelf: "center",
        });
      }
    }
  };

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 bg-black">
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (livestreams.length === 0) {
    return (
      <View className="items-center justify-center flex-1 bg-black">
        <Text className="text-lg font-semibold text-white">
          No current livestream at the moment
        </Text>
        <Text className="mt-2 text-sm text-gray-400">
          Check back later for live content
        </Text>
      </View>
    );
  }

  const renderItem = ({ item, index }) => {
    // Show "end of livestreams" message after last video
    if (index === livestreams.length) {
      return (
        <View
          style={{ width: screenWidth, height: screenHeight - tabBarHeight }}
          className="items-center justify-center bg-black"
        >
          <Text className="mb-4 text-2xl font-bold text-white">
            No More Livestreams
          </Text>
          <Text className="px-8 text-center text-gray-400">
            You've reached the end. Swipe down to go back to previous
            livestreams.
          </Text>
        </View>
      );
    }

    return (
      <View
        style={{
          width: screenWidth,
          height: screenHeight - tabBarHeight,
        }}
        className="relative items-center justify-center overflow-hidden bg-black"
      >
        {/* Livestream player */}
        {item.hls_url && (
          <VLCPlayer
            // key={`vlc-${item.livestream_id}-${index === currentIndex}`}
            source={{ uri: item.hls_url }}
            style={videoStyle}
            // autoplay={index === currentIndex}
            // paused={!(index === currentIndex)}
            repeat={true}
            resizeMode="cover"
            onProgress={() => {}}
            onLoad={handleVideoSizeChange}
            onBuffering={(data) => {
              if (data.bufferRate === 100) {
                setIslivestreamBuffering(false);
              } else {
                setIslivestreamBuffering(true);
              }
            }}
            onError={(e) => console.error("VLC Player error:", e)}
          />
        )}

        {/* Overlay with livestream info */}
        <View className="absolute p-4 left-3 top-10">
          {/* Live status label */}
          <View
            className={`self-start px-3 py-2 rounded-md mb-3 ${item.status === "live" ? "bg-red-500" : "bg-gray-300"}`}
          >
            <Text className="inline-block font-bold text-white">
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>

          <TouchableOpacity
            className="p-4 mb-1 rounded-lg bg-black/70"
            onPress={() =>
              navigation.navigate("SellerStore", {
                sellerId: item.seller_id,
              })
            }
          >
            <View className="flex-row items-center gap-2 mb-1">
              {item.store_logo_key ? (
                <Image
                  source={{ uri: item.store_logo_key }}
                  className="w-8 h-8 rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full">
                  <Feather name="image" size={14} color="#9CA3AF" />
                </View>
              )}

              <Text className="text-sm font-medium text-white">
                {item.store_name}
              </Text>
            </View>
          </TouchableOpacity>

          <Text className="text-lg font-bold text-white">{item.title}</Text>

          {/* <Text className="text-sm text-gray-300">
            {item.first_name} {item.last_name}
          </Text> */}

          <Text className="text-xs text-gray-400 ">
            👥 {item.peak_viewers} viewers
          </Text>
        </View>

        {isLivestreamBuffering && (
          <View className="absolute">
            <ActivityIndicator size="large" color="white" />
          </View>
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={[...livestreams, { id: "end", isEnd: true }]}
      keyExtractor={(item) => item.livestream_id || item.id}
      renderItem={renderItem}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      scrollEventThrottle={16}
    />
  );
};

export default LiveStreamingScreen;
