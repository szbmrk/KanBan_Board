import os
import requests
import sys
import json

def generate_code():
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
            generated_code = code_json['choices'][0]['message']['content']
        except (json.JSONDecodeError, KeyError) as e:
            return f"Error: {e}"
    else:
        return f"Error: {response.text}"
    
    return generated_code

def clean_response(response):
    cleaned_response = response.replace('\n', ' ')
    cleaned_response = ' '.join(cleaned_response.split())
    return cleaned_response


if __name__ == "__main__":
    code = generate_code()
    cleaned_code = clean_response(code)
    print(cleaned_code)
