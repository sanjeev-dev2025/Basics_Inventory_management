from inventory.models import Category,Product
from rest_framework import serializers
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model=Category
        fields='__all__'
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model=Product
        fields=['id','name','category','price','quantity','cost_price']
