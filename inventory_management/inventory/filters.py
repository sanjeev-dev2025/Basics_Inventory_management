import django_filters
from inventory.models import Product
class ProductFilter(django_filters.FilterSet):
    class Meta:
        model=Product
        fields={"name":["iexact","icontains"],
        "price":["exact","gte","lte"],
       }
    