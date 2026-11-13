export function formatRupiah(amount?: number): string {
  if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) return 'Hubungi Penjual';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function createWhatsAppLink(phoneNumber: string, umkmName: string, productName?: string): string {
  let cleaned = phoneNumber.replace(/\D/g, '');
  if (cleaned.startsWith('0')) cleaned = `62${cleaned.substring(1)}`;

  let message = `Halo ${umkmName}, saya melihat usaha Anda di Katalog Digital UMKM Desa Dadapayu.`;
  message += productName
    ? ` Saya tertarik dengan produk: "${productName}". Apakah produk ini masih tersedia?`
    : ' Boleh saya bertanya informasi lebih lanjut mengenai produk/layanan Anda?';

  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}
