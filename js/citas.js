document.addEventListener('DOMContentLoaded', function() {
    cargarCitas();
});

function cargarCitas() {
    const citas = JSON.parse(localStorage.getItem('citas')) || [];
    mostrarCitas(citas);
}

function mostrarCitas(citas) {
    const tbody = document.getElementById('tablaCitas');
    
    if (citas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No hay citas registradas</td></tr>';
        return;
    }
    
    tbody.innerHTML = citas.map(cita => `
        <tr class="fade-in">
            <td><strong>${cita.id}</strong></td>
            <td>${cita.nombre}</td>
            <td>${cita.especialidad}</td>
            <td>${formatearFecha(cita.fecha)}</td>
            <td>${formatearHora(cita.hora)}</td>
            <td>
                <span class="badge estado-${cita.estado.toLowerCase()}">
                    ${cita.estado}
                </span>
            </td>
            <td>
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-outline-primary" onclick="editarCita(${cita.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarCita(${cita.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                    ${cita.estado === 'Programada' ? 
                        `<button class="btn btn-sm btn-outline-success" onclick="confirmarCita(${cita.id})">
                            <i class="fas fa-check"></i>
                        </button>` : ''
                    }
                </div>
            </td>
        </tr>
    `).join('');
}

function aplicarFiltros() {
    const especialidad = document.getElementById('filtroEspecialidad').value;
    const fechaDesde = document.getElementById('fechaDesde').value;
    const fechaHasta = document.getElementById('fechaHasta').value;
    
    let citas = JSON.parse(localStorage.getItem('citas')) || [];
    
    // Filtrar por especialidad
    if (especialidad) {
        citas = citas.filter(cita => cita.especialidad === especialidad);
    }
    
    // Filtrar por rango de fechas
    if (fechaDesde) {
        citas = citas.filter(cita => cita.fecha >= fechaDesde);
    }
    
    if (fechaHasta) {
        citas = citas.filter(cita => cita.fecha <= fechaHasta);
    }
    
    mostrarCitas(citas);
}

function limpiarFiltros() {
    document.getElementById('filtroEspecialidad').value = '';
    document.getElementById('fechaDesde').value = '';
    document.getElementById('fechaHasta').value = '';
    cargarCitas();
}

function editarCita(id) {
    const citas = JSON.parse(localStorage.getItem('citas')) || [];
    const cita = citas.find(c => c.id === id);
    
    if (!cita) return;
    
    // Llenar el modal con los datos de la cita
    document.getElementById('editarId').value = cita.id;
    document.getElementById('editarNombre').value = cita.nombre;
    document.getElementById('editarEspecialidad').value = cita.especialidad;
    document.getElementById('editarFecha').value = cita.fecha;
    document.getElementById('editarHora').value = cita.hora;
    
    // Mostrar el modal
    const modal = new bootstrap.Modal(document.getElementById('modalEditar'));
    modal.show();
}

function guardarEdicion() {
    const id = parseInt(document.getElementById('editarId').value);
    const nombre = document.getElementById('editarNombre').value.trim();
    const especialidad = document.getElementById('editarEspecialidad').value;
    const fecha = document.getElementById('editarFecha').value;
    const hora = document.getElementById('editarHora').value;
    
    if (!nombre || !especialidad || !fecha || !hora) {
        alert('Todos los campos son obligatorios.');
        return;
    }
    
    // Validar fecha no sea pasada
    const fechaSeleccionada = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaSeleccionada < hoy) {
        alert('La fecha no puede ser anterior a hoy.');
        return;
    }
    
    let citas = JSON.parse(localStorage.getItem('citas')) || [];
    const indice = citas.findIndex(c => c.id === id);
    
    if (indice !== -1) {
        // Verificar conflicto de horario (excluyendo la cita actual)
        const conflicto = citas.find(cita => 
            cita.id !== id &&
            cita.fecha === fecha && 
            cita.hora === hora && 
            cita.especialidad === especialidad &&
            cita.estado !== 'Cancelada'
        );
        
        if (conflicto) {
            alert('Ya existe una cita programada para esa fecha, hora y especialidad.');
            return;
        }
        
        // Actualizar la cita
        citas[indice] = {
            ...citas[indice],
            nombre,
            especialidad,
            fecha,
            hora,
            fechaModificacion: new Date().toISOString()
        };
        
        localStorage.setItem('citas', JSON.stringify(citas));
        
        // Cerrar modal y recargar tabla
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditar'));
        modal.hide();
        
        cargarCitas();
        mostrarToast('Cita actualizada exitosamente', 'success');
    }
}

function eliminarCita(id) {
    if (confirm('¿Está seguro de que desea eliminar esta cita?')) {
        let citas = JSON.parse(localStorage.getItem('citas')) || [];
        citas = citas.filter(c => c.id !== id);
        localStorage.setItem('citas', JSON.stringify(citas));
        cargarCitas();
        mostrarToast('Cita eliminada exitosamente', 'warning');
    }
}

function confirmarCita(id) {
    let citas = JSON.parse(localStorage.getItem('citas')) || [];
    const indice = citas.findIndex(c => c.id === id);
    
    if (indice !== -1) {
        citas[indice].estado = 'Confirmada';
        localStorage.setItem('citas', JSON.stringify(citas));
        cargarCitas();
        mostrarToast('Cita confirmada exitosamente', 'success');
    }
}

function exportarCitas() {
    const citas = JSON.parse(localStorage.getItem('citas')) || [];
    
    if (citas.length === 0) {
        alert('No hay citas para exportar.');
        return;
    }
    
    let contenido = 'SaludAgenda - Listado de Citas\n';
    contenido += '='.repeat(50) + '\n\n';
    
    citas.forEach((cita, index) => {
        contenido += `ID: ${cita.id}\n`;
        contenido += `Paciente: ${cita.nombre}\n`;
        contenido += `Especialidad: ${cita.especialidad}\n`;
        contenido += `Fecha: ${formatearFecha(cita.fecha)}\n`;
        contenido += `Hora: ${formatearHora(cita.hora)}\n`;
        contenido += `Estado: ${cita.estado}\n`;
        contenido += '-'.repeat(30) + '\n';
    });
    
    contenido += `\nTotal de citas registradas: ${citas.length}\n`;
    contenido += `Fecha de exportación: ${new Date().toLocaleString()}\n`;
    
    // Crear y descargar archivo
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `citas_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    mostrarToast('Archivo exportado exitosamente', 'success');
}

function formatearFecha(fecha) {
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', opciones);
}

function formatearHora(hora) {
    const [hours, minutes] = hora.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
}

function mostrarToast(mensaje, tipo) {
    // Crear toast dinámicamente
    const toastContainer = document.createElement('div');
    toastContainer.style.position = 'fixed';
    toastContainer.style.top = '20px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '9999';
    
    toastContainer.innerHTML = `
        <div class="toast show" role="alert">
            <div class="toast-header bg-${tipo} text-white">
                <i class="fas fa-${tipo === 'success' ? 'check' : 'exclamation'} me-2"></i>
                <strong class="me-auto">SaludAgenda</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${mensaje}
            </div>
        </div>
    `;
    
    document.body.appendChild(toastContainer);
    
    // Remover toast después de 3 segundos
    setTimeout(() => {
        toastContainer.remove();
    }, 3000);
}