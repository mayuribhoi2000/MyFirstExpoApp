import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ProductItem {
  id: number | string;
  name?: string;
  title?: string;
  imageUrl?: string;
  imagePath?: string;
  price?: number;
  mrp?: number;
  discount?: number;
  rating?: number;
  ratingCount?: number;
  brand?: string;
}

const FILTER_SECTIONS = ['CATEGORIES', 'PRICE', 'DISCOUNT', 'CUSTOMER RATINGS', 'BRAND', 'IDEAL FOR'];

export default function ProductsPage() {
  const router = useRouter();
  const { categoryId = '1', categoryTitle = 'Products' } = useLocalSearchParams();

  const [productList, setProductList] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState<string[]>(['DISCOUNT', 'CUSTOMER RATINGS', 'BRAND', 'IDEAL FOR']);

  const fetchProducts = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      const apiUrl = `https://clientbox.nuuqesystems.com/api/Category/Getallsubcategory/1`;
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      const processedProducts: ProductItem[] = Array.isArray(data)
        ? data.map((item: any, index: number) => {
            // Build full image URL — API may return a relative path like /ProductImage/xxx.jpg
            const rawImage =
              item.imageUrl ||
              item.imagePath ||
              item.image ||
              item.productImage ||
              item.thumbnail ||
              '';
            const imageUrl =
              rawImage && rawImage.startsWith('http')
                ? rawImage
                : rawImage
                ? `https://admin.ataw.online${rawImage.startsWith('/') ? '' : '/'}${rawImage}`
                : '';

            return {
              id: item.id || item.subCategoryId || item.productId || `prod-${index}`,
              name:
                item.name ||
                item.subCategoryName ||
                item.productName ||
                item.title ||
                `Product ${index + 1}`,
              imageUrl,
              price: item.price || item.sellingPrice || 500,
              mrp: item.mrp || item.originalPrice || (item.price ? Math.round(item.price * 1.2) : 600),
              discount: item.discount || item.discountPercent || 0,
              rating: item.rating || item.averageRating || 4.2,
              ratingCount: item.ratingCount || item.reviewCount || 120,
              brand: item.brand || item.brandName || '',
            };
          })
        : [];

      console.log('✅ Raw API items:');
      if (Array.isArray(data)) {
        data.forEach((item: any, i: number) => {
          console.log(`📦 Item [${i}] keys:`, Object.keys(item));
          console.log(`📦 Item [${i}] data:`, JSON.stringify(item));
        });
      }
      console.log('✅ Processed products:', processedProducts.length);
      processedProducts.forEach(p => console.log('📖 Name:', p.name, '| 🖼 Image:', p.imageUrl));
      setProductList(processedProducts);
    } catch (error: any) {
      console.error('❌ Fetch error:', error.message);
      setProductList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryId]);

  const toggleFilter = (section: string) => {
    setExpandedFilters(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const handleProductPress = (product: ProductItem) => {
    router.push({
      pathname: '/C5',
      params: {
        productId: product.id.toString(),
        productName: product.name || "",
      },
    });
  };

  const renderSidebar = () => (
    <View style={styles.sidebar}>
      <Text style={styles.filtersTitle}>Filters</Text>

      {FILTER_SECTIONS.map((section) => {
        const isExpanded = expandedFilters.includes(section);
        const hasChevron = section !== 'CATEGORIES' && section !== 'PRICE';

        return (
          <View key={section} style={styles.filterSection}>
            <TouchableOpacity
              style={styles.filterHeader}
              onPress={() => hasChevron && toggleFilter(section)}
              activeOpacity={hasChevron ? 0.7 : 1}
            >
              <Text style={styles.filterSectionTitle}>{section}</Text>
              {hasChevron && (
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#555"
                />
              )}
            </TouchableOpacity>

            {section === 'PRICE' && (
              <View style={styles.priceFilterContent}>
                <Text style={styles.priceRange}>₹ 300 - ₹ 13000</Text>
                <View style={styles.sliderTrack}>
                  <View style={styles.sliderFill} />
                  <View style={styles.sliderThumb} />
                </View>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );

  const renderProduct = ({ item }: { item: ProductItem }) => {
    const discountPercent =
      item.mrp && item.price && item.mrp > item.price
        ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
        : 0;

    return (
      <TouchableOpacity
        style={styles.productCard}
        activeOpacity={0.88}
        onPress={() => handleProductPress(item)}
      >
        <View style={styles.imageWrapper}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.productImage, styles.placeholderImage]}>
              <Ionicons name="book-outline" size={36} color="#ccc" />
            </View>
          )}
        </View>

        <Text style={styles.productName} numberOfLines={3}>
          {item.name}
        </Text>

        <Text style={styles.brandSubtext} numberOfLines={1}>
          {item.name}
        </Text>

        {/* Rating Badge */}
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingBadgeText}>{item.rating?.toFixed(1)}</Text>
          <Ionicons name="star" size={11} color="#fff" />
        </View>

        {/* Price Row */}
        <View style={styles.priceRow}>
          <Text style={styles.currentPrice}>₹{item.price}</Text>
          {item.mrp && item.mrp !== item.price && (
            <Text style={styles.mrpText}>₹{item.mrp}</Text>
          )}
          <Text style={styles.discountLabel}>{discountPercent}% off</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ActivityIndicator size="large" color="#2874f0" />
        <Text style={styles.loadingTitle}>Loading Products...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* BREADCRUMB */}
      <View style={styles.breadcrumb}>
        <Text style={styles.breadcrumbLink}>Home</Text>
        <Text style={styles.breadcrumbSep}> / </Text>
        <Text style={styles.breadcrumbCurrent}>Product List</Text>
      </View>

      <View style={styles.body}>
        {/* LEFT SIDEBAR */}
        {renderSidebar()}

        {/* RIGHT CONTENT */}
        <View style={styles.mainContent}>
          {/* Sort Button */}
          <View style={styles.sortRow}>
            <TouchableOpacity style={styles.popularityBtn}>
              <Text style={styles.popularityBtnText}>Popularity</Text>
            </TouchableOpacity>
          </View>

          {/* Product Grid */}
          <FlatList
            data={productList}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={() => fetchProducts(true)}
            columnWrapperStyle={styles.columnWrapper}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="book-outline" size={64} color="#ccc" />
                <Text style={styles.emptyTitle}>No Products Found</Text>
              </View>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingTitle: {
    fontSize: 16,
    color: '#555',
    marginTop: 12,
  },

  // Breadcrumb
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  breadcrumbLink: { fontSize: 13, color: '#2874f0' },
  breadcrumbSep: { fontSize: 13, color: '#888', marginHorizontal: 2 },
  breadcrumbCurrent: { fontSize: 13, color: '#444', fontWeight: '500' },

  // Body Layout
  body: { flex: 1, flexDirection: 'row' },

  // Sidebar
  sidebar: {
    width: 160,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e8e8e8',
    paddingTop: 16,
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 0.3,
  },
  priceFilterContent: { marginTop: 10 },
  priceRange: { fontSize: 13, color: '#212121', fontWeight: '600', marginBottom: 10 },
  sliderTrack: {
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    position: 'relative',
    marginTop: 4,
  },
  sliderFill: {
    height: 4,
    backgroundColor: '#2874f0',
    borderRadius: 2,
    width: '15%',
  },
  sliderThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#2874f0',
    position: 'absolute',
    top: -6,
    left: '13%',
    elevation: 3,
    shadowColor: '#2874f0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },

  // Main Content
  mainContent: { flex: 1, backgroundColor: '#f5f5f5' },

  // Sort Row
  sortRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  popularityBtn: {
    backgroundColor: '#2874f0',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 4,
  },
  popularityBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  // Product Grid
  gridContainer: { padding: 10 },
  columnWrapper: { justifyContent: 'space-between' },

  productCard: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 12,
    marginBottom: 10,
    width: '48.5%',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#ebebeb',
  },
  imageWrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
  productImage: {
    width: '100%',
    height: 140,
    borderRadius: 2,
  },
  placeholderImage: {
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#212121',
    lineHeight: 18,
    marginBottom: 2,
  },
  brandSubtext: {
    fontSize: 11,
    color: '#878787',
    marginBottom: 6,
  },

  // Rating Badge (green pill like Flipkart)
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#388e3c',
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 6,
    gap: 3,
  },
  ratingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },

  // Price
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 4,
  },
  currentPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212121',
  },
  mrpText: {
    fontSize: 12,
    color: '#878787',
    textDecorationLine: 'line-through',
  },
  discountLabel: {
    fontSize: 12,
    color: '#388e3c',
    fontWeight: '600',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 12,
  },
});

