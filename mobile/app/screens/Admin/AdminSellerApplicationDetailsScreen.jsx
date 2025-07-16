"use client";

import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useState, useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import axios from "axios";
import { API_URL } from "../../config/apiConfig";
import { useAuth } from "../../context/AuthContext";

const AdminSellerApplicationDetailsScreen = ({ navigation, route }) => {
  const { applicationId } = route.params;
  const { token } = useAuth();
  const [applicationData, setApplicationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/admin/seller-applications/${applicationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setApplicationData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching application details:", error);
      Alert.alert("Error", "Failed to load application details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationDetails();
  }, []);

  const handleReview = (action) => {
    const actionText = action === "approve" ? "approve" : "reject";

    if (action === "reject") {
      Alert.prompt(
        "Reject Application",
        "Please provide a reason for rejection:",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Reject",
            style: "destructive",
            onPress: (reason) => {
              if (reason && reason.trim()) {
                submitReview(action, reason.trim());
              } else {
                Alert.alert("Error", "Rejection reason is required");
              }
            },
          },
        ],
        "plain-text"
      );
    } else {
      Alert.alert(
        "Approve Application",
        "Are you sure you want to approve this seller application?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Approve", onPress: () => submitReview(action) },
        ]
      );
    }
  };

  const submitReview = async (action, rejectionReason = null) => {
    try {
      setProcessing(true);
      const response = await axios.post(
        `${API_URL}/api/admin/seller-applications/${applicationId}/review`,
        {
          action,
          rejectionReason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        Alert.alert("Success", `Application ${action}d successfully`, [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error("Error reviewing application:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to review application"
      );
    } finally {
      setProcessing(false);
    }
  };

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
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const InfoSection = ({ title, children }) => (
    <View className="p-4 mb-6 bg-white border border-gray-200 rounded-lg">
      <Text className="mb-3 text-lg font-semibold">{title}</Text>
      {children}
    </View>
  );

  const InfoRow = ({ label, value }) => (
    <View className="flex flex-row justify-between mb-2">
      <Text className="flex-1 text-gray-600">{label}:</Text>
      <Text className="font-medium text-right flex-2">{value || "N/A"}</Text>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold">Application Details</Text>
          <View className="w-6" />
        </View>
        <View className="items-center justify-center flex-1">
          <Text className="text-gray-500">Loading application details...</Text>
        </View>
      </View>
    );
  }

  if (!applicationData) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold">Application Details</Text>
          <View className="w-6" />
        </View>
        <View className="items-center justify-center flex-1">
          <Text className="text-gray-500">Application not found</Text>
        </View>
      </View>
    );
  }

  const { application, businessDetails, address, storeProfile, documents } =
    applicationData;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold">Application Details</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Status Card */}
        <View
          className={`p-4 rounded-lg border ${getStatusColor(application.status)} mb-6`}
        >
          <View className="flex flex-row items-center justify-between mb-2">
            <Text className="text-lg font-semibold capitalize">
              {application.status.replace("_", " ")}
            </Text>
            <Text className="text-sm font-medium">
              ID: {application.application_id}
            </Text>
          </View>
          <Text className="text-sm">
            Submitted: {formatDate(application.created_at)}
          </Text>
          {application.reviewed_at && (
            <Text className="text-sm">
              Reviewed: {formatDate(application.reviewed_at)}
            </Text>
          )}
          {application.rejection_reason && (
            <View className="p-3 mt-3 bg-red-100 rounded-lg">
              <Text className="mb-1 font-medium text-red-800">
                Rejection Reason:
              </Text>
              <Text className="text-red-700">
                {application.rejection_reason}
              </Text>
            </View>
          )}
        </View>

        {/* Personal Information */}
        <InfoSection title="Personal Information">
          <InfoRow
            label="Name"
            value={`${application.first_name} ${application.last_name}`}
          />
          <InfoRow label="Email" value={application.email} />
          <InfoRow label="Phone" value={application.phone} />
          <InfoRow label="Birth Date" value={application.birth_date} />
          <InfoRow label="Gender" value={application.gender} />
          <InfoRow label="Account Type" value={application.account_type} />
        </InfoSection>

        {/* Business Details */}
        {businessDetails && (
          <InfoSection title="Business Details">
            <InfoRow
              label="Business Name"
              value={businessDetails.business_name}
            />
            <InfoRow
              label="Registration Number"
              value={businessDetails.business_registration_number}
            />
            <InfoRow
              label="Contact Person"
              value={businessDetails.contact_person}
            />
            <InfoRow
              label="Business Address"
              value={businessDetails.business_address}
            />
          </InfoSection>
        )}

        {/* Store Profile */}
        {storeProfile && (
          <InfoSection title="Store Profile">
            <InfoRow label="Store Name" value={storeProfile.store_name} />
            <View className="mb-2">
              <Text className="mb-1 text-gray-600">Store Description:</Text>
              <Text className="font-medium">
                {storeProfile.store_description}
              </Text>
            </View>
          </InfoSection>
        )}

        {/* Address Information */}
        {address && (
          <InfoSection title="Address Information">
            <View className="mb-2">
              <Text className="mb-1 text-gray-600">Pickup Address:</Text>
              <Text className="font-medium">{address.pickup_address}</Text>
            </View>
            <View className="mb-2">
              <Text className="mb-1 text-gray-600">Return Address:</Text>
              <Text className="font-medium">{address.return_address}</Text>
            </View>
            {address.store_location && (
              <View className="mb-2">
                <Text className="mb-1 text-gray-600">Store Location:</Text>
                <Text className="font-medium">{address.store_location}</Text>
              </View>
            )}
          </InfoSection>
        )}

        {/* Documents */}
        {documents && documents.length > 0 && (
          <InfoSection title="Documents">
            {documents.map((doc, index) => (
              <View
                key={index}
                className="flex flex-row items-center justify-between p-3 mb-2 rounded-lg bg-gray-50"
              >
                <Text className="flex-1 font-medium capitalize">
                  {doc.document_type.replace(/_/g, " ")}
                </Text>
                <View
                  className={`px-2 py-1 rounded-full border ${
                    doc.verification_status === "verified"
                      ? "border-green-200 bg-green-50"
                      : doc.verification_status === "rejected"
                        ? "border-red-200 bg-red-50"
                        : "border-yellow-200 bg-yellow-50"
                  }`}
                >
                  <Text
                    className={`text-xs font-medium capitalize ${
                      doc.verification_status === "verified"
                        ? "text-green-600"
                        : doc.verification_status === "rejected"
                          ? "text-red-600"
                          : "text-yellow-600"
                    }`}
                  >
                    {doc.verification_status}
                  </Text>
                </View>
              </View>
            ))}
          </InfoSection>
        )}

        {/* Reviewer Information */}
        {application.reviewer_first_name && (
          <InfoSection title="Review Information">
            <InfoRow
              label="Reviewed By"
              value={`${application.reviewer_first_name} ${application.reviewer_last_name}`}
            />
            <InfoRow
              label="Review Date"
              value={formatDate(application.reviewed_at)}
            />
          </InfoSection>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {(application.status === "pending" ||
        application.status === "under_review") && (
        <View className="px-4 py-4 bg-white border-t border-gray-200">
          <View className="flex flex-row gap-3">
            <TouchableOpacity
              className="flex-1 py-4 border border-red-300 rounded-lg"
              onPress={() => handleReview("reject")}
              disabled={processing}
            >
              <Text className="text-lg font-semibold text-center text-red-600">
                {processing ? "Processing..." : "Reject"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 py-4 bg-green-500 rounded-lg"
              onPress={() => handleReview("approve")}
              disabled={processing}
            >
              <Text className="text-lg font-semibold text-center text-white">
                {processing ? "Processing..." : "Approve"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default AdminSellerApplicationDetailsScreen;
