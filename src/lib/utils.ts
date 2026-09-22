import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date string to UTC format e.g. "22/09/2026 13:00 UTC"
 */
export function formatDateUTC(dateString: string | Date | null | undefined): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
  
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes} UTC`;
}

/**
 * Format relative or localized date format e.g. "22 de Set, 2026"
 */
export function formatDateShort(dateString: string | Date | null | undefined): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Unique short token generator for public links
 */
export function generateToken(length = 10): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const cryptoObj = window.crypto || (window as unknown as { msCrypto: Crypto }).msCrypto;
  
  if (cryptoObj && cryptoObj.getRandomValues) {
    const values = new Uint8Array(length);
    cryptoObj.getRandomValues(values);
    for (let i = 0; i < length; i++) {
      result += chars[values[i] % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return result;
}

/**
 * Parse client browser and OS info from User-Agent string
 */
export function parseUserAgent(ua: string | null | undefined): { browser: string; os: string } {
  if (!ua) return { browser: 'Desconhecido', os: 'Desconhecido' };

  let browser = 'Navegador';
  let os = 'Sistema';

  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('MSIE') || ua.includes('Trident')) browser = 'Internet Explorer';

  if (ua.includes('Win')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return { browser, os };
}

/**
 * Creates a standard sample valid PDF Blob string for local offline demo view
 */
export function createMockPdfBlobUrl(title: string, company: string, revision: string): string {
  const pdfContent = `%PDF-1.4
1 0 obj
<<
  /Type /Catalog
  /Pages 2 0 R
>>
endobj
2 0 obj
<<
  /Type /Pages
  /Kids [3 0 R]
  /Count 1
>>
endobj
3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 612 792]
  /Resources <<
    /Font << /F1 4 0 R >>
  >>
  /Contents 5 0 R
>>
endobj
4 0 obj
<<
  /Type /Font
  /Subtype /Type1
  /BaseFont /Helvetica-Bold
>>
endobj
5 0 obj
<< /Length 200 >>
stream
BT
/F1 20 Tf
50 720 Td
(ManualHub - Documento Tecnico) Tj
0 -40 Td
/F1 14 Tf
(Manual: ${title}) Tj
0 -25 Td
(Construtora: ${company}) Tj
0 -25 Td
(Revisao: ${revision}) Tj
0 -30 Td
(Este e um PDF gerado para demonstracao tecnica.) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000127 00000 n 
0000000257 00000 n 
0000000336 00000 n 
trailer
<<
  /Size 6
  /Root 1 0 R
>>
startxref
590
%%EOF`;

  const blob = new Blob([pdfContent], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}
