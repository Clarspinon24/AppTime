    // ============================================================
    //  UI
    // ============================================================

    const now   = new Date();
    const later = new Date(now.getTime() + 3 * 86400000);
    const fmt   = d => d.toISOString().slice(0, 10);
    document.getElementById('dt1').value = fmt(now);
    document.getElementById('dt2').value = fmt(later);

    function gv(id) { return parseInt(document.getElementById(id).value) || 0; }

    function showResult(id, val, note) {
      document.getElementById(id).classList.add('show');
      document.getElementById(id + '-val').textContent  = val;
      document.getElementById(id + '-note').textContent = note || '';
    }

    function doAdd(op) {
      const r = addSubtractTime(gv('s-h'), gv('s-m'), gv('s-s'), gv('d-h'), gv('d-m'), gv('d-s'), op);
      showResult('res-add', r.result, r.overflowLabel);
    }

    function doElapsed() {
      const r = elapsedTime(gv('e1-h'), gv('e1-m'), gv('e1-s'), gv('e2-h'), gv('e2-m'), gv('e2-s'));
      showResult('res-elapsed', r.result, r.nextDay ? '(passage minuit — fin le lendemain)' : '');
    }

    function doDateDiff() {
      const r = dateDiff(document.getElementById('dt1').value, document.getElementById('dt2').value);
      if (r.error) { alert(r.error); return; }
      const note = r.negative
        ? 'La date de fin est avant la date de début'
        : `soit ${r.totalDays} jour${r.totalDays > 1 ? 's' : ''} au total`;
      showResult('res-date', r.result, note);
    }
    
      const add = document.getElementById("add")
      const h = document.getElementById("h")
      const j = document.getElementById("j")
      const travail = document.getElementById("btn_travail")

      const allSection = document.querySelectorAll(".section");
    function showSection(id) {
      // Cache l'accueil dès qu'on clique sur un onglet
      document.getElementById('accueil').style.display = 'none';

      allSection.forEach(sec => sec.classList.remove("visible"));
      const target = document.getElementById(id);
      target.classList.add("visible");
    }

      add.addEventListener("click", () => showSection("section_add"));
      h.addEventListener("click", () => showSection("section_h"));
      j.addEventListener("click", () => showSection("section_j"));
      travail.addEventListener("click", () => showSection("section_travail"));
     
     

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('Service Worker enregistré !', reg))
        .catch(err => console.warn('Erreur de Service Worker', err));
    });
  }