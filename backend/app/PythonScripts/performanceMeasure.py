import sys
import json
import requests

def generate_gpt_response(api_key, prompt):
    max_tokens = 3000

    prompt = "hello world in python"
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
            output = code_json['choices'][0]['message']['content']
        except (json.JSONDecodeError, KeyError) as e:
            return f"Error: {e}"
    else:
        return f"Error: {response.text}"
    
    return output

if __name__ == "__main__":
    prompt = sys.argv[1]
    api_key = sys.argv[2]

    response = generate_gpt_response(api_key, prompt)
    print(response)
