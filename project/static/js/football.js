//

class Bets
{
    constructor(matches, endpoints)
    {
        this.matches = matches;
        this.endpoints = endpoints;
        this.View = new MatchList(this.matches);
    }

    get(id)
    {
        return this.matches.find( item => item.id == id );
    }

    sort()
    {
        this.matches.sort((a, b) => new Date(a.date) - new Date(b.date));
        return this;
    }

    async commit(data, action)
    {
        const bet = Object.fromEntries(data); 
        const url = this.endpoints[action];
        const res = await (new Request(url, data).send());

        if ("error" in res) 
        {
            this.showError(res.error);
            return false;
        }
    
        const match = this.get(bet.match_id); 
        if (action === 'delete')
            delete match.bet;  
        else
            match.bet = [res.home_goals, res.away_goals];
        this.View.update(match);

        return true;
    }

    showError(json)
    {
        const errors = Object.entries(json)
            .map(e => e[0] + ': ' + e[1].map(m => m.message)
            .join(''))
            .join('<br />');

        const modal = new Modal(errors, "error");
        modal.show();
        return modal;
    }


}

class BetForm
{
    form = document.forms.betForm;
    buttons = this.form.querySelectorAll('button');

    constructor(data)
    {
        this.Model = new Bets(data.matches, data.endpoints);
        this.View = new MatchList(data.matches, this);
        this.View.render();
        this.modal = new Modal(this.form, 'betForm');
        for (const btn of this.buttons) 
            btn.addEventListener('click', e => 
                this.buttonEvent(e))
        window.addEventListener('keydown', e => 
            { if (e.key == "Escape") this.hideForm() })
    }

    async buttonEvent(e)
    {
        e.preventDefault(); 
        const action = e.currentTarget.name; 
        const data = new FormData(this.form);
        this.Model.commit(data, action);
        this.hideForm();
    }

    showForm(id)
    {
        this.form.match_id.value = id;
        const match = this.Model.get(id);
        const is_new = !("bet" in match);
        if (is_new) this.form.classList.add("new"); else this.form.classList.remove("new");
        this.form.home_goals.value = is_new ? '' : match.bet[0];
        this.form.away_goals.value = is_new ? '' : match.bet[1];
        this.modal.show();
        return this;
    }

    hideForm()
    {
        this.modal.hide(false)
        this.form.reset();        
        return this;
    }
}

class MatchList
{
    container = document.getElementById("matchList");
    
    constructor(matches, BetForm)
    {
        this.matches = matches;
        this.BetForm = BetForm;
    }

    makeListItem(match)
    {
        const li = document.createElement('li');
        const bet = "bet" in match ? match.bet : ['', ''];

        const item = document.getElementById("matchListItem")
                                                .content
                                                .cloneNode(true)
                                                .querySelector('article');

        item.querySelector('.date').textContent = match.date;
        item.querySelector('.home_team_name').textContent = match.home_team.name;
        item.querySelector('.away_team_name').textContent = match.away_team.name;
        item.querySelector('.home_goals').value = bet[0];
        item.querySelector('.away_goals').value = bet[1];
        item.dataset.id = match.id;
        item.addEventListener('click', e => this.BetForm.showForm(e.currentTarget.dataset.id));
        li.appendChild(item);
        return li;
    }

    update(match)
    {
        const item = this.container.querySelector(`[data-id='${match.id}']`);
        const bet = "bet" in match ? match.bet : ['', ''];

        item.querySelector('.home_goals').value = bet[0];
        item.querySelector('.away_goals').value = bet[1];
    }

    render()
    {
        this.container.replaceChildren();
        this.matches.forEach( match => 
            this.container.insertAdjacentElement("beforeend", this.makeListItem(match)) 
        )
    }
}

class Request
{
    constructor(url, data)
    {
        this.url = url;
        this.data = data;
    }

    async send()
    {
        try {
            const response = await fetch(this.url, { method: "POST", body: this.data});
            if (response.ok) return response.json();
            throw new Error(`HTTP error! Status: ${response.status}`) 
        }
        catch (err) 
        {
            console.log(err);
            (new Modal(err, 'error')).show();
        }
    }
        
}

new BetForm(__data);