/* ============================================================
 * Filament DB · 主流 3D 打印耗材对比库
 * 内容创建：舒舒（基于 DeepSeek Harness 构建）
 * 开源免费，仅供学习交流；转载数据请注明出处
 * 数据口径：所有数值为典型区间，来源见 meta.sources；
 * 每次数据更新都经过与上一版逐项复核（见 meta.corrections）。
 * ============================================================ */
window.FILAMENT_DATA = {
  meta: {
    updatedAt: "2026-08-15",
    sources: [
      { name: "Prusa 材料库（官方）", url: "https://help.prusa3d.com/materials" },
      { name: "Prusament 官方 TDS", url: "https://prusament.com/technical-data-sheets/" },
      { name: "Simplify3D 耗材指南", url: "https://www.simplify3d.com/resources/materials-guide/" },
      { name: "Polymaker 官方技术数据一览（打印件实测）", url: "https://wiki.polymaker.com/polymaker-wiki/polymaker-wiki-zh/polymaker-chan-pin/polymaker-filaments/technical-data-at-a-glance.md" },
      { name: "Polymaker PolyLite PC 官方 TDS V4（打印件实测）", url: "https://www.igo3d.com/mediafiles/Sonstiges/Polymaker/PolyLite%20PC/PolyLite_PC_TDS_V4.pdf" },
      { name: "Bambu Lab 官方 Wiki（材料）", url: "https://wiki.bambulab.com/zh/general/filament-guide-material-table" },
      { name: "eSUN 官方 TDS", url: "https://www.esun3d.com/uploads/eSUN_PLA-Filament_TDS_V4.0.pdf" },
      { name: "eSUN 官方材料页", url: "https://www.esun3d.com/filaments/" },
      { name: "Sunlu（三绿）官方", url: "https://www.sunlu.com/zh-cn/collections/all" },
      { name: "Kexcelled（诺思贝瑞）官方", url: "https://kexcelled3d.com" },
      { name: "FilamentHub TDS 汇总", url: "https://www.filamenthub.com.au/pages/filament-data" },
      { name: "All3DP 耗材指南", url: "https://all3dp.com/1/3d-printer-filament-types-3d-printing-3d-filament/" },
      { name: "NIOSH 3D 打印安全公告", url: "https://www.cdc.gov/niosh/bulletin/2018/3d-printing.html" }
    ],
    corrections: [
      {
        date: "2026-08-15",
        item: "PC（聚碳酸酯）力学数据口径",
        issue: "初稿按注塑级树脂数据填写（断裂伸长率 50–100%、缺口冲击 20–50 kJ/m²），与 3D 打印件实测严重不符",
        fix: "按 Polymaker PolyLite PC 官方 TDS（打印件实测：拉伸 62.7 MPa、伸长率 3.2%、Charpy 冲击 3.4 kJ/m²）矫正为 伸长率 3–15%、冲击 3–10 kJ/m²，并注明注塑级与打印件差异"
      },
      {
        date: "2026-08-15",
        item: "PPSU 玻璃化转变温度",
        issue: "初稿 Tg 185–190℃ 实为 PSU（聚砜）的值",
        fix: "矫正为 PPSU 正确值 215–225℃（Tg 随牌号 215–225℃）"
      },
      {
        date: "2026-08-15",
        item: "PEEK / PEKK / PA6 缺口冲击强度",
        issue: "初稿冲击值偏高（PEEK 20–40、PEKK 15–30、PA6 15–35 kJ/m²）",
        fix: "按注塑级干态典型值矫正：PEEK 4–10、PEKK 5–10、PA6 干态 5–12 kJ/m²，并注明吸湿后韧性上升"
      },
      {
        date: "2026-08-15",
        item: "PVDF 热变形温度",
        issue: "初稿 HDT 100–115℃ 偏高",
        fix: "矫正为 55–90℃（1.82MPa 载荷典型值），翘曲倾向由中矫正为高"
      },
      {
        date: "2026-08-15",
        item: "POM 打印温度与干燥",
        issue: "初稿打印温度 200–230℃ 偏窄、缺干燥建议",
        fix: "按 3DXTech/厂商数据矫正为 195–235℃，补充干燥 80–90℃/2–4h，并明确过热（约 240℃+）释放甲醛的安全警示"
      },
      {
        date: "2026-08-15",
        item: "PA-CF 合并区间（PA6-CF 与 PA12-CF）",
        issue: "初稿只按 PA6-CF 填写，区间偏窄",
        fix: "按两种基材合并矫正：Tm 175–225℃、HDT 90–190℃、拉伸 80–130 MPa、密度 1.08–1.40，注明差异"
      },
      {
        date: "2026-08-15",
        item: "品牌产品线核对",
        issue: "初稿部分品牌型号未经官方渠道确认（如 eSUN 的 ePOM/ePPS/ePEI、拓竹 PETG-T）",
        fix: "逐一对照品牌官网/官方 Wiki 矫正：删除无法确认的型号，补充官方在售系列（Kexcelled 官网确认为 kexcelled3d.com，诺思贝瑞；拓竹 30+ 品类；三绿含 PEEK；Polymaker 2024 年 PolyLite 更名 PolyMaker）"
      },
      {
        date: "2026-08-15",
        item: "PLA+ 韧性数据",
        issue: "初稿按普通 PLA 推断 PLA+ 缺口冲击 6–10 kJ/m²，明显偏低",
        fix: "按 Polymaker 官方打印件实测矫正：PolyLite PLA Pro 冲击 17.1 kJ/m²、PolyMax PLA 达 38.9 kJ/m²；拉伸同时修正为 40–55 MPa（韧性增强以强度为代价）"
      },
      {
        date: "2026-08-15",
        item: "PLA-CF 拉伸强度",
        issue: "初稿按「碳纤=更强」推断拉伸 80–110 MPa，与官方实测严重不符",
        fix: "矫正为 30–50 MPa（Polymaker PLA-CF 官方 31.2 MPa、拓竹约 37 MPa）：碳纤提升刚度但拉伸强度反而低于普通 PLA，并修正 HDT 为 54–65℃"
      },
      {
        date: "2026-08-15",
        item: "PETG / ABS / ASA 官方打印件数据",
        issue: "初稿 HDT 与冲击按注塑级或经验值填写",
        fix: "按 Polymaker 官方打印件实测矫正：PETG HDT 65–80℃、冲击 3–12 kJ/m²；ABS HDT 95–120℃、冲击 10–18 kJ/m²；ASA HDT 100–110℃、冲击 8–12 kJ/m²"
      },
      {
        date: "2026-08-15",
        item: "TPU 伸长率与密度",
        issue: "初稿伸长率 350–600%、密度 1.20–1.22",
        fix: "按 Polymaker PolyFlex TPU95 官方实测矫正：伸长率 400–600%（实测 551%）、密度 1.16–1.22（含 HF 高速版）"
      },
      {
        date: "2026-08-15",
        item: "PA-CF 耐热上限",
        issue: "初稿 HDT 上限 190℃",
        fix: "按 Fiberon PA6-CF20 官方 HDT（0.45MPa）215℃ 矫正为 90–215℃，注明 0.45MPa 载荷口径"
      },
      {
        date: "2026-08-15",
        item: "最终交叉验证（第二轮矫正）",
        issue: "首轮矫正后，与常规耗材子代理调研（eSUN/Prusament/Braskem 官方 TDS）再次逐项比对",
        fix: "再矫正 13 项：PP 缺口冲击 25–50→3–14 kJ/m²、翘曲中→高；PET 难度 2→4、翘曲低→高、HDT 65–115℃；TPU Tg -50～-30℃、伸长率 400–800%；PVB 冲击 3–6→7–10 kJ/m²；ABS HDT 80–120℃（标注载荷差异）、打印温度 220–270℃；ASA 拉伸 35–48 MPa；PVA Tg/Tm 按水解度修正、HDT 留空；HIPS 伸长率 30–60%；PETG 伸长率 5–50%（屈服 vs 断裂口径差异）；PLA/PETG/PVB 密度与打印温度按官方 TDS 微调"
      },
      {
        date: "2026-08-15",
        item: "第三轮扩充：新增 12 种耗材（常规 5 + 工程 7）",
        issue: "用户反馈耗材种类不足；初稿为 25 种",
        fix: "新增 PLA Silk、木质 PLA、TPE、PETG-CF、BVOH、PC-ABS、PA12-CF、PET-CF、PPS-CF、PPA-CF、PEBA、ASA-CF 共 12 种，其中 7 种直接采用 Polymaker 官方打印件实测数据（技术数据一览），PPA-CF 采用拓竹官方数据（弯曲强度 208 MPa、HDT 205℃），全部标注来源"
      },
      {
        date: "2026-08-15",
        item: "第三轮扩充：新增 5 个品牌（共 10 个）",
        issue: "用户反馈品牌较少；原为 5 个",
        fix: "新增 Prusament（捷克）、创想三维 Creality、纵维立方 Anycubic、Overture（美国）、3DXTech（美国工程料厂）；型号逐一核对官方渠道，排除第三方贴牌（如 Creality 店内 Soleyin）"
      },
      {
        date: "2026-08-15",
        item: "PPA-CF 数据矫正",
        issue: "初稿 HDT 150–200℃ 为经验估计",
        fix: "按拓竹官方 Wiki 实测矫正：弯曲强度 208 MPa（干态）、HDT 205℃（0.45MPa）、弯曲模量 9860 MPa，区间修正为 HDT 150–205℃、弯曲 150–210 MPa"
      },
      {
        date: "2026-08-15",
        item: "PET-CF 耐热口径矫正",
        issue: "不同厂商 HDT 口径差异大（拓竹 87℃ vs Polymaker 147.5℃）",
        fix: "注明口径：拓竹 PET-CF 87℃ 为未退火值，Polymaker PET-CF17 147.5℃ 为退火后值；数据表取 100–150℃ 并注明「退火才能获得高 HDT」"
      },
      {
        date: "2026-08-15",
        item: "交互升级与统计口径",
        issue: "新增综合评分、筛选、向导、最优高亮，需明确定义口径",
        fix: "综合评分 = 耐热(HDT)25% + 拉伸强度 25% + 抗冲击 20% + 打印易度 30%（满分 100）；表格 🏆 最优：数值列取区间中值比较（高者为优），难度/吸湿/翘曲/安全取低者为优；弹性体冲击「不断裂」不参与比较"
      },
      {
        date: "2026-08-15",
        item: "新材料交叉核验（第四轮矫正，官方 TDS 逐项比对）",
        issue: "新增 12 种材料的初稿值部分为经验估计，需与官方 TDS 逐项比对",
        fix: "按官方 TDS 矫正 30+ 项：PA12-CF 打印温度 280–300℃（原 250–290）、热床 40–60℃（原 80–110，Fiberon 低翘曲设计）；PPS-CF HDT 133–252.5℃（标注 0.45/1.8MPa 载荷差异）；PPA-CF 拉伸 120–170 MPa（拓竹官方 168±4）、Tm 255–265℃；PET-CF 热床 70–80℃、伸长率 2.4%；PC-ABS 打印温度 250–270℃、伸长率 4.2%、翘曲高；BVOH 密度 1.10–1.20、拉伸 20–45 MPa（Verbatim 参考）；PLA Silk 拉伸 30–45/冲击 3–14（eSUN 2.93 vs Polymaker 13.8 方法差异）；木质 PLA 冲击 4–16/吸湿高；PETG-CF 拉伸 50–63/冲击取缺口口径；TPE 打印 220–250℃/密度 1.10–1.20；PEBA 伸长率 400–900%、干燥 60℃/8h；ASA-CF 采用 Polymaker 官方（43.5/103/5.5）"
      },
      {
        date: "2026-08-15",
        item: "第六轮（计划书阶段一）：新增 4 种耗材（37 → 41）",
        issue: "按完善计划书补全材料库：PCTG、PA-GF、PEEK-CF、PEEK-GF",
        fix: "PA-GF 采用 Polymaker Fiberon PA6-GF25 官方打印件实测（拉伸 80.1 MPa/HDT 191℃/冲击 10 kJ/m²）；PCTG 采用 3DXTech MAX-G 官方参数（250–270℃/无定形/耐化学优于 PETG）；PEEK-CF/GF 采用 3DXTech CarbonX 系列典型窗口（360–400℃/高温腔）并标注口径；PEEK-CF/GF 力学为典型区间待子代理返回后比对"
      },
      {
        date: "2026-08-15",
        item: "第五轮扩充：新增 7 个国产耗材品牌（10 → 17）",
        issue: "用户反馈需要更多国内品牌",
        fix: "新增爱乐酷 ELEGOO（深圳智能派）、Jayo（捷优，注册地香港）、FusRock（苏州复丝络科）、R3D（芜湖爱3迪科技）、爱丽滋 ALIZ（无锡，母公司江阴龙山）、彩多屋（惠州）、启庞 Kingroon（深圳）；品牌身份/官网/产品线经官方渠道核实：R3D 官网确认为 r3dprinter.com，爱丽滋官网为母公司 longshanplas.com/ALIZ/，Jayo 与创想三维无官方隶属关系、按独立品牌记录"
      }
    ]
  },

  /* ===================== 常规耗材区 ===================== */
  zones: [
    {
      id: "standard",
      name: "常规耗材",
      nameCn: "常规耗材区",
      desc: "普及度最高、多数家用/入门机型可直接打印的材料：PLA 家族、PETG、ABS、ASA、柔性 TPU 与支撑类材料。打印门槛低、性价比高，覆盖 90% 以上日常打印需求。",
      materials: [
        {
          id: "pla", nameCn: "PLA", nameEn: "Polylactic Acid", family: "PLA系",
          color: "#4f9cf9",
          tg: [55, 65], tm: [150, 180], hdt: [53, 65],
          printTemp: [190, 230], bedTemp: [45, 60],
          tensile: [45, 65], flexural: [60, 90], impact: [3, 6], impactUnit: "kJ/m²", elongation: [2, 15],
          density: [1.17, 1.25], hygroscopic: "低",
          difficulty: 1, warp: "低", enclosure: "否", drying: null,
          safetyLevel: 0, fumes: "乳酸类微量挥发物（基本无刺激性）",
          safetyNote: "PLA 主要释放乳酸与少量低分子挥发物，刺激性低，通常视为最安全的 FDM 耗材；仍建议保持基本通风。可生物降解（工业堆肥条件）。",
          applications: ["原型打样", "摆件/模型", "教学", "艺术装饰"],
          drawbacks: ["耐热差（60℃即软化）", "偏脆易断", "不耐紫外线"],
          note: "熔化温度区间取自不同牌号（无定形/半结晶混合），常见牌号 Tm 约 160–175℃。Polymaker PolyLite PLA 官方打印件：拉伸 52.3 MPa、缺口冲击 3.3 kJ/m²。",
          sources: [{ name: "Prusa 材料库", url: "https://help.prusa3d.com/materials" }]
        },
        {
          id: "pla-plus", nameCn: "PLA+", nameEn: "PLA Plus / PLA Pro", family: "PLA系",
          color: "#4f9cf9",
          tg: [55, 65], tm: [155, 180], hdt: [53, 65],
          printTemp: [190, 230], bedTemp: [45, 60],
          tensile: [40, 55], flexural: [60, 90], impact: [10, 25], impactUnit: "kJ/m²", elongation: [10, 30],
          density: [1.20, 1.25], hygroscopic: "低",
          difficulty: 1, warp: "低", enclosure: "否", drying: null,
          safetyLevel: 0, fumes: "乳酸类微量挥发物（基本无刺激性）",
          safetyNote: "PLA+ 通过共混改性提升韧性，释放物与 PLA 相当，安全性好。",
          applications: ["功能性原型", "外壳", "卡扣件", "教学"],
          drawbacks: ["耐热仍差", "不同品牌配方差异大"],
          note: "PLA+ 并非统一标准，各厂商改性配方不同。官方打印件实测（Polymaker）：PolyLite PLA Pro 拉伸 49.8 MPa、缺口冲击 17.1 kJ/m²；PolyMax PLA 冲击达 38.9 kJ/m²——高韧性版本的冲击可数倍于普通 PLA。",
          sources: [{ name: "eSUN 官方", url: "https://www.esun3d.com" }]
        },
        {
          id: "pla-cf", nameCn: "PLA-CF", nameEn: "PLA Carbon Fiber", family: "PLA系",
          color: "#4f9cf9",
          tg: [55, 65], tm: [160, 180], hdt: [54, 65],
          printTemp: [200, 230], bedTemp: [45, 60],
          tensile: [30, 50], flexural: [90, 130], impact: [4, 8], impactUnit: "kJ/m²", elongation: [1, 3],
          density: [1.25, 1.30], hygroscopic: "低",
          difficulty: 2, warp: "低", enclosure: "否", drying: "建议 50℃/4h",
          safetyLevel: 0, fumes: "乳酸类微量挥发物 + 碳纤维粉尘（打磨时）",
          safetyNote: "打印释放物与 PLA 相当；切割/打磨碳纤维件会产生导电粉尘，务必戴口罩并避免进入电子设备。",
          applications: ["轻量化结构件", "无人机部件", "表面质感件"],
          drawbacks: ["磨喷嘴（需硬化钢喷嘴）", "韧性下降更脆"],
          note: "碳纤维提升刚度、尺寸稳定性与表面质感，但拉伸强度反而低于普通 PLA（官方打印件：Polymaker PLA-CF 31.2 MPa，拓竹 PLA-CF 约 37 MPa），碳纤与 PLA 界面结合弱所致；韧性也低于 PLA+。",
          sources: [{ name: "Bambu Lab Wiki", url: "https://wiki.bambulab.com/en/filament" }]
        },
        {
          id: "petg", nameCn: "PETG", nameEn: "Glycol-modified PET", family: "PET系",
          color: "#22c3a6",
          tg: [75, 85], tm: null, hdt: [65, 80],
          printTemp: [230, 260], bedTemp: [60, 90],
          tensile: [38, 55], flexural: [55, 75], impact: [3, 12], impactUnit: "kJ/m²", elongation: [5, 50],
          density: [1.24, 1.30], hygroscopic: "中",
          difficulty: 2, warp: "低", enclosure: "否", drying: "建议 65℃/4–6h",
          safetyLevel: 0, fumes: "低挥发（微量酯类/乙醛）",
          safetyNote: "PETG 释放物少、刺激性低，被认为是安全的常用耗材；略微吸湿，受潮后打印易拉丝起泡。",
          applications: ["透明/半透明件", "食品接触容器", "外壳", "户外件"],
          drawbacks: ["拉丝较明显", "吸湿后表面起泡", "不耐长期紫外"],
          note: "常规 3D 打印用 PETG 为无定形共聚酯，Tm 一栏留空。官方打印件（Polymaker）：PolyLite PETG 拉伸 50.8 MPa、HDT 78℃、缺口冲击 2.6 kJ/m²；PolyMax PETG 冲击 11.6 kJ/m²。断裂伸长率不同 TDS 差异大（屈服值 3–5% vs 断裂值可达 50%+），取典型打印件区间。",
          sources: [{ name: "Prusa 材料库", url: "https://help.prusa3d.com/materials" }]
        },
        {
          id: "abs", nameCn: "ABS", nameEn: "Acrylonitrile Butadiene Styrene", family: "ABS/ASA",
          color: "#f9a54f",
          tg: [100, 108], tm: null, hdt: [80, 120],
          printTemp: [220, 270], bedTemp: [80, 110],
          tensile: [32, 47], flexural: [55, 75], impact: [10, 25], impactUnit: "kJ/m²", elongation: [3, 25],
          density: [1.03, 1.06], hygroscopic: "中",
          difficulty: 3, warp: "高", enclosure: "建议", drying: "建议 80℃/4h（受潮时）",
          safetyLevel: 1, fumes: "苯乙烯（Styrene）等",
          safetyNote: "ABS 打印时释放苯乙烯等挥发物，气味明显；务必在通风处打印，最好封闭腔体 + 活性炭过滤，长时间打印建议使用过滤器。",
          applications: ["外壳/结构件", "汽车内饰件", "耐用消费品", "模型"],
          drawbacks: ["翘曲明显", "有气味需通风", "层间附着需控温"],
          note: "苯乙烯已被列为可能致癌物（IARC 2B），建议儿童/孕妇远离打印区域。官方打印件（Polymaker）：PolyLite ABS 拉伸 33.4 MPa、HDT 100℃（0.45MPa）、缺口冲击 18 kJ/m²；eSUN ABS 标称 HDT 78℃（载荷未注明）。HDT 高度依赖测试载荷（0.45MPa 95–120℃ / 1.8MPa 78–90℃）。",
          sources: [{ name: "Prusa 材料库", url: "https://help.prusa3d.com/materials" }]
        },
        {
          id: "asa", nameCn: "ASA", nameEn: "Acrylonitrile Styrene Acrylate", family: "ABS/ASA",
          color: "#f9a54f",
          tg: [95, 108], tm: null, hdt: [93, 110],
          printTemp: [220, 260], bedTemp: [90, 110],
          tensile: [35, 48], flexural: [65, 80], impact: [10, 20], impactUnit: "kJ/m²", elongation: [9, 25],
          density: [1.05, 1.13], hygroscopic: "低",
          difficulty: 3, warp: "高", enclosure: "建议", drying: null,
          safetyLevel: 1, fumes: "苯乙烯类（较 ABS 略少）",
          safetyNote: "ASA 与 ABS 类似释放苯乙烯类挥发物，同样需要通风/封闭腔体；耐候性显著优于 ABS。",
          applications: ["户外件", "汽车外饰", "无人机外壳", "太阳能支架"],
          drawbacks: ["打印条件与 ABS 相近", "价格高于 ABS", "气味仍需注意"],
          note: "ASA 以丙烯酸酯替代丁二烯，耐紫外线与耐候性大幅提升，是 ABS 的户外升级版。官方打印件（Polymaker ASA）：拉伸 43.8 MPa、HDT 103℃、缺口冲击 10.3 kJ/m²。",
          sources: [{ name: "Prusa 材料库", url: "https://help.prusa3d.com/materials" }]
        },
        {
          id: "tpu", nameCn: "TPU 95A", nameEn: "Thermoplastic Polyurethane 95A", family: "柔性",
          color: "#c98bf9",
          tg: [-50, -30], tm: null, hdt: null,
          printTemp: [200, 250], bedTemp: [30, 60],
          tensile: [26, 40], flexural: null, impact: [35, 60], impactUnit: "kJ/m²(不断裂)", elongation: [400, 800],
          density: [1.16, 1.24], hygroscopic: "中",
          difficulty: 2, warp: "低", enclosure: "否", drying: "建议 55–65℃/4–8h",
          safetyLevel: 0, fumes: "微量异氰酸酯/多元醇挥发物",
          safetyNote: "TPU 释放物少，一般安全；异氰酸酯仅在严重过热时值得关注，保持基本通风即可。",
          applications: ["减震缓冲", "密封圈/垫", "手机壳", "可穿戴"],
          drawbacks: ["柔性材料需直驱挤出", "打印速度慢", "吸湿后性能下降"],
          note: "95A 指邵氏硬度；Tg 低于室温，故常温下呈弹性体。官方打印件（Polymaker PolyFlex TPU95）：断裂伸长率 551%（eSUN eTPU-95A 标称 ≥800%）。抗冲击常「不断裂」，数值仅供参考；弯曲强度对弹性体无意义故留空。",
          sources: [{ name: "Polymaker 官方", url: "https://polymaker.com/filaments/" }]
        },
        {
          id: "pet", nameCn: "PET", nameEn: "Polyethylene Terephthalate", family: "PET系",
          color: "#22c3a6",
          tg: [70, 80], tm: [245, 260], hdt: [65, 115],
          printTemp: [240, 280], bedTemp: [80, 90],
          tensile: [45, 65], flexural: [75, 90], impact: null, impactUnit: "kJ/m²", elongation: [20, 100],
          density: [1.30, 1.40], hygroscopic: "中",
          difficulty: 4, warp: "高", enclosure: "建议", drying: "建议 65℃/4–6h",
          safetyLevel: 0, fumes: "低挥发（微量乙醛）",
          safetyNote: "PET 释放物少、安全性好；结晶倾向使层间结合需较高腔温。",
          applications: ["透明容器", "耐化学件", "食品接触"],
          drawbacks: ["结晶收缩控制难", "市售牌号较少"],
          note: "PET 为半结晶材料，与 PETG 相比结晶度更高、更硬；结晶收缩导致翘曲与层裂，打印窗口窄，难度显著高于 PETG。退火（100–120℃）后 HDT 可从 65–75℃ 提升至 95–115℃。市售纯 PET 耗材较少，多为 rPET 或 PET-CF。",
          sources: [{ name: "FilamentHub TDS", url: "https://www.filamenthub.com.au/pages/filament-data" }]
        },
        {
          id: "pp", nameCn: "PP", nameEn: "Polypropylene", family: "烯烃",
          color: "#7fd6ff",
          tg: [-15, 0], tm: [160, 170], hdt: [85, 105],
          printTemp: [220, 270], bedTemp: [60, 100],
          tensile: [16, 35], flexural: null, impact: [3, 14], impactUnit: "kJ/m²", elongation: [50, 300],
          density: [0.89, 0.92], hygroscopic: "低",
          difficulty: 4, warp: "高", enclosure: "建议", drying: null,
          safetyLevel: 0, fumes: "低挥发",
          safetyNote: "PP 释放物少、安全性好，常用于食品容器；难点在粘附而非毒性。",
          applications: ["铰链/活页", "耐疲劳件", "化工容器", "食品相关件"],
          drawbacks: ["几乎不粘任何表面（需PP胶带/专用板）", "收缩率大", "易拉丝"],
          note: "密度 <1，可浮于水；难点在第一层粘附（需 PP 专用胶带/板）。收缩率大（1.5–2.5%）导致翘曲明显；断裂伸长率屈服值约 12%、断裂值可达数百%。",
          sources: [{ name: "Prusa 材料库", url: "https://help.prusa3d.com/materials" }]
        },
        {
          id: "pvb", nameCn: "PVB", nameEn: "Polyvinyl Butyral", family: "支撑/精饰",
          color: "#8b9dc3",
          tg: [65, 70], tm: null, hdt: [58, 65],
          printTemp: [200, 235], bedTemp: [70, 80],
          tensile: [45, 57], flexural: [70, 75], impact: [7, 10], impactUnit: "kJ/m²", elongation: [5, 50],
          density: [1.08, 1.12], hygroscopic: "中",
          difficulty: 2, warp: "低", enclosure: "否", drying: "建议 50–60℃/4h",
          safetyLevel: 0, fumes: "低挥发",
          safetyNote: "PVB 释放物少，安全性好；可用乙醇蒸汽抛光获得光滑表面。",
          applications: ["光滑外观件", "蒸汽抛光装饰件", "展示模型"],
          drawbacks: ["强度一般", "抛光需额外设备"],
          note: "Polymaker PolySmooth 即 PVB 材料。Prusament PVB 官方 TDS：拉伸屈服 50–57 MPa、夏比缺口冲击 7–10 kJ/m²、HDT 63℃（0.45MPa）。",
          sources: [{ name: "Polymaker 官方", url: "https://polymaker.com/filaments/" }]
        },
        {
          id: "hips", nameCn: "HIPS", nameEn: "High Impact Polystyrene", family: "支撑/精饰",
          color: "#8b9dc3",
          tg: [95, 105], tm: null, hdt: [85, 100],
          printTemp: [225, 270], bedTemp: [95, 115],
          tensile: [25, 40], flexural: [35, 50], impact: [6, 20], impactUnit: "kJ/m²", elongation: [30, 60],
          density: [1.03, 1.06], hygroscopic: "低",
          difficulty: 3, warp: "高", enclosure: "建议", drying: null,
          safetyLevel: 1, fumes: "苯乙烯（Styrene）",
          safetyNote: "HIPS 与 ABS 同为苯乙烯系，释放苯乙烯，需通风/封闭腔体；主要用作 ABS 的可溶性支撑（柠檬烯溶解）。",
          applications: ["ABS 可溶性支撑", "轻质件", "发泡效果件"],
          drawbacks: ["气味同 ABS", "单独使用场景少"],
          note: "与 ABS 配合使用，支撑可溶于柠檬烯（d-Limonene）。",
          sources: [{ name: "Prusa 材料库", url: "https://help.prusa3d.com/materials" }]
        },
        {
          id: "pva", nameCn: "PVA", nameEn: "Polyvinyl Alcohol", family: "支撑/精饰",
          color: "#8b9dc3",
          tg: [60, 85], tm: [180, 230], hdt: null,
          printTemp: [180, 230], bedTemp: [45, 65],
          tensile: [20, 30], flexural: null, impact: null, impactUnit: "kJ/m²", elongation: [20, 300],
          density: [1.23, 1.27], hygroscopic: "极高",
          difficulty: 3, warp: "低", enclosure: "否", drying: "必需 45–55℃/4–8h，密封防潮",
          safetyLevel: 0, fumes: "低挥发（水溶性材料）",
          safetyNote: "PVA 水溶性、无毒，是最安全的支撑材料之一；但极易吸湿，受潮后挤出冒泡断料。",
          applications: ["水溶性支撑", "复杂悬空结构", "双色打印"],
          drawbacks: ["极吸湿，需干燥箱+密封", "价格较高", "支撑强度低"],
          note: "与水溶性打印面配合使用效果最佳；部分牌号含硼交联结构。Tg/Tm 随水解度变化（88% 水解 Tg 60–70℃/Tm 180–200℃；完全水解 Tg 约 85℃/Tm 220–230℃），伸长率测试条件差异大（eSUN 标称 360%）。",
          sources: [{ name: "Prusa 材料库", url: "https://help.prusa3d.com/materials" }]
        },
        {
          id: "pla-silk", nameCn: "PLA Silk", nameEn: "Silk PLA（丝绸光泽）", family: "PLA系",
          color: "#4f9cf9",
          tg: [55, 65], tm: [150, 180], hdt: [50, 60],
          printTemp: [190, 230], bedTemp: [25, 60],
          tensile: [30, 45], flexural: [44, 70], impact: [3, 14], impactUnit: "kJ/m²", elongation: [5, 30],
          density: [1.20, 1.25], hygroscopic: "中",
          difficulty: 1, warp: "低", enclosure: "否", drying: "建议 50–55℃/6–8h",
          safetyLevel: 0, fumes: "乳酸类微量挥发物（与PLA相同）",
          safetyNote: "PLA Silk 为 PLA 与弹性体共混的改性料，释放物与普通 PLA 相当，安全性好；光泽对打印方向敏感。",
          applications: ["丝绸光泽装饰件", "展示模型", "礼品手办", "艺术摆件"],
          drawbacks: ["韧性低于普通 PLA", "光泽依赖打印方向与温度", "拉丝略多"],
          note: "官方实测：eSUN ePLA-Silk TDS 拉伸 32.5 MPa、Izod 缺口冲击 2.93 kJ/m²（X-Y）；Polymaker Panchroma Silk 冲击 13.8 kJ/m²——冲击差异为缺口/无缺口测试方法不同所致。",
          sources: [{ name: "Polymaker 官方技术数据一览", url: "https://wiki.polymaker.com/polymaker-wiki/polymaker-wiki-zh/polymaker-chan-pin/polymaker-filaments/technical-data-at-a-glance.md" }]
        },
        {
          id: "pla-wood", nameCn: "木质 PLA", nameEn: "Wood-Filled PLA", family: "PLA系",
          color: "#4f9cf9",
          tg: [55, 65], tm: [150, 180], hdt: [50, 60],
          printTemp: [200, 235], bedTemp: [55, 65],
          tensile: [30, 45], flexural: [50, 70], impact: [4, 16], impactUnit: "kJ/m²", elongation: [3, 10],
          density: [1.15, 1.25], hygroscopic: "高",
          difficulty: 2, warp: "低", enclosure: "否", drying: "建议 55–65℃/8h",
          safetyLevel: 0, fumes: "乳酸类微量挥发物 + 木粉烧焦气味",
          safetyNote: "木质 PLA 含 20–30% 木粉，打印时轻微木材烧焦气味，基本安全；打磨产生木粉粉尘，建议戴口罩。",
          applications: ["木纹外观装饰件", "模型底座与场景", "艺术摆件", "概念模型"],
          drawbacks: ["木粉易堵喷嘴（建议 0.5mm+ 硬化喷嘴）", "强度低于纯 PLA", "表面粗糙需打磨/上漆"],
          note: "木粉含量各品牌不一（常见 20–30%）。官方实测（eSUN PLA-Wood TDS，X-Y）：拉伸 39.7 MPa、Izod 缺口冲击 15.9 kJ/m²、HDT 50℃（0.45MPa）。",
          sources: [{ name: "All3DP", url: "https://all3dp.com/1/3d-printer-filament-types-3d-printing-3d-filament/" }]
        },
        {
          id: "tpe", nameCn: "TPE", nameEn: "Thermoplastic Elastomer (83A类)", family: "柔性",
          color: "#c98bf9",
          tg: null, tm: null, hdt: null,
          printTemp: [220, 250], bedTemp: [45, 60],
          tensile: [15, 50], flexural: null, impact: [40, 70], impactUnit: "kJ/m²(不断裂)", elongation: [400, 700],
          density: [1.10, 1.20], hygroscopic: "高",
          difficulty: 3, warp: "低", enclosure: "否", drying: "建议 55℃/4h",
          safetyLevel: 0, fumes: "微量异氰酸酯类/VOC（气味小）",
          safetyNote: "TPE 释放物少，一般安全；邵氏硬度约 83A–87A，比 TPU 95A 更软，必须直驱/近端挤出机+慢速打印。",
          applications: ["软质密封件", "减震缓冲", "可穿戴", "手机壳"],
          drawbacks: ["软料送料困难，需直驱低速", "易拉丝/堵头", "吸湿后表面变差"],
          note: "eSUN 官方 TDS（eFlex-TPU-87A / Elastic-TPE-83A）：注塑样条拉伸 52 MPa、断裂伸长 500%，打印件因层间结合显著更低；官方未公布 Tg/Tm/HDT。",
          sources: [{ name: "eSUN 官方", url: "https://www.esun3d.com/flexibility-elasticity/" }]
        },
        {
          id: "petg-cf", nameCn: "PETG-CF", nameEn: "Carbon Fiber PETG", family: "PET系",
          color: "#22c3a6",
          tg: [70, 80], tm: null, hdt: [65, 80],
          printTemp: [240, 270], bedTemp: [60, 90],
          tensile: [50, 63], flexural: [77, 95], impact: [4, 8], impactUnit: "kJ/m²", elongation: [4, 10],
          density: [1.25, 1.30], hygroscopic: "中",
          difficulty: 2, warp: "低", enclosure: "否", drying: "建议 65℃/4–8h",
          safetyLevel: 1, fumes: "低挥发 + 碳纤维粉尘（打磨时）",
          safetyNote: "释放物与 PETG 相当，建议通风；切割/打磨产生导电碳纤维粉尘，务必戴口罩、手套并远离电子设备。",
          applications: ["轻量化支架", "外壳结构件", "工业夹具", "无人机部件"],
          drawbacks: ["磨喷嘴（需硬化钢，HRC40+）", "比 PETG 脆", "表面哑光带纤维纹理"],
          note: "三产品官方交叉：Polymaker PETG-rCF08 拉伸 59.8/HDT 68.6、拓竹 PETG-CF 拉伸 59±4/HDT 74、eSUN ePETG-CF 拉伸 51.3/HDT 70；冲击方法差异大（缺口 4–5 vs 无缺口 41.2 kJ/m²），表内取缺口值。",
          sources: [{ name: "Polymaker 官方技术数据一览", url: "https://wiki.polymaker.com/polymaker-wiki/polymaker-wiki-zh/polymaker-chan-pin/polymaker-filaments/technical-data-at-a-glance.md" }]
        },
        {
          id: "bvoh", nameCn: "BVOH", nameEn: "Butenediol Vinyl Alcohol", family: "支撑/精饰",
          color: "#8b9dc3",
          tg: [60, 75], tm: [170, 210], hdt: null,
          printTemp: [190, 220], bedTemp: [40, 70],
          tensile: [20, 45], flexural: [60, 75], impact: null, impactUnit: "kJ/m²", elongation: [9, 50],
          density: [1.10, 1.20], hygroscopic: "极高",
          difficulty: 2, warp: "中", enclosure: "否", drying: "必需 60℃/12h（Bambu AMS HT 官方），密封防潮",
          safetyLevel: 0, fumes: "低挥发（水溶性材料）",
          safetyNote: "BVOH 水溶性、无特殊毒性（非食品接触级）；加热可能释放微量乙酸/乙醛类分解物，常规通风即可。",
          applications: ["水溶性支撑（多材料兼容）", "复杂内腔结构", "多色打印"],
          drawbacks: ["极吸湿，开封即需干燥密封", "价格昂贵、溶解需数小时", "与部分材料（如PETG）配合效果不佳"],
          note: "Bambu 官方未发布完整 TDS：打印/干燥参数取自官方 Bambu Studio 配置（喷嘴 220℃、AMS HT 干燥 60℃×12h）；物性（密度 1.14、Tg 68℃、Tm 176℃、拉伸 45 MPa）为 Verbatim BVOH 官方 TDS 同类参考值。",
          sources: [{ name: "Bambu Lab Wiki", url: "https://wiki.bambulab.com/zh/filament/bvoh" }]
        }
      ]
    },

    /* ===================== 工程耗材区 ===================== */
    {
      id: "engineering",
      name: "工程耗材",
      nameCn: "工程耗材区",
      desc: "面向功能性/工业级应用的高性能材料：PC、PA（尼龙）家族、POM、PPS、PEEK、PEI 等。性能上限高，但对打印机（高温、封闭腔体）、干燥与后处理要求苛刻。",
      materials: [
        {
          id: "pc", nameCn: "PC", nameEn: "Polycarbonate", family: "PC",
          color: "#f9685f",
          tg: [145, 150], tm: null, hdt: [110, 140],
          printTemp: [250, 310], bedTemp: [90, 120],
          tensile: [55, 70], flexural: [80, 100], impact: [3, 10], impactUnit: "kJ/m²", elongation: [3, 15],
          density: [1.19, 1.21], hygroscopic: "高",
          difficulty: 4, warp: "中", enclosure: "建议", drying: "建议 80–100℃/4–8h",
          safetyLevel: 1, fumes: "高温下微量双酚A类/碳酸酯挥发物",
          safetyNote: "PC 打印温度高（250–310℃），释放物浓度高于 PLA/PETG，务必通风；双酚A（BPA）相关物在高温下值得关注，长时间打印建议加过滤。",
          applications: ["透明耐热件", "防弹级防护件", "机械结构件", "电气外壳"],
          drawbacks: ["吸湿极敏感", "层间结合需高温腔", "易开裂"],
          note: "PC 层间结合依赖腔温，低温打印件强度大幅下降。Polymaker PolyLite PC 实测（打印件）：拉伸 62.7 MPa、断裂伸长率仅 3.2%、缺口冲击 3.4 kJ/m²、Tg 约 113℃（共混配方），注塑级 PC 数值显著高于打印件。",
          sources: [{ name: "Prusa 材料库", url: "https://help.prusa3d.com/materials" }]
        },
        {
          id: "pa6", nameCn: "PA6", nameEn: "Nylon 6 / Polyamide 6", family: "尼龙PA",
          color: "#f2c94c",
          tg: [40, 60], tm: [220, 225], hdt: [55, 80],
          printTemp: [245, 290], bedTemp: [70, 110],
          tensile: [45, 70], flexural: [65, 90], impact: [5, 12], impactUnit: "kJ/m²", elongation: [20, 100],
          density: [1.12, 1.15], hygroscopic: "极高",
          difficulty: 4, warp: "中", enclosure: "建议", drying: "必需 80℃/4–8h，打印中防潮",
          safetyLevel: 1, fumes: "己内酰胺（Caprolactam）等",
          safetyNote: "PA6 打印释放己内酰胺（刺激性、需通风），吸湿后释放加剧；务必通风+干燥。",
          applications: ["齿轮", "卡扣", "耐磨滑动件", "工具手柄"],
          drawbacks: ["吸湿极快（数小时即受影响）", "需干燥箱", "层间强度一般"],
          note: "己内酰胺粉尘/蒸气对皮肤与呼吸道有刺激性，长期暴露需防护。干态缺口冲击低（5–12 kJ/m²），吸湿后韧性大幅上升。",
          sources: [{ name: "Prusa 材料库", url: "https://help.prusa3d.com/materials" }]
        },
        {
          id: "pa12", nameCn: "PA12", nameEn: "Nylon 12 / Polyamide 12", family: "尼龙PA",
          color: "#f2c94c",
          tg: [40, 55], tm: [175, 180], hdt: [40, 55],
          printTemp: [240, 280], bedTemp: [70, 110],
          tensile: [45, 55], flexural: [55, 70], impact: [6, 15], impactUnit: "kJ/m²", elongation: [50, 250],
          density: [1.00, 1.02], hygroscopic: "中",
          difficulty: 3, warp: "低", enclosure: "建议", drying: "建议 70–80℃/4–8h",
          safetyLevel: 0, fumes: "内酰胺类（较PA6少）",
          safetyNote: "PA12 释放物较 PA6 少但仍需通风；吸湿性显著低于 PA6，是尼龙家族中最好打印的品种之一。",
          applications: ["柔性耐疲劳件", "卡扣/铰链", "精密齿轮", "运动器材"],
          drawbacks: ["强度低于 PA6", "价格较高", "仍需防潮"],
          note: "PA12 尺寸稳定性与低吸湿性优于 PA6，适合精细件。",
          sources: [{ name: "Prusa 材料库", url: "https://help.prusa3d.com/materials" }]
        },
        {
          id: "pa66", nameCn: "PA66", nameEn: "Nylon 66 / Polyamide 66", family: "尼龙PA",
          color: "#f2c94c",
          tg: [50, 70], tm: [255, 265], hdt: [75, 90],
          printTemp: [270, 300], bedTemp: [90, 120],
          tensile: [50, 80], flexural: [80, 100], impact: [4, 10], impactUnit: "kJ/m²", elongation: [20, 60],
          density: [1.13, 1.15], hygroscopic: "极高",
          difficulty: 5, warp: "高", enclosure: "必需", drying: "必需 80℃/4–8h",
          safetyLevel: 1, fumes: "己内酰胺等内酰胺类",
          safetyNote: "PA66 打印温度高、释放物需通风处理；吸湿同样极快。",
          applications: ["高强度结构件", "高温耐磨齿轮", "汽车件"],
          drawbacks: ["打印温度高", "极吸湿", "需硬化钢喷嘴"],
          note: "PA66 强度与耐热高于 PA6，但打印条件更苛刻，市售耗材较少；多数数据源于注塑级树脂，打印件强度通常更低。",
          sources: [{ name: "All3DP", url: "https://all3dp.com/1/3d-printer-filament-types-3d-printing-3d-filament/" }]
        },
        {
          id: "pa-cf", nameCn: "PA-CF", nameEn: "Carbon Fiber Reinforced Nylon", family: "尼龙PA",
          color: "#f2c94c",
          tg: [40, 60], tm: [175, 225], hdt: [90, 215],
          printTemp: [250, 300], bedTemp: [80, 120],
          tensile: [80, 130], flexural: [120, 200], impact: [3, 10], impactUnit: "kJ/m²", elongation: [2, 15],
          density: [1.08, 1.40], hygroscopic: "极高",
          difficulty: 4, warp: "低", enclosure: "建议", drying: "必需 80–90℃/4–8h",
          safetyLevel: 1, fumes: "己内酰胺 + 碳纤维粉尘",
          safetyNote: "PA-CF 兼具尼龙释放物与碳纤维粉尘问题：打印需通风，打磨需口罩；同时必须使用硬化钢/红宝石喷嘴。",
          applications: ["无人机结构件", "汽车轻量化件", "高强度支架", "工业夹具"],
          drawbacks: ["磨喷嘴", "极吸湿", "价格高"],
          note: "数值为 PA6-CF 与 PA12-CF 合并区间：PA6-CF（如拓竹 PAHT-CF、Polymaker Fiberon PA6-CF20）Tm 约 220–225℃、HDT 0.45MPa 约 190–215℃、拉伸 100–130 MPa；PA12-CF（Fiberon PA12-CF10）Tm 约 175–180℃、HDT 约 131℃、拉伸约 77 MPa。翘曲：PA12-CF 更低，PA6-CF 中等。",
          sources: [{ name: "Bambu Lab Wiki", url: "https://wiki.bambulab.com/en/filament" }]
        },
        {
          id: "pom", nameCn: "POM", nameEn: "Polyoxymethylene / Acetal", family: "POM",
          color: "#7fd6ff",
          tg: [-60, -30], tm: [165, 175], hdt: [100, 110],
          printTemp: [195, 235], bedTemp: [90, 120],
          tensile: [45, 70], flexural: [70, 100], impact: [5, 8], impactUnit: "kJ/m²", elongation: [15, 75],
          density: [1.40, 1.42], hygroscopic: "低",
          difficulty: 4, warp: "高", enclosure: "建议", drying: "建议 80–90℃/2–4h",
          safetyLevel: 2, fumes: "甲醛（Formaldehyde）",
          safetyNote: "POM 高温分解会释放甲醛（致癌物），打印时务必强通风/过滤，避免长时间过热喷嘴；这是 POM 打印最重要的安全点。",
          applications: ["齿轮", "轴承/滑轮", "卡扣", "精密传动件"],
          drawbacks: ["收缩/翘曲大", "高温释放甲醛", "粘附性差"],
          note: "POM 自润滑、耐磨，是传动件首选；但过热（约 240℃以上）会快速降解释放甲醛，必须控制温度。均聚/共聚熔点略有差异（165–175℃）。",
          sources: [{ name: "Filament Cheat Sheet", url: "https://filamentcheatsheet.com/filaments/pom/" }]
        },
        {
          id: "pbt", nameCn: "PBT", nameEn: "Polybutylene Terephthalate", family: "PBT",
          color: "#7fd6ff",
          tg: [40, 55], tm: [220, 225], hdt: [55, 70],
          printTemp: [230, 260], bedTemp: [70, 100],
          tensile: [45, 60], flexural: [80, 90], impact: [3, 6], impactUnit: "kJ/m²", elongation: [50, 200],
          density: [1.30, 1.31], hygroscopic: "低",
          difficulty: 3, warp: "中", enclosure: "建议", drying: "建议 80–100℃/4h（防水解）",
          safetyLevel: 0, fumes: "低挥发（酯类）",
          safetyNote: "PBT 释放物少，安全性尚可；但打印温度偏高，保持通风即可。",
          applications: ["电气件", "耐化学容器", "汽车传感器壳"],
          drawbacks: ["结晶收缩控制难", "市售耗材较少"],
          note: "PBT 与 PET 同族，耐化学性与电绝缘性好，属于小众工程料。",
          sources: [{ name: "All3DP", url: "https://all3dp.com/1/3d-printer-filament-types-3d-printing-3d-filament/" }]
        },
        {
          id: "pps", nameCn: "PPS", nameEn: "Polyphenylene Sulfide", family: "高温PPS",
          color: "#f9685f",
          tg: [85, 95], tm: [280, 285], hdt: [100, 135],
          printTemp: [300, 360], bedTemp: [130, 160],
          tensile: [60, 75], flexural: [95, 120], impact: [2, 6], impactUnit: "kJ/m²", elongation: [2, 10],
          density: [1.34, 1.36], hygroscopic: "低",
          difficulty: 5, warp: "中", enclosure: "必需", drying: "建议 110–150℃/4h",
          safetyLevel: 2, fumes: "高温含硫气体（H₂S/SO₂）",
          safetyNote: "PPS 打印温度 300℃+，释放物浓度高且成分复杂，必须高温封闭腔体+强通风+过滤，腔温常需 100℃+。",
          applications: ["航空航天", "化工耐腐蚀件", "高温电气", "半导体夹具"],
          drawbacks: ["需高温工程机", "需硬化喷嘴", "价格高"],
          note: "PPS 耐化学腐蚀与阻燃性极佳；打印几乎必须 300℃+ 热端与高温腔。未增强料典型值，CF/GF 增强后拉伸可达 100–150 MPa。",
          sources: [{ name: "Bambu Lab Wiki", url: "https://wiki.bambulab.com/en/filament" }]
        },
        {
          id: "ppsu", nameCn: "PPSU", nameEn: "Polyphenylsulfone", family: "高温PSU",
          color: "#f9685f",
          tg: [215, 225], tm: null, hdt: [190, 215],
          printTemp: [330, 390], bedTemp: [130, 160],
          tensile: [65, 75], flexural: [85, 105], impact: [50, 70], impactUnit: "kJ/m²(约算)", elongation: [60, 90],
          density: [1.29, 1.30], hygroscopic: "中",
          difficulty: 5, warp: "低", enclosure: "必需", drying: "建议 135–150℃/4h",
          safetyLevel: 1, fumes: "高温芳香族挥发物",
          safetyNote: "PPSU 无定形、耐热极高，但 340℃+ 打印必须封闭腔体+强通风+过滤。",
          applications: ["医疗灭菌件", "航空件", "高温电气"],
          drawbacks: ["价格极高", "需顶级高温机", "小众"],
          note: "PPSU 无定形、翘曲小，可蒸汽灭菌，用于医疗/食品级高温场景；抗冲击为注塑级 IZOD 值约算（600–700 J/m），打印件通常更低。",
          sources: [{ name: "Bambu Lab Wiki", url: "https://wiki.bambulab.com/en/filament" }]
        },
        {
          id: "peek", nameCn: "PEEK", nameEn: "Polyether Ether Ketone", family: "高温PEEK/PEKK",
          color: "#f9685f",
          tg: [143, 150], tm: [340, 345], hdt: [150, 160],
          printTemp: [360, 430], bedTemp: [120, 160],
          tensile: [90, 100], flexural: [140, 165], impact: [4, 10], impactUnit: "kJ/m²", elongation: [20, 50],
          density: [1.30, 1.32], hygroscopic: "低",
          difficulty: 5, warp: "中", enclosure: "必需", drying: "建议 120–150℃/4–6h",
          safetyLevel: 3, fumes: "高温芳香族挥发物（浓度显著）",
          safetyNote: "PEEK 需 350℃+ 打印与高温腔（腔温 90–160℃），高温释放物与超细颗粒浓度高，必须使用封闭腔体+HEPA/活性炭过滤+强通风，是打印安全要求最高的材料之一。",
          applications: ["医疗植入", "航空航天", "半导体", "高性能机械件"],
          drawbacks: ["价格昂贵（数倍于常规料）", "需专用高温机", "需退火后处理"],
          note: "PEEK 打印需全程高温环境（腔温常需 90–160℃），层间结晶度决定最终强度，通常需退火；HDT 为 1.82MPa 载荷值（0.45MPa 下约 290–315℃）。缺口冲击为注塑级典型值，打印件更低。",
          sources: [{ name: "Prusa 材料库", url: "https://help.prusa3d.com/materials" }]
        },
        {
          id: "pekk", nameCn: "PEKK", nameEn: "Polyetherketoneketone", family: "高温PEEK/PEKK",
          color: "#f9685f",
          tg: [147, 162], tm: [300, 330], hdt: [140, 170],
          printTemp: [340, 390], bedTemp: [120, 150],
          tensile: [85, 100], flexural: [130, 150], impact: [5, 10], impactUnit: "kJ/m²", elongation: [10, 30],
          density: [1.28, 1.30], hygroscopic: "低",
          difficulty: 5, warp: "中", enclosure: "必需", drying: "建议 120℃/4h",
          safetyLevel: 3, fumes: "高温芳香族挥发物",
          safetyNote: "PEKK 与 PEEK 同级安全要求：高温腔+强通风+过滤。",
          applications: ["航空结构件", "碳纤复合", "油气工业"],
          drawbacks: ["价格极高", "需高温机", "小众"],
          note: "PEKK 结晶速率比 PEEK 慢，层间结合控制是难点。",
          sources: [{ name: "Prusa 材料库", url: "https://help.prusa3d.com/materials" }]
        },
        {
          id: "pei", nameCn: "PEI", nameEn: "Polyetherimide (ULTEM)", family: "高温PSU",
          color: "#f9685f",
          tg: [215, 217], tm: null, hdt: [190, 200],
          printTemp: [340, 390], bedTemp: [130, 160],
          tensile: [70, 85], flexural: [130, 145], impact: [4, 8], impactUnit: "kJ/m²", elongation: [25, 60],
          density: [1.27, 1.28], hygroscopic: "中",
          difficulty: 5, warp: "低", enclosure: "必需", drying: "建议 130–150℃/4h",
          safetyLevel: 2, fumes: "高温芳香族挥发物",
          safetyNote: "PEI 释放物浓度高（芳香族），必须封闭腔体+过滤+强通风；吸湿也需严格控制。",
          applications: ["航空航天内饰", "高温电气", "汽车", "医疗"],
          drawbacks: ["价格高", "需高温封闭腔", "吸湿"],
          note: "ULTEM 1010/9085 为通用电气（SABIC）商品名，PEI 是材料通称；1010 伸长率约 60%，9085（航空级）约 6%。",
          sources: [{ name: "Prusa 材料库", url: "https://help.prusa3d.com/materials" }]
        },
        {
          id: "pvdf", nameCn: "PVDF", nameEn: "Polyvinylidene Fluoride", family: "PVDF",
          color: "#7fd6ff",
          tg: [-40, -35], tm: [160, 175], hdt: [55, 90],
          printTemp: [220, 260], bedTemp: [70, 100],
          tensile: [35, 50], flexural: [55, 70], impact: [15, 40], impactUnit: "kJ/m²(约算)", elongation: [50, 300],
          density: [1.75, 1.78], hygroscopic: "低",
          difficulty: 4, warp: "高", enclosure: "建议", drying: "建议 70–80℃/2–4h",
          safetyLevel: 2, fumes: "过温时氟化氢（HF）风险",
          safetyNote: "PVDF 正常打印释放物少；但一旦严重过热（>300℃）可能释放氟化氢，必须控温并保持通风，切勿空烧。",
          applications: ["化工耐腐蚀管路", "压电/传感器件", "户外耐候件"],
          drawbacks: ["过热有HF风险", "价格较高", "小众"],
          note: "PVDF 耐化学腐蚀性极佳，用于化工与压电应用。",
          sources: [{ name: "Polymaker 官方", url: "https://polymaker.com/filaments/" }]
        },
        {
          id: "pc-abs", nameCn: "PC-ABS", nameEn: "Polycarbonate/ABS Blend", family: "PC",
          color: "#f9685f",
          tg: [105, 120], tm: null, hdt: [106, 112],
          printTemp: [250, 270], bedTemp: [90, 105],
          tensile: [40, 50], flexural: [66, 85], impact: [20, 30], impactUnit: "kJ/m²", elongation: [4, 10],
          density: [1.08, 1.12], hygroscopic: "中",
          difficulty: 3, warp: "高", enclosure: "建议", drying: "建议 75℃/6h",
          safetyLevel: 1, fumes: "苯乙烯 + 高温微量双酚A类",
          safetyNote: "PC-ABS 同时含 ABS 的苯乙烯释放与 PC 的高温释放物，务必通风，建议封闭腔体+过滤；综合了 PC 的耐热与 ABS 的韧性。",
          applications: ["汽车内外饰", "电子产品外壳", "耐冲击结构件", "电镀装饰件"],
          drawbacks: ["翘曲收缩大，建议封闭舱", "打印温度高，需全金属热端", "吸湿需干燥，建议退火"],
          note: "Polymaker PC-ABS 官方 TDS V5.4（打印件实测）：拉伸 39.9–42.3 MPa、HDT 106–112℃（载荷 1.8/0.45MPa）、Charpy 缺口冲击 25.8 kJ/m²、Tg 109℃、伸长率 4.2%。",
          sources: [{ name: "Polymaker 官方技术数据一览", url: "https://wiki.polymaker.com/polymaker-wiki/polymaker-wiki-zh/polymaker-chan-pin/polymaker-filaments/technical-data-at-a-glance.md" }]
        },
        {
          id: "pa12-cf", nameCn: "PA12-CF", nameEn: "Carbon Fiber Nylon 12", family: "尼龙PA",
          color: "#f2c94c",
          tg: [45, 60], tm: [170, 180], hdt: [105, 131],
          printTemp: [280, 300], bedTemp: [40, 60],
          tensile: [70, 90], flexural: [92, 115], impact: [8, 12], impactUnit: "kJ/m²", elongation: [4, 8],
          density: [1.03, 1.08], hygroscopic: "高",
          difficulty: 3, warp: "低", enclosure: "否", drying: "必需 100℃/10h",
          safetyLevel: 1, fumes: "内酰胺类 + 碳纤维粉尘",
          safetyNote: "PA12-CF 释放物与尼龙相当（比 PA6 少），高温打印建议通风；碳纤粉尘需防护。",
          applications: ["轻量化结构件", "无人机部件", "工装夹具", "耐磨传动件"],
          drawbacks: ["打印后需退火+调湿才获全强度", "需 280℃+ 热端与硬化喷嘴", "断裂伸长率低、偏脆"],
          note: "Fiberon PA12-CF10 官方 TDS V1.1：拉伸 71.7–77.4 MPa（干态退火样）、HDT 105–131℃（1.8/0.45MPa）、Charpy 缺口冲击 9.9–10.2 kJ/m²、密度 1.06；官方热床仅 40–50℃（低翘曲设计），退火 100℃/16h + 调湿 48h。",
          sources: [{ name: "Polymaker 官方技术数据一览", url: "https://wiki.polymaker.com/polymaker-wiki/polymaker-wiki-zh/polymaker-chan-pin/polymaker-filaments/technical-data-at-a-glance.md" }]
        },
        {
          id: "pet-cf", nameCn: "PET-CF", nameEn: "Carbon Fiber PET", family: "PET系",
          color: "#22c3a6",
          tg: [75, 85], tm: [240, 260], hdt: [105, 150],
          printTemp: [270, 300], bedTemp: [70, 80],
          tensile: [60, 80], flexural: [105, 140], impact: [4, 8], impactUnit: "kJ/m²", elongation: [2, 6],
          density: [1.30, 1.35], hygroscopic: "中",
          difficulty: 3, warp: "低", enclosure: "否", drying: "必需 100℃/10h",
          safetyLevel: 1, fumes: "低挥发 + 碳纤维粉尘",
          safetyNote: "PET-CF 释放物少，建议通风；碳纤粉尘需防护。性能高度依赖退火（120℃/10h）。",
          applications: ["高刚度结构件", "耐化学件", "工装夹具", "耐热外壳"],
          drawbacks: ["需硬化喷嘴", "脆性大（伸长率仅 2.4%）", "退火才能获得高 HDT"],
          note: "Fiberon PET-CF17 官方 TDS V1.0（退火样 120℃/10h）：拉伸 65.9 MPa、HDT 105–147.5℃（1.8/0.45MPa）、Charpy 缺口冲击 5.1 kJ/m²、密度 1.34；拓竹 PET-CF 未退火 HDT 约 87℃。",
          sources: [{ name: "Polymaker 官方技术数据一览", url: "https://wiki.polymaker.com/polymaker-wiki/polymaker-wiki-zh/polymaker-chan-pin/polymaker-filaments/technical-data-at-a-glance.md" }]
        },
        {
          id: "pps-cf", nameCn: "PPS-CF", nameEn: "Carbon Fiber PPS", family: "高温PPS",
          color: "#f9685f",
          tg: [90, 100], tm: [279, 285], hdt: [133, 255],
          printTemp: [310, 350], bedTemp: [80, 90],
          tensile: [55, 75], flexural: [94, 120], impact: [4, 8], impactUnit: "kJ/m²", elongation: [1, 4],
          density: [1.25, 1.30], hygroscopic: "低",
          difficulty: 5, warp: "低", enclosure: "否", drying: "建议 100℃/10h",
          safetyLevel: 2, fumes: "高温含硫气体（H₂S/SO₂）+ 碳纤维粉尘",
          safetyNote: "PPS-CF 需 310–350℃ 打印，释放含硫气体与 VOC，强烈建议通风+高效过滤（UL94 V0 阻燃）；碳纤粉尘需防护。",
          applications: ["航空航天", "化工耐腐蚀结构件", "半导体夹具", "高温电气"],
          drawbacks: ["需 310℃+ 高温热端", "线材在盘上脆、易断", "打印后必须退火 125℃/16h"],
          note: "Fiberon PPS-CF10 官方 TDS V1.1：拉伸 59.4 MPa、HDT 133–252.5℃（1.8/0.45MPa 载荷）、Charpy 缺口冲击 5.3 kJ/m²、密度 1.29、Tg 97.7℃；官方无需加热舱（拓竹 PPS-CF 则要求封闭腔体）。",
          sources: [{ name: "Polymaker 官方技术数据一览", url: "https://wiki.polymaker.com/polymaker-wiki/polymaker-wiki-zh/polymaker-chan-pin/polymaker-filaments/technical-data-at-a-glance.md" }]
        },
        {
          id: "ppa-cf", nameCn: "PPA-CF", nameEn: "Carbon Fiber PPA (Polyphthalamide)", family: "PPA",
          color: "#f9685f",
          tg: [120, 130], tm: [255, 265], hdt: [150, 227],
          printTemp: [280, 310], bedTemp: [100, 120],
          tensile: [120, 170], flexural: [200, 210], impact: [10, 42], impactUnit: "kJ/m²", elongation: [2, 6],
          density: [1.25, 1.30], hygroscopic: "高",
          difficulty: 4, warp: "低", enclosure: "必需", drying: "必需 100–140℃/8–12h",
          safetyLevel: 1, fumes: "酰胺类 VOC + 碳纤维粉尘",
          safetyNote: "PPA-CF 打印温度高（280–310℃），官方要求通风良好或装过滤/排气；打印环境湿度须 <20%RH；碳纤粉尘需防护。",
          applications: ["汽车结构件", "无人机/机械臂", "工业精密件", "金属替代件"],
          drawbacks: ["必须封闭腔体打印机", "极吸湿，需严格干燥", "需硬化喷嘴与胶水辅助附着"],
          note: "拓竹官方（wiki + TDS 镜像交叉）：拉伸 168±4 MPa、弯曲 208±6 MPa、HDT 227℃（0.45MPa）、冲击 41.7 kJ/m²（官方未注明缺口方式）、Tm 258℃、密度 1.25；吸湿率比普通 PA6-CF 低 66%。",
          sources: [{ name: "Bambu Lab Wiki", url: "https://wiki.bambulab.com/zh/filament/ppacf" }]
        },
        {
          id: "peba", nameCn: "PEBA", nameEn: "Polyether Block Amide", family: "柔性",
          color: "#c98bf9",
          tg: null, tm: null, hdt: null,
          printTemp: [230, 260], bedTemp: [40, 90],
          tensile: [16, 35], flexural: null, impact: [40, 70], impactUnit: "kJ/m²(不断裂)", elongation: [400, 900],
          density: [1.00, 1.05], hygroscopic: "高",
          difficulty: 3, warp: "低", enclosure: "否", drying: "建议 60℃/8h 或 70℃/5h",
          safetyLevel: 0, fumes: "低气味低 VOC",
          safetyNote: "PEBA（聚醚嵌段酰胺）为高性能弹性体，释放物少；建议使用全新热端（勿用打印过碳纤料的热端）。",
          applications: ["运动鞋中底", "可穿戴设备", "减震结构", "医疗康复辅具"],
          drawbacks: ["价格昂贵", "柔性材料打印窗口窄", "吸湿需干燥"],
          note: "eSUN PEBA-85A 官方：密度 1.05、回弹率最高 70%、使用温度 -40~90℃；喷嘴温度官方未公开，取同系 PEBA-90A 官方值（230–260℃）与 Siraya Rebound PEBA-85A 交叉。",
          sources: [{ name: "eSUN 官方", url: "https://www.esun3d.com/flexibility-elasticity/" }]
        },
        {
          id: "asa-cf", nameCn: "ASA-CF", nameEn: "Carbon Fiber ASA", family: "ABS/ASA",
          color: "#f9a54f",
          tg: [100, 108], tm: null, hdt: [100, 110],
          printTemp: [240, 270], bedTemp: [100, 110],
          tensile: [40, 55], flexural: [80, 105], impact: [5, 8], impactUnit: "kJ/m²", elongation: [2, 6],
          density: [1.07, 1.15], hygroscopic: "低",
          difficulty: 4, warp: "中", enclosure: "建议", drying: "建议 80℃/4h",
          safetyLevel: 1, fumes: "苯乙烯类 + 碳纤维粉尘",
          safetyNote: "ASA-CF 兼具 ASA 的苯乙烯释放与碳纤粉尘问题，需通风；刚性显著提升、韧性下降。",
          applications: ["户外结构件", "无人机外壳", "汽车外饰加强件"],
          drawbacks: ["磨喷嘴", "韧性低于纯 ASA", "价格较高"],
          note: "官方打印件实测（Polymaker Fiberon ASA-CF08）：拉伸 43.5 MPa、HDT 103℃、缺口冲击 5.5 kJ/m²、密度 1.09。",
          sources: [{ name: "Polymaker 官方技术数据一览", url: "https://wiki.polymaker.com/polymaker-wiki/polymaker-wiki-zh/polymaker-chan-pin/polymaker-filaments/technical-data-at-a-glance.md" }]
        },
        {
          id: "pctg", nameCn: "PCTG", nameEn: "Glycol-modified PCT (透明耐化聚酯)", family: "PET系",
          color: "#22c3a6",
          tg: [80, 90], tm: null, hdt: [70, 80],
          printTemp: [250, 270], bedTemp: [70, 90],
          tensile: [40, 55], flexural: [55, 75], impact: [6, 12], impactUnit: "kJ/m²", elongation: [5, 30],
          density: [1.22, 1.27], hygroscopic: "中",
          difficulty: 2, warp: "低", enclosure: "否", drying: "建议 65℃/4–6h",
          safetyLevel: 0, fumes: "低气味（打印时几乎无味）",
          safetyNote: "PCTG 打印气味极低，释放物少；耐化学性优于 ABS/PETG，适合化工接触场景。",
          applications: ["耐化学容器", "透明/半透明件", "医疗器械外壳", "化妆品包装"],
          drawbacks: ["打印温度高于 PETG（250–270℃）", "价格略高", "市售品牌较少"],
          note: "3DXTech MAX-G PCTG 官方：处理温度 250–270℃、热床 70–90℃、无定形低翘曲；官方宣称耐化学性与延展性优于 PETG。力学为典型区间。",
          sources: [{ name: "3DXTech MAX-G PCTG 官方", url: "https://www.3dxtech.com/products/max-g-pctg" }]
        },
        {
          id: "pa-gf", nameCn: "PA-GF", nameEn: "Glass Fiber Reinforced Nylon", family: "尼龙PA",
          color: "#f2c94c",
          tg: [40, 60], tm: [220, 225], hdt: [140, 191],
          printTemp: [260, 290], bedTemp: [80, 100],
          tensile: [70, 95], flexural: [100, 140], impact: [8, 12], impactUnit: "kJ/m²", elongation: [3, 8],
          density: [1.18, 1.22], hygroscopic: "极高",
          difficulty: 4, warp: "中", enclosure: "建议", drying: "必需 80–90℃/8h",
          safetyLevel: 1, fumes: "酰胺类 + 玻纤粉尘",
          safetyNote: "PA-GF 释放物与尼龙相同（需通风）；玻纤粉尘刺激皮肤呼吸道，打磨时需防护；玻纤磨蚀喷嘴（需硬化钢）。",
          applications: ["结构件", "齿轮/传动件", "PA-CF 的经济替代", "工装夹具"],
          drawbacks: ["磨喷嘴（玻纤比碳纤更磨）", "极吸湿", "表面较粗糙"],
          note: "官方打印件实测（Polymaker Fiberon PA6-GF25）：拉伸 80.1 MPa、HDT 191℃（0.45MPa，1.8MPa 约 100℃）、缺口冲击 10 kJ/m²、密度 1.20、Vicat 211.7℃。",
          sources: [{ name: "Polymaker 官方技术数据一览", url: "https://wiki.polymaker.com/polymaker-wiki/polymaker-wiki-zh/polymaker-chan-pin/polymaker-filaments/technical-data-at-a-glance.md" }]
        },
        {
          id: "peek-cf", nameCn: "PEEK-CF", nameEn: "Carbon Fiber PEEK", family: "高温PEEK/PEKK",
          color: "#f9685f",
          tg: [143, 150], tm: [340, 345], hdt: [200, 260],
          printTemp: [360, 400], bedTemp: [120, 150],
          tensile: [110, 140], flexural: [180, 220], impact: [5, 10], impactUnit: "kJ/m²", elongation: [2, 5],
          density: [1.32, 1.38], hygroscopic: "低",
          difficulty: 5, warp: "低", enclosure: "必需", drying: "建议 120–150℃/4–6h",
          safetyLevel: 3, fumes: "高温芳香族挥发物 + 碳纤维粉尘",
          safetyNote: "PEEK-CF 与 PEEK 同级安全要求：360–400℃ 打印，必须高温封闭腔体+强通风+HEPA/活性炭过滤；碳纤粉尘需防护。",
          applications: ["航空航天结构件", "医疗植入级部件", "半导体夹具", "高性能替代金属件"],
          drawbacks: ["价格极高", "需顶级高温机+硬化喷嘴", "偏脆"],
          note: "3DXTech CarbonX PEEK-CF10 类产品典型：打印 360–400℃、需高温腔；碳纤提升刚度与耐热（HDT 200℃+），拉伸高于纯 PEEK。力学为典型区间。",
          sources: [{ name: "3DXTech CarbonX 系列官方", url: "https://www.3dxtech.com/collections/carbonx" }]
        },
        {
          id: "peek-gf", nameCn: "PEEK-GF", nameEn: "Glass Fiber PEEK", family: "高温PEEK/PEKK",
          color: "#f9685f",
          tg: [143, 150], tm: [340, 345], hdt: [180, 240],
          printTemp: [360, 400], bedTemp: [120, 150],
          tensile: [100, 130], flexural: [160, 200], impact: [5, 10], impactUnit: "kJ/m²", elongation: [2, 5],
          density: [1.36, 1.42], hygroscopic: "低",
          difficulty: 5, warp: "低", enclosure: "必需", drying: "建议 120–150℃/4–6h",
          safetyLevel: 3, fumes: "高温芳香族挥发物 + 玻纤粉尘",
          safetyNote: "PEEK-GF 与 PEEK-CF 同级安全要求：高温封闭腔体+强通风+过滤；玻纤粉尘与磨蚀需防护。",
          applications: ["航空结构件", "高温电气", "耐蠕变件", "汽车高性能件"],
          drawbacks: ["价格极高", "需高温工程机", "磨喷嘴"],
          note: "玻纤增强 PEEK：刚度略低于碳纤版、成本相对低一档；打印窗口与 PEEK-CF 相同（360–400℃）。力学为典型区间。",
          sources: [{ name: "3DXTech CarbonX 系列官方", url: "https://www.3dxtech.com/collections/carbonx" }]
        }
      ]
    }
  ],

  brands: [
    {
      id: "bambulab", nameCn: "拓竹", nameEn: "Bambu Lab", icon: "🐼",
      hq: "中国深圳", url: "https://bambulab.com/zh-cn",
      flagship: "PLA Tough（高韧性）、PLA-CF、PETG HF（高速）、PA6-CF、PAHT-CF、PPA-CF、PPS-CF、PLA Pure（食品级）等；与自家 X 系列/H2D 机型及 AMS 系统深度联动",
      reputation: "消费级高端品牌，材料与硬件一体化生态（RFID 料盒自动识别参数），色彩丰富、型号从入门 PLA 到 PPS 级高温工程料全覆盖，品控稳定、官方参数完善",
      materials: ["PLA Basic", "PLA Matte", "PLA Silk/Silk+", "PLA Tough/Tough+", "PLA Translucent", "PLA Lite", "PLA Metal", "PLA Aero", "PLA Dynamic", "PLA Galaxy", "PLA Glow", "PLA Wood", "PLA Marble", "PLA Sparkle", "PLA Pure（食品级）", "PLA-CF", "PETG Basic", "PETG Translucent", "PETG Matte", "PETG HF", "PETG-CF", "ABS", "ABS-GF", "ASA", "ASA Aero", "ASA-CF", "PC", "PC FR", "TPU 95A HF", "TPU for AMS", "TPU 85A/90A", "PA6-CF", "PA6-GF", "PAHT-CF", "PPA-CF", "PET-CF", "PPS-CF", "PVA", "易剥离支撑系列"],
      sourceUrls: ["https://wiki.bambulab.com/zh/general/filament-guide-material-table", "https://bambulab.com/zh-cn"]
    },
    {
      id: "kexcelled", nameCn: "Kexcelled（诺思贝瑞）", nameEn: "KEXCELLED", icon: "🔷",
      hq: "中国苏州（诺思贝瑞新材料科技）", url: "https://kexcelled3d.com",
      flagship: "超高温工程料 THE K11/K12 系列：PEEK、PEEK CF10/GF10、PEKK、PPSU、PEI 1010/9085；工程主力 K8 PA-CF、K9 PPA-CF15、K10 PPS-CF10",
      reputation: "以工程料与超高温料（PEEK/PEKK/PEI/PPSU）见长的专业高分子企业，产品线在国产耗材中较全、性价比高，主要面向海外市场",
      materials: ["K3/K5 PLA", "K5 PLA Pro(PLA+)", "K5 PLA M（哑光）", "K5 PLA Silk/Magic/Sparkle/Streams/渐变/变色/金属", "K5/K6 PLA CF", "K5 PLA Wood/Coffee", "K6 PLA FG（食品级）/FR（阻燃）", "K5/K6 PETG", "PETG Rapid", "PETG M/CF/GF/T", "K5/K6 ABS", "ABS Pro/Rapid/M/T/CC/P", "K6 ABS FR", "K3/K5 ASA", "K8 TPU 95A~60A/64D/77D", "TPU 90A Matte", "TPU AIR（发泡）", "OBC 弹性体", "K8/K10 PC", "K9 PC FR", "K8 PA-CF", "K9 PPA-CF15", "K9 PEBA", "K7 PET-CF10", "K10 PPS-CF10", "K11 PEEK/PEEK Pro/PEEK-CF10/PEEK-GF10", "K11 PEKK", "K11 PPSU", "K11 PEI 1010/9085", "K12 PEEK Ultra", "K6 PVA/BVOH/HIPS/BAS70/UCM300 支撑"],
      sourceUrls: ["https://kexcelled3d.com", "https://kexcelled3d.com/pages/about-us"]
    },
    {
      id: "sunlu", nameCn: "三绿", nameEn: "SUNLU", icon: "☀️",
      hq: "中国珠海（三绿实业）", url: "https://www.sunlu.com",
      flagship: "快打（High Speed）高速系列、PLA Meta（低收缩高韧性）、PLA+ 2.0、PA6-CF/PA12-CF 尼龙碳纤、在售 PEEK 高温料",
      reputation: "全球出货量领先的性价比品牌，品类覆盖广（PLA 到 PEEK）、色彩丰富，干燥箱等配件生态完善，价格亲民",
      materials: ["PLA", "PLA Classic/Lite", "PLA+", "PLA+ 2.0", "PLA Meta", "PLA Matte", "PLA Silk（多色/彩虹）", "PLA 透明/银河/闪光/夜光/金属/木质/大理石", "PLA-CF", "LW-PLA", "APLA（不拉丝）", "快打系列（高速 PLA/PETG/ABS）", "PETG", "PETG 2.0", "PETG 透明/夜光", "PETG-CF", "ABS", "ABS 透明", "ABS-FR", "ABS-GF", "ASA", "PC-ABS", "Easy PA", "PA6-CF", "PA6-GF", "PA12-CF", "TPU 95A/90A", "Silk TPU", "PP", "PP 2.0", "PCL", "PVB", "PEEK", "PVA"],
      sourceUrls: ["https://www.sunlu.com/zh-cn/collections/all"]
    },
    {
      id: "polymaker", nameCn: "Polymaker", nameEn: "Polymaker（上海聚复材料）", icon: "🔺",
      hq: "中国上海", url: "https://polymaker.com",
      flagship: "PolyMax 系列（PC/PA 增韧）、Fiberon 碳纤/玻纤增强工程料（PA6-CF20、PA12-CF10、PET-CF17、PPS-CF10）、PolySonic 高速料、PolySmooth（PVB 抛光）、PolyDissolve S1 水溶支撑",
      reputation: "全球化高端品牌，工程料口碑好、强度数据扎实，品控稳定、包装环保，社区生态兼容好（2024 年起 PolyLite 系列更名 PolyMaker 系列）",
      materials: ["PolyMaker PLA", "PLA Pro", "PolyMax PLA", "LW-PLA", "PLA-CF", "Matte PLA", "Draft PLA", "PolySonic PLA/PETG", "HT-PLA/HT-PLA-GF/HT-PLA Pro", "PolyMaker PETG", "PolyMax PETG", "PolyMaker ABS Pro/Max", "PolyMaker ASA", "PolyFlex TPU90/95/95-HF", "PolyLite PC", "PolyMax PC", "PC-ABS", "PolyMide CoPA", "Panchroma 彩色 PLA 系列", "CoSPLA", "Fiberon PA6-CF20/GF25", "Fiberon PA612-CF15", "Fiberon PA12-CF10", "Fiberon PET-CF17/GF15", "Fiberon PPS-CF10/GF20", "Fiberon ASA-CF08", "Fiberon PETG-rCF08", "Fiberon ESD 系列", "PolySmooth/PolyCast PVB", "PolyDissolve S1", "PolySupport"],
      sourceUrls: ["https://wiki.polymaker.com/polymaker-products/polymaker-filaments", "https://polymaker.com/filaments/"]
    },
    {
      id: "esun", nameCn: "eSUN", nameEn: "eSUN（易生/光华伟业）", icon: "🔋",
      hq: "中国深圳（光华伟业）", url: "https://www.esun3d.com",
      flagship: "ePLA-ST（高韧性）、ePLA-CF、ePA-CF、ePAHT-CF（高温尼龙碳纤）、ePETG-CF、PET-CF、ePC；工程料矩阵（PA/PC/ESD/阻燃）齐全",
      reputation: "老牌国产耗材大厂，型号命名规范（e 前缀）、品类最全，从通用料到工程料/柔性料全覆盖，TDS 文档公开透明、性价比高",
      materials: ["ePLA", "ePLA-Basic/Lite", "ePLA-Pro(PLA+)", "ePLA-HS（高速）", "ePLA-Matte", "ePLA-Silk 系列", "PLA-Clear", "ePLA-Metal", "ePLA-Luminous", "PLA-Coffee", "ePLA-CF", "ePLA-ST", "ePLA-LW", "ePETG", "ePETG-Pro", "ePETG-CF", "PETG-Matte", "eABS", "eABS-HS/HT/Max", "eABS-CF/GF", "eASA", "ePA", "ePA-CF", "ePA12", "ePA12-CF", "ePAHT-CF", "PET-CF", "ePC", "PC-ESD", "PET-FR", "ABS-ESD", "eTPU-95A", "eFlex-TPU-87A", "Elastic-TPE-83A", "eTPU-64D", "eTPU-LW", "PEBA 系列", "HIPS", "PVA", "PLA-Cast"],
      sourceUrls: ["https://www.esun3d.com/filaments/", "https://www.esun3d.com/engineering-materials/"]
    },
    {
      id: "prusament", nameCn: "Prusament", nameEn: "Prusament（Prusa 官方）", icon: "🔤",
      hq: "捷克布拉格（Prusa Research）", url: "https://prusament.com",
      flagship: "PC Blend（PC 共混工程料）、PC Space Grade（航天级 PC）、PA11-CF 碳纤尼龙、PEI 1010",
      reputation: "官方自产、逐卷附质检报告，品控与直径公差极严，色彩丰富，被视为消费级耗材标杆；价格偏高",
      materials: ["PLA", "rPLA（再生）", "PETG", "PETG-CF", "PETG V0", "PETG Recycled", "PETG Ultraglow", "PETG Magnetite 40", "PETG Tungsten 75", "ASA", "PC Blend", "PC Blend-CF", "PC Space Grade", "PVB", "PP", "PP-GF", "PA11-CF", "PEI 1010", "TPU 95A", "Woodfill（木质）"],
      sourceUrls: ["https://prusament.com/materials/", "https://prusament.com/materials/prusament-pc-blend/"]
    },
    {
      id: "creality", nameCn: "创想三维", nameEn: "Creality", icon: "🖨️",
      hq: "中国深圳", url: "https://www.creality.com",
      flagship: "Hyper PLA 高速系列（与 K1/K2 高速机深度适配）、Hyper PLA-CF/PETG-CF、HP ASA/TPU",
      reputation: "国产整机巨头自产耗材，Hyper 系列主打高速打印、性价比高；CR 系列入门实惠",
      materials: ["CR-PLA", "CR-PLA Carbon", "CR-PETG", "CR-ABS", "CR-Silk", "CR-Wood", "Hyper PLA", "Hyper PLA-CF", "Hyper PLA RFID", "Hyper Lightweight PLA", "Hyper Luminous PLA", "Hyper Rainbow PLA", "Hyper PETG", "Hyper PETG-CF", "Hyper ABS", "Hyper PC", "HP ASA", "HP TPU"],
      sourceUrls: ["https://store.creality.com", "https://www.creality.com"]
    },
    {
      id: "anycubic", nameCn: "纵维立方", nameEn: "Anycubic", icon: "🟢",
      hq: "中国深圳", url: "https://www.anycubic.com",
      flagship: "PLA+（高韧性主力）、高速 PLA、PET-CF、PA6-CF 碳纤工程线（与 Kobra 系列生态绑定）",
      reputation: "性价比高，与 Kobra 系列打印机组成完整配套生态，近年扩展碳纤/工程料线，品控中上",
      materials: ["PLA", "PLA+", "PLA Basic", "PLA Silk（含双色/三色）", "Matte PLA", "High-Speed PLA", "PLA-CF", "PLA Galaxy/Glow/Marble/Metal", "PETG", "PETG-CF", "PET-CF", "ABS", "ASA", "PC", "PA6-CF", "TPU 95A", "TPU 68D"],
      sourceUrls: ["https://store.anycubic.com/collections/filaments", "https://www.anycubic.com/zh"]
    },
    {
      id: "overture", nameCn: "Overture", nameEn: "Overture", icon: "🔵",
      hq: "美国休斯顿（德克萨斯州）", url: "https://overture3d.com",
      flagship: "Super PLA（高速）、Easy Nylon（易打尼龙）、PC Professional；PLA/PETG 为走量主力",
      reputation: "美系性价比路线，绕线规整、直径公差小（±0.02/0.03mm），品控口碑稳定",
      materials: ["PLA", "PLA Plus", "PLA Professional", "Super PLA", "Matte PLA", "Silk PLA", "Rock/Shimmer/Glow PLA", "渐变 PLA", "Easy PLA", "PETG", "High Speed PETG", "ABS", "ASA", "TPU 95A", "High Speed TPU", "Matte TPU", "Easy Nylon", "PC Professional"],
      sourceUrls: ["https://overture3d.com/collections/filament", "https://overture3d.com/pages/about-us"]
    },
    {
      id: "3dxtech", nameCn: "3DXTech", nameEn: "3DXTech（美国工程料厂）", icon: "⚙️",
      hq: "美国密歇根州大急流城", url: "https://www.3dxtech.com",
      flagship: "ThermaX PEEK/PEKK/PEI 1010/9085 高温工程料、CarbonX PA6-CF/PA12-CF 碳纤尼龙、FluorX PVDF",
      reputation: "美国高性能/工程料专业厂，主打 PEEK/PEI/碳纤及特种料，航空航天与医疗行业背书，1.75/2.85mm 规格齐全；价格高、面向专业用户",
      materials: ["ThermaX PEEK", "ThermaX PEKK-A", "ThermaX PEI 1010/9085", "ThermaX PPS", "ThermaX PPSU", "ThermaX PSU/PES", "ThermaX PPE/PS", "ThermaX HTS1/HTS2/MTS1", "CarbonX PA6-CF", "CarbonX PA12-CF", "CarbonX HTN-CF", "CarbonX PC-CF", "CarbonX PETG-CF", "CarbonX ABS-CF", "CarbonX ASA-CF", "CarbonX PLA-CF", "CarbonX PP-CF", "CarbonX PEEK-CF10", "CarbonX PEKK-A CF15", "CarbonX PEI-CF15", "CarbonX Obsidian Nylon 6-CF", "FluorX PVDF", "3DXLabs PVDF-GF", "3DXSTAT ESD 系列", "常规 ABS/ASA/PLA/PETG/TPU/PC/HIPS"],
      sourceUrls: ["https://www.3dxtech.com/collections", "https://www.3dxtech.com/search?q=carbonx"]
    },
    {
      id: "elegoo", nameCn: "爱乐酷", nameEn: "ELEGOO（深圳智能派科技）", icon: "🐙",
      hq: "中国深圳", url: "https://us.elegoo.com/pages/elegoo-filaments",
      flagship: "Rapid PLA Plus（高速）、Rapid PETG、PAHT-CF、PC-FR（阻燃 PC）；打印机+耗材全生态（海王星系列）",
      reputation: "全球消费级 3D 打印头部品牌（年营收 16 亿+），耗材线与自家海王星系列深度适配，性价比与品控均衡",
      materials: ["PLA", "PLA Basic", "PLA Plus", "PLA Pro", "Rapid PLA Plus", "PLA Matte", "PLA Silk", "PLA Glow", "PLA Wood", "PLA Marble", "PLA Galaxy", "PLA Sparkle", "PLA Metallic", "PLA-CF", "PETG", "PETG Pro", "PETG Translucent", "Rapid PETG", "PETG-CF", "PETG-GF", "ABS", "ASA", "TPU 95A", "Rapid TPU 95A", "PAHT-CF", "PC", "PC-FR", "SLA 光敏树脂系列"],
      sourceUrls: ["https://us.elegoo.com/pages/elegoo-filaments", "https://www.elegoo.com"]
    },
    {
      id: "jayo", nameCn: "Jayo（捷优）", nameEn: "JAYO", icon: "🎁",
      hq: "中国香港（注册地，海外电商主导）", url: "https://jayo3d.com",
      flagship: "PLA Meta、PLA+ 多卷装（5/10 卷经济包）、5KG 大卷装系列",
      reputation: "独立品牌（与创想三维无官方隶属确认），主打大卷装/多卷装经济路线，海外电商销量大，PLA 家族覆盖全",
      materials: ["PLA", "PLA+", "PLA Matte", "PLA Meta", "PLA Silk", "PLA Rainbow", "PLA Galaxy", "PLA Wood", "PETG", "PETG HF", "ABS", "5KG 大卷装系列", "10 卷装经济包", "SLA 光敏树脂"],
      sourceUrls: ["https://jayo3d.com/collections/all"]
    },
    {
      id: "fusrock", nameCn: "FusRock", nameEn: "FusRock（苏州复丝络科新材料）", icon: "🪨",
      hq: "中国苏州", url: "https://www.fusrock.com",
      flagship: "Nex 工程料：NexPA-CF25、PAHT-CF/GF、PPA-CF、ABS-CF、PETG-CF HF、PEBA-95A",
      reputation: "国产工程料新锐品牌，碳纤/玻纤增强与高温尼龙系列齐全，TDS 文档公开",
      materials: ["NexPA-CF25", "NexPA-GF25", "NexABS-CF20", "NexABS-GF25", "NexPET-GF", "PAHT-CF", "PAHT-GF", "PPA-CF", "ABS-CF", "PETG-CF HF", "低气味 ABS", "PC/ABS", "PEBA-95A", "PLA 系列", "PETG 系列", "TPU 系列"],
      sourceUrls: ["https://www.fusrock.com", "https://wiki.fusrock.com/zh/about/about-us"]
    },
    {
      id: "r3d", nameCn: "R3D", nameEn: "R3D（芜湖爱3迪科技）", icon: "🔩",
      hq: "中国芜湖", url: "https://r3dprinter.com",
      flagship: "PLA 全系（丝绸/哑光/彩虹/热变色/夜光）、Rapid PLA、高速 PLA Pro、高速碳纤 PETG",
      reputation: "2014 年成立的专业线材厂，12 条产线日产耗材 8000+kg，出口与电商并行，色彩与高速料齐全",
      materials: ["PLA 全系（丝绸/哑光/彩虹/热变色/夜光）", "Rapid PLA", "PLA+", "高速 PLA Pro", "eSilk Magic/Mystic（幻彩丝绸）", "PETG", "高速碳纤 PETG", "ABS", "TPU", "PA6（尼龙）"],
      sourceUrls: ["https://r3dprinter.com", "https://r3d.en.alibaba.com/zh_CN/company_profile.html"]
    },
    {
      id: "ailizi", nameCn: "爱丽滋", nameEn: "ALIZ（无锡爱丽兹三维科技）", icon: "💠",
      hq: "中国无锡（母公司：江阴龙山合成材料）", url: "http://www.longshanplas.com/ALIZ/",
      flagship: "PLA+ Pro、PETG/PETG-HF、哑光系列；背靠 25 年改性材料经验的母公司（专精特新小巨人+CNAS 实验室）",
      reputation: "2022 年独立品牌，母公司江阴龙山合成材料改性经验 25 年+，工业级工程料与民用耗材并重",
      materials: ["PLA+ Pro", "PLA（高速高韧性）", "PLA Silk", "PETG", "PETG HF", "哑光系列", "ABS", "TPU", "工业级工程料"],
      sourceUrls: ["https://www.longshanplas.com", "https://online.tctasia.cn/zh-cn/showroom-2026/institutions/681bnf"]
    },
    {
      id: "caiduowu", nameCn: "彩多屋", nameEn: "CAILAB（惠州彩多屋科技）", icon: "🎨",
      hq: "中国惠州（仲恺）", url: "https://online.tctasia.cn/zh-cn/showroom-2026/institutions/23bdhh",
      flagship: "PLA+ Bio 系列、丝绸 PIA 系列",
      reputation: "以色彩丰富的 PLA 系列见长，把 3D 打印材料做成'生活方式'的品牌（无独立官网，天猫/淘宝旗舰店运营）",
      materials: ["PLA+ Bio", "丝绸 PIA", "PLA 系列", "PETG", "TPU"],
      sourceUrls: ["https://online.tctasia.cn/zh-cn/showroom-2026/institutions/23bdhh", "https://world.taobao.com/dianpu/415090305_1.htm"]
    },
    {
      id: "qipang", nameCn: "启庞", nameEn: "Kingroon（深圳启庞科技）", icon: "🖥️",
      hq: "中国深圳", url: "https://cn.kingroon.com",
      flagship: "KP3S 系列打印机配套耗材；PLA+/PETG 碳纤线，入门性价比路线",
      reputation: "以高性价比 FDM 打印机（KP3S 等）闻名，耗材为配套生态，入门玩家友好",
      materials: ["PLA+", "PLA Basic", "PETG", "哑光系列", "彩虹系列", "丝绸双色/三色", "PLA-CF", "PETG-CF", "ABS", "TPU"],
      sourceUrls: ["https://cn.kingroon.com", "https://www.kingroon.com"]
    }
  ]
};
