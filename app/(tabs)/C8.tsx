import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import React, { useRef, useState } from "react";
import {
    Alert,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

const product = {
  id: 1,
  title: "CONCISE PHYSICS I.C.S.E. FOR CLASS - 9",
  author: "Author: R. P. GOYAL & S. P. TRIPATHI",
  publisher: "S Chand Publishing Pvt Ltd",
  price: "₹ 340",
  originalPrice: "₹ 420",
  images: [
    require("../../assets/images/Physics.png"), // Main cover
    require("../../assets/images/Physics2.png"), // Thumb 2
    require("../../assets/images/Physics3.png"),  // Thumb 3
    require("../../assets/images/Physics.png"), // Thumb 4
    require("../../assets/images/Physics2.png"),  // Thumb 5
    require("../../assets/images/Physics3.png"), // Thumb 6
  ],
  video: require("../../assets/video/HNYvideo.mp4"),
  hasVideo: true,
  availability: "In Stock",
};

export default function ProductDetailScreen() {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const videoRef = useRef<Video>(null);

  const tabs = [
    { id: "description", label: "Description" },
    { id: "specifications", label: "Specifications" },
    { id: "reviews", label: "Reviews" },
  ];

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* IMAGE GALLERY SECTION */}
        <View style={styles.galleryContainer}>
          <TouchableOpacity
            style={styles.mainImageWrapper}
            onPress={() => setShowImageModal(true)}
            activeOpacity={0.9}
          >
            <Image
              source={product.images[currentImageIndex]}
              style={styles.mainProductImage}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <View style={styles.thumbnailContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailList}
            >
              {product.images.map((img, index) => (
                <TouchableOpacity
                  key={`thumb-${index}`}
                  onPress={() => setCurrentImageIndex(index)}
                  style={[
                    styles.thumbnailWrapper,
                    currentImageIndex === index && styles.activeThumbnail,
                  ]}
                >
                  <Image source={img} style={styles.thumbnailImage} />
                </TouchableOpacity>
              ))}

              {product.hasVideo && (
                <TouchableOpacity
                  style={styles.thumbnailWrapper}
                  onPress={() => setShowVideoModal(true)}
                >
                  <View style={styles.videoThumbnailPlaceholder}>
                    <Ionicons name="play-circle" size={24} color="#1e40af" />
                  </View>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>

          <TouchableOpacity style={styles.readSampleBtn}>
            <Text style={styles.readSampleText}>Read sample</Text>
          </TouchableOpacity>
        </View>

        {/* INFO SECTION */}
        <View style={styles.detailsCard}>
          <Text style={styles.productTitle}>{product.title}</Text>
          <Text style={styles.author}>By {product.author}</Text>

          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>{product.price}</Text>
            <Text style={styles.originalPrice}>{product.originalPrice}</Text>
            <Text style={styles.discount}>-20% OFF</Text>
          </View>

          <View style={styles.divider} />

          {/* DELIVERY SECTION */}
          <View style={styles.deliverySection}>
            <Text style={styles.deliveryTitle}>Delivery Details</Text>
            <View style={styles.deliveryRow}>
              <Ionicons name="location-outline" size={20} color="#1e40af" />
              <TextInput
                style={styles.pincodeInput}
                placeholder="Enter Pincode"
                keyboardType="numeric"
                maxLength={6}
              />
              <TouchableOpacity style={styles.checkBtn}>
                <Text style={styles.checkBtnText}>Check</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.addToCartBtn}
            onPress={() => Alert.alert("Added to Cart")}
          >
            <Text style={styles.addToCartText}>ADD TO CART</Text>
          </TouchableOpacity>
        </View>

        {/* TABS */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabBtn, activeTab === tab.id && styles.activeTabBtn]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text
                style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tabContent}>
          {activeTab === "description" && (
            <Text style={styles.tabContentText}>
              CONCISE PHYSICS I.C.S.E. FOR CLASS - 9 by R. P. GOYAL & S. P. TRIPATHI is designed for March 2024 examination.
              This comprehensive textbook covers all topics in the ICSE syllabus with clear explanations,
              solved examples, and practice exercises. Published by S Chand Publishing Pvt Ltd.
            </Text>
          )}

          {activeTab === "specifications" && (
            <View style={styles.specList}>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Publisher:</Text>
                <Text style={styles.specValue}>S Chand Publishing</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Author:</Text>
                <Text style={styles.specValue}>R. P. GOYAL & S. P. TRIPATHI</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Edition:</Text>
                <Text style={styles.specValue}>2024</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Pages:</Text>
                <Text style={styles.specValue}>320</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Language:</Text>
                <Text style={styles.specValue}>English</Text>
              </View>
            </View>
          )}

          {activeTab === "reviews" && (
            <Text style={styles.tabContentText}>
              No reviews yet. Be the first to review this product.
            </Text>
          )}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* MODALS */}
      <Modal visible={showImageModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <Image
            source={product.images[currentImageIndex]}
            style={styles.modalImage}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.closeModalBtn}
            onPress={() => setShowImageModal(false)}
          >
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Video Modal */}
      <Modal visible={showVideoModal} transparent={false} animationType="slide">
        <View style={styles.videoModalContainer}>
          <Video
            ref={videoRef}
            source={product.video}
            style={styles.fullScreenVideo}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
            isLooping
          />
          <TouchableOpacity
            style={styles.videoCloseBtn}
            onPress={() => {
              setShowVideoModal(false);
              videoRef.current?.pauseAsync();
            }}
          >
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // Gallery Logic
  galleryContainer: {
    paddingTop: 10,
    paddingBottom: 25,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  mainImageWrapper: {
    width: screenWidth,
    height: 380,
    justifyContent: "center",
    alignItems: "center",
  },
  mainProductImage: {
    width: "85%",
    height: "90%",
  },
  thumbnailContainer: {
    height: 80,
    marginTop: 10,
  },
  thumbnailList: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  thumbnailWrapper: {
    width: 65,
    height: 65,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    marginRight: 10,
    overflow: "hidden",
    padding: 3,
  },
  activeThumbnail: {
    borderColor: "#1e40af",
    borderWidth: 2,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  videoThumbnailPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  readSampleBtn: {
    marginTop: 25,
    width: "90%",
    height: 50,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  readSampleText: {
    fontSize: 16,
    color: "#444",
    fontWeight: "500",
  },

  // Details
  detailsCard: { paddingHorizontal: 20, marginTop: 10 },
  productTitle: { fontSize: 20, fontWeight: "bold", color: "#111" },
  author: { fontSize: 15, color: "#666", marginTop: 4, marginBottom: 15 },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 10,
  },
  currentPrice: { fontSize: 24, fontWeight: "bold", color: "#000" },
  originalPrice: {
    fontSize: 16,
    color: "#999",
    textDecorationLine: "line-through",
    marginLeft: 10,
  },
  discount: {
    fontSize: 14,
    color: "#22c55e",
    fontWeight: "bold",
    marginLeft: 10,
  },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 20 },

  // Delivery
  deliverySection: { marginBottom: 25 },
  deliveryTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 55,
  },
  pincodeInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  checkBtn: {
    backgroundColor: "#1e40af",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },
  checkBtnText: { color: "#fff", fontWeight: "bold" },

  addToCartBtn: {
    backgroundColor: "#1e40af",
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  addToCartText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  // Tabs
  tabsContainer: {
    flexDirection: "row",
    marginTop: 30,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  tabBtn: { flex: 1, paddingVertical: 15, alignItems: "center" },
  activeTabBtn: { borderBottomWidth: 3, borderColor: "#1e40af" },
  tabText: { color: "#666", fontSize: 14 },
  activeTabText: { color: "#1e40af", fontWeight: "bold" },
  tabContent: { padding: 20 },
  tabContentText: { lineHeight: 22, color: "#555" },

  specList: { gap: 12 },
  specItem: { flexDirection: "row", justifyContent: "space-between" },
  specLabel: { fontSize: 15, color: "#6b7280", fontWeight: "500" },
  specValue: { fontSize: 15, color: "#1f2937", fontWeight: "600" },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: "#000", justifyContent: "center" },
  modalImage: { width: "100%", height: "80%" },
  closeModalBtn: { position: "absolute", top: 50, right: 20 },

  // Video Modal
  videoModalContainer: { flex: 1, backgroundColor: "#000" },
  fullScreenVideo: { flex: 1 },
  videoCloseBtn: {
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
});
