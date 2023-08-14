import requests
import os
from bardapi.constants import SESSION_HEADERS
from bardapi import Bard

token = "Zgjvyx14OftHpvaodJGX5b4taiA7A4kHj1PrOGIs2NH-G4g1q5LFyndcaT-5s00_LjIqMg."
token2 = "sidts-CjIBSAxbGafa6PuIKqxv1gWYFuSUIRd3mWl9WWZAiuM8uBXaVaegBCBq6GU7JRJo8U2U3RAA"
token3 = "APoG2W-Ljyds4NxDUW4bIHbj-LKo6K3oYSBHheK42QuC6z-Qmv8fgGHLfc_TMXvOP0I3_lXtwTPd"

session = requests.Session()
session.headers = SESSION_HEADERS
session.cookies.set("__Secure-1PSID", token)
session.cookies.set("__Secure-1PSIDTS", token2)
session.cookies.set("__Secure-1PSIDCC", token3)

bard = Bard(token=token, session=session)
answer = bard.get_answer("Who is the leader of the USA?")['content']
print(answer)