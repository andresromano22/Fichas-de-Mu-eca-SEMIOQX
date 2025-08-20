export interface FiliatoriosData {
    nombre: string;
    apellido: string;
    fechaNacimiento: string;
    edad: string;
    nacionalidad: string;
    estadoCivil: string;
    dni: string;
    obraSocial: string;
    domicilio: string;
    localidad: string;
    partido: string;
    telefono: string;
    actividadesAnteriores: string;
    actividadesActuales: string;
    deportesAnteriores: string;
    deportesActuales: string;
}

export interface AnamnesisData {
    diagnosticoMedico: string;
    evaluacionKinesica: string;
    medicoDerivador: string;
    fechaDerivacion: string;
    kinesiologo: string;
    fechaFractura: string;
    causaFractura: string;
    fechaAtencionMedica: string;
    fechaAtencionKinesica: string;
    lugarPrimeraAtencion: string;
    rx: '' | 'si' | 'no';
    traccion: '' | 'si' | 'no';
    qx: '' | 'si' | 'no';
    diasInternacion: string;
    osteosintesis1Tipo: string;
    osteosintesis1Periodo: string;
    inmovilizacion: '' | 'si' | 'no';
    inmovilizacion1Tipo: string;
    inmovilizacion1Periodo: string;
    osteosintesis2Tipo: string;
    osteosintesis2Periodo: string;
    inmovilizacion2Tipo: string;
    inmovilizacion2Periodo: string;
    dominancia: '' | 'Derecha' | 'Izquierda' | 'Ambidiestro';
    antecedentesClinicoQuirurgicos: string;
    medicacionDolor: string;
    medicacionExtra: string;
    menopausia: '' | 'si' | 'no';
    osteopeniaOsteoporosis: '' | 'si' | 'no';
    dmo: '' | 'si' | 'no';
    ultimaDmo: string;
    caidasFrecuentes: '' | 'si' | 'no';
    caidas6meses: string;
    tabaquismo: '' | 'si' | 'no';
    alcoholismo: '' | 'si' | 'no';
    barbituricos: '' | 'si' | 'no';
    neoplasias: '' | 'si' | 'no';
    fxHombro: '' | 'si' | 'no';
    infecciones: '' | 'si' | 'no';
    enfSNC: '' | 'si' | 'no';
    altVascular: '' | 'si' | 'no';
    diabetes: '' | 'si' | 'no';
    dsr: '' | 'si' | 'no';
    tiroidismo: '' | 'si' | 'no';
    hiperlipidemia: '' | 'si' | 'no';
    dupuytren: '' | 'si' | 'no';
    manosTranspiran: '' | 'si' | 'no';
}

export interface PhysicalExamData {
    cftLesion: {
        chasquido: boolean;
        dolorDorsalPalmar: boolean;
        crepitacion: boolean;
    };
    actitudMiembroSuperior: {
        hombro: string;
        codoAntebrazo: string;
        muneca: string;
        mano: string;
    };
    pruebasFracturaEscafoides: {
        sensibilidadTabaquera: string;
        dolorSupinacion: string;
        dolorCompresion: string;
    };
    medidas: {
        figuraEn8: string;
        estiloideo: string;
        palmar: string;
        mtcpf: string;
    };
    testKapandji: string;
    goniometria: {
        flexion: string;
        extension: string;
        inclinacionRadial: string;
        inclinacionCubital: string;
        supinacion: string;
        pronacion: string;
    };
    dolorHombro: '' | 'si' | 'no';
    movimientosHombro: {
        elevacionAnterior: string;
        geb1: string;
        geb2: string;
    };
    pruebasPrension: {
        puntaFlecha: boolean;
        pinzaFina: boolean;
        pinzaLlave: boolean;
        tablero: boolean;
        aperturaCompleta: boolean;
        garra: boolean;
        empunadura: boolean;
    };
    prwe: {
        actividadesEspecificas: string;
        actividadesCotidiana: string;
    };
    inspeccion: string;
    palpacion: string;
    pruebasEspeciales: string;
}

export interface ScalesData {
    dolorNocturnoSeveridad: string;
    dolorNocturnoFrecuencia: string;
    dolorDiurnoFrecuencia: string;
    dolorDiurnoEpisodios: string;
    dolorDiurnoDuracion: string;
    entumecimiento: string;
    debilidad: string;
    hormigueo: string;
    entumecimientoHormigueoNocturnoSeveridad: string;
    entumecimientoHormigueoNocturnoFrecuencia: string;
    dificultadAgarre: string;
    tugTest: string;
}

export interface RadiologyData {
    imageBase64: string;
    imageType: string;
    interpretation: string;
}

export interface ClinicalData {
    filiatorios: FiliatoriosData;
    anamnesis: AnamnesisData;
    physicalExam: PhysicalExamData;
    radiology: RadiologyData;
    scales: ScalesData;
}

export interface CIFCode {
    codigo: string;
    descripcion: string;
    calificador: number | string;
}

export interface CIFProfile {
    funciones_estructuras: CIFCode[];
    actividad_participacion: CIFCode[];
    factores_ambientales: CIFCode[];
    factores_personales: string;
}

export interface ClinicalRecord {
    id: number;
    createdAt: string;
    anamnesis: AnamnesisData;
    physicalExam: PhysicalExamData;
    scales: ScalesData;
    radiology: RadiologyData;
    summary: string;
    cifProfile?: CIFProfile;
}

export interface ComplementaryStudy {
    id: string;
    name: string;
    date: string;
    fileData: string; // Base64 encoded file
    fileType: string; // MIME type
}

export interface Patient {
    id: string; // DNI will be used as ID
    filiatorios: FiliatoriosData;
    clinicalRecords: ClinicalRecord[];
    complementaryStudies: ComplementaryStudy[];
}

export interface Step {
    id: string;
    name: string;
}

export interface ChatMessage {
    sender: 'user' | 'bot';
    text: string | React.ReactNode;
    options?: { text: string; payload: string }[];
}