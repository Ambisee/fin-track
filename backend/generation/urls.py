from django.urls import path

from . import views

urlpatterns = [
    path("allowed-report-users", view=views.AllowReportUsersView.as_view()),
    path("automated-monthly-report", view=views.AutomatedMonthlyReportView.as_view()),
    path("report", view=views.GenerateReportView.as_view()),
]
