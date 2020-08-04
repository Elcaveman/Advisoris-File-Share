# import re
# from django.conf import settings
# from django.shortcuts import redirect

# class UserAccessMidleware:
#     """ This midleware makes sure that non logged in users can't access any url other than the ones
#     in EXEMPT_URLS list in django.settings """
#     def __init__(self, get_response):
#         #settings and definitions
#         self.get_response = get_response
#         #process EXEMPT URLS turning then to regex
#         self.EXEMPT_URLS = settings.EXEMPT_URLS + settings.LOGIN_URL

#     def __call__(self, request):
#         #pre-processing request (originates from upper layer)
#         response = self.get_response(request)
        
#         #post-processing request (originates from upper layer)
#         return response
    
#     def process_view(self, request, view_func, view_args, view_kwargs):
#         assert hasattr(request, 'user')#trows error if no user is logged in
#         path = request.path_info
#         if not request.user.is_authentiated:
#             if not (path in self.EXEMPT_URLS):
#                 return redirect(settings.LOGIN_URL)