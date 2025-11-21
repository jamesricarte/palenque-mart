import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const FilterModal = ({
  showFilters,
  setShowFilters,
  filters,
  setFilters,
  handleFilterApply,
}) => {
  return (
    <Modal
      visible={showFilters}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFilters(false)}
    >
      <View
        className="justify-end flex-1"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <View className="p-6 bg-white rounded-t-3xl">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold">Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Category Filter */}
            <View className="mb-6">
              <Text className="mb-3 text-lg font-semibold">Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[
                  "All",
                  "Meat",
                  "Seafood",
                  "Poultry",
                  "Vegetables",
                  "Fruits",
                  "Grains",
                ].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    className={`px-4 py-2 mr-2 rounded-full border ${
                      filters.category === cat
                        ? "bg-primary border-primary"
                        : "bg-white border-gray-300"
                    }`}
                    onPress={() => setFilters({ ...filters, category: cat })}
                  >
                    <Text
                      className={`font-medium ${filters.category === cat ? "text-white" : "text-gray-700"}`}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Price Range Filter */}
            <View className="mb-6">
              <Text className="mb-3 text-lg font-semibold">Price Range</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[
                  { label: "All", value: "All" },
                  { label: "Under ₱50", value: "under50" },
                  { label: "₱50-₱100", value: "50to100" },
                  { label: "₱100-₱200", value: "100to200" },
                  { label: "Over ₱200", value: "over200" },
                ].map((price) => (
                  <TouchableOpacity
                    key={price.value}
                    className={`px-4 py-2 mr-2 rounded-lg border ${
                      filters.priceRange === price.value
                        ? "bg-primary border-primary"
                        : "bg-white border-gray-300"
                    }`}
                    onPress={() =>
                      setFilters({ ...filters, priceRange: price.value })
                    }
                  >
                    <Text
                      className={`font-medium ${filters.priceRange === price.value ? "text-white" : "text-gray-700"}`}
                    >
                      {price.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Rating Filter */}
            <View className="mb-6">
              <Text className="mb-3 text-lg font-semibold">Rating</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[
                  { label: "All", value: "All" },
                  { label: "4+ Stars", value: "4plus" },
                  { label: "3+ Stars", value: "3plus" },
                ].map((rating) => (
                  <TouchableOpacity
                    key={rating.value}
                    className={`px-3 py-2 mr-2 rounded-lg border ${
                      filters.rating === rating.value
                        ? "bg-primary border-primary"
                        : "bg-white border-gray-300"
                    }`}
                    onPress={() =>
                      setFilters({ ...filters, rating: rating.value })
                    }
                  >
                    <Text
                      className={`font-medium ${filters.rating === rating.value ? "text-white" : "text-gray-700"}`}
                    >
                      {rating.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </ScrollView>

          <TouchableOpacity
            className="py-4 mt-4 rounded-lg bg-primary"
            onPress={() => handleFilterApply(filters)}
          >
            <Text className="text-lg font-semibold text-center text-white">
              Apply Filters
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default FilterModal;
