let editingKode = null;

// =======================
// LOAD DATA GRUP
// =======================
async function loadGrup() {
    const res = await fetch("/api/grup");
    const data = await res.json();

    const tbody = document.getElementById("tbody-grup");
    tbody.innerHTML = "";

    data.forEach(row => {
        tbody.innerHTML += `
            <tr>
                <td>${row.kode}</td>
                <td>${row.nama}</td>
                <td>
                    <button onclick="editGrup('${row.kode}', '${row.nama}')">Edit</button>
                    <button onclick="deleteGrup('${row.kode}')">Hapus</button>
                </td>
            </tr>
        `;
    });
}

// =======================
// SIMPAN (TAMBAH / EDIT)
// =======================
async function saveGrup(event) {
    event.preventDefault();

    const kode = document.getElementById("kode").value.trim();
    const nama = document.getElementById("nama").value.trim();

    if (!kode || !nama) {
        alert("Kode dan Nama harus diisi!");
        return;
    }

    let url = "/api/grup";
    let method = "POST";

    if (editingKode) {
        url = `/api/grup/${editingKode}`;
        method = "PUT";
    }

    const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kode, nama })
    });

    const result = await res.json();

    if (result.success) {
        document.getElementById("grup-form").reset();
        editingKode = null;
        loadGrup();
    } else {
        alert("Gagal menyimpan data");
    }
}

// =======================
// EDIT
// =======================
function editGrup(kode, nama) {
    editingKode = kode;
    document.getElementById("kode").value = kode;
    document.getElementById("nama").value = nama;
}

// =======================
// DELETE
// =======================
async function deleteGrup(kode) {
    if (!confirm("Hapus data ini?")) return;

    const res = await fetch(`/api/grup/${kode}`, {
        method: "DELETE"
    });

    const result = await res.json();
    if (result.success) {
        loadGrup();
    }
}
