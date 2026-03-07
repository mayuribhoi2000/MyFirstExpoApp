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

const extraBanner = require("../../assets/images/banner22.png");

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
];

/* ================= TRENDING BOOKS ================= */

const trendingBooks = [
  {
    id: 1,
    image: require("../../assets/images/ICSE.png"),
    title: "Concise Physics ICSE",
    price: "₹ 370",
  },
  {
    id: 2,
    image: require("../../assets/images/ISC BOOK.png"),
    title: "Indian Economic Development",
    price: "₹ 450",
  },
  {
    id: 3,
    image: require("../../assets/images/Static(1).png"),
    title: "Statistics for Economics",
    price: "₹ 380",
  },
  {
    id: 4,
    image: require("../../assets/images/Living Science.png"),
    title: "Living Science Class 6",
    price: "₹ 320",
  },
  {
    id: 5,
    image: require("../../assets/images/STORY BOOK.png"),
    title: "VK Chemistry Class 10",
    price: "₹ 410",
  },
];

export default function HomeScreen() {

  const [showMenu, setShowMenu] = useState(false);
  const [showExtraBanner, setShowExtraBanner] = useState(false);
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

      {/* ================= BANNER ================= */}

      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {banners.map((img, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.9}
            onPress={() => setShowExtraBanner(true)}
            style={{ width, height: 200 }}
          >
            <Image source={img} style={styles.banner} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {showExtraBanner && (
        <TouchableOpacity
          style={styles.extraBannerContainer}
          onPress={() => setShowExtraBanner(false)}
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
          <TouchableOpacity key={book.id} style={styles.rectangularProductCard}>
            <Image source={book.image} style={styles.rectangularProductImage} />

            <View style={styles.rectangularProductContent}>

              <Text numberOfLines={1} style={styles.rectangularProductTitle}>
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

      {/* ================= TRENDING BOOKS ================= */}

      <Text style={styles.sectionTitle}>Trending Books</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {trendingBooks.map((book) => (
          <TouchableOpacity key={book.id} style={styles.rectangularProductCard}>

            <Image source={book.image} style={styles.rectangularProductImage} />

            <View style={styles.rectangularProductContent}>

              <Text numberOfLines={1} style={styles.rectangularProductTitle}>
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

      <View style={{ height: 40 }} />

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

  banner: { width: width, height: 200, resizeMode: "cover" },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    margin: 10,
  },

  extraBannerContainer: {
    marginHorizontal: 10,
    marginVertical: 10,
    borderRadius: 12,
    overflow: "hidden",
  },

  extraBanner: {
    width: "100%",
    height: 140,
    resizeMode: "cover",
  },

  rectangularCategoryCard: {
    width: 160,
    height: 120,
    marginHorizontal: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 4,
    overflow: "hidden",
  },

  rectangularCategoryImage: {
    width: "100%",
    height: "65%",
    resizeMode: "cover",
  },

  rectangularCategoryLabel: {
    padding: 8,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },

  rectangularProductCard: {
    width: 220,
    height: 280,
    marginHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 6,
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

  addText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
  },

});