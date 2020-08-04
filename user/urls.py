from django.urls import path
from django.contrib.auth import views as auth_views

from . import views as v

urlpatterns = [
    path('',v.home , name='index'),
    path('login/',v.login_view, name='login'),
    path('logout/',v.logout_view , name='logout'),

    path('reset_password/' , auth_views.PasswordResetView.as_view(template_name='user/recup/reset_password.html'),
    name = "reset_password"),
    path('reset_password_sent/' , auth_views.PasswordResetDoneView.as_view(template_name='user/recup/password_reset_done.html')
    ,name='password_reset_done'),
    
    path('reset/<uidb64>/<token>/' , auth_views.PasswordResetConfirmView.as_view(template_name='user/recup/password_reset_confirm.html') ,
    name='password_reset_confirm'),
    path('reset_password_complete/' , auth_views.PasswordResetCompleteView.as_view(template_name='user/recup/password_reset_complete.html'),
    name='password_reset_complete'),
    
]
 
#? Class-based password reset views in auth.views module
# - PasswordResetView sends the mail
# - PasswordResetDoneView shows a success message for the above
# - PasswordResetConfirmView checks the link the user clicked and
#   prompts for a new password
# - PasswordResetCompleteView shows a success message for the above
