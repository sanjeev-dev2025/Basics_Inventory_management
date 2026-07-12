from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from accounts.permissions import IsCashier,IsManager,IsManagerOrCashier
from sales.models import Sale,SaleItem
from sales.serializers import SaleItemSerializer,SaleSerializer
from sales.filters import SaleItemFilter,InStockFilter
from rest_framework import filters
from rest_framework.pagination import PageNumberPagination
# Create your views here.
class SaleListCreateAPIView(generics.ListCreateAPIView):
    queryset = Sale.objects.all().order_by("-created_at")
    serializer_class=SaleSerializer
    def get_permissions(self):
        if self.request.method=='GET':
            return [IsAuthenticated()]
        return [IsManagerOrCashier()]  
class SaleItemListCreateAPIView(generics.ListCreateAPIView):
    queryset=SaleItem.objects.all().order_by('-id')
    serializer_class=SaleItemSerializer
    filter_class=SaleItemFilter
    filter_backends=[InStockFilter,DjangoFilterBackend,filters.SearchFilter,filters.OrderingFilter]   
    search_fields=['product__name']
    ordering_fields=['quantity']
    pagination_class=PageNumberPagination  
    pagination_class.page_size=2
    def get_permissions(self):
        if self.request.method=='GET':
            return [IsAuthenticated()]
        return [IsManagerOrCashier()]       
class SaleItemUpdateAPIView(generics.UpdateAPIView):
    queryset = SaleItem.objects.all().order_by("-id")
    serializer_class=SaleItemSerializer
    def get_permissions(self):
        if self.request.method=='GET':
            return [IsAuthenticated] 
        return[IsManagerOrCashier()]     
