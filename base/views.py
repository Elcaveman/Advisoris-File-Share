# from functools import wraps

# from django.contrib import messages
# from django.shortcuts import render
from rest_framework import status, viewsets
from .permissions import Perm
#from rest_framework.renderers import TemplateHTMLRenderer
from fs.models import File, FilePool
from user.models import Client

from .serializers import (ClientSerializer,FilePoolSerializer,FileSerializer)


#TODO: unit test the api views
#TODO: decorator to be tested!
#post methods can only be used by administrators
# def user_required(permition_type):
#     def inner_function(view):
#         @wraps(view)
#         def wrapper(request,*args,**kwargs):
#             if hasattr(request,'user'):
#                 if permition_type == 'superuser':
#                     permition_check = request.user.is_superuser

#                 elif permition_type == 'staff':
#                     permition_check = request.user.is_staff
                
#                 elif permition_type == 'user':
#                     #for user just check if he's connected
#                     permition_check = True
#                 else:
#                     permition_check == False

#                 if request.user.is_authenticated:
#                     if permition_check ==True:
#                         return view(request,*args,**kwargs)
                    
#             return Response({},status=status.HTTP_401_UNAUTHORIZED)
#         return wrapper
 #   return inner_function
#?new!!


class ClientView(viewsets.ModelViewSet):
    serializer_class = ClientSerializer
    http_method_names = ['get','put', 'head']
    permission_classes = (Perm,)
    queryset = Client.objects.all()
    
    def get_queryset(self):
        queryset = self.queryset
        if not self.request.user.is_staff:
            queryset = Client.objects.filter(pk=self.request.user.id)
        return queryset

class FilePoolView(viewsets.ModelViewSet):
    serializer_class = FilePoolSerializer
    permission_classes = (Perm,)
    queryset = FilePool.objects.all()

    def get_queryset(self):
        queryset = self.queryset
        if not self.request.user.is_staff:
            queryset = FilePool.objects.filter(owner=self.request.user)
        return queryset


class FileView(viewsets.ModelViewSet):
    serializer_class = FileSerializer
    permission_classes = (Perm,)
    queryset = File.objects.all()

    filter_fields = ('filepool','year')
    def get_queryset(self):
        queryset = self.queryset
        if not self.request.user.is_staff:
            queryset= File.objects.filter(filepool__owner=self.request.user)
        return queryset

# #view used for convinience
# def files_by_filepool(request , filepool_id):
#     if request.method == 'GET':
