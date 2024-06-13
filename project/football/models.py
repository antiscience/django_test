
# Create your models here.

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

    date = models.DateField()
    home_team = models.ForeignKey(Team, related_name="home_team", on_delete=models.CASCADE)
    home_goals = models.IntegerField(null=False, default=0)
    away_team = models.ForeignKey(Team, related_name="away_team", on_delete=models.CASCADE)
    away_goals = models.IntegerField(null=False, default=0)
    match_type = models.CharField(null=True, max_length=20, choices=MATCH_TYPES) 
    tournament = models.ForeignKey(Tournament, null=True, on_delete=models.CASCADE)

    def serialize(self):
        
        return {
            "id": self.id,
            "date": self.date.strftime(self.DATE_FORMAT),
            "home_team": self.home_team.name,
            "home_goals": self.home_goals,
            "away_team": self.away_team.name,
            "away_goals": self.away_goals,
            "match_type": self.match_type, 
            "tournament": self.tournament.name
        }


class Bet(models.Model):
    match = models.ForeignKey(Match,on_delete=models.CASCADE)
    home_goals = models.IntegerField(null=False)
    away_goals = models.IntegerField(null=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def serialize(self):
        
        return {
            "match": self.match.id,
            "home_goals": self.home_goals,
            "away_goals": self.away_goals,
            "match_type": self.match_type, 
        }

    
