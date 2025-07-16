"use client";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from "react-native";
import { useState, useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import axios from "axios";
import { API_URL } from "../../../config/apiConfig";
import { useAuth } from "../../../context/AuthContext";

const AdminDeliveryApplicationsScreen = ({ navigation, route }) => {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(
    route?.params?.filter || "all"
  );
  const [searchQuery, setSearchQuery] = useState("");

  const statusOptions = [
    { value: "all", label: "All", color: "bg-gray-100" },
    { value: "pending", label: "Pending", color: "bg-yellow-100" },
    { value: "under_review", label: "Review", color: "bg-blue-100" },
    { value: "approved", label: "Approved", color: "bg-green-100" },
    { value: "rejected", label: "Rejected", color: "bg-red-100" },
  ];

  const fetchApplications = async (
    isRefresh = false,
    status = selectedStatus
  ) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await axios.get(
        `${API_URL}/api/admin/delivery-partner-applications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            status: status === "all" ? undefined : status,
            page: 1,
            limit: 50,
          },
        }
      );

      if (response.data.success) {
        setApplications(response.data.data.applications);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplications(false, selectedStatus);
  }, [selectedStatus]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "under_review":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const ApplicationCard = ({ application }) => (
    <TouchableOpacity className="p-4 mb-3 bg-white border border-gray-200 rounded-lg">
      <View className="flex flex-row items-start justify-between mb-2">
        <View className="flex-1">
          <Text className="text-base font-semibold">
            {application.first_name} {application.last_name}
          </Text>
          <Text className="text-sm text-gray-600">
            ID: {application.application_id}
          </Text>
        </View>
        <View
          className={`px-2 py-1 rounded-full border ${getStatusColor(application.status)}`}
        >
          <Text className="text-xs font-medium capitalize">
            {application.status.replace("_", " ")}
          </Text>
        </View>
      </View>

      <View className="flex flex-row items-center justify-between mb-2">
        <View className="flex flex-row items-center">
          <Feather name="truck" size={14} color="#6b7280" />
          <Text className="ml-1 text-sm text-gray-600 capitalize">
            {application.vehicle_type}
          </Text>
        </View>
        <Text className="text-sm text-gray-500">
          {formatDate(application.created_at)}
        </Text>
      </View>

      <View className="flex flex-row items-center">
        <Ionicons name="mail-outline" size={14} color="#6b7280" />
        <Text className="ml-1 text-sm text-gray-600">{application.email}</Text>
      </View>
    </TouchableOpacity>
  );

  const filteredApplications = applications.filter((app) =>
    searchQuery
      ? app.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.application_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <View className="flex flex-row items-center justify-between mb-4">
          <Text className="text-xl font-semibold">Delivery Applications</Text>
          <TouchableOpacity
            onPress={() => fetchApplications(true, selectedStatus)}
          >
            <Ionicons name="refresh" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View className="relative mb-4">
          <TextInput
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg bg-gray-50"
            placeholder="Search applications..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons
            name="search"
            size={20}
            color="#6b7280"
            className="absolute left-3 top-3"
          />
        </View>

        {/* Status Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex flex-row"
        >
          {statusOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              className={`px-4 py-2 mr-2 rounded-full border ${
                selectedStatus === option.value
                  ? "border-blue-500 bg-blue-50"
                  : `border-gray-300 ${option.color}`
              }`}
              onPress={() => setSelectedStatus(option.value)}
            >
              <Text
                className={`text-sm font-medium ${selectedStatus === option.value ? "text-blue-600" : "text-gray-700"}`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Applications List */}
      <ScrollView
        className="flex-1 px-4 py-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchApplications(true, selectedStatus)}
          />
        }
      >
        {loading ? (
          <View className="items-center justify-center flex-1 py-20">
            <Text className="text-gray-500">Loading applications...</Text>
          </View>
        ) : filteredApplications.length === 0 ? (
          <View className="items-center justify-center flex-1 py-20">
            <Feather name="inbox" size={48} color="#d1d5db" />
            <Text className="mt-4 mb-2 text-lg font-medium">
              No Applications Found
            </Text>
            <Text className="text-center text-gray-500">
              {searchQuery
                ? "No applications match your search."
                : "No delivery partner applications available."}
            </Text>
          </View>
        ) : (
          filteredApplications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default AdminDeliveryApplicationsScreen;
