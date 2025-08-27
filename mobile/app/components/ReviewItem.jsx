"use client";

import { View, Text, Image, TouchableOpacity } from "react-native";
import { useState } from "react";
import Feather from "@expo/vector-icons/Feather";

const ReviewItem = ({ review, onHelpful, onMediaPress }) => {
  const [showPastReviews, setShowPastReviews] = useState(false);

  const renderStarRating = (rating, size = 16) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Feather
          key={i}
          name="star"
          size={size}
          color={i <= rating ? "#F59E0B" : "#E5E7EB"}
          style={{ marginRight: 2 }}
        />
      );
    }
    return <View className="flex-row">{stars}</View>;
  };

  const formatRelativeTime = (dateString) => {
    const now = new Date();
    const reviewDate = new Date(dateString);
    const diffInMs = now - reviewDate;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <View className="p-4 mb-4 bg-white border border-gray-200 rounded-lg">
      {/* User Info */}
      <View className="flex-row items-center mb-3">
        {review.profile_picture ? (
          <Image
            source={{ uri: review.profile_picture }}
            className="w-10 h-10 mr-3 rounded-full"
          />
        ) : (
          <View className="items-center justify-center w-10 h-10 mr-3 bg-gray-300 rounded-full">
            <Feather name="user" size={20} color="#6B7280" />
          </View>
        )}
        <View className="flex-1">
          <Text className="font-medium text-gray-900">
            {review.first_name} {review.last_name}
          </Text>
          <Text className="text-sm text-gray-500">
            {formatRelativeTime(review.created_at)}
          </Text>
        </View>
        {review.is_verified_purchase && (
          <View className="px-2 py-1 bg-green-100 rounded-full">
            <Text className="text-xs font-medium text-green-800">
              Verified Purchase
            </Text>
          </View>
        )}
      </View>

      {/* Rating */}
      <View className="flex-row items-center mb-2">
        {renderStarRating(review.rating)}
        <Text className="ml-2 text-sm text-gray-600">{review.rating}/5</Text>
      </View>

      {/* Review Text */}
      {review.review_text && (
        <Text className="mb-3 leading-5 text-gray-700">
          {review.review_text}
        </Text>
      )}

      {/* Media */}
      {review.media && review.media.length > 0 && (
        <View className="flex-row flex-wrap mb-3">
          {review.media.map((media, index) => (
            <TouchableOpacity
              key={index}
              className="mb-2 mr-2"
              onPress={() => onMediaPress && onMediaPress(media)}
            >
              {media.media_type === "image" ? (
                <Image
                  source={{ uri: media.url }}
                  className="w-16 h-16 rounded-lg"
                />
              ) : (
                <View className="items-center justify-center w-16 h-16 bg-gray-200 rounded-lg">
                  <Feather name="play-circle" size={24} color="#6B7280" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {review.pastReviews && review.pastReviews.length > 0 && (
        <View className="mb-3">
          <TouchableOpacity
            className="flex-row items-center py-2"
            onPress={() => setShowPastReviews(!showPastReviews)}
          >
            <Feather
              name={showPastReviews ? "chevron-up" : "chevron-down"}
              size={16}
              color="#6B7280"
            />
            <Text className="ml-1 text-sm text-gray-600">
              View past reviews ({review.pastReviews.length})
            </Text>
          </TouchableOpacity>

          {showPastReviews && (
            <View className="pl-4 ml-4 border-l-2 border-gray-200">
              {review.pastReviews.map((pastReview, index) => (
                <View key={pastReview.id} className="mb-3 last:mb-0">
                  <View className="flex-row items-center mb-2">
                    {renderStarRating(pastReview.rating, 14)}
                    <Text className="ml-2 text-sm text-gray-500">
                      ({formatDate(pastReview.created_at)})
                    </Text>
                  </View>

                  {pastReview.review_text && (
                    <Text className="mb-2 text-sm leading-4 text-gray-600">
                      "{pastReview.review_text}"
                    </Text>
                  )}

                  {/* Past Review Media */}
                  {pastReview.media && pastReview.media.length > 0 && (
                    <View className="flex-row flex-wrap">
                      {pastReview.media.map((media, mediaIndex) => (
                        <TouchableOpacity
                          key={mediaIndex}
                          className="mb-2 mr-2"
                          onPress={() => onMediaPress && onMediaPress(media)}
                        >
                          {media.media_type === "image" ? (
                            <Image
                              source={{ uri: media.url }}
                              className="w-12 h-12 rounded-lg"
                            />
                          ) : (
                            <View className="items-center justify-center w-12 h-12 bg-gray-200 rounded-lg">
                              <Feather
                                name="play-circle"
                                size={16}
                                color="#6B7280"
                              />
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Helpful Actions */}
      <View className="flex-row items-center justify-between pt-3 border-t border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity
            className="flex-row items-center mr-4"
            onPress={() => onHelpful && onHelpful(review.id, true)}
          >
            <Feather name="thumbs-up" size={16} color="#6B7280" />
            <Text className="ml-1 text-sm text-gray-600">Helpful</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => onHelpful && onHelpful(review.id, false)}
          >
            <Feather name="thumbs-down" size={16} color="#6B7280" />
            <Text className="ml-1 text-sm text-gray-600">Not Helpful</Text>
          </TouchableOpacity>
        </View>
        {review.helpful_count > 0 && (
          <Text className="text-sm text-gray-500">
            {review.helpful_count} found this helpful
          </Text>
        )}
      </View>
    </View>
  );
};

export default ReviewItem;
