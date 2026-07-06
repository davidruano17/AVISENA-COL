"use client";

import React, { useState, useEffect } from "react";

const formatDots = (num) => {
  if (!num) return "";
  let val = num.toString().replace(/\D/g, "");
  return val.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const cleanNum = (str) => {
  if (!str) return 0;
  return (
    parseFloat(str.toString().replace(/\./g, "").replace("$", "").trim()) || 0
  );
};

const formatCurrency = (val) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(val);

const formatExactPanales = (unidades) => {
  if (!unidades || unidades === 0) return "0 panales";
  const panales = Math.floor(unidades / 30);
  const residuo = unidades % 30;
  if (panales === 0) return `${residuo} uds`;
  if (residuo === 0) return `${panales} ${panales === 1 ? "panal" : "panales"}`;
  return `${panales} ${panales === 1 ? "panal" : "panales"} y ${residuo} uds`;
};

const getUnidades = (reg) => {
  return reg.unidades !== undefined ? reg.unidades : reg.panales || 0;
};

const CLASIFICACIONES = ["AAA", "AA", "A", "B", "C", "Jumbo"];

const createInitialTableData = () =>
  CLASIFICACIONES.reduce((acc, tipo) => {
    acc[tipo] = 0;
    return acc;
  }, {});

export default function ClasificacionView() {
  const [modals, setModals] = useState({
    registro: false,
    exito: false,
    borrado: false,
    detalle: false,
  });

  const [step, setStep] = useState(1);
  const [tableData, setTableData] = useState(createInitialTableData());
  const [generalInfo, setGeneralInfo] = useState({
    fecha: new Date().toISOString().split("T")[0],
    galpon: "1",
    lote: "1",
    responsable: "",
    observaciones: "",
  });
  const [registroProduccion, setRegistroProduccion] = useState(null);

  const [historial, setHistorial] = useState([]);
  const [filtroGalpon, setFiltroGalpon] = useState("");
  const [selectedRecordIndex, setSelectedRecordIndex] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("avisena_storage");
    if (saved) setHistorial(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (historial.length > 0) {
      localStorage.setItem("avisena_storage", JSON.stringify(historial));
    }
  }, [historial]);

  useEffect(() => {
    const data = localStorage.getItem("produccionSeleccionada");
    if (!data) return;

    const produccion = JSON.parse(data);
    setRegistroProduccion(produccion);
    setGeneralInfo({
      fecha: produccion.fecha || new Date().toISOString().split("T")[0],
      galpon: produccion.galpon || "",
      lote: produccion.lote || "",
      responsable: produccion.trabajador || "",
      observaciones: produccion.notas || "",
    });
    setTableData(createInitialTableData());
    openModal("registro");
  }, []);

  const openModal = (name) => setModals((prev) => ({ ...prev, [name]: true }));
  const closeModal = (name) => {
    setModals((prev) => ({ ...prev, [name]: false }));
    if (name === "registro") setStep(1);
  };

  const obtenerSiguienteId = () => {
    if (historial.length === 0) return 1;
    const ultimoId = historial[historial.length - 1].id;
    const num = parseInt(ultimoId.split("-")[1]);
    return isNaN(num) ? historial.length + 1 : num + 1;
  };

  const handleLimpiarFormulario = () => {
    setTableData(createInitialTableData());
    setGeneralInfo({
      fecha: new Date().toISOString().split("T")[0],
      galpon: "1",
      lote: "1",
      responsable: "",
      observaciones: "",
    });
    closeModal("registro");
    openModal("borrado");
  };

  const handleTableChange = (tipo, value) => {
    const nextValue = value === "" ? "" : Math.max(0, parseInt(value, 10) || 0);
    setTableData((prev) => ({
      ...prev,
      [tipo]: nextValue,
    }));
  };

  const totalHuevosBuenos = Number(registroProduccion?.huevosBuenos || 0);
  const totalHuevosRotos = Number(registroProduccion?.huevosRotos || 0);
  const totalHuevosDescarte = Number(registroProduccion?.descarte || 0);

  const totalClasificado = CLASIFICACIONES.reduce(
    (acc, tipo) => acc + Number(tableData[tipo] || 0),
    0,
  );

  const diferenciaClasificacion = totalHuevosBuenos - totalClasificado;
  const esClasificacionValida =
    totalHuevosBuenos === 0
      ? totalClasificado >= 0
      : totalClasificado === totalHuevosBuenos;
  const puedeContinuar = totalHuevosBuenos === 0 ? true : esClasificacionValida;
  const mensajeValidacion = !registroProduccion
    ? ""
    : esClasificacionValida
      ? "La clasificación coincide exactamente con los huevos buenos registrados."
      : diferenciaClasificacion > 0
        ? `Faltan clasificar ${diferenciaClasificacion} huevos.`
        : `Se clasificaron ${Math.abs(diferenciaClasificacion)} huevos de más.`;

  const obtenerTextoDesglose = (data) => {
    if (!data) return "Ninguno";
    return (
      CLASIFICACIONES.map((tipo) => {
        const cantidad =
          typeof data[tipo] === "number"
            ? data[tipo]
            : data[tipo]?.hoy || data[tipo]?.cantidad || 0;
        return cantidad > 0 ? `${cantidad} ${tipo}` : null;
      })
        .filter(Boolean)
        .join(", ") || "Ninguno"
    );
  };

  const handleContinuarPaso2 = () => {
    if (!puedeContinuar) {
      return;
    }
    setStep(2);
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!esClasificacionValida) {
      return;
    }

    const registro = {
      id: `REC-${String(obtenerSiguienteId()).padStart(3, "0")}`,
      fecha: generalInfo.fecha,
      galpon: generalInfo.galpon,
      lote: generalInfo.lote || "N/A",
      responsable: generalInfo.responsable,
      total: formatCurrency(0),
      unidades: totalClasificado,
      panales: 0,
      huevosBuenos: totalHuevosBuenos,
      huevosRotos: totalHuevosRotos,
      huevosDescarte: totalHuevosDescarte,
      descarte: totalHuevosDescarte,
      obs: generalInfo.observaciones || "Sin observaciones",
      detalles: CLASIFICACIONES.reduce((acc, tipo) => {
        acc[tipo] = { hoy: Number(tableData[tipo] || 0) };
        return acc;
      }, {}),
      clasificacion: CLASIFICACIONES.reduce((acc, tipo) => {
        acc[tipo] = Number(tableData[tipo] || 0);
        return acc;
      }, {}),
      estado: "clasificado",
    };

    const nuevoHistorial = [...historial, registro];
    setHistorial(nuevoHistorial);
    localStorage.setItem("avisena_storage", JSON.stringify(nuevoHistorial));
    localStorage.removeItem("produccionSeleccionada");

    closeModal("registro");
    openModal("exito");

    setTableData(createInitialTableData());
    setGeneralInfo({
      fecha: new Date().toISOString().split("T")[0],
      galpon: "",
      lote: "",
      responsable: "",
      observaciones: "",
    });
    setStep(1);
  };

  const verDetalle = (index) => {
    setSelectedRecordIndex(index);
    openModal("detalle");
  };

  const eliminarRegistro = (index) => {
    if (
      window.confirm("¿Estás seguro de eliminar este registro permanentemente?")
    ) {
      setHistorial((prev) => {
        const copy = [...prev];
        copy.splice(index, 1);
        localStorage.setItem("avisena_storage", JSON.stringify(copy));
        return copy;
      });
      if (selectedRecordIndex === index) closeModal("detalle");
    }
  };

  const handleExportarExcel = () => {
    if (historial.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }
    const encabezados = [
      "ID",
      "Fecha",
      "Galpon",
      "Lote",
      "Responsable",
      "Unidades",
      "Panales",
      "Total",
      "Sobrantes Mañana",
      "Observaciones",
    ];
    const filas = historial.map((reg) =>
      [
        reg.id,
        reg.fecha,
        reg.galpon,
        reg.lote || "N/A",
        reg.responsable,
        getUnidades(reg),
        formatExactPanales(getUnidades(reg)),
        reg.total.replace(/[$. ]/g, ""),
        reg.totalSobrantes || 0,
        reg.obs.replace(/,/g, " "),
      ].join(","),
    );

    const contenidoCsv =
      "\ufeff" + [encabezados.join(","), ...filas].join("\n");
    const blob = new Blob([contenidoCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Avisena_Produccion_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const historialFiltrado = historial.filter(
    (reg) => reg.galpon && reg.galpon.toString().includes(filtroGalpon),
  );

  return (
    <span className="min-h-screen bg-slate-50 text-gray-800 antialiased font-sans block">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-4">
        <nav className="max-w-6xl mx-auto flex justify-between items-center">
          <figure className="flex items-center gap-4">
            <img
              src="/logo-sena-verde-complementario-svg-2022.svg"
              alt="Logo Avisena"
              className="h-10 w-auto"
            />
            <span className="w-px h-8 bg-gray-300 block"></span>
            <figcaption className="font-extrabold text-xl tracking-tight text-gray-950">
              AVISENA COL
            </figcaption>
          </figure>
          <aside className="flex items-center gap-2 text-sm">
            <span className="font-bold text-gray-900">
              Instructor Líder (Admin)
            </span>
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>{" "}
              Online
            </span>
          </aside>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto mt-12 px-6 pb-16 space-y-12">
        <section className="flex flex-col md:flex-row md:justify-between md:items-center bg-white rounded-2xl p-8 shadow-sm border border-gray-100 gap-6">
          <header>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Registro de Clasificación de Huevos
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Control y seguimiento de recolección diaria — Unidad Avícola SENA
            </p>
          </header>
          <button
            type="button"
            className="bg-green-500 hover:bg-green-600 text-slate-950 font-extrabold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 tracking-wide text-sm"
            onClick={() => openModal("registro")}
          >
            <span className="text-lg font-black">+</span> Agregar Nueva
            Clasificación
          </button>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <header className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-900">
              Historial de Clasificación
            </h2>
            <aside className="flex items-center gap-3">
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
                className="bg-green-500 hover:bg-green-600 text-slate-950 p-2.5 rounded-xl transition-colors shadow-sm"
                onClick={handleExportarExcel}
              >
                📥
              </button>
            </aside>
          </header>

          <section className="overflow-x-auto block">
            <table className="w-full text-left border-collapse text-xs uppercase tracking-wider font-semibold">
              <thead className="bg-slate-50 border-b border-gray-200">
                <tr className="text-gray-400">
                  <th className="p-4 font-bold text-xs uppercase tracking-wider">
                    ID / Fecha
                  </th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider">
                    Galpón / Lote
                  </th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider">
                    Producción Hoy
                  </th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider">
                    Sobrantes Mañana
                  </th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider">
                    Total Dinero
                  </th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider">
                    Responsable
                  </th>
                  <th className="p-4 text-center font-bold text-xs uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 normal-case font-normal text-sm text-gray-700">
                {historialFiltrado.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-16 text-gray-400 font-medium bg-slate-50/20"
                    >
                      <span className="flex flex-col items-center justify-center gap-2">
                        <span className="text-3xl">🥚</span>
                        <strong className="text-sm font-semibold text-slate-500">
                          No se encontraron registros de clasificación
                        </strong>
                        <span className="text-xs text-gray-450">
                          Agrega una nueva clasificación para comenzar el
                          historial.
                        </span>
                      </span>
                    </td>
                  </tr>
                ) : (
                  historialFiltrado.map((reg, index) => (
                    <tr
                      key={index}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="p-4">
                        <span className="font-bold text-slate-900 block font-mono tracking-tight">
                          {reg.id}
                        </span>
                        <span className="text-xs text-gray-400 block mt-0.5">
                          {reg.fecha}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="flex flex-col gap-1">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 w-max">
                            Galpón {reg.galpon}
                          </span>
                          <span className="text-xs text-gray-500 font-medium pl-1">
                            Lote: {reg.lote || "N/A"}
                          </span>
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="flex flex-col">
                          <span className="font-extrabold text-slate-950">
                            {getUnidades(reg)}{" "}
                            <span className="text-[10px] text-gray-400 font-semibold">
                              UDS
                            </span>
                            <span className="text-xs font-normal text-gray-500 block normal-case">
                              ({obtenerTextoDesglose(reg.detalles || {})})
                            </span>
                          </span>
                          <span className="text-xs font-semibold text-green-600 mt-0.5">
                            {formatExactPanales(getUnidades(reg))}
                          </span>
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="flex flex-col">
                          <span className="font-bold text-emerald-700">
                            {reg.unidades || 0}{" "}
                            <span className="text-[10px] text-emerald-500 font-semibold">
                              UDS
                            </span>
                          </span>
                          <span className="text-xs font-normal text-gray-400 block normal-case">
                            ({obtenerTextoDesglose(reg.detalles || {})})
                          </span>
                        </span>
                      </td>
                      <td className="p-4 font-extrabold text-green-600 text-base">
                        {reg.total}
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold uppercase border border-slate-200">
                            {reg.responsable ? reg.responsable.charAt(0) : "U"}
                          </span>
                          <span className="text-gray-700 font-medium">
                            {reg.responsable || "N/A"}
                          </span>
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="flex justify-center gap-2">
                          <button
                            type="button"
                            className="bg-slate-100 hover:bg-slate-200/80 text-slate-700 w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150 shadow-sm"
                            title="Ver Detalle"
                            onClick={() => verDetalle(index)}
                          >
                            👁️
                          </button>
                          <button
                            type="button"
                            className="bg-red-50 hover:bg-red-100 text-red-600 w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150 shadow-sm"
                            title="Eliminar"
                            onClick={() => eliminarRegistro(index)}
                          >
                            🗑️
                          </button>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        </section>

        {/* MODAL DE REGISTRO OPTIMIZADO CON SCROLL ACTIVO */}
        {modals.registro && (
          <span className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 block">
            <article className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
              <header className="flex justify-between items-center px-6 py-4 border-b bg-gray-50 shrink-0">
                <h2 className="text-lg font-bold text-gray-900">
                  {step === 1
                    ? "1. Clasificación de Huevos"
                    : "2. Información General y Cierre"}
                </h2>
                <button
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold p-1"
                  type="button"
                  onClick={() => closeModal("registro")}
                >
                  &times;
                </button>
              </header>

              <form
                onSubmit={step === 2 ? handleSave : (e) => e.preventDefault()}
                className="p-6 overflow-y-auto flex-1 space-y-5"
              >
                {step === 1 && (
                  <section className="space-y-5">
                    {registroProduccion && (
                      <section className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                          Datos de producción
                        </p>
                        <div className="grid grid-cols-2 gap-3 text-sm text-emerald-900">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                              Fecha
                            </p>
                            <p className="font-semibold">
                              {registroProduccion.fecha || generalInfo.fecha}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                              Galpón
                            </p>
                            <p className="font-semibold">
                              {registroProduccion.galpon || generalInfo.galpon}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                              Lote
                            </p>
                            <p className="font-semibold">
                              {registroProduccion.lote || generalInfo.lote}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                              Responsable
                            </p>
                            <p className="font-semibold">
                              {registroProduccion.trabajador ||
                                generalInfo.responsable}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-amber-700">
                          Debe clasificar manualmente los {totalHuevosBuenos}{" "}
                          huevos buenos.
                        </p>
                        <p className="text-xs text-emerald-700">
                          Huevos rotos y descarte solo se muestran como
                          información y no entran en la tabla de clasificación.
                        </p>
                      </section>
                    )}

                    <section className="overflow-x-auto border border-gray-150 rounded-2xl shadow-sm block">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-xs font-bold text-gray-450 uppercase border-b border-gray-200">
                            <th className="px-4 py-3 text-left">Categoría</th>
                            <th className="px-4 py-3 text-center">Cantidad</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                          {CLASIFICACIONES.map((tipo) => (
                            <tr
                              key={tipo}
                              className="hover:bg-slate-50/50 transition-colors"
                            >
                              <td className="px-4 py-3 text-left font-bold text-gray-800">
                                {tipo}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="number"
                                  className="w-24 p-1.5 border border-gray-300 rounded-lg text-center font-semibold focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-all duration-150"
                                  value={tableData[tipo] ?? 0}
                                  min="0"
                                  onChange={(e) =>
                                    handleTableChange(tipo, e.target.value)
                                  }
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </section>

                    <section className="rounded-2xl border border-gray-200 bg-slate-50/70 p-4 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Huevos buenos</span>
                        <strong className="text-slate-900">
                          {totalHuevosBuenos}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          Huevos clasificados
                        </span>
                        <strong className="text-slate-900">
                          {totalClasificado}
                        </strong>
                      </div>
                      <div
                        className={`rounded-xl p-3 text-sm font-semibold ${esClasificacionValida ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
                      >
                        {mensajeValidacion ||
                          "Ingrese las cantidades para validar la clasificación."}
                      </div>
                    </section>

                    <button
                      type="button"
                      disabled={!puedeContinuar}
                      className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors shadow-md"
                      onClick={handleContinuarPaso2}
                    >
                      {puedeContinuar
                        ? "CONTINUAR →"
                        : "CORRIJA LA CLASIFICACIÓN PARA CONTINUAR"}
                    </button>
                  </section>
                )}

                {step === 2 && (
                  <section className="space-y-5">
                    <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Resumen de la clasificación
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-sm text-slate-700">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Fecha
                          </p>
                          <p className="font-semibold text-slate-900">
                            {generalInfo.fecha}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Galpón
                          </p>
                          <p className="font-semibold text-slate-900">
                            {generalInfo.galpon}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Lote
                          </p>
                          <p className="font-semibold text-slate-900">
                            {generalInfo.lote || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Responsable
                          </p>
                          <p className="font-semibold text-slate-900">
                            {generalInfo.responsable || "N/A"}
                          </p>
                        </div>
                      </div>
                    </section>

                    <section className="rounded-2xl border border-gray-200 bg-white p-4 space-y-2">
                      {CLASIFICACIONES.map((tipo) => (
                        <div
                          key={tipo}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-slate-600">{tipo}</span>
                          <strong className="text-slate-900">
                            {tableData[tipo] ?? 0}
                          </strong>
                        </div>
                      ))}
                    </section>

                    <section
                      className={`rounded-2xl border p-4 text-sm font-semibold ${esClasificacionValida ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}
                    >
                      {mensajeValidacion ||
                        "Revise la clasificación antes de guardar."}
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2 text-sm text-slate-700">
                      <div className="flex items-center justify-between">
                        <span>Huevos rotos</span>
                        <strong>{totalHuevosRotos}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Huevos de descarte</span>
                        <strong>{totalHuevosDescarte}</strong>
                      </div>
                    </section>

                    <footer className="flex justify-between items-center border-t pt-4">
                      <button
                        type="button"
                        className="text-gray-500 hover:text-gray-700 font-bold text-sm"
                        onClick={() => setStep(1)}
                      >
                        &larr; Volver
                      </button>
                      <span className="flex gap-3">
                        <button
                          type="button"
                          className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 px-4 rounded-xl transition-colors text-sm"
                          onClick={handleLimpiarFormulario}
                        >
                          BORRAR TODO
                        </button>
                        <button
                          type="submit"
                          disabled={!esClasificacionValida}
                          className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-md"
                        >
                          FINALIZAR Y GUARDAR
                        </button>
                      </span>
                    </footer>
                  </section>
                )}
              </form>
            </article>
          </span>
        )}

        {/* MODALES STATUS */}
        {modals.exito && (
          <span className="fixed inset-0 bg-slate-950/90 flex items-center justify-center p-4 z-50 block">
            <article className="text-center text-white max-w-sm flex flex-col items-center">
              <span className="text-4xl text-green-500 border-4 border-green-500 w-20 h-20 flex items-center justify-center rounded-full font-bold mb-4">
                ✓
              </span>
              <h1 className="text-2xl font-black tracking-wide mb-2">
                ¡REGISTRO EXITOSO!
              </h1>
              <button
                type="button"
                className="w-full bg-green-500 text-slate-950 font-black py-3 px-8 rounded-xl mt-6 hover:bg-green-400 transition-colors"
                onClick={() => closeModal("exito")}
              >
                CONTINUAR
              </button>
            </article>
          </span>
        )}

        {modals.borrado && (
          <span className="fixed inset-0 bg-slate-950/90 flex items-center justify-center p-4 z-50 block">
            <article className="text-center text-white max-w-sm flex flex-col items-center">
              <span className="text-4xl text-red-500 border-4 border-red-500 w-20 h-20 flex items-center justify-center rounded-full font-bold mb-4">
                ✕
              </span>
              <h1 className="text-2xl font-black tracking-wide mb-2">
                ¡FORMULARIO LIMPIADO!
              </h1>
              <button
                type="button"
                className="w-full bg-red-600 text-white font-black py-3 px-8 rounded-xl mt-6 hover:bg-red-500 transition-colors"
                onClick={() => closeModal("borrado")}
              >
                CONTINUAR
              </button>
            </article>
          </span>
        )}

        {/* MODAL DETALLE ACTUALIZADO CON SOBRANTES */}
        {modals.detalle && selectedRecordIndex !== null && (
          <span className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 block">
            <article className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
              <header className="flex justify-between items-center px-6 py-4 border-b bg-gray-50 shrink-0">
                <h2 className="text-lg font-bold text-gray-900">
                  Detalle de Producción
                </h2>
                <button
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold p-1"
                  type="button"
                  onClick={() => closeModal("detalle")}
                >
                  &times;
                </button>
              </header>
              {(() => {
                const r = historial[selectedRecordIndex];
                if (!r) return null;
                return (
                  <section className="p-6 overflow-y-auto flex-1 space-y-5">
                    <span className="grid grid-cols-2 gap-4 text-sm border-b pb-4 block">
                      <span className="text-gray-500 font-medium block">
                        ID:{" "}
                        <span className="font-bold text-gray-900 block text-base">
                          {r.id}
                        </span>
                      </span>
                      <span className="text-gray-500 font-medium block">
                        FECHA:{" "}
                        <span className="font-bold text-gray-900 block text-base">
                          {r.fecha}
                        </span>
                      </span>
                      <span className="text-gray-500 font-medium block">
                        GALPÓN:{" "}
                        <span className="font-bold text-gray-800 block">
                          N° {r.galpon}
                        </span>
                      </span>
                      <span className="text-gray-500 font-medium block">
                        LOTE:{" "}
                        <span className="font-bold text-gray-800 block">
                          {r.lote || "N/A"}
                        </span>
                      </span>
                      <span className="text-gray-500 font-medium col-span-2 block">
                        RESPONSABLE:{" "}
                        <span className="font-bold text-gray-800 block">
                          {r.responsable || "N/A"}
                        </span>
                      </span>
                    </span>

                    <section>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                        Producción por Tipo
                      </h3>
                      <span className="bg-slate-50 border border-gray-100 rounded-2xl p-4 grid grid-cols-3 sm:grid-cols-6 gap-2 text-center block">
                        {CLASIFICACIONES.map((tipo) => {
                          const det = r.detalles?.[tipo];
                          const hoy = det?.hoy || 0;
                          return (
                            <span
                              key={tipo}
                              className="bg-white border border-gray-200/60 rounded-xl p-2 shadow-sm flex flex-col justify-between block"
                            >
                              <span className="block text-xs font-black text-slate-400 uppercase">
                                {tipo}
                              </span>
                              <span className="block text-base font-extrabold text-slate-800 mt-1">
                                {hoy}{" "}
                                <span className="text-[10px] text-gray-400 font-normal">
                                  uds
                                </span>
                              </span>
                              <span className="block text-xs font-bold text-green-600 mt-1">
                                {formatExactPanales(hoy)}
                              </span>
                            </span>
                          );
                        })}
                      </span>
                    </section>

                    <span className="grid grid-cols-3 gap-2 bg-green-50/50 border border-green-100 rounded-2xl p-4 block">
                      <span className="block">
                        <span className="block text-xs font-bold text-green-800 uppercase tracking-wide">
                          Unidades Totales
                        </span>
                        <span className="text-xl font-black text-green-900">
                          {getUnidades(r)}{" "}
                          <span className="text-xs font-normal text-green-700">
                            uds
                          </span>
                        </span>
                        <span className="block text-[11px] font-medium text-gray-600 mt-0.5 leading-tight">
                          ({obtenerTextoDesglose(r.detalles || {})})
                        </span>
                      </span>
                      <span className="block">
                        <span className="block text-xs font-bold text-green-800 uppercase tracking-wide">
                          Panales Totales
                        </span>
                        <span className="text-xl font-black text-green-900">
                          {formatExactPanales(getUnidades(r))}
                        </span>
                      </span>
                      <span className="text-right block">
                        <span className="block text-xs font-bold text-green-800 uppercase tracking-wide">
                          Valor Total
                        </span>
                        <span className="text-xl font-black text-green-700">
                          {r.total}
                        </span>
                      </span>
                    </span>

                    <blockquote className="bg-emerald-50/70 border-l-4 border-emerald-500 p-3 rounded-r-xl text-xs text-emerald-950">
                      <strong className="block text-emerald-900 font-bold mb-1 uppercase tracking-wider">
                        Clasificación guardada:
                      </strong>
                      {obtenerTextoDesglose(r.detalles || {})}.
                    </blockquote>

                    <blockquote className="bg-slate-50 border-l-4 border-slate-400 p-3 rounded-r-xl text-xs text-slate-700">
                      <strong className="block text-slate-700 font-bold mb-1 uppercase tracking-wider">
                        Producción registrada:
                      </strong>
                      Huevos buenos {r.huevosBuenos || 0} · Rotos{" "}
                      {r.huevosRotos || 0} · Descarte{" "}
                      {r.huevosDescarte || r.descarte || 0}.
                    </blockquote>

                    <blockquote className="bg-gray-50 border-l-4 border-slate-400 p-3 rounded-r-xl text-xs italic text-gray-600">
                      <strong className="block text-gray-700 not-italic font-bold mb-1 uppercase tracking-wider">
                        Observaciones:
                      </strong>
                      "{r.obs}"
                    </blockquote>
                  </section>
                );
              })()}
            </article>
          </span>
        )}
      </main>
    </span>
  );
}
