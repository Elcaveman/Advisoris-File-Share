from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.shortcuts import redirect, render

from .forms import AuthenticationForm
from .models import Client

#just a litle decorator that checks if user is loged in if he is goes to profile else it performs the view
def no_user_required(view):
    def wrapper(request):
        if request.user.is_authenticated:
            return redirect('/')
        else:
            return view(request)
    return wrapper


@login_required
def home(request):
    if request.user.is_staff:
        return redirect('/admin/')
    return render(request ,'user/index.html')

@no_user_required
def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request.POST)
        if form.is_valid():
            user = authenticate(request , **form.cleaned_data)
            if user is None:
                messages.error(request,'Login failed! password or email are incorrect')
            else:
                name = user.client_name if user.is_staff ==False else 'Admin'
                messages.success(request , 'Welcome {}'.format(name))
                login(request,user)
                return redirect('/')
    else:
        form = AuthenticationForm()
    return render(request , 'user/login.html' , {'form':form})    

@login_required(login_url='/login/')
def logout_view(request):
    logout(request)
    messages.info(request,'Logout successful!')
    return redirect('/')
