from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import register_view
from .serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

urlpatterns = [
    path("register/", register_view, name="register"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
]
