from django.urls import path

from . import views

urlpatterns = [
    path("ping", view=views.PingView.as_view())
]
