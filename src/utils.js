export function validatePassword(password) {
    return password.length >= 8;
}

export function validateEmail(email) {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(email);
}