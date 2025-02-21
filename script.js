function generatePassword() {
    const length = parseInt(document.getElementById('length').value);
    const useUppercase = document.getElementById('uppercase').checked;
    const useLowercase = document.getElementById('lowercase').checked;
    const useNumbers = document.getElementById('numbers').checked;
    const useSymbols = document.getElementById('symbols').checked;

    // Validate inputs
    if (length < 8 || length > 64) {
        alert('Please choose a length between 8 and 64 characters');
        return;
    }

    if (!useUppercase && !useLowercase && !useNumbers && !useSymbols) {
        alert('Please select at least one character type');
        return;
    }

    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    const numbers = "0123456789";
    const lowerCaseLetters = "abcdefghijklmnopqrstuvwxyz";
    const upperCaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    let allowedChars = '';
    let password = '';
    
    // Build allowed characters based on options
    if (useSymbols) allowedChars += symbols;
    if (useNumbers) allowedChars += numbers;
    if (useLowercase) allowedChars += lowerCaseLetters;
    if (useUppercase) allowedChars += upperCaseLetters;

    // Ensure at least one character from each selected type
    if (useSymbols) password += symbols.charAt(Math.floor(Math.random() * symbols.length));
    if (useNumbers) password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    if (useLowercase) password += lowerCaseLetters.charAt(Math.floor(Math.random() * lowerCaseLetters.length));
    if (useUppercase) password += upperCaseLetters.charAt(Math.floor(Math.random() * upperCaseLetters.length));

    // Fill remaining length with random characters
    while (password.length < length) {
        password += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
    }

    // Shuffle password
    password = password.split('').sort(() => 0.5 - Math.random()).join('');

    document.getElementById('password').textContent = password;
    updateStrengthMeter(password);
}

function updateStrengthMeter(password) {
    const strengthMeter = document.getElementById('strength-meter');
    let strength = 0;

    // Length check
    if (password.length >= 12) strength += 2;
    else if (password.length >= 8) strength += 1;

    // Character type checks
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    // Update UI
    if (strength >= 5) {
        strengthMeter.textContent = 'Strong Password';
        strengthMeter.className = 'strength-meter strong';
    } else if (strength >= 3) {
        strengthMeter.textContent = 'Medium Password';
        strengthMeter.className = 'strength-meter medium';
    } else {
        strengthMeter.textContent = 'Weak Password';
        strengthMeter.className = 'strength-meter weak';
    }
}

function copyToClipboard() {
    const password = document.getElementById('password').textContent;
    navigator.clipboard.writeText(password).then(() => {
        const copyBtn = document.querySelector('.copy-btn');
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = 'Copy';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy password to clipboard');
    });
}