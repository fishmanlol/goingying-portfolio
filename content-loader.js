/* Markdown loader — fetches and parses .md files (frontmatter + body)
 * No build step. Runs in the browser at page load.
 */
(function() {

  // ────────────────────────────────────────────────────────────
  // tiny YAML-ish frontmatter parser
  // supports: scalars, quoted strings, integers, "[]" empty arrays,
  // and block-list arrays ("- item" lines indented under a key).
  // ────────────────────────────────────────────────────────────
  function parseFrontmatter(text) {
    const m = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
    if (!m) return { data: {}, body: text.trim() };
    const yaml = m[1];
    const body = m[2].trim();
    const data = {};
    const lines = yaml.split(/\r?\n/);
    let i = 0;
    while (i < lines.length) {
      const raw = lines[i];
      if (!raw.trim() || raw.trim().startsWith("#")) { i++; continue; }
      // top-level key (no leading whitespace)
      const kv = raw.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$/);
      if (!kv) { i++; continue; }
      const key = kv[1];
      let val = kv[2];

      // empty value → maybe a block list on following lines
      if (val === "" || val === undefined) {
        const items = [];
        i++;
        while (i < lines.length && /^\s+-\s+/.test(lines[i])) {
          let item = lines[i].replace(/^\s+-\s+/, "");
          items.push(parseScalar(item));
          i++;
        }
        data[key] = items;
        continue;
      }

      // inline value
      val = val.trim();
      if (val === "[]") {
        data[key] = [];
      } else {
        data[key] = parseScalar(val);
      }
      i++;
    }
    return { data, body };
  }

  function parseScalar(s) {
    s = s.trim();
    if (s.startsWith('"') && s.endsWith('"')) {
      return s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    }
    if (s.startsWith("'") && s.endsWith("'")) {
      return s.slice(1, -1);
    }
    if (/^-?\d+$/.test(s)) return parseInt(s, 10);
    if (/^-?\d+\.\d+$/.test(s)) return parseFloat(s);
    return s;
  }

  async function fetchMd(path) {
    const res = await fetch(path, { cache: "no-cache" });
    if (!res.ok) throw new Error("Failed to load " + path + " (" + res.status + ")");
    return res.text();
  }

  // ────────────────────────────────────────────────────────────
  // public loaders
  // ────────────────────────────────────────────────────────────
  async function loadSite() {
    const text = await fetchMd(window.SITE_FILE);
    const { data, body } = parseFrontmatter(text);
    return { ...data, bio: body };
  }

  async function loadProjects() {
    const files = window.PROJECT_FILES || [];
    const all = await Promise.all(files.map(async (f) => {
      const text = await fetchMd(f);
      const { data, body } = parseFrontmatter(text);
      // derive id from filename (strip "NN-" prefix and ".md")
      const name = f.split("/").pop().replace(/\.md$/, "");
      const id = name.replace(/^\d+-/, "");
      return {
        id,
        order: data.order ?? 999,
        num: data.num,
        title: data.title,
        location: data.location,
        year: data.year,
        scope: data.scope,
        client: data.client,
        team: data.team,
        summary: body,
        materials: data.materials || [],
        after: data.after || [],
        before: data.before || []
      };
    }));
    all.sort((a, b) => a.order - b.order);
    return all;
  }

  window.ContentLoader = { loadSite, loadProjects, parseFrontmatter };
})();
