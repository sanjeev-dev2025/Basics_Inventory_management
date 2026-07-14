from django.urls import path
from dashboard.views import DashboardAPIView,DailyReportAPIView,MonthlyProfitAPIView,Last7DaysProfitAPIView,DailyReportCSVAPIView,MonthlyReportCSVAPIView
urlpatterns=[
    path("dashboard/",DashboardAPIView.as_view(),name="dashboard"),
    path("daily-report/",DailyReportAPIView.as_view(),name="daily_report"),
    path("monthly-profit/",MonthlyProfitAPIView.as_view(),name="monthly_profit"),     
    path("last-7-days-profit/",Last7DaysProfitAPIView.as_view(),name="last_7_days_profit"),
    path("daily-report-csv/",DailyReportCSVAPIView.as_view(),name="daily_report_csv"),
    path("monthly-report-csv/",MonthlyReportCSVAPIView.as_view(),name="monthly_report_csv"),
]