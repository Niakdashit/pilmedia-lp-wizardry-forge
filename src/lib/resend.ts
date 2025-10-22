
import { Resend } from 'resend';

// Validate API key presence and format
const apiKey = import.meta.env.VITE_RESEND_API_KEY;

if (!apiKey) {
  throw new Error('VITE_RESEND_API_KEY is not set in environment variables');
}

if (!apiKey.startsWith('re_')) {
  throw new Error('Invalid Resend API key format. API key should start with "re_"');
}

// Initialize Resend with better error handling
let resendInstance: Resend;
try {
  resendInstance = new Resend(apiKey);
} catch (error) {
  console.error('Failed to initialize Resend client:', error);
  throw new Error('Failed to initialize email service');
}

export const resend = resendInstance;
