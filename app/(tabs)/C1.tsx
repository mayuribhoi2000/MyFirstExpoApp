import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ── API URLs ──────────────────────────────────────────────────────────────
const REGISTER_API_URL   = "https://clientbox.nuuqesystems.com/api/Product/InsertUserDetails";
const OTP_API_URL        = "https://clientbox.nuuqesystems.com/api/Product/GenerateOTP";
const VERIFY_OTP_API_URL = "https://clientbox.nuuqesystems.com/api/Product/VerifyOTP";
const STATE_API_URL      = "https://clientbox.nuuqesystems.com/api/category/getstate";
const DISTRICT_API_URL   = "https://clientbox.nuuqesystems.com/api/Category/GetDistrict";

// ── Types ─────────────────────────────────────────────────────────────────
type Step = 'form' | 'otp' | 'done';

interface StateOption    { id: number; name: string; }
interface DistrictOption { id: number; name: string; }

export default function RegistrationScreen() {
  const router = useRouter();

  // ── Form fields ───────────────────────────────────────────────────────
  const [retailerName,   setRetailerName]   = useState("");
  const [contactPerson,  setContactPerson]  = useState("");
  const [username,       setUsername]       = useState("");
  const [email,          setEmail]          = useState("");
  const [phone,          setPhone]          = useState("");
  const [gst,            setGst]            = useState("");
  const [password,       setPassword]       = useState("");
  const [showPass,       setShowPass]       = useState(false);
  const [address,        setAddress]        = useState("");
  const [city,           setCity]           = useState("");
  const [pincode,        setPincode]        = useState("");

  // ── State / District ─────────────────────────────────────────────────
  const [states,               setStates]               = useState<StateOption[]>([]);
  const [districts,            setDistricts]            = useState<DistrictOption[]>([]);
  const [selectedStateId,      setSelectedStateId]      = useState(0);
  const [selectedStateName,    setSelectedStateName]    = useState("");
  const [selectedDistrictId,   setSelectedDistrictId]   = useState(0);
  const [selectedDistrictName, setSelectedDistrictName] = useState("");
  const [stateLoading,         setStateLoading]         = useState(true);
  const [districtLoading,      setDistrictLoading]      = useState(false);

  // ── OTP / Step ────────────────────────────────────────────────────────
  const [step,        setStep]        = useState<Step>('form');
  const [otp,         setOtp]         = useState("");
  const [loading,     setLoading]     = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // ── Countdown ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer(v => v - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  // ── Load states on mount ──────────────────────────────────────────────
  useEffect(() => { fetchStates(); }, []);

  // ── Load districts when state changes ────────────────────────────────
  useEffect(() => {
    if (selectedStateId > 0) {
      fetchDistricts(selectedStateId);
    } else {
      setDistricts([]);
      setSelectedDistrictId(0);
      setSelectedDistrictName("");
    }
  }, [selectedStateId]);

  // ── API helper ────────────────────────────────────────────────────────
  const apiFetch = async (url: string, options?: RequestInit) => {
    const ctrl = new AbortController();
    const tid  = setTimeout(() => ctrl.abort(), 15000);
    try {
      const res = await fetch(url, { ...options, signal: ctrl.signal });
      clearTimeout(tid);
      return res;
    } catch (e) { clearTimeout(tid); throw e; }
  };

  const fetchStates = async () => {
    try {
      setStateLoading(true);
      const res  = await apiFetch(STATE_API_URL, { method: "GET", headers: { Accept: "application/json" } });
      const data = await res.json();
      const list: StateOption[] = (Array.isArray(data) ? data : data?.data ?? []).map((item: any) => ({
        id:   item.stateId   || item.id   || item.state_id   || 0,
        name: item.stateName || item.name || item.state_name || item.state || "",
      }));
      setStates(list);
    } catch (e) {
      console.error("States error:", e);
      Alert.alert("Error", "Could not load states. Please check your connection.");
    } finally {
      setStateLoading(false);
    }
  };

  const fetchDistricts = async (stateId: number) => {
    try {
      setDistrictLoading(true);
      setDistricts([]);
      setSelectedDistrictId(0);
      setSelectedDistrictName("");
      const res  = await apiFetch(`${DISTRICT_API_URL}?stateId=${stateId}`, { method: "GET", headers: { Accept: "application/json" } });
      const data = await res.json();
      const list: DistrictOption[] = (Array.isArray(data) ? data : data?.data ?? []).map((item: any) => ({
        id:   item.districtId   || item.id   || item.district_id   || 0,
        name: item.districtName || item.name || item.district_name || item.district || "",
      }));
      setDistricts(list);
    } catch (e) {
      console.error("Districts error:", e);
      Alert.alert("Error", "Could not load districts.");
    } finally {
      setDistrictLoading(false);
    }
  };

  // ── Validation ────────────────────────────────────────────────────────
  const validate = (): string | null => {
    if (!retailerName.trim())                          return "Retailer name is required";
    if (!contactPerson.trim())                         return "Contact person name is required";
    if (!username.trim())                              return "Username is required";
    if (username.includes(" "))                        return "Username cannot contain spaces";
    if (!email.trim() || !email.includes("@"))         return "Valid email is required";
    if (!phone.trim() || phone.length < 10)            return "Valid 10-digit phone number is required";
    if (!gst.trim())                                   return "GST certificate number is required";
    if (!password || password.length < 6)              return "Password must be at least 6 characters";
    if (selectedStateId <= 0)                          return "Please select a state";
    if (selectedDistrictId <= 0)                       return "Please select a district";
    if (!pincode || pincode.length !== 6)              return "Pincode must be 6 digits";
    return null;
  };

  // ── Send OTP ──────────────────────────────────────────────────────────
  const handleSendOTP = async () => {
    const err = validate();
    if (err) { Alert.alert("Validation Error", err); return; }

    setLoading(true);
    try {
      const res = await apiFetch(
        `${OTP_API_URL}?Email=${encodeURIComponent(email.trim().toLowerCase())}`,
        { method: "GET", headers: { Accept: "application/json" } }
      );
      const raw = await res.text();
      console.log("OTP Response:", raw);

      if (res.ok) {
        setStep('otp');
        setResendTimer(60);
        Alert.alert("OTP Sent ✅", `A 6-digit code was sent to:\n${email}\n\nCheck inbox & spam.`);
      } else {
        Alert.alert("Failed", `Could not send OTP (${res.status}). Please check your email.`);
      }
    } catch (e: any) {
      Alert.alert("Error", e.name === "AbortError" ? "Request timed out." : e.message || "Network error.");
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP then Register ──────────────────────────────────────────
  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      Alert.alert("Error", "Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch(
        `${VERIFY_OTP_API_URL}?Email=${encodeURIComponent(email.trim().toLowerCase())}&OTP=${encodeURIComponent(otp)}`,
        { method: "GET", headers: { Accept: "application/json" } }
      );
      const raw = await res.text();
      console.log("Verify OTP Response:", raw);

      if (res.ok) {
        // OTP verified — now register
        await handleRegister();
      } else {
        let data: any;
        try { data = JSON.parse(raw); } catch { data = {}; }
        Alert.alert("Wrong OTP", data?.message || "Incorrect code. Please try again.");
        setOtp("");
        setLoading(false); // reset here since handleRegister won't run
      }
    } catch (e: any) {
      Alert.alert("Error", e.name === "AbortError" ? "Timed out." : e.message || "Verification failed.");
      setLoading(false);
    }
    // NOTE: setLoading(false) handled inside handleRegister's finally block
  };

  // ── Register ──────────────────────────────────────────────────────────
  const handleRegister = async () => {
    // loading is already true from handleVerifyOTP — no need to set again
    try {
      const payload = {
        retailer_name:               retailerName.trim(),
        Retailer_contperson_name:    contactPerson.trim(),
        retailer_Email:              email.trim().toLowerCase(),
        retailer_mob_number:         phone.trim(),
        retailer_addr:               address.trim() || "",
        retailer_usernm:             username.trim().toLowerCase(),
        retailer_password:           password,
        Retailer_GST_certificate:    gst.trim(),
        retailer_GST_no:             gst.trim(),
        retailer_alternative_mob_no: phone.trim(),
        epmid:                       1,
        retailer_Activestatus:       "Active",
        state_id:                    selectedStateId,
        district_id:                 selectedDistrictId,
        pin_Code:                    pincode.trim(),
        retailer_id:                 0,
        city:                        city.trim() || "",
        state:                       selectedStateName,
        district:                    selectedDistrictName,
      };

      console.log("Register Payload:", JSON.stringify(payload, null, 2));

      const res  = await apiFetch(REGISTER_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      const raw  = await res.text();
      console.log("Register Response:", raw);
      let data: any;
      try { data = JSON.parse(raw); } catch { data = { rawText: raw }; }

      if (res.ok) {
        // ✅ Save credentials so login screen can be used immediately
        const userData = {
          name:       retailerName.trim(),
          email:      email.trim().toLowerCase(),
          username:   username.trim().toLowerCase(),
          phone:      phone.trim(),
          state:      selectedStateName,
          district:   selectedDistrictName,
          retailerId: data?.retailer_id || data?.id || 0,
        };
        await AsyncStorage.setItem("user", JSON.stringify(userData));
        // Also save the username & password so the user knows their login creds
        await AsyncStorage.setItem("lastUsername", username.trim().toLowerCase());

        setStep('done');
      } else {
        Alert.alert(
          "Registration Failed",
          data?.message || data?.error || data?.rawText || `Server error ${res.status}. Please try again.`
        );
        setStep('otp'); // go back to OTP step so user can retry
      }
    } catch (e: any) {
      Alert.alert("Error", e.name === "AbortError" ? "Timed out." : e.message || "Registration failed.");
      setStep('otp');
    } finally {
      setLoading(false);
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

          {/* ── STEP INDICATOR ── */}
          <View style={s.stepRow}>
            {(['form', 'otp', 'done'] as Step[]).map((st, i) => {
              const isDone   = (st === 'form' && (step === 'otp' || step === 'done'))
                            || (st === 'otp'  && step === 'done');
              const isActive = step === st;
              return (
                <React.Fragment key={st}>
                  <View style={[s.stepDot, isActive && s.stepDotActive, isDone && s.stepDotDone]}>
                    <Text style={[s.stepNum, (isActive || isDone) && s.stepNumActive]}>
                      {isDone ? "✓" : i + 1}
                    </Text>
                  </View>
                  {i < 2 && (
                    <View style={[s.stepLine, isDone && s.stepLineDone]} />
                  )}
                </React.Fragment>
              );
            })}
          </View>
          <Text style={s.stepLabel}>
            {step === 'form' ? "Fill Details" : step === 'otp' ? "Verify Email" : "Registered!"}
          </Text>

          {/* ══════════════════════════════════════════════
              STEP 1 — FORM
          ══════════════════════════════════════════════ */}
          {step === 'form' && (
            <View style={s.card}>
              <View style={s.iconWrap}>
                <Ionicons name="storefront-outline" size={36} color="#3182ce" />
              </View>
              <Text style={s.cardTitle}>Retailer Registration</Text>
              <Text style={s.cardSub}>Create your account to get started</Text>

              <Text style={s.label}>Retailer / Shop Name *</Text>
              <TextInput style={s.input} placeholder="e.g. Sharma Traders" placeholderTextColor="#a0aec0"
                value={retailerName} onChangeText={setRetailerName} />

              <Text style={s.label}>Contact Person Name *</Text>
              <TextInput style={s.input} placeholder="e.g. Ramesh Sharma" placeholderTextColor="#a0aec0"
                value={contactPerson} onChangeText={setContactPerson} />

              <Text style={s.label}>
                Username * <Text style={s.labelHint}>(this is what you use to login)</Text>
              </Text>
              <TextInput
                style={[s.input, s.highlightInput]}
                placeholder="e.g. ramesh123"
                placeholderTextColor="#a0aec0"
                value={username}
                onChangeText={t => setUsername(t.replace(/\s/g, "").toLowerCase())}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={s.label}>
                Email * <Text style={s.labelHint}>(OTP will be sent here)</Text>
              </Text>
              <TextInput style={s.input} placeholder="e.g. ramesh@gmail.com" placeholderTextColor="#a0aec0"
                value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

              <Text style={s.label}>Phone Number * (10 digits)</Text>
              <TextInput style={s.input} placeholder="e.g. 9876543210" placeholderTextColor="#a0aec0"
                value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10} />

              <Text style={s.label}>GST Certificate Number *</Text>
              <TextInput style={s.input} placeholder="e.g. 22AAAAA0000A1Z5" placeholderTextColor="#a0aec0"
                value={gst} onChangeText={setGst} autoCapitalize="characters" />

              <Text style={s.label}>Password * (min 6 characters)</Text>
              <View style={s.passRow}>
                <TextInput
                  style={[s.input, { flex: 1, marginBottom: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRightWidth: 0 }]}
                  placeholder="Create a strong password"
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

              <Text style={[s.label, { marginTop: 14 }]}>Address (optional)</Text>
              <TextInput style={[s.input, { minHeight: 60 }]} placeholder="Shop address" placeholderTextColor="#a0aec0"
                value={address} onChangeText={setAddress} multiline />

              <Text style={s.label}>City (optional)</Text>
              <TextInput style={s.input} placeholder="e.g. Jaipur" placeholderTextColor="#a0aec0"
                value={city} onChangeText={setCity} />

              {/* State Picker */}
              <Text style={s.label}>State *</Text>
              {stateLoading ? (
                <View style={s.pickerLoading}>
                  <ActivityIndicator size="small" color="#3182ce" />
                  <Text style={s.pickerLoadingText}>Loading states...</Text>
                </View>
              ) : (
                <View style={s.pickerWrap}>
                  <Picker
                    selectedValue={selectedStateId}
                    onValueChange={(val) => {
                      const id    = Number(val);
                      const found = states.find(st => st.id === id);
                      setSelectedStateId(id);
                      setSelectedStateName(found?.name || "");
                    }}
                    style={s.picker}
                    dropdownIconColor="#3182ce"
                  >
                    <Picker.Item label="-- Select State --" value={0} />
                    {states.map(st => (
                      <Picker.Item key={st.id} label={st.name} value={st.id} />
                    ))}
                  </Picker>
                </View>
              )}
              {selectedStateName ? <Text style={s.selectedHint}>✓ {selectedStateName}</Text> : null}

              {/* District Picker */}
              <Text style={[s.label, { marginTop: 14 }]}>District *</Text>
              {districtLoading ? (
                <View style={s.pickerLoading}>
                  <ActivityIndicator size="small" color="#38a169" />
                  <Text style={[s.pickerLoadingText, { color: "#38a169" }]}>Loading districts...</Text>
                </View>
              ) : selectedStateId <= 0 ? (
                <View style={s.pickerLoading}>
                  <Text style={s.pickerLoadingText}>Select a state first</Text>
                </View>
              ) : (
                <View style={s.pickerWrap}>
                  <Picker
                    selectedValue={selectedDistrictId}
                    onValueChange={(val) => {
                      const id    = Number(val);
                      const found = districts.find(d => d.id === id);
                      setSelectedDistrictId(id);
                      setSelectedDistrictName(found?.name || "");
                    }}
                    style={s.picker}
                    dropdownIconColor="#38a169"
                  >
                    <Picker.Item label="-- Select District --" value={0} />
                    {districts.map(d => (
                      <Picker.Item key={d.id} label={d.name} value={d.id} />
                    ))}
                  </Picker>
                </View>
              )}
              {selectedDistrictName ? (
                <Text style={[s.selectedHint, { color: "#38a169" }]}>✓ {selectedDistrictName}</Text>
              ) : null}

              <Text style={[s.label, { marginTop: 14 }]}>Pincode * (6 digits)</Text>
              <TextInput style={s.input} placeholder="e.g. 302001" placeholderTextColor="#a0aec0"
                value={pincode} onChangeText={setPincode} keyboardType="number-pad" maxLength={6} />

              <TouchableOpacity
                style={[s.btn, (loading || stateLoading || selectedStateId <= 0 || selectedDistrictId <= 0) && s.btnOff]}
                onPress={handleSendOTP}
                disabled={loading || stateLoading || selectedStateId <= 0 || selectedDistrictId <= 0}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={s.btnText}>Send OTP →</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity style={s.loginRow} onPress={() => router.back()}>
                <Text style={s.loginText}>
                  Already have an account? <Text style={s.loginLink}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ══════════════════════════════════════════════
              STEP 2 — OTP
          ══════════════════════════════════════════════ */}
          {step === 'otp' && (
            <View style={s.card}>
              <View style={[s.iconWrap, { backgroundColor: "#ebf4ff" }]}>
                <Ionicons name="mail-open-outline" size={36} color="#3182ce" />
              </View>
              <Text style={s.cardTitle}>Verify Your Email</Text>

              <View style={s.emailBadge}>
                <Text style={s.emailBadgeText}>{email}</Text>
              </View>
              <Text style={s.cardSub}>Enter the 6-digit code sent to your inbox</Text>

              <TextInput
                style={s.otpInput}
                placeholder="• • • • • •"
                placeholderTextColor="#c7d2db"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />

              <TouchableOpacity
                style={[s.btn, (!otp || otp.length !== 6 || loading) && s.btnOff]}
                onPress={handleVerifyOTP}
                disabled={!otp || otp.length !== 6 || loading}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={s.btnText}>Verify & Register →</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.resendBtn, resendTimer > 0 && { opacity: 0.4 }]}
                onPress={() => { if (resendTimer <= 0) { setOtp(""); handleSendOTP(); } }}
                disabled={resendTimer > 0 || loading}
              >
                <Text style={s.resendText}>
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { setStep('form'); setOtp(""); }}>
                <Text style={s.backText}>← Change details</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ══════════════════════════════════════════════
              STEP 3 — SUCCESS
          ══════════════════════════════════════════════ */}
          {step === 'done' && (
            <View style={s.card}>
              <Ionicons name="checkmark-circle" size={72} color="#38a169" />
              <Text style={[s.cardTitle, { color: "#38a169", marginTop: 12 }]}>
                Registration Successful!
              </Text>
              <Text style={s.cardSub}>
                Your account is ready. Use the credentials below to sign in.
              </Text>

              <View style={s.credBox}>
                <Text style={s.credLabel}>Your Login Credentials</Text>
                <View style={s.credRow}>
                  <Text style={s.credKey}>Username</Text>
                  <Text style={s.credVal}>{username.trim().toLowerCase()}</Text>
                </View>
                <View style={s.credRow}>
                  <Text style={s.credKey}>Password</Text>
                  <Text style={s.credVal}>{"•".repeat(password.length)} (as entered)</Text>
                </View>
              </View>

              {/* ✅ FIX: Go directly to login without extra taps */}
              <TouchableOpacity
                style={[s.btn, { backgroundColor: "#38a169" }]}
                onPress={() => router.replace("./C3")}
              >
                <Text style={s.btnText}>Go to Login →</Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#2d8fce" },

  blobTL: {
    position: "absolute", top: -80, left: -80,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: "#5ab5e8", opacity: 0.4,
  },
  blobBR: {
    position: "absolute", bottom: -100, right: -60,
    width: 320, height: 320, borderRadius: 160,
    backgroundColor: "#1a6fa8", opacity: 0.5,
  },

  scroll: {
    flexGrow: 1, alignItems: "center",
    paddingVertical: 40, paddingHorizontal: 20,
  },

  stepRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  stepDot: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center", justifyContent: "center",
  },
  stepDotActive: { backgroundColor: "#fff" },
  stepDotDone:   { backgroundColor: "#38a169" },
  stepNum:       { fontSize: 14, fontWeight: "700", color: "rgba(255,255,255,0.7)" },
  stepNumActive: { color: "#3182ce" },
  stepLine:      { width: 48, height: 2, backgroundColor: "rgba(255,255,255,0.3)" },
  stepLineDone:  { backgroundColor: "#38a169" },
  stepLabel:     { color: "#fff", fontSize: 13, fontWeight: "600", marginBottom: 20, opacity: 0.9 },

  card: {
    backgroundColor: "#fff", borderRadius: 16,
    paddingVertical: 32, paddingHorizontal: 24,
    width: "100%", maxWidth: 440,
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 14,
    alignItems: "center",
  },

  iconWrap: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: "#ebf8ff",
    alignItems: "center", justifyContent: "center",
    marginBottom: 14,
  },

  cardTitle: { fontSize: 22, fontWeight: "700", color: "#1a202c", textAlign: "center", marginBottom: 4 },
  cardSub:   { fontSize: 14, color: "#718096", textAlign: "center", marginBottom: 20, lineHeight: 20 },

  label:     { alignSelf: "flex-start", fontSize: 13, fontWeight: "600", color: "#4a5568", marginBottom: 5, marginTop: 2 },
  labelHint: { fontWeight: "400", color: "#3182ce", fontSize: 12 },

  input: {
    borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 8,
    paddingVertical: 12, paddingHorizontal: 14,
    fontSize: 15, color: "#2d3748", backgroundColor: "#fff",
    marginBottom: 14, width: "100%",
  },
  highlightInput: { borderColor: "#3182ce", backgroundColor: "#ebf8ff" },

  passRow: { flexDirection: "row", alignItems: "center", width: "100%", marginBottom: 14 },
  eyeBtn: {
    paddingHorizontal: 12, paddingVertical: 12,
    borderWidth: 1.5, borderColor: "#e2e8f0",
    borderTopRightRadius: 8, borderBottomRightRadius: 8,
    backgroundColor: "#fff",
  },
  eyeIcon: { fontSize: 17 },

  pickerWrap: {
    borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 8,
    backgroundColor: "#fff", width: "100%", marginBottom: 4, overflow: "hidden",
  },
  picker: { height: 52, color: "#2d3748" },
  pickerLoading: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 8,
    padding: 14, backgroundColor: "#f7fafc", width: "100%", marginBottom: 4,
  },
  pickerLoadingText: { marginLeft: 8, fontSize: 14, color: "#718096" },
  selectedHint: { alignSelf: "flex-start", fontSize: 13, color: "#3182ce", fontWeight: "600", marginBottom: 4 },

  emailBadge: {
    backgroundColor: "#ebf8ff", borderRadius: 20,
    paddingVertical: 6, paddingHorizontal: 16,
    marginBottom: 12, borderWidth: 1, borderColor: "#bee3f8",
  },
  emailBadgeText: { fontSize: 14, color: "#2b6cb0", fontWeight: "600" },

  otpInput: {
    borderWidth: 2.5, borderColor: "#3182ce", borderRadius: 10,
    fontSize: 32, letterSpacing: 16, textAlign: "center",
    paddingVertical: 18, width: "100%",
    backgroundColor: "#fff", color: "#1a202c", marginBottom: 16,
  },

  resendBtn: { marginTop: 12, marginBottom: 10 },
  resendText: { color: "#3182ce", fontWeight: "600", fontSize: 14 },
  backText:   { color: "#718096", fontSize: 13, marginTop: 4 },

  credBox: {
    backgroundColor: "#f0fff4", borderRadius: 10,
    borderWidth: 1.5, borderColor: "#9ae6b4",
    padding: 18, width: "100%", marginBottom: 20, marginTop: 12,
  },
  credLabel: { fontSize: 13, fontWeight: "700", color: "#276749", marginBottom: 10 },
  credRow:   { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  credKey:   { fontSize: 14, color: "#4a5568", fontWeight: "600" },
  credVal:   { fontSize: 14, color: "#2d3748", fontWeight: "700" },

  btn: {
    backgroundColor: "#3182ce", borderRadius: 8,
    paddingVertical: 15, alignItems: "center",
    width: "100%", marginTop: 6, marginBottom: 4,
  },
  btnOff:  { backgroundColor: "#a0aec0" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.4 },

  loginRow:  { marginTop: 18, alignItems: "center" },
  loginText: { fontSize: 14, color: "#4a5568" },
  loginLink: { color: "#3182ce", fontWeight: "700" },
});