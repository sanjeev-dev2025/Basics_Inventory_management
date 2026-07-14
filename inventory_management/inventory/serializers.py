from inventory.models import Category,Product,Brands
from rest_framework import serializers
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model=Category
        fields='__all__'
class ProductSerializer(serializers.ModelSerializer):
    category_name=serializers.CharField(source='category.name',read_only=True   )
    brand_name=serializers.CharField(source='brand.name',read_only=True)
    class Meta:
        model=Product
        fields=['id','name','category','category_name','price','stock','cost_price','brand','brand_name']
    
    def create(self,validated_data):
        name=validated_data['name']
        product = Product.objects.filter(
            name=validated_data["name"],
            brand=validated_data["brand"],  
            category=validated_data["category"]
            ).first()
        if product:
            product.stock += validated_data["stock"]
            product.price = validated_data["price"]
            product.cost_price = validated_data["cost_price"]
            product.category = validated_data["category"]
            product.save()
            return product

        return super().create(validated_data)
class BrandsSerializer(serializers.ModelSerializer):
    category_name=serializers.CharField(source='category.name',read_only=True)
    class Meta:
        model=Brands
        fields=['id','name','category','category_name']
    def create(self,validated_data):    
        brand = Brands.objects.filter(
            name=validated_data["name"],
            category=validated_data["category"] 
            ).first()
        if brand:
            brand.category = validated_data["category"]
            brand.save()
            return brand    
        return super().create(validated_data)   