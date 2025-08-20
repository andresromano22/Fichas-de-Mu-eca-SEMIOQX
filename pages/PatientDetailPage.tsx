import React, { useEffect, useState, useRef } from 'react';
import { getPatientDetails, updateCIFProfile } from '../services/db';
import { Patient, CIFProfile } from '../types';
import { ChevronLeftIcon, FileDownIcon, LoaderIcon, SparklesIcon } from '../components/IconComponents';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { generateCIFProfile } from '../services/ai';

interface PatientDetailPageProps {
    patientId: string;
    onBack: () => void;
}

const DetailItem: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
    value ? <p className="text-sm"><strong className="font-medium text-slate-600">{label}:</strong> <span className="text-slate-900">{value}</span></p> : null
);

const CIFProfileDisplay: React.FC<{ profile: CIFProfile }> = ({ profile }) => (
    <div className="space-y-4 text-sm">
        {profile.funciones_estructuras?.length > 0 && (
            <div>
                <h5 className="font-medium text-slate-600">Funciones y Estructuras Corporales</h5>
                <table className="mt-1 w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b">
                            <th className="py-2 pr-2 font-semibold text-slate-700">Código</th>
                            <th className="py-2 px-2 font-semibold text-slate-700">Descripción</th>
                            <th className="py-2 pl-2 font-semibold text-slate-700 text-right">Calificador</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profile.funciones_estructuras.map((item, i) => (
                            <tr key={i} className="border-b border-slate-100">
                                <td className="py-2 pr-2 font-mono text-xs text-slate-800">{item.codigo}</td>
                                <td className="py-2 px-2 text-slate-800">{item.descripcion}</td>
                                <td className="py-2 pl-2 text-right font-medium text-slate-800">{item.calificador.toString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
        {profile.actividad_participacion?.length > 0 && (
            <div>
                <h5 className="font-medium text-slate-600">Actividad y Participación</h5>
                <table className="mt-1 w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b">
                            <th className="py-2 pr-2 font-semibold text-slate-700">Código</th>
                            <th className="py-2 px-2 font-semibold text-slate-700">Descripción</th>
                            <th className="py-2 pl-2 font-semibold text-slate-700 text-right">Calificador</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profile.actividad_participacion.map((item, i) => (
                            <tr key={i} className="border-b border-slate-100">
                                <td className="py-2 pr-2 font-mono text-xs text-slate-800">{item.codigo}</td>
                                <td className="py-2 px-2 text-slate-800">{item.descripcion}</td>
                                <td className="py-2 pl-2 text-right font-medium text-slate-800">{item.calificador.toString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
        {profile.factores_ambientales?.length > 0 && (
            <div>
                <h5 className="font-medium text-slate-600">Factores Ambientales</h5>
                <table className="mt-1 w-full text-left border-collapse">
                     <thead>
                        <tr className="border-b">
                            <th className="py-2 pr-2 font-semibold text-slate-700">Código</th>
                            <th className="py-2 px-2 font-semibold text-slate-700">Descripción</th>
                            <th className="py-2 pl-2 font-semibold text-slate-700 text-right">Calificador</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profile.factores_ambientales.map((item, i) => (
                            <tr key={i} className="border-b border-slate-100">
                                <td className="py-2 pr-2 font-mono text-xs text-slate-800">{item.codigo}</td>
                                <td className="py-2 px-2 text-slate-800">{item.descripcion}</td>
                                <td className={`py-2 pl-2 text-right font-medium ${item.calificador.toString().startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{item.calificador.toString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
        {profile.factores_personales && (
            <div>
                <h5 className="font-medium text-slate-600">Factores Personales</h5>
                <p className="mt-1 text-slate-900 bg-slate-50 p-3 rounded-md border">{profile.factores_personales}</p>
            </div>
        )}
    </div>
);

const safeToLocaleDate = (dateString?: string | null): string => {
  if (!dateString) return '';
  // Handles both ISO strings with 'T' and plain 'YYYY-MM-DD' dates
  const date = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00`);
  if (isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};


const PatientDetailPage: React.FC<PatientDetailPageProps> = ({ patientId, onBack }) => {
    const [patient, setPatient] = useState<Patient | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPrinting, setIsPrinting] = useState(false);
    const [cifLoadingRecordId, setCifLoadingRecordId] = useState<number | null>(null);
    const printRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const loadPatient = async () => {
            setIsLoading(true);
            try {
                const details = await getPatientDetails(patientId);
                // @ts-ignore
                setPatient(details);
            } catch (error) {
                console.error("Failed to load patient details:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadPatient();
    }, [patientId]);

    const handleGenerateCIF = async (recordId: number) => {
        if (!patient) return;
        setCifLoadingRecordId(recordId);
        const record = patient.clinicalRecords.find(r => r.id === recordId);
        if (record) {
            try {
                const profile = await generateCIFProfile(record, patient);
                if (profile) {
                    await updateCIFProfile(recordId, profile);
                    setPatient(prevPatient => {
                        if (!prevPatient) return null;
                        const updatedRecords = prevPatient.clinicalRecords.map(r =>
                            r.id === recordId ? { ...r, cifProfile: profile } : r
                        );
                        return { ...prevPatient, clinicalRecords: updatedRecords };
                    });
                } else {
                     alert("La IA no pudo generar un perfil CIF con los datos proporcionados.");
                }
            } catch (error) {
                console.error("Error generating CIF profile:", error);
                alert("Hubo un error al generar el perfil CIF. Por favor, intente de nuevo.");
            }
        }
        setCifLoadingRecordId(null);
    };

    const handleDownloadPdf = async () => {
        const element = printRef.current;
        if (!element || !patient) return;

        setIsPrinting(true);
        const canvas = await html2canvas(element, {
             scale: 2, 
             useCORS: true,
             logging: false,
        });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / imgHeight;
        const widthInPdf = pdfWidth - 20; // with margin
        const heightInPdf = widthInPdf / ratio;

        let position = 0;
        let remainingHeight = imgHeight * (widthInPdf / imgWidth);

        pdf.addImage(imgData, 'PNG', 10, 10, widthInPdf, heightInPdf);
        remainingHeight -= (pdfHeight - 20);

        while (remainingHeight > 0) {
            position -= (pdfHeight - 20);
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, widthInPdf, heightInPdf);
            remainingHeight -= (pdfHeight - 20);
        }

        pdf.save(`Ficha_${patient.filiatorios.apellido}_${patient.filiatorios.dni}.pdf`);
        setIsPrinting(false);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><LoaderIcon /><span className="ml-4 text-slate-500">Cargando datos del paciente...</span></div>;
    }

    if (!patient) {
        return <div className="text-center py-10">No se encontraron datos para el paciente.</div>;
    }

    return (
        <div className="animate-fadeIn space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-1 px-4 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50"
                >
                    <ChevronLeftIcon />
                    Volver al Historial
                </button>
                 <button
                    onClick={handleDownloadPdf}
                    disabled={isPrinting}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                    {isPrinting ? <LoaderIcon /> : <FileDownIcon />}
                    {isPrinting ? 'Generando PDF...' : 'Descargar como PDF'}
                </button>
            </div>

            <div ref={printRef} className="p-4 sm:p-0">
                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200/80">
                    <h1 className="text-3xl font-bold text-slate-900">{patient.filiatorios.nombre} {patient.filiatorios.apellido}</h1>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2">
                        <DetailItem label="DNI" value={patient.filiatorios.dni} />
                        <DetailItem label="Edad" value={patient.filiatorios.edad} />
                        <DetailItem label="Teléfono" value={patient.filiatorios.telefono} />
                        <DetailItem label="Actividad" value={patient.filiatorios.actividadesActuales} />
                    </div>
                </div>

                <div className="mt-6 space-y-6">
                    <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-blue-200 pb-2">Registros Clínicos</h2>
                    {patient.clinicalRecords.map((record, index) => (
                        <details key={record.id} className="bg-white rounded-xl shadow-md border border-slate-200/80 overflow-hidden" open={index === 0}>
                            <summary className="px-6 py-4 font-semibold text-lg text-slate-800 cursor-pointer hover:bg-slate-50 flex justify-between items-center">
                                Ficha del {safeToLocaleDate(record.createdAt)}
                                <span className="text-sm text-blue-600 group-open:hidden">Expandir</span>
                            </summary>
                            <div className="px-6 pb-6 pt-2 border-t border-slate-200 space-y-6">
                                <div>
                                    <h3 className="font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-md inline-block mb-3">Resumen y Análisis de IA</h3>
                                    <p className="text-slate-100 bg-slate-800 whitespace-pre-wrap font-mono text-sm p-4 rounded-lg border">{record.summary}</p>
                                </div>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                                    <div>
                                        <h4 className="font-semibold text-slate-700 mb-2">Anamnesis</h4>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                          <DetailItem label="Dx. Médico" value={record.anamnesis?.diagnosticoMedico} />
                                          <DetailItem label="Causa Lesión" value={record.anamnesis?.causaFractura} />
                                          <DetailItem label="Fecha Lesión" value={safeToLocaleDate(record.anamnesis?.fechaFractura)} />
                                          <DetailItem label="At. Médica" value={safeToLocaleDate(record.anamnesis?.fechaAtencionMedica)} />
                                          <DetailItem label="At. Kinésica" value={safeToLocaleDate(record.anamnesis?.fechaAtencionKinesica)} />
                                          <DetailItem label="Dominancia" value={record.anamnesis?.dominancia} />
                                          <DetailItem label="Cirugía" value={record.anamnesis?.qx === 'si' ? 'Sí' : record.anamnesis?.qx === 'no' ? 'No' : ''} />
                                          <DetailItem label="Osteosíntesis" value={record.anamnesis?.osteosintesis1Tipo} />
                                          <DetailItem label="Inmovilización" value={record.anamnesis?.inmovilizacion === 'si' ? 'Sí' : record.anamnesis?.inmovilizacion === 'no' ? 'No' : ''} />
                                          <DetailItem label="Tipo Inmovilización" value={record.anamnesis?.inmovilizacion1Tipo} />
                                          <DetailItem label="Tiempo Inmovilización" value={record.anamnesis?.inmovilizacion1Periodo} />
                                          <DetailItem label="Tabaquismo" value={record.anamnesis?.tabaquismo === 'si' ? 'Sí' : record.anamnesis?.tabaquismo === 'no' ? 'No' : ''} />
                                          <DetailItem label="Menopausia" value={record.anamnesis?.menopausia === 'si' ? 'Sí' : record.anamnesis?.menopausia === 'no' ? 'No' : ''} />
                                          <DetailItem label="Osteoporosis/penia" value={record.anamnesis?.osteopeniaOsteoporosis === 'si' ? 'Sí' : record.anamnesis?.osteopeniaOsteoporosis === 'no' ? 'No' : ''} />
                                          <DetailItem label="DMO" value={record.anamnesis?.dmo === 'si' ? 'Sí' : record.anamnesis?.dmo === 'no' ? 'No' : ''} />
                                          <DetailItem label="Última DMO" value={safeToLocaleDate(record.anamnesis?.ultimaDmo)} />
                                          <DetailItem label="Caídas Frecuentes" value={record.anamnesis?.caidasFrecuentes === 'si' ? 'Sí' : record.anamnesis?.caidasFrecuentes === 'no' ? 'No' : ''} />
                                          <DetailItem label="Nº Caídas (6m)" value={record.anamnesis?.caidas6meses} />
                                        </div>
                                    </div>
                                     <div>
                                        <h4 className="font-semibold text-slate-700 mb-2">Examen Físico y Escalas</h4>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                          <DetailItem label="Medida en 8" value={record.physicalExam?.medidas?.figuraEn8 ? `${record.physicalExam.medidas.figuraEn8} cm` : ''} />
                                          <DetailItem label="Kapandji" value={record.physicalExam?.testKapandji ? `${record.physicalExam.testKapandji}/10` : ''} />
                                          <DetailItem label="Flexión" value={record.physicalExam?.goniometria?.flexion ? `${record.physicalExam.goniometria.flexion}°` : ''} />
                                          <DetailItem label="Extensión" value={record.physicalExam?.goniometria?.extension ? `${record.physicalExam.goniometria.extension}°` : ''} />
                                          <DetailItem label="TUG Test" value={record.scales?.tugTest ? `${record.scales.tugTest} segs` : ''} />
                                        </div>
                                    </div>
                                </div>
                                {record.radiology && record.radiology.imageBase64 && (
                                    <div>
                                        <h4 className="font-semibold text-slate-700 mt-4 mb-2">Radiografía</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                            <img src={record.radiology.imageBase64} alt="Radiografía del paciente" className="rounded-lg border border-slate-200 w-full" />
                                            <div>
                                                <h5 className="font-medium text-slate-600 text-sm">Interpretación de IA</h5>
                                                <p className="text-slate-900 whitespace-pre-wrap font-sans bg-slate-50 p-3 mt-1 rounded-lg border text-sm">{record.radiology.interpretation}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="mt-6">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-md inline-block">Perfil CIF</h3>
                                        <button
                                            onClick={() => handleGenerateCIF(record.id)}
                                            disabled={cifLoadingRecordId === record.id}
                                            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                                        >
                                            {cifLoadingRecordId === record.id ? <LoaderIcon /> : <SparklesIcon />}
                                            {cifLoadingRecordId === record.id ? 'Generando...' : (record.cifProfile ? 'Regenerar Perfil' : 'Generar Perfil con IA')}
                                        </button>
                                    </div>
                                    {record.cifProfile ? (
                                        <div className="mt-2 animate-fadeIn">
                                            <CIFProfileDisplay profile={record.cifProfile} />
                                        </div>
                                    ) : (
                                       cifLoadingRecordId !== record.id && <p className="text-sm text-slate-500 mt-2">Aún no se ha generado un perfil CIF para este registro.</p>
                                    )}
                                </div>
                            </div>
                        </details>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PatientDetailPage;