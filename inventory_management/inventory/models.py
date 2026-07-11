from django.db.models import CASCADE
from django.db import models
from accounts.models import User
# Create your models here.
class Category(models.Model):
    name=models.CharField(max_length=100)
    description=models.TextField()
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)  
    def __str__(self):
        return self.name        
class Product(models.Model):
    name=models.CharField(max_length=100)
    category=models.ForeignKey(Category,on_delete=models.CASCADE)
    price=models.DecimalField(max_digits=10,decimal_places=2)
    quantity=models.IntegerField(default=0)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True) 
    cost_price=models.DecimalField(max_digits=10,decimal_places=2)
        
    def __str__(self):
        return self.name    