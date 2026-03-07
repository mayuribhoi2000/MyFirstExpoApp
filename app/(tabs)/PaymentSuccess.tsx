import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PaymentDetails {
  id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  order_id: string;
  created_at: number;
  email: string;
  contact: string;

  upi?: {
    vpa: string;
  };

  card?: {
    network: string;
    last4: string;
    expiry_month: number;
    expiry_year: number;
  };
}

const PaymentSuccess = () => {
  const router = useRouter();
  const { paymentId } = useLocalSearchParams<{ paymentId: string }>();

  const [details, setDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (paymentId) {
      fetchPaymentDetails(paymentId);
    }
  }, [paymentId]);

  const fetchPaymentDetails = async (id: string) => {
    try {
      const response = await fetch(`https://api.razorpay.com/v1/payments/${id}`, {
        method: "GET",
        headers: {
          Authorization:
            "Basic " +
            btoa("rzp_live_Rrq6prNV94qYCi:ypU20jFgv8b51VII3sqB060u"),
        },
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error.description);

      setDetails(data);
    } catch (error) {
      console.log("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#34C759" />
        <Text style={styles.loadingText}>Loading payment details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.successContainer}>
        <Text style={styles.title}>Payment Successful 🎉</Text>

        {details && (
          <Text style={styles.thankyou}>
            Thank you for your purchase. Your order ID is {details.order_id}
          </Text>
        )}

        {details && (
          <View style={styles.detailsCard}>
            <Text style={styles.label}>Transaction ID</Text>
            <Text style={styles.value}>{details.id}</Text>

            <Text style={styles.label}>Order ID</Text>
            <Text style={styles.value}>{details.order_id}</Text>

            <Text style={styles.label}>Amount</Text>
            <Text style={styles.value}>
              ₹{(details.amount / 100).toFixed(2)}
            </Text>

            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{formatDate(details.created_at)}</Text>

            <Text style={styles.label}>Time</Text>
            <Text style={styles.value}>{details.method.toUpperCase()}</Text>

            <Text style={styles.label}>Payment Mode</Text>
            <Text style={styles.value}>{details.method.toUpperCase()}</Text>

            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>{details.status.toUpperCase()}</Text>

            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{details.email}</Text>

            <Text style={styles.label}>Contact</Text>
            <Text style={styles.value}>{details.contact}</Text>

            {/* UPI DETAILS */}
            {details.method === "upi" && details.upi && (
              <>
                <Text style={styles.label}>UPI ID</Text>
                <Text style={styles.value}>{details.upi.vpa}</Text>
              </>
            )}

            {/* CARD DETAILS */}
            {details.method === "card" && details.card && (
              <>
                <Text style={styles.label}>Card Network</Text>
                <Text style={styles.value}>{details.card.network}</Text>

                <Text style={styles.label}>Card Number</Text>
                <Text style={styles.value}>
                  **** **** **** {details.card.last4}
                </Text>

                <Text style={styles.label}>Expiry</Text>
                <Text style={styles.value}>
                  {details.card.expiry_month}/{details.card.expiry_year}
                </Text>
              </>
            )}
          </View>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/(tabs)")}
        >
          <Text style={styles.buttonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
    justifyContent: "center",
    alignItems: "center",
  },

  successContainer: {
    padding: 20,
    alignItems: "center",
    width: "90%",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#34C759",
    marginBottom: 10,
  },

  thankyou: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },

  detailsCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: "100%",
    elevation: 5,
    marginBottom: 20,
  },

  label: {
    fontSize: 15,
    color: "#777",
    marginTop: 10,
    fontWeight: "600",
  },

  value: {
    fontSize: 17,
    color: "#333",
    marginTop: 4,
  },

  button: {
    backgroundColor: "#34C759",
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 10,
  },

  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});

export default PaymentSuccess;
