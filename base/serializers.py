from user.models import Client
from fs.models import File,FilePool
from rest_framework import serializers

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'url','client_name','file_tree','filepools']

class FilePoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = FilePool
        fields = ['id' ,'url', 'path' , 'owner']

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['id' ,'url','display_name','file_path','filepool' , 'year' ,'creation_date']