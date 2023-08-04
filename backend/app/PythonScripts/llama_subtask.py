# llama_subtask.py

import os
import replicate
import sys

def generate_subtasks(prompt):
    try:
        output = replicate.run(
            "a16z-infra/llama-2-7b-chat:058333670f2a6e88cf1b29b8183405b17bb997767282f790b82137df8c090c1f",
            input={"prompt": prompt}
        )

        subtasks = [item for item in output]

        return "\n".join(subtasks)
    except Exception as e:
        return str(e)

if __name__ == "__main__":
    prompt = sys.argv[1]
    subtask = generate_subtasks(prompt)
    print(subtask)
