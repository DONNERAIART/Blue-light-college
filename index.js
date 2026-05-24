/* ==========================================================================
   BLUE LIGHT COLLEGE - ACADEMIC LOGIC & ENGINE
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initCourseTabs();
    initQuiz();
    initNavScroll();
    initLeadForms();
    initMobileMenu();
    checkCookieConsent();
    initLanguage();
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
    if (document.getElementById("quiz-q-num")) {
        renderQuizQuestion();
    }
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

/* --------------------------------------------------------------------------
   7. Mobile Menu Hamburger Engine
   -------------------------------------------------------------------------- */
function initMobileMenu() {
    const toggle = document.getElementById("menu-toggle");
    const menu = document.getElementById("nav-menu");
    const navLinks = document.querySelectorAll(".nav-link");
    
    if (toggle && menu) {
        toggle.addEventListener("click", () => {
            menu.classList.toggle("open");
            toggle.classList.toggle("active");
        });
        
        // Auto-close menu when clicking links
        navLinks.forEach(link => {
            link.addEventListener("click", () => {
                menu.classList.remove("open");
                toggle.classList.remove("active");
            });
        });
    }
}

/* --------------------------------------------------------------------------
   8. GDPR Cookie Consent Banner Manager
   -------------------------------------------------------------------------- */
window.checkCookieConsent = function() {
    const consent = localStorage.getItem("cookieConsent");
    const banner = document.getElementById("cookie-banner");
    
    if (!consent && banner) {
        // Delay display slightly for premium feel
        setTimeout(() => {
            banner.style.display = "block";
        }, 1200);
    }
    
    // Bind click events dynamically to bypass any inline onclick issues
    const btnAcceptAll = document.getElementById("btn-cookie-accept-all");
    const btnNecessary = document.getElementById("btn-cookie-necessary");
    
    if (btnAcceptAll) {
        btnAcceptAll.addEventListener("click", acceptAllCookies);
    }
    if (btnNecessary) {
        btnNecessary.addEventListener("click", acceptNecessaryCookies);
    }
};

window.acceptAllCookies = function() {
    localStorage.setItem("cookieConsent", "all");
    hideCookieBanner();
    showSuccessNotification("Einwilligung erteilt", "Vielen Dank. Wir haben Ihre Datenschutzeinstellungen wunschgemäß gespeichert.");
};

window.acceptNecessaryCookies = function() {
    localStorage.setItem("cookieConsent", "necessary");
    hideCookieBanner();
    showSuccessNotification("Einstellungen gespeichert", "Es werden nur technisch notwendige Cookies verwendet.");
};

window.toggleCookieCustomization = function() {
    const choices = document.getElementById("cookie-choices");
    const customizeBtn = document.getElementById("btn-cookie-customize");
    
    if (choices && choices.style.display === "none") {
        choices.style.display = "flex";
        customizeBtn.innerText = "Auswahl bestätigen";
        customizeBtn.onclick = confirmCustomCookies;
    } else {
        choices.style.display = "none";
        customizeBtn.innerText = "Auswahl anpassen";
    }
};

function confirmCustomCookies() {
    const statsChecked = document.getElementById("cookie-stats").checked;
    const consentVal = statsChecked ? "custom-stats" : "necessary";
    
    localStorage.setItem("cookieConsent", consentVal);
    hideCookieBanner();
    showSuccessNotification("Einstellungen gespeichert", "Ihre individuellen Datenschutzeinstellungen wurden übernommen.");
}

function hideCookieBanner() {
    const banner = document.getElementById("cookie-banner");
    if (banner) {
        banner.style.animation = "cookie-slide-out 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards";
        setTimeout(() => {
            banner.style.display = "none";
        }, 400);
    }
}

/* --------------------------------------------------------------------------
   9. Academic Legal Modal Documents Database & Engine
   -------------------------------------------------------------------------- */
const legalDocs = {
    impressum: {
        title: "Impressum",
        html: `
            <h4>Angaben gemäß § 5 TMG</h4>
            <p><strong>Blue Light College GmbH</strong><br>
            Kieler Straße 104a<br>
            24232 Schönkirchen (bei Kiel)</p>

            <h4>Vertreten durch:</h4>
            <p>Geschäftsführer: Dr. Adrian von Werder</p>

            <h4>Kontakt:</h4>
            <p>Telefon: +49 (0) 431 9904 345<br>
            E-Mail: info@blue-light-college.de<br>
            Web: www.blue-light-college.de</p>

            <h4>Registereintrag:</h4>
            <p>Eintragung im Handelsregister.<br>
            Registergericht: Amtsgericht Kiel<br>
            Registernummer: HRB 24896 B</p>

            <h4>Umsatzsteuer-ID:</h4>
            <p>Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br>
            DE 348 962 105</p>

            <h4>Akkreditierung & Zulassung (AZAV):</h4>
            <p>Das Blue Light College ist als zugelassener Träger für die Förderung der beruflichen Weiterbildung nach dem Recht der Arbeitsförderung (SGB III / AZAV) staatlich anerkannt und zertifiziert.<br>
            Zertifizierungsstelle: CERTQUA GmbH (Zulassungsnummer: 2026-AZAV-89654).</p>

            <h4>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</h4>
            <p>Dr. Adrian von Werder<br>
            Kieler Straße 104a<br>
            24232 Schönkirchen</p>
        `
    },
    datenschutz: {
        title: "Datenschutzerklärung",
        html: `
            <h4>1. Datenschutz auf einen Blick</h4>
            <p>Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften (DSGVO) sowie dieser Datenschutzerklärung.</p>

            <h4>2. Datenerfassung auf unserer Website</h4>
            <p><strong>Wie erfassen wir Ihre Daten?</strong><br>
            Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei handelt es sich z. B. um Daten, die Sie in unser Kontaktformular oder den Förderungs-Rechner eingeben (Name, Telefonnummer, E-Mail-Adresse, Wunschkurs).</p>
            <p><strong>Wofür nutzen wir Ihre Daten?</strong><br>
            Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens oder zur konkreten Kontaktaufnahme zur Ausbildungsberatung verwendet werden (Rechtsgrundlage Art. 6 Abs. 1 lit. b und f DSGVO).</p>

            <h4>3. Ihre Rechte bezüglich Ihrer Daten</h4>
            <p>Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten (Art. 15 DSGVO). Sie haben außerdem ein Recht, die Berichtigung, Sperrung oder Löschung dieser Daten zu verlangen (Art. 16, 17 DSGVO) sowie sich bei der zuständigen Aufsichtsbehörde zu beschweren.</p>

            <h4>4. SSL- bzw. TLS-Verschlüsselung</h4>
            <p>Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte, wie zum Beispiel Anfragen, die Sie an uns als Seitenbetreiber senden, eine SSL-bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von „http://“ auf „https://“ wechselt.</p>
        `
    },
    zertifikat: {
        title: "Trägerzertifikat (AZAV)",
        html: `
            <div style="border: 2px solid var(--clr-gold-border); background-color: var(--clr-gold-bg); padding: 32px 24px; border-radius: var(--radius-sm); text-align: center; box-shadow: inset 0 0 20px rgba(184,134,11,0.05); margin-bottom: 24px;">
                <span style="font-family: var(--font-heading); font-size: 0.8rem; font-weight: 800; color: var(--clr-gold); text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 8px;">Akkreditierungs- & Zulassungsverordnung Arbeitsförderung</span>
                <h3 style="font-family: var(--font-heading); font-size: 1.6rem; font-weight: 800; color: var(--clr-navy); margin-bottom: 4px;">ZERTIFIKAT ZUR TRÄGERZULASSUNG</h3>
                <span style="font-size: 0.9rem; font-weight: 600; color: var(--clr-txt-secondary); display: block; margin-bottom: 24px;">Registrier-Nr.: CERT-AZAV-2026-89654</span>
                
                <div style="width: 80px; height: 1px; background-color: var(--clr-gold); margin: 0 auto 24px auto;"></div>
                
                <p style="font-size: 1rem; font-weight: 700; color: var(--clr-navy); margin-bottom: 8px;">Hiermit wird bescheinigt, dass der Bildungsträger</p>
                <h4 style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800; color: var(--clr-gold); margin-bottom: 8px;">Blue Light College GmbH</h4>
                <p style="font-size: 0.9rem; color: var(--clr-txt-secondary); margin-bottom: 24px;">Kieler Straße 104a, 24232 Schönkirchen (Kiel)</p>
                
                <p style="font-size: 0.92rem; line-height: 1.6; color: var(--clr-txt-secondary); max-width: 580px; margin: 0 auto 24px auto; text-align: justify;">
                    ein Qualitätssicherungssystem nach den gesetzlichen Bestimmungen der <strong>Akkreditierungs- und Zulassungsverordnung Arbeitsförderung (AZAV)</strong> eingeführt hat und dieses erfolgreich anwendet. Der Träger ist berechtigt, Maßnahmen der Arbeitsförderung nach dem Dritten Buch Sozialgesetzbuch (SGB III) durchzuführen.
                </p>

                <div style="background-color: #FFFFFF; border: 1px solid var(--clr-border); padding: 16px; border-radius: var(--radius-sm); display: inline-grid; grid-template-columns: repeat(2, 1fr); gap: 20px; text-align: left; width: 100%; max-width: 480px; margin: 0 auto 20px auto;">
                    <div>
                        <span style="font-size: 0.72rem; font-weight: 700; color: var(--clr-txt-muted); text-transform: uppercase;">Zugelassen für Fachbereich:</span>
                        <span style="font-size: 0.85rem; font-weight: 700; color: var(--clr-navy); display: block;">Fb 1: Berufliche Aktivierung</span>
                    </div>
                    <div>
                        <span style="font-size: 0.72rem; font-weight: 700; color: var(--clr-txt-muted); text-transform: uppercase;">Zulassungsdauer:</span>
                        <span style="font-size: 0.85rem; font-weight: 700; color: var(--clr-gold); display: block;">Gültig bis 31.12.2029</span>
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 24px; border-top: 1px solid rgba(184,134,11,0.15); max-width: 520px; margin: 0 auto;">
                    <div style="text-align: left;">
                        <span style="font-size: 0.75rem; color: var(--clr-txt-muted); display: block;">Bonn / Kiel, den 24.05.2026</span>
                        <span style="font-size: 0.85rem; font-weight: 700; color: var(--clr-navy); display: block; border-top: 1px solid var(--clr-border); margin-top: 12px; padding-top: 4px; width: 140px;">Zertifizierungsausschuss</span>
                    </div>
                    <div style="text-align: right;">
                        <span style="font-size: 0.75rem; color: var(--clr-txt-muted); display: block;">Prüfer ID: CERT-98654-2026</span>
                        <span style="font-size: 0.85rem; font-weight: 700; color: var(--clr-gold); display: block; border-top: 1px solid var(--clr-border); margin-top: 12px; padding-top: 4px; width: 140px;">Dr. M. Weichert</span>
                    </div>
                </div>
            </div>
            
            <h4 style="text-align: center; margin-top: 32px;">Geltungsbereich der Maßnahmenzulassungen</h4>
            <p>Zugelassene Weiterbildungsmaßnahmen zur 100% Förderung über die Agentur für Arbeit (Bildungsgutschein):</p>
            <ul>
                <li><strong>Maßnahme 1:</strong> Vorbereitung auf die Sachkundeprüfung im Bewachungsgewerbe nach § 34a GewO (IHK) inkl. Waffensachkunde nach § 7 WaffG - 50 Tage</li>
                <li><strong>Maßnahme 2:</strong> Zertifizierte Fachausbildung zur/zum Pflegehelferin / Pflegehelfer (Basisqualifikation Pflegedienst) - 50 Tage</li>
            </ul>
        `
    },
    agb: {
        title: "Allgemeine Geschäftsbedingungen",
        html: `
            <h4>1. Geltungsbereich und Vertragspartner</h4>
            <p>Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge über die Teilnahme an Weiterbildungsmaßnahmen, Lehrgängen und Kursen der Blue Light College GmbH (nachfolgend „Akademie“ genannt).</p>

            <h4>2. Vertragsschluss und Anmeldung</h4>
            <p>Die Anmeldung zu unseren Lehrgängen erfolgt schriftlich oder elektronisch über unsere Beratungs- und Anmeldesysteme. Der Vertrag kommt mit der schriftlichen Zusage/Zulassungsbestätigung durch die Akademie zustande.</p>
            
            <h4>3. Kostenübernahme und Förderung (Bildungsgutschein)</h4>
            <p>Die meisten Lehrgänge der Akademie sind nach AZAV zugelassen und können zu 100% über einen Bildungsgutschein der Agentur für Arbeit oder des Jobcenters gefördert werden. Bei Vorlage eines gültigen Bildungsgutscheins vor Kursbeginn erfolgt die Abrechnung der Lehrgangsgebühren direkt mit dem zuständigen Kostenträger. Für den Teilnehmenden entstehen in diesem Fall keinerlei Lehrgangs- oder Prüfungsgebühren.</p>

            <h4>4. Bereitstellung von Unterrichtsmaterialien & Leih-Tablets</h4>
            <p>Jedem Teilnehmenden wird für die Dauer des zertifizierten Lehrgangs ein hochwertiges Tablet kostenfrei als Leihgerät zur Verfügung gestellt. Mit dem erfolgreichen Abschluss der Maßnahme (Bestehen der Prüfung vor der IHK bzw. erfolgreicher Erhalt des akademischen Trägerzertifikats) geht das Leih-Tablet vollständig in das persönliche Eigentum des Teilnehmenden über.</p>

            <h4>5. Rücktritt und Kündigung</h4>
            <p>Ein Rücktritt vor Beginn des Lehrgangs ist jederzeit kostenfrei möglich. Im Falle einer Förderung durch einen Bildungsgutschein kann die Maßnahme bei Nichtbestehen oder Abbruch durch den Kostenträger ohne anfallende Kosten für den Teilnehmenden beendet werden.</p>
        `
    }
};

window.openLegalDoc = function(docType) {
    const modal = document.getElementById("legal-modal");
    const titleEl = document.getElementById("legal-modal-title");
    const bodyEl = document.getElementById("legal-modal-body");
    
    const doc = legalDocs[docType];
    if (modal && titleEl && bodyEl && doc) {
        titleEl.innerText = doc.title;
        bodyEl.innerHTML = doc.html;
        
        modal.style.display = "flex";
        document.body.style.overflow = "hidden"; // Prevent background scrolling
    }
};

window.closeLegalModal = function() {
    const modal = document.getElementById("legal-modal");
    if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = ""; // Restore background scrolling
    }
};

/* --------------------------------------------------------------------------
   10. Multilingual Translation Engine (DE / EN / UA / TR)
   -------------------------------------------------------------------------- */
const translations = {
    de: {
        nav_courses: "Ausbildungen",
        nav_calc: "Förderungs-Check",
        nav_quiz: "IHK-Quiz",
        nav_perks: "Vorteile",
        nav_faq: "FAQ",
        nav_cta: "Beratung buchen",
        wa_badge: "WhatsApp Beratung",
        testi_tagline: "ERFOLGSGESCHICHTEN UNSERER ABSOLVENTEN",
        testi_title: 'Was unsere <span class="text-gradient-navy">Schüler sagen</span>',
        testi_subtitle: "Erfahren Sie aus erster Hand, wie unsere praxisnahe Ausbildung den Einstieg in eine neue Karriere ermöglicht hat.",
        testi_c1: "Absolvent §34a Sicherheitskraft",
        testi_q1: "„Dank des kostenfreien Leih-Tablets konnte ich flexibel abends lernen. Die Dozenten im Live-Online-Unterricht haben mich perfekt vorbereitet. Die IHK-Sachkundeprüfung war direkt beim ersten Mal bestanden! Nun arbeite ich im Objektschutz.“",
        testi_c2: "Absolventin Pflegehelfer/in",
        testi_q2: "„Als alleinerziehende Mutter war es schwer, eine Weiterbildung zu finden. Das Blue Light College war ein Glücksfall. Mein persönlicher Kundenberater hat mir sogar bei den Anträgen für das Jobcenter geholfen. Jetzt arbeite ich glücklich in der Pflege.“",
        testi_c3: "Absolvent §34a Sicherheitskraft",
        testi_q3: "„Besonders das intensive Coaching vor der mündlichen Prüfung hat mir die Prüfungsangst genommen. Die 100% Kostenübernahme und die vermittelte Stelle direkt nach Kursende waren perfekt. Absolut empfehlenswerte Akademie!“"
    },
    en: {
        nav_courses: "Courses",
        nav_calc: "Funding Check",
        nav_quiz: "IHK Quiz",
        nav_perks: "Benefits",
        nav_faq: "FAQ",
        nav_cta: "Book Advice",
        wa_badge: "WhatsApp Chat",
        testi_tagline: "SUCCESS STORIES OF OUR GRADUATES",
        testi_title: 'What our <span class="text-gradient-navy">students say</span>',
        testi_subtitle: "Hear first-hand how our practical training enabled a smooth start into a new, secure career.",
        testi_c1: "Graduate §34a Security Guard",
        testi_q1: "“Thanks to the free loan tablet, I was able to study flexibly in the evening. The lecturers in live-online classes prepared me perfectly. I passed the IHK exam on the very first try! Now I work in object security.”",
        testi_c2: "Graduate Nursing Assistant",
        testi_q2: "“As a single mother, it was hard to find vocational training. Blue Light College was a stroke of luck. My advisor even helped me upload Jobcenter documents. Now I am happily working in nursing.”",
        testi_c3: "Graduate §34a Security Guard",
        testi_q3: "“Especially the intensive coaching before the oral examination took away my exam anxiety. 100% cost coverage and direct job placement after graduation were perfect. Truly recommended!”"
    },
    ua: {
        nav_courses: "Курси",
        nav_calc: "Оплата від держави",
        nav_quiz: "IHK Тест",
        nav_perks: "Переваги",
        nav_faq: "Питання",
        nav_cta: "Консультація",
        wa_badge: "Чат у WhatsApp",
        testi_tagline: "ІСТОРІЇ УСПІХУ НАШИХ ВИПУСКНИКІВ",
        testi_title: 'Що кажуть наші <span class="text-gradient-navy">учні</span>',
        testi_subtitle: "Дізнайтеся з перших вуст, як наше практичне навчання допомогло почати нову надійну кар'erу.",
        testi_c1: "Випускник §34a Охорона",
        testi_q1: "«Завдяки безкоштовному планшету я міг гнучко вчитися вечорами. Викладачі на живих онлайн-уроках підготували мене ідеально. Іспит IHK склав з першого разу! Тепер працюю в охороні об'єктів.»",
        testi_c2: "Випускниця Помічник догляду",
        testi_q2: "«Як мамі-одиначці, мені було важко знайти навчання. Коледж став справжньою знахідкою. Мій куратор допоміг мені завантажити документи для Джобцентру. Тепер я щаслива працювати в охороні здоров'я.»",
        testi_c3: "Випускник §34a Охорона",
        testi_q3: "«Інтенсивна підготовка до усної частини повністю позбавила мене страху перед іспитом. Повна оплата 100% витрат державою та працевлаштування відразу після курсу були супер. Рекомендую!»"
    },
    tr: {
        nav_courses: "Kurslar",
        nav_calc: "Destek Kontrolü",
        nav_quiz: "IHK Sınavı",
        nav_perks: "Avantajlar",
        nav_faq: "SSS",
        nav_cta: "Randevu Al",
        wa_badge: "WhatsApp Destek",
        testi_tagline: "MEZUNLARIMIZIN BAŞARI HİKAYELERİ",
        testi_title: 'Öğrencilerimiz <span class="text-gradient-navy">ne diyor?</span>',
        testi_subtitle: "Uygulamalı eğitimimizin yeni ve güvenli bir kariyere başlamayı nasıl sağladığını ilk ağızdan öğrenin.",
        testi_c1: "Mezun §34a Güvenlik Görevlisi",
        testi_q1: "“Ücretsiz ödünç tablet sayesinde akşamları esnekçe çalışabildim. Canlı çevrimiçi derslerdeki eğitmenler beni mükemmel hazırladı. IHK uzmanlık sınavını ilk denemede geçtim! Şimdi tesis korumada çalışıyorum.”",
        testi_c2: "Mezun Hasta Bakıcı",
        testi_q2: "“Yalnız bir anne olarak mesleki eğitim bulmak zordu. Blue Light College büyük bir şans oldu. Danışmanım Jobcenter evrak yüklemelerinde bile bana destek oldu. Şimdi sağlık sektöründe çok mutluyum.”",
        testi_c3: "Mezun §34a Güvenlik Görevlisi",
        testi_q3: "“Özellikle sözlü sınav öncesi birebir sınav simülasyonları kaygımı yok etti. %100 devlet finansmanı ve mezuniyet sonrası anında iş garantisi harikaydı. Kesinlikle tavsiye ederim!”"
    }
};

window.initLanguage = function() {
    const preferredLang = localStorage.getItem("preferredLang") || "de";
    switchLanguage(preferredLang);
};

window.switchLanguage = function(lang) {
    // Save to local storage
    localStorage.setItem("preferredLang", lang);
    
    // Toggle active state in desktop header lang buttons
    document.querySelectorAll(".lang-switcher .lang-btn").forEach(btn => {
        btn.classList.remove("active");
        const btnLang = btn.getAttribute("id").replace("lang-", "");
        if (btnLang === lang) {
            btn.classList.add("active");
        }
    });

    // Toggle active state in mobile lang switcher
    document.querySelectorAll(".mobile-lang-switcher .lang-btn").forEach(btn => {
        btn.classList.remove("active");
        const clickAttr = btn.getAttribute("onclick");
        if (clickAttr && clickAttr.includes(`'${lang}'`)) {
            btn.classList.add("active");
        }
    });
    
    // Switch all translated items
    document.querySelectorAll("[data-translate]").forEach(el => {
        const key = el.getAttribute("data-translate");
        if (translations[lang] && translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });
};
