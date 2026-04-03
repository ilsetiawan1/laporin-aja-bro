const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent";

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("No API key");

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
    }),
  });

  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

// ── Demo fallback (dipakai saat API tidak tersedia) ──────────
function simulateDelay(ms = 1200): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

const AGENCY_MAP: Record<string, string> = {
  "Infrastruktur": "Dinas Pekerjaan Umum, Perumahan dan Kawasan Permukiman DIY",
  "Lingkungan": "Dinas Lingkungan Hidup dan Kehutanan DIY",
  "Utilitas": "PLN UP3 Yogyakarta",
  "Sanitasi": "Dinas Pekerjaan Umum DIY bidang Cipta Karya",
  "Transportasi": "Dinas Perhubungan DIY",
  "Keamanan & Kriminal": "Polresta Yogyakarta",
  "Taman & RTH": "Dinas Lingkungan Hidup Kota Yogyakarta",
  "Fasilitas Umum": "Dinas Sosial DIY",
};

async function demoSummary(report: {
  title: string;
  description: string;
  categories?: { name: string } | null;
  cities?: { name: string } | null;
  vote_count?: number;
}): Promise<string> {
  await simulateDelay();
  const category = report.categories?.name ?? "Umum";
  const city = report.cities?.name ?? "DIY";
  const votes = report.vote_count ?? 0;
  return `Warga ${city} melaporkan masalah ${category.toLowerCase()} berupa ${report.description.slice(0, 80)}... Laporan ini mendapat ${votes} dukungan warga dan memerlukan penanganan segera dari instansi terkait.`;
}

async function demoSuggestion(report: {
  title: string;
  categories?: { name: string } | null;
  priority_score?: number;
}): Promise<string> {
  await simulateDelay(900);
  const category = report.categories?.name ?? "Umum";
  const agency = AGENCY_MAP[category] ?? "instansi terkait di DIY";
  const urgency = (report.priority_score ?? 0) > 10 ? "segera dalam 1×24 jam" : "dalam 3 hari kerja";
  return `Koordinasikan dengan ${agency} untuk menindaklanjuti laporan ini ${urgency}. Lakukan survei lapangan dan dokumentasikan kondisi terkini sebelum eksekusi penanganan.`;
}

async function demoImproveTitle(title: string, description: string): Promise<string> {
  await simulateDelay(700);
  const keywords = description.split(" ").slice(0, 5).join(" ");
  return `${title} — ${keywords}`.slice(0, 80);
}

// ── Public exports ───────────────────────────────────────────

export async function generateReportSummary(report: {
  title: string;
  description: string;
  categories?: { name: string } | null;
  cities?: { name: string } | null;
  districts?: { name: string } | null;
  vote_count?: number;
  similar_count?: number;
}): Promise<string> {
  try {
    const prompt = `Buat ringkasan singkat 2 kalimat dalam Bahasa Indonesia untuk laporan warga berikut.
Judul: ${report.title}
Kategori: ${report.categories?.name ?? "Umum"}
Lokasi: ${report.cities?.name ?? ""}${report.districts?.name ? ", " + report.districts.name : ""}
Deskripsi: ${report.description}
Dukungan warga: ${report.vote_count ?? 0} orang
Laporan serupa: ${report.similar_count ?? 0}
Ringkasan harus padat, faktual, dan tidak mengulang judul. Langsung ke inti masalah.`;
    return await callGemini(prompt);
  } catch {
    return await demoSummary(report);
  }
}

export async function generateAdminSuggestion(report: {
  title: string;
  categories?: { name: string } | null;
  status: string;
  priority_score?: number;
}): Promise<string> {
  try {
    const prompt = `Kamu adalah asisten admin sistem pelaporan publik DIY (Daerah Istimewa Yogyakarta).
Berikan 1 saran tindakan konkret (maks 2 kalimat) untuk menangani laporan berikut:
Judul: ${report.title}
Kategori: ${report.categories?.name ?? "Umum"}
Status saat ini: ${report.status}
Priority score: ${report.priority_score ?? 0}
Saran harus spesifik ke instansi/dinas yang relevan di Yogyakarta.`;
    return await callGemini(prompt);
  } catch {
    return await demoSuggestion(report);
  }
}

export async function improveReportTitle(
  title: string,
  description: string
): Promise<string> {
  try {
    const prompt = `Perbaiki judul laporan warga berikut agar lebih deskriptif dan informatif.
Judul asli: ${title}
Deskripsi: ${description.slice(0, 200)}
Berikan HANYA 1 judul alternatif yang lebih baik, tanpa penjelasan tambahan. Maks 80 karakter.`;
    return await callGemini(prompt);
  } catch {
    return await demoImproveTitle(title, description);
  }
}