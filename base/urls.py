from django.urls import path , include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register('clients',views.ClientView)
router.register('filepools',views.FilePoolView)
router.register('files',views.FileView)


urlpatterns = [
    path('',include(router.urls)),
    path('filepool_cleaner/<int:id>/',views.filepool_clean)
]
#https://www.django-rest-framework.org/api-guide/authentication/#:~:text=Authentication%20is%20the%20mechanism%20of,the%20request%20should%20be%20permitted.
#https://github.com/consultIntrick/django-drive-storage
#https://djangostars.com/blog/configuring-django-settings-best-practices/
#https://preview.themeforest.net/item/materialize-material-design-admin-template/full_screen_preview/11446068?_ga=2.41344930.1218707581.1595518604-1837678558.1595351724
#https://stackoverflow.com/questions/17784037/how-to-display-pdf-file-in-html
#https://stackoverflow.com/questions/39673794/how-to-secure-apis-for-registration-and-login-in-django-rest-framework
#https://stackoverflow.com/questions/28007770/how-to-to-make-a-file-private-by-securing-the-url-that-only-authenticated-users
#https://docs.djangoproject.com/en/3.0/howto/deployment/wsgi/modwsgi/