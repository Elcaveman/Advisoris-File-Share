from django import forms
from .models import Client

class AuthenticationForm(forms.Form):
    """
    Base class for authenticating users. Extend this to get a form that accepts
    username/password logins.

    """
    email = forms.EmailField(label="Email",widget=forms.TextInput(attrs={
        'class':"validate",
        'name':"",
        'placeholder':"Email",
        'autofocus': True
        }))
    password = forms.CharField(
        label="Password",
        strip=False,
        widget=forms.PasswordInput(attrs={
            'class':"validate",
            'placeholder':"Password",
            'autocomplete': 'current-password'}),
    )
