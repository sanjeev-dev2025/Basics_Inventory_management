from rest_framework import serializers
from sales.models import Sale, SaleItem


class SaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sale
        fields = "__all__"


class SaleItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleItem
        fields = "__all__"

    def create(self, validated_data):
        product = validated_data["product"]
        quantity = validated_data["quantity"]

        # Check stock availability
        if product.stock < quantity:
            raise serializers.ValidationError(
                {"quantity": "Not enough stock available."}
            )

        # Decrease stock
        product.stock -= quantity
        product.save()

        # Auto-fill selling price and subtotal
        validated_data["unit_price"] = product.price
        validated_data["subtotal"] = product.price * quantity

        return super().create(validated_data)