"use client";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import axios from "axios";

import { API_URL } from "../../../config/apiConfig";
import { useSeller } from "../../../context/SellerContext";

const SellerAnalyticsScreen = ({ navigation }) => {
  const { refreshTransactionData, refreshAnalyticsData } = useSeller();

  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState({
    period: "7days",
    revenueOverTime: [],
    paymentMethodBreakdown: [],
    orderStatusBreakdown: [],
    categoryPerformance: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreTransactions, setHasMoreTransactions] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("7days");
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [filterLoading, setFilterLoading] = useState(false);

  const periods = [
    { value: "7days", label: "Last 7 Days" },
    { value: "30days", label: "Last 30 Days" },
    { value: "90days", label: "Last 90 Days" },
    { value: "1year", label: "Last Year" },
  ];

  const statusFilters = [
    { value: "all", label: "All Transactions" },
    { value: "paid", label: "Paid" },
    { value: "pending", label: "Pending" },
    { value: "failed", label: "Failed" },
  ];

  const fetchAnalytics = async (period = selectedPeriod) => {
    try {
      setError(null);
      const response = await axios.get(`${API_URL}/api/seller/analytics`, {
        params: { period },
      });

      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError("Failed to load analytics");
    }
  };

  const fetchTransactions = async (
    page = 1,
    status = selectedFilter,
    reset = false
  ) => {
    try {
      setError(null);
      const response = await axios.get(`${API_URL}/api/seller/transactions`, {
        params: {
          page,
          limit: 10,
          status: status === "all" ? undefined : status,
        },
      });

      if (response.data.success) {
        const newTransactions = response.data.data.transactions;
        if (reset || page === 1) {
          setTransactions(newTransactions);
        } else {
          setTransactions((prev) => [...prev, ...newTransactions]);
        }
        setHasMoreTransactions(response.data.data.pagination.hasNextPage);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchAnalytics(),
      fetchTransactions(1, selectedFilter, true),
    ]);
    setRefreshing(false);
  };

  const loadMoreTransactions = () => {
    if (hasMoreTransactions && !loading) {
      fetchTransactions(currentPage + 1, selectedFilter);
    }
  };

  const handlePeriodChange = async (period) => {
    setSelectedPeriod(period);
    setShowPeriodModal(false);
    setLoading(true);
    await fetchAnalytics(period);
    setLoading(false);
  };

  const handleFilterChange = async (filter) => {
    setSelectedFilter(filter);
    setFilterLoading(true);
    await fetchTransactions(1, filter, true);
    setFilterLoading(false);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAnalytics(), fetchTransactions()]);
      setLoading(false);
    };
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [])
  );

  useEffect(() => {
    if (refreshTransactionData) {
      fetchTransactions(1, selectedFilter, true);
    }
  }, [refreshTransactionData]);

  useEffect(() => {
    if (refreshAnalyticsData) {
      fetchAnalytics();
    }
  }, [refreshAnalyticsData]);

  const formatCurrency = (amount) => {
    return `₱${Number.parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "failed":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const TransactionCard = ({ transaction }) => (
    <View className="p-4 mb-3 bg-white border border-gray-200 rounded-lg shadow-sm">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">
            Order #{transaction.order_number}
          </Text>
          <Text className="text-sm text-gray-600">
            {transaction.customer_first_name} {transaction.customer_last_name}
          </Text>
        </View>
        <View className="items-end">
          <View
            className={`px-3 py-1 rounded-full ${getStatusColor(transaction.payment_status)}`}
          >
            <Text className="text-xs font-medium capitalize">
              {transaction.payment_status}
            </Text>
          </View>
          <Text className="mt-1 text-lg font-bold text-green-600">
            {formatCurrency(transaction.seller_amount)}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between py-2 border-t border-gray-100">
        <View className="flex-row items-center">
          <MaterialCommunityIcons
            name="package-variant"
            size={16}
            color="#6b7280"
          />
          <Text className="ml-1 text-sm text-gray-500">
            {transaction.items_count} item(s)
          </Text>
        </View>
        <View className="flex-row items-center">
          <MaterialCommunityIcons
            name="credit-card-outline"
            size={16}
            color="#6b7280"
          />
          <Text className="ml-1 text-sm text-gray-500 capitalize">
            {transaction.payment_method.replace(/_/g, " ")}
          </Text>
        </View>
        <Text className="text-sm text-gray-500">
          {formatDate(transaction.transaction_date)}
        </Text>
      </View>

      {transaction.description && (
        <Text className="mt-2 text-sm text-gray-600" numberOfLines={2}>
          {transaction.description}
        </Text>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-16 pb-5 bg-white border-b border-gray-200">
        <Text className="text-xl font-semibold">Analytics & Transactions</Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && transactions.length === 0 ? (
          <View className="items-center justify-center p-8">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="mt-2 text-gray-500">Loading analytics...</Text>
          </View>
        ) : error ? (
          <View className="items-center px-5 py-6 mx-4 my-2 bg-white border border-gray-200 rounded-lg shadow-sm">
            <View className="items-center justify-center w-12 h-12 mb-3 rounded-full shadow-sm bg-red-50">
              <Ionicons name="alert-circle" size={24} color="#ef4444" />
            </View>

            <Text className="mb-2 text-lg font-semibold text-center text-gray-800">
              Something went wrong
            </Text>

            <Text className="mb-4 text-sm leading-5 text-center text-gray-500">
              {error ||
                "Unable to load data. Please check your connection and try again."}
            </Text>

            <TouchableOpacity
              onPress={onRefresh}
              className="bg-blue-600 px-5 py-2.5 rounded-lg flex-row items-center"
            >
              <Ionicons
                name="refresh"
                size={16}
                color="#fff"
                style={{ marginRight: 6 }}
              />
              <Text className="text-sm font-semibold text-white">
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Period Selector */}
            <View className="p-4">
              <TouchableOpacity
                className="flex-row items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                onPress={() => setShowPeriodModal(true)}
              >
                <View className="flex-row items-center">
                  <MaterialIcons name="date-range" size={20} color="#6b7280" />
                  <Text className="ml-2 font-medium text-gray-900">
                    {periods.find((p) => p.value === selectedPeriod)?.label}
                  </Text>
                </View>
                <Feather name="chevron-down" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Revenue Overview */}
            <View className="px-4 mb-4">
              <Text className="mb-3 text-lg font-semibold text-gray-900">
                Revenue Overview
              </Text>
              <View className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                {analytics.revenueOverTime.length > 0 ? (
                  <>
                    <View className="flex-row items-center justify-between mb-4">
                      <View className="flex-row items-center">
                        <MaterialIcons
                          name="trending-up"
                          size={24}
                          color="#10b981"
                        />
                        <Text className="ml-2 text-gray-600">
                          Total Revenue
                        </Text>
                      </View>
                      <Text className="text-2xl font-bold text-green-600">
                        {formatCurrency(
                          analytics.revenueOverTime.reduce(
                            (sum, item) => sum + item.revenue,
                            0
                          )
                        )}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <View className="items-center flex-1">
                        <Text className="text-2xl font-bold text-gray-900">
                          {analytics.revenueOverTime.reduce(
                            (sum, item) => sum + item.ordersCount,
                            0
                          )}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          Total Orders
                        </Text>
                      </View>
                      <View className="items-center flex-1">
                        <Text className="text-2xl font-bold text-gray-900">
                          {analytics.revenueOverTime.reduce(
                            (sum, item) => sum + item.itemsSold,
                            0
                          )}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          Items Sold
                        </Text>
                      </View>
                    </View>
                  </>
                ) : (
                  <View className="items-center py-8">
                    <Feather name="bar-chart-2" size={48} color="#d1d5db" />
                    <Text className="mt-2 text-center text-gray-500">
                      No revenue data available
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Payment Methods */}
            {analytics.paymentMethodBreakdown.length > 0 && (
              <View className="px-4 mb-4">
                <Text className="mb-3 text-lg font-semibold text-gray-900">
                  Payment Methods
                </Text>
                <View className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                  {analytics.paymentMethodBreakdown.map((method, index) => (
                    <View
                      key={index}
                      className="flex-row items-center p-3 mb-3 border border-gray-200 rounded-lg last:mb-0"
                    >
                      <View className="items-center justify-center w-10 h-10 mr-3 bg-blue-100 rounded-lg">
                        <MaterialCommunityIcons
                          name="credit-card-outline"
                          size={20}
                          color="#3b82f6"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="font-medium text-gray-900 capitalize">
                          {method.method.replace(/_/g, " ")}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          {method.orderCount} orders
                        </Text>
                      </View>
                      <Text className="text-lg font-bold text-green-600">
                        {formatCurrency(method.totalAmount)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Order Status Breakdown */}
            {analytics.orderStatusBreakdown.length > 0 && (
              <View className="px-4 mb-4">
                <Text className="mb-3 text-lg font-semibold text-gray-900">
                  Order Status
                </Text>
                <View className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                  {analytics.orderStatusBreakdown.map((status, index) => (
                    <View
                      key={index}
                      className="flex-row items-center p-3 mb-3 border border-gray-200 rounded-lg last:mb-0"
                    >
                      <View className="items-center justify-center w-10 h-10 mr-3 bg-orange-100 rounded-lg">
                        <MaterialIcons
                          name="assignment"
                          size={20}
                          color="#ea580c"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="font-medium text-gray-900 capitalize">
                          {status.status.replace("_", " ")}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          {status.orderCount} orders
                        </Text>
                      </View>
                      {status.totalAmount > 0 && (
                        <Text className="text-lg font-bold text-green-600">
                          {formatCurrency(status.totalAmount)}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Transaction History */}
            <View className="px-4 mb-4">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-semibold text-gray-900">
                  Transaction History
                </Text>
                <View className="flex-row items-center">
                  <MaterialCommunityIcons
                    name="history"
                    size={20}
                    color="#6b7280"
                  />
                  <Text className="ml-1 text-sm text-gray-600">
                    {transactions.length} transactions
                  </Text>
                </View>
              </View>

              {/* Status Filter */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4"
              >
                <View className="flex-row gap-2">
                  {statusFilters.map((filter) => (
                    <TouchableOpacity
                      key={filter.value}
                      className={`px-4 py-2 rounded-full border ${
                        selectedFilter === filter.value
                          ? "bg-blue-600 border-blue-600"
                          : "bg-white border-gray-200"
                      }`}
                      onPress={() => handleFilterChange(filter.value)}
                    >
                      <Text
                        className={`text-sm font-medium ${selectedFilter === filter.value ? "text-white" : "text-gray-600"}`}
                      >
                        {filter.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {filterLoading ? (
                <View className="items-center justify-center p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <ActivityIndicator size="small" color="#f59e0b" />
                  <Text className="mt-2 text-sm text-gray-500">
                    Filtering transactions...
                  </Text>
                </View>
              ) : transactions.length > 0 ? (
                <>
                  {transactions.map((transaction) => (
                    <TransactionCard
                      key={`${transaction.order_id}-${transaction.transaction_date}`}
                      transaction={transaction}
                    />
                  ))}

                  {hasMoreTransactions && (
                    <TouchableOpacity
                      className="flex-row items-center justify-center p-4 mt-2 bg-white border border-gray-200 rounded-lg shadow-sm"
                      onPress={loadMoreTransactions}
                    >
                      <Feather name="chevron-down" size={16} color="#3b82f6" />
                      <Text className="ml-2 font-medium text-blue-600">
                        Load More Transactions
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <View className="items-center justify-center p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <Feather name="file-text" size={48} color="#d1d5db" />
                  <Text className="mt-4 text-lg font-medium text-gray-600">
                    No Transactions Found
                  </Text>
                  <Text className="mt-1 text-center text-gray-500">
                    {selectedFilter === "all"
                      ? "You haven't received any orders yet."
                      : `No ${selectedFilter} transactions found.`}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      <Modal
        visible={showPeriodModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPeriodModal(false)}
      >
        <View
          className="justify-end flex-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <View className="bg-white rounded-t-lg">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-900">
                Select Period
              </Text>
              <TouchableOpacity onPress={() => setShowPeriodModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {periods.map((period) => (
              <TouchableOpacity
                key={period.value}
                className="flex-row items-center justify-between p-4 border-b border-gray-100"
                onPress={() => handlePeriodChange(period.value)}
              >
                <View className="flex-row items-center">
                  <MaterialIcons name="date-range" size={20} color="#6b7280" />
                  <Text className="ml-3 text-gray-900">{period.label}</Text>
                </View>
                {selectedPeriod === period.value && (
                  <Ionicons name="checkmark" size={20} color="#2563eb" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SellerAnalyticsScreen;
