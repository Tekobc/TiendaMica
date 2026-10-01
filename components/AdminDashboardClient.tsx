"use client";

import { useState } from "react";
import { AdminDashboardData, AdminParticipanteRow } from "@/lib/actions/admin-actions";
import {
  actualizarConfiguracionSorteo,
  actualizarTelefonoParticipante,
  cargarGanador,
  abrirNuevoSorteo,
  logoutAdminAction,
} from "@/lib/actions/admin-actions";
import {
  DollarSign,
  Ticket,
  Clock,
  Lock,
  Search,
  Download,
  MessageCircle,
  Edit2,
  Check,
  X,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Trophy,
  PlusCircle,
  Star,
  LogOut,
} from "lucide-react";
import Link from "next/link";

interface AdminDashboardClientProps {
  initialData: AdminDashboardData;
  adminEmail: string;
}

export function AdminDashboardClient({ initialData, adminEmail }: AdminDashboardClientProps) {
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para edición del sorteo
  const [titulo, setTitulo] = useState(data.sorteo.titulo || data.sorteo.premio);
  const [descripcion, setDescripcion] = useState(data.sorteo.descripcion || "Participá comprando tu número");
  const [premio, setPremio] = useState(data.sorteo.premio);
  const [precioNumero, setPrecioNumero] = useState(data.sorteo.precio_numero);
  const [cantidadNumeros, setCantidadNumeros] = useState(data.sorteo.cantidad_numeros);
  const [topePorCompra, setTopePorCompra] = useState(data.sorteo.tope_por_compra);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configMessage, setConfigMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Estado para edición manual de teléfono (RN-11, Gap #6)
  const [editingPhoneCompraId, setEditingPhoneCompraId] = useState<string | null>(null);
  const [editedPhoneValue, setEditedPhoneValue] = useState("");

  // Estado para carga del ganador (RN-07)
  const [ganadorInput, setGanadorInput] = useState("");
  const [ganadorConfirm, setGanadorConfirm] = useState(false);
  const [savingGanador, setSavingGanador] = useState(false);
  const [ganadorMessage, setGanadorMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Estado para nuevo sorteo
  const [showNuevoSorteo, setShowNuevoSorteo] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("Participá comprando tu número");
  const [nuevoPremio, setNuevoPremio] = useState("");
  const [nuevoPrecio, setNuevoPrecio] = useState<number>(2500);
  const [nuevaCantidad, setNuevaCantidad] = useState<number>(100);
  const [nuevoTope, setNuevoTope] = useState<number>(5);
  const [savingNuevo, setSavingNuevo] = useState(false);
  const [nuevoMessage, setNuevoMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isBloqueado = data.sorteo.bloqueado;
  const isSorteado = data.sorteo.estado === "sorteado";
  const isCancelado = data.sorteo.estado === "cancelado";
  const puedeAbrirNuevo = isSorteado || isCancelado;
  const yaHayGanador = data.sorteo.numero_ganador !== null && data.sorteo.numero_ganador !== undefined;

  // ────────────────────── Config Sorteo ──────────────────────
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBloqueado) return;

    setSavingConfig(true);
    setConfigMessage(null);

    const res = await actualizarConfiguracionSorteo({
      sorteoId: data.sorteo.id,
      titulo,
      descripcion,
      premio,
      precioNumero: Number(precioNumero),
      cantidadNumeros: Number(cantidadNumeros),
      topePorCompra: Number(topePorCompra),
    });

    if (res.ok) {
      setConfigMessage({ type: "success", text: "Configuración actualizada exitosamente." });
      setData((prev) => ({
        ...prev,
        sorteo: {
          ...prev.sorteo,
          titulo: titulo || premio,
          descripcion: descripcion || "Participá comprando tu número",
          premio,
          precio_numero: Number(precioNumero),
          cantidad_numeros: Number(cantidadNumeros),
          tope_por_compra: Number(topePorCompra),
        },
      }));
    } else {
      setConfigMessage({ type: "error", text: res.error || "Error al actualizar." });
    }
    setSavingConfig(false);
  };

  // ────────────────────── Teléfono ──────────────────────
  const handleStartEditPhone = (p: AdminParticipanteRow) => {
    setEditingPhoneCompraId(p.compraId);
    setEditedPhoneValue(p.telefono);
  };

  const handleSavePhone = async (compraId: string) => {
    const res = await actualizarTelefonoParticipante(compraId, editedPhoneValue);
    if (res.ok) {
      setData((prev) => ({
        ...prev,
        participantes: prev.participantes.map((p) =>
          p.compraId === compraId ? { ...p, telefono: editedPhoneValue.replace(/\D/g, "") } : p
        ),
      }));
      setEditingPhoneCompraId(null);
    } else {
      alert(res.error || "No se pudo actualizar el teléfono.");
    }
  };

  // ────────────────────── Ganador (RN-07) ──────────────────────
  const handleCargarGanador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ganadorConfirm) {
      setGanadorMessage({ type: "error", text: "Debés marcar la casilla de confirmación antes de cargar el ganador." });
      return;
    }

    const num = parseInt(ganadorInput);
    if (isNaN(num) || num < 1) {
      setGanadorMessage({ type: "error", text: "Ingresá un número válido." });
      return;
    }

    setSavingGanador(true);
    setGanadorMessage(null);

    const res = await cargarGanador(data.sorteo.id, num, adminEmail);

    if (res.ok) {
      setData((prev) => ({
        ...prev,
        sorteo: {
          ...prev.sorteo,
          numero_ganador: res.ganador!,
          estado: "sorteado",
          ganador_cargado_por: adminEmail,
          ganador_cargado_at: new Date().toISOString(),
        },
      }));
      setGanadorMessage({
        type: "success",
        text: `🏆 Ganador cargado exitosamente: #${String(res.ganador).padStart(2, "0")}. Esta acción no puede revertirse.`,
      });
    } else {
      setGanadorMessage({ type: "error", text: res.error || "Error al cargar el ganador." });
    }
    setSavingGanador(false);
  };

  // ────────────────────── Nuevo Sorteo ──────────────────────
  const handleAbrirNuevoSorteo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNuevo(true);
    setNuevoMessage(null);

    const res = await abrirNuevoSorteo({
      titulo: nuevoTitulo || nuevoPremio,
      descripcion: nuevaDescripcion,
      premio: nuevoPremio,
      precioNumero: Number(nuevoPrecio),
      cantidadNumeros: Number(nuevaCantidad),
      topePorCompra: Number(nuevoTope),
    });

    if (res.ok) {
      setNuevoMessage({ type: "success", text: "¡Nueva dinámica creada! Recargá la página para verla." });
      setShowNuevoSorteo(false);
      // Recargar la página para mostrar el nuevo sorteo
      setTimeout(() => window.location.reload(), 1500);
    } else {
      setNuevoMessage({ type: "error", text: res.error || "Error al crear el sorteo." });
    }
    setSavingNuevo(false);
  };

  // ────────────────────── CSV ──────────────────────
  const handleExportCSV = () => {
    const headers = ["Fecha", "Nombre", "Teléfono", "Cantidad", "Monto", "Estado Pago", "Números Asignados"];
    const rows = data.participantes.map((p) => [
      new Date(p.createdAt).toLocaleString("es-AR"),
      `"${p.nombreCompleto.replace(/"/g, '""')}"`,
      p.telefono,
      p.cantidad,
      p.montoTotal,
      p.estadoPago,
      `"${p.numeros.map((n) => `#${String(n).padStart(2, "0")}`).join(", ")}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `participantes-sorteo-${data.sorteo.id.slice(0, 8)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filtrado de participantes en vivo
  const filteredParticipantes = data.participantes.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchNombre = p.nombreCompleto.toLowerCase().includes(term);
    const matchTelefono = p.telefono.includes(term);
    const matchNumero = p.numeros.some((n) => String(n).includes(term));
    return matchNombre || matchTelefono || matchNumero;
  });

  // Participante ganador (si ya se cargó el número ganador)
  const ganadorNumero = data.sorteo.numero_ganador;
  const participanteGanador = ganadorNumero
    ? data.participantes.find((p) => p.numeros.includes(ganadorNumero))
    : null;

  return (
    <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">

      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-rose-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-serif tracking-widest text-xs font-bold uppercase text-mica-700">
              ADONAI BY TIENDA MICA
            </span>
            <span className="text-[10px] bg-rose-100 text-mica-800 font-bold px-2 py-0.5 rounded-full">
              Panel Administrador
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
            Gestión de la Dinámica &amp; Participantes
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">Sesión: {adminEmail}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dinamica"
            target="_blank"
            className="py-2.5 px-4 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <span>Ver Home Pública</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={async () => {
              await logoutAdminAction();
              window.location.href = "/admin/login";
            }}
            className="py-2.5 px-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-mica-700 hover:bg-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Cerrar sesión administrativa"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </header>

      {/* Tarjetas de Métricas */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-rose-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-stone-400 font-medium block">Total Recaudado</span>
            <span className="text-2xl font-bold font-serif text-stone-900">
              ${data.metricas.totalRecaudado.toLocaleString("es-AR")}
            </span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-rose-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-mica-50 text-mica-600 flex items-center justify-center shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-stone-400 font-medium block">Números Vendidos</span>
            <span className="text-2xl font-bold font-serif text-stone-900">
              {data.metricas.vendidos} / {data.sorteo.cantidad_numeros}
            </span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-rose-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-stone-400 font-medium block">Pagos Pendientes</span>
            <span className="text-2xl font-bold font-serif text-stone-900">
              {data.metricas.pendientes}
            </span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-rose-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-stone-400 font-medium block">Fallidos / Reembolsados</span>
            <span className="text-2xl font-bold font-serif text-stone-900">
              {data.metricas.vencidos}
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════ MÓDULO GANADOR (RN-07) ═══════════ */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-rose-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Número Ganador de la Dinámica
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Se carga una única vez. Inalterable una vez registrado (RN-07).
            </p>
          </div>
        </div>

        {/* Si ya hay ganador cargado */}
        {yaHayGanador ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-200/60">
                <span className="text-3xl font-black text-white font-mono">
                  #{String(ganadorNumero).padStart(2, "0")}
                </span>
              </div>
              <div>
                <span className="text-xs text-stone-500 font-medium block">Número ganador</span>
                <span className="text-2xl font-serif font-bold text-stone-900">#{ganadorNumero}</span>
                {data.sorteo.ganador_cargado_por && (
                  <span className="text-[11px] text-stone-400 block mt-0.5">
                    Cargado por {data.sorteo.ganador_cargado_por} el{" "}
                    {data.sorteo.ganador_cargado_at
                      ? new Date(data.sorteo.ganador_cargado_at).toLocaleString("es-AR")
                      : "—"}
                  </span>
                )}
              </div>
            </div>

            {/* Participante ganador con botón WhatsApp */}
            {participanteGanador && (
              <div className="flex-1 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-amber-800">¡Ganador/a identificado/a!</span>
                </div>
                <p className="font-semibold text-stone-900 text-sm">{participanteGanador.nombreCompleto}</p>
                <p className="text-xs text-stone-500 mt-0.5">Teléfono: {participanteGanador.telefono}</p>
                <a
                  href={`https://wa.me/549${participanteGanador.telefono.replace(/\D/g, "")}?text=${encodeURIComponent(`¡Hola ${participanteGanador.nombreCompleto}! 🎉 Queremos informarte que el número #${ganadorNumero} resultó ganador de la dinámica de ${data.sorteo.premio}. ¡Felicitaciones desde Adonai BY TIENDA MICA! Por favor respondé este mensaje para coordinar la entrega de tu premio.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Contactar al Ganador por WhatsApp
                </a>
              </div>
            )}

            {!participanteGanador && (
              <div className="flex-1 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <p className="text-xs text-stone-500">
                  El número #{ganadorNumero} no tiene compra pagada asociada en el sistema. Verificá manualmente.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Formulario para cargar el ganador */
          <form onSubmit={handleCargarGanador} className="flex flex-col gap-4">
            {ganadorMessage && (
              <div
                className={`p-3.5 rounded-2xl text-xs flex items-start gap-2 ${
                  ganadorMessage.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {ganadorMessage.text}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Número Ganador (entre 1 y {data.sorteo.cantidad_numeros})
                </label>
                <input
                  type="number"
                  min={1}
                  max={data.sorteo.cantidad_numeros}
                  placeholder={`Ej: ${Math.floor(data.sorteo.cantidad_numeros / 2)}`}
                  value={ganadorInput}
                  onChange={(e) => setGanadorInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
                />
              </div>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-stone-600 select-none">
              <input
                type="checkbox"
                checked={ganadorConfirm}
                onChange={(e) => setGanadorConfirm(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded-md border-stone-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
              />
              <span>
                Entiendo que esta acción es <strong>irreversible</strong>. Una vez cargado el ganador,
                no podrá modificarse desde ningún lugar del sistema (RN-07).
              </span>
            </label>

            <div>
              <button
                type="submit"
                disabled={savingGanador || !ganadorInput}
                className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
              >
                <Trophy className="w-4 h-4" />
                {savingGanador ? "Cargando..." : "Cargar Número Ganador"}
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-rose-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-serif font-bold text-stone-900">
              Historial de dinámicas anteriores
            </h2>
            <p className="text-xs text-stone-500">
              Resultados cerrados y ganadores de ediciones previas.
            </p>
          </div>
        </div>

        {data.historial.length === 0 ? (
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-500 text-xs">
            Todavía no hay dinámicas cerradas en el historial.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {data.historial.map((item) => (
              <div key={item.id} className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/60 to-white p-4">
                <div className="flex items-center justify-between text-[11px] text-stone-500 mb-3">
                  <span>{new Date(item.ganador_cargado_at).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
                  <span className="bg-sage-100 text-sage-700 px-2 py-0.5 rounded-full font-medium">Finalizada</span>
                </div>
                <h3 className="text-sm font-semibold text-stone-800 line-clamp-2">{item.premio}</h3>
                <div className="mt-4 flex items-center justify-between border-t border-rose-100 pt-3 text-xs text-stone-500">
                  <span>Número ganador</span>
                  <span className="font-bold text-mica-700">#{String(item.numero_ganador).padStart(2, "0")}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Configuración del Sorteo (RN-02) */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-rose-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-serif font-bold text-stone-900">
              Configuración de la Dinámica Activa
            </h2>
            <p className="text-xs text-stone-500">
              Parámetros del premio, valor del número y topes de compra.
            </p>
          </div>

          {isBloqueado && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Configuración Bloqueada (RN-02)</span>
            </div>
          )}
        </div>

        {isBloqueado && (
          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-amber-900 text-xs mb-5 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Inmutabilidad activada (RN-02):</strong> Ya se registró el primer pago aprobado para
              esta dinámica. Los campos de premio, precio y cantidad de números quedan bloqueados para
              garantizar la transparencia legal hacia los compradores.
            </span>
          </div>
        )}

        {configMessage && (
          <div
            className={`p-3.5 rounded-2xl text-xs mb-5 ${
              configMessage.type === "success"
                ? "bg-sage-50 border border-sage-200 text-sage-800"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {configMessage.text}
          </div>
        )}

        <form onSubmit={handleSaveConfig} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Título de la Dinámica
            </label>
            <input
              type="text"
              disabled={isBloqueado}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-mica-400 focus:bg-white disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Descripción breve
            </label>
            <input
              type="text"
              disabled={isBloqueado}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-mica-400 focus:bg-white disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Nombre del Premio
            </label>
            <input
              type="text"
              disabled={isBloqueado}
              value={premio}
              onChange={(e) => setPremio(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-mica-400 focus:bg-white disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Precio por Número ($ ARS)
            </label>
            <input
              type="number"
              disabled={isBloqueado}
              value={precioNumero}
              onChange={(e) => setPrecioNumero(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-mica-400 focus:bg-white disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Tope Máx. por Compra (RN-08)
            </label>
            <input
              type="number"
              disabled={isBloqueado}
              value={topePorCompra}
              onChange={(e) => setTopePorCompra(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-mica-400 focus:bg-white disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed"
            />
          </div>

          {!isBloqueado && (
            <div className="sm:col-span-2 md:col-span-4 flex justify-end mt-2">
              <button
                type="submit"
                disabled={savingConfig}
                className="py-2.5 px-5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors cursor-pointer"
              >
                {savingConfig ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          )}
        </form>
      </section>

      {/* ═══════════ BOTÓN NUEVO SORTEO (Sección 9.4) ═══════════ */}
      {puedeAbrirNuevo && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-emerald-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                Abrir Nueva Dinámica
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                La dinámica actual está en estado &quot;{data.sorteo.estado}&quot;. Podés iniciar una nueva.
              </p>
            </div>
            {!showNuevoSorteo && (
              <button
                onClick={() => setShowNuevoSorteo(true)}
                className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Configurar Nueva Dinámica
              </button>
            )}
          </div>

          {showNuevoSorteo && (
            <form onSubmit={handleAbrirNuevoSorteo} className="flex flex-col gap-4">
              {nuevoMessage && (
                <div
                  className={`p-3.5 rounded-2xl text-xs flex items-start gap-2 ${
                    nuevoMessage.type === "success"
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {nuevoMessage.text}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Título de la Dinámica</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Gran Rifa Adonai"
                    value={nuevoTitulo}
                    onChange={(e) => setNuevoTitulo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Descripción breve</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Participá comprando tu número"
                    value={nuevaDescripcion}
                    onChange={(e) => setNuevaDescripcion(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Premio</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Fragancia + Set de Velas"
                    value={nuevoPremio}
                    onChange={(e) => setNuevoPremio(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Precio por Número ($ ARS)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={nuevoPrecio}
                    onChange={(e) => setNuevoPrecio(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Cantidad de Números</label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={10000}
                    value={nuevaCantidad}
                    onChange={(e) => setNuevaCantidad(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Tope por Compra (RN-08)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={nuevoTope}
                    onChange={(e) => setNuevoTope(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={savingNuevo}
                  className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {savingNuevo ? "Creando dinámica..." : "Crear y Activar Dinámica"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNuevoSorteo(false)}
                  className="py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      {/* Tabla de Participantes */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-rose-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-serif font-bold text-stone-900">
              Listado de Participantes
            </h2>
            <p className="text-xs text-stone-500">
              Compras registradas, estado de acreditación y números asignados.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Buscador */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por nombre, tel o #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-mica-400 focus:bg-white w-56 sm:w-64"
              />
            </div>

            {/* Exportar CSV */}
            <button
              onClick={handleExportCSV}
              className="py-2 px-3.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* Tabla Responsive */}
        <div className="overflow-x-auto rounded-2xl border border-stone-200/70">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50/80 text-stone-600 font-semibold border-b border-stone-200/80">
                <th className="py-3 px-4">Participante</th>
                <th className="py-3 px-4">Teléfono (WhatsApp)</th>
                <th className="py-3 px-4">Cant.</th>
                <th className="py-3 px-4">Números Asignados</th>
                <th className="py-3 px-4">Monto</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Contacto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredParticipantes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">
                    No se encontraron participantes que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredParticipantes.map((p) => {
                  const isEditingThisPhone = editingPhoneCompraId === p.compraId;
                  const isGanador = ganadorNumero !== undefined && ganadorNumero !== null && p.numeros.includes(ganadorNumero);
                  const mensajeWhatsapp = encodeURIComponent(
                    `Hola ${p.nombreCompleto}! Te escribimos desde Adonai BY TIENDA MICA en relación a tu compra de números (#${p.compraId.slice(
                      0,
                      8
                    )}) para la dinámica de ${data.sorteo.premio}.`
                  );

                  return (
                    <tr
                      key={p.compraId}
                      className={`hover:bg-rose-50/20 transition-colors ${isGanador ? "bg-amber-50/40" : ""}`}
                    >
                      <td className="py-3.5 px-4 font-semibold text-stone-800">
                        <div className="flex items-center gap-1.5">
                          {isGanador && <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                          {p.nombreCompleto}
                        </div>
                        <span className="block text-[10px] text-stone-400 font-normal">
                          {new Date(p.createdAt).toLocaleDateString("es-AR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      {/* Teléfono con edición manual (RN-11, Gap #6) */}
                      <td className="py-3.5 px-4">
                        {isEditingThisPhone ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="tel"
                              value={editedPhoneValue}
                              onChange={(e) => setEditedPhoneValue(e.target.value)}
                              className="w-28 px-2 py-1 bg-white border border-mica-400 rounded-lg text-xs"
                            />
                            <button
                              onClick={() => handleSavePhone(p.compraId)}
                              className="p-1 rounded-md bg-sage-600 text-white hover:bg-sage-700"
                              title="Guardar"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingPhoneCompraId(null)}
                              className="p-1 rounded-md bg-stone-200 text-stone-600 hover:bg-stone-300"
                              title="Cancelar"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-stone-600">
                            <span>{p.telefono}</span>
                            <button
                              onClick={() => handleStartEditPhone(p)}
                              className="text-stone-400 hover:text-mica-600 p-0.5"
                              title="Editar teléfono mal cargado (RN-11)"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-stone-600 font-medium">
                        {p.cantidad}
                      </td>

                      {/* Números correlativos asignados */}
                      <td className="py-3.5 px-4">
                        {p.numeros.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {p.numeros.map((n) => (
                              <span
                                key={n}
                                className={`px-2 py-0.5 rounded-md font-mono font-bold text-[11px] ${
                                  n === ganadorNumero
                                    ? "bg-amber-100 text-amber-800 ring-1 ring-amber-400"
                                    : "bg-rose-100/80 text-mica-800"
                                }`}
                              >
                                #{String(n).padStart(2, "0")}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-stone-400 text-[11px]">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-stone-800">
                        ${p.montoTotal.toLocaleString("es-AR")}
                      </td>

                      {/* Estado de Pago */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            p.estadoPago === "pagado"
                              ? "bg-emerald-100 text-emerald-800"
                              : p.estadoPago === "pendiente"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-stone-100 text-stone-500"
                          }`}
                        >
                          {p.estadoPago}
                        </span>
                      </td>

                      {/* Botón WhatsApp directo */}
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={`https://wa.me/549${p.telefono.replace(/\D/g, "")}?text=${mensajeWhatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold transition-colors"
                          title="Contactar al participante vía WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
