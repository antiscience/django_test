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

    update(bet)
    {
        const res = this.commit(bet, 'update');
        if (res == false) 
            return false;
        const match = this.get(bet.id);
        match.bet = [bet.home_goals, bet.away_goals];
        this.View.update(match.id, bet);
        return this;
    }
    
    create(bet)
    {
        return this.update(bet);
    }

    delete(bet)
    {
        const res = this.commit(bet, 'delete');
        if (res == false) 
            return false;

        delete this.get(bet.id).bet;
        this.View.update(bet.id, null);
        return this;
    }

    async commit(bet, action)
    {
        const id = action == "create" ? '' : bet.id; 
        const url = this.endpoints[action] + id;
        const json = await (new Request(url, bet).send());

        if ("error" in json) 
        {
            this.showError(json.error);
            return false;
        }
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
        this.View = new MatchList(data.matches);
        this.View.render();
        this.View.container.querySelectorAll('article')
            .forEach( item => item.addEventListener('click', e => 
                this.showForm(e.currentTarget.dataset.id)));

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
        const action = e.target.name;
        const data = { "id": this.form.id.value, "home_goals": this.form.home_goals.value, "away_goals": this.form.away_goals.value }; //// FormData
        this.Model[action](data);
        this.hideForm();
    }

    showForm(id)
    {
        this.form.id.value = id;
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
    
    constructor(matches)
    {
        this.matches = matches;
    }

    makeListItem(match)
    {
        const li = document.createElement('li');
        const bet = "bet" in match ? match.bet : ['-', '-'];

        const item = document.getElementById("matchListItem")
                                                .content
                                                .cloneNode(true)
                                                .querySelector('article');

        item.querySelector('.date').textContent = match.date;
        item.querySelector('.home_team').textContent = match.home_team;
        item.querySelector('.away_team').textContent = match.away_team;
        item.querySelector('.home_goals').value = bet[0];
        item.querySelector('.away_goals').value = bet[1];
        item.dataset.id = match.id;
        li.appendChild(item);
        return li;
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
        this.data = JSON.stringify(data);
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

new BetForm(new Bets(__data.matches, __data.endpoints), new MatchList(__data.matches))