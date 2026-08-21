(() => {
  'use strict';
  const CLIENT_ID = '494251104602-ksg4ti5ag3fi86iovsn5rnvrrr59qhlo.apps.googleusercontent.com';
  const SCOPE = 'https://www.googleapis.com/auth/gmail.metadata';
  let tokenClient, accessToken = '';
  const card = document.getElementById('email');
  if (!card) return;

  const style = document.createElement('style');
  style.textContent = `.gmail-status{font-size:10px;color:var(--muted);margin:-5px 0 10px}.gmail-btn{border:1px solid rgba(148,221,213,.35);background:linear-gradient(180deg,#183331,#101c1d);color:#fff;border-radius:10px;padding:8px 11px;font:800 10px Inter,ui-sans-serif,sans-serif;cursor:pointer}.gmail-btn.secondary{background:#111522;color:#aaa7b5;border-color:#313440}.gmail-actions{display:flex;gap:8px;margin-bottom:10px}.gmail-items{display:flex;flex-direction:column;gap:0}.gmail-item{display:grid;grid-template-columns:1fr auto;gap:10px;padding:8px 0;border-bottom:1px solid #282a33}.gmail-item:last-child{border-bottom:0}.gmail-subject{font-size:11px;font-weight:750;color:#f0edf5;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.gmail-date{font-size:9px;color:var(--teal);font-weight:900}.gmail-counts{display:flex;gap:18px;margin-bottom:8px}.gmail-counts b{display:block;font-size:18px}.gmail-counts span{font-size:8px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}`;
  document.head.appendChild(style);
  card.innerHTML = '<div class="head"><h3>Important Email</h3><span class="badge">METADATA ONLY</span></div><div class="gmail-status" id="gmailStatus">Not connected on this device.</div><div class="gmail-actions"><button class="gmail-btn" id="gmailConnect">Connect Gmail</button><button class="gmail-btn secondary hidden" id="gmailDisconnect">Disconnect</button></div><div class="gmail-counts hidden" id="gmailCounts"><div><b id="gmailUnread">0</b><span>Unread</span></div><div><b id="gmailImportant">0</b><span>Important</span></div></div><div class="gmail-items" id="gmailItems"></div>';
  document.title = document.title.replace(/V\d+/, 'V10');
  function updateVersionLabels(){
    const sideNote = document.querySelector('.side-note');
    const footer = document.querySelector('.footer');
    if (sideNote) sideNote.innerHTML = sideNote.innerHTML.replace(/V\d+/, 'V10');
    if (footer) footer.textContent = footer.textContent.replace(/Version \d+/, 'Version 10');
  }
  window.addEventListener('DOMContentLoaded', updateVersionLabels);
  setTimeout(updateVersionLabels, 500);
  const connect=card.querySelector('#gmailConnect'),disconnect=card.querySelector('#gmailDisconnect'),status=card.querySelector('#gmailStatus'),counts=card.querySelector('#gmailCounts'),unread=card.querySelector('#gmailUnread'),important=card.querySelector('#gmailImportant'),items=card.querySelector('#gmailItems');

  function initialize(){if(!window.google?.accounts?.oauth2)return false;tokenClient=google.accounts.oauth2.initTokenClient({client_id:CLIENT_ID,scope:SCOPE,callback:async r=>{if(r.error){status.textContent='Connection was not completed.';return}accessToken=r.access_token;connect.classList.add('hidden');disconnect.classList.remove('hidden');await loadMail()}});return true}
  async function api(path){const r=await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/${path}`,{headers:{Authorization:`Bearer ${accessToken}`},cache:'no-store'});if(!r.ok)throw new Error('Gmail request failed');return r.json()}
  async function loadMail(){status.textContent='Loading recent inbox metadata…';try{const list=await api('messages?labelIds=INBOX&maxResults=10');const messages=await Promise.all((list.messages||[]).map(m=>api(`messages/${encodeURIComponent(m.id)}?format=metadata&metadataHeaders=Subject&metadataHeaders=Date&fields=id,labelIds,payload%2Fheaders`)));const unreadMessages=messages.filter(m=>m.labelIds?.includes('UNREAD')),importantMessages=messages.filter(m=>m.labelIds?.includes('IMPORTANT'));unread.textContent=String(unreadMessages.length);important.textContent=String(importantMessages.length);counts.classList.remove('hidden');items.replaceChildren();const chosen=[...importantMessages,...unreadMessages,...messages].filter((m,i,a)=>a.findIndex(x=>x.id===m.id)===i).slice(0,3);for(const m of chosen){const headers=Object.fromEntries((m.payload?.headers||[]).map(h=>[h.name.toLowerCase(),h.value]));const row=document.createElement('div');row.className='gmail-item';const subject=document.createElement('div');subject.className='gmail-subject';subject.textContent=headers.subject||'(No subject)';const date=document.createElement('div');date.className='gmail-date';const parsed=headers.date?new Date(headers.date):null;date.textContent=parsed&&!Number.isNaN(parsed.valueOf())?parsed.toLocaleDateString(undefined,{month:'short',day:'numeric'}):'';row.append(subject,date);items.appendChild(row)}status.textContent='Recent inbox · subjects and dates only'}catch{status.textContent='Gmail metadata could not be loaded. Please reconnect.'}}
  connect.addEventListener('click',()=>{if(!tokenClient&&!initialize()){status.textContent='Google sign-in is still loading. Try again in a moment.';return}tokenClient.requestAccessToken({prompt:'consent'})});
  disconnect.addEventListener('click',()=>{if(accessToken&&window.google?.accounts?.oauth2)google.accounts.oauth2.revoke(accessToken,()=>{});accessToken='';items.replaceChildren();counts.classList.add('hidden');status.textContent='Not connected on this device.';disconnect.classList.add('hidden');connect.classList.remove('hidden')});
  const timer=setInterval(()=>{if(initialize())clearInterval(timer)},300);setTimeout(()=>clearInterval(timer),15000);
})();
