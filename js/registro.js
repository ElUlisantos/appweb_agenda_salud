document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formRegistro');
    const fechaInput = document.getElementById('fecha');
    
    // Establecer fecha mínima (hoy)
    const hoy = new Date().toISOString().split('T')[0];
    fechaInput.min = hoy;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validarFormulario()) {
            guardarCita();
        }
    });
});

function validarFormulario() {
    const form = document.getElementById('formRegistro');
    const inputs = form.querySelectorAll('input, select, textarea');
    let esValido = true;
    
    inputs.forEach(input => {
        if (!validarCampo(input)) {
            esValido = false;
        }
    });
    
    return esValido;
}

function validarCampo(campo) {
    const valor = campo.value.trim();
    let esValido = true;
    let mensaje = '';
    
    // Validar campo requerido
    if (campo.hasAttribute('required') && !valor) {
        esValido = false;
        mensaje = 'Este campo es obligatorio.';
    }
    
    // Validaciones específicas
    switch (campo.id) {
        case 'nombre':
            if (valor && valor.length < 3) {
                esValido = false;
                mensaje = 'El nombre debe tener al menos 3 caracteres.';
            }
            break;
            
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (valor && !emailRegex.test(valor)) {
                esValido = false;
                mensaje = 'Ingrese un correo electrónico válido.';
            }
            break;
            
        case 'telefono':
            const telefonoRegex = /^[0-9]{10,}$/;
            if (valor && !telefonoRegex.test(valor)) {
                esValido = false;
                mensaje = 'El teléfono debe tener al menos 10 dígitos numéricos.';
            }
            break;
            
        case 'fecha':
            const fechaSeleccionada = new Date(valor);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            
            if (valor && fechaSeleccionada < hoy) {
                esValido = false;
                mensaje = 'La fecha no puede ser anterior a hoy.';
            }
            break;
    }
    
    // Mostrar/ocultar mensaje de error
    if (esValido) {
        campo.classList.remove('is-invalid');
        campo.classList.add('is-valid');
    } else {
        campo.classList.remove('is-valid');
        campo.classList.add('is-invalid');
        
        const feedback = campo.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = mensaje;
        }
    }
    
    return esValido;
}

function guardarCita() {
    const formData = {
        id: Date.now(),
        nombre: document.getElementById('nombre').value.trim(),
        email: document.getElementById('email').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        especialidad: document.getElementById('especialidad').value,
        fecha: document.getElementById('fecha').value,
        hora: document.getElementById('hora').value,
        motivo: document.getElementById('motivo').value.trim(),
        estado: 'Programada',
        fechaRegistro: new Date().toISOString()
    };
    
    // Obtener citas existentes
    let citas = JSON.parse(localStorage.getItem('citas')) || [];
    
    // Verificar conflicto de horario
    const conflicto = citas.find(cita => 
        cita.fecha === formData.fecha && 
        cita.hora === formData.hora && 
        cita.especialidad === formData.especialidad &&
        cita.estado !== 'Cancelada'
    );
    
    if (conflicto) {
        mostrarAlerta('Ya existe una cita programada para esa fecha, hora y especialidad.', 'warning');
        return;
    }
    
    // Agregar nueva cita
    citas.push(formData);
    localStorage.setItem('citas', JSON.stringify(citas));
    
    mostrarAlerta('¡Cita guardada exitosamente!', 'success');
    
    // Limpiar formulario después de un delay
    setTimeout(() => {
        document.getElementById('formRegistro').reset();
        document.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));
    }, 2000);
}

function mostrarAlerta(mensaje, tipo) {
    const alertContainer = document.getElementById('alertContainer');
    alertContainer.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'warning' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        const alert = alertContainer.querySelector('.alert');
        if (alert) {
            alert.classList.remove('show');
            setTimeout(() => alert.remove(), 150);
        }
    }, 5000);
}

// Validación en tiempo real
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('#formRegistro input, #formRegistro select, #formRegistro textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validarCampo(input));
        input.addEventListener('input', () => {
            if (input.classList.contains('is-invalid')) {
                validarCampo(input);
            }
        });
    });
});