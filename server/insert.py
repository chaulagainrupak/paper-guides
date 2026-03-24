import json
from databaseHandler import insertQuestion  # import your function

USER = "system"
IP = "127.0.0.1"

def insert_questions_from_input():
    while True:
        print("\nPaste the JSON array of questions (or type 'quit' to exit):")
        
        # Read multi-line input
        input_lines = []
        while True:
            line = input()
            if line.strip().lower() == "quit":
                print("Exiting...")
                return
            if line == "":
                break  # empty line signals end of input
            input_lines.append(line)

        input_str = "\n".join(input_lines)

        try:
            questions = json.loads(input_str)
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON: {e}")
            continue

        for q in questions:
            insertQuestion(
                board=q.get("board", ""),
                subject=q.get("subject", ""),
                topic=q.get("topic", ""),
                difficulty=q.get("difficulty", 1),
                level=q.get("level", ""),
                component=q.get("component", ""),
                question=q.get("question", ""),
                solution=q.get("solution", ""),
                keywords=q.get("keywords", []),
                approved=True,
                user=USER,
                ip=IP
            )

        print(f"Inserted {len(questions)} questions successfully.")

if __name__ == "__main__":
    insert_questions_from_input()