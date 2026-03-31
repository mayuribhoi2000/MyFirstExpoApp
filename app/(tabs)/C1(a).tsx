import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const REGISTER_API_URL = "https://clientbox.nuuqesystems.com/api/Product/InsertUserDetails";
const OTP_API_URL = "https://clientbox.nuuqesystems.com/api/Product/GenerateOTP";
const VERIFY_OTP_API_URL = "https://clientbox.nuuqesystems.com/api/Product/VerifyOTP";
const STATE_API_URL = "https://clientbox.nuuqesystems.com/api/category/getstate";
const DISTRICT_API_URL = "https://clientbox.nuuqesystems.com/api/Category/GetDistrict";

interface UserDetails {
  fullName: string;
  contactPersonName: string;
  email: string;
  phone: string;
  gstCertificate: string;
  password: string;
  address: string;
  city: string;
  state: string;
  district: string;
  pincode: string;
}

interface StateOption {
  id: number;
  name: string;
}

interface DistrictOption {
  id: number;
  name: string;
}

export default function UserRegistrationScreen() {
  const router = useRouter();

  const [formData, setFormData] = useState<UserDetails>({
    fullName: "",
    contactPersonName: "",
    email: "",
    phone: "",
    gstCertificate: "",
    password: "",
    address: "",
    city: "",
    state: "",
    district: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(false);
  const [stateLoading, setStateLoading] = useState(true);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<'form' | 'otp' | 'verify'>('form');
  const [states, setStates] = useState<StateOption[]>([]);
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [selectedStateId, setSelectedStateId] = useState<number>(0);
  const [selectedStateName, setSelectedStateName] = useState<string>("");
  const [selectedDistrictId, setSelectedDistrictId] = useState<number>(0);
  const [selectedDistrictName, setSelectedDistrictName] = useState<string>("");
  const [resendCount, setResendCount] = useState(0);

  useEffect(() => {
    fetchStates();
  }, []);

  useEffect(() => {
    if (selectedStateId > 0) {
      fetchDistricts();
    } else {
      setDistricts([]);
      setSelectedDistrictId(0);
      setSelectedDistrictName("");
      setFormData(prev => ({ ...prev, district: "" }));
    }
  }, [selectedStateId]);

  const fetchStates = async () => {
    try {
      setStateLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(STATE_API_URL, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { rawText: await response.text() };
      }
      
      console.log("🔵 States Response:", data);
      
      if (response.ok) {
        const stateList: StateOption[] = Array.isArray(data) 
          ? data.map((item: any) => ({
              id: item.id || item.state_id || 1,
              name: item.name || item.state_name || item.state || ''
            }))
          : data.data 
          ? data.data.map((item: any) => ({
              id: item.id || item.state_id || 1,
              name: item.name || item.state_name || item.state || ''
            }))
          : [];
        
        setStates(stateList);
        if (stateList.length > 0) {
          setSelectedStateId(stateList[0].id);
          setSelectedStateName(stateList[0].name);
          setFormData(prev => ({ ...prev, state: stateList[0].name }));
        }
      }
    } catch (error: any) {
      console.error("🔴 States fetch error:", error);
    } finally {
      setStateLoading(false);
    }
  };

  const fetchDistricts = async () => {
    if (selectedStateId <= 0) return;
    
    try {
      setDistrictLoading(true);
      console.log("🔵 Fetching districts for state ID:", selectedStateId);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        `${DISTRICT_API_URL}?stateId=${selectedStateId}`,
        {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);
      
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { rawText: await response.text() };
      }
      
      console.log("🔵 Districts Response:", data);
      
      if (response.ok) {
        const districtList: DistrictOption[] = Array.isArray(data) 
          ? data.map((item: any) => ({
              id: item.id || item.district_id || 1,
              name: item.name || item.district_name || item.district || ''
            }))
          : data.data 
          ? data.data.map((item: any) => ({
              id: item.id || item.district_id || 1,
              name: item.name || item.district_name || item.district || ''
            }))
          : [];
        
        setDistricts(districtList);
        if (districtList.length > 0) {
          setSelectedDistrictId(districtList[0].id);
          setSelectedDistrictName(districtList[0].name);
          setFormData(prev => ({ ...prev, district: districtList[0].name }));
        }
      }
    } catch (error: any) {
      console.error("🔴 Districts fetch error:", error);
    } finally {
      setDistrictLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserDetails, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStateChange = (itemValue: number | string) => {
    const stateId = Number(itemValue) || 0;
    const selectedState = states.find(state => state.id === stateId);
    
    if (selectedState) {
      setSelectedStateId(stateId);
      setSelectedStateName(selectedState.name);
      setFormData(prev => ({ ...prev, state: selectedState.name }));
      setSelectedDistrictId(0);
      setSelectedDistrictName("");
      setFormData(prev => ({ ...prev, district: "" }));
    }
  };

  const handleDistrictChange = (itemValue: number | string) => {
    const districtId = Number(itemValue) || 0;
    const selectedDistrict = districts.find(district => district.id === districtId);
    
    if (selectedDistrict) {
      setSelectedDistrictId(districtId);
      setSelectedDistrictName(selectedDistrict.name);
      setFormData(prev => ({ ...prev, district: selectedDistrict.name }));
    }
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) return "Retailer name is required";
    if (!formData.contactPersonName.trim()) return "Contact person name is required";
    if (!formData.email.trim() || !formData.email.includes('@')) return "Valid email is required";
    if (!formData.phone.trim() || formData.phone.length < 10) return "Valid phone number is required";
    if (!formData.gstCertificate.trim()) return "GST certificate number is required";
    if (!formData.password || formData.password.length < 6) return "Password must be 6+ characters";
    if (selectedStateId <= 0) return "Please select a state";
    if (selectedDistrictId <= 0) return "Please select a district";
    if (!formData.pincode || formData.pincode.length !== 6) return "Pincode must be 6 digits";
    return null;
  };

  const resendOTP = async () => {
    setOtp("");
    setResendCount(prev => prev + 1);
    await sendOTP();
  };

  const sendOTP = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert("Validation Error", error);
      return;
    }

    try {
      setLoading(true);
      console.log("📧 SENDING OTP TO:", formData.email);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(
        `${OTP_API_URL}?Email=${encodeURIComponent(formData.email.trim().toLowerCase())}`,
        { 
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);
      const text = await response.text();
      let data;
      
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { rawText: text };
      }
      
      console.log("🔵 FULL OTP RESPONSE:", {
        status: response.status,
        ok: response.ok,
        data: data,
        email: formData.email
      });

      if (response.ok) {
        setOtpSent(true);
        setStep('otp');
        
        const possibleOtp = data.otp || data.OTP || data.code || data.Code || data.otpCode;
        
        Alert.alert(
          "✅ API Success!", 
          `Email: ${formData.email}\n\n📧 Check:\n• Inbox • Spam • Promotions\n\n⏳ Wait 5 mins\n\n${possibleOtp ? `🔑 API OTP: ${possibleOtp}` : ''}`,
          [
            { text: "OK" },
            { text: "🧪 Use Test OTP", onPress: () => {
              setOtp("123456");
            }}
          ]
        );
      } else {
        Alert.alert(
          "❌ API Error", 
          `Status: ${response.status}\n\n${JSON.stringify(data).substring(0, 200)}`
        );
      }
    } catch (error: any) {
      console.error("🔴 OTP Error:", error);
      Alert.alert("❌ Network Error", error.message || "Check internet");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      Alert.alert("Error", "Enter valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      console.log("🔍 VERIFYING OTP:", otp, "for email:", formData.email);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        `${VERIFY_OTP_API_URL}?Email=${encodeURIComponent(formData.email.trim().toLowerCase())}&OTP=${encodeURIComponent(otp)}`,
        { 
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);
      
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { rawText: await response.text() };
      }
      
      console.log("🔵 Verify Response:", data);
      
      if (response.ok) {
        setOtpVerified(true);
        setStep('verify');
        Alert.alert("✅ Success", `Email verified successfully!\n"${formData.email}"`);
      } else {
        Alert.alert("❌ Invalid OTP", data.message || data.error || data.rawText || "Try again or use test OTP");
        setOtp("");
      }
    } catch (error: any) {
      console.error("Verify Error:", error);
      Alert.alert("Error", "Verification failed. Use test OTP: 123456");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    console.log("🚀 SUBMIT STARTED");
    
    if (!otpVerified) {
      Alert.alert("Error", "Please verify OTP first");
      return;
    }

    setLoading(true);
    try {
      console.log("📤 Form Data:", formData);

      const payload = {
        retailer_name: formData.fullName.trim(),
        Retailer_contperson_name: formData.contactPersonName.trim(),
        retailer_Email: formData.email.trim().toLowerCase(),
        retailer_mob_number: formData.phone.trim(),
        retailer_addr: formData.address.trim() || "",
        retailer_usernm: formData.email.split("@")[0].trim(),
        retailer_password: formData.password,
        Retailer_GST_certificate: formData.gstCertificate.trim(),
        retailer_GST_no: formData.gstCertificate.trim(),
        retailer_alternative_mob_no: formData.phone.trim(),
        epmid: 1,
        retailer_Activestatus: "Active",
        state_id: selectedStateId || 1,
        district_id: selectedDistrictId || 1,
        pin_Code: formData.pincode.trim(),
        retailer_id: 0,
        city: formData.city.trim() || "",
        state: selectedStateName || "",
        district: selectedDistrictName || ""
      };

      console.log("✅ SENDING PAYLOAD:", JSON.stringify(payload, null, 2));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const response = await fetch(REGISTER_API_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      const text = await response.text();
      console.log("📄 Raw Response:", text);
      
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { rawText: text };
      }
      
      console.log("✅ SERVER RESPONSE:", data);
      
      if (response.status === 200 || response.status === 201 || response.ok) {
        const userData = {
          name: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          gst: formData.gstCertificate.trim(),
          city: formData.city.trim() || "",
          state: selectedStateName,
          district: selectedDistrictName,
          isVerified: true,
          isActive: true,
          timestamp: Date.now(),
          retailerId: data.retailer_id || data.id || Date.now(),
          username: formData.email.split("@")[0].trim()
        };

        const authToken = data.token || data.authToken || `temp_${Date.now()}`;
        
        await AsyncStorage.multiSet([
          ["userToken", authToken],
          ["user", JSON.stringify(userData)]
        ]);

        Alert.alert("🎉 Success", `Welcome ${userData.name}!\nRegistration completed!`, [
          { 
            text: "Continue", 
            onPress: () => router.replace("/index(home)")
          }
        ]);
        return;
      } else {
        Alert.alert("❌ Error", data.message || data.error || data.rawText || "Registration failed");
      }
    } catch (error: any) {
      console.error("❌ Registration Error:", error);
      Alert.alert("❌ Error", error.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setStep(step === 'otp' ? 'form' : 'otp');
    setOtp("");
    if (step === 'verify') setOtpVerified(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Retailer Registration</Text>
          
          {step === 'form' && (
            <View style={styles.section}>
              <TextInput 
                style={styles.input} 
                placeholder="Retailer Name *" 
                value={formData.fullName} 
                onChangeText={(v) => handleInputChange("fullName", v)}
              />
              <TextInput 
                style={styles.input} 
                placeholder="Contact Person Name *" 
                value={formData.contactPersonName} 
                onChangeText={(v) => handleInputChange("contactPersonName", v)}
              />
              <TextInput 
                style={styles.input} 
                placeholder="Phone * (10 digits)" 
                value={formData.phone} 
                onChangeText={(v) => handleInputChange("phone", v)}
                keyboardType="phone-pad"
                maxLength={10}
              />
              <TextInput 
                style={[styles.input, styles.emailInput]} 
                placeholder="Email * (will receive OTP)" 
                value={formData.email} 
                onChangeText={(v) => handleInputChange("email", v)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput 
                style={styles.input} 
                placeholder="GST Certificate Number *" 
                value={formData.gstCertificate} 
                onChangeText={(v) => handleInputChange("gstCertificate", v)}
              />
              <TextInput 
                style={styles.input} 
                placeholder="Password * (min 6 chars)" 
                secureTextEntry 
                value={formData.password} 
                onChangeText={(v) => handleInputChange("password", v)}
              />
              <TextInput 
                style={styles.input} 
                placeholder="Address (optional)" 
                value={formData.address} 
                onChangeText={(v) => handleInputChange("address", v)}
                multiline
              />
              <TextInput 
                style={styles.input} 
                placeholder="City (optional)" 
                value={formData.city} 
                onChangeText={(v) => handleInputChange("city", v)}
              />
              
              <View style={styles.selectContainer}>
                <Text style={styles.label}>State *</Text>
                {stateLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#3b82f6" />
                    <Text style={styles.loadingText}>Loading states...</Text>
                  </View>
                ) : (
                  <>
                    <View style={[styles.input, styles.pickerContainer]}>
                      <Picker
                        selectedValue={selectedStateId}
                        onValueChange={handleStateChange}
                        style={styles.picker}
                        dropdownIconColor="#3b82f6"
                      >
                        <Picker.Item label="Select State" value={0} />
                        {states.map((state) => (
                          <Picker.Item key={state.id} label={state.name} value={state.id} />
                        ))}
                      </Picker>
                    </View>
                    {selectedStateName ? (
                      <Text style={styles.selectedState}>Selected: {selectedStateName}</Text>
                    ) : null}
                  </>
                )}
              </View>

              <View style={styles.selectContainer}>
                <Text style={styles.label}>District *</Text>
                {districtLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#10b981" />
                    <Text style={styles.loadingText}>Loading districts...</Text>
                  </View>
                ) : selectedStateId > 0 ? (
                  <>
                    <View style={[styles.input, styles.pickerContainer]}>
                      <Picker
                        selectedValue={selectedDistrictId}
                        onValueChange={handleDistrictChange}
                        style={styles.picker}
                        dropdownIconColor="#10b981"
                      >
                        <Picker.Item label="Select District" value={0} />
                        {districts.map((district) => (
                          <Picker.Item key={district.id} label={district.name} value={district.id} />
                        ))}
                      </Picker>
                    </View>
                    {selectedDistrictName ? (
                      <Text style={styles.selectedDistrict}>Selected: {selectedDistrictName}</Text>
                    ) : null}
                  </>
                ) : (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Select state first</Text>
                  </View>
                )}
              </View>

              <TextInput 
                style={styles.input} 
                placeholder="Pincode * (6 digits)" 
                value={formData.pincode} 
                onChangeText={(v) => handleInputChange("pincode", v)}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
          )}

          {step === 'otp' && (
            <View style={styles.otpSection}>
              <Text style={styles.otpTitle}>Verify Email</Text>
              
              <View style={styles.emailDisplayBox}>
                <Text style={styles.emailLabel}>📧 OTP sent to:</Text>
                <Text style={styles.otpEmail}>{formData.email}</Text>
                <Text style={styles.emailStatus}>
                  Check inbox/spam/promotions • Wait 5 mins
                </Text>
              </View>
              
              <Text style={styles.otpInstruction}>Enter 6-digit code</Text>
              
              <TextInput 
                style={styles.otpInput} 
                placeholder="000000" 
                value={otp} 
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
              
              <TouchableOpacity 
                style={styles.testBtn} 
                onPress={() => {
                  setOtp("123456");
                  Alert.alert("🧪 Test OTP", "OTP field filled with: 123456\nNow click Verify OTP!");
                }}
              >
                <Text style={styles.testText}>🧪 Fill Test OTP: 123456</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.resendBtn, loading && styles.disabledBtn]} 
                onPress={resendOTP}
                disabled={loading}
              >
                <Text style={styles.resendText}>
                  {loading ? "Sending..." : `🔄 Resend OTP (${resendCount})`}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'verify' && (
            <View style={styles.successSection}>
              <Text style={styles.successTitle}>✅ Email Verified!</Text>
              <Text style={styles.successText}>Click below to complete registration</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.buttons}>
          {step === 'form' && (
            <TouchableOpacity 
              style={[
                styles.primaryBtn, 
                (loading || stateLoading || districtLoading || selectedStateId <= 0 || selectedDistrictId <= 0) && styles.disabledBtn
              ]} 
              onPress={sendOTP} 
              disabled={loading || stateLoading || districtLoading || selectedStateId <= 0 || selectedDistrictId <= 0}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>📧 Send OTP</Text>
              )}
            </TouchableOpacity>
          )}

          {step === 'otp' && (
            <>
              <TouchableOpacity 
                style={[styles.primaryBtn, (!otp || loading || otp.length !== 6) && styles.disabledBtn]} 
                onPress={verifyOTP} 
                disabled={!otp || loading || otp.length !== 6}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>✅ Verify OTP</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={goBack}>
                <Text style={styles.secondaryText}>← Back to Form</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 'verify' && (
            <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>🎉 Complete Registration</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f3f4f6",
    justifyContent: 'center',
    alignItems: 'center'
  },
  scroll: { 
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 100,
    width: '100%',
    maxWidth: 450
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginBottom: 30,
    color: "#1f2937"
  },
  section: { 
    gap: 12,
    width: '100%',
    maxWidth: 400
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
    fontSize: 16,
    color: "#1f2937",
    width: '100%'
  },
  emailInput: {
    backgroundColor: "#eff6ff",
    borderColor: "#3b82f6"
  },
  selectContainer: { 
    marginTop: 8,
    width: '100%'
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginLeft: 4
  },
  pickerContainer: { 
    justifyContent: 'center',
    width: '100%'
  },
  picker: { height: 50, color: "#1f2937" },
  selectedState: {
    fontSize: 14,
    color: "#059669",
    marginTop: 4,
    marginLeft: 4,
    fontWeight: "500"
  },
  selectedDistrict: {
    fontSize: 14,
    color: "#10b981",
    marginTop: 4,
    marginLeft: 4,
    fontWeight: "500"
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    width: '100%'
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#3b82f6",
    fontWeight: "500"
  },
  otpSection: {
    backgroundColor: "#eff6ff",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#3b82f6",
    marginBottom: 20,
    width: '100%',
    maxWidth: 400
  },
  otpTitle: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#1d4ed8",
    marginBottom: 20 
  },
  emailDisplayBox: {
    backgroundColor: "#dbeafe",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#60a5fa",
    minHeight: 80,
    width: '100%'
  },
  emailLabel: {
    fontSize: 15,
    color: "#1e40af",
    fontWeight: "600",
    marginBottom: 5
  },
  otpEmail: { 
    fontSize: 18, 
    fontWeight: "bold",
    color: "#1e40af", 
    letterSpacing: 0.5,
    marginBottom: 5
  },
  emailStatus: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    fontStyle: "italic"
  },
  otpInstruction: {
    fontSize: 16,
    color: "#374151",
    textAlign: "center",
    marginBottom: 25,
    fontWeight: "500"
  },
  otpInput: {
    borderWidth: 3,
    borderColor: "#3b82f6",
    padding: 25,
    borderRadius: 12,
    fontSize: 28,
    letterSpacing: 10,
    width: "100%",
    textAlign: "center",
    backgroundColor: "#fff",
    marginBottom: 15
  },
  testBtn: {
    backgroundColor: "#fef3c7",
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#f59e0b",
    marginBottom: 15,
    alignItems: "center",
    width: '100%'
  },
  testText: {
    color: "#d97706",
    fontWeight: "bold",
    fontSize: 16
  },
  resendBtn: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: "#eff6ff",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#3b82f6",
    alignItems: "center",
    width: '100%'
  },
  resendText: {
    color: "#3b82f6",
    fontWeight: "600",
    fontSize: 16
  },
  successSection: {
    backgroundColor: "#ecfdf5",
    padding: 40,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#10b981",
    width: '100%',
    maxWidth: 400
  },
  successTitle: { fontSize: 26, fontWeight: "bold", color: "#059669" },
  successText: { fontSize: 16, color: "#047857", marginTop: 10 },
  buttons: { 
    padding: 25, 
    gap: 15,
    backgroundColor: "#fff",
    width: '100%',
    maxWidth: 450,
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20
  },
  primaryBtn: {
    backgroundColor: "#3b82f6",
    padding: 20,
    borderRadius: 12,
    alignItems: "center"
  },
  disabledBtn: { backgroundColor: "#9ca3af" },
  secondaryBtn: {
    backgroundColor: "#f3f4f6",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db"
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  secondaryText: { color: "#3b82f6", fontWeight: "600", fontSize: 16 }
});
