
# Create your views here.

from django.shortcuts import render

# Create your views here.
import json 
from django.http import JsonResponse

from .models import Match, Team, Tournament, Group, Bet
from .forms import BetForm
from django.contrib.auth.decorators import login_required


@login_required
def index(request):
    matches = Match.objects.all().order_by("date")
    bets = {  bet.match.id:(bet.home_goals, bet.away_goals) for bet in Bet.objects.filter(user_id = request.user.id) }
    data = []
    for match in matches:
        m = match.serialize()
        if match.id in bets:
            m |= { "bet": bets[match.id] }
        data.append(m)
    
    #return JsonResponse(data)
    return render(request, "football/home.html", { "matches": json.dumps(data)  })


@login_required
def create_bet(request):
    # keys = ("match", "home_goals", "away_goals")
    # data = { key:request.POST[key] for key in keys if key in request.POST }
    # bet = Bet(**data, user = request.user)
    # bet.save()
    # return JsonResponse(bet.serialize())
    try:
        form = BetForm(request.POST)
        if form.is_valid():
            data = form.cleaned_data
            resp = Bet.objects.create(**data, user = request.user).serialize()
        else:
            resp = { "error": form.errors.get_json_data(escape_html = True) }
        return JsonResponse(resp)
    except Exception as e:
        return JsonResponse({ "error": str(e) })

@login_required
def update_bet(request):
    bet = Bet.objects.get(match_id = request.POST["match"], user = request.user)
    bet.home_goals = request.POST["home_goals"]
    bet.away_goals = request.POST["away_goals"]
    bet.save()

    return JsonResponse(bet.serialize())

@login_required
def delete_bet(request):
    bet = Bet.objects.get(match_id = request.POST["match"], user = request.user)
    bet.delete()

    return JsonResponse({ "status": 1 })
