# subtask.py

import os
import requests
import sys
import json

def generate_subtasks():
    # Replace 'YOUR_API_KEY' with your actual ChatGPT API key or token
    api_key = os.environ.get('OPENAI_API_KEY')

    prompt = sys.argv[1]

    max_tokens = 5000  # Adjust this value based on your requirement

    try:
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

        if response.status_code != 200:
            return f"Error: {response.text}"


        responseData = response.json()

        if 'choices' in responseData and responseData['choices']:
            subtask = responseData['choices'][0]['message']['content']

            return eval(subtask)
        else:
            return 'Error: Invalid response from OpenAI API'
    except Exception as e:
        return f"Error: {e}"

if __name__ == "__main__":
    subtask = generate_subtasks()
    print(subtask)
