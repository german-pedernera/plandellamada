const ADMINS = [
    { nombre: "German Andres Ramirez Pedernera", dni: "32559315", contraseña: "Emiliano25" },
    { nombre: "Claudia Yamil Faiad", dni: "30819237", contraseña: "Lala2727" },
    { nombre: "Jose Marcelo Skieback", dni: "27433769", contraseña: "Nira2026" },
    { nombre: "Silvia Noelia Rivas", dni: "29339676", contraseña: "Aaron13E" },
    { nombre: "Silvia Fatima Tejerina Olivera", dni: "33336220", contraseña: "Trufita.00" },
    { nombre: "Gil Molina", dni: "27138557", contraseña: "Fiamma11" },
    { nombre: "Cistian Moise Maman Orfali", dni: "33142786", contraseña: "Orfali2026" },
    { nombre: "Ana del Valle Aciar", dni: "31774928", contraseña: "Valentina2026" },
    { nombre: "Maria Florencia Ordoñe", dni: "35564716", contraseña: "Florencia26" },
];

const jerarquiaPrioridad = {
    "Comandante General": 1, "Comandante Mayor": 2, "Comandante Principal": 3,
    "Comandante": 4, "Segundo Comandante": 5, "Primer Alférez": 6,
    "Alférez": 7, "Subalférez": 8, "Suboficial Mayor": 9,
    "Suboficial Principal": 10, "Sargento Ayudante": 11, "Sargento Primero": 12,
    "Sargento": 13, "Cabo Primero": 14, "Cabo": 15, "Gendarme": 16
};

let database = [];

function initApp() {
    const q = window.fstore.query(window.fstore.collection(window.db, "registros"), window.fstore.orderBy("timestamp", "desc"));
    window.fstore.onSnapshot(q, (snapshot) => {
        database = snapshot.docs.map(doc => ({ fireId: doc.id, ...doc.data() }));
        renderTable();
    });
}
setTimeout(initApp, 1000);

document.getElementById('hamburgerBtn').onclick = () => document.getElementById('dropdownMenu').classList.toggle('show');
window.closeModal = (id) => document.getElementById(id).style.display = 'none';

window.scrollTable = (dir) => {
    const wrapper = document.getElementById('tableWrapper');
    const scrollAmount = 350; 
    if (dir === 'left') {
        wrapper.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
        wrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
};

document.getElementById('registrationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const dni = document.getElementById('mi').value;
    const ce = document.getElementById('ce').value;

    if (database.some(r => r.dni === dni || r.ce === ce)) {
        return Swal.fire('Atención', 'Personal ya registrado.', 'warning');
    }

    const reg = {
        jerarquia: document.getElementById('jerarquia').value,
        nombre: document.getElementById('nombre').value.toLowerCase(),
        dni: dni,
        ce: ce,
        estadoCivil: document.getElementById('estadoCivil').value,
        fecha: document.getElementById('fechaNacimiento').value,
        emergencia: document.getElementById('emergenciaContacto').value,
        tel: document.getElementById('telPers').value,
        telAlt1: document.getElementById('telAlt1').value || '-',
        email: document.getElementById('email').value.toLowerCase(),
        calle: document.getElementById('calle').value.toLowerCase(),
        numero: document.getElementById('numero').value,
        localidad: document.getElementById('localidad').value.toLowerCase(),
        provincia: document.getElementById('provincia').value.toLowerCase(),
        destino: document.getElementById('destino').value, 
        timestamp: Date.now()
    };

    try {
        await window.fstore.addDoc(window.fstore.collection(window.db, "registros"), reg);
        Swal.fire('Éxito', 'Registrado correctamente.', 'success');
        e.target.reset();
    } catch (error) {
        Swal.fire('Error', 'Fallo de conexión.', 'error');
    }
});

document.getElementById('adminLoginBtn').onclick = async () => {
    document.getElementById('dropdownMenu').classList.remove('show');
    const { value: v } = await Swal.fire({
        title: 'Acceso Admin',
        html: '<input id="a-dni" class="swal2-input" placeholder="DNI"><input id="a-ce" type="password" class="swal2-input" placeholder="Contraseña">',
        preConfirm: () => [document.getElementById('a-dni').value, document.getElementById('a-ce').value]
    });
    if (v && ADMINS.find(a => a.dni === v[0] && a.contraseña === v[1])) {
        document.getElementById('adminModal').style.display = 'block';
    } else if(v) {
        Swal.fire('Error', 'Credenciales incorrectas.', 'error');
    }
};

window.resetUserData = async () => {
    document.getElementById('dropdownMenu').classList.remove('show');
    const { value: formValues } = await Swal.fire({
        title: 'Borrar mis datos',
        text: 'Ingrese sus credenciales para eliminar su registro.',
        html: '<input id="reset-dni" class="swal2-input" placeholder="DNI (MI)"><input id="reset-ce" type="password" class="swal2-input" placeholder="CE">',
        showCancelButton: true,
        confirmButtonText: 'Borrar mis datos',
        confirmButtonColor: '#dc3545',
        preConfirm: () => [document.getElementById('reset-dni').value, document.getElementById('reset-ce').value]
    });

    if (formValues) {
        const [inputDni, inputCe] = formValues;
        const registroEncontrado = database.find(r => r.dni === inputDni && r.ce === inputCe);

        if (registroEncontrado) {
            const confirm = await Swal.fire({
                title: '¿Confirmar eliminación?',
                text: `Se borrará el registro de ${registroEncontrado.nombre}.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                confirmButtonText: 'Sí, borrar fila'
            });
            if (confirm.isConfirmed) {
                try {
                    await window.fstore.deleteDoc(window.fstore.doc(window.db, "registros", registroEncontrado.fireId));
                    Swal.fire('Eliminado', 'Su fila ha sido borrada.', 'success');
                } catch (e) {
                    Swal.fire('Error', 'No se pudo realizar la acción.', 'error');
                }
            }
        } else {
            Swal.fire('Error', 'DNI o CE incorrectos.', 'error');
        }
    }
};

window.shareByWhatsApp = function(id) {
    const i = database.find(item => item.fireId === id);
    if (!i) return;

    const mensaje = `*PLAN DE LLAMADA - ESVIACATALINA*%0A` +
        `----------------------------------------------------%0A` +
        `*Jerarquía:* ${i.jerarquia}%0A` +
        `*Nombre:* ${i.nombre.toUpperCase()}%0A` +
        `*DNI:* ${i.dni}%0A` +
        `*CE:* ${i.ce}%0A` +
        `*Est. Civil:* ${i.estadoCivil}%0A` +
        `*F. Nacimiento:* ${i.fecha}%0A` +
        `*Emergencia:* ${i.emergencia}%0A` +
        `*Tel. Personal:* ${i.tel}%0A` +
        `*Tel. Alt 1:* ${i.telAlt1}%0A` +
        `*Email:* ${i.email}%0A` +
        `*Domicilio:* ${i.calle} ${i.numero}%0A` +
        `*Localidad:* ${i.localidad}, ${i.provincia}%0A` +
        `*Destino:* ${i.destino || '-'}`;

    window.open(`https://wa.me/?text=${mensaje}`, '_blank');
};

function renderTable(filter = "") {
    const body = document.getElementById('tableBody');
    const adminTitle = document.getElementById('adminTitle');
    
    let dataToShow = database.filter(i => 
        i.nombre.toLowerCase().includes(filter.toLowerCase()) || 
        i.dni.includes(filter)
    );

    dataToShow.sort((a, b) => {
        const pesoA = jerarquiaPrioridad[a.jerarquia] || 99;
        const pesoB = jerarquiaPrioridad[b.jerarquia] || 99;
        if (pesoA === pesoB) {
            return a.nombre.localeCompare(b.nombre);
        }
        return pesoA - pesoB;
    });

    adminTitle.innerHTML = `<i class="fas fa-list-ul"></i> Planilla de Personal (${dataToShow.length} Efectivos)`;
    
    body.innerHTML = dataToShow.map((i, index) => `
        <tr id="row-${i.fireId}">
            <td>${index + 1}</td> 
            <td class="cap-text">${i.jerarquia}</td> 
            <td class="cap-text">${i.nombre}</td>
            <td>${i.dni}</td>
            <td>${i.ce}</td>
            <td class="cap-text">${i.estadoCivil}</td>
            <td>${i.fecha}</td>
            <td>${i.emergencia}</td>
            <td>${i.tel}</td>
            <td>${i.telAlt1}</td>
            <td>${i.email}</td>
            <td class="cap-text">${i.calle}</td>
            <td class="cap-text">${i.numero}</td>
            <td class="cap-text">${i.localidad}</td>
            <td class="cap-text">${i.provincia}</td>
            <td class="cap-text">${i.destino || '-'}</td> 
            <td class="actions-cell">
                <button onclick="shareByWhatsApp('${i.fireId}')" class="btn-whatsapp" title="WhatsApp"><i class="fab fa-whatsapp"></i></button>
                <button onclick="editInline('${i.fireId}')" title="Editar"><i class="fas fa-edit"></i></button>
                <button onclick="deleteItem('${i.fireId}')" title="Eliminar"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`).join('');
}

window.editInline = function(id) {
    const row = document.getElementById(`row-${id}`);
    const cells = row.getElementsByTagName('td');
    const fields = ['jerarquia', 'nombre', 'dni', 'ce', 'estadoCivil', 'fecha', 'emergencia', 'tel', 'telAlt1', 'email', 'calle', 'numero', 'localidad', 'provincia', 'destino'];
    
    for (let i = 0; i < fields.length; i++) {
        const val = cells[i+1].innerText === '-' ? '' : cells[i+1].innerText;
        cells[i+1].innerHTML = `<input type="text" id="edit-${fields[i]}-${id}" value="${val}">`;
    }
    cells[16].innerHTML = `
        <button onclick="saveInline('${id}')" class="btn-save-row"><i class="fas fa-check"></i></button>
        <button onclick="renderTable()" class="btn-cancel-row"><i class="fas fa-times"></i></button>
    `;
};

window.saveInline = async function(id) {
    const fields = ['jerarquia', 'nombre', 'dni', 'ce', 'estadoCivil', 'fecha', 'emergencia', 'tel', 'telAlt1', 'email', 'calle', 'numero', 'localidad', 'provincia', 'destino'];
    const updated = {};
    fields.forEach(f => { 
        let val = document.getElementById(`edit-${f}-${id}`).value;
        updated[f] = (f === 'dni' || f === 'ce' || f === 'tel' || f === 'fecha') ? val : val.toLowerCase();
    });
    try {
        await window.fstore.updateDoc(window.fstore.doc(window.db, "registros", id), updated);
        Swal.fire('Guardado', 'Datos actualizados.', 'success');
    } catch (e) {
        Swal.fire('Error', 'Fallo al actualizar.', 'error');
    }
};

window.exportToPDF = function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'legal' });
    
    const ahora = new Date();
    const fechaDescarga = ahora.toLocaleDateString('es-AR', { 
        year: 'numeric', month: 'long', day: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
    });

    doc.setFontSize(16);
    doc.text("PLAN DE LLAMADA - ESVIACATALINA", 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Fecha de descarga: ${fechaDescarga}`, 14, 21);
    doc.setTextColor(0);
    
    const sortedData = [...database].sort((a, b) => {
        const pesoA = jerarquiaPrioridad[a.jerarquia] || 99;
        const pesoB = jerarquiaPrioridad[b.jerarquia] || 99;
        return pesoA === pesoB ? a.nombre.localeCompare(b.nombre) : pesoA - pesoB;
    });

    const columns = ["Nro", "Jerarquía", "Nombre", "DNI", "CE", "Est. Civil", "F. Nac", "Emergencia", "Tel.", "Alt 1", "Email", "Calle", "Nro", "Loc.", "Prov.", "Destino"];
    const rows = sortedData.map((i, idx) => [
        idx + 1, i.jerarquia, i.nombre, i.dni, i.ce, i.estadoCivil, i.fecha, i.emergencia, i.tel, i.telAlt1, i.email, i.calle, i.numero, i.localidad, i.provincia, i.destino || '-'
    ]);

    doc.autoTable({
        head: [columns],
        body: rows,
        startY: 28,
        styles: { fontSize: 6, halign: 'left' },
        headStyles: { fillColor: [0, 51, 102] }
    });
    doc.save(`Planilla_Personal_${ahora.getTime()}.pdf`);
};

window.exportToExcel = function() {
    const sortedData = [...database].sort((a, b) => {
        const pesoA = jerarquiaPrioridad[a.jerarquia] || 99;
        const pesoB = jerarquiaPrioridad[b.jerarquia] || 99;
        return pesoA === pesoB ? a.nombre.localeCompare(b.nombre) : pesoA - pesoB;
    });

    const exportData = sortedData.map((i, idx) => ({
        Nro: idx + 1,
        Jerarquia: i.jerarquia,
        Nombre: i.nombre,
        DNI: i.dni,
        CE: i.ce,
        EstadoCivil: i.estadoCivil,
        FechaNac: i.fecha,
        Emergencia: i.emergencia,
        Telefono: i.tel,
        TelAlternativo: i.telAlt1,
        Email: i.email,
        Calle: i.calle,
        Numero: i.numero,
        Localidad: i.localidad,
        Provincia: i.provincia,
        Destino: i.destino || '-' 
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Personal");
    XLSX.writeFile(wb, "Planilla_Personal.xlsx");
};

window.deleteItem = async (id) => {
    if ((await Swal.fire({ title: '¿Eliminar registro?', text: "Esta acción no se puede deshacer", icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc3545' })).isConfirmed) {
        await window.fstore.deleteDoc(window.fstore.doc(window.db, "registros", id));
    }
};

document.getElementById('searchBar').oninput = (e) => renderTable(e.target.value);
const fechaHoy = new Date().toISOString().split("T")[0];
document.getElementById('fechaNacimiento').setAttribute('max', fechaHoy);