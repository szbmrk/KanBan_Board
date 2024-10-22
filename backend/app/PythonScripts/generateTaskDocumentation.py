# generateCode.py

import os
import requests
import sys
import json

def generate_documentation():
    api_key = os.environ.get('OPENAI_API_KEY')

    prompt = sys.argv[1]

    max_tokens = 5000 

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
            generated_documentation = code_json['choices'][0]['text']
        except (json.JSONDecodeError, KeyError) as e:
            return f"Error: parsing response: {e}"
    else:
        return f"Error: {response.status_code} - {response.text}"

    return generated_documentation

def clean_response(response):
    cleaned_response = response.replace('\n', ' ')
    cleaned_response = ' '.join(cleaned_response.split())
    return cleaned_response

if __name__ == "__main__":
    documentation = generate_documentation()
    cleaned_documentation = clean_response(documentation)
    print(cleaned_documentation)
