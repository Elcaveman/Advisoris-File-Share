from django.urls import path , include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register('clients',views.ClientView)
router.register('filepools',views.FilePoolView)
router.register('files',views.FileView)

urlpatterns = [
    path('',include(router.urls)),
]
#https://www.django-rest-framework.org/api-guide/authentication/#:~:text=Authentication%20is%20the%20mechanism%20of,the%20request%20should%20be%20permitted.
#https://github.com/consultIntrick/django-drive-storage
#https://djangostars.com/blog/configuring-django-settings-best-practices/
#https://preview.themeforest.net/item/materialize-material-design-admin-template/full_screen_preview/11446068?_ga=2.41344930.1218707581.1595518604-1837678558.1595351724
#https://stackoverflow.com/questions/17784037/how-to-display-pdf-file-in-html
#https://stackoverflow.com/questions/39673794/how-to-secure-apis-for-registration-and-login-in-django-rest-framework
#https://stackoverflow.com/questions/28007770/how-to-to-make-a-file-private-by-securing-the-url-that-only-authenticated-users
#https://docs.djangoproject.com/en/3.0/howto/deployment/wsgi/modwsgi/


def media_access(request, path):
    """
    When trying to access :
    myproject.com/media/uploads/image.png

    If access is authorized, the request will be redirected to
    myproject.com/protected/media/uploads/image.png

    This special URL will be handle by nginx we the help of X-Accel
    """

    access_granted = False

    user = request.user
    if user.is_authenticated():
        if user.is_staff:
            # If admin, everything is granted
            access_granted = True
        else:
            # For simple user, only their documents can be accessed
            user_documents = [
                user.identity_document,
                # add here more allowed documents
            ]

            for doc in user_documents:
                if path == doc.name:
                    access_granted = True

    if access_granted:
        response = HttpResponse()
        # Content-type will be detected by nginx
        del response['Content-Type']
        response['X-Accel-Redirect'] = '/protected/media/' + path
        return response
    else:
        return HttpResponseForbidden('Not authorized to access this media.')