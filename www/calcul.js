
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

function saveSolde() {
    const nouveauSolde = document.getElementById('solde-input').value;
    if(nouveauSolde === "") return;

    // On enregistre dans le téléphone
    localStorage.setItem('monSoldeResto', parseFloat(nouveauSolde).toFixed(2));
    
    // On met à jour l'affichage immédiatement
    rafraichirAffichageResto();
    
    alert("Solde mis à jour !");
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
    
    // On met à jour l'interface (ce qui va griser les boutons)
    refreshPointageUI(dateCle, historique[dateCle]);
}

function refreshPointageUI(date, infos) {
    const btnMatin = document.getElementById('btn-matin');
    const btnSoir = document.getElementById('btn-soir');
    const status = document.getElementById('status-badge');

    // Sécurité : On grise les boutons selon l'état
    if (infos.arrivee) {
        btnMatin.disabled = true;
        btnMatin.style.opacity = "0.5";
        status.innerText = `Arrivé le matin à : ${infos.arrivee}`;
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

// LA FONCTION DE SECOURS (DEBUG/MODIF)
function resetPointage() {
    const dateCle = new Date().toLocaleDateString();
    if (confirm("Voulez-vous effacer les pointages d'aujourd'hui pour recommencer ?")) {
        let historique = JSON.parse(localStorage.getItem('pointage_travail') || '{}');
        delete historique[dateCle]; // On supprime juste la journée actuelle
        localStorage.setItem('pointage_travail', JSON.stringify(historique));
        
        // On remet l'interface à zéro
        document.getElementById('status-badge').innerText = "Prêt pour le badgeage";
        document.getElementById('btn-matin').disabled = false;
        document.getElementById('btn-matin').style.opacity = "1";
        document.getElementById('btn-soir').disabled = false;
        document.getElementById('btn-soir').style.opacity = "1";
        
        alert("Pointages effacés pour aujourd'hui.");
    }
}