from django.urls import path
from . import views as v

urlpatterns = [
    path('',v.dashboard , name='dashboard'),
    #TODO:path('<int:file_id>/' , v.file_display , name= 'file_display'),

    #notification pop-up in JS using APIurls
    #auto-generated ddl link for one file
    #auto generatred ddl link for multiple files (.zip format)

]
