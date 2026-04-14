-- Track when a user last opened a deck (for "Continue Studying" and "Last Opened" sort)
ALTER TABLE decks ADD COLUMN IF NOT EXISTS last_opened_at TIMESTAMPTZ;
