//

const show = (el) => el.classList.remove("hidden");
const hide = (el) => el.classList.add("hidden");

class Modal {
    constructor(content, className = null)
    {
        this.content = content;
        this.className = className;
        this.modal = document.getElementById("modalTemplate")
                        .content
                        .cloneNode(true)
                        .querySelector('.modal');

        this.fill(content);

        if (className) 
            this.modal.classList.add(className);

        this.modal
            .querySelector(".close")
            .addEventListener('click', e => this.hide());
    }

    fill(content)
    {
        const target = this.modal.querySelector('.content');
        if (content instanceof Element) 
        {
            target.replaceChildren(content); 
            content.classList.remove("hidden");
        }
        else target.innerHTML = content;
        return this;
    }

    show(target = document.body)
    {
        this.modal
            .classList
            .remove("hidden");

        target.appendChild(this.modal);
        return this;
    }

    hide(remove = true)
    {
        if (remove) 
            this.modal.remove(); 
        else this.modal
            .classList
            .add("hidden");
    }
}

[...document.getElementsByClassName("local")].forEach( el => 
{
    el.addEventListener('click', e => 
    { 
        e.preventDefault();
        const content = document.getElementById(el.dataset.content).innerHTML;
        const cls = el.dataset.class ?? null;
        const modal = new Modal(content, cls);
        modal.show();
    })
});

[...document.querySelectorAll(".close")].forEach( el => {
    el.addEventListener('click', e => { 
        e.preventDefault();
        hide(el.parentNode);
    })
});

overlay.querySelector(".close").addEventListener("click", () => hide(overlay));

const send = async (url, data) =>
{
    try {
        const response = await fetch(url, { method: "POST", body: data});
        if (response.ok) 
            return response.json();
        
        throw new Error(`HTTP error! Status: ${response.status}`) 
    }
    catch (err) 
    {
        console.log(err);
        //toast('Something went wrong. Please try again later.');
    }
}

