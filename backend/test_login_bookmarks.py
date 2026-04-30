import urllib.request
import urllib.parse
import json

BASE_URL = 'http://localhost:8000'
emails_to_try = ['test@example.com', 'user@example.com', 'admin@example.com']
password = 'password123'

print('=' * 60)
print('TEST 1: LOGIN ATTEMPTS')
print('=' * 60)

token = None
successful_email = None

for email in emails_to_try:
    print(f'\nTrying email: {email}')
    try:
        url = f'{BASE_URL}/api/auth/login/'
        data = json.dumps({'email': email, 'password': password}).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')
        
        with urllib.request.urlopen(req, timeout=5) as response:
            status_code = response.status
            response_data = json.loads(response.read().decode('utf-8'))
            
            print(f'Status Code: {status_code}')
            print(f'Response: {json.dumps(response_data, indent=2)}')
            
            if status_code == 200 and 'token' in response_data:
                token = response_data['token']
                successful_email = email
                print(f'? Login successful with {email}')
                break
    except urllib.error.HTTPError as e:
        print(f'HTTP Error: {e.code}')
        try:
            error_data = json.loads(e.read().decode('utf-8'))
            print(f'Error Response: {json.dumps(error_data, indent=2)}')
        except:
            print(f'Error Response: {e.read().decode("utf-8")}')
    except Exception as e:
        print(f'Error: {str(e)}')

print('\n' + '=' * 60)
print('TEST 2: GET BOOKMARKED POSTS')
print('=' * 60)

if token:
    print(f'\nUsing token from {successful_email}')
    try:
        url = f'{BASE_URL}/api/posts/bookmarked/'
        req = urllib.request.Request(url, headers={'Authorization': f'Token {token}'}, method='GET')
        
        with urllib.request.urlopen(req, timeout=5) as response:
            status_code = response.status
            response_data = json.loads(response.read().decode('utf-8'))
            
            print(f'Status Code: {status_code}')
            print(f'Response: {json.dumps(response_data, indent=2)}')
    except urllib.error.HTTPError as e:
        print(f'HTTP Error: {e.code}')
        try:
            error_data = json.loads(e.read().decode('utf-8'))
            print(f'Error Response: {json.dumps(error_data, indent=2)}')
        except:
            print(f'Error Response: {e.read().decode("utf-8")}')
    except Exception as e:
        print(f'Error: {str(e)}')
else:
    print('\nNo valid token obtained. Cannot test bookmarked posts.')
