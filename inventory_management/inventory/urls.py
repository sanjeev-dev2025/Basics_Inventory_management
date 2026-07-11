from django.urls import path
from inventory.views import *
urlpatterns=[
    path('category/',CategoryListCreateAPIView.as_view(),name='category'),
    path('product/',ProductListCreateAPIView.as_view(),name='product'),
    ] 

