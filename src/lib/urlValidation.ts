/**
 * URL validation helpers for the scan flow.
 */

export interface ValidationResult {
  valid: boolean;
  normalizedUrl?: string;
  error?: string;
}

/**
 * Validate and normalize a URL entered by the user.
 * - Empty → "Please enter a URL"
 * - Missing protocol → prepend https:// and re-validate
 * - Invalid format → "Please enter a valid URL (e.g., https://example.com)"
 */
export function validateUrl(input: string): ValidationResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return { valid: false, error: 'Please enter a URL' };
  }

  let candidate = trimmed;
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  try {
    const parsed = new URL(candidate);
    if (!parsed.hostname || !parsed.hostname.includes('.')) {
      return {
        valid: false,
        error: 'Please enter a valid URL (e.g., https://example.com)',
      };
    }
    return { valid: true, normalizedUrl: candidate };
  } catch {
    return {
      valid: false,
      error: 'Please enter a valid URL (e.g., https://example.com)',
    };
  }
}
