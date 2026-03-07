import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function ContactScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    console.log({
      name,
      email,
      mobile,
      message,
    });

    alert("Message Sent Successfully!");
  };

  return (
    <ScrollView style={styles.container}>

      {/* Page Title */}
      <Text style={styles.title}>Contact Us</Text>

      <View style={styles.row}>

        {/* LEFT SIDE INFO */}
        <View style={styles.leftBox}>

          <Text style={styles.heading}>Registered Office Address:</Text>

          <Text style={styles.text}>
            Chuanpur (Kadamtala), Berhampore, NEAR KALI MANDIR
          </Text>

          <Text style={styles.text}>
            Murshidabad, West Bengal
          </Text>

          <Text style={styles.text}>
            India - 742101
          </Text>

          <Text style={styles.heading}>Phone:</Text>
          <Text style={styles.link}>9474524296</Text>

          <Text style={styles.heading}>Email:</Text>
          <Text style={styles.link}>onlineataw@gmail.com</Text>

          <Text style={styles.text}>
            Feel free to fill out the form OR email us directly at:
          </Text>

          <Text style={styles.link}>onlineataw@gmail.com</Text>

          <Text style={styles.text}>
            OR call us directly at
          </Text>

          <Text style={styles.link}>9474524296</Text>

        </View>

        {/* RIGHT SIDE FORM */}

        <View style={styles.formBox}>

          <Text style={styles.formTitle}>Send us a Message</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            placeholder="Enter your name"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          <View style={styles.rowInputs}>

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                placeholder="Enter your email"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                placeholder="Enter your mobile number"
                style={styles.input}
                value={mobile}
                onChangeText={setMobile}
                keyboardType="phone-pad"
              />
            </View>

          </View>

          <Text style={styles.label}>Message</Text>

          <TextInput
            placeholder="Write your message"
            style={styles.textArea}
            value={message}
            onChangeText={setMessage}
            multiline
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Submit Message</Text>
          </TouchableOpacity>

        </View>

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  row: {
    flexDirection: "row",
    gap: 30,
  },

  leftBox: {
    flex: 1,
  },

  heading: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },

  text: {
    fontSize: 14,
    marginTop: 4,
  },

  link: {
    fontSize: 14,
    color: "#1e6bd6",
    marginTop: 4,
  },

  formBox: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    padding: 20,
    borderRadius: 10,
  },

  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  label: {
    fontSize: 14,
    marginTop: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 10,
    marginTop: 5,
    backgroundColor: "#fff",
  },

  rowInputs: {
    flexDirection: "row",
    gap: 10,
  },

  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 10,
    marginTop: 5,
    height: 100,
    backgroundColor: "#fff",
  },

  button: {
    backgroundColor: "#1e6bd6",
    padding: 14,
    borderRadius: 6,
    marginTop: 15,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

});