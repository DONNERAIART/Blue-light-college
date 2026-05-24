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
    initWhatsAppStatus();
    calculateFunding();
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
    const lang = localStorage.getItem("preferredLang") || "de";
    
    // Update question progress info
    const labelQuestion = (translations[lang] && translations[lang].quiz_question) || "Frage";
    const labelOf = (translations[lang] && translations[lang].quiz_of) || "von";
    
    document.getElementById("quiz-q-num").innerText = `${labelQuestion} ${quizCurrentIndex + 1} ${labelOf} ${quizQuestions.length}`;
    
    const qKey = `q${quizCurrentIndex + 1}`;
    document.getElementById("quiz-q-text").innerText = (translations[lang] && translations[lang][qKey]) || currentQ.question;
    
    // Update progress bar width
    const progressPercent = ((quizCurrentIndex + 1) / quizQuestions.length) * 100;
    document.getElementById("quiz-progress").style.width = `${progressPercent}%`;
    
    // Reset next button and feedback text
    const nextBtn = document.getElementById("quiz-next-btn");
    nextBtn.style.display = "none";
    
    const feedbackText = document.getElementById("quiz-feedback");
    const defaultFeedback = (translations[lang] && translations[lang].quiz_select_opt) || "Wählen Sie eine Antwortoption aus.";
    feedbackText.innerText = defaultFeedback;
    feedbackText.className = "quiz-feedback-text";
    
    // Render options
    const optionsContainer = document.getElementById("quiz-options");
    optionsContainer.innerHTML = "";
    
    currentQ.options.forEach((opt, idx) => {
        const btn = document.createElement("button");
        btn.className = "quiz-option-item";
        btn.innerText = (translations[lang] && translations[lang][`${qKey}_o${idx + 1}`]) || opt;
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
    
    const lang = localStorage.getItem("preferredLang") || "de";
    const qKey = `q${quizCurrentIndex + 1}`;
    const expText = (translations[lang] && translations[lang][`${qKey}_exp`]) || currentQ.explanation;
    
    if (selectedIdx === currentQ.correct) {
        selectedBtn.classList.add("correct");
        const correctLabel = lang === "en" ? "Correct!" : (lang === "ua" ? "Правильно!" : (lang === "tr" ? "Doğru!" : (lang === "ar" ? "صحيح!" : (lang === "ru" ? "Правильно!" : (lang === "fa" ? "درست!" : "Korrekt!")))));
        feedbackText.innerText = `${correctLabel} ${expText}`;
        feedbackText.className = "quiz-feedback-text correct-feedback";
        quizScore++;
    } else {
        selectedBtn.classList.add("wrong");
        optionButtons[currentQ.correct].classList.add("correct");
        const wrongLabel = lang === "en" ? "Not quite correct." : (lang === "ua" ? "Не зовсім правильно." : (lang === "tr" ? "Pek doğru değil." : (lang === "ar" ? "غير صحيح تماماً." : (lang === "ru" ? "Не совсем правильно." : (lang === "fa" ? "کاملاً درست نیست." : "Nicht ganz richtig.")))));
        feedbackText.innerText = `${wrongLabel} ${expText}`;
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
    const lang = localStorage.getItem("preferredLang") || "de";
    
    let resultMessage = "";
    if (quizScore === quizQuestions.length) {
        resultMessage = (translations[lang] && translations[lang].quiz_res_perf) || "Hervorragend gelöst! Sie besitzen bereits ein exzellentes juristisches Verständnis.";
    } else if (quizScore >= 2) {
        resultMessage = (translations[lang] && translations[lang].quiz_res_good) || "Sehr gut! Sie verfügen über solides juristisches Grundwissen.";
    } else {
        resultMessage = (translations[lang] && translations[lang].quiz_res_bad) || "Keine Sorge! Das Sicherheitsrecht ist komplex. Genau dafür sind wir da.";
    }
    
    const titleText = (translations[lang] && translations[lang].quiz_res_title) || "Test abgeschlossen!";
    const bodyLeadText = (translations[lang] && translations[lang].quiz_res_body) || "Unsere Absolventen erzielen dank unseres professionellen Vorbereitungskurses eine Bestehensquote von 98% vor der IHK. Nutzen Sie Ihre Chance.";
    const btnCtaText = (translations[lang] && translations[lang].quiz_res_btn_cta) || "Kostenfreie Beratung buchen";
    const btnRepeatText = (translations[lang] && translations[lang].quiz_res_btn_repeat) || "Test wiederholen";
    
    container.innerHTML = `
        <div class="quiz-finished-box">
            <div class="quiz-score-badge">${quizScore}/${quizQuestions.length}</div>
            <h3 class="quiz-results-title text-gradient-gold">${titleText}</h3>
            <p class="quiz-results-text">
                ${resultMessage} ${bodyLeadText}
            </p>
            <div class="quiz-actions">
                <a href="#contact" class="btn btn-gold" onclick="fillCourseInterest('sachkunde-34a')">${btnCtaText}</a>
                <button class="btn btn-outline" onclick="resetQuiz()">${btnRepeatText}</button>
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
   10. Multilingual Translation Engine & Globe Dropdowns (DE / EN / UA / TR / AR / RU / FA)
   -------------------------------------------------------------------------- */
const translations = {
    de: {
        // Navigation & Buttons
        nav_courses: "Ausbildungen",
        nav_calc: "Förderungs-Check",
        nav_quiz: "IHK-Quiz",
        nav_perks: "Vorteile",
        nav_faq: "FAQ",
        nav_cta: "Beratung buchen",
        wa_badge: "WhatsApp Beratung",
        
        // Hero Section
        hero_badge_azav: "AZAV-Zugelassene Fachakademie",
        hero_badge_cost: "100% kostenfreie Ausbildung",
        hero_title: "Zertifizierte Ausbildungen für <span class=\"text-gradient-navy\">Sicherheit & Pflege</span>",
        hero_description: "Starten Sie Ihre Karriere als <strong>Geprüfte Sicherheitskraft nach §34a</strong> oder als qualifizierte/r <strong>Pflegehelfer/in</strong>. 100% gefördert über die Agentur für Arbeit und Jobcenter – inklusive kostenfreiem Leih-Tablet und Jobgarantie.",
        hero_btn_calc: "Förderung prüfen",
        hero_btn_courses: "Lehrgänge ansehen",
        hero_trust_quota_lbl: "Bestehensquote",
        hero_trust_certified_lbl: "Zertifiziert",
        hero_trust_free_lbl: "Kostenfrei",
        hero_campus_title: "Blue Light College",
        hero_campus_subtitle: "Akademische Ausbildungsstätte",
        
        // Stats Section
        stats_duration_title: "Studiendauer",
        stats_duration_val: "50 Tage",
        stats_duration_text: "Schnelle und hocheffiziente Fachausbildung. In nur 50 Tagen zu Ihrem staatlich anerkannten Berufsabschluss.",
        stats_format_title: "Unterrichtsform",
        stats_format_val: "Live-Online",
        stats_format_text: "Flexibles Lernen bequem von zu Hause aus. Live-Interaktion mit Dozenten in Vollzeit oder Teilzeit – perfekt anpassbar.",
        stats_placement_title: "Jobvermittlung",
        stats_placement_val: "Garantie",
        stats_placement_text: "Wir vermitteln Sie direkt nach erfolgreichem Abschluss an renommierte Kooperationspartner der Sicherheits- und Pflegebranche.",
        stats_equip_title: "Ausstattung",
        stats_equip_val: "Inklusive",
        stats_equip_text: "Wir stellen Ihnen für die gesamte Lehrgangsdauer ein hochwertiges Tablet kostenfrei zur Verfügung. Nach Abschluss gehört es Ihnen.",
        
        // Courses Section
        courses_tagline: "AKADEMISCHES LEHRGANGSANGEBOT",
        courses_title: "Zertifizierte <span class=\"text-gradient-navy\">Fachausbildungen</span>",
        courses_subtitle: "Wählen Sie Ihre Spezialisierung. Alle Angebote erfüllen die strengen AZAV-Qualitätskriterien der Bundesagentur für Arbeit.",
        tab_btn_security: "§34a Sicherheitskraft",
        tab_btn_nurse: "Pflegehelfer/in",
        course_badge_priority: "HÖCHSTE PRIORITÄT",
        course_badge_demand: "HOHER BEDARF",
        course_title_security: "Geprüfte Sicherheitskraft nach §34a (IHK)",
        course_desc_security: "Die rechtliche Mindestvoraussetzung für anspruchsvolle Tätigkeiten im Bewachungsgewerbe. Dieser umfassende Lehrgang bereitet Sie systematisch auf die schriftliche und mündliche Sachkundeprüfung vor der Industrie- und Handelskammer (IHK) vor.",
        course_req_title: "Zugangs-Voraussetzungen:",
        course_req_age: "Mindestalter von 18 Jahren",
        course_req_record: "Ein eintragungsfreies Führungszeugnis",
        course_req_lang: "Deutsch auf Sprachniveau von mindestens A2",
        course_req_school: "Anerkannter Hauptschulabschluss",
        course_meta_duration_lbl: "Regelstudienzeit",
        course_meta_format_lbl: "Unterrichtsform",
        course_meta_format_val: "Live-Online (Vollzeit / Teilzeit)",
        course_meta_format_hybrid: "Hybrid (Live-Online + Praxis)",
        course_btn_advice: "Kostenfreie Beratung anfordern",
        course_btn_quiz: "IHK-Wissen vorab testen &rarr;",
        syllabus_title_security: "Prüfungsrelevante Lehrgangsinhalte:",
        syllabus_title_nurse: "Wesentliche Ausbildungsmodule:",
        syllabus_s1: "Recht der öffentlichen Sicherheit und Ordnung",
        syllabus_s2: "Gewerberecht und Datenschutzgesetze",
        syllabus_s3: "Bürgerliches Gesetzbuch (BGB) - Notwehrrechte",
        syllabus_s4: "Straf- und Strafverfahrensrecht",
        syllabus_s5: "Unfallverhütungsvorschriften (UVV)",
        syllabus_s6: "Verhaltenslehre & Deeskalationskompetenz",
        course_title_nurse: "Pflegehelfer/in",
        course_desc_nurse: "Starten Sie Ihre Karriere in einem der krisensichersten und lohnendsten Berufsfelder. Sie erlernen die theoretischen und praktischen Grundlagen der professionellen Pflege, Behandlungspflege und Betreuung von hilfsbedürftigen Menschen.",
        syllabus_n1: "Grundlagen der Behandlungspflege & Grundpflege",
        syllabus_n2: "Kommunikation & respektvoller Umgang mit Patienten",
        syllabus_n3: "Notfallsituationen & Erste Hilfe in Pflegeberufen",
        syllabus_n4: "Hygienevorschriften & Infektionsschutz",
        syllabus_n5: "Rechtliche Grundlagen (SGB XI, Patientenrechte)",
        syllabus_n6: "Praktischer Einsatz & Fallsimulationen",
        
        // Eligibility Check Section
        calc_tag: "STAATLICHE FÖRDERUNG",
        calc_title: "Ermitteln Sie Ihren Anspruch auf <span class=\"text-gradient-gold\">100% Kostenübernahme</span>",
        calc_text: "Über einen Bildungsgutschein der Bundesagentur für Arbeit oder des Jobcenters werden Ihre kompletten Ausbildungs-, Lernmittel- und Prüfungsgebühren staatlich gefördert. Beantworten Sie 3 kurze Fragen, um Ihre Förderfähigkeit zu prüfen.",
        calc_trust_azav: "Zugelassene Akademie nach AZAV-Vorschrift",
        calc_trust_docs: "Direkte Trägerunterlagen für Arbeitsvermittler",
        wizard_q1: "Wie stellt sich Ihr aktueller beruflicher Status dar?",
        wizard_opt_q1_o1: "Arbeitssuchend / Arbeitslos (ALG I oder Bürgergeld)",
        wizard_opt_q1_o2: "Berufstätig (und suche berufliche Neuorientierung)",
        wizard_opt_q1_o3: "Selbstständig / Sonstiges / Ausbildungsplatzsuchend",
        wizard_q2: "Haben Sie bereits einen Beratungstermin bezüglich Förderung erhalten?",
        wizard_opt_q2_o1: "Ja, ich stehe bereits in Kontakt mit der Behörde",
        wizard_opt_q2_o2: "Nein, ich brauche Unterstützung bei der Vorbereitung",
        wizard_opt_q2_o3: "Ich möchte mich erst allgemein über den Ablauf informieren",
        wizard_res_title: "Hervorragende Aussichten",
        wizard_res_text: "Ihre Angaben deuten auf eine **vollständige Förderungsberechtigung** hin. Senden Sie uns Ihre Kontaktdaten. Ein Fachberater bespricht mit Ihnen die Antragstellung und stellt die Trägerunterlagen für Ihr Jobcenter aus.",
        calc_btn_submit: "Kostenfreie Ausbildungsberatung anfordern",
        
        // Quiz Section
        quiz_tagline: "FACHWISSEN VORAB TESTEN",
        quiz_title: "Der IHK-Sachkunde <span class=\"text-gradient-navy\">Prüfungstest</span>",
        quiz_subtitle: "Testen Sie Ihr Basiswissen mit 3 originalgetreuen Fragen aus der IHK-Sachkundeprüfung gemäß §34a GewO.",
        quiz_question: "Frage",
        quiz_of: "von",
        quiz_select_opt: "Wählen Sie eine Antwortoption aus.",
        quiz_next_question: "Nächste Frage &rarr;",
        quiz_show_results: "Ergebnis anzeigen",
        quiz_res_perf: "Hervorragend gelöst! Sie besitzen bereits ein exzellentes juristisches Verständnis.",
        quiz_res_good: "Sehr gut! Sie verfügen über solides juristisches Grundwissen.",
        quiz_res_bad: "Keine Sorge! Das Sicherheitsrecht ist komplex. Genau dafür sind wir da.",
        quiz_res_title: "Test abgeschlossen!",
        quiz_res_body: "Unsere Absolventen erzielen dank unseres professionellen Vorbereitungskurses eine Bestehensquote von 98% vor der IHK. Nutzen Sie Ihre Chance.",
        quiz_res_btn_cta: "Kostenfreie Beratung buchen",
        quiz_res_btn_repeat: "Test wiederholen",
        
        // Original quiz questions
        q1: "Welche der folgenden Befugnisse steht einem privaten Sicherheitsmitarbeiter im öffentlichen Raum grundsätzlich zu?",
        q1_o1: "Das Recht zur vorläufigen Festnahme bei frischer Tat (§ 127 StPO)",
        q1_o2: "Das Recht zur Identitätsfeststellung im Auftrag der Polizei",
        q1_o3: "Das Recht zur Durchsuchung von verdächtigen Personen",
        q1_o4: "Das Recht zur Sperrung öffentlicher Straßen bei Gefahr",
        q1_exp: "Als Sicherheitsmitarbeiter besitzen Sie im öffentlichen Raum dieselben Rechte wie jeder andere Bürger (Jedermannsrechte). § 127 StPO erlaubt jedem, eine Person vorläufig festzunehmen, wenn diese auf frischer Tat betroffen wird und Fluchtverdacht besteht.",
        
        q2: "Wann darf die Notwehr (§ 227 BGB / § 32 StGB) ausgeübt werden?",
        q2_o1: "Gegen jeden zukünftigen, mutmaßlichen Angriff",
        q2_o2: "Gegen einen gegenwärtigen, rechtswidrigen Angriff auf ein geschütztes Rechtsgut",
        q2_o3: "Als Bestrafung, nachdem der Angreifer geflohen ist",
        q2_o4: "Nur zur Abwehr von lebensgefährlichen Angriffen",
        q2_exp: "Notwehr is die Verteidigung, die erforderlich ist, um einen gegenwärtigen, rechtswidrigen Angriff von sich oder einem anderen abzuwenden. Sie gilt für alle geschützten Rechtsgüter (z. B. Körper, Eigentum, Ehre).",
        
        q3: "Wer nimmt die offizielle Sachkundeprüfung gemäß §34a GewO ab?",
        q3_o1: "Die örtliche Polizeiinspektion",
        q3_o2: "Das zuständige Gewerbeamt",
        q3_o3: "Die Industrie- und Handelskammer (IHK)",
        q3_o4: "Der private Bildungsträger selbst",
        q3_exp: "Die Sachkundeprüfung ist eine staatlich geregelte Prüfung und darf ausschließlich von der Industrie- und Handelskammer (IHK) abgenommen werden. Wir bereiten Sie intensiv und zielgerichtet darauf vor.",

        // Perks Section
        perks_tagline: "UNSERE QUALITÄTSSTANDARD-GARANTIEN",
        perks_title: "Warum das <span class=\"text-gradient-navy\">Blue Light College?</span>",
        perks_subtitle: "Wir setzen auf höchste Ausbildungsqualität, modernste Ausstattung und echte berufliche Zukunftsperspektiven.",
        perk_c1_lbl: "AUSSTATTUNGS-GARANTIE",
        perk_c1_title: "Kostenfreies Leih-Tablet",
        perk_c1_text: "Für einen reibungslosen Ablauf Ihres Online-Unterrichts stellen wir Ihnen ein hochwertiges Tablet kostenfrei zur Verfügung. Nach erfolgreichem Lehrgangsabschluss geht dieses Gerät vollständig in Ihr Eigentum über – ohne Zuzahlung.",
        perk_c2_lbl: "LEHRMETHODIK",
        perk_c2_title: "Interaktiver Live-Unterricht",
        perk_c2_text: "Kein trockenes Selbststudium mit Texten. Sie nehmen täglich an strukturierten Live-Webinaren in unserem virtuellen Hörsaal teil. Erfahrene, IHK-zertifizierte Dozenten erklären komplexe Rechtsmaterie leicht verständlich.",
        perk_c3_lbl: "KARRIERE-FÖRDERUNG",
        perk_c3_title: "Garantierte Jobvermittlung",
        perk_c3_text: "Durch unsere engen, strategischen Kooperationen mit Marktführern der nationalen Bewachungs- und Sicherheitsbranche vermitteln wir Sie direkt nach bestandener IHK-Sachkundeprüfung in eine unbefristete, krisensichere Festanstellung.",
        perk_c4_lbl: "PRÜFUNGSVORBEREITUNG",
        perk_c4_title: "Mündliches Prüfungscoaching",
        perk_c4_text: "Die mündliche Prüfung vor der IHK gilt als größte Hürde. Wir nehmen Ihnen die Sorge: In Eins-zu-eins-Simulationen trainieren wir Fallbeispiele und Deeskalationstechniken so lange realitätsnah, bis Sie der Prüfung absolut gelassen entgegensehen.",
        perk_c5_lbl: "BEHÖRDENSERVICE",
        perk_c5_title: "Persönliche Behördenbegleitung",
        perk_c5_text: "Keine Angst vor der Bürokratie: Unsere persönlichen Kundenberater bereiten Sie intensiv auf das Gespräch mit Ihrem Sachbearbeiter vor und laden alle notwendigen Antragsdokumente direkt gemeinsam mit Ihnen beim Jobcenter/Arbeitsamt hoch.",
        perk_c6_lbl: "FINANZIERUNG",
        perk_c6_title: "100% Kostenfreie Teilnahme",
        perk_c6_text: "Durch die AZAV-Zertifizierung des Blue Light College werden sämtliche Gebühren für Ausbildung, Lehrmaterialien und Prüfungen vollständig über Ihren Bildungsgutschein (Jobcenter / Agentur für Arbeit) gedeckt. Es entstehen keinerlei Eigenkosten.",

        // Testimonials
        testi_tagline: "ERFOLGSGESCHICHTEN UNSERER ABSOLVENTEN",
        testi_title: "Was unsere <span class=\"text-gradient-navy\">Schüler sagen</span>",
        testi_subtitle: "Erfahren Sie aus erster Hand, wie unsere praxisnahe Ausbildung den Einstieg in eine neue Karriere ermöglicht hat.",
        testi_c1: "Absolvent §34a Sicherheitskraft",
        testi_q1: "„Dank des kostenfreien Leih-Tablets konnte ich flexibel abends lernen. Die Dozenten im Live-Online-Unterricht haben mich perfekt vorbereitet. Die IHK-Sachkundeprüfung war direkt beim ersten Mal bestanden! Nun arbeite ich im Objektschutz.“",
        testi_c2: "Absolventin Pflegehelfer/in",
        testi_q2: "„Als alleinerziehende Mutter war es schwer, eine Weiterbildung zu finden. Das Blue Light College war ein Glücksfall. Mein persönlicher Kundenberater hat mir sogar bei den Anträgen für das Jobcenter geholfen. Jetzt arbeite ich glücklich in der Pflege.“",
        testi_c3: "Absolvent §34a Sicherheitskraft",
        testi_q3: "„Besonders das intensive Coaching vor der mündlichen Prüfung hat mir die Prüfungsangst genommen. Die 100% Kostenübernahme und die vermittelte Stelle direkt nach Kursende waren perfekt. Absolut empfehlenswerte Akademie!“",

        // FAQ Section
        faq_tagline: "WISSENSWERTES & HÄUFIGE FRAGEN",
        faq_title: "Antworten auf Ihre <span class=\"text-gradient-navy\">Fragen</span>",
        faq_subtitle: "Erfahren Sie mehr über die Zulassungsvoraussetzungen, den Erhalt von Bildungsgutscheinen und den Ablauf der IHK-Sachkundeprüfung.",
        faq_q1: "Ist die Ausbildung wirklich zu 100% kostenlos für mich?",
        faq_a1: "Ja, absolut. Als zertifizierter Bildungsträger nach der **AZAV** (Akkreditierungs- und Zulassungsverordnung Arbeitsförderung) können wir direkt mit den Behörden abrechnen. Bei Bewilligung eines Bildungsgutscheins durch Ihre Agentur für Arbeit oder Ihr Jobcenter werden sämtliche Lehrgangs-, Lehrmaterial- und IHK-Prüfungsgebühren vollständig übernommen. Es entstehen Ihnen keinerlei Eigenanteile.",
        faq_q2: "Wie läuft das Antragsverfahren für den Bildungsgutschein ab?",
        faq_a2: "Das Antragsverfahren ist einfach. Sie vereinbaren einen Beratungstermin bei Ihrem zuständigen Arbeitsvermittler. Wir stellen Ihnen im Vorfeld alle zertifizierten Träger- und Maßnahme-Angebotsunterlagen aus. Diese legen Sie Ihrem Vermittler vor. Sobald dieser den Bildungsgutschein bewilligt, senden Sie uns das Dokument zu, und wir schalten Sie für den nächsten Kursstart frei.",
        faq_q3: "Welche Voraussetzungen gelten für die Ausbildungen?",
        faq_a3: "Für beide Ausbildungen müssen Sie mindestens 18 Jahre alt sein, ein eintragungsfreies Führungszeugnis besitzen und deutsche Sprachkenntnisse auf einem Niveau von mindestens A2 nachweisen. Für die Ausbildung zur \"Geprüften Sicherheitskraft nach §34a\" ist zusätzlich ein anerkannter Hauptschulabschluss erforderlich.",
        faq_q4: "Wie funktioniert das E-Learning mit dem kostenfreien Tablet?",
        faq_a4: "Nach Kursfreigabe senden wir Ihnen ein vorkonfiguriertes, hochwertiges Tablet per Post zu. Mit diesem Gerät loggen Sie sich täglich in unsere Live-Webinare ein. Sie nehmen aktiv am Unterricht teil, sehen die Präsentationen der Dozenten und können direkt über das integrierte Mikrofon oder den Chat Fragen stellen. Das Tablet geht nach erfolgreichem Kursabschluss dauerhaft in Ihren Besitz über.",
        faq_q5: "Erhalte ich nach bestandener Prüfung eine Jobzusage?",
        faq_a5: "Wir arbeiten sehr eng mit führenden privaten Sicherheits- und Bewachungsunternehmen in Deutschland zusammen. Schon während Ihrer Ausbildung stimmen wir Ihre Präferenzen (z. B. Objektschutz, Pfortendienst, Revierstreife oder Personenschutz) ab und bereiten Bewerbungen vor. Durch den enormen Fachkräftemangel in der Branche können wir Ihnen eine direkte Jobvermittlung garantieren.",

        // Contact Section
        contact_tagline: "FACHLICHE BERATUNG",
        contact_title: "Nehmen Sie Kontakt mit unserer <span class=\"text-gradient-gold\">Akademie</span> auf",
        contact_text: "Planen Sie gemeinsam mit unseren Bildungsberatern Ihre Qualifizierung und den anschließenden Berufseinstieg. Wir klären alle Detailfragen zu Bildungsgutscheinen, Fristen und Lehrgangsformaten in einem persönlichen Gespräch.",
        contact_lbl_sec: "Bildungssekretariat",
        contact_lbl_mail: "E-Mail für Anfragen",
        contact_lbl_head: "Hauptsitz Schönkirchen",
        contact_val_addr: "Dorfstraße 12, 24232 Schönkirchen",
        contact_lbl_name: "Ihr vollständiger Name",
        contact_lbl_email: "E-Mail-Adresse",
        contact_lbl_phone: "Telefonnummer",
        contact_lbl_course: "Angestrebte Ausbildung",
        contact_lbl_msg: "Ihre Mitteilung an das Bildungssekretariat (Optional)",
        contact_btn_submit: "Kostenfreies Erstgespräch vereinbaren",
        contact_opt_security: "Geprüfte Sicherheitskraft nach §34a (IHK)",
        contact_opt_nurse: "Pflegehelfer/in",
        contact_opt_advice: "Allgemeine Beratung zur AZAV-Förderung",
        
        // Form Placeholders
        ph_name: "Vorname Nachname",
        ph_email: "name@beispiel.de",
        ph_phone: "+49 170 1234567",
        ph_msg: "Wie können wir Ihnen behilflich sein?...",
        ph_calc_name: "Vollständiger Name",
        ph_calc_phone: "Telefonnummer für Rückfragen",

        // Footer
        footer_text: "Zugelassene Fachakademie nach AZAV für die Aus- und Weiterbildung im privaten Sicherheits- und Bewachungsgewerbe.",
        footer_badge_azav: "AZAV TRÄGER ZULASSUNG",
        footer_badge_ihk: "IHK STANDARDS",
        footer_title_academy: "Akademie",
        footer_title_courses: "Lehrgänge",
        footer_title_legal: "Rechtliches",
        footer_copy: "&copy; 2026 Blue Light College. Alle Rechte vorbehalten. Akkreditiert nach AZAV-Normen.",

        // Cookie Banner
        cookie_title: "Privatsphäre & Datenschutz (DSGVO)",
        cookie_text: "Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung auf unserer akademischen Webseite zu bieten. Einige Cookies sind für den technischen Betrieb der Seite zwingend erforderlich (Notwendig), während andere uns helfen, unser Angebot anonym zu analysieren (Statistiken).",
        cookie_lbl_nec: "Notwendig (immer aktiv)",
        cookie_lbl_stats: "Statistiken & Analyse",
        cookie_btn_all: "Alle akzeptieren",
        cookie_btn_nec: "Nur notwendige",
        cookie_btn_cust: "Auswahl anpassen",
        
        // Legal Modal
        legal_modal_title: "Rechtliches",
        legal_modal_btn_close: "Schließen",
        wa_status: "Sekretariat besetzt – Antwort in < 5 Min 🟢",
        mm_tag: "SCHNELLORIENTIERUNG",
        mm_title: "Der 60-Sekunden <span class=\"text-gradient-gold\">Akademie-Matchmaker</span>",
        mm_subtitle: "Finden Sie heraus, welcher Lehrgang perfekt zu Ihrer Lebenssituation passt und wie Sie die 100% Kostenübernahme erhalten.",
        mm_q1: "Welches Berufsfeld interessiert Sie am meisten?",
        mm_q1_o1_title: "Sicherheit & Schutz",
        mm_q1_o1_desc: "Menschen & Objekte schützen. Krisensicherer Einstieg in die Sicherheitsbranche (§34a GewO).",
        mm_q1_o2_title: "Pflege & Betreuung",
        mm_q1_o2_desc: "Menschen helfen und pflegen. Hohe Sinnhaftigkeit und exzellente Karrierechancen als Pflegehelfer/in.",
        mm_q2: "Wie ist Ihre aktuelle berufliche Situation?",
        mm_q2_o1: "Arbeitslos / Arbeitssuchend (ALG I oder Bürgergeld)",
        mm_q2_o2: "Berufstätig / Neuorientierung gesucht",
        mm_q2_o3: "Schulabgänger / Ausbildungssuchend",
        mm_q2_o4: "Sonstiges / Selbstständig",
        mm_q3: "Was ist Ihnen bei Ihrer Ausbildung am wichtigsten?",
        mm_q3_o1: "100% kostenfrei (über Bildungsgutschein)",
        mm_q3_o2: "Flexibilität (Online-Live & Teilzeit-Option)",
        mm_q3_o3: "Schneller Jobeinstieg & Jobgarantie",
        mm_submit_btn: "Kostenfreie Ausbildungsplatz-Sicherung anfordern",
        calc_card_title: "Förderungs-Ersparnis-Rechner",
        calc_slider_label: "Gewünschte Ausbildungsdauer:",
        calc_toggle_label: "Finanzierungsweg:",
        calc_toggle_voucher: "Bildungsgutschein",
        calc_toggle_self: "Selbstzahler",
        calc_res_fees: "Lehrgangsgebühren:",
        calc_res_tablet: "Leih-Tablet (Ihr Eigentum):",
        calc_res_tablet_val: "Inklusive (€400 Wert)",
        calc_res_materials: "Lernmittel & IHK-Gebühren:",
        calc_res_travel: "Homeoffice- & Internetpauschale:",
        calc_res_covered: "100% Übernommen",
        calc_res_total: "Ihre Netto-Investition:",
        calc_btn_submit: "Kostenfreie Ausbildungsberatung anfordern",
        quiz_pass_status: "Prüfung bestanden! (Mind. 50% benötigt)",
        quiz_fail_status: "Prüfung nicht bestanden. (50% benötigt)",
        faq_search_placeholder: "Fragen durchsuchen...",
        map_tagline: "REGIONALE ABSOLVENTEN-ERFOLGE",
        map_title: "Starke Partner in Ihrer <span class=\"text-gradient-gold\">Region</span>",
        map_subtitle: "Entdecken Sie unsere Kooperationspartner und die hohe Anzahl erfolgreicher Vermittlungen in Ihrer Nähe.",
        map_graduates: "Absolventen vermittelt",
        map_region_east: "Berlin & Brandenburg",
        map_region_north: "Hamburg & Schleswig-Holstein",
        map_region_west: "Nordrhein-Westfalen",
        map_region_center: "Hessen & RLP",
        map_region_south: "Bayern & BaWü",
        map_info_default_title: "Nationales Kooperations-Netzwerk",
        map_info_default_desc: "Klicken Sie auf ein regionales Zentrum auf der Karte, um detaillierte Informationen über unsere Partner und Absolventen-Vermittlungen vor Ort anzuzeigen.",
        map_stat_placements_lbl: "Vermittlungen gesamt",
        map_stat_partners_lbl: "Partner-Unternehmen",
        advisor_name: "Frau Melanie Schmidt",
        advisor_title: "Leiterin der Bildungsberatung",
        advisor_online: "Online - Jetzt erreichbar",
        advisor_offline: "Offline - Erreichbar Mo-Fr 10-18 Uhr",
        wa_status_offline: "Sekretariat offline – Erreichbar Mo-Fr 10-18 Uhr 🔴"
    },
    en: {
        // Navigation & Buttons
        nav_courses: "Courses",
        nav_calc: "Funding Check",
        nav_quiz: "IHK Quiz",
        nav_perks: "Benefits",
        nav_faq: "FAQ",
        nav_cta: "Book Advice",
        wa_badge: "WhatsApp Chat",
        
        // Hero Section
        hero_badge_azav: "AZAV-Certified Academy",
        hero_badge_cost: "100% Free Training",
        hero_title: "Certified Training for <span class=\"text-gradient-navy\">Security & Care</span>",
        hero_description: "Start your career as a <strong>Certified Security Guard under §34a</strong> or as a qualified <strong>Nursing Assistant</strong>. 100% funded via the Employment Agency and Jobcenter – including a free loan tablet and job guarantee.",
        hero_btn_calc: "Check Funding",
        hero_btn_courses: "View Courses",
        hero_trust_quota_lbl: "Pass Rate",
        hero_trust_certified_lbl: "Certified",
        hero_trust_free_lbl: "Free of Charge",
        hero_campus_title: "Blue Light College",
        hero_campus_subtitle: "Academic Training Facility",
        
        // Stats Section
        stats_duration_title: "Study Duration",
        stats_duration_val: "50 Days",
        stats_duration_text: "Fast and highly efficient vocational training. Obtain your state-recognized professional degree in just 50 days.",
        stats_format_title: "Class Format",
        stats_format_val: "Live-Online",
        stats_format_text: "Flexible learning from the comfort of your home. Live interaction with lecturers in full-time or part-time – perfectly adaptable.",
        stats_placement_title: "Job Placement",
        stats_placement_val: "Guarantee",
        stats_placement_text: "We place you directly after successful completion with renowned cooperation partners in the security and care industry.",
        stats_equip_title: "Equipment",
        stats_equip_val: "Included",
        stats_equip_text: "We provide you with a high-quality tablet free of charge for the entire duration of the course. It is yours to keep upon completion.",
        
        // Courses Section
        courses_tagline: "ACADEMIC COURSE CATALOG",
        courses_title: "Certified <span class=\"text-gradient-navy\">Vocational Training</span>",
        courses_subtitle: "Choose your specialization. All courses meet the strict AZAV quality criteria of the Federal Employment Agency.",
        tab_btn_security: "§34a Security Guard",
        tab_btn_nurse: "Nursing Assistant",
        course_badge_priority: "HIGHEST PRIORITY",
        course_badge_demand: "HIGH DEMAND",
        course_title_security: "Certified Security Guard according to §34a (IHK)",
        course_desc_security: "The legal minimum requirement for demanding tasks in the security industry. This comprehensive course prepares you systematically for the written and oral examination before the Chamber of Industry and Commerce (IHK).",
        course_req_title: "Admission Requirements:",
        course_req_age: "Minimum age of 18 years",
        course_req_record: "Clean criminal record certificate",
        course_req_lang: "German at language level of at least A2",
        course_req_school: "Recognized secondary school certificate",
        course_meta_duration_lbl: "Standard Duration",
        course_meta_format_lbl: "Class Format",
        course_meta_format_val: "Live-Online (Full-time / Part-time)",
        course_meta_format_hybrid: "Hybrid (Live-Online + Practice)",
        course_btn_advice: "Request Free Consultation",
        course_btn_quiz: "Test IHK Knowledge &rarr;",
        syllabus_title_security: "Exam-Relevant Syllabus Content:",
        syllabus_title_nurse: "Core Training Modules:",
        syllabus_s1: "Law of Public Safety and Order",
        syllabus_s2: "Trade Law and Data Protection Regulations",
        syllabus_s3: "Civil Code (BGB) - Right of Self-Defense",
        syllabus_s4: "Criminal Law and Criminal Procedure",
        syllabus_s5: "Accident Prevention Regulations (UVV)",
        syllabus_s6: "Behavioral Science & De-escalation Skills",
        course_title_nurse: "Nursing Assistant",
        course_desc_nurse: "Start your career in one of the most secure and rewarding professional fields. You will learn the theoretical and practical basics of professional care, medical treatment care and support for people in need of help.",
        syllabus_n1: "Basics of Medical Treatment & Basic Care",
        syllabus_n2: "Communication & Respectful Care of Patients",
        syllabus_n3: "Emergency Situations & First Aid in Care Professions",
        syllabus_n4: "Hygiene Regulations & Infection Protection",
        syllabus_n5: "Legal Principles (SGB XI, Patient Rights)",
        syllabus_n6: "Practical Application & Case Simulations",
        
        // Eligibility Check Section
        calc_tag: "STATE FUNDING",
        calc_title: "Determine your eligibility for <span class=\"text-gradient-gold\">100% Cost Coverage</span>",
        calc_text: "With an education voucher from the Federal Employment Agency or Jobcenter, your entire training, learning materials, and exam fees are state-funded. Answer 3 short questions to check your eligibility.",
        calc_trust_azav: "Certified Academy according to AZAV standards",
        calc_trust_docs: "Direct provider paperwork for placement agents",
        wizard_q1: "What is your current employment status?",
        wizard_opt_q1_o1: "Job-seeker / Unemployed (ALG I or Citizen's Income)",
        wizard_opt_q1_o2: "Employed (and looking for a career change)",
        wizard_opt_q1_o3: "Self-employed / Other / Looking for apprenticeship",
        wizard_q2: "Have you already had a consultation regarding funding?",
        wizard_opt_q2_o1: "Yes, I am already in contact with the agency",
        wizard_opt_q2_o2: "No, I need support preparing for it",
        wizard_opt_q2_o3: "I would like to get general information about the process first",
        wizard_res_title: "Excellent Prospects",
        wizard_res_text: "Your answers indicate a **full funding eligibility**. Send us your contact details. A specialist advisor will discuss the application process with you and issue the training documents for your Jobcenter.",
        calc_btn_submit: "Request Free Training Consultation",
        
        // Quiz Section
        quiz_tagline: "TEST YOUR KNOWLEDGE IN ADVANCE",
        quiz_title: "The IHK Security Specialist <span class=\"text-gradient-navy\">Practice Test</span>",
        quiz_subtitle: "Test your basic knowledge with 3 original questions from the IHK examination according to §34a GewO.",
        quiz_question: "Question",
        quiz_of: "of",
        quiz_select_opt: "Select an answer option.",
        quiz_next_question: "Next Question &rarr;",
        quiz_show_results: "Show Results",
        quiz_res_perf: "Excellent! You already possess an outstanding understanding of law.",
        quiz_res_good: "Very good! You have a solid basic knowledge of safety law.",
        quiz_res_bad: "No worries! Safety law is complex. That is exactly what we are here for.",
        quiz_res_title: "Test Completed!",
        quiz_res_body: "Thanks to our professional preparation course, our graduates achieve a 98% pass rate before the IHK. Seize your chance.",
        quiz_res_btn_cta: "Book Free Consultation",
        quiz_res_btn_repeat: "Repeat Test",
        
        // Original quiz questions
        q1: "Which of the following powers does a private security employee generally have in public spaces?",
        q1_o1: "The right to temporary arrest when caught in the act (§ 127 StPO)",
        q1_o2: "The right to establish identity on behalf of the police",
        q1_o3: "The right to search suspicious persons",
        q1_o4: "The right to close public roads in case of danger",
        q1_exp: "As a security employee, you possess the same rights in public spaces as any other citizen (everyone's rights). § 127 StPO allows anyone to temporarily arrest a person caught in the act if there is a suspicion of flight.",
        
        q2: "When can self-defense (§ 227 BGB / § 32 StGB) be exercised?",
        q2_o1: "Against any future, suspected attack",
        q2_o2: "Against a present, unlawful attack on a protected legal asset",
        q2_o3: "As a punishment after the attacker has fled",
        q2_o4: "Only to ward off life-threatening attacks",
        q2_exp: "Self-defense is the defense required to ward off a present, unlawful attack on oneself or another. It applies to all protected legal assets (e.g. body, property, honor).",
        
        q3: "Who conducts the official examination according to §34a GewO?",
        q3_o1: "The local police department",
        q3_o2: "The responsible trade office",
        q3_o3: "The Chamber of Industry and Commerce (IHK)",
        q3_o4: "The private educational institution itself",
        q3_exp: "The examination is state-regulated and may only be conducted by the Chamber of Industry and Commerce (IHK). We prepare you intensively and purposefully for it.",

        // Perks Section
        perks_tagline: "OUR QUALITY STANDARD GUARANTEES",
        perks_title: "Why choose <span class=\"text-gradient-navy\">Blue Light College?</span>",
        perks_subtitle: "We focus on the highest quality of education, state-of-the-art equipment, and real job opportunities.",
        perk_c1_lbl: "EQUIPMENT GUARANTEE",
        perk_c1_title: "Free Loan Tablet",
        perk_c1_text: "For a smooth course of your online classes, we provide a high-quality tablet free of charge. After successful completion, this device belongs completely to you – at no extra cost.",
        perk_c2_lbl: "TEACHING METHODOLOGY",
        perk_c2_title: "Interactive Live Classes",
        perk_c2_text: "No dry studying of textbooks. You participate daily in structured live webinars in our virtual lecture hall. Experienced, IHK-certified lecturers explain complex legal matters clearly.",
        perk_c3_lbl: "CAREER PROMOTION",
        perk_c3_title: "Guaranteed Job Placement",
        perk_c3_text: "Thanks to our close, strategic partnerships with national market leaders in the security and care industry, we place you directly in a permanent, crisis-safe job after passing your IHK exam.",
        perk_c4_lbl: "EXAM PREPARATION",
        perk_c4_title: "Oral Examination Coaching",
        perk_c4_text: "The oral exam before the IHK is considered the biggest hurdle. We take away your worry: in one-on-one simulations, we practice case studies and de-escalation techniques until you are absolutely calm.",
        perk_c5_lbl: "AUTHORITY SERVICE",
        perk_c5_title: "Personal Agency Assistance",
        perk_c5_text: "No fear of bureaucracy: our personal advisors prepare you intensively for your meeting with the caseworker and upload all necessary application documents directly with you.",
        perk_c6_lbl: "FINANCING",
        perk_c6_title: "100% Free Participation",
        perk_c6_text: "Due to the AZAV certification of Blue Light College, all fees for training, educational materials, and examinations are fully covered by your education voucher. There are no personal costs.",

        // Testimonials
        testi_tagline: "SUCCESS STORIES OF OUR GRADUATES",
        testi_title: "What our <span class=\"text-gradient-navy\">students say</span>",
        testi_subtitle: "Hear first-hand how our practical training enabled a smooth start into a new, secure career.",
        testi_c1: "Graduate §34a Security Guard",
        testi_q1: "“Thanks to the free loan tablet, I was able to study flexibly in the evening. The lecturers in live-online classes prepared me perfectly. I passed the IHK exam on the very first try! Now I work in object security.”",
        testi_c2: "Graduate Nursing Assistant",
        testi_q2: "“As a single mother, it was hard to find vocational training. Blue Light College was a stroke of luck. My advisor even helped me upload Jobcenter documents. Now I am happily working in nursing.”",
        testi_c3: "Graduate §34a Security Guard",
        testi_q3: "“Especially the intensive coaching before the oral examination took away my exam anxiety. 100% cost coverage and direct job placement after graduation were perfect. Truly recommended!”",

        // FAQ Section
        faq_tagline: "USEFUL INFORMATION & COMMON QUESTIONS",
        faq_title: "Answers to your <span class=\"text-gradient-navy\">Questions</span>",
        faq_subtitle: "Learn more about admission requirements, receiving education vouchers, and the IHK examination process.",
        faq_q1: "Is the training really 100% free of charge for me?",
        faq_a1: "Yes, absolutely. As a certified educational provider according to AZAV (Accreditation and Admission Regulation for Employment Promotion), we can bill the authorities directly. Upon approval of an education voucher by your Employment Agency or Jobcenter, all training, learning material, and IHK examination fees are fully covered. You do not have to pay anything.",
        faq_q2: "How does the application process for the education voucher work?",
        faq_a2: "The process is simple. You schedule an appointment with your responsible employment officer. We provide you in advance with all certified provider and course offer documents, which you present to them. As soon as they approve the voucher, you send it to us, and we register you for the next course start.",
        faq_q3: "What requirements apply to the courses?",
        faq_a3: "For both courses, you must be at least 18 years old, possess a clean criminal record certificate, and prove German language skills of at least A2 level. For the §34a security specialist training, a recognized secondary school leaving certificate is also required.",
        faq_q4: "How does e-learning work with the free tablet?",
        faq_a4: "Upon course registration, we send you a preconfigured, high-quality tablet by mail. With this device, you log in daily to our live webinars. You participate actively in class, see presentations, and ask questions via microphone or chat. The tablet is permanently yours after graduation.",
        faq_q5: "Will I receive a job guarantee after passing the exam?",
        faq_a5: "We work very closely with leading private security and nursing companies in Germany. During your course, we align on your preferences (e.g. object security, gatehouse, mobile patrol, or ward care) and prepare your applications. Due to the high shortage of skilled labor, we can guarantee a direct job placement.",

        // Contact Section
        contact_tagline: "PROFESSIONAL ADVICE",
        contact_title: "Get in touch with our <span class=\"text-gradient-gold\">Academy</span>",
        contact_text: "Plan your qualification and subsequent career entry together with our education advisors. We clarify all detailed questions about education vouchers, deadlines, and course formats in a personal conversation.",
        contact_lbl_sec: "Academic Office",
        contact_lbl_mail: "E-mail for Queries",
        contact_lbl_head: "Headquarters Schönkirchen",
        contact_val_addr: "Dorfstraße 12, 24232 Schönkirchen",
        contact_lbl_name: "Your Full Name",
        contact_lbl_email: "E-mail Address",
        contact_lbl_phone: "Telephone Number",
        contact_lbl_course: "Desired Training Course",
        contact_lbl_msg: "Your message to the Academic Office (Optional)",
        contact_btn_submit: "Arrange Free Initial Consultation",
        contact_opt_security: "Certified Security Guard according to §34a (IHK)",
        contact_opt_nurse: "Nursing Assistant",
        contact_opt_advice: "General AZAV Funding Advice",
        
        // Placeholders
        ph_name: "First Name Last Name",
        ph_email: "name@example.com",
        ph_phone: "+49 170 1234567",
        ph_msg: "How can we help you?...",
        ph_calc_name: "Full Name",
        ph_calc_phone: "Phone number for queries",

        // Footer
        footer_text: "Certified Academy according to AZAV standards for training and further education in the private security and care sector.",
        footer_badge_azav: "AZAV PROVIDER APPROVAL",
        footer_badge_ihk: "IHK STANDARDS",
        footer_title_academy: "Academy",
        footer_title_courses: "Courses",
        footer_title_legal: "Legal",
        footer_copy: "&copy; 2026 Blue Light College. All rights reserved. Accredited according to AZAV standards.",

        // Cookie Banner
        cookie_title: "Privacy & Data Protection (GDPR)",
        cookie_text: "We use cookies to provide you with the best possible experience on our academic website. Some cookies are technically required for the operation of the site (Necessary), while others help us anonymously analyze our website traffic (Statistics).",
        cookie_lbl_nec: "Necessary (always active)",
        cookie_lbl_stats: "Statistics & Analysis",
        cookie_btn_all: "Accept All",
        cookie_btn_nec: "Only Necessary",
        cookie_btn_cust: "Adjust Selection",
        
        // Legal Modal
        legal_modal_title: "Legal Notice",
        legal_modal_btn_close: "Close",
        wa_status: "Secretariat online – Reply in < 5 min 🟢",
        mm_tag: "FAST ORIENTATION",
        mm_title: "The 60-Second <span class=\"text-gradient-gold\">Academy Matchmaker</span>",
        mm_subtitle: "Find out which course perfectly fits your life situation and how to get 100% state funding.",
        mm_q1: "Which field of interest appeals to you the most?",
        mm_q1_o1_title: "Security & Protection",
        mm_q1_o1_desc: "Protecting people & property. Crisis-safe entry into the security sector (§34a GewO).",
        mm_q1_o2_title: "Care & Support",
        mm_q1_o2_desc: "Helping and caring for people. High meaningfulness and excellent career opportunities as a nursing assistant.",
        mm_q2: "What is your current occupational standing?",
        mm_q2_o1: "Unemployed / Jobseeker (ALG I or Bürgergeld)",
        mm_q2_o2: "Employed / Seeking career change",
        mm_q2_o3: "School leaver / Seeking apprenticeship",
        mm_q2_o4: "Other / Self-employed",
        mm_q3: "What is most important to you during your training?",
        mm_q3_o1: "100% free of charge (via education voucher)",
        mm_q3_o2: "Flexibility (Online-Live & part-time option)",
        mm_q3_o3: "Quick job entry & job guarantee",
        mm_submit_btn: "Request Free Training Slot Booking",
        calc_card_title: "Funding Savings Calculator",
        calc_slider_label: "Desired Training Duration:",
        calc_toggle_label: "Funding Method:",
        calc_toggle_voucher: "Education Voucher",
        calc_toggle_self: "Self-Payer",
        calc_res_fees: "Course Fees:",
        calc_res_tablet: "Study Tablet (Your Property):",
        calc_res_tablet_val: "Included (€400 Value)",
        calc_res_materials: "Learning Materials & IHK Fees:",
        calc_res_travel: "Home Office & Internet Allowance:",
        calc_res_covered: "100% Covered",
        calc_res_total: "Your Net Investment:",
        calc_btn_submit: "Request Free Training Consultation",
        quiz_pass_status: "Exam passed! (Min. 50% required)",
        quiz_fail_status: "Exam failed. (50% required)",
        faq_search_placeholder: "Search questions...",
        map_tagline: "REGIONAL GRADUATE SUCCESS",
        map_title: "Strong Partners in Your <span class=\"text-gradient-gold\">Region</span>",
        map_subtitle: "Explore our cooperation partners and high graduate placement counts near you.",
        map_graduates: "Graduates Placed",
        map_region_east: "Berlin & Brandenburg",
        map_region_north: "Hamburg & Schleswig-Holstein",
        map_region_west: "North Rhine-Westphalia",
        map_region_center: "Hesse & RLP",
        map_region_south: "Bavaria & Baden-Württemberg",
        map_info_default_title: "National Cooperation Network",
        map_info_default_desc: "Click on a regional center on the map to display detailed information on partners and local placements.",
        map_stat_placements_lbl: "Total Placements",
        map_stat_partners_lbl: "Partner Companies",
        advisor_name: "Mrs. Melanie Schmidt",
        advisor_title: "Head of Academic Advising",
        advisor_online: "Online - Available Now",
        advisor_offline: "Offline - Available Mon-Fri 10am-6pm",
        wa_status_offline: "Secretariat offline – Available Mon-Fri 10am-6pm 🔴"
    },
    ua: {
        // Navigation & Buttons
        nav_courses: "Курси",
        nav_calc: "Оплата від держави",
        nav_quiz: "IHK Тест",
        nav_perks: "Переваги",
        nav_faq: "Питання",
        nav_cta: "Консультація",
        wa_badge: "Чат у WhatsApp",
        
        // Hero Section
        hero_badge_azav: "Академія сертифікована AZAV",
        hero_badge_cost: "100% безкоштовне навчання",
        hero_title: "Сертифіковане навчання в галузі <span class=\"text-gradient-navy\">безпеки та догляду</span>",
        hero_description: "Почніть кар'єру сертифікованого фахівця з безпеки відповідно до §34a або кваліфікованого помічника по догляду. На 100% фінансується Агентством зайнятості та Jobcenter – безкоштовний навчальний планшет та гарантія роботи.",
        hero_btn_calc: "Перевірити фінансування",
        hero_btn_courses: "Переглянути курси",
        hero_trust_quota_lbl: "Рівень успішності",
        hero_trust_certified_lbl: "Сертифіковано",
        hero_trust_free_lbl: "Безкоштовно",
        hero_campus_title: "Blue Light College",
        hero_campus_subtitle: "Академічний навчальний центр",
        
        // Stats Section
        stats_duration_title: "Тривалість навчання",
        stats_duration_val: "50 днів",
        stats_duration_text: "Швидке та високоефективне навчання. Отримайте визнаний державою диплом про професійну освіту всього за 50 днів.",
        stats_format_title: "Формат навчання",
        stats_format_val: "Онлайн-трансляції",
        stats_format_text: "Гнучке навчання, не виходячи з дому. Жива взаємодія з викладачами на повний або неповний день – легко адаптується.",
        stats_placement_title: "Працевлаштування",
        stats_placement_val: "Гарантія",
        stats_placement_text: "Після успішного завершення ми працевлаштуємо вас безпосередньо до провідних компаній у сфері охорони та догляду.",
        stats_equip_title: "Забезпечення",
        stats_equip_val: "Безкоштовно",
        stats_equip_text: "Ми надаємо вам планшет преміум-класу в безкоштовне користування на період курсу. Після завершення він залишається у вас.",
        
        // Courses Section
        courses_tagline: "АКАДЕМІЧНИЙ КАТАЛОГ КУРСІВ",
        courses_title: "Сертифіковане <span class=\"text-gradient-navy\">професійне навчання</span>",
        courses_subtitle: "Оберіть спеціалізацію. Всі пропозиції відповідають суворим критеріям якості AZAV Федерального агентства зайнятості.",
        tab_btn_security: "§34a Фахівець з безпеки",
        tab_btn_nurse: "Помічник догляду",
        course_badge_priority: "НАЙВИЩИЙ ПРІОРИТЕТ",
        course_badge_demand: "ВИСОКИЙ ПОПИТ",
        course_title_security: "Сертифікований фахівець з безпеки відповідно до §34a (IHK)",
        course_desc_security: "Мінімальна юридична вимога для роботи в охоронній сфері. Цей курс підготує вас до письмового та усного іспиту в Торгово-промисловій палаті (IHK).",
        course_req_title: "Вимоги до абітурієнтів:",
        course_req_age: "Мінімальний вік 18 років",
        course_req_record: "Довідка про відсутність судимості",
        course_req_lang: "Знання німецької мови на рівні не нижче A2",
        course_req_school: "Визнаний сертифікат про середню освіту",
        course_meta_duration_lbl: "Термін навчання",
        course_meta_format_lbl: "Формат навчання",
        course_meta_format_val: "Онлайн-трансляції (повний / неповний день)",
        course_meta_format_hybrid: "Гібридний (онлайн + практика)",
        course_btn_advice: "Замовити безкоштовну консультацію",
        course_btn_quiz: "Перевірити знання IHK &rarr;",
        syllabus_title_security: "Зміст іспиту IHK:",
        syllabus_title_nurse: "Основні модулі навчання:",
        syllabus_s1: "Законодавство про громадську безпеку та порядок",
        syllabus_s2: "Промислове право та правила захисту даних",
        syllabus_s3: "Цивільний кодекс (BGB) - право на самооборону",
        syllabus_s4: "Кримінальне право та судочинство",
        syllabus_s5: "Правила запобігання нещасним випадкам (UVV)",
        syllabus_s6: "Поведінкова наука та навички деескалації",
        course_title_nurse: "Помічник догляду",
        course_desc_nurse: "Почніть кар'єру в одній з найстабільніших сфер. Ви освоїте теоретичні та практичні засади професійного догляду та підтримки хворих.",
        syllabus_n1: "Основи медичного та базового догляду",
        syllabus_n2: "Комунікація та поважне ставлення до пацієнтів",
        syllabus_n3: "Невідкладні ситуації та перша допомога в охороні здоров'я",
        syllabus_n4: "Гігієнічні норми та захист від інфекцій",
        syllabus_n5: "Юридичні основи (SGB XI, права пацієнтів)",
        syllabus_n6: "Практична робота та моделювання випадків",
        
        // Eligibility Check Section
        calc_tag: "ДЕРЖАВНА ПІДТРИМКА",
        calc_title: "Отримайте право на <span class=\"text-gradient-gold\">100% оплату навчання</span>",
        calc_text: "Завдяки освітньому ваучеру від Федерального агентства зайнятості або Jobcenter всі витрати повністю покриваються державою. Дайте відповіді на 3 запитання.",
        calc_trust_azav: "Академія ліцензована за стандартами AZAV",
        calc_trust_docs: "Офіційні документи для вашого інспектора праці",
        wizard_q1: "Який ваш поточний статус зайнятості?",
        wizard_opt_q1_o1: "Шукаю роботу / Безробітний (ALG I або Bürgergeld)",
        wizard_opt_q1_o2: "Працюю (і шукаю нову кар'єру)",
        wizard_opt_q1_o3: "Самозайнятий / Інше / Шукаю місце навчання",
        wizard_q2: "Чи проходили ви вже консультацію щодо фінансування?",
        wizard_opt_q2_o1: "Так, я вже контактую з відомством",
        wizard_opt_q2_o2: "Ні, мені потрібна допомога у підготовці",
        wizard_opt_q2_o3: "Я хочу спочатку отримати загальну інформацію про процес",
        wizard_res_title: "Відмінні перспективи",
        wizard_res_text: "Ваші відповіді вказують на **повне право на фінансування**. Надішліть контактні дані. Куратор обговорить з вами подачу заяви та підготує папери для Jobcenter.",
        calc_btn_submit: "Отримати безкоштовну консультацію",
        
        // Quiz Section
        quiz_tagline: "ПЕРЕВІРИТИ ЗНАННЯ ЗАЗДАЛЕГІДЬ",
        quiz_title: "Практичний тест <span class=\"text-gradient-navy\">на рівень IHK</span>",
        quiz_subtitle: "Перевірте свої базові знання за допомогою 3 оригінальних запитань до іспиту IHK відповідно до §34a GewO.",
        quiz_question: "Запитання",
        quiz_of: "з",
        quiz_select_opt: "Оберіть один варіант відповіді.",
        quiz_next_question: "Наступне запитання →",
        quiz_show_results: "Показати результат",
        quiz_res_perf: "Чудово! Ви вже володієте прекрасним розумінням права.",
        quiz_res_good: "Дуже добре! У вас є солідні базові знання охоронного права.",
        quiz_res_bad: "Не хвилюйтеся! Охоронне право складне. Саме для цього ми тут.",
        quiz_res_title: "Тест завершено!",
        quiz_res_body: "Завдяки професійній підготовці наші випускники досягають 98% успішності на іспитах IHK. Використовуйте свій шанс.",
        quiz_res_btn_cta: "Записатися на консультацію",
        quiz_res_btn_repeat: "Пройти тест знову",
        
        // Questions
        q1: "Які повноваження приватний охоронець має у громадських місцях?",
        q1_o1: "Право на тимчасове затримання у разі виявлення на гарячому (§ 127 StPO)",
        q1_o2: "Право встановлювати особу за дорученням поліції",
        q1_o3: "Право обшукувати підозрілих осіб",
        q1_o4: "Право перекривати громадські дороги у разі небезпеки",
        q1_exp: "Приватний охоронець має такі ж права в публічних місцях, как і будь-який інший громадянин. § 127 StPO дозволяє кожному затримати особу на місці злочину за наявності підозри на втечу.",
        q2: "Коли може застосовуватися самооборона (§ 227 BGB / § 32 StGB)?",
        q2_o1: "Проти будь-якого майбутнього можливого нападу",
        q2_o2: "Проти поточного, протиправного нападу на захищене благо",
        q2_o3: "Як покарання після того, як нападник втік",
        q2_o4: "Тільки для відбиття небезпечних для життя нападів",
        q2_exp: "Необхідна оборона – це дії для захисту від теперішнього протиправного нападу на себе чи інших. Поширюється на всі блага (тіло, власність, честь).",
        q3: "Хто приймає офіційний іспит відповідно до §34a GewO?",
        q3_o1: "Місцевий відділок поліції",
        q3_o2: "Відповідне відомство з питань підприємництва",
        q3_o3: "Торгово-промислова палата (IHK)",
        q3_o4: "Безпосередньо приватний навчальний заклад",
        q3_exp: "Цей іспит регулюється державою і приймається виключно Торгово-промисловою палатою (IHK). Ми інтенсивно готуємо вас до нього.",

        // Perks Section
        perks_tagline: "НАШІ ГАРАНТІЇ ЯКОСТІ",
        perks_title: "Чому саме <span class=\"text-gradient-navy\">Blue Light College?</span>",
        perks_subtitle: "Ми орієнтуємося на високу якість навчання, сучасну техніку та реальне працевлаштування.",
        perk_c1_lbl: "ГАРАНТІЯ НА ОБЛАДНАННЯ",
        perk_c1_title: "Безкоштовний планшет",
        perk_c1_text: "Для зручності занять ми надаємо вам планшет високої якості. Після завершення навчання пристрій переходить у вашу власність без жодних доплат.",
        perk_c2_lbl: "МЕТОДИКА НАВЧАННЯ",
        perk_c2_title: "Інтерактивні онлайн-класи",
        perk_c2_text: "Ніякого нудного самостійного зазубрювання. Ви берете участь в щоденних живих вебінарах у віртуальному залі. Досвідчені викладачі детально пояснюють закони.",
        perk_c3_lbl: "КАР'ЄРНИЙ СТАРТ",
        perk_c3_title: "Гарантоване працевлаштування",
        perk_c3_text: "Завдяки стратегічному партнерству з лідерами ринку охорони та догляду Німеччини, ми працевлаштуємо вас на постійну роботу відразу після іспиту IHK.",
        perk_c4_lbl: "ПІДГОТОВКА ДО ІСПИТУ",
        perk_c4_title: "Тренінг усної частини іспиту",
        perk_c4_text: "Усний іспит вважається найважчим. Ми знімаємо ваші побоювання: на індивідуальних заняттях ми моделюємо ситуації та техніки деескалації до повної впевненості.",
        perk_c5_lbl: "ДОПОМОГА З ДОКУМЕНТАМИ",
        perk_c5_title: "Індивідуальний супровід у відомствах",
        perk_c5_text: "Не бійтеся бюрократії: куратори підготують вас до розмови з інспектором праці та разом з вами завантажать всі документи для Jobcenter.",
        perk_c6_lbl: "ФИНАНСУВАННЯ",
        perk_c6_title: "100% безкоштовна участь",
        perk_c6_text: "Завдяки AZAV-сертифікації Blue Light College всі витрати на навчання, матеріали та іспити покриваються вашим освітнім ваучером. Особистих витрат немає.",

        // Testimonials
        testi_tagline: "ІСТОРІЇ УСПІХУ НАШИХ ВИПУСКНИКІВ",
        testi_title: "Що кажуть наші <span class=\"text-gradient-navy\">учні</span>",
        testi_subtitle: "Дізнайтеся з перших вуст, як наше практичне навчання допомогло почати нову надійну кар'єру.",
        testi_c1: "Випускник §34a Охорона",
        testi_q1: "«Завдяки безкоштовному планшету я міг гнучко вчитися вечорами. Викладачі на живих онлайн-уроках підготували мене ідеально. Іспит IHK склав з першого разу! Тепер працюю в охороні об'єктів.»",
        testi_c2: "Випускниця Помічник догляду",
        testi_q2: "«Як мамі-одиначці, мені було важко знайти навчання. Коледж став справжньою знахідкою. Мій куратор допоміг мені завантажити документи для Джобцентру. Тепер я щаслива працювати в охороні здоров'я.»",
        testi_c3: "Випускник §34a Охорона",
        testi_q3: "«Інтенсивна підготовка до усної частини повністю позбавила мене страху перед іспитом. Повна оплата 100% витрат державою та працевлаштування відразу після курсу були супер. Рекомендую!»",

        // FAQ Section
        faq_tagline: "КОРИСНА ІНФОРМАЦІЯ ТА ЗАПИТАННЯ",
        faq_title: "Відповіді на ваші <span class=\"text-gradient-navy\">запитання</span>",
        faq_subtitle: "Дізнайтеся більше про вимоги до вступу, отримання ваучерів та процедуру іспиту IHK.",
        faq_q1: "Чи справді навчання на 100% безкоштовне для мене?",
        faq_a1: "Так, абсолютно. Ми безпосередньо розраховуємося з державними відомствами. Якщо ваш інспектор праці схвалить освітній ваучер, то всі курси, матеріали та іспити оплачуються державою. Ви нічого не платите.",
        faq_q2: "Який процес подання заяви на освітній ваучер?",
        faq_a2: "Процес простий. Ви записуєтеся до інспектора в Агентство зайнятості. Ми завчасно надаємо вам офіційні документи з нашою пропозицією. Ви надаєте їх інспектору, а після схвалення надсилаєте ваучер нам.",
        faq_q3: "Які вимоги встановлені для початку курсів?",
        faq_a3: "Вам має бути не менше 18 років, ви повинні мати чисту довідку про відсутність судимості та німецьку мову на рівні мінімум А2. Для безпеки §34a також потрібен визнаний сертифікат про середню освіту.",
        faq_q4: "Як працює навчання за допомогою безкоштовного планшета?",
        faq_a4: "Після реєстрації на курс ми надсилаємо вам поштою налаштований планшет. З нього ви щодня заходите на наші живі лекції. Ви берете активну участь та ставите питання. Планшет залишається вам.",
        faq_q5: "Чи отримаю я гарантію роботи після іспиту?",
        faq_a5: "Ми тісно співпрацюємо з провідними охоронними та медичними компаніями Німеччини. Під час навчання ми вивчаємо ваші побажання та готуємо резюме. Через високий дефіцит кадрів ми гарантуємо роботу.",

        // Contact Section
        contact_tagline: "ПРОФЕСІЙНА КОНСУЛЬТАЦІЯ",
        contact_title: "Зв'яжіться з нашою <span class=\"text-gradient-gold\">академією</span>",
        contact_text: "Сплануйте свою нову кар'єру разом з нашими експертами. Ми обговоримо всі питання щодо фінансування, ваучерів та розкладу під час особистої розмови.",
        contact_lbl_sec: "Навчальна канцелярія",
        contact_lbl_mail: "Електронна пошта для запитів",
        contact_lbl_head: "Головний офіс Schönkirchen",
        contact_val_addr: "Dorfstraße 12, 24232 Schönkirchen",
        contact_lbl_name: "Ваше повне ім'я",
        contact_lbl_email: "Електронна адреса",
        contact_lbl_phone: "Номер телефону",
        contact_lbl_course: "Бажаний напрямок навчання",
        contact_lbl_msg: "Ваше повідомлення (необов'язково)",
        contact_btn_submit: "Домовитися про безкоштовну консультацію",
        contact_opt_security: "Сертифікований фахівець з безпеки відповідно до §34a (IHK)",
        contact_opt_nurse: "Помічник догляду",
        contact_opt_advice: "Загальні питання щодо фінансування AZAV",
        ph_name: "Ім'я та Прізвище",
        ph_email: "name@example.de",
        ph_phone: "+49 170 1234567",
        ph_msg: "Чим ми можемо вам допомогти?...",
        ph_calc_name: "Повністю ім'я",
        ph_calc_phone: "Номер телефону для зв'язку",
        footer_text: "Сертифікована AZAV академія для підготовки та підвищення кваліфікації у сфері приватної охорони та догляду.",
        footer_badge_azav: "ЛІЦЕНЗІЯ ПРОВАДЖЕННЯ AZAV",
        footer_badge_ihk: "СТАНДАРТИ IHK",
        footer_title_academy: "Академія",
        footer_title_courses: "Курси",
        footer_title_legal: "Правова інформація",
        footer_copy: "Copyright &copy; 2026 Blue Light College. Всі права захищені. Акредитовано за нормами AZAV.",
        cookie_title: "Конфіденційність та захист даних (GDPR)",
        cookie_text: "Ми використовуємо файли cookie, щоб забезпечити найкращий досвід на нашому сайті. Деякі з них необхідні для роботи сайту, а інші допомагають нам аналізувати трафік анонімно.",
        cookie_lbl_nec: "Необхідні (завжди активні)",
        cookie_lbl_stats: "Статистика та аналітика",
        cookie_btn_all: "Прийняти всі",
        cookie_btn_nec: "Тільки необхідні",
        cookie_btn_cust: "Налаштувати вибір",
        legal_modal_title: "Правова інформація",
        legal_modal_btn_close: "Закрити",
        wa_status: "Секретаріат працює – Відповідь за < 5 хв 🟢",
        mm_tag: "ШВИДКА ОРІЄНТАЦІЯ",
        mm_title: "60-Секундний <span class=\"text-gradient-gold\">Академічний Матчмейкер</span>",
        mm_subtitle: "Дізнайтеся, який курс ідеально підходить для вашої життєвої ситуації та як отримати 100% фінансування від держави.",
        mm_q1: "Яка сфера інтересів вас найбільше приваблює?",
        mm_q1_o1_title: "Безпека та Охорона",
        mm_q1_o1_desc: "Захист людей та майна. Антикризовий вхід у сферу охорони та безпеки (§34a GewO).",
        mm_q1_o2_title: "Догляд та Турбота",
        mm_q1_o2_desc: "Допомога та догляд за людьми. Висока соціальна значущість та відмінна кар'єра асистента з догляду.",
        mm_q2: "Яке ваше поточне професійне становище?",
        mm_q2_o1: "Безробітний / Шукач роботи (ALG I або Bürgergeld)",
        mm_q2_o2: "Працевлаштований / Шукаю зміну кар'єри",
        mm_q2_o3: "Випускник школи / Шукаю навчання",
        mm_q2_o4: "Інше / Самозайнятий",
        mm_q3: "Що для вас найважливіше під час навчання?",
        mm_q3_o1: "100% безкоштовно (через освітній ваучер)",
        mm_q3_o2: "Гнучкість (онлайн-трансляції та неповний день)",
        mm_q3_o3: "Швидкий початок роботи та гарантія працевлаштування",
        mm_submit_btn: "Запросити безкоштовне бронювання місця",
        calc_card_title: "Калькулятор державної допомоги",
        calc_slider_label: "Бажана тривалість навчання:",
        calc_toggle_label: "Спосіб фінансування:",
        calc_toggle_voucher: "Освітній ваучер",
        calc_toggle_self: "Самооплата",
        calc_res_fees: "Плата за навчання:",
        calc_res_tablet: "Навчальний планшет (у вашій власності):",
        calc_res_tablet_val: "Включено (вартість €400)",
        calc_res_materials: "Навчальні матеріали та збори IHK:",
        calc_res_travel: "Субсидія на домашній офіс та інтернет:",
        calc_res_covered: "100% Покрито",
        calc_res_total: "Ваші чисті інвестиції:",
        calc_btn_submit: "Запитати безкоштовну консультацію",
        quiz_pass_status: "Іспит складено! (Необхідно мін. 50%)",
        quiz_fail_status: "Іспит не складено. (Необхідно 50%)",
        faq_search_placeholder: "Шукати запитання...",
        map_tagline: "РЕГІОНАЛЬНИЙ УСПІХ ВИПУСКНИКІВ",
        map_title: "Сильні партнери у вашому <span class=\"text-gradient-gold\">Регіоні</span>",
        map_subtitle: "Дізнайтеся про наших партнерів по співпраці та високі показники працевлаштування випускників поруч із вами.",
        map_graduates: "Випускників працевлаштовано",
        map_region_east: "Берлін та Бранденбург",
        map_region_north: "Гамбург та Шлезвіг-Гольштейн",
        map_region_west: "Північний Рейн-Вестфалія",
        map_region_center: "Гессен та Рейнланд-Пфальц",
        map_region_south: "Баварія та Баден-Вюртемберг",
        map_info_default_title: "Національна мережа співпраці",
        map_info_default_desc: "Клацніть на регіональний центр на карті, щоб показати детальну інформацію про партнерів та працевлаштування.",
        map_stat_placements_lbl: "Всього працевлаштувань",
        map_stat_partners_lbl: "Компаній-партнерів",
        advisor_name: "Мелані Шмідт",
        advisor_title: "Керівниця відділу консультацій",
        advisor_online: "В мережі - Доступна зараз",
        advisor_offline: "Офлайн - Робочі години: Пн-Пт 10-18",
        wa_status_offline: "Секретаріат офлайн – Робочі години: Пн-Пт 10:00-18:00 🔴"
    },
    tr: {
        // Navigation & Buttons
        nav_courses: "Kurslar",
        nav_calc: "Destek Kontrolü",
        nav_quiz: "IHK Sınavı",
        nav_perks: "Avantajlar",
        nav_faq: "SSS",
        nav_cta: "Randevu Al",
        wa_badge: "WhatsApp Destek",
        
        // Hero Section
        hero_badge_azav: "AZAV Onaylı Uzman Akademi",
        hero_badge_cost: "%100 Ücretsiz Eğitim",
        hero_title: "<span class=\"text-gradient-navy\">Güvenlik & Bakım</span> Alanında Sertifikalı Eğitimler",
        hero_description: "§34a onaylı Güvenlik Görevlisi veya kalifiye Hasta Bakıcı olarak kariyerinize başlayın. İş Ajansı (Arbeitsagentur) ve Jobcenter tarafından %100 finanse edilir – ücretsiz ödünç tablet ve iş garantisi dahildir.",
        hero_btn_calc: "Desteği Sorgula",
        hero_btn_courses: "Kursları İncele",
        hero_trust_quota_lbl: "Başarı Oranı",
        hero_trust_certified_lbl: "Sertifikalı",
        hero_trust_free_lbl: "Ücretsiz",
        hero_campus_title: "Blue Light College",
        hero_campus_subtitle: "Akademik Eğitim Merkezi",
        
        // Stats Section
        stats_duration_title: "Eğitim Süresi",
        stats_duration_val: "50 Gün",
        stats_duration_text: "Hızlı ve yüksek düzeyde verimli uzmanlık eğitimi. Sadece 50 günde devlet onaylı mesleki diplomanızı alın.",
        stats_format_title: "Eğitim Şekli",
        stats_format_val: "Canlı-Online",
        stats_format_text: "Evinizin konforunda esnek öğrenim. Tam zamanlı veya yarı zamanlı olarak eğitmenlerle canlı etkileşim – mükemmel uyum.",
        stats_placement_title: "İşe Yerleştirme",
        stats_placement_val: "Garantili",
        stats_placement_text: "Eğitimi başarıyla tamamladıktan sonra sizi doğrudan güvenlik ve bakım sektörünün lider firmalarına yerleştiriyoruz.",
        stats_equip_title: "Ekipman",
        stats_equip_val: "Dahil",
        stats_equip_text: "Eğitim süresi boyunca size ücretsiz olarak yüksek kaliteli bir tablet veriyoruz. Eğitim sonunda tablet tamamen sizin olur.",
        
        // Courses Section
        courses_tagline: "AKADEMİK KURS KATALOĞU",
        courses_title: "Sertifikalı <span class=\"text-gradient-navy\">Mesleki Eğitimler</span>",
        courses_subtitle: "Uzmanlık alanınızı seçin. Tüm programlar Federal İş Ajansı'nın katı AZAV kalite kriterlerini karşılamaktadır.",
        tab_btn_security: "§34a Güvenlik Görevlisi",
        tab_btn_nurse: "Hasta Bakıcı",
        course_badge_priority: "EN YÜKSEK ÖNCELİK",
        course_badge_demand: "YÜKSEK TALEP",
        course_title_security: "§34a uyarınca Sertifikalı Güvenlik Görevlisi (IHK)",
        course_desc_security: "Güvenlik sektöründeki prestijli görevler için yasal asgari şarttır. Bu kapsamlı kurs sizi Sanayi ve Ticaret Odası (IHK) nezdindeki yazılı ve sözlü uzmanlık sınavına hazırlar.",
        course_req_title: "Katılım Şartları:",
        course_req_age: "En az 18 yaşını doldurmuş olmak",
        course_req_record: "Temiz adli sicil kaydı",
        course_req_lang: "En az A2 seviyesinde Almanca bilgisi",
        course_req_school: "Denklik belgesine sahip ortaokul veya lise diploması",
        course_meta_duration_lbl: "Normal Eğitim Süresi",
        course_meta_format_lbl: "Eğitim Şekli",
        course_meta_format_val: "Canlı-Online (Tam Zamanlı / Yarı Zamanlı)",
        course_meta_format_hybrid: "Hibrit (Canlı-Online + Pratik)",
        course_btn_advice: "Ücretsiz Danışmanlık Talep Et",
        course_btn_quiz: "IHK Bilgini Test Et &rarr;",
        syllabus_title_security: "Sınavda Çıkacak Konular:",
        syllabus_title_nurse: "Temel Eğitim Modülleri:",
        syllabus_s1: "Kamu Güvenliği ve Düzeni Hukuku",
        syllabus_s2: "Ticaret Hukuku ve Veri Koruma Yönetmelikleri",
        syllabus_s3: "Alman Medeni Kanunu (BGB) - Meşru Müdafaa Hakları",
        syllabus_s4: "Ceza Hukuku ve Ceza Muhakemesi Usulü",
        syllabus_s5: "Kazaları Önleme Yönetmelikleri (UVV)",
        syllabus_s6: "Davranış İlkeleri & De-eskalsayon (Gerilimi Azaltma) Becerisi",
        course_title_nurse: "Hasta Bakıcı",
        course_desc_nurse: "En güvenli ve tatmin edici meslek alanlarından birinde kariyerinize başlayın. Profesyonel bakımın teorik ve pratik esaslarını ve yardıma muhtaç insanlara desteği öğreneceksiniz.",
        syllabus_n1: "Klinik Tedavi Bakımı ve Temel Bakım Esasları",
        syllabus_n2: "Hastalara Yaklaşım & Saygılı İletişim",
        syllabus_n3: "Bakım Mesleklerinde Acil Durumlar & İlk Yardım",
        syllabus_n4: "Hijyen Kuralları & Enfeksiyondan Korunma",
        syllabus_n5: "Yasal Temeller (SGB XI, Hasta Hakları)",
        syllabus_n6: "Pratik Uygulama & Vaka Simülasyonları",
        
        // Eligibility Check Section
        calc_tag: "DEVLET DESTEĞİ",
        calc_title: "Eğitim Bedelinin <span class=\"text-gradient-gold\">%100 Karşılanma</span> Durumunu Sorgulayın",
        calc_text: "İş Ajansı (Agentur für Arbeit) veya Jobcenter'dan alacağınız Eğitim Kuponu (Bildungsgutschein) ile tüm kurs, materyal ve sınav ücretleriniz devlet tarafından ödenir. 3 soruyu yanıtlayın.",
        calc_trust_azav: "AZAV standartlarına göre onaylı akademi",
        calc_trust_docs: "İş danışmanınız için doğrudan resmi evraklar",
        wizard_q1: "Mevcut iş durumunuz nedir?",
        wizard_opt_q1_o1: "İş arıyor / İşsiz (ALG I veya Bürgergeld)",
        wizard_opt_q1_o2: "Çalışıyor (ve yeni bir kariyere yönelmek istiyor)",
        wizard_opt_q1_o3: "Serbest meslek / Diğer / Meslek eğitim yeri arıyor",
        wizard_q2: "Destek alma konusunda daha önce bir görüşme yaptınız mı?",
        wizard_opt_q2_o1: "Evet, resmi kurumla zaten iletişim halindeyim",
        wizard_opt_q2_o2: "Hayır, hazırlık sürecinde desteğe ihtiyacım var",
        wizard_opt_q2_o3: "Öncelikle süreç hakkında genel bilgi almak istiyorum",
        wizard_res_title: "Harika Beklentiler",
        wizard_res_text: "Verdiğiniz yanıtlar **tam devlet desteği almaya uygun** olduğunuzu gösteriyor. İletişim bilgilerinizi gönderin. Danışmanımız başvuru sürecini sizinle görüşecek ve resmi belgeleri hazırlayacaktır.",
        calc_btn_submit: "Ücretsiz Mesleki Danışmanlık Talep Et",
        
        // Quiz Section
        quiz_tagline: "ÖNCEDEN BİLGİNİ TEST ET",
        quiz_title: "IHK Uzmanlığı <span class=\"text-gradient-navy\">Deneme Sınavı</span>",
        quiz_subtitle: "§34a GewO uyarınca IHK sınavından alınmış 3 orijinal soru ile temel bilginizi test edin.",
        quiz_question: "Soru",
        quiz_of: "/",
        quiz_select_opt: "Bir cevap seçeneği belirleyin.",
        quiz_next_question: "Sonraki Soru →",
        quiz_show_results: "Sonuçları Göster",
        quiz_res_perf: "Mükemmel! Hukuk konusunda şimdiden harika bir anlayışa sahipsiniz.",
        quiz_res_good: "Çok iyi! Güvenlik hukuku konusunda sağlam temel bilgilere sahipsiniz.",
        quiz_res_bad: "Endişelenmeyin! Güvenlik hukuku karmaşıktır. Zaten biz bunun için buradayız.",
        quiz_res_title: "Sınav Tamamlandı!",
        quiz_res_body: "Profesyonel hazırlık kursumuz sayesinde mezunlarımız IHK sınavında %98 başarı oranı elde etmektedir. Şansınızı kullanın.",
        quiz_res_btn_cta: "Ücretsiz Randevu Al",
        quiz_res_btn_repeat: "Sınavı Tekrarla",
        
        // Questions
        q1: "Özel bir güvenlik görevlisinin kamusal alanda genel olarak hangi yetkisi vardır?",
        q1_o1: "Suçüstü durumunda geçici olarak alıkoyma yetkisi (§ 127 StPO)",
        q1_o2: "Polis adına kimlik tespiti yapma yetkisi",
        q1_o3: "Şüpheli kişilerin üzerini arama yetkisi",
        q1_o4: "Tehlike anında kamusal yolları kapatma yetkisi",
        q1_exp: "Güvenlik görevlisi olarak kamusal alanda diğer vatandaşlarla aynı haklara sahipsiniz (herkesin hakları). § 127 StPO, kaçma şüphesi olan bir kişiyi suçüstü anında herkesin geçici olarak alıkoymasına izin verir.",
        q2: "Meşru müdafaa (§ 227 BGB / § 32 StGB) ne zaman uygulanabilir?",
        q2_o1: "Gelecekteki olası her türlü saldırıya karşı",
        q2_o2: "Korumalı bir hukuki varlığa yönelik mevcut, hukuka aykırı bir saldırıya karşı",
        q2_o3: "Saldırgan kaçtıktan sonra bir ceza olarak",
        q2_o4: "Yalnızca hayati tehlike oluşturan saldırıları savuşturmak için",
        q2_exp: "Meşru müdafaa, kişinin kendisine veya başkasına yönelik mevcut ve hukuka aykırı bir saldırıyı savuşturmak için gerekli olan savunmadır. Tüm korunan haklar için geçerlidir (örn. vücut, mülkiyet, onur).",
        q3: "§34a GewO kapsamındaki resmi sınavı kim yapar?",
        q3_o1: "Yerel polis teşkilatı",
        q3_o2: "Yetkili belediye ruhsat dairesi",
        q3_o3: "Sanayi ve Ticaret Odası (IHK)",
        q3_o4: "Doğrudان özel eğitim kurumunun kendisi",
        q3_exp: "Bu sınav devlet tarafından düzenlenir ve yalnızca Sanayi ve Ticaret Odası (IHK) tarafından gerçekleştirilebilir. Sizi bu sınava yoğun ve hedef odaklı hazırlıyoruz.",

        // Perks Section
        perks_tagline: "KALİTE STANDART GARANTİLERİMİZ",
        perks_title: "Neden <span class=\"text-gradient-navy\">Blue Light College?</span>",
        perks_subtitle: "En yüksek eğitim kalitesine, modern ekipmana ve gerçek kariyer fırsatlarına odaklanıyoruz.",
        perk_c1_lbl: "EKİPMAN GARANTİSİ",
        perk_c1_title: "Ücretsiz Ödünç Tablet",
        perk_c1_text: "Online derslerinizin sorunsuz geçmesi için size yüksek kaliteli bir tablet tahsis ediyoruz. Mezun olduktan sonra bu tablet tamamen sizin olur – ek ücret ödemezsiniz.",
        perk_c2_lbl: "EĞİTİM METODOLOJİSİ",
        perk_c2_title: "Etkileşimli Canlı Dersler",
        perk_c2_text: "Kuru kitap okumak yok. Sanal sınıflarımızda her gün canlı derslere katılırsınız. Uzman eğitmenlerimiz karmaşık hukuki konuları anlaşılır bir dille anlatır.",
        perk_c3_lbl: "KARİYER DESTEĞİ",
        perk_c3_title: "Garantili İşe Yerleştirme",
        perk_c3_text: "Güvenlik ve bakım sektöründeki büyük firmalarla yaptığımız ortaklıklar sayesinde, sınavı geçer geçmez sizi doğrudan kalıcı ve güvenli bir işe yerleştiriyoruz.",
        perk_c4_lbl: "SINAV HAZIRLIĞI",
        perk_c4_title: "Sözlü Sınav Koçluğu",
        perk_c4_text: "IHK önündeki sözlü sınav en büyük engel olarak görülür. Endişenizi gideriyoruz: bire bir simülasyonlarla, sınavda tamamen rahat olana kadar pratik yapıyoruz.",
        perk_c5_lbl: "RESMİ DAİRE DESTEĞİ",
        perk_c5_title: "Kişisel Resmi Daire Danışmanlığı",
        perk_c5_text: "Bürokrasiden korkmayın: danışmanlarımız sizi iş danışmanınızla yapacağınız görüşmeye hazırlar ve başvuru evraklarını doğrudan sizinle birlikte sisteme yükler.",
        perk_c6_lbl: "FİNANSMAN",
        perk_c6_title: "%100 Ücretsiz Katılım",
        perk_c6_text: "Blue Light College'ın AZAV sertifikasyonu sayesinde eğitim, materyal ve sınav ücretlerinizin tamamı Eğitim Kuponunuz ile karşılanır. Kişisel hiçbir masrafınız olmaz.",

        // Testimonials
        testi_tagline: "MEZUNLARIMIZIN BAŞARI HİKAYELERİ",
        testi_title: "Öğrencilerimiz <span class=\"text-gradient-navy\">ne diyor?</span>",
        testi_subtitle: "Uygulamalı eğitimimizin yeni ve güvenli bir kariyere başlamayı nasıl sağladığını ilk ağızdan öğrenin.",
        testi_c1: "Mezun §34a Güvenlik Görevlisi",
        testi_q1: "“Ücretsiz ödünç tablet sayesinde akşamları esnekçe çalışabildim. Canlı çevrimiçi derslerdeki eğitmenler beni mükemmel hazırladı. IHK uzmanlık sınavını ilk denemede geçtim! Şimdi tesis korumada çalışıyorum.”",
        testi_c2: "Mezun Hasta Bakıcı",
        testi_q2: "“Yalnız bir anne olarak mesleki eğitim bulmak zordu. Blue Light College büyük bir şans oldu. Danışmanım Jobcenter evrak yüklemelerinde bile bana destek oldu. Şimdi sağlık sektöründe çok mutluyum.”",
        testi_c3: "Mezun §34a Güvenlik Görevlisi",
        testi_q3: "“Özellikle sözlü sınav öncesi birebir sınav simülasyonları kaygımı yok etti. %100 devlet finansmanı ve mezuniyet sonrası anında iş garantisi harikaydı. Kesinlikle tavsiye ederim!”",

        // FAQ Section
        faq_tagline: "MERAK EDİLENLER & SIKÇA SORULAN SORULAR",
        faq_title: "<span class=\"text-gradient-navy\">Sorularınızın</span> Yanıtları",
        faq_subtitle: "Katılım şartları, eğitim kuponunun alınması ve IHK sınav süreci hakkında daha fazlasını öğrenin.",
        faq_q1: "Eğitim gerçekten benim için %100 ücretsiz mi?",
        faq_a1: "Evet, kesinlikle. AZAV onaylı eğitim kurumu olarak ücretleri doğrudan devlete fatura ediyoruz. İş Ajansınız veya Jobcenter'ınız kuponu onayladığında, tüm harcamalarınız karşılanır. Hiçbir ödeme yapmazsınız.",
        faq_q2: "Eğitim kuponu başvuru süreci nasıl işliyor?",
        faq_a2: "Süreç çok basittir. İş danışmanınızdan bir randevu alırsınız. Size resmi teklif belgelerimizi veririz ve siz de bunları danışmanınıza sunarsınız. Kupon onaylandığında kaydınızı yaparız.",
        faq_q3: "Kurslar için hangi şartlar geçerlidir?",
        faq_a3: "Her iki kurs için en az 18 yaşında olmanız, sabıka kaydınızın olmaması ve en az A2 Almanca bilgisine sahip olmanız gerekir. §34a güvenlik eğitimi için ayrıca lise veya dengi okul mezuniyeti istenir.",
        faq_q4: "Ücretsiz tablet ile online eğitim nasıl yapılıyor?",
        faq_a4: "Kayıt sonrası, hazır durumdaki tableti adresinize kargo ile gönderiyoruz. Bu cihazla her gün canlı derslerimize bağlanırsınız. Soru sorabilir ve derse katılabilirsiniz. Eğitim sonunda tablet sizde kalır.",
        faq_q5: "Sınavı geçtikten sonra iş garantisi alıyor muyum?",
        faq_a5: "Almanya'nın önde gelen güvenlik ve sağlık kuruluşlarıyla yakın çalışıyoruz. Eğitim sırasında tercihlerinizi (örn. tesis koruma, resepsiyon, mobil devriye veya klinik servis) belirleyip iş başvurularınızı hazırlarız ve doğrudan işe yerleştiririz.",

        // Contact Section
        contact_tagline: "RESMİ DANIŞMANLIK",
        contact_title: "<span class=\"text-gradient-gold\">Akademimiz</span> İle İletişime Geçin",
        contact_text: "Mesleki eğitiminizi ve sonrasındaki işe başlangıcınızı danışmanlarımızla birlikte planlayın. Eğitim kuponları, tarihler ve ders formatları hakkındaki tüm detayları kişisel görüşmede netleştirelim.",
        contact_lbl_sec: "Öğrenci İşleri",
        contact_lbl_mail: "Sorularınız için E-posta",
        contact_lbl_head: "Schönkirchen Merkez Ofis",
        contact_val_addr: "Dorfstraße 12, 24232 Schönkirchen",
        contact_lbl_name: "Adınız ve Soyadınız",
        contact_lbl_email: "E-posta Adresiniz",
        contact_lbl_phone: "Telefon Numaranız",
        contact_lbl_course: "İstediğiniz Eğitim Programı",
        contact_lbl_msg: "Mesajınız (İsteğe Bağlı)",
        contact_btn_submit: "Ücretsiz Ön Görüşme Randevusu Al",
        contact_opt_security: "§34a uyarınca Sertifikalı Güvenlik Görevlisi (IHK)",
        contact_opt_nurse: "Hasta Bakıcı",
        contact_opt_advice: "AZAV Destekleri Hakkında Genel Bilgi",
        ph_name: "Ad Soyad",
        ph_email: "isim@ornek.de",
        ph_phone: "+49 170 1234567",
        ph_msg: "Size nasıl yardımcı olabiliriz?...",
        ph_calc_name: "Adınız Soyadınız",
        ph_calc_phone: "İletişim için telefon numarası",
        footer_text: "Özel güvenlik ve bakım sektöründeki mesleki eğitim ve uzmanlık programları için AZAV sertifikalı resmi akademi.",
        footer_badge_azav: "AZAV RESMİ TRÄGER ONAYI",
        footer_badge_ihk: "IHK STANDARTLARI",
        footer_title_academy: "Akademi",
        footer_title_courses: "Kurslar",
        footer_title_legal: "Yasal Bilgiler",
        footer_copy: "&copy; 2026 Blue Light College. Tüm hakları saklıdır. AZAV standartlarına göre akredite edilmiştir.",
        cookie_title: "Gizlilik & Veri Koruma (GDPR)",
        cookie_text: "Web sitemizde en iyi deneyimi sunmak için çerezleri kullanıyoruz. Bazı çerezler teknik çalışma için zorunludur (Gerekli), bazıları ise trafiğimizi analiz etmemize yardımcı olur (İstatistik).",
        cookie_lbl_nec: "Gerekli (her zaman aktif)",
        cookie_lbl_stats: "İstatistik & Analiz",
        cookie_btn_all: "Hepsini Kabul Et",
        cookie_btn_nec: "Yalnızca Gerekli",
        cookie_btn_cust: "Seçimi Düzenle",
        legal_modal_title: "Yasal Bilgiler",
        legal_modal_btn_close: "Kapat",
        wa_status: "Sekreterlik aktif – Cevap süresi < 5 dk 🟢",
        mm_tag: "HIZLI YÖNLENDİRME",
        mm_title: "60 Saniyelik <span class=\"text-gradient-gold\">Akademi Eşleştirici</span>",
        mm_subtitle: "Hangi kursun yaşam durumunuza en uygun olduğunu ve %100 devlet desteğini nasıl alacağınızı öğrenin.",
        mm_q1: "En çok hangi alan ilginizi çekiyor?",
        mm_q1_o1_title: "Güvenlik & Koruma",
        mm_q1_o1_desc: "İnsanları ve mülkleri korumak. Güvenlik sektörüne krizlerden uzak garantili giriş (§34a GewO).",
        mm_q1_o2_title: "Bakım & Destek",
        mm_q1_o2_desc: "İnsanlara yardım etmek ve bakım sunmak. Yüksek sosyal değer ve hasta bakıcı olarak mükemmel kariyer fırsatları.",
        mm_q2: "Mevcut profesyonel durumunuz nedir?",
        mm_q2_o1: "İşsiz / İş Arayan (ALG I veya Bürgergeld)",
        mm_q2_o2: "Çalışıyor / Kariyer değişikliği arıyor",
        mm_q2_o3: "Okul mezunu / Staj yeri arıyor",
        mm_q2_o4: "Diğer / Kendi işi",
        mm_q3: "Eğitiminiz süresince sizin için en önemlisi nedir?",
        mm_q3_o1: "%100 ücretsiz (Eğitim kuponu aracılığıyla)",
        mm_q3_o2: "Esneklik (Canlı online ve yarı zamanlı seçeneği)",
        mm_q3_o3: "Hızlı işe başlama ve iş garantisi",
        mm_submit_btn: "Ücretsiz Kontenjan Rezervasyonu Talep Et",
        calc_card_title: "Devlet Desteği Tasarruf Hesaplayıcı",
        calc_slider_label: "İstenen Eğitim Süresi:",
        calc_toggle_label: "Finansman Yöntemi:",
        calc_toggle_voucher: "Eğitim Kuponu",
        calc_toggle_self: "Bireysel Ödeme",
        calc_res_fees: "Kurs Ücretleri:",
        calc_res_tablet: "Eğitim Tableti (Mülkiyetiniz Olur):",
        calc_res_tablet_val: "Dahil (€400 Değerinde)",
        calc_res_materials: "Ders Materyalleri ve IHK Sınav Harçları:",
        calc_res_travel: "Ev-Ofis ve İnternet Desteği:",
        calc_res_covered: "%100 Karşılandı",
        calc_res_total: "Net Yatırımınız:",
        calc_btn_submit: "Ücretsiz Eğitim Danışmanlığı İsteyin",
        quiz_pass_status: "Sınavı geçtiniz! (En az %50 gerekli)",
        quiz_fail_status: "Sınavda başarısız oldunuz. (%50 gerekli)",
        faq_search_placeholder: "Soruları arayın...",
        map_tagline: "BÖLGESEL MEZUN BAŞARISI",
        map_title: "Bölgenizdeki <span class=\"text-gradient-gold\">Güçlü Ortaklar</span>",
        map_subtitle: "Size en yakın iş birliği ortaklarımızı ve yüksek mezun istihdam sayılarını keşfedin.",
        map_graduates: "Yerleştirilen Mezunlar",
        map_region_east: "Berlin & Brandenburg",
        map_region_north: "Hamburg & Schleswig-Holstein",
        map_region_west: "Kuzey Ren-Vestfalya",
        map_region_center: "Hessen & RLP",
        map_region_south: "Bavyera & Baden-Württemberg",
        map_info_default_title: "Ulusal İş Birliği Ağı",
        map_info_default_desc: "Ortaklar ve yerel istihdam hakkında detaylı bilgi görüntülemek için haritadaki bölgesel bir merkeze tıklayın.",
        map_stat_placements_lbl: "Toplam İstihdam",
        map_stat_partners_lbl: "Ortak Şirketler",
        advisor_name: "Melanie Schmidt",
        advisor_title: "Akademik Danışmanlık Koordinatörü",
        advisor_online: "Çevrimiçi - Şimdi Ulaşılabilir",
        advisor_offline: "Çevrimdışı - Çalışma saatleri: Pzt-Cum 10-18",
        wa_status_offline: "Sekreterlik çevrimdışı – Çalışma saatleri: Pzt-Cum 10:00-18:00 🔴"
    },
    ar: {
        // Navigation & Buttons
        nav_courses: "الدورات التعليمية",
        nav_calc: "فحص الدعم المالي",
        nav_quiz: "اختبار IHK",
        nav_perks: "المميزات",
        nav_faq: "الأسئلة الشائعة",
        nav_cta: "حجز استشارة",
        wa_badge: "استشارة عبر الواتساب",
        
        // Hero Section
        hero_badge_azav: "أكاديمية تخصصية مرخصة من AZAV",
        hero_badge_cost: "تعليم مجاني 100%",
        hero_title: "تدريب مهني معتمد في مجالات <span class=\"text-gradient-navy\">الأمن والرعاية الصحية</span>",
        hero_description: "ابدأ مسيرتك المهنية كحارس أمن مرخص وفقاً للمادة §34a أو كمساعد رعاية صحية مؤهل. ممول بنسبة 100% من قبل وكالة العمل وJobcenter - بما في ذلك جهاز لوحي مجاني كإعارة وضمان الحصول على وظيفة.",
        hero_btn_calc: "فحص أهلية الدعم",
        hero_btn_courses: "عرض الدورات",
        hero_trust_quota_lbl: "نسبة النجاح",
        hero_trust_certified_lbl: "معتمد ومرخص",
        hero_trust_free_lbl: "مجاني بالكامل",
        hero_campus_title: "Blue Light College",
        hero_campus_subtitle: "مؤسسة تدريبية أكاديمية",
        
        // Stats Section
        stats_duration_title: "مدة الدراسة",
        stats_duration_val: "50 يوماً",
        stats_duration_text: "تعليم مهني سريع وفعال للغاية. احصل على شهادتك المهنية المعترف بها من الدولة خلال 50 يوماً فقط.",
        stats_format_title: "نظام التدريس",
        stats_format_val: "عبر الإنترنت بث مباشر",
        stats_format_text: "دراسة مرنة ومريحة من منزلك. تفاعل مباشر مع المحاضرين بدوام كامل أو جزئي - متوافق تماماً مع ظروفك.",
        stats_placement_title: "التوظيف",
        stats_placement_val: "مضمون",
        stats_placement_text: "نقوم بتوظيفك مباشرة بعد التخرج لدى شركات رائدة شريكة في مجالات الأمن والرعاية الصحية.",
        stats_equip_title: "التجهيزات",
        stats_equip_val: "متضمنة مجاناً",
        stats_equip_text: "نوفر لك جهازاً لوحياً (تابلت) عالي الجودة مجاناً طوال فترة التدريب. ويصبح ملكك بالكامل فور التخرج.",
        
        // Courses Section
        courses_tagline: "عرض الدورات الأكاديمية",
        courses_title: "تدريب مهني <span class=\"text-gradient-navy\">معتمد</span>",
        courses_subtitle: "اختر تخصصك. تلبي جميع عروضنا معايير الجودة الصارمة لوكالة العمل الفيدرالية (AZAV).",
        tab_btn_security: "§34a حارس أمن مرخص",
        tab_btn_nurse: "مساعد رعاية صحية",
        course_badge_priority: "أولوية قصوى",
        course_badge_demand: "طلب مرتفع للغاية",
        course_title_security: "حارس أمن مرخص وفقاً للمادة §34a (IHK)",
        course_desc_security: "الحد الأدنى للمتطلبات القانونية للعمل في قطاع الأمن الخاص. تؤهلك هذه الدورة الشاملة بشكل منهجي للاختبار الكتابي والشفهي أمام غرفة التجارة والصناعة (IHK).",
        course_req_title: "شروط الالتحاق بالدورة:",
        course_req_age: "ألا يقل العمر عن 18 عاماً",
        course_req_record: "سجل جنائي خالٍ من السوابق",
        course_req_lang: "مستوى اللغة الألمانية لا يقل عن A2",
        course_req_school: "شهادة مدرسية معترف بها",
        course_meta_duration_lbl: "مدة الدراسة المعتادة",
        course_meta_format_lbl: "نظام الدراسة",
        course_meta_format_val: "بث مباشر عبر الإنترنت (دوام كامل / جزئي)",
        course_meta_format_hybrid: "مختلط (بث مباشر + تدريب عملي)",
        course_btn_advice: "طلب استشارة مجانية",
        course_btn_quiz: "اختبر معلوماتك لـ IHK &rarr;",
        syllabus_title_security: "محتوى الدورة المخصص للاختبار:",
        syllabus_title_nurse: "الوحدات التدريبية الأساسية:",
        syllabus_s1: "قانون الأمن والنظام العام في ألمانيا",
        syllabus_s2: "قانون التجارة واللوائح الخاصة بحماية البيانات",
        syllabus_s3: "القانون المدني الألماني (BGB) - حق الدفاع الشرعي",
        syllabus_s4: "القانون الجنائي وقانون الإجراءات الجنائية",
        syllabus_s5: "لوائح الوقاية من الحوادث المهنية (UVV)",
        syllabus_s6: "علم السلوك ومهارات خفض التوتر والتعامل مع الأزمات",
        course_title_nurse: "مساعد رعاية صحية",
        course_desc_nurse: "ابدأ عملك في أحد أكثر القطاعات استقراراً وطلباً. ستتعلم الأسس النظرية والعملية للرعاية المهنية والرعاية الطبية الأساسية ومساعدة كبار السن والمرضى.",
        syllabus_n1: "أسس الرعاية العلاجية والتمريض الأساسي",
        syllabus_n2: "التواصل والتعامل المحترم مع المرضى",
        syllabus_n3: "حالات الطوارئ والإسعافات الأولية في التمريض",
        syllabus_n4: "قواعد النظافة والوقاية من العدوى",
        syllabus_n5: "الأسس القانونية (التأمين التمريضي وحقوق المرضى)",
        syllabus_n6: "التطبيق العملي ومحاكاة الحالات الواقعية",
        
        // Eligibility Check Section
        calc_tag: "الدعم المالي الحكومي",
        calc_title: "افحص أهليتك للحصول على <span class=\"text-gradient-gold\">تمويل كامل 100%</span>",
        calc_text: "عبر قسيمة التعليم (Bildungsgutschein) من وكالة العمل أو Jobcenter، يتم تغطية رسوم الدورة والكتب والاختبارات بالكامل من الدولة. أجب عن 3 أسئلة.",
        calc_trust_azav: "أكاديمية مرخصة بالكامل وفق معايير الجودة AZAV",
        calc_trust_docs: "نوفر المستندات الرسمية مباشرة لمستشارك في مكتب العمل",
        wizard_q1: "ما هو وضعك المهني الحالي؟",
        wizard_opt_q1_o1: "باحث عن عمل / عاطل (أحصل على معونة Bürgergeld أو ALG I)",
        wizard_opt_q1_o2: "أعمل حالياً (وأبحث عن تغيير مساري المهني)",
        wizard_opt_q1_o3: "عمل حر / غير ذلك / أبحث عن مقعد تدريب مهني",
        wizard_q2: "هل حصلت بالفعل على موعد استشارة بخصوص الدعم المالي؟",
        wizard_opt_q2_o1: "نعم، أنا على تواصل بالفعل مع مكتب العمل",
        wizard_opt_q2_o2: "لا، أحتاج إلى مساعدة في التحضير للمقابلة",
        wizard_opt_q2_o3: "أود الحصول على معلومات عامة عن الإجراءات أولاً",
        wizard_res_title: "فرص ممتازة للغاية",
        wizard_res_text: "تشير إجاباتك إلى **أهليتك الكاملة للحصول على الدعم الحكومي**. أرسل لنا معلومات الاتصال بك. وسيقوم مستشارنا بمناقشة تقديم الطلب وتجهيز الأوراق الرسمية لك.",
        calc_btn_submit: "طلب استشارة تعليمية مجانية",
        
        // Quiz Section
        quiz_tagline: "اختبر معلوماتك مسبقاً",
        quiz_title: "الاختبار التجريبي <span class=\"text-gradient-navy\">لامتحان IHK</span>",
        quiz_subtitle: "اختبر معلوماتك الأساسية بثلاثة أسئلة حقيقية من اختبارات IHK وفقاً للمادة §34a GewO.",
        quiz_question: "سؤال",
        quiz_of: "من",
        quiz_select_opt: "يرجى اختيار أحد الخيارات للإجابة.",
        quiz_next_question: "السؤال التالي →",
        quiz_show_results: "عرض النتائج",
        quiz_res_perf: "رائع جداً! لديك بالفعل فهم قانوني ممتاز ومبشر.",
        quiz_res_good: "ممتاز! لديك معرفة أساسية جيدة بقانون الأمن الخاص.",
        quiz_res_bad: "لا تقلق! قانون الأمن معقد وله تفاصيل كثيرة. نحن هنا لمساعدتك وتدريبك.",
        quiz_res_title: "اكتمل الاختبار!",
        quiz_res_body: "بفضل برنامجنا التحضيري المتميز، يحقق خريجونا نسبة نجاح تبلغ 98% في اختبارات غرفة التجارة والصناعة (IHK). استغل فرصتك الآن.",
        quiz_res_btn_cta: "حجز استشارة مجانية",
        quiz_res_btn_repeat: "إعادة الاختبار",
        
        // Questions
        q1: "ما هي الصلاحيات القانونية التي يتمتع بها حارس الأمن الخاص في الأماكن العامة؟",
        q1_o1: "حق الاحتجاز المؤقت للمتهم عند ضبطه متلبساً (§ 127 StPO)",
        q1_o2: "حق التحقق من الهوية بتكليف رسمي من الشرطة",
        q1_o3: "حق تفتيش الأشخاص المشتبه بهم ذاتياً ودون موافقتهم",
        q1_o4: "حق إغلاق الطرق العامة عند استشعار الخطر",
        q1_exp: "كحارس أمن، تتمتع في الأماكن العامة بنفس الحقوق المتاحة للمواطن العادي (حقوق الجميع). تسمح المادة 127 من قانون الإجراءات الجنائية لأي شخص باحتجاز شخص آخر مؤقتاً إذا ضُبط متلبساً بالجريمة وكان هناك خوف من هروبه.",
        q2: "متى يحق للشخص ممارسة حق الدفاع الشرعي (§ 227 BGB / § 32 StGB)؟",
        q2_o1: "ضد أي اعتداء مستقبلي محتمل أو متوقع",
        q2_o2: "ضد اعتداء حالٍ وغير قانوني يستهدف شخصاً أو ممتلكات محمية قانوناً",
        q2_o3: "كعقوبة للمعتدي بعد أن يلوذ بالفرار ويغادر المكان",
        q2_o4: "فقط لصد الاعتداءات التي تشكل خطراً مباشراً على الحياة",
        q2_exp: "الدفاع الشرعي هو الدفاع اللازم لصد اعتداء حال وغير قانوني عن النفس أو عن الآخرين. ويشمل حماية جميع الحقوق القانونية (مثل الجسد، الملكية، الشرف).",
        q3: "من هي الجهة الرسمية التي تشرف على اختبار المادة §34a GewO وتمنح الشهادة؟",
        q3_o1: "إدارة الشرطة المحلية في المنطقة",
        q3_o2: "مكتب تسجيل الأنشطة التجارية والبلدية",
        q3_o3: "غرفة التجارة والصناعة الألمانية (IHK)",
        q3_o4: "مؤسسة التدريب المهني الخاصة نفسها",
        q3_exp: "هذا الاختبار تنظمه الدولة وتشرف عليه حصرياً غرفة التجارة والصناعة (IHK). نحن نعدك بشكل مكثف ومهني لاجتيازه بنجاح.",

        // Perks Section
        perks_tagline: "ضمانات الجودة والتميز لدينا",
        perks_title: "لماذا تخرج بـ <span class=\"text-gradient-navy\">كلية بلو لايت؟</span>",
        perks_subtitle: "نحن نركز على تقديم أعلى مستويات جودة التعليم المعتمدة، وأحدث الأجهزة المساعدة، وضمان الحصول على عمل.",
        perk_c1_lbl: "ضمان الأجهزة والمعدات",
        perk_c1_title: "جهاز تابلت مجاني تماماً",
        perk_c1_text: "لضمان سير دروسك عبر الإنترنت دون انقطاع، نوفر لك جهازاً لوحياً (تابلت) عالي الجودة. وبعد التخرج بنجاح، يصبح الجهاز ملكاً لك بالكامل دون دفع أي رسوم إضافية.",
        perk_c2_lbl: "طريقة التدريس الحديثة",
        perk_c2_title: "دروس تفاعلية مباشرة",
        perk_c2_text: "لا توجد دراسة نظرية مملة من الكتب فقط. ستشارك يومياً في محاضرات تفاعلية مباشرة داخل فصولنا الافتراضية، حيث يشرح مدربونا المعتمدون القوانين الصعبة بأسلوب مبسط.",
        perk_c3_lbl: "فرص الدعم المهني",
        perk_c3_title: "ضمان التوظيف المباشر",
        perk_c3_text: "بفضل شراكاتنا الوثيقة والاستراتيجية مع كبرى شركات الأمن والرعاية الصحية في ألمانيا، نقوم بتوظيفك مباشرة في وظيفة دائمة وآمنة فور اجتيازك للاختبار بنجاح.",
        perk_c4_lbl: "الاستعداد للاختبار",
        perk_c4_title: "تدريب مكثف للاختبار الشفهي",
        perk_c4_text: "يعتبر الاختبار الشفهي أمام IHK هو العقبة الكبرى لدى الطلاب. نحن ننزع عنك هذا القلق تماماً: من خلال جلسات محاكاة فردية، نتدرب على الأسئلة حتى تصبح مستعداً وواثقاً تماماً.",
        perk_c5_lbl: "المساعدة الإدارية والمعاملات",
        perk_c5_title: "مرافقة شخصية في المعاملات الرسمية",
        perk_c5_text: "لا تخف من البيروقراطية والمعاملات الورقية: مستشارونا يجهزونك للمقابلة مع مستشارك في مكتب العمل، ويساعدونك في رفع الطلبات والمستندات الرسمية خطوة بخطوة.",
        perk_c6_lbl: "التمويل المالي للدورة",
        perk_c6_title: "مشاركة مجانية 100%",
        perk_c6_text: "نظراً لأن كلية بلو لايت مرخصة رسمياً وفق معايير AZAV، فإن رسوم التدريب والكتب والاختبارات مغطاة بالكامل بواسطة قسيمة التعليم الممنوحة لك. لن تدفع أي شيء من جيبك الخاص.",

        // Testimonials
        testi_tagline: "قصص نجاح خريجينا المتميزة",
        testi_title: "ماذا يقول <span class=\"text-gradient-navy\">طلابنا</span>",
        testi_subtitle: "اكتشف بنفسك كيف ساعدهم تدريبنا العملي في بدء مسيرة مهنية جديدة وآمنة.",
        testi_c1: "خريج دورة §34a حارس أمن",
        testi_q1: "«بفضل الجهاز اللوحي المجاني، تمكنت من الدراسة بمرونة في المساء. لقد جهزني المحاضرون في الدروس المباشرة عبر الإنترنت بشكل ممتاز. واجتزت اختبار IHK من المحاولة الأولى! أعمل الآن في مجال حراسة المنشآت.»",
        testi_c2: "خريجة دورة مساعد رعاية صحية",
        testi_q2: "«كأم عزباء، كان من الصعب العثور على تدريب مناسب. كانت كلية بلو لايت هبة من السماء. لقد ساعدني مستشاري الخاص حتى في تقديم المستندات إلى جوب سنتر. الآن أعمل بسعادة في مجال الرعاية.»",
        testi_c3: "خريج دورة §34a حارس أمن",
        testi_q3: "«خاصة التدريب المكثف قبل الاختبار الشفهي أزال عني الخوف من الامتحانات. كان تغطية التكاليف بنسبة 100% والتوظيف المباشر بعد انتهاء الدورة أمراً ممتازاً. أكاديمية موصى بها بشدة!»",

        // FAQ Section
        faq_tagline: "معلومات هامة وأسئلة شائعة",
        faq_title: "إجابات على <span class=\"text-gradient-navy\">أسئلتكم</span>",
        faq_subtitle: "تعرف على شروط القبول، وكيفية الحصول على قسيمة التعليم، وتفاصيل اختبار غرفة التجارة (IHK).",
        faq_q1: "هل التدريب مجاني لي بنسبة 100% فعلاً؟",
        faq_a1: "نعم، بالتأكيد. بصفتنا مؤسسة تعليمية مرخصة من الدولة، نقوم بتسوية الرسوم مباشرة مع الجهات الحكومية. عند موافقة وكالة العمل أو Jobcenter على قسيمة التعليم، يتم دفع الرسوم بالكامل. ولا تدفع أي رسوم شخصية.",
        faq_q2: "كيف أسير في خطوات الحصول على قسيمة التعليم؟",
        faq_a2: "الخطوات بسيطة جداً. تحجز موعداً مع مستشارك في مكتب العمل. نحن نمنحك مسبقاً كافة الأوراق الرسمية المعتمدة لعرضنا. تقدمها للمستشار، وفور موافقته ترسلها لنا لتسجيلك بالدورة مباشرة.",
        faq_q3: "ما هي المتطلبات الأساسية للبدء in الدورات؟",
        faq_a3: "يجب ألا يقل عمرك عن 18 عاماً، وأن تمتلك سجلاً جنائياً نظيفاً وخالياً من السوابق، وإثبات لغة ألمانية بمستوى A2 كحد أدنى. للعمل في قطاع الأمن §34a، يتطلب الأمر أيضاً شهادة مدرسية معترف بها.",
        faq_q4: "كيف يتم التعليم الإلكتروني عبر جهاز التابلت المجاني؟",
        faq_a4: "عند تسجيلك بالدورة، نرسل لك جهاز تابلت مهيأً ومعداً بالكامل عبر البريد. تستخدم الجهاز يومياً للدخول للمحاضرات المباشرة والمشاركة وطرح الأسئلة بصوتك أو كتابة. ويصبح ملكك بالكامل عند تخرجك.",
        faq_q5: "هل أحصل على عقد عمل مضمون بعد انتهاء الدورة؟",
        faq_a5: "نحن نعمل بتنسيق وثيق مع كبرى شركات الأمن والتمريض في ألمانيا. خلال الدورة، ندرس رغباتك وتفضيلاتك المهنية (مثل أمن المنشآت، الاستقبال، أو الرعاية الصحية) ونجهز ملفات تقديمك للوظائف مباشرة.",

        // Contact Section
        contact_tagline: "الاستشارة المتخصصة",
        contact_title: "تواصل مع <span class=\"text-gradient-gold\">أكاديميتنا</span> الآن",
        contact_text: "خطط لمستقبلك المهني وبداية عملك مع مستشارينا المتخصصين. سنجيب على جميع أسئلتك بخصوص قسيمة التعليم، والمواعيد، ونظام الدراسة في اتصال شخصي ومريح.",
        contact_lbl_sec: "مكتب التسجيل والقبول",
        contact_lbl_mail: "البريد الإلكتروني للطلبات",
        contact_lbl_head: "المقر الرئيسي Schönkirchen",
        contact_val_addr: "Dorfstraße 12, 24232 Schönkirchen",
        contact_lbl_name: "الاسم الكامل",
        contact_lbl_email: "البريد الإلكتروني",
        contact_lbl_phone: "رقم الهاتف",
        contact_lbl_course: "التدريب المهني المرغوب",
        contact_lbl_msg: "رسالتك إلى الإدارة (اختياري)",
        contact_btn_submit: "تحديد موعد مكالمة استشارية مجانية",
        contact_opt_security: "حارس أمن مرخص وفقاً للمادة §34a (IHK)",
        contact_opt_nurse: "مساعد رعاية صحية",
        contact_opt_advice: "استشارة عامة بخصوص تمويل AZAV",
        ph_name: "الاسم واللقب",
        ph_email: "name@example.de",
        ph_phone: "+49 170 1234567",
        ph_msg: "كيف يمكننا مساعدتك؟...",
        ph_calc_name: "الاسم الكامل",
        ph_calc_phone: "رقم الهاتف للتواصل",
        footer_text: "أكاديمية مرخصة من الدولة (AZAV) للتعليم والتدريب المهني المستمر في قطاعات الأمن الخاص والرعاية الصحية.",
        footer_badge_azav: "ترخيص رسمي كجهة تعليمية معتمدة",
        footer_badge_ihk: "معايير وغرفة التجارة IHK",
        footer_title_academy: "الأكاديمية",
        footer_title_courses: "الدورات",
        footer_title_legal: "معلومات قانونية",
        footer_copy: "حقوق النشر &copy; 2026 Blue Light College. جميع الحقوق محفوظة. معتمد ومرخص وفق معايير الجودة.",
        cookie_title: "الخصوصية وحماية البيانات (GDPR)",
        cookie_text: "نحن نستخدم ملفات تعريف الارتباط لمنحك أفضل تجربة تصفح على موقعنا. بعض الملفات ضرورية من الناحية التقنية لعمل الموقع، وبعضها يساعدنا في تحليل حركة التصفح بشكل مجهول الهوية.",
        cookie_lbl_nec: "ملفات ضرورية (نشطة دائماً)",
        cookie_lbl_stats: "الإحصاء والتحليل",
        cookie_btn_all: "قبول الكل",
        cookie_btn_nec: "الملفات الضرورية فقط",
        cookie_btn_cust: "تعديل الاختيارات",
        legal_modal_title: "معلومات قانونية",
        legal_modal_btn_close: "إغلاق",
        wa_status: "الأمانة متصلة – الرد خلال < 5 دقائق 🟢",
        mm_tag: "توجيه سريع",
        mm_title: "مطابق الأكاديمية خلال <span class=\"text-gradient-gold\">60 ثانية</span>",
        mm_subtitle: "اكتشف الدورة التدريبية التي تناسب وضعك الحياتي تماماً وكيفية الحصول على تمويل حكومي بنسبة 100%.",
        mm_q1: "ما هو المجال المهني الذي يثير اهتمامك أكثر؟",
        mm_q1_o1_title: "الأمن والحماية",
        mm_q1_o1_desc: "حماية الأشخاص والممتلكات. دخول آمن وخالٍ من الأزمات إلى قطاع الأمن (§34a GewO).",
        mm_q1_o2_title: "الرعاية والتمريض",
        mm_q1_o2_desc: "مساعدة الناس ورعايتهم. معنى إنساني نبيل وفرص عمل ممتازة كمساعد تمريض.",
        mm_q2: "ما هو وضعك المهني الحالي؟",
        mm_q2_o1: "عاطل عن العمل / باحث عن عمل (ALG I أو Bürgergeld)",
        mm_q2_o2: "موظف / أبحث عن تغيير مهني",
        mm_q2_o3: "خريج مدرسة / أبحث عن تدريب مهني",
        mm_q2_o4: "آخر / عمل خاص",
        mm_q3: "ما هو الشيء الأكثر أهمية بالنسبة لك خلال تدريبك؟",
        mm_q3_o1: "مجاني 100% (عبر قسيمة التعليم)",
        mm_q3_o2: "المرونة (دروس مباشرة عبر الإنترنت وخيار دوام جزئي)",
        mm_q3_o3: "دخول سريع إلى سوق العمل وضمان التوظيف",
        mm_submit_btn: "طلب تأمين مقعد تدريبي مجاني",
        calc_card_title: "حاسبة وفورات التمويل الحكومي",
        calc_slider_label: "مدة التدريب المطلوبة:",
        calc_toggle_label: "طريقة التمويل:",
        calc_toggle_voucher: "قسيمة التعليم",
        calc_toggle_self: "الدفع الذاتي",
        calc_res_fees: "رسوم الدورة التدريبية:",
        calc_res_tablet: "جهاز لوحي للدراسة (يصبح ملكك):",
        calc_res_tablet_val: "مضمّن (بقيمة 400 يورو)",
        calc_res_materials: "المواد الدراسية ورسوم اختبار IHK:",
        calc_res_travel: "بدل العمل المنزلي والإنترنت:",
        calc_res_covered: "مغطى بنسبة 100%",
        calc_res_total: "صافي استثمارك المالي:",
        calc_btn_submit: "طلب استشارة تعليمية مجانية",
        quiz_pass_status: "لقد نجحت في الاختبار! (مطلوب 50% على الأقل)",
        quiz_fail_status: "لم تنجح في الاختبار. (مطلوب 50%)",
        faq_search_placeholder: "البحث في الأسئلة...",
        map_tagline: "نجاح الخريجين الإقليمي",
        map_title: "شركاء أقوياء في <span class=\"text-gradient-gold\">منطقتك</span>",
        map_subtitle: "اكتشف شركاء التعاون لدينا وأعداد التوظيف المرتفعة للخريجين بالقرب منك.",
        map_graduates: "الخريجين الذين تم توظيفهم",
        map_region_east: "برلين وبراندنبورغ",
        map_region_north: "هامبورغ وشليسفيغ هولشتاين",
        map_region_west: "شمال الراين-وستفاليا",
        map_region_center: "هسن وراينلاند بفالتس",
        map_region_south: "بافاريا وبادن فورتمبيرغ",
        map_info_default_title: "شبكة التعاون الوطنية",
        map_info_default_desc: "انقر فوق أحد المراكز الإقليمية على الخريطة لعرض معلومات مفصلة عن الشركاء والتوظيف المحلي.",
        map_stat_placements_lbl: "إجمالي عمليات التوظيف",
        map_stat_partners_lbl: "الشركات الشريكة",
        advisor_name: "ميلاني شميت",
        advisor_title: "رئيسة قسم الاستشارات الأكاديمية",
        advisor_online: "متصلة - متاحة الآن",
        advisor_offline: "غير متصلة - ساعات العمل: الاثنين-الجمعة 10-18",
        wa_status_offline: "الأمانة غير متصلة – ساعات العمل: الاثنين-الجمعة 10:00-18:00 🔴"
    },
    ru: {
        // Navigation & Buttons
        nav_courses: "Обучение",
        nav_calc: "Госфинансирование",
        nav_quiz: "Тест IHK",
        nav_perks: "Преимущества",
        nav_faq: "Вопросы",
        nav_cta: "Записаться",
        wa_badge: "Консультация WhatsApp",
        
        // Hero Section
        hero_badge_azav: "Сертифицированная академия AZAV",
        hero_badge_cost: "100% бесплатное обучение",
        hero_title: "Сертифицированное обучение в сфере <span class=\"text-gradient-navy\">безопасности и ухода</span>",
        hero_description: "Начните карьеру в качестве сертифицированного охранника (§34a) или квалифицированного помощника по уходу. Курсы полностью финансируются Агентством по труду и Jobcenter – бесплатный планшет и гарантия работы.",
        hero_btn_calc: "Проверить финансирование",
        hero_btn_courses: "Посмотреть курсы",
        hero_trust_quota_lbl: "Сдают экзамен",
        hero_trust_certified_lbl: "Сертифицировано",
        hero_trust_free_lbl: "Бесплатно",
        hero_campus_title: "Blue Light College",
        hero_campus_subtitle: "Академический учебный центр",
        
        // Stats Section
        stats_duration_title: "Срок обучения",
        stats_duration_val: "50 дней",
        stats_duration_text: "Быстрое и высокоэффективное профессиональное обучение. Получите диплом государственного образца всего за 50 дней.",
        stats_format_title: "Формат занятий",
        stats_format_val: "Онлайн-вебинары",
        stats_format_text: "Гибкое обучение, не выходя из дома. Живое взаимодействие с преподавателями на полный или неполный день – легко подстраивается.",
        stats_placement_title: "Трудоустройство",
        stats_placement_val: "Гарантия",
        stats_placement_text: "После успешного завершения мы напрямую трудоустраиваем вас в ведущие охранные и медицинские компании-партнеры.",
        stats_equip_title: "Оснащение",
        stats_equip_val: "Включено",
        stats_equip_text: "Мы бесплатно предоставляем вам планшет превосходного качества на период учебы. После окончания он остается у вас.",
        
        // Courses Section
        courses_tagline: "АКАДЕМИЧЕСКИЙ КАТАЛОГ КУРСОВ",
        courses_title: "Сертифицированное <span class=\"text-gradient-navy\">обучение</span>",
        courses_subtitle: "Выберите вашу специализацию. Все предложения соответствуют строгим критериям качества AZAV Федерального агентства по труду.",
        tab_btn_security: "§34a Охранник",
        tab_btn_nurse: "Помощник по уходу",
        course_badge_priority: "НАИВЫСШИЙ ПРИОРИТЕТ",
        course_badge_demand: "ВЫСОКИЙ СПРОС",
        course_title_security: "Сертифицированный охранник в соответствии с §34a (IHK)",
        course_desc_security: "Минимальное юридическое требование для работы в частной охране. Этот курс системно готовит вас к письменному и устному экзамену в Торгово-промышленной палате (IHK).",
        course_req_title: "Требования к кандидатам:",
        course_req_age: "Минимальный возраст 18 лет",
        course_req_record: "Справка об отсутствии судимости",
        course_req_lang: "Знание немецкого языка на уровне не ниже A2",
        course_req_school: "Признанный школьный аттестат",
        course_meta_duration_lbl: "Срок обучения",
        course_meta_format_lbl: "Формат занятий",
        course_meta_format_val: "Онлайн-вебинары (полный / неполный день)",
        course_meta_format_hybrid: "Гибридный (вебинары + практика)",
        course_btn_advice: "Запросить бесплатную консультацию",
        course_btn_quiz: "Проверить знания IHK &rarr;",
        syllabus_title_security: "Программа подготовки к экзамену IHK:",
        syllabus_title_nurse: "Основные учебные модули:",
        syllabus_s1: "Законодательство об общественной безопасности и порядке",
        syllabus_s2: "Промышленное право и правила защиты данных",
        syllabus_s3: "Гражданский кодекс (BGB) - право на самооборону",
        syllabus_s4: "Уголовное право и уголовное судопроизводство",
        syllabus_s5: "Правила техники безопасности (UVV)",
        syllabus_s6: "Поведенческая психология и навыки деэскалации",
        course_title_nurse: "Помощник по уходу",
        course_desc_nurse: "Начните карьеру в одной из самых стабильных сфер. Вы освоите теоретические и практические основы профессионального ухода за пожилыми и больными людьми.",
        syllabus_n1: "Основы медицинского обслуживания и базовый уход",
        syllabus_n2: "Коммуникация и уважительное отношение к пациентам",
        syllabus_n3: "Чрезвычайные ситуации и первая помощь в медицине",
        syllabus_n4: "Гигиенические нормы и защита от инфекций",
        syllabus_n5: "Юридические основы (страхование ухода, права пациентов)",
        syllabus_n6: "Практическая работа и разбор реальных ситуаций",
        
        // Eligibility Check Section
        calc_tag: "ГОСУДАРСТВЕННОЕ ФИНАНСИРОВАНИЕ",
        calc_title: "Узнайте свое право на <span class=\"text-gradient-gold\">100% оплату обучения</span>",
        calc_text: "Благодаря образовательному ваучеру от Федерального агентства по труду или Jobcenter все расходы полностью покрываются государством. Ответьте на 3 вопроса.",
        calc_trust_azav: "Акадмия сертифицирована по стандартам качества AZAV",
        calc_trust_docs: "Официальные документы для вашего инспектора в Агентстве",
        wizard_q1: "Каков ваш текущий статус занятости?",
        wizard_opt_q1_o1: "Ищу работу / Безработный (получаю ALG I или Bürgergeld)",
        wizard_opt_q1_o2: "Работаю (и ищу новую карьеру)",
        wizard_opt_q1_o3: "Самозанятый / Другое / Ищу место обучения",
        wizard_q2: "Вы уже проходили консультацию по поводу финансирования?",
        wizard_opt_q2_o1: "Да, я уже общаюсь с Агентством / Jobcenter",
        wizard_opt_q2_o2: "Нет, мне нужна помощь в подготовке к беседе",
        wizard_opt_q2_o3: "Я хочу сначала получить общую информацию о процессе",
        wizard_res_title: "Отличные перспективы",
        wizard_res_text: "Ваши ответы указывают на **полное право на финансирование**. Оставьте контакты. Наш консультант обсудит с вами подачу заявления и подготовит документы для Jobcenter.",
        calc_btn_submit: "Получить бесплатную консультацию",
        
        // Quiz Section
        quiz_tagline: "ПРОВЕРИТЬ ЗНАНИЯ ЗАРАНЕЕ",
        quiz_title: "Пробный тест <span class=\"text-gradient-navy\">на экзамен IHK</span>",
        quiz_subtitle: "Проверьте свои базовые знания с помощью 3 реальных вопросов экзамена IHK в соответствии с §34a GewO.",
        quiz_question: "Вопрос",
        quiz_of: "из",
        quiz_select_opt: "Выберите один вариант ответа.",
        quiz_next_question: "Следующий вопрос →",
        quiz_show_results: "Показать результат",
        quiz_res_perf: "Отлично! Вы уже обладаете прекрасным пониманием законодательства.",
        quiz_res_good: "Очень хорошо! У вас есть твердые базовые знания охранного права.",
        quiz_res_bad: "Не волнуйтесь! Охранное право сложное. Именно для этого мы здесь.",
        quiz_res_title: "Тест завершен!",
        quiz_res_body: "Благодаря профессиональной подготовке наши выпускники достигают 98% успешности на экзаменах IHK. Используйте свой шанс.",
        quiz_res_btn_cta: "Записаться на консультацию",
        quiz_res_btn_repeat: "Пройти тест заново",
        
        // Questions
        q1: "Какими полномочиями обладает частный охранник в общественных местах?",
        q1_o1: "Правом на временное задержание при поимке на месте преступления (§ 127 StPO)",
        q1_o2: "Правом устанавливать личность по поручению полиции",
        q1_o3: "Правом проводить обыск подозрительных лиц без их согласия",
        q1_o4: "Правом перекрывать общественные дороги в случае опасности",
        q1_exp: "В качестве охранника в общественных местах вы имеете те же права, что и любой другой гражданин. § 127 StPO разрешает любому задержать лицо на месте преступления при подозрении на побег.",
        q2: "Когда может применяться необходимая оборона (§ 227 BGB / § 32 StGB)?",
        q2_o1: "Против любого будущего предполагаемого нападения",
        q2_o2: "Против текущего, противоправного нападения на защищаемое благо",
        q2_o3: "В качестве наказания после того, как нападавший скрылся",
        q2_o4: "Только для отражения опасных для жизни нападений",
        q2_exp: "Необходимая оборона – это защита, требуемая для отражения текущего противоправного нападения на себя или других. Распространяется на все блага (жизнь, тело, собственность, честь).",
        q3: "Кто принимает официальный экзамен в соответствии с §34a GewO?",
        q3_o1: "Местный участок полиции",
        q3_o2: "Соответствующее ведомство по делам предпринимательства",
        q3_o3: "Торгово-промышленная палата (IHK)",
        q3_o4: "Непосредственно учебное заведение самостоятельно",
        q3_exp: "Экзамен регулируется государством и принимается исключительно Торгово-промышленной палатой (IHK). Мы интенсивно и целенаправленно готовим вас к нему.",

        // Perks Section
        perks_tagline: "НАШИ ГАРАНТИИ КАЧЕСТВА",
        perks_title: "Почему именно <span class=\"text-gradient-navy\">Blue Light College?</span>",
        perks_subtitle: "Мы ориентируемся на высокое качество обучения, современное оснащение и реальные перспективы.",
        perk_c1_lbl: "ГАРАНТТИЯ НА ОБОРУДОВАНИЕ",
        perk_c1_title: "Бесплатный учебный планшет",
        perk_c1_text: "Для удобства онлайн-занятий мы бесплатно выдаем вам планшет превосходного качества. После успешного завершения учебы устройство переходит в вашу собственность без доплат.",
        perk_c2_lbl: "МЕТОДИКА ОБУЧЕНИЯ",
        perk_c2_title: "Интерактивные онлайн-уроки",
        perk_c2_text: "Никакого скучного самостоятельного зазубривания. Вы ежедневно участвуете в живых вебинарах. Опытные преподаватели подробно и просто объясняют сложные законы.",
        perk_c3_lbl: "КАРЬЕРНЫЙ СТАРТ",
        perk_c3_title: "Гарантированное трудоустройство",
        perk_c3_text: "Благодаря тесному партнерству с лидерами рынка охраны и медицины Германии, мы трудоустраиваем вас на постоянную работу сразу после сдачи экзамена IHK.",
        perk_c4_lbl: "ПОДГОТОВКА К ЭКЗАМЕНУ",
        perk_c4_title: "Тренинг устного экзамена",
        perk_c4_text: "Устный экзамен считается самым трудным. Мы полностью снимем страх: на индивидуальных занятиях мы отрабатываем ситуации до вашей полной уверенности.",
        perk_c5_lbl: "ПОМОЩЬ С ДОКУМЕНТАМИ",
        perk_c5_title: "Сопровождение в ведомствах",
        perk_c5_text: "Не бойтесь бюрократии: наши консультанты подготовят вас к беседе с инспектором и вместе с вами загрузят все необходимые заявления для Jobcenter.",
        perk_c6_lbl: "ФИНАНСИРОВАНИЕ",
        perk_c6_title: "100% бесплатное участие",
        perk_c6_text: "Благодаря AZAV-сертификации Blue Light College все расходы на учебу, материалы и экзамены покрываются вашим образовательным ваучером. Личных расходов нет.",

        // Testimonials
        testi_tagline: "ИСТОРИИ УСПЕХА НАШИХ ВЫПУСКНИКОВ",
        testi_title: "Что говорят наши <span class=\"text-gradient-navy\">студенты</span>",
        testi_subtitle: "Узнайте из первых уст, как наше практическое обучение помогло начать новую надежную карьеру.",
        testi_c1: "Выпускник §34a Охранник",
        testi_q1: "«Благодаря бесплатному планшету я мог гибко учиться по вечерам. Преподаватели на онлайн-занятиях подготовили меня идеально. Я сдал экзамен IHK с первого раза! Теперь работаю в охране объектов.»",
        testi_c2: "Выпускница Помощник по уходу",
        testi_q2: "«Как маме-одиночке, мне было трудно найти курсы. Колледж стал для меня спасением. Мой консультант помог мне собрать документы для Jobcenter. Теперь я счастлива работать в сфере ухода.»",
        testi_c3: "Выпускник §34a Охранник",
        testi_q3: "«Особенно индивидуальная подготовка к устному экзамену избавила меня от страха. Полная оплата 100% расходов государством и трудоустройство сразу после курсов были идеальны. Рекомендую!»",

        // FAQ Section
        faq_tagline: "ПОЛЕЗНАЯ ИНФОРМАЦИЯ И ВОПРОСЫ",
        faq_title: "Ответы на ваши <span class=\"text-gradient-navy\">вопросы</span>",
        faq_subtitle: "Узнайте больше о требованиях к поступлению, получении ваучеров и процедуре экзамена IHK.",
        faq_q1: "Действительно ли обучение на 100% бесплатно для меня?",
        faq_a1: "Да, абсолютно. Мы рассчитываемся напрямую с государственными органами. Если ваш инспектор в Jobcenter одобрит ваучер, то абсолютно все курсы, материалы и экзамены оплачиваются государством.",
        faq_q2: "Как проходит процесс подачи заявления на образовательный ваучер?",
        faq_a2: "Процесс прост. Вы записываетесь к инспектору в Агентство по труду. Мы заранее выдаем вам официальные документы с нашим предложением. Вы передаете их инспектору, а после одобрения высылаете ваучер нам.",
        faq_q3: "Какие требования установлены для начала учебы?",
        faq_a3: "Вам должно быть не менее 18 лет, необходима справка об отсутствии судимости и знание немецкого языка минимум на уровне А2. Для охраны §34a также нужен признанный школьный аттестат.",
        faq_q4: "Как проходит обучение с помощью бесплатного планшета?",
        faq_a4: "После записи на курс мы отправляем вам по почте настроенный планшет. С него вы ежедневно заходите на живые занятия, участвуете в обсуждениях и задаете вопросы голосом или текстом.",
        faq_q5: "Получу ли я гарантию работы после экзамена?",
        faq_a5: "Мы тесно сотрудничаем с ведущими охранными и медицинскими компаниями Германии. Во время учебы мы учитываем ваши пожелания и готовим резюме. Из-за высокого дефицита кадров работа гарантирована.",

        // Contact Section
        contact_tagline: "КОНСУЛЬТАЦИЯ ЭКСПЕРТА",
        contact_title: "Свяжитесь с нашей <span class=\"text-gradient-gold\">академией</span>",
        contact_text: "Спланируйте новую карьеру вместе с нашими экспертами. Мы обсудим все вопросы касательно финансирования, ваучеров и расписания в личной и комфортной беседе.",
        contact_lbl_sec: "Учебная канцелярия",
        contact_lbl_mail: "Почта для запросов",
        contact_lbl_head: "Головной офис Schönkirchen",
        contact_val_addr: "Dorfstraße 12, 24232 Schönkirchen",
        contact_lbl_name: "Ваше имя и фамилия",
        contact_lbl_email: "Адрес эл. почты",
        contact_lbl_phone: "Номер телефона",
        contact_lbl_course: "Желаемый курс обучения",
        contact_lbl_msg: "Ваше сообщение (необязательно)",
        contact_btn_submit: "Согласовать бесплатную консультацию",
        contact_opt_security: "Сертифицированный охранник в соответствии с §34a (IHK)",
        contact_opt_nurse: "Помощник по уходу",
        contact_opt_advice: "Общая консультация по финансированию AZAV",
        ph_name: "Имя Фамилия",
        ph_email: "name@example.de",
        ph_phone: "+49 170 1234567",
        ph_msg: "Чем мы можем вам помочь?...",
        ph_calc_name: "Полное имя",
        ph_calc_phone: "Номер телефона для связи",
        footer_text: "Сертифицированная AZAV академия для подготовки и повышения квалификации в сфере частной охраны и ухода за пожилыми людьми.",
        footer_badge_azav: "ОФИЦИАЛЬНАЯ ЛИЦЕНЗИЯ AZAV",
        footer_badge_ihk: "СТАНДАРТЫ IHK",
        footer_title_academy: "Академия",
        footer_title_courses: "Курсы",
        footer_title_legal: "Правовая информация",
        footer_copy: "&copy; 2026 Blue Light College. Все права защищены. Аккредитовано по нормам AZAV.",
        cookie_title: "Конфиденциальность и защита данных (GDPR)",
        cookie_text: "Мы используем файлы cookie, чтобы обеспечить лучший опыт на нашем сайте. Некоторые файлы технически необходимы для работы сайта, а другие помогают нам анонимно анализировать трафик.",
        cookie_lbl_nec: "Необходимые (всегда активны)",
        cookie_lbl_stats: "Статистика и аналитика",
        cookie_btn_all: "Принять все",
        cookie_btn_nec: "Только необходимые",
        cookie_btn_cust: "Настроить выбор",
        legal_modal_title: "Правовая информация",
        legal_modal_btn_close: "Закрыть",
        wa_status: "Секретариат на связи – Ответ в течение < 5 мин 🟢",
        mm_tag: "БЫСТРЫЙ ВЫБОР ПО НАПРАВЛЕНИЮ",
        mm_title: "60-Секундный <span class=\"text-gradient-gold\">Академический Подборщик</span>",
        mm_subtitle: "Узнайте, какой курс идеально подходит вашей жизненной ситуации и как получить 100% госфинансирование.",
        mm_q1: "Какая профессиональная сфера вас больше всего интересует?",
        mm_q1_o1_title: "Безопасность и Охрана",
        mm_q1_o1_desc: "Защита людей и объектов. Стабильный и перспективный старт в охранной сфере (§34a GewO).",
        mm_q1_o2_title: "Уход и Забота",
        mm_q1_o2_desc: "Помощь людям и уход за ними. Высокая социальная значимость и карьерный рост в качестве помощника по уходу.",
        mm_q2: "Какова ваша текущая занятость?",
        mm_q2_o1: "Безработный / Ищу работу (ALG I или Bürgergeld)",
        mm_q2_o2: "Работаю / Ищу новую сферу деятельности",
        mm_q2_o3: "Выпускник школы / Ищу место обучения",
        mm_q2_o4: "Другое / Самозанятый",
        mm_q3: "Что для вас важнее всего при обучении?",
        mm_q3_o1: "100% бесплатно (через образовательный ваучер)",
        mm_q3_o2: "Гибкость (онлайн-трансляции и неполный день)",
        mm_q3_o3: "Быстрый старт карьеры и гарантия работы",
        mm_submit_btn: "Запросить бронирование учебного места",
        calc_card_title: "Калькулятор государственной субсидии",
        calc_slider_label: "Желаемая длительность обучения:",
        calc_toggle_label: "Способ оплаты:",
        calc_toggle_voucher: "Учебный ваучер",
        calc_toggle_self: "Самооплата",
        calc_res_fees: "Плата за обучение:",
        calc_res_tablet: "Учебный планшет (в вашу собственность):",
        calc_res_tablet_val: "Включено (стоимость €400)",
        calc_res_materials: "Учебные материалы и сборы IHK:",
        calc_res_travel: "Субсидия на домашний офис и интернет:",
        calc_res_covered: "100% Покрыто",
        calc_res_total: "Ваши чистые инвестиции:",
        calc_btn_submit: "Запросить бесплатную консультацию",
        quiz_pass_status: "Экзамен сдан! (Требуется мин. 50%)",
        quiz_fail_status: "Экзамен не сдан. (Требуется 50%)",
        faq_search_placeholder: "Поиск вопросов...",
        map_tagline: "РЕГИОНАЛЬНЫЙ УСПЕХ ВЫПУСКНИКОВ",
        map_title: "Сильные партнеры в вашем <span class=\"text-gradient-gold\">Регионе</span>",
        map_subtitle: "Познакомьтесь с нашими партнерами по сотрудничеству и высокими показателями трудоустройства рядом с вами.",
        map_graduates: "Выпускников трудоустроено",
        map_region_east: "Берлин и Бранденбург",
        map_region_north: "Гамбург и Шлезвиг-Гольштейн",
        map_region_west: "Северный Рейн-Вестфалия",
        map_region_center: "Гессен и Рейнланд-Пфальц",
        map_region_south: "Бавария и Баден-Вюртемберг",
        map_info_default_title: "Национальная партнерская сеть",
        map_info_default_desc: "Нажмите на региональный центр на карте, чтобы увидеть подробную информацию о партнерах и трудоустройстве.",
        map_stat_placements_lbl: "Всего трудоустройств",
        map_stat_partners_lbl: "Компаний-партнеров",
        advisor_name: "Мелани Шмидт",
        advisor_title: "Руководительница отдела консультаций",
        advisor_online: "В сети - Доступна сейчас",
        advisor_offline: "Оффлайн - Рабочие часы: Пн-Пт 10-18",
        wa_status_offline: "Секретариат оффлайн – Рабочие часы: Пн-Пт 10:00-18:00 🔴"
    },
    fa: {
        // Navigation & Buttons
        nav_courses: "دوره‌های آموزشی",
        nav_calc: "بررسی حمایت مالی",
        nav_quiz: "آزمون آزمایشی IHK",
        nav_perks: "مزایا",
        nav_faq: "سوالات متداول",
        nav_cta: "رزرو مشاوره",
        wa_badge: "مشاوره واتس‌اپ",
        
        // Hero Section
        hero_badge_azav: "آکادمی تخصصی دارای تاییدیه AZAV",
        hero_badge_cost: "آموزش ۱۰۰٪ رایگان و دولتی",
        hero_title: "دوره‌های آموزشی معتبر در زمینه <span class=\"text-gradient-navy\">امنیت و مراقبت (پرستاری)</span>",
        hero_description: "شغل خود را به عنوان نیروی امنیتی رسمی طبق ماده §34a یا به عنوان کمک پرستار واجد شرایط شروع کنید. هزینه دوره ۱۰۰٪ توسط اداره کار (Jobcenter) پرداخت می‌شود – همراه با تبلت رایگان امانتی و ضمانت استخدام.",
        hero_btn_calc: "بررسی شرایط حمایت مالی",
        hero_btn_courses: "مشاهده دوره‌ها",
        hero_trust_quota_lbl: "نرخ قبولی آزمون",
        hero_trust_certified_lbl: "دارای مجوز رسمی",
        hero_trust_free_lbl: "۱۰۰٪ رایگان",
        hero_campus_title: "Blue Light College",
        hero_campus_subtitle: "آموزشگاه علمی و آکادمیک",
        
        // Stats Section
        stats_duration_title: "طول دوره",
        stats_duration_val: "۵۰ روز",
        stats_duration_text: "آموزش تخصصی سریع و بسیار کارآمد. در مدت فقط ۵۰ روز مدرک حرفه‌ای معتبر خود را دریافت کنید.",
        stats_format_title: "شیوه آموزش",
        stats_format_val: "آنلاین زنده",
        stats_format_text: "آموزش منعطف از راحتی خانه شما. تعامل زنده با استادان به صورت تمام‌وقت یا پاره‌وقت – کاملاً سازگار با شرایط شما.",
        stats_placement_title: "معرفی به کار",
        stats_placement_val: "تضمینی",
        stats_placement_text: "ما شما را بلافاصله پس از پایان موفقیت‌آمیز دوره به شرکت‌های همکار معتبر در بخش امنیت و مراقبت معرفی می‌کنیم.",
        stats_equip_title: "تجهیزات",
        stats_equip_val: "شامل دوره",
        stats_equip_text: "ما یک تبلت باکیفیت بالا را به صورت کاملاً رایگان برای کل مدت دوره در اختیار شما قرار می‌دهیم. پس از پایان، تبلت متعلق به خودتان است.",
        
        // Courses Section
        courses_tagline: "کاتالوگ دوره‌های آکادمیک",
        courses_title: "دوره‌های آموزشی <span class=\"text-gradient-navy\">دارای مدرک معتبر</span>",
        courses_subtitle: "تخصص خود را انتخاب کنید. کلیه دوره‌ها معیارهای سخت‌گیرانه کیفیت اداره کار آلمان (AZAV) را برآورده می‌کنند.",
        tab_btn_security: "§34a نیروی امنیتی رسمی",
        tab_btn_nurse: "کمک پرستار",
        course_badge_priority: "اولویت بسیار بالا",
        course_badge_demand: "تقاضای بازار کار بالا",
        course_title_security: "نیروی امنیتی مجاز و معتبر طبق ماده §34a (IHK)",
        course_desc_security: "حداقل پیش‌نیاز قانونی برای فعالیت‌های حرفه‌ای در صنعت امنیت خصوصی. این دوره جامع شما را به صورت سیستماتیک برای آزمون کتبی و شفاهی در اتاق بازرگانی و صنایع آلمان (IHK) آماده می‌کند.",
        course_req_title: "شرایط ثبت‌نام در دوره:",
        course_req_age: "حداقل سن ۱۸ سال تمام",
        course_req_record: "گواهی عدم سوء‌پیشینه کیفری",
        course_req_lang: "دانش زبان آلمانی در سطح حداقل A2",
        course_req_school: "مدرک تحصیلی معتبر",
        course_meta_duration_lbl: "طول استاندارد دوره",
        course_meta_format_lbl: "شیوه برگزاری کلاس",
        course_meta_format_val: "آنلاین زنده (تمام‌وقت / پاره‌وقت)",
        course_meta_format_hybrid: "ترکیبی (آنلاین زنده + کار عملی)",
        course_btn_advice: "درخواست مشاوره رایگان",
        course_btn_quiz: "تست آنلاین اطلاعات IHK &rarr;",
        syllabus_title_security: "سرفصل‌های آموزشی مربوط به آزمون:",
        syllabus_title_nurse: "واحدهای درسی اصلی:",
        syllabus_s1: "قانون امنیت عمومی و نظم در آلمان",
        syllabus_s2: "قانون تجارت و مقررات حفاظت از داده‌ها",
        syllabus_s3: "قانون مدنی آلمان (BGB) - حق دفاع مشروع",
        syllabus_s4: "قانون جزا و آیین دادرسی کیفری",
        syllabus_s5: "مقررات پیشگیری از حوادث کاری (UVV)",
        syllabus_s6: "رفتارشناسی و مهارت‌های کاهش تنش و مدیریت بحران",
        course_title_nurse: "کمک پرستار",
        course_desc_nurse: "شغل خود را در یکی از امن‌ترین و رضایت‌بخش‌ترین زمینه‌های کاری آغاز کنید. اصول نظری و عملی مراقبت حرفه‌ای، مراقبت‌های درمانی و کمک به افراد نیازمند را یاد خواهید گرفت.",
        syllabus_n1: "اصول مراقبت درمانی و مراقبت‌های پایه تمریضی",
        syllabus_n2: "ارتباط موثر و برخورد محترمانه با بیماران",
        syllabus_n3: "موقعیت‌های اضطراری و کمک‌های اولیه در پرستاری",
        syllabus_n4: "مقررات بهداشت و کنترل عفونت",
        syllabus_n5: "اصول قانونی (قوانین بیمه درمانی و حقوق بیمار)",
        syllabus_n6: "کاربرد عملی و شبیه‌سازی موارد واقعی",
        
        // Eligibility Check Section
        calc_tag: "حمایت مالی دولتی آلمان",
        calc_title: "شرایط خود را برای <span class=\"text-gradient-gold\">پرداخت ۱۰۰٪ هزینه‌ها</span> بررسی کنید",
        calc_text: "با بن خرید آموزشی (Bildungsgutschein) از اداره کار، تمام هزینه‌های دوره، کتاب‌ها و آزمون‌ها توسط دولت پرداخت می‌شود. به ۳ سوال کوتاه پاسخ دهید.",
        calc_trust_azav: "آکادمی دارای مجوز رسمی طبق استانداردهای کیفی دولتی آلمان",
        calc_trust_docs: "ارائه مدارک و تاییدیه رسمی مستقیم به مشاور شما در اداره کار",
        wizard_q1: "وضعیت شغلی فعلی شما چگونه است؟",
        wizard_opt_q1_o1: "جویای کار / بیکار (دریافت‌کننده معونه Bürgergeld یا ALG I)",
        wizard_opt_q1_o2: "شاغل (و جویای تغییر و ارتقای جهت حرفه‌ای خود)",
        wizard_opt_q1_o3: "شغل آزاد / سایر موارد / جویای محل کارآموزی رسمی",
        wizard_q2: "آیا قبلاً جلسه مشاوره‌ای در مورد دریافت حمایت مالی داشته‌اید؟",
        wizard_opt_q2_o1: "بله، من در حال حاضر با اداره کار در ارتباط هستم",
        wizard_opt_q2_o2: "خیر، به پشتیبانی و راهنمایی برای آماده‌سازی نیاز دارم",
        wizard_opt_q2_o3: "مایل هستم ابتدا اطلاعات کلی در مورد مراحل به دست آورم",
        wizard_res_title: "چشم‌انداز فوق‌العاده عالی",
        wizard_res_text: "پاسخ‌های شما نشان‌دهنده **صلاحیت کامل برای دریافت حمایت مالی دولتی** است. اطلاعات تماس خود را بفرستید. مشاور ما مراحل ثبت درخواست و مدارک را با شما هماهنگ خواهد کرد.",
        calc_btn_submit: "درخواست مشاوره رایگان دوره آموزشی",
        
        // Quiz Section
        quiz_tagline: "تست آنلاین و پیش‌فرض اطلاعات شما",
        quiz_title: "آزمون آزمایشی <span class=\"text-gradient-navy\">امتحان رسمی IHK</span>",
        quiz_subtitle: "اطلاعات پایه خود را با ۳ سوال واقعی از آزمون‌های IHK طبق ماده §34a GewO تست کنید.",
        quiz_question: "سوال",
        quiz_of: "از",
        quiz_select_opt: "لطفاً یکی از گزینه‌ها را برای پاسخ انتخاب کنید.",
        quiz_next_question: "سوال بعدی →",
        quiz_show_results: "مشاهده نتایج آزمون",
        quiz_res_perf: "فوق‌العاده عالی! شما از قبل درک حقوقی بسیار خوبی دارید.",
        quiz_res_good: "بسیار خوب! اطلاعات پایه خوبی در مورد قوانین حفاظتی دارید.",
        quiz_res_bad: "نگران نباشید! قوانین امنیتی و حفاظتی پیچیده است. ما دقیقاً برای همین اینجا هستیم.",
        quiz_res_title: "آزمون به پایان رسید!",
        quiz_res_body: "به لطف دوره آمادگی متمایز ما، فارغ‌التحصیلان ما به نرخ قبولی ۹۸٪ در آزمون‌های اتاق بازرگانی (IHK) دست می‌یابند. از فرصت خود استفاده کنید.",
        quiz_res_btn_cta: "رزرو مشاوره رایگان",
        quiz_res_btn_repeat: "تکرار مجدد آزمون",
        
        // Questions
        q1: "یک نیروی امنیتی خصوصی در محیط‌های عمومی چه اختیارات قانونی دارد؟",
        q1_o1: "حق بازداشت موقت متهم در صورت مشاهده در حین ارتکاب جرم (§ 127 StPO)",
        q1_o2: "حق احراز هویت افراد به دستور رسمی پلیس",
        q1_o3: "حق تفتیش بدنی افراد مشکوک بدون رضایت آنها",
        q1_o4: "حق بستن راه‌های عمومی در صورت احساس خطر جدی",
        q1_exp: "به عنوان یک نیروی امنیتی، در محیط‌های عمومی از همان حقوق شهروندان عادی برخوردار هستید (حقوق همگانی). ماده ۱۲۷ قانون آیین دادرسی کیفری به هر کسی اجازه می‌دهد در صورت مشاهده جرم مشهود و ترس از فرار متهم، او را موقتاً بازداشت کند.",
        q2: "چه زمانی فرد مجاز به استفاده از حق دفاع مشروع (§ 227 BGB / § 32 StGB) است؟",
        q2_o1: "در برابر هرگونه حمله احتمالی یا پیش‌بینی شده در آینده",
        q2_o2: "در برابر حمله فعلی و غیرقانونی که جان، مال یا حقوق قانونی فرد یا دیگری را تهدید کند",
        q2_o3: "به عنوان مجازات مهاجم پس از فرار او از صحنه",
        q2_o4: "فقط برای دفع حملاتی که تهدید مستقیم برای زندگی ایجاد می‌کنند",
        q2_exp: "دفاع مشروع، دفاع لازمی است که برای دفع حمله فعلی و غیرقانونی به خود یا دیگری صورت می‌گیرد. این قانون شامل حفاظت از کلیه حقوق قانونی (مانند جان، مال، شرف) می‌شود.",
        q3: "چه مرجع رسمی آزمون §34a GewO را برگزار کرده و مدرک آن را صادر می‌کند؟",
        q3_o1: "اداره پلیس محلی منطقه",
        q3_o2: "دفتر ثبت فعالیت‌های تجاری و شهرداری",
        q3_o3: "اتاق بازرگانی و صنایع آلمان (IHK)",
        q3_o4: "موسسه آموزشی خصوصی برگزارکننده دوره",
        q3_exp: "این آزمون توسط دولت تنظیم شده و نظارت بر آن منحصراً بر عهده اتاق بازرگانی (IHK) است. ما شما را به صورت فشرده و حرفه‌ای برای قبولی در آن آماده می‌کنیم.",

        // Perks Section
        perks_tagline: "تضمین‌های کیفیت و اعتبار ما",
        perks_title: "چرا <span class=\"text-gradient-navy\">کلية بلو لايت؟</span>",
        perks_subtitle: "ما بر ارائه بالاترین سطوح کیفیت آموزشی معتبر، مدرن‌ترین تجهیزات کمکی و تضمین استخدام تمرکز داریم.",
        perk_c1_lbl: "تضمین تجهیزات آموزشی",
        perk_c1_title: "تبلت کاملاً رایگان امانتی",
        perk_c1_text: "برای تضمین برگزاری کلاس‌های آنلاین شما بدون مشکل، ما یک تبلت باکیفیت بالا را در اختیارتان قرار می‌دهیم. پس از پایان موفقیت‌آمیز دوره، این دستگاه بدون هیچ هزینه اضافی متعلق به خودتان می‌شود.",
        perk_c2_lbl: "شیوه نوین تدریس علمی",
        perk_c2_title: "کلاس‌های تعاملی مستقیم و زنده",
        perk_c2_text: "هیچ مطالعه نظری خسته‌کننده‌ای فقط از روی کتاب وجود ندارد. شما روزانه در وبینارهای تعاملی زنده در کلاس‌های مجازی ما شرکت خواهید کرد و مسائل دشوار حقوقی به صورت ساده آموزش داده می‌شود.",
        perk_c3_lbl: "فرصت‌های حمایت شغلی",
        perk_c3_title: "ضمانت معرفی مستقیم به کار",
        perk_c3_text: "به لطف همکاری‌های نزدیک و استراتژیک ما با شرکت‌های بزرگ امنیتی و مراقبتی در آلمان، بلافاصله پس از قبولی در آزمون، شما را در یک موقعیت شغلی دائمی و امن استخدام می‌کنیم.",
        perk_c4_lbl: "آمادگی برای آزمون",
        perk_c4_title: "آموزش فشرده آزمون شفاهی",
        perk_c4_text: "آزمون شفاهی در برابر IHK به عنوان بزرگترین مانع برای دانشجویان شناخته می‌شود. ما این نگرانی را کاملاً برطرف می‌کنیم: با شبیه‌سازی‌های انفرادی، تمرین می‌کنیم تا کاملاً مسلط و با اعتماد به نفس شوید.",
        perk_c5_lbl: "پشتیبانی اداری و امور اداری",
        perk_c5_title: "همراهی شخصی در مراحل اداری",
        perk_c5_text: "از بوروکراسی و کارهای اداری نترسید: مشاوران ما شما را برای مصاحبه با مشاور اداره کار آماده می‌کنند و مدارک رسمی را قدم به قدم با شما بارگذاری می‌کنند.",
        perk_c6_lbl: "حمایت مالی دوره آموزشی",
        perk_c6_title: "شرکت ۱۰۰٪ رایگان در دوره",
        perk_c6_text: "از آنجا که این آکادمی رسماً طبق استانداردهای AZAV تایید شده است، تمام هزینه‌های دوره، کتاب‌ها و آزمون‌ها توسط بن خرید آموزشی شما پوشش داده می‌شود و نیازی به پرداخت هزینه از جانب شما نیست.",

        // Testimonials
        testi_tagline: "داستان‌های موفقیت فارغ‌التحصیلان ما",
        testi_title: "آنچه <span class=\"text-gradient-navy\">دانشجویان ما می‌گویند</span>",
        testi_subtitle: "از زبان خودشان بشنوید که چگونه آموزش‌های عملی ما راه را برای ورود به یک شغل جدید و امن هموار کرد.",
        testi_c1: "فارغ‌التحصیل §34a نیروی امنیتی",
        testi_q1: "«به لطف تبلت رایگان، می‌توانستم شب‌ها با انعطاف درس بخوانم. استادان در کلاس‌های آنلاین زنده مرا عالی آماده کردند. در اولین تلاش در آزمون IHK قبول شدم! اکنون در بخش حفاظت فیزیکی کار می‌کنم.»",
        testi_c2: "فارغ‌التحصیل کمک پرستار",
        testi_q2: "«به عنوان یک مادر مجرد، پیدا کردن دوره آموزشی سخت بود. این کالج یک شانس بزرگ بود. مشاورم حتی در بارگذاری مدارک جاب‌سنتر به من کمک کرد. اکنون با شادی در بخش مراقبت کار می‌کنم.»",
        testi_c3: "فارغ‌التحصیل §34a نیروی امنیتی",
        testi_q3: "«به ویژه آمادگی فشرده برای آزمون شفاهی ترس مرا از امتحان از بین برد. پوشش ۱۰۰٪ هزینه‌ها توسط دولت و معرفی مستقیم به کار عالی بود. این آکادمی را کاملاً توصیه می‌کنم!»",

        // FAQ Section
        faq_tagline: "اطلاعات مهم و سوالات متداول",
        faq_title: "پاسخ به <span class=\"text-gradient-navy\">سوالات شما</span>",
        faq_subtitle: "درباره شرایط پذیرش، نحوه دریافت بن خرید آموزشی و جزئیات آزمون اتاق بازرگانی (IHK) بیشتر بدانید.",
        faq_q1: "آیا واقعاً این آموزش ۱۰۰٪ برای من رایگان است؟",
        faq_a1: "بله، کاملاً. ما به عنوان یک موسسه آموزشی مجاز دولتی، هزینه‌ها را مستقیماً با مراجع دولتی تسویه می‌کنیم. با تایید بن خرید آموزشی شما توسط اداره کار، تمام هزینه‌ها پرداخت می‌شود و شما هیچ هزینه‌ای پرداخت نمی‌کنید.",
        faq_q2: "مراحل دریافت بن خرید آموزشی (Bildungsgutschein) چگونه است؟",
        faq_a2: "مراحل بسیار ساده است. شما یک وقت مشاوره با مشاور خود در اداره کار رزرو می‌کنید. ما قبلاً تمام مدارک رسمی معتبر دوره خود را به شما ارائه می‌دهیم. آنها را به مشاور نشان می‌دهید و پس از تایید برای ما ارسال می‌کنید.",
        faq_q3: "چه شرایط پایه‌ای برای شروع دوره‌ها لازم است؟",
        faq_a3: "شما باید حداقل ۱۸ سال داشته باشید، گواهی عدم سوء‌پیشینه ارائه دهید و زبان آلمانی را در سطح حداقل A2 بدانید. برای بخش امنیت §34a، داشتن مدرک تحصیلی معتبر نیز الزامی است.",
        faq_q4: "آموزش الکترونیکی از طریق تبلت رایگان چگونه کار می‌کند؟",
        faq_a4: "پس از ثبت‌نام، تبلت آماده شده را از طریق پست برای شما ارسال می‌کنیم. از این دستگاه برای ورود روزانه به کلاس‌های زنده، مشارکت و پرسیدن سوالات به صورت صوتی یا متنی استفاده می‌کنید و پس از اتمام متعلق به خودتان است.",
        faq_q5: "آیا پس از قبولی در آزمون، تضمین استخدام دریافت می‌کنم؟",
        faq_a5: "ما با شرکت‌های پیشرو امنیتی و پرستاری در آلمان همکاری بسیار نزدیکی داریم. در طول دوره، علایق شما را بررسی کرده و رزومه را آماده می‌کنیم و به دلیل کمبود شدید نیروی کار، استخدام مستقیم را تضمین می‌کنیم.",

        // Contact Section
        contact_tagline: "مشاوره تخصصی و علمی",
        contact_title: "همین حالا با <span class=\"text-gradient-gold\">آکادمی ما</span> تماس بگیرید",
        contact_text: "آینده شغلی و شروع به کار خود را با مشاوران متخصص ما برنامه‌ریزی کنید. ما به تمام سوالات شما در مورد بن خرید آموزشی، زمان برگزاری و شیوه برگزاری کلاس در تماس شخصی پاسخ خواهیم داد.",
        contact_lbl_sec: "دفتر ثبت‌نام و پذیرش",
        contact_lbl_mail: "ایمیل برای درخواست‌ها",
        contact_lbl_head: "دفتر مرکزی Schönkirchen",
        contact_val_addr: "Dorfstraße 12, 24232 Schönkirchen",
        contact_lbl_name: "نام کامل شما",
        contact_lbl_email: "آدرس ایمیل",
        contact_lbl_phone: "شماره تلفن تماس",
        contact_lbl_course: "دوره آموزشی مورد نظر",
        contact_lbl_msg: "پیام شما به مدیریت (اختیاری)",
        contact_btn_submit: "تعیین وقت مکالمه مشاوره رایگان",
        contact_opt_security: "§34a نیروی امنیتی رسمی طبق آزمون (IHK)",
        contact_opt_nurse: "کمک پرستار",
        contact_opt_advice: "مشاوره عمومی در مورد حمایت‌های AZAV",
        ph_name: "نام و نام خانوادگی",
        ph_email: "name@example.de",
        ph_phone: "+49 170 1234567",
        ph_msg: "چگونه می‌توانیم به شما کمک کنیم؟...",
        ph_calc_name: "نام کامل",
        ph_calc_phone: "شماره تلفن برای تماس",
        footer_text: "آکادمی مجاز دولتی (AZAV) برای آموزش و ارتقای مهارت‌های حرفه‌ای در بخش امنیت خصوصی و مراقبت‌های درمانی.",
        footer_badge_azav: "مجوز رسمی به عنوان موسسه آموزشی معتبر",
        footer_badge_ihk: "استانداردها و اتاق بازرگانی IHK",
        footer_title_academy: "آکادمی",
        footer_title_courses: "دوره‌ها",
        footer_title_legal: "اطلاعات قانونی",
        footer_copy: "حقوق تکثیر &copy; 2026 Blue Light College. تمامی حقوق محفوظ است. معتبر طبق استانداردهای کیفی.",
        cookie_title: "حریم خصوصی و حفاظت از داده‌ها (GDPR)",
        cookie_text: "ما از کوکی‌ها برای ارائه بهترین تجربه در سایتمان استفاده می‌کنیم. برخی کوکی‌ها از نظر فنی برای کارکرد سایت ضروری هستند و برخی دیگر به ما در تحلیل ترافیک سایت کمک می‌کنند.",
        cookie_lbl_nec: "کوکی‌های ضروری (همیشه فعال)",
        cookie_lbl_stats: "آمار و تحلیل",
        cookie_btn_all: "پذیرش همه کوکی‌ها",
        cookie_btn_nec: "فقط کوکی‌های ضروری",
        cookie_btn_cust: "تغییر انتخاب‌ها",
        legal_modal_title: "اطلاعات قانونی",
        legal_modal_btn_close: "بستن",
        wa_status: "پشتیبانی فعال – پاسخگویی در < 5 دقیقه 🟢",
        mm_tag: "راهنمای سریع انتخاب دوره",
        mm_title: "مطابق آکادمی در <span class=\"text-gradient-gold\">۶۰ ثانیه</span>",
        mm_subtitle: "کدام دوره کاملاً با شرایط زندگی شما سازگار است و چگونه می‌توان ۱۰۰٪ بودجه دولتی دریافت کرد.",
        mm_q1: "کدام حوزه کاری بیشتر برای شما جذاب است؟",
        mm_q1_o1_title: "امنیت و حفاظت",
        mm_q1_o1_desc: "محافظت از افراد و اموال. ورود مطمئن و بدون بحران به بخش امنیت (§34a GewO).",
        mm_q1_o2_title: "مراقبت و پرستاری",
        mm_q1_o2_desc: "کمک و مراقبت از افراد. معنای انسانی عمیق و فرصت‌های شغلی عالی به عنوان دستیار پرستار.",
        mm_q2: "وضعیت شغلی فعلی شما چیست؟",
        mm_q2_o1: "بیکار / جویای کار (ALG I یا Bürgergeld)",
        mm_q2_o2: "شاغل / به دنبال تغییر شغل",
        mm_q2_o3: "فارغ‌التحصیل مدرسه / جویای کارآموزی",
        mm_q2_o4: "دیگر / شغل آزاد",
        mm_q3: "مهم‌ترین چیز برای شما در طول دوره چیست؟",
        mm_q3_o1: "۱۰۰٪ رایگان (از طریق کوپن آموزش دولتی)",
        mm_q3_o2: "انعطاف‌پذیری (کلاس‌های آنلاین زنده و گزینه‌های پاره‌وقت)",
        mm_q3_o3: "ورود سریع به بازار کار و تضمین استخدام",
        mm_submit_btn: "درخواست رزرو رایگان صندلی آموزشی",
        calc_card_title: "محاسبه‌گر پس‌انداز بودجه دولتی",
        calc_slider_label: "مدت زمان دوره درخواستی:",
        calc_toggle_label: "روش تامین مالی:",
        calc_toggle_voucher: "بن آموزشی",
        calc_toggle_self: "پرداخت شخصی",
        calc_res_fees: "هزینه دوره آموزشی:",
        calc_res_tablet: "تبلت مطالعه (مالکیت کامل شما):",
        calc_res_tablet_val: "شامل می‌شود (به ارزش ۴۰۰ یورو)",
        calc_res_materials: "کتاب‌های درسی و هزینه‌های آزمون IHK:",
        calc_res_travel: "کمک‌هزینه کار در منزل و اینترنت:",
        calc_res_covered: "۱۰۰٪ پوشش داده شده",
        calc_res_total: "خالص سرمایه‌گذاری مالی شما:",
        calc_btn_submit: "درخواست مشاوره رایگان دوره",
        quiz_pass_status: "در آزمون قبول شدید! (حداقل ۵۰٪ نیاز است)",
        quiz_fail_status: "در آزمون قبول نشدید. (۵۰٪ نیاز است)",
        faq_search_placeholder: "جستجو در سوالات...",
        map_tagline: "موفقیت فارغ‌التحصیلان منطقه‌ای",
        map_title: "شرکای قدرتمند در <span class=\"text-gradient-gold\">منطقه شما</span>",
        map_subtitle: "شرکای همکاری ما و آمار بالای استخدام فارغ‌التحصیلان را در نزدیکی خود کشف کنید.",
        map_graduates: "فارغ‌التحصیلان استخدام شده",
        map_region_east: "برلین و براندنبورغ",
        map_region_north: "هامبورغ و شلسویگ هولشتاین",
        map_region_west: "نوردراين-وستفالن",
        map_region_center: "هسن و راینلند-فالتس",
        map_region_south: "باواریا و بادن فورتمیرگ",
        map_info_default_title: "شبکه همکاری ملی",
        map_info_default_desc: "برای مشاهده اطلاعات دقیق درباره شرکا و استخدام‌های محلی، روی یک مرکز منطقه‌ای در نقشه کلیک کنید.",
        map_stat_placements_lbl: "کل فرآیندهای استخدام",
        map_stat_partners_lbl: "شرکت‌های شریک",
        advisor_name: "خانم ملانی اشمیت",
        advisor_title: "رئیس بخش مشاوره تحصیلی",
        advisor_online: "آنلاین - هم‌اکنون در دسترس",
        advisor_offline: "غیرفعال - ساعات کاری: دوشنبه-جمعه ۱۰ الی ۱۸",
        wa_status_offline: "پشتیبانی غیرفعال – ساعات کاری: دوشنبه-جمعه ۱۰:00 الی ۱۸:00 🔴"
    }
};

window.initLanguage = function() {
    const preferredLang = localStorage.getItem("preferredLang") || "de";
    switchLanguage(preferredLang);
    
    // Global listener to close dropdowns when clicking outside
    document.addEventListener("click", (e) => {
        const desktopTrigger = document.getElementById("lang-dropdown-trigger");
        const desktopMenu = document.getElementById("lang-dropdown-menu");
        const mobileTrigger = document.getElementById("mobile-lang-trigger");
        const mobileMenu = document.getElementById("mobile-lang-menu");
        
        if (desktopTrigger && desktopMenu && !desktopTrigger.contains(e.target) && !desktopMenu.contains(e.target)) {
            desktopTrigger.classList.remove("open");
            desktopMenu.classList.remove("show");
        }
        
        if (mobileTrigger && mobileMenu && !mobileTrigger.contains(e.target) && !mobileMenu.contains(e.target)) {
            mobileTrigger.classList.remove("open");
            mobileMenu.classList.remove("show");
        }
    });
};

window.toggleLangDropdown = function(event) {
    event.stopPropagation();
    const trigger = document.getElementById("lang-dropdown-trigger");
    const menu = document.getElementById("lang-dropdown-menu");
    
    if (trigger && menu) {
        const isOpen = menu.classList.contains("show");
        closeAllLangDropdowns();
        
        if (!isOpen) {
            trigger.classList.add("open");
            menu.classList.add("show");
        }
    }
};

window.toggleMobileLangDropdown = function(event) {
    event.stopPropagation();
    const trigger = document.getElementById("mobile-lang-trigger");
    const menu = document.getElementById("mobile-lang-menu");
    
    if (trigger && menu) {
        const isOpen = menu.classList.contains("show");
        closeAllLangDropdowns();
        
        if (!isOpen) {
            trigger.classList.add("open");
            menu.classList.add("show");
        }
    }
};

window.closeAllLangDropdowns = function() {
    const triggers = document.querySelectorAll(".lang-dropdown-trigger, .mobile-lang-trigger");
    const menus = document.querySelectorAll(".lang-dropdown-menu, .mobile-lang-menu");
    
    triggers.forEach(t => t.classList.remove("open"));
    menus.forEach(m => m.classList.remove("show"));
};

// Dynamic Germany local time retrieval and public holiday calculation
function getEasterSunday(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
}

function isGermanHoliday(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    // Schleswig-Holstein fixed public holidays
    if (month === 0 && day === 1) return true; // Neujahr (01.01)
    if (month === 4 && day === 1) return true; // Tag der Arbeit (01.05)
    if (month === 9 && day === 3) return true; // Tag der Deutschen Einheit (03.10)
    if (month === 9 && day === 31) return true; // Reformationstag (31.10)
    if (month === 11 && day === 25) return true; // 1. Weihnachtstag (25.12)
    if (month === 11 && day === 26) return true; // 2. Weihnachtstag (26.12)
    
    // Variable Easter-based holidays
    const easter = getEasterSunday(year);
    
    const goodFriday = new Date(easter);
    goodFriday.setDate(easter.getDate() - 2);
    
    const easterMonday = new Date(easter);
    easterMonday.setDate(easter.getDate() + 1);
    
    const ascension = new Date(easter);
    ascension.setDate(easter.getDate() + 39);
    
    const pentecostMonday = new Date(easter);
    pentecostMonday.setDate(easter.getDate() + 50);
    
    const holidays = [goodFriday, easterMonday, ascension, pentecostMonday];
    for (const h of holidays) {
        if (h.getMonth() === month && h.getDate() === day) {
            return true;
        }
    }
    
    return false;
}

function getGermanyTime() {
    const options = {
        timeZone: "Europe/Berlin",
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false
    };
    
    const formatter = new Intl.DateTimeFormat("de-DE", options);
    const parts = formatter.formatToParts(new Date());
    
    const dateParts = {};
    parts.forEach(p => {
        if (p.type !== "literal") {
            dateParts[p.type] = parseInt(p.value, 10);
        }
    });
    
    return new Date(dateParts.year, dateParts.month - 1, dateParts.day, dateParts.hour, dateParts.minute, dateParts.second);
}

function checkOnlineStatus() {
    const nowInGermany = getGermanyTime();
    const day = nowInGermany.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const hours = nowInGermany.getHours();
    
    // Monday (1) to Friday (5) only
    if (day === 0 || day === 6) return false;
    
    // Active between 10:00 and 18:00 (10:00:00 to 17:59:59)
    if (hours < 10 || hours >= 18) return false;
    
    // Offline on public holidays
    if (isGermanHoliday(nowInGermany)) return false;
    
    return true;
}

window.switchLanguage = function(lang) {
    // Save preferred language
    localStorage.setItem("preferredLang", lang);
    
    // Update active trigger text labels (uppercase)
    const activeLabel = document.getElementById("active-lang-label");
    const mobileActiveLabel = document.getElementById("mobile-active-lang-label");
    
    if (activeLabel) activeLabel.innerText = lang.toUpperCase();
    if (mobileActiveLabel) mobileActiveLabel.innerText = lang.toUpperCase();
    
    // Toggle active state in desktop dropdown items
    document.querySelectorAll("#lang-dropdown-menu .dropdown-item").forEach(item => {
        item.classList.remove("active");
        const clickAttr = item.getAttribute("onclick");
        if (clickAttr && clickAttr.includes(`'${lang}'`)) {
            item.classList.add("active");
        }
    });

    // Toggle active state in mobile dropdown items
    document.querySelectorAll("#mobile-lang-menu .dropdown-item").forEach(item => {
        item.classList.remove("active");
        const clickAttr = item.getAttribute("onclick");
        if (clickAttr && clickAttr.includes(`'${lang}'`)) {
            item.classList.add("active");
        }
    });
    
    // Right-To-Left (RTL) alignment toggler for Arabic (ar) and Persian (fa)
    if (lang === "ar" || lang === "fa") {
        document.documentElement.dir = "rtl";
        document.documentElement.lang = lang;
        document.body.classList.add("rtl-layout");
    } else {
        document.documentElement.dir = "ltr";
        document.documentElement.lang = lang;
        document.body.classList.remove("rtl-layout");
    }
    
    // Switch all translated elements
    const isOnline = checkOnlineStatus();
    document.querySelectorAll("[data-translate]").forEach(el => {
        let key = el.getAttribute("data-translate");
        
        // Dynamic overrides for online/offline keys
        if (key === "advisor_online" && !isOnline) {
            key = "advisor_offline";
            const parent = el.closest(".advisor-availability");
            if (parent) parent.classList.add("offline");
        } else if (key === "advisor_online" && isOnline) {
            const parent = el.closest(".advisor-availability");
            if (parent) parent.classList.remove("offline");
        }
        
        if (key === "wa_status" && !isOnline) {
            key = "wa_status_offline";
        }
        
        if (translations[lang] && translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });
    
    // Switch input placeholders
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const messageInput = document.getElementById("message");
    const calcNameInput = document.getElementById("calc-name");
    const calcPhoneInput = document.getElementById("calc-phone");
    
    if (nameInput && translations[lang] && translations[lang].ph_name) nameInput.placeholder = translations[lang].ph_name;
    if (emailInput && translations[lang] && translations[lang].ph_email) emailInput.placeholder = translations[lang].ph_email;
    if (phoneInput && translations[lang] && translations[lang].ph_phone) phoneInput.placeholder = translations[lang].ph_phone;
    if (messageInput && translations[lang] && translations[lang].ph_msg) messageInput.placeholder = translations[lang].ph_msg;
    if (calcNameInput && translations[lang] && translations[lang].ph_calc_name) calcNameInput.placeholder = translations[lang].ph_calc_name;
    if (calcPhoneInput && translations[lang] && translations[lang].ph_calc_phone) calcPhoneInput.placeholder = translations[lang].ph_calc_phone;

    // Localize the pre-filled WhatsApp chat link
    const waFloat = document.querySelector(".direct-chat-float");
    if (waFloat) {
        let waMsg = "Hallo Blue Light College, ich interessiere mich für die Ausbildung. Können Sie mir helfen?";
        if (lang === "en") waMsg = "Hello Blue Light College, I am interested in the training. Can you help me?";
        else if (lang === "ua") waMsg = "Вітаю Blue Light College, мене цікавить навчання. Чи можете ви мені допомогти?";
        else if (lang === "tr") waMsg = "Merhaba Blue Light College, eğitimle ilgileniyorum. Bana yardımcı olabilir misiniz?";
        else if (lang === "ar") waMsg = "مرحباً Blue Light College، أنا مهتم بالتدريب المهني. هل يمكنك مساعدتي؟";
        else if (lang === "ru") waMsg = "Здравствуйте, Blue Light College! Меня интересует обучение. Можете ли вы мне помочь?";
        else if (lang === "fa") waMsg = "سلام Blue Light College، من به دوره آموزشی علاقه‌مندم. آیا می‌توانید به من کمک کنید؟";
        
        waFloat.href = `https://wa.me/49431123456?text=${encodeURIComponent(waMsg)}`;
    }

    // Retranslate quiz question if it's active
    if (document.getElementById("quiz-q-num")) {
        renderQuizQuestion();
    }

    // Recalculate funding to update labels in new language
    calculateFunding();
    
    // Retranslate matchmaker if active
    updateMatchmakerLanguage();
    
    // Update FAQ search placeholder if element exists
    const faqSearchInput = document.getElementById("faq-search-input");
    if (faqSearchInput && translations[lang] && translations[lang].faq_search_placeholder) {
        faqSearchInput.placeholder = translations[lang].faq_search_placeholder;
    }
    
    // Update map default text if not focused on custom region
    const titleEl = document.getElementById("map-info-title");
    const descEl = document.getElementById("map-info-desc");
    if (titleEl && titleEl.getAttribute("data-focused-region") === null) {
        if (translations[lang] && translations[lang].map_info_default_title) {
            titleEl.innerHTML = translations[lang].map_info_default_title;
        }
        if (translations[lang] && translations[lang].map_info_default_desc) {
            descEl.innerHTML = translations[lang].map_info_default_desc;
        }
    } else if (titleEl) {
        // Refocus to update text in new language
        const activeRegion = titleEl.getAttribute("data-focused-region");
        if (activeRegion) {
            focusMapBeacon(activeRegion);
        }
    }
};

/* --------------------------------------------------------------------------
   12. INTERACTIVE PREMIUM FEATURES ENGINE
   -------------------------------------------------------------------------- */

// 1. Floating WhatsApp Status Live Countdown
function initWhatsAppStatus() {
    const bubble = document.querySelector(".chat-status-bubble");
    if (!bubble) return;
    
    setTimeout(() => {
        bubble.classList.add("show");
    }, 2000);
    
    let totalSeconds = 4 * 60 + 52; // Start countdown from 4:52
    setInterval(() => {
        const lang = localStorage.getItem("preferredLang") || "de";
        const isOnline = checkOnlineStatus();
        
        if (!isOnline) {
            if (translations[lang] && translations[lang].wa_status_offline) {
                bubble.innerHTML = translations[lang].wa_status_offline;
            }
            return;
        }
        
        totalSeconds--;
        if (totalSeconds < 60) {
            totalSeconds = 4 * 60 + 52; // Reset timer when it gets close to 1 min to keep it realistic
        }
        const min = Math.floor(totalSeconds / 60);
        const sec = totalSeconds % 60;
        const secStr = sec < 10 ? "0" + sec : sec;
        
        let statusText = `Sekretariat besetzt – Antwort in ${min}:${secStr} Min 🟢`;
        if (lang === "en") statusText = `Secretariat online – Reply in ${min}:${secStr} min 🟢`;
        else if (lang === "ua") statusText = `Секретаріат працює – Відповідь за ${min}:${secStr} хв 🟢`;
        else if (lang === "tr") statusText = `Sekreterlik aktif – Cevap süresi < ${min}:${secStr} dk 🟢`;
        else if (lang === "ar") statusText = `الأمانة متصلة – الرد خلال ${min}:${secStr} دقائق 🟢`;
        else if (lang === "ru") statusText = `Секретариат на связи – Ответ в течение ${min}:${secStr} мин 🟢`;
        else if (lang === "fa") statusText = `پشتیبانی فعال – پاسخگویی در ${min}:${secStr} دقیقه 🟢`;
        
        bubble.innerHTML = statusText;
    }, 1000);
}

// 2. 60-Second Academy Matchmaker State Machine
let mmState = {
    step: 1,
    field: "",      // "security" or "care"
    status: "",     // "unemployed", "employed", "student", "other"
    priority: ""    // "funding", "flexibility", "job"
};

window.handleMatchmakerNext = function(step, choice) {
    if (step === 1) {
        mmState.field = choice;
        document.getElementById("mm-step-1").classList.remove("active");
        document.getElementById("mm-step-2").classList.add("active");
        document.getElementById("mm-progress").style.width = "50%";
        mmState.step = 2;
    } else if (step === 2) {
        mmState.status = choice;
        document.getElementById("mm-step-2").classList.remove("active");
        document.getElementById("mm-step-3").classList.add("active");
        document.getElementById("mm-progress").style.width = "75%";
        mmState.step = 3;
    } else if (step === 3) {
        mmState.priority = choice;
        document.getElementById("mm-step-3").classList.remove("active");
        document.getElementById("mm-step-4").classList.add("active");
        document.getElementById("mm-progress").style.width = "100%";
        mmState.step = 4;
        renderMatchmakerOutcome();
    }
};

window.handleMatchmakerPrev = function(step) {
    if (step === 2) {
        document.getElementById("mm-step-2").classList.remove("active");
        document.getElementById("mm-step-1").classList.add("active");
        document.getElementById("mm-progress").style.width = "25%";
        mmState.step = 1;
    } else if (step === 3) {
        document.getElementById("mm-step-3").classList.remove("active");
        document.getElementById("mm-step-2").classList.add("active");
        document.getElementById("mm-progress").style.width = "50%";
        mmState.step = 2;
    } else if (step === 4) {
        // Reset and restart
        mmState = { step: 1, field: "", status: "", priority: "" };
        document.getElementById("mm-step-4").classList.remove("active");
        document.getElementById("mm-step-1").classList.add("active");
        document.getElementById("mm-progress").style.width = "25%";
        
        // Clear input values
        const mmName = document.getElementById("mm-name");
        const mmPhone = document.getElementById("mm-phone");
        if (mmName) mmName.value = "";
        if (mmPhone) mmPhone.value = "";
    }
};

function renderMatchmakerOutcome() {
    const lang = localStorage.getItem("preferredLang") || "de";
    
    // Select correct localized text values based on step answers
    const badgeEl = document.getElementById("mm-recommendation-badge");
    const titleEl = document.getElementById("mm-recommendation-title");
    const descEl = document.getElementById("mm-recommendation-desc");
    
    const benefit1 = document.getElementById("mm-benefit-1");
    const benefit2 = document.getElementById("mm-benefit-2");
    const benefit3 = document.getElementById("mm-benefit-3");
    
    if (badgeEl) {
        let badgeText = "EMPFOHLENER LEHRGANG";
        if (lang === "en") badgeText = "RECOMMENDED COURSE";
        else if (lang === "ua") badgeText = "РЕКОМЕНДОВАНИЙ КУРС";
        else if (lang === "tr") badgeText = "ÖNERİLEN EĞİTİM PROGRAMI";
        else if (lang === "ar") badgeText = "الدورة التدريبية الموصى بها";
        else if (lang === "ru") badgeText = "РЕКОМЕНДУЕМЫЙ КУРС";
        else if (lang === "fa") badgeText = "دوره آموزشی پیشنهادی";
        badgeEl.innerText = badgeText;
    }

    if (mmState.field === "security") {
        let title = "Geprüfte Sicherheitskraft (§34a GewO)";
        let desc = "Basierend auf Ihren Angaben ist die **Ausbildung zur Geprüften Sicherheitskraft** der perfekte Hebel für Ihre berufliche Zukunft. Dank Ihres Status haben Sie **Anspruch auf 100% Förderung** inklusive kostenfreiem Leih-Tablet und garantierter Vermittlung.";
        let b1 = "100% staatlich gefördert (Bildungsgutschein)";
        let b2 = "Dauer: Nur 50 Tage (Live-Online Unterricht)";
        let b3 = "Inklusive kostenfreiem Leih-Tablet (geht in Ihr Eigentum über)";
        
        if (lang === "en") {
            title = "Certified Security Specialist (§34a GewO)";
            desc = "Based on your inputs, the **Security Specialist training** is the perfect lever for your career future. Thanks to your status, you qualify for **100% state funding** including a free tablet and guaranteed placement.";
            b1 = "100% state funded (education voucher)";
            b2 = "Duration: Just 50 days (Live-Online classes)";
            b3 = "Includes free study tablet (yours to keep afterwards)";
        } else if (lang === "ua") {
            title = "Сертифікований фахівець з безпеки (§34a GewO)";
            desc = "На основі ваших відповідей, **навчання фахівця з безпеки** є ідеальним ричагом для вашої кар'єри. Завдяки вашому статусу ви маєте право на **100% державне фінансування**, включаючи безкоштовний планшет та гарантоване працевлаштування.";
            b1 = "100% фінансується державою (освітній ваучер)";
            b2 = "Тривалість: Всього 50 днів (онлайн-трансляції)";
            b3 = "Включає безкоштовний навчальний планшет у вашу власність";
        } else if (lang === "tr") {
            title = "Sertifikalı Güvenlik Uzmanı (§34a GewO)";
            desc = "Verdiğiniz bilgilere göre, **Güvenlik Uzmanlığı eğitimi** kariyeriniz için mükemmel bir adımdır. Mevcut durumunuz sayesinde, ücretsiz tablet ve iş garantisi dahil **%100 devlet desteğine** hak kazanmaktasınız.";
            b1 = "%100 devlet destekli (eğitim kuponu)";
            b2 = "Süre: Sadece 50 gün (Canlı online eğitim)";
            b3 = "Ücretsiz eğitim tableti dahil (sonrasında sizin olur)";
        } else if (lang === "ar") {
            title = "أخصائي أمن معتمد (§34a GewO)";
            desc = "بناءً على إجاباتك، فإن **التدريب المهني لأخصائي الأمن** هو الرافعة المثالية لمستقبلك المهني. بفضل وضعك الحالي، يحق لك الحصول على **تمويل بنسبة 100%** بما في ذلك جهاز لوحي مجاني وتوظيف مضمون.";
            b1 = "تمويل حكومي 100% (قسيمة التعليم)";
            b2 = "المدة: 50 يوماً فقط (دروس مباشرة عبر الإنترنت)";
            b3 = "يتضمن جهازاً لوحياً مجانياً للدراسة (يصبح ملكك لاحقاً)";
        } else if (lang === "ru") {
            title = "Сертифицированный специалист по безопасности (§34a GewO)";
            desc = "На основании ваших ответов, **обучение специалиста по безопасности** станет идеальным шагом для вашей карьеры. Благодаря вашему статусу вы имеете право на **100% госфинансирование**, включая бесплатный планшет и гарантированное трудоустройство.";
            b1 = "100% финансируется государством (образовательный ваучер)";
            b2 = "Длительность: Всего 50 дней (онлайн-трансляции)";
            b3 = "Включает бесплатный учебный планшет в вашу собственность";
        } else if (lang === "fa") {
            title = "متخصص امنیت معتمد (§34a GewO)";
            desc = "بر اساس پاسخ‌های شما، **دوره متخصص امنیت** بهترین اهرم برای آینده شغلی شماست. به لطف وضعیت فعلی، شما واجد شرایط **۱۰۰٪ بودجه دولتی** شامل تبلت رایگان و استخدام تضمینی هستید.";
            b1 = "۱۰۰٪ بودجه دولتی (کوپن آموزش)";
            b2 = "مدت دوره: فقط ۵۰ روز (کلاس‌های آنلاین زنده)";
            b3 = "شامل تبلت مطالعه رایگان (پس از اتمام متعلق به شماست)";
        }
        
        if (titleEl) titleEl.innerText = title;
        if (descEl) descEl.innerHTML = desc;
        if (benefit1) benefit1.innerText = b1;
        if (benefit2) benefit2.innerText = b2;
        if (benefit3) benefit3.innerText = b3;
        
    } else {
        let title = "Qualifizierte/r Pflegehelfer/in";
        let desc = "Basierend auf Ihren Angaben ist die **Ausbildung zum/zur qualifizierten Pflegehelfer/in** der ideale Weg für Ihren beruflichen Neustart. Menschen helfen, sichere Jobaussichten haben und **100% staatlich gefördert** durchstarten.";
        let b1 = "100% staatlich gefördert (Bildungsgutschein)";
        let b2 = "Praxisorientierte Ausbildung mit Fachzertifikat";
        let b3 = "Inklusive kostenfreiem Leih-Tablet & direkter Jobgarantie";
        
        if (lang === "en") {
            title = "Qualified Nursing Assistant";
            desc = "Based on your inputs, the **Nursing Assistant training** is the ideal path for your professional restart. Helping people, enjoying absolute job security, and starting **100% state funded**.";
            b1 = "100% state funded (education voucher)";
            b2 = "Practice-oriented training with professional certificate";
            b3 = "Includes free study tablet & direct job placement guarantee";
        } else if (lang === "ua") {
            title = "Кваліфікований асистент з догляду (Pflegehelfer)";
            desc = "На основі ваших відповідей, **навчання асистента з догляду** є ідеальним шляхом для професійного рестарту. Допомагайте людям, отримуйте абсолютну безпеку роботи та розпочніть **100% фінансування від держави**.";
            b1 = "100% фінансується державою (освітній ваучер)";
            b2 = "Практико-орієнтоване навчання з сертифікатом фахівця";
            b3 = "Включає безкоштовний планшет та пряму гарантію роботи";
        } else if (lang === "tr") {
            title = "Nitelikli Hasta Bakıcı (Pflegehelfer)";
            desc = "Verdiğiniz bilgilere göre, **Nitelikli Hasta Bakıcılığı eğitimi** kariyerinizde yeni bir başlangıç için ideal yoldur. İnsanlara yardım edin, iş güvencesinin tadını çıkarın ve **%100 devlet desteğiyle** işe başlayın.";
            b1 = "%100 devlet destekli (eğitim kuponu)";
            b2 = "Mesleki sertifikalı pratik odaklı eğitim programı";
            b3 = "Ücretsiz eğitim tableti ve doğrudan işe yerleştirme garantisi";
        } else if (lang === "ar") {
            title = "مساعد تمريض مؤهل (Pflegehelfer)";
            desc = "بناءً على إجاباتك، فإن **التدريب المهني لمساعد التمريض** هو المسار المثالي لإعادة تشغيل حياتك المهنية. ساعد الناس، واستمتع بأمان وظيفي كامل، وابدأ **بتمويل حكومي 100%**.";
            b1 = "تمويل حكومي 100% (قسيمة التعليم)";
            b2 = "تدريب عملي وموجه نحو الممارسة مع شهادة تخصص";
            b3 = "يتضمن جهازاً لوحياً مجانياً وضمان توظيف مباشر";
        } else if (lang === "ru") {
            title = "Квалифицированный помощник по уходу (Pflegehelfer)";
            desc = "На основании ваших ответов, **обучение помощника по уходу** — идеальный путь для вашего профессионального перезапуска. Помогайте людям, наслаждайтесь полной надежностью работы и начните **100% госфинансирование**.";
            b1 = "100% финансируется государством (образовательный ваучер)";
            b2 = "Практико-ориентированное обучение с профессиональным сертификатом";
            b3 = "Включаеться бесплатный планшет и прямую гарантию трудоустройства";
        } else if (lang === "fa") {
            title = "دستیار پرستار واجد شرایط (Pflegehelfer)";
            desc = "بر اساس پاسخ‌های شما، **دوره دستیار پرستاری** بهترین مسیر برای راه‌اندازی مجدد حرفه شماست. به مردم کمک کنید، از امنیت شغلی کامل بهره‌مند شوید و با **۱۰۰٪ بودجه دولتی** کار خود را شروع کنید.";
            b1 = "۱۰۰٪ بودجه دولتی (کوپن آموزش)";
            b2 = "آموزش عمل‌گرا همراه با ارائه مدرک تخصصی";
            b3 = "شامل تبلت مطالعه رایگان و تضمین استخدام مستقیم";
        }
        
        if (titleEl) titleEl.innerText = title;
        if (descEl) descEl.innerHTML = desc;
        if (benefit1) benefit1.innerText = b1;
        if (benefit2) benefit2.innerText = b2;
        if (benefit3) benefit3.innerText = b3;
    }
}

function updateMatchmakerLanguage() {
    if (mmState.step === 4) {
        renderMatchmakerOutcome();
    }
}

// 3. Dynamic Funding Calculator Savings Slider
let currentFundingType = 'voucher';

window.setFundingType = function(type) {
    currentFundingType = type;
    const btnVoucher = document.getElementById("btn-funding-voucher");
    const btnSelf = document.getElementById("btn-funding-self");
    if (btnVoucher && btnSelf) {
        if (type === 'voucher') {
            btnVoucher.classList.add("active");
            btnSelf.classList.remove("active");
        } else {
            btnSelf.classList.add("active");
            btnVoucher.classList.remove("active");
        }
    }
    window.calculateFunding();
};

window.calculateFunding = function() {
    const lang = localStorage.getItem("preferredLang") || "de";
    const days = 50; // Strictly fixed to 50 days (10 weeks course)
    
    // AZAV Standard Values
    const courseFeeValue = days * 85;      // €4.250
    const travelValue = days * 12;         // €600
    const tabletValue = 400;               // €400
    const materialsValue = 250;            // €250
    
    const feesEl = document.getElementById("calc-fees-status");
    const tabletEl = document.getElementById("calc-tablet-status");
    const materialsEl = document.getElementById("calc-materials-status");
    const travelEl = document.getElementById("calc-travel-status");
    const totalEl = document.getElementById("calc-total-status");
    
    if (currentFundingType === 'voucher') {
        // 100% Free via Bildungsgutschein
        if (feesEl) {
            let coveredText = "100% Übernommen";
            if (lang === "en") coveredText = "100% Covered";
            else if (lang === "ua") coveredText = "100% Покрито";
            else if (lang === "tr") coveredText = "100% Karşılandı";
            else if (lang === "ar") coveredText = "مغطى بنسبة 100%";
            else if (lang === "ru") coveredText = "100% Покрыто";
            else if (lang === "fa") coveredText = "100% پوشش داده شده";
            feesEl.innerHTML = `${coveredText} <span class="calc-saving-badge">(€${courseFeeValue.toLocaleString('de-DE')})</span>`;
            feesEl.className = "result-value green-highlight";
        }
        if (tabletEl) {
            let tabText = "Inklusive";
            if (lang === "en") tabText = "Included";
            else if (lang === "ua") tabText = "Включено";
            else if (lang === "tr") tabText = "Dahil";
            else if (lang === "ar") tabText = "مضمّن";
            else if (lang === "ru") tabText = "Включено";
            else if (lang === "fa") tabText = "شامل می‌شود";
            
            let valText = "Wert";
            if (lang === "en") valText = "Value";
            else if (lang === "ua") valText = "вартість";
            else if (lang === "tr") valText = "Değerinde";
            else if (lang === "ar") valText = "بقيمة";
            else if (lang === "ru") valText = "стоимость";
            else if (lang === "fa") valText = "ارزش";
            
            tabletEl.innerText = `${tabText} (€${tabletValue} ${valText})`;
            tabletEl.className = "result-value text-gradient-gold";
        }
        if (materialsEl) {
            let coveredText = "100% Übernommen";
            if (lang === "en") coveredText = "100% Covered";
            else if (lang === "ua") coveredText = "100% Покрито";
            else if (lang === "tr") coveredText = "100% Karşılandı";
            else if (lang === "ar") coveredText = "مغطى بنسبة 100%";
            else if (lang === "ru") coveredText = "100% Покрыто";
            else if (lang === "fa") coveredText = "100% پوشش داده شده";
            materialsEl.innerHTML = `${coveredText} <span class="calc-saving-badge">(€${materialsValue.toLocaleString('de-DE')})</span>`;
            materialsEl.className = "result-value green-highlight";
        }
        if (travelEl) {
            let coveredText = "100% Übernommen";
            if (lang === "en") coveredText = "100% Covered";
            else if (lang === "ua") coveredText = "100% Покрито";
            else if (lang === "tr") coveredText = "100% Karşılandı";
            else if (lang === "ar") coveredText = "مغطى بنسبة 100%";
            else if (lang === "ru") coveredText = "100% Покрыто";
            else if (lang === "fa") coveredText = "100% پوشش داده شده";
            travelEl.innerHTML = `${coveredText} <span class="calc-saving-badge">(€${travelValue.toLocaleString('de-DE')})</span>`;
            travelEl.className = "result-value green-highlight";
        }
        if (totalEl) {
            totalEl.innerText = "€0,00";
            totalEl.className = "result-value total-val text-gradient-navy";
        }
    } else {
        // Private financing self-payer
        if (feesEl) {
            feesEl.innerText = `€${courseFeeValue.toLocaleString('de-DE')},00`;
            feesEl.className = "result-value text-gradient-navy";
        }
        if (tabletEl) {
            let optText = "Optional (€400)";
            if (lang === "en") optText = "Optional ($400)";
            else if (lang === "ua") optText = "За бажанням (€400)";
            else if (lang === "tr") optText = "İsteğe Bağlı (€400)";
            else if (lang === "ar") optText = "اختياري (400 يورو)";
            else if (lang === "ru") optText = "Необязательно (€400)";
            else if (lang === "fa") optText = "اختیاری (۴۰۰ یورو)";
            tabletEl.innerText = optText;
            tabletEl.className = "result-value text-muted";
        }
        if (materialsEl) {
            materialsEl.innerText = `€${materialsValue.toLocaleString('de-DE')},00`;
            materialsEl.className = "result-value text-gradient-navy";
        }
        if (travelEl) {
            let noRefText = "Keine Erstattung";
            if (lang === "en") noRefText = "No Refund";
            else if (lang === "ua") noRefText = "Без відшкодування";
            else if (lang === "tr") noRefText = "Geri Ödemesiz";
            else if (lang === "ar") noRefText = "لا يوجد استرداد";
            else if (lang === "ru") noRefText = "Без возмещения";
            else if (lang === "fa") noRefText = "بدون بازپرداخت";
            travelEl.innerText = noRefText;
            travelEl.className = "result-value text-muted";
        }
        if (totalEl) {
            const totalCost = courseFeeValue + materialsValue; // Tablet is optional for private payers
            totalEl.innerText = `€${totalCost.toLocaleString('de-DE')},00`;
            totalEl.className = "result-value total-val text-gradient-gold";
        }
    }
};

// 4. Overriding and Gamifying the IHK Mock Exam Quiz Results to draw circular SVG meter
const originalRenderQuizResults = renderQuizResults;
renderQuizResults = function() {
    const container = document.getElementById("quiz-container");
    const lang = localStorage.getItem("preferredLang") || "de";
    
    let resultMessage = "";
    if (quizScore === quizQuestions.length) {
        resultMessage = (translations[lang] && translations[lang].quiz_res_perf) || "Hervorragend gelöst! Sie besitzen bereits ein exzellentes juristisches Verständnis.";
    } else if (quizScore >= 2) {
        resultMessage = (translations[lang] && translations[lang].quiz_res_good) || "Sehr gut! Sie verfügen über solides juristisches Grundwissen.";
    } else {
        resultMessage = (translations[lang] && translations[lang].quiz_res_bad) || "Keine Sorge! Das Sicherheitsrecht ist komplex. Genau dafür sind wir da.";
    }
    
    const titleText = (translations[lang] && translations[lang].quiz_res_title) || "Test abgeschlossen!";
    const bodyLeadText = (translations[lang] && translations[lang].quiz_res_body) || "Unsere Absolventen erzielen dank unseres professionellen Vorbereitungskurses eine Bestehensquote von 98% vor der IHK. Nutzen Sie Ihre Chance.";
    const btnCtaText = (translations[lang] && translations[lang].quiz_res_btn_cta) || "Kostenfreie Beratung buchen";
    const btnRepeatText = (translations[lang] && translations[lang].quiz_res_btn_repeat) || "Test wiederholen";
    
    // Circular Gauge calculations:
    const percentage = Math.round((quizScore / quizQuestions.length) * 100);
    // SVG Circle Radius is 50, Circumference is 2 * PI * r = 314
    const offset = 314 - (314 * percentage) / 100;
    const passed = quizScore >= 2; // Passing threshold is 50%+ (2/3 correct)
    
    let thresholdLabel = "Prüfung bestanden! (Mind. 50% benötigt)";
    let statusClass = "pass-green";
    if (lang === "en") {
        thresholdLabel = passed ? "Exam Passed! (Min. 50% required)" : "Exam Failed (50% required)";
        statusClass = passed ? "pass-green" : "fail-red";
    } else if (lang === "ua") {
        thresholdLabel = passed ? "Іспит складено! (Необхідно мін. 50%)" : "Іспит не складено (Необхідно 50%)";
        statusClass = passed ? "pass-green" : "fail-red";
    } else if (lang === "tr") {
        thresholdLabel = passed ? "Sınavı Geçtiniz! (En az %50 gerekli)" : "Sınavda Başarısız Oldunuz (%50 gerekli)";
        statusClass = passed ? "pass-green" : "fail-red";
    } else if (lang === "ar") {
        thresholdLabel = passed ? "لقد نجحت في الاختبار! (مطلوب 50% على الأقل)" : "لم تنجح في الاختبار (مطلوب 50%)";
        statusClass = passed ? "pass-green" : "fail-red";
    } else if (lang === "ru") {
        thresholdLabel = passed ? "Экзамен сдан! (Требуется мин. 50%)" : "Экзамен не сдан (Требуется 50%)";
        statusClass = passed ? "pass-green" : "fail-red";
    } else if (lang === "fa") {
        thresholdLabel = passed ? "در آزمون قبول شدید! (حداقل ۵۰٪ نیاز است)" : "در آزمون قبول نشدید (۵۰٪ نیاز است)";
        statusClass = passed ? "pass-green" : "fail-red";
    }
    
    if (lang === "de") {
        thresholdLabel = passed ? "Prüfung bestanden! (Mind. 50% benötigt)" : "Prüfung nicht bestanden. (50% benötigt)";
        statusClass = passed ? "pass-green" : "fail-red";
    }
    
    container.innerHTML = `
        <div class="quiz-finished-box">
            <!-- Premium SVG Circular Score Gauge -->
            <div class="quiz-gauge-wrapper">
                <svg class="quiz-gauge-svg" width="120" height="120" viewBox="0 0 120 120">
                    <circle class="quiz-gauge-track" cx="60" cy="60" r="50" stroke-width="8"></circle>
                    <circle class="quiz-gauge-threshold-line" cx="60" cy="60" r="50" stroke-width="8" stroke-dasharray="2 314" stroke-dashoffset="-157"></circle>
                    <circle class="quiz-gauge-value" id="quiz-gauge-val-circle" cx="60" cy="60" r="50" stroke-width="8" stroke-dasharray="314" stroke-dashoffset="314" style="stroke: ${passed ? '#25D366' : '#DC3545'};"></circle>
                </svg>
                <div class="quiz-gauge-label">
                    <span class="quiz-gauge-score" id="quiz-gauge-score-txt">${quizScore}/${quizQuestions.length}</span>
                    <span class="quiz-gauge-percent" id="quiz-gauge-percent-txt">${percentage}%</span>
                </div>
            </div>
            
            <div class="quiz-threshold-indicator ${statusClass}">
                ${thresholdLabel}
            </div>

            <h3 class="quiz-results-title text-gradient-gold">${titleText}</h3>
            <p class="quiz-results-text">
                ${resultMessage} ${bodyLeadText}
            </p>
            <div class="quiz-actions">
                <a href="#contact" class="btn btn-gold" onclick="fillCourseInterest('sachkunde-34a')">${btnCtaText}</a>
                <button class="btn btn-outline" onclick="resetQuiz()">${btnRepeatText}</button>
            </div>
        </div>
    `;
    
    // Animate the SVG circular gauge stroke ring on render
    setTimeout(() => {
        const valCircle = document.getElementById("quiz-gauge-val-circle");
        if (valCircle) {
            valCircle.style.strokeDashoffset = offset;
        }
    }, 100);
};

// 5. FAQ Accordion Live Search Engine
window.filterFaq = function() {
    const query = document.getElementById("faq-search-input").value.toLowerCase().trim();
    const clearBtn = document.getElementById("faq-clear-btn");
    const items = document.querySelectorAll(".faq-academic-item");
    
    if (query.length > 0) {
        if (clearBtn) clearBtn.style.display = "flex";
    } else {
        if (clearBtn) clearBtn.style.display = "none";
    }
    
    items.forEach(item => {
        const triggerText = item.querySelector(".faq-trigger").innerText.toLowerCase();
        const contentText = item.querySelector(".faq-content").innerText.toLowerCase();
        
        if (triggerText.includes(query) || contentText.includes(query)) {
            item.style.display = "block";
            setTimeout(() => {
                item.style.opacity = "1";
                item.style.transform = "scale(1)";
            }, 20);
        } else {
            item.style.opacity = "0";
            item.style.transform = "scale(0.95)";
            setTimeout(() => {
                // Double check to make sure search query has not changed in the meantime
                if (item.style.opacity === "0") {
                    item.style.display = "none";
                }
            }, 250);
        }
    });
};

window.clearFaqSearch = function() {
    const input = document.getElementById("faq-search-input");
    if (input) input.value = "";
    filterFaq();
};

// 6. Regional Graduate Success Map Interaction Engine
window.focusMapBeacon = function(region) {
    // Remove active styling from all map beacons
    document.querySelectorAll(".map-beacon").forEach(b => b.classList.remove("active"));
    
    // Add active styling onto target beacon
    const targetBeacon = document.querySelector(`.map-beacon[data-region="${region}"]`);
    if (targetBeacon) targetBeacon.classList.add("active");
    
    const lang = localStorage.getItem("preferredLang") || "de";
    const data = regionalMapData[lang][region];
    
    if (data) {
        const titleEl = document.getElementById("map-info-title");
        const descEl = document.getElementById("map-info-desc");
        if (titleEl) {
            titleEl.innerHTML = data.title;
            titleEl.setAttribute("data-focused-region", region); // Anchor focused region tag to prevent retranslating overrides
        }
        if (descEl) descEl.innerHTML = data.desc;
    }
};

const regionalMapData = {
    de: {
        east: {
            title: "Regionalzentrum Berlin & Brandenburg",
            desc: "Unser Hauptkooperationspartner <strong>Securitas Ost</strong> und das <strong>Deutsche Rote Kreuz</strong> stellen jährlich über 400 Absolventen der Sicherheits- und Pflegelehrgänge direkt in feste Stellen ein. Vor-Ort-Unterstützung bei der IHK-Anmeldung."
        },
        north: {
            title: "Regionalzentrum Hamburg & Nord",
            desc: "Im Norden vermitteln wir unsere Absolventen direkt in unbefristete Arbeitsverhältnisse bei der <strong>Kötter Unternehmensgruppe</strong> sowie den <strong>Johannitern Nord</strong>. Tablet-Übergabe erfolgt vor Kursbeginn."
        },
        west: {
            title: "Regionalzentrum Nordrhein-Westfalen",
            desc: "Mit über 520 erfolgreichen Vermittlungen ist NRW unsere aktivste Region. Partnerschaften mit <strong>Wisag West</strong> und dem <strong>DRK Köln</strong> garantieren Spitzengehälter und krisensichere Verträge direkt nach der IHK-Sachkundeprüfung."
        },
        center: {
            title: "Regionalzentrum Hessen & RLP",
            desc: "Direkte Jobgarantien im Großraum Frankfurt durch Kooperationen mit <strong>Prosegur Deutschland</strong> und dem <strong>ASB Mitte</strong>. Flexible Online-Live-Kurse in Vollzeit und Teilzeit."
        },
        south: {
            title: "Regionalzentrum Bayern & BaWü",
            desc: "Hervorragende Verdienstmöglichkeiten in Süddeutschland bei <strong>Securitas Süd</strong> und den <strong>Maltesern Süd</strong>. 99% Bestehensquote im IHK-Vorbereitungsmodul."
        }
    },
    en: {
        east: {
            title: "Berlin & Brandenburg Hub",
            desc: "Our primary partners <strong>Securitas East</strong> and the <strong>German Red Cross</strong> employ over 400 graduates annually from our security and care programs. Local assistance with IHK exam registration is guaranteed."
        },
        north: {
            title: "Hamburg & North Hub",
            desc: "In northern Germany, we place graduates in permanent positions at <strong>Kötter Security</strong> and <strong>Johanniter Nord</strong>. Free study tablet delivered to your home before course start."
        },
        west: {
            title: "North Rhine-Westphalia Hub",
            desc: "With 520+ successful placements, NRW is our most active region. Direct partnerships with <strong>Wisag West</strong> and the <strong>DRK Cologne</strong> guarantee competitive wages and job safety post-exams."
        },
        center: {
            title: "Hesse & Rhineland Hub",
            desc: "Direct employment guarantees in the Frankfurt metropolitan area through contracts with <strong>Prosegur Germany</strong> and <strong>ASB Center</strong>. Part-time options available."
        },
        south: {
            title: "Bavaria & South Hub",
            desc: "Exceptional career outlook in southern Germany with <strong>Securitas South</strong> and <strong>Malteser South</strong>. 99% passing rate in the intensive IHK exam preparation module."
        }
    },
    ua: {
        east: {
            title: "Регіональний центр Берлін та Бранденбург",
            desc: "Наші головні партнери <strong>Securitas East</strong> та <strong>Німецький Червоний Хрест</strong> щорічно працевлаштовують понад 400 випускників курсів безпеки та охорони здоров'я. Надаємо локальну підтримку при реєстрації в IHK."
        },
        north: {
            title: "Регіональний центр Гамбург та Північ",
            desc: "На півночі ми працевлаштовуємо випускників на постійні посади в <strong>Kötter Security</strong> та <strong>Johanniter Nord</strong>. Планшет доставляється додому до початку курсу."
        },
        west: {
            title: "Регіональний центр Північний Рейн-Вестфалія",
            desc: "Понад 520 успішних працевлаштувань роблять NRW нашим найактивнішим регіоном. Партнерство з <strong>Wisag West</strong> та <strong>DRK Köln</strong> гарантує стабільну роботу після іспитів."
        },
        center: {
            title: "Регіональний центр Гессен та Райнланд",
            desc: "Прямі гарантії працевлаштування в районі Франкфурта завдяки кооперації з <strong>Prosegur Germany</strong> та <strong>ASB Center</strong>. Доступні гнучкі онлайн-курси."
        },
        south: {
            title: "Регіональний центр Баварія та Південь",
            desc: "Відмінні перспективи кар'єри на півдні Німеччини з <strong>Securitas South</strong> та <strong>Malteser South</strong>. 99% успішно складених іспитів IHK."
        }
    },
    tr: {
        east: {
            title: "Berlin & Brandenburg Bölge Merkezi",
            desc: "Ana ortaklarımız <strong>Securitas Doğu</strong> ve <strong>Alman Kızılhaçı (DRK)</strong>, her yıl güvenlik ve bakım eğitimlerimizden mezun olan 400'den fazla kişiyi doğrudan işe almaktadır."
        },
        north: {
            title: "Hamburg & Kuzey Bölge Merkezi",
            desc: "Kuzey Almanya'da mezunlarımızı <strong>Kötter Group</strong> ve <strong>Johanniter Nord</strong> bünyesinde kalıcı kadrolara yerleştiriyoruz. Ücretsiz eğitim tableti kurs başlamadan teslim edilir."
        },
        west: {
            title: "Kuzey Ren-Vestfalya Bölge Merkezi",
            desc: "520'den fazla başarılı yerleştirme ile NRW en aktif bölgemizdir. <strong>Wisag West</strong> ve <strong>DRK Köln</strong> ortaklıkları, IHK sınavı sonrası yüksek maaş ve iş garantisi sağlar."
        },
        center: {
            title: "Hessen & RLP Bölge Merkezi",
            desc: "Frankfurt bölgesinde <strong>Prosegur Almanya</strong> ve <strong>ASB Merkez</strong> iş birlikleriyle doğrudan istihdam garantisi. Tam zamanlı ve yarı zamanlı esnek kurs seçenekleri."
        },
        south: {
            title: "Bavyera & Güney Bölge Merkezi",
            desc: "Güney Almanya'da <strong>Securitas Güney</strong> ve <strong>Malteser Güney</strong> ile mükemmel kariyer fırsatları. IHK sınav hazırlık modülünde %99 başarı oranı."
        }
    },
    ar: {
        east: {
            title: "مركز برلين وبراندنبورغ الإقليمي",
            desc: "شركاؤنا الرئيسيون <strong>سيكوريتاس الشرق</strong> و<strong>الصليب الأحمر الألماني</strong> يوظفون سنوياً أكثر من 400 خريج من دورات الأمن والرعاية الصحية مباشرة في وظائف ثابتة."
        },
        north: {
            title: "مركز هامبورغ والشمال الإقليمي",
            desc: "في الشمال، نوظف خريجينا في وظائف دائمة لدى <strong>مجموعة كوتر</strong> و<strong>يوحنا الشمال</strong>. يتم تسليم الجهاز اللوحي للدراسة قبل بدء الدورة."
        },
        west: {
            title: "مركز شمال الراين-وستفاليا الإقليمي",
            desc: "مع أكثر من 520 حالة توظيف ناجحة، تعد الولاية أكثر مناطقنا نشاطاً. تضمن الشراكات مع <strong>فيزاغ الغرب</strong> و<strong>الصليب الأحمر في كولونيا</strong> رواتب ممتازة وعقوداً آمنة."
        },
        center: {
            title: "مركز هسن وراينلاند الإقليمي",
            desc: "ضمانات عمل مباشرة في منطقة فرانكفورت الكبرى من خلال التعاون مع <strong>بروسيغور ألمانيا</strong> و<strong>الجمعية الطبية للسامريين</strong>. دورات مرنة متوفرة."
        },
        south: {
            title: "مركز بافاريا والجنوب الإقليمي",
            desc: "فرص عمل ممتازة في جنوب ألمانيا مع <strong>سيكوريتاس الجنوب</strong> و<strong>مالتيزر الجنوب</strong>. نسبة نجاح تبلغ 99% في التحضير لاختبار غرفة التجارة والصناعة (IHK)."
        }
    },
    ru: {
        east: {
            title: "Региональный центр Берлин и Бранденбург",
            desc: "Наши главные партнеры <strong>Securitas East</strong> и <strong>Немецкий Красный Крест</strong> ежегодно принимают более 400 выпускников курсов безопасности и ухода напрямую в штат."
        },
        north: {
            title: "Региональный центр Гамбург и Север",
            desc: "На севере мы трудоустраиваем выпускников на постоянные должности в <strong>Kötter Security</strong> и <strong>Johanniter Nord</strong>. Учебный планшет доставляется на дом до старта курса."
        },
        west: {
            title: "Региональный центр Северный Рейн-Вестфалия",
            desc: "Более 520 успешных трудоустройств делают NRW нашим самым активным регионом. Партнерство с <strong>Wisag West</strong> и <strong>DRK Köln</strong> гарантирует стабильную работу после экзаменов."
        },
        center: {
            title: "Региональный центр Гессен и Рейнланд",
            desc: "Прямые гарантии занятости в районе Франкфурта благодаря кооперации с <strong>Prosegur Germany</strong> и <strong>ASB Center</strong>. Доступны гибкие онлайн-курсы."
        },
        south: {
            title: "Региональный центр Бавария и Юг",
            desc: "Отличные перспективы карьеры на юге Германии с <strong>Securitas South</strong> и <strong>Malteser South</strong>. Успешность сдачи экзаменов IHK составляет 99%."
        }
    },
    fa: {
        east: {
            title: "مرکز منطقه‌ای برلین و براندنبورگ",
            desc: "شریک اصلی ما <strong>سکوریتاس شرق</strong> و <strong>صلیب سرخ آلمان</strong> سالانه بیش از ۴۰۰ فارغ‌التحصیل دوره‌های امنیت و مراقبت را مستقیماً استخدام می‌کنند."
        },
        north: {
            title: "مرکز منطقه‌ای هامبورگ و شمال",
            desc: "در شمال آلمان، ما فارغ‌التحصیلان را در موقعیت‌های دائمی در <strong>گروه کوتر</strong> و <strong>یوهانیتر شمال</strong> مستقر می‌کنیم. تبلت قبل از شروع دوره تحویل می‌شود."
        },
        west: {
            title: "مرکز منطقه‌ای نوردراین-وستفالن",
            desc: "با بیش از ۵۲۰ استخدام موفق، این ایالت فعال‌ترین منطقه ماست. همکاری با <strong>ویزاگ غرب</strong> و <strong>صلیب سرخ کلن</strong> حقوق عالی و قراردادهای مطمئن را تضمین می‌کند."
        },
        center: {
            title: "مرکز منطقه‌ای هسن و راینلند",
            desc: "تضمین استخدام مستقیم در منطقه فرانکفورت از طریق همکاری با <strong>پروسگور آلمان</strong> و <strong>ASB مرکز</strong>. دوره‌های آنلاین انعطاف‌پذیر به صورت تمام‌وقت و پاره‌وقت."
        },
        south: {
            title: "مرکز منطقه‌ای باواریا و جنوب",
            desc: "فرصت‌های شغلی عالی در جنوب آلمان با <strong>سکوریتاس جنوب</strong> و <strong>مالتزر جنوب</strong>. ۹۹٪ درصد قبولی در ماژول آمادگی آزمون اتاق بازرگانی (IHK)."
        }
    }
};

