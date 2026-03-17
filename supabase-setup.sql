-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  profile_picture_url VARCHAR(500),
  user_type VARCHAR(20) DEFAULT 'passenger', -- 'passenger' or 'driver'
  rating DECIMAL(3,2) DEFAULT 0,
  total_ratings INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  license_number VARCHAR(50) UNIQUE NOT NULL,
  license_expiry DATE,
  vehicle_type VARCHAR(50), -- 'joy_lite', 'joy_economy', 'joy_express', 'joy_vip', 'joy_moving', 'joy_packages'
  vehicle_color VARCHAR(50),
  vehicle_plate VARCHAR(50) UNIQUE NOT NULL,
  vehicle_document_url VARCHAR(500),
  vehicle_insurance_url VARCHAR(500),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_blocked BOOLEAN DEFAULT FALSE,
  current_location GEOMETRY(POINT, 4326),
  rating DECIMAL(3,2) DEFAULT 0,
  total_ratings INT DEFAULT 0,
  total_trips INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rides table
CREATE TABLE IF NOT EXISTS rides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  passenger_id UUID REFERENCES users(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  ride_type VARCHAR(50), -- 'joy_lite', 'joy_economy', 'joy_express', 'joy_vip'
  pickup_location GEOMETRY(POINT, 4326) NOT NULL,
  pickup_address VARCHAR(255) NOT NULL,
  dropoff_location GEOMETRY(POINT, 4326) NOT NULL,
  dropoff_address VARCHAR(255) NOT NULL,
  stops JSONB DEFAULT '[]'::jsonb,
  distance_km DECIMAL(10,2),
  estimated_duration_minutes INT,
  estimated_price DECIMAL(10,2),
  actual_price DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'requested', -- 'requested', 'accepted', 'in_progress', 'completed', 'cancelled'
  payment_method VARCHAR(50) DEFAULT 'card', -- 'card', 'cash', 'wallet'
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancellation_reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Packages table
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  pickup_location GEOMETRY(POINT, 4326) NOT NULL,
  pickup_address VARCHAR(255) NOT NULL,
  dropoff_location GEOMETRY(POINT, 4326) NOT NULL,
  dropoff_address VARCHAR(255) NOT NULL,
  package_description VARCHAR(500),
  package_weight_kg DECIMAL(10,2),
  estimated_price DECIMAL(10,2),
  actual_price DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'requested', -- 'requested', 'accepted', 'picked_up', 'in_transit', 'delivered', 'cancelled'
  started_at TIMESTAMP,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Moving services table
CREATE TABLE IF NOT EXISTS moving_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  pickup_location GEOMETRY(POINT, 4326) NOT NULL,
  pickup_address VARCHAR(255) NOT NULL,
  dropoff_location GEOMETRY(POINT, 4326) NOT NULL,
  dropoff_address VARCHAR(255) NOT NULL,
  items_description VARCHAR(500),
  estimated_price DECIMAL(10,2),
  actual_price DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'requested',
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  rater_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rated_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  category VARCHAR(50), -- 'politeness', 'driving', 'cleanliness'
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50), -- 'ride_request', 'ride_accepted', 'ride_completed', 'message', 'system'
  related_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blocked drivers table
CREATE TABLE IF NOT EXISTS blocked_drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES users(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  reason TEXT,
  blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  unblocked_at TIMESTAMP
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  attachment_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_drivers_user_id ON drivers(user_id);
CREATE INDEX idx_drivers_vehicle_plate ON drivers(vehicle_plate);
CREATE INDEX idx_rides_passenger_id ON rides(passenger_id);
CREATE INDEX idx_rides_driver_id ON rides(driver_id);
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_packages_sender_id ON packages(sender_id);
CREATE INDEX idx_packages_driver_id ON packages(driver_id);
CREATE INDEX idx_moving_customer_id ON moving_services(customer_id);
CREATE INDEX idx_moving_driver_id ON moving_services(driver_id);
CREATE INDEX idx_ratings_rater_id ON ratings(rater_id);
CREATE INDEX idx_ratings_rated_user_id ON ratings(rated_user_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE moving_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = auth_id);

-- RLS Policies for drivers
CREATE POLICY "Drivers can view their own profile" ON drivers
  FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

-- RLS Policies for rides
CREATE POLICY "Users can view their own rides" ON rides
  FOR SELECT USING (
    auth.uid() = (SELECT auth_id FROM users WHERE id = passenger_id) OR
    auth.uid() = (SELECT auth_id FROM users WHERE id = (SELECT user_id FROM drivers WHERE id = driver_id))
  );

-- RLS Policies for messages
CREATE POLICY "Users can view their own messages" ON messages
  FOR SELECT USING (
    auth.uid() = (SELECT auth_id FROM users WHERE id = sender_id) OR
    auth.uid() = (SELECT auth_id FROM users WHERE id = receiver_id)
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));
