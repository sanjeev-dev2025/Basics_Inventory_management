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