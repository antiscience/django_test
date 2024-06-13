
# Create your views here.

from django.shortcuts import render

# Create your views here.
import json 
from django.http import JsonResponse

from .models import Match, Team, Tournament, Group, Bet
#from .forms import TaskForm
from django.contrib.auth.decorators import login_required


# @login_required
# def index(request):
#     matches = Match.objects.all().order_by("date")
#     data = json.dumps([match.as_dict() for match in matches])
#     return render(request, "football/football.html", { "matches": data  })

@login_required
def index(request):
    matches = Match.objects.all().order_by("date")
    bets = {  bet.match.id:(bet.home_goals, bet.away_goals) for bet in Bet.objects.filter(user_id = request.user.id) }
    data = []
    for match in matches:
        m = match.as_dict()
        if match.id in bets:
            m.update({ "bet": bets[match.id] })
        data.append(m)
    
    #return JsonResponse(data)
    return render(request, "football/football.html", { "matches": json.dumps(data)  })
