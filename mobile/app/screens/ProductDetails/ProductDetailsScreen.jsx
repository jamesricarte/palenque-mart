"use client";

import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import axios from "axios";
import ReviewItem from "../../components/ReviewItem"; // Import ReviewItem component

import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/apiConfig";
import PersonalizedLoadingAnimation from "../../components/PersonalizedLoadingAnimation";

const ProductDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { productId, fromSellerStore = false } = route.params;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedPreparations, setSelectedPreparations] = useState({});
  const [cartCount, setCartCount] = useState(0);
  const [actionType, setActionType] = useState(""); // 'cart' or 'buy'
  const [conversationId, setConversationId] = useState(null);
  const [fetchedConversationId, setFetchedConversationId] = useState(false);

  const [showBargainModal, setShowBargainModal] = useState(false);
  const [bargainPrice, setBargainPrice] = useState("");
  const [submittingBargain, setSubmittingBargain] = useState(false);
  const [ongoingBargain, setOngoingBargain] = useState(null);
  const [checkingBargain, setCheckingBargain] = useState(true);

  const [showPreOrderModal, setShowPreOrderModal] = useState(false);
  const [preOrderQuantity, setPreOrderQuantity] = useState(1);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewFilter, setReviewFilter] = useState("all"); // 'all', '5', '4', '3', '2', '1'
  const [reviewSort, setReviewSort] = useState("newest"); // 'newest', 'oldest', 'highest', 'lowest', 'helpful'
  const [showReviewFilters, setShowReviewFilters] = useState(false);
  const [selectedMediaModal, setSelectedMediaModal] = useState(null);
  const [reviewPagination, setReviewPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);

  const [keyBoardVisibility, setKeyboardVisibility] = useState(false);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products/${productId}`);

      if (response.data.success) {
        setProduct(response.data.data.product);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      Alert.alert("Error", "Failed to load product details");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (page = 1, resetReviews = true) => {
    if (page === 1) {
      setReviewsLoading(true);
    } else {
      setLoadingMoreReviews(true);
    }

    try {
      const response = await axios.get(
        `${API_URL}/api/reviews/product/${productId}`,
        {
          params: {
            filter: reviewFilter,
            sort: reviewSort,
            page,
            limit: 4, // Set limit to 4 reviews per page
          },
        }
      );

      if (response.data.success) {
        const newReviews = response.data.data.reviews;
        if (resetReviews || page === 1) {
          setReviews(newReviews);
        } else {
          setReviews((prev) => [...prev, ...newReviews]);
        }
        setReviewPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error.response?.data);
    } finally {
      setReviewsLoading(false);
      setLoadingMoreReviews(false);
    }
  };

  const fetchCartCount = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`${API_URL}/api/cart/count`);
      if (response.data.success) {
        setCartCount(response.data.data.uniqueItems);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  const fetchConversationId = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/chat/${product.seller_id}/conversation-id`,
        {
          sellerId: product.seller_id,
        }
      );
      if (response.data.success) {
        setConversationId(response.data.data.conversationId);
      }
    } catch (error) {
      console.log("Error fetching conversation id:", error.response.data);
    } finally {
      setFetchedConversationId(true);
    }
  };

  const checkOngoingBargain = async () => {
    if (!user?.id || !productId) {
      return;
    }

    setCheckingBargain(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/bargain/check/${conversationId}/${productId}`
      );

      if (response.data.success && response.data.data.hasOngoingBargain) {
        setOngoingBargain(response.data.data.bargain);
      }
    } catch (error) {
      console.log("Error checking ongoing bargain:", error.response.data);
    } finally {
      setCheckingBargain(false);
    }
  };

  const isPreOrderAvailable = () => {
    if (!product) return false;

    const isOutOfStock = product.stock_quantity === 0;
    const isPreOrderEnabled = product.is_preorder_enabled === 1;
    const hasValidAvailabilityDate =
      product.expected_availability_date &&
      new Date(product.expected_availability_date) > new Date();

    return isOutOfStock && isPreOrderEnabled && hasValidAvailabilityDate;
  };

  const handlePreOrder = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to place pre-orders", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => navigation.navigate("Login") },
      ]);
      return;
    }

    if (isOwnProduct()) {
      Alert.alert("Cannot Pre-order", "You cannot pre-order your own product");
      return;
    }

    setShowPreOrderModal(true);
  };

  const handleConfirmPreOrder = async () => {
    setShowPreOrderModal(false);

    const preOrderItem = {
      id: product.id,
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: preOrderQuantity,
      unit_type: product.unit_type,
      image_keys: product.image_keys,
      seller_id: product.seller_id,
      store_name: product.store_name,
      store_logo_key: product.store_logo_key,
      preparation_options: {},
      total_price: (
        Number.parseFloat(product.price) * preOrderQuantity
      ).toFixed(2),
      is_preorder: true,
      expected_availability_date: product.expected_availability_date,
      max_preorder_quantity: product.max_preorder_quantity,
    };

    navigation.navigate("Checkout", {
      items: [preOrderItem],
      fromCart: false,
    });
  };

  useFocusEffect(
    useCallback(() => {
      fetchProduct();
      fetchCartCount();
      fetchReviews();

      if (fetchedConversationId) {
        if (user?.id && conversationId) {
          checkOngoingBargain();
        } else {
          setCheckingBargain(false);
        }
      }
    }, [productId, fetchedConversationId, reviewFilter, reviewSort])
  );

  useFocusEffect(
    useCallback(() => {
      if (product?.seller_id) {
        fetchConversationId();
      }
    }, [product])
  );

  useEffect(() => {
    if (product) {
      fetchReviews(1, true);
    }
  }, [product, reviewFilter, reviewSort]);

  const formatUnitType = (unitType) => {
    const unitMap = {
      per_kilo: "Per Kilo",
      per_250g: "Per 250g",
      per_500g: "Per 500g",
      per_piece: "Per Piece",
      per_bundle: "Per Bundle",
      per_pack: "Per Pack",
      per_liter: "Per Liter",
      per_dozen: "Per Dozen",
    };
    return unitMap[unitType] || unitType;
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

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

  const handleReviewHelpful = async (reviewId, isHelpful) => {
    if (!user) {
      Alert.alert("Login Required", "Please login to rate reviews");
      return;
    }

    try {
      await axios.post(`${API_URL}/api/reviews/helpful`, {
        reviewId,
        reviewType: "product",
        isHelpful,
      });

      // Refresh reviews to update helpful count
      fetchReviews(1, true);
    } catch (error) {
      console.error("Error rating review:", error);
      Alert.alert("Error", "Failed to rate review");
    }
  };

  const isOwnProduct = () => {
    if (!product && !user) return false;

    return user && product && product.seller_user_id === user.id;
  };

  const handleAddToCart = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to add items to cart", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => navigation.navigate("Login") },
      ]);
      return;
    }

    if (isOwnProduct()) {
      Alert.alert(
        "Cannot Add to Cart",
        "You cannot add your own product to cart"
      );
      return;
    }

    setActionType("cart");
    setShowPreferenceModal(true);
  };

  const handleBuyNow = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to purchase items", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => navigation.navigate("Login") },
      ]);
      return;
    }

    if (isOwnProduct()) {
      Alert.alert("Cannot Purchase", "You cannot purchase your own product");
      return;
    }

    setActionType("buy");
    setShowPreferenceModal(true);
  };

  const handleBargainOffer = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to make an offer", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => navigation.navigate("Login") },
      ]);
      return;
    }

    if (!bargainPrice.trim()) {
      Alert.alert("Error", "Please enter your offer price");
      return;
    }

    const offerPrice = Number.parseFloat(bargainPrice);
    const originalPrice = Number.parseFloat(product.price);

    if (isNaN(offerPrice) || offerPrice <= 0) {
      Alert.alert("Error", "Please enter a valid price");
      return;
    }

    if (offerPrice >= originalPrice) {
      Alert.alert(
        "Error",
        "Offer price should be less than the original price"
      );
      return;
    }

    setSubmittingBargain(true);
    try {
      const response = await axios.post(`${API_URL}/api/bargain/create-offer`, {
        productId: productId,
        sellerId: product.seller_id,
        offeredPrice: offerPrice,
        originalPrice: originalPrice,
        conversationId: conversationId,
      });

      if (response.data.success) {
        Alert.alert(
          "Offer Sent!",
          "Your bargain offer has been sent to the seller. You can check the conversation for updates.",
          [
            {
              text: "View Conversation",
              onPress: () => {
                setShowBargainModal(false);
                setBargainPrice("");
                navigation.navigate("ChatConversation", {
                  conversationId: conversationId,
                  sellerId: product.seller_id,
                  storeName: product.store_name,
                  storeLogo: product.store_logo_key,
                });
              },
            },
            {
              text: "OK",
              onPress: () => {
                setShowBargainModal(false);
                setBargainPrice("");
                checkOngoingBargain(); // Refresh ongoing bargain status
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error creating bargain offer:", error.response.data);
      Alert.alert(
        "Error",
        error.response.data.message ||
          "Failed to send bargain offer. Please try again."
      );
    } finally {
      setSubmittingBargain(false);
    }
  };

  const handleConfirmAction = async () => {
    setAddingToCart(true);
    setShowPreferenceModal(false);

    try {
      if (actionType === "cart") {
        const response = await axios.post(`${API_URL}/api/cart/add`, {
          productId: product.id,
          quantity: selectedQuantity,
        });

        if (response.data.success) {
          Alert.alert("Success", response.data.message);
          fetchCartCount(); // Refresh cart count
        }
      } else {
        // Buy Now - navigate to checkout
        const buyNowItem = {
          id: product.id,
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: selectedQuantity,
          unit_type: product.unit_type,
          image_keys: product.image_keys,
          seller_id: product.seller_id,
          store_name: product.store_name,
          store_logo_key: product.store_logo_key,
          preparation_options: selectedPreparations,
          total_price: (
            Number.parseFloat(product.price) * selectedQuantity
          ).toFixed(2),
        };

        navigation.navigate("Checkout", {
          items: [buyNowItem],
          fromCart: false,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage =
        error.response?.data?.message ||
        `Failed to ${actionType === "cart" ? "add to cart" : "purchase"}`;
      Alert.alert("Error", errorMessage);
    } finally {
      setAddingToCart(false);
      // Reset preferences
      setSelectedQuantity(1);
      setSelectedPreparations({});
    }
  };

  const handleChatWithSeller = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to chat with sellers", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => navigation.navigate("Login") },
      ]);
      return;
    }

    if (isOwnProduct()) {
      Alert.alert("Cannot Chat", "You cannot chat with yourself");
      return;
    }

    try {
      // Navigate to chat conversation screen
      navigation.navigate("ChatConversation", {
        conversationId: conversationId,
        sellerId: product.seller_id,
        storeName: product.store_name,
        storeLogo: product.store_logo_key,
        fromSellerStore: fromSellerStore,
        fromProductDetails: true,
      });
    } catch (error) {
      console.error("Error starting chat:", error);
      Alert.alert("Error", "Failed to start chat");
    }
  };

  const getAddressTypeFullAddress = (addressType) => {
    const parts = [
      addressType?.street_address || null,
      addressType?.barangay || null,
      addressType?.city || null,
      addressType?.province || null,
    ];

    return parts.filter((part) => part && part.trim() !== "").join(", ");
  };

  const handleMediaPress = (media) => {
    setSelectedMediaModal(media);
  };

  const handleLikePress = () => {
    Alert.alert("Likes Feature", "Likes feature will be implented soon!");
  };

  const loadMoreReviews = () => {
    if (reviewPagination.hasNextPage && !loadingMoreReviews) {
      fetchReviews(reviewPagination.currentPage + 1, false);
    }
  };

  const getFilterDisplayText = () => {
    if (reviewFilter === "all") return "All Ratings";
    return `${reviewFilter} Stars`;
  };

  const getNoReviewsMessage = () => {
    if (reviewFilter === "all") {
      return {
        title: "No reviews yet",
        subtitle: "Be the first to review this product",
      };
    } else {
      return {
        title: `No ${reviewFilter} star reviews`,
        subtitle: "Try selecting a different rating filter",
      };
    }
  };

  useEffect(() => {
    const keyboardDidHide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisibility(false);
    });

    const keyboardDidShow = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisibility(true);
    });

    return () => {
      keyboardDidHide.remove();
      keyboardDidShow.remove();
    };
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
            <Text className="ml-4 text-xl font-semibold">Product Details</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("Cart")}
            className="relative p-1"
          >
            <Ionicons name="bag-outline" size={24} color="black" />
            {cartCount > 0 && (
              <View className="absolute flex items-center justify-center w-5 h-5 bg-red-500 rounded-full -top-2 -right-2">
                <Text className="text-xs font-bold text-white">
                  {cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View className="items-center justify-center flex-1">
          <PersonalizedLoadingAnimation />
          <Text className="mt-4 text-gray-600">Loading product details...</Text>
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
            <Text className="ml-4 text-xl font-semibold">Product Details</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("Cart")}
            className="relative p-1"
          >
            <Ionicons name="bag-outline" size={24} color="black" />
            {cartCount > 0 && (
              <View className="absolute flex items-center justify-center w-5 h-5 bg-red-500 rounded-full -top-2 -right-2">
                <Text className="text-xs font-bold text-white">
                  {cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View className="items-center justify-center flex-1">
          <Feather name="alert-circle" size={64} color="#9CA3AF" />
          <Text className="mt-4 text-xl font-semibold text-gray-600">
            Product not found
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text className="ml-4 text-xl font-semibold">Product Details</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("Cart")}
          className="relative p-1"
        >
          <Ionicons name="bag-outline" size={24} color="black" />
          {cartCount > 0 && (
            <View className="absolute flex items-center justify-center w-5 h-5 bg-red-500 rounded-full -top-2 -right-2">
              <Text className="text-xs font-bold text-white">{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Product Image */}
        <View className="bg-white">
          {product.image_keys ? (
            <Image
              source={{ uri: product.image_keys }}
              className="w-full h-80"
              resizeMode="cover"
            />
          ) : (
            <View className="flex items-center justify-center w-full bg-gray-200 h-80">
              <Feather name="image" size={64} color="#9CA3AF" />
            </View>
          )}

          {/* Stock Status Badge */}
          <View className="absolute top-4 right-4">
            {product.stock_quantity === 0 ? (
              <View className="px-3 py-2 bg-red-500 rounded-lg">
                <Text className="font-medium text-white">Out of Stock</Text>
              </View>
            ) : (
              product.stock_quantity <= 10 && (
                <View className="px-3 py-2 rounded-lg bg-accent">
                  <Text className="font-medium text-white">Low Stock</Text>
                </View>
              )
            )}
          </View>
        </View>

        {/* Product Info */}
        <View className="p-4 bg-white border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <Text className="mb-2 text-2xl font-bold text-gray-900">
              {product.name}
            </Text>

            <TouchableOpacity className="p-2 mr-2" onPress={handleLikePress}>
              <Ionicons name="heart-outline" size={22} color="black" />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-between mb-4">
            {/* Price Display with Original vs Discounted */}
            {product.original_price &&
            parseFloat(product.price) < parseFloat(product.original_price) ? (
              <View className="flex-row items-center gap-1">
                <Text className="text-lg text-gray-500 line-through">
                  ₱{parseFloat(product.original_price).toFixed(2)}
                </Text>
                <Text className="text-2xl font-bold text-orange-600">
                  ₱{parseFloat(product.price).toFixed(2)}
                </Text>
              </View>
            ) : (
              <Text className="text-3xl font-bold text-orange-600">
                ₱{parseFloat(product.price).toFixed(2)}
              </Text>
            )}

            <Text className="text-lg text-gray-600">
              {formatUnitType(product.unit_type)}
            </Text>
          </View>

          {product.category && (
            <View className="flex-row items-center mb-2">
              <Text className="px-3 py-1 text-sm font-medium text-orange-600 bg-orange-100 rounded-full">
                {product.category}
              </Text>
            </View>
          )}

          <Text className="text-lg text-gray-500">
            Stock: {product.stock_quantity} available
          </Text>
        </View>

        {/* Store Info */}
        <View className="p-4 bg-white border-b border-gray-200">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            Store Information
          </Text>

          <TouchableOpacity
            onPress={() => {
              if (!fromSellerStore) {
                navigation.navigate("SellerStore", {
                  sellerId: product.seller_id,
                });
              } else {
                navigation.goBack();
              }
            }}
          >
            <View className="flex-row items-center mb-2">
              {product.store_logo_key ? (
                <Image
                  source={{
                    uri: product.store_logo_key,
                  }}
                  className="w-12 h-12 mr-3 rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="flex items-center justify-center w-12 h-12 mr-3 bg-gray-300 rounded-full">
                  <MaterialCommunityIcons
                    name="storefront-outline"
                    size={24}
                    color="#6B7280"
                  />
                </View>
              )}
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">
                  {product.store_name}
                </Text>
                <Text className="text-sm text-gray-600 capitalize">
                  {product.account_type} seller
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {product.store_description && (
            <Text className="text-gray-700">{product.store_description}</Text>
          )}

          {product.address.store_location && (
            <View className="flex-row items-start mt-3">
              <Feather
                name="map-pin"
                size={16}
                color="#6B7280"
                className="mt-1"
              />
              <Text className="flex-1 ml-2 text-gray-600">
                {getAddressTypeFullAddress(product.address.store_location)}
              </Text>
            </View>
          )}

          {!isOwnProduct() && (
            <TouchableOpacity
              className="flex-row items-center justify-center p-3 mt-3 border border-orange-600 rounded-lg"
              onPress={handleChatWithSeller}
            >
              <Feather name="message-circle" size={20} color="#EA580C" />
              <Text className="ml-2 font-medium text-orange-600">
                Chat with Store
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Product Details */}
        {product.description && (
          <View className="p-4 bg-white border-b border-gray-200">
            <Text className="mb-3 text-lg font-semibold text-gray-900">
              Description
            </Text>
            <Text className="leading-6 text-gray-700">
              {product.description}
            </Text>
          </View>
        )}

        {/* Freshness & Source Info */}
        {(product.freshness_indicator ||
          product.harvest_date ||
          product.source_origin) && (
          <View className="p-4 bg-white border-b border-gray-200">
            <Text className="mb-3 text-lg font-semibold text-gray-900">
              Freshness & Source
            </Text>

            {product.freshness_indicator && (
              <View className="flex-row items-center mb-2">
                <Feather name="clock" size={16} color="#10B981" />
                <Text className="ml-2 text-gray-700">
                  {product.freshness_indicator}
                </Text>
              </View>
            )}

            {product.harvest_date && (
              <View className="flex-row items-center mb-2">
                <Feather name="calendar" size={16} color="#10B981" />
                <Text className="ml-2 text-gray-700">
                  Harvested: {formatDate(product.harvest_date)}
                </Text>
              </View>
            )}

            {product.source_origin && (
              <View className="flex-row items-center">
                <Feather name="map-pin" size={16} color="#10B981" />
                <Text className="ml-2 text-gray-700">
                  Source: {product.source_origin}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Preparation Options */}
        {product.preparation_options &&
          Object.values(product.preparation_options).some(
            (option) => option
          ) && (
            <View className="p-4 bg-white border-b border-gray-200">
              <Text className="mb-3 text-lg font-semibold text-gray-900">
                Available Preparation
              </Text>
              <View className="flex-row flex-wrap">
                {Object.entries(product.preparation_options).map(
                  ([option, available]) =>
                    available && (
                      <View
                        key={option}
                        className="px-3 py-1 mb-2 mr-2 bg-blue-100 rounded-full"
                      >
                        <Text className="text-sm font-medium text-blue-800 capitalize">
                          {option}
                        </Text>
                      </View>
                    )
                )}
              </View>
            </View>
          )}

        {/* Additional Info */}
        <View className="p-4 bg-white">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            Additional Information
          </Text>
          <Text className="mb-1 text-gray-600">
            Listed: {new Date(product.created_at).toLocaleDateString()}
          </Text>
          <Text className="text-gray-600">
            Last updated: {new Date(product.updated_at).toLocaleDateString()}
          </Text>
        </View>

        <View className="mt-2 bg-white">
          <View className="p-4 border-b border-gray-200">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-900">
                Reviews ({reviews.length || 0})
              </Text>
              <TouchableOpacity
                onPress={() => setShowReviewFilters(true)}
                className="flex-row items-center px-3 py-2 bg-gray-100 rounded-lg"
              >
                <Feather name="filter" size={16} color="#6B7280" />
                <Text className="ml-1 text-sm text-gray-600">
                  Filter & Sort
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center mb-3">
              <Text className="mr-2 text-sm text-gray-600">Showing:</Text>
              <View className="px-2 py-1 bg-orange-100 rounded-full">
                <Text className="text-xs font-medium text-orange-800">
                  {getFilterDisplayText()}
                </Text>
              </View>
            </View>

            {/* Rating Summary */}
            {product.average_rating > 0 && (
              <View className="flex-row items-center mb-4">
                <View className="flex-row items-center mr-4">
                  {renderStarRating(Math.round(product.average_rating), 20)}
                  <Text className="ml-2 text-xl font-bold text-gray-900">
                    {product.average_rating.toFixed(1)}
                  </Text>
                </View>
                <Text className="text-gray-600">
                  Based on {product.review_count} reviews
                </Text>
              </View>
            )}
          </View>

          {/* Reviews List */}
          <View className="p-4">
            {reviewsLoading ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#EA580C" />
                <Text className="mt-2 text-gray-600">Loading reviews...</Text>
              </View>
            ) : reviews.length === 0 ? (
              <View className="items-center py-8">
                <Feather name="message-square" size={48} color="#9CA3AF" />
                <Text className="mt-2 text-lg font-medium text-gray-600">
                  {getNoReviewsMessage().title}
                </Text>
                <Text className="text-gray-500">
                  {getNoReviewsMessage().subtitle}
                </Text>
              </View>
            ) : (
              <>
                <FlatList
                  data={reviews}
                  renderItem={({ item }) => (
                    <ReviewItem
                      review={item}
                      onHelpful={handleReviewHelpful}
                      onMediaPress={handleMediaPress}
                    />
                  )}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />

                {reviewPagination.hasNextPage && (
                  <TouchableOpacity
                    className="items-center p-4 mt-4 border border-orange-600 rounded-lg"
                    onPress={loadMoreReviews}
                    disabled={loadingMoreReviews}
                  >
                    {loadingMoreReviews ? (
                      <ActivityIndicator color="#EA580C" />
                    ) : (
                      <Text className="font-medium text-orange-600">
                        Load More Reviews
                      </Text>
                    )}
                  </TouchableOpacity>
                )}

                <View className="items-center mt-4">
                  <Text className="text-sm text-gray-500">
                    Showing {reviews.length} of {reviewPagination.totalItems}{" "}
                    reviews
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {!isOwnProduct() && (
        <View className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-white border-t border-gray-200">
          <View className="flex-row gap-3">
            {product.bargaining_enabled === 1 && !isPreOrderAvailable() && (
              <TouchableOpacity
                className={`flex-1 items-center justify-center p-4 border-2 border-blue-600 rounded-lg ${
                  product.stock_quantity === 0 || checkingBargain
                    ? "opacity-50"
                    : ""
                }`}
                onPress={() => {
                  if (!user) {
                    Alert.alert(
                      "Login Required",
                      "Please login to make an offer",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Login",
                          onPress: () => navigation.navigate("Login"),
                        },
                      ]
                    );
                    return;
                  }

                  if (ongoingBargain) {
                    Alert.alert(
                      "Ongoing Bargain",
                      "You have an ongoing bargain offer for this product. Please wait for the seller's response or check your conversation.",
                      [
                        {
                          text: "View Conversation",
                          onPress: () =>
                            navigation.navigate("ChatConversation", {
                              conversationId: conversationId,
                              sellerId: product.seller_id,
                              storeName: product.store_name,
                              storeLogo: product.store_logo_key,
                            }),
                        },
                        { text: "OK" },
                      ]
                    );
                  } else {
                    setShowBargainModal(true);
                  }
                }}
                disabled={product.stock_quantity === 0 || checkingBargain}
              >
                {checkingBargain ? (
                  <ActivityIndicator color="#2563EB" />
                ) : (
                  <>
                    <Feather name="tag" size={20} color="#2563EB" />
                    <Text
                      className={`mt-1 font-semibold text-blue-600 ${ongoingBargain ? "text-xs" : ""}`}
                    >
                      {ongoingBargain ? "Pending Offer" : "Make Offer"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {!isPreOrderAvailable() && (
              <TouchableOpacity
                className={`flex-1 items-center justify-center p-4 border-2 border-orange-600 rounded-lg ${product.stock_quantity === 0 ? "opacity-50" : ""}`}
                onPress={handleAddToCart}
                disabled={product.stock_quantity === 0 || addingToCart}
              >
                {addingToCart ? (
                  <ActivityIndicator color="#EA580C" />
                ) : (
                  <>
                    <Feather name="shopping-cart" size={20} color="#EA580C" />
                    <Text className="mt-1 font-semibold text-orange-600">
                      Add to Cart
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className={`flex-1 items-center justify-center p-4 bg-orange-600 rounded-lg ${
                product.stock_quantity === 0 && !isPreOrderAvailable()
                  ? "opacity-50"
                  : ""
              }`}
              onPress={isPreOrderAvailable() ? handlePreOrder : handleBuyNow}
              disabled={product.stock_quantity === 0 && !isPreOrderAvailable()}
            >
              <Feather
                name={isPreOrderAvailable() ? "clock" : "zap"}
                size={20}
                color="white"
              />
              <Text className="mt-1 font-semibold text-white">
                {isPreOrderAvailable() ? "Pre Order" : "Buy Now"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal
        visible={showBargainModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBargainModal(false)}
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={
            Platform.OS === "android" && !keyBoardVisibility ? null : "padding"
          }
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <View className="justify-end flex-1">
            <View className="p-6 bg-white rounded-t-3xl">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-semibold">Make an Offer</Text>
                <TouchableOpacity onPress={() => setShowBargainModal(false)}>
                  <Feather name="x" size={24} color="black" />
                </TouchableOpacity>
              </View>

              {/* Product Info */}
              <View className="flex-row p-4 mb-4 rounded-lg bg-gray-50">
                <Image
                  source={{ uri: product?.image_keys }}
                  className="w-16 h-16 rounded-lg"
                  resizeMode="cover"
                />
                <View className="flex-1 ml-3">
                  <Text className="text-lg font-semibold" numberOfLines={2}>
                    {product?.name}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Original Price: ₱
                    {Number.parseFloat(product?.price || 0).toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Offer Input */}
              <View className="mb-4">
                <Text className="mb-2 text-lg font-medium">
                  Your Offer Price
                </Text>
                <View className="flex-row items-center p-3 border border-gray-300 rounded-lg">
                  <Text className="mr-2 text-lg font-semibold">₱</Text>
                  <TextInput
                    className="flex-1 text-lg"
                    placeholder="0.00"
                    value={bargainPrice}
                    onChangeText={setBargainPrice}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>
                <Text className="mt-1 text-sm text-gray-500">
                  Enter an amount less than ₱
                  {Number.parseFloat(product?.price || 0).toFixed(2)}
                </Text>
              </View>

              {/* Savings Display */}
              {bargainPrice &&
                bargainPrice <= Number.parseFloat(product.price) &&
                !isNaN(Number.parseFloat(bargainPrice)) &&
                Number.parseFloat(bargainPrice) > 0 && (
                  <View className="p-3 mb-4 rounded-lg bg-green-50">
                    <Text className="text-sm text-green-700">
                      You'll save: ₱
                      {(
                        Number.parseFloat(product?.price || 0) -
                        Number.parseFloat(bargainPrice)
                      ).toFixed(2)}
                    </Text>
                  </View>
                )}

              {/* Submit Button */}
              <TouchableOpacity
                className={`items-center p-4 rounded-lg ${
                  bargainPrice.trim() && !submittingBargain
                    ? "bg-blue-600"
                    : "bg-gray-300"
                }`}
                onPress={handleBargainOffer}
                disabled={!bargainPrice.trim() || submittingBargain}
              >
                {submittingBargain ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-lg font-semibold text-white">
                    Send Offer
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        transparent
        visible={showReviewFilters}
        animationType="slide"
        onRequestClose={() => setShowReviewFilters(false)}
      >
        <View
          className="flex-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <View className="justify-end flex-1">
            <View className="p-6 bg-white rounded-t-3xl max-h-[70%]">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-semibold">
                  Filter & Sort Reviews
                </Text>
                <TouchableOpacity onPress={() => setShowReviewFilters(false)}>
                  <Feather name="x" size={24} color="black" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Filter by Rating */}
                <View className="mb-6">
                  <Text className="mb-3 text-lg font-medium">
                    Filter by Rating
                  </Text>
                  <View className="flex-row flex-wrap">
                    {["all", "5", "4", "3", "2", "1"].map((filter) => (
                      <TouchableOpacity
                        key={filter}
                        onPress={() => {
                          setReviewFilter(filter);
                          setShowReviewFilters(false);
                        }}
                        className={`px-4 py-2 mr-2 mb-2 rounded-full border ${
                          reviewFilter === filter
                            ? "bg-orange-600 border-orange-600"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        <Text
                          className={`${reviewFilter === filter ? "text-white" : "text-gray-700"}`}
                        >
                          {filter === "all" ? "All Ratings" : `${filter} Stars`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Sort Options */}
                <View className="mb-4">
                  <Text className="mb-3 text-lg font-medium">Sort by</Text>
                  {[
                    {
                      key: "newest",
                      label: "Newest First",
                    },
                    {
                      key: "oldest",
                      label: "Oldest First",
                    },
                    {
                      key: "highest",
                      label: "Highest Rating",
                    },
                    {
                      key: "lowest",
                      label: "Lowest Rating",
                    },
                    {
                      key: "helpful",
                      label: "Most Helpful",
                    },
                  ].map((sort) => (
                    <TouchableOpacity
                      key={sort.key}
                      onPress={() => {
                        setReviewSort(sort.key);
                        setShowReviewFilters(false);
                      }}
                      className={`flex-row items-center p-3 mb-2 rounded-lg ${
                        reviewSort === sort.key ? "bg-orange-50" : "bg-gray-50"
                      }`}
                    >
                      <View
                        className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                          reviewSort === sort.key
                            ? "bg-orange-600 border-orange-600"
                            : "border-gray-300"
                        }`}
                      >
                        {reviewSort === sort.key && (
                          <View className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </View>
                      <Text className="flex-1">{sort.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={selectedMediaModal !== null}
        animationType="fade"
        onRequestClose={() => setSelectedMediaModal(null)}
      >
        <View
          className="flex-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
        >
          <View className="items-center justify-center flex-1">
            <TouchableOpacity
              onPress={() => setSelectedMediaModal(null)}
              className="absolute z-10 p-2 top-16 right-4"
            >
              <Feather name="x" size={28} color="white" />
            </TouchableOpacity>

            {selectedMediaModal && (
              <View className="items-center justify-center w-full h-full">
                {selectedMediaModal.media_type === "image" ? (
                  <Image
                    source={{ uri: selectedMediaModal.url }}
                    className="w-full h-full"
                    resizeMode="contain"
                  />
                ) : (
                  <View className="items-center justify-center flex-1">
                    <Feather name="play-circle" size={64} color="white" />
                    <Text className="mt-4 text-lg text-white">
                      Video playback coming soon
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Preference Modal */}
      <Modal
        transparent
        visible={showPreferenceModal}
        animationType="slide"
        onRequestClose={() => setShowPreferenceModal(false)}
      >
        <View
          className="flex-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <View className="justify-end flex-1">
            <View className="p-6 bg-white rounded-t-3xl">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-semibold">
                  Select Preferences
                </Text>
                <TouchableOpacity onPress={() => setShowPreferenceModal(false)}>
                  <Feather name="x" size={24} color="black" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Quantity Selection */}
                <View className="mb-4">
                  <Text className="mb-2 text-lg font-medium">Quantity</Text>
                  <View className="flex-row items-center justify-between p-3 bg-gray-100 rounded-lg">
                    <TouchableOpacity
                      className="items-center justify-center w-10 h-10 bg-white rounded-full"
                      onPress={() =>
                        setSelectedQuantity(Math.max(1, selectedQuantity - 1))
                      }
                    >
                      <Feather name="minus" size={20} color="black" />
                    </TouchableOpacity>
                    <Text className="text-xl font-semibold">
                      {selectedQuantity}
                    </Text>
                    <TouchableOpacity
                      className="items-center justify-center w-10 h-10 bg-white rounded-full"
                      onPress={() =>
                        setSelectedQuantity(
                          Math.min(product.stock_quantity, selectedQuantity + 1)
                        )
                      }
                    >
                      <Feather name="plus" size={20} color="black" />
                    </TouchableOpacity>
                  </View>
                  <Text className="mt-1 text-sm text-gray-500">
                    Max: {product.stock_quantity} available
                  </Text>
                </View>

                {/* Preparation Options */}
                {product.preparation_options &&
                  Object.keys(product.preparation_options).length > 0 && (
                    <View className="mb-1">
                      {/* <Text className="mb-2 text-lg font-medium">
                        Preparation Options
                      </Text> */}
                      {Object.entries(product.preparation_options).map(
                        ([option, available]) =>
                          available && (
                            <TouchableOpacity
                              key={option}
                              className={`flex-row items-center p-3 mb-2 rounded-lg border ${
                                selectedPreparations[option]
                                  ? "bg-orange-50 border-orange-600"
                                  : "bg-gray-50 border-gray-200"
                              }`}
                              onPress={() =>
                                setSelectedPreparations((prev) => ({
                                  ...prev,
                                  [option]: !prev[option],
                                }))
                              }
                            >
                              <View
                                className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                                  selectedPreparations[option]
                                    ? "bg-orange-600 border-orange-600"
                                    : "border-gray-300"
                                }`}
                              >
                                {selectedPreparations[option] && (
                                  <Feather
                                    name="check"
                                    size={12}
                                    color="white"
                                  />
                                )}
                              </View>
                              <Text className="flex-1 capitalize">
                                {option.replace("_", " ")}
                              </Text>
                            </TouchableOpacity>
                          )
                      )}
                    </View>
                  )}

                {/* Total Price */}
                <View className="p-4 mb-4 bg-gray-100 rounded-lg">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-lg font-medium">Total Price:</Text>
                    <Text className="text-2xl font-bold text-orange-600">
                      ₱
                      {(
                        Number.parseFloat(product.price) * selectedQuantity
                      ).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </ScrollView>

              {/* Action Button */}
              <TouchableOpacity
                className="items-center p-4 bg-orange-600 rounded-lg"
                onPress={handleConfirmAction}
                disabled={addingToCart}
              >
                {addingToCart ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-lg font-semibold text-white">
                    {actionType === "cart" ? "Add to Cart" : "Buy Now"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showPreOrderModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPreOrderModal(false)}
      >
        <View
          className="flex-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <View className="justify-end flex-1">
            <View className="p-6 bg-white rounded-t-3xl">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-semibold">Pre-Order Details</Text>
                <TouchableOpacity onPress={() => setShowPreOrderModal(false)}>
                  <Feather name="x" size={24} color="black" />
                </TouchableOpacity>
              </View>

              {/* Product Info */}
              <View className="flex-row p-4 mb-4 rounded-lg bg-gray-50">
                <Image
                  source={{ uri: product?.image_keys }}
                  className="w-16 h-16 rounded-lg"
                  resizeMode="cover"
                />
                <View className="flex-1 ml-3">
                  <Text className="text-lg font-semibold" numberOfLines={2}>
                    {product?.name}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Price: ₱{Number.parseFloat(product?.price || 0).toFixed(2)}
                  </Text>
                  <Text className="text-sm text-orange-600">
                    Expected:{" "}
                    {product?.expected_availability_date
                      ? new Date(
                          product.expected_availability_date
                        ).toLocaleDateString()
                      : "TBA"}
                  </Text>
                </View>
              </View>

              {/* Quantity Selection */}
              <View className="mb-4">
                <Text className="mb-2 text-lg font-medium">Quantity</Text>
                <View className="flex-row items-center justify-between p-3 bg-gray-100 rounded-lg">
                  <TouchableOpacity
                    className="items-center justify-center w-10 h-10 bg-white rounded-full"
                    onPress={() =>
                      setPreOrderQuantity(Math.max(1, preOrderQuantity - 1))
                    }
                  >
                    <Feather name="minus" size={20} color="black" />
                  </TouchableOpacity>
                  <Text className="text-xl font-semibold">
                    {preOrderQuantity}
                  </Text>
                  <TouchableOpacity
                    className="items-center justify-center w-10 h-10 bg-white rounded-full"
                    onPress={() =>
                      setPreOrderQuantity(
                        Math.min(
                          product?.max_preorder_quantity || 999,
                          preOrderQuantity + 1
                        )
                      )
                    }
                  >
                    <Feather name="plus" size={20} color="black" />
                  </TouchableOpacity>
                </View>
                <Text className="mt-1 text-sm text-gray-500">
                  Max: {product?.max_preorder_quantity || "No limit"} available
                  for pre-order
                </Text>
              </View>

              {/* Pre-order Info */}
              <View className="p-4 mb-4 rounded-lg bg-blue-50">
                <View className="flex-row items-center mb-2">
                  <Feather name="info" size={16} color="#2563EB" />
                  <Text className="ml-2 font-medium text-blue-800">
                    Pre-Order Information
                  </Text>
                </View>
                <Text className="text-sm text-blue-700">
                  • This item is currently out of stock{"\n"}• You will be
                  charged when the item becomes available{"\n"}• Expected
                  availability:{" "}
                  {product?.expected_availability_date
                    ? new Date(
                        product.expected_availability_date
                      ).toLocaleDateString()
                    : "To be announced"}
                </Text>
              </View>

              {/* Total Price */}
              <View className="p-4 mb-4 bg-gray-100 rounded-lg">
                <View className="flex-row items-center justify-between">
                  <Text className="text-lg font-medium">Total Price:</Text>
                  <Text className="text-2xl font-bold text-orange-600">
                    ₱
                    {(
                      Number.parseFloat(product?.price || 0) * preOrderQuantity
                    ).toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                className="items-center p-4 bg-orange-600 rounded-lg"
                onPress={handleConfirmPreOrder}
              >
                <Text className="text-lg font-semibold text-white">
                  Confirm Pre-Order
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProductDetailsScreen;
