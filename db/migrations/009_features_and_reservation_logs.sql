-- =====================================================================
-- StayOS PMS — Features Completion & Reservation Logs Migration
-- Tables: rate_package, reservation, reservation_log
-- =====================================================================

BEGIN;

-- 1. Rate Package Table
CREATE TABLE IF NOT EXISTS rate_package (
    package_id          SERIAL PRIMARY KEY,
    client_id           INTEGER NOT NULL REFERENCES property(client_id) ON DELETE CASCADE,
    code                VARCHAR(50) NOT NULL,
    name                VARCHAR(150) NOT NULL,
    description         TEXT,
    rate_type_id        INTEGER REFERENCES rate_type(rate_type_id) ON DELETE SET NULL,
    package_type        VARCHAR(50) NOT NULL DEFAULT 'leisure',
    inclusions          JSONB NOT NULL DEFAULT '[]'::jsonb,
    base_price          NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    extra_adult_price   NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    extra_child_price   NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    valid_from          DATE,
    valid_to            DATE,
    min_stay_nights     INTEGER NOT NULL DEFAULT 1,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    is_crs_enabled      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_rate_package_code UNIQUE (client_id, code)
);

-- 2. Reservation Table
CREATE TABLE IF NOT EXISTS reservation (
    reservation_id      SERIAL PRIMARY KEY,
    client_id           INTEGER NOT NULL REFERENCES property(client_id) ON DELETE CASCADE,
    booking_number      VARCHAR(50) NOT NULL,
    guest_name          VARCHAR(200) NOT NULL,
    guest_email         VARCHAR(150),
    guest_phone         VARCHAR(50),
    room_type_id        INTEGER REFERENCES room_type(room_type_id) ON DELETE SET NULL,
    room_id             INTEGER REFERENCES room(room_id) ON DELETE SET NULL,
    room_number         VARCHAR(50),
    check_in_date       DATE NOT NULL,
    check_out_date      DATE NOT NULL,
    status              VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
    adults              INTEGER NOT NULL DEFAULT 1,
    children            INTEGER NOT NULL DEFAULT 0,
    total_amount        NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    paid_amount         NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    special_requests    TEXT,
    created_by_user_id  INTEGER REFERENCES app_user(user_id) ON DELETE SET NULL,
    created_by_name     VARCHAR(100) NOT NULL DEFAULT 'System Staff',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_reservation_booking UNIQUE (client_id, booking_number)
);

-- 3. Reservation Log Table
-- Tracks full audit trail of who created, modified, check-in, check-out, and in whose presence
CREATE TABLE IF NOT EXISTS reservation_log (
    log_id                  SERIAL PRIMARY KEY,
    client_id               INTEGER NOT NULL REFERENCES property(client_id) ON DELETE CASCADE,
    reservation_id          INTEGER REFERENCES reservation(reservation_id) ON DELETE SET NULL,
    booking_number          VARCHAR(50) NOT NULL,
    guest_name              VARCHAR(200) NOT NULL,
    action_type             VARCHAR(50) NOT NULL, -- 'RESERVATION_CREATED', 'RESERVATION_MODIFIED', 'CHECK_IN', 'CHECK_OUT', 'CANCELLED', 'ROOM_MOVED', 'PAYMENT_RECORDED'
    action_title            VARCHAR(150) NOT NULL,
    action_details          TEXT NOT NULL,
    performed_by_user_id    INTEGER REFERENCES app_user(user_id) ON DELETE SET NULL,
    performed_by_name       VARCHAR(100) NOT NULL,
    performed_by_role       VARCHAR(100) NOT NULL,
    witnessed_by_name       VARCHAR(100), -- In whose presence action took place (Supervisor / Manager)
    witnessed_by_role       VARCHAR(100),
    workstation_or_terminal VARCHAR(100) DEFAULT 'FrontDesk-Terminal-01',
    ip_address              VARCHAR(50) DEFAULT '192.168.1.105',
    previous_values         JSONB,
    new_values              JSONB,
    notes                   TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_res_log_client_id ON reservation_log(client_id);
CREATE INDEX IF NOT EXISTS idx_res_log_booking_number ON reservation_log(booking_number);
CREATE INDEX IF NOT EXISTS idx_res_log_action_type ON reservation_log(action_type);
CREATE INDEX IF NOT EXISTS idx_res_log_created_at ON reservation_log(created_at DESC);

-- Seed Initial confidential Reservation Logs for Destin Inn & Suites (10001)
INSERT INTO reservation_log (
    client_id, booking_number, guest_name, action_type, action_title, action_details,
    performed_by_name, performed_by_role, witnessed_by_name, witnessed_by_role,
    workstation_or_terminal, ip_address, notes, created_at
) VALUES 
(
    10001, 'BK-2026-8801', 'Arthur Pendelton', 'RESERVATION_CREATED', 'New Reservation Booked',
    'Created reservation for 3 nights in Deluxe King Suite (Room 204). Total amount $855.00.',
    'John Admin', 'SuperAdmin', 'Sarah Jenkins', 'Front Office Supervisor',
    'Desk-Station-01', '192.168.1.101', 'Direct corporate booking via phone.',
    '2026-06-25 10:15:00-04'
),
(
    10001, 'BK-2026-8801', 'Arthur Pendelton', 'RESERVATION_MODIFIED', 'Dates & Room Upgrade',
    'Shifted check-out from June 28 to June 29 (added 1 night). Upgraded to Ocean View.',
    'Emily Watson', 'Operations Staff', 'David Vance', 'General Manager',
    'Desk-Station-02', '192.168.1.102', 'Guest requested extra night upon flight rescheduling.',
    '2026-06-26 14:30:00-04'
),
(
    10001, 'BK-2026-8801', 'Arthur Pendelton', 'CHECK_IN', 'Guest Check-In Executed',
    'Guest arrived and checked into Room 204. RFID keys #204A and #204B issued. Incidental hold of $150.00 authorized on Visa ending 4402.',
    'Alex Rivera', 'Front Desk Agent', 'Sarah Jenkins', 'Front Office Supervisor',
    'Desk-Station-01', '192.168.1.101', 'Guest verified with Driver License; signature captured on terminal.',
    '2026-06-29 15:42:10-04'
),
(
    10001, 'BK-2026-8801', 'Arthur Pendelton', 'CHECK_OUT', 'Guest Check-Out & Folio Settled',
    'Guest completed check-out. Keys returned. Total folio $1,140.00 settled in full.',
    'Jordan Lee', 'Front Desk Agent', 'Sarah Jenkins', 'Front Office Supervisor',
    'Desk-Station-01', '192.168.1.101', 'Smooth checkout; room sent to Housekeeping inspection queue.',
    '2026-07-03 10:45:00-04'
),
(
    10001, 'BK-2026-8804', 'Eleanor Vance', 'RESERVATION_CREATED', 'Online Reservation Confirmed',
    'Booking confirmed for Executive King Suite. Stay dates: July 10 - July 14, 2026.',
    'Emily Watson', 'Operations Staff', 'David Vance', 'General Manager',
    'Web-Engine-Sync', '192.168.1.200', 'Booking received through booking engine.',
    '2026-06-27 09:00:00-04'
),
(
    10001, 'BK-2026-8804', 'Eleanor Vance', 'CHECK_IN', 'Guest Check-In Executed',
    'Guest checked in to Room 302 in presence of Duty Manager. Credit card pre-authorization captured.',
    'Alex Rivera', 'Front Desk Agent', 'David Vance', 'General Manager',
    'Desk-Station-02', '192.168.1.102', 'VIP guest amenities delivered to room.',
    '2026-07-10 16:15:00-04'
)
ON CONFLICT DO NOTHING;

-- Seed Initial confidential Reservation Logs for Surat Marriott Hotel (10002)
INSERT INTO reservation_log (
    client_id, booking_number, guest_name, action_type, action_title, action_details,
    performed_by_name, performed_by_role, witnessed_by_name, witnessed_by_role,
    workstation_or_terminal, ip_address, notes, created_at
) VALUES 
(
    10002, 'BK-2026-9201', 'Vikramaditya Singhania', 'RESERVATION_CREATED', 'Diplomatic Suite Reservation',
    'Created reservation for 4 nights in Tapi River View Suite. Package: Luxury Airport Transfer + Breakfast. Total ₹96,000.',
    'Neha Sharma', 'Front Desk Lead', 'Rajesh Patel', 'Duty Manager',
    'Surat-FD-01', '10.0.1.50', 'Booked through Marriott Bonvoy concierge.',
    '2026-06-20 11:30:00+05:30'
),
(
    10002, 'BK-2026-9201', 'Vikramaditya Singhania', 'CHECK_IN', 'VIP Check-In Executed',
    'Guest arrived with party of 3. Checked into Suite 501. Passport ID verified. Digital registration card signed.',
    'Rohit Verma', 'Front Office Agent', 'Rajesh Patel', 'Duty Manager',
    'Surat-FD-01', '10.0.1.50', 'Accompanied to suite by Guest Relations Manager.',
    '2026-06-28 14:10:00+05:30'
),
(
    10002, 'BK-2026-9201', 'Vikramaditya Singhania', 'CHECK_OUT', 'VIP Check-Out Completed',
    'Settled room service and banquet charges. Folio total ₹1,12,450 settled via Corporate Amex.',
    'Neha Sharma', 'Front Desk Lead', 'Rajesh Patel', 'Duty Manager',
    'Surat-FD-02', '10.0.1.51', 'Airport drop arranged with property limousine.',
    '2026-07-02 11:20:00+05:30'
),
(
    10002, 'BK-2026-9205', 'Priya Desai', 'RESERVATION_CREATED', 'Deluxe Room Booking',
    'Confirmed booking for 2 nights in Deluxe King. Total ₹25,000.',
    'Rohit Verma', 'Front Office Agent', 'Rajesh Patel', 'Duty Manager',
    'Surat-FD-01', '10.0.1.50', 'Marriott Bonvoy Gold Elite member.',
    '2026-06-25 15:45:00+05:30'
),
(
    10002, 'BK-2026-9205', 'Priya Desai', 'RESERVATION_MODIFIED', 'High Floor Preference Added',
    'Updated room assignment request to High Floor / Non-smoking.',
    'Neha Sharma', 'Front Desk Lead', 'Rajesh Patel', 'Duty Manager',
    'Surat-FD-02', '10.0.1.51', 'Assigned Room 712 on 7th floor.',
    '2026-06-26 12:00:00+05:30'
)
ON CONFLICT DO NOTHING;

COMMIT;
