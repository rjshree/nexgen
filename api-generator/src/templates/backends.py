import requests
from django.conf import settings
from django.contrib.auth.backends import BaseBackend
import jwt
from jwt.algorithms import RSAAlgorithm
from rest_framework.exceptions import PermissionDenied
from .models import SSOUser
import logging
logger = logging.getLogger(__name__)
json_logger = logging.getLogger('audit')

class AccessTokenAuthBackend(BaseBackend):
    INVALID_ACCESS_TOKEN = "Invalid access token"

    def authenticate(self, request, access_token=None):
        # Validate the access token (e.g., using JWT library)
        allowed_groups = settings.ALLOWED_GROUPS
        token = request.headers.get('Authorization')
        if not access_token:
            if token:
                try:
                    access_token = token.split()[1]
                except IndexError:
                    raise PermissionDenied("User is not authorized")
            else:
                return
        claims = self.validate_access_token(access_token)
        if claims:
            # Extract user information from the token
            user = self.extract_user_info(claims)
            if not getattr(settings, 'UNDER_TEST', False):
                if not getattr(settings, 'UNDER_TEST', False):
                    self.get_obo_access_token(access_token)
                for group in allowed_groups:
                    if group in user.fqc_groups:
                        json_logger.info(
                            {'log_type': 'audit', 'event': 'authorization', 'outcome': 'SUCCESS', 'AD_GROUP': group,
                             'user': user.first_name, 'user_email': user.email, 'client_ip': user.client_ip,
                             "user-agent": request.headers.get("User-Agent")})
                        return (user, access_token)
                else:
                    json_logger.info(
                        {'log_type': 'audit', 'event': 'authorization', 'outcome': 'FAILED', 'AD_GROUP': group,
                         'message': 'Insufficient Privileges', 'client_ip': user.client_ip})
                    raise PermissionDenied("Insufficient Privileges")
            return (user, access_token)
        raise PermissionDenied("Invalid access token")

    def extract_user_info(self, claims):
        username = claims.get(settings.CLAIM_NAME)
        email = claims.get(settings.CLAIM_EMAIL)
        groups = claims.get(settings.CLAIM_GROUPS)
        client_ip = claims.get(settings.CLAIM_IPADDR)
        staff_id = claims.get(settings.CLAIM_STAFF_ID)
        user = SSOUser()
        user.fqc_groups = groups
        user.first_name = username
        user.email = email
        user.staff_id = staff_id
        user.client_ip = client_ip
        return user

    def load_openid_config(self, access_token):
        try:
            print("Trying to get OpenID Connect config from %s", settings.OPENID_METADATA_URL)
            response = requests.get(settings.OPENID_METADATA_URL, timeout=5, verify=False)
            response.raise_for_status()
            openid_cfg = response.json()

            jwks_response = requests.get(openid_cfg["jwks_uri"], timeout=5, verify=False).json()
            response.raise_for_status()
            access_token_header = jwt.get_unverified_header(access_token)
            key = next((k for k in jwks_response['keys'] if k['kid'] == access_token_header['kid']), None)

            if not key:
                raise TypeError("Signing key not found")
            public_key = RSAAlgorithm.from_jwk(key)
            return public_key
        except Exception as e:
            print(e)

    def validate_access_token(self, access_token):
        signing_keys = self.load_openid_config(access_token)
        verify_token = not getattr(settings, 'UNDER_TEST', False)
        try:
            options = {
                'verify_signature': verify_token,
                'verify_exp': verify_token,
                'verify_nbf': verify_token,
                'verify_iat': verify_token,
                'verify_aud': verify_token,
                'verify_iss': True,
                'require_exp': False,
                'require_iat': False,
                'require_nbf': False
            }
            # Validate token and return claims
            return jwt.decode(
                access_token,
                key=signing_keys,
                algorithms=settings.ALGORITHM,
                audience=settings.API_AUDIENCE,
                options=options,
            )
        except jwt.ExpiredSignatureError as err:
            print(err)
            raise PermissionDenied(self.INVALID_ACCESS_TOKEN)
        except jwt.InvalidTokenError as error:
            print(error)
            raise PermissionDenied(self.INVALID_ACCESS_TOKEN)

    def get_obo_access_token(self, access_token):
        """
        Gets an On Behalf Of (OBO) access token, which is required to make queries against MS Graph

        Args:
            access_token (str): Original authorization access token from the user

        Returns:
            obo_access_token (str): OBO access token that can be used with the MS Graph API
        """

        data = {
            "grant_type": settings.OBO_GRANT_TYPE,
            "client_id": settings.AZURE_CLIENT_ID,
            "client_secret": settings.AZURE_CLIENT_SECRET,
            "assertion": access_token,
            "requested_token_use": "on_behalf_of",
        }
        if settings.OAUTH2_TOKEN_URL.endswith("/v2.0/token"):
            data["scope"] = 'GroupMember.Read.All'
        else:
            data["resource"] = 'https://graph.microsoft.com'

        response = requests.post(settings.OAUTH2_TOKEN_URL, data=data, timeout=5, verify=False)
        # 200 = valid token received
        # 400 = 'something' is wrong in our request
        if response.status_code == 400:
            print("ADFS server returned an error: %s", response.json()["error_description"])
            return None

        if response.status_code != 200:
            print("Unexpected ADFS response: %s", response.content.decode())
            raise PermissionDenied(self.INVALID_ACCESS_TOKEN)

        obo_access_token = response.json()["access_token"]
        return obo_access_token

    def fetch_user_groups(self, obo_access_token, user_id):
        headers = {
            "Authorization": f"Bearer {obo_access_token}",
            "Content-Type": "application/json"
        }
        url = "https://graph.microsoft.com/v1.0/users/<USER_OBJECT_ID>/memberOf".replace("<USER_OBJECT_ID>", user_id)
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()

        groups = []
        for item in data.get("value", []):
            # Filter to only directory groups
            if item["@odata.type"] == "#microsoft.graph.group":
                groups.append(item["id"])

        return groups

    def authenticate_header(self, request):
        return "Bearer"
