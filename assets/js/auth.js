// Auth simple en cliente (demo). Almacena usuarios en localStorage con hash (SHA-256) de contraseña.
// NOTA: Para producción, usar backend seguro + sesiones + cifrado adecuado.
(function(){
  const USERS_KEY = 'auth.users.v1';
  const CURRENT_KEY = 'auth.current.v1';

  function loadUsers(){
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { return []; }
  }
  function saveUsers(list){ localStorage.setItem(USERS_KEY, JSON.stringify(list)); }
  function setCurrent(email){ localStorage.setItem(CURRENT_KEY, email || ''); }
  function getCurrentEmail(){ return localStorage.getItem(CURRENT_KEY) || ''; }

  async function sha256(message){
    if (window.crypto && window.crypto.subtle) {
      const enc = new TextEncoder();
      const hash = await crypto.subtle.digest('SHA-256', enc.encode(message));
      return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('');
    }
    // Fallback simple (no seguro) si no hay WebCrypto
    let h = 0; for (let i=0;i<message.length;i++){ h = (h<<5) - h + message.charCodeAt(i); h|=0; }
    return 'x'+Math.abs(h).toString(16);
  }

  function normEmail(email){ return String(email||'').trim().toLowerCase(); }

  function findUser(users, email){ return users.find(u => u.email === normEmail(email)); }

  async function signup({name, email, phone, password}){
    email = normEmail(email);
    if (!email || !password) throw new Error('Email y contraseña requeridos');
    const users = loadUsers();
    if (findUser(users, email)) throw new Error('Ya existe una cuenta con ese email');
    const passhash = await sha256(password + '|' + email);
    const user = { name: name||'', email, phone: phone||'', passhash, createdAt: Date.now() };
    users.push(user);
    saveUsers(users);
    setCurrent(email);
    return user;
  }

  async function login({email, password}){
    email = normEmail(email);
    const users = loadUsers();
    const user = findUser(users, email);
    if (!user) throw new Error('Usuario no encontrado');
    const passhash = await sha256(password + '|' + email);
    if (passhash !== user.passhash) throw new Error('Contraseña incorrecta');
    setCurrent(email);
    return user;
  }

  function logout(){ setCurrent(''); }

  function getCurrentUser(){
    const email = getCurrentEmail();
    if (!email) return null;
    return findUser(loadUsers(), email) || null;
  }

  function updateProfile({name, phone}){
    const email = getCurrentEmail();
    if (!email) throw new Error('No hay sesión activa');
    const users = loadUsers();
    const user = findUser(users, email);
    if (!user) throw new Error('Usuario no encontrado');
    if (typeof name === 'string') user.name = name;
    if (typeof phone === 'string') user.phone = phone;
    saveUsers(users);
    return user;
  }

  async function changePassword({currentPassword, newPassword}){
    const email = getCurrentEmail();
    if (!email) throw new Error('No hay sesión activa');
    const users = loadUsers();
    const user = findUser(users, email);
    if (!user) throw new Error('Usuario no encontrado');
    const ok = user.passhash === await sha256((currentPassword||'') + '|' + email);
    if (!ok) throw new Error('La contraseña actual no coincide');
    user.passhash = await sha256((newPassword||'') + '|' + email);
    saveUsers(users);
    return true;
  }

  function deleteAccount(){
    const email = getCurrentEmail();
    if (!email) throw new Error('No hay sesión activa');
    let users = loadUsers();
    users = users.filter(u => u.email !== email);
    saveUsers(users);
    logout();
    return true;
  }

  window.Auth = {
    signup, login, logout, getCurrentUser, updateProfile, changePassword, deleteAccount
  };
})();
