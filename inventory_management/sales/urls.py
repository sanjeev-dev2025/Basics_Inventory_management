
from django.urls import path
from sales.views import SaleListCreateAPIView,SaleItemListCreateAPIView,SaleItemUpdateAPIView,SaleRetrieveUpdateDestroyAPIView
urlpatterns=[
    path('sale/',SaleListCreateAPIView.as_view(),name='sale'),
    path('sale/<int:pk>/',SaleRetrieveUpdateDestroyAPIView.as_view(),name='sale_detail'),
    path('sale_item/',SaleItemListCreateAPIView.as_view(),name='sale_item'),
    path('sale_item/<int:pk>/',SaleItemUpdateAPIView.as_view(),name='sale_item_update'),
      
]