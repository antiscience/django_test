from django.urls import path
from . import views

app_name = "football"
urlpatterns = [
    path("", views.index, name="home"),
    path("create", views.create_bet, name="create_url"),
    path("update/", views.create_bet, name="update_url"),
    path("update/<int:id>", views.create_bet, name="update"),
    path("delete/", views.create_bet, name="delete_url"),
    path("delete/<int:id>", views.create_bet, name="delete")
]