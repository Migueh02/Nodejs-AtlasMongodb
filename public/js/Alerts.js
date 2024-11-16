document.getElementById('telefono').addEventListener('input', function () {
    const telefonoInput = this;
    if (telefonoInput.value < 0) {
        telefonoInput.value = ''; // Borra el valor si es negativo
        Swal.fire({
            icon: 'error',
            title: 'Número no válido',
            text: 'El número de teléfono no puede ser negativo.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#d33',
            background: '#f8d7da',
            color: '#721c24'
        });
    }
});

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