"use client";

import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import MapView, { Marker } from "react-native-maps";
import axios from "axios";
import * as Location from "expo-location";
import Ionicons from "@expo/vector-icons/Ionicons";

const SellerAddressSetupScreen = ({ navigation, route }) => {
  const { addressType, onAddressSet, existingAddress, namingConvention } =
    route.params;

  const mapRef = useRef(null);
  const [region, setRegion] = useState({
    latitude: 13.3594,
    longitude: 123.7455,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [markerCoordinate, setMarkerCoordinate] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Detect if existingAddress is snake_case
  const isSnakeCase =
    namingConvention === "snake case" ||
    (existingAddress &&
      Object.keys(existingAddress).some((key) => key.includes("_")))
      ? true
      : false;

  const [formData, setFormData] = useState({
    streetAddress: isSnakeCase
      ? existingAddress?.street_address || ""
      : existingAddress?.streetAddress || "",
    barangay: isSnakeCase
      ? existingAddress?.barangay || ""
      : existingAddress?.barangay || "",
    city: isSnakeCase
      ? existingAddress?.city || ""
      : existingAddress?.city || "",
    province: isSnakeCase
      ? existingAddress?.province || ""
      : existingAddress?.province || "",
    postalCode: isSnakeCase
      ? existingAddress?.postal_code || ""
      : existingAddress?.postalCode || "",
    landmark: isSnakeCase
      ? existingAddress?.landmark || ""
      : existingAddress?.landmark || "",
  });

  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (existingAddress?.latitude && existingAddress?.longitude) {
      const coordinate = {
        latitude: Number.parseFloat(existingAddress.latitude),
        longitude: Number.parseFloat(existingAddress.longitude),
      };
      setMarkerCoordinate(coordinate);
      setRegion({
        ...coordinate,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [existingAddress]);

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Location permission is required to use this feature."
        );
        setIsLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coordinate = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      if (!existingAddress) {
        setRegion({
          ...coordinate,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setMarkerCoordinate(coordinate);
        await reverseGeocode(coordinate);
      }
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Failed to get current location");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const reverseGeocode = async (coordinate) => {
    const getStreetAddress = (address) => {
      if (address.streetNumber)
        return `${address.streetNumber} ${address.street}`;
      if (address.street === "Unnamed Road") return "";
      return address.street || "";
    };

    try {
      const response = await axios.get(
        "https://nominatim.openstreetmap.org/reverse",
        {
          params: {
            lat: coordinate.latitude,
            lon: coordinate.longitude,
            format: "json",
            addressdetails: 1,
          },
          headers: {
            "User-Agent": "MyApp/1.0 (contact@example.com)",
          },
        }
      );

      const data = response.data;

      if (data && data.address) {
        const address = {
          streetNumber: data.address.house_number || "",
          street:
            data.address.road ||
            data.address.residential ||
            data.address.amenity ||
            "",
          barangay: data.address.village || data.address.quarter || "",
          city:
            data.address.city ||
            data.address.town ||
            data.address.village ||
            "",
          region: data.address.city || "",
          subregion: data.address.state || "",
          postalCode: data.address.postcode || "",
        };

        setFormData({
          streetAddress: getStreetAddress(address),
          barangay: address.barangay || "",
          city: address.city || address.region || "",
          province: address.subregion || "",
          postalCode: address.postalCode || "",
          landmark: "",
        });
        setLocationError("");
      } else {
        console.warn("OpenStreetMap returned no address data.");
      }
    } catch (error) {
      console.error(
        "OpenStreetMap reverse geocoding failed, falling back to Google reverse geocoding"
      );

      try {
        const result = await Location.reverseGeocodeAsync({
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
        });

        if (result.length > 0) {
          const address = result[0];
          setFormData({
            streetAddress: getStreetAddress(address),
            barangay: "",
            city: address.city || address.region || "",
            province: address.subregion || "",
            postalCode: address.postalCode || "",
            landmark: "",
          });
        }
      } catch (error) {
        console.warn(
          "Fallback google reverse geocoding failed:",
          error.message
        );
      }
    }
  };

  const searchLocation = async (customText = null) => {
    const searchText =
      customText ??
      `${formData.barangay}, ${formData.city}, ${formData.province}`;

    if (
      !searchText.trim() ||
      searchText.split(",").filter((part) => part.trim()).length < 2
    )
      return;

    try {
      setIsSearching(true);
      setLocationError("");

      const result = await Location.geocodeAsync(searchText);

      if (result && result.length > 0) {
        const coordinate = {
          latitude: result[0].latitude,
          longitude: result[0].longitude,
        };

        setMarkerCoordinate(coordinate);
        setRegion({
          ...coordinate,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });

        mapRef.current?.animateToRegion({
          ...coordinate,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });

        await reverseGeocode(coordinate);
      } else {
        setLocationError("Location not found. Please check your address.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setLocationError("Unable to find location. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (["city", "province"].includes(field)) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        const nextForm = {
          ...formData,
          [field]: value,
        };
        const searchText = `${nextForm.barangay}, ${nextForm.city}, ${nextForm.province}`;
        searchLocation(searchText);
      }, 1500);
    }
  };

  const handleMapPress = async (event) => {
    const coordinate = event.nativeEvent.coordinate;
    setMarkerCoordinate(coordinate);
    await reverseGeocode(coordinate);
  };

  const handleSave = () => {
    if (!markerCoordinate) {
      Alert.alert("Error", "Please select a location on the map");
      return;
    }

    if (
      !formData.streetAddress.trim() ||
      !formData.barangay.trim() ||
      !formData.city.trim() ||
      !formData.province.trim()
    ) {
      Alert.alert("Error", "Please fill in all required address fields");
      return;
    }

    if (locationError) {
      Alert.alert("Error", "Please resolve the location error before saving");
      return;
    }

    const addressData = {
      type: addressType,
      streetAddress: formData.streetAddress.trim(),
      barangay: formData.barangay.trim(),
      city: formData.city.trim(),
      province: formData.province.trim(),
      postalCode: formData.postalCode.trim(),
      landmark: formData.landmark.trim(),
      latitude: markerCoordinate.latitude,
      longitude: markerCoordinate.longitude,
    };

    //Convert to snake_case if needed
    const finalData = isSnakeCase ? toSnakeCase(addressData) : addressData;

    onAddressSet(finalData);
    navigation.goBack();
  };

  const toSnakeCase = (obj) =>
    Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
        value,
      ])
    );

  const getAddressTypeTitle = () => {
    switch (addressType) {
      case "pickup":
        return "Pickup Address";
      case "return":
        return "Return Address";
      case "store":
        return "Store Location";
      default:
        return "Address";
    }
  };

  const getAddressTypeDescription = () => {
    switch (addressType) {
      case "pickup":
        return "Select where couriers will collect your items";
      case "return":
        return "Select the address for returned items";
      case "store":
        return "Select the physical store location for customer pickup";
      default:
        return "Set your address location";
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold">{getAddressTypeTitle()}</Text>
        <View className="w-6" />
      </View>

      {/* Description */}
      <View className="px-6 py-4 border-b border-blue-200 bg-blue-50">
        <Text className="mb-2 text-sm text-blue-700">
          {getAddressTypeDescription()}
        </Text>

        <Text className="text-sm text-gray-600">
          Tap on the map to pin your exact location
        </Text>
      </View>

      {/* Map */}
      <View className="flex-1">
        {isLoadingLocation ? (
          <View className="items-center justify-center flex-1">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="mt-2 text-gray-600">Getting your location...</Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            region={region}
            onPress={handleMapPress}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {markerCoordinate && (
              <Marker
                coordinate={markerCoordinate}
                title={getAddressTypeTitle()}
                description={`Your selected ${getAddressTypeTitle().toLowerCase() || "address"}`}
              />
            )}
          </MapView>
        )}
      </View>

      {/* Address Form */}
      <View className="px-6 py-4 bg-white border-t border-gray-200">
        {locationError ? (
          <View className="p-3 mb-4 border border-red-200 rounded-lg bg-red-50">
            <Text className="text-sm text-red-600">{locationError}</Text>
          </View>
        ) : null}

        {isSearching && (
          <View className="flex flex-row items-center p-3 mb-4 border border-blue-200 rounded-lg bg-blue-50">
            <ActivityIndicator size="small" color="#3b82f6" />
            <Text className="ml-2 text-sm text-blue-600">
              Searching location...
            </Text>
          </View>
        )}

        <View className="mb-3">
          <Text className="mb-2 text-sm font-medium">Street Address *</Text>
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={formData.streetAddress}
            onChangeText={(value) => handleInputChange("streetAddress", value)}
            placeholder="Enter street address"
          />
        </View>

        <View className="flex flex-row gap-3 mb-3">
          <View className="flex-1">
            <Text className="mb-2 text-sm font-medium">Barangay *</Text>
            <TextInput
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={formData.barangay}
              onChangeText={(value) => handleInputChange("barangay", value)}
              placeholder="Barangay"
            />
          </View>
          <View className="flex-1">
            <Text className="mb-2 text-sm font-medium">City *</Text>
            <TextInput
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={formData.city}
              onChangeText={(value) => handleInputChange("city", value)}
              placeholder="City"
              onEndEditing={() => {
                if (searchTimeoutRef.current) {
                  clearTimeout(searchTimeoutRef.current);
                }
                searchLocation();
              }}
            />
          </View>
        </View>

        <View className="flex flex-row gap-3 mb-3">
          <View className="flex-1">
            <Text className="mb-2 text-sm font-medium">Province *</Text>
            <TextInput
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={formData.province}
              onChangeText={(value) => handleInputChange("province", value)}
              placeholder="Province"
              onEndEditing={() => {
                if (searchTimeoutRef.current) {
                  clearTimeout(searchTimeoutRef.current);
                }
                searchLocation();
              }}
            />
          </View>
          <View className="flex-1">
            <Text className="mb-2 text-sm font-medium">Postal Code</Text>
            <TextInput
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={formData.postalCode}
              onChangeText={(value) => handleInputChange("postalCode", value)}
              placeholder="Postal Code"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View className="mb-4">
          <Text className="mb-2 text-sm font-medium">Landmark</Text>
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={formData.landmark}
            onChangeText={(value) => handleInputChange("landmark", value)}
            placeholder="Nearby landmark (optional)"
          />
        </View>

        <TouchableOpacity
          className="w-full py-4 bg-orange-500 rounded-lg"
          onPress={handleSave}
          disabled={isSearching || !!locationError}
        >
          <Text className="font-semibold text-center text-white">
            Save {getAddressTypeTitle()}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SellerAddressSetupScreen;
