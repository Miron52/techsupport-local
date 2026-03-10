import { useState, useRef, useEffect, useCallback } from "react";

// ─── DATA & CONSTANTS ───
const STATUSES = {
  NEW: { label: "Новый", color: "#22c55e", bg: "#f0fdf4" },
  IN_PROGRESS: { label: "В работе", color: "#3b82f6", bg: "#eff6ff" },
  CLARIFICATION: { label: "Уточнение информации", color: "#f59e0b", bg: "#fffbeb" },
  DEV: { label: "Передано в разработку", color: "#8b5cf6", bg: "#f5f3ff" },
  CLOSED: { label: "Закрыто", color: "#6b7280", bg: "#f9fafb" },
};

const CLOSE_RESULTS = ["Проблема решена", "Не проблема", "Не представлены данные", "Отложено как идея", "Невыполнимо"];

const INITIAL_TICKETS = [
  { id: 873985, title: "Не могу создать объект", section: "Мои объекты", code: "#4563", date: "10.09.2025 16:54", status: "NEW", author: "Иванов Дмитрий Петрович", authorRole: "Партнер компании", linkedOrder: null, product: "", result: "", initiative: false, critical: false, responsible: "", nextContact: "", messages: [{ from: "user", text: "Не получается создать объект в разделе «Мои объекты». При нажатии кнопки «Создать» ничего не происходит.", time: "16:54" }] },
  { id: 873986, title: "Ошибка выгрузки фида", section: "Реклама", code: "#4564", date: "10.09.2025 17:01", status: "NEW", author: "Петрова Елена Сергеевна", authorRole: "Партнер компании", linkedOrder: null, product: "", result: "", initiative: false, critical: false, responsible: "", nextContact: "", messages: [{ from: "user", text: "Фид не выгружается уже 2 дня, ошибка 500 при попытке экспорта.", time: "17:01" }] },
  { id: 873987, title: "Хочу групповой чат", section: "Чат", code: "#4565", date: "11.09.2025 09:12", status: "NEW", author: "Сидоров Алексей", authorRole: "Агент", linkedOrder: null, product: "", result: "", initiative: true, critical: false, responsible: "", nextContact: "", messages: [{ from: "user", text: "Было бы здорово иметь групповой чат с коллегами внутри платформы.", time: "09:12" }] },
  { id: 873988, title: "Не могу выдать роль сотруднику", section: "Управление", code: "#4566", date: "11.09.2025 10:30", status: "IN_PROGRESS", author: "Козлова Марина", authorRole: "Руководитель", linkedOrder: null, product: "Управление", result: "", initiative: false, critical: false, responsible: "Авсенова Елена", nextContact: "15.09.2025", messages: [{ from: "user", text: "Не могу выдать роль «Менеджер» сотруднику Иванову. Кнопка неактивна.", time: "10:30" }, { from: "system", text: "Дата приёма в работу: 11.09.2025 11:00\nСпециалист: Авсенова Елена\nСтатус: В работе", time: "11:00" }, { from: "operator", text: "Добрый день! Уточните, пожалуйста, какая у вас роль в компании?", time: "11:05" }] },
  { id: 873989, title: "Массовый сбой выгрузки", section: "Реклама", code: "#4567", date: "11.09.2025 14:00", status: "DEV", author: "Николаев Пётр", authorRole: "Партнер компании", linkedOrder: "#263816", product: "Реклама", result: "", initiative: false, critical: true, responsible: "Авсенова Елена", nextContact: "", messages: [{ from: "user", text: "У нескольких компаний не работает выгрузка объектов в рекламу.", time: "14:00" }, { from: "system", text: "Дата приёма в работу: 11.09.2025 14:15\nСпециалист: Авсенова Елена\nСтатус: В работе", time: "14:15" }, { from: "operator", text: "Подтверждаю проблему, передаю в разработку.", time: "14:30" }, { from: "system", text: "Обращение передано в разработку. Заказ #263816", time: "14:31" }] },
  { id: 873990, title: "Вопрос по тарифу", section: "Общие вопросы", code: "#4568", date: "09.09.2025 11:00", status: "CLOSED", author: "Белова Анна", authorRole: "Партнер компании", linkedOrder: null, product: "Общее", result: "Проблема решена", initiative: false, critical: false, responsible: "Мамонтов Константин", nextContact: "", messages: [{ from: "user", text: "Какой тариф подойдёт для компании из 50 человек?", time: "11:00" }, { from: "operator", text: "Рекомендую тариф «Бизнес». Подробности отправил на почту.", time: "11:30" }, { from: "system", text: "Обращение закрыто. Результат: Проблема решена", time: "11:35" }] },
];

const ORDERS = [
  { id: "#263816", title: "Разделение чатов с клиентами", tags: ["Backend", "Развитие"], status: "Тестирование" },
  { id: "#263900", title: "Ошибка экспорта фидов", tags: ["Backend", "Баг"], status: "В работе" },
  { id: "#264001", title: "Групповые чаты", tags: ["Frontend", "Развитие"], status: "Новый" },
];

// ─── ICONS (inline SVG) ───
const Icons = {
  Search: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>,
  Close: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>,
  Send: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m22 2-7 20-4-9-9-4z" /></svg>,
  Clip: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>,
  Smile: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>,
  Filter: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>,
  Grid: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>,
  Copy: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>,
  Arrow: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>,
  Clock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  User: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>,
};

// ─── STYLES ───
const font = `'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif`;

// ─── COMPONENTS ───
function StatusBadge({ status, small }) {
  const s = STATUSES[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: small ? "2px 8px" : "4px 12px",
      borderRadius: 20, fontSize: small ? 11 : 12, fontWeight: 600,
      color: s.color, background: s.bg, border: `1px solid ${s.color}33`,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />
      {s.label}
    </span>
  );
}

function Avatar({ name, size = 32 }) {
  const colors = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899"];
  const idx = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
  const initials = name.split(" ").slice(0, 2).map(w => w[0]).join("");
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: colors[idx],
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontSize: size * 0.38, fontWeight: 600, flexShrink: 0,
    }}>{initials}</div>
  );
}

// ─── TICKET LIST ───
function TicketList({ tickets, onSelect, statusFilter, setStatusFilter }) {
  const [search, setSearch] = useState("");
  const filtered = tickets.filter(t => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.author.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc", fontFamily: font }}>
      {/* Header */}
      <div style={{ padding: "16px 24px", background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>Техподдержка</h1>
        <div style={{ flex: 1, maxWidth: 400, position: "relative" }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}><Icons.Search /></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск обращений..." style={{
            width: "100%", padding: "8px 12px 8px 32px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", background: "#f8fafc",
          }} />
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center", color: "#64748b", fontSize: 13 }}>
          <Icons.Filter /> <span>Показано {filtered.length}</span>
        </div>
      </div>

      {/* Status tabs */}
      <div style={{ padding: "12px 24px 0", background: "#fff", display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[{ key: "", label: "Все" }, ...Object.entries(STATUSES).map(([k, v]) => ({ key: k, label: v.label }))].map(s => (
          <button key={s.key} onClick={() => setStatusFilter(s.key)} style={{
            padding: "6px 14px", borderRadius: 20, border: "1px solid " + (statusFilter === s.key ? "#3b82f6" : "#e2e8f0"),
            background: statusFilter === s.key ? "#eff6ff" : "#fff", color: statusFilter === s.key ? "#3b82f6" : "#64748b",
            fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all .15s",
          }}>{s.label} {s.key && <span style={{ marginLeft: 4, opacity: 0.6 }}>({tickets.filter(t => t.status === s.key).length})</span>}</button>
        ))}
      </div>

      {/* Cards grid */}
      <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {filtered.map(t => (
            <div key={t.id} onClick={() => onSelect(t.id)} style={{
              background: "#fff", borderRadius: 12, padding: 16, cursor: "pointer",
              border: "1px solid #e2e8f0", transition: "all .2s",
              boxShadow: "0 1px 3px rgba(0,0,0,.04)",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(59,130,246,.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,.04)"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
                <StatusBadge status={t.status} small />
                <Avatar name={t.author} size={28} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>{t.title}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>📁 {t.section}</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8" }}>
                <span>{t.code}</span>
                <span>{t.date}</span>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "#94a3b8", fontSize: 14 }}>Обращений не найдено</div>
        )}
      </div>
    </div>
  );
}

// ─── MODAL: CLOSE TICKET ───
function CloseModal({ onClose, onConfirm }) {
  const [result, setResult] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 28, width: 420, boxShadow: "0 20px 60px rgba(0,0,0,.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Закрыть обращение</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><Icons.Close /></button>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 10 }}>Результат <span style={{ color: "#ef4444" }}>*</span></div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {CLOSE_RESULTS.map(r => (
            <button key={r} onClick={() => setResult(r)} style={{
              padding: "8px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer",
              border: result === r ? "2px solid #3b82f6" : "1px solid #e2e8f0",
              background: result === r ? "#eff6ff" : "#fff", color: result === r ? "#3b82f6" : "#475569",
              fontWeight: result === r ? 600 : 400, transition: "all .15s",
            }}>{r}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, cursor: "pointer", color: "#475569" }}>Отмена</button>
          <button disabled={!result} onClick={() => onConfirm(result)} style={{
            padding: "10px 20px", borderRadius: 8, border: "none", fontSize: 13, cursor: result ? "pointer" : "default",
            background: result ? "#22c55e" : "#e2e8f0", color: result ? "#fff" : "#94a3b8", fontWeight: 600, transition: "all .15s",
          }}>Закрыть обращение</button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL: SELECT ORDER ───
function OrderModal({ onClose, onSelect }) {
  const [search, setSearch] = useState("");
  const filtered = ORDERS.filter(o => o.title.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search));
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 28, width: 460, maxHeight: "70vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Выбрать заказ в разработку</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><Icons.Close /></button>
        </div>
        <div style={{ position: "relative", marginBottom: 16 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}><Icons.Search /></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Найти..." style={{
            width: "100%", padding: "10px 12px 10px 34px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none",
          }} />
        </div>
        <div style={{ flex: 1, overflow: "auto" }}>
          {filtered.map(o => (
            <div key={o.id} onClick={() => onSelect(o.id)} style={{
              padding: 14, borderRadius: 10, border: "1px solid #e2e8f0", marginBottom: 10,
              cursor: "pointer", transition: "all .15s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#3b82f6"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#8b5cf6", fontWeight: 600 }}>{o.status}</span>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{o.id}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: 6 }}>{o.title}</div>
              <div style={{ display: "flex", gap: 6 }}>
                {o.tags.map(tag => (
                  <span key={tag} style={{ padding: "2px 8px", borderRadius: 4, background: "#f1f5f9", fontSize: 11, color: "#64748b" }}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MODAL: PARTICIPANTS ───
function ParticipantsModal({ ticket, onClose, onSave }) {
  const [responsible, setResponsible] = useState(ticket.responsible);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 28, width: 400, boxShadow: "0 20px 60px rgba(0,0,0,.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Участники</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><Icons.Close /></button>
        </div>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Ответственный</label>
        <input value={responsible} onChange={e => setResponsible(e.target.value)} placeholder="Имя специалиста" style={{
          width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, marginTop: 6, marginBottom: 20, outline: "none",
        }} />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, cursor: "pointer" }}>Отмена</button>
          <button onClick={() => { onSave(responsible); onClose(); }} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#3b82f6", color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Сохранить</button>
        </div>
      </div>
    </div>
  );
}

// ─── TICKET DETAIL ───
function TicketDetail({ ticket, onBack, onUpdate }) {
  const [msg, setMsg] = useState("");
  const [showClose, setShowClose] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [activeTab, setActiveTab] = useState("main");
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [ticket.messages]);

  const now = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const sendMessage = () => {
    if (!msg.trim()) return;
    const updated = { ...ticket, messages: [...ticket.messages, { from: "operator", text: msg.trim(), time: now() }] };
    onUpdate(updated);
    setMsg("");
  };

  const simulateUserReply = () => {
    const replies = ["Спасибо за ответ!", "Окей, проверю и напишу", "Да, проблема сохраняется", "Вот скриншот ошибки", "Понял, подождём"];
    const reply = replies[Math.floor(Math.random() * replies.length)];
    const updated = { ...ticket, messages: [...ticket.messages, { from: "user", text: reply, time: now() }] };
    if (ticket.status === "CLARIFICATION") {
      updated.status = "IN_PROGRESS";
      updated.messages.push({ from: "system", text: "Статус автоматически изменён на «В работе» (получено сообщение от пользователя)", time: now() });
    }
    onUpdate(updated);
  };

  const takeToWork = () => {
    const updated = {
      ...ticket,
      status: "IN_PROGRESS",
      responsible: ticket.responsible || "Авсенова Елена",
      messages: [...ticket.messages, { from: "system", text: `Дата приёма в работу: ${new Date().toLocaleDateString("ru-RU")} ${now()}\nОтветственный: ${ticket.responsible || "Авсенова Елена"}\nСтатус: В работе`, time: now() }],
    };
    onUpdate(updated);
  };

  const pauseTicket = () => {
    const updated = { ...ticket, status: "CLARIFICATION", messages: [...ticket.messages, { from: "system", text: "Обращение поставлено на паузу. Ожидание ответа от пользователя.", time: now() }] };
    onUpdate(updated);
  };

  const transferToDev = (orderId) => {
    const updated = {
      ...ticket,
      status: "DEV",
      linkedOrder: orderId,
      messages: [...ticket.messages, { from: "system", text: `Обращение передано в разработку. Заказ ${orderId}`, time: now() }],
    };
    onUpdate(updated);
    setShowOrder(false);
  };

  const closeTicket = (result) => {
    const updated = {
      ...ticket,
      status: "CLOSED",
      result,
      messages: [...ticket.messages, { from: "system", text: `Обращение закрыто. Результат: ${result}`, time: now() }],
    };
    onUpdate(updated);
    setShowClose(false);
  };

  const canTake = ticket.status === "NEW" || ticket.status === "CLARIFICATION";
  const canPause = ticket.status === "IN_PROGRESS";
  const canTransfer = ticket.status === "IN_PROGRESS";
  const isClosed = ticket.status === "CLOSED";

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: font, background: "#fff" }}>
      {/* Top bar */}
      <div style={{ padding: "12px 20px", background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#64748b", padding: "4px 8px" }}>←</button>
        <span style={{ fontSize: 13, color: "#94a3b8" }}>Техподдержка</span>
        <span style={{ color: "#cbd5e1" }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{ticket.id}</span>
        <div style={{ flex: 1 }} />
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><Icons.Close /></button>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* LEFT: Chat */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid #e2e8f0" }}>
          {/* Chat header */}
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar name={ticket.author} size={36} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{ticket.author}</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>{ticket.authorRole}</div>
            </div>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 12, color: "#94a3b8", background: "#f8fafc", padding: "4px 10px", borderRadius: 6 }}>📁 {ticket.section}</span>
          </div>

          {/* Messages */}
          <div ref={chatRef} style={{ flex: 1, overflow: "auto", padding: 20, background: "#f8fafc" }}>
            {ticket.messages.map((m, i) => {
              if (m.from === "system") {
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "center", margin: "12px 0" }}>
                    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 16px", maxWidth: 400, fontSize: 12, color: "#64748b", whiteSpace: "pre-line", textAlign: "center", lineHeight: 1.5 }}>
                      {m.text}
                      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>{m.time}</div>
                    </div>
                  </div>
                );
              }
              const isUser = m.from === "user";
              return (
                <div key={i} style={{ display: "flex", justifyContent: isUser ? "flex-start" : "flex-end", marginBottom: 10 }}>
                  <div style={{
                    maxWidth: "70%", padding: "10px 14px", borderRadius: 12,
                    background: isUser ? "#fff" : "#3b82f6", color: isUser ? "#0f172a" : "#fff",
                    border: isUser ? "1px solid #e2e8f0" : "none",
                    boxShadow: "0 1px 2px rgba(0,0,0,.05)",
                  }}>
                    <div style={{ fontSize: 13, lineHeight: 1.5 }}>{m.text}</div>
                    <div style={{ fontSize: 10, opacity: 0.6, textAlign: "right", marginTop: 4 }}>
                      {m.time} {!isUser && " ✓✓"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div style={{ padding: "12px 20px", borderTop: "1px solid #e2e8f0", background: "#fff" }}>
            {/* Demo button */}
            <div style={{ marginBottom: 8, display: "flex", gap: 8 }}>
              <button onClick={simulateUserReply} style={{
                padding: "4px 10px", borderRadius: 6, border: "1px dashed #cbd5e1", background: "#f8fafc",
                fontSize: 11, color: "#64748b", cursor: "pointer",
              }}>⚡ Симулировать ответ пользователя</button>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><Icons.Clip /></button>
              <input
                value={msg}
                onChange={e => setMsg(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder={isClosed ? "Обращение закрыто" : "Сообщение..."}
                disabled={isClosed}
                style={{ flex: 1, padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 13, outline: "none", background: isClosed ? "#f8fafc" : "#fff" }}
              />
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><Icons.Smile /></button>
              <button onClick={sendMessage} disabled={isClosed || !msg.trim()} style={{
                width: 36, height: 36, borderRadius: "50%", border: "none",
                background: msg.trim() && !isClosed ? "#3b82f6" : "#e2e8f0",
                color: msg.trim() && !isClosed ? "#fff" : "#94a3b8",
                cursor: msg.trim() && !isClosed ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center",
              }}><Icons.Send /></button>
            </div>
          </div>
        </div>

        {/* RIGHT: Side panel */}
        <div style={{ width: 340, display: "flex", flexDirection: "column", background: "#fff", overflow: "auto" }}>
          <div style={{ padding: 20 }}>
            {/* Status + ID */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <StatusBadge status={ticket.status} />
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#94a3b8" }}>
                ID: {ticket.id}
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><Icons.Copy /></button>
              </div>
            </div>

            {/* Actions based on status */}
            {ticket.status === "NEW" && !ticket.responsible && (
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, marginBottom: 16, textAlign: "center" }}>
                <div style={{ marginBottom: 8 }}><Icons.Clock /></div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>Ожидает специалиста</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>Определите и решите проблему</div>
                <button onClick={takeToWork} style={{
                  width: "100%", padding: "10px 0", borderRadius: 8, border: "none",
                  background: "#22c55e", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}>Взять в работу</button>
              </div>
            )}

            {ticket.status === "CLARIFICATION" && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ background: "#fffbeb", borderRadius: 12, padding: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#f59e0b", marginBottom: 4 }}>Ожидание ответа пользователя</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>Статус вернётся в «В работе» при ответе</div>
                  <button onClick={takeToWork} style={{
                    width: "100%", padding: "10px 0", borderRadius: 8, border: "none",
                    background: "#3b82f6", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}>Взять в работу</button>
                </div>
              </div>
            )}

            {canTransfer && (
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <button onClick={() => setShowOrder(true)} style={{
                  flex: 1, padding: "10px 0", borderRadius: 8, border: "none",
                  background: "#f59e0b", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}>Передать в разработку</button>
              </div>
            )}

            {canPause && (
              <button onClick={pauseTicket} style={{
                width: "100%", padding: "10px 0", borderRadius: 8, border: "1px solid #e2e8f0",
                background: "#fff", color: "#64748b", fontSize: 13, cursor: "pointer", marginBottom: 12,
              }}>На паузу (уточнение)</button>
            )}

            {ticket.status === "DEV" && (
              <div style={{ marginBottom: 12 }}>
                <button onClick={() => setShowClose(true)} style={{
                  width: "100%", padding: "10px 0", borderRadius: 8, border: "none",
                  background: "#ef4444", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}>Закрыть обращение</button>
              </div>
            )}

            {ticket.status === "IN_PROGRESS" && (
              <button onClick={() => setShowClose(true)} style={{
                width: "100%", padding: "10px 0", borderRadius: 8, border: "1px solid #ef4444",
                background: "#fff", color: "#ef4444", fontSize: 13, cursor: "pointer", marginBottom: 12,
              }}>Закрыть обращение</button>
            )}

            {/* Linked order */}
            {ticket.linkedOrder && (
              <div style={{ padding: "10px 14px", borderRadius: 8, background: "#f5f3ff", border: "1px solid #ddd6fe", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11, color: "#8b5cf6", fontWeight: 500 }}>Связано с заказом</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#6d28d9" }}>{ticket.linkedOrder}</div>
                </div>
                <span style={{ color: "#8b5cf6" }}><Icons.Arrow /></span>
              </div>
            )}

            {/* Fields */}
            {ticket.status !== "NEW" && (
              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
                {/* Tabs */}
                <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                  {["main", "participants"].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                      flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid " + (activeTab === tab ? "#3b82f6" : "#e2e8f0"),
                      background: activeTab === tab ? "#eff6ff" : "#fff", color: activeTab === tab ? "#3b82f6" : "#64748b",
                      fontSize: 12, fontWeight: 500, cursor: "pointer",
                    }}>{tab === "main" ? "Основное" : "Участники"}</button>
                  ))}
                </div>

                {activeTab === "main" && (
                  <>
                    <FieldRow label="Ответственный" icon={<Icons.User />}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {ticket.responsible && <Avatar name={ticket.responsible} size={22} />}
                        <span style={{ fontSize: 13 }}>{ticket.responsible || "—"}</span>
                      </div>
                    </FieldRow>
                    <FieldRow label="Следующий контакт" icon={<Icons.Clock />}>
                      <span style={{ fontSize: 13 }}>{ticket.nextContact || "—"}</span>
                    </FieldRow>
                    <FieldRow label="Продукт">
                      <select value={ticket.product} onChange={e => onUpdate({ ...ticket, product: e.target.value })} style={{
                        padding: "4px 8px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 12, outline: "none", background: "#fff",
                      }}>
                        <option value="">—</option>
                        {["Объекты", "Реклама", "Чат", "Управление", "CRM", "Общее"].map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </FieldRow>
                    {ticket.result && (
                      <FieldRow label="Результат" icon={<Icons.Check />}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#22c55e" }}>{ticket.result}</span>
                      </FieldRow>
                    )}
                    <FieldRow label="Инициатива">
                      <Toggle checked={ticket.initiative} onChange={v => onUpdate({ ...ticket, initiative: v })} />
                    </FieldRow>
                    <FieldRow label="Критическая проблема">
                      <Toggle checked={ticket.critical} onChange={v => onUpdate({ ...ticket, critical: v })} />
                    </FieldRow>
                  </>
                )}

                {activeTab === "participants" && (
                  <div style={{ textAlign: "center", padding: 20 }}>
                    {ticket.responsible && (
                      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: "#f8fafc", borderRadius: 10, marginBottom: 10 }}>
                        <Avatar name={ticket.responsible} size={36} />
                        <div style={{ textAlign: "left" }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{ticket.responsible}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>Ответственный</div>
                        </div>
                      </div>
                    )}
                    <button onClick={() => setShowParticipants(true)} style={{
                      padding: "8px 16px", borderRadius: 8, border: "1px solid #e2e8f0",
                      background: "#fff", fontSize: 12, cursor: "pointer", color: "#3b82f6",
                    }}>Изменить участников</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showClose && <CloseModal onClose={() => setShowClose(false)} onConfirm={closeTicket} />}
      {showOrder && <OrderModal onClose={() => setShowOrder(false)} onSelect={transferToDev} />}
      {showParticipants && <ParticipantsModal ticket={ticket} onClose={() => setShowParticipants(false)} onSave={r => onUpdate({ ...ticket, responsible: r })} />}
    </div>
  );
}

function FieldRow({ label, icon, children }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f8fafc" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
        {icon}
        {label}
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} style={{
      width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
      background: checked ? "#3b82f6" : "#e2e8f0", position: "relative", transition: "background .2s",
    }}>
      <div style={{
        width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute",
        top: 3, left: checked ? 21 : 3, transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)",
      }} />
    </button>
  );
}

// ─── MAIN APP ───
export default function App() {
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [selectedId, setSelectedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  const updateTicket = useCallback((updated) => {
    setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
  }, []);

  const selected = tickets.find(t => t.id === selectedId);

  if (selected) {
    return <TicketDetail ticket={selected} onBack={() => setSelectedId(null)} onUpdate={updateTicket} />;
  }

  return <TicketList tickets={tickets} onSelect={setSelectedId} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />;
}

