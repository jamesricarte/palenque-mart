import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"

const PreOrderCard = ({ preOrder, onStatusUpdate, onViewDetails }) => {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onViewDetails}>
      <View style={styles.header}>
        <View style={styles.preOrderInfo}>
          <Text style={styles.preOrderId}>Pre-Order #{preOrder.id}</Text>
          <Text style={styles.customerName}>{preOrder.customer_name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(preOrder.status) }]}>
          <Text style={styles.statusText}>{preOrder.status.replace("_", " ").toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.scheduleInfo}>
        <View style={styles.dateRow}>
          <Icon name="schedule" size={16} color="#8B5CF6" />
          <Text style={styles.dateLabel}>Scheduled: </Text>
          <Text style={styles.dateValue}>{formatDate(preOrder.scheduled_date)}</Text>
        </View>
        <View style={styles.dateRow}>
          <Icon name="local-shipping" size={16} color="#8B5CF6" />
          <Text style={styles.dateLabel}>Ship Date: </Text>
          <Text style={styles.dateValue}>{formatDate(preOrder.expected_ship_date)}</Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.itemCount}>{preOrder.items?.length || 0} item(s)</Text>
        <Text style={styles.totalAmount}>₱{preOrder.total_amount}</Text>
      </View>

      {preOrder.deposit_amount > 0 && (
        <View style={styles.depositInfo}>
          <Icon name="account-balance-wallet" size={14} color="#059669" />
          <Text style={styles.depositText}>Deposit: ₱{preOrder.deposit_amount}</Text>
        </View>
      )}

      <View style={styles.quickActions}>
        {preOrder.status === "scheduled" && (
          <TouchableOpacity
            style={[styles.quickActionBtn, styles.confirmBtn]}
            onPress={() => onStatusUpdate(preOrder.id, "confirmed")}
          >
            <Icon name="check" size={16} color="#fff" />
            <Text style={styles.quickActionText}>Confirm</Text>
          </TouchableOpacity>
        )}
        {preOrder.status === "confirmed" && (
          <TouchableOpacity
            style={[styles.quickActionBtn, styles.prepareBtn]}
            onPress={() => onStatusUpdate(preOrder.id, "preparing")}
          >
            <Icon name="build" size={16} color="#fff" />
            <Text style={styles.quickActionText}>Prepare</Text>
          </TouchableOpacity>
        )}
        {preOrder.status === "preparing" && (
          <TouchableOpacity
            style={[styles.quickActionBtn, styles.readyBtn]}
            onPress={() => onStatusUpdate(preOrder.id, "ready")}
          >
            <Icon name="done-all" size={16} color="#fff" />
            <Text style={styles.quickActionText}>Ready</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#8B5CF6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  preOrderInfo: {
    flex: 1,
  },
  preOrderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    color: "#6b7280",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  scheduleInfo: {
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 4,
  },
  dateValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1f2937",
  },
  orderDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemCount: {
    fontSize: 12,
    color: "#6b7280",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#059669",
  },
  depositInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  depositText: {
    fontSize: 12,
    color: "#059669",
    marginLeft: 4,
    fontWeight: "600",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  quickActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  confirmBtn: {
    backgroundColor: "#10B981",
  },
  prepareBtn: {
    backgroundColor: "#F59E0B",
  },
  readyBtn: {
    backgroundColor: "#06B6D4",
  },
  quickActionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
})

export default PreOrderCard
