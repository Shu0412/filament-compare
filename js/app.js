/* ============================================================
 * Filament DB · 主流 3D 打印耗材对比库
 * 内容创建：舒舒（基于 DeepSeek Harness 构建）
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
    var badge = function (pageId, label) {
      var src = "https://visitor-badge.laobi.icu/badge?page_id=" + pageId
        + "&labelColor=1b2434&color=4f9cf9";
      return '<span class="live-stat"><span class="live-label">' + label + '</span>'
        + '<img src="' + src + '" alt="' + label + '" loading="lazy" '
        + 'onerror="this.outerHTML=\'<span class=&quot;live-fallback&quot;>统计服务暂不可用</span>\'"></span>';
    };
    el.innerHTML = '<div class="live-stats-inner">'
      + badge("shu0412-filament-lab", "📈 累计访问")
      + '<span class="live-divider" style="width:1px;height:20px;background:var(--border)"></span>'
      + badge("shu0412-filament-lab-helpers", "🧡 已帮助")
      + "</div>"
      + '<p class="live-note">实时统计 · 唯一访客计数 · 由第三方计数服务提供 · 加载失败时自动隐藏</p>';
  }

  /* ---------- 分区卡片 ---------- */
  function renderZones() {
    var html = "";
    DATA.zones.forEach(function (z) {
      var n = z.materials.length;
      html += '<div class="zone-card"><span class="zone-tag" style="background:' + escRgba(ZONE_COLORS[z.id]) + '.18;color:' + ZONE_COLORS[z.id] + '">' + esc(z.name) + "</span>"
        + "<h3>" + esc(z.nameCn) + "</h3><p>" + esc(z.desc) + "</p>"
        + '<div class="zone-count">共 ' + n + " 种： " + esc(z.materials.map(function (m) { return m.nameCn; }).join("、")) + "</div></div>";
    });
    $("#zoneCards").innerHTML = html;
    $("#zoneStandardDesc").textContent = DATA.zones[0].desc + "（" + DATA.zones[0].materials.length + " 种）";
    $("#zoneEngineeringDesc").textContent = DATA.zones[1].desc + "（" + DATA.zones[1].materials.length + " 种）";
  }

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
    return '<article class="mat-card" data-mat="' + m.id + '" style="--mat-color:' + (m.color || "#4f9cf9") + '" tabindex="0" role="button" aria-label="查看 ' + esc(m.nameCn) + ' 详情">'
      + '<div class="mat-head"><h3>' + esc(m.nameCn) + "<small>" + esc(m.nameEn) + "</small></h3>"
      + '<div class="mat-head-right"><span class="score-badge" title="综合评分（耐热25%+强度25%+韧性20%+打印易度30%）">⭐ ' + matScore(m) + '</span>'
      + '<span class="mat-family">' + esc(m.family) + "</span></div></div>"
      + '<div class="mat-kv">' + kv + "</div>"
      + '<div class="mat-tags">' + tags + "</div>"
      + '<div class="mat-notes"><b>用途：</b>' + esc(m.applications.join("、")) + "　<b>短板：</b>" + esc(m.drawbacks.join("、")) + "</div>"
      + (m.note ? '<div class="mat-notes"><b>备注：</b>' + esc(m.note) + "</div>" : "")
      + '<div class="mat-more">点击查看详情 →</div>'
      + "</article>";
  }

  /* ---------- 筛选（搜索/难度/安全/家族） ---------- */
  var filterState = {};
  function zoneFilters(z) {
    if (!filterState[z.id]) filterState[z.id] = { q: "", diff: [], safety: [], family: [] };
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
    var html = '<div class="filter-row"><input type="text" class="filter-search" data-f="' + z.id + '" placeholder="🔍 搜索材料名称 / 英文名…" value="' + esc(f.q) + '">'
      + '<button class="btn btn-ghost btn-sm" data-fclear="' + z.id + '">清空筛选</button></div>'
      + '<div class="filter-row"><span class="filter-label">难度</span>'
      + [1, 2, 3, 4, 5].map(function (d) { return chip(d, f.diff.indexOf(d) >= 0, "diff", d + "★"); }).join("")
      + '<span class="filter-label">安全</span>'
      + [0, 1, 2, 3].map(function (s) { return chip(s, f.safety.indexOf(s) >= 0, "safety", SAFETY_LABEL[s]); }).join("")
      + '<span class="filter-label">家族</span>'
      + fams.map(function (fm) { return chip(esc(fm), f.family.indexOf(fm) >= 0, "family", esc(fm)); }).join("")
      + "</div>";
    $("#filterBar" + (z.id === "standard" ? "Standard" : "Engineering")).innerHTML = html;
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
    return true;
  }
  function bindFilterEvents(z) {
    var el = $("#filterBar" + (z.id === "standard" ? "Standard" : "Engineering"));
    if (!el) return;
    var onInput = el.querySelector("input.filter-search");
    if (onInput) onInput.addEventListener("input", function () {
      zoneFilters(z).q = this.value;
      renderMaterials();
    });
    $all("input[data-f]", el).forEach(function (inp) {
      if (inp.getAttribute("data-type")) inp.addEventListener("change", function () {
        var f = zoneFilters(z), t = inp.getAttribute("data-type"), v = t === "diff" ? parseInt(inp.getAttribute("data-val"), 10)
          : t === "safety" ? parseInt(inp.getAttribute("data-val"), 10) : inp.getAttribute("data-val");
        var arr = f[t];
        var i = arr.indexOf(v);
        if (inp.checked && i < 0) arr.push(v);
        if (!inp.checked && i >= 0) arr.splice(i, 1);
        renderMaterials();
      });
    });
    var clr = el.querySelector("[data-fclear]");
    if (clr) clr.addEventListener("click", function () {
      filterState[z.id] = { q: "", diff: [], safety: [], family: [] };
      renderFilterBar(z); bindFilterEvents(z); renderMaterials();
    });
  }
  function renderMaterials() {
    DATA.zones.forEach(function (z) {
      var id = z.id === "standard" ? "Standard" : "Engineering";
      var grid = $("#matGrid" + id);
      var vis = z.materials.filter(function (m) { return matVisible(m, z); });
      grid.innerHTML = vis.map(materialCard).join("");
      $("#filterEmpty" + id).style.display = vis.length ? "none" : "block";
    });
    bindCardClicks();
  }
  function bindCardClicks() {
    $all(".mat-card").forEach(function (card) {
      card.addEventListener("click", function () { openModal(card.getAttribute("data-mat")); });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(card.getAttribute("data-mat")); }
      });
    });
  }

  /* ---------- 材料详情弹窗 ---------- */
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
      + '<button class="btn btn-primary btn-block" data-addcmp="' + m.id + '">＋ 加入对比</button>';
    $("#matModalBody").innerHTML = html;
    $("#matModal").style.display = "flex";
    document.body.style.overflow = "hidden";
    var add = $("#matModalBody [data-addcmp]");
    if (add) add.addEventListener("click", function () {
      if (cmpState.mats.indexOf(m.id) < 0) {
        cmpState.mats.push(m.id);
        if (cmpState.mats.length > 5) cmpState.mats.splice(0, cmpState.mats.length - 5);
        renderCmpChips(); renderCompareCharts();
      }
      closeModal();
      document.getElementById("compare").scrollIntoView({ behavior: "smooth" });
    });
  }
  function closeModal() {
    $("#matModal").style.display = "none";
    document.body.style.overflow = "";
  }

  /* ---------- 对比工具 ---------- */
  var cmpState = { mats: [], metrics: ["tensile"] };

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
    $("#cmpClear").addEventListener("click", function () {
      cmpState.mats = [];
      renderCmpChips();
      renderCompareCharts();
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
    if (!mats.length) { box.innerHTML = '<div class="chart-empty">请先在左侧选择 1–5 种耗材 📌</div>'; return; }
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
      svg += '<polygon points="' + pts.join(" ") + '" fill="none" stroke="rgba(255,255,255,.09)" stroke-width="1"/>';
    }
    for (var j = 0; j < N; j++) {
      var p = pt(j, R);
      svg += '<line x1="' + cx + '" y1="' + cy + '" x2="' + p[0] + '" y2="' + p[1] + '" stroke="rgba(255,255,255,.09)"/>';
      var lp = pt(j, R + 24);
      var anch = lp[0] < cx - 10 ? "end" : (lp[0] > cx + 10 ? "start" : "middle");
      svg += '<text x="' + lp[0] + '" y="' + (lp[1] + 4) + '" text-anchor="' + anch + '" font-size="11.5" fill="#9aa7b8">' + RADAR_AXES[j].label + "</text>";
    }
    mats.forEach(function (m, mi) {
      var pts = [];
      for (var k = 0; k < N; k++) {
        var v = radarValue(m, RADAR_AXES[k]);
        pts.push(pt(k, R * v).join(","));
      }
      var c = m.color || PALETTE[mi % PALETTE.length];
      svg += '<polygon points="' + pts.join(" ") + '" fill="' + escRgba(c) + '.22" stroke="' + c + '" stroke-width="2" stroke-linejoin="round"/>';
    });
    svg += "</svg>";
    var legend = mats.map(function (m, mi) {
      var c = m.color || PALETTE[mi % PALETTE.length];
      return '<span><i style="background:' + c + '"></i>' + esc(m.nameCn) + "</span>";
    }).join("");
    box.innerHTML = svg + '<div class="chart-legend">' + legend + "</div>";
  }

  /* 条形图 */
  function renderBars() {
    var box = $("#barChart");
    var mats = selectedMats();
    if (!mats.length) { box.innerHTML = '<div class="chart-empty">请先在左侧选择耗材 📌</div>'; return; }
    var html = "";
    cmpState.metrics.forEach(function (mk, mi) {
      var mt = METRICS.filter(function (x) { return x.key === mk; })[0];
      if (!mt) return;
      var unit = mt.unit || (mk === "impact" ? "kJ/m²" : "");
      var maxV = maxOf(mats, mk) || 1;
      html += '<div class="bar-group" style="margin-bottom:16px"><b style="font-size:13px;color:#9aa7b8">' + esc(mt.label) + "（" + esc(unit) + "）</b>";
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
    { id: "speed", icon: "🏎️", title: "高速打印", desc: "快速打样、量产原型", rec: ["pla-plus", "petg", "petg-cf"], reason: "PLA+ 高速表现最好且稳定；PETG 可选高速版（如拓竹 PETG HF）；追求高速+刚度选 PETG-CF。" }
  ];
  function renderGuide() {
    var html = SCENES.map(function (s) {
      return '<button class="guide-card" data-scene="' + s.id + '"><div class="guide-icon">' + s.icon + "</div>"
        + "<h3>" + s.title + "</h3><p>" + s.desc + "</p><span class='guide-tip'>查看推荐 →</span></button>";
    }).join("");
    $("#guideGrid").innerHTML = html;
    $all("#guideGrid .guide-card").forEach(function (btn) {
      btn.addEventListener("click", function () {
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
          return '<td class="material-cell"><span class="dot" style="background:' + (m.color || "#4f9cf9") + '"></span><b>' + esc(m.nameCn) + "</b> <span style='color:#6b7a8f'>" + esc(m.nameEn) + "</span></td>";
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
    $("#fullTable").innerHTML = '<table class="data-table"><thead>' + head + "</thead><tbody>" + body + "</tbody></table>";
    $all("#fullTable th").forEach(function (th) {
      th.addEventListener("click", function () {
        var kk = th.getAttribute("data-key");
        if (tableSort.key === kk) tableSort.dir *= -1;
        else { tableSort.key = kk; tableSort.dir = 1; }
        renderTable();
      });
    });
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
    $("#safetyTable").innerHTML = '<div class="table-scroll"><table class="data-table"><thead><tr>'
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
  function renderMethod() {
    var corr = DATA.meta.corrections || [];
    $("#correctionLog").innerHTML = corr.length
      ? corr.map(function (c) {
        return '<div class="correction"><b>【' + esc(c.date) + "】" + esc(c.item) + "</b><br>问题：" + esc(c.issue)
          + '<br><span class="corr-fix">矫正：' + esc(c.fix) + "</span></div>";
      }).join("")
      : '<p style="color:#6b7a8f;font-size:13px">暂无矫正记录</p>';
    $("#sourceList").innerHTML = DATA.meta.sources.map(function (s) {
      return "<li>" + esc(s.name) + " — <a href='" + esc(s.url) + "' target='_blank' rel='noopener'>" + esc(s.url) + "</a></li>";
    }).join("");
    $("#dataUpdated").textContent = DATA.meta.updatedAt;
  }

  /* ---------- 初始化 ---------- */
  function init() {
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
    DATA.zones.forEach(function (z) { renderFilterBar(z); bindFilterEvents(z); });
    renderMaterials();
    renderGuide();
    renderCmpChips();
    renderCompareCharts();
    renderTable();
    renderBrands();
    renderSafety();
    renderMethod();
    /* 主题切换 */
    var tt = $("#themeToggle");
    function applyTheme(t2) {
      document.documentElement.setAttribute("data-theme", t2);
      tt.textContent = t2 === "light" ? "🌙" : "☀️";
      try { localStorage.setItem("fd-theme", t2); } catch (e) { /* ignore */ }
    }
    var saved = null;
    try { saved = localStorage.getItem("fd-theme"); } catch (e) { /* ignore */ }
    applyTheme(saved === "light" ? "light" : "dark");
    tt.addEventListener("click", function () {
      applyTheme(document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light");
    });
    /* 回到顶部 */
    var bt = $("#backTop");
    window.addEventListener("scroll", function () {
      bt.style.display = window.scrollY > 600 ? "block" : "none";
    }, { passive: true });
    bt.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    /* 弹窗关闭 */
    $("#matModalClose").addEventListener("click", closeModal);
    $("#matModal").addEventListener("click", function (e) { if (e.target === this) closeModal(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
    var t = $("#navToggle");
    t.addEventListener("click", function () { $("#nav").classList.toggle("open"); });
    $all("#nav a").forEach(function (a) {
      a.addEventListener("click", function () { $("#nav").classList.remove("open"); });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
