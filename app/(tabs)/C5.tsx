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
const VENDER_ID = 1;
const PRODUCT_API_URL = `https://clientbox.nuuqesystems.com/api/Product/GetProductDetails/${PRODUCT_ID}`;
const IMAGE_BASE_URL = "http://admin.ataw.online";
const REVIEWS_API_URL = `https://clientbox.nuuqesystems.com/api/Review/GetReviews/${VENDER_ID}/${PRODUCT_ID}`;

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
  averageRating?: number;
}

interface Review {
  id?: number;
  reviewId?: number;
  reviewerName?: string;
  userName?: string;
  name?: string;
  rating?: number;
  comment?: string;
  reviewText?: string;
  review?: string;
  date?: string;
  createdDate?: string;
  createdAt?: string;
}

export default function ProductDetailScreen() {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState<number>(0);

  const videoRef = useRef<Video>(null);

  // Fetch Product Details
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
          id: data.product_ID || data.productId || data.id || PRODUCT_ID,
          productName:
            data.product_Name ||
            data.productName ||
            data.name ||
            data.title ||
            "Concise Chemistry ICSE Class 10",
          author: data.author || data.Author || "Dr. S.P. Singh",
          publisher:
            data.publishar ||
            data.publisher ||
            data.Publisher ||
            "S Chand Publishing Pvt Ltd",
          price: data.product_price
            ? `₹ ${data.product_price}`
            : data.price || "₹ 340",
          originalPrice: data.product_MRP
            ? `₹ ${data.product_MRP}`
            : data.originalPrice || "₹ 420",
          imageUrl: data.product_Image
            ? `${IMAGE_BASE_URL}${data.product_Image}`
            : data.imageUrl || data.imagePath || data.image || "",
          description:
            data.product_desc ||
            data.description ||
            data.Description ||
            "Comprehensive ICSE Class 10 Chemistry textbook",
          availability:
            data.avlQty > 0
              ? "In Stock"
              : data.availability || data.stock || "In Stock",
          hasVideo: data.hasVideo || false,
          specifications: {
            Publisher:
              data.publishar ||
              data.publisher ||
              "S Chand Publishing",
            Author: data.author || "Dr. S.P. Singh",
            Edition: data.edition || "2024",
            Pages: data.page_Number
              ? String(data.page_Number)
              : "320",
            Language: data.language || "English",
            Binding: data.binding || "Paperback",
          },
        };

        const images: ImageSourcePropType[] = [];
        if (data.images && Array.isArray(data.images)) {
          data.images.forEach((imgObj: any) => {
            const imgUrl =
              imgObj.imageUrl ||
              imgObj.imagePath ||
              imgObj.image ||
              imgObj;
            if (imgUrl && typeof imgUrl === "string") {
              images.push({ uri: imgUrl });
            }
          });
        } else if (
          data.product_Image ||
          data.imageUrl ||
          data.imagePath ||
          data.image
        ) {
          const rawUrl =
            data.product_Image ||
            data.imageUrl ||
            data.imagePath ||
            data.image;
          const imgUrl = rawUrl.startsWith("http")
            ? rawUrl
            : `${IMAGE_BASE_URL}${rawUrl}`;
          images.push({ uri: imgUrl });
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
            Binding: "Paperback",
          },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, []);

  // Fetch Reviews
  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      setReviewsError(null);
      console.log("🔄 Fetching reviews from:", REVIEWS_API_URL);

      const response = await fetch(REVIEWS_API_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      console.log("✅ Reviews API Response:", data);

      // Handle different response shapes
      let reviewList: Review[] = [];
      if (Array.isArray(data)) {
        reviewList = data;
      } else if (data.reviews && Array.isArray(data.reviews)) {
        reviewList = data.reviews;
      } else if (data.data && Array.isArray(data.data)) {
        reviewList = data.data;
      }

      setReviews(reviewList);

      // Calculate average rating
      if (reviewList.length > 0) {
        const total = reviewList.reduce(
          (sum: number, r: Review) => sum + (r.rating || 0),
          0
        );
        setAverageRating(parseFloat((total / reviewList.length).toFixed(1)));
      }
    } catch (err: any) {
      console.error("❌ Reviews API Error:", err.message);
      setReviewsError("Could not load reviews. Please try again.");
    } finally {
      setReviewsLoading(false);
    }
  };

  // Fetch reviews when Reviews tab is opened
  useEffect(() => {
    if (activeTab === "reviews") {
      fetchReviews();
    }
  }, [activeTab]);

  const tabs = [
    { id: "description", label: "Description" },
    { id: "specifications", label: "Specifications" },
    { id: "reviews", label: "Reviews" },
  ];

  const renderStars = (rating: number, size: number = 16) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(
          <Ionicons key={i} name="star" size={size} color="#fbbf24" />
        );
      } else if (i === Math.ceil(rating) && rating % 1 >= 0.5) {
        stars.push(
          <Ionicons key={i} name="star-half" size={size} color="#fbbf24" />
        );
      } else {
        stars.push(
          <Ionicons key={i} name="star-outline" size={size} color="#fbbf24" />
        );
      }
    }
    return stars;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getReviewerName = (r: Review) =>
    r.reviewerName || r.userName || r.name || "Anonymous";

  const getReviewText = (r: Review) =>
    r.comment || r.reviewText || r.review || "";

  const getReviewDate = (r: Review) =>
    formatDate(r.date || r.createdDate || r.createdAt);

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
              source={
                product?.images?.[currentImageIndex] ||
                product?.images?.[0]
              }
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
              {product?.images?.map(
                (img: ImageSourcePropType, index: number) => (
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
                )
              )}
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

          {/* Dynamic average rating from reviews */}
          {averageRating > 0 && (
            <View style={styles.ratingContainer}>
              <View style={styles.ratingRow}>
                {renderStars(averageRating)}
                <Text style={styles.ratingText}>{averageRating}</Text>
                <Text style={styles.reviewCount}>
                  ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
                </Text>
              </View>
            </View>
          )}

          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>{product?.price}</Text>
            <Text style={styles.originalPrice}>{product?.originalPrice}</Text>
            {product?.price !== product?.originalPrice && (
              <Text style={styles.discount}>-20% OFF</Text>
            )}
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
            onPress={() =>
              Alert.alert("Added to Cart!", product?.productName)
            }
          >
            <Text style={styles.addToCartText}>ADD TO CART</Text>
          </TouchableOpacity>
        </View>

        {/* TABS */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabBtn,
                activeTab === tab.id && styles.activeTabBtn,
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TAB CONTENT */}
        <View style={styles.tabContent}>
          {activeTab === "description" && (
            <Text style={styles.tabContentText}>
              {product?.description}
            </Text>
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

          {activeTab === "reviews" && (
            <View>
              {/* Reviews Summary */}
              {averageRating > 0 && (
                <View style={styles.reviewsSummary}>
                  <Text style={styles.avgRatingBig}>{averageRating}</Text>
                  <View style={styles.avgRatingStars}>
                    {renderStars(averageRating, 22)}
                    <Text style={styles.avgRatingCount}>
                      {reviews.length} Review{reviews.length !== 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>
              )}

              {/* Loading */}
              {reviewsLoading && (
                <View style={styles.reviewsCenter}>
                  <ActivityIndicator size="small" color="#1e40af" />
                  <Text style={styles.reviewsLoadingText}>
                    Loading reviews...
                  </Text>
                </View>
              )}

              {/* Error */}
              {reviewsError && !reviewsLoading && (
                <View style={styles.reviewsCenter}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={40}
                    color="#ef4444"
                  />
                  <Text style={styles.reviewsErrorText}>{reviewsError}</Text>
                  <TouchableOpacity
                    style={styles.retryBtn}
                    onPress={fetchReviews}
                  >
                    <Text style={styles.retryBtnText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Empty */}
              {!reviewsLoading &&
                !reviewsError &&
                reviews.length === 0 && (
                  <View style={styles.reviewsCenter}>
                    <Ionicons
                      name="chatbubble-outline"
                      size={40}
                      color="#9ca3af"
                    />
                    <Text style={styles.noReviewsText}>No reviews yet.</Text>
                    <Text style={styles.noReviewsSubtext}>
                      Be the first to review this product!
                    </Text>
                  </View>
                )}

              {/* Review Cards */}
              {!reviewsLoading &&
                !reviewsError &&
                reviews.map((review, index) => (
                  <View
                    key={review.reviewId || review.id || index}
                    style={styles.reviewCard}
                  >
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewAvatar}>
                        <Text style={styles.reviewAvatarText}>
                          {getReviewerName(review).charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.reviewMeta}>
                        <Text style={styles.reviewerName}>
                          {getReviewerName(review)}
                        </Text>
                        <Text style={styles.reviewDate}>
                          {getReviewDate(review)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.reviewStarsRow}>
                      {renderStars(review.rating || 0)}
                    </View>

                    {getReviewText(review) !== "" && (
                      <Text style={styles.reviewComment}>
                        {getReviewText(review)}
                      </Text>
                    )}
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
          <TouchableOpacity
            style={styles.closeModalBtn}
            onPress={() => setShowImageModal(false)}
          >
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        visible={showVideoModal}
        transparent={false}
        animationType="slide"
      >
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
  reviewCount: {
    marginLeft: 6,
    fontSize: 13,
    color: "#6b7280",
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
  // Reviews
  reviewsSummary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f4ff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    gap: 16,
  },
  avgRatingBig: {
    fontSize: 44,
    fontWeight: "bold",
    color: "#1e40af",
  },
  avgRatingStars: {
    flexDirection: "column",
    gap: 6,
  },
  avgRatingCount: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
  },
  reviewsCenter: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 10,
  },
  reviewsLoadingText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
  },
  reviewsErrorText: {
    fontSize: 14,
    color: "#ef4444",
    textAlign: "center",
    marginTop: 8,
  },
  retryBtn: {
    marginTop: 10,
    backgroundColor: "#1e40af",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  noReviewsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginTop: 8,
  },
  noReviewsSubtext: {
    fontSize: 13,
    color: "#9ca3af",
  },
  reviewCard: {
    backgroundColor: "#fafafa",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1e40af",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  reviewAvatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  reviewMeta: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
  },
  reviewDate: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  reviewStarsRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  // Modals
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
    fontWeight: "500",
  },
});