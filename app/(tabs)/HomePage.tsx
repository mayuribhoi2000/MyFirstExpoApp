import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function C9() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>

        {/* 🔙 Back Button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}   // ✅ FIXED
        >
          <Feather name="arrow-left" size={22} color="#000" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>About Our Book Store</Text>

        <Text style={styles.description}>
          Welcome to <Text style={styles.bold}>ATAW</Text> – your one-stop online
          destination for all genres of books! We believe that every book opens
          a door to a new world of imagination, learning, and inspiration. Our
          mission is to make reading accessible, affordable, and convenient for
          everyone.
        </Text>

        <View style={styles.listItem}>
          <Feather name="check-circle" size={18} color="green" />
          <Text style={styles.listText}> Fast and secure delivery</Text>
        </View>

        <View style={styles.listItem}>
          <Feather name="check-circle" size={18} color="green" />
          <Text style={styles.listText}>
            {" "}Best price guarantee & exclusive offers
          </Text>
        </View>

        <View style={styles.listItem}>
          <Feather name="check-circle" size={18} color="green" />
          <Text style={styles.listText}>
            {" "}Wide range of categories from trusted publishers
          </Text>
        </View>

        <View style={styles.listItem}>
          <Feather name="check-circle" size={18} color="green" />
          <Text style={styles.listText}>
            {" "}Customer-friendly return and support
          </Text>
        </View>

        <Text style={styles.footerText}>
          Whether you're a passionate reader, student, teacher, or knowledge
          seeker — we are here to fuel your learning journey!
        </Text>

        {/* Contact Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/")} // ✅ Correct
        >
          <Text style={styles.buttonText}>Contact Us</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  card: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: "500",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
    marginBottom: 14,
  },
  bold: {
    fontWeight: "700",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  listText: {
    fontSize: 15,
    color: "#333",
  },
  footerText: {
    marginTop: 14,
    fontSize: 15,
    color: "#444",
  },
  
  button: {
    backgroundColor: "#1e88e5",
    marginTop: 18,
    paddingVertical: 12,
    borderRadius: 6,
    width: 130,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 15,
  },
});