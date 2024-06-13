
# Create your views here.

from django.shortcuts import render

# Create your views here.
import json 
from django.http import JsonResponse

from .models import Match, Team, Tournament, Group, Bet
from django.contrib.auth.decorators import login_required


@login_required
def index(request):
    matches = Match.objects.all().order_by("date")
    bets = {  bet.match.id:(bet.home_goals, bet.away_goals) for bet in Bet.objects.filter(user_id = request.user.id) }
    data = []
    for match in matches:
        m = match.serialize()
        if match.id in bets:
            m.update({ "bet": bets[match.id] })
        data.append(m)
    
    #return JsonResponse(data)
    return render(request, "football/home.html", { "matches": json.dumps(data)  })


@login_required
def create_bet(request):
    keys = ("match_id", "home_goals", "away_goals")
    data = { key:request.POST[key] for key in keys if key in request.POST }
    data["user_id"] = request.user.id
    bet = Bet.objects.create(**data)

    return JsonResponse(bet.serialize())
