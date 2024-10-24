function updateJumlah(menuId, change) {
    const input = document.getElementById(menuId);
    let currentValue = parseInt(input.value) || 0; // Menghindari NaN
    currentValue = Math.max(0, currentValue + change);
    input.value = currentValue;
}

document.addEventListener('DOMContentLoaded', () => {
    const uangDiberiInput = document.getElementById('uangDiberi');

    // Event listener untuk format input
    uangDiberiInput.addEventListener('input', (event) => {
        let value = event.target.value.replace(/\./g, ''); // Hapus titik
        if (!isNaN(value) && value !== '') {
            event.target.value = formatRibuan(value);
        } else {
            event.target.value = ''; // Jika bukan angka, set input kosong
        }
    });
});

// Fungsi untuk menambahkan titik sebagai pemisah ribuan
function formatRibuan(num) {
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Fungsi untuk menghapus titik
function removeDots(num) {
    return num.replace(/\./g, '');
}

document.getElementById('kasirForm').addEventListener('submit', function(e) {
    e.preventDefault();

    let total = 0;
    let transaksiRincian = ""; // Variabel untuk menyimpan rincian transaksi
    const hargaItems = document.querySelectorAll('.menu-item');

    // Ambil nama pembeli
    const namaPembeli = document.getElementById('nama').value;

    hargaItems.forEach((item, index) => {
        const harga = parseInt(item.querySelector('.harga').textContent) || 0; // Ambil harga
        const jumlah = parseInt(document.getElementById(`menu${index + 1}`).value) || 0; // Ambil jumlah
        if (jumlah > 0) { // Hanya tampilkan jika jumlah lebih dari 0
            const subtotal = harga * jumlah;
            total += subtotal;

            // Tambahkan rincian ke string
            transaksiRincian += `<li>Menu ${index + 1} (${item.querySelector('h3').textContent}): ${jumlah} x Rp ${harga} = Rp ${subtotal}</li>`;
        }
    });

    transaksiRincian += "</ul>"; // Menutup <ul>

    const uangDiberi = parseInt(removeDots(document.getElementById('uangDiberi').value)) || 0; // Pastikan uang diberi valid
    const kembalian = uangDiberi - total;

    // Tampilkan hasil
    const hasilDiv = document.getElementById('hasil');
    hasilDiv.innerHTML = `<h3>Rincian Transaksi:</h3>
    <h3>Nama Pembeli: ${namaPembeli}</h3>
    ${transaksiRincian}
    <h3>Total Harga: Rp ${formatRibuan(total.toString())}</h3>
    <h3>Uang Pembeli: Rp ${formatRibuan(uangDiberi.toString())}</h3>
    <h3>Kembalian: Rp ${formatRibuan(kembalian.toString())}</h3>`;

    // Simpan riwayat transaksi
    let riwayatTransaksi = JSON.parse(localStorage.getItem('riwayatTransaksi')) || [];
    riwayatTransaksi.push({
        nama: namaPembeli,
        rincian: transaksiRincian,
        total: total,
        kembalian: kembalian
    });
    localStorage.setItem('riwayatTransaksi', JSON.stringify(riwayatTransaksi));

    // Penyimpanan data pendapatan menggunakan localStorage
    let pendapatanSebelumnya = parseInt(localStorage.getItem('totalPendapatan')) || 0; // Ambil pendapatan sebelumnya, default 0 jika belum ada
    let pendapatanBaru = pendapatanSebelumnya + total; // Tambahkan total transaksi ke pendapatan sebelumnya

    localStorage.setItem('totalPendapatan', pendapatanBaru); // Simpan pendapatan baru ke localStorage

    // Tampilkan total pendapatan yang sudah tersimpan
    document.getElementById('totalPendapatan').textContent = `Total Pendapatan: Rp ${formatRibuan(pendapatanBaru.toString())}`;

    // Reset form untuk transaksi baru
    document.getElementById('kasirForm').reset();

    // Kosongkan jumlah di setiap menu menjadi 0
    hargaItems.forEach((item, index) => {
        document.getElementById(`menu${index + 1}`).value = 0;
    });

    // Kosongkan hasil transaksi sebelumnya
    setTimeout(() => {
        hasilDiv.innerHTML = ""; // Kosongkan rincian transaksi setelah beberapa detik
    }, 8000); // Rincian transaksi akan dihapus setelah 8 detik
});

// Fungsi untuk menampilkan riwayat pembeli
function tampilkanRiwayatPembeli() {
    const riwayatTransaksi = JSON.parse(localStorage.getItem('riwayatTransaksi')) || [];
    const hasilRiwayatDiv = document.getElementById('riwayatPembeli');
    hasilRiwayatDiv.innerHTML = ''; // Kosongkan sebelumnya

    if (riwayatTransaksi.length > 0) {
        riwayatTransaksi.forEach(transaksi => {
            hasilRiwayatDiv.innerHTML += `
                <div>
                    <h4>Nama Pembeli: ${transaksi.nama}</h4>
                    <h4>Rincian Transaksi:</h4>
                    <p>${transaksi.rincian}</p>
                    <p>Total: Rp ${formatRibuan(transaksi.total.toString())}</p>
                    <p>Kembalian: Rp ${formatRibuan(transaksi.kembalian.toString())}</p>
                </div>
                <hr>
            `;
        });
        // Tampilkan tombol Close
        document.getElementById('closeRiwayat').style.display = 'block';
    } else {
        hasilRiwayatDiv.innerHTML = `<p>Tidak ada riwayat transaksi.</p>`;
        // Sembunyikan tombol Close jika tidak ada riwayat
        document.getElementById('closeRiwayat').style.display = 'none';
    }
}

// Event listener untuk tombol Close
document.getElementById('closeRiwayat').addEventListener('click', function() {
    document.getElementById('riwayatPembeli').innerHTML = `
        <h2>Riwayat Pembeli</h2>
        <button id="cekRiwayat">Cek Riwayat</button>
        <button id="closeRiwayat" style="display: none;">Close</button>
    `;
    // Sembunyikan tombol Close
    document.getElementById('closeRiwayat').style.display = 'none';
});

// Memastikan event listener untuk tombol "Cek Riwayat" tetap berfungsi
document.getElementById('cekRiwayat').addEventListener('click', function() {
    tampilkanRiwayatPembeli(); // Panggil fungsi tanpa parameter
});

// Tampilkan total pendapatan saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    let pendapatanTersimpan = parseInt(localStorage.getItem('totalPendapatan')) || 0; // Ambil pendapatan dari localStorage, default 0 jika belum ada
    document.getElementById('totalPendapatan').textContent = `Total Pendapatan: Rp ${formatRibuan(pendapatanTersimpan.toString())}`;
});
