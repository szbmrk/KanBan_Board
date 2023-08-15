import requests
import os
from bardapi.constants import SESSION_HEADERS
from bardapi import Bard

token = "ZwhHa56Xn8od9FBm_hGWBxOY7eW_rnGspMgzqG7vevoVvS0Ng0PjRRkcNoSHBbQIbLziCQ."
token2 = "sidts-CjIBSAxbGb_gfgQacQXcnTNvcmotlwrJrnErYbz64U0sX914lX7rdYqrpsCt-kHAiK4N1xAA"

session = requests.Session()
session.headers = SESSION_HEADERS
session.cookies.set("__Secure-1PSID", token)
session.cookies.set("__Secure-1PSIDTS", token2)

bard = Bard(token=token, session=session)
answer = bard.get_answer("Hello")['content']
print(answer)