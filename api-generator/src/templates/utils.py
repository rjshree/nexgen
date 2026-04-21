def get_client_ip(request):
    """Extract client IP from request"""
    print("Extracting client IP from request headers",request.META.get('HTTP_X_FORWARDED_FOR'))
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def get_user_identifier(user):
    """Extract user identifier from user object"""
    if hasattr(user, 'first_name') and user.first_name:
        return user.first_name
    elif hasattr(user, 'email') and user.email:
        return user.email
    elif hasattr(user, 'username') and user.username:
        return user.username
    else:
        return 'system'