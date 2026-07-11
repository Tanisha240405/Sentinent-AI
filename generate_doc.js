const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak, LevelFormat,
  ExternalHyperlink, TabStopType, TabStopPosition, UnderlineType
} = require('docx');
const fs = require('fs');

// ─── PALETTE (light tone from user's image) ───
const NAVY    = '363955';
const MID     = '54668E';
const PERI    = '59598E';
const BLUE    = '879EC6';
const MIST    = 'E8E8E8';
const CREAM   = 'F5F6E6';
const WHITE   = 'FFFFFF';
const DARK    = '1E2035';
const LIGHT_BG= 'F0F2F8';  // very light periwinkle tint for section headers
const TABLE_H = 'D4DCF0';  // light blue-grey for table headers
const TABLE_S = 'EEF0F8';  // stripe

// ─── HELPERS ───
const border = (color = 'CCCCCC', size = 4) => ({ style: BorderStyle.SINGLE, size, color });
const noBorder = () => ({ style: BorderStyle.NONE, size: 0, color: 'FFFFFF' });
const allBorders = (c, s) => ({ top: border(c,s), bottom: border(c,s), left: border(c,s), right: border(c,s) });
const noBorders = () => ({ top: noBorder(), bottom: noBorder(), left: noBorder(), right: noBorder() });

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 440, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BLUE, space: 6 } },
    children: [new TextRun({ text, font: 'Arial', size: 28, bold: true, color: NAVY })]
  });
}
function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 120 },
    children: [new TextRun({ text, font: 'Arial', size: 24, bold: true, color: MID })]
  });
}
function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, font: 'Arial', size: 22, bold: true, color: PERI })]
  });
}
function body(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 80, after: 80, line: 340 },
    children: [new TextRun({ text, font: 'Arial', size: 22, color: '2E2E2E', ...opts })]
  });
}
function bullet(text, level = 0) {
  return new Paragraph({
    numbering: { reference: 'bullets', level },
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, font: 'Arial', size: 22, color: '2E2E2E' })]
  });
}
function note(text) {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    indent: { left: 360 },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: BLUE, space: 8 } },
    children: [new TextRun({ text, font: 'Arial', size: 20, color: MID, italics: true })]
  });
}
function tag(text) {
  // inline label (we'll use bold + colour in a normal paragraph)
  return new TextRun({ text: `[${text}]  `, font: 'Arial', size: 18, bold: true, color: PERI });
}
function spacer(n = 1) {
  return Array.from({ length: n }, () => new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun('')] }));
}
function divider() {
  return new Paragraph({
    spacing: { before: 160, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: MIST, space: 1 } },
    children: [new TextRun('')]
  });
}

// pill label paragraph
function label(text, color = BLUE) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text: `▸  ${text}`, font: 'Arial', size: 20, bold: true, color })]
  });
}

// ─── TABLE HELPERS ───
function makeCell(text, opts = {}) {
  const {
    bg = WHITE, bold = false, color = '2E2E2E', width = 2340,
    align = AlignmentType.LEFT, shade = false, header = false, colspan = 1
  } = opts;
  return new TableCell({
    columnSpan: colspan,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: bg, type: ShadingType.CLEAR },
    borders: allBorders('D0D5E8', 4),
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: align,
      children: [new TextRun({ text, font: 'Arial', size: header ? 20 : 20, bold: header || bold, color: header ? NAVY : color })]
    })]
  });
}

function headerRow(cells, widths) {
  return new TableRow({
    tableHeader: true,
    children: cells.map((c, i) => makeCell(c, { bg: TABLE_H, bold: true, header: true, width: widths[i] }))
  });
}
function dataRow(cells, widths, stripe = false) {
  return new TableRow({
    children: cells.map((c, i) => makeCell(c, { bg: stripe ? TABLE_S : WHITE, width: widths[i] }))
  });
}

// ─── COVER PAGE ───
function coverPage() {
  return [
    ...spacer(6),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
      children: [new TextRun({ text: 'SentientAI', font: 'Arial', size: 72, bold: true, color: NAVY })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
      children: [new TextRun({ text: 'Brand Sentiment Monitor', font: 'Arial', size: 40, color: MID })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 480 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BLUE, space: 6 } },
      children: [new TextRun({ text: 'Product Requirements Document  ·  Design Brief', font: 'Arial', size: 26, color: BLUE, italics: true })]
    }),
    ...spacer(2),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 },
      children: [new TextRun({ text: 'Prepared for', font: 'Arial', size: 22, color: '888888' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 },
      children: [new TextRun({ text: 'Antigravity', font: 'Arial', size: 30, bold: true, color: PERI })]
    }),
    ...spacer(1),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 },
      children: [new TextRun({ text: 'Version 1.0  ·  June 2026', font: 'Arial', size: 20, color: '999999' })]
    }),
    new Paragraph({ children: [new PageBreak()] })
  ];
}

// ─── BUILD DOC ───
const doc = new Document({
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 600, hanging: 300 } } } },
          { level: 1, format: LevelFormat.BULLET, text: '◦', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 960, hanging: 300 } } } }
        ]
      }
    ]
  },
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Arial', color: NAVY },
        paragraph: { spacing: { before: 440, after: 160 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, font: 'Arial', color: MID },
        paragraph: { spacing: { before: 320, after: 120 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 22, bold: true, font: 'Arial', color: PERI },
        paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1260, right: 1260, bottom: 1260, left: 1260 }
      }
    },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BLUE, space: 6 } },
            spacing: { before: 0, after: 120 },
            children: [
              new TextRun({ text: 'SentientAI — PRD & Design Brief', font: 'Arial', size: 18, color: BLUE }),
              new TextRun({ text: '\t', font: 'Arial', size: 18 }),
              new TextRun({ text: 'For Antigravity · v1.0', font: 'Arial', size: 18, color: '999999' })
            ]
          })
        ]
      })
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
            border: { top: { style: BorderStyle.SINGLE, size: 4, color: MIST, space: 6 } },
            spacing: { before: 120, after: 0 },
            children: [
              new TextRun({ text: 'Confidential · SentientAI 2026', font: 'Arial', size: 16, color: '999999' }),
              new TextRun({ text: '\t', font: 'Arial', size: 16 }),
              new TextRun({ text: 'Page ', font: 'Arial', size: 16, color: '999999' }),
              new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 16, color: NAVY })
            ]
          })
        ]
      })
    },

    children: [
      // ════════════════════════════════
      // COVER
      // ════════════════════════════════
      ...coverPage(),

      // ════════════════════════════════
      // 1. EXECUTIVE SUMMARY
      // ════════════════════════════════
      heading1('1.  Executive Summary'),
      body('SentientAI is a real-time Brand Sentiment Monitor — a full-stack web application that tells you what the internet thinks about any brand, product, or keyword, right now, with actual intelligence behind the score.'),
      ...spacer(1),
      body('Users type in a brand name. The product scrapes Reddit, news outlets, and Twitter/X, runs the text through six NLP algorithms simultaneously (including a Groq-powered LLM), and returns an animated dashboard showing sentiment scores, emotion breakdowns, trending topics, and AI-generated insights — all in one clean interface.'),
      ...spacer(1),
      note('This document is the complete product and design brief for Antigravity to generate the website. It covers user flows, page-by-page content specs, visual design direction, color system, component inventory, and technical integration notes.'),
      ...spacer(1),

      // Quick-reference table
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2600, 6760],
        rows: [
          headerRow(['Attribute', 'Value'], [2600, 6760]),
          dataRow(['Product name', 'SentientAI'], [2600, 6760]),
          dataRow(['Tagline', 'Brand Intelligence, Real-Time'], [2600, 6760], true),
          dataRow(['Primary user', 'Brand managers, marketers, researchers, founders'], [2600, 6760]),
          dataRow(['Core action', 'Type a brand → get instant NLP sentiment analysis'], [2600, 6760], true),
          dataRow(['Tone of product', 'Smart, calm, trustworthy — with a data-nerd edge'], [2600, 6760]),
          dataRow(['Tone of this doc', 'Clear, light, direct — no buzzword soup'], [2600, 6760], true),
        ]
      }),

      ...spacer(2),
      divider(),

      // ════════════════════════════════
      // 2. COLOR SYSTEM
      // ════════════════════════════════
      heading1('2.  Color System'),
      body('The palette comes from the reference image provided. It is a cool blue-grey family — periwinkle, navy, steel blue, off-white cream — that reads as intelligent and calm without being cold or corporate.'),
      ...spacer(1),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1440, 1800, 2400, 3720],
        rows: [
          headerRow(['Role', 'Hex', 'RGB', 'Usage'], [1440, 1800, 2400, 3720]),
          dataRow(['Canvas / BG', '#1E2035', '30, 32, 53', 'Main dark background (dark mode) / deep navy sections'], [1440, 1800, 2400, 3720]),
          dataRow(['Navy', '#363955', '54, 57, 85', 'Sidebar, card backgrounds, secondary surfaces'], [1440, 1800, 2400, 3720], true),
          dataRow(['Mid Blue', '#54668E', '84, 102, 142', 'Buttons, primary CTA, chart fill, tag backgrounds'], [1440, 1800, 2400, 3720]),
          dataRow(['Periwinkle', '#59598E', '89, 89, 142', 'Secondary buttons, hover states, accent borders'], [1440, 1800, 2400, 3720], true),
          dataRow(['Steel Blue', '#879EC6', '135, 158, 198', 'Labels, subtext, icon tint, sparklines, links'], [1440, 1800, 2400, 3720]),
          dataRow(['Mist', '#E8E8E8', '232, 232, 232', 'Body text on dark, dividers, ghost elements'], [1440, 1800, 2400, 3720], true),
          dataRow(['Cream', '#F5F6E6', '245, 246, 230', 'Hero headlines, card titles, light-mode background tint'], [1440, 1800, 2400, 3720]),
          dataRow(['Positive', '#6EE7B7', 'Tailwind Emerald 300', 'Positive sentiment scores, success states'], [1440, 1800, 2400, 3720], true),
          dataRow(['Negative', '#F87171', 'Tailwind Red 400', 'Negative sentiment, alerts, warnings'], [1440, 1800, 2400, 3720]),
          dataRow(['Neutral', '#879EC6', 'Same as Steel Blue', 'Neutral sentiment scores'], [1440, 1800, 2400, 3720], true),
        ]
      }),
      ...spacer(1),
      note('Antigravity note: The light-mode version of the site uses Cream (#F5F6E6) as page background with Navy (#363955) text. Dark mode flips to Canvas (#1E2035) background. The landing page hero section is always dark regardless of mode.'),

      ...spacer(2),
      divider(),

      // ════════════════════════════════
      // 3. TYPOGRAPHY
      // ════════════════════════════════
      heading1('3.  Typography'),
      body('Two typefaces only. No decorative fonts. The goal is clean data legibility above all else.'),
      ...spacer(1),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2000, 1800, 2000, 3560],
        rows: [
          headerRow(['Role', 'Family', 'Weights', 'Used for'], [2000, 1800, 2000, 3560]),
          dataRow(['Display', 'Space Grotesk', '600, 700', 'Hero headlines, section titles, KPI numbers, logo'], [2000, 1800, 2000, 3560]),
          dataRow(['Body / UI', 'Inter', '400, 500, 600, 700', 'All body copy, labels, nav, table text, tags, captions'], [2000, 1800, 2000, 3560], true),
          dataRow(['Mono', 'JetBrains Mono', '400, 500', 'Code snippets, API keys, terminal blocks only'], [2000, 1800, 2000, 3560]),
        ]
      }),
      ...spacer(1),

      heading2('Type Scale'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2200, 1600, 1600, 3960],
        rows: [
          headerRow(['Token', 'Size', 'Weight', 'Example use'], [2200, 1600, 1600, 3960]),
          dataRow(['display-xl', '56–72px', '700', 'Hero "Brand Intelligence, Real-Time"'], [2200, 1600, 1600, 3960]),
          dataRow(['display-lg', '40–48px', '700', 'Section titles'], [2200, 1600, 1600, 3960], true),
          dataRow(['heading-md', '28–32px', '700', 'Feature card headings, page titles'], [2200, 1600, 1600, 3960]),
          dataRow(['heading-sm', '20–24px', '600', 'Dashboard card titles, sidebar section labels'], [2200, 1600, 1600, 3960], true),
          dataRow(['body-lg', '16–18px', '400', 'Hero subtext, marketing copy'], [2200, 1600, 1600, 3960]),
          dataRow(['body-md', '14–15px', '400/500', 'All dashboard UI text'], [2200, 1600, 1600, 3960], true),
          dataRow(['label', '11–12px', '600–700', 'Tags, badges, chart axis labels (uppercase + tracked)'], [2200, 1600, 1600, 3960]),
          dataRow(['kpi-num', '32–40px', '800', 'Sentiment score, mention count on dashboard KPI cards'], [2200, 1600, 1600, 3960], true),
        ]
      }),

      ...spacer(2),
      divider(),

      // ════════════════════════════════
      // 4. PAGES OVERVIEW
      // ════════════════════════════════
      heading1('4.  Pages & Routes'),
      body('SentientAI is a two-page application with a shared component library. The landing page is the marketing surface; the dashboard is the product.'),
      ...spacer(1),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1800, 2000, 5560],
        rows: [
          headerRow(['Route', 'Page name', 'Purpose'], [1800, 2000, 5560]),
          dataRow(['/', 'Landing', 'Marketing home — communicates the value prop, lets users try a live demo, links to dashboard'], [1800, 2000, 5560]),
          dataRow(['/dashboard', 'Dashboard', 'The product — full analytics interface after user runs an analysis'], [1800, 2000, 5560], true),
          dataRow(['/workflow', 'Workflow Guide', 'Optional: project architecture doc for developer/technical users'], [1800, 2000, 5560]),
        ]
      }),

      ...spacer(2),
      divider(),

      // ════════════════════════════════
      // 5. LANDING PAGE
      // ════════════════════════════════
      heading1('5.  Landing Page — Content & Design Spec'),

      heading2('5.1  Navigation Bar'),
      body('Sticky. Transparent on load, becomes frosted glass (backdrop-filter: blur) on scroll. Height: 58px.'),
      ...spacer(1),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2400, 6960],
        rows: [
          headerRow(['Element', 'Spec'], [2400, 6960]),
          dataRow(['Logo', '"SentientAI" in Space Grotesk 700 — with a 9px animated pulsing dot in Steel Blue (#879EC6) to the left'], [2400, 6960]),
          dataRow(['Nav links', 'Features · Algorithms · Workflow · Stack — in Inter 500 Steel Blue, transitions to Cream on hover'], [2400, 6960], true),
          dataRow(['CTA button', '"Try Demo →" — pill button, gradient fill Mid Blue → Periwinkle, white text, lifts on hover'], [2400, 6960]),
          dataRow(['Mobile', 'Hamburger collapses nav links; CTA remains visible always'], [2400, 6960], true),
        ]
      }),

      ...spacer(1),
      heading2('5.2  Hero Section'),
      body('Full-viewport height. Dark background (#1E2035). Centered layout. Contains the "thesis" of the product — not a feature list, the single clearest statement of what SentientAI does.'),
      ...spacer(1),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2400, 6960],
        rows: [
          headerRow(['Element', 'Content / Spec'], [2400, 6960]),
          dataRow(['Badge', 'Small pill: animated green dot + "POWERED BY BERT · VADER · GROQ AI" in uppercase Inter 700 Steel Blue on a subtle translucent background'], [2400, 6960]),
          dataRow(['Headline', '"Brand Sentiment\\nIntelligence, Real-Time" — display-xl Space Grotesk 800, Cream. "Intelligence" renders in a gradient from Steel Blue → Cream using background-clip: text.'], [2400, 6960], true),
          dataRow(['Subtext', '"Monitor what the internet says about any brand, product, or topic — with multi-algorithm NLP, live emotion dashboards, and Groq-accelerated AI insights." — body-lg Inter 400, Mist at 70% opacity'], [2400, 6960]),
          dataRow(['CTA row', 'Two buttons side by side: "Analyze a Brand →" (primary filled) + "See How It Works" (ghost outline). Both scroll to relevant sections.'], [2400, 6960], true),
          dataRow(['Live ticker', 'Full-width horizontal scrolling strip below CTAs. Shows live brand sentiment scores: ● Apple: +0.82  ● Tesla: -0.31  ● Nike: +0.65 etc. Auto-scrolls infinitely left. Thin top + bottom borders in rgba(Steel Blue, 0.12).'], [2400, 6960]),
          dataRow(['Background', 'Two large blurred radial orbs (84,102,142 and 89,89,142 at low opacity) drift slowly via CSS animation. Subtle star field of 100+ tiny dots twinkling at random intervals.'], [2400, 6960], true),
        ]
      }),
      note('Animation note: hero badge, headline, subtext, and CTA row each fade up with 150ms staggered delay on page load. Ticker is a pure CSS marquee.'),

      ...spacer(1),
      heading2('5.3  Live Demo Card'),
      body('Centered card below the hero. Simulates the analysis experience without a backend. This is the most important conversion element on the landing page.'),
      ...spacer(1),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2400, 6960],
        rows: [
          headerRow(['Element', 'Spec'], [2400, 6960]),
          dataRow(['Card container', 'Max-width 900px, centered. Dark bg (#21243A), 1px border rgba(Steel Blue, 0.15), 24px border-radius, heavy shadow.'], [2400, 6960]),
          dataRow(['Toolbar', 'macOS-style top bar: three colored dots (red, yellow, green) + fake URL bar "https://sentientai.io/analyze" in mono font Steel Blue'], [2400, 6960], true),
          dataRow(['Input row', 'Text input (placeholder: "Enter brand, product, or keyword…") + "Analyze" button. Input dark fill, 1.5px border, border glows Steel Blue on focus.'], [2400, 6960]),
          dataRow(['Algorithm chips', 'Six toggle chips: VADER · BERT · TextBlob · Groq AI · RoBERTa · Ensemble. Active state: gradient fill. Inactive: outlined. Clicking toggles them. Default: VADER + BERT + TextBlob + Groq active.'], [2400, 6960], true),
          dataRow(['Results preview', 'Three mini KPI blocks side by side: Positive (green) / Negative (red) / Neutral (Steel Blue) with percentage values and mini sparkline bar charts below each.'], [2400, 6960]),
          dataRow(['Interaction', 'Hitting "Analyze" randomises the three percentage values and redraws the sparklines with a brief animation. Caption below: "↑ Sample preview — full dashboard available after analysis"'], [2400, 6960], true),
        ]
      }),

      ...spacer(1),
      heading2('5.4  Features Section'),
      body('6-card grid. Section eyebrow: "CORE CAPABILITIES". Section title: "Everything you need to track sentiment". Subtitle: "From raw social data to actionable intelligence in seconds."'),
      ...spacer(1),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2600, 6760],
        rows: [
          headerRow(['Feature card', 'Description copy'], [2600, 6760]),
          dataRow(['Multi-Source Scraping', 'Pull mentions from Reddit, Twitter/X, News APIs, and HackerNews simultaneously with deduplication and spam filtering.'], [2600, 6760]),
          dataRow(['6 NLP Algorithms', 'VADER, BERT, TextBlob, RoBERTa, Groq LLM, and an Ensemble model — compare scores side-by-side or use the combined signal.'], [2600, 6760], true),
          dataRow(['Live Emotion Graphs', 'Animated D3.js charts showing sentiment over time, by source, by keyword cluster, with drill-down capability.'], [2600, 6760]),
          dataRow(['Groq AI Insights', 'Ultra-fast Groq inference summarises why sentiment shifted, key topics driving it, and what competitors are doing.'], [2600, 6760], true),
          dataRow(['Trend Alerts', 'Set thresholds and get notified when sentiment drops, a topic spikes, or a negative cluster grows beyond a set level.'], [2600, 6760]),
          dataRow(['Geo & Source Map', 'See where sentiment originates geographically and by community — which subreddits, which news outlets.'], [2600, 6760], true),
        ]
      }),
      note('Each card: dark bg #21243A, 1px border rgba(Steel Blue, 0.13), 20px radius. Icon in a 48×48 rounded square with a gradient tint bg. Card lifts 5px on hover with border brightening to rgba(Steel Blue, 0.35). Cards stagger-fade on scroll.'),

      ...spacer(1),
      heading2('5.5  Algorithm Comparison Section'),
      body('Section eyebrow: "MULTI-ALGORITHM ENGINE". Title: "Six Ways to Read a Signal". Subtitle: "Compare models, blend them, or let the Ensemble decide."'),
      ...spacer(1),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1800, 1800, 2000, 3760],
        rows: [
          headerRow(['Algorithm', 'Type', 'Accuracy bar', 'Tagline'], [1800, 1800, 2000, 3760]),
          dataRow(['VADER', 'Lexicon-Based', '85%', 'Best for social media slang'], [1800, 1800, 2000, 3760]),
          dataRow(['BERT', 'Transformer', '92%', 'Context-aware, high accuracy'], [1800, 1800, 2000, 3760], true),
          dataRow(['TextBlob', 'Rule-Based NLP', '72%', 'Fast, lightweight baseline'], [1800, 1800, 2000, 3760]),
          dataRow(['RoBERTa', 'Transformer', '95%', 'Fine-tuned on 58M tweets'], [1800, 1800, 2000, 3760], true),
          dataRow(['Groq AI', 'LLM (Llama 3)', '97%', 'Nuance, irony, and context'], [1800, 1800, 2000, 3760]),
          dataRow(['Ensemble', 'Weighted Blend', '98%', 'Best of all models combined'], [1800, 1800, 2000, 3760], true),
        ]
      }),
      note('The accuracy bar is a thin 6px horizontal bar that animates from 0 to its percentage on scroll-into-view. Gradient fill: Mid Blue → Steel Blue.'),

      ...spacer(1),
      heading2('5.6  Workflow Section'),
      body('Section title: "How It\'s Built". Section eyebrow: "PROJECT WORKFLOW". 7 numbered steps in a vertical timeline layout. A vertical gradient line connects the step numbers.'),
      ...spacer(1),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [400, 1800, 3400, 3760],
        rows: [
          headerRow(['#', 'Step', 'Summary', 'Key tools'], [400, 1800, 3400, 3760]),
          dataRow(['1', 'User Input', 'User enters brand in React frontend — dispatched to FastAPI backend', 'React, FastAPI, Pydantic'], [400, 1800, 3400, 3760]),
          dataRow(['2', 'Gateway', 'JWT auth, Redis cache check, Celery task dispatch', 'FastAPI, Redis, Celery'], [400, 1800, 3400, 3760], true),
          dataRow(['3', 'Scraping', 'Parallel workers hit Reddit, News API, Twitter/X simultaneously', 'PRAW, NewsAPI, tweepy'], [400, 1800, 3400, 3760]),
          dataRow(['4', 'Cleaning', 'Language detection, deduplication, tokenisation, stopword removal', 'NLTK, spaCy, langdetect'], [400, 1800, 3400, 3760], true),
          dataRow(['5', 'NLP Scoring', '6 algorithms run in parallel, Ensemble score computed', 'VADER, BERT, RoBERTa, Groq'], [400, 1800, 3400, 3760]),
          dataRow(['6', 'Extraction', 'Emotion mapping (NRC), topic clustering (BERTopic), NER', 'NRC Lexicon, BERTopic, spaCy'], [400, 1800, 3400, 3760], true),
          dataRow(['7', 'Dashboard', 'Animated charts, feed, Groq AI summary cards pushed via WebSocket', 'D3.js, Recharts, WebSocket'], [400, 1800, 3400, 3760]),
        ]
      }),

      ...spacer(1),
      heading2('5.7  Tech Stack Section'),
      body('A centered grid of stack tiles. Section sub: "Easy to Deploy Everywhere". Docker-first, one docker compose up runs everything.'),
      ...spacer(1),
      new Paragraph({
        spacing: { before: 80, after: 80 },
        children: [
          new TextRun({ text: 'Stack tiles to display:  ', font: 'Arial', size: 22, bold: true, color: MID }),
          new TextRun({ text: 'React + Vite  ·  FastAPI  ·  PostgreSQL  ·  Redis  ·  Kafka / Celery  ·  Groq API  ·  HuggingFace  ·  Docker Compose  ·  Railway / Render  ·  JWT Auth', font: 'Arial', size: 22, color: '2E2E2E' }),
        ]
      }),
      note('Each tile: small emoji icon left + bold text right, dark card background, 12px border-radius. Tiles gently lift on hover.'),

      ...spacer(1),
      heading2('5.8  CTA Section'),
      body('Final section before footer. A large rounded card with a radial glow effect behind it. Copy:'),
      ...spacer(1),
      new Paragraph({
        indent: { left: 400 },
        spacing: { before: 80, after: 40 },
        children: [new TextRun({ text: 'Headline: ', font: 'Arial', size: 22, bold: true, color: MID }),
          new TextRun({ text: '"Ready to build this?"', font: 'Arial', size: 22, italics: true, color: '2E2E2E' })]
      }),
      new Paragraph({
        indent: { left: 400 },
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text: 'Body: ', font: 'Arial', size: 22, bold: true, color: MID }),
          new TextRun({ text: '"Get the full GitHub repo, Docker setup, and deployment guide. Built to run on Railway, Render, or your own VPS."', font: 'Arial', size: 22, color: '2E2E2E' })]
      }),
      new Paragraph({
        indent: { left: 400 },
        spacing: { before: 40, after: 80 },
        children: [new TextRun({ text: 'Buttons: ', font: 'Arial', size: 22, bold: true, color: MID }),
          new TextRun({ text: '"Open Dashboard →" (primary)  +  "View on GitHub" (ghost)', font: 'Arial', size: 22, color: '2E2E2E' })]
      }),

      ...spacer(2),
      divider(),

      // ════════════════════════════════
      // 6. DASHBOARD PAGE
      // ════════════════════════════════
      heading1('6.  Dashboard Page — Content & Design Spec'),
      body('The dashboard is a single-page application shell. It does not paginate or reload — all data arrives via WebSocket and updates the UI in place. The layout is a fixed top bar + sidebar + scrollable main content area.'),

      ...spacer(1),
      heading2('6.1  Top Bar'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2400, 6960],
        rows: [
          headerRow(['Element', 'Spec'], [2400, 6960]),
          dataRow(['Logo', 'Same as landing nav — "SentientAI" with pulsing dot'], [2400, 6960]),
          dataRow(['Search bar', 'Pill-shaped input + "Analyze" button. Rounded container with dark fill. On submit triggers full data refresh.'], [2400, 6960], true),
          dataRow(['LIVE badge', 'Green dot + "LIVE" text in emerald, shown when WebSocket is connected'], [2400, 6960]),
          dataRow(['Algorithm dropdown', 'Select between Ensemble (All) / VADER / BERT / TextBlob / RoBERTa / Groq AI — changes which algo\'s scores are highlighted'], [2400, 6960], true),
          dataRow(['Back button', 'Ghost "← Back" returns to landing page'], [2400, 6960]),
        ]
      }),

      ...spacer(1),
      heading2('6.2  Sidebar'),
      body('Fixed left column, 220px wide. Dark bg (#21243A). Two sections: Navigation and Recent Brands.'),
      ...spacer(1),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2400, 6960],
        rows: [
          headerRow(['Element', 'Spec'], [2400, 6960]),
          dataRow(['Nav items', 'Overview · Timeline · Emotions · Sources · Topics · Alerts · Compare — each with an emoji icon. Active item: left border stripe in Steel Blue + subtle bg tint.'], [2400, 6960]),
          dataRow(['Recent brands', 'List of last 5 analyzed brands as pill rows with brand name + sentiment score. Click to reload that brand\'s data.'], [2400, 6960], true),
          dataRow(['Algorithm list', 'Shows all 6 algorithms with active/inactive indicator dots — synced with top bar dropdown selection'], [2400, 6960]),
        ]
      }),

      ...spacer(1),
      heading2('6.3  KPI Row (4 cards)'),
      body('Full-width grid of four equal-width cards immediately below the top bar. Each card has a 3px top accent line in gradient Mid Blue → Steel Blue.'),
      ...spacer(1),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2000, 2000, 5360],
        rows: [
          headerRow(['Card', 'Value shown', 'Notes'], [2000, 2000, 5360]),
          dataRow(['Overall Score', '0.00–1.00 float', 'Color: green if >0.55, blue if >0.35, red if lower. Large Space Grotesk 800 number.'], [2000, 2000, 5360]),
          dataRow(['Mentions', 'Integer count', 'Animates from 0 to target value on load using a counter animation. "Last 24 hours" sub-label.'], [2000, 2000, 5360], true),
          dataRow(['Dominant Emotion', 'Emotion name', 'One of: Joy, Trust, Anticipation, Surprise, Fear, Anger, Sadness, Disgust. Colour-coded to match emotion chart.'], [2000, 2000, 5360]),
          dataRow(['Alert Level', '● Normal / ⚠ Watch / ⚠ High', 'Green / Yellow / Red. Changes based on negative sentiment threshold.'], [2000, 2000, 5360], true),
        ]
      }),

      ...spacer(1),
      heading2('6.4  Sentiment Timeline Chart'),
      body('D3.js area + line chart. Width: 2/3 of the main content area. Height: ~180px. Three lines: Positive (emerald), Negative (red), Neutral (steel blue). 7-day default view.'),
      bullet('Chart animates on load: lines draw themselves via stroke-dashoffset animation over 1.2 seconds'),
      bullet('Data points appear as circles after lines finish drawing'),
      bullet('Subtle grid lines in rgba(Steel Blue, 0.1)'),
      bullet('X-axis: day labels (Mon–Sun). Y-axis: 0–100% in increments of 25'),
      bullet('Tooltip on hover shows exact values for all three lines at that date'),

      ...spacer(1),
      heading2('6.5  Source Breakdown Donut Chart'),
      body('D3.js donut chart. Sits to the right of the timeline (1/3 width). Shows mention distribution by source: Reddit · News · Twitter/X · HackerNews.'),
      bullet('Donut slices animate in one by one (pie arc tween) with staggered 120ms delay'),
      bullet('Center of donut shows total mention count'),
      bullet('Legend below the chart: coloured square + source name + percentage'),
      bullet('Colors: each slice uses a tone from the palette (Steel Blue / Mid Blue / Periwinkle / Navy)'),

      ...spacer(1),
      heading2('6.6  Algorithm Comparison Cards (6 cards)'),
      body('Three-column grid of cards, one per algorithm (six cards total, two rows). Each card shows:'),
      bullet('Algorithm type badge (e.g. "TRANSFORMER", "LEXICON") in small uppercase Inter'),
      bullet('Algorithm name in Space Grotesk 700'),
      bullet('Score as a large float (color-coded green/blue/red)'),
      bullet('A 6px progress bar showing the score (0–1 range) with gradient fill'),
      bullet('Three small chips showing the algorithm\'s pos / neg / neutral percentage breakdown'),

      ...spacer(1),
      heading2('6.7  Bottom Row (3 equal columns)'),
      ...spacer(1),
      heading3('Emotion Breakdown'),
      body('8 horizontal bar rows, one per NRC emotion. Label left, animated bar middle, percentage right. Each bar fills on load with a 1.2s CSS transition. Each emotion has its own color (e.g. Joy = emerald, Anger = orange, Sadness = blue, Fear = red).'),
      ...spacer(1),
      heading3('Live Mention Feed'),
      body('Scrollable list of the most recent 8 scored posts. Each row: source tag (Reddit/News/X) on the left, truncated post text in the middle, sentiment score float on the right (color-coded). Rows have a subtle 1px border and a gentle hover tint.'),
      ...spacer(1),
      heading3('Groq AI Insights Panel'),
      body('Three "insight cards" generated by Groq LLM. Each card is a bordered rounded box with a "⚡ Groq AI" label above it (positioned outside the card top-left border). Content is a 2–3 sentence paragraph in Inter 400. Below the text: a row of small topic chips (e.g. "brand trends", "NLP analysis", "competitor gap").'),

      ...spacer(2),
      divider(),

      // ════════════════════════════════
      // 7. COMPONENT INVENTORY
      // ════════════════════════════════
      heading1('7.  Component Inventory'),
      body('All reusable UI components that Antigravity should implement. These are design-system primitives — build once, use everywhere.'),
      ...spacer(1),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2200, 2400, 4760],
        rows: [
          headerRow(['Component', 'Variants', 'Notes'], [2200, 2400, 4760]),
          dataRow(['Button', 'Primary · Ghost · Icon-only', 'Primary: gradient fill Mid Blue→Periwinkle. Ghost: 1.5px border Steel Blue. All: 50px border-radius, hover lift + shadow.'], [2200, 2400, 4760]),
          dataRow(['Badge / Pill', 'Color-coded · Tag · Live', 'Small rounded label. Steel Blue bg tint default. "LIVE" variant has green dot + emerald text.'], [2200, 2400, 4760], true),
          dataRow(['Card', 'Default · Hover · KPI · Algo', 'Dark bg, 1px border rgba(Steel Blue,0.12), 14px radius. Hover: border brightens, translateY(-3px–5px).'], [2200, 2400, 4760]),
          dataRow(['Input', 'Default · Focus · Pill', 'Dark fill, 1.5px border rgba(Steel Blue,0.25). Focus: border-color Steel Blue with subtle glow. Pill variant for top search bar.'], [2200, 2400, 4760], true),
          dataRow(['Chip / Toggle', 'Active · Inactive', 'Active: gradient fill. Inactive: outlined in Steel Blue. Used in demo card algorithm selector.'], [2200, 2400, 4760]),
          dataRow(['Progress bar', 'Score bar · Emotion bar', '6px height. Rounded ends. Gradient fill. Animates from 0 to target on mount.'], [2200, 2400, 4760], true),
          dataRow(['Sparkline', 'Mini bar chart', '12 bars, random heights, used in KPI demo mini-stats. Each bar is a thin rounded rectangle.'], [2200, 2400, 4760]),
          dataRow(['Feed row', '—', 'Flex row: source tag + text + score. 1px border, 10px radius, hover tint.'], [2200, 2400, 4760], true),
          dataRow(['Nav item', 'Default · Active', 'Active: 3px left border stripe + bg tint. Emoji icon + label.'], [2200, 2400, 4760]),
          dataRow(['Donut chart', 'D3.js', 'Animated arc tween. Center text. Below-chart legend.'], [2200, 2400, 4760], true),
          dataRow(['Line/Area chart', 'D3.js', 'Stroke-dashoffset draw animation. Multi-line. Grid + axis labels. Hover tooltip.'], [2200, 2400, 4760]),
          dataRow(['Ticker strip', '—', 'CSS marquee animation. Full-width. Thin border top + bottom. Items: brand name + score.'], [2200, 2400, 4760], true),
          dataRow(['Loading spinner', '—', 'Circular CSS animation, border-top colored Steel Blue. Used in overlay during data fetch.'], [2200, 2400, 4760]),
          dataRow(['Toast notification', '—', 'Bottom-right corner. Dark bg, 1px border Steel Blue, 12px radius. Auto-dismisses after 3s.'], [2200, 2400, 4760], true),
          dataRow(['Orb (BG element)', '—', 'Large blurred radial circle, low opacity, drifts via CSS keyframe animation. Two on hero.'], [2200, 2400, 4760]),
          dataRow(['Star field', '—', '100+ tiny absolute-positioned dots that twinkle via opacity + scale keyframes at random intervals.'], [2200, 2400, 4760], true),
        ]
      }),

      ...spacer(2),
      divider(),

      // ════════════════════════════════
      // 8. ANIMATION SPEC
      // ════════════════════════════════
      heading1('8.  Animation & Motion Spec'),
      body('Animations serve the data — they communicate loading, arrival, and emphasis. Nothing is animated for decoration alone. All animations respect prefers-reduced-motion.'),
      ...spacer(1),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2400, 1800, 5160],
        rows: [
          headerRow(['Animation', 'Duration', 'Details'], [2400, 1800, 5160]),
          dataRow(['Hero stagger fade-up', '800ms each', 'Badge → h1 → subtext → CTAs. Each 150ms after previous. translateY(20px) → 0 + opacity 0 → 1. ease-out.'], [2400, 1800, 5160]),
          dataRow(['Logo pulse dot', '2s loop', 'box-shadow expands from 0 to 8px and fades out. Color: rgba(Steel Blue, 0.5).'], [2400, 1800, 5160], true),
          dataRow(['LIVE badge dot', '1.2s loop', 'Opacity 1 → 0.2 → 1. Communicates live status.'], [2400, 1800, 5160]),
          dataRow(['Ticker scroll', '28s loop', 'CSS transform translateX from 0 to -50%. Content is doubled to create seamless loop.'], [2400, 1800, 5160], true),
          dataRow(['Timeline line draw', '1200ms', 'stroke-dashoffset animation. ease-in-out cubic. Dots appear at 1000ms delay.'], [2400, 1800, 5160]),
          dataRow(['Donut arc tween', '900ms + 120ms stagger', 'D3 attrTween on the arc path. Each slice after previous.'], [2400, 1800, 5160], true),
          dataRow(['Score bar fill', '1000ms', 'CSS width transition 0 → target%. ease-in-out.'], [2400, 1800, 5160]),
          dataRow(['Emotion bar fill', '1200ms', 'CSS width transition on mount. Staggered per bar.'], [2400, 1800, 5160], true),
          dataRow(['KPI counter', '~900ms', 'JS interval counting from 0 to target in ~50 steps. Eases by reducing step size near end.'], [2400, 1800, 5160]),
          dataRow(['Card hover lift', '200ms', 'translateY(-3px to -5px) + box-shadow 0 to 16px. ease-out.'], [2400, 1800, 5160], true),
          dataRow(['Scroll reveal', 'IntersectionObserver', 'Cards/steps fade up (opacity 0→1, translateY 10px→0) when entering viewport. Threshold 10%.'], [2400, 1800, 5160]),
          dataRow(['Orb drift', '12s alternate', 'translate(30px, 25px) + rotate(8deg). Opposite direction on second orb with -5s delay.'], [2400, 1800, 5160], true),
          dataRow(['Star twinkle', '2–7s random', 'opacity 0 → var(--op) → 0 + scale(0.6) → 1 → 0.6. Each star has random delay.'], [2400, 1800, 5160]),
        ]
      }),

      ...spacer(2),
      divider(),

      // ════════════════════════════════
      // 9. RESPONSIVE BEHAVIOR
      // ════════════════════════════════
      heading1('9.  Responsive Behavior'),
      ...spacer(1),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1600, 2000, 5760],
        rows: [
          headerRow(['Breakpoint', 'Range', 'Layout changes'], [1600, 2000, 5760]),
          dataRow(['Desktop', '1280px+', 'Full layout as specified. Sidebar visible. 3-column bottom row. 2-column charts row.'], [1600, 2000, 5760]),
          dataRow(['Tablet', '768–1279px', 'Sidebar collapses to icon-only rail. Bottom row becomes 2 columns. Charts stack vertically.'], [1600, 2000, 5760], true),
          dataRow(['Mobile', '<768px', 'Sidebar hidden (hamburger). All grids become single column. Donut chart moves below timeline. Search bar goes full-width. Nav links collapse.'], [1600, 2000, 5760]),
        ]
      }),

      ...spacer(2),
      divider(),

      // ════════════════════════════════
      // 10. TECH INTEGRATION NOTES
      // ════════════════════════════════
      heading1('10.  Technical Integration Notes for Antigravity'),
      body('These are notes for the build team — not design decisions, just context to avoid surprises.'),
      ...spacer(1),

      heading2('10.1  Frontend'),
      bullet('Framework: React 18 + Vite'),
      bullet('State: Zustand (lightweight, no Redux boilerplate)'),
      bullet('Charts: D3.js v7 for the timeline and donut. Recharts for simpler bar/radar charts.'),
      bullet('Animations: CSS keyframes for ambient/loop animations. Framer Motion for element transitions. No GSAP dependency needed.'),
      bullet('Routing: React Router v6. Two routes: "/" and "/dashboard".'),
      bullet('WebSocket: native browser WebSocket API with a useWebSocket custom hook'),

      ...spacer(1),
      heading2('10.2  API Contract'),
      body('The frontend consumes one main API endpoint plus a WebSocket stream:'),
      bullet('POST /api/analyze  →  { query: string, algorithms: string[], sources: string[], timeRange: "24h" | "7d" | "30d" }'),
      bullet('WS /ws/results/{jobId}  →  streams scored mention objects as they arrive'),
      bullet('GET /api/history  →  returns last 5 brand queries for the sidebar'),
      bullet('GET /api/health  →  returns { status: "ok", live: true }'),

      ...spacer(1),
      heading2('10.3  Environment'),
      bullet('All API keys are server-side only. No keys exposed to the browser.'),
      bullet('The demo card on the landing page uses client-side random data only — no API call needed.'),
      bullet('Loading state: show spinner overlay on dashboard cards while WebSocket is connecting. Show individual card loaders as data streams in.'),

      ...spacer(1),
      heading2('10.4  Deployment'),
      bullet('Docker Compose: one file runs frontend (React), backend (FastAPI), database (PostgreSQL + TimescaleDB), cache (Redis), and queue (Celery).'),
      bullet('Railway or Render for one-click cloud deploy. VPS (DigitalOcean / Hetzner) for full control.'),
      bullet('Environment variables: GROQ_API_KEY, REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, NEWS_API_KEY, TWITTER_BEARER_TOKEN, DATABASE_URL, REDIS_URL, SECRET_KEY.'),

      ...spacer(2),
      divider(),

      // ════════════════════════════════
      // 11. FUTURE FEATURES
      // ════════════════════════════════
      heading1('11.  Planned Features (Phase 2)'),
      body('These are out of scope for the initial build but should be considered when structuring routes and components.'),
      ...spacer(1),
      bullet('Competitor Comparison — Analyze multiple brands simultaneously on the same chart'),
      bullet('Geo Sentiment Map — Leaflet.js map colouring countries by average sentiment score'),
      bullet('Alert System — Email / Slack webhook when sentiment drops below a user-set threshold'),
      bullet('Topic Word Cloud — D3 force-directed word cloud of top trending topics'),
      bullet('PDF Report Export — One-click export using Playwright or html2pdf'),
      bullet('Scheduled Monitoring — Cron jobs to automatically re-analyze saved brands daily or hourly'),
      bullet('Chrome Extension — Highlight and score any selected text on any webpage'),
      bullet('Multi-language — mBERT for French, Spanish, Hindi analysis'),

      ...spacer(2),
      divider(),

      // ════════════════════════════════
      // 12. REVISION HISTORY
      // ════════════════════════════════
      heading1('12.  Document Revision History'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1200, 1800, 2400, 3960],
        rows: [
          headerRow(['Version', 'Date', 'Author', 'Notes'], [1200, 1800, 2400, 3960]),
          dataRow(['1.0', 'June 2026', 'Product Team', 'Initial PRD and design brief for Antigravity'], [1200, 1800, 2400, 3960]),
        ]
      }),

      ...spacer(3),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 80 },
        children: [new TextRun({ text: '— End of Document —', font: 'Arial', size: 20, color: '999999', italics: true })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'SentientAI · PRD v1.0 · Confidential · For Antigravity', font: 'Arial', size: 18, color: 'BBBBBB' })]
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('e:\\brand sentiment monitor\\SentientAI_PRD_Antigravity.docx', buffer);
  console.log('Done: SentientAI_PRD_Antigravity.docx');
});
