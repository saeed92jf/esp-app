import json
data = json.load(open('messages/en.json', 'r', encoding='utf-8'))
print(list(data.keys()))
