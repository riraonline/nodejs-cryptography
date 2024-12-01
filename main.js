const crypto = require("crypto");  // Modul untuk kriptografi, digunakan untuk hashing dan enkripsi
const fs = require("fs");          // Modul untuk membaca dan menulis file
const readlineSync = require("readline-sync"); // Modul untuk interaksi dengan pengguna melalui input di terminal

// Kelas untuk Enkripsi
class Encryption {
    // Fungsi untuk hashing menggunakan algoritma tertentu (default sha256)
    static hashing(input, algoritm = 'sha256') {
        const hash = crypto.createHash(algoritm);   // Membuat objek hash dengan algoritma yang dipilih
        hash.update(input);  // Mengupdate hash dengan input dari pengguna
        return hash.digest('hex');  // Menghasilkan hasil hash dalam format hexadecimal
    }

    // Fungsi untuk enkripsi simetris (AES-256)
    static symmetric(input, key) {
        // Membuat cipher dengan algoritma AES-256-CBC dan key yang diterima (harus 32 byte)
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.alloc(16, 0)); // 16 byte IV (Initial Vector)
        let encrypted = cipher.update(input, 'utf8', 'hex');  // Enkripsi input
        encrypted += cipher.final('hex');  // Menambahkan sisa hasil enkripsi
        return encrypted;  // Mengembalikan hasil enkripsi dalam format hexadecimal
    }

    // Fungsi untuk enkripsi asimetris menggunakan kunci publik
    static asymmetric(input, publicKey) {
        const encrypted = crypto.publicEncrypt(publicKey, Buffer.from(input));  // Menggunakan kunci publik untuk enkripsi
        return encrypted.toString('hex');  // Mengembalikan hasil enkripsi dalam format hexadecimal
    }
}

// Kelas untuk Dekripsi
class Decryption {
    // Fungsi untuk dekripsi hashing (hashing tidak dapat didekripsi)
    static hashing(input, algoritm = 'sha256') {
        return `Hashing tidak bisa didekripsi. Cek algoritma yang digunakan.`;
    }

    // Fungsi untuk dekripsi simetris (AES-256)
    static symmetric(input, key) {
        // Membuat decipher untuk dekripsi dengan AES-256-CBC dan key yang diterima (harus 32 byte)
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.alloc(16, 0)); // 16 byte IV
        let decrypted = decipher.update(input, 'hex', 'utf8');  // Dekripsi input
        decrypted += decipher.final('utf8');  // Menambahkan sisa hasil dekripsi
        return decrypted;  // Mengembalikan hasil dekripsi dalam format teks UTF-8
    }

    // Fungsi untuk dekripsi asimetris menggunakan kunci privat
    static asymmetric(input, privateKey) {
        const decrypted = crypto.privateDecrypt(privateKey, Buffer.from(input, 'hex'));  // Menggunakan kunci privat untuk dekripsi
        return decrypted.toString('utf8');  // Mengembalikan hasil dekripsi dalam format teks UTF-8
    }
}

// Fungsi utama program
function main() {
    console.log("Selamat datang di program enkripsi dan dekripsi!");

    // Fungsi untuk menghasilkan kunci AES secara otomatis (32 byte = 256-bit)
    function generateKey() {
        return crypto.randomBytes(32).toString('hex');  // Menghasilkan 32 byte random dan mengubahnya ke format hex
    }

    const key = generateKey();  // Menghasilkan kunci AES
    console.log('Kunci AES yang dihasilkan:', key);  // Menampilkan kunci AES yang dihasilkan ke pengguna

    // Mengambil input operasi dari pengguna (enkripsi atau dekripsi)
    const operasi = readlineSync.question('Pilih operasi (enkripsi/dekripsi): ').toLowerCase();

    // Mengambil input teknik enkripsi (Hashing, Simetris, atau Asimetris)
    const teknik = readlineSync.question('Pilih teknik (Hashing/Simetris/Asimetris): ').toLowerCase();
    const input = readlineSync.question('Masukkan input teks: ');  // Input teks dari pengguna

    let hasil;  // Variabel untuk menyimpan hasil enkripsi/dekripsi
    let kunci = '';  // Variabel untuk menyimpan kunci enkripsi (jika diperlukan)

    // Jika teknik yang dipilih adalah simetris atau asimetris, pengguna akan diminta memasukkan kunci
    if (teknik === 'simetris' || teknik === 'asimetris') {
        kunci = readlineSync.question('Masukkan kunci (sebagai string): ');
    }

    // Logika untuk enkripsi
    if (operasi === 'enkripsi') {
        switch (teknik) {
            case 'hashing':
                hasil = Encryption.hashing(input);  // Panggil fungsi hashing
                break;
            case 'simetris':
                hasil = Encryption.symmetric(input, kunci);  // Panggil fungsi enkripsi simetris
                break;
            case 'asimetris':
                const publicKey = fs.readFileSync('publicKey.pem', 'utf8');  // Membaca kunci publik dari file PEM
                hasil = Encryption.asymmetric(input, publicKey);  // Panggil fungsi enkripsi asimetris
                break;
            default:
                console.log('Teknik yang dipilih tidak valid.');
                return;
        }
        console.log('Hasil Enkripsi:', hasil);  // Menampilkan hasil enkripsi ke pengguna

        // Menyimpan hasil enkripsi ke file JSON
        fs.writeFileSync('enkripsi.json', JSON.stringify({ input: input, hasil: hasil }, null, 2));
    } 
    // Logika untuk dekripsi
    else if (operasi === 'dekripsi') {
        switch (teknik) {
            case 'hashing':
                hasil = Decryption.hashing(input);  // Panggil fungsi dekripsi hashing
                break;
            case 'simetris':
                hasil = Decryption.symmetric(input, kunci);  // Panggil fungsi dekripsi simetris
                break;
            case 'asimetris':
                const privateKey = fs.readFileSync('privateKey.pem', 'utf8');  // Membaca kunci privat dari file PEM
                hasil = Decryption.asymmetric(input, privateKey);  // Panggil fungsi dekripsi asimetris
                break;
            default:
                console.log('Teknik yang dipilih tidak valid.');
                return;
        }
        console.log('Hasil Dekripsi:', hasil);  // Menampilkan hasil dekripsi ke pengguna

        // Menyimpan hasil dekripsi ke file JSON
        fs.writeFileSync('dekripsi.json', JSON.stringify({ input: input, hasil: hasil }, null, 2));
    } else {
        console.log('Operasi yang dipilih tidak valid.');  // Jika operasi yang dipilih tidak valid
    }
}

// Menjalankan program
main();  // Memanggil fungsi utama untuk menjalankan program
