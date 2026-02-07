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

const OPCIONES = {
    jerarquia: [
        "Comandante General", "Comandante Mayor", "Comandante Principal", "Comandante",
        "Segundo Comandante", "Primer Alférez", "Alférez", "Subalférez",
        "Suboficial Mayor", "Suboficial Principal", "Sargento Ayudante", "Sargento Primero",
        "Sargento", "Cabo Primero", "Cabo", "Gendarme"
    ],
    estadoCivil: ["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a", "Separacion de Hecho"],
    destino: ["Esviacatalina", "Seviapun", "Nucleo"]
};

const jerarquiaPrioridad = {
    "Comandante General": 1, "Comandante Mayor": 2, "Comandante Principal": 3,
    "Comandante": 4, "Segundo Comandante": 5, "Primer Alférez": 6,
    "Alférez": 7, "Subalférez": 8, "Suboficial Mayor": 9,
    "Suboficial Principal": 10, "Sargento Ayudante": 11, "Sargento Primero": 12,
    "Sargento": 13, "Cabo Primero": 14, "Cabo": 15, "Gendarme": 16
};

let database = [];
let filteredDatabase = [];

function initApp() {
    const today = new Date().toISOString().split('T')[0];
    const inputFecha = document.getElementById('fechaNacimiento');
    if (inputFecha) inputFecha.setAttribute('max', today);

    const q = window.fstore.query(window.fstore.collection(window.db, "registros"), window.fstore.orderBy("timestamp", "desc"));
    window.fstore.onSnapshot(q, (snapshot) => {
        database = snapshot.docs.map(doc => ({ fireId: doc.id, ...doc.data() }));
        renderTable(document.getElementById('searchBar').value);
    });
}
setTimeout(initApp, 1000);

document.getElementById('hamburgerBtn').onclick = () => document.getElementById('dropdownMenu').classList.toggle('show');

window.closeModal = (id) => {
    if (id === 'adminModal') {
        Swal.fire({
            title: 'Saliendo del Sistema',
            text: 'Cerrando planilla...',
            imageUrl: 'logoEscuadron.jpeg',
            imageWidth: 100,
            imageHeight: 100,
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
            willClose: () => document.getElementById(id).style.display = 'none'
        });
    } else {
        document.getElementById(id).style.display = 'none';
    }
};

window.scrollTable = (dir) => {
    const wrapper = document.getElementById('tableWrapper');
    dir === 'left' ? wrapper.scrollBy({ left: -350, behavior: 'smooth' }) : wrapper.scrollBy({ left: 350, behavior: 'smooth' });
};

window.addNewPersonnelRow = function() {
    const body = document.getElementById('tableBody');
    const newId = "new_row_" + Date.now();
    const newRowHtml = `
        <tr id="row-${newId}" class="editing-row">
            <td>*</td>
            <td><select id="edit-jerarquia-${newId}" style="font-size:10px;">${OPCIONES.jerarquia.map(opt => `<option value="${opt}">${opt}</option>`).join('')}</select></td>
            <td><input type="text" id="edit-nombre-${newId}" placeholder="Nombre" style="font-size:10px;"></td>
            <td><input type="text" id="edit-dni-${newId}" placeholder="DNI" style="font-size:10px;"></td>
            <td><input type="text" id="edit-ce-${newId}" placeholder="CE" style="font-size:10px;"></td>
            <td><select id="edit-estadoCivil-${newId}" style="font-size:10px;">${OPCIONES.estadoCivil.map(opt => `<option value="${opt}">${opt}</option>`).join('')}</select></td>
            <td><input type="date" id="edit-fecha-${newId}" style="font-size:10px;"></td>
            <td><input type="text" id="edit-emergencia-${newId}" placeholder="Emerg." style="font-size:10px;"></td>
            <td><input type="text" id="edit-tel-${newId}" placeholder="Tel" style="font-size:10px;"></td>
            <td><input type="text" id="edit-telAlt1-${newId}" placeholder="Alt" style="font-size:10px;"></td>
            <td><input type="text" id="edit-email-${newId}" placeholder="Email" style="font-size:10px;"></td>
            <td><input type="text" id="edit-calle-${newId}" placeholder="Calle" style="font-size:10px;"></td>
            <td><input type="text" id="edit-numero-${newId}" placeholder="Nro" style="font-size:10px;"></td>
            <td><input type="text" id="edit-localidad-${newId}" placeholder="Loc" style="font-size:10px;"></td>
            <td><input type="text" id="edit-provincia-${newId}" placeholder="Prov" style="font-size:10px;"></td>
            <td><select id="edit-destino-${newId}" style="font-size:10px;">${OPCIONES.destino.map(opt => `<option value="${opt}">${opt}</option>`).join('')}</select></td>
            <td class="actions-cell">
                <button onclick="saveNewRow('${newId}')" class="btn-save-row"><i class="fas fa-check"></i></button>
                <button onclick="renderTable()" class="btn-cancel-row"><i class="fas fa-times"></i></button>
            </td>
        </tr>`;
    body.insertAdjacentHTML('afterbegin', newRowHtml);
    document.getElementById('tableWrapper').scrollTo({ top: 0, behavior: 'smooth' });
};

window.saveNewRow = async function(tempId) {
    const fields = ['jerarquia', 'nombre', 'dni', 'ce', 'estadoCivil', 'fecha', 'emergencia', 'tel', 'telAlt1', 'email', 'calle', 'numero', 'localidad', 'provincia', 'destino'];
    const data = {};
    for (let f of fields) {
        let val = document.getElementById(`edit-${f}-${tempId}`).value.trim();
        if (!val) return Swal.fire('Incompleto', `Campo ${f} es obligatorio.`, 'warning');
        data[f] = (f === 'dni' || f === 'ce' || f === 'tel' || f === 'fecha' || f === 'jerarquia' || f === 'estadoCivil' || f === 'destino') ? val : val.toLowerCase();
    }
    data.timestamp = Date.now();

    try {
        await window.fstore.addDoc(window.fstore.collection(window.db, "registros"), data);
        Swal.fire('Éxito', 'Efectivo agregado correctamente.', 'success');
    } catch (e) { Swal.fire('Error', 'No se pudo guardar.', 'error'); }
};

window.saveAllChanges = function() {
    Swal.fire({
        title: 'Guardar Planilla',
        text: '¿Sincronizar todos los cambios realizados?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, Sincronizar',
    }).then((r) => { if(r.isConfirmed) renderTable(); });
};

window.resetUserData = async function() {
    document.getElementById('dropdownMenu').classList.remove('show');
    const { value: v } = await Swal.fire({
        title: 'Borrar mi registro',
        html: '<input id="swal-dni" class="swal2-input" placeholder="DNI"><input id="swal-ce" type="password" class="swal2-input" placeholder="CE"><input id="swal-email" type="email" class="swal2-input" placeholder="Email Personal">',
        preConfirm: () => [document.getElementById('swal-dni').value.trim(), document.getElementById('swal-ce').value.trim(), document.getElementById('swal-email').value.trim().toLowerCase()]
    });

    if (v) {
        const [d, c, e] = v;
        const reg = database.find(r => r.dni === d && r.ce === c && r.email.toLowerCase() === e);
        if (reg && (await Swal.fire({ title: '¿Borrar?', text: reg.nombre.toUpperCase(), icon: 'warning', showCancelButton: true })).isConfirmed) {
            await window.fstore.deleteDoc(window.fstore.doc(window.db, "registros", reg.fireId));
            Swal.fire('Eliminado', '', 'success');
        } else if (!reg) Swal.fire('Error', 'Datos incorrectos.', 'error');
    }
};

document.getElementById('registrationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const dni = document.getElementById('mi').value;
    const ce = document.getElementById('ce').value;
    if (database.some(r => r.dni === dni || r.ce === ce)) return Swal.fire('Atención', 'Ya registrado.', 'warning');

    const reg = {
        jerarquia: document.getElementById('jerarquia').value,
        nombre: document.getElementById('nombre').value.toLowerCase(),
        dni: dni, ce: ce,
        estadoCivil: document.getElementById('estadoCivil').value,
        fecha: document.getElementById('fechaNacimiento').value,
        emergencia: document.getElementById('emergenciaContacto').value,
        tel: document.getElementById('telPers').value,
        telAlt1: document.getElementById('telAlt1').value,
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
    } catch (error) { Swal.fire('Error', 'Fallo al guardar.', 'error'); }
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
    } else if(v) Swal.fire('Error', 'Credenciales incorrectas.', 'error');
};

function renderTable(filter = "") {
    const body = document.getElementById('tableBody');
    const f = filter.toLowerCase();
    filteredDatabase = database.filter(i => i.nombre.toLowerCase().includes(f) || i.dni.includes(f) || i.ce.toLowerCase().includes(f) || i.estadoCivil.toLowerCase().includes(f) || i.jerarquia.toLowerCase().includes(f));
    filteredDatabase.sort((a, b) => (jerarquiaPrioridad[a.jerarquia] || 99) - (jerarquiaPrioridad[b.jerarquia] || 99) || a.nombre.localeCompare(b.nombre));
    document.getElementById('adminTitle').innerHTML = `<i class="fas fa-list-ul"></i> Planilla (${filteredDatabase.length} Efectivos)`;
    body.innerHTML = filteredDatabase.map((i, index) => `
        <tr id="row-${i.fireId}">
            <td>${index + 1}</td> 
            <td class="cap-text">${i.jerarquia}</td> 
            <td class="cap-text">${i.nombre}</td>
            <td>${i.dni}</td><td>${i.ce}</td>
            <td class="cap-text">${i.estadoCivil}</td><td>${i.fecha}</td>
            <td>${i.emergencia}</td><td>${i.tel}</td><td>${i.telAlt1}</td>
            <td>${i.email}</td><td class="cap-text">${i.calle}</td>
            <td class="cap-text">${i.numero}</td><td class="cap-text">${i.localidad}</td>
            <td class="cap-text">${i.provincia}</td><td class="cap-text">${i.destino || '-'}</td> 
            <td class="actions-cell">
                <button onclick="shareByWhatsApp('${i.fireId}')" class="btn-whatsapp"><i class="fab fa-whatsapp"></i></button>
                <button onclick="editInline('${i.fireId}')"><i class="fas fa-edit"></i></button>
                <button onclick="deleteItem('${i.fireId}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`).join('');
}

window.editInline = function(id) {
    const row = document.getElementById(`row-${id}`);
    const cells = row.getElementsByTagName('td');
    const fields = ['jerarquia', 'nombre', 'dni', 'ce', 'estadoCivil', 'fecha', 'emergencia', 'tel', 'telAlt1', 'email', 'calle', 'numero', 'localidad', 'provincia', 'destino'];
    for (let i = 0; i < fields.length; i++) {
        const fieldName = fields[i];
        const currentVal = cells[i+1].innerText.trim() === '-' ? '' : cells[i+1].innerText.trim();
        if (fieldName === 'jerarquia' || fieldName === 'estadoCivil' || fieldName === 'destino') {
            let optionsHtml = OPCIONES[fieldName].map(opt => `<option value="${opt}" ${opt.toLowerCase() === currentVal.toLowerCase() ? 'selected' : ''}>${opt}</option>`).join('');
            cells[i+1].innerHTML = `<select id="edit-${fieldName}-${id}" style="width:100%; font-size:10px;">${optionsHtml}</select>`;
        } else if (fieldName === 'fecha') {
            cells[i+1].innerHTML = `<input type="date" id="edit-${fieldName}-${id}" value="${currentVal}" style="width:100%; font-size:10px;">`;
        } else {
            cells[i+1].innerHTML = `<input type="text" id="edit-${fieldName}-${id}" value="${currentVal}" style="width:100%; font-size:10px;">`;
        }
    }
    cells[16].innerHTML = `<button onclick="saveInline('${id}')" class="btn-save-row"><i class="fas fa-check"></i></button><button onclick="renderTable()" class="btn-cancel-row"><i class="fas fa-times"></i></button>`;
};

window.saveInline = async function(id) {
    const fields = ['jerarquia', 'nombre', 'dni', 'ce', 'estadoCivil', 'fecha', 'emergencia', 'tel', 'telAlt1', 'email', 'calle', 'numero', 'localidad', 'provincia', 'destino'];
    const updated = {};
    fields.forEach(f => { 
        let val = document.getElementById(`edit-${f}-${id}`).value;
        updated[f] = (f === 'dni' || f === 'ce' || f === 'tel' || f === 'fecha' || f === 'jerarquia' || f === 'estadoCivil' || f === 'destino') ? val : val.toLowerCase();
    });
    try {
        await window.fstore.updateDoc(window.fstore.doc(window.db, "registros", id), updated);
        Swal.fire('Guardado', 'Datos actualizados.', 'success');
    } catch (e) { Swal.fire('Error', 'Fallo al actualizar.', 'error'); }
};

window.exportToPDF = async function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'legal' });
    const ahora = new Date();
    const fDesc = ahora.toLocaleDateString('es-AR');
    const hDesc = ahora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    try {
        const img = new Image(); img.src = 'logoEscuadron.jpeg';
        await new Promise(r => img.onload = r);
        const canvas = document.createElement("canvas"); canvas.width = img.width; canvas.height = img.height;
        canvas.getContext("2d").drawImage(img, 0, 0);
        doc.addImage(canvas.toDataURL("image/jpeg"), 'JPEG', 14, 8, 20, 20);
        doc.setFontSize(18); doc.setTextColor(0, 51, 102); doc.text("GENDARMERÍA NACIONAL ARGENTINA", 38, 15);
        doc.setFontSize(12); doc.text("PLAN DE LLAMADA", 38, 22);
        doc.setFontSize(8); doc.setTextColor(100); doc.text(`Fecha de descarga: ${fDesc} - ${hDesc} hs`, 38, 27);

        doc.autoTable({
            head: [["Nro", "Jerarquía", "Nombre", "DNI", "CE", "Est. Civil", "F. Nac", "Emergencia", "Tel.", "Alt 1", "Email", "Calle", "Nro", "Loc.", "Prov.", "Destino"]],
            body: filteredDatabase.map((i, idx) => [idx+1, i.jerarquia, i.nombre.toUpperCase(), i.dni, i.ce, i.estadoCivil, i.fecha, i.emergencia, i.tel, i.telAlt1, i.email, i.calle, i.numero, i.localidad, i.provincia, i.destino || '-']),
            startY: 35, styles: { fontSize: 6 }, headStyles: { fillColor: [0, 51, 102] }
        });
        doc.save(`Plan_Llamada_${ahora.getTime()}.pdf`);
    } catch (e) { Swal.fire('Error', 'Fallo al generar PDF.', 'error'); }
};

// REQUISITO: Exportar TODA la información de las columnas al Excel
window.exportToExcel = function() {
    const dataToExport = filteredDatabase.map((i, idx) => ({
        "Nro Ord": idx + 1,
        "Jerarquía": i.jerarquia,
        "Nombre": i.nombre.toUpperCase(),
        "DNI": i.dni,
        "CE": i.ce,
        "Estado Civil": i.estadoCivil,
        "Fecha Nacimiento": i.fecha,
        "Emergencia": i.emergencia,
        "Teléfono": i.tel,
        "Tel. Alt 1": i.telAlt1,
        "Email": i.email,
        "Calle": i.calle.toUpperCase(),
        "Nro/Mza/Casa": i.numero,
        "Localidad": i.localidad.toUpperCase(),
        "Provincia": i.provincia.toUpperCase(),
        "Destino": i.destino || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Personal");
    XLSX.writeFile(wb, `Planilla_Personal_Completa_${Date.now()}.xlsx`);
};

window.deleteItem = async (id) => {
    if ((await Swal.fire({ title: '¿Eliminar?', icon: 'warning', showCancelButton: true })).isConfirmed) await window.fstore.deleteDoc(window.fstore.doc(window.db, "registros", id));
};

// ... (Resto del código anterior se mantiene igual)

// COMPARTIR POR WHATSAPP (ACTUALIZADO: ENVÍA TODA LA INFORMACIÓN DE LA FILA)
window.shareByWhatsApp = function(id) {
    const i = database.find(item => item.fireId === id);
    if (!i) return;
    
    // Se construye el mensaje con todos los campos disponibles en la base de datos
    let mensaje = `*FICHA DE PERSONAL - PLAN DE LLAMADA*%0A` +
        `-----------------------------------%0A` +
        `*DATOS PERSONALES*%0A` +
        `*Jerarquía:* ${i.jerarquia}%0A` +
        `*Nombre:* ${i.nombre.toUpperCase()}%0A` +
        `*DNI:* ${i.dni}%0A` +
        `*CE:* ${i.ce}%0A` +
        `*Estado Civil:* ${i.estadoCivil}%0A` +
        `*F. Nacimiento:* ${i.fecha}%0A` +
        `*Destino:* ${i.destino || '-'}%0A` +
        `-----------------------------------%0A` +
        `*CONTACTO Y DOMICILIO*%0A` +
        `*Teléfono:* ${i.tel}%0A` +
        `*Tel. Alt:* ${i.telAlt1}%0A` +
        `*Emergencia:* ${i.emergencia}%0A` +
        `*Email:* ${i.email}%0A` +
        `*Calle:* ${i.calle.toUpperCase()}%0A` +
        `*Nro/Mza/Casa:* ${i.numero}%0A` +
        `*Localidad:* ${i.localidad.toUpperCase()}%0A` +
        `*Provincia:* ${i.provincia.toUpperCase()}`;
    
    window.open(`https://wa.me/?text=${mensaje}`, '_blank');
};

document.getElementById('searchBar').oninput = (e) => renderTable(e.target.value);