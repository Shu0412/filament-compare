/* ============================================================
 * Filament DB · 主流 3D 打印耗材对比库
 * 内容创建：舒舒（AI 辅助创作）
 * 开源免费，仅供学习交流；转载数据请注明出处
 * ============================================================ */
/* ===== Filament DB · 应用逻辑 ===== */
(function () {
  "use strict";

  var DATA = window.FILAMENT_DATA;

  /* ---------- 工具函数 ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function rng(r, unit, dec) {
    if (!r) return "—";
    var d = dec == null ? (r[0] < 10 ? 1 : 0) : dec;
    var f = function (n) { return Number(n).toFixed(d); };
    return f(r[0]) + "–" + f(r[1]) + (unit ? " " + unit : "");
  }
  function mid(r) { return r ? (r[0] + r[1]) / 2 : null; }
  function maxOf(mats, key) {
    var m = 0;
    mats.forEach(function (x) {
      var v = mid(x[key]);
      if (v != null && v > m) m = v;
    });
    return m;
  }
  function escRgba(hex) {
    var h = hex.replace("#", "");
    var n = parseInt(h, 16);
    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + ",";
  }
  var PALETTE = ["#4f9cf9", "#22c3a6", "#f9a54f", "#c98bf9", "#f9685f", "#f2c94c", "#7fd6ff", "#8b9dc3"];
  var ZONE_COLORS = { standard: "#4f9cf9", engineering: "#f9a54f" };
  var DIFF_LABEL = { 1: "易", 2: "中等", 3: "较难", 4: "难", 5: "很难" };
  var SAFETY_LABEL = ["一般安全", "需通风", "需通风+过滤", "封闭腔体+过滤"];
  var HYGRO = { "低": 1, "中": 2, "高": 3, "极高": 4 };

  function allMaterials() {
    var out = [];
    DATA.zones.forEach(function (z) { z.materials.forEach(function (m) { m._zone = z; out.push(m); }); });
    return out;
  }
  function matById(id) {
    for (var i = 0; i < DATA.zones.length; i++)
      for (var j = 0; j < DATA.zones[i].materials.length; j++)
        if (DATA.zones[i].materials[j].id === id) return DATA.zones[i].materials[j];
    return null;
  }

  /* ---------- Toast 轻提示（替代破坏性的自动跳页，零依赖） ---------- */
  function toast(msg, action) {
    var wrap = $("#toastWrap");
    if (!wrap) return;
    var t = document.createElement("div");
    t.className = "toast";
    var span = document.createElement("span");
    span.innerHTML = msg;
    t.appendChild(span);
    if (action && action.label && action.fn) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "toast-act";
      b.textContent = action.label;
      b.addEventListener("click", function () { kill(); action.fn(); });
      t.appendChild(b);
    }
    wrap.appendChild(t);
    var timer = setTimeout(kill, 3600);
    function kill() {
      clearTimeout(timer);
      t.classList.add("out");
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 320);
    }
  }

  /* ---------- 综合评分（0-100）：耐热25% + 强度25% + 韧性20% + 打印易度30% ---------- */
  function norm(v, max) { return v == null ? 0 : Math.max(0, Math.min(1, v / max)); }
  function matScore(m) {
    var s = 0.25 * norm(mid(m.hdt), 250) + 0.25 * norm(mid(m.tensile), 130)
      + 0.20 * norm(mid(m.impact), 60) + 0.30 * ((5 - m.difficulty) / 5);
    return Math.round(s * 100);
  }

  /* ---------- Hero 统计 ---------- */
  function renderHero() {
    var mats = allMaterials();
    var brands = DATA.brands.length;
    var srcs = DATA.meta.sources.length;
    var html = "";
    var stats = [
      [mats.length, "种耗材"],
      [DATA.zones.length + " 大分区", "常规 / 工程"],
      [brands, "个主流品牌"],
      [srcs + " 个数据来源", "交叉验证"],
      [mats.filter(function (m) { return m.difficulty <= 2; }).length, "种新手友好"]
    ];
    stats.forEach(function (s) {
      html += '<div class="hstat"><b>' + s[0] + '</b><span>' + s[1] + "</span></div>";
    });
    $("#heroStats").innerHTML = html;
    renderLiveStats();
  }

  /* ---------- 实时访问统计（第三方计数服务，加载失败自动降级） ---------- */
  function renderLiveStats() {
    var el = $("#liveStats");
    if (!el) return;
    /* 本机访问计数（localStorage，每次加载 +1） */
    var localVisits = 0;
    try { localVisits = parseInt(localStorage.getItem("fd-visits") || "0", 10) + 1; localStorage.setItem("fd-visits", String(localVisits)); } catch (e) { /* ignore */ }
    el.innerHTML = '<div class="live-stats-inner">'
      + '<span class="live-stat"><span class="live-label">📈 本机浏览</span><b class="live-num">' + localVisits + '</b><span class="live-sub">次</span></span>'
      + "</div>"
      + '<p class="live-note">本机浏览 = 当前设备累计打开次数</p>';
    /* 第三方统计移到空闲时段，避免它参与首屏加载。 */
    var loadBadge = function () {
      if (!el.isConnected) return;
      var row = el.querySelector(".live-stats-inner");
      if (!row) return;
      var stat = document.createElement("span");
      stat.className = "live-stat";
      stat.innerHTML = '<span class="live-label">🧡 已帮助</span>';
      var img = document.createElement("img");
      img.alt = "已帮助";
      img.loading = "lazy";
      img.decoding = "async";
      img.src = "https://visitor-badge.laobi.icu/badge?page_id=shu0412-filament-lab&labelColor=1b2434&color=4f9cf9";
      img.onerror = function () { stat.remove(); };
      stat.appendChild(img);
      var unit = document.createElement("span");
      unit.className = "live-unit";
      unit.textContent = "人次";
      row.insertBefore(stat, row.firstChild);
      row.insertBefore(unit, row.children[1]);
    };
    if ("requestIdleCallback" in window) window.requestIdleCallback(loadBadge, { timeout: 2500 });
    else window.setTimeout(loadBadge, 1800);
  }

  /* ---------- 分区卡片 ---------- */
  function renderZones() {
    var html = "";
    DATA.zones.forEach(function (z) {
      var n = z.materials.length;
      html += '<div class="zone-card" data-goto="' + esc("zone-" + z.id) + '" role="button" tabindex="0"><span class="zone-tag" style="background:' + escRgba(ZONE_COLORS[z.id]) + '.18;color:' + ZONE_COLORS[z.id] + '">' + esc(z.name) + "</span>"
        + "<h3>" + esc(z.nameCn) + "</h3><p>" + esc(z.desc) + "</p>"
        + '<div class="zone-count">共 ' + n + " 种： " + esc(z.materials.map(function (m) { return m.nameCn; }).join("、")) + "</div></div>";
    });
    $("#zoneCards").innerHTML = html;
  }

  /* ============================================================
   * A1 打印机适配器：按设备能力评估 42 种材料可行性
   * ============================================================ */
  var PRINTER = null; /* null=未设置；{nozzle:260,bed:100,chamber:false,dryer:true,maxDiff:0} maxDiff 0=不限 */
  var PRINTER_KEY = "fd-printer";
  function loadPrinter() {
    try {
      var raw = localStorage.getItem(PRINTER_KEY);
      PRINTER = raw ? JSON.parse(raw) : null;
      if (PRINTER && typeof PRINTER.nozzle !== "number") PRINTER = null;
    } catch (e) { PRINTER = null; }
  }
  function savePrinter(p) {
    PRINTER = p;
    try {
      if (p) localStorage.setItem(PRINTER_KEY, JSON.stringify(p));
      else localStorage.removeItem(PRINTER_KEY);
    } catch (e) { /* ignore */ }
  }
  /* 判定引擎：返回 {state:'fit'|'warn'|'block', reason:[...]} */
  function printerFit(m) {
    if (!PRINTER) return null;
    var block = [], warn = [];
    var pt = m.printTemp;
    if (pt && pt.length === 2) {
      if (PRINTER.nozzle < pt[0]) block.push("喷嘴不足（需 " + pt[0] + "–" + pt[1] + "℃）");
      else if (PRINTER.nozzle < pt[1]) warn.push("喷嘴低于上限，建议低温慢打");
    }
    var bt = m.bedTemp;
    if (bt && bt.length === 2 && PRINTER.bed > 0) {
      if (PRINTER.bed < bt[0]) block.push("热床不足（需 " + bt[0] + "–" + bt[1] + "℃）");
      else if (PRINTER.bed < bt[1]) warn.push("热床低于建议上限");
    }
    if (m.enclosure === "必需" && !PRINTER.chamber) block.push("需要封闭腔体");
    else if (m.enclosure === "建议" && !PRINTER.chamber) warn.push("建议封闭腔体");
    if (m.drying && !PRINTER.dryer) warn.push("需干燥：" + m.drying);
    if (PRINTER.maxDiff > 0 && m.difficulty > PRINTER.maxDiff) warn.push("难度 " + m.difficulty + "/5 超出上限");
    if (block.length) return { state: "block", reason: block };
    if (warn.length) return { state: "warn", reason: warn };
    return { state: "fit", reason: ["当前设备可正常打印"] };
  }
  function printerStateIcon(s) { return s === "fit" ? "✓" : s === "warn" ? "⚠" : "🚫"; }
  function printerStateText(s) { return s === "fit" ? "可打" : s === "warn" ? "临界" : "不可"; }


  /* ---------- 材料卡片 ---------- */
  function materialCard(m) {
    var cols = [
      ["打印温度", rng(m.printTemp, "℃")],
      ["热床温度", rng(m.bedTemp, "℃")],
      ["拉伸强度", rng(m.tensile, "MPa")],
      ["抗冲击", m.impact ? rng(m.impact, m.impactUnit || "") : "—"],
      ["断裂伸长率", rng(m.elongation, "%")],
      ["热变形温度", rng(m.hdt, "℃")],
      ["密度", rng(m.density, "g/cm³", 2)],
      ["吸湿性", m.hygroscopic]
    ];
    var kv = cols.map(function (c) { return '<div class="kv"><b>' + c[0] + "</b><span>" + c[1] + "</span></div>"; }).join("");
    var tags = '<span class="tag diff-' + Math.min(3, Math.ceil(m.difficulty / 2)) + '">难度 ' + m.difficulty + "/5 " + DIFF_LABEL[m.difficulty] + "</span>"
      + '<span class="tag">翘曲 ' + m.warp + "</span>"
      + '<span class="tag">腔体 ' + m.enclosure + "</span>"
      + '<span class="tag safety-' + m.safetyLevel + '">' + SAFETY_LABEL[m.safetyLevel] + "</span>"
      + (m.drying ? '<span class="tag">干燥 ' + m.drying + "</span>" : "");
    /* A1：设备适配角标（仅设置过打印机时显示） */
    var ft = PRINTER ? printerFit(m) : null;
    var pcls = ft && ft.state === "block" ? " p-block" : "";
    var pbadge = ft
      ? '<span class="p-badge p-' + ft.state + '" title="' + esc(ft.reason.join("；")) + '">' + printerStateIcon(ft.state) + " " + printerStateText(ft.state) + "</span>"
      : "";
    return '<article class="mat-card' + pcls + '" data-mat="' + m.id + '" style="--mat-color:' + (m.color || "#4f9cf9") + '" tabindex="0" role="button" aria-label="查看 ' + esc(m.nameCn) + ' 详情">'
      + '<div class="mat-head"><h3>' + esc(m.nameCn) + "<small>" + esc(m.nameEn) + "</small></h3>"
      + '<div class="mat-head-right">' + pbadge + '<span class="score-badge" title="综合评分（耐热25%+强度25%+韧性20%+打印易度30%）">⭐ ' + matScore(m) + '</span>'
      + '<span class="mat-family">' + esc(m.family) + "</span></div></div>"
      + '<div class="mat-kv">' + kv + "</div>"
      + '<div class="mat-tags">' + tags + "</div>"
      + '<div class="mat-notes"><b>用途：</b>' + esc(m.applications.join("、")) + "　<b>短板：</b>" + esc(m.drawbacks.join("、")) + "</div>"
      + (m.note ? '<div class="mat-notes"><b>备注：</b>' + esc(m.note) + "</div>" : "")
      + '<div class="mat-more">点击查看详情 →</div>'
      + "</article>";
  }

  /* ---------- 筛选（搜索/难度/安全/家族/设备适配） ---------- */
  var filterState = {};
  function zoneFilters(z) {
    if (!filterState[z.id]) filterState[z.id] = { q: "", diff: [], safety: [], family: [], fitOnly: false };
    return filterState[z.id];
  }
  function familyList(z) {
    var seen = {}, out = [];
    z.materials.forEach(function (m) { if (!seen[m.family]) { seen[m.family] = 1; out.push(m.family); } });
    return out;
  }
  function renderFilterBar(z) {
    var f = zoneFilters(z);
    var fams = familyList(z);
    var chip = function (val, on, type, label) {
      return '<label class="chip fchip' + (on ? " on" : "") + '"><input type="checkbox" data-f="' + z.id + '" data-type="' + type + '" data-val="' + val + '"' + (on ? " checked" : "") + ">" + label + "</label>";
    };
    /* A1：筛选行右侧加"打印机适配"入口；有设备配置时加"只看可行"chip */
    var prLabel = PRINTER
      ? '🖨️ ' + PRINTER.nozzle + '℃' + (PRINTER.chamber ? "·腔" : "") + (PRINTER.dryer ? "" : "·无干燥") + ' <span class="pr-edit">修改</span>'
      : "🖨️ 我的打印机";
    var prChip = PRINTER
      ? '<span class="filter-label">适配</span>' + chip(1, !!f.fitOnly, "fit", "只看可行")
      : "";
    var html = '<div class="filter-row">'
      + '<button class="btn btn-ghost btn-sm" data-printer type="button" title="设置你的打印机，查看哪些材料能打">' + prLabel + "</button>"
      + '<span class="search-wrap"><input type="text" class="filter-search" data-f="' + z.id + '" placeholder="\U0001F50D \u641C\u7D22\u6750\u6599\u540D\u79F0 / \u82F1\u6587\u540D\u2026" value="' + esc(f.q) + '"><button type="button" class="search-clear" data-sclear="' + z.id + '" aria-label="\u6E05\u7A7A\u641C\u7D22"' + (f.q ? "" : " hidden") + '>\u2715</button></span>'
      + '<button class="btn btn-ghost btn-sm" data-fclear="' + z.id + '">清空</button>'
      + '<button class="filter-toggle" type="button" aria-label="筛选">⚙ 筛选</button></div>'
      + '<div class="filter-row filters"><span class="filter-label">难度</span>'
      + [1, 2, 3, 4, 5].map(function (d) { return chip(d, f.diff.indexOf(d) >= 0, "diff", d + "★"); }).join("")
      + '<span class="filter-label">安全</span>'
      + [0, 1, 2, 3].map(function (s) { return chip(s, f.safety.indexOf(s) >= 0, "safety", SAFETY_LABEL[s]); }).join("")
      + '<span class="filter-label">家族</span>'
      + fams.map(function (fm) { return chip(esc(fm), f.family.indexOf(fm) >= 0, "family", esc(fm)); }).join("")
      + prChip
      + "</div>";
    /* 手机默认折叠筛选行 */
    var isMobile = window.innerWidth <= 720;
    $("#filterBar" + (z.id === "standard" ? "Standard" : "Engineering")).innerHTML = html;
    var fr = $("#filterBar" + (z.id === "standard" ? "Standard" : "Engineering")).querySelector(".filter-row.filters");
    if (fr && isMobile) fr.classList.remove("open");
    else if (fr) fr.classList.add("open");
  }
  function matVisible(m, z) {
    var f = zoneFilters(z);
    if (f.q) {
      var q = f.q.toLowerCase();
      var hay = (m.nameCn + " " + m.nameEn + " " + m.family).toLowerCase();
      if (hay.indexOf(q) < 0) return false;
    }
    if (f.diff.length && f.diff.indexOf(m.difficulty) < 0) return false;
    if (f.safety.length && f.safety.indexOf(m.safetyLevel) < 0) return false;
    if (f.family.length && f.family.indexOf(m.family) < 0) return false;
    /* A1：只看当前设备可行材料（不可行项隐藏） */
    if (f.fitOnly && PRINTER) {
      var ft = printerFit(m);
      if (ft && ft.state === "block") return false;
    }
    return true;
  }
  function bindFilterEvents(z) {
    var el = $("#filterBar" + (z.id === "standard" ? "Standard" : "Engineering"));
    if (!el) return;
    var onInput = el.querySelector("input.filter-search");
    if (onInput) onInput.addEventListener("input", function () {
      zoneFilters(z).q = this.value;
      clearTimeout(onInput._timer);
      onInput._timer = setTimeout(function () { renderMaterials(z); }, 120);
    });
    var scBtn = el.querySelector("[data-sclear]");
    var scInput = el.querySelector(".filter-search");
    function syncClear() { if (scBtn) scBtn.hidden = !(scInput && scInput.value); }
    if (scBtn) scBtn.addEventListener("click", function () {
      var f = zoneFilters(z);
      f.q = "";
      if (scInput) scInput.value = "";
      syncClear();
      renderMaterials(z);
      if (scInput) scInput.focus();
    });
    $all("input[data-f]", el).forEach(function (inp) {
      if (inp.classList.contains("filter-search")) {
        inp.addEventListener("input", syncClear);
        return;
      }
      if (inp.getAttribute("data-type")) inp.addEventListener("change", function () {
        var f = zoneFilters(z), t = inp.getAttribute("data-type");
        /* A1：设备适配 chip 是布尔开关 */
        if (t === "fit") {
          f.fitOnly = inp.checked;
          renderMaterials(z);
          return;
        }
        var v = t === "diff" ? parseInt(inp.getAttribute("data-val"), 10)
          : t === "safety" ? parseInt(inp.getAttribute("data-val"), 10) : inp.getAttribute("data-val");
        var arr = f[t];
        var i = arr.indexOf(v);
        if (inp.checked && i < 0) arr.push(v);
        if (!inp.checked && i >= 0) arr.splice(i, 1);
        renderMaterials(z);
      });
    });
    var clr = el.querySelector("[data-fclear]");
    if (clr) clr.addEventListener("click", function () {
      filterState[z.id] = { q: "", diff: [], safety: [], family: [], fitOnly: false };
      renderFilterBar(z); bindFilterEvents(z); renderMaterials(z);
    });
  }
  var collapseState = { standard: false, engineering: false };
  var lastPerRow = null;
  function perRow() { return window.innerWidth < 720 ? 1 : 3; }
  /* ---------- B3 筛选状态 URL 同步（常规/工程分区） ---------- */
  function applyZoneQuery() {
    var qs = {};
    (window.location.search || "").replace(/[?&]([^=&]+)=([^&]*)/g, function (_, k, v) { qs[k] = v; });
    DATA.zones.forEach(function (z) {
      var p = z.id;
      if (!(("q" + p) in qs) && !(("d" + p) in qs) && !(("s" + p) in qs) && !(("fam" + p) in qs) && !(("fit" + p) in qs) && !(("c" + p) in qs)) return;
      var f = zoneFilters(z);
      if (("q" + p) in qs) f.q = String(qs["q" + p] || "").slice(0, 60);
      if (("d" + p) in qs) f.diff = String(qs["d" + p] || "").split(",").map(Number).filter(function (x) { return x >= 1 && x <= 5; });
      if (("s" + p) in qs) f.safety = String(qs["s" + p] || "").split(",").map(Number).filter(function (x) { return x >= 0 && x <= 3; });
      if (("fam" + p) in qs) f.family = decodeURIComponent(qs["fam" + p] || "").split("|").filter(Boolean);
      if (("fit" + p) in qs) f.fitOnly = qs["fit" + p] === "1";
      if (("c" + p) in qs) collapseState[p] = qs["c" + p] === "1";
    });
  }
  function syncZoneQuery() {
    var parts = [];
    DATA.zones.forEach(function (z) {
      var f = zoneFilters(z);
      if (f.q) parts.push("q" + z.id + "=" + encodeURIComponent(f.q));
      if (f.diff.length) parts.push("d" + z.id + "=" + f.diff.join(","));
      if (f.safety.length) parts.push("s" + z.id + "=" + f.safety.join(","));
      if (f.family.length) parts.push("fam" + z.id + "=" + encodeURIComponent(f.family.join("|")));
      if (f.fitOnly) parts.push("fit" + z.id + "=1");
      if (collapseState[z.id]) parts.push("c" + z.id + "=1");
    });
    var q = parts.length ? "?" + parts.join("&") : "";
    var cur = location.pathname + location.search + location.hash;
    var next = location.pathname + q + (location.hash || "");
    if (next !== cur) {
      try { history.replaceState(null, "", next); } catch (e) { /* ignore */ }
    }
  }
  function renderMaterials(onlyZone) {
    lastPerRow = perRow();
    (onlyZone ? [onlyZone] : DATA.zones).forEach(function (z) {
      var id = z.id === "standard" ? "Standard" : "Engineering";
      var grid = $("#matGrid" + id);
      var vis = z.materials.filter(function (m) { return matVisible(m, z); });
      var limit = collapseState[z.id] ? vis.length : Math.min(vis.length, perRow());
      grid.innerHTML = vis.slice(0, limit).map(materialCard).join("");
      $("#filterEmpty" + id).style.display = vis.length ? "none" : "block";
      var bar = $("#collapse" + id);
      if (bar) {
        if (vis.length > perRow() && !collapseState[z.id]) {
          bar.style.display = "block";
          bar.querySelector("button").textContent = "＋ 展开全部 " + vis.length + " 种";
        } else if (collapseState[z.id]) {
          bar.style.display = "block";
          bar.querySelector("button").textContent = "－ 收起";
        } else {
          bar.style.display = "none";
        }
      }
    });
    bindCardClicks();
    syncZoneQuery(); /* B3：筛选状态 → URL */
  }
  function bindCollapse() {
    if (bindCollapse.bound) return;
    bindCollapse.bound = true;
    $all("[data-collapse]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-collapse");
        collapseState[key] = !collapseState[key];
        renderMaterials();
        if (collapseState[key]) {
          var grid = $("#matGrid" + (key === "standard" ? "Standard" : "Engineering"));
          if (grid) grid.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
    var lastMobile = window.innerWidth <= 720;
    var resizeFrame = 0;
    window.addEventListener("resize", function () {
      if (resizeFrame) return;
      resizeFrame = requestAnimationFrame(function () {
        resizeFrame = 0;
        var mobile = window.innerWidth <= 720;
        var rows = perRow();
        if (mobile !== lastMobile || rows !== lastPerRow) {
          lastMobile = mobile;
          DATA.zones.forEach(function (z) {
            var bar = $("#filterBar" + (z.id === "standard" ? "Standard" : "Engineering"));
            if (bar && bar.innerHTML) { renderFilterBar(z); bindFilterEvents(z); }
          });
          renderMaterials();
        }
      });
    }, { passive: true });
  }
  function bindCardClicks() {
    if (bindCardClicks.bound) return;
    bindCardClicks.bound = true;
    document.addEventListener("click", function (e) {
      var card = e.target.closest ? e.target.closest(".mat-card") : null;
      if (card) openModal(card.getAttribute("data-mat"));
    });
    document.addEventListener("keydown", function (e) {
      var card = e.target.closest ? e.target.closest(".mat-card") : null;
      if (card && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        openModal(card.getAttribute("data-mat"));
      }
      var thk = e.target.closest ? e.target.closest("th[data-key],th[data-pk]") : null;
      if (thk && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        thk.click();
      }
    });
  }

  /* ---------- 新手 3 问快筛 ---------- */
  var quizAns = { use: "", dev: "", budget: "" };
  function openQuiz() {
    var qm = $("#quizModal");
    if (!qm) return;
    var h = $("#quizDevHint");
    if (h) h.textContent = PRINTER
      ? "已按你的打印机（喷嘴 " + PRINTER.nozzle + "℃）——推荐结果会同时按它复核可行性"
      : "设备只决定「能不能打」，也可以先在上方「🖨️ 适配」里精确设置";
    qm.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
  function closeQuiz() {
    var qm = $("#quizModal");
    if (qm) qm.style.display = "none";
    document.body.style.overflow = "";
  }
  function quizMid(r) { return r ? (r[0] + r[1]) / 2 : 0; }
  function quizUseScore(m) {
    var app = (m.applications || []).join(",");
    switch (quizAns.use) {
      case "prototype": return (/原型|手办|装饰/.test(app) ? 3 : 0) + (m.difficulty <= 2 ? 1 : 0) + (/pla/.test(m.id) ? 1 : 0);
      case "functional": return (quizMid(m.tensile) >= 60 ? 3 : 0) + (quizMid(m.tensile) >= 45 ? 1 : 0) + (/petg|pa|pc|pa-cf/.test(m.id) ? 1 : 0);
      case "heat": return (quizMid(m.hdt) >= 90 ? 3 : 0) + (quizMid(m.hdt) >= 70 ? 1 : 0) + (/peek|pei|pps|ppa/.test(m.id) ? 2 : 0);
      case "flexible": return (/tpu|tpe/.test(m.id) ? 4 : 0) + (/弹性|柔性|软/.test(app) ? 1 : 0);
      case "transparent": return (/透明/.test(app) ? 3 : 0) + (/petg|pet/.test(m.id) ? 2 : 0) + (m.id === "pc" ? 1 : 0);
    }
    return 0;
  }
  function quizPick() {
    var g = function (name) { var el = document.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : ""; };
    quizAns.use = g("quizUse"); quizAns.dev = g("quizDev"); quizAns.budget = g("quizBudget");
    if (!quizAns.use || !quizAns.dev || !quizAns.budget) { toast("请先回答全部 3 个问题"); return; }
    var cap = quizAns.dev === "entry" ? 260 : (quizAns.dev === "mid" ? 300 : 420);
    var chamber = quizAns.dev === "pro";
    var cands = allMaterials().filter(function (m) {
      if (m.printTemp && m.printTemp[0] > cap) return false;
      if (m.enclosure === "必需" && !chamber) return false;
      return true;
    });
    cands.forEach(function (m) {
      var sc = quizUseScore(m) * 2 + matScore(m) * 0.15;
      var kg = matMinKgPrice(m.nameCn);
      if (quizAns.budget === "cheap") { if (kg != null && kg <= 30) sc += 3; else if (kg != null && kg <= 45) sc += 1; else if (kg == null) sc -= 1; }
      else if (quizAns.budget === "perf") { if (matScore(m) >= 70) sc += 3; else if (matScore(m) >= 60) sc += 1; }
      else { sc += 1; if (kg != null && kg <= 45) sc += 1; if (matScore(m) >= 60) sc += 1; }
      m._quiz = sc;
    });
    var top = cands.slice().sort(function (a, b) { return b._quiz - a._quiz; }).slice(0, 3);
    var html = '<div class="quiz-res">';
    top.forEach(function (m, i) {
      var kg = matMinKgPrice(m.nameCn);
      var fit = printerFit(m);
      html += '<div class="qcard"><div class="qc-head"><b>' + (i + 1) + '. ' + esc(m.nameCn) + '</b>'
        + '<span class="qc-score">匹配 ' + Math.round(m._quiz) + '</span></div>'
        + '<div class="qc-meta">' + esc(m.nameEn) + ' · 难度 ' + m.difficulty + '/5 · '
        + (kg != null ? '约 ¥' + money(kg) + '/kg' : '暂无价格')
        + (fit ? ' · ' + printerStateIcon(fit.state) + printerStateText(fit.state) : '')
        + '</div>'
        + '<div class="qc-why">' + esc((m.applications || []).slice(0, 2).join("、")) + '</div>'
        + '<div class="qc-btns"><button type="button" class="btn btn-ghost btn-sm" data-qopen="' + m.id + '">看详情</button>'
        + '<button type="button" class="btn btn-ghost btn-sm" data-qcmp="' + m.id + '">加入对比</button></div></div>';
    });
    html += '<div class="qc-all"><button type="button" class="btn btn-ghost btn-sm" id="quizAddAll">把这 3 种都加入对比</button></div></div>';
    var box = $("#quizResult");
    box.innerHTML = html;
    box.querySelectorAll("[data-qopen]").forEach(function (b) {
      b.addEventListener("click", function () { closeQuiz(); openModal(b.getAttribute("data-qopen")); });
    });
    box.querySelectorAll("[data-qcmp]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-qcmp");
        if (cmpState.mats.indexOf(id) < 0) { cmpState.mats.push(id); if (cmpState.mats.length > 5) cmpState.mats.shift(); }
        renderCmpChips();
        toast("已加入对比：" + id.toUpperCase());
      });
    });
    var allBtn = $("#quizAddAll");
    if (allBtn) allBtn.addEventListener("click", function () {
      top.forEach(function (m) { if (cmpState.mats.indexOf(m.id) < 0) cmpState.mats.push(m.id); });
      if (cmpState.mats.length > 5) cmpState.mats = cmpState.mats.slice(-5);
      renderCmpChips();
      closeQuiz();
      navigateModule("compare");
      toast("已把推荐 3 种加入对比，去「数据对比」查看");
    });
  }

  /* ---------- 捐赠二维码缺失兜底（文件缺失/代理不服务相对资源时给出明确提示） ---------- */
  window.qrMissing = function (img) {
    var box = img.parentNode;
    if (!box || box.querySelector(".qr-missing")) return;
    var tip = document.createElement("div");
    tip.className = "qr-missing";
    tip.innerHTML = "🖼️ 收款码图片缺失<br><small>" + (img.getAttribute("src") || "") + "</small><br><small>请将 share/donate-wechat.jpg 与 donate-alipay.jpg 一并部署</small>";
    img.style.display = "none";
    box.appendChild(tip);
  };

  /* ---------- 材料详情弹窗 ---------- */
  /* ---------- 弹层焦点管理：打开聚焦容器、关闭归还触发元素（无障碍改进，无焦点陷阱） ---------- */
  var lastFocus = null;
  function rememberFocus() { try { lastFocus = document.activeElement; } catch (e) { lastFocus = null; } }
  function restoreFocus() { try { if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); } catch (e) { /* ignore */ } lastFocus = null; }
  function issueUrl(m) {
    var body = "材料：" + m.nameCn + "（" + m.nameEn + "）\n"
      + "页面：" + location.href + "\n\n"
      + "请补充以下信息：\n- 错误字段：\n- 站点当前值：\n- 正确值：\n- 依据来源（官方 TDS 链接等）：";
    return "https://github.com/Shu0412/filament-compare/issues/new?title="
      + encodeURIComponent("数据纠错：" + m.nameCn + "（" + m.nameEn + "）")
      + "&body=" + encodeURIComponent(body);
  }
  function modalCorrHtml(m) {
    var list = (DATA.meta.corrections || []).filter(function (c) {
      var t = (c.item || "") + " " + (c.issue || "") + " " + (c.fix || "");
      return t.indexOf(m.nameCn) >= 0 || t.indexOf(m.nameEn) >= 0 || t.indexOf(m.id) >= 0;
    });
    if (!list.length) return '<p class="modal-sec" style="opacity:.6"><b>🩹 矫正记录：</b>该材料暂无矫正记录</p>';
    return '<p class="modal-sec"><b>🩹 矫正记录：</b>共 ' + list.length + ' 条</p>'
      + '<ul class="modal-srcs corr-list">' + list.slice(0, 5).map(function (c) {
        return "<li><b>" + esc(c.date || "") + "</b> " + esc((c.item || "").slice(0, 60)) + "<br><small>" + esc((c.fix || "").slice(0, 110)) + "</small></li>";
      }).join("") + "</ul>"
      + (list.length > 5 ? '<p class="hint" style="margin-top:4px">其余 ' + (list.length - 5) + ' 条见「数据说明 → 矫正记录」</p>' : "");
  }
  function openModal(id) {
    var m = matById(id);
    if (!m) return;
    var rows = [
      ["玻璃化温度 Tg", rng(m.tg, "℃")],
      ["熔化温度 Tm", m.tm ? rng(m.tm, "℃") : "无定形（无明确熔点）"],
      ["热变形温度 HDT", rng(m.hdt, "℃")],
      ["打印温度（喷嘴）", rng(m.printTemp, "℃")],
      ["热床温度", rng(m.bedTemp, "℃")],
      ["拉伸强度", rng(m.tensile, "MPa")],
      ["弯曲强度", rng(m.flexural, "MPa")],
      ["抗冲击强度", m.impact ? rng(m.impact, m.impactUnit || "") : "—"],
      ["断裂伸长率", rng(m.elongation, "%")],
      ["密度", rng(m.density, "g/cm³", 2)],
      ["吸湿性", m.hygroscopic],
      ["打印难度", m.difficulty + "/5（" + DIFF_LABEL[m.difficulty] + "）"],
      ["翘曲倾向", m.warp],
      ["封闭腔体", m.enclosure],
      ["干燥建议", m.drying || "—"],
      ["安全等级", SAFETY_LABEL[m.safetyLevel] + "（" + m.fumes + "）"]
    ];
    var html = '<div class="modal-head" style="--mat-color:' + (m.color || "#4f9cf9") + '">'
      + "<h3>" + esc(m.nameCn) + " <small>" + esc(m.nameEn) + "</small></h3>"
      + '<span class="mat-family">' + esc(m.family) + "</span>"
      + '<span class="score-badge">⭐ ' + matScore(m) + "</span></div>"
      + '<div class="modal-scorebar"><div class="scorebar-fill" style="width:' + matScore(m) + '%"></div></div>'
      + '<table class="modal-table"><tbody>'
      + rows.map(function (r) { return "<tr><td>" + r[0] + "</td><td>" + r[1] + "</td></tr>"; }).join("")
      + "</tbody></table>"
      + '<p class="modal-sec"><b>🛡️ 安全说明：</b>' + esc(m.safetyNote) + "</p>"
      + '<p class="modal-sec"><b>🧩 主要用途：</b>' + esc(m.applications.join("、")) + "</p>"
      + '<p class="modal-sec"><b>⚠️ 主要短板：</b>' + esc(m.drawbacks.join("、")) + "</p>"
      + (m.note ? '<p class="modal-sec modal-note"><b>📝 备注：</b>' + esc(m.note) + "</p>" : "")
      + '<p class="modal-sec"><b>🔗 数据来源：</b></p><ul class="modal-srcs">'
      + (m.sources || []).map(function (s) { return '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.name) + "</a></li>"; }).join("")
      + "</ul>"
      + modalCorrHtml(m)
      + '<div class="modal-actions-row">'
      + '<a class="btn btn-ghost btn-sm" href="' + issueUrl(m) + '" target="_blank" rel="noopener" title="在 GitHub 预填纠错 issue">🛠 纠错此材料</a>'
      + '<button class="btn btn-ghost btn-sm" type="button" onclick="window.print()" title="打印本页参数（黑白排版）">🖨 打印参数页</button>'
      + '</div>'
      + '<button class="btn btn-primary btn-block" data-addcmp="' + m.id + '">＋ 加入对比</button>';
    $("#matModalBody").innerHTML = html;
    $("#matModal").style.display = "flex";
    document.body.style.overflow = "hidden";
    rememberFocus();
    var mc = $("#matModalClose");
    if (mc) mc.focus({ preventScroll: true });
    var add = $("#matModalBody [data-addcmp]");
    if (add) add.addEventListener("click", function () {
      var already = cmpState.mats.indexOf(m.id) >= 0;
      if (!already) {
        cmpState.mats.push(m.id);
        if (cmpState.mats.length > 5) cmpState.mats.splice(0, cmpState.mats.length - 5);
      }
      closeModal();
      renderCmpChips();
      if (currentModule === "compare") renderCompareCharts();
      /* 不再强制跳页打断浏览：Toast 确认 + 可选跳转 */
      toast(already
        ? "「" + esc(m.nameCn) + "」已在对比列表中"
        : "✅ 已加入对比：" + esc(m.nameCn) + "（" + cmpState.mats.length + "/5）",
        { label: "查看对比 →", fn: function () {
          if (currentModule !== "compare") navigateModule("compare");
          else renderCompareCharts();
          document.getElementById("compare").scrollIntoView({ behavior: "smooth", block: "start" });
        } });
    });
  }
  function closeModal() {
    $("#matModal").style.display = "none";
    document.body.style.overflow = "";
    restoreFocus();
  }

  /* ---------- 性能散点图（HDT × 打印温度 × 抗冲击） ---------- */
  function renderScatter() {
    var el = $("#scatterChart");
    if (!el) return;
    var W = 860, H = 520, ml = 64, mr = 24, mt = 26, mb = 48;
    var pw = W - ml - mr, ph = H - mt - mb;
    var X = function (v) { return ml + (v / 280) * pw; };
    var Y = function (v) { return mt + ph - (v / 460) * ph; };
    var mats = allMaterials().filter(function (m) { return mid(m.hdt) != null && mid(m.printTemp) != null; });
    var svg = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="性能散点图">';
    for (var gx = 0; gx <= 280; gx += 70) {
      svg += '<line x1="' + X(gx) + '" y1="' + mt + '" x2="' + X(gx) + '" y2="' + (mt + ph) + '" class="sc-grid" stroke="rgba(255,255,255,.06)"/>';
      svg += '<text x="' + X(gx) + '" y="' + (mt + ph + 22) + '" text-anchor="middle" class="sc-label" font-size="11.5" fill="#6b7a8f">' + gx + "°</text>";
    }
    for (var gy = 0; gy <= 460; gy += 100) {
      svg += '<line x1="' + ml + '" y1="' + Y(gy) + '" x2="' + (ml + pw) + '" y2="' + Y(gy) + '" class="sc-grid" stroke="rgba(255,255,255,.06)"/>';
      svg += '<text x="' + (ml - 8) + '" y="' + (Y(gy) + 4) + '" text-anchor="end" class="sc-label" font-size="11.5" fill="#6b7a8f">' + gy + "°</text>";
    }
    svg += '<text x="' + (ml + pw / 2) + '" y="' + (H - 10) + '" text-anchor="middle" class="sc-label" font-size="13" fill="#9aa7b8">热变形温度 HDT（℃）→ 耐热性</text>';
    svg += '<text x="16" y="' + (mt + ph / 2) + '" text-anchor="middle" font-size="13" class="sc-label" fill="#9aa7b8" transform="rotate(-90 16 ' + (mt + ph / 2) + ')">打印温度（℃）→ 机器门槛</text>';
    svg += '<line x1="' + X(100) + '" y1="' + mt + '" x2="' + X(100) + '" y2="' + (mt + ph) + '" stroke="rgba(249,165,79,.28)" stroke-dasharray="5 5"/>';
    svg += '<line x1="' + ml + '" y1="' + Y(250) + '" x2="' + (ml + pw) + '" y2="' + Y(250) + '" stroke="rgba(249,165,79,.28)" stroke-dasharray="5 5"/>';
    mats.forEach(function (m) {
      var x = X(mid(m.hdt)), y = Y(mid(m.printTemp));
      var imp = mid(m.impact);
      var r = Math.min(15, 5 + Math.sqrt(imp == null ? 0 : imp) * 1.7);
      var c = m._zone.id === "standard" ? "#4f9cf9" : "#f9a54f";
      var tip = esc(m.nameCn + "（" + m.nameEn + "）\nHDT " + rng(m.hdt, "℃") + " · 打印 " + rng(m.printTemp, "℃") + "\n冲击 " + (m.impact ? rng(m.impact, m.impactUnit) : "—") + " · 难度 " + m.difficulty + "/5");
      svg += '<circle class="scatter-dot" cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + c + '" fill-opacity=".55" stroke="' + c + '" stroke-width="1.6" data-name="' + esc(m.nameCn) + '" data-info="' + tip + '"/>';
    });
    svg += "</svg>";
    el.innerHTML = svg;
    $("#scatterLegend").innerHTML =
      '<span><i style="background:#4f9cf9"></i>常规耗材</span>'
      + '<span><i style="background:#f9a54f"></i>工程耗材</span>'
      + '<span><i style="display:inline-block;width:10px;height:10px;border-radius:50%;border:2px solid var(--v2-mut);background:transparent"></i>气泡大小=抗冲击</span>';
    var tipEl = document.createElement("div");
    tipEl.className = "scatter-tip";
    el.appendChild(tipEl);
    $all(".scatter-dot", el).forEach(function (dot) {
      dot.addEventListener("mouseenter", function () {
        tipEl.innerHTML = '<b>' + dot.getAttribute("data-name") + "</b><br>" + dot.getAttribute("data-info").split("\n").slice(1).join("<br>");
        tipEl.style.opacity = "1";
      });
      dot.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        tipEl.style.left = (e.clientX - r.left + 16) + "px";
        tipEl.style.top = (e.clientY - r.top - 8) + "px";
      });
      dot.addEventListener("mouseleave", function () { tipEl.style.opacity = "0"; });
      dot.addEventListener("click", function (e) {
        var show = tipEl.style.opacity !== "1";
        if (show) {
          tipEl.innerHTML = '<b>' + dot.getAttribute("data-name") + "</b><br>" + dot.getAttribute("data-info").split("\n").slice(1).join("<br>");
          tipEl.style.opacity = "1";
          var r = el.getBoundingClientRect();
          var cx = Math.min(e.clientX - r.left, r.width - 180);
          var cy = Math.min(e.clientY - r.top, r.height - 70);
          tipEl.style.left = Math.max(0, cx) + "px";
          tipEl.style.top = Math.max(0, cy) + "px";
        } else {
          tipEl.style.opacity = "0";
        }
      });
      dot.addEventListener("touchstart", function (e) { e.preventDefault(); dot.dispatchEvent(new MouseEvent("click", { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY, bubbles: true })); }, { passive: false });
    });
  }

  /* ---------- 对比工具 ---------- */
  var cmpState = { mats: [], metrics: ["tensile"] };
  var benchOn = false; /* B3 全库均值基准 */

  var METRICS = [
    { key: "tensile", label: "拉伸强度", unit: "MPa" },
    { key: "flexural", label: "弯曲强度", unit: "MPa" },
    { key: "impact", label: "抗冲击", unit: null },
    { key: "elongation", label: "断裂伸长率", unit: "%" },
    { key: "hdt", label: "热变形温度", unit: "℃" },
    { key: "tg", label: "玻璃化温度", unit: "℃" },
    { key: "printTemp", label: "打印温度", unit: "℃" },
    { key: "bedTemp", label: "热床温度", unit: "℃" },
    { key: "density", label: "密度", unit: "g/cm³" }
  ];

  function renderCmpChips() {
    var html = "";
    allMaterials().forEach(function (m, i) {
      var on = cmpState.mats.indexOf(m.id) >= 0;
      html += '<label class="chip' + (on ? " on" : "") + '" style="--mat-color:' + (m.color || "#4f9cf9") + '">'
        + '<input type="checkbox" data-cmp-mat="' + m.id + '"' + (on ? " checked" : "") + ">"
        + esc(m.nameCn) + "</label>";
    });
    $("#cmpChips").innerHTML = html;
    var mhtml = "";
    METRICS.forEach(function (mt) {
      var on = cmpState.metrics.indexOf(mt.key) >= 0;
      mhtml += '<label class="chip' + (on ? " on" : "") + '"><input type="checkbox" data-cmp-metric="' + mt.key + '"' + (on ? " checked" : "") + ">"
        + esc(mt.label) + "</label>";
    });
    $("#cmpMetrics").innerHTML = mhtml;
    $all("#cmpChips input").forEach(function (inp) {
      inp.addEventListener("change", function () {
        var id = inp.getAttribute("data-cmp-mat");
        var i = cmpState.mats.indexOf(id);
        if (inp.checked && i < 0) cmpState.mats.push(id);
        if (!inp.checked && i >= 0) cmpState.mats.splice(i, 1);
        if (cmpState.mats.length > 5) { cmpState.mats.splice(0, cmpState.mats.length - 5); }
        renderCmpChips();
        renderCompareCharts();
      });
    });
    $all("#cmpMetrics input").forEach(function (inp) {
      inp.addEventListener("change", function () {
        var k = inp.getAttribute("data-cmp-metric");
        var i = cmpState.metrics.indexOf(k);
        if (inp.checked && i < 0) cmpState.metrics.push(k);
        if (!inp.checked && i >= 0) cmpState.metrics.splice(i, 1);
        if (cmpState.metrics.length === 0) { cmpState.metrics = [METRICS[0].key]; inp.checked = true; }
        renderCmpChips();
        renderCompareCharts();
      });
    });
    if (!renderCmpChips.clearBound) {
      renderCmpChips.clearBound = true;
      $("#cmpClear").addEventListener("click", function () {
        if (!cmpState.mats.length) { toast("对比列表本来就是空的，无需清空"); return; } /* B4 空操作提示 */
        cmpState.mats = [];
        renderCmpChips();
        renderCompareCharts();
      });
    }
    bindCmpShare();
    bindCmpExtras();
    refreshCmpShareBtn();
  }

  /* ---------- B4 CSV 导出 / B3 全库均值 ---------- */
  function bindCmpExtras() {
    if (bindCmpExtras.bound) return;
    bindCmpExtras.bound = true;
    var csv = $("#cmpCsv"), bt = $("#benchToggle");
    if (csv) csv.addEventListener("click", exportCompareCsv);
    if (bt) bt.addEventListener("change", function () { benchOn = bt.checked; renderCompareCharts(); });
  }
  function csvSafe(v) {
    if (v == null) return "";
    if (Array.isArray(v)) v = v.join(" ~ ");
    var t = String(v);
    if (/^[=+\-@]/.test(t)) t = "'" + t; /* 防 CSV 公式注入 */
    return t;
  }
  function csvq(t) { t = String(t); return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; }
  function exportCompareCsv() {
    var mats = selectedMats();
    if (!mats.length) { toast("先选好材料，再点导出"); return; }
    var cols = [["id","ID"],["nameCn","名称"],["nameEn","英文名"],["family","家族"],["difficulty","难度(1-5)"],
      ["tg","Tg ℃"],["tm","Tm ℃"],["hdt","HDT ℃"],["printTemp","喷嘴温度 ℃"],["bedTemp","热床温度 ℃"],
      ["tensile","拉伸 MPa"],["flexural","弯曲 MPa"],["impact","抗冲击"],["impactUnit","冲击单位"],["elongation","伸长率 %"],
      ["density","密度 g/cm³"],["hygroscopic","吸湿性"],["warp","翘曲"],["enclosure","腔体"],["drying","干燥"],
      ["safetyLevel","安全等级(0-3)"],["score","综合评分"]];
    var lines = [cols.map(function (c) { return csvq(c[1]); }).join(",")];
    mats.forEach(function (m) {
      lines.push(cols.map(function (c) {
        return csvq(csvSafe(c[0] === "score" ? matScore(m) : m[c[0]]));
      }).join(","));
    });
    var blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    var a2 = document.createElement("a");
    a2.href = URL.createObjectURL(blob);
    a2.download = "filament-compare-" + watchToday() + ".csv";
    document.body.appendChild(a2); a2.click(); a2.remove();
    toast("⬇ 已导出 " + mats.length + " 种材料的 CSV");
  }

  /* ---------- B2 对比结果分享链接 ---------- */
  function buildCompareUrl() {
    var mats = cmpState.mats.filter(function (id) { return matById(id); });
    if (!mats.length) return null;
    var out = "?sel=" + encodeURIComponent(mats.join(","));
    if (cmpState.metrics && cmpState.metrics.length) out += "&m=" + encodeURIComponent(cmpState.metrics.join(","));
    return out;
  }
  function refreshCmpShareBtn() {
    var b = $("#cmpShare");
    if (!b) return;
    b.disabled = cmpState.mats.length === 0;
    b.title = cmpState.mats.length ? "复制当前对比结果链接（含所选耗材与维度）" : "先在①选择至少 1 种耗材";
    var c = $("#cmpCsv");
    if (c) c.disabled = cmpState.mats.length === 0;
  }
  function bindCmpShare() {
    if (bindCmpShare.bound) return;
    bindCmpShare.bound = true;
    var btn = $("#cmpShare");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var query = buildCompareUrl();
      if (!query) { toast("先选 1 种以上耗材，再复制分享链接"); return; }
      var base = location.href.split("?")[0].split("#")[0];
      /* 查询参数在前、路由 hash 在后：打开分享链接直达对比页并恢复选择 */
      var url = base + query + "#/compare";
      var okToast = function () { toast("🔗 分享链接已复制，打开即进入对比"); };
      var failToast = function () { toast("⚠️ 复制失败，请复制地址栏链接"); };
      var fallbackCopy = function (text) {
        var ta = document.createElement("textarea");
        ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        var ok = false; try { ok = document.execCommand("copy"); } catch (e) { /* ignore */ }
        ta.remove(); return ok;
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(okToast, function () { fallbackCopy(url) ? okToast() : failToast(); });
      } else {
        fallbackCopy(url) ? okToast() : failToast();
      }
    });
  }

  function selectedMats() {
    var all = allMaterials();
    return cmpState.mats.map(function (id) {
      for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
      return null;
    }).filter(Boolean);
  }

  /* 雷达图：8 轴画像 */
  var RADAR_AXES = [
    { key: "hdt", label: "耐热", max: 160, unit: "℃" },
    { key: "tensile", label: "强度", max: 100, unit: "MPa" },
    { key: "impact", label: "抗冲击", max: 30, unit: "kJ/m²" },
    { key: "elongation", label: "柔韧", max: 300, unit: "%" },
    { key: "print", label: "打印易度", max: 5, unit: "1–5", inv: true },
    { key: "warp", label: "抗翘曲", max: 3, unit: "", inv: true },
    { key: "dry", label: "低吸湿", max: 4, unit: "", inv: true },
    { key: "safe", label: "安全", max: 3, unit: "", inv: true }
  ];

  function radarValue(m, ax) {
    var v;
    if (ax.key === "print") v = m.difficulty;
    else if (ax.key === "warp") v = { "低": 1, "中": 2, "高": 3 }[m.warp];
    else if (ax.key === "dry") v = HYGRO[m.hygroscopic];
    else if (ax.key === "safe") v = m.safetyLevel + 1;
    else v = mid(m[ax.key]);
    if (v == null) return 0;
    var score = ax.inv ? (ax.max - v) / ax.max : v / ax.max;
    return Math.max(0, Math.min(1, score));
  }

  function renderRadar() {
    var box = $("#radarChart");
    var mats = selectedMats();
    if (!mats.length) { box.innerHTML = '<div class="chart-empty">先选 1–5 种耗材，性能画像会自动生成</div>'; return; }
    var W = 480, H = 420, cx = W / 2, cy = H / 2, R = 150;
    var N = RADAR_AXES.length;
    var pt = function (i, r) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / N;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    };
    var svg = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="性能雷达图">';
    for (var g = 1; g <= 4; g++) {
      var pts = [];
      for (var i = 0; i < N; i++) pts.push(pt(i, R * g / 4).join(","));
      svg += '<polygon points="' + pts.join(" ") + '" class="rr-grid" fill="none" stroke="rgba(255,255,255,.09)" stroke-width="1"/>';
    }
    for (var j = 0; j < N; j++) {
      var p = pt(j, R);
      svg += '<line x1="' + cx + '" y1="' + cy + '" x2="' + p[0] + '" y2="' + p[1] + '" class="rr-grid" stroke="rgba(255,255,255,.09)"/>';
      var lp = pt(j, R + 24);
      var anch = lp[0] < cx - 10 ? "end" : (lp[0] > cx + 10 ? "start" : "middle");
      svg += '<text x="' + lp[0] + '" y="' + (lp[1] + 4) + '" text-anchor="' + anch + '" class="rr-label" font-size="11.5" fill="#9aa7b8">' + RADAR_AXES[j].label + "</text>";
    }
    mats.forEach(function (m, mi) {
      var pts = [];
      for (var k = 0; k < N; k++) {
        var v = radarValue(m, RADAR_AXES[k]);
        pts.push(pt(k, R * v).join(","));
      }
      var c = m.color || PALETTE[mi % PALETTE.length];
      svg += '<polygon class="radar-data" points="' + pts.join(" ") + '" fill="' + escRgba(c) + '.22" stroke="' + c + '" stroke-width="2" stroke-linejoin="round"/>';
    });
    if (mats.length > 1) {
      var avgPts = [];
      for (var a = 0; a < N; a++) {
        var sum = 0, cnt = 0;
        mats.forEach(function (m) {
          var v = radarValue(m, RADAR_AXES[a]);
          if (v > 0.001) { sum += v; cnt++; }
        });
        var avg = cnt ? sum / cnt : 0;
        avgPts.push(pt(a, R * avg).join(","));
      }
      svg += '<polygon points="' + avgPts.join(" ") + '" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1.4" stroke-dasharray="6 4"/>';
    }
    if (benchOn) {
      var bPts = [];
      for (var b = 0; b < N; b++) {
        var bsum = 0, bcnt = 0;
        allMaterials().forEach(function (bm) {
          var bv = radarValue(bm, RADAR_AXES[b]);
          if (bv > 0.001) { bsum += bv; bcnt++; }
        });
        bPts.push(pt(b, R * (bcnt ? bsum / bcnt : 0)).join(","));
      }
      svg += '<polygon class="radar-bench" points="' + bPts.join(" ") + '" fill="none" stroke-width="1.6" stroke-dasharray="3 5"/>';
    }
    svg += "</svg>";
    var legend = mats.map(function (m, mi) {
      var c = m.color || PALETTE[mi % PALETTE.length];
      return '<span><i style="background:' + c + '"></i>' + esc(m.nameCn) + "</span>";
    }).join("");
    legend += '<span style="opacity:.75"><i style="background:transparent;border:1.5px dashed rgba(255,255,255,.55);width:12px;height:0"></i>选中材料平均值</span>';
    if (benchOn) legend += '<span class="bench-leg"><i style="background:transparent;border:1.5px dashed var(--v2-mut);width:12px;height:0"></i>全库均值</span>';
    box.innerHTML = svg + '<div class="chart-legend">' + legend + "</div>";
  }

  /* 条形图 */
  function renderBars() {
    var box = $("#barChart");
    var mats = selectedMats();
    if (!mats.length) { box.innerHTML = '<div class="chart-empty">先选 1–5 种耗材，对比图会自动生成</div>'; return; }
    var html = "";
    cmpState.metrics.forEach(function (mk, mi) {
      var mt = METRICS.filter(function (x) { return x.key === mk; })[0];
      if (!mt) return;
      var unit = mt.unit || (mk === "impact" ? "kJ/m²" : "");
      var maxV = maxOf(mats, mk) || 1;
      html += '<div class="bar-group" style="margin-bottom:16px"><b style="font-size:13px;color:var(--v2-mut)">' + esc(mt.label) + "（" + esc(unit) + "）</b>";
      mats.forEach(function (m, i) {
        var v = mid(m[mk]);
        var c = m.color || PALETTE[i % PALETTE.length];
        var pct = v == null ? 0 : Math.round(v / maxV * 100);
        var disp = v == null ? "—" : (unit === "g/cm³" ? v.toFixed(2) : Math.round(v));
        html += '<div class="bar-row"><span class="bar-label" title="' + esc(m.nameEn) + '">' + esc(m.nameCn) + '</span>'
          + '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%;background:' + c + '"></div></div>'
          + '<span class="bar-val">' + disp + " " + unit + "</span></div>";
      });
      html += "</div>";
    });
    box.innerHTML = html;
  }

  function renderCompareCharts() { renderRadar(); renderBars(); }

  /* ---------- 选材向导 ---------- */
  var SCENES = [
    { id: "daily", icon: "🖼️", title: "日常打印 / 摆件", desc: "原型、模型、装饰，追求好打不折腾", rec: ["pla", "pla-plus", "pla-silk"], reason: "PLA 家族打印最简单、无气味、色彩最丰富；需要一点韧性选 PLA+，要丝绸光泽选 PLA Silk。" },
    { id: "heat", icon: "🔥", title: "耐热应用（100℃+）", desc: "发动机舱、热水接触、高温环境", rec: ["pc", "pa6", "pps", "peek", "pei"], reason: "按耐热排序：PC（HDT 110-140℃）→ PA6 → PPS（300℃+ 打印）→ PEEK/PEI（需高温工程机+封闭腔体）。预算有限选 PC，要求极高选 PEEK/PEI。" },
    { id: "outdoor", icon: "☀️", title: "户外耐候", desc: "长期日晒雨淋、汽车外饰", rec: ["asa", "petg", "pvdf", "asa-cf"], reason: "ASA 是户外首选（耐紫外远超 ABS），PETG 中等耐候性价比高，PVDF 用于化工级苛刻环境。" },
    { id: "flex", icon: "🎈", title: "柔性 / 缓冲", desc: "密封圈、减震、手机壳、鞋垫", rec: ["tpu", "tpe", "peba"], reason: "TPU 95A 通用性最好；要更软选 TPE 83A 类；PEBA 兼具弹性与低温性能，适合运动器材。" },
    { id: "strong", icon: "🦾", title: "高强度结构件", desc: "无人机、机械臂、承力支架", rec: ["pa-cf", "pa12-cf", "pet-cf", "ppa-cf", "peek"], reason: "碳纤增强尼龙（PA6-CF 拉伸 100-130 MPa）是性价比首选；要求耐热+强度兼顾选 PPS-CF/PPA-CF；不计成本上 PEEK。" },
    { id: "support", icon: "🧊", title: "水溶支撑", desc: "复杂悬空结构、多材料打印", rec: ["pva", "bvoh"], reason: "PVA 通用性最广；BVOH 与更多材料兼容、溶解更快但更贵。两者都极吸湿，需密封干燥保存。" },
    { id: "food", icon: "🍽️", title: "食品接触", desc: "餐具、容器（注意打印层间卫生）", rec: ["petg", "pp", "pet"], reason: "PETG/PP/PET 树脂本身可用于食品接触；PP 耐高温可微波（需确认牌号），但 3D 打印件层间缝隙易藏菌，建议短时接触+密封涂层。" },
    { id: "speed", icon: "🏎️", title: "高速打印", desc: "快速打样、量产原型", rec: ["pla-plus", "petg"], reason: "PLA+ 高速表现最好且稳定；PETG 可选高速版（如拓竹 PETG HF）。注意：含碳纤/玻纤的 PETG-CF/GF 流动性差，不支持高速打印。" }
  ];
  var activeScene = null;
  function renderGuide() {
    var html = SCENES.map(function (s) {
      return '<button class="guide-card' + (activeScene === s.id ? " active" : "") + '" data-scene="' + s.id + '"><div class="guide-icon">' + s.icon + "</div>"
        + "<h3>" + s.title + "</h3><p>" + s.desc + "</p><span class='guide-tip'>查看推荐 →</span></button>";
    }).join("");
    $("#guideGrid").innerHTML = html;
    $all("#guideGrid .guide-card").forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeScene = btn.getAttribute("data-scene");
        renderGuide();
        var sc = SCENES.filter(function (x) { return x.id === btn.getAttribute("data-scene"); })[0];
        if (!sc) return;
        var mats = sc.rec.map(matById).filter(Boolean);
        var cards = mats.map(function (m) {
          return '<div class="guide-mat" style="--mat-color:' + (m.color || "#4f9cf9") + '" data-gmat="' + m.id + '">'
            + '<b>' + esc(m.nameCn) + "</b> <small>" + esc(m.nameEn) + "</small>"
            + '<span class="tag diff-' + Math.min(3, Math.ceil(m.difficulty / 2)) + '">难度 ' + m.difficulty + "/5</span>"
            + '<span class="score-badge">⭐ ' + matScore(m) + "</span></div>";
        }).join("");
        $("#guideResult").innerHTML = '<div class="guide-result-head"><h3>' + sc.icon + " " + sc.title + " · 推荐</h3>"
          + '<p class="guide-reason">💡 ' + esc(sc.reason) + "</p></div>"
          + '<div class="guide-mats">' + cards + "</div>"
          + '<p class="hint">点击推荐材料可查看完整详情与数据来源</p>';
        $("#guideResult").style.display = "block";
        $all("#guideResult .guide-mat").forEach(function (gm) {
          gm.addEventListener("click", function () { openModal(gm.getAttribute("data-gmat")); });
        });
        $("#guideResult").scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    });
  }

  /* ---------- 完整数据表 ---------- */
  var tableSort = { key: "nameCn", dir: 1 };
  var TABLE_COLS = [
    { key: "nameCn", label: "材料", cell: "name" },
    { key: "zone", label: "分区", cell: "zone" },
    { key: "tg", label: "Tg ℃" },
    { key: "tm", label: "Tm ℃" },
    { key: "hdt", label: "热变形 ℃" },
    { key: "printTemp", label: "打印 ℃" },
    { key: "bedTemp", label: "热床 ℃" },
    { key: "tensile", label: "拉伸 MPa" },
    { key: "flexural", label: "弯曲 MPa" },
    { key: "impact", label: "抗冲击" },
    { key: "elongation", label: "伸长 %" },
    { key: "density", label: "密度" },
    { key: "hygroscopic", label: "吸湿", cell: "text" },
    { key: "difficulty", label: "难度", cell: "meter" },
    { key: "warp", label: "翘曲", cell: "text" },
    { key: "enclosure", label: "腔体", cell: "text" },
    { key: "safetyLevel", label: "安全", cell: "safety" }
  ];

  function renderTable() {
    var mats = allMaterials().slice();
    var k = tableSort.key, d = tableSort.dir;
    mats.sort(function (a, b) {
      var av, bv;
      if (k === "zone") { av = (a._zone.nameCn || ""); bv = (b._zone.nameCn || ""); }
      else if (k === "nameCn") { av = a.nameCn; bv = b.nameCn; }
      else if (k === "hygroscopic" || k === "warp") { av = a[k]; bv = b[k]; }
      else if (k === "difficulty") { av = a.difficulty; bv = b.difficulty; }
      else if (k === "safetyLevel") { av = a.safetyLevel; bv = b.safetyLevel; }
      else { av = mid(a[k]); bv = mid(b[k]); av = av == null ? -1 : av; bv = bv == null ? -1 : bv; }
      if (av < bv) return -1 * d;
      if (av > bv) return 1 * d;
      return 0;
    });
    var head = "<tr>" + TABLE_COLS.map(function (c) {
      return '<th data-key="' + c.key + '" class="' + (tableSort.key === c.key ? "sorted" : "") + '">' + c.label
        + (tableSort.key === c.key ? (tableSort.dir > 0 ? " ▲" : " ▼") : "") + "</th>";
    }).join("") + "</tr>";
    /* 每列最优值（🏆）：数值列取中值比较 */
    var WARP = { "低": 1, "中": 2, "高": 3 };
    var BEST = { max: ["tg", "tm", "hdt", "tensile", "flexural", "impact", "elongation"], min: ["difficulty", "safetyLevel"] };
    var bestVal = {};
    TABLE_COLS.forEach(function (c) {
      if (BEST.max.indexOf(c.key) >= 0 || BEST.min.indexOf(c.key) >= 0) {
        var vals = mats.map(function (m) { return mid(m[c.key]); }).filter(function (x) { return x != null; });
        if (vals.length) bestVal[c.key] = BEST.max.indexOf(c.key) >= 0 ? Math.max.apply(null, vals) : Math.min.apply(null, vals);
      } else if (c.key === "hygroscopic") {
        bestVal[c.key] = Math.min.apply(null, mats.map(function (m) { return HYGRO[m.hygroscopic] || 9; }));
      } else if (c.key === "warp") {
        bestVal[c.key] = Math.min.apply(null, mats.map(function (m) { return WARP[m.warp] || 9; }));
      }
    });
    function bestCell(key, v, inner) {
      if (bestVal[key] == null || v == null) return "<td>" + inner + "</td>";
      var isBest = key === "hygroscopic" || key === "warp"
        ? (key === "hygroscopic" ? HYGRO[v] === bestVal[key] : WARP[v] === bestVal[key])
        : (Math.abs(mid(v) - bestVal[key]) < 1e-9);
      return isBest ? '<td class="cell-best">🏆 ' + inner + "</td>" : "<td>" + inner + "</td>";
    }
    var body = mats.map(function (m) {
      var tds = TABLE_COLS.map(function (c) {
        var v = m[c.key];
        if (c.cell === "name") {
          return '<td class="material-cell"><span class="dot" style="background:' + (m.color || "#4f9cf9") + '"></span><b>' + esc(m.nameCn) + "</b> <span style='color:var(--v2-mut)'>" + esc(m.nameEn) + "</span></td>";
        }
        if (c.cell === "zone") return "<td>" + esc(m._zone.nameCn) + "</td>";
        if (c.key === "impact") return bestCell(c.key, v, rng(v, m.impactUnit));
        if (c.key === "density") return "<td class='cell-mono'>" + rng(v, "", 2) + "</td>";
        if (c.key === "difficulty") {
          var inner = '<span class="meter"><i style="width:' + (v / 5 * 100) + '%;background:' + ["#3ddc84", "#3ddc84", "#f2c94c", "#f9a54f", "#f9685f"][v - 1] + '"></i></span>' + v;
          return bestCell(c.key, v, inner);
        }
        if (c.key === "safetyLevel") {
          var t = '<span class="tag safety-' + v + '">' + SAFETY_LABEL[v] + "</span>";
          return bestCell(c.key, v, t);
        }
        if (c.key === "hygroscopic" || c.key === "warp") return bestCell(c.key, v, esc(v));
        if (c.key === "tg" || c.key === "tm" || c.key === "hdt" || c.key === "printTemp" || c.key === "bedTemp") {
          return bestCell(c.key, v, rng(v, ""));
        }
        return bestCell(c.key, v, esc(v == null ? "—" : v));
      });
      return "<tr>" + tds.join("") + "</tr>";
    }).join("");
    $("#fullTable").innerHTML = '<table class="data-table table-sticky-first"><thead>' + head + "</thead><tbody>" + body + "</tbody></table>";
    $all("#fullTable th").forEach(function (th) {
      th.setAttribute("tabindex", "0"); th.setAttribute("role", "button"); th.addEventListener("click", function () {
        var kk = th.getAttribute("data-key");
        if (tableSort.key === kk) tableSort.dir *= -1;
        else { tableSort.key = kk; tableSort.dir = 1; }
        renderTable();
      });
    });
  }

  /* ---------- 品牌 × 材料族 覆盖矩阵 ---------- */
  var FAMILY_KEYWORDS = [
    { family: "PLA系", re: /PLA/i },
    { family: "PET系", re: /PETG|\bPET\b|rPET/i },
    { family: "ABS/ASA", re: /\bABS\b|\bASA\b|eABS/i },
    { family: "柔性", re: /\bTPU\b|\bTPE\b|PEBA|\bOBC\b|Flex|柔性|eTPU|eFlex|Elastic/i },
    { family: "支撑/精饰", re: /\bPVA\b|BVOH|\bHIPS\b|\bPVB\b|Support|Dissolve/i },
    { family: "烯烃", re: /\bPP\b/i },
    { family: "PC", re: /\bPC\b|PC-|聚碳酸酯|ePC/i },
    { family: "尼龙PA", re: /PA\d|PA-|Nylon|尼龙|PAHT|ePA/i },
    { family: "POM", re: /\bPOM\b|Acetal|赛钢/i },
    { family: "PBT", re: /\bPBT\b/i },
    { family: "高温PPS", re: /\bPPS\b/i },
    { family: "高温PSU", re: /\bPSU\b|PPSU/i },
    { family: "高温PEEK/PEKK", re: /\bPEEK\b|\bPEKK\b/i },
    { family: "PVDF", re: /\bPVDF\b/i },
    { family: "PPA", re: /\bPPA\b/i }
  ];
  function renderBrandMatrix() {
    var el = $("#brandMatrix");
    if (!el) return;
    var fams = FAMILY_KEYWORDS.map(function (f) { return f.family; });
    var head = "<tr><th>品牌</th>" + fams.map(function (f) { return '<th class="mx-col">' + f + "</th>"; }).join("") + "</tr>";
    var rows = DATA.brands.map(function (b) {
      var joined = b.materials.join(" ");
      var cells = FAMILY_KEYWORDS.map(function (fk) {
        var hit = fk.re.test(joined);
        return '<td class="mx-cell' + (hit ? " mx-hit" : "") + '">' + (hit ? "✓" : "·") + "</td>";
      }).join("");
      return '<tr class="mx-row"><td class="mx-brand"><a href="' + esc(b.url) + '" target="_blank" rel="noopener">' + esc(b.nameCn) + "</a></td>" + cells + "</tr>";
    }).join("");
    el.innerHTML = '<table class="data-table matrix-table table-sticky-first"><thead>' + head + "</thead><tbody>" + rows + "</tbody></table>";
  }

  /* ---------- 价格情报 ---------- */
  var legacyPriceState = { platform: "" };
  function renderPricesLegacy() {
    var prices = DATA.meta.prices;
    var el = $("#priceTable");
    if (!el || !prices || !prices.items || !prices.items.length) return;
    var items = prices.items.filter(function (p) {
      return !legacyPriceState.platform || p.platform.indexOf(legacyPriceState.platform) >= 0;
    });
    // 筛选条
    var plats = [];
    prices.items.forEach(function (p) { if (plats.indexOf(p.platform) < 0) plats.push(p.platform); });
    var fhtml = '<div class="filter-row"><span class="filter-label">平台</span>'
      + '<label class="chip fchip' + (!legacyPriceState.platform ? " on" : "") + '"><input type="radio" name="pf" data-pf=""' + (!legacyPriceState.platform ? " checked" : "") + '>全部</label>'
      + plats.map(function (pl) {
        return '<label class="chip fchip' + (legacyPriceState.platform === pl ? " on" : "") + '"><input type="radio" name="pf" data-pf="' + esc(pl) + '"' + (legacyPriceState.platform === pl ? " checked" : "") + ">" + esc(pl) + "</label>";
      }).join("")
      + "</div>";
    $("#priceFilter").innerHTML = fhtml;
    $all("#priceFilter input[name=pf]").forEach(function (inp) {
      inp.addEventListener("change", function () {
        legacyPriceState.platform = inp.getAttribute("data-pf");
        renderPricesLegacy();
      });
    });
    // 性价比排行：按品牌聚合每kg均价
    var byBrand = {};
    prices.items.forEach(function (p) {
      if (p.pricePerKg == null) return;
      if (!byBrand[p.brand]) byBrand[p.brand] = { sum: 0, n: 0, min: Infinity };
      byBrand[p.brand].sum += p.pricePerKg;
      byBrand[p.brand].n++;
      byBrand[p.brand].min = Math.min(byBrand[p.brand].min, p.pricePerKg);
    });
    var ranked = Object.keys(byBrand).map(function (b) {
      return { brand: b, avg: Math.round(byBrand[b].sum / byBrand[b].n), min: Math.round(byBrand[b].min), n: byBrand[b].n };
    }).sort(function (a, b2) { return a.avg - b2.avg; });
    var sumHtml = '<div class="price-sum-title">🏆 性价比品牌排行（按已收录品类每公斤均价，仅统计≥2 个品类样本）</div><div class="price-rank">'
      + ranked.filter(function (r) { return r.n >= 2; }).slice(0, 5).map(function (r, i) {
        return '<div class="price-rank-item"><span class="rank-no">' + (i + 1) + "</span><b>" + esc(r.brand) + "</b><span class='rank-min'>史低 ¥" + r.min + "/kg</span><span class='rank-avg'>均价 ¥" + r.avg + "/kg</span></div>";
      }).join("")
      + "</div>";
    if (prices.summary) sumHtml += '<p class="price-note">📚 调研时间与数据口径等详见<a href="#" data-openmethod>数据说明 → 价格调研说明</a></p>';
    $("#priceSummary").innerHTML = sumHtml;
    var historyBox = $("#priceHistory");
    if (historyBox) {
      var history = (prices.history || []).filter(function (h) {
        return (!priceState.platform || String(h.platform || h.brand || "").indexOf(priceState.platform) >= 0)
          && (!priceState.officialOnly || /官方|直营/.test(String(h.source || "")));
      });
      historyBox.innerHTML = history.length
        ? '<div class="table-wrap price-history-wrap"><h3>📉 可追溯史低价格（历史参考）</h3><div class="table-scroll"><table class="data-table price-history-table"><thead><tr><th>品牌</th><th>材料</th><th>史低</th><th>规格</th><th>记录日期</th><th>证据级别</th><th>来源与说明</th></tr></thead><tbody>'
          + history.map(function (h) {
            return '<tr><td><b>' + esc(h.brand) + '</b></td><td>' + esc(h.material) + '</td><td class="cell-best"><b>¥' + money(h.price) + '</b></td><td>' + esc(h.unit || "—") + '</td><td>' + esc(h.date || "—") + '</td><td>' + esc(h.confidence || "参考") + '</td><td>' + esc(h.source || "—") + (h.note ? '<br><span class="history-note">' + esc(h.note) + '</span>' : "") + '</td></tr>';
          }).join("")
          + '</tbody></table></div><p class="hint">史低是已有公开记录中的低点，不等同于全网绝对最低价；不同颜色、克重、料盘和套装规格不能直接横向比较。</p></div>'
        : "";
    }
    // 价格区间速览（按材料 × 品牌，有数据才显示——天然无空缺）
    var byMat = {};
    items.forEach(function (p) {
      if (p.pricePerKg == null) return;
      if (!byMat[p.material]) byMat[p.material] = [];
      byMat[p.material].push({ brand: p.brand, kg: p.pricePerKg });
    });
    var matOrder = ["PLA", "PLA+", "PETG", "ABS", "ASA", "TPU 95A", "PLA-CF", "PETG-CF", "PA-CF", "ABS+", "PA", "PPA-CF", "PC-CF", "PC-GF", "PA-GF"];
    var rangeHtml = '<div class="price-ranges">';
    matOrder.forEach(function (mat) {
      var list = (byMat[mat] || []).slice().sort(function (a, b) { return a.kg - b.kg; });
      if (!list.length) return;
      var min = list[0], max = list[list.length - 1];
      var uniq = [];
      list.forEach(function (x) { if (!uniq.some(function (u) { return u.brand === x.brand; })) uniq.push(x); });
      rangeHtml += '<div class="price-range-card"><div class="pr-mat">' + esc(mat) + '</div>'
        + '<div class="pr-range">¥' + min.kg + ' – ¥' + max.kg + '<span class="pr-per">/kg</span></div>'
        + '<div class="pr-brands">' + uniq.map(function (x) {
          return '<span class="pr-brand' + (x === min ? " pr-low" : "") + '">' + esc(x.brand) + " ¥" + x.kg + "</span>";
        }).join("") + "</div></div>";
    });
    rangeHtml += "</div>";
    var rangeBox = document.getElementById("priceRanges");
    if (rangeBox) rangeBox.innerHTML = rangeHtml;

    // 记录时间：从 note 提取活动日期
    function recDate(p) {
      if (!p.note) return "";
      var m = p.note.match(/(20\d{2})-(\d{2})-(\d{2})/);
      return m ? m[0] : "";
    }
    // 明细表
    var head = "<tr><th data-pk='brand'>品牌</th><th data-pk='material'>材料</th><th data-pk='platform'>平台</th><th data-pk='dealPrice'>到手价 ¥</th><th data-pk='pricePerKg'>每kg ¥</th><th data-pk='listPrice'>原价 ¥</th><th data-pk='lowestPrice'>史低 ¥</th><th>记录</th><th>优惠</th></tr>";
    var body = items.map(function (p) {
      var deal = p.dealPrice != null ? p.dealPrice : p.listPrice;
      return "<tr><td><b>" + esc(p.brand) + "</b></td><td>" + esc(p.material) + "</td><td>" + esc(p.platform) + "</td>"
        + "<td><b>" + (p.dealPrice != null ? p.dealPrice : "<span title='官方未披露' class='na'>—</span>") + "</b></td>"
        + "<td>" + (p.pricePerKg != null ? p.pricePerKg : "—") + "</td>"
        + "<td>" + (p.listPrice != null ? p.listPrice : "<span title='官方未披露' class='na'>—</span>") + "</td>"
        + "<td class='cell-best'>" + (p.lowestPrice != null ? p.lowestPrice : "<span title='未记录到可靠史低' class='na'>—</span>") + "</td>"
        + "<td>" + esc(recDate(p) || "—") + "</td>"
        + "<td>" + esc(p.discount || "—") + "</td></tr>";
    }).join("");
    $("#priceTable").innerHTML = '<table class="data-table price-table"><thead>' + head + "</thead><tbody>" + body + "</tbody></table>";
    /* 排序：数值列按数值、文本列按拼音/字符 */
    var pk = null, dir = 1;
    $all("#priceTable th[data-pk]").forEach(function (th) {
      th.setAttribute("tabindex", "0"); th.setAttribute("role", "button"); th.addEventListener("click", function () {
        var k = th.getAttribute("data-pk");
        if (pk === k) dir *= -1; else { pk = k; dir = 1; }
        var tbody = $("#priceTable tbody");
        var rows = Array.prototype.slice.call(tbody.rows);
        var numCols = ["listPrice", "dealPrice", "pricePerKg", "lowestPrice"];
        rows.sort(function (a, b2) {
          var av = a.cells[Array.prototype.indexOf.call(th.parentNode.cells, th)].textContent.trim();
          var bv = b2.cells[Array.prototype.indexOf.call(th.parentNode.cells, th)].textContent.trim();
          var an = numCols.indexOf(k) >= 0 ? parseFloat(av) : av;
          var bn = numCols.indexOf(k) >= 0 ? parseFloat(bv) : bv;
          if (isNaN(an)) an = -1; if (isNaN(bn)) bn = -1;
          if (an < bn) return -1 * dir;
          if (an > bn) return 1 * dir;
          return 0;
        });
        rows.forEach(function (r) { tbody.appendChild(r); });
      });
    });
  }

  /* ---------- 价格情报（数值化、可追溯、缺失状态明确） ---------- */
  var priceState = { platform: "", officialOnly: false };
  function priceNumber(v) {
    if (v == null || v === "") return null;
    var n = typeof v === "number" ? v : parseFloat(String(v).replace(/,/g, ""));
    return isFinite(n) ? n : null;
  }
  function money(v) {
    var n = priceNumber(v);
    return n == null ? "" : (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, "");
  }
  function itemWeightKg(p) {
    var m = String(p.productName || "").match(/(\d+(?:\.\d+)?)\s*(kg|千克|g|克)\b/i);
    if (!m) return null;
    var n = parseFloat(m[1]);
    if (!isFinite(n) || n <= 0) return null;
    if (/^(g|克)$/i.test(m[2])) n /= 1000;
    return n <= 10 ? n : null;
  }
  function effectiveKgPrice(p) {
    var direct = priceNumber(p.pricePerKg);
    if (direct != null) return { value: direct, derived: false };
    var amount = priceNumber(p.dealPrice != null ? p.dealPrice : p.listPrice);
    var kg = itemWeightKg(p);
    return amount != null && kg ? { value: amount / kg, derived: true } : null;
  }
  function officialPrice(p) {
    return p.sourceType === "官方店铺" || /官方|直营/.test(String(p.platform || ""));
  }
  function missingPrice(label) {
    return '<span class="na" title="' + esc(label) + '">未披露</span>';
  }
  function effectiveLowestPrice(p, lowInfo) {
    var low = priceNumber(lowInfo && lowInfo.price);
    var kg = effectiveKgPrice(p);
    if (low == null && !kg) return null;
    if (low == null) {
      return { value: kg.value, overridden: true, basis: "当前每kg价", date: p.recordedAt || "—" };
    }
    if (kg && kg.value < low) {
      return {
        value: kg.value,
        overridden: true,
        basis: "当前每kg价覆盖",
        date: p.recordedAt || (lowInfo && lowInfo.date) || "—",
        note: "当前每kg价低于已收录低价数值，按统一元/kg口径展示"
      };
    }
    return {
      value: low,
      overridden: false,
      basis: (lowInfo && lowInfo.basis) || "已收录低价",
      date: (lowInfo && lowInfo.date) || "—",
      note: (lowInfo && lowInfo.note) || ""
    };
  }
  function renderPrices() {
    var prices = DATA.meta.prices, el = $("#priceTable");
    if (!el || !prices || !prices.items || !prices.items.length) return;
    var items = prices.items.filter(function (p) {
      return (!priceState.platform || p.platform.indexOf(priceState.platform) >= 0)
        && (!priceState.officialOnly || officialPrice(p));
    });
    var plats = [];
    prices.items.forEach(function (p) { if (plats.indexOf(p.platform) < 0) plats.push(p.platform); });
    var fhtml = '<div class="filter-row"><span class="filter-label">平台</span>'
      + '<label class="chip fchip' + (!priceState.platform ? " on" : "") + '"><input type="radio" name="pf" data-pf=""' + (!priceState.platform ? " checked" : "") + '>全部</label>'
      + plats.map(function (pl) {
        return '<label class="chip fchip' + (priceState.platform === pl ? " on" : "") + '"><input type="radio" name="pf" data-pf="' + esc(pl) + '"' + (priceState.platform === pl ? " checked" : "") + '>' + esc(pl) + "</label>";
      }).join("")
      + '<label class="chip fchip' + (priceState.officialOnly ? " on" : "") + '"><input type="checkbox" data-pofficial' + (priceState.officialOnly ? " checked" : "") + '>只看官方店/直营</label></div>';
    $("#priceFilter").innerHTML = fhtml;
    $all("#priceFilter input[name=pf]").forEach(function (inp) {
      inp.addEventListener("change", function () { priceState.platform = inp.getAttribute("data-pf"); renderPrices(); });
    });
    var po = $("#priceFilter input[data-pofficial]");
    if (po) po.addEventListener("change", function () { priceState.officialOnly = po.checked; renderPrices(); });

    var allKg = prices.items.map(effectiveKgPrice).filter(Boolean);
    var officialCount = prices.items.filter(officialPrice).length;
    var checkedToday = prices.items.filter(function (p) { return p.checkedAt === prices.updatedAt; }).length;
    var lowGroupCount = Object.keys(prices.lowestByGroup || {}).length;
    var materialGroupCount = prices.items.reduce(function (seen, p) {
      seen[p.brand + "|" + p.material] = true;
      return seen;
    }, {});
    var sumHtml = '<div class="price-coverage"><div><b>' + prices.items.length + '</b><span>价格记录</span></div><div><b>' + officialCount + '</b><span>官方店铺记录</span></div><div><b>' + checkedToday + '</b><span>当前官方页复核</span></div><div><b>' + allKg.length + '</b><span>可比每kg价</span></div></div>'
      + '<p class="price-note">低价覆盖：' + lowGroupCount + '/' + Object.keys(materialGroupCount).length + ' 个品牌×材料组合；更新时间：' + esc(prices.updatedAt) + '。</p>';
    var byBrand = {};
    prices.items.forEach(function (p) {
      var kg = effectiveKgPrice(p);
      if (!kg) return;
      if (!byBrand[p.brand]) byBrand[p.brand] = { sum: 0, n: 0, min: Infinity };
      byBrand[p.brand].sum += kg.value;
      byBrand[p.brand].n++;
      byBrand[p.brand].min = Math.min(byBrand[p.brand].min, kg.value);
    });
    var ranked = Object.keys(byBrand).map(function (b) {
      return { brand: b, avg: byBrand[b].sum / byBrand[b].n, min: byBrand[b].min, n: byBrand[b].n };
    }).sort(function (a, b) { return a.avg - b.avg; });
    sumHtml += '<div class="price-sum-title">🏆 性价比品牌排行（每kg价已数值化，仅统计≥2 个可比样本）</div><div class="price-rank">'
      + ranked.filter(function (r) { return r.n >= 2; }).slice(0, 5).map(function (r, i) {
        return '<div class="price-rank-item"><span class="rank-no">' + (i + 1) + "</span><b>" + esc(r.brand) + "</b><span class='rank-min'>最低 ¥" + money(r.min) + "/kg</span><span class='rank-avg'>均价 ¥" + money(r.avg) + "/kg</span></div>";
      }).join("")
      + "</div>";
    if (prices.summary) sumHtml += '<p class="price-note">📚 调研时间与数据口径等详见<a href="#" data-openmethod>数据说明 → 价格调研说明</a></p>';
    $("#priceSummary").innerHTML = sumHtml;

    var byMat = {};
    items.forEach(function (p) {
      var kg = effectiveKgPrice(p);
      if (!kg) return;
      if (!byMat[p.material]) byMat[p.material] = [];
      byMat[p.material].push({ brand: p.brand, kg: kg.value, derived: kg.derived });
    });
    var matOrder = ["PLA", "PLA+", "PETG", "ABS", "ASA", "TPU 95A", "PLA-CF", "PETG-CF", "PA-CF", "ABS+", "PA", "PPA-CF", "PC-CF", "PC-GF", "PA-GF"];
    var rangeHtml = '<div class="price-ranges">';
    matOrder.forEach(function (mat) {
      var list = (byMat[mat] || []).slice().sort(function (a, b) { return a.kg - b.kg; });
      if (!list.length) return;
      var min = list[0], max = list[list.length - 1], uniq = [];
      list.forEach(function (x) { if (!uniq.some(function (u) { return u.brand === x.brand; })) uniq.push(x); });
      rangeHtml += '<div class="price-range-card"><div class="pr-mat">' + esc(mat) + '</div>'
        + '<div class="pr-range">¥' + money(min.kg) + ' – ¥' + money(max.kg) + '<span class="pr-per">/kg</span></div>'
        + '<div class="pr-brands">' + uniq.map(function (x) {
          return '<span class="pr-brand' + (x === min ? " pr-low" : "") + (x.derived ? " pr-derived" : "") + '">' + esc(x.brand) + " ¥" + money(x.kg) + (x.derived ? "*" : "") + "</span>";
        }).join("") + "</div></div>";
    });
    rangeHtml += "</div>";
    var rangeBox = document.getElementById("priceRanges");
    if (rangeBox) rangeBox.innerHTML = rangeHtml || '<p class="hint">当前筛选没有可比较的每kg价格。</p>';

    /* ---- 每kg价格分布速览：同材料各品牌一图定位（纯 DOM 一次性渲染，无循环开销） ---- */
    var distBox = document.getElementById("priceDist");
    if (distBox) {
      var rows = "";
      matOrder.forEach(function (mat) {
        var list = (byMat[mat] || []).slice().sort(function (a, b) { return a.kg - b.kg; });
        if (list.length < 2) return;
        var min = list[0].kg, max = list[list.length - 1].kg, span = (max - min) || 1;
        var seen = {};
        var dots = list.map(function (x) {
          var pos = 4 + ((x.kg - min) / span) * 92; /* 留 4% 边距防出界 */
          var isMin = x.kg === min;
          var key = x.brand + "|" + x.kg;
          var dup = seen[key]; seen[key] = true;
          return '<span class="pd-dot' + (isMin ? " pd-low" : "") + (x.derived ? " pd-derived" : "") + '" style="left:' + pos.toFixed(1) + '%' + (dup ? ';top:26%' : '') + '" title="' + esc(x.brand) + ' ¥' + money(x.kg) + '/kg' + (x.derived ? "（折算）" : "") + (isMin ? " · 当前最低" : "") + '"></span>';
        }).join("");
        rows += '<div class="pd-row"><div class="pd-name">' + esc(mat) + '</div>'
          + '<div class="pd-track">' + dots + '</div>'
          + '<div class="pd-scale"><span>¥' + money(min) + '/kg</span><span>¥' + money(max) + '/kg</span></div></div>';
      });
      distBox.innerHTML = rows || '<p class="hint">当前筛选下没有可比较的每kg价格（需同一材料至少 2 个样本）。</p>';
    }

    function recDate(p) {
      if (p.recordedAt) return p.recordedAt;
      if (!p.note) return "";
      var m = p.note.match(/(20\d{2})[-年](\d{1,2})[-月](\d{1,2})/);
      return m ? m[1] + "-" + ("0" + m[2]).slice(-2) + "-" + ("0" + m[3]).slice(-2) : "";
    }
    var head = "<tr><th class='th-watch' title='收藏关注，降价提醒'>★</th><th data-pk='brand'>品牌</th><th data-pk='material'>材料</th><th data-pk='platform'>平台</th><th data-pk='dealPrice'>到手价 ¥</th><th data-pk='pricePerKg'>每kg ¥</th><th data-pk='listPrice'>原价/划线 ¥</th><th data-pk='lowestPrice'>史低/近90天低价 ¥/kg</th><th>记录</th><th>优惠</th><th>来源</th></tr>";
    var body = items.map(function (p) {
      var deal = priceNumber(p.dealPrice), list = priceNumber(p.listPrice), lowInfo = (prices.lowestByGroup || {})[p.brand + "|" + p.material], low = effectiveLowestPrice(p, lowInfo), kg = effectiveKgPrice(p);
      var dealCell = deal != null ? money(deal) : list != null ? '<span class="price-fallback" title="未记录活动价，使用官方挂牌价">挂牌 ' + money(list) + "</span>" : missingPrice("官方未披露到手价");
      var kgCell = kg ? (kg.derived ? '<span class="price-derived" title="按商品标题中的明确克重折算">' + money(kg.value) + "*</span>" : money(kg.value)) : missingPrice("商品规格或每kg价格未核实");
      /* A3 关注收藏：记录档价格=到手价→挂牌价→史低→每kg折算 */
      var wCur = deal != null ? deal : (list != null ? list : (low ? low.value : (kg ? kg.value : null)));
      var wKeyRaw = p.brand + "|" + p.material + "|" + (p.platform || "");
      var watched = !!watch[wKeyRaw];
      var starTd = '<td class="watch-cell">' + (wCur == null
        ? '<button type="button" class="watch-star" disabled title="该记录无价格，无法收藏" aria-label="无法收藏">☆</button>'
        : '<button type="button" class="watch-star' + (watched ? " on" : "") + '" data-wkey="' + esc(wKeyRaw) + '" data-wprice="' + wCur + '" title="' + (watched ? "已关注 · 点击取消（降价提醒）" : "收藏关注，降价时提醒") + '" aria-label="' + (watched ? "取消关注" : "收藏关注") + '">' + (watched ? "★" : "☆") + "</button>") + "</td>";
      var listCell = list != null
        ? money(list) + (p.listPriceBasis ? '<small class="price-low-meta" title="' + esc(p.listPriceBasis) + '">依据</small>' : "")
        : missingPrice("官方未披露原价");
      var source = p.url ? '<a href="' + esc(p.url) + '" target="_blank" rel="noopener" title="' + esc(p.productName || "打开来源") + '">查看</a>' : '<span class="na">无链接</span>';
      var date = recDate(p) || "—";
      var dateCell = '<span class="price-date">' + esc(date) + '</span>' + (p.checkedAt
        ? ' <span class="price-verified" title="官方商品页复核日期：' + esc(p.checkedAt) + '">✓</span>'
        : ' <span class="price-history" title="历史促销快照，仅供参考，不代表当前实时价格">历史</span>');
      return '<tr>' + starTd + '<td><b>' + esc(p.brand) + "</b></td><td>" + esc(p.material) + "</td><td>" + esc(p.platform) + "</td>"
        + "<td><b>" + dealCell + "</b></td><td>" + kgCell + "</td>"
        + "<td>" + listCell + "</td>"
        + '<td class="cell-best">' + (low != null ? money(low.value) + '/kg<small class="price-low-meta" title="' + esc(low.note || (lowInfo && lowInfo.note) || "历史低价参考") + '">' + esc(low.basis) + '<br>记录 ' + esc(low.date) + ' · 更新 ' + esc((lowInfo && lowInfo.updatedAt) || prices.updatedAt) + '</small>' : missingPrice("未记录到史低或近90天最低价")) + "</td>"
        + "<td>" + dateCell + "</td><td>" + esc(p.discount || "—") + "</td><td>" + source + "</td></tr>";
    }).join("");
    $("#priceTable").innerHTML = '<table class="data-table price-table table-sticky-first"><thead>' + head + "</thead><tbody>" + (body || '<tr><td colspan="11" class="price-empty">当前筛选下暂无价格记录——换个平台或清除筛选试试</td></tr>') + "</tbody></table>";
    refreshWatchStars();
    renderWatchBar();
    bindWatchUI();
    var pk = null, dir = 1;
    $all("#priceTable th[data-pk]").forEach(function (th) {
      th.setAttribute("tabindex", "0"); th.setAttribute("role", "button"); th.addEventListener("click", function () {
        var k = th.getAttribute("data-pk"), tbody = $("#priceTable tbody"), rows = Array.prototype.slice.call(tbody.rows);
        if (pk === k) dir *= -1; else { pk = k; dir = 1; }
        var idx = Array.prototype.indexOf.call(th.parentNode.cells, th), numeric = ["listPrice", "dealPrice", "pricePerKg", "lowestPrice"].indexOf(k) >= 0;
        rows.sort(function (a, b) {
          var av = a.cells[idx].textContent.trim(), bv = b.cells[idx].textContent.trim();
          if (numeric) {
            var an = parseFloat(av.replace(/[^0-9.-]/g, "")), bn = parseFloat(bv.replace(/[^0-9.-]/g, ""));
            if (isNaN(an)) return 1;
            if (isNaN(bn)) return -1;
            return (an - bn) * dir;
          }
          return av.localeCompare(bv, "zh") * dir;
        });
        rows.forEach(function (r) { tbody.appendChild(r); });
      });
    });
    if (rangeBox && items.some(function (p) { var x = effectiveKgPrice(p); return x && x.derived; })) {
      rangeBox.insertAdjacentHTML("afterend", '<p class="hint price-derived-note">* 每kg价由商品标题中明确标注的克重折算，未明确规格的商品仍保留“未披露”。</p>');
    }
  }

  /* ---------- 品牌专区 ---------- */
  function renderBrands() {
    var html = DATA.brands.map(function (b) {
      return '<article class="brand-card">'
        + '<div class="brand-top"><div class="brand-avatar">' + esc(b.icon || "🏷️") + "</div>"
        + "<div><h3>" + esc(b.nameCn) + "<small>" + esc(b.nameEn) + "</small></h3>"
        + '<div class="brand-hq">📍 ' + esc(b.hq) + "</div></div></div>"
        + '<div class="brand-rep">' + esc(b.reputation) + "</div>"
        + '<div class="brand-flagship">⭐ 旗舰/特色：' + esc(b.flagship) + "</div>"
        + '<div class="brand-mats">' + b.materials.map(function (mn) { return '<span class="bm">' + esc(mn) + "</span>"; }).join("") + "</div>"
        + '<a class="brand-link" href="' + esc(b.url) + '" target="_blank" rel="noopener">访问官网 ↗</a>'
        + "</article>";
    }).join("");
    $("#brandGrid").innerHTML = html;
  }

  /* ---------- 安全表 ---------- */
  function renderSafety() {
    var rows = allMaterials().map(function (m) {
      var cls = "safety-" + m.safetyLevel;
      return '<tr data-mat="' + m.id + '" style="cursor:pointer">'
        + '<td><span class="dot" style="background:' + (m.color || "#4f9cf9") + '"></span><b>' + esc(m.nameCn) + "</b></td>"
        + '<td>' + esc(m.fumes || "—") + "</td>"
        + '<td>' + (m.printTemp ? m.printTemp[0] + "–" + m.printTemp[1] : "—") + " ℃</td>"
        + '<td><span class="tag ' + cls + '">' + SAFETY_LABEL[m.safetyLevel] + "</span></td>"
        + '<td>' + (m.enclosure === "必需" ? "✅ 必需" : m.enclosure === "建议" ? "🟡 建议" : "⚪ 不需要") + "</td>"
        + '<td>' + (m.drying || "—") + "</td>"
        + "</tr>"
        + '<tr class="safety-detail" data-detail="' + m.id + '" style="display:none"><td colspan="6"><div class="safety-row-detail"><b>释放物：</b>' + esc(m.fumes || "—")
        + "　<b>安全说明：</b>" + esc(m.safetyNote) + "</div></td></tr>";
    }).join("");
    $("#safetyTable").innerHTML = '<div class="table-scroll"><table class="data-table table-sticky-first"><thead><tr>'
      + "<th>材料</th><th>主要释放物</th><th>打印温度</th><th>安全等级</th><th>封闭腔体</th><th>干燥建议</th></tr></thead>"
      + "<tbody>" + rows + "</tbody></table></div>";
    $all('#safetyTable tr[data-mat]').forEach(function (tr) {
      tr.addEventListener("click", function () {
        var id = tr.getAttribute("data-mat");
        var dt = $('tr.safety-detail[data-detail="' + id + '"]');
        if (dt) dt.style.display = dt.style.display === "none" ? "" : "none";
      });
    });
  }

  /* ---------- 数据说明 ---------- */
  function corrCard(c) {
    return '<div class="correction"><b>【' + esc(c.date) + "】" + esc(c.item) + "</b><br>问题：" + esc(c.issue)
      + '<br><span class="corr-fix">矫正：' + esc(c.fix) + "</span></div>";
  }
  function renderMethod() {
    var corr = DATA.meta.corrections || [];
    if (corr.length) {
      /* 最近一条完整显示，其余折叠 */
      var latest = corr[corr.length - 1];
      var older = corr.slice(0, -1).slice().reverse();
      $("#correctionLog").innerHTML =
        '<div class="corr-latest-label">🆕 最近矫正</div>'
        + corrCard(latest)
        + (older.length
          ? '<details class="corr-more"><summary>📜 历史矫正记录（' + older.length + " 条，点击展开）</summary>"
            + older.map(corrCard).join("") + "</details>"
          : "");
    } else {
      $("#correctionLog").innerHTML = '<p style="color:var(--v2-faint);font-size:13px">暂无矫正记录</p>';
    }
    $("#sourceList").innerHTML = DATA.meta.sources.map(function (s) {
      return "<li>" + esc(s.name) + " — <a href='" + esc(s.url) + "' target='_blank' rel='noopener'>" + esc(s.url) + "</a></li>";
    }).join("");
    $("#dataUpdated").textContent = DATA.meta.updatedAt;
    var pr = $("#priceResearch");
    if (pr) {
      var prices = DATA.meta.prices;
      if (prices && prices.summary) {
        pr.innerHTML = '<div class="legal"><p>' + esc(prices.summary) + "</p></div>";
      }
    }
  }


  /* ---------- A3 价格关注 + 降价提醒 ---------- */
  var watchLimit = 20;
  var watch = {};
  var watchNotified = {};
  function watchToday() {
    var d = new Date();
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }
  function loadWatch() { try { var raw = localStorage.getItem("fd-watch"); watch = raw ? JSON.parse(raw) : {}; } catch (e) { watch = {}; } }
  function saveWatch() { try { if (Object.keys(watch).length) localStorage.setItem("fd-watch", JSON.stringify(watch)); else localStorage.removeItem("fd-watch"); } catch (e) { /* ignore */ } }
  function watchKeyOf(p) { return p.brand + "|" + p.material + "|" + (p.platform || ""); }
  function watchRowPrice(p) {
    var pr = DATA.meta.prices || {};
    var deal = priceNumber(p.dealPrice), list = priceNumber(p.listPrice);
    if (deal != null) return deal;
    if (list != null) return list;
    var lowInfo = (pr.lowestByGroup || {})[p.brand + "|" + p.material];
    var low = effectiveLowestPrice(p, lowInfo);
    if (low && low.value != null) return low.value;
    var kg = effectiveKgPrice(p);
    return kg ? kg.value : null;
  }
  function refreshWatchStars() {
    $all("#priceTable .watch-star").forEach(function (b) {
      var k = b.getAttribute("data-wkey");
      var on = k ? !!watch[k] : false;
      b.classList.toggle("on", on);
      b.textContent = on ? "★" : "☆";
    });
  }
  function renderWatchBar() {
    var bar = $("#priceWatch");
    if (!bar) return;
    var keys = Object.keys(watch);
    if (!keys.length) { bar.style.display = "none"; return; }
    bar.style.display = "flex";
    var pr = DATA.meta.prices || {};
    var itemsHtml = "", changed = false;
    keys.forEach(function (key) {
      var parts = key.split("|");
      var label = (parts[1] || "") + " · " + (parts[0] || "") + (parts[2] ? " · " + parts[2] : "");
      var cur = null;
      (pr.items || []).forEach(function (p) {
        if (watchKeyOf(p) === key) { var v = watchRowPrice(p); if (v != null && (cur == null || v < cur)) cur = v; }
      });
      var w = watch[key];
      var last = w && w.price;
      var delta = (cur != null && last != null) ? cur - last : null;
      /* 降价提醒：同会话同条目只提醒一次；提醒后以当前价为新基准 */
      if (cur != null && last != null && cur < last - 0.005 && !watchNotified[key]) {
        watchNotified[key] = true;
        w.price = cur; w.date = watchToday(); changed = true;
        toast("📉 " + label + " 降价至 ¥" + money(cur) + "（较关注时 -¥" + money(last - cur) + "）");
      }
      var arrow = delta == null ? "—" : (delta < -0.005 ? "▼ " : delta > 0.005 ? "▲ " : "＝");
      var cls = delta != null && delta < -0.005 ? " down" : (delta != null && delta > 0.005 ? " up" : "");
      itemsHtml += '<div class="watch-item' + cls + '" data-key="' + esc(key) + '" data-cur="' + (cur == null ? "" : cur) + '">'
        + "<b>" + esc(label) + "</b>"
        + '<span class="w-now">¥' + money(cur == null ? (last == null ? 0 : last) : cur) + "</span>"
        + '<span class="w-delta">' + arrow + "</span>"
        + '<span class="w-date">' + esc((w && w.date) || "") + "</span>"
        + '<button type="button" class="w-refresh" title="以当前价更新记录">↻</button>'
        + '<button type="button" class="w-del" title="取消关注">✕</button></div>';
    });
    if (changed) saveWatch();
    bar.innerHTML = '<span class="watch-title">🔔 关注</span>' + itemsHtml;
  }
  function bindWatchUI() {
    if (bindWatchUI.bound) return;
    bindWatchUI.bound = true;
    var bar = $("#priceWatch");
    if (bar) bar.addEventListener("click", function (e) {
      var it = e.target.closest ? e.target.closest(".watch-item") : null;
      if (!it) return;
      var key = it.getAttribute("data-key");
      if (!e.target.classList.contains("w-del") && !e.target.classList.contains("w-refresh")) {
        var _row = document.querySelector('#priceTable .watch-star[data-wkey="' + key.replace(/"/g, "") + '"]');
        var _tr = _row ? _row.closest("tr") : null;
        if (_tr) {
          _tr.scrollIntoView({ behavior: "smooth", block: "center" });
          _tr.classList.remove("row-flash");
          void _tr.offsetWidth;
          _tr.classList.add("row-flash");
          return;
        }
        toast("该关注项不在当前筛选结果里（试试清除筛选）");
      }
      if (e.target.classList.contains("w-del")) {
        delete watch[key]; delete watchNotified[key]; saveWatch(); renderWatchBar(); refreshWatchStars();
        toast("已取消关注");
      } else if (e.target.classList.contains("w-refresh")) {
        var cur = parseFloat(it.getAttribute("data-cur"));
        if (isFinite(cur) && cur > 0) { watch[key] = { price: cur, date: watchToday() }; saveWatch(); renderWatchBar(); toast("已更新为当前价"); }
      }
    });
    var pt = $("#priceTable");
    if (pt) pt.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest(".watch-star") : null;
      if (!b) return;
      var key = b.getAttribute("data-wkey");
      var price = parseFloat(b.getAttribute("data-wprice"));
      if (!isFinite(price) || price <= 0) { toast("⚠️ 该记录无价格，无法收藏关注"); return; }
      var label = key.split("|")[1];
      if (watch[key]) {
        delete watch[key]; delete watchNotified[key]; saveWatch(); renderWatchBar(); refreshWatchStars();
        toast("已取消关注：" + label);
      } else {
        if (Object.keys(watch).length >= watchLimit) { toast("⚠️ 关注最多 20 条，请先取消一些"); return; }
        watch[key] = { price: price, date: watchToday() };
        saveWatch(); renderWatchBar(); refreshWatchStars();
        toast("🔔 已关注 " + label + "，当前 ¥" + money(price) + "，降价会提醒");
      }
    });
  }

  /* ---------- A2 用量成本计算器 ---------- */
  function matMinKgPrice(materialName) {
    var prices = DATA.meta.prices;
    if (!prices || !prices.items) return null;
    var min = null;
    prices.items.forEach(function (p) {
      if (p.material !== materialName) return;
      var kg = effectiveKgPrice(p);
      if (kg && (min == null || kg.value < min)) min = kg.value;
    });
    return min;
  }
  function renderCostCalc() {
    var sel = $("#ccMat");
    if (!sel) return;
    /* 材料下拉（按分区分组） */
    var html = "";
    DATA.zones.forEach(function (z) {
      html += '<optgroup label="' + esc(z.nameCn) + '">'
        + z.materials.map(function (m) { return '<option value="' + m.id + '">' + esc(m.nameCn) + " · " + esc(m.nameEn) + "</option>"; }).join("")
        + "</optgroup>";
    });
    sel.innerHTML = html;
    var gm = $("#ccGrams"), vm = $("#ccVolume"), pm = $("#ccPrice"), res = $("#ccResult"), hint = $("#ccHint");
    function density() { var m = matById(sel.value); var d = m && m.density ? mid(m.density) : null; return d || 0; }
    function compute() {
      var g = parseFloat(gm.value), v = parseFloat(vm.value), price = parseFloat(pm.value);
      var gv = (!isNaN(g) && g > 0) ? g : ((!isNaN(v) && v > 0 && density() > 0) ? v * density() : NaN);
      if (isNaN(gv) || gv <= 0 || isNaN(price) || price <= 0) { res.textContent = "—"; return; }
      res.textContent = "≈ ¥" + money(gv / 1000 * price);
    }
    sel.addEventListener("change", function () {
      var m = matById(sel.value);
      var kg = m ? matMinKgPrice(m.nameCn) : null;
      if (kg != null) {
        pm.value = kg.toFixed(0) * 1;
        hint.textContent = "单价已取全库可比每kg最低价 ¥" + money(kg) + "/kg（可手动修改）";
      } else {
        pm.value = "";
        hint.textContent = "该材料暂无可比价——手动填入单价即可估算";
      }
      gm.value = ""; vm.value = "";
      compute();
    });
    ["input", "change"].forEach(function (ev) {
      [gm, vm, pm].forEach(function (inp) {
        inp.addEventListener(ev, function () {
          if (inp === gm && gm.value) vm.value = "";
          if (inp === vm && vm.value) gm.value = "";
          compute();
        });
      });
    });
    if (sel.options.length) { sel.value = "pla"; sel.dispatchEvent(new Event("change")); }
  }

  /* ============================================================
   * SPA 路由：主页 + 二级模块（进入才渲染，返回不销毁）
   * ============================================================ */
  var modInited = {};
  var MODULES = {
    "zone-standard": { title: "🧱 常规耗材", init: function () {
      renderFilterBar(DATA.zones[0]); bindFilterEvents(DATA.zones[0]); renderMaterials(); bindCollapse();
    } },
    "zone-engineering": { title: "🏗️ 工程耗材", init: function () {
      renderFilterBar(DATA.zones[1]); bindFilterEvents(DATA.zones[1]); renderMaterials(); bindCollapse();
    } },
    "compare": { title: "⚖️ 数据对比", init: function () {
      renderCmpChips(); renderCompareCharts(); renderTable();
    } },
    "insights": { title: "🔬 性能洞察", init: function () { renderScatter(); } },
    "brands": { title: "🏷️ 品牌专区", init: function () { renderBrands(); renderBrandMatrix(); } },
    "prices": { title: "💰 价格情报", init: function () { renderPrices(); renderCostCalc(); } },
    "safety": { title: "🛡️ 安全指南", init: function () { renderSafety(); } }
  };
  var currentModule = null;
  /* 桌面导航当前模块高亮（移动端由 tabbar active 承担） */
  function setNavActive(id) {
    $all(".nav a").forEach(function (a) {
      var on = id ? a.getAttribute("href") === "#/" + id : a.hasAttribute("data-home");
      a.classList.toggle("on", !!on);
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }
  function goHome() {
    currentModule = null;
    setNavActive(null);
    if (typeof setTab === "function") setTab("home");
    $("#moduleViews").style.display = "none";
    $("#moduleTopbar").style.display = "none";
    $all(".module").forEach(function (m) { m.style.display = "none"; });
    $all(".hero, #overview, #appgrid").forEach(function (el) { el.style.display = ""; });
    if (location.hash && location.hash.indexOf("#/") === 0) {
      try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { location.hash = ""; }
    }
    window.scrollTo(0, 0);
  }
  function navigateModule(id) {
    var mod = MODULES[id];
    if (!mod) { goHome(); return; }
    /* F2 修复：已在当前模块时重复点击 → 明确反馈（Toast + 平滑回模块顶部），不再静默无响应 */
    if (currentModule === id && modInited[id]) {
      if (window.scrollY > 0) {
        var mvEl = $("#moduleViews");
        if (mvEl) {
          var rect = mvEl.getBoundingClientRect();
          window.scrollTo({ top: Math.max(0, window.scrollY + rect.top - 108), behavior: "smooth" });
        }
      }
      toast("📍 已在此页：" + mod.title.replace(/^[^\s]+\s*/, ""));
      return;
    }
    if (location.hash !== "#/" + id) {
      try { history.replaceState(null, "", location.pathname + location.search + "#/" + id); } catch (e) { location.hash = "/" + id; }
    }
    if (!modInited[id]) { mod.init(); modInited[id] = true; }
    setNavActive(id);
    $all(".hero, #overview, #appgrid").forEach(function (el) { el.style.display = "none"; });
    $("#moduleViews").style.display = "block";
    $("#moduleTopbar").style.display = "block";
    $("#moduleCrumb").textContent = "首页 / " + mod.title;
    $all(".module").forEach(function (m) { m.style.display = m.getAttribute("data-module") === id ? "block" : "none"; });
    /* 模块切换入场过渡：一次性动画，reduced-motion 下由 CSS 关闭 */
    var active = $('.module[data-module="' + id + '"]');
    if (active) {
      active.classList.remove("module-enter");
      void active.offsetWidth; /* 重启动画 */
      active.classList.add("module-enter");
    }
    currentModule = id;
    if (typeof setTab === "function") setTab(id);
    window.scrollTo(0, 0);
  }
  /* ---------- 移动端交互：Tab / 抽屉 / 筛选面板 ---------- */
  function setTab(id) {
    $all("#mobileTabbar .tab-item").forEach(function (b) {
      var t = b.getAttribute("data-tab");
      b.classList.toggle("active", t === id);
    });
  }
  function closeDrawer() {
    $("#moreDrawer").style.display = "none";
    $("#drawerMask").style.display = "none";
  }
  function openDrawer() {
    $("#moreDrawer").style.display = "block";
    $("#drawerMask").style.display = "block";
  }
  function bindMobileUI() {
    var tb = $("#mobileTabbar");
    if (!tb) return;
    $all(".tab-item", tb).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var t = btn.getAttribute("data-tab");
        if (t === "home") { goHome(); setTab("home"); }
        else if (t) { navigateModule(t); setTab(t); }
        else if (btn.id === "tabMore") { openDrawer(); }
      });
    });
    $("#drawerClose").addEventListener("click", closeDrawer);
    $("#drawerMask").addEventListener("click", closeDrawer);
    /* 抽屉内模块按钮（data-mod 已由 bindRouter 绑定，这里补 drawer 关闭） */
    $all("#moreDrawer [data-mod], #moreDrawer [data-openmethod]").forEach(function (b) {
      b.addEventListener("click", closeDrawer);
    });
    /* 筛选折叠（手机）：filter-bar 加筛选按钮 */
    document.addEventListener("click", function (e) {
      var tg = e.target.closest ? e.target.closest(".filter-toggle") : null;
      if (tg) {
        var row = tg.parentNode && tg.parentNode.nextElementSibling;
        if (row) {
          row.classList.toggle("open");
          tg.classList.toggle("on");
        }
      }
    });
    /* Tab 与路由同步 */
    var origGo = goHome, origNav = navigateModule;
    goHome = function () { origGo(); setTab("home"); };
    navigateModule = function (id) { origNav(id); setTab(id); };
    setTab(currentModule || "home");
  }

  function bindRouter() {
    $all("[data-mod]").forEach(function (btn) {
      btn.addEventListener("click", function () { navigateModule(btn.getAttribute("data-mod")); });
    });
    $all("[data-home]").forEach(function (btn) {
      btn.addEventListener("click", function (e) { e.preventDefault(); goHome(); });
    });
    /* F2 修复：顶部导航的路由锚点改为统一走 navigateModule，
     * 让"重复点击当前模块"也能获得明确反馈（不再依赖 hash 变化才触发跳转） */
    $all(".nav a[href^='#/']").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        navigateModule(a.getAttribute("href").slice(2));
      });
    });
    window.addEventListener("hashchange", function () {
      var h = location.hash;
      if (h && h.indexOf("#/") === 0) navigateModule(h.slice(2));
      else goHome();
    });
    var h = location.hash;
    if (h && h.indexOf("#/") === 0) navigateModule(h.slice(2));
  }

  /* ---------- 鼠标跟随柔光（单层聚焦 + 静止自动淡出） ----------
   * 设计要点：
   * - 只保留一个 300px 聚焦光晕，去掉双光斑分离（360px+680px 的"手电筒"感是难看主因）；
   * - 移动时淡入、静止 1.2s 自动淡出（opacity 走 CSS transition，rAF 只改 transform）；
   * - lerp 0.14 平滑跟手、不拖尾；reduced-motion / 触屏 / 低功耗设备自动关闭。
   */
  function bindCursorLight() {
    var glow = $("#glowLayer");
    if (!glow || document.body.classList.contains("perf-lite")) return;
    var finePointer = window.matchMedia && window.matchMedia("(hover:hover) and (pointer:fine)");
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || (finePointer && !finePointer.matches)) return;

    var targetX = window.innerWidth * 0.5;
    var targetY = window.innerHeight * 0.42;
    var curX = targetX;
    var curY = targetY;
    var frameId = 0;
    var moving = false;
    var hideTimer = 0;
    var setPosition = function () {
      var root = document.documentElement;
      root.style.setProperty("--mx", curX.toFixed(1) + "px");
      root.style.setProperty("--my", curY.toFixed(1) + "px");
    };
    var step = function () {
      frameId = 0;
      curX += (targetX - curX) * 0.14;
      curY += (targetY - curY) * 0.14;
      setPosition();
      if (Math.max(Math.abs(targetX - curX), Math.abs(targetY - curY)) > 0.3) {
        moving = true;
        frameId = window.requestAnimationFrame(step);
      } else {
        moving = false;
      }
    };
    var onMove = function (e) {
      if (e.pointerType && e.pointerType !== "mouse") return;
      targetX = e.clientX;
      targetY = e.clientY;
      if (!glow.classList.contains("on")) glow.classList.add("on");
      clearTimeout(hideTimer);
      hideTimer = setTimeout(function () { glow.classList.remove("on"); }, 1200);
      if (!moving) {
        moving = true;
        frameId = window.requestAnimationFrame(step);
      }
    };
    setPosition();
    window.addEventListener("pointermove", onMove, { passive: true });
  }

  /* ---------- A1 打印机设置弹窗 ---------- */
  function openPrinterModal() {
    var pm = $("#printerModal");
    if (!pm) return;
    var p = PRINTER || { nozzle: 260, bed: 100, chamber: false, dryer: true, maxDiff: 0 };
    $("#prNozzle").value = p.nozzle;
    $("#prBed").value = p.bed;
    $("#prChamber").checked = !!p.chamber;
    $("#prDryer").checked = !!p.dryer;
    $("#prDiff").value = p.maxDiff || 0;
    pm.style.display = "flex";
    document.body.style.overflow = "hidden";
    var nz = $("#prNozzle");
    if (nz) nz.focus();
  }
  function closePrinterModal() {
    var pm = $("#printerModal");
    if (pm) pm.style.display = "none";
    document.body.style.overflow = "";
  }
  function applyPrinterToZones() {
    /* 设备配置变化 → 两个分区页的筛选条与材料卡全部按新设备重算 */
    DATA.zones.forEach(function (z) {
      if (filterState[z.id] && PRINTER === null) filterState[z.id].fitOnly = false;
      renderFilterBar(z);
      bindFilterEvents(z);
      renderMaterials(z);
    });
  }
  function savePrinterFromModal() {
    var n = parseInt($("#prNozzle").value, 10);
    var b = parseInt($("#prBed").value, 10);
    if (isNaN(n) || n < 150 || n > 600) {
      toast("⚠️ 最高喷嘴温度需填 150–600℃ 之间的数值");
      return;
    }
    if (isNaN(b)) b = 0;
    b = Math.max(0, Math.min(300, b));
    var p = {
      nozzle: n,
      bed: b,
      chamber: $("#prChamber").checked,
      dryer: $("#prDryer").checked,
      maxDiff: parseInt($("#prDiff").value, 10) || 0
    };
    savePrinter(p);
    closePrinterModal();
    applyPrinterToZones();
    toast("🖨️ 打印机已保存：喷嘴 " + n + "℃ / 热床 " + (b ? b + "℃" : "不加热") + (p.chamber ? " / 有腔体" : "") + (p.dryer ? "" : " / 无干燥"));
  }
  function clearPrinterFromModal() {
    savePrinter(null);
    closePrinterModal();
    applyPrinterToZones();
    toast("已清除打印机配置");
  }

  /* ---------- 初始化 ---------- */
  function init() {
    loadPrinter(); /* A1：恢复设备配置（若存在） */
    loadWatch();   /* A3：恢复价格关注列表 */
    /* 低功耗设备自动关闭高成本玻璃层，保留结构与色彩。
     * 2026-09-08 放宽中端判定：卡片 backdrop-filter 已移除，页面整体合成压力大降，
     * 极光动画（纯 transform 合成层）与鼠标光晕可以安全地在更多设备上保留。 */
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var lowPower = !!(conn && conn.saveData)
      || (navigator.deviceMemory && navigator.deviceMemory <= 2)
      || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);
    if (lowPower) document.body.classList.add("perf-lite");
    else if ((navigator.deviceMemory && navigator.deviceMemory <= 4)
      || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)) {
      /* 低端设备：停背景动画与鼠标光晕（perf-mid） */
      document.body.classList.add("perf-mid");
    }
    bindCursorLight();
    /* 卡片局部光：事件委托 + 坐标缓存。
     * 原实现每次 mousemove 都 getBoundingClientRect()（强制布局读取）；
     * 现改为进入卡片时缓存一次页面坐标，滚动不失效，移动期间零布局读取。 */
    var CARD_SEL = ".mat-card,.zone-card,.dim-card,.brand-card,.guide-card,.col";
    document.addEventListener("mousemove", function (e) {
      var t = e.target;
      var card = t && t.closest ? t.closest(CARD_SEL) : null;
      if (card) {
        if (!card._spotPage) {
          var r = card.getBoundingClientRect();
          card._spotPage = { left: r.left + (window.pageXOffset || 0), top: r.top + (window.pageYOffset || 0) };
        }
        card.style.setProperty("--cx", (e.pageX - card._spotPage.left) + "px");
        card.style.setProperty("--cy", (e.pageY - card._spotPage.top) + "px");
      }
    }, { passive: true });
    document.addEventListener("mouseout", function (e) {
      var card = e.target && e.target.closest ? e.target.closest(CARD_SEL) : null;
      if (!card) return;
      var to = e.relatedTarget;
      if (!to || !to.closest || to.closest(CARD_SEL) !== card) card._spotPage = null;
    }, { passive: true });
    /* ---- 视口外动画暂停：滚出屏幕的渐变标题/呼吸光晕/星光/按钮流光立即停帧 ---- */
    if ("IntersectionObserver" in window) {
      var animIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { en.target.classList.toggle("ao", !en.isIntersecting); });
      }, { rootMargin: "60px" });
      $all(".hero, .sec-title, .btn-primary").forEach(function (el) { animIO.observe(el); });
    }
    var qs = {};
    (window.location.search || "").replace(/[?&]([^=&]+)=([^&]*)/g, function (_, k, v) { qs[k] = v; });
    if (qs.sel) {
      cmpState.mats = String(qs.sel).split(",").map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 5);
    }
    if (qs.m) {
      var ks = String(qs.m).split(",").map(function (s) { return s.trim(); });
      var valid = METRICS.map(function (x) { return x.key; });
      cmpState.metrics = ks.filter(function (k) { return valid.indexOf(k) >= 0; });
      if (!cmpState.metrics.length) cmpState.metrics = [METRICS[0].key];
    }
    renderHero();
    renderZones();
    renderGuide();
    renderMethod();
    applyZoneQuery(); /* B3：进入前先从 URL 恢复分区筛选（须先于 bindRouter 的自动导航） */
    bindRouter();
    bindMobileUI();
    /* 3 问快筛 */
    $("#quizOpen").addEventListener("click", openQuiz);
    $("#quizClose").addEventListener("click", closeQuiz);
    $("#quizModal").addEventListener("click", function (e) { if (e.target === this) closeQuiz(); });
    $("#quizRun").addEventListener("click", quizPick);
    $all('#quizModal input[type="radio"]').forEach(function (r) {
      r.addEventListener("change", function () { quizAns[r.name.replace("quiz", "").toLowerCase()] = r.value; });
    });
    /* PWA：仅 https（线上）注册；本地 http/file 调试不注册，避免缓存干扰 */
    if ("serviceWorker" in navigator && location.protocol === "https:") {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("./sw.js").catch(function () { /* ignore */ });
      });
    }
    /* 主题切换：手动选择优先，否则跟随系统 */
    var tt = $("#themeToggle");
    var manualTheme = null;
    function applyTheme(t2, save) {
      document.documentElement.setAttribute("data-theme", t2);
      tt.textContent = t2 === "light" ? "🌙" : "☀️";
      if (save !== false) { try { localStorage.setItem("fd-theme", t2); } catch (e) { /* ignore */ } }
    }
    var saved = null;
    try { saved = localStorage.getItem("fd-theme"); } catch (e) { /* ignore */ }
    if (saved === "light" || saved === "dark") {
      manualTheme = saved;
      applyTheme(saved);
    } else {
      var sysLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
      applyTheme(sysLight ? "light" : "dark", false);
      if (window.matchMedia) {
        window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", function (e) {
          if (!manualTheme) applyTheme(e.matches ? "light" : "dark", false);
        });
      }
    }
    tt.addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      manualTheme = cur;
      applyTheme(cur);
    });
    /* 回到顶部：IO 哨兵驱动（滚动零监听、零逐帧计算） */
    var bt = $("#backTop");
    var sentinel = $("#backTopSentinel");
    if (sentinel && "IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        bt.style.display = entries[0].isIntersecting ? "none" : "block";
      }, { rootMargin: "0px 0px -2px 0px" }).observe(sentinel);
    } else {
      /* 兜底：极老浏览器走一次性 rAF 节流 */
      var scrollFrame = 0;
      window.addEventListener("scroll", function () {
        if (scrollFrame) return;
        scrollFrame = requestAnimationFrame(function () {
          scrollFrame = 0;
          bt.style.display = window.scrollY > 600 ? "block" : "none";
        });
      }, { passive: true });
    }
    bt.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    /* ---------- 捐赠/建议 ---------- */
    var donateAmt = null;
    function openDonate() { $("#donateModal").style.display = "flex"; document.body.style.overflow = "hidden"; rememberFocus(); var dc = $("#donateClose"); if (dc) dc.focus({ preventScroll: true }); }
    function closeDonate() { $("#donateModal").style.display = "none"; document.body.style.overflow = ""; restoreFocus(); }
    $all("[data-opendonate]").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.preventDefault(); /* F3 修复：避免 href="#" 残留并触发页面跳动 */
        openDonate();
      });
    });
    $("#donateClose").addEventListener("click", closeDonate);
    /* 微信/支付宝切换 */
    $all(".pay-tab").forEach(function (tb) {
      tb.addEventListener("click", function () {
        $all(".pay-tab").forEach(function (b) { b.classList.remove("on"); });
        tb.classList.add("on");
        var pay = tb.getAttribute("data-pay");
        var img = $("#donateQrImg");
        if (img) {
          img.src = "share/donate-" + pay + ".jpg";
          img.alt = (pay === "wechat" ? "微信" : "支付宝") + "收款码";
        }
        var pn = document.querySelector(".pay-name");
        if (pn) pn.textContent = pay === "wechat" ? "微信" : "支付宝";
      });
    });
    $("#donateModal").addEventListener("click", function (e) { if (e.target === this) closeDonate(); });
    /* A1 打印机弹窗事件：筛选条按钮（动态渲染，用委托）与弹窗内部 */
    document.addEventListener("click", function (e) {
      var btn = e.target && e.target.closest ? e.target.closest("[data-printer]") : null;
      if (btn) { e.preventDefault(); openPrinterModal(); }
    });
    var prSave = $("#prSave");
    if (prSave) prSave.addEventListener("click", savePrinterFromModal);
    var prCancel = $("#prCancel");
    if (prCancel) prCancel.addEventListener("click", closePrinterModal);
    var prClear = $("#prClear");
    if (prClear) prClear.addEventListener("click", clearPrinterFromModal);
    var prModal = $("#printerModal");
    if (prModal) {
      prModal.addEventListener("click", function (e) { if (e.target === this) closePrinterModal(); });
      prModal.addEventListener("keydown", function (e) {
        if (e.isComposing || e.keyCode === 229) return;
        if (e.key === "Enter" && e.target && e.target.tagName === "INPUT") { e.preventDefault(); savePrinterFromModal(); }
      });
    }
    var sel = $("#donateSelected");
    function showSel() {
      if (donateAmt == null) sel.textContent = "请选择或输入金额";
      else sel.textContent = "💖 感谢您的支持！请扫码转账 ¥" + donateAmt;
      $("#donateThanks").style.display = donateAmt == null ? "none" : "block";
    }
    $all(".donate-amt").forEach(function (btn) {
      btn.addEventListener("click", function () {
        $all(".donate-amt").forEach(function (b) { b.classList.remove("on"); });
        if (btn.getAttribute("data-amt") === "custom") {
          $("#donateCustom").style.display = "block";
          donateAmt = null; showSel();
          return;
        }
        btn.classList.add("on");
        $("#donateCustom").style.display = "none";
        donateAmt = parseFloat(btn.getAttribute("data-amt"));
        showSel();
      });
    });
    $("#donateConfirm").addEventListener("click", function () {
      var v = parseFloat($("#donateInput").value);
      if (isNaN(v) || v < 0.01 || v > 9999) {
        sel.textContent = "⚠️ 金额需在 0.01 – 9999 元之间";
        return;
      }
      donateAmt = Math.round(v * 100) / 100;
      $all(".donate-amt").forEach(function (b) { b.classList.remove("on"); });
      $("#donateCustom").style.display = "none";
      showSel();
    });

    /* 弹窗关闭 */
    $("#matModalClose").addEventListener("click", closeModal);
    $("#matModal").addEventListener("click", function (e) { if (e.target === this) closeModal(); });
    /* Escape 统一关闭所有弹层（材料详情 / 捐赠 / 数据说明 / 打印机 / 命令面板） */
    document.addEventListener("keydown", function (e) {
      if (e.isComposing || e.keyCode === 229) return; /* IME */
      if (e.key !== "Escape") return;
      if (cmdkOpen) { closeCmdk(); return; }
      closePrinterModal();
      closeModal();
      closeDonate();
      closeMethod();
    });
    /* ---------- 精简交互：卡片跳转 + 数据说明二级页 ---------- */
    $all("[data-goto]").forEach(function (card) {
      function activate() {
        var id = card.getAttribute("data-goto").split(",")[0];
        if (MODULES[id]) navigateModule(id);
        else if (id === "safety") navigateModule("safety");
        else if (id === "method") openMethod();
      }
      card.addEventListener("click", activate);
      if (card.getAttribute("role") === "button" || card.tabIndex >= 0) {
        card.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); }
        });
      }
      card.style.cursor = "pointer";
    });
    /* F1 修复：页内锚点按钮（hero「选材向导」→ #overview）——
     * 原生 hash 跳转会被 hashchange→goHome() 抢回顶部（实测 scrollY 恒为 0），
     * 改为拦截默认行为后直接平滑滚动到目标区块 */
    $all("a[href='#overview']").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var sec = $("#overview");
        if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    function openMethod() {
      $("#methodModal").style.display = "flex";
      document.body.style.overflow = "hidden";
      renderMethod();
      rememberFocus();
      var mc2 = document.getElementById("methodModalClose");
      if (mc2) mc2.focus({ preventScroll: true });
    }
    function closeMethod() {
      $("#methodModal").style.display = "none";
      document.body.style.overflow = "";
      restoreFocus();
    }
    $all("[data-openmethod]").forEach(function (b) {
      b.addEventListener("click", function (e) { e.preventDefault(); openMethod(); });
    });
    var mmc = document.getElementById("methodModalClose");
    if (mmc) mmc.addEventListener("click", closeMethod);
    var mm = document.getElementById("methodModal");
    if (mm) mm.addEventListener("click", function (e) { if (e.target === this) closeMethod(); });
    var mv = document.getElementById("dataVersion");
    if (mv) mv.textContent = (DATA.meta.corrections || []).length;

    /* ---------- ⌘K 快速搜索命令面板（懒构建：首次打开才建索引，平时零开销） ---------- */
    var cmdkOpen = false, cmdkBuilt = false, cmdkItems = [], cmdkSel = 0, cmdkView = [];
    var cmdkMask = $("#cmdkMask"), cmdkInput = $("#cmdkInput"), cmdkList = $("#cmdkList");
    function buildCmdk() {
      if (cmdkBuilt) return;
      cmdkBuilt = true;
      Object.keys(MODULES).forEach(function (id) {
        cmdkItems.push({
          ico: "🧭", hint: "模块", kw: id,
          label: MODULES[id].title.replace(/^[^\s]+\s*/, ""),
          fn: function () { navigateModule(id); }
        });
      });
      cmdkItems.push({ ico: "📚", hint: "文档", label: "数据说明 · 口径与矫正记录", kw: "method data", fn: openMethod });
      cmdkItems.push({ ico: "🧡", hint: "支持", label: "支持我们 · 捐赠与反馈", kw: "donate pay", fn: openDonate });
      cmdkItems.push({ ico: "🌗", hint: "操作", label: "切换 明/暗 主题", kw: "theme 主题", fn: function () { $("#themeToggle").click(); } });
      cmdkItems.push({ ico: "🖨️", hint: "设备", label: "我的打印机 · 设备适配设置", kw: "printer 打印机 适配 喷嘴 腔体", fn: openPrinterModal });
      allMaterials().forEach(function (m) {
        cmdkItems.push({
          ico: "🧵", hint: m.family, kw: m.id,
          label: m.nameCn + " · " + m.nameEn,
          fn: function () { openModal(m.id); }
        });
      });
    }
    function renderCmdk(q) {
      q = (q || "").trim().toLowerCase();
      cmdkView = cmdkItems.filter(function (it) {
        return !q || it.label.toLowerCase().indexOf(q) >= 0 || it.kw.toLowerCase().indexOf(q) >= 0 || it.hint.toLowerCase().indexOf(q) >= 0;
      }).slice(0, 12);
      cmdkSel = 0;
      cmdkList.innerHTML = cmdkView.length
        ? cmdkView.map(function (it, i) {
          return '<button type="button" class="cmdk-item' + (i === 0 ? " sel" : "") + '" data-i="' + i + '">'
            + '<span class="ci">' + it.ico + '</span><span class="cl">' + esc(it.label) + '</span><span class="ch">' + esc(it.hint) + "</span></button>";
        }).join("")
        : '<div class="cmdk-empty">没有匹配的结果，试试「PLA」「价格」「主题」…</div>';
    }
    function openCmdk() {
      buildCmdk();
      cmdkOpen = true;
      cmdkMask.style.display = "flex";
      document.body.style.overflow = "hidden";
      rememberFocus();
      cmdkInput.value = "";
      renderCmdk("");
      setTimeout(function () { cmdkInput.focus(); }, 0);
    }
    function closeCmdk() {
      cmdkOpen = false;
      cmdkMask.style.display = "none";
      document.body.style.overflow = "";
      restoreFocus();
    }
    function cmdkRun(i) {
      var it = cmdkView[i];
      if (!it) return;
      closeCmdk();
      it.fn();
    }
    cmdkInput.addEventListener("input", function () { renderCmdk(this.value); });
    cmdkInput.addEventListener("keydown", function (e) {
      if (e.isComposing || e.keyCode === 229) return; /* IME */
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!cmdkView.length) return;
        cmdkSel = (cmdkSel + (e.key === "ArrowDown" ? 1 : cmdkView.length - 1)) % cmdkView.length;
        $all(".cmdk-item", cmdkList).forEach(function (el, i) { el.classList.toggle("sel", i === cmdkSel); });
        var selEl = $(".cmdk-item.sel", cmdkList);
        if (selEl) selEl.scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter") {
        e.preventDefault();
        cmdkRun(cmdkSel);
      }
    });
    cmdkList.addEventListener("click", function (e) {
      var item = e.target.closest ? e.target.closest(".cmdk-item") : null;
      if (item) cmdkRun(parseInt(item.getAttribute("data-i"), 10));
    });
    cmdkMask.addEventListener("click", function (e) { if (e.target === this) closeCmdk(); });
    document.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        if (cmdkOpen) closeCmdk(); else openCmdk();
      }
    });
    $("#cmdkBtn").addEventListener("click", openCmdk);

    /* 装饰光影使用纯 CSS :hover，避免鼠标移动时反复触发布局读取。 */
    /* ---------- 滚动渐入 ---------- */
    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("in"); obs.unobserve(en.target); }
        });
      }, { threshold: 0.08 });
      $all(".section > .container > .sec-title, .section > .container > .sec-desc, .zone-cards, .dim-grid, .mat-grid, .guide-grid, .compare-layout, .brand-grid, .table-wrap, .safety-tips, .method-grid, .points, .live-stats").forEach(function (el) {
        el.classList.add("reveal");
        obs.observe(el);
      });
    }
    var t = $("#navToggle");
    t.addEventListener("click", function () { $("#nav").classList.toggle("open"); });
    $all("#nav a").forEach(function (a) {
      if (a.getAttribute("href") === "#method") {
        a.addEventListener("click", function (e) { e.preventDefault(); openMethod(); });
      }
      a.addEventListener("click", function () { $("#nav").classList.remove("open"); });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
