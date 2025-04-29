// window.addEventListener('DOMContentLoaded', () => {
//     const formTitle = document.getElementById('form-title');
//     const loginBtn = document.getElementById('actionButton');
//     const toggleLink = document.getElementById('toggleLink');
//     const usernameInput = document.getElementById('name');
//     const passwordInput = document.getElementById('pw');

//     let isLoginMode = true;

//     toggleLink.addEventListener('click', e => {
//         e.preventDefault();
//         isLoginMode = !isLoginMode;
//         formTitle.textContent = isLoginMode ? 'Login' : 'Signup';
//         loginBtn.value = isLoginMode ? 'Sign in' : 'Register';
//         toggleLink.textContent = isLoginMode ? 'Or, Signup' : 'Or, Login';
//     });

//     loginBtn.addEventListener('click', async e => {
//         e.preventDefault();

//         const username = usernameInput.value.trim();
//         const password = passwordInput.value.trim();
//         if (!username || !password) {
//             return alert('Vui lòng nhập đầy đủ username và password!');
//         }

//         const url = isLoginMode ? '/auth/login' : '/auth/signup';
//         try {
//             const res = await fetch(url, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 credentials: 'same-origin',
//                 body: JSON.stringify({ username, password })
//             });

//             const ct = res.headers.get('content-type') || '';
//             if (!res.ok || !ct.includes('application/json')) {
//                 if (ct.includes('application/json')) {
//                     const errData = await res.json();
//                     return alert(errData.message || 'Authentication failed.');
//                 }
//                 return alert('Authentication failed.');
//             }

//             const data = await res.json();
//             if (!data.success) {
//                 return alert(data.message || 'Authentication failed.');
//             }

//             // Điều hướng sang trang tasks
//             window.location.href = '/todos';
//         } catch (err) {
//             console.error('Auth error:', err);
//             alert('Có lỗi mạng hoặc server. Vui lòng thử lại sau.');
//         }
//     });
// });
