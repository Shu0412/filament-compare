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
  var collapseState = { standard: false, engineering: false };
  function perRow() { return window.innerWidth < 720 ? 1 : 3; }
  function renderMaterials() {
    DATA.zones.forEach(function (z) {
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
  }
  function bindCollapse() {
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
    window.addEventListener("resize", function () {
      renderMaterials();
    }, { passive: true });
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
      svg += '<line x1="' + X(gx) + '" y1="' + mt + '" x2="' + X(gx) + '" y2="' + (mt + ph) + '" stroke="rgba(255,255,255,.06)"/>';
      svg += '<text x="' + X(gx) + '" y="' + (mt + ph + 22) + '" text-anchor="middle" font-size="11.5" fill="#6b7a8f">' + gx + "°</text>";
    }
    for (var gy = 0; gy <= 460; gy += 100) {
      svg += '<line x1="' + ml + '" y1="' + Y(gy) + '" x2="' + (ml + pw) + '" y2="' + Y(gy) + '" stroke="rgba(255,255,255,.06)"/>';
      svg += '<text x="' + (ml - 8) + '" y="' + (Y(gy) + 4) + '" text-anchor="end" font-size="11.5" fill="#6b7a8f">' + gy + "°</text>";
    }
    svg += '<text x="' + (ml + pw / 2) + '" y="' + (H - 10) + '" text-anchor="middle" font-size="13" fill="#9aa7b8">热变形温度 HDT（℃）→ 耐热性</text>';
    svg += '<text x="16" y="' + (mt + ph / 2) + '" text-anchor="middle" font-size="13" fill="#9aa7b8" transform="rotate(-90 16 ' + (mt + ph / 2) + ')">打印温度（℃）→ 机器门槛</text>';
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
      + '<span><i style="display:inline-block;width:10px;height:10px;border-radius:50%;border:2px solid #9aa7b8;background:transparent"></i>气泡大小=抗冲击</span>';
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
    svg += "</svg>";
    var legend = mats.map(function (m, mi) {
      var c = m.color || PALETTE[mi % PALETTE.length];
      return '<span><i style="background:' + c + '"></i>' + esc(m.nameCn) + "</span>";
    }).join("");
    legend += '<span style="opacity:.75"><i style="background:transparent;border:1.5px dashed rgba(255,255,255,.55);width:12px;height:0"></i>选中材料平均值</span>';
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
    el.innerHTML = '<table class="data-table matrix-table"><thead>' + head + "</thead><tbody>" + rows + "</tbody></table>";
  }

  /* ---------- 价格情报 ---------- */
  var priceState = { platform: "" };
  function renderPrices() {
    var prices = DATA.meta.prices;
    var el = $("#priceTable");
    if (!el || !prices || !prices.items || !prices.items.length) return;
    var items = prices.items.filter(function (p) {
      return !priceState.platform || p.platform.indexOf(priceState.platform) >= 0;
    });
    // 筛选条
    var plats = [];
    prices.items.forEach(function (p) { if (plats.indexOf(p.platform) < 0) plats.push(p.platform); });
    var fhtml = '<div class="filter-row"><span class="filter-label">平台</span>'
      + '<label class="chip fchip' + (!priceState.platform ? " on" : "") + '"><input type="radio" name="pf" data-pf=""' + (!priceState.platform ? " checked" : "") + '>全部</label>'
      + plats.map(function (pl) {
        return '<label class="chip fchip' + (priceState.platform === pl ? " on" : "") + '"><input type="radio" name="pf" data-pf="' + esc(pl) + '"' + (priceState.platform === pl ? " checked" : "") + ">" + esc(pl) + "</label>";
      }).join("")
      + "</div>";
    $("#priceFilter").innerHTML = fhtml;
    $all("#priceFilter input[name=pf]").forEach(function (inp) {
      inp.addEventListener("change", function () {
        priceState.platform = inp.getAttribute("data-pf");
        renderPrices();
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
    if (prices.summary) sumHtml += '<p class="price-note">💡 ' + esc(prices.summary) + "</p>";
    $("#priceSummary").innerHTML = sumHtml;
    // 明细表
    var head = "<tr><th data-pk='brand'>品牌</th><th data-pk='material'>材料</th><th data-pk='platform'>平台</th><th data-pk='listPrice'>原价 ¥</th><th data-pk='dealPrice'>到手价 ¥</th><th data-pk='pricePerKg'>每kg ¥</th><th data-pk='lowestPrice'>史低 ¥</th><th>优惠</th></tr>";
    var body = items.map(function (p) {
      return "<tr><td><b>" + esc(p.brand) + "</b></td><td>" + esc(p.material) + "</td><td>" + esc(p.platform) + "</td>"
        + "<td>" + (p.listPrice != null ? p.listPrice : "—") + "</td>"
        + "<td><b>" + (p.dealPrice != null ? p.dealPrice : "—") + "</b></td>"
        + "<td>" + (p.pricePerKg != null ? p.pricePerKg : "—") + "</td>"
        + "<td class='cell-best'>" + (p.lowestPrice != null ? p.lowestPrice : "—") + "</td>"
        + "<td>" + esc(p.discount || "—") + "</td></tr>";
    }).join("");
    $("#priceTable").innerHTML = '<table class="data-table price-table"><thead>' + head + "</thead><tbody>" + body + "</tbody></table>";
    /* 排序：数值列按数值、文本列按拼音/字符 */
    var pk = null, dir = 1;
    $all("#priceTable th[data-pk]").forEach(function (th) {
      th.addEventListener("click", function () {
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
    renderScatter();
    renderZones();
    DATA.zones.forEach(function (z) { renderFilterBar(z); bindFilterEvents(z); });
    renderMaterials();
    renderGuide();
    bindCollapse();
    renderCmpChips();
    renderCompareCharts();
    renderTable();
    renderBrands();
    renderBrandMatrix();
    renderPrices();
    renderSafety();
    renderMethod();
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
    /* ---------- 精简交互：卡片跳转 + 数据说明二级页 ---------- */
    $all("[data-goto]").forEach(function (card) {
      card.addEventListener("click", function () {
        var id = card.getAttribute("data-goto").split(",")[0];
        var el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      });
      card.style.cursor = "pointer";
    });
    function openMethod() {
      $("#methodModal").style.display = "flex";
      document.body.style.overflow = "hidden";
      renderMethod();
    }
    function closeMethod() {
      $("#methodModal").style.display = "none";
      document.body.style.overflow = "";
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

    /* ---------- 液态光影：lerp 平滑跟随（流体滞后感）+ 卡片局部光 ---------- */
    var tx = window.innerWidth / 2, ty = window.innerHeight / 3;
    var cx = tx, cy = ty;
    var hasMouse = false;
    function onMove(e) { tx = e.clientX; ty = e.clientY; hasMouse = true; }
    document.addEventListener("mousemove", onMove, { passive: true });
    function tick() {
      cx += (tx - cx) * 0.09;
      cy += (ty - cy) * 0.09;
      document.documentElement.style.setProperty("--mx", cx + "px");
      document.documentElement.style.setProperty("--my", cy + "px");
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    /* 卡片局部光（事件委托，直接量坐标） */
    document.addEventListener("mousemove", function (e) {
      var t = e.target;
      var card = t && t.closest ? t.closest(".mat-card,.zone-card,.dim-card,.brand-card,.guide-card,.col") : null;
      if (card) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--cx", (e.clientX - r.left) + "px");
        card.style.setProperty("--cy", (e.clientY - r.top) + "px");
      }
    }, { passive: true });
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
