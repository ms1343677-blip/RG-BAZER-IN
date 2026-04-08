import axios from 'axios';

const UDDOKTAPAY_API_URL = 'https://sandbox.uddoktapay.com/api/checkout-v2'; // Use sandbox for now
const API_KEY = process.env.VITE_UDDOKTAPAY_API_KEY || 'YOUR_API_KEY';

export interface PaymentRequest {
  full_name: string;
  email: string;
  amount: number;
  metadata: {
    userId: string;
    orderId: string;
  };
  redirect_url: string;
  return_url: string;
  cancel_url: string;
}

export const createPayment = async (data: PaymentRequest) => {
  try {
    const response = await axios.post(UDDOKTAPAY_API_URL, data, {
      headers: {
        'RT-UDDOKTAPAY-API-KEY': API_KEY,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('UddoktaPay Error:', error);
    throw error;
  }
};
