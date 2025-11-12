// Função de ocultar/mostrar senha
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const passwordIcon = document.querySelector('.password-toggle i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordIcon.className = 'fa-sharp fa-solid fa-eye';
    } else {
        passwordInput.type = 'password';
        passwordIcon.className = 'fa-sharp fa-solid fa-eye-slash';
    }
}
