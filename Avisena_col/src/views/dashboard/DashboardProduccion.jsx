import React, { useState, useEffect } from "react";
import ModalHistorial from "../../components/ModalHistorial";

const DashboardProduccion = () => {
  const obtenerFechaFormateada = () => {
    const ahora = new Date();
    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    return `${ahora.getDate()} ${meses[ahora.getMonth()]}, ${ahora.getFullYear()}`;
  };

  // Modales
  const [isModalRecoleccionOpen, setIsModalRecoleccionOpen] = useState(false);
  const [isModalClasifOpen, setIsModalClasifOpen] = useState(false);
  const [isModalAlimentoOpen, setIsModalAlimentoOpen] = useState(false);
  const [isHistorialOpen, setIsHistorialOpen] = useState(false);

  // Formulario Recolección
  const [fechaRecoleccion, setFechaRecoleccion] = useState("2026-05-28");
  const [edadSemanasRecoleccion, setEdadSemanasRecoleccion] = useState("22");
  const [nombreTrabajador, setNombreTrabajador] = useState("John Doe");
  const [galponOrigen, setGalponOrigen] = useState("Galpón A - Ponedoras");
  const [huevosBuenos, setHuevosBuenos] = useState("1220");
  const [huevosRotosInput, setHuevosRotosInput] = useState("20");
  const [descarte, setDescarte] = useState("0");
  const [notas, setNotas] = useState("");

  // Formulario Clasificación
  const [fechaClasif, setFechaClasif] = useState("2026-05-28");
  const [galponClasif, setGalponClasif] = useState("Galpón A");
  const [lineaClasif, setLineaClasif] = useState("Línea 1");
  const [edadSemanasClasif, setEdadSemanasClasif] = useState("22");

  const [clasificacionData, setClasificacionData] = useState({
    aaa: { hoy: 420, ayer: 400, acumulado: 820, precioUsd: 0.18 },
    aa: { hoy: 380, ayer: 360, acumulado: 740, precioUsd: 0.15 },
    a: { hoy: 310, ayer: 290, acumulado: 600, precioUsd: 0.12 },
    b: { hoy: 110, ayer: 100, acumulado: 210, precioUsd: 0.09 },
    rotos: { hoy: 20, ayer: 15, acumulado: 35, precioUsd: 0.05 },
  });

  const [historial, setHistorial] = useState([
    { fecha: "24 oct, 2023", edad: "22 Semanas", galpon: "Galpón A", huevos: 420, alimento: 45.5 },
    { fecha: "24 oct, 2023", edad: "22 Semanas", galpon: "Galpón B", huevos: 380, alimento: 40.2 },
  ]);

  const [alimentoConsumido, setAlimentoConsumido] = useState(110.0);

  // Cálculo alimento
  const [nroAves, setNroAves] = useState("1000");
  const [gAve, setGAve] = useState("110");
  const [alimentoInput, setAlimentoInput] = useState("");

  const totalHuevos = Object.values(clasificacionData).reduce(
    (sum, item) => sum + Number(item.hoy || 0),
    0
  );

  const reqAlimentoKg = (Number(nroAves || 0) * Number(gAve || 0)) / 1000;
  const bultosRequeridos = reqAlimentoKg / 50;
  const previewBultos = alimentoInput ? (parseFloat(alimentoInput) / 50).toFixed(1) : "0.0";

  const cubetas = Math.floor(totalHuevos / 30);
  const sueltos = totalHuevos % 30;
  const fcrScore =
    totalHuevos > 0 ? (alimentoConsumido / (totalHuevos / 12)).toFixed(1) : "0.0";

  const handleClasifValueChange = (key, field, val) => {
    setClasificacionData((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: val,
      },
    }));
  };

  const handleRecoleccionSubmit = (e) => {
    e.preventDefault();

    const huevosB = Number(huevosBuenos || 0);
    const huevosR = Number(huevosRotosInput || 0);
    const nuevosHuevos = huevosB + huevosR;

    if (nuevosHuevos > 0) {
      const newEntry = {
        fecha: obtenerFechaFormateada(),
        edad: `${edadSemanasRecoleccion} Semanas`,
        galpon: galponOrigen.split(" - ")[0],
        huevos: nuevosHuevos,
        alimento: 45.0,
      };

      setHistorial((prev) => [newEntry, ...prev]);

      setClasificacionData((prev) => ({
        ...prev,
        aaa: { ...prev.aaa, hoy: Math.round(huevosB * 0.35) },
        aa: { ...prev.aa, hoy: Math.round(huevosB * 0.3) },
        a: { ...prev.a, hoy: Math.round(huevosB * 0.25) },
        b: { ...prev.b, hoy: Math.round(huevosB * 0.1) },
        rotos: { ...prev.rotos, hoy: huevosR },
      }));
    }

    setIsModalRecoleccionOpen(false);
  };

  const handleLimpiarFormulario = () => {
    setFechaRecoleccion("2026-05-28");
    setEdadSemanasRecoleccion("22");
    setNombreTrabajador("");
    setGalponOrigen("Galpón A - Ponedoras");
    setHuevosBuenos("0");
    setHuevosRotosInput("0");
    setDescarte("0");
    setNotas("");
  };

  const handleClasifSubmit = (e) => {
    e.preventDefault();

    const nuevosHuevos = Object.values(clasificacionData).reduce(
      (sum, item) => sum + Number(item.hoy || 0),
      0
    );

    if (nuevosHuevos > 0) {
      const newEntry = {
        fecha: obtenerFechaFormateada(),
        edad: `${edadSemanasClasif} Semanas`,
        galpon: galponClasif,
        huevos: nuevosHuevos,
        alimento: 45.0,
      };

      setHistorial((prev) => [newEntry, ...prev]);
    }

    setIsModalClasifOpen(false);
  };

  const handleAlimentoSubmit = (e) => {
    e.preventDefault();

    const kg = parseFloat(alimentoInput);
    if (kg > 0) {
      setAlimentoConsumido((prev) => prev + kg);
    }

    setIsModalAlimentoOpen(false);
    setAlimentoInput("");
  };

  useEffect(() => {
    if (isModalRecoleccionOpen || isModalClasifOpen || isModalAlimentoOpen || isHistorialOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isModalRecoleccionOpen, isModalClasifOpen, isModalAlimentoOpen, isHistorialOpen]);

  // Exportar historial a CSV
  const handleExportHistorial = () => {
    if (!historial || historial.length === 0) return;
    const headers = ["fecha", "edad", "galpon", "huevos", "alimento"];
    const rows = historial.map((h) => [h.fecha, h.edad, h.galpon, h.huevos, h.alimento]);
    const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `historial_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDeleteItem = (index) => {
    setHistorial((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearHistorial = () => {
    if (window.confirm("¿Borrar todo el historial? Esta acción no se puede deshacer.")) {
      setHistorial([]);
    }
  };

  const weeklyData = [
    { day: "Lun", huevos: 65, alimento: 35 },
    { day: "Mar", huevos: 63, alimento: 37 },
    { day: "Mié", huevos: 70, alimento: 30 },
    { day: "Jue", huevos: 60, alimento: 40 },
    { day: "Vie", huevos: 68, alimento: 32 },
    { day: "Sáb", huevos: 72, alimento: 28 },
    { day: "Dom", huevos: 62, alimento: 38 },
  ];

  const historialVisible = historial.slice(0, 5);

  return (
    <main className="flex min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
      <section className="flex-1 p-6 max-w-[1600px] mx-auto w-full">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6 text-xs font-semibold text-slate-500">
          <section className="flex items-center gap-3" aria-label="Estado de la fecha"></section>

          <section className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-500">today</span>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">
              {obtenerFechaFormateada()}
            </span>
          </section>
        </header>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Registro de Producción
          </h1>

          <button
            onClick={() => setIsModalRecoleccionOpen(true)}
            className="bg-[#4CAF50] hover:bg-[#43a047] text-white px-5 py-2 rounded-xl font-bold shadow-xl transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            Nueva Recolección
          </button>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <article className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
            <section className="space-y-1">
              <p className="text-slate-400 text-sm font-medium">Total Huevos Hoy</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white leading-tight">
                {totalHuevos.toLocaleString()}
              </h3>
            </section>
            <span className="bg-[#2ea66d]/10 text-[#2ea66d] p-3 rounded-lg material-symbols-outlined font-bold">
              egg
            </span>
          </article>

          <article className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
            <section className="space-y-1">
              <p className="text-slate-400 text-sm font-medium">Edad de las Aves</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                {edadSemanasRecoleccion} Semanas
              </h3>
            </section>
            <span className="bg-[#2ea66d]/10 text-[#2ea66d] p-3 rounded-lg material-symbols-outlined font-bold">
              calendar_today
            </span>
          </article>

          <article className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
            <section className="space-y-1">
              <p className="text-slate-400 text-sm font-medium">Total Recolecciones Hoy</p>
              <h3 className="text-3xl font-black text-[#2ea66d] leading-tight">
                {historial.length + 1}
              </h3>
            </section>
            <span className="bg-[#2ea66d]/10 text-[#2ea66d] p-3 rounded-lg material-symbols-outlined font-bold">
              layers
            </span>
          </article>

          <article className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
            <section className="space-y-1">
              <p className="text-slate-400 text-sm font-medium">Galpón Monitoreado</p>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight truncate max-w-[140px]">
                {galponClasif}
              </h3>
            </section>
            <span className="bg-[#2ea66d]/10 text-[#2ea66d] p-3 rounded-lg material-symbols-outlined font-bold">
              location_on
            </span>
          </article>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <section className="lg:col-span-2 space-y-8">
            <article className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
              <header className="flex justify-between items-center mb-6">
                <h3 className="text-[#0c2317] dark:text-white font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#2ea66d] font-bold">
                    trending_up
                  </span>
                  Índice de Conversión Alimenticia
                </h3>
                <span className="bg-[#2ea66d] text-white px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Bueno
                </span>
              </header>

              <section className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    Alimento Consumido (KG)
                  </span>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">
                    {alimentoConsumido.toFixed(1)}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    Producción Estimada
                  </span>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">
                    {totalHuevos.toLocaleString()}
                  </p>
                </div>
              </section>

              <div className="flex items-center justify-between p-4 bg-[#e8f7f0] dark:bg-emerald-950/20 rounded-2xl border border-emerald-100/20 m-0">
                <div>
                  <p className="text-xs font-bold text-[#278d5c] dark:text-emerald-400">
                    Puntaje CA Actual
                  </p>
                  <p className="text-4xl font-black text-[#0c2317] dark:text-emerald-300 mt-1">
                    {fcrScore}
                  </p>
                </div>
                <span className="material-symbols-outlined text-4xl text-[#2ea66d]/20 font-bold">
                  monitoring
                </span>
              </div>
            </article>

            <article className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-slate-100/80 dark:border-zinc-800/80 overflow-hidden">
              <header className="p-6 border-b border-slate-50 dark:border-zinc-800 flex justify-between items-center">
                <h3 className="text-slate-800 dark:text-white font-bold">Historial Reciente</h3>

                <button
                  onClick={() => setIsHistorialOpen(true)}
                  className="text-[#2ea66d] text-xs font-bold hover:underline bg-transparent border-none cursor-pointer"
                >
                  Ver Todo
                </button>
              </header>

              <section className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#fcfdfd] dark:bg-zinc-900 text-slate-400 text-[10px] font-extrabold uppercase tracking-widest border-b border-slate-50 dark:border-zinc-800">
                    <tr>
                      <th className="px-6 py-4">Fecha / Edad</th>
                      <th className="px-6 py-4">Galpón</th>
                      <th className="px-6 py-4 text-center">Huevos</th>
                      <th className="px-6 py-4 text-center">Alimento (KG)</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/50">
                    {historialVisible.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                            {item.fecha}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{item.edad}</p>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
                          {item.galpon}
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-black text-slate-800 dark:text-slate-200">
                          {item.huevos.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                          {item.alimento.toFixed(1)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setIsModalRecoleccionOpen(true)}
                            className="text-slate-300 hover:text-[#2ea66d] p-1 transition-colors cursor-pointer bg-transparent border-none"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </article>
          </section>

          <aside className="space-y-8">
            <aside className="bg-[#4CAF50] text-white p-5 rounded-2xl shadow-lg shadow-primary/20 flex flex-col justify-between min-h-[170px]">
              <header className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-lg">grid_on</span>
                <h4 className="font-bold text-sm uppercase tracking-wider text-white/95">
                  Conversión a Panales
                </h4>
              </header>

              <dl className="space-y-4 my-auto">
                <section className="flex justify-between items-center border-b border-white/10 pb-2.5">
                  <dt className="text-white/80 text-sm font-medium">Total Huevos</dt>
                  <dd className="text-2xl font-black">{totalHuevos.toLocaleString()}</dd>
                </section>
                <section className="flex justify-between items-center border-b border-white/10 pb-2.5">
                  <dt className="text-white/80 text-sm font-medium">Cubetas (30 und)</dt>
                  <dd className="text-2xl font-black">{cubetas}</dd>
                </section>
                <section className="flex justify-between items-center">
                  <dt className="text-white/80 text-sm font-medium">Huevos Sueltos</dt>
                  <dd className="text-2xl font-black">{sueltos}</dd>
                </section>
              </dl>
            </aside>

            <article className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-100/80 dark:border-zinc-800/80 shadow-sm">
              <header className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-[#2ea66d] font-bold">
                  calculate
                </span>
                <h4 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">
                  Cálculo de Alimento
                </h4>
              </header>

              <section className="space-y-5">
                <section className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Nro. de Aves
                    <input
                      type="text"
                      inputMode="numeric"
                      value={nroAves}
                      onChange={(e) => setNroAves(e.target.value.replace(/[^\d]/g, ""))}
                      className="mt-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-800 rounded-xl text-sm py-2.5 px-3 focus:ring-1 focus:ring-[#2ea66d] focus:border-[#2ea66d] text-slate-800 dark:text-slate-200 font-bold text-center"
                    />
                  </label>

                  <label className="flex flex-col text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    g / Ave
                    <input
                      type="text"
                      inputMode="numeric"
                      value={gAve}
                      onFocus={(e) => {
                        if (e.target.value === "0") setGAve("");
                      }}
                      onChange={(e) => setGAve(e.target.value.replace(/[^\d]/g, ""))}
                      className="mt-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-800 rounded-xl text-sm py-2.5 px-3 focus:ring-1 focus:ring-[#2ea66d] focus:border-[#2ea66d] text-slate-800 dark:text-slate-200 font-bold text-center"
                    />
                  </label>
                </section>

                <aside className="p-4 bg-[#e8f7f0] dark:bg-emerald-950/20 rounded-2xl border border-emerald-100/10 flex justify-between items-center">
                  <section>
                    <p className="text-[10px] font-bold text-[#2ea66d] uppercase tracking-widest">
                      Requerimiento
                    </p>
                    <p className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1">
                      {reqAlimentoKg.toFixed(1)}{" "}
                      <span className="text-xs font-normal text-slate-500">kg</span>
                    </p>
                  </section>
                  <span className="material-symbols-outlined text-[#2ea66d] font-bold cursor-pointer hover:rotate-45 transition-transform">
                    sync
                  </span>
                </aside>

                <footer className="pt-4 border-t border-slate-50 dark:border-zinc-800">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                    Inventario
                  </p>

                  <header className="flex items-center justify-between gap-4">
                    <section className="bg-slate-50 dark:bg-zinc-950 px-3 py-2.5 rounded-xl border border-slate-200/50 dark:border-zinc-800 flex-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">
                        Bultos (50kg)
                      </p>
                      <p className="font-extrabold text-sm mt-1.5 text-slate-800 dark:text-white">
                        {bultosRequeridos.toFixed(1)}
                      </p>
                    </section>

                    <button
                      onClick={() => setIsModalAlimentoOpen(true)}
                      className="bg-[#2ea66d] text-white text-xs font-bold px-4 py-3 rounded-xl hover:bg-[#278d5c] transition-all cursor-pointer shadow-sm border-none whitespace-nowrap"
                    >
                      Suministrar
                    </button>
                  </header>
                </footer>
              </section>
            </article>
          </aside>
        </section>

        <section className="mb-8">
          <article className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-slate-100/80 dark:border-zinc-800/80">
            <header className="flex justify-between items-center mb-6 pb-2 border-b border-slate-50 dark:border-zinc-850">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#2ea66d] font-bold">
                    category
                  </span>
                  Clasificación de Huevos
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Producción clasificada con equivalencia a panales
                </p>
              </div>

              <button
                onClick={() => setIsModalClasifOpen(true)}
                className="bg-[#2ea66d]/10 hover:bg-[#2ea66d]/20 text-[#2ea66d] text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-[#2ea66d]/5"
              >
                <span className="material-symbols-outlined text-sm font-bold">add</span>
                Agregar reg. Clasif.
              </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {Object.entries(clasificacionData).map(([key, val]) => {
                const label = key === "rotos" ? "Rotos / Dañados" : `Huevo Tipo ${key.toUpperCase()}`;
                const color = key === "rotos" ? "bg-amber-500" : "bg-[#2ea66d]";
                const panales = (Number(val.hoy) / 30).toFixed(1);

                return (
                  <div
                    key={key}
                    className="flex flex-col space-y-2 bg-slate-50/50 dark:bg-zinc-950/20 p-4 rounded-2xl border border-slate-100/50 dark:border-zinc-800/80"
                  >
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {label}
                    </span>
                    <div className="flex justify-between items-end">
                      <span className="text-xl font-black text-slate-800 dark:text-white leading-none">
                        {val.hoy} <span className="text-xs font-normal text-slate-500">uds</span>
                      </span>
                      <span className="text-xs font-bold text-[#2ea66d] bg-[#e8f7f0] dark:bg-emerald-950/20 px-2 py-0.5 rounded">
                        {panales} panales
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800/50 h-2 rounded-full overflow-hidden mt-1">
                      <div
                        className={`${color} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min((Number(val.hoy) / 500) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        </section>

        <article className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-slate-100/80 dark:border-zinc-800/80 mb-8">
          <header className="flex justify-between items-center mb-8">
            <h3 className="text-slate-800 dark:text-white font-bold">
              Tendencia Semanal de Producción
            </h3>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[#2ea66d] rounded-sm" /> Huevos
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[#bbf7d0] dark:bg-emerald-800 rounded-sm" /> Alimento
              </span>
            </div>
          </header>

          <section className="flex justify-between items-end gap-2 sm:gap-4 h-64 px-2 sm:px-6">
            {weeklyData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full max-w-[40px] bg-slate-50 dark:bg-zinc-950/40 rounded-full h-48 flex flex-col justify-end overflow-hidden border border-slate-100 dark:border-zinc-900/50 relative shadow-inner">
                  <div
                    className="bg-[#bbf7d0] dark:bg-emerald-800/50 w-full rounded-t-full transition-all duration-700 ease-out group-hover:opacity-90"
                    style={{ height: `${data.alimento}%` }}
                  />
                  <div
                    className="bg-[#2ea66d] w-full rounded-b-full transition-all duration-700 ease-out group-hover:bg-[#278d5c]"
                    style={{ height: `${data.huevos}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-400 mt-1">{data.day}</span>
              </div>
            ))}
          </section>
        </article>
      </section>

      <ModalHistorial
        isOpen={isHistorialOpen}
        onClose={() => setIsHistorialOpen(false)}
        historial={historial}
        onExport={handleExportHistorial}
        onDeleteItem={handleDeleteItem}
        onClear={handleClearHistorial}
      />

      {isModalRecoleccionOpen && (
        <dialog
          open
          className="fixed inset-0 z-50 overflow-y-auto bg-transparent flex items-center justify-center min-h-screen p-4 m-0 w-full max-w-none"
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalRecoleccionOpen(false)}
          />
          <article className="relative bg-white dark:bg-zinc-900 rounded-3xl text-left overflow-hidden shadow-2xl w-full max-w-xl border border-slate-100 dark:border-zinc-800 animate-slide-up z-10 p-8">
            <header className="flex items-center justify-between mb-6 pb-2 border-b border-slate-50 dark:border-zinc-800">
              <h3 className="text-lg font-bold flex items-center gap-2 text-[#0c2317] dark:text-white">
                <span className="material-symbols-outlined text-[#2ea66d] font-bold">
                  edit_note
                </span>
                Registro de Recolección de Huevos
              </h3>
              <button
                onClick={() => setIsModalRecoleccionOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1 flex cursor-pointer bg-transparent border-none"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            <form onSubmit={handleRecoleccionSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col text-xs font-bold text-slate-500 uppercase">
                  Fecha de Recolección
                  <input
                    type="date"
                    value={fechaRecoleccion}
                    onChange={(e) => setFechaRecoleccion(e.target.value)}
                    className="mt-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-800 rounded-xl py-2.5 px-3 text-sm focus:ring-1 focus:ring-[#2ea66d] focus:border-[#2ea66d] font-semibold text-slate-800 dark:text-slate-200"
                  />
                </label>

                <label className="flex flex-col text-xs font-bold text-slate-500 uppercase">
                  Edad en Semanas
                  <input
                    type="text"
                    inputMode="numeric"
                    value={edadSemanasRecoleccion}
                    onChange={(e) => setEdadSemanasRecoleccion(e.target.value.replace(/[^\d]/g, ""))}
                    className="mt-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-800 rounded-xl py-2.5 px-3 text-sm focus:ring-1 focus:ring-[#2ea66d] focus:border-[#2ea66d] font-semibold text-slate-800 dark:text-slate-200"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col text-xs font-bold text-slate-500 uppercase">
                  Nombre del Trabajador
                  <input
                    type="text"
                    placeholder="Ingresar nombre"
                    value={nombreTrabajador}
                    onChange={(e) => setNombreTrabajador(e.target.value)}
                    className="mt-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-800 rounded-xl py-2.5 px-3 text-sm focus:ring-1 focus:ring-[#2ea66d] focus:border-[#2ea66d] font-semibold text-slate-800 dark:text-slate-200"
                  />
                </label>

                <label className="flex flex-col text-xs font-bold text-slate-500 uppercase">
                  Galpón / Origen
                  <select
                    value={galponOrigen}
                    onChange={(e) => setGalponOrigen(e.target.value)}
                    className="mt-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-800 rounded-xl py-2.5 px-3 text-sm focus:ring-1 focus:ring-[#2ea66d] focus:border-[#2ea66d] font-semibold text-slate-800 dark:text-slate-200"
                  >
                    <option value="Galpón A - Ponedoras">Galpón A - Ponedoras</option>
                    <option value="Galpón B - Ponedoras">Galpón B - Ponedoras</option>
                    <option value="Galpón C - Ponedoras">Galpón C - Ponedoras</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col text-xs font-bold text-slate-500 uppercase">
                  Huevos Buenos
                  <input
                    type="text"
                    inputMode="numeric"
                    min="0"
                    value={huevosBuenos}
                    onChange={(e) => setHuevosBuenos(e.target.value.replace(/[^\d]/g, ""))}
                    className="mt-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-800 rounded-xl py-2.5 px-3 text-sm focus:ring-1 focus:ring-[#2ea66d] focus:border-[#2ea66d] font-semibold text-slate-800 dark:text-slate-200"
                  />
                </label>

                <label className="flex flex-col text-xs font-bold text-slate-500 uppercase">
                  Huevos Rotos
                  <input
                    type="text"
                    inputMode="numeric"
                    min="0"
                    value={huevosRotosInput}
                    onChange={(e) => setHuevosRotosInput(e.target.value.replace(/[^\d]/g, ""))}
                    className="mt-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-800 rounded-xl py-2.5 px-3 text-sm focus:ring-1 focus:ring-[#2ea66d] focus:border-[#2ea66d] font-semibold text-slate-800 dark:text-slate-200"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col text-xs font-bold text-slate-500 uppercase">
                  Descarte
                  <input
                    type="text"
                    inputMode="numeric"
                    min="0"
                    value={descarte}
                    onChange={(e) => setDescarte(e.target.value.replace(/[^\d]/g, ""))}
                    className="mt-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-800 rounded-xl py-2.5 px-3 text-sm focus:ring-1 focus:ring-[#2ea66d] focus:border-[#2ea66d] font-semibold text-slate-800 dark:text-slate-200"
                  />
                </label>

                <label className="flex flex-col text-xs font-bold text-slate-500 uppercase">
                  Notas
                  <input
                    type="text"
                    placeholder="ej., Huevos dañados encontrados"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    className="mt-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-800 rounded-xl py-2.5 px-3 text-sm focus:ring-1 focus:ring-[#2ea66d] focus:border-[#2ea66d] font-semibold text-slate-800 dark:text-slate-200"
                  />
                </label>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-50 dark:border-zinc-800">
                <button
                  type="submit"
                  className="flex-1 bg-[#2ea66d] text-white font-bold py-3 rounded-xl hover:bg-[#278d5c] transition-all cursor-pointer text-center text-sm shadow-sm border-none"
                >
                  Guardar Registro
                </button>
                <button
                  type="button"
                  onClick={handleLimpiarFormulario}
                  className="flex-1 border border-[#2ea66d] text-[#2ea66d] font-bold py-3 rounded-xl hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all cursor-pointer text-center text-sm bg-transparent"
                >
                  Limpiar Formulario
                </button>
              </div>
            </form>
          </article>
        </dialog>
      )}

      {isModalClasifOpen && (
        <dialog
          open
          className="fixed inset-0 z-50 overflow-y-auto bg-transparent flex items-center justify-center min-h-screen p-4 m-0 w-full max-w-none"
          aria-labelledby="modal-title"
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalClasifOpen(false)}
          />
          <article className="relative bg-white dark:bg-zinc-950 rounded-3xl text-left overflow-hidden shadow-2xl w-full max-w-4xl border border-slate-100 dark:border-zinc-800/80 animate-slide-up z-10">
            <section className="p-8">
              <header className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <span className="bg-[#2ea66d]/10 text-[#2ea66d] p-3 rounded-2xl material-symbols-outlined text-2xl font-bold">
                    table_chart
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                      Agregar reg. Clasif.
                    </h3>
                    <p className="text-xs text-slate-500">
                      Registre y optimice la clasificación de la producción diaria
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalClasifOpen(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 flex cursor-pointer bg-transparent border-none"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </header>

              <form onSubmit={handleClasifSubmit} className="space-y-6">
                <fieldset className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 border-none p-0 m-0">
                  <label className="flex flex-col space-y-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Fecha
                    <input
                      type="date"
                      value={fechaClasif}
                      onChange={(e) => setFechaClasif(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-[#2ea66d]/50 focus:border-[#2ea66d] px-4 py-3 text-sm text-slate-800 dark:text-slate-200 font-bold"
                    />
                  </label>

                  <label className="flex flex-col space-y-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Galpón
                    <select
                      value={galponClasif}
                      onChange={(e) => setGalponClasif(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-[#2ea66d]/50 focus:border-[#2ea66d] px-4 py-3 text-sm text-slate-800 dark:text-slate-200 font-bold"
                    >
                      <option value="Galpón A">Galpón A</option>
                      <option value="Galpón B">Galpón B</option>
                      <option value="Galpón C">Galpón C</option>
                    </select>
                  </label>

                  <label className="flex flex-col space-y-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Línea
                    <select
                      value={lineaClasif}
                      onChange={(e) => setLineaClasif(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-[#2ea66d]/50 focus:border-[#2ea66d] px-4 py-3 text-sm text-slate-800 dark:text-slate-200 font-bold"
                    >
                      <option value="Línea 1">Línea 1</option>
                      <option value="Línea 2">Línea 2</option>
                      <option value="Línea 3">Línea 3</option>
                    </select>
                  </label>

                  <label className="flex flex-col space-y-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Edad en Semanas
                    <input
                      type="text"
                      inputMode="numeric"
                      value={edadSemanasClasif}
                      onChange={(e) => setEdadSemanasClasif(e.target.value.replace(/[^\d]/g, ""))}
                      placeholder="Edad en semanas"
                      className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-[#2ea66d]/50 focus:border-[#2ea66d] px-4 py-3 text-sm text-slate-800 dark:text-slate-200 font-bold text-center"
                    />
                  </label>
                </fieldset>

                <section className="mt-8">
                  <h4 className="text-sm font-extrabold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider border-b border-slate-100 dark:border-zinc-800/80 pb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#2ea66d] text-lg font-bold">
                      tune
                    </span>
                    Optimización por Tipo de Huevo
                  </h4>

                  <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-zinc-800/80">
                    <table className="w-full text-left text-xs min-w-[700px]">
                      <thead className="bg-[#fcfdfd] dark:bg-zinc-900 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-zinc-800/80">
                        <tr>
                          <th className="px-6 py-4">Tipo Huevo</th>
                          <th className="px-6 py-4 text-center">Hoy (Uds)</th>
                          <th className="px-6 py-4 text-center">Ayer (Uds)</th>
                          <th className="px-6 py-4 text-center">Acumulado</th>
                          <th className="px-6 py-4 text-center">Precios (USD)</th>
                          <th className="px-6 py-4 text-center">Cant. Panales</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                        {Object.entries(clasificacionData).map(([key, value]) => {
                          const label = key === "rotos" ? "Rotos / Dañados" : `Huevo ${key.toUpperCase()}`;
                          const hoyVal = Number(value.hoy || 0);
                          const ayerVal = Number(value.ayer || 0);
                          const acumuladoVal = hoyVal + ayerVal;
                          const cantPanalesVal = (hoyVal / 30).toFixed(1);

                          return (
                            <tr key={key} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                              <td className="px-6 py-5 font-bold text-slate-700 dark:text-slate-300 uppercase">
                                {label}
                              </td>

                              <td className="px-6 py-5 text-center">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={value.hoy}
                                  onChange={(e) =>
                                    handleClasifValueChange(key, "hoy", e.target.value.replace(/[^\d]/g, ""))
                                  }
                                  className="w-24 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl py-1.5 px-2 text-center text-sm font-bold text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-[#2ea66d] focus:border-[#2ea66d]"
                                />
                              </td>

                              <td className="px-6 py-5 text-center text-slate-400 font-semibold text-sm">
                                {value.ayer}
                              </td>

                              <td className="px-6 py-5 text-center font-bold text-slate-700 dark:text-slate-300 text-sm">
                                {acumuladoVal}
                              </td>

                              <td className="px-6 py-5 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <span className="text-slate-400 font-bold">$</span>
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    value={value.precioUsd}
                                    onChange={(e) =>
                                      handleClasifValueChange(key, "precioUsd", e.target.value.replace(/[^0-9.]/g, ""))
                                    }
                                    className="w-20 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl py-1.5 px-2 text-center text-sm font-bold text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-[#2ea66d] focus:border-[#2ea66d]"
                                  />
                                </div>
                              </td>

                              <td className="px-6 py-5 text-center">
                                <span className="inline-flex items-center justify-center px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-[#2ea66d] dark:text-emerald-400 rounded-full font-bold text-sm">
                                  {cantPanalesVal} <span className="text-[10px] font-normal ml-1">panales</span>
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>

                <footer className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    type="submit"
                    className="flex-1 bg-[#2ea66d] text-white font-bold py-3.5 rounded-xl hover:bg-[#278d5c] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer border-none"
                  >
                    <span className="material-symbols-outlined font-bold text-lg">save</span>
                    Registrar Clasificación
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsModalClasifOpen(false)}
                    className="flex-1 border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-slate-400 font-bold py-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all cursor-pointer text-center bg-transparent"
                  >
                    Cancelar
                  </button>
                </footer>
              </form>
            </section>
          </article>
        </dialog>
      )}

      {isModalAlimentoOpen && (
        <dialog
          open
          className="fixed inset-0 z-50 overflow-y-auto bg-transparent flex items-center justify-center min-h-screen p-4 m-0 w-full max-w-none"
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalAlimentoOpen(false)}
          />
          <article className="relative bg-white dark:bg-zinc-950 rounded-3xl text-left overflow-hidden shadow-2xl w-full max-w-md border border-slate-100 dark:border-zinc-800/80 animate-slide-up z-10">
            <section className="p-8">
              <header className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                  <span className="material-symbols-outlined text-[#2ea66d] font-bold">
                    inventory_2
                  </span>
                  Ingreso de Alimento
                </h3>
                <button
                  onClick={() => setIsModalAlimentoOpen(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 flex cursor-pointer bg-transparent border-none"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </header>

              <form onSubmit={handleAlimentoSubmit} className="space-y-6">
                <label className="flex flex-col space-y-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Tipo de Alimento
                  <select className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-[#2ea66d]/50 py-3 px-4 text-sm font-bold text-slate-800 dark:text-slate-200">
                    <option value="inicio">Inicio (0-4 semanas)</option>
                    <option value="crecimiento">Crecimiento (5-18 semanas)</option>
                    <option value="produccion">Producción (19+ semanas)</option>
                  </select>
                </label>

                <label className="flex flex-col space-y-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Cantidad (kg)
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.0"
                    value={alimentoInput}
                    onChange={(e) => setAlimentoInput(e.target.value.replace(/[^0-9.]/g, ""))}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-[#2ea66d]/50 py-3 px-4 text-lg font-bold text-slate-800 dark:text-slate-200"
                  />
                </label>

                <figure className="bg-primary/5 p-4 rounded-xl border border-primary/10 m-0">
                  <figcaption className="flex justify-between items-center text-xs text-primary font-bold uppercase tracking-wider mb-1">
                    Equivalente en Bultos
                  </figcaption>
                  <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                    {previewBultos}{" "}
                    <span className="text-sm font-normal text-slate-500">Bultos (50kg)</span>
                  </p>
                </figure>

                <menu className="flex gap-4 mt-4 p-0">
                  <button
                    type="submit"
                    className="flex-1 bg-[#2ea66d] text-white font-bold py-4 rounded-xl hover:bg-[#278d5c] transition-all cursor-pointer shadow-lg shadow-primary/20 border-none"
                  >
                    Registrar Entrada
                  </button>
                </menu>
              </form>
            </section>
          </article>
        </dialog>
      )}
    </main>
  );
};

export default DashboardProduccion;