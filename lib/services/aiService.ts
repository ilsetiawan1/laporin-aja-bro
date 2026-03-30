// export async function generateReportSummary(report: Report): Promise<string> {
//   const response = await fetch(
//     `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         contents: [{
//           parts: [{
//             text: `Buat ringkasan singkat (2 kalimat) dalam Bahasa Indonesia untuk laporan berikut:
//             Judul: ${report.title}
//             Kategori: ${report.categories?.name}
//             Lokasi: ${report.cities?.name}, ${report.districts?.name}
//             Deskripsi: ${report.description}
//             Dukungan warga: ${report.vote_count} orang`
//           }]
//         }]
//       })
//     }
//   );
//   // parse response...
// }