import sqlite3
import os

db_path = './auth.db'

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if columns exist
    cursor.execute("PRAGMA table_info(users)")
    columns = [col[1] for col in cursor.fetchall()]
    
    # Add missing columns
    if 'full_name' not in columns:
        print("Adding full_name column...")
        cursor.execute("ALTER TABLE users ADD COLUMN full_name TEXT")
    
    if 'phone' not in columns:
        print("Adding phone column...")
        cursor.execute("ALTER TABLE users ADD COLUMN phone TEXT")
    
    if 'avatar_url' not in columns:
        print("Adding avatar_url column...")
        cursor.execute("ALTER TABLE users ADD COLUMN avatar_url TEXT")
    
    if 'updated_at' not in columns:
        print("Adding updated_at column...")
        cursor.execute("ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    
    conn.commit()
    conn.close()
    print("Migration completed successfully!")
else:
    print("Database does not exist yet. It will be created on first run.")
