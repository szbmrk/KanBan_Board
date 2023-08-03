# subtask.py

import requests

def generate_subtasks():
    # Replace 'YOUR_API_KEY' with your actual ChatGPT API key or token
    api_key = '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'

    task = 'Create a kanban board'
    column = 'To Do'

    # Extract the prompt
    prompt = f"Generate kanban tickets for {task}. Write estimations to the tickets as well and add a tag to each ticket. The tickets should be in the column '{column}'. Write a description to each of them as well"

    max_tokens = 100  # Adjust this value based on your requirement

    try:
        headers = {
            'Authorization': f"Bearer {api_key}",
            'Content-Type': 'application/json',
        }

        data = {
            'prompt': prompt,
            'max_tokens': max_tokens,
        }

        response = requests.post('https://api.openai.com/v1/engines/text-davinci-003/completions', headers=headers, json=data)

        responseData = response.json()

        if 'choices' in responseData and responseData['choices']:
            # Handle the response here (e.g., extract the generated subtask from the response).
            subtask = responseData['choices'][0]['text']

            return subtask
        else:
            return 'Invalid response from OpenAI API'
    except Exception as e:
        return str(e)

if __name__ == "__main__":
    subtask = generate_subtasks()
    print(subtask)
