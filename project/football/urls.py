from django.urls import path
from . import views

app_name = "football"
urlpatterns = [
    path("", views.index, name="football"),
    path("create", views.create_bet, name="create_url"),
    path("update/", views.update_bet, name="update_url"),
    path("delete/", views.delete_bet, name="delete_url"),
]