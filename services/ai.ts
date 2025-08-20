import { GoogleGenAI, Type } from "@google/genai";
import { ClinicalData, ClinicalRecord, Patient, CIFProfile } from "../types";

const formatDataForPrompt = (data: ClinicalData): string => {
    let prompt = `
### INFORME CLÍNICO DE PACIENTE PARA ANÁLISIS PRELIMINAR ###

Por favor, actúa como un asistente médico experto en kinesiología y traumatología. A continuación se presentan los datos clínicos de un paciente con una patología de muñeca. Tu tarea es generar un resumen conciso y un análisis preliminar. Destaca los hallazgos más relevantes, posibles "banderas rojas" (red flags), inconsistencias y sugiere posibles focos para la evaluación y tratamiento kinesiológico. El resumen debe ser claro y estar estructurado en secciones.

**1. DATOS FILIATORIOS:**
- Nombre: ${data.filiatorios.nombre} ${data.filiatorios.apellido}
- Edad: ${data.filiatorios.edad} años
- DNI: ${data.filiatorios.dni}
- Dominancia: ${data.anamnesis.dominancia}
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
    - Flexión: ${data.physicalExam.goniometria.flexion}°
    - Extensión: ${data.physicalExam.goniometria.extension}°
    - Desviación Radial: ${data.physicalExam.goniometria.inclinacionRadial}°
    - Desviación Cubital: ${data.physicalExam.goniometria.inclinacionCubital}°
    - Supinación: ${data.physicalExam.goniometria.supinacion}°
    - Pronación: ${data.physicalExam.goniometria.pronacion}°
- Test de Kapandji: ${data.physicalExam.testKapandji}/10
- Pruebas Especiales Adicionales: ${data.physicalExam.pruebasEspeciales}

**4. ESTUDIOS POR IMÁGENES (RADIOGRAFÍA):**
- Interpretación: ${data.radiology.interpretation || 'No se ha proporcionado interpretación.'}

**5. ESCALAS DE DOLOR Y FUNCIÓN:**
- Test "Get up and Go" (TUG): ${data.scales.tugTest ? `${data.scales.tugTest} segs` : 'No informado'}
- Dolor Nocturno (Severidad): ${data.scales.dolorNocturnoSeveridad}/10
- Dolor Diurno (Frecuencia): ${data.scales.dolorDiurnoFrecuencia}/10
- Entumecimiento/Hormigueo: ${data.scales.hormigueo}/10
- Debilidad: ${data.scales.debilidad}/10
- Dificultad para Agarre: ${data.scales.dificultadAgarre}/10

---
**SOLICITUD:**
Genera el resumen y análisis preliminar basado en la información anterior.
`;
    return prompt.trim();
};


export const generateAISummary = async (data: ClinicalData): Promise<string> => {
    try {
        if (!process.env.GOOGLE_API_KEY) {
            throw new Error("API key not found.");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
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
        if (!process.env.GOOGLE_API_KEY) {
            throw new Error("API key not found.");
        }
        if (!imageBase64 || !imageType) {
            return "Error: No se proporcionó imagen para interpretar.";
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
        
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

    const dataPoints = [
        { label: "Edad", value: filiatorios.edad },
        { label: "Dominancia", value: anamnesis.dominancia },
        { label: "Actividades/Trabajo", value: filiatorios.actividadesActuales },
        { label: "Deportes", value: filiatorios.deportesActuales },
        { label: "Factores de riesgo (tabaquismo, etc.)", value: [anamnesis.tabaquismo].filter(v => v === 'si').join(', ') || 'Ninguno' },
        { label: "Comorbilidades", value: [anamnesis.diabetes, anamnesis.enfSNC].filter(v => v === 'si').join(', ') || 'Ninguna' },
        { label: "Diagnóstico Médico", value: anamnesis.diagnosticoMedico },
        { label: "Mecanismo Lesional", value: anamnesis.causaFractura },
        { label: "Tiempo de evolución", value: `Fecha de lesión: ${anamnesis.fechaFractura}` },
        { label: "Dolor Nocturno (Severidad)", value: `${scales.dolorNocturnoSeveridad}/10` },
        { label: "Dolor Diurno (Frecuencia)", value: `${scales.dolorDiurnoFrecuencia}/10` },
        { label: "Síntomas neurológicos (Hormigueo/Entumecimiento)", value: `${scales.hormigueo}/10` },
        { label: "Goniometría - Flexión", value: `${physicalExam.goniometria.flexion}°` },
        { label: "Goniometría - Extensión", value: `${physicalExam.goniometria.extension}°` },
        { label: "Goniometría - Desviaciones", value: `Radial: ${physicalExam.goniometria.inclinacionRadial}°, Cubital: ${physicalExam.goniometria.inclinacionCubital}°` },
        { label: "Goniometría - Prono-supinación", value: `Supinación: ${physicalExam.goniometria.supinacion}°, Pronación: ${physicalExam.goniometria.pronacion}°` },
        { label: "Edema (Medida en 8)", value: `${physicalExam.medidas.figuraEn8} cm` },
        { label: "Debilidad (escala)", value: `${scales.debilidad}/10` },
        { label: "Hallazgos Radiológicos", value: radiology.interpretation },
        { label: "Dificultad de Agarre (escala)", value: `${scales.dificultadAgarre}/10` },
        { label: "Test Kapandji (Oposición pulgar)", value: `${physicalExam.testKapandji}/10` },
        { label: "Test 'Get up and Go' (TUG)", value: `${scales.tugTest} segs` },
        { label: "Resumen Clínico Previo", value: summary },
    ];
    
    return dataPoints.filter(dp => dp.value && String(dp.value).trim() !== '' && !String(dp.value).includes('undefined')).map(dp => `- ${dp.label}: ${dp.value}`).join('\n');
};

export const generateCIFProfile = async (record: ClinicalRecord, patient: Patient): Promise<CIFProfile | null> => {
    try {
        if (!process.env.GOOGLE_API_KEY) throw new Error("API key not found.");
        
        const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

        const prompt = `
Actúa como un asistente clínico experto en Kinesiología y en la Clasificación Internacional del Funcionamiento, de la Discapacidad y de la Salud (CIF).
Tu tarea es organizar la información del paciente en un perfil CIF claro, utilizable y basado estrictamente en la evidencia proporcionada.

**Instrucciones:**
1. Analiza los datos de la evaluación kinésica del paciente.
2. Identifica **únicamente** los códigos CIF más relevantes que estén **directamente justificados** por los datos proporcionados. Evita inferencias o códigos rebuscados. Clasifícalos en:
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
