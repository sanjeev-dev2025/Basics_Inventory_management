import django_filters
from sales.models import SaleItem,Sale
from rest_framework import filters
class SaleItemFilter(django_filters.FilterSet):
    class Meta:
        model=SaleItem
        fields=['sale','product']
class InStockFilter(filters.BaseFilterBackend):
    def filter_queryset(self,request,queryset,view):
        return queryset.filter(quantity__gt=0)  
