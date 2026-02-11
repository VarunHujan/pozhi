import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env file
dotenv.config();

// Define the schema for environment variables
const envSchema = z.object({
  // Server Settings
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PAYMENT_MODE: z.enum(['mock', 'stripe', 'razorpay']).default('mock'),

  // Supabase
  SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  SUPABASE_ANON_KEY: z.string().min(20, 'Supabase anon key required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20, 'Supabase service role key required'),
  SUPABASE_BUCKET: z.string().default('customer-photos'),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'Invalid Stripe secret key'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_', 'Invalid webhook secret'),
  
  // Cloudflare R2
  R2_ENDPOINT: z.string().url('Invalid R2 endpoint'),
  R2_ACCESS_KEY_ID: z.string().min(10, 'R2 access key required'),
  R2_SECRET_ACCESS_KEY: z.string().min(10, 'R2 secret key required'),
  R2_BUCKET_NAME: z.string().default('luminia-masters'),
  
  // Redis
  REDIS_URL: z.string().url('Invalid Redis URL').optional(),
  REDIS_PASSWORD: z.string().optional(),

  // Frontend
  FRONTEND_URL: z.string().url().optional(),

  // WebAuthn / Passkey
  WEBAUTHN_RP_NAME: z.string().default('Pozhi Photography Studio'),
  WEBAUTHN_RP_ID: z.string().default('localhost'),
  WEBAUTHN_ORIGIN: z.string().default('http://localhost:5173'),

  // Email
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info')
});
// Validate the environment variables
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(_env.error.format(), null, 2));
  // Exit process to prevent server from starting in an unstable state
  process.exit(1);
}
export const isStripeLiveMode = (): boolean => {
  return env.STRIPE_SECRET_KEY.startsWith('sk_live_');
};

console.log('✅ Environment variables validated successfully');

export const env = _env.data;