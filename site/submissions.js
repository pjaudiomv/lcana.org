(() => {
  const settings = window.LCANA_SETTINGS || {};
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.submissionsEmail || '') ? settings.submissionsEmail : '';
  const dialog = document.getElementById('submissionDialog');
  const form = document.getElementById('submissionForm');
  let kind = 'meeting';
  const fields = {
    meeting: [ ['change','Change requested','select','Add a meeting|Change a meeting|Remove a meeting|Temporary closure'], ['group','Group name','text'], ['day','Meeting day','select','Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday'], ['time','Meeting time','time'], ['location','Meeting address or online details','text'], ['effective','Effective date','date'], ['details','What should change? Include the old information for a correction.','textarea'] ],
    activity: [ ['title','Activity name','text'], ['date','Activity date','date'], ['time','Start time','time'], ['location','Location or online details','text'], ['flyer','Flyer link (optional)','url'], ['details','Activity details, cost, and contact information','textarea'] ]
  };
  document.querySelectorAll('[data-submission]').forEach(button => button.addEventListener('click', () => {
    kind = button.dataset.submission;
    form.reset();
    document.getElementById('submissionTitle').textContent = kind === 'meeting' ? 'Submit a meeting update' : 'Submit an activity';
    document.getElementById('submissionFields').innerHTML = fields[kind].map(([name,label,type,choices]) => {
      const required = ['group','change','title','details'].includes(name) ? ' required' : '';
      let field = type === 'select' ? `<select name="${name}" id="field-${name}"${required}>${choices.split('|').map(x => `<option>${x}</option>`).join('')}</select>` : type === 'textarea' ? `<textarea name="${name}" id="field-${name}" rows="4"${required}></textarea>` : `<input type="${type}" name="${name}" id="field-${name}"${required}>`;
      return `<label for="field-${name}">${label}${required ? ' *' : ''}</label>${field}`;
    }).join('');
    document.getElementById('sendRequest').disabled = !email;
    document.getElementById('submissionStatus').textContent = email ? 'Opens your email app with a prepared request. Send it there to submit. Updates appear after Area review.' : 'Email submissions are not available yet. You can download your request and share it with your GSR or Area representative.';
    dialog.showModal();
  }));
  document.getElementById('closeSubmission').addEventListener('click', () => dialog.close());
  function requestText() {
    const data = new FormData(form);
    const lines = [kind === 'meeting' ? 'LCANA meeting update request' : 'LCANA activity submission', ''];
    for (const [key, value] of data) {
      const label = fields[kind].find(x => x[0] === key)?.[1] || ({contact:'Contact name',reply:'Reply email'}[key]) || key;
      if (value) lines.push(`${label}: ${value}`);
    }
    lines.push('', 'Submitted for Area review; this request does not change the published website.');
    return lines.join('\n');
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!email || !form.reportValidity()) return;
    const subject = kind === 'meeting' ? 'LCANA meeting update request' : 'LCANA activity submission';
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(requestText())}`;
    document.getElementById('submissionStatus').textContent = 'Your email app should open. Please send the prepared email to complete your submission.';
  });
  document.getElementById('downloadRequest').addEventListener('click', () => {
    if (!form.reportValidity()) return;
    const url = URL.createObjectURL(new Blob([requestText()], {type:'text/plain;charset=utf-8'}));
    const link = document.createElement('a'); link.href = url; link.download = `LCANA-${kind}-request.txt`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    document.getElementById('submissionStatus').textContent = 'Request downloaded. Share it with your GSR or Area representative for review.';
  });
  let payment;
  try { payment = new URL(settings.donationUrl); } catch (_) {}
  if (payment?.protocol === 'https:' && !payment.username && !payment.password) {
    const button = document.getElementById('onlineContribution');
    button.href = payment.href; button.hidden = false;
    document.getElementById('donationStatus').textContent = 'Continue to the Area’s payment page to make a member or group contribution.';
  }
})();
