#!/usr/bin/env python
"""
Diagnostic script to check frontend-backend connection issues
"""
import sys
import os
import json

# Add project to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("=" * 70)
print("🔍 NEUROGGUARDIAN FRONTEND-BACKEND CONNECTION DIAGNOSTIC")
print("=" * 70)

# 1. Check Django Configuration
print("\n1️⃣  CHECKING DJANGO CONFIGURATION...")
try:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stroke_risk_prediction.settings')
    import django
    django.setup()
    from django.conf import settings
    
    print("   ✅ Django initialized successfully")
    print(f"   📍 DEBUG: {settings.DEBUG}")
    print(f"   📍 ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")
    print(f"   📍 INSTALLED_APPS: {len(settings.INSTALLED_APPS)} apps installed")
    
    # Check if api app is installed
    if 'api' in settings.INSTALLED_APPS:
        print("   ✅ 'api' app is installed")
    else:
        print("   ❌ 'api' app NOT found in INSTALLED_APPS")
        
except Exception as e:
    print(f"   ❌ Django setup failed: {e}")
    sys.exit(1)

# 2. Check CORS Configuration
print("\n2️⃣  CHECKING CORS CONFIGURATION...")
try:
    cors_allowed = getattr(settings, 'CORS_ALLOWED_ORIGINS', [])
    cors_all = getattr(settings, 'CORS_ALLOW_ALL_ORIGINS', False)
    
    print(f"   📍 CORS_ALLOW_ALL_ORIGINS: {cors_all}")
    print(f"   📍 CORS_ALLOWED_ORIGINS: {cors_allowed}")
    print(f"   📍 CORS Middleware: {'ENABLED' if 'api.cors_middleware.SimpleCorsMiddleware' in settings.MIDDLEWARE else 'NOT ENABLED'}")
    
    if cors_all or 'http://localhost:3000' in cors_allowed:
        print("   ✅ Frontend (localhost:3000) is allowed")
    else:
        print("   ⚠️  Frontend might not be allowed - check CORS_ALLOWED_ORIGINS")
        
except Exception as e:
    print(f"   ⚠️  Could not check CORS: {e}")

# 3. Check API URLs
print("\n3️⃣  CHECKING API URLS...")
try:
    from django.urls import get_resolver
    resolver = get_resolver()
    
    api_patterns = []
    for pattern in resolver.url_patterns:
        pattern_str = str(pattern.pattern)
        if 'api' in pattern_str:
            api_patterns.append(pattern_str)
    
    if api_patterns:
        print(f"   ✅ Found {len(api_patterns)} API URL pattern(s)")
        for p in api_patterns[:5]:  # Show first 5
            print(f"      - {p}")
    else:
        print("   ❌ No 'api/' URL pattern found!")
        print("   💡 Make sure api.urls is included in stroke_risk_prediction/urls.py")
        
except Exception as e:
    print(f"   ❌ Error checking URLs: {e}")

# 4. Check API Endpoints
print("\n4️⃣  CHECKING API ENDPOINTS...")
try:
    from api import urls as api_urls
    
    print(f"   ✅ API URLs module loaded")
    if hasattr(api_urls, 'urlpatterns'):
        print(f"   ✅ Found {len(api_urls.urlpatterns)} endpoints")
        for pattern in api_urls.urlpatterns[:10]:
            print(f"      - /api/{pattern.pattern}")
    else:
        print("   ❌ No urlpatterns in api.urls")
        
except Exception as e:
    print(f"   ❌ Error loading API endpoints: {e}")

# 5. Check Database
print("\n5️⃣  CHECKING DATABASE...")
try:
    from django.db import connection
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
    print("   ✅ Database connection successful")
except Exception as e:
    print(f"   ❌ Database connection failed: {e}")

# 6. Check Frontend API.js Configuration
print("\n6️⃣  CHECKING FRONTEND API CONFIGURATION...")
try:
    with open('frontend/src/services/api.js', 'r') as f:
        content = f.read()
        if '127.0.0.1:8000' in content or 'localhost:8000' in content:
            print("   ✅ Frontend API URL points to backend (port 8000)")
        else:
            print("   ⚠️  Frontend API URL might be incorrect")
            
        if 'axios' in content:
            print("   ✅ Using axios for API calls")
except Exception as e:
    print(f"   ⚠️  Could not check frontend config: {e}")

# 7. Connection Test Summary
print("\n" + "=" * 70)
print("📋 CONNECTION TEST SUMMARY")
print("=" * 70)
print("""
To connect frontend and backend:

1. START BACKEND:
   Command: py manage.py runserver
   URL: http://127.0.0.1:8000
   
2. START FRONTEND:
   Command: cd frontend && npm start
   URL: http://localhost:3000
   
3. VERIFY CONNECTION:
   - Open browser console (F12)
   - Check if API calls show 2xx responses
   - Frontend should call http://127.0.0.1:8000/api/*
   
4. CHECK LOGS:
   - Backend: Django console for errors
   - Frontend: Browser console for fetch errors
   
5. COMMON ISSUES:
   - CORS not allowing localhost:3000
   - Backend not running or wrong port
   - API endpoints not defined
   - Database not initialized (run migrations)
""")

print("=" * 70)
print("✅ DIAGNOSTIC COMPLETE")
print("=" * 70)
