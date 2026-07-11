
from accounts.permissions import IsManager,IsCashier    
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from rest_framework import generics
from inventory.models import Category,Product
from inventory.filters import ProductFilter
from inventory.serializers import CategorySerializer,ProductSerializer  
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend
class CategoryListCreateAPIView(generics.ListCreateAPIView):
    queryset=Category.objects.all()
    serializer_class=CategorySerializer
    def get_permissions(self):
        if self.request.method=='GET':
            return [IsAuthenticated()]
        return [IsManager(),IsAdminUser()]
class ProductListCreateAPIView(generics.ListCreateAPIView):
    queryset=Product.objects.all()
    serializer_class=ProductSerializer
    filter_class=ProductFilter
    filter_backends=[DjangoFilterBackend,filters.SearchFilter,filters.OrderingFilter]
    search_fields=['name','category__name']
    ordering_fields=['price']
    
    def get_permissions(self):
        if self.request.method=='GET':
            return [IsAuthenticated()]
        return [IsManager(),IsAdminUser()]