
from inventory.filters import InStockFilter
from accounts.permissions import IsManager,IsCashier,IsManagerOrCashier    
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from rest_framework import generics
from inventory.models import Category,Product,Brands
from inventory.filters import ProductFilter,InStockFilter
from inventory.serializers import CategorySerializer,ProductSerializer,BrandsSerializer  
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend
class CategoryListCreateAPIView(generics.ListCreateAPIView):
    queryset=Category.objects.all().order_by('-id')
    serializer_class=CategorySerializer
    filter_backends=[DjangoFilterBackend,filters.SearchFilter,filters.OrderingFilter]
    search_fields=['name','description']
    ordering_fields=['name']
    def get_permissions(self):  
        if self.request.method=='GET':
            return [IsAuthenticated()]
        return [IsManager(),IsAdminUser()]
class ProductListAPIView(generics.ListAPIView):
    queryset=Product.objects.all().order_by('-id')
    serializer_class=ProductSerializer
    filterset_class=ProductFilter
    filter_backends=[DjangoFilterBackend,filters.SearchFilter,filters.OrderingFilter,InStockFilter]
    search_fields=['name','category__name']
    ordering_fields=['price']
    def get_permissions(self):
        return [IsAuthenticated()]
        
class ProductListCreateAPIView(generics.ListCreateAPIView):
    queryset=Product.objects.all().order_by('-id')
    serializer_class=ProductSerializer
    filterset_class=ProductFilter
    filter_backends=[DjangoFilterBackend,filters.SearchFilter,filters.OrderingFilter,InStockFilter]
    search_fields=['name','category__name']
    ordering_fields=['price']
    
    def get_permissions(self):
        if self.request.method=='GET':
            return [IsAuthenticated()]
        return [IsManager(),IsAdminUser()]
class ProductRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
    queryset=Product.objects.all()
    serializer_class=ProductSerializer
    def get_permissions(self):
        if self.request.method=='GET':
            return [IsAuthenticated()]
        return [IsManager(),IsAdminUser()]
class ProductDestroyAPIView(generics.DestroyAPIView):
    queryset=Product.objects.all()
    serializer_class=ProductSerializer
    filter_backends=[DjangoFilterBackend,filters.SearchFilter,filters.OrderingFilter,InStockFilter]
    filterset_class=ProductFilter
    search_fields=['name','category__name']
    ordering_fields=['price']   
    def get_permissions(self):
        if self.request.method=='GET':
            return [IsAuthenticated()]
        return [IsManager(),IsAdminUser()]  
class CategoryRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
    queryset=Category.objects.all()
    serializer_class=CategorySerializer
    def get_permissions(self):
        if self.request.method=='GET':
            return [IsAuthenticated()]
        return [IsManager(),IsAdminUser()]
class CategoryDestroyAPIView(generics.DestroyAPIView):
    queryset=Category.objects.all()
    serializer_class=CategorySerializer
    def get_permissions(self):
        if self.request.method=='GET':
            return [IsAuthenticated()]
        return [IsManager(),IsAdminUser()]      
class BrandsListCreateAPIView(generics.ListCreateAPIView):
    queryset=Brands.objects.all().order_by('-id')
    serializer_class=BrandsSerializer
    filter_backends=[DjangoFilterBackend,filters.SearchFilter,filters.OrderingFilter]
    search_fields=['name','category__name','brand_name']
    ordering_fields=['name']
    def get_permissions(self):
        if self.request.method=='GET':
            return [IsAuthenticated()]
        return [IsManager(),IsAdminUser()]
class BrandsRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
    queryset=Brands.objects.all()
    serializer_class=BrandsSerializer
    def get_permissions(self):
        if self.request.method=='GET':
            return [IsAuthenticated()]
        return [IsManager(),IsAdminUser()]
class BrandsDestroyAPIView(generics.DestroyAPIView):
    queryset=Brands.objects.all()
    serializer_class=BrandsSerializer
    def get_permissions(self):
        if self.request.method=='GET':
            return [IsAuthenticated()]
        return [IsManager(),IsAdminUser()]   

