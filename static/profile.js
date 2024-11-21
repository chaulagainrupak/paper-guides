// Password strength and validation for change password form
const currentPasswordInput = document.getElementById('current-password');
const newPasswordInput = document.getElementById('new-password');
const confirmPasswordInput = document.getElementById('confirm-password');
const changePasswordButton = document.getElementById('change-password-button');
const passwordStrengthBar = document.querySelector('.password-strength');

// Add event listeners for both new password and confirm password inputs
[newPasswordInput, confirmPasswordInput].forEach(input => {
    input.addEventListener('input', validatePasswordChange);
});

function validatePasswordChange() {
    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    // Check password strength
    const strength = checkPasswordStrength(newPassword);
    passwordStrengthBar.style.width = `${strength}%`;
    
    // Update strength bar color
    if (strength < 33) {
        passwordStrengthBar.style.backgroundColor = '#ff4d4d';
    } else if (strength < 66) {
        passwordStrengthBar.style.backgroundColor = '#ffd700';
    } else {
        passwordStrengthBar.style.backgroundColor = '#00cc00';
    }
    
    // Enable/disable change password button
    if (currentPassword && 
        newPassword && 
        confirmPassword && 
        newPassword === confirmPassword && 
        strength >= 50 && 
        newPassword.length >= 8) {
        changePasswordButton.disabled = false;
        changePasswordButton.style.cursor = 'pointer';
    } else {
        changePasswordButton.disabled = true;
        changePasswordButton.style.cursor = 'not-allowed';
    }
}

// Password strength calculation
function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]+/)) strength += 25;
    if (password.match(/[A-Z]+/)) strength += 25;
    if (password.match(/[0-9]+/)) strength += 25;
    if (password.match(/[$@#&!]+/)) strength += 25;
    return Math.min(100, strength);
}

// Toggle password visibility
document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function() {
        const input = this.previousElementSibling;
        if (input.type === 'password') {
            input.type = 'text';
            this.textContent = '🙈';
        } else {
            input.type = 'password';
            this.textContent = '👁️';
        }
    });
});

