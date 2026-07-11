from django.urls import path
from accounts.views import UserProfileView
from rest_framework_simplejwt.views import(
    TokenRefreshView,
    TokenObtainPairView
)

urlpatterns=[
    path('profile/',UserProfileView.as_view(),name='profile'),
    path('token/',TokenObtainPairView.as_view(),name='token_obtain_pair'),
    path('token/refresh/',TokenRefreshView.as_view(),name='token_refresh')
]