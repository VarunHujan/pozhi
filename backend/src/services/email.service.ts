// ==========================================
// EMAIL SERVICE - PRODUCTION GRADE
// ==========================================
// Dev Mode: Logs to Console (No API Key needed)
// Prod Mode: Uses Resend (Industry Standard)
// ==========================================

import { Resend } from 'resend';
import { logger } from '../utils/logger';
import { env } from '../config/env';


// Initialize Resend (Only if API key exists)
const resend = env.RESEND_API_KEY 
  ? new Resend(env.RESEND_API_KEY) 
  : null;

const FROM_EMAIL = env.EMAIL_FROM || 'onboarding@resend.dev';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const emailService = {
  /**
   * Send an email (Smart Fallback)
   */
  async sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
    try {
      // 1. DEVELOPMENT MODE: Log to Console
      if (env.NODE_ENV !== 'production' || !resend) {
        logger.info('📧 [DEV MODE] Email Mock Send:', {
          to,
          subject,
          preview: html.substring(0, 100) + '...'
        });
        return true; // Pretend it worked
      }

      // 2. PRODUCTION MODE: Send Real Email
      const { data, error } = await resend.emails.send({
        from: `Luminia Studio <${FROM_EMAIL}>`,
        to,
        subject,
        html,
      });

      if (error) {
        logger.error('Resend API Error', error);
        return false;
      }

      logger.info('Email sent successfully', { id: data?.id, to });
      return true;

    } catch (error) {
      logger.error('Email Service Failed', error);
      return false;
    }
  },

  /**
   * Send Welcome Email
   */
  async sendWelcomeEmail(email: string, name: string) {
    const html = `
      <h1>Welcome to Luminia & Oak, ${name}!</h1>
      <p>We are thrilled to have you. Your journey to premium art starts here.</p>
      <p>Click here to browse our gallery: <a href="${env.FRONTEND_URL}/gallery">View Gallery</a></p>
    `;
    await this.sendEmail({ to: email, subject: 'Welcome to Luminia & Oak!', html });
  },

  /**
   * Send Order Confirmation
   */
  async sendOrderConfirmation(email: string, orderNumber: string, amount: number) {
    const html = `
      <h1>Order Confirmed!</h1>
      <p>Thank you for your purchase.</p>
      <p><strong>Order #:</strong> ${orderNumber}</p>
      <p><strong>Total:</strong> ₹${amount}</p>
      <p>We will notify you when your frame ships.</p>
    `;
    await this.sendEmail({ to: email, subject: `Order Confirmation: ${orderNumber}`, html });
  },

  /**
   * Send Password Reset
   */
  async sendPasswordReset(email: string, resetToken: string) {
    // Note: Supabase usually handles this, but if you do it manually:
    const resetLink = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const html = `
      <h1>Reset Your Password</h1>
      <p>Click the link below to reset your password. This link expires in 1 hour.</p>
      <a href="${resetLink}">Reset Password</a>
    `;
    await this.sendEmail({ to: email, subject: 'Password Reset Request', html });
  }
};