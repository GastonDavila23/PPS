import React from 'react';
import {
    MapFill,
    GeoAltFill,
    Building,
    X,
    Calendar3,
    ArrowRightCircleFill
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-800">

            {/* MODAL CUADRADO: */}
            <div
                className="relative w-[70vw] h-[70vh] bg-white flex flex-col border border-slate-200 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* BOTÓN CERRAR */}
                <button onClick={onHide} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-blue-600 transition-colors z-[110]">
                    <X size={32} />
                </button>

                {/* CONTENEDOR INTERIOR */}
                <div className="bg-slate-50 h-full w-full flex flex-col p-8 justify-between overflow-hidden">

                    {/* 1. HEADER*/}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-5 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                                <MapFill size={20} />
                            </div>
                            <div className="flex flex-col leading-tight">
                                <span className="bg-blue-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest w-fit">Ficha Técnica</span>
                                <h2 className="text-xl font-black text-slate-800 tracking-tighter uppercase mt-1">Validación Territorial</h2>
                            </div>
                        </div>

                        {/* GRUPO DE BADGES*/}
                        <div className="flex items-center bg-slate-900 rounded-xl border border-slate-800 overflow-hidden mr-12 h-10">
                            {/* SECCIÓN 1: DISTANCIA */}
                            <div className="flex items-center justify-center gap-2 px-6 h-full border-r border-slate-800 min-w-[140px]">
                                <GeoAltFill className="text-blue-500" size={13} />
                                <p className="text-[10px] font-black text-white uppercase tracking-widest m-0 leading-none">
                                    {(data.Distancia_KM || 0).toFixed(2)}
                                    <span className="text-blue-500 ml-1">KM</span>
                                </p>
                            </div>
                            {/* SECCIÓN 2: FECHA */}
                            <div className="flex items-center justify-center gap-2 px-6 h-full border-r border-slate-800 min-w-[140px]">
                                <Calendar3 className="text-slate-500" size={13} />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest m-0 leading-none">
                                    28 FEB 2026
                                </p>
                            </div>
                            {/* SECCIÓN 3: JURISDICCIÓN */}
                            <div className="flex items-center justify-center gap-2 px-6 h-full min-w-[140px]">
                                <Building className="text-slate-500" size={13} />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest m-0 leading-none">
                                    DGE · MENDOZA
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 2. CUERPO CENTRAL */}
                    <div className="flex-1 flex items-center gap-0 py-6 overflow-hidden relative">
                        
                        {/* FLECHA DIVISORIA CENTRAL */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-2">
                           <div className="w-px h-24 bg-gradient-to-b from-transparent via-slate-200 to-transparent"></div>
                           <ArrowRightCircleFill className="text-blue-100 bg-white rounded-full" size={40} />
                           <div className="w-px h-24 bg-gradient-to-b from-transparent via-slate-200 to-transparent"></div>
                        </div>

                        {/* BLOQUE ORIGEN */}
                        <div className="flex-1 bg-white p-10 pr-16 h-full flex flex-col justify-between border-r border-slate-100">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-[0.2em] w-fit mb-4 italic">Punto de Origen</span>
                                <h3 className="text-3xl font-black text-slate-800 leading-tight uppercase tracking-tighter mb-8">
                                    {data.origen_Nombre_Escuela}
                                </h3>
                            </div>

                            <div className="flex flex-col gap-6">
                                {/* Datos Agrupados Superior */}
                                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Departamento</span>
                                        <span className="text-xs font-black text-slate-700 uppercase">{data.origen_Departamento}</span>
                                    </div>
                                    <div className="h-8 w-px bg-slate-200"></div>
                                    <div className="flex flex-col text-right">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">CUE / Anexo</span>
                                        <span className="text-xs font-mono font-bold text-slate-500">{data.origen_CUE} / {data.origen_Numero_Anexo}</span>
                                    </div>
                                </div>

                                {/* Datos Agrupados Inferior (Badge de Traspaso) */}
                                <div className="bg-slate-900 rounded-2xl p-4 flex items-center justify-between border border-slate-800">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Nº Escuela</span>
                                        <span className="text-sm font-black text-white uppercase">{data.origen_Numero_Escuela}</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center px-3 border-l border-slate-700">
                                            <span className="text-[8px] font-black text-blue-500 uppercase mb-1">Turno</span>
                                            <span className="text-[10px] font-black text-slate-300 uppercase leading-none">{data.origen_Turno}</span>
                                        </div>
                                        <div className="flex flex-col items-center px-3 border-l border-slate-700">
                                            <span className="text-[8px] font-black text-blue-500 uppercase mb-1">Div</span>
                                            <span className="text-[10px] font-black text-slate-300 uppercase leading-none">{data.origen_Division}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BLOQUE DESTINO */}
                        <div className={`flex-1 p-10 pl-16 h-full flex flex-col justify-between ${isNoAsignada ? 'bg-slate-50/50 italic' : 'bg-white'}`}>
                            <div className="flex flex-col">
                                <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] w-fit mb-4 ${isNoAsignada ? 'bg-slate-200 text-slate-400' : 'bg-indigo-50 text-indigo-600'}`}>Punto de Destino</span>
                                <h3 className={`text-3xl font-black leading-tight uppercase tracking-tighter mb-8 ${isNoAsignada ? 'text-slate-300 italic' : 'text-slate-800'}`}>
                                    {isNoAsignada ? 'Cargo pendiente de asignación' : data.destino_Nombre_Escuela}
                                </h3>
                            </div>

                            <div className="flex flex-col gap-6">
                                {/* Datos Agrupados Superior */}
                                <div className={`flex items-center justify-between p-4 rounded-2xl border ${isNoAsignada ? 'bg-slate-100/50 border-slate-200' : 'bg-slate-50 border-slate-100'}`}>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Departamento</span>
                                        <span className={`text-xs font-black uppercase ${isNoAsignada ? 'text-slate-300' : 'text-slate-700'}`}>{isNoAsignada ? '---' : data.destino_Departamento}</span>
                                    </div>
                                    <div className="h-8 w-px bg-slate-200"></div>
                                    <div className="flex flex-col text-right">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">CUE / Anexo</span>
                                        <span className={`text-xs font-mono font-bold ${isNoAsignada ? 'text-slate-200' : 'text-slate-500'}`}>{isNoAsignada ? '---' : `${data.destino_CUE} / ${data.destino_Numero_Anexo}`}</span>
                                    </div>
                                </div>

                                {/* Datos Agrupados Inferior */}
                                <div className={`rounded-2xl p-4 flex items-center justify-between border ${isNoAsignada ? 'bg-slate-100 border-slate-200 opacity-50' : 'bg-indigo-900 border-indigo-800'}`}>
                                    <div className="flex flex-col">
                                        <span className={`text-[8px] font-black uppercase tracking-widest mb-1 ${isNoAsignada ? 'text-slate-300' : 'text-indigo-400'}`}>Nº Escuela</span>
                                        <span className={`text-sm font-black uppercase ${isNoAsignada ? 'text-slate-400' : 'text-white'}`}>{isNoAsignada ? '---' : `${data.destino_Numero_Escuela}`}</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className={`flex flex-col items-center px-3 border-l ${isNoAsignada ? 'border-slate-300' : 'border-indigo-700'}`}>
                                            <span className={`text-[8px] font-black uppercase mb-1 ${isNoAsignada ? 'text-slate-300' : 'text-indigo-400'}`}>Turno</span>
                                            <span className={`text-[10px] font-black uppercase leading-none ${isNoAsignada ? 'text-slate-400' : 'text-indigo-100'}`}>{isNoAsignada ? '---' : data.origen_Turno}</span>
                                        </div>
                                        <div className={`flex flex-col items-center px-3 border-l ${isNoAsignada ? 'border-slate-300' : 'border-indigo-700'}`}>
                                            <span className={`text-[8px] font-black uppercase mb-1 ${isNoAsignada ? 'text-slate-300' : 'text-indigo-400'}`}>Div</span>
                                            <span className={`text-[10px] font-black uppercase leading-none ${isNoAsignada ? 'text-slate-400' : 'text-indigo-100'}`}>{isNoAsignada ? '---' : data.destino_Division}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleAsignacionModal;