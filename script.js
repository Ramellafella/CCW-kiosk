const overlay = document.getElementById("overlay");
const modal = document.getElementById("modal");
const KIOSK_ENDPOINT = "https://script.google.com/macros/s/AKfycbx7LUmxS-GvER-PMvedJzx8-x9p_5vOAo3gxpnhTO3_AColU77e6Phm-GV74aX577bo3w/exec";
const STEWARDSHIP_URL = "https://account.stewardship.org.uk/gift/start/20424526";

//FORM DEFINITIONS
const forms = {
    connect: {
        title: "Connect With Us",
        intro: "Whether you're new to CCW or want to keep up with church news, we'd love to hear from you.", 
        fields: [
            ["First name*", "first", "text", true],
            ["Last name*", "last", "text", true],
            ["Email*", "email", "email", true],
            ["Phone number", "phone", "tel", false],
            
        ], 
        checkboxes: [
            {
                label: "I'm new to CCW",
                name: "newHere"
            },
            {
                label: "I'd like to receive church news and updates",
                name: "updates"
            }
        ]
    },

    serve: {
        title: "Serve",
        intro: "Tell us what interests you. We'll then follow up with you about it.",
        fields: [
            ["First name*", "first", "text", true],
            ["Last name*", "last", "text", true],
            ["Email*", "email", "email", true],
            ["Phone number", "phone", "tel", false]
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
                title: "Audio",
                description: 'Help manage sound, microphones, and instruments during a service.'
            },
            {
                title: "Visual Media",
                description: 'Help manage screens and slides during a service.'
            },
            {
                title: "Something Else",
                description: 'Have another idea? Tell us how you would love to help.'
            }
        ]
    },

    registration: {
        title: "Sunday Club Registration",
        intro: "If your child is new, please complete this form so our Sunday Club teams can prepare to welcome your child.",
        fields: [
            ["First name*", "guardianFirst", "text", true],
            ["Last name*", "guardianLast", "text", true],
            ["Email*", "guardianEmail", "email", true],
            ["Phone number*", "guardianPhone", "tel", true],
        ], 
        checkboxes: [
            {
                label: "I give my permission for my child(ren) to attend Sunday Club",
                name: "permAttendance",
                required: true
            },
            {
                label: "I give my permission for data about me and my child to be handled as outlined in CCW's Data Protection Notice.",
                name: "permData",
                required: true
            }
        ]
    }
};

function createChildSection(index) {
    const section = document.createElement("fieldset");

    section.className = "child-section";
    section.dataset.childIndex = index;

    section.innerHTML = `
        <legend>Child ${index + 1}</legend>

        <label>
            First Name*
            <input type="text" name="children[${index}][firstName]" autocomplete="off" required>
        </label>

        <label>
            Last Name*
            <input type="text" name="children[${index}][lastName]" autocomplete="off" required>
        </label>

        <label>
            Date of Birth*
            <input type="date" name="children[${index}][dateOfBirth]" autocomplete="off" required>
        </label>

        <label>
            School Year*
            <select name="children[${index}][schoolYear]" required>
                <option value="">Select school year</option>
                <option value="Not yet in school">Not yet in school</option>
                <option value="Reception">Reception</option>
                <option value="Year 1">Year 1</option>
                <option value="Year 2">Year 2</option>
                <option value="Year 3">Year 3</option>
                <option value="Year 4">Year 4</option>
                <option value="Year 5">Year 5</option>
                <option value="Year 6 or above">Year 6 or above</option>
            </select>
        </label>

        <label>
            Allergies or relevant medical information
            <textarea name="children[${index}][additionalInfo]" rows="3"></textarea>
        </label>

        <fieldset class="child-consent">
            <legend>Photo and video permission*</legend>
            <p class="description">Do you permit photos or videos of your children to be taken? These may be used in the chuch's publicity. Names will be kept anonymous.</p>
            <label>
                <input type="radio" name="children[${index}][photoConsent]" value="yes" required>Yes, I give permission
            </label>

            <label>
                <input type="radio" name="children[${index}][photoConsent]" value="no" required>No, I do not give permission
            </label>
        </fieldset>

        <button type="button" class="btn secondary remove-child" ${index === 0 ? "hidden" : ""}>Remove Child</button>
    `;
    return section;
}

function initialiseChildrenForm() {
    const container = modal.querySelector(".children-container");

    if (!container) return;

    const list = container.querySelector(".children-list");
    const addButton = container.querySelector(".add-child");

    let childCount = 0;

    function addChild() {
        const section = createChildSection(childCount);

        list.appendChild(section);
        childCount++;

        updateChildSections();
    }

    function updateChildSections() {
        const sections = [...list.querySelectorAll(".child-section")];

        sections.forEach((section, index) => {
            section.querySelector("legend").textContent = `Child ${index + 1}`;
            section.querySelector(".remove-child").hidden = index === 0;
            section.dataset.childIndex = index;
            section.querySelectorAll("[name]").forEach(field => {
                const key = field.name.match(/\]\[(.+)\]$/)?.[1];

                if (key) {
                    field.name = `children[${index}][${key}]`;
                }
            });
        });

        addButton.disabled = sections.length >= 10;
        addButton.textContent = addButton.disabled ? "Maximum of 10 children reached" : "+ Add Another Child";
    }

    addButton.addEventListener("click", () => {
        addChild();

        const sections = list.querySelectorAll(".child-section");
        const lastSection = sections[sections.length - 1];

        lastSection.querySelector("input")?.focus();
    });

    list.addEventListener("click", event => {
        const removeButton = event.target.closest(".remove-child");

        if (!removeButton) return;

        removeButton.closest(".child-section").remove();
        updateChildSections();
    });
    addChild();
}

//OPEN FORMS
function openForm(type) {
    if(type === "give") {
        modal.innerHTML = `
            <div class="modal-head">
                <div>
                    <h2>Give</h2>
                    <p class="intro">Your gift helps support the work and ministry of Central Church Warrington.</p>
                </div>

                <button type="button" class="close" aria-label="Close">x</button>
            </div>

            <div class="success">
                <div class="big"><img src="images/give.svg" alt=""></div>
                <h2>Secure Giving</h2>
                <p>This button will take you to our secure giving provider rather than collecting your bank details here.</p>
                <div class="actions">
                    <button class="btn primary" onclick="fakeSuccess('Giving')">Continue to Give</button>
                </div>
            </div>  
        `;
        overlay.classList.add("open");
        return;
    } 
    
    if (type === "events") {
        modal.innerHTML = `
            <div class="modal-head">
                <div>
                    <h2>What's On?</h2>
                    <p class="intro">An updateable list of events and Teams?</p>
                </div>

                <button type="button" class="close" aria-label="Close">x</button>
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
        overlay.classList.add("open");
        return;
    }
    const form = forms[type];

    if (!form) {
        console.error("Unknown form type:", type);
        return;
    }
        let html = `
            <div class="modal-head">
                <div>
                    <h2>${form.title}</h2>
                    <p class="intro">${form.intro}</p>
                </div>

                <button type="button" class="close" aria-label="Close">x</button>
            </div>

            <form id="activeForm">
        `;

        if (type === "registration") {
            html += `
                <h3>Parent / Guardian</h3>
                    <fieldset class="parent-fieldset">
            `;
        }

        for (const field of form.fields) {
            const [label, name, inputType, required] = field;

            html += `
                <label>
                    ${label}
                    <input 
                        name="${name}"
                        type="${inputType}" 
                        ${required ? "required" : ""}
                        ${inputType === "email" ? 'autocomplete="email"' : ""}
                    >
                </label>
            `;
        }

        if (type === "registration") {
            html += `
                </fieldset>
                <h3>Children</h3>
                    <div class="children-container">
                    <div class="children-list"></div>

                    <button type="button" class="btn secondary add-child">+ Add Another Child</button>
                </div>
            `;
        }

        if (form.checkboxes) {
            html += `
                <div class="form-checkboxes">
                    ${form.checkboxes.map(item => `
                        <label class="checkbox-label">
                            <input type="checkbox" name="${item.name}" value="yes" ${item.required ? "required" : ""}>
                            <span>${item.label}</span>
                        </label>
                    `).join("")}
                </div>
            `;
        }

        if (form.choices) {
            html += `
                <fieldset class="serve-fieldset">
                    <legend>What interests you?</legend>

                    <div class="serve-choices">
                        ${form.choices.map(choice => `
                            <button type="button" class="choice" aria-pressed="false" data-interest="${choice.title}">
                                <b>${choice.title}</b>
                                <span class="choice-description">${choice.description}</span>
                            </button>`).join("")}
                    </div>
                </fieldset>
            `;
        }

        if (form.textarea) {
            html += `
                <label>
                    ${form.textarea}

                    <textarea name="additionalInfo" rows="3"></textarea>
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
        modal.dataset.formType = type;

        if (type === "registration") {
            initialiseChildrenForm();
        }

        //Serve Choices
        document.querySelectorAll("[data-interest]").forEach(button => {
            button.addEventListener("click", () => {
                const selected = button.classList.toggle("selected");
                
                button.setAttribute("aria-pressed", String(selected));

                const error = modal.querySelector(".choice-error");

                if (error) {
                    error.remove()
                }
            });
        });

        //Submission
        const activeForm = document.getElementById("activeForm");

        activeForm.addEventListener("submit", handleFormSubmit);
        overlay.classList.add("open");
    }

    async function handleFormSubmit(event) {
        event.preventDefault();

        const activeForm = event.currentTarget;

        if (!activeForm.reportValidity()) {
            return;
        }

        const type = modal.dataset.formType;

        if (!type) {
            return;
        }

        const form = forms[type];
        const values = new FormData(activeForm);

        const interests = [...activeForm.querySelectorAll("[data-interest].selected")].map(button => button.dataset.interest);

        if (type === "serve" && interests.length === 0) {
            let notice = activeForm.querySelector(".choice-error");

            if(!notice) {
                notice = document.createElement("p");
                    notice.className = "choice-error";
                    notice.setAttribute("role", "alert");
                    notice.style.color = "#b42318";
                    notice.style.fontWeight = "600";

                    activeForm.querySelector(".serve-fieldset").appendChild(notice);
            }

            notice.textContent = "Please select at least one area you'd like to serve in."

            return;
        }

        //Maybe connect Mailchimp later?
        if (type === "connect") {
            fakeSuccess(form.title);
            return;
        }

        if (type === "registration") {
            const childSections = [...activeForm.querySelectorAll(".child-section")];
            const children = childSections.map((section, index) => {
                function getFieldValue(fieldName) {
                    const field = section.querySelector(`[name$="[${fieldName}]"]`);

                    if (!field) {
                        throw new Error(`Child ${index + 1} is missing the "${fieldName}" field.`);
                    }
                    return field.value.trim();
                }
                const photoConsent = section.querySelector('[name$="[photoConsent]"]:checked');

                return {
                    firstName: getFieldValue("firstName"),
                    lastName: getFieldValue("lastName"),
                    dateOfBirth: getFieldValue("dateOfBirth"),
                    schoolYear: getFieldValue("schoolYear"),
                    additionalInfo: getFieldValue("additionalInfo"),
                    photoConsent: photoConsent?.value || "",
                };
            });

            const registration = {
                type: "registration",
                guardian: {
                    firstName: values.get("guardianFirst"),
                    lastName: values.get("guardianLast"),
                    email: values.get("guardianEmail"),
                    phone: values.get("guardianPhone")
                },
                permissions: {
                    attendance: values.get("permAttendance") === "yes",
                    dataProtection: values.get("permData") === "yes"
                },
                children
            };

            const payload = {
                type: "registration",
                guardian: {
                    firstName: values.get("guardianFirst"),
                    lastName: values.get("guardianLast"),
                    email: values.get("guardianEmail"),
                    phone: values.get("guardianPhone"),
                },
                permissions: {
                    attendance: values.get("permAttendance") === "yes",
                    dataProtection: values.get("permData") === "yes"
                },
                children,
                website: ""
            };

            try {
                await fetch(KIOSK_ENDPOINT, { method: "POST", mode: "no-cors", headers: { "Content-Type":"text/plain;charset=UTF-8" }, body: JSON.stringify(payload) });

                modal.innerHTML = `
                    <div class="success">
                        <div class="big">✔️</div>
                        <h2>Registration submitted</h2>
                        <p>Your registration form has been sent.</p>
                        <div class="actions">
                            <button type="button" class="btn primary" onclick="closeModal()">Back to Welcome</button>
                        </div>
                    </div>
                `;
            } catch (error) {
                console.error("Registration request failed: ", error);
                alert("We couldn't send the registration. Please try again or speak to a member of staff.");
            }
        }

        if (type !== "serve") {
            return;
        }
        
        const submitButton = activeForm.querySelector('button[type="submit"]');
        const payload = {
                type,
                firstName: values.get("first") || "",
                lastName: values.get("last") || "",
                name: `${values.get("first") || ""} ${values.get("last") || ""}`.trim(),
                email: values.get("email") || "",
                phone: values.get("phone") || "",
                interests,
                website: ""
            };

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
    }

function fakeSuccess(label) {
    const messages = {
        "Connect With Us": "Thanks for connecting with us! This prototype hasn't added you to the email list yet.",
        "Serve": "Thanks for your interest in serving! This prototype didn't send your details anywhere.",
        "Sunday Club Registration": "Thank you! This registration is still under development and details have not been sent anywhere.",
        "Giving": "Thank you for your generosity! Secure giving hasn't been set up yet."
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
    clearTimeout(idleTimer);
    removeIdlePrompt();
    overlay.classList.remove("open");
}

document.querySelectorAll("[data-form]").forEach(button => {
    button.onclick = () => {openForm(button.dataset.form);};
});

overlay.addEventListener("click", event => {
    if (event.target === overlay) {
        closeModal();
    }
});

document.addEventListener("click", event => {
    if (event.target.closest(".close")) {
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
            box-shadow: 0 12px 40px rgba(0,0,0,0.25);
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
    document.addEventListener(eventName, resetIdleTimer, { passive: true });
});

resetIdleTimer();