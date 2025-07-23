import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import axios from "axios";

import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/apiConfig";
import PersonalizedLoadingAnimation from "../../components/PersonalizedLoadingAnimation";

const AddressManagementOldScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newAddress, setNewAddress] = useState({
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
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/addresses`);
      if (response.data.success) {
        setAddresses(response.data.data.addresses);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      Alert.alert("Error", "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    // Validate required fields
    const required = [
      "recipient_name",
      "phone_number",
      "street_address",
      "barangay",
      "city",
      "province",
    ];

    for (const field of required) {
      if (!newAddress[field].trim()) {
        Alert.alert("Error", "Please fill in all required fields");
        return;
      }
    }

    setSaving(true);
    try {
      const response = await axios.post(`${API_URL}/api/addresses`, newAddress);
      if (response.data.success) {
        const addedAddress = response.data.data.address;
        setAddresses((prev) => [addedAddress, ...prev]);
        setShowAddModal(false);
        resetNewAddress();
        Alert.alert("Success", "Address added successfully");
      }
    } catch (error) {
      console.error("Error adding address:", error);
      Alert.alert("Error", "Failed to add address");
    } finally {
      setSaving(false);
    }
  };

  const handleEditAddress = async () => {
    // Validate required fields
    const required = [
      "recipient_name",
      "phone_number",
      "street_address",
      "barangay",
      "city",
      "province",
    ];

    for (const field of required) {
      if (!editingAddress[field].trim()) {
        Alert.alert("Error", "Please fill in all required fields");
        return;
      }
    }

    setSaving(true);
    try {
      const response = await axios.put(
        `${API_URL}/api/addresses/${editingAddress.id}`,
        editingAddress
      );
      if (response.data.success) {
        const updatedAddress = response.data.data.address;
        setAddresses((prev) =>
          prev.map((addr) =>
            addr.id === updatedAddress.id ? updatedAddress : addr
          )
        );
        setShowEditModal(false);
        setEditingAddress(null);
        Alert.alert("Success", "Address updated successfully");
      }
    } catch (error) {
      console.error("Error updating address:", error);
      Alert.alert("Error", "Failed to update address");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = (address) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteAddress(address.id),
        },
      ]
    );
  };

  const deleteAddress = async (addressId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/addresses/${addressId}`
      );
      if (response.data.success) {
        setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
        Alert.alert("Success", "Address deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      Alert.alert("Error", "Failed to delete address");
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/addresses/${addressId}/default`
      );
      if (response.data.success) {
        setAddresses((prev) =>
          prev.map((addr) => ({
            ...addr,
            is_default: addr.id === addressId ? 1 : 0,
          }))
        );
        Alert.alert("Success", "Default address updated");
      }
    } catch (error) {
      console.error("Error setting default address:", error);
      Alert.alert("Error", "Failed to set default address");
    }
  };

  const resetNewAddress = () => {
    setNewAddress({
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
    });
  };

  const formatAddressType = (type) => {
    const typeMap = {
      home: "Home",
      work: "Work",
      other: "Other",
    };
    return typeMap[type] || type;
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
            <Text className="ml-4 text-xl font-semibold">My Addresses</Text>
          </View>
        </View>

        <View className="items-center justify-center flex-1">
          <PersonalizedLoadingAnimation />
          <Text className="mt-4 text-gray-600">Loading addresses...</Text>
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
          <Text className="ml-4 text-xl font-semibold">My Addresses</Text>
        </View>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Feather name="plus" size={24} color="#EA580C" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {addresses.length > 0 ? (
          addresses.map((address) => (
            <View
              key={address.id}
              className="p-4 mb-4 bg-white border border-gray-200 rounded-lg"
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-lg font-semibold text-gray-900">
                  {address.recipient_name}
                </Text>
                <View className="flex-row items-center">
                  {address.is_default ? (
                    <View className="px-2 py-1 mr-2 bg-green-100 rounded">
                      <Text className="text-xs font-medium text-green-800">
                        Default
                      </Text>
                    </View>
                  ) : null}
                  <View className="px-2 py-1 bg-gray-100 rounded">
                    <Text className="text-xs font-medium text-gray-800">
                      {formatAddressType(address.address_type)}
                    </Text>
                  </View>
                </View>
              </View>

              <Text className="text-gray-600">{address.phone_number}</Text>
              <Text className="mt-1 text-gray-700">
                {address.street_address}, {address.barangay}
              </Text>
              <Text className="text-gray-700">
                {address.city}, {address.province} {address.postal_code}
              </Text>
              {address.landmark && (
                <Text className="text-sm text-gray-500">
                  Landmark: {address.landmark}
                </Text>
              )}

              <View className="flex-row items-center justify-between mt-4">
                <View className="flex-row">
                  <TouchableOpacity
                    className="px-3 py-2 mr-2 border border-gray-300 rounded-lg"
                    onPress={() => {
                      setEditingAddress({ ...address });
                      setShowEditModal(true);
                    }}
                  >
                    <Text className="text-sm font-medium text-gray-700">
                      Edit
                    </Text>
                  </TouchableOpacity>

                  {!address.is_default && (
                    <TouchableOpacity
                      className="px-3 py-2 mr-2 border border-orange-600 rounded-lg"
                      onPress={() => handleSetDefault(address.id)}
                    >
                      <Text className="text-sm font-medium text-orange-600">
                        Set Default
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  className="p-2"
                  onPress={() => handleDeleteAddress(address)}
                >
                  <Feather name="trash-2" size={18} color="#DC2626" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View className="items-center py-16">
            <Feather name="map-pin" size={64} color="#9CA3AF" />
            <Text className="mt-4 text-xl font-semibold text-gray-600">
              No addresses found
            </Text>
            <Text className="mt-2 text-center text-gray-500">
              Add your first delivery address to get started
            </Text>
            <TouchableOpacity
              className="px-6 py-3 mt-4 bg-orange-600 rounded-lg"
              onPress={() => setShowAddModal(true)}
            >
              <Text className="font-semibold text-white">Add Address</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add Address Modal */}
      <Modal
        transparent
        visible={showAddModal}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View
          className="flex-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <View className="justify-end flex-1">
            <View className="p-6 bg-white rounded-t-3xl max-h-96">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-semibold">Add New Address</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowAddModal(false);
                    resetNewAddress();
                  }}
                >
                  <Feather name="x" size={24} color="black" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="space-y-4">
                  <View>
                    <Text className="mb-1 text-sm font-medium text-gray-700">
                      Recipient Name *
                    </Text>
                    <TextInput
                      className="p-3 border border-gray-300 rounded-lg"
                      value={newAddress.recipient_name}
                      onChangeText={(text) =>
                        setNewAddress((prev) => ({
                          ...prev,
                          recipient_name: text,
                        }))
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
                      value={newAddress.phone_number}
                      onChangeText={(text) =>
                        setNewAddress((prev) => ({
                          ...prev,
                          phone_number: text,
                        }))
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
                      value={newAddress.street_address}
                      onChangeText={(text) =>
                        setNewAddress((prev) => ({
                          ...prev,
                          street_address: text,
                        }))
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
                        value={newAddress.barangay}
                        onChangeText={(text) =>
                          setNewAddress((prev) => ({
                            ...prev,
                            barangay: text,
                          }))
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
                        value={newAddress.city}
                        onChangeText={(text) =>
                          setNewAddress((prev) => ({
                            ...prev,
                            city: text,
                          }))
                        }
                        placeholder="City"
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
                        value={newAddress.province}
                        onChangeText={(text) =>
                          setNewAddress((prev) => ({
                            ...prev,
                            province: text,
                          }))
                        }
                        placeholder="Province"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="mb-1 text-sm font-medium text-gray-700">
                        Postal Code
                      </Text>
                      <TextInput
                        className="p-3 border border-gray-300 rounded-lg"
                        value={newAddress.postal_code}
                        onChangeText={(text) =>
                          setNewAddress((prev) => ({
                            ...prev,
                            postal_code: text,
                          }))
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
                      value={newAddress.landmark}
                      onChangeText={(text) =>
                        setNewAddress((prev) => ({
                          ...prev,
                          landmark: text,
                        }))
                      }
                      placeholder="Near church, mall, etc."
                    />
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity
                className="items-center p-4 mt-4 bg-orange-600 rounded-lg"
                onPress={handleAddAddress}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-lg font-semibold text-white">
                    Save Address
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Address Modal */}
      <Modal
        transparent
        visible={showEditModal}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View
          className="flex-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <View className="justify-end flex-1">
            <View className="p-6 bg-white rounded-t-3xl max-h-96">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-semibold">Edit Address</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowEditModal(false);
                    setEditingAddress(null);
                  }}
                >
                  <Feather name="x" size={24} color="black" />
                </TouchableOpacity>
              </View>

              {editingAddress && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View className="space-y-4">
                    <View>
                      <Text className="mb-1 text-sm font-medium text-gray-700">
                        Recipient Name *
                      </Text>
                      <TextInput
                        className="p-3 border border-gray-300 rounded-lg"
                        value={editingAddress.recipient_name}
                        onChangeText={(text) =>
                          setEditingAddress((prev) => ({
                            ...prev,
                            recipient_name: text,
                          }))
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
                        value={editingAddress.phone_number}
                        onChangeText={(text) =>
                          setEditingAddress((prev) => ({
                            ...prev,
                            phone_number: text,
                          }))
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
                        value={editingAddress.street_address}
                        onChangeText={(text) =>
                          setEditingAddress((prev) => ({
                            ...prev,
                            street_address: text,
                          }))
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
                          value={editingAddress.barangay}
                          onChangeText={(text) =>
                            setEditingAddress((prev) => ({
                              ...prev,
                              barangay: text,
                            }))
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
                          value={editingAddress.city}
                          onChangeText={(text) =>
                            setEditingAddress((prev) => ({
                              ...prev,
                              city: text,
                            }))
                          }
                          placeholder="City"
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
                          value={editingAddress.province}
                          onChangeText={(text) =>
                            setEditingAddress((prev) => ({
                              ...prev,
                              province: text,
                            }))
                          }
                          placeholder="Province"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="mb-1 text-sm font-medium text-gray-700">
                          Postal Code
                        </Text>
                        <TextInput
                          className="p-3 border border-gray-300 rounded-lg"
                          value={editingAddress.postal_code || ""}
                          onChangeText={(text) =>
                            setEditingAddress((prev) => ({
                              ...prev,
                              postal_code: text,
                            }))
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
                        value={editingAddress.landmark || ""}
                        onChangeText={(text) =>
                          setEditingAddress((prev) => ({
                            ...prev,
                            landmark: text,
                          }))
                        }
                        placeholder="Near church, mall, etc."
                      />
                    </View>
                  </View>
                </ScrollView>
              )}

              <TouchableOpacity
                className="items-center p-4 mt-4 bg-orange-600 rounded-lg"
                onPress={handleEditAddress}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-lg font-semibold text-white">
                    Update Address
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AddressManagementOldScreen;
