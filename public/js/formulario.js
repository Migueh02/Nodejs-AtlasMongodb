function mostrarFormulario() {
    var formContainer = document.getElementById("formContainer");
    formContainer.style.display = formContainer.style.display === "none" ? "block" : "none";
}

function searchTable() {
    // Obtener el valor del campo de búsqueda
    const filter = document.getElementById("searchInput").value.toUpperCase();
    const table = document.querySelector("table");
    const trs = table.querySelectorAll("tbody tr");

    trs.forEach(tr => {
        const tds = tr.getElementsByTagName("td");
        let match = false;

        // Verificar si alguna celda coincide con el filtro
        for (let i = 0; i < tds.length - 1; i++) {
            const td = tds[i];
            if (td.textContent.toUpperCase().includes(filter)) {
                match = true;
                break;
            }
        }

        // Mostrar u ocultar la fila
        if (match) {
            tr.style.display = "";
        } else {
            tr.style.display = "none";
        }
    });
}