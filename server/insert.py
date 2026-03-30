import json
import os
import sys

from databaseHandler import insertQuestion

USER = "system"
IP = "127.0.0.1"


def insert_questions(questions: list):
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
            ip=IP,
        )
    return len(questions)


def extract_questions(data) -> list:
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        raw = data.get("questions", [])
        if isinstance(raw, str):
            raw = json.loads(raw.strip())
        if isinstance(raw, list):
            return raw
    raise ValueError(f"Unrecognised format: {type(data)}")


def process_file(filepath: str):
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    questions = extract_questions(data)
    count = insert_questions(questions)
    print(f"  [{os.path.basename(filepath)}] Inserted {count} questions.")
    return count


def process_directory(dir_path: str):
    if not os.path.isdir(dir_path):
        print(f"Error: '{dir_path}' is not a valid directory.")
        return

    json_files = [f for f in os.listdir(dir_path) if f.endswith(".json")]

    if not json_files:
        print(f"No JSON files found in '{dir_path}'.")
        return

    print(f"Found {len(json_files)} JSON file(s) in '{dir_path}'...")
    total = 0
    for filename in sorted(json_files):
        try:
            total += process_file(os.path.join(dir_path, filename))
        except Exception as e:
            print(f"  [{filename}] Skipped — {e}")

    print(
        f"\nDone. Total inserted: {total} question(s) across {len(json_files)} file(s)."
    )


def insert_questions_from_paste():
    while True:
        print("\nPaste JSON then press Enter on a blank line (or type 'quit'):")
        input_lines = []
        while True:
            line = input()
            if line.strip().lower() == "quit":
                print("Exiting...")
                return
            if line == "":
                break
            input_lines.append(line)

        try:
            data = json.loads("\n".join(input_lines))
            questions = extract_questions(data)
        except (json.JSONDecodeError, ValueError) as e:
            print(f"Error parsing input: {e}")
            continue

        count = insert_questions(questions)
        print(f"Inserted {count} questions successfully.")


def main():
    if len(sys.argv) > 1:
        process_directory(sys.argv[1])
    else:
        insert_questions_from_paste()


if __name__ == "__main__":
    main()
