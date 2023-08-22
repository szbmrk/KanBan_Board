import openai
import sys
import json

def generate_gpt_response(prompt):
    openai.api_key = "api kulcs"  # Tedd ide az OpenAI API kulcsodat

    print("Received prompt:", prompt)  # Új sor hozzáadva

    response = openai.Completion.create(
        engine="text-davinci-003",  # Vagy másik chatGPT engine, amit preferálsz
        prompt=prompt,
        max_tokens=150
    )

    print("Generated response:", response.choices[0].text.strip())  # Új sor hozzáadva

    return response.choices[0].text.strip()

if __name__ == "__main__":
    prompt = sys.argv[1]  # Kapott prompt a controllerből

    print("Running script with prompt:", prompt)  # Új sor hozzáadva

    response = generate_gpt_response(prompt)
    print("Final response:", response)  # Új sor hozzáadva

    print("Script finished.")  # Új sor hozzáadva