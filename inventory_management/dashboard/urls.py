from django.urls import path
from dashboard.views import DashboardAPIView,DailyProfitAPIView,MonthlyProfitAPIView
urlpatterns=[
    path("dashboard/",DashboardAPIView  .as_view(),name="dashboard"),
    path("daily-profit/",DailyProfitAPIView.as_view(),name="daily_profit"),
    path("monthly-profit/",MonthlyProfitAPIView.as_view(),name="monthly_profit"),    
]   