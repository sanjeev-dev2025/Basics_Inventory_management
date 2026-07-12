from sales.models import Sale, SaleItem
from rest_framework import serializers
class SaleSerializer(serializers.ModelSerializer):
    class Meta:
        model=Sale
        fields='__all__'
class SaleItemSerializer(serializers.ModelSerializer):
    class Meta:
        model=SaleItem
        fields='__all__'

