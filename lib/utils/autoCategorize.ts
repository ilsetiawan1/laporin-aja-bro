// ============================================================
// lib/utils/autoCategorize.ts
// Rule-based auto-categorization (client-side, no API call needed)
// ============================================================

interface CategoryRule {
  keywords: string[];
  category: string;
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    keywords: ["jalan", "berlubang", "aspal", "trotoar", "jembatan", "retak", "longsor", "jalan rusak"],
    category: "Infrastruktur",
  },
  {
    keywords: ["sampah", "bau", "limbah", "kotor", "polusi", "pencemaran", "buang sampah"],
    category: "Lingkungan",
  },
  {
    keywords: ["lampu", "listrik", "penerangan", "mati lampu", "gelap", "kabel"],
    category: "Utilitas",
  },
  {
    keywords: ["air", "banjir", "drainase", "selokan", "genangan", "air bersih", "got", "gorong"],
    category: "Sanitasi",
  },
  {
    keywords: ["taman", "pohon", "ruang hijau", "rth", "tanaman", "hutan kota", "fasilitas taman"],
    category: "Taman & RTH",
  },
  {
    keywords: ["angkot", "bus", "halte", "transportasi", "parkir", "macet", "kendaraan"],
    category: "Transportasi",
  },
  {
    keywords: ["fasilitas umum", "toilet", "mushola", "puskesmas", "posyandu", "sekolah"],
    category: "Fasilitas Umum",
  },
];

/**
 * Auto-detect category name from text (title + description combined)
 * Returns matched category name or null if no match
 */
export function autoCategorizeText(text: string): string | null {
  const lowerText = text.toLowerCase();

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((kw) => lowerText.includes(kw))) {
      return rule.category;
    }
  }

  return null;
}

/**
 * Find category_id from a categories array by name match
 */
export function findCategoryId(
  categoryName: string,
  categories: Array<{ id: string; name: string }>
): string | null {
  const lower = categoryName.toLowerCase();
  const match = categories.find(
    (cat) =>
      cat.name.toLowerCase() === lower ||
      cat.name.toLowerCase().includes(lower) ||
      lower.includes(cat.name.toLowerCase())
  );
  return match?.id ?? null;
}

/**
 * Extract top keywords from text (for similar report detection)
 * Filters Indonesian stopwords, returns up to 3 meaningful words
 */
export function extractKeywords(text: string): string[] {
  const STOPWORDS = new Set([
    "di", "ke", "dari", "yang", "dan", "atau", "ini", "itu",
    "ada", "sudah", "belum", "tidak", "bisa", "akan", "dengan",
    "untuk", "pada", "oleh", "juga", "saya", "kami", "mereka",
    "adalah", "dapat", "sangat", "sekali", "lagi", "juga", "saat",
    "karena", "ketika", "jika", "agar", "maka", "namun",
  ]);

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !STOPWORDS.has(word))
    .slice(0, 3);
}

export function autoCategorize(
  text: string,
  categories: Array<{ id: string; name: string }>
): { id: string; name: string } | null {
  const categoryName = autoCategorizeText(text);
  if (!categoryName) return null;

  const id = findCategoryId(categoryName, categories);
  if (!id) return null;

  // Return nama dari DB (bukan dari rules), agar konsisten dengan display
  const matched = categories.find((c) => c.id === id);
  return matched ? { id, name: matched.name } : null;
}