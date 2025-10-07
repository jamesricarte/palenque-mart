// "use client";

// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   RefreshControl,
// } from "react-native";
// import { useState, useCallback } from "react";
// import Ionicons from "@expo/vector-icons/Ionicons";
// import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

// const SellerLivestreamScreen = ({ navigation }) => {
//   const [refreshing, setRefreshing] = useState(false);

//   // Dummy data
//   const upcomingStreams = [
//     {
//       id: 1,
//       title: "Fresh Seafood Friday",
//       date: "Fri, Oct 4 – 6:00 PM",
//       products: ["Shrimp", "Tilapia", "Salmon"],
//     },
//   ];

//   const ongoingStreams = [
//     {
//       id: 1,
//       title: "Morning Market Deals",
//       viewers: 243,
//       products: 5,
//       duration: "15:23",
//     },
//   ];

//   const pastStreams = [
//     {
//       id: 1,
//       title: "Weekend Veggie Sale",
//       date: "Sept 28, 2025 – 2:00 PM",
//       views: "1.2k",
//       sold: 8,
//     },
//     {
//       id: 2,
//       title: "Pork & Beef Promo",
//       date: "Sept 21, 2025 – 10:00 AM",
//       views: "980",
//       sold: 15,
//     },
//   ];

//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     // Simulate refresh
//     setTimeout(() => {
//       setRefreshing(false);
//     }, 1000);
//   }, []);

//   const handleStartNewLivestream = () => {
//     navigation.navigate("LivestreamSetup");
//   };

//   return (
//     <View className="flex-1 bg-white">
//       {/* Header */}
//       <View className="px-4 pt-16 pb-5 bg-white border-b border-gray-200">
//         <Text className="text-2xl font-semibold">Live Selling</Text>
//       </View>

//       <ScrollView
//         className="flex-1"
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//       >
//         {/* Start New Livestream Button */}
//         <View className="p-4">
//           <TouchableOpacity
//             className="items-center py-4 bg-primary rounded-md shadow-sm"
//             onPress={handleStartNewLivestream}
//           >
//             <View className="flex-row items-center">
//               <Ionicons name="add" size={24} color="white" />
//               <Text className="ml-2 text-lg font-semibold text-white">
//                 Start New Livestream
//               </Text>
//             </View>
//           </TouchableOpacity>
//         </View>

//         {/* Upcoming Livestreams */}
//         {upcomingStreams.length > 0 && (
//           <View className="px-4 mb-6">
//             <Text className="mb-3 text-lg font-semibold text-gray-900">
//               Upcoming Livestreams
//             </Text>
//             {upcomingStreams.map((stream) => (
//               <View
//                 key={stream.id}
//                 className="p-4 mb-3 bg-white border border-gray-200 rounded-lg shadow-sm"
//               >
//                 <View className="flex-row items-center mb-2">
//                   <Ionicons name="calendar" size={20} color="#6b7280" />
//                   <Text className="ml-2 text-gray-600">{stream.date}</Text>
//                 </View>
//                 <Text className="mb-2 text-lg font-semibold text-gray-900">
//                   "{stream.title}"
//                 </Text>
//                 <View className="flex-row items-center mb-3">
//                   <MaterialCommunityIcons
//                     name="package-variant"
//                     size={20}
//                     color="#6b7280"
//                   />
//                   <Text className="ml-2 text-gray-600">
//                     Featuring: {stream.products.join(", ")}
//                   </Text>
//                 </View>
//                 <View className="flex-row gap-2">
//                   <TouchableOpacity className="flex-1 py-2 bg-primary border border-primary rounded-md">
//                     <Text className="font-medium text-center text-white">
//                       Edit
//                     </Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity className="flex-1 py-2 bg-white border border-primary rounded-lg">
//                     <Text className="font-medium text-center text-primary">
//                       Cancel
//                     </Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             ))}
//           </View>
//         )}

//         {/* Ongoing Livestreams */}
//         {ongoingStreams.length > 0 && (
//           <View className="px-4 mb-6">
//             <Text className="mb-3 text-lg font-semibold text-gray-900">
//               Ongoing Livestreams
//             </Text>
//             {ongoingStreams.map((stream) => (
//               <View
//                 key={stream.id}
//                 className="p-4 mb-3 bg-white border border-gray-200 rounded-md "
//               >
//                 <View className="flex-row items-center mb-2">
//                   <View className="w-3 h-3 mr-2 bg-secondary rounded-full" />
//                   <Text className="font-semibold text-secondary">LIVE NOW</Text>
//                 </View>
//                 <Text className="mb-2 text-lg font-semibold text-gray-900">
//                   "{stream.title}"
//                 </Text>
//                 <View className="flex-row items-center justify-between mb-3">
//                   <View className="flex-row items-center">
//                     <Ionicons name="eye" size={16} color="#6b7280" />
//                     <Text className="ml-1 text-gray-600">
//                       {stream.viewers} viewers
//                     </Text>
//                   </View>
//                   <View className="flex-row items-center">
//                     <MaterialCommunityIcons
//                       name="package-variant"
//                       size={16}
//                       color="#6b7280"
//                     />
//                     <Text className="ml-1 text-gray-600">
//                       {stream.products} products linked
//                     </Text>
//                   </View>
//                 </View>
//                 <View className="flex-row gap-2 mt-1">
//                   <TouchableOpacity className="flex-1 py-2 bg-primary rounded-md">
//                     <Text className="font-medium text-center text-white">
//                       View Stream
//                     </Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity className="flex-1 py-2 bg-white border border-primary rounded-md">
//                     <Text className="font-medium text-center text-primary">
//                       End Stream
//                     </Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             ))}
//           </View>
//         )}

//         {/* Past Livestreams */}
//         <View className="px-4 mb-6">
//           <Text className="mb-3 text-lg font-semibold text-gray-900">
//             Past Livestreams / History
//           </Text>
//           {pastStreams.length > 0 ? (
//             pastStreams.map((stream) => (
//               <View
//                 key={stream.id}
//                 className="p-4 mb-3 bg-white border border-gray-200 rounded-md shadow-sm"
//               >
//                 <View className="flex-row">
//                   <View className="items-center justify-center w-16 h-16 mr-4 bg-gray-100 border border-gray-200 rounded-md">
//                     <MaterialCommunityIcons
//                       name="image-off-outline"
//                       size={24}
//                       color="#6B7280"
//                     />
//                     <Text className="mt-1 text-xs text-gray-500">No Image</Text>
//                   </View>
//                   <View className="flex-1">
//                     <Text className="mb-1 text-lg font-semibold text-gray-900">
//                       "{stream.title}"
//                     </Text>
//                     <View className="flex-row items-center mb-1">
//                       <Ionicons name="calendar" size={16} color="#6b7280" />
//                       <Text className="ml-1 text-sm text-gray-600">
//                         {stream.date}
//                       </Text>
//                     </View>
//                     <View className="flex-row items-center justify-between">
//                       <View className="flex-row items-center">
//                         <Ionicons name="eye" size={16} color="#6b7280" />
//                         <Text className="ml-1 text-sm text-gray-600">
//                           {stream.views} views
//                         </Text>
//                       </View>
//                       <View className="flex-row items-center">
//                         <MaterialCommunityIcons
//                           name="package-variant"
//                           size={16}
//                           color="#6b7280"
//                         />
//                         <Text className="ml-1 text-sm text-gray-600">
//                           {stream.sold} products sold
//                         </Text>
//                       </View>
//                     </View>
//                   </View>
//                 </View>
//                 <View className="flex-row gap-2 pt-3 mt-3 border-t border-gray-100">
//                   <TouchableOpacity className="flex-1 py-2 bg-primary border border-primary rounded-md">
//                     <Text className="font-medium text-center text-white">
//                       View Analytics
//                     </Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity className="flex-1 py-2 bg-white border border-primary rounded-lg">
//                     <Text className="font-medium text-center text-primary">
//                       Reply
//                     </Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             ))
//           ) : (
//             <View className="items-center justify-center py-12">
//               <MaterialCommunityIcons
//                 name="video-off-outline"
//                 size={48}
//                 color="#d1d5db"
//               />
//               <Text className="mt-4 text-lg font-medium text-gray-500">
//                 No Past Livestreams
//               </Text>
//               <Text className="px-8 mt-2 text-center text-gray-400">
//                 Your completed livestreams will appear here
//               </Text>
//             </View>
//           )}
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// export default SellerLivestreamScreen;

"use client";

import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const SellerLivestreamScreen = ({ navigation }) => {
  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <Text className="text-2xl font-semibold">Live Selling</Text>
      </View>

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

export default SellerLivestreamScreen;
