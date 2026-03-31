import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ImageSourcePropType,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");
const PRODUCT_ID = 63;
const PRODUCT_API_URL = `https://clientbox.nuuqesystems.com/api/Product/GetProductDetails/63`;

interface ProductDetail {
  id: number;
  productName?: string;
  author?: string;
  publisher?: string;
  price?: string;
  originalPrice?: string;
  imageUrl?: string;
  imagePath?: string;
  description?: string;
  images?: ImageSourcePropType[];
  hasVideo?: boolean;
  videoUrl?: string;
  availability?: string;
  specifications?: Record<string, string>;
  averageRating?: number; // you can keep this if you want static rating
}

export default function ProductDetailScreen() {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<Video>(null);

  // Fetch Product Details (no reviews)
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        console.log("🔄 Fetching product details from:", PRODUCT_API_URL);

        const response = await fetch(PRODUCT_API_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        console.log("✅ Product API Response:", data);

        const productData: ProductDetail = {
          id: data.productId || data.id || PRODUCT_ID,
          productName: data.productName || data.name || data.title || "Concise Chemistry ICSE Class 10",
          author: data.author || data.Author || "Dr. S.P. Singh",
          publisher: data.publisher || data.Publisher || "S Chand Publishing Pvt Ltd",
          price: data.price || data.Price || data.salePrice || "₹ 340",
          originalPrice: data.originalPrice || data.mrp || "₹ 420",
          imageUrl: data.imageUrl || data.imagePath || data.image || "",
          description: data.description || data.Description || "Comprehensive ICSE Class 10 Chemistry textbook",
          availability: data.availability || data.stock || "In Stock",
          hasVideo: data.hasVideo || false,
          specifications: data.specifications || {
            Publisher: data.publisher || "S Chand Publishing",
            Author: data.author || "Dr. S.P. Singh",
            Edition: data.edition || "2024",
            Pages: data.pages || "320",
            Language: data.language || "English",
          },
        };

        const images: ImageSourcePropType[] = [];
        if (data.images && Array.isArray(data.images)) {
          data.images.forEach((imgObj: any) => {
            const imgUrl = imgObj.imageUrl || imgObj.imagePath || imgObj.image || imgObj;
            if (imgUrl && typeof imgUrl === "string") {
              images.push({ uri: imgUrl });
            }
          });
        } else if (data.imageUrl || data.imagePath || data.image) {
          const imgUrl = (data.imageUrl || data.imagePath || data.image) as string;
          if (imgUrl) images.push({ uri: imgUrl });
        }

        if (images.length === 0) {
          images.push(
            require("../../assets/images/Chemistry.png"),
            require("../../assets/images/Chemistry2.png"),
            require("../../assets/images/Chemistry3.png")
          );
        }

        productData.images = images;
        setProduct(productData);
      } catch (err: any) {
        console.error("❌ Product API Error:", err.message);
        setProduct({
          id: PRODUCT_ID,
          productName: "Concise Chemistry ICSE Class 10",
          author: "Dr. S.P. Singh",
          publisher: "S Chand Publishing Pvt Ltd",
          price: "₹ 340",
          originalPrice: "₹ 420",
          images: [
            require("../../assets/images/Chemistry.png"),
            require("../../assets/images/Chemistry2.png"),
            require("../../assets/images/Chemistry3.png"),
          ],
          availability: "In Stock",
          description: "Concise Chemistry ICSE Class 10 by Dr. S.P. Singh.",
          specifications: {
            Publisher: "S Chand Publishing",
            Author: "Dr. S.P. Singh",
            Edition: "2024",
            Pages: "320",
            Language: "English",
          },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, []);

  const tabs = [
    { id: "description", label: "Description" },
    { id: "specifications", label: "Specifications" },
    // Reviews tab removed
  ];

  // Keep rating stars if you want a static rating (e.g., 4.5)
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color="#fbbf24"
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1e40af" />
          <Text style={styles.loadingText}>Loading Chemistry book...</Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* IMAGE GALLERY */}
        <View style={styles.galleryContainer}>
          <TouchableOpacity
            style={styles.mainImageWrapper}
            onPress={() => product && setShowImageModal(true)}
            activeOpacity={0.9}
          >
            <Image
              source={product?.images?.[currentImageIndex] || product?.images?.[0]}
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
              {product?.images?.map((img: ImageSourcePropType, index: number) => (
                <TouchableOpacity
                  key={`thumb-${index}`}
                  onPress={() => setCurrentImageIndex(index)}
                  style={[styles.thumbnailWrapper, currentImageIndex === index && styles.activeThumbnail]}
                >
                  <Image source={img} style={styles.thumbnailImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity style={styles.readSampleBtn}>
            <Text style={styles.readSampleText}>Read sample</Text>
          </TouchableOpacity>
        </View>

        {/* PRODUCT INFO */}
        <View style={styles.detailsCard}>
          <Text style={styles.productTitle}>{product?.productName}</Text>
          <Text style={styles.author}>By {product?.author}</Text>

          {/* Optional: keep static rating if you want */}
          {product?.averageRating && (
            <View style={styles.ratingContainer}>
              <View style={styles.ratingRow}>
                {renderStars(product.averageRating)}
                <Text style={styles.ratingText}>{product.averageRating}</Text>
              </View>
            </View>
          )}

          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>{product?.price}</Text>
            <Text style={styles.originalPrice}>{product?.originalPrice}</Text>
            <Text style={styles.discount}>-20% OFF</Text>
          </View>

          <View style={styles.divider} />

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

          <Text style={styles.availabilityText}>
            {product?.availability || "In Stock"} • Free Delivery
          </Text>

          <TouchableOpacity
            style={styles.addToCartBtn}
            onPress={() => Alert.alert("Added to Cart!", product?.productName)}
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
              <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TAB CONTENT (no reviews tab) */}
        <View style={styles.tabContent}>
          {activeTab === "description" && (
            <Text style={styles.tabContentText}>{product?.description}</Text>
          )}
          {activeTab === "specifications" && product?.specifications && (
            <View style={styles.specList}>
              {Object.entries(product.specifications).map(([key, value]) => (
                <View key={key} style={styles.specItem}>
                  <Text style={styles.specLabel}>{key}:</Text>
                  <Text style={styles.specValue}>{value}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* MODALS */}
      <Modal visible={showImageModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Image
            source={product?.images?.[currentImageIndex]}
            style={styles.modalImage}
            resizeMode="contain"
          />
          <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowImageModal(false)}>
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={showVideoModal} transparent={false} animationType="slide">
        <View style={styles.videoModalContainer}>
          {product?.videoUrl && (
            <Video
              ref={videoRef}
              source={{ uri: product.videoUrl }}
              style={styles.fullScreenVideo}
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls
              isLooping
            />
          )}
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
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
  detailsCard: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
  },
  author: {
    fontSize: 15,
    color: "#666",
    marginTop: 4,
    marginBottom: 15,
  },
  ratingContainer: {
    marginBottom: 15,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 10,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
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
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 20,
  },
  deliverySection: {
    marginBottom: 25,
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
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
  checkBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  addToCartBtn: {
    backgroundColor: "#1e40af",
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  addToCartText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  tabsContainer: {
    flexDirection: "row",
    marginTop: 30,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
  },
  activeTabBtn: {
    borderBottomWidth: 3,
    borderColor: "#1e40af",
  },
  tabText: {
    color: "#666",
    fontSize: 14,
  },
  activeTabText: {
    color: "#1e40af",
    fontWeight: "bold",
  },
  tabContent: {
    padding: 20,
  },
  tabContentText: {
    lineHeight: 22,
    color: "#555",
  },
  specList: {
    gap: 12,
  },
  specItem: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  specLabel: {
    fontSize: 15,
    color: "#6b7280",
    fontWeight: "500",
  },
  specValue: {
    fontSize: 15,
    color: "#1f2937",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
  },
  modalImage: {
    width: "100%",
    height: "80%",
  },
  closeModalBtn: {
    position: "absolute",
    top: 50,
    right: 20,
  },
  videoModalContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  fullScreenVideo: {
    flex: 1,
  },
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
  },
  availabilityText: {
    fontSize: 14,
    color: "#059669",
    marginBottom: 20,
    fontWeight: "500"
  }
});

