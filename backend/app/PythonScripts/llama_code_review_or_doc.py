# llama_subtask.py

import os
import replicate
import sys

def generate_agi_response(prompt):
    try:
        output = replicate.run(
            "a16z-infra/llama-2-13b-chat:2a7f981751ec7fdf87b5b91ad4db53683a98082e9ff7bfd12c8cd5ea85980a52",
            input={"prompt": prompt}
        )

        responses = [item for item in output]

        return "\n".join(responses)
    except Exception as e:
        return "Error: " + str(e)

if __name__ == "__main__":
    prompt = sys.argv[1]
    response = generate_agi_response(prompt)
    print(response)
