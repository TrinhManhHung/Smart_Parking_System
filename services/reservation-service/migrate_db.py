import sqlite3
import os

db_path = './reservation.db'

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if column exists
    cursor.execute("PRAGMA table_info(reservations)")
    columns = [col[1] for col in cursor.fetchall()]
    
    # Add seat_number column if it doesn't exist
    if 'seat_number' not in columns:
        print("Adding seat_number column...")
        cursor.execute("ALTER TABLE reservations ADD COLUMN seat_number TEXT")
        conn.commit()
        print("Migration completed successfully!")
    else:
        print("seat_number column already exists.")
    
    conn.close()
else:
    print("Database does not exist yet. It will be created on first run.")
