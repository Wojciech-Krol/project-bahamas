import urllib.request
import os

os.makedirs(r'c:\Users\wojte\bahamy\project-bahamas\stitch_Designs', exist_ok=True)

downloads = [
    ("hakuna_adults.html", "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2Y1N2IwOTM4OTUzZTQwYzJhNjI1NzllOWZhOWIzYWYyEgsSBxCew5immhIYAZIBIwoKcHJvamVjdF9pZBIVQhM4NDgzOTgwMTk0ODQyMDQyMjMy&filename=&opi=89354086"),
    ("hakuna_reorganized.html", "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzU0Nzc4M2E3NGViNTRhM2U4ZWE4ZTQ4ZjQ4YWE2ZjhhEgsSBxCew5immhIYAZIBIwoKcHJvamVjdF9pZBIVQhM4NDgzOTgwMTk0ODQyMDQyMjMy&filename=&opi=89354086"),
    ("hakuna_teens.html", "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzhiNTNkZmIxYjBkMjQ5YjFiMjA1ZTJhNmRlNzQyNmYwEgsSBxCew5immhIYAZIBIwoKcHJvamVjdF9pZBIVQhM4NDgzOTgwMTk0ODQyMDQyMjMy&filename=&opi=89354086"),
    ("hakuna_kids.html", "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzRlZDkzZTJmZDc4ZjQ4MzI5NTliMTY5OWM5MTUwMTU1EgsSBxCew5immhIYAZIBIwoKcHJvamVjdF9pZBIVQhM4NDgzOTgwMTk0ODQyMDQyMjMy&filename=&opi=89354086"),
    ("hakuna_map.html", "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2I2YjMxYzIzZjI4MTQ2N2FiNzIzYjM2YWNhOWM1MTAxEgsSBxCew5immhIYAZIBIwoKcHJvamVjdF9pZBIVQhM4NDgzOTgwMTk0ODQyMDQyMjMy&filename=&opi=89354086"),
    ("hakuna_class_details.html", "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2FhMjJkYzM4ZmE1NzRjMzJiZTU1NjdhNGMyOTE1NzI5EgsSBxCew5immhIYAZIBIwoKcHJvamVjdF9pZBIVQhM4NDgzOTgwMTk0ODQyMDQyMjMy&filename=&opi=89354086"),
    ("hakuna_user_dash.html", "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzFmYzBhYTNhZjlkNDRlMTdiYTIxMjk5YjY0OTkyYWUwEgsSBxCew5immhIYAZIBIwoKcHJvamVjdF9pZBIVQhM4NDgzOTgwMTk0ODQyMDQyMjMy&filename=&opi=89354086"),
    ("hakuna_partner_dash.html", "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2E5YjA2YmE0NWVkNjRhNTA4YmEyNzBmYjIyYTllMTdjEgsSBxCew5immhIYAZIBIwoKcHJvamVjdF9pZBIVQhM4NDgzOTgwMTk0ODQyMDQyMjMy&filename=&opi=89354086")
]

req = urllib.request.build_opener()
req.addheaders = [('User-agent', 'Mozilla/5.0')]

for name, url in downloads:
    path = os.path.join(r'c:\Users\wojte\bahamy\project-bahamas\stitch_Designs', name)
    try:
        with req.open(url) as response, open(path, 'wb') as out_file:
            data = response.read()
            out_file.write(data)
        print(f"Downloaded {name}")
    except Exception as e:
        print(f"Error downloading {name}: {e}")
