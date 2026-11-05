import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const hasValidKeys = Boolean(
  keyId &&
  keySecret &&
  keyId !== 'rzp_test_placeholder_key' &&
  keySecret !== 'rzp_secret_placeholder_key'
);

let razorpayInstance = null;

if (hasValidKeys) {
  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  } catch (err) {
    console.warn('[Razorpay] Failed to initialize live Razorpay instance:', err.message);
  }
}

export const isDemoPaymentMode = process.env.ENABLE_DEMO_PAYMENT !== 'false' || !hasValidKeys;

export const getRazorpayInstance = () => razorpayInstance;
