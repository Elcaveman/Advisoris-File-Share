from django.db import models

# Create your models here.
#helper functions
def file_directory_path(instance, filename):
        # file will be uploaded to MEDIA_ROOT/uploads/user_<id>/<filename>
        return f'uploads/user_{instance.get_user.id}/{instance.year}/{filename}'

class FilePool(models.Model):
    #node_code is the id of the FilePool since it auto increments and never change on delete
    owner = models.ForeignKey("user.Client", verbose_name="Client id", on_delete=models.CASCADE , related_name='filepools')
    path = models.CharField(max_length=200, blank=True, null=True)
    def __str__(self):
        return self.path

    def file_count(self):
        #returns number of files in the pool
        return File.objects.filter(filepool=self.id).count()

    def delete_if_empty(self):
        #better use of this is to delete the pool id from the node
        if self.file_count() == 0:
            self.delete()
    

class File(models.Model):
    #important information
    filepool = models.ForeignKey("FilePool", verbose_name="File Pool", on_delete=models.CASCADE,related_name='files')
    file_path = models.FileField(verbose_name='File',upload_to=file_directory_path)
    #extra information
    display_name = models.CharField(verbose_name='File Name',null=True,blank=True,max_length=50)
    year = models.IntegerField()#The year attribute of the file (billan de 2009)
    #timestamp informations about the file
    creation_date = models.DateField(auto_now_add=True)#date this file got added to the DB
    @property
    def get_user(self):
        return self.filepool.owner
    @property
    def filename(self):
        if self.display_name == None:
            #the t('/')[-1] gets the filename from the path
            #the .split('.')[0] gets rid of the extension
            return self.file_path.name.split('/')[-1].split('.')[0]
        return self.display_name
    def __str__(self):
        return self.filename
    def delete(self,*args,**kwargs):
        self.file_path.delete()
        super().delete(*args,**kwargs)