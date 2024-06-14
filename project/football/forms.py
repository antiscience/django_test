from django import forms


class BetForm(forms.Form):
    match_id = forms.For
    home_goals = forms.NumberInput(widget=forms.NumberInput, required = True)
    away_goals = forms.NumberInput(widget=forms.NumberInput, required = True)
