document.addEventListener("DOMContentLoaded", function() {
    // 1. Gestion de l'anonymat
    const anonymatSelect = document.getElementById('anonymat');
    const detailsSection = document.getElementById('details');

    function toggleDetailsVisibility() {
        if (anonymatSelect && detailsSection) {
            detailsSection.classList.toggle('hidden', anonymatSelect.value !== 'non');
        }
    }

    if (anonymatSelect && detailsSection) {
        anonymatSelect.addEventListener('change', toggleDetailsVisibility);
        toggleDetailsVisibility(); // Initialisation à l'ouverture
    }

    // 2. Fonction générique pour gérer les sections
    function setupSectionToggle(selectorId, sections, hiddenClass = 'hidden') {
        const selector = document.getElementById(selectorId);
        if (!selector) return;

        // Initialiser toutes les sections comme cachées
        Object.values(sections).forEach(section => {
            if (section) section.classList.add(hiddenClass);
        });

        selector.addEventListener('change', function() {
            // Cacher toutes les sections
            Object.values(sections).forEach(section => {
                if (section) section.classList.add(hiddenClass);
            });

            // Afficher la section sélectionnée
            if (this.value && sections[this.value]) {
                sections[this.value].classList.remove(hiddenClass);
            }

            // Si une option est sélectionnée dans la liste déroulante secondaire, afficher la section description
            const descriptionSection = document.getElementById('description-section');
            if (descriptionSection && this.value) {
                descriptionSection.classList.remove('hidden');
            }
        });

        // Déclencher l'événement pour l'état initial
        selector.dispatchEvent(new Event('change'));
    }

    // 3. Configuration des sections

    // Section Risque
    setupSectionToggle('typeRisque', {
        detournementActifsFinanciers: document.getElementById('detournementActifsFinanciersDetails'),
        detournementActifsPhysiques: document.getElementById('detournementActifsPhysiquesDetails'),
        corruptionDetails: document.getElementById('corruptionDetails')
    });

    // Section Conformité (avec classe spécifique)
    setupSectionToggle('typeConformite', {
        corruption: document.getElementById('corruption'),
        corruptionFacturation: document.getElementById('corruptionFacturation'),
        extorsion: document.getElementById('extorsion'),
        collusion: document.getElementById('collusion'),
        cadeauxVoyagesLoisirs: document.getElementById('cadeauxVoyagesLoisirs'),
        blanchimentArgent: document.getElementById('blanchimentArgent'),
        signauxAlertes: document.getElementById('signauxAlertes')
    }, 'conformite-hidden');

    // Section RH
    setupSectionToggle('typeHarcèlement', {
        harcelement: document.getElementById('harcelement'),
        harcelementSexuel: document.getElementById('harcelementSexuel')
    });

    // 4. Gestion des entités principales (Risque/Conformité/RH)
    const entiteSelector = document.getElementById('entite');
    const descriptionSection = document.getElementById('description-section');
    if (entiteSelector) {
        entiteSelector.addEventListener('change', function() {
            document.querySelectorAll('.section').forEach(section => {
                section.classList.add('hidden');
            });

            // Réinitialiser la section description à chaque fois
            if (descriptionSection) {
                descriptionSection.classList.add('hidden');
            }

            if (this.value) {
                const activeSection = document.getElementById(`section-${this.value}`);
                if (activeSection) {
                    activeSection.classList.remove('hidden');

                    // Réinitialiser les sélections quand on change d'entité
                    const subSelectors = activeSection.querySelectorAll('select');
                    subSelectors.forEach(select => {
                        select.selectedIndex = 0;
                        select.dispatchEvent(new Event('change'));
                    });
                }
            }
        });

        // Initialiser l'entité
        entiteSelector.dispatchEvent(new Event('change'));
    }

    // 5. Soumission du formulaire
    const form = document.getElementById("whistleblowing-form");
    if (form) {
        form.addEventListener("submit", async function(event) {
            event.preventDefault();

            // Récupération des données
            const formData = new FormData(form);
            const formObj = Object.fromEntries(formData.entries());

            // Validation des champs obligatoires
            const requiredFields = {
                'entite': "Veuillez sélectionner une entité",
                'description': "Veuillez décrire l'alerte",
                'personnes-impliquees': "Veuillez indiquer les personnes impliquées",
                'lieu-temps': "Veuillez préciser le lieu et la date"
            };

            for (const [field, message] of Object.entries(requiredFields)) {
                const fieldValue = formObj[field];
                if (!fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '')) {
                    const inputField = form.querySelector(`[name="${field}"]`);
                    if (inputField) {
                        inputField.style.border = "1px solid red";
                        inputField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        inputField.focus();
                    }
                    alert(message);
                    return;
                }
            }

            // Envoi des données
            try {
                const response = await fetch(form.action, {
                    method: form.method,
                    body: new URLSearchParams(formObj)
                });

                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }

                const result = await response.text();
                alert("Votre alerte a été envoyée avec succès !");
                form.reset();

                // Réinitialiser l'interface
                document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
                document.querySelectorAll('input[type="text"], textarea').forEach(field => {
                    field.style.border = "";
                });

            } catch (error) {
                console.error("Erreur d'envoi:", error);
                alert("Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
            }
        });

        // Réinitialiser les styles de validation
        form.querySelectorAll('input, textarea, select').forEach(field => {
            field.addEventListener('input', function() {
                this.style.border = "";
            });
        });
    }
});
