
# Create your models here.
from datetime import datetime, date, time
from django.contrib.auth.models import User
from django.db import models

class Tournament(models.Model):
    name = models.CharField(null=False, max_length=100)


class Group(models.Model):
    GROUP_NAMES = {
        'A': 'A',
        'B': 'B',
        'C': 'C',
        'D': 'D',
        'E': 'E',
        'F': 'F'
    }
    name = models.CharField(null=False, max_length=1, choices=GROUP_NAMES)
    tournament = models.ForeignKey(Tournament, null=True, on_delete=models.CASCADE)


class Team(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=2, null=True)
    group = models.ForeignKey(Group, null=True, on_delete=models.CASCADE)

class Match(models.Model):

    DATE_FORMAT = '%Y-%m-%d'        
    MATCH_TYPES = {
        'PRELIMINARY':'preliminary', 
        'FINALS_8'   : 'finals_8',
        'FINALS_4'   : 'finals_4', 
        'FINALS_2'   : 'finals_2', 
        'FINAL'      : 'final'
    }

    def is_expired(self) -> bool:
        end_time = time(13, 0)
        current_date = datetime.now()
        return current_date > datetime.combine(self.date, end_time)

    date = models.DateField()
    home_team = models.ForeignKey(Team, related_name="home_team", on_delete=models.CASCADE)
    home_goals = models.IntegerField(null=True, default=None)
    away_team = models.ForeignKey(Team, related_name="away_team", on_delete=models.CASCADE)
    away_goals = models.IntegerField(null=True, default=None)
    match_type = models.CharField(null=True, max_length=20, choices=MATCH_TYPES) 
    tournament = models.ForeignKey(Tournament, null=True, on_delete=models.CASCADE)

    def serialize(self):
        
        return {
            "id": self.id,
            "date": self.date.strftime(self.DATE_FORMAT),
            "expired": self.is_expired(),
            "home_team": { "code": self.home_team.code, "name": self.home_team.name },
            "home_goals": self.home_goals,
            "away_team": { "code": self.away_team.code, "name": self.away_team.name },
            "away_goals": self.away_goals,
            "match_type": self.match_type, 
            "tournament": self.tournament.name
        }


class Bet(models.Model):
    match = models.ForeignKey(Match, on_delete=models.CASCADE)
    home_bet = models.IntegerField(null=False)
    away_bet = models.IntegerField(null=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def serialize(self):
        
        return {
            "match_id": self.match.id,
            "home_bet": self.home_bet,
            "away_bet": self.away_bet,
        }

