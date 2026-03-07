import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function AddToCart() {
  const router = useRouter();
  
  // ✅ FIXED: Type-safe params handling
  const params = useLocalSearchParams<{
    title?: string;
    price?: string;
    image?: string;
  }>();
  
  const title = Array.isArray(params.title) ? params.title[0] : params.title || "Product Name";
  const price = Array.isArray(params.price) ? params.price[0] : params.price || "0";
  const image = Array.isArray(params.image) ? params.image[0] : params.image;
  
  const [quantity, setQuantity] = useState("1");
  const [subtotal, setSubtotal] = useState(0);
  const [deliveryCharge] = useState(49);

  useEffect(() => {
    const qty = parseInt(quantity) || 1;
    setSubtotal((parseFloat(price) || 0) * qty);
  }, [quantity, price]);

  const handlePlaceOrder = () => {
    console.log("/order-success");
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Product</Text>
        <TouchableOpacity style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Product Details Row */}
      <View style={styles.productRow}>
        <Image
          source={
            image 
              ? { uri: image } 
              : require("../../assets/images/Medical.png")
          }
          style={styles.productImage}
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.productPrice}>₹{price}</Text>
        </View>
      </View>

      {/* Cart Table Headers */}
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderText}>Price</Text>
        <Text style={styles.tableHeaderText}>Quantity</Text>
        <Text style={styles.tableHeaderText}>Stock</Text>
        <Text style={styles.tableHeaderText}>Subtotal</Text>
        <TouchableOpacity>
          {/* ✅ FIXED: Added removeText style */}
          <Text style={[styles.tableHeaderText, styles.removeText]}>Remove</Text>
        </TouchableOpacity>
      </View>

      {/* Cart Table Row */}
      <View style={styles.tableRow}>
        <Text style={styles.tableCell}>₹{price}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.qtyBtn}
            onPress={() => setQuantity((parseInt(quantity) || 1 - 1).toString())}
          >
            <Text style={styles.qtyBtnText}>-</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.quantityInput}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />
          <TouchableOpacity 
            style={styles.qtyBtn}
            onPress={() => setQuantity((parseInt(quantity) || 1 + 1).toString())}
          >
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.tableCell}>In Stock</Text>
        <Text style={styles.tableCell}>₹{subtotal.toFixed(2)}</Text>
        <TouchableOpacity>
          <Text style={styles.removeIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>

      {/* Price Summary */}
      <View style={styles.priceSummary}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Subtotal</Text>
          <Text style={styles.priceValue}>₹{subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Delivery Charges</Text>
          <Text style={styles.priceValue}>₹{deliveryCharge}</Text>
        </View>
        <View style={[styles.priceRow, styles.totalRow]}>
          <Text style={[styles.priceLabel, styles.totalLabel]}>Total</Text>
          <Text style={[styles.priceValue, styles.totalValue]}>
            ₹{(subtotal + deliveryCharge).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Savings */}
      <View style={styles.savingsContainer}>
        <Text style={styles.savingsText}>
          You will save ₹{((parseFloat(price) || 0) * 0.1).toFixed(2)} on this order
        </Text>
      </View>

      {/* Place Order Button */}
      <TouchableOpacity style={styles.placeOrderBtn} onPress={handlePlaceOrder}>
        <Text style={styles.placeOrderText}>
          PLACE ORDER (₹{(subtotal + deliveryCharge).toFixed(2)})
        </Text>
      </TouchableOpacity>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeBtn: {
    padding: 8,
  },
  closeText: {
    fontSize: 20,
    color: "#666",
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 16,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e74c3c",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f3f4",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#555",
    textAlign: "center",
  },
  // ✅ FIXED: Added missing removeText style
  removeText: {
    color: "#e74c3c",
    fontSize: 11,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    borderRadius: 6,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  quantityContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  quantityInput: {
    width: 50,
    height: 32,
    borderWidth: 1,
    borderColor: "#ddd",
    textAlign: "center",
    fontSize: 14,
    marginHorizontal: 8,
  },
  removeIcon: {
    fontSize: 18,
    color: "#e74c3c",
  },
  priceSummary: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 12,
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e74c3c",
  },
  savingsContainer: {
    backgroundColor: "#d4edda",
    padding: 12,
    borderRadius: 6,
    marginBottom: 20,
    alignItems: "center",
  },
  savingsText: {
    fontSize: 14,
    color: "#155724",
    fontWeight: "500",
  },
  placeOrderBtn: {
    backgroundColor: "#007bff",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  placeOrderText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSpace: {
    height: 100,
  },
});