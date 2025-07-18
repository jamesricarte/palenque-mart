"use client";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { useState, useEffect, useMemo } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { API_URL } from "../../../config/apiConfig";
import { useAuth } from "../../../context/AuthContext";

const SellerApplicationStatusScreen = ({ navigation }) => {
  const { token } = useAuth();
  const [applicationData, setApplicationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stagedFiles, setStagedFiles] = useState({});

  const fetchApplicationStatus = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await axios.get(
        `${API_URL}/api/seller/application-status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setApplicationData(response.data.data);
        setStagedFiles({}); // Reset staged files on refresh
      }
    } catch (error) {
      console.error("Error fetching application status:", error);
      if (error.response?.status === 404) {
        setApplicationData(null);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplicationStatus();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Sorry, we need camera roll permissions to upload images!"
      );
      return false;
    }

    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus.status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Sorry, we need camera permissions to take photos!"
      );
      return false;
    }

    return true;
  };

  const getButtonText = (documentType, isFileStaged) => {
    const photoAction = isFileStaged ? "Retake" : "Take";
    const imageAction = isFileStaged ? "Change" : "Upload";
    const fileAction = isFileStaged ? "Change" : "Select";

    switch (documentType) {
      case "selfie_with_id":
        return `${photoAction} Photo`;
      case "store_logo":
        return `${imageAction} Image`;
      default:
        return `${fileAction} File`;
    }
  };

  const handleSelectFile = async (documentId, documentType) => {
    let result;
    try {
      if (documentType === "selfie_with_id") {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else if (documentType === "store_logo") {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await DocumentPicker.getDocumentAsync({
          type: ["application/pdf", "image/jpeg", "image/png"],
          copyToCacheDirectory: true,
        });
      }

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const file = {
          uri: asset.uri,
          name: asset.fileName || asset.name,
          size: asset.fileSize || asset.size,
          mimeType: asset.mimeType,
          type: asset.type,
        };

        if (file.size > 5 * 1024 * 1024) {
          Alert.alert("File too large", "File size must be less than 5MB");
          return;
        }
        setStagedFiles((prev) => ({ ...prev, [documentId]: file }));
      }
    } catch (error) {
      console.error("Error picking document/image:", error);
      Alert.alert("Error", "Could not select file.");
    }
  };

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      Object.entries(stagedFiles).forEach(([docId, file]) => {
        formData.append(docId, {
          uri: file.uri,
          name: file.name || `upload.${file.uri.split(".").pop()}`,
          type: file.mimeType || file.type || "application/octet-stream",
        });
      });

      const response = await axios.post(
        `${API_URL}/api/seller/resubmit-documents`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        Alert.alert(
          "Success",
          "Documents submitted successfully. They are now pending review."
        );
        fetchApplicationStatus(true);
      }
    } catch (error) {
      console.error("Error resubmitting documents:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to resubmit documents."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartNewApplication = () => {
    navigation.navigate("SellerWelcome");
  };

  const rejectedDocs = useMemo(
    () =>
      applicationData?.documents.filter(
        (d) => d.verification_status === "rejected"
      ) || [],
    [applicationData]
  );

  const allFilesStaged = useMemo(
    () =>
      rejectedDocs.length > 0 &&
      rejectedDocs.every((doc) => stagedFiles[doc.id]),
    [rejectedDocs, stagedFiles]
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "under_review":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "needs_resubmission":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Ionicons name="time-outline" size={20} color="#d97706" />;
      case "under_review":
        return <Ionicons name="eye-outline" size={20} color="#2563eb" />;
      case "needs_resubmission":
        return (
          <Ionicons name="alert-circle-outline" size={20} color="#f97316" />
        );
      case "approved":
        return <Ionicons name="checkmark-circle" size={20} color="#16a34a" />;
      case "rejected":
        return <Ionicons name="close-circle" size={20} color="#dc2626" />;
      default:
        return (
          <Ionicons name="help-circle-outline" size={20} color="#6b7280" />
        );
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Pending Review";
      case "under_review":
        return "Under Review";
      case "needs_resubmission":
        return "Action Required";
      case "approved":
        return "Approved";
      case "rejected":
        return "Application Rejected";
      default:
        return "Unknown";
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

  const getDocumentStatusIcon = (status) => {
    switch (status) {
      case "verified":
        return <Ionicons name="checkmark-circle" size={16} color="#16a34a" />;
      case "rejected":
        return <Ionicons name="close-circle" size={16} color="#dc2626" />;
      default:
        return <Ionicons name="time-outline" size={16} color="#d97706" />;
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold">Application Status</Text>
          <View className="w-6" />
        </View>
        <View className="items-center justify-center flex-1">
          <Text className="text-gray-500">Loading application status...</Text>
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
          <Text className="text-xl font-semibold">Application Status</Text>
          <View className="w-6" />
        </View>
        <View className="items-center justify-center flex-1 px-6">
          <Ionicons name="document-outline" size={80} color="#d1d5db" />
          <Text className="mt-4 mb-2 text-xl font-semibold">
            No Application Found
          </Text>
          <Text className="text-center text-gray-500">
            You haven't submitted a seller application yet.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold">Application Status</Text>
        <TouchableOpacity onPress={() => fetchApplicationStatus(true)}>
          <Ionicons name="refresh" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchApplicationStatus(true)}
          />
        }
      >
        {/* Status Card */}
        <View className="p-6">
          <View
            className={`p-4 rounded-lg border ${getStatusColor(applicationData.status)}`}
          >
            <View className="flex flex-row items-center justify-between mb-2">
              <View className="flex flex-row items-center">
                {getStatusIcon(applicationData.status)}
                <Text className="ml-2 text-lg font-semibold">
                  {getStatusText(applicationData.status)}
                </Text>
              </View>
              <Text className="text-sm font-medium">
                ID: {applicationData.applicationId}
              </Text>
            </View>

            {applicationData.status === "needs_resubmission" && (
              <View className="p-3 mt-3 bg-orange-100 rounded-lg">
                <Text className="mb-1 font-medium text-orange-800">
                  Action Required:
                </Text>
                <Text className="text-orange-700">
                  Please review the rejected documents below, upload new ones,
                  and resubmit your application.
                </Text>
              </View>
            )}

            {applicationData.status === "rejected" && (
              <View className="p-3 mt-3 bg-red-100 rounded-lg">
                <Text className="mb-1 font-medium text-red-800">
                  Rejection Reason:
                </Text>
                <Text className="text-red-700">
                  {applicationData.rejectionReason ||
                    "Your application could not be approved at this time."}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Document Status */}
        {applicationData.documents.length > 0 && (
          <View className="px-6 mb-6">
            <Text className="mb-4 text-lg font-semibold">
              Document Verification
            </Text>
            <View className="space-y-3">
              {applicationData.documents.map((doc, index) => (
                <View key={index} className="p-3 rounded-lg bg-gray-50">
                  <View className="flex flex-row items-center justify-between">
                    <Text className="flex-1 capitalize">
                      {doc.document_type.replace(/_/g, " ")}
                    </Text>
                    <View className="flex flex-row items-center">
                      {getDocumentStatusIcon(doc.verification_status)}
                      <Text className="ml-2 text-sm capitalize">
                        {doc.verification_status}
                      </Text>
                    </View>
                  </View>
                  {doc.verification_status === "rejected" && (
                    <>
                      {doc.rejection_reason && (
                        <View className="p-2 mt-2 rounded-md bg-red-50">
                          <Text className="text-xs font-semibold text-red-800">
                            Reason: {doc.rejection_reason}
                          </Text>
                        </View>
                      )}
                      {applicationData.status === "needs_resubmission" && (
                        <>
                          <TouchableOpacity
                            className="w-full py-2 mt-3 bg-blue-500 rounded-lg"
                            onPress={() =>
                              handleSelectFile(doc.id, doc.document_type)
                            }
                          >
                            <Text className="font-semibold text-center text-white">
                              {getButtonText(
                                doc.document_type,
                                !!stagedFiles[doc.id]
                              )}
                            </Text>
                          </TouchableOpacity>
                          {stagedFiles[doc.id] && (
                            <View className="flex-row items-center justify-between p-2 mt-2 bg-blue-100 rounded-md">
                              <Text
                                className="flex-1 text-xs text-blue-800"
                                numberOfLines={1}
                              >
                                {stagedFiles[doc.id].name}
                              </Text>
                              <TouchableOpacity
                                onPress={() =>
                                  setStagedFiles((prev) => {
                                    const newFiles = { ...prev };
                                    delete newFiles[doc.id];
                                    return newFiles;
                                  })
                                }
                              >
                                <Ionicons
                                  name="close-circle"
                                  size={16}
                                  color="#3b82f6"
                                />
                              </TouchableOpacity>
                            </View>
                          )}
                        </>
                      )}
                    </>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Timeline */}
        <View className="px-6 mb-6">
          <Text className="mb-4 text-lg font-semibold">
            Application Timeline
          </Text>
          <View className="space-y-4">
            <View className="flex flex-row items-center">
              <View className="flex items-center justify-center w-8 h-8 mr-4 bg-green-100 rounded-full">
                <Ionicons name="checkmark" size={16} color="#16a34a" />
              </View>
              <View className="flex-1">
                <Text className="font-medium">Application Submitted</Text>
                <Text className="text-sm text-gray-500">
                  {formatDate(applicationData.submittedAt)}
                </Text>
              </View>
            </View>

            {applicationData.reviewedAt && (
              <View className="flex flex-row items-center">
                <View
                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                    applicationData.status === "approved"
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}
                >
                  <Ionicons
                    name={
                      applicationData.status === "approved"
                        ? "checkmark"
                        : "close"
                    }
                    size={16}
                    color={
                      applicationData.status === "approved"
                        ? "#16a34a"
                        : "#dc2626"
                    }
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-medium">Application Reviewed</Text>
                  <Text className="text-sm text-gray-500">
                    {formatDate(applicationData.reviewedAt)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="px-6 mb-8">
          {applicationData.status === "rejected" && (
            <TouchableOpacity
              className="w-full py-4 bg-black rounded-lg"
              onPress={handleStartNewApplication}
            >
              <Text className="text-lg font-semibold text-center text-white">
                Start New Application
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity className="p-4 mt-4 border border-gray-300 rounded-lg">
            <View className="flex flex-row items-center justify-center">
              <Feather name="help-circle" size={20} color="#374151" />
              <Text className="ml-2 font-medium text-gray-700">
                Contact Support
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {applicationData.status === "needs_resubmission" && (
        <View className="px-6 py-4 bg-white border-t border-gray-200">
          <TouchableOpacity
            className={`w-full py-4 rounded-lg ${!allFilesStaged || isSubmitting ? "bg-gray-300" : "bg-green-500"}`}
            onPress={handleFinalSubmit}
            disabled={!allFilesStaged || isSubmitting}
          >
            <Text className="text-lg font-semibold text-center text-white">
              {isSubmitting ? "Submitting..." : "Resubmit Application"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default SellerApplicationStatusScreen;
