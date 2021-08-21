import requests
import re

url = 'https://www.celestrak.com/NORAD/elements/visual.txt'
raw = requests.get(url).text
data = raw.split('\n')

i = 0
info = {}
while i < len(data):
  try:
    title = data[i].strip()
    title = re.sub('[^0-9a-zA-Z]+', '_', title)
    title = title.replace('__', '_').strip('_')
    if (re.match('^[0-9]', title)):
      title = 'SAT_' + title
    tle1 = data[i + 1].strip()
    tle2 = data[i + 2].strip()
    info[title] = (tle1, tle2)
  except Exception as e:
    print(e)
  i = i + 3

for (k, v) in info.items():
  print(f'const {k} = [')
  print(f'  \'{v[0]}\',')
  print(f'  \'{v[1]}\',')
  print('];')
  print()

for i, k in enumerate(info.keys()):
  print(f"new Satellite(universe, 'crypto{i}', {k}[0], {k}[1]);")



