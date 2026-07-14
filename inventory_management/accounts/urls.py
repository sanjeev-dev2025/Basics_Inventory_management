from django.urls import path
from accounts.views import UserProfileView, UserViewSet
from rest_framework_simplejwt.views import(
    TokenRefreshView,
    TokenObtainPairView
)
from rest_framework.routers import DefaultRouter
from django.urls import path, include

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns=[
    path('', include(router.urls)),
    path('profile/',UserProfileView.as_view(),name='profile'),
    path('token/',TokenObtainPairView.as_view(),name='token_obtain_pair'),
    path('token/refresh/',TokenRefreshView.as_view(),name='token_refresh')
]