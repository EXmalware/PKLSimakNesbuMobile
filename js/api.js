/**
 * API Wrapper for Google Apps Script
 */

const CONFIG = {
    SCRIPT_URL: 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE',
    IS_MOCK: localStorage.getItem('mock') === 'true' // Toggle by running: localStorage.setItem('mock', 'true')
};

const API = {
    async request(action, tab, data = {}) {
        if (CONFIG.IS_MOCK) {
            console.warn(`MOCK API: ${action} on ${tab}`, data);
            return this.mockResponse(action, tab, data);
        }

        const url = `${CONFIG.SCRIPT_URL}?action=${action}&tab=${tab}`;

        try {
            // For simple read/login, GET is more reliable with CORS in GAS
            if (action === 'read' || action === 'login') {
                const response = await fetch(`${url}&username=${data.username || ''}&password=${data.password || ''}`);
                return await response.json();
            }

            // For create/update/upload, use POST
            const response = await fetch(CONFIG.SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({ action, tab, ...data })
            });
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            // Fallback for no-cors opaque response if needed, 
            // but normally GAS handles JSON correctly with GET.
            throw error;
        }
    },

    async getData(tab) {
        return this.request('read', tab);
    },

    async postData(tab, data) {
        return this.request('create', tab, data);
    },

    async updateData(tab, id, data) {
        return this.request('update', tab, { id, ...data });
    },

    async deleteData(tab, id) {
        return this.request('delete', tab, { id });
    },

    async uploadFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async () => {
                const base64Data = reader.result.split(',')[1];
                try {
                    const response = await this.request('upload', '', {
                        fileName: file.name,
                        mimeType: file.type,
                        base64Data: base64Data
                    });
                    resolve(response);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    // Mock data for development
    mockResponse(action, tab, data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (action === 'login') {
                    if (data.username === 'admin' && data.password === '123') {
                        resolve({ status: 'success', role: 'admin', data: { username: 'admin', password: '123', nama: 'Super Admin', photo: '' } });
                    } else if (data.username === 'siswa' && data.password === '123') {
                        resolve({ status: 'success', role: 'siswa', data: { username: 'siswa', password: '123', nama: 'Siswa Test', nis: '12345' } });
                    } else if (data.username === 'guru' && data.password === '123') {
                        resolve({ status: 'success', role: 'guru', data: { username: 'guru', password: '123', nama: 'Guru Test', photo: '' } });
                    } else {
                        resolve({ status: 'error', message: 'Username atau password salah' });
                    }
                    return;
                }

                const mockData = {
                    LOGINADMIN: [{ username: 'admin', password: '123', nama: 'Super Admin', photo: '' }],
                    LOGINGURU: [{ username: 'guru', password: '123', nama: 'Guru Test', nip: 'G001', photo: '' }],
                    LOGINKAKOMLI: [{ username: 'kakomli', password: '123', nama: 'Kakomli Test', jurusan: 'TKJ', photo: '' }],
                    LOGINMENTOR: [{ username: 'mentor', password: '123', nama: 'Mentor Test', photo: '' }],
                    LOGINSISWA: [{ username: 'siswa', password: '123', nama: 'Siswa Test', nis: '12345' }],
                    DATASISWA: [
                        { nis: '12345', nama: 'Siswa Test', kelas: 'XII RPL 1', Photo: '' },
                        { nis: '12346', nama: 'Budi Santoso', kelas: 'XII RPL 2', Photo: '' }
                    ],
                    KEHADIRAN: [
                        { ID_Absen: 'A1', NIS: '12345', Tanggal: new Date().toISOString(), time_in: '07:00', time_out: '16:00', StatusAbsen: 'Hadir', lat: -6.2, lng: 106.8, photo: '', Status: 'Disetujui' },
                        { ID_Absen: 'A2', NIS: '12346', Tanggal: new Date().toISOString(), time_in: '07:15', time_out: '', StatusAbsen: 'Hadir', lat: -6.21, lng: 106.81, photo: '', Status: 'Disetujui' },
                        { ID_Absen: 'A3', NIS: '12345', Tanggal: new Date(Date.now() - 86400000).toISOString(), time_in: '07:05', time_out: '16:10', StatusAbsen: 'Hadir', lat: -6.2, lng: 106.8, photo: '', Status: 'Disetujui' }
                    ],
                    JURNAL: [
                        { ID_Jurnal: 'J1', NIS: '12345', Tanggal: new Date().toISOString(), Aktifitas: 'Mengerjakan modul autentikasi', status: 'Pending', feedback: '' },
                        { ID_Jurnal: 'J2', NIS: '12345', Tanggal: new Date(Date.now() - 86400000).toISOString(), Aktifitas: 'Analisis kebutuhan sistem', status: 'Disetujui', feedback: 'Lanjutkan detailnya' }
                    ],
                    JUDULLAPORAN: [
                        { ID_Judul: 'L1', NIS: '12345', JudulAjuan: 'Sistem Informasi Monitoring PKL Berbasis Web', status: 'Pending', feedback: '', DiprosesOleh: '' },
                        { ID_Judul: 'L2', NIS: '12346', JudulAjuan: 'Rancang Bangun Aplikasi Kasir Pintar', status: 'Revisi', feedback: 'Persempit ruang lingkupnya', DiprosesOleh: 'Ibnu Batutah' }
                    ],
                    PENGUMUMAN: [
                        { ID_Info: 'INF001', Judul: 'Pengumpulan Laporan Tahap 1', Konten: 'Harap segera mengumpulkan draf laporan bab 1-3 ke pembimbing masing-masing.', Pembuat: 'Admin Hubin', Jurusan: 'Semua', Tanggal: new Date().toISOString(), Status: 'Aktif' },
                        { ID_Info: 'INF002', Judul: 'Workshop Penulisan Jurnal', Konten: 'Akan diadakan workshop daring mengenai tata cara penulisan jurnal harian yang efektif.', Pembuat: 'Guru Produktif', Jurusan: 'RPL', Tanggal: new Date().toISOString(), Status: 'Aktif' }
                    ],
                    EVENT: [
                        { ID_Even: 'EVT001', NamaEven: 'Seminar Industri 4.0', Jurusan: 'RPL', TanggalEven: '2026-02-15', Durasi: '09:00 - 12:00', Lokasi: 'Aula Sekolah', Pengisi: 'PT. Digital Solusi', LAT: -6.1754, LNG: 106.8272, Deskripsi: 'Seminar mengenai tren teknologi terbaru di industri perangkat lunak.' },
                        { ID_Even: 'EVT002', NamaEven: 'Kunjungan Industri Batch 2', Jurusan: 'Semua', TanggalEven: '2026-03-01', Durasi: '08:00 - selesai', Lokasi: 'Kawasan Industri Cikarang', Pengisi: 'Tim Hubin', LAT: -6.2855, LNG: 107.1706, Deskripsi: 'Kunjungan lapangan untuk melihat proses produksi secara langsung.' }
                    ],
                    JURUSAN: [
                        { ID_Jurusan: 'J1', Jurusan: 'RPL' },
                        { ID_Jurusan: 'J2', Jurusan: 'TKJ' },
                        { ID_Jurusan: 'J3', Jurusan: 'AKL' },
                        { ID_Jurusan: 'J4', Jurusan: 'OTKP' },
                        { ID_Jurusan: 'J5', Jurusan: 'BDP' }
                    ],
                    ABSENEVEN: [
                        { ID_Even: 'EVT001', NIS: '12345', tanggal: '2026-02-15', jam: '08:55', LAT: -6.1754, LNG: 106.8272, status: 'Hadir' },
                        { ID_Even: 'EVT001', NIS: '12346', tanggal: '2026-02-15', jam: '09:05', LAT: -6.1760, LNG: 106.8280, status: 'Hadir' }
                    ],
                    DOKUMEN: [
                        { ID_DOK: 'DOC001', NamaDok: 'Surat Pengantar PKL', Dokumen: 'https://docs.google.com/document/d/example1' },
                        { ID_DOK: 'DOC002', NamaDok: 'Sertifikat PKL', Dokumen: 'https://docs.google.com/document/d/example2' }
                    ],
                    JADWALPKL: [
                        { ID: 'MAIN_SCHEDULE', StartDate: '2026-06-01', EndDate: '2026-09-30' }
                    ],
                    LOKASIPKL: [
                        { ID_PKL: 'L001', NamaTempat: 'PT. Maju Mundur', Alamat: 'Jl. Raya No. 1', Jurusan: 'RPL', NamaPimpinan: 'Bpk. Adi', NamaMentor: 'Ibu Ani', KontakMentor: '0812345678', LAT: -6.2, LNG: 106.8, BidangUsaha: 'Software House', Email: 'info@maju.com', description: 'Gedung A' }
                    ],
                    DATAPKL: [
                        { nis: '12345', ID_PKL: 'L001', StartDate: '2026-01-01', EndDate: '2026-06-30', ID_GURU: 'G001' },
                        { nis: '12346', ID_PKL: 'L001', StartDate: '2026-01-01', EndDate: '2026-06-30', ID_GURU: 'G010' }
                    ],
                    BIMBINGAN: [
                        { ID_BIMBINGAN: 'BIM-001', NIS: '12345', Tanggal: new Date().toISOString(), Jenis_keg: 'Bimbingan Laporan', Deskripsi: 'Diskusi struktur Bab 1', Pelaksana: 'Guru Test' }
                    ]
                };
                resolve({
                    status: 'success',
                    data: mockData[tab] || []
                });
            }, 500);
        });
    },
    async uploadFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Data = reader.result.split(',')[1];
                try {
                    const response = await this.request('upload', '', {
                        fileName: file.name,
                        mimeType: file.type,
                        base64Data: base64Data
                    });
                    resolve(response);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = error => reject(error);
        });
    },

    async updateProfile(role, idValue, data) {
        const tabMap = {
            'admin': 'LOGINADMIN',
            'guru': 'LOGINGURU',
            'kakomli': 'LOGINKAKOMLI',
            'mentor': 'LOGINMENTOR',
            'siswa': 'LOGINSISWA'
        };
        return this.request('update', tabMap[role], { id: idValue, data });
    },

    async compressImage(file, { maxWidth = 800, maxHeight = 800, quality = 0.7 } = {}) {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith('image/')) {
                return resolve(file); // Return as is if not an image
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = event => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(blob => {
                        if (!blob) return reject(new Error('Gagal kompres gambar'));
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });
                        resolve(compressedFile);
                    }, 'image/jpeg', quality);
                };
                img.onerror = () => reject(new Error('Gagal memuat gambar untuk dikompres'));
            };
            reader.onerror = () => reject(new Error('Gagal membaca file untuk dikompres'));
        });
    },

    /**
     * Show modern toast notification
     */
    showNotification(message, type = 'success', duration = 3000) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = 'position: fixed; top: 1.5rem; right: 1.5rem; z-index: 10000; display: flex; flex-direction: column; gap: 0.75rem; pointer-events: none;';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        const icon = type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle');
        const bgColor = type === 'success' ? '#10b981' : (type === 'error' ? '#ef4444' : '#3b82f6');

        toast.className = 'glass fade-in';
        toast.style.cssText = `
            min-width: 250px;
            padding: 1rem 1.25rem;
            border-radius: 1rem;
            background: ${bgColor}ee;
            color: white;
            display: flex;
            align-items: center;
            gap: 0.875rem;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.2);
            border: 1px solid rgba(255,255,255,0.2);
            pointer-events: auto;
            transform: translateX(20px);
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        `;

        toast.innerHTML = `
            <i class="fas ${icon}" style="font-size: 1.25rem;"></i>
            <span style="font-weight: 500; font-size: 0.9rem;">${message}</span>
        `;

        container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        });

        // Auto remove
        setTimeout(() => {
            toast.style.transform = 'translateX(20px)';
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 400);
        }, duration);
    }
};

/**
 * Standard password visibility toggle
 * @param {string} inputId - ID of the password input field
 */
function togglePasswordVisibility(inputId = 'password') {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(inputId === 'password' ? 'toggleIcon' : 'toggleIcon-' + inputId);

    if (!input || !icon) return;

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

window.API = API;
window.togglePasswordVisibility = togglePasswordVisibility;
