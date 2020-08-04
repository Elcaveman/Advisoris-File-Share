from rest_framework import permissions
from user.models import Client
from fs.models import File , FilePool


class Perm(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to view it. and the staff to do anything else
    """
    def has_permission(self, request, view):
        # allow GET, HEAD or OPTIONS 'general' requests to staff only.
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        else:
            return request.user.is_staff

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # allow GET, HEAD or OPTIONS requests to owner of obj or staff.
        if request.method in permissions.SAFE_METHODS:
            if isinstance(obj,Client):bool_ =(obj == request.user)
            elif isinstance(obj,File):bool_ = (obj.filepool.owner == request.user)
            else:bool_ = (obj.owner ==request.user)#isinstance(obj,FilePool)

            return bool_ or request.user.is_staff
        # Write permissions are only allowed to staff.
        else:
            return request.user.is_staff
