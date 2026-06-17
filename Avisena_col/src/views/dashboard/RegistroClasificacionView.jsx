'use client';

import React, { useState, useEffect } from 'react';

const formatDots = (num) => {
    if (!num) return "";
    let val = num.toString().replace(/\D/g, "");
    return val.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const cleanNum = (str) => {
    if (!str) return 0;
    return parseFloat(str.toString().replace(/\./g, '').replace('$', '').trim()) || 0;
};

const formatCurrency = (val) => new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0
}).format(val);

const initialTableData = {
    C: { hoy: 0, ayer: 0, precio: "" },
    B: { hoy: 0, ayer: 0, precio: "" },
    AAA: { hoy: 0, ayer: 0, precio: "" },
    AA: { hoy: 0, ayer: 0, precio: "" },
    A: { hoy: 0, ayer: 0, precio: "" }
};

export default function ClasificacionView() {
    const [modals, setModals] = useState({
        registro: false,
        exito: false,
        borrado: false,
        detalle: false
    });

    const [step, setStep] = useState(1);
    const [tableData, setTableData] = useState(initialTableData);
    const [generalInfo, setGeneralInfo] = useState({
        fecha: new Date().toISOString().split('T')[0],
        galpon: "",
        responsable: "",
        linea: "",
        observaciones: ""
    });

    const [historial, setHistorial] = useState([]);
    const [filtroGalpon, setFiltroGalpon] = useState("");
    const [selectedRecordIndex, setSelectedRecordIndex] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem('avisena_storage');
        if (saved) setHistorial(JSON.parse(saved));
    }, []);

    useEffect(() => {
        if (historial.length > 0) {
            localStorage.setItem('avisena_storage', JSON.stringify(historial));
        }
    }, [historial]);

    const openModal = (name) => setModals(prev => ({ ...prev, [name]: true }));
    const closeModal = (name) => {
        setModals(prev => ({ ...prev, [name]: false }));
        if (name === 'registro') setStep(1);
    };

    const obtenerSiguienteId = () => {
        if (historial.length === 0) return 1;
        const ultimoId = historial[historial.length - 1].id;
        const num = parseInt(ultimoId.split('-')[1]);
        return isNaN(num) ? historial.length + 1 : num + 1;
    };

    const handleLimpiarFormulario = () => {
        setTableData(initialTableData);
        setGeneralInfo({
            fecha: new Date().toISOString().split('T')[0],
            galpon: "",
            responsable: "",
            linea: "",
            observaciones: ""
        });
        closeModal('registro');
        openModal('borrado');
    };

    const handleTableChange = (tipo, field, value) => {
        setTableData(prev => ({
            ...prev,
            [tipo]: {
                ...prev[tipo],
                [field]: field === 'precio' ? formatDots(value) : (value === "" ? "" : parseInt(value) || 0)
            }
        }));
    };

    const totales = Object.keys(tableData).reduce((acc, key) => {
        const row = tableData[key];
        const hoy = parseInt(row.hoy) || 0;
        const precio = cleanNum(row.precio);
        const sub = hoy * precio;
        acc.panales += hoy;
        acc.dinero += sub;
        return acc;
    }, { panales: 0, dinero: 0 });

    const handleContinuarPaso2 = () => {
        if (totales.panales <= 0) {
            alert('Por favor, ingrese cantidades en la recolección antes de continuar.');
            return;
        }
        setStep(2);
    };

    const handleSave = (e) => {
        e.preventDefault();

        const registro = {
            id: `REC-${String(obtenerSiguienteId()).padStart(3, '0')}`,
            fecha: generalInfo.fecha,
            linea: generalInfo.linea,
            galpon: generalInfo.galpon,
            responsable: generalInfo.responsable,
            total: formatCurrency(totales.dinero),
            panales: totales.panales,
            obs: generalInfo.observaciones || "Sin observaciones",
            detalles: { ...tableData }
        };

        const nuevoHistorial = [...historial, registro];
        setHistorial(nuevoHistorial);
        localStorage.setItem('avisena_storage', JSON.stringify(nuevoHistorial));
        
        closeModal('registro');
        openModal('exito');

        setTableData(initialTableData);
        setGeneralInfo({
            fecha: new Date().toISOString().split('T')[0],
            galpon: "",
            responsable: "",
            linea: "",
            observaciones: ""
        });
        setStep(1);
    };

    const verDetalle = (index) => {
        setSelectedRecordIndex(index);
        openModal('detalle');
    };

    const eliminarRegistro = (index) => {
        if (window.confirm("¿Estás seguro de eliminar este registro permanentemente?")) {
            setHistorial(prev => {
                const copy = [...prev];
                copy.splice(index, 1);
                localStorage.setItem('avisena_storage', JSON.stringify(copy));
                return copy;
            });
            if (selectedRecordIndex === index) closeModal('detalle');
        }
    };

    const handleExportarExcel = () => {
        if (historial.length === 0) {
            alert('No hay datos para exportar.');
            return;
        }
        const encabezados = ["ID", "Fecha", "Linea", "Galpon", "Responsable", "Panales", "Total", "Observaciones"];
        const filas = historial.map(reg => [
            reg.id, reg.fecha, reg.linea, reg.galpon, reg.responsable, reg.panales,
            reg.total.replace(/[$. ]/g, ''), reg.obs.replace(/,/g, " ")
        ].join(","));

        const contenidoCsv = "\ufeff" + [encabezados.join(","), ...filas].join("\n");
        const blob = new Blob([contenidoCsv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Avisena_Produccion_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const historialFiltrado = historial.filter(reg => 
        reg.galpon.toString().includes(filtroGalpon)
    );

    return (
        <div className="min-h-screen bg-slate-50 text-gray-800 antialiased font-sans">
            

            <main className="max-w-6xl mx-auto mt-12 px-6 pb-16 space-y-12">
                {/* BANNER PRINCIPAL */}
                <section className="flex flex-col md:flex-row md:justify-between md:items-center bg-white rounded-2xl p-8 shadow-sm border border-gray-100 gap-6">
                    <header>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Registro de Clasificación de Huevos</h1>
                        <p className="text-gray-500 text-sm mt-1">Control y seguimiento de recolección diaria — Unidad Avícola SENA</p>
                    </header>
                    <button 
                        type="button" 
                        className="bg-[#49e619] hover:bg-[#3cd110] text-slate-950 font-extrabold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 tracking-wide text-sm"
                        onClick={() => openModal('registro')}
                    >
                        <span className="text-lg font-black">+</span> Agregar Nueva Clasificación
                    </button>
                </section>

                {/* SECCIÓN DEL HISTORIAL INTEGRADO */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <header className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h2 className="text-lg font-bold text-slate-900">Historial de Clasificación</h2>
                        <div className="flex items-center gap-3">
                            <input 
                                type="text" 
                                placeholder="Filtrar por galpón..." 
                                value={filtroGalpon}
                                onChange={(e) => setFiltroGalpon(e.target.value)}
                                className="bg-slate-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500 w-48 transition-all"
                            />
                            <button 
                                type="button" 
                                title="Exportar a Excel"
                                className="bg-[#49e619] hover:bg-[#3cd110] text-slate-950 p-2.5 rounded-xl transition-colors shadow-sm"
                                onClick={handleExportarExcel}
                            >
                            📄
                            </button>
                        </div>
                    </header>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs uppercase tracking-wider font-semibold">
                            <thead>
                                <tr className="bg-slate-50 text-gray-400 border-b border-gray-100">
                                    <th className="p-4">ID / Fecha</th>
                                    <th className="p-4">Galpón</th>
                                    <th className="p-4">Línea</th>
                                    <th className="p-4">Panales</th>
                                    <th className="p-4">Total</th>
                                    <th className="p-4">Responsable</th>
                                    <th className="p-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 normal-case font-normal text-sm text-gray-700">
                                {historialFiltrado.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-12 text-gray-400 font-medium">
                                            No se encontraron registros de clasificación.
                                        </td>
                                    </tr>
                                ) : historialFiltrado.map((reg, index) => (
                                    <tr key={index} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="p-4">
                                            <span className="font-bold text-slate-900 block">{reg.id}</span>
                                            <span className="text-xs text-gray-400 block mt-0.5">{reg.fecha}</span>
                                        </td>
                                        <td className="p-4 font-medium text-slate-800">N° {reg.galpon}</td>
                                        <td className="p-4 text-gray-600">{reg.linea}</td>
                                        <td className="p-4 font-bold text-slate-900">{reg.panales} Uds</td>
                                        <td className="p-4 font-bold text-green-600">{reg.total}</td>
                                        <td className="p-4 text-gray-500">{reg.responsable}</td>
                                        <td className="p-4">
                                            <div className="flex justify-center gap-2">
                                                <button type="button" className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-lg transition-colors" title="Ver Detalle" onClick={() => verDetalle(index)}>👁️</button>
                                                <button type="button" className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors" title="Eliminar" onClick={() => eliminarRegistro(index)}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <footer className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-medium">
                        <span>Registro de clasificación</span>
                        <div className="flex gap-2">
                            <button type="button" className="bg-[#49e619] text-slate-950 font-bold px-3 py-1.5 rounded-lg hover:bg-[#3cd110] transition-colors disabled:opacity-50">Anterior</button>
                            <span className="bg-[#49e619] text-slate-950 font-bold w-8 h-8 flex items-center justify-center rounded-lg">1</span>
                            <button type="button" className="bg-[#49e619] text-slate-950 font-bold px-3 py-1.5 rounded-lg hover:bg-[#3cd110] transition-colors disabled:opacity-50">Siguiente</button>
                        </div>
                    </footer>
                </section>

                {/* MODAL DE REGISTRO */}
                {modals.registro && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <article className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <header className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
                                <h2 className="text-lg font-bold text-gray-900">
                                    {step === 1 ? "1. Clasificación de Huevos" : "2. Información General"}
                                </h2>
                                <button className="text-gray-400 hover:text-gray-600 text-2xl" type="button" onClick={() => closeModal('registro')}>&times;</button>
                            </header>

                            <form onSubmit={step === 2 ? handleSave : (e) => e.preventDefault()} className="p-6">
                                {step === 1 && (
                                    <section>
                                        <div className="overflow-x-auto border border-gray-100 rounded-xl mb-4">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50 text-xs font-semibold text-gray-500 uppercase border-b">
                                                        <th className="p-3">Tipo</th>
                                                        <th className="p-3">Hoy</th>
                                                        <th className="p-3">Ayer</th>
                                                        <th className="p-3">Acum.</th>
                                                        <th className="p-3">Precio</th>
                                                        <th className="p-3 text-right">Subtotal</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 text-sm">
                                                    {Object.keys(tableData).map(tipo => {
                                                        const row = tableData[tipo];
                                                        const hoy = parseInt(row.hoy) || 0;
                                                        const acum = hoy + row.ayer;
                                                        const sub = hoy * cleanNum(row.precio);

                                                        return (
                                                            <tr key={tipo} className="hover:bg-slate-50/50">
                                                                <td className="p-3 font-bold text-gray-700">{tipo}</td>
                                                                <td className="p-3">
                                                                    <input
                                                                        type="number"
                                                                        className="w-20 p-1.5 border border-gray-300 rounded-lg text-center font-semibold"
                                                                        value={row.hoy}
                                                                        min="0"
                                                                        onChange={(e) => handleTableChange(tipo, 'hoy', e.target.value)}
                                                                    />
                                                                </td>
                                                                <td className="p-3"><input type="number" className="w-20 p-1.5 bg-gray-100 border border-transparent rounded-lg text-center text-gray-500" value={row.ayer} readOnly /></td>
                                                                <td className="p-3"><input type="number" className="w-20 p-1.5 bg-gray-100 border border-transparent rounded-lg text-center text-gray-500" value={acum} readOnly /></td>
                                                                <td className="p-3">
                                                                    <input
                                                                        type="text"
                                                                        className="w-24 p-1.5 border border-gray-300 rounded-lg text-center font-semibold"
                                                                        value={row.precio}
                                                                        onChange={(e) => handleTableChange(tipo, 'precio', e.target.value)}
                                                                        placeholder="$ 0"
                                                                    />
                                                                </td>
                                                                <td className="p-3 text-right font-bold text-slate-700">{formatCurrency(sub)}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                        <footer className="flex justify-between items-center bg-green-50/50 rounded-xl p-4 mb-6 border border-green-100">
                                            <p className="text-sm font-medium text-green-800">Pañales Totales: <span className="font-bold text-base">{totales.panales}</span></p>
                                            <p className="text-sm font-medium text-green-800">Valor Total: <span className="font-extrabold text-xl text-green-700">{formatCurrency(totales.dinero)}</span></p>
                                        </footer>
                                        
                                        <button type="button" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-colors" onClick={handleContinuarPaso2}>
                                            CONTINUAR &rarr;
                                        </button>
                                    </section>
                                )}

                                {step === 2 && (
                                    <section>
                                        <fieldset className="grid grid-cols-2 gap-4 border-none p-0 mb-6">
                                            <label className="flex flex-col gap-1">
                                                <span className="text-xs font-bold text-gray-600 uppercase">Consecutivo</span>
                                                <input type="text" value={`REC-${String(obtenerSiguienteId()).padStart(3, '0')}`} readOnly className="p-2.5 bg-gray-100 border rounded-xl font-bold text-green-600 outline-none" />
                                            </label>
                                            <label className="flex flex-col gap-1">
                                                <span className="text-xs font-bold text-gray-600 uppercase">Fecha</span>
                                                <input type="date" value={generalInfo.fecha} onChange={e => setGeneralInfo({ ...generalInfo, fecha: e.target.value })} required className="p-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                                            </label>
                                            <label className="flex flex-col gap-1">
                                                <span className="text-xs font-bold text-gray-600 uppercase">Galpón</span>
                                                <input type="number" value={generalInfo.galpon} onChange={e => setGeneralInfo({ ...generalInfo, galpon: e.target.value })} placeholder="01" required className="p-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                                            </label>
                                            <label className="flex flex-col gap-1">
                                                <span className="text-xs font-bold text-gray-600 uppercase">Responsable</span>
                                                <input type="text" value={generalInfo.responsable} onChange={e => setGeneralInfo({ ...generalInfo, responsable: e.target.value })} placeholder="Nombre Completo" required className="p-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                                            </label>
                                            <label className="flex flex-col gap-1 col-span-2">
                                                <span className="text-xs font-bold text-gray-600 uppercase">Línea</span>
                                                <input list="opciones-lineas" value={generalInfo.linea} onChange={e => setGeneralInfo({ ...generalInfo, linea: e.target.value })} placeholder="Selecciona o escribe la línea" required className="p-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                                                <datalist id="opciones-lineas">
                                                    <option value="Hy-Line Brown" />
                                                    <option value="Isa Brown" />
                                                    <option value="Lohmann Brown" />
                                                    <option value="Babcock" />
                                                    <option value="Dekalb" />
                                                </datalist>
                                            </label>
                                            <label className="flex flex-col gap-1 col-span-2">
                                                <span className="text-xs font-bold text-gray-600 uppercase">Observaciones</span>
                                                <textarea rows="2" value={generalInfo.observaciones} onChange={e => setGeneralInfo({ ...generalInfo, observaciones: e.target.value })} className="p-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none"></textarea>
                                            </label>
                                        </fieldset>
                                        <footer className="flex justify-between items-center border-t pt-4">
                                            <button type="button" className="text-gray-500 hover:text-gray-700 font-bold text-sm" onClick={() => setStep(1)}>&larr; Volver</button>
                                            <div className="flex gap-3">
                                                <button type="button" className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 px-4 rounded-xl transition-colors text-sm" onClick={handleLimpiarFormulario}>
                                                    BORRAR TODO
                                                </button>
                                                <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-md">
                                                    FINALIZAR Y GUARDAR
                                                </button>
                                            </div>
                                        </footer>
                                    </section>
                                )}
                             </form>
                        </article>
                    </div>
                )}

                {/* MODALES STATUS (EXITO/BORRADO) */}
                {modals.exito && (
                    <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center p-4 z-50 animate-fade-in">
                        <article className="text-center text-white max-w-sm flex flex-col items-center">
                            <span className="text-4xl text-green-500 border-4 border-green-500 w-20 h-20 flex items-center justify-center rounded-full font-bold mb-4 animate-bounce">✓</span>
                            <h1 className="text-2xl font-black tracking-wide mb-2">¡REGISTRO EXITOSO!</h1>
                            <button type="button" className="w-full bg-green-500 text-slate-950 font-black py-3 px-8 rounded-xl mt-6 hover:bg-green-400 transition-colors" onClick={() => closeModal('exito')}>CONTINUAR</button>
                        </article>
                    </div>
                )}

                {modals.borrado && (
                    <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center p-4 z-50 animate-fade-in">
                        <article className="text-center text-white max-w-sm flex flex-col items-center">
                            <span className="text-4xl text-red-500 border-4 border-red-500 w-20 h-20 flex items-center justify-center rounded-full font-bold mb-4 animate-bounce">✕</span>
                            <h1 className="text-2xl font-black tracking-wide mb-2">¡FORMULARIO LIMPIADO!</h1>
                            <p className="text-gray-400 text-sm">Los datos actuales han sido borrados de los campos correctamente.</p>
                            <button type="button" className="w-full bg-red-600 text-white font-black py-3 px-8 rounded-xl mt-6 hover:bg-red-500 transition-colors" onClick={() => closeModal('borrado')}>CONTINUAR</button>
                        </article>
                    </div>
                )}

                {/* MODAL DETALLE */}
                {modals.detalle && selectedRecordIndex !== null && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                        <article className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl">
                            <header className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
                                <h2 className="text-lg font-bold text-gray-900">Detalle de Producción</h2>
                                <button className="text-gray-400 hover:text-gray-600 text-2xl" type="button" onClick={() => closeModal('detalle')}>&times;</button>
                            </header>
                            {(() => {
                                const r = historial[selectedRecordIndex];
                                if (!r) return null;
                                return (
                                    <section className="p-6 space-y-5">
                                        <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
                                            <p className="text-gray-500 font-medium">ID: <span className="font-bold text-gray-900 block text-base">{r.id}</span></p>
                                            <p className="text-gray-500 font-medium">FECHA: <span className="font-bold text-gray-900 block text-base">{r.fecha}</span></p>
                                            <p className="text-gray-500 font-medium">LÍNEA: <span className="font-bold text-gray-800 block">{r.linea}</span></p>
                                            <p className="text-gray-500 font-medium">GALPÓN: <span className="font-bold text-gray-800 block">N° {r.galpon}</span></p>
                                            <p className="text-gray-500 font-medium col-span-2">RESPONSABLE: <span className="font-bold text-gray-800 block">{r.responsable}</span></p>
                                        </div>

                                        <div>
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Producción por Tipo</h3>
                                            <div className="bg-slate-50 border border-gray-100 rounded-2xl p-4 grid grid-cols-5 gap-2 text-center">
                                                {r.detalles && Object.keys(r.detalles).map((tipo) => {
                                                    const cantidad = r.detalles[tipo]?.hoy || 0;
                                                    return (
                                                        <div key={tipo} className="bg-white border border-gray-200/60 rounded-xl p-2 shadow-sm">
                                                            <span className="block text-xs font-black text-slate-400 uppercase">{tipo}</span>
                                                            <span className="block text-lg font-extrabold text-slate-800 mt-0.5">{cantidad}</span>
                                                            <span className="block text-[10px] text-gray-400 font-medium">uds</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 bg-green-50/50 border border-green-100 rounded-2xl p-4">
                                            <div>
                                                <span className="block text-xs font-bold text-green-800 uppercase tracking-wide">Pañales Totales</span>
                                                <span className="text-2xl font-black text-green-900">{r.panales} <span className="text-sm font-normal text-green-700">uds</span></span>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-xs font-bold text-green-800 uppercase tracking-wide">Valor Total</span>
                                                <span className="text-2xl font-black text-green-700">{r.total}</span>
                                            </div>
                                        </div>

                                        <blockquote className="bg-gray-50 border-l-4 border-green-500 p-3 rounded-r-xl text-xs italic text-gray-600">
                                            <strong className="block text-gray-700 not-italic font-bold mb-1 uppercase tracking-wider">Observaciones:</strong>
                                            "{r.obs}"
                                        </blockquote>
                                    </section>
                                );
                            })()}
                        </article>
                    </div>
                )}
            </main>
        </div>
    );
}7