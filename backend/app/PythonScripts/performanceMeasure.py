import openai
import sys
import json

def generate_gpt_response(api_key, prompt):
    openai.api_key = api_key

    response = openai.Completion.create(
        engine="gpt-3.5-turbo-instruct",
        prompt=prompt,
        max_completion_tokens=5000
    )

    return response.choices[0].text.strip()

if __name__ == "__main__":
    prompt = sys.argv[1]
    api_key = sys.argv[2]

    response = generate_gpt_response(api_key, prompt)
    print(response)
