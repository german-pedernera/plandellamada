// --- CONFIGURACIÓN DE ADMINS ---
const ADMINS = [
    { nombre: "German Pedernera", dni: "32559315", ce: "70965" },
    { nombre: "Claudia Faiad", dni: "30819237", ce: "88908" },
    { nombre: "Marcelo Skieback", dni: "27433769", ce: "63864" },
    { nombre: "Silvia Tejada", dni: "33336220", ce: "76254" },
    { nombre: "Molina Gil", dni: "27138557", ce: "67628" },
    { nombre: "Cristian Orfali", dni: "33142786", ce: "74118" },

];

let database = [];

// --- INICIALIZACIÓN Y CARGA DESDE FIREBASE ---
function initApp() {
    const q = window.fstore.query(
        window.fstore.collection(window.db, "registros"), 
        window.fstore.orderBy("timestamp", "desc")
    );

    window.fstore.onSnapshot(q, (snapshot) => {
        database = snapshot.docs.map(doc => ({
            fireId: doc.id,
            ...doc.data()
        }));
        if (document.getElementById('adminModal').style.display === 'block') {
            renderTable();
        }
    });
}

// Esperar un momento a que Firebase se inicialice en el objeto window
setTimeout(initApp, 1000);

// // --- CÁLCULO DE EDAD ---
// document.getElementById('fechaNacimiento').addEventListener('change', function() {
//     const nacimiento = new Date(this.value);
//     const hoy = new Date();
//     let edad = hoy.getFullYear() - nacimiento.getFullYear();
//     if (hoy.getMonth() < nacimiento.getMonth() || (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate())) edad--;
//     document.getElementById('edadCalculada').innerText = `Edad: ${edad} años`;
// });

// --- GUARDAR REGISTRO ---
document.getElementById('registrationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const reg = {
        jerarquia: document.getElementById('jerarquia').value,
        nombre: document.getElementById('nombre').value,
        dni: document.getElementById('dni').value,
        ce: document.getElementById('ce').value,
        fecha: document.getElementById('fechaNacimiento').value,
        estadoCivil: document.getElementById('estadoCivil').value,
        tel: document.getElementById('telPers').value,
        telAlt1: document.getElementById('telAlt1').value,
        telAlt2: document.getElementById('telAlt2').value,
        email: document.getElementById('email').value,
        calle: document.getElementById('calle').value,
        numero: document.getElementById('numero').value,
        localidad: document.getElementById('localidad').value,
        provincia: document.getElementById('provincia').value,
        timestamp: Date.now()
    };

    try {
        await window.fstore.addDoc(window.fstore.collection(window.db, "registros"), reg);
        Swal.fire('Éxito', 'Registro guardado correctamente en la nube.', 'success');
        e.target.reset();
        document.getElementById('edadCalculada').innerText = "Edad: -- años";
    } catch (error) {
        Swal.fire('Error', 'No se pudo conectar con la base de datos.', 'error');
    }
});

// --- ACCESO ADMINISTRADOR ---
document.getElementById('adminLoginBtn').addEventListener('click', async () => {
    const { value: formValues } = await Swal.fire({
        title: 'Acceso Administrador',
        html:
            '<input id="swal-dni" class="swal2-input" placeholder="DNI / MI">' +
            '<input id="swal-ce" type="password" class="swal2-input" placeholder="Código Estadistico">',
        focusConfirm: false,
        confirmButtonText: 'Ingresar',
        confirmButtonColor: '#003366',
        preConfirm: () => {
            return [
                document.getElementById('swal-dni').value,
                document.getElementById('swal-ce').value
            ]
        }
    });

    if (formValues) {
        const auth = ADMINS.find(a => a.dni === formValues[0] && a.ce === formValues[1]);
        if (auth) {
            document.getElementById('adminModal').style.display = 'block';
            renderTable();
        } else {
            Swal.fire('Error', 'Credenciales incorrectas', 'error');
        }
    }
});

// --- RENDERIZAR TABLA ---
function renderTable(filter = "") {
    const body = document.getElementById('tableBody');
    body.innerHTML = "";
    
    const filteredData = database.filter(i => 
        i.nombre.toLowerCase().includes(filter.toLowerCase()) || 
        i.dni.includes(filter)
    );

    filteredData.forEach(i => {
        body.innerHTML += `
            <tr>
                <td>${i.jerarquia}</td>
                <td>${i.nombre}</td>
                <td>${i.dni}</td>
                <td>${i.ce}</td>
                <td>${i.fecha}</td>
                <td>${i.estadoCivil}</td>
                <td>${i.tel}</td>
                <td>${i.telAlt1 || '-'}</td>
                <td>${i.telAlt2 || '-'}</td>
                <td>${i.email}</td>
                <td>${i.calle} ${i.numero}</td>
                <td>${i.localidad}</td>
                <td>
                    <button onclick="deleteItem('${i.fireId}')" class="btn-icon">🗑️</button>
                </td>
            </tr>`;
    });
}

// --- BORRAR REGISTRO ---
window.deleteItem = async (fireId) => {
    const result = await Swal.fire({
        title: '¿Confirmar eliminación?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            await window.fstore.deleteDoc(window.fstore.doc(window.db, "registros", fireId));
            Swal.fire('Eliminado', 'El registro ha sido removido.', 'success');
        } catch (e) {
            Swal.fire('Error', 'No se pudo eliminar.', 'error');
        }
    }
};

// Buscador y cerrar modal
document.getElementById('searchBar').addEventListener('input', (e) => renderTable(e.target.value));
document.querySelector('.close').onclick = () => document.getElementById('adminModal').style.display = 'none';

// --- EXPORTAR A PDF ---
window.exportToPDF = function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.text("PLAN DE LLAMADA - ESVIACATALINA", 14, 15);
    
    const rows = database.map(i => [
        i.jerarquia, i.nombre, i.dni, i.ce, i.fecha, i.estadoCivil, i.tel, i.telAlt1, i.email, i.calle + ' ' + i.numero, i.localidad
    ]);

    doc.autoTable({
        startY: 25,
        head: [["Jerarquía", "Nombre", "DNI", "CE", "Nac.", "E. Civil", "Tel.", "Alt.", "Email", "Domicilio", "Localidad"]],
        body: rows,
        theme: 'striped',
        styles: { fontSize: 7 }
    });
    doc.save('plan_de_llamada.pdf');
};

// --- EXPORTAR A EXCEL ---
window.exportToExcel = function() {
    const ws = XLSX.utils.json_to_sheet(database);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registros");
    XLSX.writeFile(wb, "plan_de_llamada.xlsx");
};