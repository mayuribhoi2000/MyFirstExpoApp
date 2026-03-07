import axios from "axios";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from "react-native";

const Register = () => {

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    username: "",
    password: "",
    email: "",
    address: "",
    state: "",
    district: "",
    pinCode: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {

    if (!formData.firstName || !formData.phone || !formData.password) {
      Alert.alert("Error", "Please fill required fields");
      return;
    }

    setLoading(true);

    try {

      const response = await axios.post(
        "https://clientbox.nuuqesystems.com/api/CustomerRegistration/RegisterCustomer",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response.data);

      Alert.alert("Success", "Registration Successful");

    } catch (error: any) {

      console.log(error);

      Alert.alert("Error", "Registration Failed");

    } finally {
      setLoading(false);
    }
  };

  const Input = (placeholder: string, field: string, secure = false) => (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      secureTextEntry={secure}
      value={(formData as any)[field]}
      onChangeText={(text) => updateField(field, text)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

        <Text style={styles.title}>Register</Text>

        {Input("First Name", "firstName")}
        {Input("Last Name", "lastName")}
        {Input("Phone No.", "phone")}
        {Input("Username", "username")}
        {Input("Password", "password", true)}
        {Input("Email", "email")}
        {Input("Address", "address")}
        {Input("Select a State", "state")}
        {Input("Select a district", "district")}
        {Input("Pin Code", "pinCode")}

        <TouchableOpacity style={styles.button} onPress={handleRegister}>

          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}

        </TouchableOpacity>

        <Text style={styles.loginText}>
          Already have an account? <Text style={styles.loginLink}>Log In</Text>
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
};

export default Register;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    backgroundColor: "#fff",
  },

  button: {
    backgroundColor: "#1e66dc",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  loginText: {
    textAlign: "center",
    marginTop: 20,
  },

  loginLink: {
    color: "#1e66dc",
    fontWeight: "bold",
  },
});