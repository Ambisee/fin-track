from django.urls import path

from .views import foo

urlpatterns = [
    path("", view=foo)
]
