import urllib.request
import urllib.error
import json

# URL de base
BASE_URL = "http://localhost:8000"

# 1. Login pour obtenir le token
print("=== ÉTAPE 1: Obtention du token ===")
login_url = f"{BASE_URL}/api/auth/login/"
login_data = {"username": "test", "password": "test"}
login_json = json.dumps(login_data).encode('utf-8')

try:
    req = urllib.request.Request(login_url, data=login_json, method='POST')
    req.add_header('Content-Type', 'application/json')
    
    with urllib.request.urlopen(req) as response:
        login_response = json.loads(response.read().decode('utf-8'))
        print(f"Status Code: {response.status}")
        print(f"Response Body:")
        print(json.dumps(login_response, indent=2))
        
        token = login_response.get('access')
        if not token:
            print("Erreur: Pas de token access dans la reponse")
            exit(1)
        
        print(f"\nToken obtenu: {token[:20]}...")
        
        # 2. Tester l'endpoint bookmarked avec le token
        print("\n=== ÉTAPE 2: Test de l'endpoint /api/posts/bookmarked/ ===")
        bookmarked_url = f"{BASE_URL}/api/posts/bookmarked/"
        
        req = urllib.request.Request(bookmarked_url, method='GET')
        req.add_header('Authorization', f'Bearer {token}')
        req.add_header('Content-Type', 'application/json')
        
        with urllib.request.urlopen(req) as response:
            bookmarked_response = json.loads(response.read().decode('utf-8'))
            print(f"Status Code: {response.status}")
            print(f"Response Body:")
            print(json.dumps(bookmarked_response, indent=2))
            
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.reason}")
    try:
        error_body = json.loads(e.read().decode('utf-8'))
        print(f"Error Response:")
        print(json.dumps(error_body, indent=2))
    except:
        print(e.read().decode('utf-8'))
        
except Exception as e:
    print(f"Erreur: {e}")
