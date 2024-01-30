import requests
from bardapi.constants import SESSION_HEADERS
from bardapi import Bard
import sys
import os

def get_bard_answer(prompt):
    try:
        token = os.environ.get('BARD_TOKEN')
        token2 = os.environ.get('BARD_TOKEN2')
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
    answer = get_bard_answer(prompt)
    print(answer)