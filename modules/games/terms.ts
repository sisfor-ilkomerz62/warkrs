export const legacyConsentNotice =
  "Nama lengkap Anda akan terlihat pada daftar pemenang dan log aktivitas oleh peserta yang sudah bergabung dan admin War. Urutan resmi mengikuti penerimaan database, bukan waktu klik perangkat. Semua paket wajib diurutkan saat Live. Satu pengiriman yang diterima bersifat tetap. Permintaan harus diterima server sebelum penutupan. Pendaftaran KRS resmi tetap dilakukan terpisah melalui portal kampus.";

// Prefix is part of the immutable terms version, not a mutable UI setting.
export const nimConsentPrefix = "nim-v2:";
export function consentNoticeFor(termsVersion: string) {
  return termsVersion.startsWith(nimConsentPrefix)
    ? legacyConsentNotice.replace("Nama lengkap Anda", "Nama lengkap dan NIM Anda")
    : legacyConsentNotice;
}

// Presentation copy only: never changes frozen consent versions or records.
export const warRules = [
  "Gabung dan setujui aturan War sebelum ikut memilih.",
  "Pemilihan paket hanya tersedia saat War berlangsung (Live).",
  "Urutkan semua paket yang tersedia sesuai prioritasmu, masing-masing satu kali.",
  "Urutan pengiriman yang diterima ditentukan server/database, bukan waktu klik perangkat.",
  "Alokasi memeriksa prioritas dari atas dan memilih paket pertama yang kuotanya masih tersedia.",
  "Setelah pengiriman diterima, hasilnya final dan tidak dapat diubah. Pengiriman baru harus diterima server sebelum War ditutup.",
];
