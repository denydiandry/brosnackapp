async function loadItems() {
    let res = await fetch('/api/items');
    let data = await res.json();

    let tbody = document.getElementById("itemTableBody");
    tbody.innerHTML = "";

    data.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td>${item.kode}</td>
                <td>${item.nama}</td>
                <td>${item.harga_beli}</td>
                <td>${item.harga_jual}</td>
                <td>${item.stok}</td>
                <td>
                    <button onclick="editItem('${item.id}')">Edit</button>
                    <button onclick="deleteItem('${item.id}')">Hapus</button>
                </td>
            </tr>
        `;
    });
}
