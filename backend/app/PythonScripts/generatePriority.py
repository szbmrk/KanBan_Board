import os
import requests
import sys
import json

def generate_priority():
    api_key = os.environ.get('OPENAI_API_KEY')

    prompt = sys.argv[1]

    max_tokens = 5000  # Adjust this value based on your requirement

    headers = {
        'Authorization': f"Bearer {api_key}",
        'Content-Type': 'application/json',
    }

    data = {
        'prompt': prompt,
        'max_tokens': max_tokens,
    }

    response = requests.post('https://api.openai.com/v1/engines/gpt-3.5-turbo-instruct/completions', headers=headers, json=data)

    if response.status_code == 200:
        try:
            code_json = json.loads(response.text)
            generated_code = code_json['choices'][0]['text']  # Extract the generated text
            priority = generated_code.strip().split('\n')[-1]  # Extract the last line (priority)
        except (json.JSONDecodeError, KeyError, IndexError) as e:
            return f"Error: {e}"
    else:
        return f"Error: {response.text}"

    return priority

if __name__ == "__main__":
    priority = generate_priority()
    print(priority)
