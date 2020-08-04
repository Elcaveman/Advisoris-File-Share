# Register your models here.
from django.contrib import admin
from django.contrib.admin.options import *
from django.utils.translation import ugettext_lazy as _
from django.contrib.auth.admin import Group, UserAdmin

from fs.models import File, FilePool
from user.models import Client

from .forms import FilePoolForm, UserInfo,FileForm

#? admin.ModelAdmin
#? Custom templates (designed to be over-ridden in subclasses)
#     add_form_template = None
#     change_form_template = None
#     change_list_template = None
#     delete_confirmation_template = None
#     delete_selected_confirmation_template = None
#     object_history_template = None
#     popup_response_template = None
#? add to urls --> override get_url()
#? add to media --> add to the media proprety
 
#custom html
#change_list_template = 'admin/snippets/snippets_change_list.html'
class FileManagementAdmin(admin.ModelAdmin):
    # fieldsets = (('File Path',{'fields':(),}),
    # ('File Information',{'fields':('display_name','year',)}),
    # (None,{'fields':('file_pool','file_path')})
    # )
    # add_fieldsets = ( (None, {
    #         'classes': ('wide',),
    #         'fields': ('year',),
    #     }),)
    
    #! find some way to use file_pool to get owner for filtering by client
    list_display = ('display_name','year','filepool',)
    list_filter = ('filepool__owner__client_name','year')
    search_fields = ('display_name',)
    
    readonly_fields = ('creation_date',)

    # change_list_template = 'admin/snippets/change_list.html'
    # add_form_template = 'admin/snippets/add_form.html'
    # change_form_template = 'admin/snippets/change_form.html'

# Register your models here.
class ClientAdmin(UserAdmin):
    #you can add groups if you need to
    fieldsets = (('Personnal Info',{'fields':('client_name','email','password')}),
    ('Permissions',{'fields':(('is_active','is_staff','is_superuser'),'user_permissions')}),
    ('File tree',{'fields':('file_tree',)}),
    ('Extra information',{'fields':('IF','RDC', 'TP', 'ICE')}),
    ('Important Dates',{'fields':(('date_joined','last_login'))}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('client_name','email', 'password1', 'password2'),
        }),
    )
    list_display = ('client_name','email' ,'date_joined','is_staff')
    list_filter = ('is_staff', 'is_superuser', 'is_active')
    search_fields = ('email', 'client_name')
    ordering = ('email',)

    filter_horizontal = ('user_permissions',)
    readonly_fields = ('date_joined','last_login')
    

admin.site.register(Client , ClientAdmin)
admin.site.unregister(Group)
admin.site.register(FilePool)
admin.site.register(File , FileManagementAdmin)
