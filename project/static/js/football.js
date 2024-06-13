//
class Bets
{
    form = document.forms.betForm;
    buttons = this.form.querySelectorAll('button');

    constructor(data)
    {
        this.tasks = data.tasks;
        this.sort();

        this.taskList = new TaskList(this);
        this.modal = new Modal(this.form, 'taskForm');

        for (const btn of this.buttons) 
            btn.addEventListener('click', e => 
        {
            this.commit(e);
        });

        newTaskButton.addEventListener("click", e => 
            this.showForm());

        window.addEventListener('keydown', e => 
            { 
                if (e.key == "Escape") this.hideForm() 
            });
    }

    get(id)
    {
        return this.tasks.find( item => item.id == id );
    }

    getIndex(id)
    {
        return this.tasks.findIndex( item => item.id == id );
    }

    sort()
    {
        this.tasks.sort((a, b) => 
                new Date(a.due_date || null) - new Date(b.due_date || null));
        return this;
    }

    create(task)
    {
        this.tasks.push(task);
        this.sort();
        this.taskList.render();
    }
    
    update(task)
    {
        const index = this.getIndex(task.id);
        this.tasks[index] = task;
        this.sort();
        this.taskList.render();
    }

    delete(obj)
    {
        const index = this.getIndex(obj.id);
        this.tasks.splice(index, 1);
        this.taskList.delete(obj.id);
    }

    async commit(e)
    {
        e.preventDefault(); 
        const action = e.target.name;
        const url = e.target.dataset.url + this.form.id.value;

        const data = new FormData(this.form); console.log(...data)
        const json = await (new Request(url, data).send());

        this.resetForm().hideForm();
        if ("error" in json) this.showError(json.error);
            else this[action](this.responseToData(json));
    }

    responseToData(json) // dummy method
    {
        if ('due_date' in json)
            if (json.due_date == null)
                json.due_date = '';

        return json;
    }

    showForm(task)
    {
        this.resetForm();
        if (task)
        {
            for (const attr in task) 
                if (attr in this.form && attr != "is_completed") 
                    this.form[attr].value = task[attr];

            if (task.is_completed) 
                this.form.is_completed.checked = true;

            this.form.classList.remove('new'); 
        }
        else 
            this.form.classList.add('new');

        this.modal.show();
        return this;
    }

    resetForm()
    {
        this.form.reset();
        return this;
    }

    hideForm()
    {
        this.modal.hide(false)
        return this;
    }

    showError(json)
    {
        const errors = Object.entries(json)
            .map(e => e[0] + ': ' + e[1].map(m => m.message)
                .join('')
            ).join('<br />');

        const modal = new Modal(errors, "error");
        modal.show();
        return modal;
    }

}

class Matches
{
    container = document.getElementById("matchList");
    
    constructor(matches)
    {
        this.matches = matches;
    }

    makeListItem(match)
    {
        const fields = ["date", "home_team", "away_team", "home_goals", "away_goals"]
        const li = document.createElement('li');
        const bet = "bet" in match ? [match.bet[0], match.bet[1]] : ['-', '-'];
        let html = `<article><span class="date">${match.date}</span>
                    <span class="home_team">${match.home_team}</span>
                    <span> - </span>
                    <span class="away_team">${match.away_team}</span>
                    <span class="home_goals">${bet[0]}</span>
                    <span> : </span>
                    <span class="away_goals">${bet[1]}</span>
                    </article>`;
        li.innerHTML = html;
        return li;
    }

    add(match)
    {
        this.container.insertAdjacentElement("beforeend", this.makeListItem(match));
    }

    render()
    {
        this.container.replaceChildren();
        this.matches.map( match => this.add(match) );
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

(new Matches(__data.matches)).render();
    