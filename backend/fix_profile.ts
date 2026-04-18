
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Admin Key

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

const targetUserId = 'fa9bda9c-cb33-407d-9122-b832a589c001';

async function fixProfile() {
    console.log(`Checking profile for user: ${targetUserId}`);

    // 1. Check if user exists in Auth (Admin only)
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(targetUserId);

    if (userError || !userData.user) {
        console.error('User not found in Auth:', userError?.message);
        return;
    }

    console.log('User found in Auth:', userData.user.email);

    // 2. Check profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

    if (profile) {
        console.log('Profile already exists:', profile);
        return;
    }

    console.log('Profile missing. Creating now...');

    // 3. Create profile
    const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
            id: targetUserId,
            email: userData.user.email,
            full_name: 'Admin User', // Default for now
            role: 'admin', // Force admin role since this is likely the admin user
            is_banned: false,
            created_at: new Date().toISOString()
        });

    if (insertError) {
        console.error('Failed to create profile:', insertError.message);
    } else {
        console.log('Profile created successfully!');
    }
}

fixProfile().catch(console.error);
