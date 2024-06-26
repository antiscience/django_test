//
class App
{
    form = document.forms.betForm;
    buttons = this.form.querySelectorAll('button');

    constructor(endpoints)
    {
        this.View = new BetList();
        this.Model = new BetData(endpoints, this.View); 

        [...this.View.container.querySelectorAll('article')]
            .filter(item => item.dataset.expired != 'true')
            .map(item => item.addEventListener('click', e => 
                this.showForm(item.dataset.id)
            )
        );

        this.modal = new Modal(this.form, 'betForm');

        [...this.buttons]
            .map(btn => btn.addEventListener('click', e => 
                this.buttonEvent(e)
            )
        );

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
        const bet = this.Model.get(id);
        const match = this.View.getById(id).cloneNode(true);
        this.form
            .querySelector('#form_match_info') 
            .replaceChildren(match);

        const is_new = !bet;
        if (is_new) this.form.classList.add("new"); else this.form.classList.remove("new");
        this.form.home_bet.value = is_new ? '' : bet.home_bet;
        this.form.away_bet.value = is_new ? '' : bet.away_bet;
        this.form.home_bet.placeholder = this.form.querySelector('.home_team_name').textContent;
        this.form.away_bet.placeholder = this.form.querySelector('.away_team_name').textContent;

        this.modal.show();
        return this;
    }    
    
    hideForm()
    {
        this.modal.hide(false);
        return this;
    }
}

class BetData
{
    constructor(endpoints, betList)
    {
        this.endpoints = endpoints;
        this.View = betList;
        this.getBets()
            .then(data => this.bets = data.bets)
            .then(() => this.View.render(this.bets));
    }

    async getBets()
    {
        const url = this.endpoints['get'];
        const resp = await (new Request(url).send());
        if ("error" in resp) 
        {
            this.showError(resp.error);
            throw new Error(`Got Error message, exiting...`);
        }
    
        return resp;
    }

    get(id)
    {
        return this.bets.find( bet => bet.match_id == id );
    }

    getIndex(id)
    {
        return this.bets.findIndex( bet => bet.match_id == id );
    }

    async commit(data, action)
    {
        const url = this.endpoints[action];
        const resp = await (new Request(url, data).send());

        if ("error" in resp) 
        {
            this.showError(resp.error);
            throw new Error(`Got Error message, exiting...`);
        }
    
        const match_id = data.get("match"); 
        let bet;
        switch (action)
        {
            case "create":
                bet = resp;
                this.bets.push(bet);
                break;
            case "update":
                bet = this.get(match_id); 
                bet.home_bet = resp.home_bet;
                bet.away_bet = resp.away_bet;
                break;
            case "delete":
                const ind = this.getIndex(resp.id);
                bet = this.bets.splice(ind, 1)[0];
                delete bet.home_bet;
                delete bet.away_bet;
                break;
        }

        this.View.updateMatchItem(bet);
        return true;
    }

    showError(err)
    {
        const errors = typeof(err) == 'string' ? err : 
            Object.keys(err)
                .map(key => key + ': ' + err[key].map(m => m.message)
                .join(', '))
                .join('<br />');

        const modal = new Modal(errors, "error");
        modal.show();
        return modal;
    }
}


class BetList
{
    container = document.getElementById("matchList");    
    constructor()
    {
    }

    getById(id)
    {
        return this.container.querySelector(`[data-id="${id}"]`);
    }

    updateMatchItem(bet)
    {
        const item = this.getById(bet.match_id);
        item.querySelector('.home_bet').textContent = "home_bet" in bet ? bet.home_bet : '–';
        item.querySelector('.away_bet').textContent = "away_bet" in bet ? bet.away_bet : '–';
        return item;
    }

    render(bets)
    {
        bets.map( bet => this.updateMatchItem(bet) );
        return this;
    }
}

class Request
{
    constructor(url, data = null)
    {
        this.url = url;
        this.data = data ;
        this.method = this.data === null ? "GET" : "POST";
    }

    async send()
    {
        try 
        {
            const options = this.method == "POST" ? { method: this.method, body: this.data } : null;
            const response = await fetch(this.url, options);
            
            return response.json();
        }
        catch (err) 
        {
            console.log(err);
            (new Modal(err, 'error')).show();
            throw new Error(`HTTP error! Status: ${err}`);
        }
    }
        
}

const app = new App(__data.endpoints);