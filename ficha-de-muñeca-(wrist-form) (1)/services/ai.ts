import { GoogleGenAI, Type } from "@google/genai";
import { ClinicalData, ClinicalRecord, Patient, CIFProfile, HypothesisComparison, GoniometriaValue } from "../types";

const formatDataForPrompt = (data: ClinicalData): string => {
    const redFlags = [];
    if (data.impact.roja_dolor_golpe === 'si') redFlags.push('Inicio del dolor tras golpe/caída fuerte.');
    if (data.impact.roja_fiebre_inflamacion === 'si') redFlags.push('Presencia de fiebre, inflamación marcada o pérdida repentina de fuerza.');
    if (data.impact.roja_dolor_empeoro === 'si') redFlags.push('Dolor ha empeorado en las últimas 24-48 horas.');
    if (data.impact.roja_movilidad_mano === 'no') redFlags.push('Refiere no poder mover la mano/dedos como antes.');

    const yellowFlags = [];
    if (data.impact.amarilla_creencia_dolor === 'empeorara') yellowFlags.push('Creencia de que el dolor va a empeorar (catastrofismo).');
    if (data.impact.amarilla_evita_actividades === 'si') yellowFlags.push('Evita actividades por miedo a empeorar (kinesiophobia).');
    if (data.impact.amarilla_interferencia_dolor) yellowFlags.push(`El dolor interfiere de forma ${data.impact.amarilla_interferencia_dolor} en su vida diaria.`);

    const blueFlags: string[] = []; // for laboral
    if (data.impact.azul_trabajo_dificulta === 'si') blueFlags.push('El trabajo o tareas influyen o dificultan el dolor.');
    if (data.impact.azul_trabajo_ayuda_empeora === 'empeora') blueFlags.push('Percibe que su trabajo empeora la condición.');
    if (data.impact.azul_apoyo_laboral === 'no') blueFlags.push('Refiere no tener apoyo de su entorno laboral.');

    const blackFlags: string[] = []; // for sistema/contexto
    if (data.impact.negra_barreras_recuperacion === 'si') blackFlags.push('Refiere trabas externas que dificultan su recuperación (seguros, turnos, etc.).');
    if (data.impact.negra_barreras_sistema === 'si') blackFlags.push('Identifica barreras del sistema de salud que retrasan su atención.');
    if (data.impact.negra_apoyo_entorno === 'limita') blackFlags.push('Percibe que su familia/entorno lo limita en su recuperación.');

    const orangeFlags: string[] = []; // for salud mental
    if (data.impact.naranja_animo_interes === 'si') orangeFlags.push('En las últimas 2 semanas, se ha sentido desanimado o sin interés en sus actividades (screening PHQ-2 positivo).');
    if (data.impact.naranja_desesperanza === 'si') orangeFlags.push('Refiere tener pensamientos de desesperanza.');
    if (data.impact.naranja_impacto_animo) orangeFlags.push(`Impacto en el ánimo diario: ${data.impact.naranja_impacto_animo}.`);

    let flagsPrompt = '';
    if (data.impact.otrasConsideraciones || data.impact.interpretacionProfesional || [redFlags, yellowFlags, blueFlags, blackFlags, orangeFlags].some(arr => arr.length > 0)) {
        flagsPrompt += '\n\n**6. IMPACTO Y BANDERAS (SCREENING BIOPSICOSOCIAL):**';
        if (data.impact.interpretacionProfesional) {
            flagsPrompt += `\n- **Hipótesis Clínica del Profesional:** ${data.impact.interpretacionProfesional}`;
        }
        if (redFlags.length > 0) {
            flagsPrompt += `\n- **Banderas Rojas (Orgánico/Urgencia):**\n  - ${redFlags.join('\n  - ')}`;
        }
        if (yellowFlags.length > 0) {
            flagsPrompt += `\n- **Banderas Amarillas (Psicosocial Individual):**\n  - ${yellowFlags.join('\n  - ')}`;
        }
        if (blueFlags.length > 0) {
            flagsPrompt += `\n- **Banderas Azules (Laborales):**\n  - ${blueFlags.join('\n  - ')}`;
        }
        if (blackFlags.length > 0) {
            flagsPrompt += `\n- **Banderas Negras (Contexto/Sistema):**\n  - ${blackFlags.join('\n  - ')}`;
        }
        if (orangeFlags.length > 0) {
            flagsPrompt += `\n- **Banderas Naranjas (Salud Mental):**\n  - ${orangeFlags.join('\n  - ')}`;
        }
        if (data.impact.otrasConsideraciones) {
            flagsPrompt += `\n- **Otras Consideraciones:** ${data.impact.otrasConsideraciones}`;
        }
    }

    let scalesPrompt = '';
    // PRWE Score
    if (data.scales.prwe) {
        const { dolor, funcion } = data.scales.prwe;
        const parse = (val: string) => parseInt(val, 10) || 0;
        
        const dolorValues = Object.values(dolor);
        const funcionValues = Object.values(funcion);
        
        if (dolorValues.some(v => v && v !== '') || funcionValues.some(v => v && v !== '')) {
            const totalDolor = dolorValues.reduce((sum, val) => sum + parse(val), 0);
            const totalFuncionRaw = funcionValues.reduce((sum, val) => sum + parse(val), 0);
            const totalFuncion = totalFuncionRaw / 2;
            const prweGlobal = totalDolor + totalFuncion;
            
            scalesPrompt += `\n- Puntuación PRWE Global: ${prweGlobal}/100 (Dolor: ${totalDolor}/50, Función: ${totalFuncion}/50)`;
        }
    }

    // DASH Score
    if (data.scales.dash && data.scales.dash.mainScore !== null) {
        let dashString = `\n- Puntuación DASH: ${data.scales.dash.mainScore}/100`;
        const moduleScores = [];
        if (data.scales.dash.workScore !== null) {
            moduleScores.push(`Módulo Trabajo: ${data.scales.dash.workScore}/100`);
        }
        if (data.scales.dash.sportsScore !== null) {
            moduleScores.push(`Módulo Deportes/Música: ${data.scales.dash.sportsScore}/100`);
        }
        if (moduleScores.length > 0) {
            dashString += ` (${moduleScores.join(', ')})`;
        }
        scalesPrompt += dashString;
    }

    const formatBilateralGonio = (movement: GoniometriaValue) => {
        const { derecha, izquierda } = movement;
        if (derecha && izquierda) return `D: ${derecha}º / I: ${izquierda}º`;
        if (derecha) return `D: ${derecha}º`;
        if (izquierda) return `I: ${izquierda}º`;
        return 'No informado';
    };

    let prompt = `
### INFORME CLÍNICO DE PACIENTE PARA ANÁLISIS PRELIMINAR ###

Por favor, actúa como un asistente médico experto en kinesiología y traumatología. A continuación se presentan los datos clínicos de un paciente con una patología de muñeca. Tu tarea es generar un resumen conciso y un análisis preliminar. Destaca los hallazgos más relevantes, posibles "banderas rojas" (red flags), inconsistencias y sugiere posibles focos para la evaluación y tratamiento kinesiológico. El resumen debe ser claro y estar estructurado en secciones.

**1. DATOS FILIATORIOS:**
- Nombre: ${data.filiatorios.nombre} ${data.filiatorios.apellido}
- Edad: ${data.filiatorios.edad} años
- DNI: ${data.filiatorios.dni}
- Estado Civil: ${data.filiatorios.estadoCivil}
- Obra Social: ${data.filiatorios.obraSocial}
- Dominancia: ${data.anamnesis.dominancia}
- Ocupación: ${data.filiatorios.ocupacion}
- Actividades Actuales: ${data.filiatorios.actividadesActuales}
- Deportes Actuales: ${data.filiatorios.deportesActuales}

**2. ANAMNESIS:**
- Diagnóstico Médico: ${data.anamnesis.diagnosticoMedico}
- Causa de la Lesión: ${data.anamnesis.causaFractura}
- Fecha de la Lesión/Fractura: ${data.anamnesis.fechaFractura}
- Fecha de Atención Médica: ${data.anamnesis.fechaAtencionMedica}
- Fecha de Atención Kinésica: ${data.anamnesis.fechaAtencionKinesica}
- Tratamientos Previos:
    - Cirugía (Qx): ${data.anamnesis.qx}
    - Tipo Osteosíntesis: ${data.anamnesis.osteosintesis1Tipo}
    - Inmovilización: ${data.anamnesis.inmovilizacion === 'si' ? `Sí (Tipo: ${data.anamnesis.inmovilizacion1Tipo || 'N/A'}, Período: ${data.anamnesis.inmovilizacion1Periodo || 'N/A'})` : data.anamnesis.inmovilizacion === 'no' ? 'No' : 'No informado'}
- Antecedentes Relevantes:
    - Tabaquismo: ${data.anamnesis.tabaquismo}
    - Diabetes: ${data.anamnesis.diabetes}
    - Menopausia: ${data.anamnesis.menopausia || 'No informado'}
    - Osteoporosis/Osteopenia: ${data.anamnesis.osteopeniaOsteoporosis}
    - DMO Realizada: ${data.anamnesis.dmo || 'No informado'}
    - Fecha Última DMO: ${data.anamnesis.dmo === 'si' ? data.anamnesis.ultimaDmo || 'No especificada' : 'N/A'}
    - Caídas Frecuentes: ${data.anamnesis.caidasFrecuentes}
    - N.º de Caídas (últimos 6 meses): ${data.anamnesis.caidasFrecuentes === 'si' ? data.anamnesis.caidas6meses || 'No especificado' : 'N/A'}
    - Síndrome de Dolor Regional Complejo (SDRC/DSR): ${data.anamnesis.dsr}
- Medicación para el Dolor: ${data.anamnesis.medicacionDolor}

**3. EXAMEN FÍSICO:**
- Inspección General: ${data.physicalExam.inspeccion}
- Palpación: ${data.physicalExam.palpacion}
- Edema (Medidas Figura en 8): ${data.physicalExam.medidas.figuraEn8} cm
- Goniometría (Movilidad Articular):
    - Flexión: ${formatBilateralGonio(data.physicalExam.goniometria.flexion)}
    - Extensión: ${formatBilateralGonio(data.physicalExam.goniometria.extension)}
    - Desviación Radial: ${formatBilateralGonio(data.physicalExam.goniometria.inclinacionRadial)}
    - Desviación Cubital: ${formatBilateralGonio(data.physicalExam.goniometria.inclinacionCubital)}
    - Supinación: ${formatBilateralGonio(data.physicalExam.goniometria.supinacion)}
    - Pronación: ${formatBilateralGonio(data.physicalExam.goniometria.pronacion)}
- Test de Kapandji: ${data.physicalExam.testKapandji}/10
- Pruebas Especiales Adicionales: ${data.physicalExam.pruebasEspeciales}

**4. ESTUDIOS POR IMÁGENES (RADIOGRAFÍA):**
- Inclinación Radial: ${data.radiology.inclinacionRadial || 'No informado'}°
- Varianza Cubital: ${data.radiology.varianzaCubital || 'No informado'} mm
- Inclinación Palmar (Volar Tilt): ${data.radiology.inclinacionPalmar || 'No informado'}°
- Interpretación de IA: ${data.radiology.interpretation || 'No se ha proporcionado interpretación.'}

**5. ESCALAS DE DOLOR Y FUNCIÓN:**
- Test "Get up and Go" (TUG): ${data.scales.tugTest ? `${data.scales.tugTest} segs` : 'No informado'}
- Dolor Nocturno (Severidad): ${data.scales.dolorNocturnoSeveridad}/10
- Dolor Diurno (Frecuencia): ${data.scales.dolorDiurnoFrecuencia}/10
- Entumecimiento/Hormigueo: ${data.scales.hormigueo}/10
- Debilidad: ${data.scales.debilidad}/10
- Dificultad para Agarre: ${data.scales.dificultadAgarre}/10${scalesPrompt}
${flagsPrompt}
---
**SOLICITUD:**
Genera el resumen y análisis preliminar basado en la información anterior.
`;
    return prompt.trim();
};


export const generateAISummary = async (data: ClinicalData): Promise<string> => {
    try {
        if (!process.env.API_KEY) {
            throw new Error("API key not found.");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = formatDataForPrompt(data);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.5,
                topP: 0.95,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error generating AI summary:", error);
        return "Error: No se pudo generar el resumen. Por favor, verifique la configuración de la API y su conexión a internet.";
    }
};

export const interpretRadiograph = async (imageBase64: string, imageType: string): Promise<string> => {
    try {
        if (!process.env.API_KEY) {
            throw new Error("API key not found.");
        }
        if (!imageBase64 || !imageType) {
            return "Error: No se proporcionó imagen para interpretar.";
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const base64Data = imageBase64.split(',')[1];
        if (!base64Data) {
            return "Error: Formato de imagen inválido.";
        }

        const imagePart = {
            inlineData: {
                mimeType: imageType,
                data: base64Data,
            },
        };

        const textPart = {
            text: `Actúa como un experto en radiología y traumatología especializado en muñeca. Analiza la siguiente radiografía. 
            Describe los hallazgos clave de forma estructurada:
            1.  **Alineación y Articulaciones:** Evalúa la alineación de los huesos del carpo, la articulación radiocubital distal y radiocarpiana.
            2.  **Signos de Fractura:** Busca y describe cualquier línea de fractura, desplazamiento, angulación o conminución. Si identificas una fractura de radio distal, clasifícala según la **clasificación AO**.
            3.  **Calidad Ósea:** Comenta sobre la densidad ósea aparente (ej. osteopenia).
            4.  **Tejidos Blandos:** Menciona cualquier hallazgo relevante en los tejidos blandos visibles.
            
            Concluye con una impresión diagnóstica concisa.`
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        return response.text;

    } catch (error) {
        console.error("Error interpreting radiograph:", error);
        return "Error: No se pudo interpretar la imagen. Verifique la calidad de la imagen y su conexión.";
    }
};

const formatDataForCIFPrompt = (record: ClinicalRecord, patient: Patient): string => {
    const { anamnesis, physicalExam, scales, radiology, summary } = record;
    const { filiatorios } = patient;

    const formatBilateralGonioCIF = (label: string, movement: GoniometriaValue) => {
        const { derecha, izquierda } = movement;
        if (derecha && izquierda) return { label: `${label} (D/I)`, value: `${derecha}° / ${izquierda}°` };
        if (derecha) return { label: `${label} (D)`, value: `${derecha}°` };
        if (izquierda) return { label: `${label} (I)`, value: `${izquierda}°` };
        return null;
    };
    
    const gonioData = [
        formatBilateralGonioCIF("Flexión", physicalExam.goniometria.flexion),
        formatBilateralGonioCIF("Extensión", physicalExam.goniometria.extension),
        formatBilateralGonioCIF("Desviaciones (R/C)", { derecha: `${physicalExam.goniometria.inclinacionRadial.derecha}/${physicalExam.goniometria.inclinacionCubital.derecha}`, izquierda: `${physicalExam.goniometria.inclinacionRadial.izquierda}/${physicalExam.goniometria.inclinacionCubital.izquierda}` }),
        formatBilateralGonioCIF("Prono-supinación", { derecha: `${physicalExam.goniometria.pronacion.derecha}/${physicalExam.goniometria.supinacion.derecha}`, izquierda: `${physicalExam.goniometria.pronacion.izquierda}/${physicalExam.goniometria.supinacion.izquierda}` })
    ].filter(item => item !== null);
    
    const radiologyFindings = [
        radiology.inclinacionRadial && `Inclinación Radial: ${radiology.inclinacionRadial}°`,
        radiology.varianzaCubital && `Varianza Cubital: ${radiology.varianzaCubital}mm`,
        radiology.inclinacionPalmar && `Inclinación Palmar: ${radiology.inclinacionPalmar}°`,
        radiology.interpretation,
    ].filter(Boolean).join('; ');

    const dataPoints = [
        { label: "Edad", value: filiatorios.edad },
        { label: "Dominancia", value: anamnesis.dominancia },
        { label: "Ocupación", value: filiatorios.ocupacion },
        { label: "Actividades Actuales", value: filiatorios.actividadesActuales },
        { label: "Deportes", value: filiatorios.deportesActuales },
        { label: "Factores de riesgo (tabaquismo, etc.)", value: [anamnesis.tabaquismo].filter(v => v === 'si').join(', ') || 'Ninguno' },
        { label: "Comorbilidades", value: [anamnesis.diabetes, anamnesis.enfSNC].filter(v => v === 'si').join(', ') || 'Ninguna' },
        { label: "Diagnóstico Médico", value: anamnesis.diagnosticoMedico },
        { label: "Mecanismo Lesional", value: anamnesis.causaFractura },
        { label: "Tiempo de evolución", value: `Fecha de lesión: ${anamnesis.fechaFractura}` },
        { label: "Dolor Nocturno (Severidad)", value: `${scales.dolorNocturnoSeveridad}/10` },
        { label: "Dolor Diurno (Frecuencia)", value: `${scales.dolorDiurnoFrecuencia}/10` },
        { label: "Síntomas neurológicos (Hormigueo/Entumecimiento)", value: `${scales.hormigueo}/10` },
        ...gonioData.map(g => ({ label: `Goniometría - ${g!.label}`, value: g!.value })),
        { label: "Edema (Medida en 8)", value: `${physicalExam.medidas.figuraEn8} cm` },
        { label: "Debilidad (escala)", value: `${scales.debilidad}/10` },
        { label: "Hallazgos Radiológicos", value: radiologyFindings },
        { label: "Dificultad de Agarre (escala)", value: `${scales.dificultadAgarre}/10` },
        { label: "Test Kapandji (Oposición pulgar)", value: `${physicalExam.testKapandji}/10` },
        { label: "Test 'Get up and Go' (TUG)", value: `${scales.tugTest} segs` },
        { label: "Resumen Clínico Previo", value: summary },
    ];
    
    return dataPoints.filter(dp => dp.value && String(dp.value).trim() !== '' && !String(dp.value).includes('undefined')).map(dp => `- ${dp.label}: ${dp.value}`).join('\n');
};

export const generateCIFProfile = async (record: ClinicalRecord, patient: Patient): Promise<CIFProfile | null> => {
    try {
        if (!process.env.API_KEY) throw new Error("API key not found.");
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const prompt = `
Actúa como un asistente clínico experto en Kinesiología y en la Clasificación Internacional del Funcionamiento, de la Discapacidad y de la Salud (CIF).
Tu tarea es organizar la información del paciente en un perfil CIF claro, utilizable y basado estrictamente en la evidencia proporcionada.

**Instrucciones:**
1. Analiza los datos de la evaluación kinésica del paciente.
2. Identifica **únicamente** los códigos CIF más relevantes que estén **directamente justificados** por los datos proporcionrados. Evita inferencias o códigos rebuscados. Clasifícalos en:
   - Funciones y estructuras corporales (códigos 'b' y 's')
   - Actividad y participación (códigos 'd')
   - Factores ambientales (códigos 'e')
   - Factores personales (descripción cualitativa, no codificada)
3. Asigna a cada código un calificador numérico de deficiencia/dificultad (0=ninguna, 1=leve, 2=moderada, 3=grave, 4=completa) basado estrictamente en la información clínica.
4. Para Factores Ambientales, usa calificadores de barrera (ej. 2) o facilitador (ej. +2). Devuelve el calificador como un string.
5. Genera una salida en formato JSON con la estructura solicitada. El reporte debe ser breve, clínico y útil para el seguimiento.

**DATOS DEL PACIENTE:**
${formatDataForCIFPrompt(record, patient)}
`;

        const cifCodeSchema = {
            type: Type.OBJECT,
            properties: {
                codigo: { type: Type.STRING },
                descripcion: { type: Type.STRING },
                calificador: { type: Type.STRING },
            },
            required: ["codigo", "descripcion", "calificador"]
        };

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                funciones_estructuras: { type: Type.ARRAY, items: cifCodeSchema },
                actividad_participacion: { type: Type.ARRAY, items: cifCodeSchema },
                factores_ambientales: { type: Type.ARRAY, items: cifCodeSchema },
                factores_personales: { type: Type.STRING },
            },
            required: ["funciones_estructuras", "actividad_participacion", "factores_ambientales", "factores_personales"]
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema,
                temperature: 0.1,
            }
        });

        const jsonString = response.text;
        return JSON.parse(jsonString) as CIFProfile;

    } catch (error) {
        console.error("Error generating CIF profile:", error);
        return null;
    }
};

const formatDataForComparisonPrompt = (record: ClinicalRecord, patient: Patient): string => {
    const { anamnesis, physicalExam, scales, radiology, summary, cifProfile } = record;
    const { filiatorios } = patient;
    
    const formatBilateralGonioComp = (label: string, movement: GoniometriaValue) => {
        const { derecha, izquierda } = movement;
        if (derecha && izquierda) return `${label} (D/I): ${derecha}°/${izquierda}°`;
        if (derecha) return `${label} (D): ${derecha}°`;
        if (izquierda) return `${label} (I): ${izquierda}°`;
        return null;
    };
    
    const gonioString = [
        formatBilateralGonioComp("Flexión", physicalExam.goniometria.flexion),
        formatBilateralGonioComp("Extensión", physicalExam.goniometria.extension),
        formatBilateralGonioComp("Supinación", physicalExam.goniometria.supinacion),
        formatBilateralGonioComp("Pronación", physicalExam.goniometria.pronacion),
    ].filter(Boolean).join(', ');

    const radiologyFindings = [
        record.radiology?.inclinacionRadial && `Inc. Radial: ${record.radiology.inclinacionRadial}°`,
        record.radiology?.varianzaCubital && `Var. Cubital: ${record.radiology.varianzaCubital}mm`,
        record.radiology?.inclinacionPalmar && `Inc. Palmar: ${record.radiology.inclinacionPalmar}°`,
        record.radiology?.interpretation,
    ].filter(Boolean).join('; ') || 'No disponible';


    let dataString = `
- **Datos del Paciente:** Edad: ${filiatorios.edad}, Dominancia: ${anamnesis.dominancia}, Ocupación: ${filiatorios.ocupacion}.
- **Historia de la Lesión:** Dx Médico: ${anamnesis.diagnosticoMedico}, Causa: ${anamnesis.causaFractura}, Fecha: ${anamnesis.fechaFractura}.
- **Hallazgos Clave del Examen Físico:**
  - Dolor: Nocturno ${scales.dolorNocturnoSeveridad}/10, Diurno ${scales.dolorDiurnoFrecuencia}/10.
  - Movilidad: ${gonioString}.
  - Edema: ${physicalExam.medidas.figuraEn8} cm.
  - Función: Kapandji ${physicalExam.testKapandji}/10, Debilidad ${scales.debilidad}/10, Dificultad Agarre ${scales.dificultadAgarre}/10.
  - Test de Marcha (TUG): ${scales.tugTest} segs.
- **Antecedentes Relevantes:** Tabaquismo: ${anamnesis.tabaquismo}, Diabetes: ${anamnesis.diabetes}, Osteoporosis: ${anamnesis.osteopeniaOsteoporosis}.
- **Hallazgos Radiológicos:** ${radiologyFindings}.
- **Resumen Clínico Previo (IA):** ${summary}
`;
    if (cifProfile) {
        dataString += `- **Perfil CIF (Resumen):**
  - Funciones/Estructuras Afectadas: ${cifProfile.funciones_estructuras.map(c => `${c.descripcion} (${c.codigo})`).join(', ')}.
  - Actividades/Participación con Dificultad: ${cifProfile.actividad_participacion.map(c => `${c.descripcion} (${c.codigo})`).join(', ')}.
`;
    }
    return dataString.trim();
};


export const generateHypothesisComparison = async (record: ClinicalRecord, patient: Patient, professionalHypothesis: string): Promise<HypothesisComparison | null> => {
     try {
        if (!process.env.API_KEY) throw new Error("API key not found.");
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const prompt = `
Actúa como un asistente experto en razonamiento clínico para kinesiología, especializado en patologías de muñeca.
Tu tarea es comparar la hipótesis clínica del profesional con un análisis objetivo de los datos del paciente.

**DATOS OBJETIVOS DEL PACIENTE:**
${formatDataForComparisonPrompt(record, patient)}

---

**HIPÓTESIS DEL PROFESIONAL:**
"${professionalHypothesis}"

---

**INSTRUCCIONES:**
1.  **Analiza los datos objetivos:** Basándote en toda la información proporcionada (anamnesis, examen físico, escalas, CIF, etc.), formula una breve hipótesis clínica propia.
2.  **Compara las hipótesis:** Compara tu interpretación con la hipótesis del profesional.
3.  **Evalúa la coincidencia:** Clasifica el nivel de coincidencia como "alta", "parcial" o "baja".
4.  **Identifica puntos en común y diferencias:** Enumera los puntos clave donde ambas hipótesis coinciden y donde difieren. Sé específico. Por ejemplo, si tú ponderas más un antecedente (como la osteoporosis) y el profesional no lo menciona, esa es una diferencia relevante.
5.  **Genera la salida en formato JSON:** Devuelve el resultado exclusivamente en el formato JSON especificado.

**Formato de Salida JSON Requerido:**
{
 "paciente_id": "${patient.filiatorios.dni}",
 "hipotesis_profesional": "La hipótesis original del profesional.",
 "interpretacion_ia": "Tu interpretación concisa basada en los datos.",
 "coincidencia": "alta | parcial | baja",
 "puntos_comunes": ["array de strings con los puntos en común"],
 "diferencias": ["array de strings con las diferencias o puntos que tú consideras y el profesional no"]
}
`;

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                paciente_id: { type: Type.STRING },
                hipotesis_profesional: { type: Type.STRING },
                interpretacion_ia: { type: Type.STRING },
                coincidencia: { type: Type.STRING, enum: ["alta", "parcial", "baja"] },
                puntos_comunes: { type: Type.ARRAY, items: { type: Type.STRING } },
                diferencias: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["paciente_id", "hipotesis_profesional", "interpretacion_ia", "coincidencia", "puntos_comunes", "diferencias"]
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema,
                temperature: 0.3,
            }
        });

        const jsonString = response.text;
        return JSON.parse(jsonString) as HypothesisComparison;

    } catch (error) {
        console.error("Error generating hypothesis comparison:", error);
        return null;
    }
}