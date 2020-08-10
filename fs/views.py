from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth.decorators import login_required

@login_required(login_url='/login/')
@ensure_csrf_cookie
def dashboard(request):
    return render(request , 'fs/dashboard.html')