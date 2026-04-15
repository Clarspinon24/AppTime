    // ============================================================
    //  UTILITAIRES
    // ============================================================

    function toSeconds(h, m, s) {
      return (h * 3600) + (m * 60) + s;
    }

    function fromSeconds(totalSeconds) {
      const negative = totalSeconds < 0;
      const abs = Math.abs(totalSeconds);
      const days = Math.floor(abs / 86400);
      const h    = Math.floor((abs % 86400) / 3600);
      const m    = Math.floor((abs % 3600) / 60);
      const s    = abs % 60;
      return { negative, days, h, m, s };
    }

    function pad(n) {
      return String(n).padStart(2, '0');
    }

    function format(obj) {
      const sign  = obj.negative ? '−' : '';
      const parts = [];
      if (obj.days > 0) parts.push(`${obj.days}j`);
      if (obj.h > 0)    parts.push(`${pad(obj.h)}h`);
      if (obj.m > 0)    parts.push(`${pad(obj.m)}min`);
      parts.push(`${pad(obj.s)}s`);
      return sign + parts.join(' ');
    }
