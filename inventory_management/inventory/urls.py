from django.urls import path
from inventory.views import *
urlpatterns=[
    path('category/',CategoryListCreateAPIView.as_view(),name='category'),
    path('category/<int:pk>/',CategoryRetrieveUpdateAPIView.as_view(),name='category'),
    path('category/<int:pk>/',CategoryDestroyAPIView.as_view(),name='category'),
    path('product/',ProductListCreateAPIView.as_view(),name='product'),
    path('product/<int:pk>/',ProductRetrieveUpdateAPIView.as_view(),name='product'),
    path('product/<int:pk>/',ProductDestroyAPIView.as_view(),name='product'), 
    path('brand/',BrandsListCreateAPIView.as_view(),name='brand'),
    path('brand/<int:pk>/',BrandsRetrieveUpdateAPIView.as_view(),name='brand'),
    path('brand/<int:pk>/',BrandsDestroyAPIView.as_view(),name='brand'),
    path('product/',ProductListAPIView.as_view(),name='product'),   
    ] 

