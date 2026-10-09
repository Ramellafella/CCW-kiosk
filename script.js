const overlay = document.getElementById("overlay");
const modal = document.getElementById("modal");
const forms = {
    connect: {
        title: "Stay Connected",
        intro: "Join our email list. We'll only use your details for church communications.", 
        fields: [
            ["First name", "first", "text"],
            ["Last name", "last", "text"],
            ["Email", "email", "email"],
            ["Phone number (optional)", "phone", "tel"]
        ]
    },

    serve: {
        title: "Serve with Us",
        intro: "Tell us what interests you. We'll then follow up with you about it.",
        fields: [
            ["Your name", "name", "text"],
            ["Email", "email", "email"],
            ["Phone number (optional)", "phone", "tel"]
        ],
        choices: ["Kids", "Music", "Welcome", "Hospitality", "Visual Media", "Something Else"]
    },

    new: {
        title: "I'm New",
        intro: "Thanks for visiting! Tell us a little about yourself and we'll get in touch.",
        fields: [
            ["First name", "first", "text"],
            ["Last name", "last", "text"],
            ["Email", "email", "email"],
            ["Phone number (optional)", "phone", "tel"]
        ]
    }
};

function openForm(type) {
    if(type === "give") {
        modal.innerHTML = `
            <div class="modal-head">
                <div>
                    <h2>Give</h2>
                    <p class="intro">Your gift helps support the work and ministry of Central Church Warrington.</p>
                </div>

                <button class="close" aria-label="Close">x</button>
            </div>

            <div class="success">
                <div class="big">♥︎</div>
                <h2>Secure Giving</h2>
                <p>This button will take you to our secure giving provider rather than collecting your bank details here.</p>
                <div class="actions">
                    <button class="btn primary" onclick="fakeSuccess('Giving')">Continue to Give</button>
                </div>
            </div>
        `;
    } else if (type === "events") {
        modal.innerHTML = `
            <div class="modal-head">
                <div>
                    <h2>What's On?</h2>
                    <p class="intro">An updateable list of events and Teams?</p>
                </div>

                <button class="close" aria-label="Close">x</button>
            </div>

            <div class="choices">
                <div class="choice">
                    <b>Sunday Service</b><br>
                    <small>Every Sunday at 10.45 | 10.15 Refreshments</small>
                </div>
                <div class="choice">
                    <b>Teams</b><br>
                    <small>Various options listed</small>
                </div>
                <div class="choice">
                    <b>Prayer Meeting</b><br>
                    <small>First Wednesday of every month</small>
                </div>
                <div class="choice">
                    <b>Other Events</b><br>
                    <small>See full calendar</small>
                </div>
            </div>

            <div class="actions">
                <button class="btn primary" onclick="closeModal()">Back to Welcome</button>
            </div>
        `;
    } else {
        const form = forms[type];

        let html = `
            <div class="modal-head">
                <div>
                    <h2>${form.title}</h2>
                    <p class="intro">${form.intro}</p>
                </div>

                <button class="close">x</button>
            </div>

            <form id="activeForm">
        `;

        for (const field of form.fields) {
            html += `
                <label>
                    ${field[0]}
                    <input name="${field[1]}" type="${field[2]}" ${field[1] === "email" ? 'autocomplete="email"' : ""}>
                </label>
            `;
        }

        if (form.choices) {
            html += `
                <label>What interests you?</label>

                <div class="choices">
                    ${form.choices.map(choice => `<button type="button" class="choice">${choice}</button>`).join("")}
                </div>
            `;
        }

        if (form.textarea) {
            html += `
                <label>
                    ${form.textarea}
                    <textarea name="request"></textarea>
                </label>
            `;
        }

        html += `
            <div class="actions">
                <button type="button" class="btn secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn primary">Submit</button>
            </div>
        </form>
        `;

        modal.innerHTML = html;

        document.querySelectorAll(".choice").forEach(button => {
            button.onclick = () => {
                button.classList.toggle("selected");
            };
        });

        document.getElementById("activeForm").onsubmit = event => {
            event.preventDefault();
            fakeSuccess(form.title);
        };
    }

    overlay.classList.add("open");
}

function fakeSuccess(label) {
    modal.innerHTML = `
        <div class="success">
            <div class="big">✔️</div>
            <h2>Thank you!</h2>
            <p>Your ${label.toLowerCase()} request has been submitted in the prototype.</p>
            <div class="actions">
                <button class="btn primary" onclick="closeModal()">Back to Welcome</button>
            </div>
        </div>
    `;
}

function closeModal() {
    overlay.classList.remove("open");
}

document.querySelectorAll("[data-form]").forEach(button => {
    button.onclick = () => {openForm(button.dataset.form);};
});

overlay.onclick = event => {
    if (event.target === overlay) {
        closeModal();
    }
};

document.addEventListener("click", event => {
    if (event.target.classList.contains("close")) {
        closeModal();
    }
});

function updateClock() {
    document.getElementById("clock").textContent = new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit"
    }).format(new Date());
}

updateClock();
setInterval(updateClock, 30000);

const serveDescriptions = [
    {
        keywords: /kids|children|childrens|children's/i,
        description: 'Help our children explore faith in a safe and fun environment.'
    },
    {
        keywords: /music|worship team|sing|instrument/i,
        description: 'Sing or play an instrument as part of our music team.'
    },
    {
        keywords: /welcome team|welcome|greet/i,
        description: 'Greet people and help vistors feel welcome.'
    },
    {
        keywords: /hospitality|refreshment|coffee|tea/i,
        description: 'Help prepare refreshments and create a warm space to connect with one another.'
    },
    {
        keywords: /visual media|media|sound|tech|tech|av|slides/i,
        description: 'Help with sound, screens, or slides on Sundays.'
    },
    {
        keywords: /something else|other/i,
        description: 'Have another idea? Tell us how you would love to help.'
    }
];

function addServeDescriptions() {
    const modal = document.getElementById('modal');
    if (!modal) return;
    
    const heading = [...modal.querySelectorAll('h1, h2, h3')].find(el => /serve|volunteer/i.test(el.textContent));
    if(!heading) return;

    modal.querySelectorAll('.choice').forEach(button => {
        if (button.dataset.cardEnhanced === 'true') return;

        const optionText = button.textContent.trim();
        const match = serveDescriptions.find(item => item.keywords.test(optionText));
        if (!match) return;

        const description = document.createElement('span');
        description.className = 'choice-description';
        description.textContent = match.description;

        button.appendChild(description);
        button.dataset.cardEnhanced = 'true';
    });
}

const serveModal = document.getElementById('modal');

if (serveModal) {
    new MutationObserver(addServeDescriptions).observe(serveModal, {
        childList: true,
        subtree: true
    }) ;
}

addServeDescriptions();