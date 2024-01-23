from django.urls import path

from .views import retrieve_all_data 

urlpatterns = [
    path("", view=retrieve_all_data)
]
