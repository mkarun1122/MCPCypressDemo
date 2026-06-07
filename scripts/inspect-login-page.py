import requests
url = 'https://practicetestautomation.com/practice-test-login/'
r = requests.get(url, timeout=30)
print(r.status_code)
html = r.text
print('username=', 'id="username"' in html)
print('password=', 'id="password"' in html)
print('submit_button=', 'type="submit"' in html)
print('button_text=', 'Submit' in html)
print('form=', '<form' in html)
idx = html.find('id="username"')
if idx != -1:
    print(html[idx-120:idx+200])
else:
    print('username element not found')
