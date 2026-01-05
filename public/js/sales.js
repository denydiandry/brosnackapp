let currentItems = [];

// LOAD ITEM
async function loadDropdownItem() {
  const res = await fetch("/api/item");
  const data = await res.json();

  const select = document.getElementById("kode_item");
  select.innerHTML = `<option value="">-- Pilih --</option>`;

  data.forEach(i => {
      select.innerHTML += `<option value="${i.kode}">${i.kode}</option>`;
  });
}

async function pilihItem() {
  const kode = document.getElementById("kode_item").value;
  if (!kode) return;

  const res = await fetch("/api/item");
  const data = await res.json();

  const item = data.find(x => x.kode === kode);

  if (item) {
      document.getElementById("nama_item").value = item.nama;
      document.getElementById("harga").value = item.harga;
  }
}

function tambahItem() {
  const kode_item = document.getElementById("kode_item").value;
  const nama_item = document.getElementById("nama_item").value;
  const harga = parseFloat(document.getElementById("harga").value);
  const qty = parseInt(document.getElementById("qty").value);

  if (!kode_item || !qty) {
      alert("Data belum lengkap!");
      return;
  }

  const total = harga * qty;

  currentItems.push({ kode_item, nama_item, harga, qty, total });

  updateTabelInvoice();
  resetForm();
}

function updateTabelInvoice() {
  const tbody = document.getElementById("tabel-penjualan");
  tbody.innerHTML = "";

  currentItems.forEach((p, i) => {
      tbody.innerHTML += `
          <tr>
              <td>${p.kode_item}</td>
              <td>${p.nama_item}</td>
              <td>${p.harga}</td>
              <td>${p.qty}</td>
              <td>${p.total}</td>
              <td><button onclick="hapusItem(${i})">Hapus</button></td>
          </tr>
      `;
  });
}

function hapusItem(i) {
  currentItems.splice(i, 1);
  updateTabelInvoice();
}

async function simpanInvoice() {
  const tanggal = document.getElementById("tanggal").value;

  if (!tanggal) {
      alert("Tanggal wajib diisi!");
      return;
  }

  if (currentItems.length === 0) {
      alert("Belum ada item!");
      return;
  }

  const res = await fetch("/api/invoice/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
          tanggal,
          items: currentItems
      })
  });

  const hasil = await res.json();

  if (hasil.success) {
      alert("Invoice berhasil dibuat: " + hasil.invoice_no);
      currentItems = [];
      updateTabelInvoice();
      resetForm();
  } else {
      alert("Gagal membuat invoice!");
  }
}

function resetForm() {
  document.getElementById("kode_item").value = "";
  document.getElementById("nama_item").value = "";
  document.getElementById("harga").value = "";
  document.getElementById("qty").value = "";
}

loadDropdownItem();
