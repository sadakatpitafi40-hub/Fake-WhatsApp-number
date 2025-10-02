const express = require("express");
const bodyParser = require("body-parser");
const twilio = require("twilio");

const app = express();
app.use(bodyParser.json());

// Twilio credentials (replace with your own)
const accountSid = "ACXXXXXXXXXXXXXXXXXXXXXXXX"; 
const authToken = "your_auth_token"; 
const client = new twilio(accountSid, authToken);

// Temporary store (use DB in production)
let otpStore = {};

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Step 1: Send OTP
app.post("/send-otp", async (req, res) => {
  const { phone } = req.body;
  const otp = generateOTP();
  otpStore[phone] = otp;

  try {
    await client.messages.create({
      body: `Your verification code is: ${otp}`,
      from: "+1234567890", // Twilio number
      to: phone,
    });
    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Step 2: Verify OTP
app.post("/verify-otp", (req, res) => {
  const { phone, otp } = req.body;

  if (otpStore[phone] && otpStore[phone] === otp) {
    delete otpStore[phone]; // clear after success
    res.json({ success: true, message: "✅ Phone verified" });
  } else {
    res.json({ success: false, message: "❌ Invalid OTP" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
