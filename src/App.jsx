import { useState, useEffect, useCallback } from "react";

// ============================================================
// STORAGE LAYER — localStorage (persiste en el navegador)
// ============================================================
const DB = {
  getGifts() {
    try {
      const r = localStorage.getItem("bs_gifts");
      return r ? JSON.parse(r) : getDefaultGifts();
    } catch { return getDefaultGifts(); }
  },
  setGifts(gifts) {
    localStorage.setItem("bs_gifts", JSON.stringify(gifts));
  },
  getGuests() {
    try {
      const r = localStorage.getItem("bs_guests");
      return r ? JSON.parse(r) : [];
    } catch { return []; }
  },
  setGuests(guests) {
    localStorage.setItem("bs_guests", JSON.stringify(guests));
  },
  getSelections() {
    try {
      const r = localStorage.getItem("bs_selections");
      return r ? JSON.parse(r) : [];
    } catch { return []; }
  },
  setSelections(sels) {
    localStorage.setItem("bs_selections", JSON.stringify(sels));
  },
  claimGift(giftId, guestId) {
    const gifts = DB.getGifts();
    const gift = gifts.find(g => g.id === giftId);
    if (!gift || gift.claimedBy) return { success: false, reason: "Ya fue seleccionado por otra persona" };
    gift.claimedBy = guestId;
    gift.claimedAt = new Date().toISOString();
    DB.setGifts(gifts);
    const sels = DB.getSelections();
    sels.push({ id: Date.now().toString(), giftId, guestId, claimedAt: gift.claimedAt });
    DB.setSelections(sels);
    return { success: true };
  }
};

function getDefaultGifts() {
  return [
    { id: "1", name: "Cuna con colchón", description: "Cuna convertible de madera, incluye colchón ortopédico", emoji: "🛏️", claimedBy: null, claimedAt: null },
    { id: "2", name: "Cochecito / Coche", description: "Coche plegable con portabebé desmontable", emoji: "🍼", claimedBy: null, claimedAt: null },
    { id: "3", name: "Bañera para bebé", description: "Bañera ergonómica con soporte antideslizante", emoji: "🛁", claimedBy: null, claimedAt: null },
    { id: "4", name: "Monitor de bebé", description: "Monitor con video y audio, visión nocturna", emoji: "📱", claimedBy: null, claimedAt: null },
    { id: "5", name: "Pack de bodys 0-3 meses", description: "Paquete x10 bodys de algodón orgánico", emoji: "👶", claimedBy: null, claimedAt: null },
    { id: "6", name: "Mecedora para bebé", description: "Hamaca eléctrica con música y vibración", emoji: "🪑", claimedBy: null, claimedAt: null },
    { id: "7", name: "Kit de higiene", description: "Termómetro, cortauñas, aspirador nasal, peine", emoji: "🧴", claimedBy: null, claimedAt: null },
    { id: "8", name: "Mochila portabebé", description: "Mochila ergonómica para recién nacido", emoji: "🎒", claimedBy: null, claimedAt: null },
  ];
}

// ============================================================
// EXPORT CSV
// ============================================================
function exportToCSV(gifts, guests, selections) {
  const guestMap = Object.fromEntries(guests.map(g => [g.id, g]));
  const giftMap = Object.fromEntries(gifts.map(g => [g.id, g]));
  const rows = [["Regalo", "Descripción", "Estado", "Seleccionado por", "Acompañantes", "Fecha"]];
  gifts.forEach(gift => {
    const sel = selections.find(s => s.giftId === gift.id);
    const guest = sel ? guestMap[sel.guestId] : null;
    rows.push([
      gift.name, gift.description,
      gift.claimedBy ? "Apartado" : "Disponible",
      guest ? guest.name : "",
      guest ? guest.companions : "",
      gift.claimedAt ? new Date(gift.claimedAt).toLocaleString("es-CO") : ""
    ]);
  });
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "baby-shower-regalos.csv"; a.click();
  URL.revokeObjectURL(url);
}

const ADMIN_PASSWORD = "beBe2026**";

// ============================================================
// STYLES
// ============================================================
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --cream: #fdf8f0;
    --blush: #f5c6c0;
    --rose: #e8968c;
    --mauve: #c4737c;
    --sage: #a8b89e;
    --sage-light: #d4e0ce;
    --gold: #c9a96e;
    --gold-light: #f0e0c0;
    --charcoal: #3a3230;
    --warm-gray: #8a7e7a;
    --white: #ffffff;
    --shadow: 0 4px 24px rgba(58,50,48,0.10);
    --shadow-hover: 0 8px 32px rgba(58,50,48,0.18);
    --radius: 20px;
    --radius-sm: 12px;
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--charcoal); min-height: 100vh; }
  .app { min-height: 100vh; }

  .header {
    background: linear-gradient(135deg, #fdf0ea 0%, #f7e8e0 50%, #f0e8f0 100%);
    border-bottom: 1px solid var(--gold-light);
    padding: 28px 24px 24px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .header::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at 20% 50%, rgba(245,198,192,0.3) 0%, transparent 60%),
                radial-gradient(ellipse at 80% 30%, rgba(168,184,158,0.25) 0%, transparent 60%);
    pointer-events: none;
  }
  .header-badge { display: inline-block; background: var(--gold-light); color: var(--gold); font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; padding: 4px 14px; border-radius: 20px; margin-bottom: 10px; border: 1px solid rgba(201,169,110,0.3); }
  .header h1 { font-family: 'Playfair Display', serif; font-size: clamp(28px, 5vw, 44px); color: var(--charcoal); font-weight: 700; line-height: 1.2; }
  .header h1 span { color: var(--mauve); font-style: italic; }
  .header p { color: var(--warm-gray); margin-top: 8px; font-size: 15px; font-weight: 300; }
  .header-icons { font-size: 24px; margin-bottom: 8px; letter-spacing: 4px; }

  .nav { display: flex; justify-content: center; gap: 8px; padding: 20px 16px 0; flex-wrap: wrap; }
  .nav-btn { padding: 10px 24px; border-radius: 50px; border: 1.5px solid transparent; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; background: var(--white); color: var(--warm-gray); border-color: rgba(138,126,122,0.2); }
  .nav-btn:hover { border-color: var(--rose); color: var(--mauve); }
  .nav-btn.active { background: var(--mauve); color: white; border-color: var(--mauve); }
  .nav-btn.admin-btn { border-color: var(--gold); color: var(--gold); }
  .nav-btn.admin-btn.active { background: var(--gold); color: white; }

  .main { max-width: 900px; margin: 0 auto; padding: 32px 16px 64px; }

  .card { background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow); padding: 28px; margin-bottom: 20px; border: 1px solid rgba(245,198,192,0.3); transition: box-shadow 0.2s; }
  .card:hover { box-shadow: var(--shadow-hover); }
  .card-title { font-family: 'Playfair Display', serif; font-size: 22px; color: var(--charcoal); margin-bottom: 6px; }
  .card-sub { color: var(--warm-gray); font-size: 14px; margin-bottom: 20px; }

  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 13px; font-weight: 500; color: var(--warm-gray); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.8px; }
  .form-input { width: 100%; padding: 12px 16px; border-radius: var(--radius-sm); border: 1.5px solid rgba(138,126,122,0.25); background: var(--cream); font-family: 'DM Sans', sans-serif; font-size: 15px; color: var(--charcoal); outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
  .form-input:focus { border-color: var(--rose); box-shadow: 0 0 0 3px rgba(232,150,140,0.15); }
  .form-textarea { resize: vertical; min-height: 80px; }

  .btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; border-radius: 50px; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; transition: all 0.2s; white-space: nowrap; }
  .btn-primary { background: var(--mauve); color: white; }
  .btn-primary:hover { background: var(--rose); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(196,115,124,0.35); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .btn-gold { background: var(--gold); color: white; }
  .btn-gold:hover { background: #b8935a; transform: translateY(-1px); }
  .btn-outline { background: transparent; border: 1.5px solid var(--blush); color: var(--mauve); }
  .btn-outline:hover { background: var(--blush); }
  .btn-danger { background: transparent; border: 1.5px solid #e88; color: #c44; }
  .btn-danger:hover { background: #fee; }
  .btn-sm { padding: 7px 16px; font-size: 13px; }
  .btn-full { width: 100%; justify-content: center; }
  .btn-sage { background: var(--sage); color: white; }
  .btn-sage:hover { background: #8fa885; }

  .gifts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
  .gift-card { background: var(--white); border-radius: var(--radius); padding: 20px; border: 2px solid rgba(245,198,192,0.3); box-shadow: 0 2px 12px rgba(58,50,48,0.07); transition: all 0.25s; display: flex; flex-direction: column; gap: 10px; }
  .gift-card:hover { border-color: var(--blush); box-shadow: var(--shadow-hover); transform: translateY(-2px); }
  .gift-emoji { font-size: 36px; line-height: 1; }
  .gift-name { font-family: 'Playfair Display', serif; font-size: 17px; color: var(--charcoal); }
  .gift-desc { font-size: 13px; color: var(--warm-gray); line-height: 1.5; flex: 1; }
  .gift-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 500; padding: 4px 10px; border-radius: 20px; }
  .badge-available { background: var(--sage-light); color: #4a7a4a; }
  .badge-claimed { background: var(--gold-light); color: #8a6030; }

  .table-wrap { overflow-x: auto; border-radius: var(--radius-sm); }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th { background: var(--cream); color: var(--warm-gray); text-transform: uppercase; letter-spacing: 0.7px; font-size: 12px; padding: 12px 14px; text-align: left; border-bottom: 2px solid var(--gold-light); }
  td { padding: 12px 14px; border-bottom: 1px solid rgba(138,126,122,0.1); vertical-align: middle; }
  tr:hover td { background: #fdf9f5; }

  .alert { padding: 14px 18px; border-radius: var(--radius-sm); margin-bottom: 16px; font-size: 14px; display: flex; align-items: flex-start; gap: 10px; }
  .alert-success { background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }
  .alert-error { background: #fce4ec; color: #c62828; border: 1px solid #f8bbd0; }
  .alert-info { background: var(--gold-light); color: #7a5e2a; border: 1px solid rgba(201,169,110,0.3); }
  .alert-warning { background: #fff8e1; color: #7a5e2a; border: 1px solid #ffe082; }

  .welcome-hero { text-align: center; padding: 32px 0 24px; }
  .welcome-hero .big-emoji { font-size: 64px; display: block; margin-bottom: 12px; }
  .welcome-hero h2 { font-family: 'Playfair Display', serif; font-size: 28px; margin-bottom: 8px; }
  .welcome-hero p { color: var(--warm-gray); font-size: 15px; max-width: 380px; margin: 0 auto; line-height: 1.6; }

  .success-state { text-align: center; padding: 48px 24px; }
  .success-state .big-emoji { font-size: 72px; display: block; margin-bottom: 16px; animation: pop 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97); }
  .success-state h2 { font-family: 'Playfair Display', serif; font-size: 26px; margin-bottom: 10px; }
  .success-state p { color: var(--warm-gray); font-size: 15px; max-width: 340px; margin: 0 auto; }
  @keyframes pop { 0% { transform: scale(0.5); opacity: 0; } 80% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }

  .modal-overlay { position: fixed; inset: 0; background: rgba(58,50,48,0.45); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 16px; backdrop-filter: blur(4px); animation: fadeIn 0.15s ease; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal { background: var(--white); border-radius: var(--radius); padding: 32px; max-width: 480px; width: 100%; box-shadow: 0 20px 60px rgba(58,50,48,0.25); animation: slideUp 0.2s ease; }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .modal-title { font-family: 'Playfair Display', serif; font-size: 22px; margin-bottom: 20px; }
  .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px; }

  .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 14px; margin-bottom: 24px; }
  .stat-card { background: var(--cream); border-radius: var(--radius-sm); padding: 18px 16px; text-align: center; border: 1px solid var(--gold-light); }
  .stat-number { font-family: 'Playfair Display', serif; font-size: 32px; color: var(--mauve); }
  .stat-label { font-size: 12px; color: var(--warm-gray); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.7px; }

  .share-url { flex: 1; font-size: 13px; color: var(--charcoal); word-break: break-all; }
  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; flex-wrap: wrap; gap: 10px; }
  .section-title { font-family: 'Playfair Display', serif; font-size: 20px; }

  .claim-confirm { background: var(--cream); border-radius: var(--radius-sm); padding: 16px; margin: 16px 0; border: 1px solid var(--gold-light); }
  .claim-confirm .gift-row { display: flex; align-items: center; gap: 12px; }
  .claim-confirm .gift-emoji-sm { font-size: 28px; }
  .claim-confirm .gift-info strong { display: block; font-size: 15px; }
  .claim-confirm .gift-info span { font-size: 13px; color: var(--warm-gray); }

  .empty-state { text-align: center; padding: 48px 24px; color: var(--warm-gray); }
  .empty-state .emoji { font-size: 48px; margin-bottom: 12px; }

  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: var(--cream); } ::-webkit-scrollbar-thumb { background: var(--blush); border-radius: 3px; }
`;

// ============================================================
// MODAL
// ============================================================
function Modal({ title, children, onClose }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div className="modal-title">{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#999" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ============================================================
// VISTA INVITADOS
// ============================================================
function GuestView({ gifts, guests, onGuestSaved, onClaimGift, onRefresh }) {
  const [phase, setPhase] = useState("register");
  const [guestData, setGuestData] = useState({ name: "", companions: 0 });
  const [currentGuest, setCurrentGuest] = useState(null);
  const [selectedGift, setSelectedGift] = useState(null);
  const [error, setError] = useState("");
  const [claiming, setClaiming] = useState(false);

  const availableGifts = gifts.filter(g => !g.claimedBy);

  function handleRegister() {
    if (!guestData.name.trim()) { setError("Por favor ingresa tu nombre"); return; }
    const guest = { id: Date.now().toString(), name: guestData.name.trim(), companions: parseInt(guestData.companions) || 0, registeredAt: new Date().toISOString() };
    onGuestSaved(guest);
    setCurrentGuest(guest);
    setPhase("browse");
    setError("");
  }

  function handleClaim() {
    if (!selectedGift || !currentGuest) return;
    setClaiming(true);
    // Refresh antes de confirmar para detectar si alguien más lo tomó
    onRefresh();
    const result = onClaimGift(selectedGift.id, currentGuest.id);
    setClaiming(false);
    if (result.success) setPhase("success");
    else { setError(result.reason || "Ocurrió un error"); setPhase("browse"); setSelectedGift(null); }
  }

  if (phase === "register") return (
    <div>
      <div className="welcome-hero">
        <span className="big-emoji">🌸</span>
        <h2>¡Bienvenido a nuestro Baby Shower!</h2>
        <p>Gracias por acompañarnos en este gran día, ¡lo valoramos mucho! Ayúdanos a completar tu información, podrás acceder a la lista de regalos, bebé estará muy feliz con tu muestra de amor.</p>
      </div>
      <div className="card" style={{ maxWidth: 440, margin: "0 auto" }}>
        <div className="card-title">Cuéntanos quién eres</div>
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        <div className="form-group">
          <label className="form-label">Tu nombre completo</label>
          <input className="form-input" placeholder="Ej: María García" value={guestData.name} onChange={e => setGuestData({ ...guestData, name: e.target.value })} onKeyDown={e => e.key === "Enter" && handleRegister()} />
        </div>
        <div className="form-group">
          <label className="form-label">¿Cuantas personitas nos acompañarán? (cúentate a ti también)</label>
          <input className="form-input" type="number" min="0" max="10" placeholder="0" value={guestData.companions} onChange={e => setGuestData({ ...guestData, companions: e.target.value })} />
        </div>
        <button className="btn btn-primary btn-full" style={{ marginTop: 8 }} onClick={handleRegister}>Ver lista de regalos →</button>
      </div>
    </div>
  );

  if (phase === "success") return (
    <div className="success-state">
      <span className="big-emoji">🎁</span>
      <h2>¡Gracias, {currentGuest?.name}!</h2>
      <p>Tu regalo ha sido reservado con éxito. Bebé estará muy feliz con tu gesto de amor.</p>
      <div style={{ marginTop: 24 }}>
        <div className="claim-confirm">
          <div className="gift-row">
            <span className="gift-emoji-sm">{selectedGift?.emoji}</span>
            <div className="gift-info"><strong>{selectedGift?.name}</strong><span>{selectedGift?.description}</span></div>
          </div>
        </div>
      </div>
      <p style={{ color: "#999", fontSize: 13, marginTop: 20 }}>💕 Hasta pronto, nos vemos en el baby shower</p>
    </div>
  );

  if (phase === "confirm") return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <div className="card">
        <div className="card-title">Confirmar selección</div>
        <div className="card-sub">¿Estás seguro/a de que quieres reservar este regalo?</div>
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        <div className="claim-confirm">
          <div className="gift-row">
            <span className="gift-emoji-sm">{selectedGift?.emoji}</span>
            <div className="gift-info"><strong>{selectedGift?.name}</strong><span>{selectedGift?.description}</span></div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button className="btn btn-outline btn-full" onClick={() => { setPhase("browse"); setSelectedGift(null); }}>← Volver</button>
          <button className="btn btn-primary btn-full" onClick={handleClaim} disabled={claiming}>{claiming ? "Reservando…" : "✓ Confirmar regalo"}</button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="alert alert-info" style={{ maxWidth: 700, margin: "0 auto 24px" }}>
        🎁 Hola, <strong>{currentGuest?.name}</strong>! Elige el regalo que quieras dar. Una vez seleccionado, queda reservado para ti.
      </div>
      {availableGifts.length === 0 && (
        <div className="empty-state"><div className="emoji">🎊</div><p>¡Todos los regalos han sido seleccionados!</p><p style={{ fontSize: 13, marginTop: 8 }}>Los papás están muy agradecidos con todos.</p></div>
      )}
      <div className="gifts-grid">
        {availableGifts.map(gift => (
          <div key={gift.id} className="gift-card">
            <div className="gift-emoji">{gift.emoji}</div>
            <div className="gift-name">{gift.name}</div>
            <div className="gift-desc">{gift.description}</div>
            <span className="gift-badge badge-available">✓ Disponible</span>
            <button className="btn btn-primary btn-sm" onClick={() => { setSelectedGift(gift); setPhase("confirm"); }}>Elegir este regalo</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// PANEL ADMIN
// ============================================================
function AdminView({ gifts, guests, selections, onUpdateGifts, onRefresh }) {
  const [tab, setTab] = useState("gifts");
  const [showModal, setShowModal] = useState(false);
  const [editGift, setEditGift] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", emoji: "🎁" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const guestMap = Object.fromEntries(guests.map(g => [g.id, g]));
  const giftMap = Object.fromEntries(gifts.map(g => [g.id, g]));
  const claimedGifts = gifts.filter(g => g.claimedBy);
  const totalCompanions = guests.reduce((s, g) => s + (g.companions || 0), 0);

  function openCreate() { setForm({ name: "", description: "", emoji: "🎁" }); setEditGift(null); setShowModal(true); }
  function openEdit(gift) { setForm({ name: gift.name, description: gift.description, emoji: gift.emoji }); setEditGift(gift); setShowModal(true); }

  function saveGift() {
    if (!form.name.trim()) return;
    setSaving(true);
    let updated;
    if (editGift) {
      updated = gifts.map(g => g.id === editGift.id ? { ...g, ...form } : g);
    } else {
      updated = [...gifts, { id: Date.now().toString(), ...form, claimedBy: null, claimedAt: null }];
    }
    onUpdateGifts(updated);
    setShowModal(false); setSaving(false);
    setMsg(editGift ? "Regalo actualizado ✓" : "Regalo creado ✓");
    setTimeout(() => setMsg(""), 3000);
  }

  function deleteGift(id) {
    if (!window.confirm("¿Eliminar este regalo?")) return;
    onUpdateGifts(gifts.filter(g => g.id !== id));
    setMsg("Regalo eliminado");
    setTimeout(() => setMsg(""), 3000);
  }

  const EMOJIS = ["🎁","🛏️","🍼","🛁","👶","🪑","🧴","🎒","📱","🧸","🎀","🚿","👗","🧷","🎵","💊","🏥","🎠","🌟","💝"];

  return (
    <div>
      <div className="alert alert-warning" style={{ marginBottom: 16 }}>
        ⚠️ <strong>Importante:</strong> Los datos se guardan en este navegador. Para ver todos los registros de tus invitados, usa <strong>siempre el mismo navegador y dispositivo</strong> que usaste para configurar la app.
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-number">{gifts.length}</div><div className="stat-label">Total regalos</div></div>
        <div className="stat-card"><div className="stat-number">{gifts.filter(g => !g.claimedBy).length}</div><div className="stat-label">Disponibles</div></div>
        <div className="stat-card"><div className="stat-number">{claimedGifts.length}</div><div className="stat-label">Apartados</div></div>
        <div className="stat-card"><div className="stat-number">{guests.length}</div><div className="stat-label">Invitados</div></div>
        <div className="stat-card"><div className="stat-number">{guests.length + totalCompanions}</div><div className="stat-label">Total asistentes</div></div>
      </div>

      {msg && <div className="alert alert-success">✓ {msg}</div>}

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[["gifts", "🎁 Regalos"], ["guests", "👥 Invitados"], ["selections", "✅ Selecciones"]].map(([key, label]) => (
          <button key={key} className={`btn btn-sm ${tab === key ? "btn-primary" : "btn-outline"}`} onClick={() => setTab(key)}>{label}</button>
        ))}
        <button className="btn btn-sm btn-sage" onClick={onRefresh} style={{ marginLeft: "auto" }}>🔄 Actualizar</button>
      </div>

      {tab === "gifts" && (
        <div className="card">
          <div className="section-header">
            <div className="section-title">Lista de Regalos</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn btn-gold btn-sm" onClick={() => exportToCSV(gifts, guests, selections)}>⬇ Exportar CSV</button>
              <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Nuevo regalo</button>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Regalo</th><th>Descripción</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                {gifts.map(gift => (
                  <tr key={gift.id}>
                    <td><span style={{ marginRight: 8 }}>{gift.emoji}</span><strong>{gift.name}</strong></td>
                    <td style={{ color: "var(--warm-gray)", maxWidth: 200 }}>{gift.description}</td>
                    <td>{gift.claimedBy ? <span className="gift-badge badge-claimed">Apartado</span> : <span className="gift-badge badge-available">Disponible</span>}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        {!gift.claimedBy && <button className="btn btn-outline btn-sm" onClick={() => openEdit(gift)}>✏️</button>}
                        {!gift.claimedBy && <button className="btn btn-danger btn-sm" onClick={() => deleteGift(gift.id)}>🗑️</button>}
                        {gift.claimedBy && <span style={{ fontSize: 12, color: "var(--warm-gray)" }}>({guestMap[gift.claimedBy]?.name || "—"})</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "guests" && (
        <div className="card">
          <div className="section-header"><div className="section-title">Invitados Registrados</div></div>
          {guests.length === 0 ? <div className="empty-state"><div className="emoji">👥</div><p>Aún no hay invitados registrados</p></div> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Nombre</th><th>Acompañantes</th><th>Total</th><th>Registro</th><th>Seleccionó</th></tr></thead>
                <tbody>
                  {guests.map(guest => {
                    const sel = selections.find(s => s.guestId === guest.id);
                    const gift = sel ? giftMap[sel.giftId] : null;
                    return (
                      <tr key={guest.id}>
                        <td><strong>{guest.name}</strong></td>
                        <td style={{ textAlign: "center" }}>{guest.companions}</td>
                        <td style={{ textAlign: "center" }}>{1 + (guest.companions || 0)}</td>
                        <td style={{ color: "var(--warm-gray)", fontSize: 13 }}>{new Date(guest.registeredAt).toLocaleDateString("es-CO")}</td>
                        <td>{gift ? <><span>{gift.emoji}</span> {gift.name}</> : <span style={{ color: "#ccc" }}>—</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "selections" && (
        <div className="card">
          <div className="section-header"><div className="section-title">Regalos Seleccionados</div></div>
          {claimedGifts.length === 0 ? <div className="empty-state"><div className="emoji">🎁</div><p>Aún no se ha seleccionado ningún regalo</p></div> : (
            <div className="gifts-grid">
              {claimedGifts.map(gift => {
                const guest = guestMap[gift.claimedBy];
                return (
                  <div key={gift.id} className="gift-card" style={{ borderColor: "var(--gold-light)" }}>
                    <div className="gift-emoji">{gift.emoji}</div>
                    <div className="gift-name">{gift.name}</div>
                    <div className="gift-desc">{gift.description}</div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>
                      <div style={{ fontWeight: 500 }}>👤 {guest?.name || "—"}</div>
                      <div style={{ color: "var(--warm-gray)" }}>+{guest?.companions || 0} acompañantes</div>
                      <div style={{ color: "var(--warm-gray)", fontSize: 12 }}>{gift.claimedAt ? new Date(gift.claimedAt).toLocaleString("es-CO") : ""}</div>
                    </div>
                    <span className="gift-badge badge-claimed">✓ Apartado</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <Modal title={editGift ? "Editar regalo" : "Nuevo regalo"} onClose={() => setShowModal(false)}>
          <div className="form-group">
            <label className="form-label">Emoji del regalo</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
              {EMOJIS.map(e => <button key={e} onClick={() => setForm({ ...form, emoji: e })} style={{ fontSize: 20, padding: "4px 8px", border: form.emoji === e ? "2px solid var(--mauve)" : "1px solid #eee", borderRadius: 8, cursor: "pointer", background: form.emoji === e ? "var(--blush)" : "white" }}>{e}</button>)}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Nombre del regalo</label>
            <input className="form-input" placeholder="Ej: Cuna con colchón" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea className="form-input form-textarea" placeholder="Describe el regalo..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={saveGift} disabled={saving || !form.name.trim()}>{saving ? "Guardando…" : editGift ? "Actualizar" : "Crear regalo"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// LOGIN ADMIN
// ============================================================
function AdminLogin({ onLogin }) {
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  function attempt() {
    if (pwd === ADMIN_PASSWORD) onLogin();
    else setError("Contraseña incorrecta");
  }
  return (
    <div style={{ maxWidth: 360, margin: "48px auto" }}>
      <div className="card">
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 40 }}>🔐</div>
          <div className="card-title" style={{ marginBottom: 4 }}>Panel de Administrador</div>
          <div className="card-sub">Ingresa la contraseña para continuar</div>
        </div>
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        <div className="form-group">
          <label className="form-label">Contraseña</label>
          <input className="form-input" type="password" placeholder="••••••••" value={pwd} onChange={e => setPwd(e.target.value)} onKeyDown={e => e.key === "Enter" && attempt()} />
        </div>
        <button className="btn btn-gold btn-full" onClick={attempt}>Ingresar al panel</button>
        <p style={{ textAlign: "center", fontSize: 12, color: "var(--warm-gray)", marginTop: 12 }}>Contraseña: <code>{ADMIN_PASSWORD}</code></p>
      </div>
    </div>
  );
}

// ============================================================
// APP ROOT
// ============================================================
export default function App() {
  const [view, setView] = useState("guest");
  const [adminAuth, setAdminAuth] = useState(false);
  const [gifts, setGifts] = useState(() => DB.getGifts());
  const [guests, setGuests] = useState(() => DB.getGuests());
  const [selections, setSelections] = useState(() => DB.getSelections());
  const [copiedLink, setCopiedLink] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href.split("#")[0] : "";

  function refresh() {
    setGifts(DB.getGifts());
    setGuests(DB.getGuests());
    setSelections(DB.getSelections());
  }

  // Sync across tabs
  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const handleGuestSaved = useCallback((guest) => {
    const updated = [...DB.getGuests(), guest];
    DB.setGuests(updated);
    setGuests(updated);
  }, []);

  const handleClaimGift = useCallback((giftId, guestId) => {
    const result = DB.claimGift(giftId, guestId);
    if (result.success) refresh();
    return result;
  }, []);

  const handleUpdateGifts = useCallback((updated) => {
    DB.setGifts(updated);
    setGifts(updated);
  }, []);

  function copyLink() {
    navigator.clipboard?.writeText(shareUrl).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  }

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <header className="header">
          <div className="header-icons">🌸 🎀 🌼</div>
          <div className="header-badge">Baby Shower</div>
          <h1>Lista de <span>Regalos</span></h1>
          <p>¡Queremos que hagas parte de este nuevo paso, celebremos juntos la llegada de un nuevo bebé!</p>
        </header>

        <div className="nav">
          <button className={`nav-btn ${view === "guest" ? "active" : ""}`} onClick={() => setView("guest")}>🎁 Lista de regalos</button>
          <button className={`nav-btn admin-btn ${view === "admin" ? "active" : ""}`} onClick={() => setView("admin")}>⚙️ Administrador</button>
        </div>

        {view === "guest" && (
          <div className="main">
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 13, color: "var(--warm-gray)", marginBottom: 4 }}>🔗 Comparte esta lista con los invitados</div>
                  <div className="share-url">{shareUrl}</div>
                </div>
                <button className="btn btn-sage btn-sm" onClick={copyLink}>{copiedLink ? "✓ Copiado!" : "📋 Copiar link"}</button>
              </div>
            </div>
            <GuestView gifts={gifts} guests={guests} onGuestSaved={handleGuestSaved} onClaimGift={handleClaimGift} onRefresh={refresh} />
          </div>
        )}

        {view === "admin" && (
          <div className="main">
            {!adminAuth
              ? <AdminLogin onLogin={() => setAdminAuth(true)} />
              : <AdminView gifts={gifts} guests={guests} selections={selections} onUpdateGifts={handleUpdateGifts} onRefresh={refresh} />
            }
          </div>
        )}
      </div>
    </>
  );
}
