from django.urls import path
from . import views

app_name = "football"
urlpatterns = [
    path("", views.index, name="football"),
    #path("bets", views.get_bets, name="get"),
    # path("create", views.create_task, name="create_url"),
    # path("update/", views.update_task, name="update_url"),
    # path("update/<int:id>", views.update_task, name="update"),
    # path("delete/", views.delete_task, name="delete_url"),
    # path("delete/<int:id>", views.delete_task, name="delete")
]