import sqlite3
import os
import random
from typing import List, Dict, Union

DATABASE_PATH = os.path.join(os.path.dirname(__file__), "../data/persistence.db")

class Persistence:

    @classmethod
    def create_user(cls, user_id: str, first_name: str, last_name: str, age: str, city: str, phone: str) -> None:
        conn = sqlite3.connect(DATABASE_PATH)
        c = conn.cursor()

        # Check if user with the same user_id already exists
        c.execute("SELECT * FROM users WHERE user_id=?", (user_id,))
        if c.fetchone():
            print("User with this user_id already exists.")
            return
        
        # Default score
        score = 100

        # Insert user into users table
        c.execute("INSERT INTO users (user_id, first_name, last_name, age, city, phone, score) VALUES (?, ?, ?, ?, ?, ?, ?)", 
                  (user_id, first_name, last_name, age, city, phone, score))

        # Insert default score into score_history table
        c.execute("INSERT INTO score_history (user_id, date, score) VALUES (?, DATE('now'), ?)", (user_id, score))
        
        conn.commit()
        conn.close()

    @classmethod
    def get_all_users(cls) -> List[Dict[str, Union[str, int, List[Dict[str, Union[str, int]]]]]]:
        conn = sqlite3.connect(DATABASE_PATH)
        c = conn.cursor()

        c.execute("SELECT user_id FROM users")
        user_ids = [row[0] for row in c.fetchall()]
        conn.close()

        all_users = [cls.get_user(user_id) for user_id in user_ids]
        return all_users
    
    @classmethod
    def get_user(cls, user_id: str) -> Dict[str, Union[str, int, List[Dict[str, Union[str, int]]]]]:
        conn = sqlite3.connect(DATABASE_PATH)
        c = conn.cursor()

        # Fetch user details
        c.execute("SELECT * FROM users WHERE user_id=?", (user_id,))
        user = c.fetchone()

        if not user:
            print(f"No user found with user_id: {user_id}")
            return {}

        user_id, first_name, last_name, age, city, phone, score = user
        user_dict = {
            'user_id': user_id,
            'first_name': first_name,
            'last_name': last_name,
            'age': age,
            'city': city,
            'phone': phone,
            'score': score
        }

        # Fetch score history for the past 30 days
        c.execute("SELECT date, score FROM score_history WHERE user_id=? ORDER BY date DESC LIMIT 30", (user_id,))
        score_history = c.fetchall()

        user_dict['score_history'] = [{'date': date, 'score': score_val} for date, score_val in score_history]

        conn.close()
        return user_dict

    @classmethod
    def update_user_field(cls, user_id: str, field: str, value: Union[str, int]) -> None:
        conn = sqlite3.connect(DATABASE_PATH)
        c = conn.cursor()

        if field == "score":
            # First, check if a score for the current day already exists
            c.execute("SELECT * FROM score_history WHERE user_id=? AND date=DATE('now')", (user_id,))
            if c.fetchone():
                # Update the score for the current day if it already exists
                c.execute("UPDATE score_history SET score=? WHERE user_id=? AND date=DATE('now')", (value, user_id))
            else:
                # Insert a new score for the current day
                c.execute("INSERT INTO score_history (user_id, date, score) VALUES (?, DATE('now'), ?)", (user_id, value))

        # Update the field in the users table
        c.execute(f"UPDATE users SET {field} = ? WHERE user_id = ?", (value, user_id))
        conn.commit()
        conn.close()

    @classmethod
    def initialize(cls) -> None:
        if not os.path.exists("../data"):
            os.makedirs("../data")
        if os.path.exists(DATABASE_PATH):
            conn = sqlite3.connect(DATABASE_PATH)
            c = conn.cursor()

            # Create users table
            c.execute("""CREATE TABLE IF NOT EXISTS users 
                        (user_id TEXT PRIMARY KEY, first_name TEXT, last_name TEXT, age TEXT, city TEXT, phone TEXT, score INTEGER)""")

            # Create score_history table
            c.execute("""CREATE TABLE IF NOT EXISTS score_history 
                        (id INTEGER PRIMARY KEY, user_id TEXT, date TEXT, score INTEGER, 
                        FOREIGN KEY (user_id) REFERENCES users(user_id))""")
            
            conn.close()
            generate_dummy_data()

def generate_dummy_data():
    names = [("John", "Doe"), ("Jane", "Smith"), ("Alice", "Johnson"), ("Bob", "White"), ("Charlie", "Brown"),
             ("Emily", "Davis"), ("Frank", "Miller"), ("Grace", "Garcia"), ("Hank", "Martinez"), ("Irene", "Anderson")]
    cities = ["Boston", "New York", "Los Angeles", "Chicago", "Houston", "Miami", "Dallas", "Phoenix", "Philadelphia", "San Diego"]
    phones = ["1234567890", "2345678901", "3456789012", "4567890123", "5678901234", 
              "6789012345", "7890123456", "8901234567", "9012345678", "0123456789"]

    for idx, (first_name, last_name) in enumerate(names):
        user_id = f"{first_name.lower()}_{last_name.lower()}"
        age = str(random.randint(20, 50))
        city = cities[idx]
        phone = phones[idx]
        
        # Open a single connection for the entire operation for this user
        with sqlite3.connect(DATABASE_PATH) as conn:
            c = conn.cursor()

            # Create the user
            Persistence.create_user(user_id, first_name, last_name, age, city, phone)

            # Generate score history
            decreasing = random.choice([True, False])
            score = 100
            for i in range(30):
                if decreasing and i % 6 == 0:
                    score -= random.randint(1, 5)
                else:
                    score += random.randint(-2, 2)
                
                # Make sure score is within bounds
                score = max(min(score, 100), 40)

                c.execute("INSERT INTO score_history (user_id, date, score) VALUES (?, DATE('now', ?), ?)", (user_id, f"-{30-i} days", score))

            # Update user's latest score in users table
            c.execute(f"UPDATE users SET score = ? WHERE user_id = ?", (score, user_id))

            # Commit changes
            conn.commit()

if __name__ == "__main__":
    Persistence.initialize()
    generate_dummy_data()
    print(Persistence.get_all_users())
