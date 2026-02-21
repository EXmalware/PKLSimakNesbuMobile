/**
 * Authentication management
 */

const AUTH = {
    async login(username, password) {
        try {
            const response = await API.request('login', '', { username, password });

            if (response.status === 'success') {
                const user = response.data;
                const role = response.role;

                const sessionData = {
                    role: role,
                    username: user.username,
                    nama: user.nama,
                    photo: user.photo || '',
                    timestamp: Date.now()
                };

                // Add role-specific data
                if (role === 'siswa') {
                    sessionData.nis = user.nis;
                    sessionData.jurusan = user.jurusan || user.Jurusan;
                }
                if (role === 'mentor') sessionData.id_pkl = user.ID_PKL;
                if (role === 'kakomli') sessionData.jurusan = user.jurusan;

                localStorage.setItem('pkl_session', JSON.stringify(sessionData));
                this.redirect(role);
                return { success: true };
            } else {
                return { success: false, message: response.message || 'Username atau password salah' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Gagal menghubungkan ke server' };
        }
    },

    checkSession() {
        const session = localStorage.getItem('pkl_session');
        if (session) {
            const data = JSON.parse(session);
            // Check if it's not too old (e.g., 7 days)
            const sevenDays = 7 * 24 * 60 * 60 * 1000;
            if (Date.now() - data.timestamp < sevenDays) {
                return data;
            } else {
                this.logout();
            }
        }
        return null;
    },

    getUser() {
        return this.checkSession();
    },

    redirect(role) {
        window.location.href = `page/${role}.html`;
    },

    logout() {
        localStorage.removeItem('pkl_session');
        window.location.href = '../index.html';
    }
};

window.AUTH = AUTH;
