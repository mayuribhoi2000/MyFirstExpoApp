import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const RESET_PASSWORD_API = 'https://clientbox.nuuqesystems.com/api/Product/ResetPassword';

interface UserProfile {
  name: string;
  phone: string;
  address: string;
  email: string;
  avatar?: string;
}

export default function ProfilePage() {
  const router = useRouter();

  const [user] = useState<UserProfile>({
    name: 'Mayuri',
    phone: '943993493',
    address: 'testing',
    email: 'mayuribhoi2000@gmail.com', // ✅ needed for password reset API
    avatar: '',
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  // ✅ Reset password using GET API: /ResetPassword?Email=...&NewPassword=...
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    try {
      setResetting(true);

      const url = `${RESET_PASSWORD_API}?Email=${encodeURIComponent(user.email)}&NewPassword=${encodeURIComponent(newPassword)}`;
      console.log('🔑 Reset Password URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      });

      const text = await response.text();
      console.log('📄 Reset Response:', text);

      let data: any;
      try { data = text ? JSON.parse(text) : {}; }
      catch { data = { rawText: text }; }

      const statusMsg = data.message || data.Message || data.statusMessage || data.status || '';
      const isSuccess =
        response.ok &&
        !statusMsg.toLowerCase().includes('fail') &&
        !statusMsg.toLowerCase().includes('error') &&
        !statusMsg.toLowerCase().includes('invalid');

      if (isSuccess) {
        Alert.alert('✅ Success', 'Your password has been changed successfully!', [
          {
            text: 'OK',
            onPress: () => {
              setModalVisible(false);
              setNewPassword('');
              setConfirmPassword('');
            },
          },
        ]);
      } else {
        Alert.alert(
          '❌ Failed',
          statusMsg || `Server returned status ${response.status}. Please try again.`
        );
      }
    } catch (error: any) {
      console.error('❌ Reset Password Error:', error);
      Alert.alert('❌ Network Error', error.message || 'Please check your connection and try again.');
    } finally {
      setResetting(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          router.replace('/index(home)');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f6fa" />

      {/* TOP NAVIGATION BAR */}
      <View style={styles.navbar}>
        <Image
          source={{ uri: 'https://via.placeholder.com/120x40/000000/ffffff?text=LOGO' }}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for Products, Brands and More"
            placeholderTextColor="#999"
          />
          <Ionicons name="search" size={20} color="#666" />
        </View>
        <View style={styles.navRight}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/')}>
            <Ionicons name="home" size={20} color="#2c7da0" />
            <Text style={styles.navLabel}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="heart" size={20} color="#e53935" />
            <Text style={styles.navLabel}>Wishlist</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <View style={styles.cartWrapper}>
              <Ionicons name="cart" size={20} color="#2c7da0" />
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>1</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="person" size={20} color="#2c7da0" />
            <Text style={[styles.navLabel, { color: '#2c7da0', fontWeight: '700' }]}>
              {user.name}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SECOND NAV BAR */}
      <View style={styles.secondNav}>
        <TouchableOpacity style={styles.browseBtn}>
          <Ionicons name="grid" size={16} color="#fff" />
          <Text style={styles.browseBtnText}>Browse All Categories</Text>
          <Ionicons name="chevron-down" size={16} color="#fff" />
        </TouchableOpacity>
        <View style={styles.navLinks}>
          {['Home', 'About', 'Products', 'Contact Us'].map((link) => (
            <TouchableOpacity key={link} style={styles.navLinkItem}>
              <Text style={styles.navLinkText}>{link}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.supportBox}>
          <Ionicons name="headset" size={28} color="#2c7da0" />
          <View style={styles.supportText}>
            <Text style={styles.supportPhone}>+91 9474524296</Text>
            <Text style={styles.supportLabel}>24/7 Support Center</Text>
          </View>
        </View>
      </View>

      {/* PROFILE CARD */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.avatarWrapper}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={52} color="#fff" />
              </View>
            )}
          </View>

          <Text style={styles.userName}>{user.name}</Text>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email: </Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone: </Text>
            <Text style={styles.infoValue}>{user.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address: </Text>
            <Text style={styles.infoValue}>{user.address}</Text>
          </View>

          <TouchableOpacity
            style={styles.changePasswordBtn}
            activeOpacity={0.8}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="lock-closed-outline" size={16} color="#2979ff" />
            <Text style={styles.changePasswordText}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color="#e53935" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* CHANGE PASSWORD MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={22} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Email display — read only */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Account Email</Text>
              <View style={[styles.inputRow, { backgroundColor: '#f5f5f5' }]}>
                <Ionicons name="mail-outline" size={16} color="#999" style={{ marginRight: 8 }} />
                <Text style={{ flex: 1, fontSize: 14, color: '#888' }}>{user.email}</Text>
              </View>
            </View>

            {/* New Password */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter new password"
                  placeholderTextColor="#bbb"
                  secureTextEntry={!showNew}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                  <Ionicons name={showNew ? 'eye-off' : 'eye'} size={20} color="#999" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Confirm new password"
                  placeholderTextColor="#bbb"
                  secureTextEntry={!showConfirm}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                  <Ionicons name={showConfirm ? 'eye-off' : 'eye'} size={20} color="#999" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeModal} disabled={resetting}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, resetting && { opacity: 0.7 }]}
                onPress={handleChangePassword}
                disabled={resetting}
              >
                {resetting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitText}>Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  navbar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#eee', gap: 12,
  },
  logo: { width: 80, height: 36 },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f5f6fa', borderRadius: 8, borderWidth: 1,
    borderColor: '#e0e0e0', paddingHorizontal: 12, height: 40,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#333' },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  navItem: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  navLabel: { fontSize: 13, color: '#444' },
  cartWrapper: { position: 'relative' },
  cartBadge: {
    position: 'absolute', top: -6, right: -8, backgroundColor: '#e53935',
    borderRadius: 10, minWidth: 16, height: 16,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3,
  },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  secondNav: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#eee', gap: 16,
  },
  browseBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#e53935',
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 6, gap: 8,
  },
  browseBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  navLinks: { flex: 1, flexDirection: 'row', gap: 20 },
  navLinkItem: { paddingVertical: 4 },
  navLinkText: { fontSize: 14, color: '#333', fontWeight: '500' },
  supportBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  supportText: {},
  supportPhone: { fontSize: 15, fontWeight: '700', color: '#2c7da0' },
  supportLabel: { fontSize: 11, color: '#666' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40, paddingHorizontal: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 32,
    alignItems: 'center', width: '100%', maxWidth: 420,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  avatarWrapper: { marginBottom: 16 },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  avatarPlaceholder: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#2979ff', justifyContent: 'center', alignItems: 'center',
  },
  userName: { fontSize: 22, fontWeight: '700', color: '#2979ff', marginBottom: 16 },
  divider: { width: '100%', height: 1, backgroundColor: '#f0f0f0', marginBottom: 20 },
  infoRow: { flexDirection: 'row', alignSelf: 'flex-start', marginBottom: 14 },
  infoLabel: { fontSize: 15, fontWeight: '700', color: '#333' },
  infoValue: { fontSize: 15, color: '#555' },
  changePasswordBtn: {
    marginTop: 20, width: '100%', borderWidth: 1.5, borderColor: '#2979ff',
    borderRadius: 8, paddingVertical: 13, alignItems: 'center',
    backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'center', gap: 8,
  },
  changePasswordText: { color: '#2979ff', fontSize: 15, fontWeight: '600' },
  logoutBtn: {
    marginTop: 12, width: '100%', flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 6,
    paddingVertical: 12, borderRadius: 8, borderWidth: 1.5, borderColor: '#e53935',
  },
  logoutText: { color: '#e53935', fontSize: 15, fontWeight: '600' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 24,
    width: '100%', maxWidth: 400,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  inputWrapper: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1.2,
    borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12,
    paddingVertical: 10, backgroundColor: '#fafafa',
  },
  textInput: { flex: 1, fontSize: 14, color: '#333' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 8,
    borderWidth: 1.2, borderColor: '#ddd', alignItems: 'center',
  },
  cancelText: { fontSize: 15, color: '#666', fontWeight: '600' },
  submitBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#2979ff', alignItems: 'center' },
  submitText: { fontSize: 15, color: '#fff', fontWeight: '700' },
});