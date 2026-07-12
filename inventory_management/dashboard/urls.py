from django.urls import path
from dashboard.views import DashboardAPIView,DailyReportAPIView,MonthlyProfitAPIView
urlpatterns=[
    path("dashboard/",DashboardAPIView.as_view(),name="dashboard"),
    path("daily-report/",DailyReportAPIView.as_view(),name="daily_report"),
    path("monthly-profit/",MonthlyProfitAPIView.as_view(),name="monthly_profit"),     
]  