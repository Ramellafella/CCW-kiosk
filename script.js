const overlay = document.getElementById("overlay");
const modal = document.getElementById("modal");
const KIOSK_ENDPOINT = "https://script.google.com/macros/s/AKfycbx7LUmxS-GvER-PMvedJzx8-x9p_5vOAo3gxpnhTO3_AColU77e6Phm-GV74aX577bo3w/exec";

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
            ["First name", "first", "text"],
            ["Last name", "last", "text"],
            ["Email", "email", "email"],
            ["Phone number (optional)", "phone", "tel"]
        ],
        choices: [
            {
                title: "Kids",
                description: 'Help our children explore faith in a safe and fun environment.'
            },
            {
                title: "Music",
                description: 'Sing or play an instrument as part of our music team.'
            },
            {
                title: "Welcome",
                description: 'Greet people and help visitors feel welcome.'
            },
            {
                title: "Hospitality",
                description: 'Help prepare refreshments and create a warm space to connect with one another.'
            },
            {
                title: "Audio-Visual",
                description: 'Help with sound, screens, or slides on Sundays.'
            },
            {
                title: "Something Else",
                description: 'Have another idea? Tell us how you would love to help.'
            }
        ]
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
                    <input name="${field[1]}" type="${field[2]}" ${["first", "last", "name", "email"].includes(field[1]) ? "required" : ""} ${field[1] === "email" ? 'autocomplete="email"' : ""}>
                </label>
            `;
        }

        if (form.choices) {
            html += `
                <label>What interests you?</label>

                <div class="choices">
                    ${form.choices.map(choice => `
                        <button type="button" class="choice">
                            <b>${choice.title}</b>
                            <span class="choice-description">${choice.description}</span>
                        </button>`).join("")}
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

        document.getElementById("activeForm").onsubmit = async event => {
            event.preventDefault();

            const activeForm = event.currentTarget;
            const submitButton = activeForm.querySelector('button[type="submit"]');

            //Maybe connect Mailchimp later?
            if (type === "connect") {
                fakeSuccess(form.title);
                return;
            }

            if (type !== "new" && type !== "serve") return;
            if (!activeForm.reportValidity()) return;

            const values = new FormData(activeForm);
            const interests = [...activeForm.querySelectorAll(".choice.selected b")].map(item => item.textContent.trim());
            const payload = {
                type,
                firstName: values.get("first") || "",
                lastName: values.get("last") || "",
                name: values.get("name") || "",
                email: values.get("email") || "",
                phone: values.get("phone") || "",
                interests,
                website: ""
            };

            if (type === "serve" && interests.length === 0) {
                let notice = activeForm.querySelector(".choice-error");

                if (!notice) {
                    notice = document.createElement("p");
                    notice.className = "choice-error";
                    notice.setAttribute("role", "alert");
                    notice.style.color = "#b42318";
                    notice.style.fontWeight = "600";

                    const choices = activeForm.querySelector(".choices");
                    choices.insertAdjacentElement("afterend", notice);
                }

                notice.textContent = "Please select at least one are you'd like to serve in.";
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = "Sending...";

            try {
                await fetch(KIOSK_ENDPOINT, { method: "POST", mode: "no-cors", headers: {"Content-Type":"text/plain;charset=UTF-8"}, body: JSON.stringify(payload)});

                modal.innerHTML = `
                    <div class="success">
                        <div class="big">✔️</div>
                        <h2>Thank you!</h2>
                        <p>Sent! We'll be in touch.</p>
                        <div class="actions">
                            <button class="btn primary" onclick="closeModal()">Back to Welcome</button>
                        </div>
                    </div>
                `;
            } catch (error) {
                console.error("Kiosk submission failed:", error);
                submitButton.disabled = false;
                submitButton.textContent = "Try again";

                let notice = activeForm.querySelector(".submit-error");
                if (!notice) {
                    notice = document.createElement("p");
                    notice.className = "submit-error";
                    notice.setAttribute("role", "alert");
                    activeForm.appendChild(notice);
                }
                notice.textContent = "Unable to send. Please try again or speak to a member of staff."
            }
        };
    }

    overlay.classList.add("open");
}

function fakeSuccess(label) {
    const messages = {
        "Stay Connected": "Thanks for your interest! This prototype hasn't added you to the email list yet.",
        "Serve with Us": "Thanks for your interest in serving! This prototype didn't send your details anywhere.",
        "I'm New": "Thanks for providing your details! We'll be in further contact soon.",
        "Giving": "Thank you for your generousity! Secure giving hasn't been set up yet."
    };

    modal.innerHTML = `
        <div class="success">
            <div class="big">✔️</div>
            <h2>Thank you!</h2>
            <p>${messages[label] || "Thanks for your interest! This is a prototype, so nothing happened."}</p>
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

const IDLE_TIMEOUT_MS = 60 * 1000;
const PROMPT_TIMEOUT_MS = 30 * 1000;

let idleTimer;
let promptTimer;


function clearUnfinishedForm() {
    const modal = document.getElementById("modal");

    if (!modal) return;

    modal.querySelectorAll("input, textarea, select").forEach(field => {
        if (field.type === "checkbox" || field.type === "radio") {
            field.checked = false;
        } else {
            field.value = "";
        }
    });
}

function removeIdlePrompt() {
    const prompt = document.getElementById("idle-presence-prompt");

    if(prompt) prompt.remove();

    clearTimeout(promptTimer);
}

function returnToWelcome(){
    removeIdlePrompt();
    clearUnfinishedForm();
    closeModal();
}

function showIdlePrompt() {
    const overlay = document.getElementById("overlay");

    if (!overlay || !overlay.classList.contains("open")) {
        return;
    }

    removeIdlePrompt();

    const prompt = document.createElement("div");
    prompt.id = "idle-presence-prompt";
    prompt.setAttribute("role", "alertdialog");
    prompt.setAttribute("aria-modal", "true");
    prompt.setAttribute("aria-labelledby", "idle-prompt-title");
    prompt.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: rgba(20, 20, 20, 0.72);
    `;

    prompt.innerHTML = `
        <div style="
            width: min(100%, 420px);
            padding: 28px;
            border-radius: 18px;
            background: #fff;
            color: var(--ink);
            text-align: center;
            box-shadow: 0 12px 40px rgba (0,0,0,.25);
        ">
            <h2 id="idle-prompt-title">Would you like to continue?</h2>
            <div style="
                display: flex;
                gap: 12px;
                justify-content: center;
                align-items: center;
                flex-wrap: wrap;
                margin-top: 22px;
            ">
                <button type="button" id="idle-stay" style="
                    padding: 14px 20px;
                    border: 0;
                    border-radius: 10px;
                    background: var(--accent);
                    color: #fff;
                    font-weight: 700
                ">
                    Yes, I'm still here
                </button>
                
                <button type="button" id="idle-exit" style="
                    padding: 14px 20px;
                    border: 1px solid #1b1b1b;
                    border-radius: 10px;
                    background: #fff;
                    color: var(--ink);
                ">
                    Start over
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(prompt);

    document.getElementById("idle-stay").onclick = () => {
        removeIdlePrompt();
        resetIdleTimer();
    };

    document.getElementById("idle-exit").onclick = () => {
        returnToWelcome();
    };

    promptTimer = setTimeout(returnToWelcome, PROMPT_TIMEOUT_MS);
}

function resetIdleTimer() {
    clearTimeout(idleTimer);

    if (document.getElementById("idle-presence-prompt")) {
        return;
    }

    idleTimer = setTimeout(showIdlePrompt, IDLE_TIMEOUT_MS);
}

["pointerdown", "keydown", "input", "change"].forEach(eventName => {
    document.addEventListener(eventName, resetIdleTimer);
});

resetIdleTimer();