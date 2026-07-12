import django_filters
from rest_framework import filters
from inventory.models import Product
class ProductFilter(django_filters.FilterSet):
    class Meta:
        model=Product
        fields={"name":["iexact","icontains"],
        "price":["exact","gte","lte"],
       }
class InStockFilter(filters.BaseFilterBackend):
    def filter_queryset(self,request,queryset,view):
        return queryset.filter(quantity__gte=0)   
        