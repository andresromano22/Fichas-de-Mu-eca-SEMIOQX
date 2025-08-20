import React, { useState, useMemo, useCallback } from 'react';
import { STEPS } from '../constants';
import { ClinicalData, FiliatoriosData, AnamnesisData, PhysicalExamData, ScalesData, RadiologyData } from '../types';
import { Input, Select, Textarea } from '../components/FormControls';
import { ChevronLeftIcon, ChevronRightIcon, SparklesIcon, LoaderIcon } from '../components/IconComponents';
import { generateAISummary, interpretRadiograph } from '../services/ai';
import { saveClinicalRecord } from '../services/db';

const initialFiliatorios: FiliatoriosData = { nombre: '', apellido: '', fechaNacimiento: '', edad: '', nacionalidad: '', estadoCivil: '', dni: '', obraSocial: '', domicilio: '', localidad: '', partido: '', telefono: '', actividadesAnteriores: '', actividadesActuales: '', deportesAnteriores: '', deportesActuales: '' };
const initialAnamnesis: AnamnesisData = { diagnosticoMedico: '', evaluacionKinesica: '', medicoDerivador: '', fechaDerivacion: '', kinesiologo: '', fechaFractura: '', causaFractura: '', fechaAtencionMedica: '', fechaAtencionKinesica: '', lugarPrimeraAtencion: '', rx: '', traccion: '', qx: '', diasInternacion: '', osteosintesis1Tipo: '', osteosintesis1Periodo: '', inmovilizacion: '', inmovilizacion1Tipo: '', inmovilizacion1Periodo: '', osteosintesis2Tipo: '', osteosintesis2Periodo: '', inmovilizacion2Tipo: '', inmovilizacion2Periodo: '', dominancia: '', antecedentesClinicoQuirurgicos: '', medicacionDolor: '', medicacionExtra: '', menopausia: '', osteopeniaOsteoporosis: '', dmo: '', ultimaDmo: '', caidasFrecuentes: '', caidas6meses: '', tabaquismo: '', alcoholismo: '', barbituricos: '', neoplasias: '', fxHombro: '', infecciones: '', enfSNC: '', altVascular: '', diabetes: '', dsr: '', tiroidismo: '', hiperlipidemia: '', dupuytren: '', manosTranspiran: '' };
const initialPhysicalExam: PhysicalExamData = { cftLesion: { chasquido: false, dolorDorsalPalmar: false, crepitacion: false }, actitudMiembroSuperior: { hombro: '', codoAntebrazo: '', muneca: '', mano: '' }, pruebasFracturaEscafoides: { sensibilidadTabaquera: '', dolorSupinacion: '', dolorCompresion: '' }, medidas: { figuraEn8: '', estiloideo: '', palmar: '', mtcpf: '' }, testKapandji: '', goniometria: { flexion: '', extension: '', inclinacionRadial: '', inclinacionCubital: '', supinacion: '', pronacion: '' }, dolorHombro: '', movimientosHombro: { elevacionAnterior: '', geb1: '', geb2: '' }, pruebasPrension: { puntaFlecha: false, pinzaFina: false, pinzaLlave: false, tablero: false, aperturaCompleta: false, garra: false, empunadura: false }, prwe: { actividadesEspecificas: '', actividadesCotidiana: '' }, inspeccion: '', palpacion: '', pruebasEspeciales: '' };
const initialScales: ScalesData = { dolorNocturnoSeveridad: '', dolorNocturnoFrecuencia: '', dolorDiurnoFrecuencia: '', dolorDiurnoEpisodios: '', dolorDiurnoDuracion: '', entumecimiento: '', debilidad: '', hormigueo: '', entumecimientoHormigueoNocturnoSeveridad: '', entumecimientoHormigueoNocturnoFrecuencia: '', dificultadAgarre: '', tugTest: '' };
const initialRadiology: RadiologyData = { imageBase64: '', imageType: '', interpretation: '' };


const FormPage: React.FC<{ onFormSubmit: () => void }> = ({ onFormSubmit }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<ClinicalData>({
        filiatorios: initialFiliatorios,
        anamnesis: initialAnamnesis,
        physicalExam: initialPhysicalExam,
        radiology: initialRadiology,
        scales: initialScales,
    });
    const [summary, setSummary] = useState('');
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [isLoadingRadiology, setIsLoadingRadiology] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleGenerateTestData = () => {
        const birthDate = new Date('1989-05-15');
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        const testData: ClinicalData = {
            filiatorios: {
                nombre: 'Juan',
                apellido: 'Pérez',
                fechaNacimiento: '1989-05-15',
                edad: age.toString(),
                nacionalidad: 'Argentina',
                estadoCivil: 'Soltero',
                dni: '99888777',
                obraSocial: 'OSDE',
                domicilio: 'Calle Falsa 123',
                localidad: 'Springfield',
                partido: 'Springfield',
                telefono: '11-5555-4444',
                actividadesAnteriores: '',
                actividadesActuales: 'Repositor en supermercado',
                deportesAnteriores: '',
                deportesActuales: 'Fútbol 5 (una vez por semana)',
            },
            anamnesis: {
                ...initialAnamnesis,
                diagnosticoMedico: 'Tendinopatía de extensores de muñeca derecha',
                causaFractura: 'Inicio insidioso, relacionado con movimientos repetitivos de levantamiento y colocación de productos en estanterías.',
                fechaAtencionMedica: new Date(new Date().setDate(new Date().getDate()-7)).toISOString().split('T')[0],
                fechaAtencionKinesica: new Date().toISOString().split('T')[0],
                rx: 'no',
                qx: 'no',
                inmovilizacion: 'no',
                dominancia: 'Derecha',
                medicacionDolor: 'Ibuprofeno 400mg condicional al dolor.',
                tabaquismo: 'no',
                diabetes: 'no',
            },
            physicalExam: {
                ...initialPhysicalExam,
                inspeccion: 'Leve tumefacción en la cara dorsal de la muñeca derecha. Sin deformidades evidentes.',
                palpacion: 'Dolor a la palpación sobre los tendones de los extensores radiales del carpo (ECRL/ECRB). Test de Finkelstein negativo.',
                medidas: { ...initialPhysicalExam.medidas, figuraEn8: '22.5' },
                testKapandji: '10',
                goniometria: { flexion: '80', extension: '60', inclinacionRadial: '20', inclinacionCubital: '30', supinacion: '90', pronacion: '90' },
            },
            scales: {
                ...initialScales,
                dolorNocturnoSeveridad: '2',
                dolorDiurnoFrecuencia: '7',
                debilidad: '4',
                hormigueo: '1',
                dificultadAgarre: '5',
                tugTest: '8',
            },
            radiology: { ...initialRadiology },
        };
        setFormData(testData);
        alert('Se han cargado los datos del paciente de prueba.');
    };

    const handleFiliatoriosChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let updatedFiliatorios = { ...formData.filiatorios, [name]: value };

        if (name === "fechaNacimiento") {
            const birthDate = new Date(value);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            updatedFiliatorios.edad = age >= 0 ? age.toString() : '';
        }
        setFormData({ ...formData, filiatorios: updatedFiliatorios });
    };

    const handleAnamnesisChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const updatedAnamnesis = { ...formData.anamnesis, [name]: value };

        if (name === 'qx' && value !== 'si') {
            updatedAnamnesis.osteosintesis1Tipo = '';
        }
        
        if (name === 'inmovilizacion' && value !== 'si') {
            updatedAnamnesis.inmovilizacion1Tipo = '';
            updatedAnamnesis.inmovilizacion1Periodo = '';
        }

        if (name === 'dmo' && value !== 'si') {
            updatedAnamnesis.ultimaDmo = '';
        }

        if (name === 'caidasFrecuentes' && value !== 'si') {
            updatedAnamnesis.caidas6meses = '';
        }


        setFormData({ ...formData, anamnesis: updatedAnamnesis });
    };

    const handlePhysicalExamChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const [section, field] = name.split('.');
        if (field) {
            setFormData({
                ...formData,
                physicalExam: {
                    ...formData.physicalExam,
                    [section]: {
                        // @ts-ignore
                        ...formData.physicalExam[section],
                        [field]: value,
                    },
                },
            });
        } else {
            setFormData({ ...formData, physicalExam: { ...formData.physicalExam, [name]: value } });
        }
    };
    
    const handleScalesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, scales: { ...formData.scales, [e.target.name]: e.target.value } });
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    const handleGenerateSummary = async () => {
        setIsLoadingAI(true);
        const result = await generateAISummary(formData);
        setSummary(result);
        setIsLoadingAI(false);
    };
    
    const handleSave = async () => {
      setIsSaving(true);
      try {
        await saveClinicalRecord({...formData, summary});
        alert('Ficha guardada con éxito!');
        onFormSubmit();
      } catch (error) {
        console.error("Error saving record:", error);
        alert('Hubo un error al guardar la ficha.');
      } finally {
        setIsSaving(false);
      }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                const base64 = loadEvent.target?.result as string;
                setFormData(prev => ({
                    ...prev,
                    radiology: { ...prev.radiology, imageBase64: base64, imageType: file.type }
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInterpretImage = async () => {
        if (!formData.radiology.imageBase64) {
            alert("Por favor, suba una imagen primero.");
            return;
        }
        setIsLoadingRadiology(true);
        const result = await interpretRadiograph(formData.radiology.imageBase64, formData.radiology.imageType);
        setFormData(prev => ({
            ...prev,
            radiology: { ...prev.radiology, interpretation: result }
        }));
        setIsLoadingRadiology(false);
    };


    const isFiliatoriosComplete = useMemo(() => formData.filiatorios.nombre && formData.filiatorios.apellido && formData.filiatorios.dni, [formData.filiatorios]);

    const renderStepContent = () => {
        switch (STEPS[currentStep].id) {
            case 'filiatorios':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Input label="Nombre" name="nombre" value={formData.filiatorios.nombre} onChange={handleFiliatoriosChange} required />
                        <Input label="Apellido" name="apellido" value={formData.filiatorios.apellido} onChange={handleFiliatoriosChange} required />
                        <Input label="DNI" name="dni" value={formData.filiatorios.dni} onChange={handleFiliatoriosChange} required />
                        <Input label="Fecha de Nacimiento" name="fechaNacimiento" type="date" value={formData.filiatorios.fechaNacimiento} onChange={handleFiliatoriosChange} />
                        <Input label="Edad" name="edad" value={formData.filiatorios.edad} readOnly disabled />
                        <Input label="Teléfono" name="telefono" value={formData.filiatorios.telefono} onChange={handleFiliatoriosChange} />
                        <Input label="Actividades Actuales" name="actividadesActuales" value={formData.filiatorios.actividadesActuales} onChange={handleFiliatoriosChange} />
                        <Input label="Deportes Actuales" name="deportesActuales" value={formData.filiatorios.deportesActuales} onChange={handleFiliatoriosChange} />
                    </div>
                );
            case 'anamnesis':
                return (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Input label="Diagnóstico Médico" name="diagnosticoMedico" value={formData.anamnesis.diagnosticoMedico} onChange={handleAnamnesisChange} />
                        <Input label="Fecha de Fractura/Lesión" name="fechaFractura" type="date" value={formData.anamnesis.fechaFractura} onChange={handleAnamnesisChange} />
                        <Textarea label="Causa de Fractura/Lesión" name="causaFractura" value={formData.anamnesis.causaFractura} onChange={handleAnamnesisChange} />
                        <Input label="Fecha Atención Médica" name="fechaAtencionMedica" type="date" value={formData.anamnesis.fechaAtencionMedica} onChange={handleAnamnesisChange} />
                        <Input label="Fecha Atención Kinésica" name="fechaAtencionKinesica" type="date" value={formData.anamnesis.fechaAtencionKinesica} onChange={handleAnamnesisChange} />
                         <Select label="Dominancia" name="dominancia" value={formData.anamnesis.dominancia} onChange={handleAnamnesisChange}>
                            <option value="">Seleccionar</option>
                            <option value="Derecha">Derecha</option>
                            <option value="Izquierda">Izquierda</option>
                            <option value="Ambidiestro">Ambidiestro</option>
                        </Select>
                        <Select label="Cirugía (Qx)" name="qx" value={formData.anamnesis.qx} onChange={handleAnamnesisChange}>
                           <option value="">Seleccionar</option><option value="si">Sí</option><option value="no">No</option>
                        </Select>
                        <Input label="Osteosíntesis" name="osteosintesis1Tipo" value={formData.anamnesis.osteosintesis1Tipo} onChange={handleAnamnesisChange} disabled={formData.anamnesis.qx !== 'si'} placeholder="Tipo de material (si aplica)"/>
                        
                        <Select label="Inmovilización" name="inmovilizacion" value={formData.anamnesis.inmovilizacion} onChange={handleAnamnesisChange}>
                            <option value="">Seleccionar</option>
                            <option value="si">Sí</option>
                            <option value="no">No</option>
                        </Select>
                        <Input label="Tipo de Inmovilización" name="inmovilizacion1Tipo" value={formData.anamnesis.inmovilizacion1Tipo} onChange={handleAnamnesisChange} disabled={formData.anamnesis.inmovilizacion !== 'si'} placeholder="Ej: Yeso, Férula"/>
                        <Input label="Tiempo de Inmovilización" name="inmovilizacion1Periodo" value={formData.anamnesis.inmovilizacion1Periodo} onChange={handleAnamnesisChange} disabled={formData.anamnesis.inmovilizacion !== 'si'} placeholder="Ej: 4 semanas"/>
                        
                        <Select label="Diabetes" name="diabetes" value={formData.anamnesis.diabetes} onChange={handleAnamnesisChange}>
                           <option value="">Seleccionar</option><option value="si">Sí</option><option value="no">No</option>
                        </Select>
                         <Select label="Tabaquismo" name="tabaquismo" value={formData.anamnesis.tabaquismo} onChange={handleAnamnesisChange}>
                           <option value="">Seleccionar</option><option value="si">Sí</option><option value="no">No</option>
                        </Select>
                        <Select label="Osteoporosis/Osteopenia" name="osteopeniaOsteoporosis" value={formData.anamnesis.osteopeniaOsteoporosis} onChange={handleAnamnesisChange}>
                           <option value="">Seleccionar</option><option value="si">Sí</option><option value="no">No</option>
                        </Select>
                        <Select label="Menopausia" name="menopausia" value={formData.anamnesis.menopausia} onChange={handleAnamnesisChange}>
                           <option value="">Seleccionar</option><option value="si">Sí</option><option value="no">No</option>
                        </Select>
                        <Select label="¿DMO?" name="dmo" value={formData.anamnesis.dmo} onChange={handleAnamnesisChange}>
                           <option value="">Seleccionar</option><option value="si">Sí</option><option value="no">No</option>
                        </Select>
                        <Input label="Última DMO" name="ultimaDmo" type="date" value={formData.anamnesis.ultimaDmo} onChange={handleAnamnesisChange} disabled={formData.anamnesis.dmo !== 'si'}/>
                        <Select label="Caídas Frecuentes" name="caidasFrecuentes" value={formData.anamnesis.caidasFrecuentes} onChange={handleAnamnesisChange}>
                           <option value="">Seleccionar</option><option value="si">Sí</option><option value="no">No</option>
                        </Select>
                        <Input label="Nº caídas (6 meses)" name="caidas6meses" type="number" min="0" value={formData.anamnesis.caidas6meses} onChange={handleAnamnesisChange} disabled={formData.anamnesis.caidasFrecuentes !== 'si'} />
                    </div>
                );
            case 'exam':
                 return (
                     <div className="space-y-6">
                        <Textarea label="Inspección" name="inspeccion" value={formData.physicalExam.inspeccion} onChange={handlePhysicalExamChange} />
                        <Textarea label="Palpación" name="palpacion" value={formData.physicalExam.palpacion} onChange={handlePhysicalExamChange} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <Input label="Medida en 8 (Edema)" name="medidas.figuraEn8" value={formData.physicalExam.medidas.figuraEn8} onChange={handlePhysicalExamChange} placeholder="cm" />
                           <Input label="Test de Kapandji" name="testKapandji" value={formData.physicalExam.testKapandji} onChange={handlePhysicalExamChange} placeholder="/10" />
                        </div>
                        <fieldset className="border p-4 rounded-md">
                           <legend className="text-md font-medium px-2 text-slate-800">Goniometría (°)</legend>
                           <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                             <Input label="Flexión" name="goniometria.flexion" value={formData.physicalExam.goniometria.flexion} onChange={handlePhysicalExamChange}/>
                             <Input label="Extensión" name="goniometria.extension" value={formData.physicalExam.goniometria.extension} onChange={handlePhysicalExamChange}/>
                             <Input label="Desv. Radial" name="goniometria.inclinacionRadial" value={formData.physicalExam.goniometria.inclinacionRadial} onChange={handlePhysicalExamChange}/>
                             <Input label="Desv. Cubital" name="goniometria.inclinacionCubital" value={formData.physicalExam.goniometria.inclinacionCubital} onChange={handlePhysicalExamChange}/>
                             <Input label="Supinación" name="goniometria.supinacion" value={formData.physicalExam.goniometria.supinacion} onChange={handlePhysicalExamChange}/>
                             <Input label="Pronación" name="goniometria.pronacion" value={formData.physicalExam.goniometria.pronacion} onChange={handlePhysicalExamChange}/>
                           </div>
                        </fieldset>
                     </div>
                 );
            case 'radiology':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* Left Column: Interactive Area */}
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="radiograph-upload" className="block text-sm font-medium text-slate-700">Subir imagen de radiografía</label>
                                <input id="radiograph-upload" type="file" accept="image/*" onChange={handleImageUpload} className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                            </div>
                            {formData.radiology.imageBase64 && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div>
                                        <h3 className="font-semibold text-slate-800">Vista Previa</h3>
                                        <img src={formData.radiology.imageBase64} alt="Radiografía" className="mt-2 rounded-lg border border-slate-300 w-full object-contain" />
                                    </div>
                                    <div className="space-y-4">
                                         <button onClick={handleInterpretImage} disabled={isLoadingRadiology}  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                                            {isLoadingRadiology ? <><LoaderIcon /> Analizando...</> : <><SparklesIcon /> Interpretar con IA</>}
                                         </button>
                                         <Textarea label="Interpretación de IA (Editable)" value={formData.radiology.interpretation} onChange={(e) => setFormData(prev => ({...prev, radiology: {...prev.radiology, interpretation: e.target.value}}))} rows={10} disabled={isLoadingRadiology} />
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Right Column: Reference Image */}
                        <div className="lg:sticky lg:top-24">
                             <h3 className="text-lg font-semibold text-slate-800 mb-2">Guía de Clasificación AO</h3>
                             <p className="text-sm text-slate-500 mb-4">Referencia para fracturas de radio distal.</p>
                             <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                                <img src="https://i.imgur.com/jj36j4Q.png" alt="Guía de Clasificación AO para fracturas" className="rounded-md w-full" />
                             </div>
                        </div>
                    </div>
                );
            case 'scales':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {[
                          {name: "dolorNocturnoSeveridad", label: "Dolor Nocturno - Severidad (0-10)"},
                          {name: "dolorDiurnoFrecuencia", label: "Dolor Diurno - Frecuencia (0-10)"},
                          {name: "entumecimiento", label: "Entumecimiento (0-10)"},
                          {name: "debilidad", label: "Debilidad (0-10)"},
                          {name: "hormigueo", label: "Hormigueo (0-10)"},
                          {name: "dificultadAgarre", label: "Dificultad Agarre (0-10)"}
                        ].map(({name, label}) => (
                           <Input key={name} label={label} name={name} type="number" min="0" max="10" 
                           // @ts-ignore
                           value={formData.scales[name]} onChange={handleScalesChange} />
                        ))}
                        <div>
                            <Input label="Get up and Go Test (TUG)" name="tugTest" value={formData.scales.tugTest} onChange={handleScalesChange} placeholder="segs." />
                            <p className="mt-1 text-xs text-slate-500">* &gt;20s implica riesgo de caídas</p>
                        </div>
                    </div>
                );
            case 'summary':
                return (
                    <div className="flex flex-col gap-8 items-center pt-4">
                        <div className="text-center">
                            <p className="text-slate-600 max-w-xl">
                                La ficha está lista para ser guardada. Opcionalmente, puede generar un análisis con IA antes de finalizar.
                            </p>
                        </div>
                        
                        <div className="w-full max-w-sm flex flex-col items-center gap-4">
                            <button
                                onClick={handleGenerateSummary}
                                disabled={isLoadingAI || isSaving || !isFiliatoriosComplete}
                                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoadingAI ? <><LoaderIcon /> Generando...</> : <><SparklesIcon /> Generar Análisis con IA (Opcional)</>}
                            </button>
                            
                            <button
                                onClick={handleSave}
                                disabled={isSaving || isLoadingAI || !isFiliatoriosComplete}
                                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50"
                            >
                                {isSaving ? <><LoaderIcon /> Guardando...</> : "Guardar y Crear Nueva Ficha"}
                            </button>
                        </div>

                        {summary && (
                            <div className="w-full mt-4 bg-slate-50 p-4 rounded-lg border animate-fadeIn">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Resumen y Análisis (Editable)</label>
                                <textarea
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-slate-800 text-slate-100 font-mono border border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[300px] whitespace-pre-wrap"
                                />
                            </div>
                        )}
                    </div>
                );
            default:
                return <div>Paso no encontrado</div>;
        }
    };
    
    return (
        <div className="animate-fadeIn space-y-8">
            <div className="flex justify-start mb-4">
                <button
                    onClick={handleGenerateTestData}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-slate-400 text-sm font-medium rounded-md text-slate-600 bg-slate-50 hover:bg-slate-100 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                >
                    <SparklesIcon className="text-amber-500" />
                    Generar Paciente de Prueba
                </button>
            </div>
            {/* Progress Bar */}
            <div>
                <ol className="flex items-center w-full">
                    {STEPS.map((step, index) => (
                        <li key={step.id} className={`flex w-full items-center ${index < STEPS.length - 1 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block" : ""} ${index <= currentStep ? 'text-blue-600 after:border-blue-100' : 'text-slate-500 after:border-slate-100'}`}>
                            <span className={`flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0 ${index <= currentStep ? 'bg-blue-100' : 'bg-slate-100'}`}>
                               <span className="font-bold">{index + 1}</span>
                            </span>
                        </li>
                    ))}
                </ol>
            </div>

            {/* Form Content */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200/80">
                <div className="flex items-center gap-4 mb-2">
                    {STEPS[currentStep].id === 'filiatorios' && (
                        <img 
                            src="https://i.imgur.com/iRvnLDt.jpeg" 
                            alt="Icono de datos filiatorios" 
                            className="w-12 h-12 object-cover rounded-md"
                        />
                    )}
                     {STEPS[currentStep].id === 'radiology' && (
                        <img 
                            src="https://i.imgur.com/JOFa2g1.jpeg" 
                            alt="Icono de Radiografías"
                            className="w-12 h-12 object-cover rounded-md"
                        />
                    )}
                    <h2 className="text-2xl font-bold text-slate-800">{STEPS[currentStep].name}</h2>
                </div>
                <p className="text-slate-500 mb-6">Complete la información para este paso.</p>
                <div className="mt-4">
                  {renderStepContent()}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
                <button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="inline-flex items-center gap-1 px-4 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    <ChevronLeftIcon />
                    Anterior
                </button>
                {currentStep < STEPS.length - 1 && (
                    <button
                        onClick={nextStep}
                        disabled={!isFiliatoriosComplete}
                        className="inline-flex items-center gap-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        Siguiente
                        <ChevronRightIcon />
                    </button>
                )}
            </div>
        </div>
    );
};

export default FormPage;