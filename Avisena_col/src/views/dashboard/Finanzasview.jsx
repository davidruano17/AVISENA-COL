"use client";

import React, { useState } from "react";

export default function Finanzasview() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 4;

  const [transacciones, setTransacciones] = useState([]);

  const [nuevaTransaccion, setNuevaTransaccion] = useState({
    concepto: "",
    tipo: "Gasto", 
    categoria: "Alimentos", 
    galpon: "Galpón 1", 
    monto: "",
    estado: "Completado",
    cantidadHuevos: "",
    tipoHuevos: "Tipo AA",
    cantidadAlimento: "",
    unidadAlimento: "Bultos (50kg)",
    detalleVeterinario: ""
  });

  const ingresosTotales = transacciones
    .filter(t => t.tipo === "Ingreso")
    .reduce((acc, curr) => acc + curr.monto, 0);

  const gastosTotales = transacciones
    .filter(t => t.tipo === "Gasto")
    .reduce((acc, curr) => acc + curr.monto, 0);

  const utilidadNeta = ingresosTotales - gastosTotales;
  const roiCalculado = gastosTotales > 0 ? ((utilidadNeta / gastosTotales) * 100).toFixed(1) : "0.0";

  const gastoAlimentos = transacciones.filter(t => t.categoria === "Alimentos").reduce((acc, c) => acc + c.monto, 0);
  const gastoSalud = transacciones.filter(t => t.categoria === "Salud/Vet").reduce((acc, c) => acc + c.monto, 0);
  const gastoInfraestructura = transacciones.filter(t => t.categoria === "Infraestructura").reduce((acc, c) => acc + c.monto, 0);
  const ingresoHuevos = transacciones.filter(t => t.categoria === "Venta de Huevos").reduce((acc, c) => acc + c.monto, 0);

  const pctAlimentos = gastosTotales > 0 ? Math.round((gastoAlimentos / gastosTotales) * 100) : 0;
  const pctSalud = gastosTotales > 0 ? Math.round((gastoSalud / gastosTotales) * 100) : 0;
  const pctInfraestructura = gastosTotales > 0 ? Math.round((gastoInfraestructura / gastosTotales) * 100) : 0;
  const pctIngresoHuevos = ingresosTotales > 0 ? Math.round((ingresoHuevos / ingresosTotales) * 100) : 0;

  const baseCalculoBarra = Math.max(ingresosTotales, gastosTotales, 1);
  const alturaMarIngresos = ingresosTotales > 0 ? `${Math.min((ingresosTotales / baseCalculoBarra) * 95, 95)}%` : "5%";
  const alturaMarGastos = gastosTotales > 0 ? `${Math.min((gastosTotales / baseCalculoBarra) * 95, 95)}%` : "5%";
  
  const alturaAbrIngresos = ingresosTotales > 0 ? `${Math.min((ingresosTotales / baseCalculoBarra) * 90, 95)}%` : "5%";
  const alturaAbrGastos = gastosTotales > 0 ? `${Math.min((gastosTotales / baseCalculoBarra) * 85, 95)}%` : "5%";

  const alturaMayIngresos = ingresosTotales > 0 ? `${Math.min((ingresosTotales / baseCalculoBarra) * 100, 95)}%` : "5%"; 
  const alturaMayGastos = gastosTotales > 0 ? `${Math.min((gastosTotales / baseCalculoBarra) * 75, 95)}%` : "5%";

  const transaccionesFiltradas = transacciones.filter(t => 
    t.concepto.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.categoria.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.galpon.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPaginas = Math.ceil(transaccionesFiltradas.length / registrosPorPagina) || 1;
  const registrosPaginados = transaccionesFiltradas.slice((paginaActual - 1) * registrosPorPagina, paginaActual * registrosPorPagina);

  const manejarGuardarRegistro = (e) => {
    e.preventDefault();
    if (!nuevaTransaccion.concepto || !nuevaTransaccion.monto) return;

    let notaInformativa = "";
    if (nuevaTransaccion.categoria === "Venta de Huevos") {
      notaInformativa = `${nuevaTransaccion.cantidadHuevos || 0} cartones [${nuevaTransaccion.tipoHuevos}]`;
    } else if (nuevaTransaccion.categoria === "Alimentos") {
      notaInformativa = `${nuevaTransaccion.cantidadAlimento || 0} ${nuevaTransaccion.unidadAlimento.split(" ")[0].toLowerCase()}`;
    } else if (nuevaTransaccion.categoria === "Salud/Vet") {
      notaInformativa = nuevaTransaccion.detalleVeterinario || "Insumos clínicos / biológicos";
    } else {
      notaInformativa = "Mantenimiento general galpones";
    }

    const coloresCategorias = {
      "Alimentos": "bg-emerald-100 text-emerald-800",
      "Venta de Huevos": "bg-blue-100 text-blue-800",
      "Salud/Vet": "bg-rose-100 text-rose-800",
      "Infraestructura": "bg-amber-100 text-amber-800"
    };

    const coloresEstados = {
      "Completado": "bg-green-100 text-green-800",
      "Pendiente": "bg-gray-100 text-gray-700",
      "Atrasado": "bg-red-100 text-red-800"
    };

    const nuevoItem = {
      id: Date.now(),
      fecha: new Date().toLocaleDateString("es-ES", { day: '2-digit', month: 'short', year: 'numeric' }),
      galpon: nuevaTransaccion.galpon,
      concepto: nuevaTransaccion.concepto,
      categoria: nuevaTransaccion.categoria,
      tipo: nuevaTransaccion.tipo,
      monto: parseFloat(nuevaTransaccion.monto),
      estado: nuevaTransaccion.estado,
      detalle: notaInformativa,
      catStyle: coloresCategorias[nuevaTransaccion.categoria] || "bg-slate-100 text-slate-800",
      estStyle: coloresEstados[nuevaTransaccion.estado]
    };

    setTransacciones([nuevoItem, ...transacciones]);
    setIsModalOpen(false);
    setPaginaActual(1);
    
    setNuevaTransaccion({
      concepto: "", tipo: "Gasto", categoria: "Alimentos", galpon: "Galpón 1", monto: "", estado: "Completado",
      cantidadHuevos: "", tipoHuevos: "Tipo AA", cantidadAlimento: "", unidadAlimento: "Bultos (50kg)", detalleVeterinario: ""
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased">
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        
        <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#0f172a]">Control de Finanzas Avícolas</h2>
            <p className="text-sm text-slate-500">Monitorea ingresos de ventas y costos de producción por lotes de aves.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#39A900] text-white font-bold text-sm rounded-xl shadow-sm hover:bg-[#329300] transition-colors"
          >
            + Registrar Operación
          </button>
        </section>
        
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ingresos de Ventas</span>
            <h4 className="text-2xl font-bold text-slate-900 mt-2">${ingresosTotales.toLocaleString("en-US", { minimumFractionDigits: 2 })}</h4>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gastos Operativos</span>
            <h4 className="text-2xl font-bold text-slate-900 mt-2">${gastosTotales.toLocaleString("en-US", { minimumFractionDigits: 2 })}</h4>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Utilidad Neta</span>
            <h4 className="text-2xl font-bold text-slate-900 mt-2">${utilidadNeta.toLocaleString("en-US", { minimumFractionDigits: 2 })}</h4>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ROI Calculado</span>
            <h4 className="text-2xl font-bold text-slate-900 mt-2">{roiCalculado}%</h4>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <h3 className="text-base font-bold text-slate-900 mb-4">Flujo de Caja Real</h3>
            <div className="h-48 flex items-end justify-around px-2 pb-2 bg-slate-50/60 rounded-xl border border-slate-100/80">
              {[
                { mes: "MAR", h1: alturaMarIngresos, h2: alturaMarGastos },
                { mes: "ABR", h1: alturaAbrIngresos, h2: alturaAbrGastos },
                { mes: "MAY", h1: alturaMayIngresos, h2: alturaMayGastos }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end w-20">
                  <div className="flex gap-2.5 items-end h-full justify-center w-full">
                    <div className="w-7 bg-[#39A900] rounded-t-md transition-all duration-300" style={{ height: item.h1 }}></div>
                    <div className="w-7 bg-cyan-400 rounded-t-md transition-all duration-300" style={{ height: item.h2 }}></div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 tracking-wide mt-1">{item.mes}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between gap-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Distribución de Gastos</h3>
              <p className="text-xs text-slate-400">Calculado dinámicamente desde tus registros</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 my-auto">
              <div className="flex flex-col items-center">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle className="text-slate-100" cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" strokeWidth="6"></circle>
                    <circle className="text-[#39A900]" cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" strokeDasharray="213" strokeDashoffset={213 - (213 * pctAlimentos) / 100} strokeWidth="6" strokeLinecap="round"></circle>
                  </svg>
                  <span className="absolute text-sm font-bold text-slate-900">{pctAlimentos}%</span>
                </div>
                <span className="text-[10px] mt-2 font-bold text-slate-400 uppercase tracking-wider">Alimentos</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle className="text-slate-100" cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" strokeWidth="6"></circle>
                    <circle className="text-[#f43f5e]" cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" strokeDasharray="213" strokeDashoffset={213 - (213 * pctSalud) / 100} strokeWidth="6" strokeLinecap="round"></circle>
                  </svg>
                  <span className="absolute text-sm font-bold text-slate-900">{pctSalud}%</span>
                </div>
                <span className="text-[10px] mt-2 font-bold text-slate-400 uppercase tracking-wider">Salud/Vet</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs">
              <p className="font-bold text-[#39A900]">Viabilidad Financiera:</p>
              <p className="font-medium mt-0.5 text-slate-600">
                {transacciones.length === 0 ? "Sin movimientos registrados" : utilidadNeta >= 0 ? "Flujo de caja Saludable" : "Alerta de Déficit Operativo"}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Distribución de Flujos Detallados</h3>
            <p className="text-xs text-slate-400">Análisis porcentual del capital invertido y devengado en los galpones.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <article className="space-y-2 p-4 bg-slate-50/60 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600 uppercase tracking-wider">Venta de Huevos</span>
                <span className="font-extrabold text-blue-600">{pctIngresoHuevos}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${pctIngresoHuevos}%` }}></div>
              </div>
              <p className="text-right text-xs font-bold text-slate-700">${ingresoHuevos.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            </article>

            <article className="space-y-2 p-4 bg-slate-50/60 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600 uppercase tracking-wider">Alimentos</span>
                <span className="font-extrabold text-[#39A900]">{pctAlimentos}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#39A900] transition-all duration-500" style={{ width: `${pctAlimentos}%` }}></div>
              </div>
              <p className="text-right text-xs font-bold text-slate-700">${gastoAlimentos.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            </article>

            <article className="space-y-2 p-4 bg-slate-50/60 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600 uppercase tracking-wider">Salud y Vacunas</span>
                <span className="font-extrabold text-rose-600">{pctSalud}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${pctSalud}%` }}></div>
              </div>
              <p className="text-right text-xs font-bold text-slate-700">${gastoSalud.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            </article>

            <article className="space-y-2 p-4 bg-slate-50/60 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600 uppercase tracking-wider">Infraestructura</span>
                <span className="font-extrabold text-amber-600">{pctInfraestructura}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${pctInfraestructura}%` }}></div>
              </div>
              <p className="text-right text-xs font-bold text-slate-700">${gastoInfraestructura.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            </article>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-base font-bold text-slate-900">Historial Financiero Avanzado</h3>
            <input 
              type="text"
              className="w-full sm:w-64 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:bg-white transition-all" 
              placeholder="Buscar por concepto o galpón..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPaginaActual(1); }}
            />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 text-[11px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Fecha / Galpón</th>
                  <th className="px-6 py-4">Concepto / Especificación</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4 text-right">Monto</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {registrosPaginados.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-slate-900 font-semibold">{t.fecha}</div>
                      <div className="text-[10px] text-slate-400 font-extrabold uppercase">{t.galpon}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{t.concepto}</div>
                      <div className="text-xs text-slate-400 font-medium">{t.detalle}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-md ${t.catStyle}`}>{t.categoria}</span>
                    </td>
                    <td className={`px-6 py-4 text-right font-extrabold ${t.tipo === 'Ingreso' ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {t.tipo === 'Ingreso' ? '+' : '-'}${t.monto.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md ${t.estStyle}`}>{t.estado}</span>
                    </td>
                  </tr>
                ))}
                {transacciones.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-slate-400 font-medium bg-slate-50/20">
                      No hay registros financieros. Presione el botón superior para ingresar datos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-slate-50/30 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 font-semibold">
            <span>Página {paginaActual} de {totalPaginas}</span>
            <div className="flex gap-1">
              <button onClick={() => setPaginaActual(p => Math.max(p - 1, 1))} disabled={paginaActual === 1} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 font-bold">Anterior</button>
              <button onClick={() => setPaginaActual(p => Math.min(p + 1, totalPaginas))} disabled={paginaActual === totalPaginas} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 font-bold">Siguiente</button>
            </div>
          </div>
        </section>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900">Registrar Operación</h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setNuevaTransaccion({
                    concepto: "", tipo: "Gasto", categoria: "Alimentos", galpon: "Galpón 1", monto: "", estado: "Completado",
                    cantidadHuevos: "", tipoHuevos: "Tipo AA", cantidadAlimento: "", unidadAlimento: "Bultos (50kg)", detalleVeterinario: ""
                  });
                }} 
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={manejarGuardarRegistro} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Concepto de la Operación</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:bg-white transition-all"
                  placeholder={nuevaTransaccion.tipo === "Ingreso" ? "Ej. Venta de Huevos Lote A" : "Ej. Compra Purina Inicial"}
                  value={nuevaTransaccion.concepto}
                  onChange={e => setNuevaTransaccion({...nuevaTransaccion, concepto: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tipo</label>
                  <select 
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:bg-white"
                    value={nuevaTransaccion.tipo}
                    onChange={e => {
                      const tipo = e.target.value;
                      setNuevaTransaccion({
                        ...nuevaTransaccion, 
                        tipo, 
                        categoria: tipo === "Ingreso" ? "Venta de Huevos" : "Alimentos"
                      });
                    }}
                  >
                    <option value="Gasto">Gasto</option>
                    <option value="Ingreso">Ingreso</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Monto ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:bg-white transition-all"
                    placeholder="0.00"
                    value={nuevaTransaccion.monto}
                    onChange={e => setNuevaTransaccion({...nuevaTransaccion, monto: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Categoría</label>
                  <select 
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:bg-white"
                    value={nuevaTransaccion.categoria}
                    onChange={e => setNuevaTransaccion({...nuevaTransaccion, categoria: e.target.value})}
                  >
                    {nuevaTransaccion.tipo === "Gasto" ? (
                      <>
                        <option value="Alimentos">Alimentos</option>
                        <option value="Salud/Vet">Salud</option>
                        <option value="Infraestructura">Infraestructura</option>
                      </>
                    ) : (
                      <option value="Venta de Huevos">Venta de Huevos</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Galpón Relacionado</label>
                  <select 
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:bg-white"
                    value={nuevaTransaccion.galpon}
                    onChange={e => setNuevaTransaccion({...nuevaTransaccion, galpon: e.target.value})}
                  >
                    <option value="Galpón 1">Galpón 1</option>
                    <option value="Galpón 2">Galpón 2</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-3">
                <span className="text-[10px] font-extrabold text-[#39A900] tracking-wider uppercase block">Especificación de Carga</span>
                
                {nuevaTransaccion.categoria === "Venta de Huevos" && (
                  <div className="grid grid-cols-2 gap-2 animate-in fade-in duration-150">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Cant. Cartones</label>
                      <input type="number" placeholder="Ej. 200" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm" value={nuevaTransaccion.cantidadHuevos} onChange={e => setNuevaTransaccion({...nuevaTransaccion, cantidadHuevos: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Clasificación</label>
                      <select className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm" value={nuevaTransaccion.tipoHuevos} onChange={e => setNuevaTransaccion({...nuevaTransaccion, tipoHuevos: e.target.value})}>
                        <option value="Tipo AAA">Tipo AAA</option>
                        <option value="Tipo AA">Tipo AA</option>
                        <option value="Tipo A">Tipo A</option>
                        <option value="Tipo B">Tipo B</option>
                        <option value="Tipo C">Tipo C</option>
                      </select>
                    </div>
                  </div>
                )}

                {nuevaTransaccion.categoria === "Alimentos" && (
                  <div className="grid grid-cols-2 gap-2 animate-in fade-in duration-150">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Cantidad</label>
                      <input type="number" placeholder="Cantidad" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm" value={nuevaTransaccion.cantidadAlimento} onChange={e => setNuevaTransaccion({...nuevaTransaccion, cantidadAlimento: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Medida</label>
                      <select className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm" value={nuevaTransaccion.unidadAlimento} onChange={e => setNuevaTransaccion({...nuevaTransaccion, unidadAlimento: e.target.value})}>
                        <option value="Bultos (50kg)">Bultos (50kg)</option>
                        <option value="Kilos">Kilos</option>
                      </select>
                    </div>
                  </div>
                )}

                {nuevaTransaccion.categoria === "Salud/Vet" && (
                  <div className="animate-in fade-in duration-150">
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Medicamento</label>
                    <input type="text" placeholder="Ej. Lote vacunas o complejo vitamínico" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm" value={nuevaTransaccion.detalleVeterinario} onChange={e => setNuevaTransaccion({...nuevaTransaccion, detalleVeterinario: e.target.value})} />
                  </div>
                )}

                {nuevaTransaccion.categoria === "Infraestructura" && (
                  <p className="text-slate-400 text-xs font-medium animate-in fade-in duration-150">Mantenimiento de Galpones e Instalaciones.</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Estado del Pago</label>
                <select 
                  className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  value={nuevaTransaccion.estado}
                  onChange={e => setNuevaTransaccion({...nuevaTransaccion, estado: e.target.value})}
                >
                  <option value="Completado">Completado</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Atrasado">Atrasado</option>
                </select>
              </div>

              <div className="pt-4 flex gap-2 justify-end border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsModalOpen(false);
                    setNuevaTransaccion({
                      concepto: "", tipo: "Gasto", categoria: "Alimentos", galpon: "Galpón 1", monto: "", estado: "Completado",
                      cantidadHuevos: "", tipoHuevos: "Tipo AA", cantidadAlimento: "", unidadAlimento: "Bultos (50kg)", detalleVeterinario: ""
                    });
                  }} 
                  className="px-5 py-2 border border-slate-200 font-bold text-sm text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[#39A900] text-white font-bold text-sm rounded-xl hover:bg-[#329300] transition-colors"
                >
                  Guardar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}