import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const BASE_URL = "https://clientbox.nuuqesystems.com";
const IMAGE_BASE_URL = "http://admin.ataw.online"; // ✅ Correct base for product images
const BANNER_API_URL = `${BASE_URL}/api/Banner/GetBanner?type=banner`;
const CATEGORY_API_URL = `${BASE_URL}/api/Category/Getallcategory`;
const READERS_CHOICE_API_URL = `${BASE_URL}/api/Product/Getreaderchoice`;
const TRENDING_BOOKS_API_URL = `${BASE_URL}/api/Product/Gettrendingbooks`;
// ❌ ALL_BOOKS_API_URL removed — endpoint does not exist on server (causes 404)

// ✅ FIX 1: buildImageUrl — always routes ProductImage paths to admin.ataw.online
// Handles: relative paths, already-full-URLs, and wrongly-based full URLs
const buildImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath) return "";

  const lower = imagePath.toLowerCase();

  // Already a full URL
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    // Fix wrongly-based URLs: if clientbox.nuuqesystems.com serves a ProductImage path,
    // redirect it to the correct admin.ataw.online host
    if (
      lower.includes("productimage") &&
      lower.includes("clientbox.nuuqesystems.com")
    ) {
      return imagePath
        .replace("https://clientbox.nuuqesystems.com", IMAGE_BASE_URL)
        .replace("http://clientbox.nuuqesystems.com", IMAGE_BASE_URL);
    }
    return imagePath;
  }

  // Relative path — normalize leading slash
  const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

  // Any ProductImage relative path → use IMAGE_BASE_URL (admin.ataw.online)
  if (path.toLowerCase().includes("productimage")) {
    return `${IMAGE_BASE_URL}${path}`;
  }

  return `${BASE_URL}${path}`;
};

// ✅ FIX 2: Safe JSON fetch — prevents "Unexpected end of JSON input" crash
const safeFetchJson = async (url: string): Promise<any> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const text = await response.text();
  if (!text || text.trim() === "") throw new Error("Empty response from server");
  return JSON.parse(text);
};

// ✅ FIX 3: Strip placeholder/broken URLs — return "" so fallback icon renders instead
const safeImageUrl = (url: string | undefined | null): string => {
  if (!url) return "";
  if (url.includes("placeholder") || url.includes("via.placeholder")) return "";
  return url;
};

interface BannerItem {
  id: number | string;
  imageUrl: string;
  bannerText?: string;
  bannerShortText?: string;
  link?: string;
}

interface CategoryItem {
  id: number | string;
  categoryId: number | string;
  title: string;
  imageUrl?: string;
}

interface ReadersChoiceItem {
  id: number | string;
  title: string;
  price: string;
  imageUrl?: string;
}

interface TrendingBookItem {
  id: number | string;
  title: string;
  price: string;
  imageUrl: string;
}

interface User {
  name?: string;
  email?: string;
  phone?: string;
  gst?: string;
  city?: string;
  retailerId?: number;
  username?: string;
  isVerified?: boolean;
  fullName?: string;
}

export default function HomeScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showExtraBanner, setShowExtraBanner] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [readersChoiceBooks, setReadersChoiceBooks] = useState<ReadersChoiceItem[]>([]);
  const [trendingBooks, setTrendingBooks] = useState<TrendingBookItem[]>([]);

  const [bannerLoading, setBannerLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [readersChoiceLoading, setReadersChoiceLoading] = useState(true);
  const [trendingBooksLoading, setTrendingBooksLoading] = useState(true);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const bannerRef = useRef<FlatList>(null);
  const router = useRouter();

  // ✅ Auth check
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        const storedToken = await AsyncStorage.getItem("userToken");
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser) as User);
        }
      } catch {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  // ✅ Auto banner scroll
  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      const next = (activeIndex + 1) % banners.length;
      setActiveIndex(next);
      bannerRef.current?.scrollToIndex({ index: next, animated: true });
    }, 3000);
    return () => clearInterval(interval);
  }, [activeIndex, banners.length]);

  // ✅ Fetch Banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setBannerLoading(true);
        const data = await safeFetchJson(BANNER_API_URL);
        const bannerList: BannerItem[] = Array.isArray(data)
          ? data.map((item: any) => ({
              id: item.bannerId,
              imageUrl: safeImageUrl(buildImageUrl(item.bannerPath)),
              bannerText: item.bannerText,
              bannerShortText: item.bannerShortText,
              link: item.link,
            }))
          : [];
        setBanners(bannerList);
      } catch (error) {
        console.error("❌ Banner Error:", error);
        setBanners([]);
      } finally {
        setBannerLoading(false);
      }
    };
    fetchBanners();
  }, []);

  // ✅ Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);
        const data = await safeFetchJson(CATEGORY_API_URL);
        const categoryList: CategoryItem[] = Array.isArray(data)
          ? data.map((item: any, index: number) => ({
              id: item.categoryId || item.id || `cat-${index}`,
              categoryId: item.categoryId || item.id || index,
              title:
                item.categoryName ||
                item.name ||
                item.title ||
                `Category ${index + 1}`,
              imageUrl: safeImageUrl(
                buildImageUrl(item.imageUrl || item.imagePath || item.image)
              ),
            }))
          : [];
        setCategories(categoryList);
      } catch (error) {
        console.error("❌ Category Error:", error);
        setCategories([]);
      } finally {
        setCategoryLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // ✅ Fetch Readers Choice
  useEffect(() => {
    const fetchReadersChoice = async () => {
      try {
        setReadersChoiceLoading(true);
        const data = await safeFetchJson(READERS_CHOICE_API_URL);
        const bookList: ReadersChoiceItem[] = Array.isArray(data)
          ? data.map((item: any, index: number) => ({
              id: item.product_ID || item.productId || item.id || `rc-${index}`,
              title:
                item.product_Name ||
                item.productName ||
                item.name ||
                item.title ||
                `Book ${index + 1}`,
              price: item.product_price
                ? `₹${item.product_price}`
                : item.price || "₹0",
              imageUrl: safeImageUrl(
                buildImageUrl(
                  item.product_Image ||
                    item.imageUrl ||
                    item.imagePath ||
                    item.image
                )
              ),
            }))
          : [];
        setReadersChoiceBooks(bookList);
      } catch (error) {
        console.error("❌ Readers Choice Error:", error);
        setReadersChoiceBooks([]);
      } finally {
        setReadersChoiceLoading(false);
      }
    };
    fetchReadersChoice();
  }, []);

  // ✅ Fetch Trending Books
  useEffect(() => {
    const fetchTrendingBooks = async () => {
      try {
        setTrendingBooksLoading(true);
        const data = await safeFetchJson(TRENDING_BOOKS_API_URL);
        const trendingList: TrendingBookItem[] = Array.isArray(data)
          ? data.map((item: any, index: number) => {
              const imageUrl = safeImageUrl(buildImageUrl(item.product_Image));
              console.log(`🔥 Trending [${index}] image:`, imageUrl);
              return {
                id:
                  item.product_ID ||
                  item.productId ||
                  item.id ||
                  `trending-${index}`,
                title:
                  item.product_Name ||
                  item.productName ||
                  item.name ||
                  `Trending Book ${index + 1}`,
                price: item.product_price
                  ? `₹${item.product_price}`
                  : item.price || "₹0",
                imageUrl,
              };
            })
          : [];
        setTrendingBooks(trendingList);
      } catch (error) {
        console.error("❌ Trending Books Error:", error);
        setTrendingBooks([]);
      } finally {
        setTrendingBooksLoading(false);
      }
    };
    fetchTrendingBooks();
  }, []);

  // ✅ Navigate to category screen
  const handleCategoryPress = (categoryId: number | string) => {
    const categoryTitle =
      categories.find((cat) => cat.categoryId === categoryId)?.title ||
      `Category ${categoryId}`;
    router.push({
      pathname: "/(tabs)/C6(1)",
      params: {
        categoryId: categoryId.toString(),
        categoryTitle,
      },
    });
  };

  const toggleMenu = () => {
    Animated.timing(slideAnim, {
      toValue: showMenu ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start(() => setShowMenu(!showMenu));
  };

  const menuHeight = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 180],
  });

  const handleBannerPress = (_banner: BannerItem) => {
    setShowExtraBanner(true);
  };

  const handleAddToCart = (book: any) => {
    console.log("🛒 Add to cart:", book.title || book.product_Name);
  };

  // ─── Render Functions ──────────────────────────────────────────────────────

  const renderCategory = ({ item }: { item: CategoryItem }) => (
    <TouchableOpacity
      style={styles.rectangularCategoryCard}
      onPress={() => handleCategoryPress(item.categoryId)}
      activeOpacity={0.9}
    >
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.rectangularCategoryImage}
          resizeMode="cover"
          onError={() =>
            console.log("❌ Category image failed:", item.imageUrl)
          }
        />
      ) : (
        <View style={[styles.rectangularCategoryImage, styles.placeholderImage]}>
          <Ionicons name="grid-outline" size={40} color="#e53935" />
        </View>
      )}
      <Text style={styles.rectangularCategoryLabel} numberOfLines={2}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const renderReadersChoice = ({ item }: { item: ReadersChoiceItem }) => (
    <TouchableOpacity
      style={styles.rectangularProductCard}
      activeOpacity={0.9}
      onPress={() => console.log("📖 View product:", item.title)}
    >
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={[
            styles.rectangularProductImage,
            { backgroundColor: "#fff0f0" },
          ]}
          resizeMode="cover"
          onError={() => console.log("❌ RC image failed:", item.imageUrl)}
        />
      ) : (
        <View style={[styles.rectangularProductImage, styles.placeholderImage]}>
          <Ionicons name="book-outline" size={50} color="#e53935" />
        </View>
      )}
      <View style={styles.rectangularProductContent}>
        <Text numberOfLines={2} style={styles.rectangularProductTitle}>
          {item.title}
        </Text>
        <Text style={styles.rectangularPrice}>{item.price}</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => handleAddToCart(item)}
        >
          <Feather name="shopping-cart" size={14} color="#fff" />
          <Text style={styles.addText}> Add</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderTrendingBooks = ({ item }: { item: TrendingBookItem }) => (
    <TouchableOpacity
      style={styles.rectangularProductCard}
      activeOpacity={0.9}
      onPress={() => console.log("🔥 View trending:", item.title)}
    >
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={[
            styles.rectangularProductImage,
            { backgroundColor: "#fff5f0" },
          ]}
          resizeMode="cover"
          onError={() =>
            console.log("❌ Trending image failed:", item.imageUrl)
          }
        />
      ) : (
        <View style={[styles.rectangularProductImage, styles.placeholderImage]}>
          <Ionicons name="flame-outline" size={50} color="#ff6b35" />
        </View>
      )}
      <View style={styles.rectangularProductContent}>
        <Text numberOfLines={2} style={styles.rectangularProductTitle}>
          {item.title}
        </Text>
        <Text style={styles.rectangularPrice}>{item.price}</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => handleAddToCart(item)}
        >
          <Feather name="shopping-cart" size={14} color="#fff" />
          <Text style={styles.addText}> Add</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderBannerItem = ({ item }: { item: BannerItem }) => (
    <TouchableOpacity
      onPress={() => handleBannerPress(item)}
      style={styles.bannerWrapper}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.banner}
        resizeMode="cover"
      />
      {item.bannerText && (
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerTitle}>{item.bannerText}</Text>
          {item.bannerShortText && (
            <Text style={styles.bannerSubtitle}>{item.bannerShortText}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  // ─── Main Render ───────────────────────────────────────────────────────────

  return (
    <FlatList
      style={[styles.container, { zIndex:1}]}
      data={[{ key: "content" }]}
      renderItem={() => (
        <>
          {/* HEADER */}
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
              <TouchableOpacity onPress={() => router.push("/(tabs)/C2")}>
                <Ionicons name="heart-outline" size={22} color="#444" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/Addtocart")}
              >
                <Ionicons name="cart-outline" size={22} color="#444" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (user) setShowProfileMenu(!showProfileMenu);
                  else router.push("/(tabs)/C1(a)");
                }}
                style={styles.profileIconWrapper}
              >
                {user ? (
                  <View style={styles.profileAvatar}>
                    <Text style={styles.profileAvatarText}>
                      {(user.name || user.fullName || user.username || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </Text>
                  </View>
                ) : (
                  <Ionicons
                    name="person-circle-outline"
                    size={32}
                    color="#444"
                  />
                )}
              </TouchableOpacity>
            </View>

            {/* PROFILE DROPDOWN */}
            {showProfileMenu && (
              <View style={styles.profileDropdown}>
                <TouchableOpacity
                  style={styles.profileDropdownItem}
                  onPress={() => {
                    setShowProfileMenu(false);
                    router.push("/(tabs)/C10");
                  }}
                >
                  <Ionicons name="person-outline" size={20} color="#444" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.profileDropdownItem}
                  onPress={() => {
                    setShowProfileMenu(false);
                    router.push("/(tabs)/orders" as any);
                  }}
                >
                  <Ionicons name="car-outline" size={20} color="#444" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.profileDropdownItem}
                  onPress={() => {
                    setShowProfileMenu(false);
                  }}
                >
                  <Ionicons name="ban-outline" size={20} color="#444" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.profileDropdownItem}
                  onPress={() => {
                    setShowProfileMenu(false);
                    router.push("/(tabs)/C7" as any);
                  }}
                >
                  <Ionicons name="mail-outline" size={20} color="#444" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.profileDropdownItem}
                  onPress={() => {
                    setShowProfileMenu(false);
                    router.push("/(tabs)/settings" as any);
                  }}
                >
                  <Ionicons name="settings-outline" size={20} color="#444" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.profileDropdownItem,
                    { borderBottomWidth: 0 },
                  ]}
                  onPress={async () => {
                    setShowProfileMenu(false);
                    await AsyncStorage.removeItem("user");
                    await AsyncStorage.removeItem("userToken");
                    setUser(null);
                    router.push("/(tabs)/C1(a)");
                  }}
                >
                  <Ionicons
                    name="log-out-outline"
                    size={20}
                    color="#e53935"
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* USER GREETING */}
          {user && (
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>
                Hi, {user.name || user.fullName || "Retailer"}! 👋
              </Text>
              {(user.phone || user.city) && (
                <Text style={styles.subGreeting}>
                  {user.phone ? `${user.phone}` : ""}
                  {user.phone && user.city ? " • " : ""}
                  {user.city || ""}
                </Text>
              )}
            </View>
          )}

          {/* MENU ROW */}
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
                    const routes: Record<string, string> = {
                      "Contact Us": "/(tabs)/C7",
                      Home: "/(tabs)/home",
                      About: "/(tabs)/C9",
                      Products: "/(tabs)/C6",
                    };
                    router.push(routes[item] as any);
                  }}
                >
                  <Text style={styles.menuItem}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* DROPDOWN MENU */}
          <Animated.View
            style={[styles.dropdownMenu, { height: menuHeight }]}
          >
            {[
              { icon: "tv-outline", title: "Electronics" },
              { icon: "barbell-outline", title: "Sports & Fitness" },
              { icon: "book-outline", title: "Stationery Materials" },
              { icon: "library-outline", title: "Books" },
            ].map((item, index) => (
              <TouchableOpacity key={index} style={styles.dropdownItem}>
                <Ionicons name={item.icon as any} size={18} color="#333" />
                <Text style={styles.dropdownText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>

          {/* BANNER SLIDER */}
          <View style={styles.bannerSection}>
            {bannerLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#e53935" />
                <Text style={styles.loadingText}>Loading banners...</Text>
              </View>
            ) : banners.length === 0 ? (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No banners available</Text>
              </View>
            ) : (
              <>
                <FlatList
                  ref={bannerRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  data={banners}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderBannerItem}
                  onScroll={(e) => {
                    const index = Math.round(
                      e.nativeEvent.contentOffset.x / width
                    );
                    setActiveIndex(index);
                  }}
                  scrollEventThrottle={16}
                />
                <View style={styles.bannerDots}>
                  {banners.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        {
                          backgroundColor:
                            index === activeIndex ? "#e53935" : "#ddd",
                        },
                      ]}
                    />
                  ))}
                </View>
              </>
            )}
          </View>

          {/* EXTRA BANNER */}
          {showExtraBanner && banners.length > 0 && (
            <TouchableOpacity
              style={styles.extraBannerContainer}
              onPress={() => setShowExtraBanner(false)}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: banners[0].imageUrl }}
                style={styles.extraBanner}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}

          {/* CATEGORIES */}
          <Text style={styles.sectionTitle}>Book Categories</Text>
          {categoryLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#e53935" />
              <Text style={styles.loadingText}>Loading categories...</Text>
            </View>
          ) : categories.length === 0 ? (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No categories available</Text>
            </View>
          ) : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={categories}
              renderItem={renderCategory}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listPadding}
            />
          )}

          {/* TRENDING BOOKS */}
          <Text style={styles.sectionTitle}>🔥 Trending Books</Text>
          {trendingBooksLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#e53935" />
              <Text style={styles.loadingText}>Loading trending books...</Text>
            </View>
          ) : trendingBooks.length === 0 ? (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No trending books available</Text>
            </View>
          ) : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={trendingBooks}
              renderItem={renderTrendingBooks}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listPadding}
            />
          )}

          {/* READERS CHOICE */}
          <Text style={styles.sectionTitle}>Readers' Choice</Text>
          {readersChoiceLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#e53935" />
              <Text style={styles.loadingText}>Loading readers choice...</Text>
            </View>
          ) : readersChoiceBooks.length === 0 ? (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No readers choice available</Text>
            </View>
          ) : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={readersChoiceBooks}
              renderItem={renderReadersChoice}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listPadding}
            />
          )}
        </>
      )}
      ListFooterComponent={() => <View style={{ height: 100 }} />}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    paddingTop: 50,
    elevation: 20,
    backgroundColor: "#fff",
    zIndex: 1000,
  },
  logo: { width: 50, height: 50, resizeMode: "contain" },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginHorizontal: 10,
    height: 45,
  },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 5 },
  headerIcons: { flexDirection: "row", gap: 15 },
  greetingContainer: {
    marginLeft: 20,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  greeting: {
    fontSize: 18,
    color: "#e53935",
    fontWeight: "700",
  },
  subGreeting: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  categoryBtn: {
    flexDirection: "row",
    backgroundColor: "#e53935",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  categoryText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 6,
    fontWeight: "600",
  },
  menuContainer: { flexDirection: "row", marginLeft: 15, gap: 20 },
  menuItem: { fontSize: 14, color: "#333", fontWeight: "500" },
  dropdownMenu: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    borderRadius: 12,
    elevation: 8,
    overflow: "hidden",
    marginBottom: 15,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownText: { marginLeft: 15, fontSize: 16, fontWeight: "500" },
  bannerSection: { marginHorizontal: 15, marginVertical: 10 },
  bannerWrapper: { width: width - 30, height: 200, position: "relative" },
  banner: { width: "100%", height: "100%", borderRadius: 16 },
  bannerOverlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 15,
    borderRadius: 12,
  },
  bannerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  bannerSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 15,
    textAlign: "center",
  },
  bannerDots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
    gap: 8,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  extraBannerContainer: {
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 6,
  },
  extraBanner: { width: "100%", height: 150 },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    margin: 20,
    marginBottom: 10,
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    marginHorizontal: 15,
  },
  loadingText: { marginTop: 12, fontSize: 16, color: "#666" },
  noDataContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    marginHorizontal: 15,
  },
  noDataText: { fontSize: 16, color: "#666" },
  listPadding: { paddingHorizontal: 5 },
  rectangularCategoryCard: {
    width: 160,
    height: 130,
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
  rectangularCategoryImage: {
    width: "100%",
    height: "65%",
    resizeMode: "cover",
  },
  placeholderImage: {
    backgroundColor: "#fff0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  rectangularCategoryLabel: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  rectangularProductCard: {
    width: 220,
    height: 300,
    marginHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    overflow: "hidden",
  },
  rectangularProductImage: {
    width: "100%",
    height: "60%",
    resizeMode: "cover",
  },
  rectangularProductContent: {
    padding: 16,
    flex: 1,
    justifyContent: "space-between",
  },
  rectangularProductTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
    lineHeight: 22,
  },
  rectangularPrice: { fontSize: 20, fontWeight: "bold", color: "#dc2626" },
  addBtn: {
    flexDirection: "row",
    backgroundColor: "#e53935",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  addText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 6,
  },
  profileDropdown: {
    position: "absolute",
    top: 110,
    right: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 9999,
    paddingVertical: 6,
    minWidth: 54,
  },
  profileDropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  profileIconWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e53935",
    justifyContent: "center",
    alignItems: "center",
  },
  profileAvatarText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});