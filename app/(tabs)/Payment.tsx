import axios from "axios";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RazorpayCheckout from "react-native-razorpay";

interface RazorpaySuccess {
  razorpay_payment_id: string;
}

interface RazorpayError {
  code: number;
  description: string;
  metadata?: {
    payment_id?: string;
    method?: string;
  };
}

const PaymentScreen = () => {
  const router = useRouter();

  const totalAmount = 3; // ₹3
  const customerName = "Mayuri Bhoi";
  const customerEmail = "mayuribhoi2000@gmail.com";
  const customerPhone = "7504824875";
  const orderId = "ORD" + Math.floor(Math.random() * 1000000); // example order id

  const sendEmail = async (status: "success" | "failed", paymentId: string, paymentMode: string) => {
    try {
      await axios.post("http://localhost:5000/send-email", {
        customerName,
        customerEmail,
        orderId,
        amount: totalAmount,
        paymentId,
        paymentMode,
        status,
      });
      console.log(`Email sent for ${status} payment`);
    } catch (err) {
      console.error("Email sending failed:", err);
    }
  };

  const handlePayment = () => {
    const options = {
      description: "Book Purchase",
      currency: "INR",
      key: "rzp_live_Rrq6prNV94qYCi",
      amount: totalAmount * 100,
      name: "Book Store",
      prefill: {
        email: customerEmail,
        contact: customerPhone,
        name: customerName,
      },
      theme: { color: "#34C759" },
    };

    RazorpayCheckout.open(options)
      .then((data: RazorpaySuccess) => {
        console.log("Payment Success:", data);

        Alert.alert("Payment Successful", "Payment ID: " + data.razorpay_payment_id);

        // Send success email
        sendEmail("success", data.razorpay_payment_id, "UPI/Card/Wallet");

        // Navigate to success screen
        router.push({
          pathname: "/PaymentSuccess",
          params: {
            paymentId: data.razorpay_payment_id,
            amount: totalAmount.toString(),
            orderId,
          },
        });
      })
      .catch((error: RazorpayError) => {
        console.log("Payment Failed:", error);

        Alert.alert("Payment Failed", error.description);

        // Send failure email
        const failedPaymentId = error.metadata?.payment_id || "N/A";
        const paymentMode = error.metadata?.method || "N/A";
        sendEmail("failed", failedPaymentId, paymentMode);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment</Text>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>Order Total</Text>
        <Text style={styles.amount}>₹{totalAmount}</Text>
      </View>

      <Text style={styles.section}>Payment Method</Text>

      <View style={styles.methodBox}>
        <Text style={styles.methodText}>💳 Razorpay (UPI / Card / Wallet)</Text>
      </View>

      <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
        <Text style={styles.payText}>Pay ₹{totalAmount}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  summaryBox: { padding: 20, backgroundColor: "#F7F7F7", borderRadius: 10, marginBottom: 20 },
  summaryText: { fontSize: 16, color: "#666" },
  amount: { fontSize: 28, fontWeight: "bold" },
  section: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  methodBox: { padding: 16, borderWidth: 1, borderColor: "#ddd", borderRadius: 10, marginBottom: 20 },
  methodText: { fontSize: 16 },
  payButton: { backgroundColor: "#34C759", padding: 18, borderRadius: 10, alignItems: "center" },
  payText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
