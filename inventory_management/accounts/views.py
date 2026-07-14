from django.shortcuts import render
from accounts.serializers import UserSerializer
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
# Create your views here.
from rest_framework.response import Response

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

from rest_framework import viewsets, permissions
from accounts.models import User
from accounts.serializers import UserManagementSerializer

class IsManager(permissions.BasePermission):
    """
    Allows access only to managers or superusers.
    """
    def has_permission(self, request, view):
        return bool(request.user and (request.user.is_superuser or request.user.role == 'MANAGER'))

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-id')
    serializer_class = UserManagementSerializer
    permission_classes = [IsAuthenticated, IsManager]