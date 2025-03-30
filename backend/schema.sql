-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM Types
CREATE TYPE user_role AS ENUM ('student', 'employee', 'alumni', 'admin', 'support_staff');
CREATE TYPE user_status AS ENUM ('active', 'restricted', 'suspended');
CREATE TYPE action_status AS ENUM ('success', 'failed');


CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL,
    status user_status DEFAULT 'active',
    violation_count INT DEFAULT 0 CHECK (violation_count >= 0),
    created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    details TEXT,
    event_time TIME NOT NULL,
    category VARCHAR(50) CHECK (category IN ('UAAP', 'IPEA Event')),
    image TEXT,
    venue VARCHAR(255) NOT NULL,
    event_type VARCHAR(20) CHECK (event_type IN ('free', 'ticketed')) NOT NULL,
    visibility VARCHAR(20) DEFAULT 'published' CHECK (visibility IN ('published', 'archived')),
    reservation_start TIMESTAMP,
    reservation_end TIMESTAMP,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'open', 'closed', 'cancelled')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reservations (
    reservation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(event_id) ON DELETE CASCADE,
	qr_code TEXT NOT NULL,
    ticket_type VARCHAR(50) NOT NULL, -- E.g., VIP, LowerBox
    amount DECIMAL(10,2) NOT NULL, -- Ticket price
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'expired', 'cancelled')),
    created_at TIMESTAMP DEFAULT NOW()
);



CREATE TABLE tickets (
    ticket_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(event_id) ON DELETE CASCADE,
    seat_type VARCHAR(20) CHECK (seat_type IN ('free', 'reserved')) NOT NULL, -- Free Seating or Ticket Selection
    ticket_type VARCHAR(50), -- Nullable, only needed if seat_type = 'reserved'
    price DECIMAL(10,2) CHECK (price >= 0), -- Supports pricing for both free & reserved seating
    quantity INT CHECK (quantity >= 0), -- Number of tickets available
    tickets_sold INT DEFAULT 0 CHECK (tickets_sold >= 0), -- Track sold tickets
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE claiming_slots (
    claiming_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    claiming_date DATE, -- Nullable: Can be set later
    start_time TIME, -- Nullable: Can be set later
    end_time TIME, -- Nullable: Can be set later
    max_claimers INT CHECK (max_claimers >= 0), -- Nullable: Can be set later
    general_location VARCHAR(255), -- Nullable: Can be set later
    specific_location VARCHAR(255), -- Nullable: Optional
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    admin_role user_role NOT NULL,
    target_id UUID,
    target_table VARCHAR(50),
    action VARCHAR(255) NOT NULL,
    action_status action_status NOT NULL,
    details JSONB,
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE qr_scan_logs (
    scan_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id UUID NOT NULL REFERENCES reservations(reservation_id) ON DELETE CASCADE,
    scanned_by UUID NOT NULL REFERENCES users(user_id) ON DELETE SET NULL, -- The staff/admin who scanned
    scan_time TIMESTAMP DEFAULT NOW(),
    scan_status VARCHAR(20) DEFAULT 'valid' CHECK (scan_status IN ('valid', 'invalid', 'duplicate'))
);

CREATE TABLE subscriptions (
    subscription_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(event_id) ON DELETE CASCADE, -- Added ON DELETE CASCADE
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(event_id) ON DELETE CASCADE, -- Added ON DELETE CASCADE
    message TEXT NOT NULL, 
    type VARCHAR(50) CHECK (type IN ('reservation_open', 'reminder', 'system_alert')) NOT NULL, -- Categorize notifications
    status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
    created_at TIMESTAMP DEFAULT NOW()
);


CREATE INDEX idx_admin_id ON logs(admin_id);
CREATE INDEX idx_target_id ON logs(target_id);
CREATE INDEX idx_timestamp ON logs(timestamp);


CREATE INDEX idx_user_subscription ON subscriptions(user_id);
CREATE INDEX idx_event_subscription ON subscriptions(event_id);


CREATE INDEX idx_user_notifications ON notifications(user_id);
CREATE INDEX idx_event_notifications ON notifications(event_id);







