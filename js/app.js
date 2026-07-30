const DEFAULT_VALUES = {
            positionPercentage: 80,
            sickLeavePercentage: 60,
            fullWeekHours: 37.5,
            workDays: 5
        };

        const STORAGE_KEYS = {
            positionPercentage:
                "octacore-position-percentage",

            sickLeavePercentage:
                "octacore-sick-leave-percentage",

            fullWeekHours:
                "octacore-full-week-hours",

            workDays:
                "octacore-work-days"
        };

        let toastTimeout = null;
        let deferredInstallPrompt = null;
        let waitingServiceWorker = null;
        let isReloadingForUpdate = false;

        let currentCalculation = {
            isValid: true,
            positionPercentage: 80,
            sickLeavePercentage: 60,
            fullWeekHours: 37.5,
            workDays: 5,
            workSharePercentage: 40,
            fullPositionPercentage: 32,
            weeklyHours: 12,
            dailyHours: 2.4
        };

        const elements = {
            positionPercentage:
                document.getElementById(
                    "positionPercentage"
                ),

            sickLeavePercentage:
                document.getElementById(
                    "sickLeavePercentage"
                ),

            fullWeekHours:
                document.getElementById(
                    "fullWeekHours"
                ),

            workDays:
                document.getElementById(
                    "workDays"
                ),

            positionError:
                document.getElementById(
                    "positionError"
                ),

            sickLeaveError:
                document.getElementById(
                    "sickLeaveError"
                ),

            ownPositionPercentage:
                document.getElementById(
                    "ownPositionPercentage"
                ),

            fullPositionPercentage:
                document.getElementById(
                    "fullPositionPercentage"
                ),

            weeklyResult:
                document.getElementById(
                    "weeklyResult"
                ),

            weeklyTime:
                document.getElementById(
                    "weeklyTime"
                ),

            dailyResultLabel:
                document.getElementById(
                    "dailyResultLabel"
                ),

            dailyResult:
                document.getElementById(
                    "dailyResult"
                ),

            dailyTime:
                document.getElementById(
                    "dailyTime"
                ),

            shareButton:
                document.getElementById(
                    "shareButton"
                ),

            resetButton:
                document.getElementById(
                    "resetButton"
                ),

            moreButton:
                document.getElementById(
                    "moreButton"
                ),

            menuBackdrop:
                document.getElementById(
                    "menuBackdrop"
                ),

            closeMenuButton:
                document.getElementById(
                    "closeMenuButton"
                ),

            shareAppButton:
                document.getElementById(
                    "shareAppButton"
                ),

            aboutAppButton:
                document.getElementById(
                    "aboutAppButton"
                ),

            aboutBackdrop:
                document.getElementById(
                    "aboutBackdrop"
                ),

            aboutBackButton:
                document.getElementById(
                    "aboutBackButton"
                ),

            closeAboutButton:
                document.getElementById(
                    "closeAboutButton"
                ),

            privacyButton:
                document.getElementById(
                    "privacyButton"
                ),

            privacyBackdrop:
                document.getElementById(
                    "privacyBackdrop"
                ),

            privacyBackButton:
                document.getElementById(
                    "privacyBackButton"
                ),

            closePrivacyButton:
                document.getElementById(
                    "closePrivacyButton"
                ),

            contactButton:
                document.getElementById(
                    "contactButton"
                ),

            contactBackdrop:
                document.getElementById(
                    "contactBackdrop"
                ),

            contactBackButton:
                document.getElementById(
                    "contactBackButton"
                ),

            closeContactButton:
                document.getElementById(
                    "closeContactButton"
                ),

            updatesButton:
                document.getElementById(
                    "updatesButton"
                ),

            updatesBackdrop:
                document.getElementById(
                    "updatesBackdrop"
                ),

            updatesBackButton:
                document.getElementById(
                    "updatesBackButton"
                ),

            closeUpdatesButton:
                document.getElementById(
                    "closeUpdatesButton"
                ),

            languageButton:
                document.getElementById(
                    "languageButton"
                ),

            installArea:
                document.getElementById(
                    "installArea"
                ),

            installButton:
                document.getElementById(
                    "installButton"
                ),

            installButtonText:
                document.getElementById(
                    "installButtonText"
                ),

            installModal:
                document.getElementById(
                    "installModal"
                ),

            closeInstallModal:
                document.getElementById(
                    "closeInstallModal"
                ),

            updateBanner:
                document.getElementById(
                    "updateBanner"
                ),

            updateButton:
                document.getElementById(
                    "updateButton"
                ),

            calculationPanel:
                document.getElementById(
                    "calculationPanel"
                ),

            calculationToggle:
                document.getElementById(
                    "calculationToggle"
                ),

            formulaWorkShare:
                document.getElementById(
                    "formulaWorkShare"
                ),

            formulaFullShare:
                document.getElementById(
                    "formulaFullShare"
                ),

            formulaWeek:
                document.getElementById(
                    "formulaWeek"
                ),

            formulaDay:
                document.getElementById(
                    "formulaDay"
                ),

            disclaimer:
                document.getElementById(
                    "disclaimer"
                ),

            toast:
                document.getElementById(
                    "toast"
                ),

            year:
                document.getElementById(
                    "year"
                )
        };

        elements.year.textContent =
            new Date().getFullYear();

        function parseNumber(value) {
            const normalizedValue =
                String(value)
                    .replace(",", ".");

            const parsedValue =
                Number.parseFloat(
                    normalizedValue
                );

            return Number.isFinite(parsedValue)
                ? parsedValue
                : 0;
        }

        function clamp(
            value,
            minimum,
            maximum
        ) {
            return Math.min(
                maximum,
                Math.max(
                    minimum,
                    value
                )
            );
        }

        function formatNumber(
            value,
            minimumFractionDigits = 2,
            maximumFractionDigits = 2
        ) {
            return value.toLocaleString(
                "no-NO",
                {
                    minimumFractionDigits,
                    maximumFractionDigits
                }
            );
        }

        function formatPercentage(value) {
            return value.toLocaleString(
                "no-NO",
                {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 1
                }
            );
        }

        function formatHours(value) {
            return value.toLocaleString(
                "no-NO",
                {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1
                }
            );
        }

        function formatTime(decimalHours) {
            const totalMinutes =
                Math.round(
                    Math.max(
                        0,
                        decimalHours
                    ) * 60
                );

            const hours =
                Math.floor(
                    totalMinutes / 60
                );

            const minutes =
                totalMinutes % 60;

            return `${hours} t ${minutes} min`;
        }

        function formatWorkDaysText(workDays) {
            return workDays === 1
                ? "én arbeidsdag"
                : `${workDays} arbeidsdager`;
        }

        function isIosDevice() {
            const userAgent =
                window.navigator.userAgent
                    .toLowerCase();

            const isTraditionalIos =
                /iphone|ipad|ipod/.test(
                    userAgent
                );

            const isModernIpad =
                navigator.platform ===
                    "MacIntel" &&
                navigator.maxTouchPoints > 1;

            return (
                isTraditionalIos ||
                isModernIpad
            );
        }

        function isStandaloneMode() {
            return (
                window.matchMedia(
                    "(display-mode: standalone)"
                ).matches ||
                window.navigator.standalone ===
                    true
            );
        }

        function validatePercentage(
            input,
            errorElement
        ) {
            const rawValue =
                input.value;

            const parsedValue =
                parseNumber(
                    rawValue
                );

            if (rawValue === "") {
                errorElement.textContent =
                    "Skriv inn en verdi mellom 0 og 100.";

                input.setAttribute(
                    "aria-invalid",
                    "true"
                );

                return false;
            }

            if (
                parsedValue < 0 ||
                parsedValue > 100
            ) {
                errorElement.textContent =
                    "Verdien må være mellom 0 og 100.";

                input.setAttribute(
                    "aria-invalid",
                    "true"
                );

                return false;
            }

            errorElement.textContent = "";

            input.removeAttribute(
                "aria-invalid"
            );

            return true;
        }

        function animateNumber(
            element,
            targetValue
        ) {
            const reducedMotion =
                window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches;

            if (reducedMotion) {
                element.textContent =
                    formatNumber(
                        targetValue
                    );

                return;
            }

            const existingValue =
                parseNumber(
                    element.textContent
                        .replace(/\s/g, "")
                );

            const startValue =
                Number.isFinite(existingValue)
                    ? existingValue
                    : 0;

            const duration = 280;
            const startTime = performance.now();

            function update(currentTime) {
                const progress =
                    Math.min(
                        (
                            currentTime -
                            startTime
                        ) / duration,
                        1
                    );

                const easedProgress =
                    1 -
                    Math.pow(
                        1 - progress,
                        3
                    );

                const currentValue =
                    startValue +
                    (
                        targetValue -
                        startValue
                    ) *
                    easedProgress;

                element.textContent =
                    formatNumber(
                        currentValue
                    );

                if (progress < 1) {
                    requestAnimationFrame(
                        update
                    );
                }
            }

            requestAnimationFrame(update);
        }

        function saveValues() {
            localStorage.setItem(
                STORAGE_KEYS.positionPercentage,
                elements.positionPercentage.value
            );

            localStorage.setItem(
                STORAGE_KEYS.sickLeavePercentage,
                elements.sickLeavePercentage.value
            );

            localStorage.setItem(
                STORAGE_KEYS.fullWeekHours,
                elements.fullWeekHours.value
            );

            localStorage.setItem(
                STORAGE_KEYS.workDays,
                elements.workDays.value
            );
        }

        function loadValues() {
            const savedPosition =
                localStorage.getItem(
                    STORAGE_KEYS.positionPercentage
                );

            const savedSickLeave =
                localStorage.getItem(
                    STORAGE_KEYS.sickLeavePercentage
                );

            const savedWeekHours =
                localStorage.getItem(
                    STORAGE_KEYS.fullWeekHours
                );

            const savedWorkDays =
                localStorage.getItem(
                    STORAGE_KEYS.workDays
                );

            if (savedPosition !== null) {
                elements.positionPercentage.value =
                    savedPosition;
            }

            if (savedSickLeave !== null) {
                elements.sickLeavePercentage.value =
                    savedSickLeave;
            }

            if (savedWeekHours !== null) {
                elements.fullWeekHours.value =
                    savedWeekHours;
            }

            if (savedWorkDays !== null) {
                elements.workDays.value =
                    savedWorkDays;
            }
        }

        function showInvalidResults() {
            elements.weeklyResult.textContent =
                "–";

            elements.weeklyTime.textContent =
                "Kontroller verdiene";

            elements.dailyResult.textContent =
                "–";

            elements.dailyTime.textContent =
                "Kontroller verdiene";
        }

        function updateDynamicText(workDays) {
            elements.dailyResultLabel.textContent =
                workDays === 1
                    ? "Arbeidstid denne arbeidsdagen"
                    : "Gjennomsnitt per arbeidsdag";

            elements.disclaimer.textContent =
                `Dagsresultatet viser et gjennomsnitt dersom ` +
                `arbeidstiden fordeles likt på ` +
                `${formatWorkDaysText(workDays)} per uke. ` +
                `Den faktiske fordelingen må avtales mellom ` +
                `arbeidsgiver og arbeidstaker.`;
        }

        function updateFormula({
            positionPercentage,
            sickLeavePercentage,
            workSharePercentage,
            fullPositionPercentage,
            fullWeekHours,
            workDays,
            weeklyHours,
            dailyHours
        }) {
            elements.formulaWorkShare.textContent =
                `100 % − ${formatPercentage(
                    sickLeavePercentage
                )} % = ${formatPercentage(
                    workSharePercentage
                )} %`;

            elements.formulaFullShare.textContent =
                `${formatPercentage(
                    positionPercentage
                )} % × ${formatPercentage(
                    workSharePercentage
                )} % = ${formatPercentage(
                    fullPositionPercentage
                )} %`;

            elements.formulaWeek.textContent =
                `${formatHours(
                    fullWeekHours
                )} t × ${formatPercentage(
                    fullPositionPercentage
                )} % = ${formatNumber(
                    weeklyHours
                )} t`;

            elements.formulaDay.textContent =
                `${formatNumber(
                    weeklyHours
                )} t ÷ ${workDays} = ${formatNumber(
                    dailyHours
                )} t`;
        }

        function calculate() {
            const positionIsValid =
                validatePercentage(
                    elements.positionPercentage,
                    elements.positionError
                );

            const sickLeaveIsValid =
                validatePercentage(
                    elements.sickLeavePercentage,
                    elements.sickLeaveError
                );

            const positionPercentage =
                clamp(
                    parseNumber(
                        elements
                            .positionPercentage
                            .value
                    ),
                    0,
                    100
                );

            const sickLeavePercentage =
                clamp(
                    parseNumber(
                        elements
                            .sickLeavePercentage
                            .value
                    ),
                    0,
                    100
                );

            const fullWeekHours =
                parseNumber(
                    elements.fullWeekHours.value
                );

            const workDays =
                clamp(
                    Math.round(
                        parseNumber(
                            elements.workDays.value
                        )
                    ),
                    1,
                    7
                );

            const workSharePercentage =
                100 -
                sickLeavePercentage;

            const fullPositionPercentage =
                positionPercentage *
                (
                    workSharePercentage /
                    100
                );

            elements
                .ownPositionPercentage
                .textContent =
                    `${formatPercentage(
                        workSharePercentage
                    )} %`;

            elements
                .fullPositionPercentage
                .textContent =
                    `${formatPercentage(
                        fullPositionPercentage
                    )} %`;

            updateDynamicText(
                workDays
            );

            if (
                !positionIsValid ||
                !sickLeaveIsValid
            ) {
                currentCalculation.isValid =
                    false;

                showInvalidResults();

                return;
            }

            const weeklyHours =
                fullWeekHours *
                (
                    fullPositionPercentage /
                    100
                );

            const dailyHours =
                weeklyHours /
                workDays;

            currentCalculation = {
                isValid: true,
                positionPercentage,
                sickLeavePercentage,
                fullWeekHours,
                workDays,
                workSharePercentage,
                fullPositionPercentage,
                weeklyHours,
                dailyHours
            };

            animateNumber(
                elements.weeklyResult,
                weeklyHours
            );

            elements.weeklyTime.textContent =
                formatTime(
                    weeklyHours
                );

            animateNumber(
                elements.dailyResult,
                dailyHours
            );

            elements.dailyTime.textContent =
                formatTime(
                    dailyHours
                );

            updateFormula({
                positionPercentage,
                sickLeavePercentage,
                workSharePercentage,
                fullPositionPercentage,
                fullWeekHours,
                workDays,
                weeklyHours,
                dailyHours
            });

            saveValues();
        }

        function buildShareText() {
            const calculation =
                currentCalculation;

            const daysText =
                calculation.workDays === 1
                    ? "1 arbeidsdag"
                    : `${calculation.workDays} arbeidsdager`;

            return [
                "OctaCore Sykemeldingskalkulator",
                "",
                `Stillingsstørrelse: ${formatPercentage(
                    calculation.positionPercentage
                )} %`,

                `Sykmeldingsgrad: ${formatPercentage(
                    calculation.sickLeavePercentage
                )} %`,

                `Arbeidsandel av egen stilling: ${formatPercentage(
                    calculation.workSharePercentage
                )} %`,

                `Tilsvarer av full stilling: ${formatPercentage(
                    calculation.fullPositionPercentage
                )} %`,

                `Full arbeidsuke: ${formatHours(
                    calculation.fullWeekHours
                )} timer`,

                `Arbeidsdager per uke: ${daysText}`,

                `Arbeidstid per uke: ${formatTime(
                    calculation.weeklyHours
                )}`,

                `Gjennomsnitt per arbeidsdag: ${formatTime(
                    calculation.dailyHours
                )}`,

                "",
                "Dagsresultatet er et gjennomsnitt. Den faktiske fordelingen må avtales mellom arbeidsgiver og arbeidstaker."
            ].join("\n");
        }

        function showToast(message) {
            elements.toast.textContent =
                message;

            elements.toast
                .classList
                .add("visible");

            if (toastTimeout !== null) {
                clearTimeout(
                    toastTimeout
                );
            }

            toastTimeout =
                window.setTimeout(
                    () => {
                        elements.toast
                            .classList
                            .remove("visible");
                    },
                    2600
                );
        }

        async function copyText(text) {
            if (
                navigator.clipboard &&
                window.isSecureContext
            ) {
                await navigator.clipboard.writeText(
                    text
                );

                return;
            }

            const textArea =
                document.createElement(
                    "textarea"
                );

            textArea.value = text;

            textArea.setAttribute(
                "readonly",
                ""
            );

            textArea.style.position =
                "fixed";

            textArea.style.left =
                "-9999px";

            textArea.style.opacity =
                "0";

            document.body.appendChild(
                textArea
            );

            textArea.select();

            const copySucceeded =
                document.execCommand(
                    "copy"
                );

            document.body.removeChild(
                textArea
            );

            if (!copySucceeded) {
                throw new Error(
                    "Kopiering mislyktes."
                );
            }
        }

        async function shareResult() {
            if (
                !currentCalculation.isValid
            ) {
                showToast(
                    "Kontroller verdiene før du deler"
                );

                return;
            }

            const shareText =
                buildShareText();

            const shareData = {
                title:
                    "OctaCore Sykemeldingskalkulator",

                text:
                    shareText
            };

            try {
                if (navigator.share) {
                    await navigator.share(
                        shareData
                    );

                    if (navigator.vibrate) {
                        navigator.vibrate(25);
                    }

                    showToast(
                        "Resultatet ble delt"
                    );

                    return;
                }

                await copyText(
                    shareText
                );

                if (navigator.vibrate) {
                    navigator.vibrate(25);
                }

                showToast(
                    "Resultatet er kopiert"
                );
            } catch (error) {
                if (
                    error &&
                    error.name ===
                        "AbortError"
                ) {
                    return;
                }

                try {
                    await copyText(
                        shareText
                    );

                    showToast(
                        "Resultatet er kopiert"
                    );
                } catch (copyError) {
                    console.error(
                        "Resultatet kunne ikke deles:",
                        copyError
                    );

                    showToast(
                        "Kunne ikke dele resultatet"
                    );
                }
            }
        }

        function resetCalculator(
            showConfirmation = true
        ) {
            elements.positionPercentage.value =
                DEFAULT_VALUES.positionPercentage;

            elements.sickLeavePercentage.value =
                DEFAULT_VALUES.sickLeavePercentage;

            elements.fullWeekHours.value =
                String(
                    DEFAULT_VALUES.fullWeekHours
                );

            elements.workDays.value =
                String(
                    DEFAULT_VALUES.workDays
                );

            Object
                .values(STORAGE_KEYS)
                .forEach(
                    key =>
                        localStorage.removeItem(
                            key
                        )
                );

            calculate();

            if (showConfirmation) {
                elements.positionPercentage.focus();

                showToast(
                    "Kalkulatoren er nullstilt"
                );
            }
        }

        function toggleCalculation() {
            const isOpen =
                elements
                    .calculationPanel
                    .classList
                    .toggle("open");

            elements
                .calculationToggle
                .setAttribute(
                    "aria-expanded",
                    String(isOpen)
                );
        }

        function openMenu() {
            elements.menuBackdrop
                .classList
                .add("visible");

            elements.menuBackdrop
                .setAttribute(
                    "aria-hidden",
                    "false"
                );

            document.body
                .classList
                .add("modal-open");

            elements.closeMenuButton.focus();
        }

        function closeMenu(
            restoreFocus = true,
            unlockPage = true
        ) {
            elements.menuBackdrop
                .classList
                .remove("visible");

            elements.menuBackdrop
                .setAttribute(
                    "aria-hidden",
                    "true"
                );

            if (unlockPage) {
                document.body
                    .classList
                    .remove("modal-open");
            }

            if (restoreFocus) {
                elements.moreButton.focus();
            }
        }

        function openAbout() {
            closeMenu(false, false);

            elements.aboutBackdrop
                .classList
                .add("visible");

            elements.aboutBackdrop
                .setAttribute(
                    "aria-hidden",
                    "false"
                );

            document.body
                .classList
                .add("modal-open");

            elements.closeAboutButton.focus();
        }

        function closeAbout(
            reopenMenu = false
        ) {
            elements.aboutBackdrop
                .classList
                .remove("visible");

            elements.aboutBackdrop
                .setAttribute(
                    "aria-hidden",
                    "true"
                );

            if (reopenMenu) {
                window.setTimeout(
                    openMenu,
                    80
                );

                return;
            }

            document.body
                .classList
                .remove("modal-open");

            elements.moreButton.focus();
        }

        function openPrivacy() {
            closeMenu(false, false);

            elements.privacyBackdrop
                .classList
                .add("visible");

            elements.privacyBackdrop
                .setAttribute(
                    "aria-hidden",
                    "false"
                );

            document.body
                .classList
                .add("modal-open");

            elements.closePrivacyButton.focus();
        }

        function closePrivacy(
            reopenMenu = false
        ) {
            elements.privacyBackdrop
                .classList
                .remove("visible");

            elements.privacyBackdrop
                .setAttribute(
                    "aria-hidden",
                    "true"
                );

            if (reopenMenu) {
                window.setTimeout(
                    openMenu,
                    80
                );

                return;
            }

            document.body
                .classList
                .remove("modal-open");

            elements.moreButton.focus();
        }

        function openContact() {
            closeMenu(false, false);

            elements.contactBackdrop
                .classList
                .add("visible");

            elements.contactBackdrop
                .setAttribute(
                    "aria-hidden",
                    "false"
                );

            document.body
                .classList
                .add("modal-open");

            elements.closeContactButton.focus();
        }

        function closeContact(
            reopenMenu = false
        ) {
            elements.contactBackdrop
                .classList
                .remove("visible");

            elements.contactBackdrop
                .setAttribute(
                    "aria-hidden",
                    "true"
                );

            if (reopenMenu) {
                window.setTimeout(
                    openMenu,
                    80
                );

                return;
            }

            document.body
                .classList
                .remove("modal-open");

            elements.moreButton.focus();
        }

        function openUpdates() {
            closeMenu(false, false);

            elements.updatesBackdrop
                .classList
                .add("visible");

            elements.updatesBackdrop
                .setAttribute(
                    "aria-hidden",
                    "false"
                );

            document.body
                .classList
                .add("modal-open");

            elements.closeUpdatesButton.focus();
        }

        function closeUpdates(
            reopenMenu = false
        ) {
            elements.updatesBackdrop
                .classList
                .remove("visible");

            elements.updatesBackdrop
                .setAttribute(
                    "aria-hidden",
                    "true"
                );

            if (reopenMenu) {
                window.setTimeout(
                    openMenu,
                    80
                );

                return;
            }

            document.body
                .classList
                .remove("modal-open");

            elements.moreButton.focus();
        }

        async function shareApp() {
            const appUrl =
                window.location.origin +
                window.location.pathname;

            const shareText =
                "Jeg fant en enkel kalkulator for gradert sykmelding fra OctaCore. Kanskje den kan være nyttig for deg også.";

            const shareData = {
                title:
                    "OctaCore Sykemeldingskalkulator",

                text:
                    shareText,

                url:
                    appUrl
            };

            try {
                if (navigator.share) {
                    await navigator.share(
                        shareData
                    );

                    closeMenu();

                    showToast(
                        "Appen ble delt"
                    );

                    return;
                }

                await copyText(
                    `${shareText}\n\n${appUrl}`
                );

                closeMenu();

                showToast(
                    "Lenken til appen er kopiert"
                );
            } catch (error) {
                if (
                    error &&
                    error.name === "AbortError"
                ) {
                    return;
                }

                try {
                    await copyText(
                        `${shareText}\n\n${appUrl}`
                    );

                    closeMenu();

                    showToast(
                        "Lenken til appen er kopiert"
                    );
                } catch (copyError) {
                    console.error(
                        "Appen kunne ikke deles:",
                        copyError
                    );

                    showToast(
                        "Kunne ikke dele appen"
                    );
                }
            }
        }

        function showComingSoon(message) {
            showToast(message);
        }

        function showInstallArea() {
            if (isStandaloneMode()) {
                elements.installArea
                    .classList
                    .remove("visible");

                return;
            }

            if (deferredInstallPrompt) {
                elements.installButtonText.textContent =
                    "Installer app";

                elements.installArea
                    .classList
                    .add("visible");

                return;
            }

            if (isIosDevice()) {
                elements.installButtonText.textContent =
                    "Legg til på Hjem-skjerm";

                elements.installArea
                    .classList
                    .add("visible");
            }
        }

        function hideInstallArea() {
            elements.installArea
                .classList
                .remove("visible");
        }

        function openInstallModal() {
            elements.installModal
                .classList
                .add("visible");

            elements.installModal
                .setAttribute(
                    "aria-hidden",
                    "false"
                );

            document.body
                .classList
                .add("modal-open");

            elements.closeInstallModal
                .focus();
        }

        function closeInstallModal() {
            elements.installModal
                .classList
                .remove("visible");

            elements.installModal
                .setAttribute(
                    "aria-hidden",
                    "true"
                );

            document.body
                .classList
                .remove("modal-open");

            elements.installButton.focus();
        }

        async function installApp() {
            if (isStandaloneMode()) {
                hideInstallArea();

                showToast(
                    "Appen er allerede installert"
                );

                return;
            }

            if (deferredInstallPrompt) {
                deferredInstallPrompt.prompt();

                const choiceResult =
                    await deferredInstallPrompt
                        .userChoice;

                if (
                    choiceResult.outcome ===
                    "accepted"
                ) {
                    showToast(
                        "Installerer appen"
                    );
                }

                deferredInstallPrompt = null;

                hideInstallArea();

                return;
            }

            if (isIosDevice()) {
                openInstallModal();

                return;
            }

            showToast(
                "Bruk nettlesermenyen for å installere appen"
            );
        }

        function showUpdateBanner(
            serviceWorker
        ) {
            waitingServiceWorker =
                serviceWorker;

            elements.updateBanner
                .classList
                .add("visible");
        }

        function hideUpdateBanner() {
            elements.updateBanner
                .classList
                .remove("visible");
        }

        function activateUpdate() {
            if (!waitingServiceWorker) {
                return;
            }

            elements.updateButton.disabled =
                true;

            elements.updateButton.textContent =
                "Oppdaterer…";

            waitingServiceWorker.postMessage({
                type: "SKIP_WAITING"
            });
        }

        function registerServiceWorker() {
            if (
                !(
                    "serviceWorker" in
                    navigator
                )
            ) {
                return;
            }

            window.addEventListener(
                "load",
                async () => {
                    try {
                        const registration =
                            await navigator
                                .serviceWorker
                                .register(
                                    "./service-worker.js"
                                );

                        if (
                            registration.waiting &&
                            navigator
                                .serviceWorker
                                .controller
                        ) {
                            showUpdateBanner(
                                registration.waiting
                            );
                        }

                        registration.addEventListener(
                            "updatefound",
                            () => {
                                const newWorker =
                                    registration
                                        .installing;

                                if (!newWorker) {
                                    return;
                                }

                                newWorker.addEventListener(
                                    "statechange",
                                    () => {
                                        if (
                                            newWorker.state ===
                                                "installed" &&
                                            navigator
                                                .serviceWorker
                                                .controller
                                        ) {
                                            showUpdateBanner(
                                                newWorker
                                            );
                                        }
                                    }
                                );
                            }
                        );

                        window.setInterval(
                            () => {
                                registration
                                    .update()
                                    .catch(
                                        error => {
                                            console.debug(
                                                "Kunne ikke kontrollere oppdatering:",
                                                error
                                            );
                                        }
                                    );
                            },
                            60 * 60 * 1000
                        );
                    } catch (error) {
                        console.error(
                            "Service worker kunne ikke registreres:",
                            error
                        );
                    }
                }
            );

            navigator
                .serviceWorker
                .addEventListener(
                    "controllerchange",
                    () => {
                        if (
                            isReloadingForUpdate
                        ) {
                            return;
                        }

                        isReloadingForUpdate =
                            true;

                        hideUpdateBanner();

                        window.location.reload();
                    }
                );
        }

        function handleLaunchAction() {
            const url =
                new URL(
                    window.location.href
                );

            if (
                url.searchParams.get(
                    "action"
                ) !== "new"
            ) {
                return;
            }

            resetCalculator(false);

            url.searchParams.delete(
                "action"
            );

            window.history.replaceState(
                {},
                document.title,
                url.pathname +
                url.search +
                url.hash
            );
        }

        elements
            .positionPercentage
            .addEventListener(
                "input",
                calculate
            );

        elements
            .sickLeavePercentage
            .addEventListener(
                "input",
                calculate
            );

        elements
            .fullWeekHours
            .addEventListener(
                "change",
                calculate
            );

        elements
            .workDays
            .addEventListener(
                "change",
                calculate
            );

        elements
            .shareButton
            .addEventListener(
                "click",
                shareResult
            );

        elements
            .resetButton
            .addEventListener(
                "click",
                () =>
                    resetCalculator(true)
            );

        elements
            .moreButton
            .addEventListener(
                "click",
                openMenu
            );

        elements
            .closeMenuButton
            .addEventListener(
                "click",
                closeMenu
            );

        elements
            .menuBackdrop
            .addEventListener(
                "click",
                event => {
                    if (
                        event.target ===
                        elements.menuBackdrop
                    ) {
                        closeMenu();
                    }
                }
            );

        elements
            .shareAppButton
            .addEventListener(
                "click",
                shareApp
            );

        elements
            .aboutAppButton
            .addEventListener(
                "click",
                openAbout
            );

        elements
            .aboutBackButton
            .addEventListener(
                "click",
                () => closeAbout(true)
            );

        elements
            .closeAboutButton
            .addEventListener(
                "click",
                () => closeAbout(false)
            );

        elements
            .aboutBackdrop
            .addEventListener(
                "click",
                event => {
                    if (
                        event.target ===
                        elements.aboutBackdrop
                    ) {
                        closeAbout(false);
                    }
                }
            );

        elements
            .privacyButton
            .addEventListener(
                "click",
                openPrivacy
            );

        elements
            .privacyBackButton
            .addEventListener(
                "click",
                () => closePrivacy(true)
            );

        elements
            .closePrivacyButton
            .addEventListener(
                "click",
                () => closePrivacy(false)
            );

        elements
            .privacyBackdrop
            .addEventListener(
                "click",
                event => {
                    if (
                        event.target ===
                        elements.privacyBackdrop
                    ) {
                        closePrivacy(false);
                    }
                }
            );

        elements
            .contactButton
            .addEventListener(
                "click",
                openContact
            );

        elements
            .contactBackButton
            .addEventListener(
                "click",
                () => closeContact(true)
            );

        elements
            .closeContactButton
            .addEventListener(
                "click",
                () => closeContact(false)
            );

        elements
            .contactBackdrop
            .addEventListener(
                "click",
                event => {
                    if (
                        event.target ===
                        elements.contactBackdrop
                    ) {
                        closeContact(false);
                    }
                }
            );

        elements
            .updatesButton
            .addEventListener(
                "click",
                openUpdates
            );

        elements
            .updatesBackButton
            .addEventListener(
                "click",
                () => closeUpdates(true)
            );

        elements
            .closeUpdatesButton
            .addEventListener(
                "click",
                () => closeUpdates(false)
            );

        elements
            .updatesBackdrop
            .addEventListener(
                "click",
                event => {
                    if (
                        event.target ===
                        elements.updatesBackdrop
                    ) {
                        closeUpdates(false);
                    }
                }
            );

        elements
            .languageButton
            .addEventListener(
                "click",
                () =>
                    showComingSoon(
                        "Flere språk kommer i versjon 1.1"
                    )
            );

        elements
            .installButton
            .addEventListener(
                "click",
                installApp
            );

        elements
            .closeInstallModal
            .addEventListener(
                "click",
                closeInstallModal
            );

        elements
            .installModal
            .addEventListener(
                "click",
                event => {
                    if (
                        event.target ===
                        elements.installModal
                    ) {
                        closeInstallModal();
                    }
                }
            );

        elements
            .updateButton
            .addEventListener(
                "click",
                activateUpdate
            );

        elements
            .calculationToggle
            .addEventListener(
                "click",
                toggleCalculation
            );

        document.addEventListener(
            "keydown",
            event => {
                if (event.key !== "Escape") {
                    return;
                }

                if (
                    elements.updatesBackdrop
                        .classList
                        .contains("visible")
                ) {
                    closeUpdates(false);
                    return;
                }

                if (
                    elements.contactBackdrop
                        .classList
                        .contains("visible")
                ) {
                    closeContact(false);
                    return;
                }

                if (
                    elements.privacyBackdrop
                        .classList
                        .contains("visible")
                ) {
                    closePrivacy(false);
                    return;
                }

                if (
                    elements.aboutBackdrop
                        .classList
                        .contains("visible")
                ) {
                    closeAbout(false);
                    return;
                }

                if (
                    elements.menuBackdrop
                        .classList
                        .contains("visible")
                ) {
                    closeMenu();
                    return;
                }

                if (
                    elements.installModal
                        .classList
                        .contains("visible")
                ) {
                    closeInstallModal();
                }
            }
        );

        window.addEventListener(
            "beforeinstallprompt",
            event => {
                event.preventDefault();

                deferredInstallPrompt =
                    event;

                showInstallArea();
            }
        );

        window.addEventListener(
            "appinstalled",
            () => {
                deferredInstallPrompt =
                    null;

                hideInstallArea();

                showToast(
                    "Appen er installert"
                );
            }
        );

        loadValues();
        handleLaunchAction();
        calculate();
        showInstallArea();
        registerServiceWorker();
