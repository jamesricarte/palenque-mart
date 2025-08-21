"use client";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useState, useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import axios from "axios";
import { API_URL } from "../../config/apiConfig";
import { useAuth } from "../../context/AuthContext";

const AdminSellerApplicationDetailsScreen = ({ navigation, route }) => {
  const { applicationId } = route.params;
  const { token } = useAuth();
  const [applicationData, setApplicationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // State for document viewer modal
  const [isDocumentModalVisible, setDocumentModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [signedUrl, setSignedUrl] = useState(null);

  // State for application rejection modal
  const [isRejectionModalVisible, setRejectionModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // State for document rejection modal
  const [isDocRejectionModalVisible, setDocRejectionModalVisible] =
    useState(false);
  const [rejectionReasonForDoc, setRejectionReasonForDoc] = useState("");
  const [selectedDocForRejection, setSelectedDocForRejection] = useState(null);

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
    if (action === "reject") {
      setRejectionModalVisible(true);
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

  const handleRejectSubmit = () => {
    if (rejectionReason && rejectionReason.trim()) {
      submitReview("reject", rejectionReason.trim());
      setRejectionModalVisible(false);
      setRejectionReason("");
    } else {
      Alert.alert("Error", "Rejection reason is required");
    }
  };

  const submitReview = async (action, reason = null) => {
    try {
      setProcessing(true);
      const response = await axios.post(
        `${API_URL}/api/admin/seller-applications/${applicationId}/review`,
        {
          action,
          rejectionReason: reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        Alert.alert("Success", `Application approved successfully`, [
          {
            text: "OK",
            onPress: () =>
              navigation.navigate("AdminDashboard", {
                screen: "Sellers",
              }),
          },
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

  const viewDocument = async (document) => {
    try {
      setSelectedDocument(document);
      setSignedUrl(null);
      setDocumentModalVisible(true);
      setImageLoading(true);

      const response = await axios.post(
        `${API_URL}/api/admin/documents/signed-url`,
        {
          bucket: "seller-documents",
          path: document.storage_key,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSignedUrl(response.data.data.signedUrl);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error getting signed URL:", error);
      Alert.alert("Error", "Could not load document.");
      setDocumentModalVisible(false);
    } finally {
      setImageLoading(false);
    }
  };

  const handleDocumentReview = async (docId, action, reason = null) => {
    try {
      setProcessing(true);
      const response = await axios.post(
        `${API_URL}/api/admin/seller-documents/${docId}/review`,
        { action, rejectionReason: reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        Alert.alert("Success", "Document status updated.");
        fetchApplicationDetails(); // Refresh data
      }
    } catch (error) {
      console.error("Error reviewing document:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update document status."
      );
    } finally {
      setProcessing(false);
      setDocRejectionModalVisible(false);
      setRejectionReasonForDoc("");
    }
  };

  const openDocRejectionModal = (doc) => {
    setSelectedDocForRejection(doc);
    setDocRejectionModalVisible(true);
  };

  const handleDocRejectSubmit = () => {
    if (rejectionReasonForDoc && rejectionReasonForDoc.trim()) {
      handleDocumentReview(
        selectedDocForRejection.id,
        "reject",
        rejectionReasonForDoc.trim()
      );
    } else {
      Alert.alert("Error", "Rejection reason is required.");
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
      case "needs_resubmission":
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getDocStatusStyle = (status) => {
    switch (status) {
      case "verified":
        return {
          badge: "bg-green-100 border-green-200",
          text: "text-green-700",
        };
      case "rejected":
        return {
          badge: "bg-red-100 border-red-200",
          text: "text-red-700",
        };
      default: // pending
        return {
          badge: "bg-yellow-100 border-yellow-200",
          text: "text-yellow-700",
        };
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

  const getAddressTypeFullAddress = (addressType) => {
    const parts = [
      addressType?.street_address || null,
      addressType?.barangay || null,
      addressType?.city || null,
      addressType?.province || null,
    ];

    return parts.filter((part) => part && part.trim() !== "").join(", ");
  };

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
          <ActivityIndicator size="large" color="#0000ff" />
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

  const requiredDocTypes = ["government_id", "selfie_with_id"];
  if (application.account_type === "business") {
    requiredDocTypes.push("business_documents");
  }

  const allRequiredDocsVerified = documents
    .filter((doc) => requiredDocTypes.includes(doc.document_type))
    .every((doc) => doc.verification_status === "verified");

  const confirmVerifyDocument = (doc) => {
    Alert.alert(
      "Verify Document",
      `Are you sure you want to verify the "${doc.document_type.replace(/_/g, " ")}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Verify",
          onPress: () => handleDocumentReview(doc.id, "verify"),
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Document Viewer Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isDocumentModalVisible}
        onRequestClose={() => setDocumentModalVisible(false)}
      >
        <View className="items-center justify-center flex-1 p-4 bg-black/80">
          <View className="relative w-full p-4 bg-white rounded-lg h-4/5">
            <TouchableOpacity
              onPress={() => setDocumentModalVisible(false)}
              className="absolute z-10 p-1 bg-gray-200 rounded-full top-2 right-2"
            >
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            {selectedDocument && (
              <>
                <Text className="mb-2 text-lg font-bold capitalize">
                  {selectedDocument.document_type.replace(/_/g, " ")}
                </Text>
                <View className="items-center justify-center flex-1">
                  {(imageLoading || !signedUrl) && (
                    <ActivityIndicator size="large" color="#0000ff" />
                  )}
                  {signedUrl && (
                    <Image
                      source={{ uri: signedUrl }}
                      className="flex-1 w-full"
                      resizeMode="contain"
                      onLoadStart={() => setImageLoading(true)}
                      onLoadEnd={() => setImageLoading(false)}
                    />
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Application Rejection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isRejectionModalVisible}
        onRequestClose={() => setRejectionModalVisible(false)}
      >
        <View className="items-center justify-center flex-1 p-4 bg-black/50">
          <View className="w-full p-6 bg-white rounded-lg">
            <Text className="mb-4 text-lg font-bold">Reject Application</Text>
            <Text className="mb-2 text-gray-600">
              Please provide a reason for rejection:
            </Text>
            <TextInput
              className="w-full h-24 p-3 mb-4 border border-gray-300 rounded-lg"
              placeholder="Enter rejection reason"
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
              textAlignVertical="top"
            />
            <View className="flex flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-3 border border-gray-300 rounded-lg"
                onPress={() => {
                  setRejectionModalVisible(false);
                  setRejectionReason("");
                }}
              >
                <Text className="font-semibold text-center">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 bg-red-500 rounded-lg"
                onPress={handleRejectSubmit}
                disabled={processing}
              >
                <Text className="font-semibold text-center text-white">
                  {processing ? "Submitting..." : "Submit Rejection"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Document Rejection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isDocRejectionModalVisible}
        onRequestClose={() => setDocRejectionModalVisible(false)}
      >
        <View className="items-center justify-center flex-1 p-4 bg-black/50">
          <View className="w-full p-6 bg-white rounded-lg">
            <Text className="mb-4 text-lg font-bold">Reject Document</Text>
            <Text className="mb-2 text-gray-600">
              Reason for rejecting{" "}
              <Text className="font-semibold">
                {selectedDocForRejection?.document_type.replace(/_/g, " ")}
              </Text>
              :
            </Text>
            <TextInput
              className="w-full h-24 p-3 mb-4 border border-gray-300 rounded-lg"
              placeholder="Enter rejection reason"
              value={rejectionReasonForDoc}
              onChangeText={setRejectionReasonForDoc}
              multiline
              textAlignVertical="top"
            />
            <View className="flex flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-3 border border-gray-300 rounded-lg"
                onPress={() => {
                  setDocRejectionModalVisible(false);
                  setRejectionReasonForDoc("");
                }}
              >
                <Text className="font-semibold text-center">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 bg-red-500 rounded-lg"
                onPress={handleDocRejectSubmit}
                disabled={processing}
              >
                <Text className="font-semibold text-center text-white">
                  {processing ? "Submitting..." : "Submit"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
              <Text className="font-medium">
                {getAddressTypeFullAddress(address.pickup_address)}
              </Text>
            </View>
            <View className="mb-2">
              <Text className="mb-1 text-gray-600">Return Address:</Text>
              <Text className="font-medium">
                {getAddressTypeFullAddress(address.return_address)}
              </Text>
            </View>
            {address.store_location && (
              <View className="mb-2">
                <Text className="mb-1 text-gray-600">Store Location:</Text>
                <Text className="font-medium">
                  {getAddressTypeFullAddress(address.store_location)}
                </Text>
              </View>
            )}
          </InfoSection>
        )}

        {/* Documents */}
        {documents && documents.length > 0 && (
          <InfoSection title="Documents">
            {documents.map((doc) => {
              const statusStyle = getDocStatusStyle(doc.verification_status);
              return (
                <View
                  key={doc.id}
                  className="p-3 mb-2 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="flex-1 font-medium capitalize">
                      {doc.document_type.replace(/_/g, " ")}
                    </Text>
                    <View
                      className={`px-2 py-1 rounded-full border ${statusStyle.badge}`}
                    >
                      <Text
                        className={`text-xs font-medium capitalize ${statusStyle.text}`}
                      >
                        {doc.verification_status}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    className="flex-row items-center mt-2"
                    onPress={() => viewDocument(doc)}
                  >
                    <Text className="mr-2 font-semibold text-blue-600">
                      View Document
                    </Text>
                    <Feather name="external-link" size={16} color="#3b82f6" />
                  </TouchableOpacity>

                  {doc.verification_status === "rejected" &&
                    doc.rejection_reason && (
                      <View className="p-2 mt-2 rounded-md bg-red-50">
                        <Text className="text-xs font-semibold text-red-800">
                          Reason: {doc.rejection_reason}
                        </Text>
                      </View>
                    )}

                  {doc.verification_status === "pending" && (
                    <View className="flex-row gap-2 mt-3">
                      <TouchableOpacity
                        className="flex-1 py-2 bg-red-500 rounded-md"
                        onPress={() => openDocRejectionModal(doc)}
                        disabled={processing}
                      >
                        <Text className="font-semibold text-center text-white">
                          Reject
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="flex-1 py-2 bg-green-500 rounded-md"
                        onPress={() => confirmVerifyDocument(doc)}
                        disabled={processing}
                      >
                        <Text className="font-semibold text-center text-white">
                          Verify
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
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
          {!allRequiredDocsVerified && (
            <Text className="mb-2 text-xs text-center text-red-600">
              All required documents must be verified before approving the
              application.
            </Text>
          )}
          <View className="flex flex-row gap-3">
            <TouchableOpacity
              className="flex-1 py-4 border border-red-300 rounded-lg"
              onPress={() => handleReview("reject")}
              disabled={processing}
            >
              <Text className="text-lg font-semibold text-center text-red-600">
                {processing ? "Processing..." : "Reject App"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-4 rounded-lg ${allRequiredDocsVerified ? "bg-green-500" : "bg-gray-300"}`}
              onPress={() => handleReview("approve")}
              disabled={processing || !allRequiredDocsVerified}
            >
              <Text className="text-lg font-semibold text-center text-white">
                {processing ? "Processing..." : "Approve App"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default AdminSellerApplicationDetailsScreen;
