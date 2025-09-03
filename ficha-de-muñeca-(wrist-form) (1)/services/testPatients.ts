import { ClinicalData, AnamnesisData, PhysicalExamData, ScalesData, RadiologyData, ImpactData, FiliatoriosData, PRWEData, DASHData } from '../types';

const calculateAge = (birthDateString: string): string => {
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age.toString();
};

const emptyAnamnesis: AnamnesisData = { diagnosticoMedico: '', evaluacionKinesica: '', medicoDerivador: '', fechaDerivacion: '', kinesiologo: '', fechaFractura: '', causaFractura: '', fechaAtencionMedica: '', fechaAtencionKinesica: '', lugarPrimeraAtencion: '', rx: '', traccion: '', qx: '', diasInternacion: '', osteosintesis1Tipo: '', osteosintesis1Periodo: '', inmovilizacion: '', inmovilizacion1Tipo: '', inmovilizacion1Periodo: '', osteosintesis2Tipo: '', osteosintesis2Periodo: '', inmovilizacion2Tipo: '', inmovilizacion2Periodo: '', dominancia: '', antecedentesClinicoQuirurgicos: '', medicacionDolor: '', medicacionExtra: '', menopausia: '', osteopeniaOsteoporosis: '', dmo: '', ultimaDmo: '', caidasFrecuentes: '', caidas6meses: '', tabaquismo: '', alcoholismo: '', barbituricos: '', neoplasias: '', fxHombro: '', infecciones: '', enfSNC: '', altVascular: '', diabetes: '', dsr: '', tiroidismo: '', hiperlipidemia: '', dupuytren: '', manosTranspiran: '' };
const gonioVal = { derecha: '', izquierda: '' };
const emptyPhysicalExam: PhysicalExamData = { cftLesion: { chasquido: false, dolorDorsalPalmar: false, crepitacion: false }, actitudMiembroSuperior: { hombro: '', codoAntebrazo: '', muneca: '', mano: '' }, pruebasFracturaEscafoides: { sensibilidadTabaquera: '', dolorSupinacion: '', dolorCompresion: '' }, medidas: { figuraEn8: '', estiloideo: '', palmar: '', mtcpf: '' }, testKapandji: '', goniometria: { flexion: gonioVal, extension: gonioVal, inclinacionRadial: gonioVal, inclinacionCubital: gonioVal, supinacion: gonioVal, pronacion: gonioVal }, dolorHombro: '', movimientosHombro: { elevacionAnterior: '', geb1: '', geb2: '' }, pruebasPrension: { puntaFlecha: false, pinzaFina: false, pinzaLlave: false, tablero: false, aperturaCompleta: false, garra: false, empunadura: false }, inspeccion: '', palpacion: '', pruebasEspeciales: '' };
const emptyScales: ScalesData = { dolorNocturnoSeveridad: '', dolorNocturnoFrecuencia: '', dolorDiurnoFrecuencia: '', dolorDiurnoEpisodios: '', dolorDiurnoDuracion: '', entumecimiento: '', debilidad: '', hormigueo: '', entumecimientoHormigueoNocturnoSeveridad: '', entumecimientoHormigueoNocturnoFrecuencia: '', dificultadAgarre: '', tugTest: '', prwe: { dolor: { enReposo: '', movimientoRepetitivo: '', objetoPesado: '', peorMomento: '', conQueFrecuencia: '' }, funcion: { darVueltaManija: '', cortarCarne: '', abrocharseCamisa: '', levantarseSilla: '', cargar5kg: '', usarPapelHigienico: '', cuidadoPersonal: '', tareasHogar: '', trabajo: '', tiempoLibre: '' }}, dash: { items: {}, mainScore: null, workScore: null, sportsScore: null } };
const emptyRadiology: RadiologyData = { imageBase64: '', imageType: '', interpretation: '', inclinacionRadial: '', varianzaCubital: '', inclinacionPalmar: '' };
const emptyImpact: ImpactData = { roja_dolor_golpe: '', roja_fiebre_inflamacion: '', amarilla_creencia_dolor: '', azul_trabajo_dificulta: '', negra_barreras_recuperacion: '', naranja_animo_interes: '', otrasConsideraciones: '', interpretacionProfesional: ''};


export const testPatient1: ClinicalData = {
    filiatorios: { nombre: 'Juan', apellido: 'Pérez', fechaNacimiento: '1989-05-15', edad: calculateAge('1989-05-15'), nacionalidad: 'Argentina', estadoCivil: 'Soltero', dni: '99888777', obraSocial: 'OSDE', domicilio: 'Calle Falsa 123', localidad: 'Springfield', partido: 'Springfield', telefono: '11-5555-4444', ocupacion: 'Repositor en supermercado', actividadesActuales: '', deportesAnteriores: '', deportesActuales: 'Fútbol 5 (una vez por semana)', },
    anamnesis: { ...emptyAnamnesis, diagnosticoMedico: 'Tendinopatía de extensores de muñeca derecha', causaFractura: 'Inicio insidioso, relacionado con movimientos repetitivos de levantamiento y colocación de productos en estanterías.', fechaAtencionMedica: new Date(new Date().setDate(new Date().getDate()-7)).toISOString().split('T')[0], fechaAtencionKinesica: new Date().toISOString().split('T')[0], rx: 'no', qx: 'no', inmovilizacion: 'no', dominancia: 'Derecha', medicacionDolor: 'Ibuprofeno 400mg condicional al dolor.', tabaquismo: 'no', diabetes: 'no', },
    physicalExam: { ...emptyPhysicalExam, inspeccion: 'Leve tumefacción en la cara dorsal de la muñeca derecha. Sin deformidades evidentes.', palpacion: 'Dolor a la palpación sobre los tendones de los extensores radiales del carpo (ECRL/ECRB). Test de Finkelstein negativo.', medidas: { ...emptyPhysicalExam.medidas, figuraEn8: '22.5' }, testKapandji: '10', goniometria: { flexion: { derecha: '80', izquierda: '90' }, extension: { derecha: '60', izquierda: '70' }, inclinacionRadial: { derecha: '20', izquierda: '20' }, inclinacionCubital: { derecha: '30', izquierda: '35' }, supinacion: { derecha: '90', izquierda: '90' }, pronacion: { derecha: '90', izquierda: '90' } }, },
    scales: { ...emptyScales, dolorNocturnoSeveridad: '2', dolorDiurnoFrecuencia: '7', debilidad: '4', hormigueo: '1', dificultadAgarre: '5', tugTest: '8', 
        prwe: { dolor: { enReposo: '2', movimientoRepetitivo: '7', objetoPesado: '6', peorMomento: '7', conQueFrecuencia: '8' }, funcion: { darVueltaManija: '3', cortarCarne: '2', abrocharseCamisa: '1', levantarseSilla: '4', cargar5kg: '6', usarPapelHigienico: '0', cuidadoPersonal: '2', tareasHogar: '5', trabajo: '8', tiempoLibre: '4' }},
        dash: { items: { item1: '3', item2: '1', item3: '2', item5: '3', item10: '4', item11: '4', item21: '4', item22: '5', item24: '3', item25: '2', item29: '4', item30: '3', work1: '4', work2: '4'}, mainScore: null, workScore: null, sportsScore: null }
    },
    radiology: { ...emptyRadiology },
    impact: { ...emptyImpact, amarilla_creencia_dolor: 'empeorara', azul_trabajo_dificulta: 'si', naranja_animo_interes: 'si', otrasConsideraciones: 'El paciente manifiesta preocupación por no poder volver a su trabajo de la misma forma.', interpretacionProfesional: 'Posible sobrecarga laboral como factor principal. Se sospecha una tendinopatía de los extensores radiales del carpo. El componente de kinesiofobia podría ser un factor perpetuador.' }
};

export const testPatient2: ClinicalData = {
    filiatorios: { nombre: 'María', apellido: 'González', fechaNacimiento: '1958-11-20', edad: calculateAge('1958-11-20'), nacionalidad: 'Argentina', estadoCivil: 'Viuda', dni: '11222333', obraSocial: 'PAMI', domicilio: 'Av. Siempreviva 742', localidad: 'CABA', partido: 'CABA', telefono: '11-1234-5678', ocupacion: 'Jubilada', actividadesActuales: 'Cuida de sus nietos', deportesAnteriores: '', deportesActuales: 'Caminata', },
    anamnesis: { ...emptyAnamnesis, diagnosticoMedico: 'Postoperatorio de fractura de radio distal', causaFractura: 'Caída en la vía pública sobre mano extendida (FOOSH).', fechaFractura: '2023-10-01', qx: 'si', osteosintesis1Tipo: 'Placa volar y tornillos', inmovilizacion: 'si', inmovilizacion1Tipo: 'Férula', inmovilizacion1Periodo: '2 semanas', dominancia: 'Derecha', menopausia: 'si', osteopeniaOsteoporosis: 'si', dmo: 'si', ultimaDmo: '2023-01-15', caidasFrecuentes: 'si', caidas6meses: '2' },
    physicalExam: { ...emptyPhysicalExam, inspeccion: 'Edema moderado en muñeca y mano. Cicatriz quirúrgica en buen estado.', palpacion: 'Dolor difuso a la palpación.', medidas: { ...emptyPhysicalExam.medidas, figuraEn8: '25.0' }, testKapandji: '6', goniometria: { flexion: { derecha: '20', izquierda: '85' }, extension: { derecha: '15', izquierda: '70' }, inclinacionRadial: { derecha: '5', izquierda: '20' }, inclinacionCubital: { derecha: '10', izquierda: '30' }, supinacion: { derecha: '40', izquierda: '90' }, pronacion: { derecha: '50', izquierda: '90' } }, },
    scales: { ...emptyScales, dolorNocturnoSeveridad: '6', dolorDiurnoFrecuencia: '8', debilidad: '8', hormigueo: '5', dificultadAgarre: '9', tugTest: '15',
        prwe: { dolor: { enReposo: '5', movimientoRepetitivo: '8', objetoPesado: '9', peorMomento: '9', conQueFrecuencia: '9' }, funcion: { darVueltaManija: '9', cortarCarne: '8', abrocharseCamisa: '7', levantarseSilla: '6', cargar5kg: '10', usarPapelHigienico: '4', cuidadoPersonal: '8', tareasHogar: '9', trabajo: '10', tiempoLibre: '7' }},
        dash: { items: { item1: '5', item2: '4', item3: '5', item4: '4', item5: '4', item6: '5', item7: '5', item10: '5', item11: '5', item13: '4', item14: '3', item15: '4', item16: '5', item21: '8', item23: '6', item24: '8', item25: '7', item26: '7', item27: '4', item28: '5', item29: '5', item30: '5' }, mainScore: null, workScore: null, sportsScore: null }
    },
    radiology: { ...emptyRadiology, inclinacionRadial: '15', varianzaCubital: '0', inclinacionPalmar: '5' },
    impact: { ...emptyImpact, amarilla_creencia_dolor: 'no_sabe', amarilla_evita_actividades: 'si', interpretacionProfesional: 'Paciente post-quirúrgica con limitación funcional severa y edema. Alto riesgo de rigidez. Foco en control de edema y ganancia de ROM progresiva.' }
};

export const testPatient3: ClinicalData = {
    filiatorios: { nombre: 'Carlos', apellido: 'Rodríguez', fechaNacimiento: '1978-02-10', edad: calculateAge('1978-02-10'), nacionalidad: 'Argentina', estadoCivil: 'Casado', dni: '22333444', obraSocial: 'Swiss Medical', domicilio: 'Sarmiento 456', localidad: 'Rosario', partido: 'Rosario', telefono: '341-555-1234', ocupacion: 'Administrativo', actividadesActuales: 'Uso intensivo de computadora', deportesAnteriores: '', deportesActuales: '', },
    anamnesis: { ...emptyAnamnesis, diagnosticoMedico: 'Síndrome del Túnel Carpiano (STC) derecho', causaFractura: 'Inicio insidioso de varios meses de evolución, sin trauma agudo.', dominancia: 'Derecha', medicacionDolor: 'Pregabalina 75mg/noche', tabaquismo: 'si' },
    physicalExam: { ...emptyPhysicalExam, inspeccion: 'Sin hallazgos significativos, posible leve atrofia tenar.', palpacion: 'Test de Phalen y Tinel positivos. Sensibilidad disminuida en territorio mediano.', testKapandji: '9', goniometria: { flexion: { derecha: '85', izquierda: '85' }, extension: { derecha: '70', izquierda: '70' }, inclinacionRadial: { derecha: '20', izquierda: '20' }, inclinacionCubital: { derecha: '30', izquierda: '30' }, supinacion: { derecha: '90', izquierda: '90' }, pronacion: { derecha: '90', izquierda: '90' } }, },
    scales: { ...emptyScales, dolorNocturnoSeveridad: '8', dolorNocturnoFrecuencia: '9', entumecimiento: '9', debilidad: '6', hormigueo: '9', dificultadAgarre: '7',
        prwe: { dolor: { enReposo: '3', movimientoRepetitivo: '7', objetoPesado: '6', peorMomento: '8', conQueFrecuencia: '9' }, funcion: { darVueltaManija: '5', cortarCarne: '4', abrocharseCamisa: '6', levantarseSilla: '2', cargar5kg: '6', usarPapelHigienico: '1', cuidadoPersonal: '4', tareasHogar: '5', trabajo: '8', tiempoLibre: '3' }},
        dash: { items: { item1: '4', item2: '4', item3: '3', item23: '5', item24: '4', item26: '5', item27: '4', item29: '4', work1: '4', work2: '4' }, mainScore: null, workScore: null, sportsScore: null }
    },
    radiology: { ...emptyRadiology },
    impact: { ...emptyImpact, azul_trabajo_dificulta: 'si', azul_trabajo_ayuda_empeora: 'empeora', interpretacionProfesional: 'STC con predominio de síntomas nocturnos. El trabajo parece ser un factor agravante. Considerar ergonomía y neurodinamia.' }
};

export const testPatient4: ClinicalData = {
    filiatorios: { nombre: 'Lucía', apellido: 'Fernández', fechaNacimiento: '1995-07-30', edad: calculateAge('1995-07-30'), nacionalidad: 'Argentina', estadoCivil: 'Soltera', dni: '33444555', obraSocial: 'Galeno', domicilio: 'Belgrano 789', localidad: 'Córdoba', partido: 'Córdoba', telefono: '351-555-5678', ocupacion: 'Estudiante', actividadesActuales: 'Jugadora de tenis amateur', deportesAnteriores: '', deportesActuales: 'Tenis', },
    anamnesis: { ...emptyAnamnesis, diagnosticoMedico: 'Lesión del Fibrocartílago Triangular (TFCC)', causaFractura: 'Caída durante un partido de tenis, con torsión de muñeca.', fechaFractura: new Date(new Date().setDate(new Date().getDate()-30)).toISOString().split('T')[0], dominancia: 'Derecha' },
    physicalExam: { ...emptyPhysicalExam, inspeccion: 'Leve edema en lado cubital de la muñeca.', palpacion: 'Dolor a la palpación en la fosa cubital. Clicking audible en prono-supinación. Test de compresión del TFCC positivo.', testKapandji: '10', goniometria: { flexion: { derecha: '70', izquierda: '85' }, extension: { derecha: '60', izquierda: '75' }, inclinacionRadial: { derecha: '15', izquierda: '20' }, inclinacionCubital: { derecha: '20', izquierda: '30' }, supinacion: { derecha: '70', izquierda: '90' }, pronacion: { derecha: '75', izquierda: '90' } }, },
    scales: { ...emptyScales, dolorNocturnoSeveridad: '4', dolorDiurnoFrecuencia: '8', debilidad: '5', dificultadAgarre: '6',
        prwe: { dolor: { enReposo: '2', movimientoRepetitivo: '8', objetoPesado: '8', peorMomento: '9', conQueFrecuencia: '7' }, funcion: { darVueltaManija: '8', cortarCarne: '4', abrocharseCamisa: '1', levantarseSilla: '7', cargar5kg: '8', usarPapelHigienico: '0', cuidadoPersonal: '2', tareasHogar: '5', trabajo: '6', tiempoLibre: '9' }},
        dash: { items: { item1: '4', item3: '4', item18: '5', item19: '5', item22: '5', sports1: '5', sports2: '5', sports3: '4', sports4: '5' }, mainScore: null, workScore: null, sportsScore: null }
    },
    radiology: { ...emptyRadiology },
    impact: { ...emptyImpact, negra_barreras_recuperacion: 'si', interpretacionProfesional: 'Lesión traumática del TFCC. Dolor selectivo con rotación y carga. Foco en estabilidad y control motor.' }
};

export const testPatient5: ClinicalData = {
    filiatorios: { nombre: 'Sofía', apellido: 'Martínez', fechaNacimiento: '1991-03-12', edad: calculateAge('1991-03-12'), nacionalidad: 'Argentina', estadoCivil: 'Casada', dni: '44555666', obraSocial: 'OSDE', domicilio: 'Mitre 123', localidad: 'Mendoza', partido: 'Mendoza', telefono: '261-555-8765', ocupacion: 'De licencia', actividadesActuales: 'Cuidado de bebé recién nacido', deportesAnteriores: '', deportesActuales: '', },
    anamnesis: { ...emptyAnamnesis, diagnosticoMedico: 'Tenosinovitis de De Quervain', causaFractura: 'Inicio gradual post-parto, relacionado con levantar al bebé.', dominancia: 'Derecha' },
    physicalExam: { ...emptyPhysicalExam, inspeccion: 'Leve edema sobre el estiloides radial.', palpacion: 'Dolor exquisito sobre el primer compartimento extensor. Test de Finkelstein positivo.', goniometria: { flexion: { derecha: '80', izquierda: '85' }, extension: { derecha: '70', izquierda: '75' }, inclinacionRadial: { derecha: '10', izquierda: '20' }, inclinacionCubital: { derecha: '30', izquierda: '35' }, supinacion: { derecha: '90', izquierda: '90' }, pronacion: { derecha: '90', izquierda: '90' } }, },
    scales: { ...emptyScales, dolorDiurnoFrecuencia: '9', debilidad: '3', dificultadAgarre: '7',
        prwe: { dolor: { enReposo: '3', movimientoRepetitivo: '9', objetoPesado: '9', peorMomento: '8', conQueFrecuencia: '9' }, funcion: { darVueltaManija: '4', cortarCarne: '6', abrocharseCamisa: '3', levantarseSilla: '2', cargar5kg: '8', usarPapelHigienico: '1', cuidadoPersonal: '5', tareasHogar: '7', trabajo: '8', tiempoLibre: '4' }},
        dash: { items: { item1: '4', item2: '3', item10: '4', item11: '5', item16: '4', item22: '5' }, mainScore: null, workScore: null, sportsScore: null }
    },
    radiology: { ...emptyRadiology },
    impact: { ...emptyImpact, interpretacionProfesional: 'Claro caso de De Quervain por sobreuso. Foco en manejo de carga, ergonomía y ejercicios específicos.' }
};

export const testPatient6: ClinicalData = {
    filiatorios: { nombre: 'Mateo', apellido: 'López', fechaNacimiento: '2001-09-05', edad: calculateAge('2001-09-05'), nacionalidad: 'Argentina', estadoCivil: 'Soltero', dni: '55666777', obraSocial: 'Accord Salud', domicilio: 'Corrientes 987', localidad: 'La Plata', partido: 'La Plata', telefono: '221-555-4321', ocupacion: 'Estudiante', actividadesActuales: 'Skateboarding', deportesAnteriores: '', deportesActuales: 'Skateboarding', },
    anamnesis: { ...emptyAnamnesis, diagnosticoMedico: 'Fractura de Escafoides (no desplazada)', causaFractura: 'Caída de skate sobre mano extendida (FOOSH).', fechaFractura: new Date(new Date().setDate(new Date().getDate()-10)).toISOString().split('T')[0], inmovilizacion: 'si', inmovilizacion1Tipo: 'Yeso con inclusión de pulgar', inmovilizacion1Periodo: 'En curso', dominancia: 'Derecha' },
    physicalExam: { ...emptyPhysicalExam, inspeccion: 'Paciente con yeso en antebrazo y mano derecha. Dedos libres con leve edema.', palpacion: 'Dolor a la palpación profunda en tabaquera anatómica (evaluado antes del yeso).', goniometria: { flexion: { derecha: '', izquierda: '90' }, extension: { derecha: '', izquierda: '75' }, inclinacionRadial: { derecha: '', izquierda: '20' }, inclinacionCubital: { derecha: '', izquierda: '35' }, supinacion: { derecha: '', izquierda: '90' }, pronacion: { derecha: '', izquierda: '90' } }, },
    scales: { ...emptyScales, dolorDiurnoFrecuencia: '5',
        prwe: { dolor: { enReposo: '4', movimientoRepetitivo: '7', objetoPesado: '8', peorMomento: '7', conQueFrecuencia: '6' }, funcion: { darVueltaManija: '10', cortarCarne: '10', abrocharseCamisa: '10', levantarseSilla: '5', cargar5kg: '10', usarPapelHigienico: '8', cuidadoPersonal: '8', tareasHogar: '9', trabajo: '9', tiempoLibre: '10' }},
        dash: { items: { item1: '5', item2: '5', item3: '5', item4: '5', item5: '3', item13: '5', item14: '5', item15: '5', item16: '5', item18: '5', item29: '5' }, mainScore: null, workScore: null, sportsScore: null }
    },
    radiology: { ...emptyRadiology },
    impact: { ...emptyImpact, interpretacionProfesional: 'Fractura de escafoides en tratamiento conservador. Riesgo de pseudoartrosis. Foco en mantener movilidad de articulaciones libres y monitorear consolidación.' }
};

export const testPatient7: ClinicalData = {
    filiatorios: { nombre: 'Roberto', apellido: 'García', fechaNacimiento: '1951-01-25', edad: calculateAge('1951-01-25'), nacionalidad: 'Argentina', estadoCivil: 'Casado', dni: '66777888', obraSocial: 'PAMI', domicilio: 'San Martín 321', localidad: 'Mar del Plata', partido: 'Gral. Pueyrredón', telefono: '223-555-9876', ocupacion: 'Jubilado', actividadesActuales: 'Jardinería', deportesAnteriores: 'Carpintero', deportesActuales: '', },
    anamnesis: { ...emptyAnamnesis, diagnosticoMedico: 'Artrosis radiocarpiana', causaFractura: 'Desarrollo crónico, dolor de años de evolución que ha empeorado.', dominancia: 'Derecha' },
    physicalExam: { ...emptyPhysicalExam, inspeccion: 'Deformidad articular, nodulos de Heberden y Bouchard en dedos.', palpacion: 'Dolor y crepitación a la movilización pasiva de la muñeca.', testKapandji: '7', goniometria: { flexion: { derecha: '30', izquierda: '45' }, extension: { derecha: '25', izquierda: '40' }, inclinacionRadial: { derecha: '10', izquierda: '15' }, inclinacionCubital: { derecha: '15', izquierda: '20' }, supinacion: { derecha: '60', izquierda: '80' }, pronacion: { derecha: '65', izquierda: '85' } }, },
    scales: { ...emptyScales, dolorNocturnoSeveridad: '5', dolorDiurnoFrecuencia: '7', debilidad: '7', dificultadAgarre: '8',
        prwe: { dolor: { enReposo: '4', movimientoRepetitivo: '8', objetoPesado: '8', peorMomento: '7', conQueFrecuencia: '9' }, funcion: { darVueltaManija: '8', cortarCarne: '7', abrocharseCamisa: '6', levantarseSilla: '4', cargar5kg: '8', usarPapelHigienico: '2', cuidadoPersonal: '6', tareasHogar: '8', trabajo: '7', tiempoLibre: '6' }},
        dash: { items: { item1: '4', item2: '3', item3: '4', item7: '4', item8: '4', item10: '4', item11: '4', item25: '4' }, mainScore: null, workScore: null, sportsScore: null }
    },
    radiology: { ...emptyRadiology },
    impact: { ...emptyImpact, interpretacionProfesional: 'Artrosis avanzada con limitación funcional significativa. Foco en manejo del dolor, mantenimiento de la función y adaptaciones.' }
};

export const testPatient8: ClinicalData = {
    filiatorios: { nombre: 'Ana', apellido: 'Sosa', fechaNacimiento: '1973-04-18', edad: calculateAge('1973-04-18'), nacionalidad: 'Argentina', estadoCivil: 'Divorciada', dni: '77888999', obraSocial: 'OSPE', domicilio: 'Rivadavia 654', localidad: 'Tucumán', partido: 'Tucumán', telefono: '381-555-1122', ocupacion: 'Docente', actividadesActuales: '', deportesAnteriores: '', deportesActuales: '', },
    anamnesis: { ...emptyAnamnesis, diagnosticoMedico: 'Síndrome de Dolor Regional Complejo (SDRC) Tipo I', causaFractura: 'Posterior a un esguince de muñeca leve hace 3 meses. Dolor desproporcionado.', dominancia: 'Izquierda', dsr: 'si' },
    physicalExam: { ...emptyPhysicalExam, inspeccion: 'Mano izquierda con edema difuso, coloración violácea, piel brillante y sudorosa.', palpacion: 'Alodinia severa (dolor al tacto suave). Limitación severa de la movilidad por dolor.', goniometria: { flexion: { derecha: '90', izquierda: '10' }, extension: { derecha: '70', izquierda: '5' }, inclinacionRadial: { derecha: '20', izquierda: '5' }, inclinacionCubital: { derecha: '30', izquierda: '5' }, supinacion: { derecha: '90', izquierda: '20' }, pronacion: { derecha: '90', izquierda: '30' } }, },
    scales: { ...emptyScales, dolorNocturnoSeveridad: '10', dolorDiurnoFrecuencia: '10', debilidad: '9', hormigueo: '8', dificultadAgarre: '10',
        prwe: { dolor: { enReposo: '9', movimientoRepetitivo: '10', objetoPesado: '10', peorMomento: '10', conQueFrecuencia: '10' }, funcion: { darVueltaManija: '10', cortarCarne: '10', abrocharseCamisa: '10', levantarseSilla: '8', cargar5kg: '10', usarPapelHigienico: '7', cuidadoPersonal: '9', tareasHogar: '10', trabajo: '10', tiempoLibre: '10' }},
        dash: { items: { item1: '5', item2: '5', item3: '5', item4: '5', item5: '5', item6: '5', item7: '5', item8: '5', item9: '5', item10: '5', item11: '5', item12: '5', item13: '5', item14: '5', item15: '5', item16: '5', item17: '5', item18: '5', item19: '5', item20: '5', item21: '10', item22: '10', item23: '10', item24: '10', item25: '10', item26: '10', item27: '5', item28: '5', item29: '5', item30: '5' }, mainScore: null, workScore: null, sportsScore: null }
    },
    radiology: { ...emptyRadiology },
    impact: { ...emptyImpact, roja_dolor_empeoro: 'si', amarilla_creencia_dolor: 'empeorara', naranja_desesperanza: 'si', interpretacionProfesional: 'SDRC establecido. El cuadro es complejo y requiere un enfoque multidisciplinario. Bandera amarilla y naranja muy altas. Foco en desensibilización, terapia espejo y educación.' }
};

export const allTestPatients = [
    testPatient1,
    testPatient2,
    testPatient3,
    testPatient4,
    testPatient5,
    testPatient6,
    testPatient7,
    testPatient8
];