const GEMINI_URL = 
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
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

// Fitur 1: Ringkasan laporan untuk admin
export async function generateReportSummary(report: {
  title: string;
  description: string;
  categories?: { name: string } | null;
  cities?: { name: string } | null;
  districts?: { name: string } | null;
  vote_count?: number;
  similar_count?: number;
}): Promise<string> {
  const prompt = `Buat ringkasan singkat 2 kalimat dalam Bahasa Indonesia untuk laporan warga berikut.
Judul: ${report.title}
Kategori: ${report.categories?.name ?? "Umum"}
Lokasi: ${report.cities?.name ?? ""}${report.districts?.name ? ", " + report.districts.name : ""}
Deskripsi: ${report.description}
Dukungan warga: ${report.vote_count ?? 0} orang
Laporan serupa: ${report.similar_count ?? 0}

Ringkasan harus padat, faktual, dan tidak mengulang judul. Langsung ke inti masalah.`;

  return callGemini(prompt);
}

// Fitur 2: Saran tindakan untuk admin
export async function generateAdminSuggestion(report: {
  title: string;
  categories?: { name: string } | null;
  status: string;
  priority_score?: number;
}): Promise<string> {
  const prompt = `Kamu adalah asisten admin sistem pelaporan publik DIY (Daerah Istimewa Yogyakarta).
Berikan 1 saran tindakan konkret (maks 2 kalimat) untuk menangani laporan berikut:
Judul: ${report.title}
Kategori: ${report.categories?.name ?? "Umum"}
Status saat ini: ${report.status}
Priority score: ${report.priority_score ?? 0}

Saran harus spesifik ke instansi/dinas yang relevan di Yogyakarta.`;

  return callGemini(prompt);
}

// Fitur 3: Improve judul laporan
export async function improveReportTitle(
  title: string,
  description: string
): Promise<string> {
  const prompt = `Perbaiki judul laporan warga berikut agar lebih deskriptif dan informatif.
Judul asli: ${title}
Deskripsi: ${description.slice(0, 200)}

Berikan HANYA 1 judul alternatif yang lebih baik, tanpa penjelasan tambahan. Maks 80 karakter.`;

  return callGemini(prompt);
}