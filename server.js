const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());


// ===================== SUCCESS EMAIL =====================
app.post("/send-order-email", async (req, res) => {
  const { email, orderId, paymentId, amount } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "mayuribhoi2000@gmail.com",
        pass: "YOUR_GMAIL_APP_PASSWORD"
      }
    });

    await transporter.sendMail({
      from: "mayuribhoi2000@gmail.com",
      to: email,
      subject: "Order Confirmation 🎉",
      html: `
        <h2>Your Order is Confirmed!</h2>
        <p>Order ID: <b>${orderId}</b></p>
        <p>Payment ID: <b>${paymentId}</b></p>
        <p>Amount Paid: <b>₹${amount / 100}</b></p>
        <p>Thank you for shopping with us!</p>
      `
    });

    res.json({ success: true });

  } catch (error) {
    console.log(error);
    res.status(500).send("Success email failed");
  }
});


// ===================== FAILURE EMAIL =====================
app.post("/send-order-failure-email", async (req, res) => {
  const { email, orderId } = req.body;

  try {

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "mayuribhoi2000@gmail.com",
        pass: "YOUR_GMAIL_APP_PASSWORD"
      }
    });

    await transporter.sendMail({
      from: "mayuribhoi2000@gmail.com",
      to: email,
      subject: "Order Payment Failed ❌",
      html: `
        <h2>Oops! Your Order Payment Failed</h2>
        <p>Order ID: <b>${orderId}</b></p>
        <p>Please try again or contact support.</p>
      `
    });

    res.json({ success: true });

  } catch (error) {
    console.log(error);
    res.status(500).send("Failure email failed");
  }
});


// ===================== SHIPROCKET LOGIN =====================
app.get("/shiprocket-login", async (req, res) => {

  try {

    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        email: "mayuribhoi2000@gmail.com",
        password: "Mayuri@1999"
      }
    );

    res.json(response.data);

  } catch (error) {

    console.log(error.response?.data || error.message);
    res.status(500).json({
      message: "Shiprocket login failed"
    });

  }

});


// ===================== CREATE SHIPROCKET ORDER =====================
app.post("/create-shiprocket-order", async (req, res) => {

  const { token } = req.body;

  try {

    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      {

        order_id: "ORD" + Date.now(),
        order_date: "2026-02-28",

        pickup_location: "home",

        billing_customer_name: "Mayuri",
        billing_last_name: "Bhoi",
        billing_address: "Parida Colony, Rasulgarh",
        billing_address_2: "Rasulgarh",

        billing_city: "Bhubaneswar",
        billing_pincode: "751010",
        billing_state: "Odisha",
        billing_country: "India",

        billing_email: "mayuribhoi109@gmail.com",
        billing_phone: "7504824875",

        shipping_is_billing: true,

        order_items: [
          {
            name: "Test Product",
            sku: "TEST123",
            units: 1,
            selling_price: 100
          }
        ],

        payment_method: "Prepaid",

        sub_total: 100,

        length: 10,
        breadth: 10,
        height: 10,
        weight: 0.5

      },

      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }

    );

    res.json(response.data);

  } catch (error) {

    console.log(error.response?.data || error.message);

    res.status(500).json({
      message: "Shiprocket order creation failed"
    });

  }

});


// ===================== START SERVER =====================
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});