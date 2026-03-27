import React from 'react';
import {
    MapFill,
    GeoAltFill,
    Building,
    X,
    Calendar3,
    ArrowRight
} from 'react-bootstrap-icons';
import type { IAsignacion } from '../types';

interface Props {
    show: boolean;
    onHide: () => void;
    data: IAsignacion | null;
}

const DetalleAsignacionModal: React.FC<Props> = ({ show, onHide, data }) => {
    if (!show || !data) return null;

    const isNoAsignada = data.Observaciones.startsWith('No Asignada');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-2 sm:p-4 text-slate-800">
            {/* CONTENEDOR PRINCIPAL */}
            <div
                className="relative w-full max-w-4xl bg-white shadow-2xl rounded-lg flex flex-col overflow-hidden max-h-[95vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER COMPACTO */}
                <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50 shrink-0">
                    <div className="flex items-center gap-2">
                        <MapFill className="text-blue-600" size={16} />
                        <h2 className="text-xs font-black uppercase tracking-tighter text-slate-700">
                            Ficha de Validación Territorial
                        </h2>
                    </div>
                    <button onClick={onHide} className="p-1 hover:bg-slate-200 rounded-md transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* CUERPO DEL MODAl*/}
                <div className="p-4 overflow-y-auto">
                    
                    {/* INDICADORES RÁPIDOS (BADGES) */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white rounded-md">
                            <GeoAltFill size={10} />
                            <span className="text-[10px] font-bold uppercase">{(data.Distancia_KM || 0).toFixed(2)} KM</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 rounded-md">
                            <Calendar3 size={10} />
                            <span className="text-[10px] font-bold uppercase">28 FEB 2026</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 rounded-md">
                            <Building size={10} />
                            <span className="text-[10px] font-bold uppercase">DGE MENDOZA</span>
                        </div>
                    </div>

                    {/* GRILLA COMPARATIVA */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                        
                        {/* ICONO DE CONEXIÓN */}
                        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-slate-200 rounded-full items-center justify-center z-10 shadow-sm">
                            <ArrowRight className="text-blue-500" />
                        </div>

                        {/* BLOQUE ORIGEN */}
                        <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30">
                            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest block mb-2">Origen</span>
                            <h3 className="text-lg font-black text-slate-800 uppercase mb-4 leading-tight">
                                {data.origen_Nombre_Escuela}
                            </h3>
                            
                            <div className="space-y-2">
                                <div className="flex justify-between border-b border-blue-100 pb-1">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Depto</span>
                                    <span className="text-xs font-black text-slate-700 uppercase">{data.origen_Departamento}</span>
                                </div>
                                <div className="flex justify-between border-b border-blue-100 pb-1">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Nº / CUE</span>
                                    <span className="text-xs font-black text-slate-700">{data.origen_Numero_Escuela} / {data.origen_CUE}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Turno / Div</span>
                                    <span className="text-xs font-black text-slate-700 uppercase">{data.origen_Turno} - {data.origen_Division}</span>
                                </div>
                            </div>
                        </div>

                        {/* BLOQUE DESTINO */}
                        <div className={`p-4 rounded-xl border ${isNoAsignada ? 'border-slate-200 bg-slate-50' : 'border-emerald-100 bg-emerald-50/30'}`}>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Destino</span>
                            <h3 className={`text-lg font-black uppercase mb-4 leading-tight ${isNoAsignada ? 'text-slate-400 italic' : 'text-slate-800'}`}>
                                {isNoAsignada ? 'Sin asignación' : data.destino_Nombre_Escuela}
                            </h3>

                            {!isNoAsignada ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between border-b border-emerald-100 pb-1">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Depto</span>
                                        <span className="text-xs font-black text-slate-700 uppercase">{data.destino_Departamento}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-emerald-100 pb-1">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Nº / CUE</span>
                                        <span className="text-xs font-black text-slate-700">{data.destino_Numero_Escuela} / {data.destino_CUE}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Turno / Div</span>
                                        <span className="text-xs font-black text-slate-700 uppercase">{data.origen_Turno} - {data.destino_Division}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-20 text-slate-300">
                                    <span className="text-[10px] font-bold uppercase italic">Información no disponible</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* FOOTER ACCIÓN */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button 
                        onClick={onHide}
                        className="px-6 py-2 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-slate-700 transition-all"
                    >
                        Cerrar Ficha
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetalleAsignacionModal;