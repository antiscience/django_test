from django import forms
from .models import Match

class BetForm(forms.Form):
    home_bet = forms.IntegerField(required = True, min_value = 0)
    away_bet = forms.IntegerField(required = True, min_value = 0)
    match = forms.ModelChoiceField(queryset=Match.objects.all())

