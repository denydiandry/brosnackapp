async function loadItem() {
    const res = await fetch("/api/item");
    const data = await res.json();

    const tbody = document.getElementById("tabel-item");
    tbody.innerHTML = "";

    data.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td>${item.kode}</td>
                <td>${item.nama}</td>
                <td>${item.harga}</td>
                <td>${item.stok}</td>
                <td>
                    <button onclick="editItem('${item.kode}', '${item.nama}', '${item.harga}', '${item.stok}')">Edit</button>
                    <button onclick="hapusItem('${item.kode}')">Hapus</button>
                </td>
            </tr>
        `;
    });
}

async function simpanItem() {
    const mode = document.getElementById("btn-simpan").getAttribute("mode");
    const kode = document.getElementById("kode").value;
    const nama = document.getElementById("nama").value;
    const harga = document.getElementById("harga").value;
    const stok = document.getElementById("stok").value;

    let url = "/api/item";
    let method = "POST";
    let body = { kode, nama, harga, stok };

    if (mode === "edit") {
        url = `/api/item/${kode}`;
        method = "PUT";
        body = { nama, harga, stok };
    }

    const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    if (res.ok) {
        resetForm();
        loadItem();
        alert("Data berhasil disimpan!");
    } else {
        alert("Gagal menyimpan data!");
    }
}

function editItem(kode, nama, harga, stok) {
    document.getElementById("kode").value = kode;
    document.getElementById("nama").value = nama;
    document.getElementById("harga").value = harga;
    document.getElementById("stok").value = stok;

    document.getElementById("kode").disabled = true;
    document.getElementById("btn-simpan").setAttribute("mode", "edit");
}

async function hapusItem(kode) {
    if (!confirm("Yakin hapus item?")) return;

    const res = await fetch(`/api/item/${kode}`, { method: "DELETE" });

    if (res.ok) {
        loadItem();
        alert("Item berhasil dihapus!");
    }
}

function resetForm() {
    document.getElementById("kode").disabled = false;
    document.getElementById("btn-simpan").setAttribute("mode", "add");

    document.getElementById("kode").value = "";
    document.getElementById("nama").value = "";
    document.getElementById("harga").value = "";
    document.getElementById("stok").value = "";
}

window.onload = loadItem;
