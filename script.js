function generatePassword() {
    const length = document.getElementById('length').value;
    const symbols = "!@#$%^&*()_+";
    const numbers = "0123456789";
    const lowerCaseLetters = "abcdefghijklmnopqrstuvwxyz";
    const upperCaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    const allCharacters = symbols + numbers + lowerCaseLetters + upperCaseLetters;
    let password = '';

    // Ensure the password contains at least one character from each category
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += lowerCaseLetters.charAt(Math.floor(Math.random() * lowerCaseLetters.length));
    password += upperCaseLetters.charAt(Math.floor(Math.random() * upperCaseLetters.length));

    // Fill the remaining characters randomly
    for (let i = 4; i < length; i++) {
        password += allCharacters.charAt(Math.floor(Math.random() * allCharacters.length));
    }

    // Shuffle the characters to ensure randomness
    password = password.split('').sort(() => 0.5 - Math.random()).join('');

    document.getElementById('password').textContent = password;
}
