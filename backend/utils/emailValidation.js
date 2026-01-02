// Disposable email domains list (common ones)
const DISPOSABLE_EMAIL_DOMAINS = [
  '10minutemail.com',
  '20minutemail.com',
  '33mail.com',
  'guerrillamail.com',
  'mailinator.com',
  'tempmail.com',
  'throwaway.email',
  'yopmail.com',
  'temp-mail.org',
  'getnada.com',
  'mohmal.com',
  'fakeinbox.com',
  'trashmail.com',
  'mintemail.com',
  'sharklasers.com',
  'spamgourmet.com',
  'maildrop.cc',
  'getairmail.com',
  'meltmail.com',
  'emailondeck.com',
];

// Email format validation
export const isValidEmailFormat = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Check if email is from disposable domain
export const isDisposableEmail = (email) => {
  if (!email) return false;
  const domain = email.toLowerCase().split('@')[1];
  if (!domain) return false;
  return DISPOSABLE_EMAIL_DOMAINS.includes(domain);
};

// Comprehensive email validation
export const validateEmail = (email) => {
  if (!email) {
    return { valid: false, message: 'Email is required' };
  }

  const trimmedEmail = email.trim().toLowerCase();

  if (!isValidEmailFormat(trimmedEmail)) {
    return { valid: false, message: 'Invalid email format' };
  }

  if (isDisposableEmail(trimmedEmail)) {
    return { valid: false, message: 'Disposable email addresses are not allowed' };
  }

  return { valid: true };
};

