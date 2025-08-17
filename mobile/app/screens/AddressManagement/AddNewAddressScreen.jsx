"use client";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Keyboard,
  Dimensions,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";

import Feather from "@expo/vector-icons/Feather";

import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/apiConfig";

const { width, height } = Dimensions.get("window");

const AddNewAddressScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const mapRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [searchingLocation, setSearchingLocation] = useState(false);

  // Map and location state
  const [region, setRegion] = useState({
    latitude: 13.3594, // Default to Tabaco City, Albay
    longitude: 123.7319,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [markerCoordinate, setMarkerCoordinate] = useState({
    latitude: 13.3594,
    longitude: 123.7319,
  });

  // Form state
  const [addressForm, setAddressForm] = useState({
    address_type: "home",
    recipient_name: user?.first_name + " " + user?.last_name || "",
    phone_number: user?.phone || "",
    street_address: "",
    barangay: "",
    city: "",
    province: "",
    postal_code: "",
    landmark: "",
    is_default: false,
    latitude: null,
    longitude: null,
  });

  // Debounce timer for address search
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        setLocationPermission(true);
        getCurrentLocation();
      } else {
        setLocationPermission(false);
        Alert.alert(
          "Location Permission",
          "Location permission is required to use the map features. You can still add an address manually."
        );
        setLoading(false);
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(newRegion);
      setMarkerCoordinate({ latitude, longitude });

      // Reverse geocode to get address
      await reverseGeocode(latitude, longitude);

      // Animate map to current location
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    } catch (error) {
      console.error("Error getting current location:", error);
      Alert.alert("Error", "Failed to get current location");
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (latitude, longitude) => {
    const getStreetAddress = (address) => {
      if (address.streetNumber)
        return `${address.streetNumber} ${address.street}`;
      if (address.street === "Unnamed Road") return "";
      return address.street || "";
    };

    try {
      const { data } = await axios.get(
        "https://nominatim.openstreetmap.org/reverse",
        {
          params: {
            lat: latitude,
            lon: longitude,
            format: "json",
            addressdetails: 1,
          },
          headers: {
            "User-Agent": "MyApp/1.0 (contact@example.com)",
          },
        }
      );

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
        setAddressForm((prev) => ({
          ...prev,
          street_address: getStreetAddress(address),
          barangay: address.barangay || "",
          city: address.city || address.region || "",
          province: address.subregion || "",
          postal_code: address.postalCode || "",
          latitude,
          longitude,
        }));
      } else {
        console.warn("OpenStreetMap returned no address data.");
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    }
  };

  const searchLocationFromAddress = async (customQuery = null) => {
    const searchQuery =
      customQuery ??
      `${addressForm.barangay}, ${addressForm.city}, ${addressForm.province}`;

    if (
      !searchQuery.trim() ||
      searchQuery.split(",").filter((part) => part.trim()).length < 2
    ) {
      return;
    }

    setSearchingLocation(true);
    try {
      const result = await Location.geocodeAsync(searchQuery);

      if (result.length > 0) {
        const { latitude, longitude } = result[0];
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setRegion(newRegion);
        setMarkerCoordinate({ latitude, longitude });
        setAddressForm((prev) => ({
          ...prev,
          latitude,
          longitude,
        }));

        // Animate map to found location
        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, 1000);
        }
      } else {
        Alert.alert(
          "Location Not Found",
          "The address you entered could not be found on the map. Please check your address or pin the location manually on the map."
        );
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
      Alert.alert(
        "Invalid Location",
        "Unable to find the location. Please check your address or pin the location manually on the map."
      );
    } finally {
      setSearchingLocation(false);
    }
  };

  const handleAddressFieldChange = (field, value) => {
    setAddressForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Debounce search for location-relevant fields
    if (["city", "province"].includes(field)) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        const nextForm = {
          ...addressForm,
          [field]: value,
        };
        const searchQuery = `${nextForm.barangay}, ${nextForm.city}, ${nextForm.province}`;
        searchLocationFromAddress(searchQuery);
      }, 1500);
    }
  };

  const handleMapPress = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarkerCoordinate({ latitude, longitude });

    // Reverse geocode the selected location
    await reverseGeocode(latitude, longitude);
  };

  const handleSaveAddress = async () => {
    // Validate required fields
    if (
      !addressForm.recipient_name ||
      !addressForm.phone_number ||
      !addressForm.street_address ||
      !addressForm.barangay ||
      !addressForm.city ||
      !addressForm.province ||
      !addressForm.postal_code
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    // Validate coordinates
    if (!addressForm.latitude || !addressForm.longitude) {
      Alert.alert(
        "Location Required",
        "Please select a location on the map or ensure your address can be found."
      );
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/addresses`,
        addressForm
      );
      if (response.data.success) {
        Alert.alert("Success", "Address added successfully", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error adding address:", error);
      Alert.alert("Error", "Failed to add address");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
            <Text className="ml-4 text-xl font-semibold">Add New Address</Text>
          </View>
        </View>

        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#EA580C" />
          <Text className="mt-4 text-gray-600">Loading map...</Text>
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
          <Text className="ml-4 text-xl font-semibold">Add New Address</Text>
        </View>
        {searchingLocation && (
          <ActivityIndicator size="small" color="#EA580C" />
        )}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Map Section */}
        <View className="mb-4 bg-white">
          <View className="p-4 border-b border-gray-200">
            <Text className="mb-2 text-lg font-semibold text-gray-900">
              Select Location
            </Text>
            <Text className="text-sm text-gray-600">
              Tap on the map to pin your exact location
            </Text>
          </View>

          <View style={{ height: height * 0.4 }}>
            {locationPermission ? (
              <MapView
                provider={PROVIDER_GOOGLE}
                ref={mapRef}
                style={{ flex: 1 }}
                region={region}
                onPress={handleMapPress}
                showsUserLocation={true}
                showsMyLocationButton={true}
              >
                <Marker
                  coordinate={markerCoordinate}
                  title="Delivery Address"
                  description="Your selected delivery location"
                />
              </MapView>
            ) : (
              <View className="items-center justify-center flex-1 bg-gray-100">
                <Feather name="map-pin" size={48} color="#9CA3AF" />
                <Text className="mt-2 text-gray-600">Map not available</Text>
                <Text className="text-sm text-gray-500">
                  Location permission required
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Address Form */}
        <View className="p-4 mb-4 bg-white">
          <Text className="mb-4 text-lg font-semibold text-gray-900">
            Address Details
          </Text>

          <View className="space-y-4">
            <View>
              <Text className="mb-1 text-sm font-medium text-gray-700">
                Recipient Name *
              </Text>
              <TextInput
                className="p-3 border border-gray-300 rounded-lg"
                value={addressForm.recipient_name}
                onChangeText={(text) =>
                  handleAddressFieldChange("recipient_name", text)
                }
                placeholder="Full name"
              />
            </View>

            <View>
              <Text className="mb-1 text-sm font-medium text-gray-700">
                Phone Number *
              </Text>
              <TextInput
                className="p-3 border border-gray-300 rounded-lg"
                value={addressForm.phone_number}
                onChangeText={(text) =>
                  handleAddressFieldChange("phone_number", text)
                }
                placeholder="+63 XXX XXX XXXX"
                keyboardType="phone-pad"
              />
            </View>

            <View>
              <Text className="mb-1 text-sm font-medium text-gray-700">
                Street Address *
              </Text>
              <TextInput
                className="p-3 border border-gray-300 rounded-lg"
                value={addressForm.street_address}
                onChangeText={(text) =>
                  handleAddressFieldChange("street_address", text)
                }
                placeholder="House number, street name"
              />
            </View>

            <View className="flex-row space-x-2">
              <View className="flex-1">
                <Text className="mb-1 text-sm font-medium text-gray-700">
                  Barangay *
                </Text>
                <TextInput
                  className="p-3 border border-gray-300 rounded-lg"
                  value={addressForm.barangay}
                  onChangeText={(text) =>
                    handleAddressFieldChange("barangay", text)
                  }
                  placeholder="Barangay"
                />
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-sm font-medium text-gray-700">
                  City *
                </Text>
                <TextInput
                  className="p-3 border border-gray-300 rounded-lg"
                  value={addressForm.city}
                  onChangeText={(text) =>
                    handleAddressFieldChange("city", text)
                  }
                  placeholder="City"
                  onEndEditing={() => {
                    if (searchTimeoutRef.current) {
                      clearTimeout(searchTimeoutRef.current);
                    }
                    searchLocationFromAddress();
                  }}
                />
              </View>
            </View>

            <View className="flex-row space-x-2">
              <View className="flex-1">
                <Text className="mb-1 text-sm font-medium text-gray-700">
                  Province *
                </Text>
                <TextInput
                  className="p-3 border border-gray-300 rounded-lg"
                  value={addressForm.province}
                  onChangeText={(text) =>
                    handleAddressFieldChange("province", text)
                  }
                  placeholder="Province"
                  onEndEditing={() => {
                    if (searchTimeoutRef.current) {
                      clearTimeout(searchTimeoutRef.current);
                    }
                    searchLocationFromAddress();
                  }}
                />
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-sm font-medium text-gray-700">
                  Postal Code
                </Text>
                <TextInput
                  className="p-3 border border-gray-300 rounded-lg"
                  value={addressForm.postal_code}
                  onChangeText={(text) =>
                    handleAddressFieldChange("postal_code", text)
                  }
                  placeholder="4500"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View>
              <Text className="mb-1 text-sm font-medium text-gray-700">
                Landmark
              </Text>
              <TextInput
                className="p-3 border border-gray-300 rounded-lg"
                value={addressForm.landmark}
                onChangeText={(text) =>
                  handleAddressFieldChange("landmark", text)
                }
                placeholder="Near church, mall, etc."
              />
            </View>

            <View className="flex-row items-center">
              <TouchableOpacity
                className={`w-5 h-5 border-2 rounded mr-3 ${
                  addressForm.is_default
                    ? "bg-orange-600 border-orange-600"
                    : "border-gray-300"
                }`}
                onPress={() =>
                  setAddressForm((prev) => ({
                    ...prev,
                    is_default: !prev.is_default,
                  }))
                }
              >
                {addressForm.is_default && (
                  <Feather name="check" size={12} color="white" />
                )}
              </TouchableOpacity>
              <Text className="text-sm text-gray-700">
                Set as default address
              </Text>
            </View>
          </View>
        </View>

        {/* Coordinates Display (for debugging) */}
        {addressForm.latitude && addressForm.longitude && (
          <View className="p-4 mb-4 bg-white">
            <Text className="text-sm text-gray-600">
              Coordinates: {addressForm.latitude.toFixed(6)},{" "}
              {addressForm.longitude.toFixed(6)}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Save Button */}
      <View className="p-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          className="items-center p-4 bg-orange-600 rounded-lg"
          onPress={handleSaveAddress}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-lg font-semibold text-white">
              Save Address
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddNewAddressScreen;
