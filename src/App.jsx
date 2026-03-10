import { useState, useRef, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════
   VT PLATFORM — ТЕХПОДДЕРЖКА MVP PROTOTYPE
   Pixel-perfect по макетам Figma
   ═══════════════════════════════════════════ */

// ── Palette (extracted from Figma) ──
const C = {
  yellow: "#F5C518", yellowLight: "#FFF9E0", yellowBorder: "#F5C518",
  green: "#4CAF50", greenLight: "#E8F5E9", greenBg: "#43A047",
  blue: "#2196F3", blueLight: "#E3F2FD",
  orange: "#FF9800", orangeLight: "#FFF3E0", orangeBorder: "#FF9800",
  purple: "#7C4DFF", purpleLight: "#EDE7F6",
  red: "#F44336",
  gray50: "#FAFAFA", gray100: "#F5F5F5", gray200: "#EEEEEE", gray300: "#E0E0E0",
  gray400: "#BDBDBD", gray500: "#9E9E9E", gray600: "#757575", gray700: "#616161",
  gray800: "#424242", gray900: "#212121",
  white: "#FFFFFF",
  headerBg: "#FFFDE7", // subtle yellow tint from Figma top bar
  chatBg: "linear-gradient(180deg, #C8E6C9 0%, #E8F5E9 40%, #FFFDE7 100%)",
};

const STATUSES = {
  NEW: { label: "Новый", color: C.green, bg: C.greenLight, border: "#A5D6A7" },
  IN_PROGRESS: { label: "В работе", color: C.blue, bg: C.blueLight, border: "#90CAF9" },
  CLARIFICATION: { label: "Уточнение информации", color: C.orange, bg: C.orangeLight, border: "#FFCC80" },
  DEV: { label: "Передано в разработку", color: C.purple, bg: C.purpleLight, border: "#B39DDB" },
  CLOSED: { label: "Закрыто", color: C.green, bg: C.greenLight, border: "#A5D6A7" },
};

const CLOSE_RESULTS = ["Проблема решена", "Не проблема", "Не представлены данные", "Отложено как идея", "Невыполнимо"];
const REQUEST_TYPES = ["", "Баг", "Идея", "Консультация"];
const DEV_TRANSFER_TYPES = ["Баг", "Идея"];
const PRODUCTS = ["", "Объекты", "Реклама", "Чат", "Управление", "CRM", "Общее"];

const DEMO_TICKETS = [
  { id: 873985, num: "#4563", title: "Не могу создать объект", section: "Мои объекты", date: "10.09.2025 16:54", status: "NEW", author: "Иванов Дмитрий Петрович", authorRole: "Партнер компании", linkedObject: "Наталья Купить Квартира 5614407", linkedOrder: null, product: "", type: "Баг", devTransferType: "", result: "", closedAt: "", closedBy: "", initiative: false, critical: false, responsible: "", nextContact: "", messages: [
    {
      from: "user",
      format: "user_report",
      time: "11:38",
      payload: {
        typeLabel: "Ошибка",
        message: "не открывается карточка",
        section: "Главная страница",
        url: "file:///Users/miron/Downloads/support-fullflow_1.html",
        environment: "Safari · macOS · 1470×956",
        userId: "48291",
        createdAt: "05.03, 11:38",
      },
    },
  ] },
  { id: 873986, num: "#4564", title: "Ошибка выгрузки фида", section: "Реклама", date: "10.09.2025 17:01", status: "NEW", author: "Петрова Елена Сергеевна", authorRole: "Партнер компании", linkedObject: "Петрова Продать Дом 7823156", linkedOrder: null, product: "", result: "", initiative: false, critical: false, responsible: "", nextContact: "", messages: [{ from: "user", text: "Фид не выгружается уже 2 дня, ошибка 500 при попытке экспорта.", time: "17:01" }] },
  { id: 873987, num: "#4565", title: "Хочу групповой чат", section: "Чат", date: "11.09.2025 09:12", status: "IN_PROGRESS", author: "Сидоров Алексей Иванович", authorRole: "Агент", linkedObject: null, linkedOrder: null, product: "", result: "", initiative: true, critical: false, responsible: "Авсенова Елена", nextContact: "10.01.2025", messages: [{ from: "user", text: "Было бы здорово иметь групповой чат с коллегами внутри платформы.", time: "09:12" }, { from: "system", text: "Дата приема в работу\n11.09.2025 09:30\nСпециалист\nАвсенова Елена\nСтатус\nВ работе", time: "09:30" }, { from: "operator", text: "Структуры проекта", time: "13:43" }] },
  { id: 873988, num: "#4566", title: "Не вижу контакты клиентов", section: "Управление", date: "11.09.2025 10:30", status: "CLARIFICATION", author: "Козлова Марина Викторовна", authorRole: "Руководитель", linkedObject: null, linkedOrder: null, product: "", result: "", initiative: false, critical: false, responsible: "Авсенова Елена", nextContact: "10.01.2025", messages: [{ from: "user", text: "Для всех юристов нашей компании должны быть открыты контакты клиентов.", time: "10:30" }, { from: "system", text: "Дата приема в работу\n11.09.2025 11:00\nСпециалист\nАвсенова Елена\nСтатус\nВ работе", time: "11:00" }, { from: "operator", text: "Уточните, пожалуйста, в каком разделе не видны контакты?", time: "11:15" }] },
  { id: 873989, num: "#4567", title: "Массовый сбой выгрузки", section: "Реклама", date: "11.09.2025 14:00", status: "DEV", author: "Николаев Пётр Сергеевич", authorRole: "Партнер компании", linkedObject: "Николаев Продать Офис 9912345", linkedOrder: "#263816", product: "", result: "", initiative: false, critical: true, responsible: "Авсенова Елена", nextContact: "10.01.2025", messages: [{ from: "user", text: "У нескольких компаний не работает выгрузка объектов в рекламу.", time: "14:00" }, { from: "system", text: "Дата приема в работу\n11.09.2025 14:15\nСпециалист\nАвсенова Елена\nСтатус\nВ работе", time: "14:15" }, { from: "operator", text: "Подтверждаю проблему, передаю в разработку.", time: "14:30" }] },
  { id: 873990, num: "#4568", title: "Вопрос по настройке прав", section: "Управление", date: "09.09.2025 11:00", status: "CLOSED", author: "Белова Анна Михайловна", authorRole: "Партнер компании", linkedObject: null, linkedOrder: "#263816", product: "Объекты", type: "Консультация", devTransferType: "Идея", result: "Проблема решена", closedAt: "09.09.2025 11:35", closedBy: "Техподдержка", initiative: false, critical: false, responsible: "Мамонтов Константин", nextContact: "10.01.2025", messages: [{ from: "user", text: "Как настроить права доступа для новых сотрудников?", time: "11:00" }, { from: "operator", text: "Настройки доступа находятся в разделе Управление → Роли.", time: "11:30" }] },
  { id: 873991, num: "#4569", title: "Не работает поиск объектов", section: "Мои объекты", date: "12.09.2025 08:15", status: "NEW", author: "Громова Наталья", authorRole: "Агент", linkedObject: "Громова Купить Квартира 3345678", linkedOrder: null, product: "", result: "", initiative: false, critical: false, responsible: "", nextContact: "", messages: [{ from: "user", text: "Поиск по объектам не возвращает результаты, хотя объекты есть.", time: "08:15" }] },
  { id: 873992, num: "#4570", title: "Проблема с уведомлениями", section: "Общее", date: "12.09.2025 09:00", status: "NEW", author: "Фёдоров Игорь", authorRole: "Партнер компании", linkedObject: null, linkedOrder: null, product: "", result: "", initiative: false, critical: false, responsible: "", nextContact: "", messages: [{ from: "user", text: "Уведомления приходят с большой задержкой или вообще не приходят.", time: "09:00" }] },
  { id: 873993, num: "#4571", title: "Хочу экспорт в Excel", section: "CRM", date: "12.09.2025 10:22", status: "NEW", author: "Васильева Ольга", authorRole: "Руководитель", linkedObject: null, linkedOrder: null, product: "", result: "", initiative: true, critical: false, responsible: "", nextContact: "", messages: [{ from: "user", text: "Нужна возможность экспортировать данные по сделкам в Excel.", time: "10:22" }] },
  { id: 873994, num: "#4572", title: "Ошибка при сохранении карточки", section: "Мои объекты", date: "12.09.2025 11:45", status: "NEW", author: "Кузнецов Андрей", authorRole: "Агент", linkedObject: "Кузнецов Продать Квартира 5567890", linkedOrder: null, product: "", result: "", initiative: false, critical: true, responsible: "", nextContact: "", messages: [{ from: "user", text: "При сохранении карточки объекта выдаёт ошибку 403.", time: "11:45" }] },
];

const ORDERS = [
  { id: "#263816", title: "Название истории", path: "Платформа · Чат · Разделение чатов с клиентами", parent: "Название карточки родителя", num: "#34958", tags: ["История", "Backend", "Развитие", "Макет"], status: "Тестирование", assignee: "Иванов Алексей", hours: "9 из 12 ч.", points: "70", dates: ["Пт 20 авг", "Пн 16 авг"], subs: 8 },
  { id: "#263900", title: "Ошибка экспорта фидов", path: "Платформа · Реклама · Выгрузка", parent: "", num: "#35001", tags: ["Backend", "Баг"], status: "В работе", assignee: "Петров Дмитрий", hours: "3 из 8 ч.", points: "40", dates: ["Ср 25 авг", "Пн 23 авг"], subs: 3 },
];

// ── Helpers ──
const now = () => { const d = new Date(); return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`; };
const stampRu = () => {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy} ${now()}`;
};
const avatarColor = (name) => {
  const colors = ["#FF7043","#42A5F5","#66BB6A","#FFA726","#AB47BC","#EC407A","#26A69A","#5C6BC0"];
  return colors[name.split("").reduce((a,c) => a+c.charCodeAt(0),0) % colors.length];
};
const initials = (name) => name.split(" ").slice(0,2).map(w=>w[0]).join("");
const normalizeTicket = (t) => ({
  type: "",
  devTransferType: "",
  result: "",
  closedAt: "",
  closedBy: "",
  product: "",
  initiative: false,
  critical: false,
  responsible: "",
  nextContact: "",
  linkedOrder: null,
  linkedObject: null,
  messages: [],
  ...t,
});

const deriveTypeFromMessages = (ticket) => {
  const msgs = Array.isArray(ticket.messages) ? ticket.messages : [];
  const report = msgs.find(m => m?.from === "user" && m?.format === "user_report" && m?.payload);
  const label = String(report?.payload?.typeLabel || "").toLowerCase();
  if (label.includes("ошиб")) return "Баг";
  if (label.includes("иде")) return "Идея";
  return "";
};

const normalizeAndClassifyTicket = (t) => {
  const base = normalizeTicket(t);
  if (!base.type) {
    const derived = deriveTypeFromMessages(base);
    if (derived) return { ...base, type: derived };
  }
  return base;
};

// ── Shared Components ──
function Avatar({ name, size = 32 }) {
  return <div style={{ width: size, height: size, borderRadius: "50%", background: avatarColor(name), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: size * 0.36, fontWeight: 600, flexShrink: 0, letterSpacing: -0.5 }}>{initials(name)}</div>;
}

function StatusBadge({ status, dropdown }) {
  const s = STATUSES[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 12px 4px 10px", borderRadius: 4, fontSize: 13, fontWeight: 500, color: s.color, background: s.bg, border: `1px solid ${s.border}`, cursor: dropdown ? "pointer" : "default", whiteSpace: "nowrap" }}>
      {s.label}
      {dropdown && <span style={{ marginLeft: 2, fontSize: 10 }}>▾</span>}
    </span>
  );
}

function Toggle({ checked, onChange, disabled }) {
  return (
    <button onClick={() => !disabled && onChange(!checked)} style={{ width: 44, height: 24, borderRadius: 12, border: "none", cursor: disabled ? "default" : "pointer", background: checked ? C.blue : C.gray300, position: "relative", transition: "background .2s", opacity: disabled ? 0.5 : 1, flexShrink: 0 }}>
      <div style={{ width: 18, height: 18, borderRadius: "50%", background: C.white, position: "absolute", top: 3, left: checked ? 23 : 3, transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
    </button>
  );
}

// ══════════════════════════════════════
// SCREEN: TICKET LIST (grid of cards)
// ══════════════════════════════════════
function TicketListScreen({ tickets, onSelect }) {
  const [filter, setFilter] = useState("NEW");
  const [resultFilter, setResultFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [devTransferFilter, setDevTransferFilter] = useState("");

  const filtered = tickets.filter(t => {
    if (filter && t.status !== filter) return false;
    if (typeFilter && (t.type || "") !== typeFilter) return false;
    if (devTransferFilter && (t.devTransferType || "") !== devTransferFilter) return false;
    if (resultFilter && (t.result || "") !== resultFilter) return false;
    return true;
  });
  const count = filtered.length;
  const newTotal = tickets.filter(t => t.status === "NEW").length;
  const newBugs = tickets.filter(t => t.status === "NEW" && (t.type || "") === "Баг").length;
  const newIdeas = tickets.filter(t => t.status === "NEW" && (t.type || "") === "Идея").length;

  return (
    <div style={{ height: "100vh", background: C.white, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* ── Global top bar (VT platform header) ── */}
      <div style={{ height: 48, background: C.headerBg, borderBottom: `1px solid ${C.gray200}`, display: "flex", alignItems: "center", padding: "0 16px", gap: 16 }}>
        <span style={{ fontSize: 20, color: C.gray600, cursor: "pointer" }}>☰</span>
        <span style={{ fontSize: 14, fontWeight: 500, color: C.gray700 }}>Рабочий стол</span>
        <div style={{ flex: 1 }} />
        {/* Search bar */}
        <div style={{ position: "relative", width: 280 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.gray400, fontSize: 14 }}>🔍</span>
          <input placeholder="Поиск..." style={{ width: "100%", padding: "6px 12px 6px 32px", border: `1px solid ${C.gray300}`, borderRadius: 20, fontSize: 13, outline: "none", background: C.white }} />
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: C.gray600 }}>
          <span style={{ padding: "4px 10px", background: C.yellow, borderRadius: 4, color: C.gray900, fontWeight: 600, fontSize: 12 }}>GPT-VT</span>
          <span>❓</span><span>♡</span><span>🔔</span><span>📅</span><span>💬</span>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.green, border: "2px solid #FFD54F" }} />
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div style={{ height: 48, borderBottom: `1px solid ${C.gray200}`, display: "flex", alignItems: "center", padding: "0 20px", gap: 12 }}>
        <button style={{ padding: "4px 12px", border: `1px solid ${C.gray300}`, borderRadius: 4, background: C.white, fontSize: 13, color: C.gray700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          Отчеты <span style={{ fontSize: 10 }}>▾</span>
        </button>
        <div style={{ flex: 1 }} />
        {/* View/filter icons */}
        <span style={{ color: C.gray500, cursor: "pointer", fontSize: 16 }}>⚙</span>
        <span style={{ color: C.gray500, cursor: "pointer", fontSize: 16, fontWeight: 700 }}>⊞</span>
        <span style={{ color: C.gray500, cursor: "pointer", fontSize: 16 }}>↕</span>
        <span style={{ position: "relative", color: C.gray500, cursor: "pointer", fontSize: 16 }}>
          🔀
          <span style={{ position: "absolute", top: -6, right: -8, background: C.yellow, color: C.gray900, fontSize: 9, fontWeight: 700, borderRadius: 8, padding: "1px 4px" }}>15</span>
        </span>
        <span style={{ fontSize: 13, color: C.gray600 }}>Показано {count}</span>
        <button onClick={() => setFilter("")} style={{ background: "none", border: "none", color: C.blue, fontSize: 13, cursor: "pointer", fontWeight: 500 }}>Сбросить</button>
        <div style={{ width: 1, height: 24, background: C.gray300 }} />
        <button style={{ padding: "4px 12px", border: `1px solid ${C.gray300}`, borderRadius: 4, background: C.white, fontSize: 13, color: C.gray700, cursor: "pointer" }}>
          Действия <span style={{ fontSize: 10 }}>▾</span>
        </button>
      </div>

      {/* ── Status filter pills ── */}
      <div style={{ padding: "12px 20px", display: "flex", gap: 6, flexWrap: "wrap", flexShrink: 0 }}>
        {[{ key: "", label: `Все (${tickets.length})` }, ...Object.entries(STATUSES).map(([k, v]) => ({ key: k, label: `${v.label} (${tickets.filter(t => t.status === k).length})` }))].map(s => (
          <button key={s.key} onClick={() => setFilter(s.key)} style={{
            padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all .15s",
            border: filter === s.key ? `1px solid ${C.blue}` : `1px solid ${C.gray300}`,
            background: filter === s.key ? C.blueLight : C.white,
            color: filter === s.key ? C.blue : C.gray600,
          }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span>{s.label}</span>
              {s.key === "NEW" && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ padding: "2px 8px", borderRadius: 999, background: "#FFEBEE", color: C.red, border: `1px solid ${C.red}33`, fontSize: 11, fontWeight: 700 }}>
                    Ошибки {newBugs}
                  </span>
                  <span style={{ padding: "2px 8px", borderRadius: 999, background: C.purpleLight, color: C.purple, border: `1px solid ${C.purple}33`, fontSize: 11, fontWeight: 700 }}>
                    Идеи {newIdeas}
                  </span>
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {/* ── Fast triage for NEW: bugs / ideas ── */}
      <div style={{ padding: "0 20px 10px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", flexShrink: 0 }}>
        <span style={{ fontSize: 12, color: C.gray500, marginRight: 4 }}>Разбор новых</span>
        {[
          { key: "all", label: `Все (${newTotal})`, onClick: () => { setFilter("NEW"); setTypeFilter(""); } },
          { key: "bug", label: `Ошибки (${newBugs})`, onClick: () => { setFilter("NEW"); setTypeFilter("Баг"); } },
          { key: "idea", label: `Идеи (${newIdeas})`, onClick: () => { setFilter("NEW"); setTypeFilter("Идея"); } },
        ].map((x) => {
          const active = filter === "NEW" && (
            (x.key === "all" && !typeFilter) ||
            (x.key === "bug" && typeFilter === "Баг") ||
            (x.key === "idea" && typeFilter === "Идея")
          );
          return (
            <button key={x.key} onClick={x.onClick} style={{
              padding: "5px 12px", borderRadius: 999, fontSize: 12, cursor: "pointer",
              border: active ? `1px solid ${C.blue}` : `1px solid ${C.gray300}`,
              background: active ? C.blueLight : C.white,
              color: active ? C.blue : C.gray600,
              fontWeight: active ? 600 : 500,
            }}>
              {x.label}
            </button>
          );
        })}
      </div>

      {/* ── Analysis filters (types / dev / results) ── */}
      <div style={{ padding: "0 20px 10px", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.gray600 }}>
          <span style={{ color: C.gray500 }}>Тип</span>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding: "4px 8px", border: `1px solid ${C.gray300}`, borderRadius: 6, fontSize: 12, outline: "none", background: C.white }}>
            {REQUEST_TYPES.map(v => <option key={v} value={v}>{v || "Все"}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.gray600 }}>
          <span style={{ color: C.gray500 }}>В разработку</span>
          <select value={devTransferFilter} onChange={e => setDevTransferFilter(e.target.value)} style={{ padding: "4px 8px", border: `1px solid ${C.gray300}`, borderRadius: 6, fontSize: 12, outline: "none", background: C.white }}>
            {["", ...DEV_TRANSFER_TYPES].map(v => <option key={v || "all"} value={v}>{v || "Все"}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.gray600 }}>
          <span style={{ color: C.gray500 }}>Результат</span>
          <select value={resultFilter} onChange={e => setResultFilter(e.target.value)} style={{ padding: "4px 8px", border: `1px solid ${C.gray300}`, borderRadius: 6, fontSize: 12, outline: "none", background: C.white, minWidth: 160 }}>
            {["", ...CLOSE_RESULTS].map(v => <option key={v || "all"} value={v}>{v || "Все"}</option>)}
          </select>
        </div>
        <button onClick={() => { setTypeFilter(""); setDevTransferFilter(""); setResultFilter(""); }} style={{ background: "none", border: "none", color: C.blue, fontSize: 12, cursor: "pointer" }}>
          Сбросить фильтры
        </button>
      </div>

      {/* ── Card grid ── */}
      <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          {filtered.map(t => {
            const st = STATUSES[t.status];
            const triageLabel = t.type === "Баг" ? "Баг" : t.type === "Идея" ? "Идея" : "";
            const triageStyle =
              triageLabel === "Баг"
                ? { background: "#FFEBEE", color: C.red, border: `1px solid ${C.red}33` }
                : triageLabel === "Идея"
                  ? { background: C.purpleLight, color: C.purple, border: `1px solid ${C.purple}33` }
                  : { background: C.gray100, color: C.gray700, border: `1px solid ${C.gray300}` };
            return (
              <div key={t.id} onClick={() => onSelect(t.id)}
                style={{ background: C.white, borderRadius: 8, padding: "12px 14px", cursor: "pointer", border: `1px solid ${C.gray200}`, transition: "box-shadow .15s" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.08)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: st.color, background: st.bg, padding: "2px 8px", borderRadius: 3, border: `1px solid ${st.border}` }}>{st.label}</span>
                    {triageLabel && (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, ...triageStyle }}>
                        {triageLabel}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: -4 }}>
                    {t.responsible && <Avatar name={t.responsible} size={24} />}
                    <Avatar name={t.author} size={24} />
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.gray900, marginBottom: 4, lineHeight: 1.3 }}>{t.title}</div>
                <div style={{ fontSize: 12, color: C.gray500, marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 11 }}>📁</span> {t.section}
                </div>
                {(t.type || t.devTransferType || (t.status === "CLOSED" && t.result)) && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                    {t.type && <span style={{ padding: "2px 8px", borderRadius: 999, background: C.gray100, fontSize: 11, color: C.gray700 }}>{t.type}</span>}
                    {t.devTransferType && <span style={{ padding: "2px 8px", borderRadius: 999, background: C.purpleLight, fontSize: 11, color: C.purple }}>{`В разработку: ${t.devTransferType}`}</span>}
                    {t.status === "CLOSED" && t.result && <span style={{ padding: "2px 8px", borderRadius: 999, background: C.greenLight, fontSize: 11, color: C.green }}>{t.result}</span>}
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.gray400 }}>
                  <span>{t.num}</span>
                  <span>{t.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// SCREEN: TICKET DETAIL (chat + sidebar)
// ══════════════════════════════════════
function TicketDetailScreen({ ticket, onBack, onUpdate }) {
  const [msg, setMsg] = useState("");
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [sideTab, setSideTab] = useState("main"); // main | participants | service
  const [devTransferTypeDraft, setDevTransferTypeDraft] = useState("Баг");
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [ticket.messages.length]);

  const sendMsg = () => {
    if (!msg.trim()) return;
    onUpdate({ ...ticket, messages: [...ticket.messages, { from: "operator", text: msg.trim(), time: now() }] });
    setMsg("");
  };

  const simulateUserReply = () => {
    const replies = ["Спасибо, проверю!", "Да, проблема повторяется", "Вот скриншот с ошибкой", "Понял, жду", "Ещё раз попробовала — не работает"];
    const text = replies[Math.floor(Math.random() * replies.length)];
    const msgs = [...ticket.messages, { from: "user", text, time: now() }];
    let newStatus = ticket.status;
    if (ticket.status === "CLARIFICATION") {
      newStatus = "IN_PROGRESS";
      msgs.push({ from: "system", text: "Статус автоматически изменён на «В работе»\n(получено сообщение от пользователя)", time: now() });
    }
    onUpdate({ ...ticket, status: newStatus, messages: msgs });
  };

  const takeToWork = () => {
    const resp = ticket.responsible || "Авсенова Елена";
    onUpdate({
      ...ticket, status: "IN_PROGRESS", responsible: resp,
      messages: [...ticket.messages, { from: "system", text: `Дата приема в работу\n${new Date().toLocaleDateString("ru-RU")} ${now()}\nСпециалист\n${resp}\nСтатус\nВ работе`, time: now() }],
    });
  };

  const pauseTicket = () => {
    onUpdate({ ...ticket, status: "CLARIFICATION" });
  };

  const transferToDev = (orderId) => {
    onUpdate({
      ...ticket,
      status: "DEV",
      linkedOrder: orderId,
      devTransferType: devTransferTypeDraft,
      messages: [...ticket.messages, { from: "system", text: `Обращение передано в разработку.\nТип: ${devTransferTypeDraft}\nЗаказ ${orderId}`, time: now() }],
    });
    setShowOrderModal(false);
  };

  const closeTicket = (result) => {
    onUpdate({
      ...ticket,
      status: "CLOSED",
      result,
      closedAt: stampRu(),
      closedBy: "Техподдержка",
      messages: [...ticket.messages, { from: "system", text: `Обращение закрыто.\nРезультат: ${result}\nЗакрыл: Техподдержка`, time: now() }],
    });
    setShowCloseModal(false);
  };

  const st = STATUSES[ticket.status];
  const canTake = ticket.status === "NEW" || ticket.status === "CLARIFICATION";
  const isWorking = ticket.status === "IN_PROGRESS";
  const isDev = ticket.status === "DEV";
  const isClosed = ticket.status === "CLOSED";

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", background: C.white }}>
      {/* ── Global top bar ── */}
      <div style={{ height: 48, background: C.headerBg, borderBottom: `1px solid ${C.gray200}`, display: "flex", alignItems: "center", padding: "0 16px", gap: 16, flexShrink: 0 }}>
        <span style={{ fontSize: 20, color: C.gray600, cursor: "pointer" }}>☰</span>
        <span style={{ fontSize: 14, fontWeight: 500, color: C.gray700 }}>Рабочий стол</span>
        <div style={{ flex: 1 }} />
        <div style={{ position: "relative", width: 280 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.gray400, fontSize: 14 }}>🔍</span>
          <input placeholder="Поиск..." style={{ width: "100%", padding: "6px 12px 6px 32px", border: `1px solid ${C.gray300}`, borderRadius: 20, fontSize: 13, outline: "none", background: C.white }} />
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: C.gray600 }}>
          <span style={{ padding: "4px 10px", background: C.yellow, borderRadius: 4, color: C.gray900, fontWeight: 600, fontSize: 12 }}>GPT-VT</span>
          <span>❓</span><span>♡</span><span>🔔</span><span>📅</span><span>💬</span>
        </div>
      </div>

      {/* ── Secondary bar: breadcrumb + counters ── */}
      <div style={{ height: 40, borderBottom: `1px solid ${C.gray200}`, display: "flex", alignItems: "center", padding: "0 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.gray500 }}>
          <span style={{ cursor: "pointer" }}>💬 20</span>
          <span style={{ cursor: "pointer" }}>🔗</span>
        </div>
        <div style={{ flex: 1, textAlign: "center", fontSize: 13, color: C.gray600 }}>
          <span style={{ cursor: "pointer" }} onClick={onBack}>⊙ Техподдержка</span>
          <span style={{ margin: "0 6px", color: C.gray400 }}>›</span>
          <span style={{ fontWeight: 600, color: C.gray800 }}>{ticket.id}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: C.gray500 }}>
          <span>♡ 20</span>
          <span>👍 20</span>
          <span onClick={onBack} style={{ fontSize: 18, cursor: "pointer", color: C.gray400, marginLeft: 8 }}>✕</span>
        </div>
      </div>

      {/* ── Main content: Chat + Sidebar ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* ═══ LEFT: Chat area ═══ */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Chat header */}
          <div style={{ padding: "10px 20px", borderBottom: `1px solid ${C.gray200}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <Avatar name={ticket.author} size={40} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.gray900 }}>{ticket.author}</div>
              <div style={{ fontSize: 12, color: C.gray500 }}>{ticket.authorRole}</div>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: C.gray600 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>📋 Заявки</span>
              {ticket.linkedObject && (
                <span style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>📍 {ticket.linkedObject}</span>
              )}
            </div>
          </div>

          {/* Chat messages */}
          <div style={{ flex: 1, overflow: "auto", background: C.chatBg, padding: "16px 20px" }}>
            {/* Demo button */}
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <button onClick={simulateUserReply} style={{ padding: "4px 12px", borderRadius: 12, border: `1px dashed ${C.gray400}`, background: "rgba(255,255,255,.7)", fontSize: 11, color: C.gray600, cursor: "pointer" }}>
                ⚡ Симулировать ответ пользователя
              </button>
            </div>

            {ticket.messages.map((m, i) => {
              if (m.from === "system") {
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "center", margin: "12px 0" }}>
                    <div style={{ background: "rgba(255,255,255,.85)", borderRadius: 8, padding: "10px 16px", maxWidth: 340, fontSize: 12, color: C.gray700, whiteSpace: "pre-line", lineHeight: 1.6, backdropFilter: "blur(4px)" }}>
                      {m.text.split("\n").map((line, li) => {
                        // Bold labels (lines ending with specific patterns)
                        const isLabel = ["Дата приема в работу", "Специалист", "Статус", "Результат"].some(l => line.startsWith(l));
                        return <div key={li} style={{ fontWeight: isLabel ? 700 : 400, fontSize: isLabel ? 11 : 12, color: isLabel ? C.gray500 : C.gray800, marginTop: isLabel && li > 0 ? 6 : 0 }}>{line}</div>;
                      })}
                    </div>
                  </div>
                );
              }
              const isUser = m.from === "user";

              const renderUserReport = () => {
                const p = m.payload || {};
                const rows = [
                  { label: "Тип", value: p.typeLabel, kind: "pill-red" },
                  { label: "Сообщение", value: p.message },
                  { label: "Раздел", value: p.section },
                  { label: "URL", value: p.url, kind: "link" },
                  { label: "Окружение", value: p.environment },
                  { label: "ID пользователя", value: p.userId },
                  { label: "Дата", value: p.createdAt },
                ].filter(r => r.value);

                return (
                  <div style={{ width: 420, maxWidth: "100%", borderRadius: 12, overflow: "hidden", border: `1px solid ${C.gray200}`, background: "rgba(255,255,255,.92)", boxShadow: "0 1px 2px rgba(0,0,0,.06)" }}>
                    <div style={{ background: "#E3F2FD", padding: "10px 12px", fontSize: 12, fontWeight: 700, color: C.blue, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 18, height: 18, borderRadius: 4, background: C.blueLight, border: `1px solid ${C.blue}33`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: C.blue, fontSize: 12 }}>▣</span>
                      ОБРАЩЕНИЕ ОТ ПОЛЬЗОВАТЕЛЯ
                      <div style={{ flex: 1 }} />
                      {m.time && <span style={{ fontSize: 11, fontWeight: 600, color: C.gray500 }}>{m.time}</span>}
                    </div>
                    <div style={{ padding: 12 }}>
                      {rows.map((r, idx) => (
                        <div key={idx} style={{ display: "flex", gap: 10, padding: "8px 0", borderTop: idx === 0 ? "none" : `1px solid ${C.gray100}`, alignItems: "flex-start" }}>
                          <div style={{ width: 92, flexShrink: 0, fontSize: 12, color: C.gray500 }}>{r.label}</div>
                          <div style={{ flex: 1, fontSize: 13, color: C.gray900, lineHeight: 1.35, wordBreak: "break-word" }}>
                            {r.kind === "pill-red" ? (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "2px 10px", borderRadius: 999, background: "#FFEBEE", color: C.red, border: `1px solid ${C.red}33`, fontSize: 12, fontWeight: 700 }}>
                                <span style={{ width: 6, height: 6, borderRadius: 999, background: C.red }} />
                                {r.value}
                              </span>
                            ) : r.kind === "link" ? (
                              <a href={String(r.value)} target="_blank" rel="noreferrer" style={{ color: C.blue, textDecoration: "none" }}>
                                {r.value}
                              </a>
                            ) : (
                              r.value
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              };

              return (
                <div key={i} style={{ display: "flex", justifyContent: isUser ? "flex-start" : "flex-end", marginBottom: 8 }}>
                  {isUser && m.format === "user_report"
                    ? renderUserReport()
                    : (
                      <div style={{
                        maxWidth: "65%", padding: "10px 14px", borderRadius: isUser ? "2px 12px 12px 12px" : "12px 2px 12px 12px",
                        background: isUser ? "rgba(255,255,255,.9)" : "#DCF8C6",
                        boxShadow: "0 1px 2px rgba(0,0,0,.06)",
                      }}>
                        <div style={{ fontSize: 13, color: C.gray900, lineHeight: 1.5 }}>{m.text}</div>
                        <div style={{ fontSize: 10, color: C.gray400, textAlign: "right", marginTop: 4, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4 }}>
                          {m.time}
                          {!isUser && <span style={{ color: C.blue, fontSize: 12 }}>✓✓</span>}
                        </div>
                      </div>
                    )}
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Chat input */}
          <div style={{ padding: "10px 20px", borderTop: `1px solid ${C.gray200}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0, background: C.white }}>
            <span style={{ color: C.gray400, cursor: "pointer", fontSize: 18 }}>📎</span>
            <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()}
              placeholder={isClosed ? "Обращение закрыто" : "Сообщение..."}
              disabled={isClosed}
              style={{ flex: 1, padding: "10px 14px", border: `1px solid ${C.gray200}`, borderRadius: 20, fontSize: 13, outline: "none", background: isClosed ? C.gray100 : C.white, color: C.gray900 }}
            />
            <span style={{ color: C.gray400, cursor: "pointer", fontSize: 18 }}>😊</span>
            <button onClick={sendMsg} disabled={isClosed || !msg.trim()} style={{
              width: 34, height: 34, borderRadius: "50%", border: "none",
              background: msg.trim() && !isClosed ? C.yellow : C.gray200,
              color: msg.trim() && !isClosed ? C.gray900 : C.gray400,
              cursor: msg.trim() && !isClosed ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
            }}>➤</button>
          </div>
        </div>

        {/* ═══ RIGHT: Sidebar ═══ */}
        <div style={{ width: 340, borderLeft: `1px solid ${C.gray200}`, display: "flex", flexDirection: "column", overflow: "auto", flexShrink: 0 }}>
          <div style={{ padding: "16px 20px" }}>
            {/* Status + ID row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <StatusBadge status={ticket.status} dropdown />
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.gray500 }}>
                ID: {ticket.id} <span style={{ cursor: "pointer" }}>📋</span>
                <span style={{ cursor: "pointer" }}>ⓘ</span>
                <span style={{ width: 16, height: 16, borderRadius: 3, background: C.green, display: "inline-block" }} />
              </div>
            </div>

            {/* ── Status-dependent content ── */}

            {/* NEW: waiting for specialist */}
            {ticket.status === "NEW" && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "start", gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 18, color: C.gray400, marginTop: 2 }}>⏳</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.gray900 }}>Возьмите обращение в работу</div>
                    <div style={{ fontSize: 12, color: C.gray500 }}>Определите и решите проблему</div>
                  </div>
                  <button onClick={takeToWork} style={{
                    padding: "8px 16px", borderRadius: 6, border: "none", background: C.greenBg, color: C.white,
                    fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                  }}>Взять в работу</button>
                </div>
              </div>
            )}

            {/* IN_PROGRESS */}
            {isWorking && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 16 }}>💬</span>
                  <span style={{ flex: 1, fontSize: 13, color: C.gray800 }}>Передать обращение в разработку</span>
                  <button onClick={() => setShowOrderModal(true)} style={{
                    padding: "7px 16px", borderRadius: 6, border: "none", background: C.orange, color: C.white,
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}>Передать</button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 16, color: C.gray500 }}>🏷</span>
                  <span style={{ flex: 1, fontSize: 13, color: C.gray800 }}>Тип передачи</span>
                  <select value={devTransferTypeDraft} onChange={e => setDevTransferTypeDraft(e.target.value)} style={{ padding: "4px 8px", border: `1px solid ${C.gray300}`, borderRadius: 6, fontSize: 13, outline: "none", background: C.white, color: C.gray700 }}>
                    {DEV_TRANSFER_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 16 }}>⏳</span>
                  <span style={{ flex: 1, fontSize: 13, color: C.gray800 }}>Необходимо уточнение информации</span>
                  <button onClick={pauseTicket} style={{
                    padding: "7px 16px", borderRadius: 6, border: `1px solid ${C.blue}`, background: C.white, color: C.blue,
                    fontSize: 13, fontWeight: 500, cursor: "pointer",
                  }}>На паузу</button>
                </div>
              </>
            )}

            {/* CLARIFICATION */}
            {ticket.status === "CLARIFICATION" && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "start", gap: 10 }}>
                  <span style={{ fontSize: 18, color: C.gray400, marginTop: 2 }}>⏳</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.gray900 }}>Возьмите обращение в работу</div>
                    <div style={{ fontSize: 12, color: C.gray500 }}>Определите и решите проблему</div>
                  </div>
                  <button onClick={takeToWork} style={{
                    padding: "8px 16px", borderRadius: 6, border: "none", background: C.greenBg, color: C.white,
                    fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                  }}>Взять в работу</button>
                </div>
              </div>
            )}

            {/* DEV */}
            {isDev && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 16 }}>☑</span>
                  <span style={{ flex: 1, fontSize: 13, color: C.gray800 }}>Проблема решена</span>
                  <button onClick={() => setShowCloseModal(true)} style={{
                    padding: "7px 16px", borderRadius: 6, border: "none", background: C.orange, color: C.white,
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}>Закрыть обращение</button>
                </div>
              </>
            )}

            {/* Linked order */}
            {ticket.linkedOrder && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, paddingBottom: 4 }}>
                <span style={{ fontSize: 16 }}>🔗</span>
                <span style={{ flex: 1, fontSize: 13, color: C.gray800 }}>
                  Связано с заказом в разработку
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.blue, cursor: "pointer" }}>{ticket.linkedOrder} →</span>
              </div>
            )}

            {/* Fields (visible when not NEW without responsible) */}
            {(ticket.status !== "NEW" || ticket.responsible) && (
              <>
                {/* Тип обращения */}
                <SidebarField icon="🏷" label="Тип обращения">
                  <select
                    value={ticket.type || ""}
                    onChange={e => onUpdate({ ...ticket, type: e.target.value })}
                    disabled={isClosed}
                    style={{ padding: "4px 8px", border: `1px solid ${C.gray200}`, borderRadius: 4, fontSize: 13, outline: "none", background: isClosed ? C.gray50 : C.white, color: C.gray700, minWidth: 140 }}
                  >
                    {REQUEST_TYPES.map(v => <option key={v || "empty"} value={v}>{v || "—"}</option>)}
                  </select>
                </SidebarField>

                {/* Следующий контакт */}
                <SidebarField icon="📅" label="Следующий контакт">
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", border: `1px solid ${C.gray200}`, borderRadius: 4, fontSize: 13, color: C.gray700 }}>
                    📅 {ticket.nextContact || "—"}
                  </div>
                </SidebarField>

                {/* Продукт */}
                <SidebarField icon="⊞" label="Продукт">
                  <select value={ticket.product} onChange={e => onUpdate({ ...ticket, product: e.target.value })} disabled={isClosed}
                    style={{ padding: "4px 8px", border: `1px solid ${C.gray200}`, borderRadius: 4, fontSize: 13, outline: "none", background: C.white, color: C.gray700, minWidth: 100 }}>
                    {PRODUCTS.map(p => <option key={p} value={p}>{p || "—"}</option>)}
                  </select>
                </SidebarField>

                {/* Результат (only closed) */}
                {isClosed && ticket.result && (
                  <SidebarField icon="📄" label="Результат">
                    <select value={ticket.result} disabled style={{ padding: "4px 8px", border: `1px solid ${C.gray200}`, borderRadius: 4, fontSize: 13, outline: "none", background: C.gray50, color: C.gray700, minWidth: 120 }}>
                      {CLOSE_RESULTS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </SidebarField>
                )}

                {(ticket.status === "DEV" || ticket.status === "CLOSED") && (
                  <SidebarField icon="🧩" label="В разработку">
                    <span style={{ fontSize: 13, color: ticket.devTransferType ? C.gray800 : C.gray400 }}>
                      {ticket.devTransferType || "—"}
                    </span>
                  </SidebarField>
                )}

                {/* Инициатива */}
                <SidebarField icon="💡" label="Инициатива">
                  <Toggle checked={ticket.initiative} onChange={v => onUpdate({ ...ticket, initiative: v })} disabled={isClosed} />
                </SidebarField>

                {/* Критическая проблема */}
                <SidebarField icon="⚠" label="Критическая проблема">
                  <Toggle checked={ticket.critical} onChange={v => onUpdate({ ...ticket, critical: v })} disabled={isClosed} />
                </SidebarField>
              </>
            )}

            {/* ── Bottom tabs: Участники | Служебное | ⋮ ── */}
            <div style={{ display: "flex", gap: 0, marginTop: 16, borderTop: `1px solid ${C.gray200}`, paddingTop: 12 }}>
              <button
                onClick={() => { setSideTab("participants"); setShowParticipantsModal(true); }}
                style={{ flex: 1, padding: "8px 0", borderRadius: 6, border: `1px solid ${C.gray300}`, background: C.white, fontSize: 13, color: C.gray700, cursor: "pointer" }}
              >
                Участники
              </button>
              <button
                onClick={() => setSideTab("service")}
                style={{ flex: 1, padding: "8px 0", borderRadius: 6, border: `1px solid ${C.gray300}`, background: C.white, fontSize: 13, color: C.gray700, cursor: "pointer", marginLeft: 8 }}
              >
                Служебное
              </button>
              <button
                style={{ width: 36, padding: "8px 0", borderRadius: 6, border: `1px solid ${C.gray300}`, background: C.white, fontSize: 16, color: C.gray500, cursor: "pointer", marginLeft: 8, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                ⋮
              </button>
            </div>

            {/* Close button for IN_PROGRESS (secondary) */}
            {isWorking && (
              <button onClick={() => setShowCloseModal(true)} style={{
                width: "100%", padding: "10px 0", borderRadius: 6, border: `1px solid ${C.gray300}`,
                background: C.white, color: C.gray600, fontSize: 13, cursor: "pointer", marginTop: 12,
              }}>Закрыть обращение</button>
            )}

            {/* Close button for NEW / CLARIFICATION / DEV */}
            {!isClosed && !isWorking && (
              <button onClick={() => setShowCloseModal(true)} style={{
                width: "100%", padding: "10px 0", borderRadius: 6, border: `1px solid ${C.gray300}`,
                background: C.white, color: C.gray600, fontSize: 13, cursor: "pointer", marginTop: 12,
              }}>Закрыть обращение</button>
            )}
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {showCloseModal && <CloseModal onClose={() => setShowCloseModal(false)} onConfirm={closeTicket} />}
      {showOrderModal && <OrderModal onClose={() => setShowOrderModal(false)} onSelect={transferToDev} />}
      {showParticipantsModal && <ParticipantsModal ticket={ticket} onClose={() => setShowParticipantsModal(false)} onSave={r => onUpdate({ ...ticket, responsible: r })} />}
    </div>
  );
}

function SidebarField({ icon, label, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{icon}</span>
      <span style={{ flex: 1, fontSize: 13, color: C.gray700 }}>{label}</span>
      {children}
    </div>
  );
}

// ── Modals ──
function CloseModal({ onClose, onConfirm }) {
  const [result, setResult] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: 12, padding: 24, width: 380, boxShadow: "0 16px 48px rgba(0,0,0,.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: C.gray900 }}>Закрыть обращение</span>
          <span onClick={onClose} style={{ fontSize: 18, cursor: "pointer", color: C.gray400 }}>✕</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.gray900, marginBottom: 12 }}>
          Результат <span style={{ color: C.red }}>*</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
          {CLOSE_RESULTS.map(r => (
            <button key={r} onClick={() => setResult(r)} style={{
              padding: "8px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer", transition: "all .15s",
              border: result === r ? `2px solid ${C.blue}` : `1px solid ${C.gray300}`,
              background: result === r ? C.blueLight : C.white,
              color: result === r ? C.blue : C.gray700,
              fontWeight: result === r ? 600 : 400,
            }}>{r}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 6, border: `1px solid ${C.gray300}`, background: C.white, fontSize: 13, cursor: "pointer", color: C.gray700 }}>Отмена</button>
          <button disabled={!result} onClick={() => onConfirm(result)} style={{
            padding: "10px 20px", borderRadius: 6, border: "none", fontSize: 13, fontWeight: 600, cursor: result ? "pointer" : "default",
            background: result ? C.greenBg : C.gray200, color: result ? C.white : C.gray400, transition: "all .15s",
          }}>Закрыть обращение</button>
        </div>
      </div>
    </div>
  );
}

function OrderModal({ onClose, onSelect }) {
  const [search, setSearch] = useState("");
  const filtered = ORDERS.filter(o => o.title.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search));
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: 12, padding: 24, width: 440, maxHeight: "75vh", display: "flex", flexDirection: "column", boxShadow: "0 16px 48px rgba(0,0,0,.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Выбрать заказ в разработку</span>
          <span onClick={onClose} style={{ fontSize: 18, cursor: "pointer", color: C.gray400 }}>✕</span>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.gray400, fontSize: 14 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Найти..." style={{
              width: "100%", padding: "8px 12px 8px 32px", border: `1px solid ${C.gray300}`, borderRadius: 6, fontSize: 13, outline: "none",
            }} />
          </div>
          <button style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: C.yellow, color: C.gray900, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Создать</button>
        </div>
        <div style={{ flex: 1, overflow: "auto" }}>
          {filtered.map(o => (
            <div key={o.id} onClick={() => onSelect(o.id)} style={{
              padding: 14, borderBottom: `1px solid ${C.gray100}`, cursor: "pointer", transition: "background .1s",
            }} onMouseEnter={e => e.currentTarget.style.background = C.gray50} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: C.blue, fontWeight: 500 }}>{o.status}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.gray500 }}>
                  {o.assignee}
                  <Avatar name={o.assignee} size={20} />
                </div>
              </div>
              <div style={{ fontSize: 12, color: C.gray400, marginBottom: 4 }}>{o.hours} · ⏱ {o.points} · ⚡ {o.dates[0]} · 📅 {o.dates[1]}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.gray900, marginBottom: 2 }}>{o.title}</div>
              <div style={{ fontSize: 12, color: C.gray500, marginBottom: 6 }}>{o.path}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: C.gray500 }}>{o.num}</span>
                {o.tags.map(tag => (
                  <span key={tag} style={{ padding: "2px 8px", borderRadius: 4, background: tag === "Макет" ? "#FCE4EC" : C.gray100, fontSize: 11, color: tag === "Макет" ? "#E91E63" : C.gray600 }}>{tag}</span>
                ))}
              </div>
              <div style={{ fontSize: 12, color: C.gray400, cursor: "pointer" }}>▿ Показать подзаказы ({o.subs})</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ParticipantsModal({ ticket, onClose, onSave }) {
  const [resp, setResp] = useState(ticket.responsible);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: 12, padding: 24, width: 380, boxShadow: "0 16px 48px rgba(0,0,0,.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Участники</span>
          <span onClick={onClose} style={{ fontSize: 18, cursor: "pointer", color: C.gray400 }}>✕</span>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.gray600, display: "block", marginBottom: 6 }}>Ответственный</label>
          <input value={resp} onChange={e => setResp(e.target.value)} style={{
            width: "100%", padding: "10px 12px", border: `1px solid ${C.gray300}`, borderRadius: 6, fontSize: 13, outline: "none",
          }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.gray600, display: "block", marginBottom: 6 }}>Команда</label>
          <input placeholder="Добавить участника..." style={{
            width: "100%", padding: "10px 12px", border: `1px solid ${C.gray300}`, borderRadius: 6, fontSize: 13, outline: "none",
          }} />
        </div>
        {ticket.responsible && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: C.gray50, borderRadius: 8, marginBottom: 16 }}>
            <Avatar name={ticket.responsible} size={36} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.gray900 }}>{ticket.responsible}</div>
              <div style={{ fontSize: 11, color: C.gray500 }}>Ответственный</div>
            </div>
            <div style={{ flex: 1 }} />
            <span style={{ cursor: "pointer", color: C.gray400 }}>💬</span>
          </div>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 6, border: `1px solid ${C.gray300}`, background: C.white, fontSize: 13, cursor: "pointer" }}>Отмена</button>
          <button onClick={() => { onSave(resp); onClose(); }} style={{ padding: "10px 20px", borderRadius: 6, border: "none", background: C.blue, color: C.white, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Сохранить</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════
export default function App() {
  const [tickets, setTickets] = useState(DEMO_TICKETS.map(normalizeAndClassifyTicket));
  const [selectedId, setSelectedId] = useState(null);

  const updateTicket = useCallback((updated) => {
    setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
  }, []);

  const selected = tickets.find(t => t.id === selectedId);

  if (selected) {
    return <TicketDetailScreen ticket={selected} onBack={() => setSelectedId(null)} onUpdate={updateTicket} />;
  }
  return <TicketListScreen tickets={tickets} onSelect={setSelectedId} />;
}
