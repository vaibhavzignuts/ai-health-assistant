-- HealthCare+ Premium Supabase Schema Update

-- 1. user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    date_of_birth DATE,
    gender TEXT,
    height_cm NUMERIC,
    weight_kg NUMERIC,
    blood_type TEXT,
    allergies TEXT,
    existing_conditions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- 2. medicine_reminders
CREATE TABLE IF NOT EXISTS medicine_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    medicine_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    times JSONB NOT NULL, -- Array of times, e.g., ["08:00", "20:00"]
    start_date DATE NOT NULL,
    end_date DATE,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE medicine_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own medicine_reminders" ON medicine_reminders FOR ALL USING (auth.uid() = user_id);

-- 3. medicine_logs
CREATE TABLE IF NOT EXISTS medicine_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    reminder_id UUID REFERENCES medicine_reminders ON DELETE CASCADE NOT NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('taken', 'missed', 'skipped', 'pending')),
    taken_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(reminder_id, scheduled_time)
);

ALTER TABLE medicine_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own medicine_logs" ON medicine_logs FOR ALL USING (auth.uid() = user_id);

-- 4. symptom_assessments
CREATE TABLE IF NOT EXISTS symptom_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    symptoms_entered TEXT NOT NULL,
    follow_up_answers JSONB,
    ai_assessment TEXT NOT NULL,
    urgency_level TEXT NOT NULL CHECK (urgency_level IN ('emergency', 'urgent', 'routine')),
    recommended_next_step TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE symptom_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own symptom_assessments" ON symptom_assessments FOR ALL USING (auth.uid() = user_id);

-- 5. appointments
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    provider_name TEXT NOT NULL,
    facility_name TEXT,
    appointment_type TEXT NOT NULL,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    is_virtual BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own appointments" ON appointments FOR ALL USING (auth.uid() = user_id);

-- 6. saved_facilities
CREATE TABLE IF NOT EXISTS saved_facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    facility_id TEXT NOT NULL, -- ID from external API or internal mock DB
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, facility_id)
);

ALTER TABLE saved_facilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own saved_facilities" ON saved_facilities FOR ALL USING (auth.uid() = user_id);

-- 7. emergency_contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own emergency_contacts" ON emergency_contacts FOR ALL USING (auth.uid() = user_id);

-- 8. doctor_questions
CREATE TABLE IF NOT EXISTS doctor_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    question TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE doctor_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own doctor_questions" ON doctor_questions FOR ALL USING (auth.uid() = user_id);

-- 9. notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    action_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- 10. health_activity_logs (For the activity timeline)
CREATE TABLE IF NOT EXISTS health_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    activity_type TEXT NOT NULL, -- e.g., 'medication_taken', 'appointment_booked', 'assessment_completed'
    title TEXT NOT NULL,
    description TEXT,
    related_entity_id UUID, -- Optional ID linking to the specific log/appointment/assessment
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE health_activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own activity logs" ON health_activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity logs" ON health_activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable UUID extension if not enabled (usually enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
