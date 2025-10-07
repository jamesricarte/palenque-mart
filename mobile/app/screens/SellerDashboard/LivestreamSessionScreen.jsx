// "use client";

// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   TextInput,
//   Alert,
//   Modal,
//   Image,
//   Keyboard,
//   ActivityIndicator,
// } from "react-native";
// import { useEffect, useRef, useState } from "react";
// import { StatusBar } from "expo-status-bar";
// import Feather from "@expo/vector-icons/Feather";
// import Ionicons from "@expo/vector-icons/Ionicons";
// import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
// import { useNavigation } from "@react-navigation/native";
// import { RTCPeerConnection, RTCView, mediaDevices } from "react-native-webrtc";
// import { Camera } from "expo-camera";
// import axios from "axios";
// import { API_URL } from "../../config/apiConfig";
// import { useAuth } from "../../context/AuthContext";

// const LivestreamSessionScreen = ({ route, navigation }) => {
//   const navigationHook = useNavigation();
//   const { user } = useAuth();
//   const { streamTitle, streamDescription, thumbnail, selectedProducts } =
//     route.params;

//   const [showPreLive, setShowPreLive] = useState(true);
//   const [showCountdown, setShowCountdown] = useState(false);
//   const [showLiveStream, setShowLiveStream] = useState(false);
//   const [countdown, setCountdown] = useState(3);
//   const [showProductSelectionModal, setShowProductSelectionModal] =
//     useState(false);
//   const [showProductPanel, setShowProductPanel] = useState(false);
//   const [streamDuration, setStreamDuration] = useState(0);
//   const [viewers, setViewers] = useState(0);
//   const [micOn, setMicOn] = useState(true);
//   const [cameraType, setCameraType] = useState("back");
//   const [chatMessage, setChatMessage] = useState("");
//   const [showChat, setShowChat] = useState(true);
//   const [pinnedProduct, setPinnedProduct] = useState(null);
//   const [keyBoardVisibility, setKeyboardVisibility] = useState(false);
//   const [keyBoardHeight, setKeyBoardHeight] = useState(false);
//   const [unreadMessages, setUnreadMessages] = useState(0);
//   const scrollViewRef = useRef(null);

//   const [livestreamData, setLivestreamData] = useState(null);
//   const [isCreatingLivestream, setIsCreatingLivestream] = useState(false);
//   const [streamStarted, setStreamStarted] = useState(false);

//   const [hasPermission, setHasPermission] = useState(null);
//   const [localStream, setLocalStream] = useState(null);
//   const janusSessionIdRef = useRef(null);
//   const janusHandleIdRef = useRef(null);
//   const publisherIdRef = useRef(null);
//   const peerConnectionRef = useRef(null);
//   const pollingIntervalRef = useRef(null);

//   const timerRef = useRef(null);
//   const durationTimerRef = useRef(null);

//   const isEndingStreamRef = useRef(false);

//   const [currentSelectedProducts, setCurrentSelectedProducts] =
//     useState(selectedProducts);
//   const [availableProducts, setAvailableProducts] = useState([
//     {
//       id: 1,
//       name: "Fresh Lettuce",
//       price: "₱50",
//       emoji: "🥬",
//       selected: false,
//     },
//     { id: 2, name: "Tilapia", price: "₱120", emoji: "🐟", selected: false },
//     { id: 3, name: "Pork Belly", price: "₱280", emoji: "🥩", selected: false },
//     {
//       id: 4,
//       name: "Fresh Tomatoes",
//       price: "₱40",
//       emoji: "🍅",
//       selected: false,
//     },
//     {
//       id: 5,
//       name: "Chicken Breast",
//       price: "₱200",
//       emoji: "🐔",
//       selected: false,
//     },
//     {
//       id: 6,
//       name: "Fresh Carrots",
//       price: "₱35",
//       emoji: "🥕",
//       selected: false,
//     },
//   ]);

//   const chatMessages = [
//     { id: 1, user: "Buyer123", message: "Is the tilapia fresh?" },
//     { id: 2, user: "AnaKusina", message: "Can I order 2kg pork belly?" },
//     { id: 3, user: "FoodiePH", message: "How much for delivery?" },
//   ];

//   const storeInfo = {
//     name: "Aling Nena Store",
//     logo: "🏪",
//     image_keys: null,
//   };

//   const JANUS_REST_URL = "http://192.168.145.232:8088/janus";

//   useEffect(() => {
//     (async () => {
//       const { status } = await Camera.requestCameraPermissionsAsync();
//       setHasPermission(status === "granted");
//     })();
//   }, []);

//   useEffect(() => {
//     const keyboardDidHide = Keyboard.addListener("keyboardDidHide", () => {
//       setKeyboardVisibility(false);
//       setKeyBoardHeight(0);
//     });

//     const keyboardDidShow = Keyboard.addListener("keyboardDidShow", (e) => {
//       setKeyBoardHeight(e.endCoordinates.height);
//       setKeyboardVisibility(true);
//       setTimeout(() => {
//         scrollViewRef.current?.scrollToEnd({ animated: true });
//       }, 0);
//     });

//     return () => {
//       keyboardDidHide.remove();
//       keyboardDidShow.remove();
//     };
//   }, []);

//   useEffect(() => {
//     if (showLiveStream) {
//       const unsubscribe = navigationHook.addListener("beforeRemove", (e) => {
//         if (!isEndingStreamRef.current) {
//           e.preventDefault();
//           Alert.alert(
//             "End Stream?",
//             "You are currently live. Please end the stream first.",
//             [{ text: "OK", style: "cancel" }]
//           );
//         }
//       });
//       return unsubscribe;
//     }
//   }, [navigationHook, showLiveStream]);

//   useEffect(() => {
//     return () => {
//       clearInterval(timerRef.current);
//       clearInterval(durationTimerRef.current);
//       if (pollingIntervalRef.current) {
//         clearInterval(pollingIntervalRef.current);
//       }
//       if (localStream) {
//         localStream.getTracks().forEach((track) => track.stop());
//       }
//       if (peerConnectionRef.current) {
//         peerConnectionRef.current.close();
//       }
//       // Destroy Janus session if exists
//       if (janusSessionIdRef.current) {
//         destroyJanusSession();
//       }
//     };
//   }, []);

//   useEffect(() => {
//     if (showPreLive && !localStream) {
//       initializeCamera();
//     }
//   }, [showPreLive]);

//   const initializeCamera = async () => {
//     try {
//       const stream = await mediaDevices.getUserMedia({
//         video: {
//           facingMode: cameraType === "front" ? "user" : "environment",
//           width: { ideal: 1280 },
//           height: { ideal: 720 },
//         },
//         audio: micOn,
//       });
//       setLocalStream(stream);
//     } catch (error) {
//       console.error("Failed to get camera stream:", error);
//       Alert.alert("Error", "Failed to access camera");
//     }
//   };

//   const createAndStartLivestream = async () => {
//     if (!user || !user.id) {
//       Alert.alert("Error", "User not authenticated");
//       return;
//     }

//     try {
//       setIsCreatingLivestream(true);

//       const productIds = currentSelectedProducts.map((p) => p.id);

//       // Step 1: Create livestream in backend (Livepeer + database)
//       const response = await axios.post(
//         `${API_URL}/api/livestream/create-and-start`,
//         {
//           sellerId: user.id,
//           title: streamTitle,
//           description: streamDescription,
//           thumbnailUrl: thumbnail,
//           productIds: productIds,
//         }
//       );

//       if (!response.data.success) {
//         Alert.alert(
//           "Error",
//           response.data.message || "Failed to create livestream"
//         );
//         setIsCreatingLivestream(false);
//         return;
//       }

//       const { livestreamId, streamKey, srtUrl, hlsUrl } = response.data.data;
//       setLivestreamData({ livestreamId, streamKey, srtUrl, hlsUrl });

//       // Step 2: Start FFmpeg bridge (must be listening before Janus forwards)
//       const bridgeResponse = await axios.post(
//         `${API_URL}/api/livestream/start-bridge`,
//         {
//           livestreamId,
//           srtUrl,
//         }
//       );

//       if (!bridgeResponse.data.success) {
//         Alert.alert("Error", "Failed to start FFmpeg bridge");
//         setIsCreatingLivestream(false);
//         return;
//       }

//       const { audioPort, videoPort } = bridgeResponse.data.data;

//       // Step 3: Connect to Janus via REST and publish WebRTC stream
//       await startJanusPublishREST({ livestreamId, audioPort, videoPort });

//       setIsCreatingLivestream(false);
//       setStreamStarted(true);

//       durationTimerRef.current = setInterval(() => {
//         setStreamDuration((prev) => prev + 1);
//       }, 1000);

//       Alert.alert("Success", "Livestream started!");
//     } catch (error) {
//       console.error(
//         "Create and start livestream error:",
//         error?.response?.data || error
//       );
//       Alert.alert(
//         "Error",
//         error.response?.data?.message ||
//           "Failed to start livestream. Please try again."
//       );
//       setIsCreatingLivestream(false);
//     }
//   };

//   const startJanusPublishREST = async ({
//     livestreamId,
//     audioPort,
//     videoPort,
//   }) => {
//     try {
//       const roomId = livestreamId;

//       console.log("[v0] Creating Janus session via REST");

//       // Step 1: Create Janus session
//       const sessionResponse = await axios.post(JANUS_REST_URL, {
//         janus: "create",
//         transaction: generateTransactionId(),
//       });

//       if (sessionResponse.data.janus !== "success") {
//         throw new Error("Failed to create Janus session");
//       }

//       const sessionId = sessionResponse.data.data.id;
//       janusSessionIdRef.current = sessionId;
//       console.log("[v0] Janus session created:", sessionId);

//       // Step 2: Attach to VideoRoom plugin
//       const attachResponse = await axios.post(
//         `${JANUS_REST_URL}/${sessionId}`,
//         {
//           janus: "attach",
//           plugin: "janus.plugin.videoroom",
//           transaction: generateTransactionId(),
//         }
//       );

//       if (attachResponse.data.janus !== "success") {
//         throw new Error("Failed to attach to VideoRoom plugin");
//       }

//       const handleId = attachResponse.data.data.id;
//       janusHandleIdRef.current = handleId;
//       console.log("[v0] Attached to VideoRoom plugin, handle:", handleId);

//       // Step 3: Join room as publisher
//       const joinResponse = await axios.post(
//         `${JANUS_REST_URL}/${sessionId}/${handleId}`,
//         {
//           janus: "message",
//           transaction: generateTransactionId(),
//           body: {
//             request: "join",
//             room: roomId,
//             ptype: "publisher",
//             display: user.first_name || "Streamer",
//           },
//         }
//       );

//       console.log("[v0] Join response:", joinResponse.data);

//       // Step 4: Start long polling for events
//       startLongPolling(sessionId, handleId, roomId, audioPort, videoPort);

//       // Step 5: Create WebRTC peer connection and offer
//       await createOfferAndPublish(
//         sessionId,
//         handleId,
//         roomId,
//         audioPort,
//         videoPort
//       );
//     } catch (error) {
//       console.error("[v0] Janus REST error:", error?.response?.data || error);
//       throw error;
//     }
//   };

//   const createOfferAndPublish = async (
//     sessionId,
//     handleId,
//     roomId,
//     audioPort,
//     videoPort
//   ) => {
//     try {
//       console.log("[v0] Creating WebRTC peer connection");

//       // Create RTCPeerConnection
//       const configuration = {
//         iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//       };
//       const pc = new RTCPeerConnection(configuration);
//       peerConnectionRef.current = pc;

//       // Add local stream tracks to peer connection
//       if (localStream) {
//         localStream.getTracks().forEach((track) => {
//           pc.addTrack(track, localStream);
//         });
//       }

//       // Handle ICE candidates
//       pc.onicecandidate = (event) => {
//         if (event.candidate) {
//           console.log("[v0] ICE candidate:", event.candidate);
//           // Send trickle candidate to Janus
//           sendTrickleCandidate(sessionId, handleId, event.candidate);
//         }
//       };

//       // Create offer
//       const offer = await pc.createOffer({
//         offerToReceiveAudio: false,
//         offerToReceiveVideo: false,
//       });

//       await pc.setLocalDescription(offer);

//       console.log("[v0] Created offer, sending publish request");

//       // Send offer to Janus
//       const publishResponse = await axios.post(
//         `${JANUS_REST_URL}/${sessionId}/${handleId}`,
//         {
//           janus: "message",
//           transaction: generateTransactionId(),
//           body: {
//             request: "publish",
//             audio: true,
//             video: true,
//           },
//           jsep: {
//             type: offer.type,
//             sdp: offer.sdp,
//           },
//         }
//       );

//       console.log("[v0] Publish response:", publishResponse.data);

//       // The answer will come via long polling
//       // We'll handle it in the polling function
//     } catch (error) {
//       console.error("[v0] Create offer error:", error);
//       throw error;
//     }
//   };

//   const startLongPolling = (
//     sessionId,
//     handleId,
//     roomId,
//     audioPort,
//     videoPort
//   ) => {
//     console.log("[v0] Starting long polling for Janus events");

//     const poll = async () => {
//       try {
//         const response = await axios.get(
//           `${JANUS_REST_URL}/${sessionId}?maxev=1`,
//           { timeout: 30000 }
//         );

//         if (response.data.janus === "event") {
//           const pluginData = response.data.plugindata;
//           const jsep = response.data.jsep;

//           if (pluginData && pluginData.data) {
//             const data = pluginData.data;
//             console.log("[v0] VideoRoom event:", data);

//             // Handle "joined" event
//             if (data.videoroom === "joined") {
//               const myId = data.id;
//               publisherIdRef.current = myId;
//               console.log(
//                 "[v0] Successfully joined as publisher with id",
//                 myId
//               );
//             }

//             // Handle "event" with configured
//             if (data.videoroom === "event" && data.configured === "ok") {
//               console.log("[v0] Publishing configured successfully");

//               // Get stream info to determine mids
//               const streams = data.streams || [];
//               let audioMid = "0";
//               let videoMid = "1";

//               for (const s of streams) {
//                 if (s.type === "audio") audioMid = s.mid || audioMid;
//                 if (s.type === "video") videoMid = s.mid || videoMid;
//               }

//               console.log("[v0] Audio mid:", audioMid, "Video mid:", videoMid);

//               // Request Janus to forward RTP to FFmpeg ports
//               const forwardRequest = {
//                 request: "rtp_forward",
//                 room: roomId,
//                 publisher_id: publisherIdRef.current,
//                 host: "127.0.0.1",
//                 streams: [
//                   { mid: audioMid, port: audioPort },
//                   { mid: videoMid, port: videoPort },
//                 ],
//               };

//               console.log("[v0] Sending rtp_forward request", forwardRequest);

//               await axios.post(`${JANUS_REST_URL}/${sessionId}/${handleId}`, {
//                 janus: "message",
//                 transaction: generateTransactionId(),
//                 body: forwardRequest,
//               });

//               console.log("[v0] RTP forward configured");
//             }
//           }

//           // Handle JSEP (SDP answer from Janus)
//           if (jsep && peerConnectionRef.current) {
//             console.log("[v0] Received JSEP answer from Janus");
//             await peerConnectionRef.current.setRemoteDescription({
//               type: jsep.type,
//               sdp: jsep.sdp,
//             });
//             console.log("[v0] Set remote description");
//           }
//         }

//         // Handle keepalive
//         if (response.data.janus === "keepalive") {
//           console.log("[v0] Keepalive received");
//         }
//       } catch (error) {
//         if (error.code !== "ECONNABORTED") {
//           console.error("[v0] Long polling error:", error.message);
//         }
//       }
//     };

//     // Poll every 1 second
//     pollingIntervalRef.current = setInterval(poll, 1000);
//   };

//   const sendTrickleCandidate = async (sessionId, handleId, candidate) => {
//     try {
//       await axios.post(`${JANUS_REST_URL}/${sessionId}/${handleId}`, {
//         janus: "trickle",
//         transaction: generateTransactionId(),
//         candidate: {
//           candidate: candidate.candidate,
//           sdpMid: candidate.sdpMid,
//           sdpMLineIndex: candidate.sdpMLineIndex,
//         },
//       });
//     } catch (error) {
//       console.error("[v0] Trickle candidate error:", error);
//     }
//   };

//   const destroyJanusSession = async () => {
//     try {
//       if (janusSessionIdRef.current) {
//         await axios.post(`${JANUS_REST_URL}/${janusSessionIdRef.current}`, {
//           janus: "destroy",
//           transaction: generateTransactionId(),
//         });
//         console.log("[v0] Janus session destroyed");
//       }
//     } catch (error) {
//       console.error("[v0] Destroy session error:", error);
//     }
//   };

//   const generateTransactionId = () => {
//     return Math.random().toString(36).substring(2, 15);
//   };

//   const handleGoLive = () => {
//     setShowPreLive(false);
//     setShowCountdown(true);

//     timerRef.current = setInterval(() => {
//       setCountdown((prev) => {
//         if (prev <= 1) {
//           clearInterval(timerRef.current);
//           setShowCountdown(false);
//           setShowLiveStream(true);

//           createAndStartLivestream();

//           return 3;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//   };

//   const handleCancelLivestream = () => {
//     clearInterval(timerRef.current);
//     setShowCountdown(false);
//     setCountdown(3);
//     setShowPreLive(true);
//   };

//   const handleCancelFromPreLive = () => {
//     if (localStream) {
//       localStream.getTracks().forEach((track) => track.stop());
//       setLocalStream(null);
//     }
//     navigation.goBack();
//   };

//   const handleEndStream = () => {
//     Alert.alert("End Stream", "Are you sure you want to end this livestream?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "End Stream",
//         onPress: async () => {
//           if (pollingIntervalRef.current) {
//             clearInterval(pollingIntervalRef.current);
//           }

//           if (peerConnectionRef.current) {
//             peerConnectionRef.current.close();
//             peerConnectionRef.current = null;
//           }

//           // Destroy Janus session
//           await destroyJanusSession();
//           janusSessionIdRef.current = null;
//           janusHandleIdRef.current = null;

//           if (localStream) {
//             localStream.getTracks().forEach((track) => track.stop());
//             setLocalStream(null);
//           }

//           clearInterval(durationTimerRef.current);

//           if (livestreamData) {
//             try {
//               const response = await axios.post(
//                 `${API_URL}/api/livestream/${livestreamData.livestreamId}/end`
//               );

//               isEndingStreamRef.current = true;

//               navigation.replace("LivestreamSummary", {
//                 streamTitle,
//                 streamDuration,
//                 totalViewers: viewers,
//                 productsSold: 43,
//               });
//             } catch (error) {
//               console.error("Failed to end livestream:", error);

//               isEndingStreamRef.current = true;
//               navigation.replace("LivestreamSummary", {
//                 streamTitle,
//                 streamDuration,
//                 totalViewers: viewers,
//                 productsSold: 43,
//               });
//             }
//           }
//         },
//       },
//     ]);
//   };

//   const formatDuration = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, "0")}`;
//   };

//   const handleProductSelection = (productId) => {
//     setAvailableProducts((prev) =>
//       prev.map((product) =>
//         product.id === productId
//           ? { ...product, selected: !product.selected }
//           : product
//       )
//     );

//     setCurrentSelectedProducts((prev) => {
//       const product = availableProducts.find((p) => p.id === productId);
//       const isCurrentlySelected = prev.some((p) => p.id === productId);

//       if (isCurrentlySelected) {
//         return prev.filter((p) => p.id !== productId);
//       } else {
//         return [...prev, product];
//       }
//     });
//   };

//   const handlePinProduct = (product) => {
//     if (pinnedProduct && pinnedProduct.id === product.id) {
//       setPinnedProduct(null);
//     } else {
//       setPinnedProduct(product);
//     }
//   };

//   const handleChatToggle = (show) => {
//     setShowChat(show);
//     if (show) {
//       setUnreadMessages(0);
//     }
//   };

//   const handleSwitchCamera = async () => {
//     const newCameraType = cameraType === "front" ? "back" : "front";
//     setCameraType(newCameraType);

//     if (localStream) {
//       localStream.getTracks().forEach((track) => track.stop());

//       try {
//         const newStream = await mediaDevices.getUserMedia({
//           video: {
//             facingMode: newCameraType === "front" ? "user" : "environment",
//             width: { ideal: 1280 },
//             height: { ideal: 720 },
//           },
//           audio: micOn,
//         });
//         setLocalStream(newStream);

//         if (peerConnectionRef.current && showLiveStream) {
//           const videoTrack = newStream.getVideoTracks()[0];
//           const sender = peerConnectionRef.current
//             .getSenders()
//             .find((s) => s.track && s.track.kind === "video");
//           if (sender) {
//             sender.replaceTrack(videoTrack);
//             console.log("[v0] Camera switched, track replaced");
//           }
//         }
//       } catch (error) {
//         console.error("Failed to switch camera:", error);
//         Alert.alert("Error", "Failed to switch camera");
//       }
//     }
//   };

//   const handleToggleMic = () => {
//     setMicOn((prev) => {
//       const newMicState = !prev;
//       if (localStream) {
//         const audioTrack = localStream.getAudioTracks()[0];
//         if (audioTrack) {
//           audioTrack.enabled = newMicState;
//         }
//       }
//       return newMicState;
//     });
//   };

//   useEffect(() => {
//     if (showLiveStream && !showChat) {
//       const interval = setInterval(() => {
//         setUnreadMessages((prev) => prev + 1);
//       }, 2000);
//       return () => clearInterval(interval);
//     }
//   }, [showLiveStream, showChat]);

//   const StoreInfoCard = ({ storeInfo }) => (
//     <View className="absolute z-10 px-3 py-2 rounded-lg top-28 left-4 bg-black/70">
//       <View className="flex-row items-center gap-2 mb-1">
//         {storeInfo.image_keys ? (
//           <Image
//             source={{ uri: storeInfo.image_keys }}
//             className="w-8 h-8 rounded-full"
//             resizeMode="cover"
//           />
//         ) : (
//           <View className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full">
//             <Feather name="image" size={14} color="#9CA3AF" />
//           </View>
//         )}

//         <Text className="text-sm font-medium text-white">{storeInfo.name}</Text>
//       </View>
//       <Text className="text-lg font-semibold text-white">{streamTitle}</Text>
//     </View>
//   );

//   const PinnedProductOverlay = ({ product }) => (
//     <TouchableOpacity
//       className={`absolute z-20 p-2 rounded-lg left-4 bg-white shadow-lg ${showLiveStream ? "top-64 mt-4" : "top-52"}`}
//     >
//       <View className="flex-row items-center">
//         <View className="items-center justify-center w-12 h-12 mr-3 bg-gray-100 border border-gray-200 rounded-lg">
//           <Text className="text-lg">{product.emoji}</Text>
//         </View>
//         <View>
//           <Text className="text-sm font-medium text-black">{product.name}</Text>
//           <Text className="text-sm font-bold text-green-400">
//             {product.price}
//           </Text>
//         </View>
//         <TouchableOpacity
//           onPress={() => setPinnedProduct(null)}
//           className="ml-2"
//         >
//           <Ionicons name="close" size={16} color="black" />
//         </TouchableOpacity>
//       </View>
//     </TouchableOpacity>
//   );

//   if (hasPermission === null) {
//     return (
//       <View className="items-center justify-center flex-1 bg-gray-50">
//         <ActivityIndicator size="large" color="#3b82f6" />
//         <Text className="mt-4 text-gray-600">
//           Requesting camera permissions...
//         </Text>
//       </View>
//     );
//   }

//   if (hasPermission === false) {
//     return (
//       <View className="items-center justify-center flex-1 bg-gray-50">
//         <Ionicons name="camera-off" size={48} color="#ef4444" />
//         <Text className="mt-4 text-lg font-semibold text-gray-900">
//           No Camera Access
//         </Text>
//         <Text className="mt-2 text-center text-gray-600">
//           Please enable camera permissions in your device settings.
//         </Text>
//       </View>
//     );
//   }

//   return (
//     <View className="flex-1 bg-black">
//       <StatusBar style="light" />
//       <View className="items-center justify-center flex-1">
//         <View
//           className="w-full"
//           style={{ aspectRatio: 9 / 16, maxHeight: "100%" }}
//         >
//           {localStream ? (
//             <RTCView
//               streamURL={localStream.toURL()}
//               style={{ flex: 1, width: "100%", height: "100%" }}
//               mirror={cameraType === "front"}
//               objectFit="cover"
//             />
//           ) : (
//             <Image
//               source={require("../../assets/images/temp_camera_preview.jpg")}
//               className="w-full h-full"
//               resizeMode="cover"
//             />
//           )}
//         </View>
//       </View>

//       {isCreatingLivestream && (
//         <View className="absolute inset-0 items-center justify-center bg-black/50">
//           <ActivityIndicator size="large" color="#ffffff" />
//           <Text className="mt-4 text-white">Starting stream...</Text>
//         </View>
//       )}

//       {showPreLive && (
//         <View className="absolute top-0 flex-row items-center justify-between w-full px-4 pt-16 pb-5">
//           <View className="flex-row items-center">
//             <TouchableOpacity
//               onPress={handleCancelFromPreLive}
//               className="mr-3"
//             >
//               <Ionicons name="arrow-back" size={24} color="white" />
//             </TouchableOpacity>
//             <Text className="text-xl font-semibold text-white">
//               Ready to Go Live
//             </Text>
//           </View>
//         </View>
//       )}

//       {showLiveStream && (
//         <View className="absolute top-0 left-0 right-0 z-10 flex-row items-center justify-between px-4 pt-16 pb-4 ">
//           <View className="flex-row items-center">
//             <View className="w-3 h-3 mr-2 bg-red-500 rounded-full" />
//             <Text className="font-semibold text-white">
//               LIVE – {formatDuration(streamDuration)} elapsed
//             </Text>
//           </View>
//           <TouchableOpacity
//             className="flex-row items-center px-3 py-2 bg-red-600 rounded-lg"
//             onPress={handleEndStream}
//           >
//             <Text className="mr-1 font-medium text-white">End Stream</Text>
//             <Ionicons name="close" size={16} color="white" />
//           </TouchableOpacity>
//         </View>
//       )}

//       {!showCountdown && <StoreInfoCard storeInfo={storeInfo} />}

//       {showLiveStream && (
//         <View className="absolute px-3 py-2 rounded-full top-52 left-4 bg-black/50">
//           <View className="flex-row items-center">
//             <Ionicons name="people" size={16} color="white" />
//             <Text className="ml-2 font-medium text-white">
//               Viewers: {viewers}
//             </Text>
//           </View>
//         </View>
//       )}

//       {pinnedProduct && !showCountdown && (
//         <PinnedProductOverlay product={pinnedProduct} />
//       )}

//       <View className="absolute -translate-y-1/2 right-4 top-1/2">
//         <View className="p-3 mb-3 rounded-full bg-black/50">
//           <TouchableOpacity onPress={handleToggleMic}>
//             <Ionicons
//               name={micOn ? "mic" : "mic-off"}
//               size={24}
//               color={micOn ? "white" : "#ef4444"}
//             />
//           </TouchableOpacity>
//         </View>
//         <View className="p-3 mb-3 rounded-full bg-black/50">
//           <TouchableOpacity onPress={handleSwitchCamera}>
//             <Ionicons name="camera-reverse" size={24} color="white" />
//           </TouchableOpacity>
//         </View>

//         <View className="p-3 mb-3 rounded-full bg-black/50">
//           <TouchableOpacity
//             onPress={() => setShowProductPanel(!showProductPanel)}
//           >
//             <MaterialCommunityIcons
//               name="package-variant"
//               size={24}
//               color="white"
//             />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {showPreLive && (
//         <View className="absolute bottom-0 w-full p-4 bg-black/50">
//           <View className="flex-row gap-3">
//             <TouchableOpacity
//               className="flex-1 py-3 border rounded-lg border-white/30"
//               onPress={handleCancelFromPreLive}
//             >
//               <Text className="font-medium text-center text-white">Cancel</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               className="flex-1 py-3 bg-blue-600 rounded-lg shadow-sm"
//               onPress={handleGoLive}
//             >
//               <Text className="font-medium text-center text-white">
//                 Go Live
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}

//       {showCountdown && (
//         <View className="absolute inset-0 items-center justify-center bg-black/50">
//           <TouchableOpacity
//             className="absolute p-2 rounded-full top-16 right-4 bg-black/70"
//             onPress={handleCancelLivestream}
//           >
//             <Ionicons name="close" size={24} color="white" />
//           </TouchableOpacity>

//           <Text className="font-bold text-white text-8xl">{countdown}</Text>
//           <Text className="mt-4 text-xl text-white">Going live...</Text>
//         </View>
//       )}

//       {showLiveStream && !showChat && (
//         <TouchableOpacity
//           className="absolute p-3 rounded-full bottom-4 right-4 bg-black/50"
//           onPress={() => handleChatToggle(true)}
//         >
//           <Ionicons name="chatbubbles" size={24} color="white" />
//           {unreadMessages > 0 && (
//             <View className="absolute flex items-center justify-center h-5 bg-red-500 rounded-full -top-1 -right-1 min-w-5">
//               <View className="w-3 h-3 bg-red-500 rounded-full" />
//             </View>
//           )}
//         </TouchableOpacity>
//       )}

//       {showLiveStream && showChat && (
//         <View
//           className="absolute left-0 right-0 p-3 rounded-lg bg-black/70"
//           style={{ bottom: keyBoardHeight + 16 }}
//         >
//           <View
//             className={`flex-row gap-3 h-52 ${keyBoardVisibility ? "max-h-64" : "max-h-96"}`}
//           >
//             <View className="justify-center">
//               <TouchableOpacity
//                 className="p-1"
//                 onPress={() => handleChatToggle(false)}
//               >
//                 <Ionicons name="chevron-forward" size={16} color="white" />
//               </TouchableOpacity>
//             </View>

//             <ScrollView
//               ref={scrollViewRef}
//               className="mb-2"
//               showsVerticalScrollIndicator={false}
//             >
//               {chatMessages.map((msg) => (
//                 <View key={msg.id} className="mb-2">
//                   <Text className="text-sm text-white">
//                     <Text className="font-semibold">{msg.user}:</Text>{" "}
//                     {msg.message}
//                   </Text>
//                 </View>
//               ))}
//             </ScrollView>
//           </View>

//           <TextInput
//             className="px-3 py-2 text-sm text-white rounded-full bg-white/20"
//             placeholder="Type a message..."
//             placeholderTextColor="#ffffff80"
//             value={chatMessage}
//             onChangeText={setChatMessage}
//           />
//         </View>
//       )}

//       <Modal
//         visible={showProductPanel}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setShowProductPanel(false)}
//       >
//         <View className="justify-end flex-1 bg-black/50">
//           <View className="bg-white rounded-t-lg">
//             <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
//               <Text className="text-lg font-semibold">Featured Products</Text>
//               <TouchableOpacity onPress={() => setShowProductPanel(false)}>
//                 <Ionicons name="close" size={24} color="#6b7280" />
//               </TouchableOpacity>
//             </View>
//             <ScrollView className="p-4">
//               {currentSelectedProducts.map((product) => (
//                 <View
//                   key={product.id}
//                   className="flex-row items-center justify-between p-4 mb-3 bg-white border border-gray-200 rounded-lg shadow-sm"
//                 >
//                   <View className="flex-row items-center flex-1">
//                     <View className="items-center justify-center w-12 h-12 mr-3 bg-gray-100 border border-gray-200 rounded-lg">
//                       <Text className="text-lg">{product.emoji}</Text>
//                     </View>
//                     <View className="flex-1">
//                       <Text className="font-medium text-gray-900">
//                         {product.name}
//                       </Text>
//                       <Text className="font-bold text-green-600">
//                         {product.price}
//                       </Text>
//                     </View>
//                   </View>
//                   <TouchableOpacity
//                     className={`px-3 py-2 rounded-lg ${
//                       pinnedProduct && pinnedProduct.id === product.id
//                         ? "bg-blue-600"
//                         : "bg-blue-100"
//                     }`}
//                     onPress={() => handlePinProduct(product)}
//                   >
//                     <Text
//                       className={`text-sm font-medium ${
//                         pinnedProduct && pinnedProduct.id === product.id
//                           ? "text-white"
//                           : "text-blue-600"
//                       }`}
//                     >
//                       {pinnedProduct && pinnedProduct.id === product.id
//                         ? "Unpin"
//                         : "Pin"}
//                     </Text>
//                   </TouchableOpacity>
//                 </View>
//               ))}

//               <TouchableOpacity
//                 className="flex-row items-center justify-center p-4 mt-2 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50"
//                 onPress={() => {
//                   setShowProductSelectionModal(true);
//                 }}
//               >
//                 <Ionicons name="add" size={20} color="#3b82f6" />
//                 <Text className="ml-2 font-medium text-blue-600">
//                   Add More Products
//                 </Text>
//               </TouchableOpacity>
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>

//       <Modal
//         visible={showProductSelectionModal}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setShowProductSelectionModal(false)}
//       >
//         <View className="justify-end flex-1 bg-black/50">
//           <View className="bg-white rounded-t-lg max-h-96">
//             <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
//               <Text className="text-lg font-semibold">Select Products</Text>
//               <TouchableOpacity
//                 onPress={() => setShowProductSelectionModal(false)}
//               >
//                 <Ionicons name="close" size={24} color="#6b7280" />
//               </TouchableOpacity>
//             </View>
//             <ScrollView className="p-4">
//               {availableProducts.map((product) => (
//                 <TouchableOpacity
//                   key={product.id}
//                   className="flex-row items-center p-4 mb-3 bg-white border border-gray-200 rounded-lg shadow-sm"
//                   onPress={() => handleProductSelection(product.id)}
//                 >
//                   <View className="items-center justify-center w-12 h-12 mr-3 bg-gray-100 border border-gray-200 rounded-lg">
//                     <Text className="text-lg">{product.emoji}</Text>
//                   </View>
//                   <View className="flex-1">
//                     <Text className="font-medium text-gray-900">
//                       {product.name}
//                     </Text>
//                     <Text className="font-bold text-green-600">
//                       {product.price}
//                     </Text>
//                   </View>
//                   <View className="w-6 h-6 border-2 border-gray-300 rounded-full">
//                     {product.selected && (
//                       <View className="w-full h-full bg-blue-600 rounded-full" />
//                     )}
//                   </View>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// export default LivestreamSessionScreen;
