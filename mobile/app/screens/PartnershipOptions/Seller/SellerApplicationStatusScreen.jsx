"use client"

import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from "react-native"
import { useState, useEffect } from "react"
import Ionicons from "@expo/vector-icons/Ionicons"
import Feather from "@expo/vector-icons/Feather"
import axios from "axios"
import { API_URL } from "../../../config/apiConfig"
import { useAuth } from "../../../context/AuthContext"

const SellerApplicationStatusScreen = ({ navigation }) => {
  const { token } = useAuth()
  const [applicationData, setApplicationData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchApplicationStatus = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const response = await axios.get(`${API_URL}/api/seller/application-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        setApplicationData(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching application status:", error)
      if (error.response?.status === 404) {
        // No application found, navigate back
        navigation.goBack()
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchApplicationStatus()
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "under_review":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "approved":
        return "text-green-600 bg-green-50 border-green-200"
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Ionicons name="time-outline" size={20} color="#d97706" />
      case "under_review":
        return <Ionicons name="eye-outline" size={20} color="#2563eb" />
      case "approved":
        return <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
      case "rejected":
        return <Ionicons name="close-circle" size={20} color="#dc2626" />
      default:
        return <Ionicons name="help-circle-outline" size={20} color="#6b7280" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Pending Review"
      case "under_review":
        return "Under Review"
      case "approved":
        return "Approved"
      case "rejected":
        return "Rejected"
      default:
        return "Unknown"
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDocumentStatusIcon = (status) => {
    switch (status) {
      case "verified":
        return <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
      case "rejected":
        return <Ionicons name="close-circle" size={16} color="#dc2626" />
      default:
        return <Ionicons name="time-outline" size={16} color="#d97706" />
    }
  }

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
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Loading application status...</Text>
        </View>
      </View>
    )
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
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="document-outline" size={80} color="#d1d5db" />
          <Text className="text-xl font-semibold mt-4 mb-2">No Application Found</Text>
          <Text className="text-gray-500 text-center">You haven't submitted a seller application yet.</Text>
        </View>
      </View>
    )
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchApplicationStatus(true)} />}
      >
        {/* Status Card */}
        <View className="p-6">
          <View className={`p-4 rounded-lg border ${getStatusColor(applicationData.status)}`}>
            <View className="flex flex-row items-center justify-between mb-2">
              <View className="flex flex-row items-center">
                {getStatusIcon(applicationData.status)}
                <Text className="ml-2 text-lg font-semibold">{getStatusText(applicationData.status)}</Text>
              </View>
              <Text className="text-sm font-medium">ID: {applicationData.applicationId}</Text>
            </View>

            {applicationData.status === "rejected" && applicationData.rejectionReason && (
              <View className="mt-3 p-3 bg-red-100 rounded-lg">
                <Text className="text-red-800 font-medium mb-1">Rejection Reason:</Text>
                <Text className="text-red-700">{applicationData.rejectionReason}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Timeline */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold mb-4">Application Timeline</Text>
          <View className="space-y-4">
            <View className="flex flex-row items-center">
              <View className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <Ionicons name="checkmark" size={16} color="#16a34a" />
              </View>
              <View className="flex-1">
                <Text className="font-medium">Application Submitted</Text>
                <Text className="text-sm text-gray-500">{formatDate(applicationData.submittedAt)}</Text>
              </View>
            </View>

            {applicationData.reviewedAt && (
              <View className="flex flex-row items-center">
                <View
                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                    applicationData.status === "approved" ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  <Ionicons
                    name={applicationData.status === "approved" ? "checkmark" : "close"}
                    size={16}
                    color={applicationData.status === "approved" ? "#16a34a" : "#dc2626"}
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-medium">Application Reviewed</Text>
                  <Text className="text-sm text-gray-500">{formatDate(applicationData.reviewedAt)}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Store Information */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold mb-4">Store Information</Text>
          <View className="p-4 bg-gray-50 rounded-lg">
            <View className="mb-3">
              <Text className="text-sm font-medium text-gray-600">Store Name</Text>
              <Text className="text-base">{applicationData.storeName}</Text>
            </View>
            <View className="mb-3">
              <Text className="text-sm font-medium text-gray-600">Account Type</Text>
              <Text className="text-base capitalize">{applicationData.accountType}</Text>
            </View>
            {applicationData.storeDescription && (
              <View>
                <Text className="text-sm font-medium text-gray-600">Description</Text>
                <Text className="text-base">{applicationData.storeDescription}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Business Details (if business account) */}
        {applicationData.businessDetails && (
          <View className="px-6 mb-6">
            <Text className="text-lg font-semibold mb-4">Business Details</Text>
            <View className="p-4 bg-gray-50 rounded-lg">
              <View className="mb-3">
                <Text className="text-sm font-medium text-gray-600">Business Name</Text>
                <Text className="text-base">{applicationData.businessDetails.business_name}</Text>
              </View>
              <View className="mb-3">
                <Text className="text-sm font-medium text-gray-600">Registration Number</Text>
                <Text className="text-base">{applicationData.businessDetails.business_registration_number}</Text>
              </View>
              <View>
                <Text className="text-sm font-medium text-gray-600">Contact Person</Text>
                <Text className="text-base">{applicationData.businessDetails.contact_person}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Document Status */}
        {applicationData.documents.length > 0 && (
          <View className="px-6 mb-6">
            <Text className="text-lg font-semibold mb-4">Document Verification</Text>
            <View className="space-y-3">
              {applicationData.documents.map((doc, index) => (
                <View key={index} className="flex flex-row items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <Text className="flex-1 capitalize">{doc.document_type.replace(/_/g, " ")}</Text>
                  <View className="flex flex-row items-center">
                    {getDocumentStatusIcon(doc.verification_status)}
                    <Text className="ml-2 text-sm capitalize">{doc.verification_status}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Contact Support */}
        <View className="px-6 mb-8">
          <TouchableOpacity className="p-4 border border-gray-300 rounded-lg">
            <View className="flex flex-row items-center justify-center">
              <Feather name="help-circle" size={20} color="#374151" />
              <Text className="ml-2 text-gray-700 font-medium">Contact Support</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

export default SellerApplicationStatusScreen
