from django.shortcuts import redirect
from django.contrib.auth.models import User

def index(request):
    user = request.user
    if user.is_authenticated:
        url = "/football"
    else:
        url = "/accounts/login"
    print(url)
    return redirect(url)
    
