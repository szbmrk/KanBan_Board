import os
import requests
import sys
import json

def generate_priority():
    prompt = sys.argv[1]
    api_key = sys.argv[2]

    max_tokens = 3000  # Adjust this value based on your requirement

    headers = {
        'Authorization': f"Bearer {api_key}",
        'Content-Type': 'application/json',
    }

    data = {
        'model': 'gpt-3.5-turbo',
        'messages': [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        'max_completion_tokens': max_tokens
    }

    response = requests.post('https://api.openai.com/v1/chat/completions', headers=headers, json=data)

    if response.status_code == 200:
        try:
            code_json = json.loads(response.text)
            generated_code = code_json['choices'][0]['message']['content']  # Extract the generated text
            #priority = generated_code.strip().split('\n')[-1]  # Extract the last line (priority)
        except (json.JSONDecodeError, KeyError, IndexError) as e:
            print(f"Error: {e}")
    else:
        print(f"Error: {response.text}")

    return generated_code

if __name__ == "__main__":
    priority = generate_priority()
    print(priority)
