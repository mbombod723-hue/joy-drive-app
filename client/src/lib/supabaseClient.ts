import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://shpaclmvvkedetqfgksn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_UdGdfRQejI-mZK1XG_f9tg_uWB7Ke0W';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth functions
export const authService = {
  // Sign up with email
  async signUpWithEmail(email: string, password: string, userData: any) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase.from('users').insert([
          {
            auth_id: authData.user.id,
            email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
            profile_picture_url: userData.profilePictureUrl,
            user_type: userData.userType || 'passenger',
          },
        ]);

        if (profileError) throw profileError;
      }

      return { data: authData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign in with email
  async signInWithEmail(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign in with Facebook
  async signInWithFacebook() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  },

  // Get user profile
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Delete account
  async deleteAccount(userId: string) {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  },
};

// Rides functions
export const ridesService = {
  // Create a ride request
  async createRide(rideData: any) {
    try {
      const { data, error } = await supabase
        .from('rides')
        .insert([rideData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get available drivers
  async getAvailableDrivers(rideType: string, location: any) {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*, users(*)')
        .eq('vehicle_type', rideType)
        .eq('is_active', true)
        .eq('is_blocked', false)
        .eq('is_verified', true);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get user rides
  async getUserRides(userId: string) {
    try {
      const { data, error } = await supabase
        .from('rides')
        .select('*, drivers(*, users(*))')
        .eq('passenger_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update ride status
  async updateRideStatus(rideId: string, status: string) {
    try {
      const { data, error } = await supabase
        .from('rides')
        .update({ status, updated_at: new Date() })
        .eq('id', rideId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Cancel ride
  async cancelRide(rideId: string, reason: string) {
    try {
      const { data, error } = await supabase
        .from('rides')
        .update({
          status: 'cancelled',
          cancelled_at: new Date(),
          cancellation_reason: reason,
          updated_at: new Date(),
        })
        .eq('id', rideId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};

// Drivers functions
export const driversService = {
  // Register as driver
  async registerDriver(driverData: any) {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .insert([driverData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get driver profile
  async getDriverProfile(driverId: string) {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*, users(*)')
        .eq('id', driverId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update driver location
  async updateDriverLocation(driverId: string, lat: number, lng: number) {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .update({
          current_location: `POINT(${lng} ${lat})`,
          updated_at: new Date(),
        })
        .eq('id', driverId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get driver rides
  async getDriverRides(driverId: string) {
    try {
      const { data, error } = await supabase
        .from('rides')
        .select('*, users(*)')
        .eq('driver_id', driverId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Block driver
  async blockDriver(driverId: string, reason: string, adminId: string) {
    try {
      const { error: blockError } = await supabase
        .from('blocked_drivers')
        .insert([
          {
            driver_id: driverId,
            admin_id: adminId,
            reason,
          },
        ]);

      if (blockError) throw blockError;

      const { error: updateError } = await supabase
        .from('drivers')
        .update({ is_blocked: true })
        .eq('id', driverId);

      if (updateError) throw updateError;
      return { error: null };
    } catch (error) {
      return { error };
    }
  },
};

// Ratings functions
export const ratingsService = {
  // Create rating
  async createRating(ratingData: any) {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .insert([ratingData])
        .select()
        .single();

      if (error) throw error;

      // Update user rating
      const { data: ratings } = await supabase
        .from('ratings')
        .select('rating')
        .eq('rated_user_id', ratingData.rated_user_id);

      if (ratings && ratings.length > 0) {
        const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
        await supabase
          .from('users')
          .update({
            rating: avgRating,
            total_ratings: ratings.length,
          })
          .eq('id', ratingData.rated_user_id);
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get ratings for user
  async getUserRatings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('rated_user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};

// Messages functions
export const messagesService = {
  // Send message
  async sendMessage(senderId: string, receiverId: string, message: string, rideId?: string) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: senderId,
            receiver_id: receiverId,
            ride_id: rideId,
            message_text: message,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get messages
  async getMessages(userId: string, otherUserId: string) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Mark message as read
  async markAsRead(messageId: string) {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  },
};

// Notifications functions
export const notificationsService = {
  // Create notification
  async createNotification(userId: string, title: string, message: string, type: string, relatedId?: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([
          {
            user_id: userId,
            title,
            message,
            type,
            related_id: relatedId,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get notifications
  async getNotifications(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Mark notification as read
  async markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  },
};

// Feedback functions
export const feedbackService = {
  // Submit feedback
  async submitFeedback(userId: string, subject: string, message: string, attachmentUrl?: string) {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .insert([
          {
            user_id: userId,
            subject,
            message,
            attachment_url: attachmentUrl,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};

// Packages functions
export const packagesService = {
  // Create package request
  async createPackage(packageData: any) {
    try {
      const { data, error } = await supabase
        .from('packages')
        .insert([packageData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get user packages
  async getUserPackages(userId: string) {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*, drivers(*, users(*))')
        .eq('sender_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};

// Moving services functions
export const movingService = {
  // Create moving request
  async createMoving(movingData: any) {
    try {
      const { data, error } = await supabase
        .from('moving_services')
        .insert([movingData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get user moving services
  async getUserMoving(userId: string) {
    try {
      const { data, error } = await supabase
        .from('moving_services')
        .select('*, drivers(*, users(*))')
        .eq('customer_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};

// Real-time subscriptions
export const realtimeService = {
  // Subscribe to ride updates
  subscribeToRideUpdates(rideId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`ride:${rideId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rides',
          filter: `id=eq.${rideId}`,
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to messages
  subscribeToMessages(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`messages:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to notifications
  subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to driver location updates
  subscribeToDriverLocation(driverId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`driver:${driverId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'drivers',
          filter: `id=eq.${driverId}`,
        },
        callback
      )
      .subscribe();
  },
};
