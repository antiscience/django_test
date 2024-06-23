
# Create your views here.
from datetime import datetime, date, time
from django.shortcuts import render, redirect
from django.conf import settings
import json 
from django.http import JsonResponse
from .models import Match, Team, Tournament, Group, Bet
from .forms import BetForm
from django.contrib.auth.decorators import login_required
import requests


def index(request, username = None):
    try:
        matches = Match.objects.all().order_by("date")
        data = [ match.serialize() for match in matches ]
        context = { 
            "matches": data, 
            "user": request.user.username if request.user.is_authenticated else None,
            "flag_cdn": settings.FLAG_CDN  
            }
        return render(request, "football/football.html", context = context)
    except Exception as e:
        return render(request, "error.html", context = { "error": e }, status=500)

def user(request, username = None):
    if username is None:
        return redirect("football:home_url")
    return index(request, username)

def get_bets(request, username = None):
    try:
        bets = Bet.objects.filter(user = request.user)
        data = { "bets": [ bet.serialize() for bet in bets ] }
        return JsonResponse(data)
    except Exception as e:
        return JsonResponse({ "error": str(e) }, status=500)


def create_bet(request):
    if not request.user.is_authenticated:
        return JsonResponse({ "error": "Please Log in or Sign up first" }, status=403)

    try:
        form = BetForm(request.POST)
        if form.is_valid():
            data = form.cleaned_data
            resp = Bet.objects.create(**data, user = request.user).serialize()
        else:
            resp = { "error": form.errors.get_json_data(escape_html = True) }
        return JsonResponse(resp)
    except Exception as e:
        return JsonResponse({ "error": str(e) }, status=500)

def update_bet(request):
    if not request.user.is_authenticated:
        return JsonResponse({ "error": "Please Log in or Sign up first" }, status=403)

    try:
        form = BetForm(request.POST)
        if form.is_valid():
            data = form.cleaned_data
            bet = Bet.objects.get(match = data["match"], user = request.user)
            bet.home_bet = data["home_bet"] 
            bet.away_bet = data["away_bet"]
            bet.save(update_fields = data.keys())
            resp = bet.serialize()
        else:
            resp = { "error": form.errors.get_json_data(escape_html = True) }
        return JsonResponse(resp)
    except Exception as e:
        return JsonResponse({ "error": str(e) }, status=500)


def delete_bet(request):
    if not request.user.is_authenticated:
        return JsonResponse({ "error": "Please Log in or Sign up first" }, status=403)

    try:
        match_id = request.POST["match"]
        bet = Bet.objects.get(match_id = match_id, user = request.user)
        bet.delete()
        return JsonResponse({ "id": match_id })
    except Exception as e:
        return JsonResponse({ "error": str(e) }, status=500)


def refresh(request):
    DATE_FORMAT = '%Y-%m-%d'
    today = date.today().strftime(DATE_FORMAT)
    url = 'https://api.football-data.org/v4/competitions/EC/matches/'
    filters = { 
        "season": "2024",
        "status": "FINISHED",
        "dateTo": today,
        "dateFrom": "2024-06-12"
    }
    query = url + '?' + '&'.join([f"{key}={filters[key]}" for key in filters])
    api_token = '335b057d5af34f19a5ae3da1b6bb5a2d'
    headers = { 'X-Auth-Token': api_token }

    try:
        refresh_token = request.GET['token'] if 'token' in request.GET else None
        if not refresh_token == settings.REFRESH_KEY:
            raise ValueError('Forbidden')

        response = requests.get(query, headers=headers)
        match_data = response.json()['matches']
        matches = Match.objects.all()
        teams = Team.objects.all()

        for m in match_data:
            home_team = m["homeTeam"]["name"]
            away_team = m["awayTeam"]["name"]

            home_team_id = teams.get(name = home_team).id
            away_team_id = teams.get(name = away_team).id

            print(away_team_id, home_team_id)
            match = matches.get(home_team_id = home_team_id, away_team_id = away_team_id)
            print(match.away_team.id, match.home_team.id)


            match.home_goals = m["score"]["fullTime"]["home"]
            match.away_goals = m["score"]["fullTime"]["away"]
            match.save()

        return JsonResponse({ "status": "OK", "matches": len(match_data) })
    except ValueError as e:
        return JsonResponse({ "error": str(e) }, status=403)
    except Exception as e:
        return JsonResponse({ "error": str(e) }, status=500)
