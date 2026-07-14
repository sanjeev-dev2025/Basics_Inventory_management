from django.shortcuts import render

# Create your views here.
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from inventory.models import Product
from sales.models import Sale,SaleItem
from django.db.models import Sum
class DashboardAPIView(GenericAPIView):
    def get(self, request):
        low_stock = Product.objects.filter(quantity__lt=7)

        return Response({
            "total_products": Product.objects.count(),
            "low_stock_count": low_stock.count(),
            "low_stock_message": (
                "⚠️ Some products are running low on stock."
                if low_stock.exists()
                else "✅ All products are sufficiently stocked."
            ),
            "low_stock_products": [
                {
                    "name": product.name,
                    "quantity": product.quantity,
                }
                for product in low_stock
            ],
        })
  

from datetime import date, timedelta

class Last7DaysProfitAPIView(GenericAPIView):
    def get(self, request):

        # 1. Calculate the date range
        today = date.today()
        seven_days_ago = today - timedelta(days=6)  # includes today

        # 2. Get all sales in that range
        recent_sales = Sale.objects.filter(
            created_at__date__range=[seven_days_ago, today]
        )

        # 3. Group by date and sum profits
        profit_data = recent_sales.values('created_at__date') \
            .annotate(daily_profit=Sum('total_amount')) \
            .order_by('created_at__date')

        # 4. Make the response more readable (optional)
        formatted_data = [
            {
                "date": sale["created_at__date"],
                "total_profit": sale["daily_profit"] or 0
            }
            for sale in profit_data
        ]

        return Response(formatted_data)
from decimal import Decimal
from django.db.models import F  
class DailyReportAPIView(GenericAPIView):
    def get(self, request):
        today_items = SaleItem.objects.filter(
            sale__created_at__date=date.today()
        )
        daily_sales=sum(item.subtotal for item in today_items)  
        daily_profit = Decimal("0.00")

        for item in today_items:
            cost = item.product.cost_price
            selling = item.unit_price
            daily_profit += (selling - cost) * item.quantity

        return Response({"daily_profit": daily_profit,"daily_sales":daily_sales})
class MonthlyProfitAPIView(GenericAPIView):
    def get(self, request):
        monthly_sales = Sale.objects.filter(
            created_at__year=date.today().year,
            created_at__month=date.today().month
        )

        monthly_profit = monthly_sales.aggregate(
            total_profit=Sum(F('total_amount'))
        )['total_profit'] or Decimal("0.00")

        return Response({"monthly_profit": monthly_profit}) 
