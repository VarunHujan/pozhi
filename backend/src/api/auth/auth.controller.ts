// ==========================================
// AUTH CONTROLLER - FIXED IMPORT VERSION
// ==========================================

import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../config/supabase';
import { ApiError } from '../../utils/ApiError';
import { logger } from '../../utils/logger';
// ✅ FIX: Import everything as an alias so 'securityLogger.log...' works
import * as securityLogger from '../../utils/securityLogger';
import { env } from '../../config/env';


// ==========================================
// SIGNUP - Create new user account
// ==========================================

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, full_name, phone } = req.body;

    logger.info('Signup attempt', { email });

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists');
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          phone
        }
      }
    });

    if (authError) {
      logger.error('Signup failed', { error: authError.message, email });
      throw new ApiError(400, authError.message);
    }

    if (!authData.user) {
      throw new ApiError(500, 'Failed to create user account');
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        full_name,
        phone,
        role: 'customer',
        is_banned: false,
        created_at: new Date().toISOString()
      });

    if (profileError) {
      logger.error('Failed to create profile', { 
        error: profileError.message, 
        userId: authData.user.id 
      });
    }

    // Log security event
    await securityLogger.logSecurityEvent({
      type: 'signup_success',
      user_id: authData.user.id,
      ip: req.ip || 'unknown',
      user_agent: req.get('user-agent') || 'unknown',
      details: { email }
    });

    logger.info('Signup successful', { 
      userId: authData.user.id, 
      email 
    });

    res.status(201).json({
      status: 'success',
      message: 'Account created successfully. Please check your email to verify your account.',
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          full_name
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// ==========================================
// LOGIN - Authenticate user
// ==========================================

// ... imports

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    logger.info('Login attempt', { email });

    // 1. Attempt login (Generates Token)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData.user) {
      await securityLogger.logSecurityEvent({
        type: 'login_failed',
        ip: req.ip || 'unknown',
        user_agent: req.get('user-agent') || 'unknown',
        details: { email, reason: authError?.message },
        severity: 'medium'
      });
      throw new ApiError(401, 'Invalid email or password');
    }

    // 2. Check if user is banned
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_banned, role, full_name')
      .eq('id', authData.user.id)
      .single();

    if (profile?.is_banned) {
      // 🛑 SECURITY FIX: Kill the session we just created
      await supabase.auth.signOut(); 

      await securityLogger.logSecurityEvent({
        type: 'login_blocked_banned',
        user_id: authData.user.id,
        ip: req.ip || 'unknown',
        user_agent: req.get('user-agent') || 'unknown',
        details: { email },
        blocked: true
      });

      throw new ApiError(403, 'Your account has been suspended. Please contact support.');
    }

    // ... rest of the function (logging success and returning response)
    
    // Log success
    await securityLogger.logSecurityEvent({
      type: 'login_success',
      user_id: authData.user.id,
      ip: req.ip || 'unknown',
      user_agent: req.get('user-agent') || 'unknown',
      details: { email }
    });
    
    res.status(200).json({
       // ... response data
       status: 'success',
       message: 'Login successful',
       data: {
         user: {
           id: authData.user.id,
           email: authData.user.email,
           full_name: profile?.full_name,
           role: profile?.role || 'customer'
         },
         session: {
           access_token: authData.session?.access_token,
           refresh_token: authData.session?.refresh_token,
           expires_at: authData.session?.expires_at
         }
       }
    });

  } catch (error) {
    next(error);
  }
};

// ... other functions

// ==========================================
// LOGOUT - End user session
// ==========================================

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, 'Not authenticated');
    }

    logger.info('Logout attempt', { userId });

    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const { error } = await supabase.auth.signOut();

      if (error) {
        logger.error('Logout failed', { error: error.message, userId });
        throw new ApiError(500, 'Logout failed');
      }
    }

    // Log security event
    await securityLogger.logSecurityEvent({
      type: 'logout',
      user_id: userId,
      ip: req.ip || 'unknown',
      user_agent: req.get('user-agent') || 'unknown',
      details: {}
    });

    logger.info('Logout successful', { userId });

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });

  } catch (error) {
    next(error);
  }
};

// ==========================================
// GET CURRENT USER - Retrieve logged-in user
// ==========================================

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, 'Not authenticated');
    }

    // Get user profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      throw new ApiError(404, 'User profile not found');
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          phone: profile.phone,
          role: profile.role,
          avatar_url: profile.avatar_url,
          created_at: profile.created_at
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// ==========================================
// FORGOT PASSWORD - Send reset email
// ==========================================

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    logger.info('Password reset requested', { email });

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${env.FRONTEND_URL}/reset-password`
    });

    if (error) {
      logger.error('Password reset failed', { error: error.message, email });
      // Don't reveal if email exists or not (security)
    }

    // Log security event
    await securityLogger.logSecurityEvent({
      type: 'password_reset_requested',
      user_id: undefined,
      ip: req.ip || 'unknown',
      user_agent: req.get('user-agent') || 'unknown',
      details: { email }
    });

    // Always return success (don't reveal if email exists)
    res.status(200).json({
      status: 'success',
      message: 'If an account with that email exists, we sent a password reset link.'
    });

  } catch (error) {
    next(error);
  }
};

// ==========================================
// RESET PASSWORD - Change password with token
// ==========================================

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, new_password } = req.body;

    logger.info('Password reset attempt');

    // Update password using token
    const { error } = await supabase.auth.updateUser({
      password: new_password
    });

    if (error) {
      logger.error('Password reset failed', { error: error.message });
      throw new ApiError(400, 'Failed to reset password. Token may be expired.');
    }

    logger.info('Password reset successful');

    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    next(error);
  }
};

// ==========================================
// CHANGE PASSWORD - Update password (logged in)
// ==========================================

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { current_password, new_password } = req.body;

    if (!userId) {
      throw new ApiError(401, 'Not authenticated');
    }

    logger.info('Password change attempt', { userId });

    // Verify current password by attempting to sign in
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (!profile) {
      throw new ApiError(404, 'User not found');
    }

    // Verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: current_password
    });

    if (signInError) {
      throw new ApiError(401, 'Current password is incorrect');
    }

    // Update to new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: new_password
    });

    if (updateError) {
      logger.error('Password update failed', { error: updateError.message, userId });
      throw new ApiError(500, 'Failed to update password');
    }

    // Log security event
    await securityLogger.logSecurityEvent({
      type: 'password_changed',
      user_id: userId,
      ip: req.ip || 'unknown',
      user_agent: req.get('user-agent') || 'unknown',
      details: {}
    });

    logger.info('Password changed successfully', { userId });

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully'
    });

  } catch (error) {
    next(error);
  }
};

// ==========================================
// REFRESH TOKEN - Get new access token
// ==========================================

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      throw new ApiError(400, 'Refresh token is required');
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error || !data.session) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    res.status(200).json({
      status: 'success',
      data: {
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// ==========================================
// VERIFY EMAIL - Confirm email address
// ==========================================

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.body;

    logger.info('Email verification attempt');

    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email'
    });

    if (error) {
      logger.error('Email verification failed', { error: error.message });
      throw new ApiError(400, 'Invalid or expired verification token');
    }

    logger.info('Email verified successfully');

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully'
    });

  } catch (error) {
    next(error);
  }
};

// ==========================================
// RESEND VERIFICATION - Send verification email again
// ==========================================

export const resendVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const email = req.user?.email;

    if (!userId || !email) {
      throw new ApiError(401, 'Not authenticated');
    }

    logger.info('Resending verification email', { userId, email });

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email
    });

    if (error) {
      logger.error('Failed to resend verification', { error: error.message, userId });
      throw new ApiError(500, 'Failed to resend verification email');
    }

    res.status(200).json({
      status: 'success',
      message: 'Verification email sent. Please check your inbox.'
    });

  } catch (error) {
    next(error);
  }
};