import { View, Text, TouchableOpacity, ScrollView } from "react-native"
import { useState } from "react"
import Ionicons from "@expo/vector-icons/Ionicons"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import Feather from "@expo/vector-icons/Feather"
import FontAwesome6 from "@expo/vector-icons/FontAwesome6"
import AntDesign from "@expo/vector-icons/AntDesign"

const PartnershipOptionsScreen = ({ navigation }) => {
  const [selectedOption, setSelectedOption] = useState(null)

  const partnershipOptions = [
    {
      id: 1,
      title: "Become a Seller",
      subtitle: "Start selling your products",
      description:
        "Join thousands of sellers and start your online business with Palenque Mart. Sell your products to millions of customers.",
      icon: "store",
      benefits: [
        "Zero listing fees for first 100 products",
        "24/7 seller support",
        "Marketing tools and analytics",
        "Secure payment processing",
        "Nationwide shipping network",
      ],
      requirements: [
        "Valid business registration",
        "Tax identification number",
        "Bank account for payments",
        "Product catalog ready",
      ],
      color: "bg-blue-500",
    },
    {
      id: 2,
      title: "Delivery Partner",
      subtitle: "Earn by delivering orders",
      description:
        "Become a delivery partner and earn flexible income by delivering orders in your area. Work on your own schedule.",
      icon: "truck",
      benefits: [
        "Flexible working hours",
        "Competitive delivery rates",
        "Weekly payments",
        "Fuel allowance",
        "Insurance coverage",
      ],
      requirements: [
        "Valid driver's license",
        "Own motorcycle/vehicle",
        "Smartphone with GPS",
        "Clean background check",
      ],
      color: "bg-green-500",
    },
  ]

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case "store":
        return <FontAwesome6 name="store" size={40} color="white" />
      case "truck":
        return <Feather name="truck" size={40} color="white" />
      default:
        return <MaterialIcons name="business" size={40} color="white" />
    }
  }

  const handleApplyNow = (option) => {
    // Temporary functionality - would navigate to application form
    console.log(`Applying for: ${option.title}`)
    // navigation.navigate('PartnershipApplication', { partnershipType: option.id })
  }

  const handleLearnMore = (option) => {
    setSelectedOption(selectedOption === option.id ? null : option.id)
  }

  return (
    <>
      {/* Header */}
      <View className="flex flex-row items-center justify-between px-4 pt-16 pb-5 bg-white border-b border-gray-300">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold">Partnership Options</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 bg-gray-50">
        {/* Partnership Options */}
        <View className="p-4">
          {partnershipOptions.map((option) => (
            <View key={option.id} className="mb-4 bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Main Card */}
              <View className="p-6">
                <View className="flex flex-row items-center mb-4">
                  <View className={`w-16 h-16 ${option.color} rounded-lg flex items-center justify-center mr-4`}>
                    {getIconComponent(option.icon)}
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-semibold">{option.title}</Text>
                    <Text className="text-sm text-gray-600">{option.subtitle}</Text>
                  </View>
                </View>

                <Text className="text-base text-gray-700 mb-4">{option.description}</Text>

                {/* Action Buttons */}
                <View className="flex flex-row gap-3">
                  <TouchableOpacity className="flex-1 py-3 bg-black rounded-lg" onPress={() => handleApplyNow(option)}>
                    <Text className="text-white text-center font-semibold">Apply Now</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 py-3 border border-gray-300 rounded-lg"
                    onPress={() => handleLearnMore(option)}
                  >
                    <Text className="text-black text-center font-semibold">
                      {selectedOption === option.id ? "Hide Details" : "Learn More"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Expandable Details */}
              {selectedOption === option.id && (
                <View className="px-6 pb-6 border-t border-gray-100">
                  <View className="mt-4">
                    <Text className="text-lg font-semibold mb-3">Benefits</Text>
                    {option.benefits.map((benefit, index) => (
                      <View key={index} className="flex flex-row items-center mb-2">
                        <AntDesign name="checkcircle" size={16} color="#10b981" />
                        <Text className="ml-3 text-gray-700">{benefit}</Text>
                      </View>
                    ))}
                  </View>

                  <View className="mt-4">
                    <Text className="text-lg font-semibold mb-3">Requirements</Text>
                    {option.requirements.map((requirement, index) => (
                      <View key={index} className="flex flex-row items-center mb-2">
                        <Feather name="circle" size={16} color="#6b7280" />
                        <Text className="ml-3 text-gray-700">{requirement}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* FAQ Section */}
        <View className="p-6 mt-4 bg-white border-t border-gray-200">
          <Text className="text-xl font-semibold mb-4">Frequently Asked Questions</Text>

          <View className="mb-4">
            <Text className="font-semibold mb-2">How long does the application process take?</Text>
            <Text className="text-gray-600">
              Most applications are reviewed within 3-5 business days. You'll receive an email notification once your
              application is processed.
            </Text>
          </View>

          <View className="mb-4">
            <Text className="font-semibold mb-2">Is there any fee to join as a partner?</Text>
            <Text className="text-gray-600">
              No, joining our partnership program is completely free. We believe in growing together with our partners.
            </Text>
          </View>

          <View className="mb-4">
            <Text className="font-semibold mb-2">Can I apply for multiple partnership types?</Text>
            <Text className="text-gray-600">
              Yes, you can apply for multiple partnership types, but each application will be reviewed separately.
            </Text>
          </View>
        </View>

        {/* Contact Support */}
        <View className="p-6 bg-gray-100 border-t border-gray-200">
          <Text className="text-lg font-semibold mb-3 text-center">Need Help?</Text>
          <Text className="text-gray-600 text-center mb-4">
            Have questions about our partnership programs? Our team is here to help.
          </Text>

          <View className="flex flex-row gap-3">
            <TouchableOpacity className="flex-1 py-3 border border-gray-400 rounded-lg">
              <View className="flex flex-row items-center justify-center">
                <Feather name="phone" size={16} color="black" />
                <Text className="ml-2 text-black font-semibold">Call Us</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1 py-3 border border-gray-400 rounded-lg">
              <View className="flex flex-row items-center justify-center">
                <Feather name="mail" size={16} color="black" />
                <Text className="ml-2 text-black font-semibold">Email Us</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </>
  )
}

export default PartnershipOptionsScreen
