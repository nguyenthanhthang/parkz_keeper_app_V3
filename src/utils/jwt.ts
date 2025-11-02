/**
 * JWT Decode Utility
 * Decode JWT token để lấy payload (không verify signature)
 */

export interface JWTPayload {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  phone?: string;
  [key: string]: any;
}

/**
 * Decode JWT token (chỉ decode, không verify)
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Lấy payload (phần thứ 2)
    const base64Url = parts[1];

    // Convert base64url sang base64
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // Thêm padding
    while (base64.length % 4) {
      base64 += '=';
    }

    // Decode base64
    let payloadString: string;
    
    // Try atob (browser/Expo)
    if (typeof atob !== 'undefined') {
      payloadString = atob(base64);
    } 
    // Try Buffer (Node.js environment)
    else if (typeof Buffer !== 'undefined') {
      payloadString = Buffer.from(base64, 'base64').toString('utf-8');
    }
    // Manual base64 decode (fallback)
    else {
      payloadString = base64Decode(base64);
    }

    return JSON.parse(payloadString);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Simple base64 decode (fallback nếu không có atob/Buffer)
 */
function base64Decode(base64: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';

  base64 = base64.replace(/[^A-Za-z0-9+/]/g, '');

  for (let i = 0; i < base64.length; i += 4) {
    const enc1 = chars.indexOf(base64.charAt(i));
    const enc2 = chars.indexOf(base64.charAt(i + 1));
    const enc3 = chars.indexOf(base64.charAt(i + 2));
    const enc4 = chars.indexOf(base64.charAt(i + 3));

    const chr1 = (enc1 << 2) | (enc2 >> 4);
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const chr3 = ((enc3 & 3) << 6) | enc4;

    output += String.fromCharCode(chr1);

    if (enc3 !== 64) {
      output += String.fromCharCode(chr2);
    }
    if (enc4 !== 64) {
      output += String.fromCharCode(chr3);
    }
  }

  return output;
}
