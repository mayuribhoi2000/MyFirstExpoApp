import { useRouter } from "expo-router";
import React from "react";
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

const products = [
  {
    id: 1,
    title: "CONCISE CHEMISTRY I.C.S.E. FOR CLASS - 9",
    subtitle: "CONCISE CHEMISTRY I.C.S.E. FOR CLASS - 9, [MARCH 2026 EXAMINATION] BY DR. S. P. SINGH",
    image: require("../../assets/images/Chemistry.png"),
    route: "C5",
    rating: 4.2,
    price: "₹ 340",
    mrp: "₹ 340",
    off: "0% off",
  },
  {
    id: 2,
    title: "CONCISE PHYSICS I.C.S.E. FOR CLASS - 9",
    subtitle: "CONCISE PHYSICS I.C.S.E. FOR CLASS - 9, [PART - 1] BY R. P. GOYAL & S. P. TRIPATHI",
    image: require("../../assets/images/Physics.png"),
    route: "C8",
    rating: 4.2,
    price: "₹ 370",
    mrp: "₹ 370",
    off: "0% off",
  },
  {
    id: 3,
    title: "STATISTICS FOR ECONOMICS FOR CLASS - 11",
    subtitle: "STATSTICS FOR ECONOMOCS FOR CLASS - 11 BY BY SANDEEP GARG",
    image: require("../../assets/images/Static(1).png"),
    route: "C9", // Fixed: Assuming app/C9.tsx route
    rating: 4.2,
    price: "₹ 423",
    mrp: "₹ 423",
    off: "0% off",
  },
  {
    id: 4,
    title: "VK INDIAN ECONOMIC DEVELOPMENT FOR CLASS - 12",
    subtitle: "VK INDIAN ECONOMIC DEVELOPMENT FOR CLASS - 12, [CBSE SYLLABUS] BY T. R. JAIN & V. K. OHRI",
    image: require("../../assets/images/eco.png"),
    route: "Regi", // Fixed: Assuming app/C10.tsx route
    rating: 4.2,
    price: "₹ 423",
    mrp: "₹ 423",
    off: "0% off",
  },
];

export default function ProductList() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>← Back to Home</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ICSE Books Products</Text>
        </View>

        {/* Products List */}
        {products.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => router.push("../Regi")}
            activeOpacity={0.9}
          >
            <Image source={item.image} style={styles.image} />
            <View style={styles.content}>
              <Text style={styles.title} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {item.subtitle}
              </Text>
              <View style={styles.row}>
                <View style={styles.ratingBox}>
                  <Text style={styles.ratingText}>{item.rating} ⭐</Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{item.price}</Text>
                  <Text style={styles.mrp}>{item.mrp}</Text>
                  <Text style={styles.off}>{item.off}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e40af",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginVertical: 12,
    borderRadius: 15,
    padding: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    height: 220,
    resizeMode: "contain",
    borderRadius: 10,
    marginBottom: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1b1b1b",
    lineHeight: 22,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingBox: {
    backgroundColor: "#27ae60",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline", // Improved alignment
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#dc2626",
    marginRight: 8,
  },
  mrp: {
    fontSize: 15,
    color: "#9ca3af",
    textDecorationLine: "line-through",
  },
  off: {
    fontSize: 14,
    color: "#059669",
    fontWeight: "600",
    marginLeft: 8,
  },
});