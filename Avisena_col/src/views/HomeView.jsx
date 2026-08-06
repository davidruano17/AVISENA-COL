import { Link } from 'react-router-dom';

const gallinaBaner = '/assets/images/gallina_baner.jpg';

export default function HomeView() {
  return (
    <>
      {/* HERO */}
      <section 
        className="my-10 mx-auto w-[90%] rounded-[20px] h-[500px] flex items-center justify-center bg-cover bg-center shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${gallinaBaner})` }}
      >
        <article className="bg-black/50 py-10 px-[60px] rounded-[25px] backdrop-blur-md text-center max-w-[750px]">
          <h1 className="text-white text-[64px] font-black">¡Bienvenido!</h1>
          <p className="mt-5 text-white text-xl leading-relaxed">
            Controla tu producción de huevos de forma eficiente.<br />
            Gestiona tus lotes y monitorea la salud de tus aves.<br />
            ¡Tu éxito avícola a un toque de distancia!
          </p>
        </article>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-[100px] text-center">
        <header className="features-header">
          <h2 className="text-[48px] font-black text-[#064e3b]">Todo lo que necesitas para tu galpón</h2>
          <p className="mt-4 text-[#065f46] max-w-[700px] mx-auto text-base">
            Nuestras herramientas digitales están diseñadas para mejorar la eficiencia operativa
            y el control total de tu producción desde la palma de tu mano.
          </p>
        </header>

        <section className="mt-[50px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[30px]">
          <article className="p-[35px] rounded-[20px] border border-[#d1fae5] bg-white transition-all duration-300 border-b-[6px] border-b-primary hover:-translate-y-2.5 hover:shadow-[0_20px_30px_rgba(0,0,0,0.1)]">
            <span className="text-[45px]">📊</span>
            <h3 className="mt-4 text-xl font-bold text-[#064e3b]">Control de Producción</h3>
            <p className="mt-2.5 text-[#065f46] text-sm">Registra y controla la producción diaria de huevos de forma rápida y organizada.</p>
          </article>

          <article className="p-[35px] rounded-[20px] border border-[#d1fae5] bg-white transition-all duration-300 border-b-[6px] border-b-primary hover:-translate-y-2.5 hover:shadow-[0_20px_30px_rgba(0,0,0,0.1)]">
            <span className="text-[45px]">✔️</span>
            <h3 className="mt-4 text-xl font-bold text-[#064e3b]">Clasificación</h3>
            <p className="mt-2.5 text-[#065f46] text-sm">Clasifica los huevos por tamaño, calidad y tipo para mejorar la gestión.</p>
          </article>

          <article className="p-[35px] rounded-[20px] border border-[#d1fae5] bg-white transition-all duration-300 border-b-[6px] border-b-primary hover:-translate-y-2.5 hover:shadow-[0_20px_30px_rgba(0,0,0,0.1)]">
            <span className="text-[45px]">💔</span>
            <h3 className="mt-4 text-xl font-bold text-[#064e3b]">Mortalidad</h3>
            <p className="mt-2.5 text-[#065f46] text-sm">Lleva el control de aves fallecidas para análisis y toma de decisiones oportunas.</p>
          </article>

          <article className="p-[35px] rounded-[20px] border border-[#d1fae5] bg-white transition-all duration-300 border-b-[6px] border-b-primary hover:-translate-y-2.5 hover:shadow-[0_20px_30px_rgba(0,0,0,0.1)]">
            <span className="text-[45px]">🏥</span>
            <h3 className="mt-4 text-xl font-bold text-[#064e3b]">Morbilidad</h3>
            <p className="mt-2.5 text-[#065f46] text-sm">Registra enfermedades y síntomas del lote.</p>
          </article>
        </section>
      </section>

      {/* CTA */}
      <section className="py-[60px] px-[100px]">
        <article className="bg-[#064e3b] p-[70px] rounded-[40px] text-center text-white shadow-[0_20px_40px_rgba(0,0,0,0.2)]">
          <h2 className="text-[42px] font-black">¿Listo para digitalizar tu granja?</h2>
          <p className="mt-4 text-[#d1fae5]">Únete a cientos de productores que ya están optimizando sus resultados y aumentando su producción con tecnología de punta.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/register" className="mt-[30px] inline-block py-4 px-[50px] bg-primary text-[#0b3303] no-underline rounded-[18px] font-black shadow-[0_15px_30px_rgba(73,230,25,0.4)] hover:brightness-105 active:scale-95 transition-all">Comenzar Ahora</Link>
            <Link to="/login" className="mt-[30px] inline-block py-4 px-[50px] bg-primary text-[#0b3303] no-underline rounded-[18px] font-black shadow-[0_15px_30px_rgba(73,230,25,0.4)] hover:brightness-105 active:scale-95 transition-all">Iniciar sesión</Link>
          </div>
        </article>
      </section>
    </>
  );
}
