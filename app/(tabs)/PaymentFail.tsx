import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PaymentFail = () => {

  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>

        <Text style={styles.title}>Payment Failed ❌</Text>

        <Text style={styles.message}>
          Your payment could not be completed.
          Please try again.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/(tabs)")}
        >
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f6f8"
  },

  card: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 12,
    alignItems: "center",
    width: "85%"
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "red",
    marginBottom: 10
  },

  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20
  },

  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8
  },

  buttonText: {
    color: "white",
    fontSize: 16
  }
});

export default PaymentFail;