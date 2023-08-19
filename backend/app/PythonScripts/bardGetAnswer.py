import requests
from bardapi.constants import SESSION_HEADERS
from bardapi import Bard
import sys

def get_bard_answer(prompt, token, token2):
    try:
        session = requests.Session()
        session.headers = SESSION_HEADERS
        session.cookies.set("__Secure-1PSID", token)
        session.cookies.set("__Secure-1PSIDTS", token2)

        bard = Bard(token=token, session=session)
        answer = bard.get_answer(prompt)['content']
        return answer
    except Exception as e:
        print("Error:", e)
        return None

if __name__ == "__main__":
    prompt = sys.argv[1]
    token = sys.argv[2]
    token2 = sys.argv[3]
    answer = get_bard_answer(prompt, token, token2)
    print(answer)