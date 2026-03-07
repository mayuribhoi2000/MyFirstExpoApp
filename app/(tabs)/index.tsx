import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

/* ================= DATA ================= */

const banners = [
  require("../../assets/images/banner.png"),
  require("../../assets/images/banner22.png"),
];

const extraBanner = require("../../assets/images/banner22.png"); // your 3rd banner image

const categories = [
  { id: 1, title: "ICSE BOOKS", image: require("../../assets/images/ICSE.png"), route: "/Pegi" },
  { id: 2, title: "ISC BOOKS", image: require("../../assets/images/ISC BOOK.png"), route: "/C6" },
  { id: 3, title: "STORY BOOKS", image: require("../../assets/images/STORY BOOK.png"), route: "/C6" },
  { id: 4, title: "MEDICAL", image: require("../../assets/images/Medical.png"), route: "/C6" },
  { id: 5, title: "STATIC", image: require("../../assets/images/Static(1).png"), route: "/C6" },
  { id: 6, title: "LIVING SCIENCE", image: require("../../assets/images/Living Science.png"), route: "/C6" },
  { id: 7, title: "MOBILE", image: require("../../assets/images/mobile.png"), route: "/C6" },
];

const readersChoiceBooks = [
  {
    id: 1,
    image: require("../../assets/images/STORY BOOK.png"),
    title: "Concise Physics ICSE",
    price: "₹ 370",
  },
  {
    id: 2,
    image: require("../../assets/images/ICSE.png"),
    title: "Concise Chemistry",
    price: "₹ 420",
  },
  {
    id: 3,
    image: require("../../assets/images/ISC BOOK.png"),
    title: "ISC Mathematics Vol 1",
    price: "₹ 580",
  },
  {
    id: 4,
    image: require("../../assets/images/Medical.png"),
    title: "Anatomy for MBBS",
    price: "₹ 1250",
  },
  {
    id: 5,
    image: require("../../assets/images/STORY BOOK.png"),
    title: "The Little Prince",
    price: "₹ 250",
  },
  {
    id: 6,
    image: require("../../assets/images/Static(1).png"),
    title: "STATSTICS FOR ECONOMOCS",
    price: "₹ 380",
  },
  {
    id: 7,
    image: require("../../assets/images/Living Science.png"),
    title: "LIVING SCIENCE",
    price: "₹ 380",
  },
];

export default function HomeScreen() {
  const [showMenu, setShowMenu] = useState(false);
  const [showExtraBanner, setShowExtraBanner] = useState(false); // controls extra banner
  const slideAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  const toggleMenu = () => {
    Animated.timing(slideAnim, {
      toValue: showMenu ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start();

    setShowMenu(!showMenu);
  };

  const menuHeight = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 180],
  });

  const handleCategoryPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/logo2.png")}
          style={styles.logo}
        />

        <View style={styles.searchBox}>
          <TextInput
            placeholder="Search for Products, Brands and More"
            style={styles.searchInput}
          />
          <Ionicons name="search" size={20} color="#666" />
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => router.push("../C2")}>
            <Ionicons name="heart-outline" size={22} color="#444" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("../Add to cart")}>
            <Ionicons name="cart-outline" size={22} color="#444" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("../C3")}>
            <Ionicons name="log-in-outline" size={24} color="#444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= MENU ROW ================= */}
      <View style={styles.menuRow}>
        <TouchableOpacity style={styles.categoryBtn} onPress={toggleMenu}>
          <Ionicons name="grid-outline" size={16} color="#fff" />
          <Text style={styles.categoryText}> Browse All Categories</Text>
        </TouchableOpacity>

        <View style={styles.menuContainer}>
          {["Home", "About", "Products", "Contact Us"].map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => {
                if (item === "Contact Us") {
                  router.push("../C7");
                } else if (item === "Home") {
                  router.push("/");
                } else if (item === "About") {
                  router.push("../C9");
                } else if (item === "Products") {
                  router.push("../C6");
                }
              }}
            >
              <Text style={styles.menuItem}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* ================= DROPDOWN MENU ================= */}
      <Animated.View
        style={[styles.dropdownMenu, { height: menuHeight, opacity: slideAnim }]}
      >
        <TouchableOpacity style={styles.dropdownItem}>
          <Ionicons name="tv-outline" size={18} color="#333" />
          <Text style={styles.dropdownText}>Electronics</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dropdownItem}>
          <Ionicons name="barbell-outline" size={18} color="#333" />
          <Text style={styles.dropdownText}>Sports & Fitness</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dropdownItem}>
          <Ionicons name="book-outline" size={18} color="#333" />
          <Text style={styles.dropdownText}>Stationery Materials</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dropdownItem}>
          <Ionicons name="library-outline" size={18} color="#333" />
          <Text style={styles.dropdownText}>Books</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* ================= BANNER SLIDER ================= */}
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {banners.map((img, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.9}
            onPress={() => setShowExtraBanner(true)} // tap on any slide shows extra banner
            style={{ width, height: 200 }}
          >
            <Image source={img} style={styles.banner} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ================= EXTRA BANNER (shown on click) ================= */}
      {showExtraBanner && (
        <TouchableOpacity
          style={styles.extraBannerContainer}
          onPress={() => setShowExtraBanner(false)} // optional: tap to hide
        >
          <Image source={extraBanner} style={styles.extraBanner} />
        </TouchableOpacity>
      )}

      {/* ================= BOOK CATEGORIES ================= */}
      <Text style={styles.sectionTitle}>Book Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.rectangularCategoryCard}
            onPress={() => handleCategoryPress(item.route)}
            activeOpacity={0.9}
          >
            <Image
              source={item.image}
              style={styles.rectangularCategoryImage}
            />
            <Text style={styles.rectangularCategoryLabel}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ================= READERS CHOICE ================= */}
      <Text style={styles.sectionTitle}>Readers' Choice</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {readersChoiceBooks.map((book) => (
          <TouchableOpacity
            key={book.id}
            style={styles.rectangularProductCard}
            activeOpacity={0.9}
          >
            <Image source={book.image} style={styles.rectangularProductImage} />
            <View style={styles.rectangularProductContent}>
              <Text
                numberOfLines={1}
                style={styles.rectangularProductTitle}
              >
                {book.title}
              </Text>
              <Text style={styles.rectangularPrice}>{book.price}</Text>
              <TouchableOpacity style={styles.addBtn}>
                <Feather name="shopping-cart" size={14} color="#fff" />
                <Text style={styles.addText}> Add</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    elevation: 4,
    backgroundColor: "#fff",
  },
  logo: { width: 50, height: 50, resizeMode: "contain" },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    height: 40,
  },
  searchInput: { flex: 1, fontSize: 14 },
  headerIcons: { flexDirection: "row", gap: 12 },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  categoryBtn: {
    flexDirection: "row",
    backgroundColor: "#e53935",
    padding: 8,
    borderRadius: 6,
  },
  categoryText: { color: "#fff", fontSize: 12, marginLeft: 6 },
  menuContainer: { flexDirection: "row", marginLeft: 12, gap: 14 },
  menuItem: { fontSize: 14, color: "#333", fontWeight: "500" },
  dropdownMenu: {
    backgroundColor: "#fff",
    marginHorizontal: 10,
    borderRadius: 8,
    elevation: 6,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  dropdownText: { marginLeft: 10, fontSize: 14 },
  banner: { width: width, height: 200, resizeMode: "cover" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", margin: 10 },

  /* ================= EXTRA BANNER ================= */
  extraBannerContainer: {
    marginHorizontal: 10,
    marginVertical: 10,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
  },
  extraBanner: {
    width: "100%",
    height: 140,
    resizeMode: "cover",
  },

  /* ================= RECTANGULAR CATEGORY CARDS ================= */
  rectangularCategoryCard: {
    width: 160,
    height: 120,
    marginHorizontal: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  rectangularCategoryImage: {
    width: "100%",
    height: "65%",
    resizeMode: "cover",
  },
  rectangularCategoryLabel: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
  },

  /* ================= RECTANGULAR PRODUCT CARDS ================= */
  rectangularProductCard: {
    width: 220,
    height: 280,
    marginHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: "hidden",
  },
  rectangularProductImage: {
    width: "100%",
    height: "60%",
    resizeMode: "cover",
  },
  rectangularProductContent: {
    padding: 14,
    flex: 1,
    justifyContent: "space-between",
  },
  rectangularProductTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  rectangularPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#dc2626",
  },
  addBtn: {
    flexDirection: "row",
    backgroundColor: "#e53935",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addText: { color: "#fff", fontSize: 13, fontWeight: "600", marginLeft: 4 },
});
