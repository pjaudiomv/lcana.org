function buildLCANATrifoldHTML() {
  const date = new Date();
  const printed = date.toLocaleDateString('en-US', {timeZone:'America/New_York',month:'long',day:'numeric',year:'numeric'});
  const month = date.toLocaleDateString('en-US', {timeZone:'America/New_York',month:'long',year:'numeric'});
  const logo = new URL('lcana-logo.png', location.href).href;
  const dayBlock = name => `<section class="day"><h2>${name.toUpperCase()}</h2>${meetings.filter(m=>m[0]===name).map(m=>`<article><b class="time">${esc(m[1].replace(/\s/g,''))}</b><div><strong>${esc(m[2])}${m[4]?' ('+esc(m[4])+')':''}</strong><div>${esc(m[3])}</div>${m[5]?'<div>'+esc(m[5])+'</div>':''}</div></article>`).join('')}</section>`;
  const entries = Object.entries(legend);
  const left = entries.slice(0, Math.ceil(entries.length/2));
  const right = entries.slice(left.length);
  const legendRows = left.map((x,i)=>`<tr><td>${esc(x[0])}</td><td>${esc(x[1])}</td><td>${esc(right[i]?.[0]||'')}</td><td>${esc(right[i]?.[1]||'')}</td></tr>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>LCANA Trifold Meeting List</title><style>
  @page{size:letter landscape;margin:.25in}*{box-sizing:border-box}body{margin:0;background:#e8edf2;color:#000;font-family:Arial,Helvetica,sans-serif}.toolbar{padding:16px;background:#0b2746;color:white;text-align:center}.toolbar button{padding:10px 18px;border:0;border-radius:6px;font-weight:bold;cursor:pointer}.toolbar p{margin:8px 0 0}.sheet{background:#fff;width:10.5in;height:8in;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.22in;margin:20px auto;page-break-after:always}.sheet:last-of-type{page-break-after:auto}.panel{min-width:0;--size:9px;font-size:var(--size);line-height:1.16;overflow:visible}.day{margin-bottom:10px}.day h2{background:#000;color:#fff;text-align:center;font-size:12px;letter-spacing:.5px;padding:3px;margin:0 0 2px}.day article{display:grid;grid-template-columns:49px 1fr;gap:4px;border-bottom:1px solid #ccc;padding:3px 0;break-inside:avoid}.time{white-space:nowrap}.phones{text-align:center;display:flex;flex-direction:column;height:100%;padding:26px 10px 100px}.phones h2{font-size:22px;background:#000;color:white;padding:5px;margin:28px 0 45px}.phone-lines{flex:1;display:flex;flex-direction:column;justify-content:space-around}.phone-lines div{border-bottom:1px solid #777;height:22px}.region{font-size:14px;font-weight:bold}.area{border-top:1px solid #555;padding-top:6px;margin-top:32px;font-size:14px;font-weight:bold}.area small{display:block;font-size:11px;font-weight:normal}.cover{text-align:center;padding-top:46px}.cover img{width:1.65in;height:1.65in;object-fit:contain}.cover .unified{font-size:12px;font-weight:bold;margin-top:34px}.cover h1{font-size:25px;line-height:1.05;margin:0 0 5px}.legend-title{background:#000;color:white;font-size:10px;font-weight:bold;padding:3px}.cover table{border-collapse:collapse;width:100%;font-size:8px;line-height:1.1;text-align:left}.cover td{border:1px solid #999;padding:2px}.cover .month{font-size:20px;font-weight:bold;margin:20px 0}.cover .helpline{font-size:25px;font-weight:bold;margin-top:24px}.cover .date{font-size:11px}.error{background:#fff0d5;color:#000;padding:10px;margin-top:10px}[hidden]{display:none!important}@media print{body{background:#fff}.toolbar{display:none}.sheet{margin:0}.panel{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style></head><body><div class="toolbar"><button id="print">Print / Save as PDF</button><p>Letter paper • Landscape • Two-sided • Flip on short edge • Scale 100% • Headers and footers OFF</p><p>This is the full published schedule. Printed date: ${esc(printed)}.</p><div class="error" id="overflow" hidden>The schedule exceeds the two-page layout. Please ask the website maintainer to adjust the trifold before printing.</div></div>
  <main><div class="sheet"><div class="panel">${dayBlock('Sunday')}${dayBlock('Monday')}</div><div class="panel">${dayBlock('Tuesday')}${dayBlock('Wednesday')}</div><div class="panel">${dayBlock('Thursday')}${dayBlock('Friday')}</div></div>
  <div class="sheet"><div class="panel">${dayBlock('Saturday')}</div><div class="panel phones"><div class="region">CAROLINA REGION WEBSITE<br>https://www.crna.org</div><h2>PHONE NUMBERS</h2><div class="phone-lines">${'<div></div>'.repeat(16)}</div><div class="area">Low Country Area<small>36 Bay Pines Dr, Hilton Head SC 29928</small></div></div><div class="panel cover"><img src="${esc(logo)}" alt="LCANA logo"><div class="unified">UNIFIED</div><h1>MEETING SCHEDULE</h1><div class="legend-title">MEETING FORMAT LEGEND</div><table>${legendRows}</table><div class="month">${esc(month)}</div><div class="helpline">855-613-2762</div><div class="date">Printed on ${esc(printed)}<br>Meetings Weekly: ${meetings.length}</div></div></div></main>
  </body></html>`;
}

function prepareLCANATrifold() {
  let host = document.getElementById('lcanaPrintRoot');
  if (!host) {
    host = document.createElement('div');
    host.id = 'lcanaPrintRoot';
    host.setAttribute('aria-hidden', 'true');
    document.body.appendChild(host);
    host.attachShadow({mode:'open'});
    const style = document.createElement('style');
    style.textContent = `@page{size:letter landscape;margin:.25in}
      #lcanaPrintRoot{position:absolute;left:-20000px;top:0;width:10.5in;font-family:Arial,Helvetica,sans-serif;color:#000;line-height:1.16}
      @media print{html,body{margin:0!important;padding:0!important;background:#fff!important;overflow:visible!important;max-width:none!important}body>*{display:none!important}body>#lcanaPrintRoot{display:block!important;position:static!important;width:10.5in!important}}`;
    document.head.appendChild(style);
  }
  const parsed = new DOMParser().parseFromString(buildLCANATrifoldHTML(), 'text/html');
  const root = host.shadowRoot;
  root.replaceChildren();
  root.appendChild(parsed.querySelector('style').cloneNode(true));
  root.appendChild(parsed.querySelector('main').cloneNode(true));
  const localStyle = document.createElement('style');
  localStyle.textContent = 'section{padding:0}main{display:block}.sheet{margin:0!important}.day{padding:0}';
  root.appendChild(localStyle);
  root.querySelectorAll('.panel').forEach(panel => {
    if (!panel.querySelector('.day')) return;
    let size = 9;
    while (panel.scrollHeight > panel.clientHeight + 1 && size > 7.5) {
      size -= .1;
      panel.style.setProperty('--size', size+'px');
    }
  });
  return root;
}

async function printLCANATrifold() {
  const root = prepareLCANATrifold();
  await Promise.all([...root.querySelectorAll('img')].map(img => img.decode().catch(()=>{})));
  window.print();
}
window.addEventListener('beforeprint', prepareLCANATrifold);
