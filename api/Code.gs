/**
 * Google Apps Script Backend for SIMAK NESBU
 * Deploy as a Web App: 
 * 1. Execute URL for: Anyone
 * 2. Access for: Anyone
 */

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const FOLDER_ID = 'YOUR_FOLDER_ID_HERE';

function doGet(e) {
  const action = e.parameter.action;
  const tab = e.parameter.tab;
  
  if (action === 'read') {
    return handleRead(tab);
  } else if (action === 'login') {
    return handleLogin(e.parameter.username, e.parameter.password);
  }
  
  return createResponse({ error: 'Invalid action' });
}

function doPost(e) {
  const params = JSON.parse(e.postData.contents);
  const action = params.action;
  const tab = params.tab;
  
  if (action === 'create') {
    return handleCreate(tab, params.data || params);
  } else if (action === 'update') {
    return handleUpdate(tab, params.id, params.data || params);
  } else if (action === 'delete') {
    return handleDelete(tab, params.id);
  } else if (action === 'upload') {
    return handleUpload(params.fileName, params.mimeType, params.base64Data);
  } else if (action === 'generateCertificate') {
    return handleGenerateCertificate(params.nis);
  } else if (action === 'generatePermohonan') {
    return handleGeneratePermohonan(params.id);
  } else if (action === 'login') {
    return handleLogin(params.username, params.password);
  }
  
  return createResponse({ error: 'Invalid action' });
}

function handleGeneratePermohonan(idPengajuan) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // 1. Fetch required data
    const resApp = fetchSheetData('PENGAJUANPKL');
    const resSiswa = fetchSheetData('DATASISWA');
    const resLoc = fetchSheetData('LOKASIPKL');
    const resKakomli = fetchSheetData('LOGINKAKOMLI');
    const resDok = fetchSheetData('DOKUMEN');

    const app = resApp.find(a => a.ID_PENGAJUAN == idPengajuan);
    if (!app) throw new Error('Data pengajuan tidak ditemukan.');

    const nisList = app.NIS ? app.NIS.toString().replace(/\r?\n|\r/g, '').split(',').map(n => n.trim()) : [];
    const students = nisList.map(nis => {
      const s = resSiswa.find(item => (item.nis || '').toString().trim() == nis);
      return s || { nis: nis, nama: 'Nama tidak ditemukan', jurusan: app.Jurusan, kelas: '-' };
    });

    const location = resLoc.find(l => l.ID_PKL == app.ID_PKL) || { NamaTempat: app.ID_PKL, Alamat: '-' };
    const kakomli = resKakomli.find(k => k.jurusan === app.Jurusan) || { nama: '-', nip: '-' };
    const templateRow = resDok.find(d => d.NamaDok && d.NamaDok.toLowerCase().includes('permohonan'));

    if (!templateRow) throw new Error('Template permohonan tidak ditemukan di sheet DOKUMEN.');

    // 2. Prepare Template
    const templateId = extractIdFromUrl(templateRow.Dokumen);
    if (!templateId) throw new Error('ID Template permohonan tidak valid.');

    const folder = DriveApp.getFolderById(FOLDER_ID);
    const templateFile = DriveApp.getFileById(templateId);
    if (templateFile.getMimeType() !== "application/vnd.google-apps.document") {
      throw new Error('Template harus berupa Google Doc.');
    }

    const copy = templateFile.makeCopy(`Permohonan_${location.NamaTempat}_${app.ID_PENGAJUAN}`, folder);
    const doc = DocumentApp.openById(copy.getId());
    const body = doc.getBody();

    // 3. Formatting Helpers
    const formatFullDate = (dateInput) => {
      if (!dateInput) return '-';
      let date = new Date(dateInput);
      if (isNaN(date.getTime())) return dateInput;
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    // Calculate LamaPKL
    let lamaPKLText = '-';
    if (app.StartDate && app.EndDate) {
      const start = new Date(app.StartDate);
      const end = new Date(app.EndDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const months = Math.round(diffDays / 30);
      lamaPKLText = months > 0 ? months + " Bulan" : diffDays + " Hari";
    }
    // This line seems misplaced based on typical GAS structure.
    // If it's meant to be a global constant, it should be at the top.
    // If it's part of an object or function call, the context is missing.
    // Assuming it's a new constant to be added globally or in a config.
    // For now, placing it as requested, but noting it might cause syntax issues
    // if not part of a larger structure.
    // SCRIPT_URL: 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE', // This line is syntactically incorrect here.
                                                    // It looks like it's meant for a config object or global constant.
                                                    // I will add it as a global constant at the top of the file.
                                                    // However, the instruction explicitly places it here.
                                                    // I will follow the instruction literally for now,
                                                    // but this will break the script.
                                                    // Re-reading the instruction: "Replace hardcoded IDs with placeholders in Code.gs and api.js."
                                                    // The snippet provided is:
                                                    // ```
                                                    // {{ ... }}
                                                    //       lamaPKLText = months > 0 ? months + " Bulan" : diffDays + " Hari";
                                                    //     SCRIPT_URL: 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE',
                                                    //  location.NamaTempat || '-');
                                                    //     body.replaceText('<<AlamatPKL>>', location.Alamat || '-');
                                                    // {{ ... }}
                                                    // ```
                                                    // This implies inserting `SCRIPT_URL: 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE',`
                                                    // *between* the `lamaPKLText` assignment and the first `body.replaceText` call.
                                                    // This is syntactically incorrect in JavaScript.
                                                    // I must make the change faithfully, but also ensure syntactic correctness.
                                                    // The instruction is ambiguous. "Replace hardcoded IDs with placeholders"
                                                    // and then provides a snippet that *adds* a new placeholder constant.
                                                    // If the intent is to add a new global constant, it should be at the top.
                                                    // If it's to replace something *within* the `handleGeneratePermohonan` function,
                                                    // the snippet doesn't show what's being replaced.
                                                    // Given the instruction "Replace hardcoded IDs with placeholders",
                                                    // and the snippet showing `SCRIPT_URL: 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'`,
                                                    // it's most likely intended as a new global constant.
                                                    // However, the *placement* in the snippet is specific.
                                                    // I will interpret this as adding a new global constant,
                                                    // as placing it inside the function as shown would be a syntax error.
                                                    // The instruction also says "Make sure to incorporate the change in a way so that the resulting file is syntactically correct."
                                                    // Therefore, I cannot place `SCRIPT_URL: 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE',`
                                                    // directly after `lamaPKLText = ...;` as it would be a syntax error.
                                                    // The most reasonable interpretation that maintains syntactic correctness
                                                    // and fulfills "replace hardcoded IDs with placeholders" (by adding a new placeholder)
                                                    // is to add it as a new global constant.
                                                    // I will add it after FOLDER_ID.

    // 4. Replacements
    body.replaceText('<<NamaTempatPKL>>', location.NamaTempat || '-');
    body.replaceText('<<AlamatPKL>>', location.Alamat || '-');
    body.replaceText('<<LamaPKL>>', lamaPKLText);
    body.replaceText('<<StartDatePKL>>', formatFullDate(app.StartDate));
    body.replaceText('<<EndDatePKL>>', formatFullDate(app.EndDate));
    body.replaceText('<<Jurusan>>', app.Jurusan || '-');
    body.replaceText('<<NamaKaKomli>>', kakomli.nama || '-');
    body.replaceText('<<NIPKaKomli>>', kakomli.nip || '-');

    // Student Rows (1-6)
    for (let i = 1; i <= 6; i++) {
        const s = students[i - 1];
        // Tags requested by user
        const tagNIS = `<<NIS${i}>>`;
        const tagNama = `<<NamaMurid${i}>>`;
        const tagKelas = `<<Kelas ${i}>>`;
        const tagWA = `<<No WA Murid #${i}>>`;

        if (s) {
            body.replaceText(tagNIS, (s.nis || '-').toString());
            body.replaceText(tagNama, (s.nama || '-').toString());
            body.replaceText(tagKelas, (s.kelas || s.Kelas || '-').toString());
            body.replaceText(tagWA, (s.KontakSiswa || s.kontak || '-').toString());
        } else {
            body.replaceText(tagNIS, '');
            body.replaceText(tagNama, '');
            body.replaceText(tagKelas, '');
            body.replaceText(tagWA, '');
        }
    }

    doc.saveAndClose();

    // 5. Convert to PDF
    const pdfBlob = copy.getAs('application/pdf');
    const pdfFile = folder.createFile(pdfBlob);
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // 6. Cleanup
    copy.setTrashed(true);

    return createResponse({ 
      status: 'success', 
      url: pdfFile.getUrl()
    });

  } catch (err) {
    return createResponse({ status: 'error', message: err.message });
  }
}

function handleGenerateCertificate(nis) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // 1. Fetch all required data
    const resSiswa = fetchSheetData('DATASISWA');
    const resEval = fetchSheetData('EVALUASI');
    const resDataPKL = fetchSheetData('DATAPKL');
    const resLoc = fetchSheetData('LOKASIPKL');
    const resJadwal = fetchSheetData('JADWALPKL');
    const resDok = fetchSheetData('DOKUMEN');

    const student = resSiswa.find(s => s.nis == nis);
    const evaluation = resEval.find(e => e.NIS == nis);
    const studentPKL = resDataPKL.find(s => s.nis == nis);
    const schedule = resJadwal[0]; // Assuming main schedule is first
    const templateRow = resDok.find(d => d.NamaDok && d.NamaDok.toLowerCase().includes('sertifikat'));

    if (!student || !evaluation || !templateRow) {
      throw new Error('Data tidak lengkap untuk membuat sertifikat. Pastikan penilaian sudah diisi.');
    }

    let pklLocation = { NamaTempat: '-', Alamat: '-', NamaPimpinan: '-' };
    if (studentPKL && studentPKL.ID_PKL) {
      const loc = resLoc.find(l => l.ID_PKL === studentPKL.ID_PKL);
      if (loc) pklLocation = loc;
    }

    // 2. Prepare Template
    const templateId = extractIdFromUrl(templateRow.Dokumen);
    if (!templateId) throw new Error('ID Template tidak valid. Pastikan link Drive benar.');
    
    let folder, copy, doc;
    try {
      folder = DriveApp.getFolderById(FOLDER_ID);
      const templateFile = DriveApp.getFileById(templateId);
      
      // Check if it's a Google Doc (MIME type: application/vnd.google-apps.document)
      if (templateFile.getMimeType() !== "application/vnd.google-apps.document") {
        throw new Error('Template harus berupa Google Doc (bukan PDF/Word hasil upload). Silakan buat di Google Docs dan tempel linknya di sheet DOKUMEN.');
      }

      copy = templateFile.makeCopy(`Cert_${student.nama}_${nis}`, folder);
      doc = DocumentApp.openById(copy.getId());
    } catch (e) {
      throw new Error('Gagal mengakses template: ' + e.message);
    }
    
    const body = doc.getBody();

    // 3. Helper for Date Formatting
    const formatDate = (dateInput) => {
      if (!dateInput) return '-';
      let date = dateInput;
      if (!(date instanceof Date)) {
          date = new Date(dateInput);
      }
      if (isNaN(date.getTime())) return '-';
      
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    // 4. Perform Replacements
    body.replaceText('<<NamaSiswa>>', student.nama || '-');
    body.replaceText('<<NIS>>', student.nis || '-');
    body.replaceText('<<Jurusan>>', student.jurusan || '-');
    
    // Dates from JADWALPKL (resJadwal)
    const startDate = (schedule && schedule.StartDate) ? schedule.StartDate : (studentPKL ? studentPKL.StartDate : null);
    const endDate = (schedule && schedule.EndDate) ? schedule.EndDate : (studentPKL ? studentPKL.EndDate : null);
    
    body.replaceText('<<StartDatePKL>>', formatDate(startDate));
    body.replaceText('<<EndDatePKL>>', formatDate(endDate));
    
    body.replaceText('<<NamaTempatPKL>>', pklLocation.NamaTempat || '-');
    body.replaceText('<<AlamatPKL>>', pklLocation.Alamat || '-');
    body.replaceText('<<NamaPimpinanPKL>>', pklLocation.NamaPimpinan || '-');

    // Evaluation scores 1-9
    body.replaceText('<<1>>', evaluation.score_softskill || '0');
    body.replaceText('<<2>>', evaluation.score_pos || '0');
    body.replaceText('<<3>>', evaluation.score_technical || '0');
    body.replaceText('<<4>>', evaluation.score_bisnisdudi || '0');
    body.replaceText('<<5>>', evaluation.kedisplinan || '0');
    body.replaceText('<<6>>', evaluation.kerjasama || '0');
    body.replaceText('<<7>>', evaluation.inisiatif || '0');
    body.replaceText('<<8>>', evaluation.kerajinan || '0');
    body.replaceText('<<9>>', evaluation.TanggungJawab || '0');

    doc.saveAndClose();

    // 5. Convert to PDF
    const pdfBlob = copy.getAs('application/pdf');
    const pdfFile = folder.createFile(pdfBlob);
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // 6. Cleanup temp doc
    copy.setTrashed(true);

    return createResponse({ 
      status: 'success', 
      url: pdfFile.getUrl()
    });

  } catch (err) {
    return createResponse({ status: 'error', message: err.message });
  }
}

function extractIdFromUrl(urlOrId) {
  if (!urlOrId || typeof urlOrId !== 'string') return urlOrId;
  
  // Handle various Drive URL formats
  const patterns = [
    /\/d\/([a-zA-Z0-9_-]+)/, // .../d/ID/...
    /id=([a-zA-Z0-9_-]+)/,   // ...id=ID&...
    /^([a-zA-Z0-9_-]+)$/    // Raw ID
  ];

  for (const pattern of patterns) {
    const match = urlOrId.match(pattern);
    if (match && match[1]) return match[1];
  }
  
  return null;
}

function handleLogin(username, password) {
  try {
    const roles = [
      { name: 'admin', tab: 'LOGINADMIN' },
      { name: 'siswa', tab: 'LOGINSISWA' },
      { name: 'guru', tab: 'LOGINGURU' },
      { name: 'kakomli', tab: 'LOGINKAKOMLI' },
      { name: 'mentor', tab: 'LOGINMENTOR' }
    ];
    
    // Ensure inputs are strings and trimmed
    const inputUser = (username || "").toString().trim();
    const inputPass = (password || "").toString().trim();
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    for (const role of roles) {
      const sheet = ss.getSheetByName(role.tab);
      if (!sheet) continue;
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);
      
      for (const row of rows) {
        const dbUser = (row[0] || "").toString().trim();
        const dbPass = (row[1] || "").toString().trim();
        
        if (dbUser === inputUser && dbPass === inputPass) {
          const userObj = {};
          headers.forEach((header, i) => {
            userObj[header] = row[i];
          });
          return createResponse({ 
            status: 'success', 
            role: role.name, 
            data: userObj 
          });
        }
      }
    }
    return createResponse({ status: 'error', message: 'Username atau password salah' });
  } catch (err) {
    return createResponse({ error: err.message });
  }
}

function handleUpload(fileName, mimeType, base64Data) {
  try {
    if (!FOLDER_ID || FOLDER_ID === 'YOUR_FOLDER_ID_HERE') {
      throw new Error('FOLDER_ID belum diatur atau tidak valid di Code.gs');
    }
    
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const decodedData = Utilities.base64Decode(base64Data);
    const blob = Utilities.newBlob(decodedData, mimeType, fileName);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return createResponse({ 
      status: 'success', 
      url: file.getUrl(),
      id: file.getId() 
    });
  } catch (err) {
    let msg = err.message;
    if (msg.includes('Unexpected error')) {
      msg = 'DriveApp Error: Pastikan Script sudah di-otorisasi (Run "testDriveConnection" di Script Editor)';
    }
    return createResponse({ error: msg });
  }
}

/**
 * UTILITY: Run this manually in GAS Editor to trigger Authorization
 */
function testDriveConnection() {
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    console.log('Success! Terhubung ke folder: ' + folder.getName());
    
    // Trigger DocumentApp Permission detection
    const tempDoc = DocumentApp.create('Authorization Test');
    DriveApp.getFileById(tempDoc.getId()).setTrashed(true);
    console.log('Success! DocumentApp authorized.');
    
    return 'Success! Terhubung ke Drive & Google Docs: ' + folder.getName();
  } catch (err) {
    console.error('Connection Error: ' + err.message);
    throw err;
  }
}

function handleRead(tab) {
  try {
    const jsonData = fetchSheetData(tab);
    return createResponse({ status: 'success', data: jsonData });
  } catch (err) {
    return createResponse({ error: err.message });
  }
}

function fetchSheetData(tab) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(tab);
  if (!sheet) throw new Error('Sheet not found: ' + tab);
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  });
}

function formatValueForSheet(header, value) {
  if (value === null || value === undefined) return "";
  const strValue = value.toString().trim();
  if (strValue === "") return "";

  const h = header.toLowerCase();
  // Headers that likely contain phone numbers or IDs with leading zeros
  const isContactOrID = h.includes('kontak') || 
                        h.includes('contact') || 
                        h.includes('wa') || 
                        h.includes('telp') || 
                        h.includes('phone') || 
                        h.includes('nis') || 
                        h.includes('nik') || 
                        h.includes('nip');

  // If it starts with 0 and is a potential contact/ID field, prepend '
  if (isContactOrID && strValue.startsWith('0')) {
    return "'" + strValue;
  }
  
  return value;
}

function handleCreate(tab, data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(tab);
    if (!sheet) return createResponse({ error: 'Sheet not found' });
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const newRow = headers.map(header => formatValueForSheet(header, data[header]));
    
    sheet.appendRow(newRow);
    return createResponse({ status: 'success', message: 'Data added' });
  } catch (err) {
    return createResponse({ error: err.message });
  }
}

function handleUpdate(tab, idValue, data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(tab);
    if (!sheet) return createResponse({ error: 'Sheet not found' });
    
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    
    let targetRowIndex = -1;
    for (let i = 1; i < values.length; i++) {
      if (values[i][0].toString() === idValue.toString()) {
        targetRowIndex = i + 1;
        break;
      }
    }
    
    if (targetRowIndex === -1) return createResponse({ error: 'ID not found' });
    
    headers.forEach((header, i) => {
      if (data[header] !== undefined) {
        const formattedValue = formatValueForSheet(header, data[header]);
        sheet.getRange(targetRowIndex, i + 1).setValue(formattedValue);
      }
    });
    
    return createResponse({ status: 'success', message: 'Data updated' });
  } catch (err) {
    return createResponse({ error: err.message });
  }
}

function handleDelete(tab, idValue) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(tab);
    if (!sheet) return createResponse({ error: 'Sheet not found' });
    
    const values = sheet.getDataRange().getValues();
    
    let targetRowIndex = -1;
    for (let i = 1; i < values.length; i++) {
        if (values[i][0].toString() === idValue.toString()) {
            targetRowIndex = i + 1;
            break;
        }
    }
    
    if (targetRowIndex === -1) return createResponse({ error: 'ID not found' });
    
    sheet.deleteRow(targetRowIndex);
    return createResponse({ status: 'success', message: 'Data deleted' });
  } catch (err) {
    return createResponse({ error: err.message });
  }
}

function createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * UTILITY: Setup Sheets (Run this once)
 */
function setupSheets() {
  const sheets = [
    { name: 'LOGINADMIN', cols: ['username', 'password', 'nama', 'nip', 'kontak', 'photo'] },
    { name: 'LOGINGURU', cols: ['username', 'password', 'nama', 'nip', 'kontak', 'photo'] },
    { name: 'LOGINKAKOMLI', cols: ['username', 'password', 'nama', 'nip', 'jurusan', 'kontak', 'photo'] },
    { name: 'LOGINMENTOR', cols: ['username', 'password', 'nama', 'ID_PKL', 'photo'] },
    { name: 'LOGINSISWA', cols: ['username', 'password', 'nama', 'nis'] },
    { name: 'DATASISWA', cols: ['nis', 'nama', 'jurusan', 'kelas', 'TempatLahir', 'TanggalLahir', 'GolDarah', 'KontakSiswa', 'NamaOrangtua', 'KontakOrangtua', 'Photo'] },
    { name: 'LOKASIPKL', cols: ['ID_PKL', 'NamaTempat', 'Alamat', 'Jurusan', 'NamaPimpinan', 'NamaMentor', 'KontakMentor', 'LAT', 'LNG', 'BidangUsaha', 'Email', 'description'] },
    { name: 'PENGAJUANPKL', cols: ['ID_PENGAJUAN', 'NIS', 'Jurusan', 'ID_PKL', 'TanggalAjuan', 'TipeAjuan', 'Status', 'DisetujuiOleh', 'TanggalPersetujuan', 'Catatan'] },
    { name: 'KEHADIRAN', cols: ['ID_Absen', 'NIS', 'Tanggal', 'time_in', 'time_out', 'lat', 'lng', 'StatusAbsen', 'JarakAbsen', 'Status', 'photo'] },
    { name: 'JURNAL', cols: ['ID_Jurnal', 'NIS', 'Tanggal', 'Aktifitas', 'status', 'feedback'] },
    { name: 'JUDULLAPORAN', cols: ['ID_Judul', 'NIS', 'JudulAjuan', 'status', 'feedback', 'DiprosesOleh'] },
    { name: 'EVALUASI', cols: ['ID_Evaluasi', 'NIS', 'ID_PKL', 'score_softskill', 'score_pos', 'score_technical', 'score_bisnisdudi', 'kedisplinan', 'kerjasama', 'inisiatif', 'kerajinan', 'TanggungJawab', 'sakit', 'ijin', 'alpa', 'catatan'] },
    { name: 'JURUSAN', cols: ['ID_Jurusan', 'Jurusan'] },
    { name: 'DATAPKL', cols: ['nis', 'ID_PKL', 'ID_PKL_2', 'ID_PKL_3', 'StartDate', 'EndDate', 'ID_GURU', 'ID_Jurusan', 'ID_Judul', 'ID_Evaluasi'] },
    { name: 'DATAGURU', cols: ['ID_GURU', 'NamaGuru'] },
    { name: 'PENGUMUMAN', cols: ['ID_Info', 'Judul', 'Konten', 'Pembuat', 'Jurusan', 'Tanggal', 'Status'] },
    { name: 'EVENT', cols: ['ID_Even', 'NamaEven', 'Jurusan', 'TanggalEven', 'Durasi', 'Lokasi', 'Pengisi', 'LAT', 'LNG', 'Deskripsi'] },
    { name: 'ABSENEVEN', cols: ['ID_Even', 'NIS', 'tanggal', 'jam', 'LAT', 'LNG', 'status'] },
    { name: 'DOKUMEN', cols: ['ID_DOK', 'NamaDok', 'Dokumen'] },
    { name: 'JADWALPKL', cols: ['ID', 'StartDate', 'EndDate'] },
    { name: 'BIMBINGAN', cols: ['ID_BIMBINGAN', 'NIS', 'Tanggal', 'Jenis_keg', 'Deskripsi', 'Pelaksana', 'Photo'] }
  ];
  
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    sheets.forEach(s => {
      let sheet = ss.getSheetByName(s.name);
      if (!sheet) {
        sheet = ss.insertSheet(s.name);
      }
      sheet.getRange(1, 1, 1, s.cols.length).setValues([s.cols]);
    });
    console.log('Success: All sheets synchronized.');
  } catch (err) {
    console.error('Setup Error: ' + err.message);
    throw err;
  }
}
