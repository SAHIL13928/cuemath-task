-- Users profile table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  streak_count INT DEFAULT 0,
  last_study_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Decks table
CREATE TABLE decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  source_filename TEXT,
  card_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_studied_at TIMESTAMP WITH TIME ZONE
);

-- Cards table
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES decks(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  card_type TEXT CHECK (card_type IN ('concept', 'definition', 'relationship', 'application', 'example')),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review history table (powers spaced repetition)
CREATE TABLE review_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ease_factor FLOAT DEFAULT 2.5,
  interval INT DEFAULT 0,
  repetitions INT DEFAULT 0,
  next_review_date DATE DEFAULT CURRENT_DATE,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  last_rating TEXT CHECK (last_rating IN ('forgot', 'hard', 'easy')),
  UNIQUE(card_id, user_id)
);

-- Study sessions table
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  deck_id UUID REFERENCES decks(id) ON DELETE CASCADE,
  cards_reviewed INT DEFAULT 0,
  cards_correct INT DEFAULT 0,
  duration_seconds INT DEFAULT 0,
  studied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only access their own data
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can CRUD own decks" ON decks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view cards in own decks" ON cards FOR ALL USING (deck_id IN (SELECT id FROM decks WHERE user_id = auth.uid()));
CREATE POLICY "Users can CRUD own reviews" ON review_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own sessions" ON study_sessions FOR ALL USING (auth.uid() = user_id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
