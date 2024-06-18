//
class App
{
    form = document.forms.betForm;
    buttons = this.form.querySelectorAll('button');

    constructor(data)
    {
        this.Model = new MatchData(data.matches, data.endpoints);
        this.View = new MatchList();

        this.View.render(this.Model.matches);
        this.View.container
            .querySelectorAll('article')
            .forEach( item => 
            {
                if (item.dataset.expired != 'true')
                item.addEventListener('click', e => 
                    this.showForm(e.currentTarget.dataset.id)
            )}
        );

        this.modal = new Modal(this.form, 'betForm');

        for (const btn of this.buttons) 
            btn.addEventListener('click', e => 
                this.buttonEvent(e));

        window.addEventListener('keydown', e => 
            { if (e.key == "Escape") this.hideForm() });

        return this;
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
        this.form.reset();
        this.form.match.value = id;
        const match = this.Model.get(id);
        const item = this.View.makeMatchItem(match);
        this.form
            .querySelector('#form_match_info') 
            .replaceChildren(item);

        const is_new = !("bet" in match);
        if (is_new) this.form.classList.add("new"); else this.form.classList.remove("new");
        this.form.home_goals.value = is_new ? '' : match.bet[0];
        this.form.away_goals.value = is_new ? '' : match.bet[1];
        this.form.home_goals.placeholder = match.home_team.name;
        this.form.away_goals.placeholder = match.away_team.name;

        this.modal.show();
        return this;
    }

    hideForm()
    {
        this.modal.hide(false);
        return this;
    }
}

class MatchData
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
    
        const match = this.get(bet.match); 
        if (action === 'delete')
            delete match.bet;  
        else
            match.bet = [res.home_goals, res.away_goals];
        this.View.updateMatchItem(match);

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


class MatchList
{
    container = document.getElementById("matchList");
    flags = 'https://flagcdn.com/h24/';
    
    constructor()
    {
    }

    makeMatchItem(match)
    {
        const item = document.getElementById("matchListItem")
                                                .content
                                                .cloneNode(true)
                                                .querySelector('article');

        item.querySelector('.date').textContent = match.date;
        item.querySelector('.home_team_name').textContent = match.home_team.name;
        item.querySelector('.away_team_name').textContent = match.away_team.name;
        item.querySelector('.home_team_flag').src = `${this.flags}${match.home_team.code.toLowerCase()}.png`;
        item.querySelector('.away_team_flag').src = `${this.flags}${match.away_team.code.toLowerCase()}.png`;
        item.dataset.id = match.id;
        item.dataset.expired = match.expired;
        return item;
    }

    updateMatchItem(match)
    {
        const item = this.container.querySelector(`[data-id="${match.id}"]`);
        this.updateBetInfo(item, match);
    }

    updateBetInfo(item, match)
    {
        const bet = "bet" in match ? match.bet : ['', ''];
        item.querySelector('.home_goals').textContent = bet[0];
        item.querySelector('.away_goals').textContent = bet[1];
        return item;
    }

    render(matches)
    {
        this.container.replaceChildren();
        matches.forEach( match => 
        {
            const li = document.createElement('li');
            const item = this.makeMatchItem(match);
            li.appendChild(item);
            this.container.insertAdjacentElement("beforeend", li);
            this.updateBetInfo(item, match);
        })
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

const app = new App(__data);