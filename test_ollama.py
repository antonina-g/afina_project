import requests
import json

response = requests.post('http://localhost:11434/api/chat', json={
    "model": "llama3.2:1b",
    "messages": [{"role": "user", "content": "JSON {\"test\": \"ollama работает\"}"}],
    "format": "json", "stream": False
})
print(response.json()['message']['content'])
