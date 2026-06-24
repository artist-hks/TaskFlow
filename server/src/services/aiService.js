/**
 * aiService — wraps the Google Gemini 2.5 Flash REST API for task effort /
 * due-date estimation, with a deterministic rule-based fallback that always
 * works even when no API key is configured.
 */

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * Format a Date as YYYY-MM-DD (local).
 */
function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Deterministic rule-based estimate used when the AI call is unavailable,
 * times out, or returns unparseable output.
 */
function ruleBasedSuggestion(title = '', description = '') {
  const text = `${title} ${description}`.toLowerCase();
  const length = description.trim().length;

  // Keyword heuristics for high-effort work.
  const heavyKeywords = [
    'refactor',
    'migrate',
    'architecture',
    'design',
    'integrate',
    'research',
    'investigate',
    'redesign',
    'database',
    'security',
  ];
  const lightKeywords = ['fix', 'typo', 'update', 'rename', 'tweak', 'copy', 'text'];

  let effort = 'M';
  if (heavyKeywords.some((k) => text.includes(k)) || length > 240) {
    effort = 'L';
  } else if (lightKeywords.some((k) => text.includes(k)) || length < 60) {
    effort = 'S';
  }

  // Priority-ish urgency derived from keywords.
  const isUrgent = /urgent|asap|critical|blocker|high/.test(text);
  const daysOut = isUrgent ? 1 : effort === 'L' ? 5 : 3;

  const due = new Date();
  due.setDate(due.getDate() + daysOut);

  return {
    effort,
    suggestedDueDate: toISODate(due),
    reasoning:
      effort === 'L'
        ? 'Complex scope detected — allow extra time.'
        : effort === 'S'
        ? 'Small, well-scoped change.'
        : 'Moderate effort based on description.',
    fallback: true,
  };
}

/**
 * Strip markdown code fences and parse JSON defensively.
 */
function parseModelJSON(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let text = raw.trim();
  // Remove ```json ... ``` or ``` ... ``` fences.
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  // Grab the first {...} block if there's surrounding prose.
  const match = text.match(/\{[\s\S]*\}/);
  if (match) text = match[0];
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Normalize a parsed model object into our suggestion shape.
 */
function normalize(parsed) {
  if (!parsed || typeof parsed !== 'object') return null;
  const effort = typeof parsed.effort === 'string' ? parsed.effort.trim() : null;
  const reasoning =
    typeof parsed.reasoning === 'string' ? parsed.reasoning.trim() : '';
  let suggestedDueDate = null;
  if (parsed.suggestedDueDate) {
    const d = new Date(parsed.suggestedDueDate);
    if (!Number.isNaN(d.getTime())) suggestedDueDate = toISODate(d);
  }
  if (!effort) return null;
  return { effort, suggestedDueDate, reasoning, fallback: false };
}

/**
 * getTaskSuggestion — main entry. Tries Gemini, falls back to rules.
 */
export async function getTaskSuggestion(title, description) {
  const apiKey = process.env.GEMINI_API_KEY;

  // No key configured → deterministic fallback.
  if (!apiKey) {
    return ruleBasedSuggestion(title, description);
  }

  const today = toISODate(new Date());
  const prompt = `You are a project-planning assistant. Estimate the effort and a realistic due date for this task.
Today's date is ${today}.
Task title: "${title || 'Untitled'}"
Task description: "${description || 'No description provided.'}"

Respond with ONLY valid JSON, no markdown, in exactly this shape:
{"effort": "S | M | L or hours like 4h", "suggestedDueDate": "YYYY-MM-DD", "reasoning": "max 15 words"}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const url = `${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`;
    console.log('--- Gemini API Debug ---');
    console.log('Key length:', apiKey?.length);
    console.log('Key prefix:', apiKey?.slice(0, 6) + '...');
    console.log('Endpoint:', GEMINI_URL);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: 'application/json',
        },
      }),
    });

    clearTimeout(timeout);

    console.log('Response status:', res.status, res.statusText);

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`[Gemini Error] Status: ${res.status} ${res.statusText}`);
      console.error(`[Gemini Error] Body:`, errBody);
      try {
        const errJson = JSON.parse(errBody);
        console.error('Error Details:', JSON.stringify(errJson?.error, null, 2));
      } catch { /* body wasn't JSON */ }
      return ruleBasedSuggestion(title, description);
    }

    const data = await res.json();
    const raw =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ??
      '';

    console.log('Gemini raw response text:', raw);

    const parsed = parseModelJSON(raw);
    const normalized = normalize(parsed);

    console.log('Parsed:', parsed);
    console.log('Normalized:', normalized);

    if (!normalized) {
      console.warn('Normalization failed, falling back to rule-based.');
      return ruleBasedSuggestion(title, description);
    }
    return normalized;
  } catch (err) {
    clearTimeout(timeout);
    console.error('Gemini API fetch failed or timed out:', err);
    // Timeout / network / parse failure → fallback.
    return ruleBasedSuggestion(title, description);
  }
}

export { ruleBasedSuggestion };
