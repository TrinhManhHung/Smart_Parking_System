#!/usr/bin/env python3
"""
Test script để kiểm tra authentication flow
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_register_and_login():
    # Test data
    test_user = {
        "email": "test@example.com",
        "password": "testpassword123"
    }
    
    print("🧪 Testing authentication flow...")
    
    # Test registration
    print("\n1. Testing registration...")
    try:
        register_response = requests.post(f"{BASE_URL}/register", json=test_user)
        print(f"Register status: {register_response.status_code}")
        
        if register_response.status_code == 200:
            register_data = register_response.json()
            print(f"✅ Registration successful! Token: {register_data.get('access_token', 'N/A')[:20]}...")
        else:
            print(f"❌ Registration failed: {register_response.text}")
            return
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure services are running with 'docker-compose up'")
        return
    
    # Test login with same credentials
    print("\n2. Testing login with same credentials...")
    try:
        login_response = requests.post(f"{BASE_URL}/login", json=test_user)
        print(f"Login status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            login_data = login_response.json()
            print(f"✅ Login successful! Token: {login_data.get('access_token', 'N/A')[:20]}...")
        else:
            print(f"❌ Login failed: {login_response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server")

if __name__ == "__main__":
    test_register_and_login()