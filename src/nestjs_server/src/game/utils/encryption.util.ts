/**
 * XOR Encryption Utility
 * Simple XOR encryption with a static key for testing purposes
 */

const ENCRYPTION_KEY = 'test-secret-key-12345'; // Static key for testing (must match client)

/**
 * Convert string to character codes
 */
function stringToCharCodes(str: string): number[] {
  return str.split('').map((char) => char.charCodeAt(0));
}

/**
 * Convert character codes to string
 */
function charCodesToString(codes: number[]): string {
  return String.fromCharCode(...codes);
}

/**
 * XOR encrypt a string
 */
export function encryptXor(data: string): string {
  const dataCodes = stringToCharCodes(data);
  const keyCodes = stringToCharCodes(ENCRYPTION_KEY);

  const encrypted = dataCodes.map((code, index) => {
    const keyCode = keyCodes[index % keyCodes.length];
    return code ^ keyCode;
  });

  // Convert to base64 for safe transmission
  return Buffer.from(String.fromCharCode(...encrypted)).toString('base64');
}

/**
 * XOR decrypt a string
 */
export function decryptXor(encryptedData: string): string {
  try {
    // Decode from base64
    const encrypted = Buffer.from(encryptedData, 'base64').toString('binary');
    const encryptedCodes = stringToCharCodes(encrypted);
    const keyCodes = stringToCharCodes(ENCRYPTION_KEY);

    const decrypted = encryptedCodes.map((code, index) => {
      const keyCode = keyCodes[index % keyCodes.length];
      return code ^ keyCode;
    });

    return charCodesToString(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
}

/**
 * Encrypt a JSON object
 */
export function encryptPayload(payload: any): string {
  const jsonString = JSON.stringify(payload);
  return encryptXor(jsonString);
}

/**
 * Decrypt a JSON object
 */
export function decryptPayload(encryptedData: string): any {
  const decrypted = decryptXor(encryptedData);
  try {
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('JSON parse failed:', error);
    return null;
  }
}
