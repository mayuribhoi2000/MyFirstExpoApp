import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ── API URLs ──────────────────────────────────────────────────────────────
const LOGIN_API_URL          = "https://clientbox.nuuqesystems.com/api/ProcessLogin/ProcessLogin";
const RESET_PASSWORD_API_URL = "https://clientbox.nuuqesystems.com/api/Product/ResetPassword";
const OTP_API_URL            = "https://clientbox.nuuqesystems.com/api/Product/GenerateOTP";
const VERIFY_OTP_API_URL     = "https://clientbox.nuuqesystems.com/api/Product/VerifyOTP";

// ── Types ─────────────────────────────────────────────────────────────────
type ForgotStep = 'email' | 'otp' | 'newPassword' | 'done';

export default function LoginScreen() {
  const router = useRouter();

  // Login state
  const [username,  setUsername]  = useState("");
  const [password,  setPassword]  = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);

  // Forgot password state
  const [forgotModal,       setForgotModal]       = useState(false);
  const [forgotStep,        setForgotStep]        = useState<ForgotStep>('email');
  const [forgotEmail,       setForgotEmail]       = useState("");
  const [forgotOtp,         setForgotOtp]         = useState("");
  const [newPassword,       setNewPassword]       = useState("");
  const [confirmPassword,   setConfirmPassword]   = useState("");
  const [showNewPass,       setShowNewPass]       = useState(false);
  const [showConfirmPass,   setShowConfirmPass]   = useState(false);
  const [forgotLoading,     setForgotLoading]     = useState(false);
  const [resendTimer,       setResendTimer]       = useState(0);

  // ── Resend countdown ──────────────────────────────────────────────────
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer(v => v - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  // ── Helpers ───────────────────────────────────────────────────────────
  const apiFetch = async (url: string, options?: RequestInit) => {
    const ctrl = new AbortController();
    const tid  = setTimeout(() => ctrl.abort(), 15000);
    try {
      const res = await fetch(url, { ...options, signal: ctrl.signal });
      clearTimeout(tid);
      return res;
    } catch (e) { clearTimeout(tid); throw e; }
  };

  const resetForgotModal = () => {
    setForgotStep('email');
    setForgotEmail("");
    setForgotOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPass(false);
    setShowConfirmPass(false);
    setResendTimer(0);
  };

  const closeForgotModal = () => {
    setForgotModal(false);
    resetForgotModal();
  };

  // ── ✅ FIXED LOGIN — goes directly to home page on success ────────────
  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch(LOGIN_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          password: password.trim(),
        }),
      });

      const raw = await response.text();
      console.log("=== LOGIN DEBUG ===");
      console.log("HTTP Status:", response.status);
      console.log("Raw Response:", raw);
      console.log("==================");

      let data: any;
      try { data = JSON.parse(raw); } catch { data = { rawText: raw }; }

      // ── API returns: { userEmail, userName, mobileNo, retailerID,
      //                   retailerAddress, status: bool, message: string }
      if (response.ok && data?.status === true) {
        // ✅ Save user data
        const userData = {
          id:        data.retailerID      || 0,
          email:     data.userEmail       || "",
          name:      data.userName        || username.trim(),
          phone:     data.mobileNo        || "",
          address:   data.retailerAddress || "",
          username:  username.trim().toLowerCase(),
          token:     data.token || data.authToken || `temp_${Date.now()}`,
        };

        await AsyncStorage.setItem("user",      JSON.stringify(userData));
        await AsyncStorage.setItem("userToken", userData.token);

        // ✅ Navigate directly to homepage — NO modal, no extra tap
        // Update this path to match your actual home screen file name
        router.replace("/index(home)");

      } else {
        const msg = data?.message || data?.error || "Invalid username or password. Please try again.";
        Alert.alert("Login Failed", msg);
      }

    } catch (err: any) {
      Alert.alert(
        "Network Error",
        err.name === "AbortError"
          ? "Request timed out. Please check your connection."
          : err.message || "Could not connect to server."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── FORGOT PASSWORD — Step 1: Send OTP ───────────────────────────────
  const handleSendForgotOTP = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!forgotEmail.trim() || !emailRegex.test(forgotEmail.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setForgotLoading(true);
    try {
      const res = await apiFetch(
        `${OTP_API_URL}?Email=${encodeURIComponent(forgotEmail.trim().toLowerCase())}`,
        { method: "GET", headers: { Accept: "application/json" } }
      );
      const raw = await res.text();
      let data: any;
      try { data = JSON.parse(raw); } catch { data = { rawText: raw }; }

      if (res.ok) {
        setForgotStep('otp');
        setResendTimer(60);
        Alert.alert("OTP Sent", `A 6-digit code has been sent to:\n${forgotEmail}\n\nCheck your inbox and spam folder.`);
      } else {
        Alert.alert("Failed", data?.message || data?.error || `Server error ${res.status}. Make sure this email is registered.`);
      }
    } catch (err: any) {
      Alert.alert("Error", err.name === "AbortError" ? "Request timed out." : err.message || "Could not send OTP.");
    } finally {
      setForgotLoading(false);
    }
  };

  // ── FORGOT PASSWORD — Step 2: Verify OTP ─────────────────────────────
  const handleVerifyForgotOTP = async () => {
    if (!forgotOtp.trim() || forgotOtp.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter the 6-digit code.");
      return;
    }

    setForgotLoading(true);
    try {
      const res = await apiFetch(
        `${VERIFY_OTP_API_URL}?Email=${encodeURIComponent(forgotEmail.trim().toLowerCase())}&OTP=${encodeURIComponent(forgotOtp)}`,
        { method: "GET", headers: { Accept: "application/json" } }
      );
      const raw = await res.text();
      let data: any;
      try { data = JSON.parse(raw); } catch { data = { rawText: raw }; }

      if (res.ok) {
        setForgotStep('newPassword');
      } else {
        Alert.alert("Wrong OTP", data?.message || "Incorrect code. Please try again.");
        setForgotOtp("");
      }
    } catch (err: any) {
      Alert.alert("Error", err.name === "AbortError" ? "Timed out." : err.message || "Verification failed.");
    } finally {
      setForgotLoading(false);
    }
  };

  // ── FORGOT PASSWORD — Step 3: Reset Password ─────────────────────────
  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Mismatch", "Passwords do not match.");
      return;
    }

    setForgotLoading(true);
    try {
      const res = await apiFetch(
        `${RESET_PASSWORD_API_URL}?Email=${encodeURIComponent(forgotEmail.trim().toLowerCase())}&NewPassword=${encodeURIComponent(newPassword)}`,
        { method: "GET", headers: { Accept: "application/json" } }
      );
      const raw = await res.text();
      let data: any;
      try { data = JSON.parse(raw); } catch { data = { rawText: raw }; }

      if (res.ok) {
        setForgotStep('done');
      } else {
        Alert.alert("Failed", data?.message || data?.error || `Server error ${res.status}. Please try again.`);
      }
    } catch (err: any) {
      Alert.alert("Error", err.name === "AbortError" ? "Timed out." : err.message || "Reset failed.");
    } finally {
      setForgotLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <View style={s.bg}>
      <View style={s.blobTL} />
      <View style={s.blobBR} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.card}>

            <View style={s.iconWrap}>
              <Ionicons name="storefront-outline" size={40} color="#3182ce" />
            </View>

            <Text style={s.title}>Welcome Back</Text>
            <Text style={s.subtitle}>Sign in to your account</Text>

            {/* Username */}
            <Text style={s.label}>Username</Text>
            <TextInput
              style={s.input}
              placeholder="Enter your username"
              placeholderTextColor="#a0aec0"
              value={username}
              onChangeText={t => setUsername(t.replace(/\s/g, "").toLowerCase())}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Password */}
            <Text style={s.label}>Password</Text>
            <View style={s.passRow}>
              <TextInput
                style={[s.input, { flex: 1, marginBottom: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRightWidth: 0 }]}
                placeholder="Enter your password"
                placeholderTextColor="#a0aec0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                autoCapitalize="none"
              />
              <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPass(p => !p)}>
                <Text style={s.eyeIcon}>{showPass ? "🙈" : "👁️"}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={s.forgotRow} onPress={() => setForgotModal(true)}>
              <Text style={s.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.loginBtn, loading && s.btnOff]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.loginBtnText}>Sign In</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity style={s.signupRow} onPress={() => router.push("./C1")}>
              <Text style={s.signupText}>
                Don't have an account?{"  "}
                <Text style={s.signupLink}>Sign up</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Forgot Password Modal ── */}
      <Modal visible={forgotModal} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.modal}>

            {forgotStep !== 'done' && (
              <TouchableOpacity style={s.closeBtn} onPress={closeForgotModal}>
                <Ionicons name="close" size={22} color="#718096" />
              </TouchableOpacity>
            )}

            {/* Step 1 — Enter Email */}
            {forgotStep === 'email' && (
              <>
                <View style={s.modalIconWrap}>
                  <Ionicons name="lock-open-outline" size={40} color="#3182ce" />
                </View>
                <Text style={s.modalTitle}>Forgot Password?</Text>
                <Text style={s.modalSub}>
                  Enter your registered email and we'll send you an OTP to reset your password.
                </Text>
                <TextInput
                  style={[s.input, { width: "100%", marginTop: 12 }]}
                  placeholder="Enter your email"
                  placeholderTextColor="#a0aec0"
                  value={forgotEmail}
                  onChangeText={setForgotEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={[s.loginBtn, { width: "100%", marginTop: 8 }, forgotLoading && s.btnOff]}
                  onPress={handleSendForgotOTP}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.loginBtnText}>Send OTP</Text>}
                </TouchableOpacity>
              </>
            )}

            {/* Step 2 — Enter OTP */}
            {forgotStep === 'otp' && (
              <>
                <View style={s.modalIconWrap}>
                  <Ionicons name="mail-open-outline" size={40} color="#3182ce" />
                </View>
                <Text style={s.modalTitle}>Check Your Email</Text>
                <View style={s.emailBadge}>
                  <Text style={s.emailBadgeText}>{forgotEmail}</Text>
                </View>
                <Text style={s.modalSub}>Enter the 6-digit code sent to your inbox</Text>
                <TextInput
                  style={[s.otpInput, { marginTop: 12 }]}
                  placeholder="• • • • • •"
                  placeholderTextColor="#c7d2db"
                  value={forgotOtp}
                  onChangeText={setForgotOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />
                <TouchableOpacity
                  style={[s.loginBtn, { width: "100%", marginTop: 8 }, (!forgotOtp || forgotOtp.length !== 6 || forgotLoading) && s.btnOff]}
                  onPress={handleVerifyForgotOTP}
                  disabled={!forgotOtp || forgotOtp.length !== 6 || forgotLoading}
                >
                  {forgotLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.loginBtnText}>Verify OTP</Text>}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.resendRow, resendTimer > 0 && { opacity: 0.4 }]}
                  onPress={() => { if (resendTimer <= 0) { setForgotOtp(""); handleSendForgotOTP(); } }}
                  disabled={resendTimer > 0}
                >
                  <Text style={s.resendText}>
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setForgotStep('email'); setForgotOtp(""); }}>
                  <Text style={s.backText}>← Change email</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Step 3 — New Password */}
            {forgotStep === 'newPassword' && (
              <>
                <View style={s.modalIconWrap}>
                  <Ionicons name="key-outline" size={40} color="#3182ce" />
                </View>
                <Text style={s.modalTitle}>Set New Password</Text>
                <Text style={s.modalSub}>Choose a strong password for your account.</Text>

                <Text style={[s.label, { alignSelf: "flex-start", marginTop: 12 }]}>New Password</Text>
                <View style={[s.passRow, { width: "100%" }]}>
                  <TextInput
                    style={[s.input, { flex: 1, marginBottom: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRightWidth: 0 }]}
                    placeholder="Min. 6 characters"
                    placeholderTextColor="#a0aec0"
                    secureTextEntry={!showNewPass}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity style={s.eyeBtn} onPress={() => setShowNewPass(p => !p)}>
                    <Text style={s.eyeIcon}>{showNewPass ? "🙈" : "👁️"}</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ height: 10 }} />

                <Text style={[s.label, { alignSelf: "flex-start" }]}>Confirm Password</Text>
                <View style={[s.passRow, { width: "100%" }]}>
                  <TextInput
                    style={[s.input, { flex: 1, marginBottom: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRightWidth: 0 }]}
                    placeholder="Re-enter password"
                    placeholderTextColor="#a0aec0"
                    secureTextEntry={!showConfirmPass}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity style={s.eyeBtn} onPress={() => setShowConfirmPass(p => !p)}>
                    <Text style={s.eyeIcon}>{showConfirmPass ? "🙈" : "👁️"}</Text>
                  </TouchableOpacity>
                </View>

                {confirmPassword.length > 0 && (
                  <Text style={[s.matchText, { color: newPassword === confirmPassword ? "#38a169" : "#e53e3e" }]}>
                    {newPassword === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                  </Text>
                )}

                <TouchableOpacity
                  style={[s.loginBtn, { width: "100%", marginTop: 14 }, forgotLoading && s.btnOff]}
                  onPress={handleResetPassword}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.loginBtnText}>Reset Password</Text>}
                </TouchableOpacity>
              </>
            )}

            {/* Step 4 — Done */}
            {forgotStep === 'done' && (
              <>
                <Ionicons name="checkmark-circle" size={64} color="#38a169" />
                <Text style={[s.modalTitle, { color: "#38a169" }]}>Password Reset!</Text>
                <Text style={s.modalSub}>
                  Your password has been updated.{"\n"}Please sign in with your new password.
                </Text>
                <TouchableOpacity
                  style={[s.loginBtn, { backgroundColor: "#38a169", width: "100%", marginTop: 14 }]}
                  onPress={() => { closeForgotModal(); setPassword(""); }}
                >
                  <Text style={s.loginBtnText}>Back to Sign In</Text>
                </TouchableOpacity>
              </>
            )}

          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#2d8fce" },

  blobTL: {
    position: "absolute", top: -100, left: -100,
    width: 320, height: 320, borderRadius: 160,
    backgroundColor: "#5ab5e8", opacity: 0.4,
  },
  blobBR: {
    position: "absolute", bottom: -120, right: -80,
    width: 360, height: 360, borderRadius: 180,
    backgroundColor: "#1a6fa8", opacity: 0.5,
  },

  scroll: {
    flexGrow: 1, alignItems: "center", justifyContent: "center",
    paddingVertical: 40, paddingHorizontal: 20,
  },

  card: {
    backgroundColor: "#fff", borderRadius: 12,
    paddingVertical: 34, paddingHorizontal: 28,
    width: "100%", maxWidth: 420,
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15, shadowRadius: 18, elevation: 12,
    alignItems: "center",
  },

  iconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "#ebf8ff",
    alignItems: "center", justifyContent: "center",
    marginBottom: 16,
  },

  title:    { fontSize: 26, fontWeight: "700", color: "#1a202c", textAlign: "center", marginBottom: 6 },
  subtitle: { fontSize: 15, color: "#718096", textAlign: "center", marginBottom: 24 },

  label: { alignSelf: "flex-start", fontSize: 14, fontWeight: "600", color: "#4a5568", marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 6,
    paddingVertical: 13, paddingHorizontal: 14,
    fontSize: 15, color: "#2d3748", backgroundColor: "#fff",
    marginBottom: 14, width: "100%",
  },

  passRow: { flexDirection: "row", alignItems: "center", width: "100%", marginBottom: 0 },
  eyeBtn: {
    paddingHorizontal: 13, paddingVertical: 13,
    borderWidth: 1, borderColor: "#e2e8f0",
    borderTopRightRadius: 6, borderBottomRightRadius: 6,
    backgroundColor: "#fff",
  },
  eyeIcon: { fontSize: 17 },

  forgotRow: { alignSelf: "flex-end", marginTop: 8, marginBottom: 18 },
  forgotText: { fontSize: 14, color: "#3182ce", fontWeight: "600" },

  loginBtn: {
    backgroundColor: "#3182ce", borderRadius: 6,
    paddingVertical: 15, alignItems: "center",
    width: "100%", marginBottom: 4,
  },
  btnOff: { backgroundColor: "#a0aec0" },
  loginBtnText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.4 },

  signupRow: { marginTop: 18, alignItems: "center" },
  signupText: { fontSize: 14, color: "#4a5568" },
  signupLink: { color: "#3182ce", fontWeight: "700" },

  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center", alignItems: "center", paddingHorizontal: 20,
  },
  modal: {
    backgroundColor: "#fff", borderRadius: 14,
    padding: 28, width: "100%", maxWidth: 400, alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 20,
  },
  closeBtn: { position: "absolute", top: 14, right: 14, padding: 4 },
  modalIconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "#ebf8ff",
    alignItems: "center", justifyContent: "center", marginBottom: 14,
  },
  modalTitle: { fontSize: 22, fontWeight: "700", color: "#1a202c", textAlign: "center", marginTop: 8, marginBottom: 8 },
  modalSub:   { fontSize: 14, color: "#718096", textAlign: "center", lineHeight: 20 },

  emailBadge: {
    backgroundColor: "#ebf8ff", borderRadius: 20,
    paddingVertical: 6, paddingHorizontal: 16,
    marginTop: 10, borderWidth: 1, borderColor: "#bee3f8",
  },
  emailBadgeText: { fontSize: 13, color: "#2b6cb0", fontWeight: "600" },

  otpInput: {
    borderWidth: 2, borderColor: "#3182ce", borderRadius: 8,
    fontSize: 30, letterSpacing: 14, textAlign: "center",
    paddingVertical: 16, width: "100%",
    backgroundColor: "#fff", color: "#1a202c",
  },

  resendRow: { marginTop: 14, marginBottom: 10 },
  resendText: { color: "#3182ce", fontWeight: "600", fontSize: 14 },
  backText:   { color: "#718096", fontSize: 13 },
  matchText:  { alignSelf: "flex-start", fontSize: 13, fontWeight: "600", marginTop: 6 },
});