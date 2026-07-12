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
    
    def create(self,validated_data):
        name=validated_data['name']
        product = Product.objects.filter(
            name=validated_data["name"],
            category=validated_data["category"]
            ).first()
        if product:
            product.quantity += validated_data["quantity"]
            product.price = validated_data["price"]
            product.cost_price = validated_data["cost_price"]
            product.category = validated_data["category"]
            product.save()
            return product

        return super().create(validated_data)