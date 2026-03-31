import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    FlatList,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const orders = [
  {
    id: 1,
    orderNo: 'ORD123',
    tracking: 'TRK12345',
    date: '12 Mar 2026',
    delivery: '15 Mar 2026',
    payment: 'COD',
    amount: 500,
    deliveryCharge: 40,
    total: 540,
  },
];

export default function OrderListScreen() {
    const router = useRouter();
  const renderRow = ({ item, index }: any) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{index + 1}</Text>
      <Text style={styles.cell}>{item.orderNo}</Text>
      <Text style={styles.cell}>{item.tracking}</Text>
      <Text style={styles.cell}>{item.date}</Text>
      <Text style={styles.cell}>{item.delivery}</Text>
      <Text style={styles.cell}>{item.payment}</Text>
      <Text style={styles.cell}>₹{item.amount}</Text>
      <Text style={styles.cell}>₹{item.deliveryCharge}</Text>
      <Text style={styles.cell}>₹{item.total}</Text>

      <TouchableOpacity style={styles.actionBtn}>
        <Text style={styles.actionText}>View</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#e53935" barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.logo}>Browse All Categories</Text>

        <View style={styles.menu}>
          <Text style={styles.menuItem}>Home</Text>
          <Text style={styles.menuItem}>About</Text>
          <Text style={styles.menuItem}>Products</Text>
          <Text style={styles.menuItem}>Contact Us</Text>
        </View>

        <View style={styles.support}>
          <Ionicons name="headset" size={22} color="#000" />
          <Text style={styles.phone}>+91 9474524296</Text>
        </View>
      </View>

      {/* BREADCRUMB */}
      <View style={styles.breadcrumb}>
        <Text style={styles.breadcrumbText}>Home / Order List</Text>
      </View>

      {/* TABLE */}
      <View style={styles.tableContainer}>
        <ScrollView horizontal>
          <View>
            {/* HEADER ROW */}
            <View style={[styles.row, styles.headerRow]}>
              <Text style={styles.headerCell}>SL No</Text>
              <Text style={styles.headerCell}>Order No</Text>
              <Text style={styles.headerCell}>Tracking Number</Text>
              <Text style={styles.headerCell}>Order Date</Text>
              <Text style={styles.headerCell}>Expected Delivery</Text>
              <Text style={styles.headerCell}>Payment Mode</Text>
              <Text style={styles.headerCell}>Amount</Text>
              <Text style={styles.headerCell}>Delivery Charges</Text>
              <Text style={styles.headerCell}>Total Amount</Text>
              <Text style={styles.headerCell}>Action</Text>
            </View>

            {/* DATA */}
            <FlatList
              data={orders}
              renderItem={renderRow}
              keyExtractor={(item) => item.id.toString()}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  // HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff',
  },

  logo: {
    backgroundColor: '#e53935',
    color: '#fff',
    padding: 10,
    borderRadius: 6,
    fontWeight: 'bold',
  },

  menu: {
    flexDirection: 'row',
    gap: 20,
  },

  menuItem: {
    fontSize: 14,
    color: '#333',
  },

  support: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  phone: {
    fontWeight: 'bold',
  },

  // BREADCRUMB
  breadcrumb: {
    padding: 12,
  },

  breadcrumbText: {
    color: '#666',
  },

  // TABLE
  tableContainer: {
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 6,
    padding: 10,
    elevation: 2,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 10,
  },

  headerRow: {
    backgroundColor: '#f1f1f1',
  },

  cell: {
    width: 120,
    fontSize: 13,
    color: '#333',
  },

  headerCell: {
    width: 120,
    fontSize: 13,
    fontWeight: 'bold',
  },

  actionBtn: {
    backgroundColor: '#e53935',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },

  actionText: {
    color: '#fff',
    fontSize: 12,
  },
});