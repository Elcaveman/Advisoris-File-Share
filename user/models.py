from django.db import models
from django.core.mail import send_mail
from django.contrib import auth
from django.contrib.auth.models import PermissionsMixin 

from django.contrib.auth.base_user import AbstractBaseUser,BaseUserManager
from django.contrib.auth.models import timezone,User

#from django.contrib.postgres.fields import JSONField

class ClientManager(BaseUserManager):

    def _create_user(self,email,client_name, password, **extra_fields):
        """
        Create and save a user with the given client_name, email, and password.
        """
        if not email:
            raise ValueError('Email is mandatory')
        email = self.normalize_email(email)
        user = self.model(client_name=client_name, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email,client_name=None,password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email,client_name, password, **extra_fields)

    def create_superuser(self, email, client_name=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email,client_name, password, **extra_fields)

    def with_perm(self, perm, is_active=True, include_superusers=True, backend=None, obj=None):
        if backend is None:
            backends = auth._get_backends(return_tuples=True)
            if len(backends) == 1:
                backend, _ = backends[0]
            else:
                raise ValueError(
                    'You have multiple authentication backends configured and '
                    'therefore must provide the `backend` argument.'
                )
        elif not isinstance(backend, str):
            raise TypeError(
                'backend must be a dotted import path string (got %r).'
                % backend
            )
        else:
            backend = auth.load_backend(backend)
        if hasattr(backend, 'with_perm'):
            return backend.with_perm(
                perm,
                is_active=is_active,
                include_superusers=include_superusers,
                obj=obj,
            )
        return self.none()

#*
class Client(AbstractBaseUser, PermissionsMixin):
    #Required fields
    client_name = models.CharField(
        verbose_name = 'Client name',
        max_length=150,
        help_text='150 characters or fewer.',
        blank=True,
        null=True,
    )
    
    email = models.EmailField(
        verbose_name = 'email address',
        max_length=150,
        unique=True,
        help_text='Required.example: sample@xyz.com',
        error_messages={
            'unique': "A client with that email already exists.",
        },
    )
    #status fields
    is_staff = models.BooleanField(
        verbose_name = 'staff status',
        default=False,
        help_text='Designates whether the user can log into this admin site.',
    )
    is_active = models.BooleanField(
        verbose_name = 'active',
        default=True,
        help_text=
            'Designates whether this user should be treated as active.Unselect this instead of deleting accounts.'
        ,
    )
    #Specific user file tree
    #file_tree = JSONField("File Tree",blank=True,null=True)
    file_tree = models.TextField("File Tree",blank = True , null = True)#JSONField()
    #extra information (client data)
    date_joined = models.DateTimeField(verbose_name='Date joined', default=timezone.now)
    IF = models.CharField("IF", max_length=50,null=True)
    RDC = models.CharField("RDC", max_length=50,null=True)
    TP = models.CharField("TP", max_length=50,null=True)
    ICE =models.CharField("ICE", max_length=50,null=True)

    #pre-loaded manager
    objects = ClientManager()

    #Set username_field to get django admin and manage.py extra functionnality
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def clean(self):
        super().clean()
        self.email = self.__class__.objects.normalize_email(self.email)

    def email_user(self, subject, message, from_email=None, **kwargs):
        """Send an email to this user."""
        send_mail(subject, message, from_email, [self.email], **kwargs)

    def __str__(self):
        if self.client_name is None:
            return 'admin'
        else:
            return self.client_name