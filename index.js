/* ==========================================================================
   BLUE LIGHT COLLEGE - ACADEMIC LOGIC & ENGINE
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initCourseTabs();
    initQuiz();
    initFAQ();
    initNavScroll();
    initLeadForms();
});

/* --------------------------------------------------------------------------
   1. Course Tab Switcher
   -------------------------------------------------------------------------- */
function initCourseTabs() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-tab");
            
            // Remove active states from all buttons
            tabButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            // Transition and toggle tab content
            const allTabs = document.querySelectorAll(".tab-content");
            allTabs.forEach(tab => {
                tab.classList.remove("active");
                // Small timeout to allow transition to trigger correctly
                setTimeout(() => {
                    if (tab.id === `tab-${targetTab}`) {
                        tab.classList.add("active");
                    }
                }, 50);
            });
        });
    });
}

/* --------------------------------------------------------------------------
   2. Bildungsgutschein Eligibility Wizard Logic
   -------------------------------------------------------------------------- */
let currentWizardStep = 1;
const wizardAnswers = {};

window.nextStep = function(step, val) {
    wizardAnswers[step] = val;
    
    // Deactivate current step view
    const currentStepEl = document.getElementById(`w-step-${step}`);
    currentStepEl.style.opacity = "0";
    currentStepEl.style.transform = "translateX(-15px)";
    
    setTimeout(() => {
        currentStepEl.classList.remove("active");
        
        // Advance step
        currentWizardStep = step + 1;
        
        // Update Step Indicator circles
        const nextInd = document.getElementById(`step-ind-${currentWizardStep}`);
        const currentInd = document.getElementById(`step-ind-${step}`);
        if (currentInd) {
            currentInd.classList.remove("active");
            currentInd.classList.add("completed");
        }
        if (nextInd) {
            nextInd.classList.add("active");
        }
        
        // Activate next step view
        const nextStepEl = document.getElementById(`w-step-${currentWizardStep}`);
        if (nextStepEl) {
            nextStepEl.classList.add("active");
            // Allow CSS to trigger transition
            setTimeout(() => {
                nextStepEl.style.opacity = "1";
                nextStepEl.style.transform = "translateX(0)";
            }, 50);
        }
    }, 300);
};

/* --------------------------------------------------------------------------
   3. IHK §34a Mock Exam Quiz Engine
   -------------------------------------------------------------------------- */
const quizQuestions = [
    {
        question: "Welche der folgenden Befugnisse steht einem privaten Sicherheitsmitarbeiter im öffentlichen Raum grundsätzlich zu?",
        options: [
            "Das Recht zur vorläufigen Festnahme bei frischer Tat (§ 127 StPO)",
            "Das Recht zur Identitätsfeststellung im Auftrag der Polizei",
            "Das Recht zur Durchsuchung von verdächtigen Personen",
            "Das Recht zur Sperrung öffentlicher Straßen bei Gefahr"
        ],
        correct: 0,
        explanation: "Als Sicherheitsmitarbeiter besitzen Sie im öffentlichen Raum dieselben Rechte wie jeder andere Bürger (Jedermannsrechte). § 127 StPO erlaubt jedem, eine Person vorläufig festzunehmen, wenn diese auf frischer Tat betroffen wird und Fluchtverdacht besteht."
    },
    {
        question: "Wann darf die Notwehr (§ 227 BGB / § 32 StGB) ausgeübt werden?",
        options: [
            "Gegen jeden zukünftigen, mutmaßlichen Angriff",
            "Gegen einen gegenwärtigen, rechtswidrigen Angriff auf ein geschütztes Rechtsgut",
            "Als Bestrafung, nachdem der Angreifer geflohen ist",
            "Nur zur Abwehr von lebensgefährlichen Angriffen"
        ],
        correct: 1,
        explanation: "Notwehr ist die Verteidigung, die erforderlich ist, um einen gegenwärtigen, rechtswidrigen Angriff von sich oder einem anderen abzuwenden. Sie gilt für alle geschützten Rechtsgüter (z. B. Körper, Eigentum, Ehre)."
    },
    {
        question: "Wer nimmt die offizielle Sachkundeprüfung gemäß §34a GewO ab?",
        options: [
            "Die örtliche Polizeiinspektion",
            "Das zuständige Gewerbeamt",
            "Die Industrie- und Handelskammer (IHK)",
            "Der private Bildungsträger selbst"
        ],
        correct: 2,
        explanation: "Die Sachkundeprüfung ist eine staatlich geregelte Prüfung und darf ausschließlich von der Industrie- und Handelskammer (IHK) abgenommen werden. Wir bereiten Sie intensiv und zielgerichtet darauf vor."
    }
];

let quizCurrentIndex = 0;
let quizScore = 0;
let quizOptionSelected = false;

function initQuiz() {
    renderQuizQuestion();
}

function renderQuizQuestion() {
    quizOptionSelected = false;
    const currentQ = quizQuestions[quizCurrentIndex];
    
    // Update question progress info
    document.getElementById("quiz-q-num").innerText = `Frage ${quizCurrentIndex + 1} von ${quizQuestions.length}`;
    document.getElementById("quiz-q-text").innerText = currentQ.question;
    
    // Update progress bar width
    const progressPercent = ((quizCurrentIndex + 1) / quizQuestions.length) * 100;
    document.getElementById("quiz-progress").style.width = `${progressPercent}%`;
    
    // Reset next button and feedback text
    const nextBtn = document.getElementById("quiz-next-btn");
    nextBtn.style.display = "none";
    
    const feedbackText = document.getElementById("quiz-feedback");
    feedbackText.innerText = "Wählen Sie eine Antwortoption aus.";
    feedbackText.className = "quiz-feedback-text";
    
    // Render options
    const optionsContainer = document.getElementById("quiz-options");
    optionsContainer.innerHTML = "";
    
    currentQ.options.forEach((opt, idx) => {
        const btn = document.createElement("button");
        btn.className = "quiz-option-item";
        btn.innerText = opt;
        btn.onclick = () => selectQuizOption(btn, idx);
        optionsContainer.appendChild(btn);
    });
}

function selectQuizOption(selectedBtn, selectedIdx) {
    if (quizOptionSelected) return; // Prevent multiple selections
    quizOptionSelected = true;
    
    const currentQ = quizQuestions[quizCurrentIndex];
    const optionButtons = document.querySelectorAll(".quiz-option-item");
    const feedbackText = document.getElementById("quiz-feedback");
    
    // Disable all options
    optionButtons.forEach(btn => btn.classList.add("disabled"));
    
    if (selectedIdx === currentQ.correct) {
        selectedBtn.classList.add("correct");
        feedbackText.innerText = `Korrekt! ${currentQ.explanation}`;
        feedbackText.className = "quiz-feedback-text correct-feedback";
        quizScore++;
    } else {
        selectedBtn.classList.add("wrong");
        optionButtons[currentQ.correct].classList.add("correct");
        feedbackText.innerText = `Nicht ganz richtig. ${currentQ.explanation}`;
        feedbackText.className = "quiz-feedback-text wrong-feedback";
    }
    
    // Show next question button
    const nextBtn = document.getElementById("quiz-next-btn");
    nextBtn.style.display = "inline-flex";
    if (quizCurrentIndex === quizQuestions.length - 1) {
        nextBtn.innerText = "Ergebnis anzeigen";
    } else {
        nextBtn.innerText = "Nächste Frage \u2192";
    }
}

window.handleQuizNext = function() {
    if (quizCurrentIndex < quizQuestions.length - 1) {
        quizCurrentIndex++;
        renderQuizQuestion();
    } else {
        renderQuizResults();
    }
};

function renderQuizResults() {
    const container = document.getElementById("quiz-container");
    
    let resultMessage = "";
    if (quizScore === quizQuestions.length) {
        resultMessage = "Hervorragend gelöst! Sie besitzen bereits ein exzellentes juristisches Verständnis.";
    } else if (quizScore >= 2) {
        resultMessage = "Sehr gut! Sie verfügen über solides juristisches Grundwissen.";
    } else {
        resultMessage = "Keine Sorge! Das Sicherheitsrecht ist komplex. Genau dafür sind wir da.";
    }
    
    container.innerHTML = `
        <div class="quiz-finished-box">
            <div class="quiz-score-badge">${quizScore}/${quizQuestions.length}</div>
            <h3 class="quiz-results-title text-gradient-gold">Test abgeschlossen!</h3>
            <p class="quiz-results-text">
                ${resultMessage} Unsere Absolventen erzielen dank unseres professionellen Vorbereitungskurses eine Bestehensquote von 98% vor der IHK. Nutzen Sie Ihre Chance.
            </p>
            <div class="quiz-actions">
                <a href="#contact" class="btn btn-gold" onclick="fillCourseInterest('sachkunde-34a')">Kostenfreie Beratung buchen</a>
                <button class="btn btn-outline" onclick="resetQuiz()">Test wiederholen</button>
            </div>
        </div>
    `;
}

window.resetQuiz = function() {
    quizCurrentIndex = 0;
    quizScore = 0;
    quizOptionSelected = false;
    
    const container = document.getElementById("quiz-container");
    container.innerHTML = `
        <div class="quiz-progress-bar-wrapper">
            <div class="quiz-progress-bar" id="quiz-progress" style="width: 33%"></div>
        </div>
        <div id="quiz-question-block">
            <span class="quiz-question-number" id="quiz-q-num">Frage 1 von 3</span>
            <h3 class="quiz-question-text" id="quiz-q-text"></h3>
            <div class="quiz-options-list" id="quiz-options"></div>
        </div>
        <div class="quiz-footer">
            <span class="quiz-feedback-text" id="quiz-feedback"></span>
            <button class="btn btn-navy btn-sm" id="quiz-next-btn" style="display: none;" onclick="handleQuizNext()"></button>
        </div>
    `;
    renderQuizQuestion();
};

window.fillCourseInterest = function(val) {
    const selector = document.getElementById("course-interest");
    if (selector) {
        selector.value = val;
    }
};

/* --------------------------------------------------------------------------
   4. Smooth Expanding FAQ Accordion
   -------------------------------------------------------------------------- */
window.toggleFaq = function(trigger) {
    const item = trigger.parentElement;
    const isActive = item.classList.contains("active");
    
    // Close all open items first
    document.querySelectorAll(".faq-academic-item").forEach(faq => {
        faq.classList.remove("active");
    });
    
    // If it wasn't active, open it
    if (!isActive) {
        item.classList.add("active");
    }
};

/* --------------------------------------------------------------------------
   5. Navigation Scrolling Active Class
   -------------------------------------------------------------------------- */
function initNavScroll() {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");
    
    window.addEventListener("scroll", () => {
        let scrollY = window.pageYOffset;
        
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120;
            const sectionId = current.getAttribute("id");
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove("active");
                    if (link.getAttribute("href") === `#${sectionId}`) {
                        link.classList.add("active");
                    }
                });
            }
        });
    });
}

/* --------------------------------------------------------------------------
   6. Form Submissions / Leads Handler
   -------------------------------------------------------------------------- */
function initLeadForms() {
    const calcLeadForm = document.getElementById("calculator-lead-form");
    const mainContactForm = document.getElementById("main-contact-form");
    
    if (calcLeadForm) {
        calcLeadForm.addEventListener("submit", e => {
            e.preventDefault();
            const name = document.getElementById("calc-name").value;
            const phone = document.getElementById("calc-phone").value;
            
            showSuccessNotification("Ausbildungsberatung", `Vielen Dank, Herr/Frau ${name}. Unser Sekretariat wird Sie in Kürze unter ${phone} kontaktieren.`);
            calcLeadForm.reset();
        });
    }
    
    if (mainContactForm) {
        mainContactForm.addEventListener("submit", e => {
            e.preventDefault();
            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            
            showSuccessNotification("Anfrage registriert", `Vielen Dank, ${name}. Wir haben Ihre Anfrage erhalten. Eine Bestätigung wurde an ${email} gesendet.`);
            mainContactForm.reset();
        });
    }
}

function showSuccessNotification(title, message) {
    // Generate beautiful floating academic alert box
    const alertBox = document.createElement("div");
    alertBox.className = "floating-academic-alert";
    alertBox.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 16px;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--clr-gold-bg); border: 1px solid var(--clr-gold); display: flex; align-items: center; justify-content: center; color: var(--clr-gold); font-weight: bold;">&#10003;</div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
                <h4 style="font-family: var(--font-heading); font-weight: 700; font-size: 1rem; color: var(--clr-navy);">${title}</h4>
                <p style="font-size: 0.85rem; color: var(--clr-txt-secondary);">${message}</p>
            </div>
        </div>
    `;
    
    // Inject floating academic alert styling to document head if not present
    if (!document.getElementById("alert-styles")) {
        const styles = document.createElement("style");
        styles.id = "alert-styles";
        styles.innerHTML = `
            .floating-academic-alert {
                position: fixed;
                bottom: 32px;
                right: 32px;
                z-index: 1100;
                max-width: 380px;
                background-color: #FFFFFF;
                border: 1px solid var(--clr-border);
                border-top: 3px solid var(--clr-gold);
                border-radius: var(--radius-md);
                padding: 24px;
                box-shadow: 0 10px 30px rgba(14, 30, 54, 0.12);
                animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            @keyframes slide-up {
                0% { transform: translateY(50px) scale(0.95); opacity: 0; }
                100% { transform: translateY(0) scale(1); opacity: 1; }
            }
            @keyframes slide-down {
                0% { transform: translateY(0) scale(1); opacity: 1; }
                100% { transform: translateY(50px) scale(0.95); opacity: 0; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(alertBox);
    
    // Remove after 6 seconds
    setTimeout(() => {
        alertBox.style.animation = "slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards";
        setTimeout(() => {
            alertBox.remove();
        }, 400);
    }, 5500);
}
