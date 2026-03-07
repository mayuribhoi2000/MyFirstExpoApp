import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const products = [
  {
    id: 1,
    title: "I.C.S.E. TREASURE CHEST FOR CLASS 9 & 10",
    image: require("../../assets/images/ICSE.png"),
    price: "₹300",
    rating: "4.2",
  },
  {
    id: 2,
    title: "I.C.S.E TREASURE CHEST COLLECTION",
    image: require("../../assets/images/STORY BOOK.png"),
    price: "₹300",
    rating: "4.2",
  },
  {
    id: 3,
    title: "I.S.C PRISM COLLECTION OF STORIES",
    image: require("../../assets/images/ISC BOOK.png"),
    price: "₹300",
    rating: "4.2",
  },
  {
    id: 4,
    title: "I.S.C RHAPSODY COLLECTION OF POEMS",
    image: require("../../assets/images/Living Science.png"),
    price: "₹300",
    rating: "4.2",
  },
];

export default function ProductPage() {
  return (
    <ScrollView style={styles.container}>

      {/* Header Path */}
      <Text style={styles.breadcrumb}>Home / Product List</Text>

      <View style={styles.mainRow}>

        {/* LEFT FILTER PANEL */}

        <View style={styles.filterPanel}>

          <Text style={styles.filterTitle}>Filters</Text>

          <Text style={styles.filterHeading}>CATEGORIES</Text>

          <Text style={styles.filterHeading}>PRICE</Text>
          <Text style={styles.filterText}>₹ 300 - ₹ 3700</Text>

          <Text style={styles.filterHeading}>DISCOUNT</Text>

          <Text style={styles.filterHeading}>CUSTOMER RATINGS</Text>

          <Text style={styles.filterHeading}>BRAND</Text>

          <Text style={styles.filterHeading}>IDEAL FOR</Text>

        </View>

        {/* RIGHT PRODUCT LIST */}

        <View style={styles.productSection}>

          <TouchableOpacity style={styles.sortBtn}>
            <Text style={{ color: "#fff" }}>Popularity</Text>
          </TouchableOpacity>

          <View style={styles.grid}>

            {products.map((item) => (
              <View key={item.id} style={styles.card}>

                <Image source={item.image} style={styles.productImage} />

                <Text numberOfLines={2} style={styles.title}>
                  {item.title}
                </Text>

                <View style={styles.ratingBox}>
                  <Text style={styles.ratingText}>{item.rating} ★</Text>
                </View>

                <View style={styles.priceRow}>
                  <Text style={styles.price}>{item.price}</Text>
                  <Text style={styles.oldPrice}>₹300</Text>
                  <Text style={styles.discount}>0% off</Text>
                </View>

              </View>
            ))}

          </View>

        </View>

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
  },

  breadcrumb: {
    fontSize: 14,
    marginBottom: 10,
    color: "#666",
  },

  mainRow: {
    flexDirection: "row",
  },

  filterPanel: {
    width: 180,
    padding: 10,
    borderRightWidth: 1,
    borderColor: "#eee",
  },

  filterTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },

  filterHeading: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 15,
  },

  filterText: {
    fontSize: 13,
    marginTop: 5,
  },

  productSection: {
    flex: 1,
    paddingLeft: 15,
  },

  sortBtn: {
    backgroundColor: "#2f6e8e",
    padding: 10,
    width: 110,
    borderRadius: 6,
    marginBottom: 15,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
  },

  card: {
    width: 200,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    elevation: 3,
  },

  productImage: {
    width: "100%",
    height: 160,
    resizeMode: "contain",
  },

  title: {
    fontSize: 13,
    marginTop: 10,
  },

  ratingBox: {
    backgroundColor: "green",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },

  ratingText: {
    color: "#fff",
    fontSize: 12,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },

  price: {
    fontSize: 16,
    fontWeight: "bold",
  },

  oldPrice: {
    textDecorationLine: "line-through",
    color: "#999",
  },

  discount: {
    color: "#2f6e8e",
  },

});