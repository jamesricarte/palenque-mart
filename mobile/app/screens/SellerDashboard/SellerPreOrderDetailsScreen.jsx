"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { API_BASE_URL } from "../../config/api"
import { useAuth } from "../../context/AuthContext" // Import useAuth hook to access token

const SellerPreOrderDetailsScreen = ({ route, navigation }) => {
  const { preOrderId } = route.params
  const [preOrder, setPreOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { token } = useAuth() // Access token from AuthContext

  const fetchPreOrderDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pre-orders/${preOrderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setPreOrder(data.preOrder)
    } catch (error) {
      console.error("Error fetching pre-order details:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const updatePreOrderStatus = async (newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pre-orders/${preOrderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setPreOrder((prev) => ({ ...prev, status: newStatus }))
        Alert.alert("Success", "Pre-order status updated successfully")
      }
    } catch (error) {
      console.error("Error updating pre-order status:", error)
      Alert.alert("Error", "Failed to update pre-order status")
    }
  }

  useEffect(() => {
    fetchPreOrderDetails()
  }, [preOrderId])

  const onRefresh = () => {
    setRefreshing(true)
    fetchPreOrderDetails()
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading pre-order details...</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.preOrderId}>Pre-Order #{preOrder?.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(preOrder?.status) }]}>
          <Text style={styles.statusText}>{preOrder?.status?.replace("_", " ").toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Schedule Information</Text>
        <View style={styles.infoRow}>
          <Icon name="schedule" size={20} color="#666" />
          <Text style={styles.infoText}>Scheduled Date: {new Date(preOrder?.scheduled_date).toLocaleDateString()}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="local-shipping" size={20} color="#666" />
          <Text style={styles.infoText}>
            Expected Ship: {new Date(preOrder?.expected_ship_date).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        <Text style={styles.customerName}>{preOrder?.customer_name}</Text>
        <Text style={styles.customerInfo}>{preOrder?.customer_email}</Text>
        <Text style={styles.customerInfo}>{preOrder?.customer_phone}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {preOrder?.items?.map((item, index) => (
          <View key={index} style={styles.itemCard}>
            <Text style={styles.itemName}>{item.product_name}</Text>
            <Text style={styles.itemDetails}>
              Quantity: {item.quantity} {item.unit_type}
            </Text>
            <Text style={styles.itemPrice}>₱{item.price}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Information</Text>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Total Amount:</Text>
          <Text style={styles.paymentAmount}>₱{preOrder?.total_amount}</Text>
        </View>
        {preOrder?.deposit_amount > 0 && (
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Deposit Paid:</Text>
            <Text style={styles.paymentAmount}>₱{preOrder?.deposit_amount}</Text>
          </View>
        )}
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Payment Status:</Text>
          <Text style={[styles.paymentStatus, { color: getPaymentStatusColor(preOrder?.payment_status) }]}>
            {preOrder?.payment_status?.replace("_", " ").toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        {preOrder?.status === "scheduled" && (
          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => updatePreOrderStatus("confirmed")}
          >
            <Icon name="check-circle" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Confirm Pre-Order</Text>
          </TouchableOpacity>
        )}

        {preOrder?.status === "confirmed" && (
          <TouchableOpacity
            style={[styles.actionButton, styles.preparingButton]}
            onPress={() => updatePreOrderStatus("preparing")}
          >
            <Icon name="build" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Start Preparing</Text>
          </TouchableOpacity>
        )}

        {preOrder?.status === "preparing" && (
          <TouchableOpacity
            style={[styles.actionButton, styles.readyButton]}
            onPress={() => updatePreOrderStatus("ready")}
          >
            <Icon name="done-all" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Mark as Ready</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  )
}

const getStatusColor = (status) => {
  const colors = {
    scheduled: "#8B5CF6",
    confirmed: "#10B981",
    preparing: "#F59E0B",
    ready: "#06B6D4",
    cancelled: "#EF4444",
  }
  return colors[status] || "#6B7280"
}

const getPaymentStatusColor = (status) => {
  const colors = {
    pending: "#F59E0B",
    partial_paid: "#8B5CF6",
    paid: "#10B981",
    refunded: "#EF4444",
  }
  return colors[status] || "#6B7280"
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  preOrderId: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  section: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#4b5563",
  },
  customerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 5,
  },
  customerInfo: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 3,
  },
  itemCard: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
  },
  itemDetails: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#059669",
    marginTop: 4,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: "#4b5563",
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
  },
  paymentStatus: {
    fontSize: 14,
    fontWeight: "bold",
  },
  actionButtons: {
    padding: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  confirmButton: {
    backgroundColor: "#10B981",
  },
  preparingButton: {
    backgroundColor: "#F59E0B",
  },
  readyButton: {
    backgroundColor: "#06B6D4",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
})

export default SellerPreOrderDetailsScreen
