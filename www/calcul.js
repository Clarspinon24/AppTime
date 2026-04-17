function toSeconds(h, m, s) {
    return h * 3600 + m * 60 + s;
}

function fromSeconds(s) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return { h, m, s: sec };
}

function pad(n) {
    return n.toString().padStart(2, '0');
}

function format(obj) {
    return `${pad(obj.h)}h ${pad(obj.m)}min`;
}
    // ============================================================
    //  1. AJOUTER / SOUSTRAIRE
    // ============================================================

    function addSubtractTime(startH, startM, startS, durH, durM, durS, op) {
    const startSec = toSeconds(startH, startM, startS);
    const durSec   = toSeconds(durH, durM, durS);
    const totalSec = op === 'add' ? startSec + durSec : startSec - durSec;

    const overflow = Math.floor(totalSec / 86400);
    let inDay = totalSec % 86400;
    if (inDay < 0) inDay += 86400;

    const h = Math.floor(inDay / 3600);
    const m = Math.floor((inDay % 3600) / 60);
    const s = inDay % 60;

    let overflowLabel = '';
    if (overflow > 0) overflowLabel = `+${overflow} jour${overflow > 1 ? 's' : ''}`;
    if (overflow < 0) overflowLabel = `${overflow} jour${Math.abs(overflow) > 1 ? 's' : ''}`;

    return { result: `${pad(h)}h ${pad(m)}min ${pad(s)}s`, overflow, overflowLabel };
    }

    // ============================================================
    //  2. DURÉE ÉCOULÉE
    // ============================================================

    function elapsedTime(h1, m1, s1, h2, m2, s2) {
    let diff = toSeconds(h2, m2, s2) - toSeconds(h1, m1, s1);
    const nextDay = diff < 0;
    if (nextDay) diff += 86400;
    const obj = fromSeconds(diff);
    return { result: format(obj), totalMinutes: Math.floor(diff / 60), totalSeconds: diff, nextDay };
    }

    // ============================================================
    //  3. ÉCART ENTRE DEUX DATES (Version avec Mois)
    // ============================================================

function dateDiff(dateStr1, dateStr2) {
let d1 = new Date(dateStr1);
let d2 = new Date(dateStr2);

if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    return { error: 'Dates invalides.', result: null, negative: false };
}

const negative = d2 < d1;
// Si c'est négatif, on inverse pour faire le calcul
if (negative) { [d1, d2] = [d2, d1]; }

let months = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
let tempD1 = new Date(d1);
tempD1.setMonth(tempD1.getMonth() + months);

// Ajustement si le jour du mois de d2 est inférieur à d1
if (tempD1 > d2) {
    months--;
    tempD1 = new Date(d1);
    tempD1.setMonth(tempD1.getMonth() + months);
}

const diffMs = d2 - tempD1;
const totalDaysRemaining = Math.floor(diffMs / 86400000);
const weeks = Math.floor(totalDaysRemaining / 7);
const days = totalDaysRemaining % 7;

// Calcul du total de jours absolu (pour la note)
const absoluteTotalDays = Math.floor(Math.abs(new Date(dateStr2) - new Date(dateStr1)) / 86400000);

const parts = [];
if (months > 0) parts.push(`${months} mois`);
if (weeks > 0) parts.push(`${weeks} semaine${weeks > 1 ? 's' : ''}`);
if (days > 0) parts.push(`${days} jour${days > 1 ? 's' : ''}`);

if (parts.length === 0) parts.push('0 jour');

return {
    result: (negative ? '−' : '') + parts.join(' '),
    totalDays: absoluteTotalDays,
    negative,
    error: null,
};
}

// ============================================================
//  4. GESTION DE LA CARTE RESTAURANT
// ============================================================

// Fonction pour mettre à jour l'ATH (l'affichage à l'écran)
function rafraichirAffichageResto() {
    const soldeStocke = localStorage.getItem('monSoldeResto') || '0.00';
    document.getElementById('affichage-solde').innerText = soldeStocke;
    document.getElementById('solde-input').value = soldeStocke;
}



// Appeler au chargement de la page
window.addEventListener('load', rafraichirAffichageResto);

// Variable d'état pour le toggle du solde
let isInputVisible = false;

function toggleSoldeInput() {
    const inputField = document.getElementById('solde-input');
    const updateBtn = document.getElementById('submit');
    const cancelBtn = document.getElementById('cancel-btn');

    if (isInputVisible) {
        // État actuel : input visible → on veut sauvegarder
        saveSolde();
    } else {
        // État actuel : input caché → on veut l'afficher
        inputField.style.display = 'block';
        updateBtn.textContent = 'Valider';
        cancelBtn.style.display = 'inline-block';
        isInputVisible = true;
    }
}

function saveSolde() {
    const nouveauSolde = document.getElementById('solde-input').value;
    const inputField = document.getElementById('solde-input');
    const updateBtn = document.getElementById('submit');
    const cancelBtn = document.getElementById('cancel-btn');

    if (nouveauSolde === '') return;

    localStorage.setItem('monSoldeResto', parseFloat(nouveauSolde).toFixed(2));
    rafraichirAffichageResto();
    
    // Fermer l'input
    inputField.style.display = 'none';
    updateBtn.textContent = 'Modifier';
    cancelBtn.style.display = 'none';
    isInputVisible = false;
}

function cancelSolde() {
    const inputField = document.getElementById('solde-input');
    const updateBtn = document.getElementById('submit');
    const cancelBtn = document.getElementById('cancel-btn');

    // Fermer l'input sans sauvegarder
    inputField.style.display = 'none';
    updateBtn.textContent = 'Modifier';
    cancelBtn.style.display = 'none';
    isInputVisible = false;
}

// ============================================================
//  5. GESTION DU POINTAGE (35h)
// ============================================================

function doBadge(type) {
    const maintenant = new Date();
    const dateCle = maintenant.toLocaleDateString();
    const heureStr = maintenant.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let historique = JSON.parse(localStorage.getItem('pointage_travail') || '{}');

    if (!historique[dateCle]) {
        historique[dateCle] = { arrivee: null, depart: null };
    }

    if (type === 'Matin') {
        historique[dateCle].arrivee = heureStr;
    } else {
        historique[dateCle].depart = heureStr;
    }

    localStorage.setItem('pointage_travail', JSON.stringify(historique));
    
    // MISE À JOUR DE TOUT L'AFFICHAGE
    refreshPointageUI(dateCle, historique[dateCle]);
    calculerTotalSemaine(); // <--- Ajouté
    afficherHistorique();   // <--- Ajouté
    mettreAJourTableHistorique(); // Mise à jour de la table hebdo
}

function refreshPointageUI(date, infos) {
    const btnMatin = document.getElementById('btn-matin');
    const btnSoir = document.getElementById('btn-soir');
    const status = document.getElementById('status-badge');

    if (infos.arrivee) {
        btnMatin.disabled = true;
        btnMatin.style.opacity = "0.5";
        
        // Calculer l'heure de départ (7h 45 + heure d'arrivée)
        const [h, m] = infos.arrivee.split(':').map(Number);
        const arriveeEnMinutes = h * 60 + m;
        let departEnMinutes = arriveeEnMinutes + (7 * 60 + 45); // 7h 45 de travail
        
        // Gérer le dépassement de 24h
        const departH = Math.floor(departEnMinutes / 60) % 24;
        const departM = departEnMinutes % 60;
        const heureDepart = `${String(departH).padStart(2, '0')}:${String(departM).padStart(2, '0')}`;
        
        status.innerText = `Vous êtes arrivé à  ${infos.arrivee}\n vous devez donc partir à ${heureDepart}`;
    } else {
        btnMatin.disabled = false;
        btnMatin.style.opacity = "1";
    }

    if (infos.depart) {
        btnSoir.disabled = true;
        btnSoir.style.opacity = "0.5";
        status.innerText = `Journée finie (${infos.arrivee} - ${infos.depart})`;
    } else {
        btnSoir.disabled = false;
        btnSoir.style.opacity = "1";
    }
}

// --- NOUVELLES FONCTIONS DE CALCUL ET HISTORIQUE ---

function calculerTotalSemaine() {
    let historique = JSON.parse(localStorage.getItem('pointage_travail') || '{}');
    let totalMinutesSemaine = 0;
    
    const maintenant = new Date();
    const jourSemaine = maintenant.getDay() || 7; 
    const lundi = new Date(maintenant);
    lundi.setDate(maintenant.getDate() - jourSemaine + 1);
    lundi.setHours(0,0,0,0);

    for (let dateStr in historique) {
        // On transforme "16/04/2026" en objet Date pour comparer
        let parts = dateStr.split('/');
        let datePointage = new Date(parts[2], parts[1] - 1, parts[0]);

        if (datePointage >= lundi && historique[dateStr].arrivee && historique[dateStr].depart) {
            const [h1, min1] = historique[dateStr].arrivee.split(':').map(Number);
            const [h2, min2] = historique[dateStr].depart.split(':').map(Number);
            
            // On utilise ta fonction elapsedTime du début du script
            const diff = elapsedTime(h1, min1, 0, h2, min2, 0);
            totalMinutesSemaine += diff.totalMinutes;
        }
    }

    const h = Math.floor(totalMinutesSemaine / 60);
    const m = totalMinutesSemaine % 60;
    const texte = `${h}h ${m}min / 35h`;
    
    if(document.getElementById('total-semaine')) document.getElementById('total-semaine').innerText = "Total semaine : " + texte;
    if(document.getElementById('total-accueil')) document.getElementById('total-accueil').innerText = "Cette semaine : " + texte;
}

function afficherHistorique() {
    let historique = JSON.parse(localStorage.getItem('pointage_travail') || '{}');
    let html = "";
    
    // Tri décroissant (plus récent en haut)
    let datesTriees = Object.keys(historique).sort((a, b) => {
        const d1 = a.split('/').reverse().join('');
        const d2 = b.split('/').reverse().join('');
        return d2.localeCompare(d1);
    });

    datesTriees.forEach(date => {
        let jour = historique[date];
        let dureeText = "";
        
        if(jour.arrivee && jour.depart) {
            const [h1, min1] = jour.arrivee.split(':').map(Number);
            const [h2, min2] = jour.depart.split(':').map(Number);
            dureeText = ` (${elapsedTime(h1, min1, 0, h2, min2, 0).result})`;
        }

        html += `<div style="border-bottom: 1px solid #eee; padding: 8px 0; display:flex; justify-content: space-between;">
                    <span><strong>${date}</strong></span>
                    <span>${jour.arrivee || '--'} ➔ ${jour.depart || '--'} <small>${dureeText}</small></span>
                 </div>`;
    });

    const listContainer = document.getElementById('logs-aujourdhui');
    if(listContainer) listContainer.innerHTML = html || "Aucun historique.";
}

function resetPointage() {
    const dateCle = new Date().toLocaleDateString();
    if (confirm("Voulez-vous effacer les pointages d'aujourd'hui ?")) {
        let historique = JSON.parse(localStorage.getItem('pointage_travail') || '{}');
        delete historique[dateCle];
        localStorage.setItem('pointage_travail', JSON.stringify(historique));
        
        // On rafraîchit tout
        location.reload(); // Plus simple pour tout remettre à zéro proprement
    }
}

// Au chargement de la page, on initialise tout
window.addEventListener('load', () => {
    const dateCle = new Date().toLocaleDateString();
    const historique = JSON.parse(localStorage.getItem('pointage_travail') || '{}');
    
    if (historique[dateCle]) {
        refreshPointageUI(dateCle, historique[dateCle]);
    }
    
    calculerTotalSemaine();
    afficherHistorique();
    rafraichirAffichageResto();
    mettreAJourTableHistorique(); // Mise à jour de la table au chargement
});