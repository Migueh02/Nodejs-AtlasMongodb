function validarTelefono(event) {
    const telefono = event.target;
    const regex = /^[0-9]*$/;  // Solo números permitidos
    const maxLength = 11;  // Número máximo de caracteres permitido

    // Si el valor no coincide con la expresión regular, muestra alerta y lo limpia
    if (!regex.test(telefono.value)) {
        Swal.fire({
            title: "Error",
            text: "Solo se permiten números en el campo de teléfono.",
            icon: "error",
            confirmButtonText: "OK"
        });
        telefono.value = telefono.value.replace(/[^0-9]/g, "");  // Elimina caracteres no numéricos
    }

    // Si la longitud supera el máximo de 11 caracteres, corta el valor
    if (telefono.value.length > maxLength) {
        telefono.value = telefono.value.slice(0, maxLength);  // Limita la longitud a 11 caracteres
    }
}

function validarNombre() {
    const nombreInput = document.getElementById('nombre');
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

    if (!regex.test(nombreInput.value)) {
        // Si se detectan caracteres no permitidos
        nombreInput.value = nombreInput.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');

        Swal.fire({
            icon: 'warning',
            title: 'Caracteres no permitidos',
            text: 'El nombre solo puede contener letras y espacios.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#007bff'
        });
    }
}

    document.addEventListener("DOMContentLoaded", () => {
        const deleteButtons = document.querySelectorAll(".delete-btn");

        deleteButtons.forEach(button => {
            button.addEventListener("click", (e) => {
                const emprendedorId = button.dataset.id;
                const form = button.closest(".delete-form");

                Swal.fire({
                    title: "¿Estás seguro?",
                    text: "¡No podrás recuperar este dato después de eliminarlo!",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#d33",
                    cancelButtonColor: "#3085d6",
                    confirmButtonText: "Sí, eliminar",
                    cancelButtonText: "Cancelar",
                }).then((result) => {
                    if (result.isConfirmed) {
                        form.submit(); // Envía el formulario si se confirma
                    }
                });
            });
        });
    });