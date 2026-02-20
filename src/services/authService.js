const API_BASE_URL = 'http://localhost:8000/api';

class AuthService {
    static async signup(fullName, email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/signup.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    full_name: fullName,
                    email: email,
                    password: password
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Signup error:', error);
            return {
                success: false,
                message: 'Network error. Please try again.'
            };
        }
    }

    static async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/login.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();
            
            if (data.success) {
                // Store session token and user data in localStorage
                localStorage.setItem('session_token', data.data.session_token);
                localStorage.setItem('user_id', data.data.user_id);
                localStorage.setItem('user_name', data.data.full_name);
                localStorage.setItem('user_email', data.data.email);
                localStorage.setItem('user_role', data.data.role || 'user');
            }
            
            return data;
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: 'Network error. Please try again.'
            };
        }
    }

    static async verifySession() {
        const token = localStorage.getItem('session_token');
        
        if (!token) {
            return { success: false, message: 'No session token found.' };
        }

        try {
            const response = await fetch(`${API_BASE_URL}/verify_session.php`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Session verification error:', error);
            return {
                success: false,
                message: 'Network error. Please try again.'
            };
        }
    }

    static async logout() {
        const token = localStorage.getItem('session_token');
        
        if (token) {
            try {
                await fetch(`${API_BASE_URL}/logout.php`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (error) {
                console.error('Logout error:', error);
            }
        }

        // Clear localStorage
        localStorage.removeItem('session_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_role');
    }

    static isLoggedIn() {
        return !!localStorage.getItem('session_token');
    }

    static getUserData() {
        return {
            user_id: localStorage.getItem('user_id'),
            full_name: localStorage.getItem('user_name'),
            email: localStorage.getItem('user_email'),
            role: localStorage.getItem('user_role') || 'user'
        };
    }

    static isAdmin() {
        return (localStorage.getItem('user_role') || 'user') === 'admin';
    }

    static async adminLogin(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/login.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (data.success) {
                localStorage.setItem('session_token', data.data.session_token);
                localStorage.setItem('user_id', data.data.user_id);
                localStorage.setItem('user_name', data.data.full_name);
                localStorage.setItem('user_email', data.data.email);
                localStorage.setItem('user_role', data.data.role || 'admin');
            }
            return data;
        } catch (error) {
            console.error('Admin login error:', error);
            return {
                success: false,
                message: 'Network error. Please try again.'
            };
        }
    }
}

export default AuthService;
