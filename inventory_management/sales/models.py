from django.db import models
from django.conf import settings
from inventory.models import Product    
# Create your models here.
class Sale(models.Model):
    cashier=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.PROTECT,related_name='sales')
    total_amount=models.DecimalField(max_digits=10,decimal_places=2)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    def __str__(self):
        return f'Sale {self.id}'    
class SaleItem(models.Model):
    sale = models.ForeignKey(
        Sale,
        on_delete=models.CASCADE,
        related_name="items"
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="sale_items"
    )
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        ordering = ["-id"]   

    def __str__(self):
        return f"Sale #{self.sale.id} - {self.product.name}"