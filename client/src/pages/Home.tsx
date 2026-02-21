import { useState, useMemo, useCallback, memo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Calendar,
  Phone,
  Mail,
  Camera,
  FileText,
  Hammer,
  AlertCircle,
  Clock,
  Euro,
  X,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { type Lang, t } from "@/lib/i18n";

type Project = {
  id: string;
  title: string;
  client: string;
  value: number;
  status: string;
  daysInStatus: number;
  type: string;
  location: string;
  phone: string;
  email: string;
  measures: string;
  notes: string;
  expectedQuoteDate: string;
  photoUrls?: string[];
};

const PIPELINE_IDS = ["lead", "visite", "devis", "relance", "accepte"] as const;

// Animações mais rápidas para fluidez (mantém o efeito, reduz duração)
const overlayTransition = { duration: 0.12 };
const panelTransition = { type: "tween" as const, duration: 0.2, ease: [0.25, 0.1, 0.25, 1] };

function statusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    lead: "bg-slate-100 text-slate-700 border-slate-200",
    visite: "bg-blue-50 text-blue-800 border-blue-200",
    devis: "bg-amber-50 text-amber-800 border-amber-200",
    relance: "bg-orange-50 text-orange-800 border-orange-200",
    accepte: "bg-emerald-50 text-emerald-800 border-emerald-200",
  };
  return map[status] ?? "bg-slate-100 text-slate-700 border-slate-200";
}

const ProjectCard = memo(function ProjectCard({
  project,
  isDelayed,
  formattedValue,
  daysShortLabel,
  onSelect,
}: {
  project: Project;
  isDelayed: boolean;
  formattedValue: string;
  daysShortLabel: string;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`
        bg-white p-5 rounded-xl border cursor-pointer
        transition-all duration-200 hover:shadow-md
        relative z-20
        ${isDelayed ? "border-rose-200 shadow-[0_2px_10px_-3px_rgba(225,29,72,0.1)]" : "border-slate-200 shadow-sm hover:border-slate-300"}
      `}
    >
      <div className="flex justify-between items-start mb-2 pointer-events-none">
        <span className="text-sm font-medium text-slate-500">{project.client}</span>
        {isDelayed && (
          <span className="flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            {project.daysInStatus}{daysShortLabel}
          </span>
        )}
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-3 pointer-events-none">{project.title}</h3>
      <div className="text-lg font-bold text-slate-700 tracking-tight pointer-events-none">{formattedValue}</div>
    </div>
  );
});

export default function Home() {
  const [lang, setLang] = useState<Lang>("fr");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const queryClient = useQueryClient();
  const T = t[lang];

  const { data: projects = [], isLoading, error } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/projects/${id}`, {
        status,
        daysInStatus: 0,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setNewStatus("");
      setSelectedProject(null);
    },
  });

  const formatCurrency = useCallback(
    (value: number) =>
      new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "pt-PT", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(value),
    [lang]
  );

  const pendingValue = useMemo(
    () => projects.filter((p) => p.status !== "accepte").reduce((sum, p) => sum + p.value, 0),
    [projects]
  );
  const delayedValue = useMemo(
    () => projects.filter((p) => p.daysInStatus > 14).reduce((sum, p) => sum + p.value, 0),
    [projects]
  );

  const columnsData = useMemo(
    () =>
      PIPELINE_IDS.map((columnId) => {
        const columnProjects = projects.filter((p) => p.status === columnId);
        return {
          columnId,
          columnProjects,
          totalValue: columnProjects.reduce((sum, p) => sum + p.value, 0),
          columnTitle: t[lang].pipelineColumn(columnId),
        };
      }),
    [projects, lang]
  );

  const handleUpdateStatus = () => {
    if (!selectedProject || !newStatus) return;
    updateProjectMutation.mutate({ id: selectedProject.id, status: newStatus });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <p className="text-rose-600">{T.errorLoad}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-200">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
              {T.appTitle}
            </h1>
            <div className="flex gap-1 rounded-lg border border-slate-200 p-0.5 bg-slate-50">
              <button
                type="button"
                onClick={() => setLang("fr")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${lang === "fr" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => setLang("pt")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${lang === "pt" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                PT
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
              <div className="flex items-center gap-3 text-slate-500 mb-3">
                <Euro className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium uppercase tracking-wider">{T.kpiPending}</span>
              </div>
              <div className="text-4xl font-bold text-slate-900 tracking-tight">
                {isLoading ? "—" : formatCurrency(pendingValue)}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-rose-100 shadow-[0_2px_10px_-3px_rgba(225,29,72,0.05)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
              <div className="flex items-center gap-3 text-rose-600 mb-3">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium uppercase tracking-wider">{T.kpiNoReply}</span>
              </div>
              <div className="text-4xl font-bold text-slate-900 tracking-tight">
                {isLoading ? "—" : formatCurrency(delayedValue)}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
              <div className="flex items-center gap-3 text-slate-500 mb-3">
                <Clock className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium uppercase tracking-wider">{T.kpiAvgDays}</span>
              </div>
              <div className="text-4xl font-bold text-slate-900 tracking-tight flex items-baseline gap-2">
                6 <span className="text-xl font-medium text-slate-500">{T.days}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {isLoading ? (
          <p className="text-slate-500">{T.loading}</p>
        ) : (
          <div className="flex gap-6 pb-8 overflow-x-auto">
            {columnsData.map(({ columnId, columnProjects, totalValue, columnTitle }) => (
              <div key={columnId} className="w-[320px] flex-shrink-0 flex flex-col">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">{columnTitle}</h2>
                  <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                    {formatCurrency(totalValue)}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {columnProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      isDelayed={project.daysInStatus > 14}
                      formattedValue={formatCurrency(project.value)}
                      daysShortLabel={T.daysShort}
                      onSelect={() => setSelectedProject(project)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedProject && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={overlayTransition}
              onClick={() => {
                setNewStatus("");
                setSelectedProject(null);
              }}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "100%", opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.5 }}
              transition={panelTransition}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-50/80 shadow-2xl border-l border-slate-200 z-50 overflow-y-auto flex flex-col"
            >
              {/* Header fixo com título do projeto */}
              <div className="sticky top-0 z-10 flex items-center justify-between gap-4 p-4 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
                <h2 className="text-base font-semibold text-slate-800 truncate">{T.visitSheet}</h2>
                <button
                  type="button"
                  onClick={() => { setNewStatus(""); setSelectedProject(null); }}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors shrink-0"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 flex-1 flex flex-col gap-6">
                {/* Título + valor + estado */}
                <div className="space-y-3">
                  <h1 className="text-xl font-bold text-slate-900 leading-tight">{selectedProject.title}</h1>
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-2xl font-bold text-slate-900">{formatCurrency(selectedProject.value)}</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadgeClass(selectedProject.status)}`}>
                      {T.pipelineColumn(selectedProject.status)}
                      <span className="opacity-80">·</span>
                      <span className="font-normal">{selectedProject.daysInStatus} {T.days}</span>
                    </span>
                  </div>
                </div>

                {/* Cliente + ações de contacto */}
                <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{T.client}</h3>
                  <p className="font-semibold text-slate-900 mb-3">{selectedProject.client}</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <a
                      href={`tel:${selectedProject.phone.replace(/\s/g, "")}`}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      {T.call}
                    </a>
                    <a
                      href={`mailto:${selectedProject.email}`}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      {T.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{selectedProject.location}</span>
                  </div>
                </section>

                {/* Especificações */}
                <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm border-l-4 border-l-blue-400">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{T.specs}</h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <Hammer className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-slate-500">{T.workType}</div>
                        <div className="text-slate-900 mt-0.5">{selectedProject.type}</div>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <FileText className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-slate-500">{T.measures}</div>
                        <div className="text-slate-700 mt-0.5 leading-relaxed">{selectedProject.measures}</div>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <Calendar className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-slate-500">{T.expectedQuoteDate}</div>
                        <div className="text-slate-900 mt-0.5">{selectedProject.expectedQuoteDate}</div>
                      </div>
                    </li>
                  </ul>
                </section>

                {/* Observações */}
                <section className="rounded-xl border border-amber-200/60 bg-amber-50/60 p-4">
                  <h3 className="text-xs font-semibold text-amber-700/80 uppercase tracking-wider mb-2">{T.notes}</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">{selectedProject.notes}</p>
                </section>

                {/* Fotos */}
                <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{T.visitPhotos}</h3>
                    <button type="button" className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                      {T.add}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(selectedProject.photoUrls?.length ? selectedProject.photoUrls : [null, null]).map((url, i) =>
                      url ? (
                        <div key={i} className="aspect-square rounded-lg border border-slate-200 overflow-hidden bg-slate-100">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div key={i} className="aspect-square rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-1 text-slate-400">
                          <Camera className="w-8 h-8" />
                          <span className="text-xs">{T.add}</span>
                        </div>
                      )
                    )}
                  </div>
                </section>

                {/* Atualizar estado */}
                <section className="mt-2 pt-5 border-t border-slate-200 space-y-3 pb-6">
                  <label className="block text-sm font-semibold text-slate-700">{T.newStatus}</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  >
                    <option value="">{T.choose}</option>
                    {PIPELINE_IDS.map((id) => (
                      <option key={id} value={id}>{T.pipelineColumn(id)}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleUpdateStatus}
                    disabled={!newStatus || updateProjectMutation.isPending}
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none text-white font-semibold py-3.5 rounded-xl transition-colors shadow-sm"
                  >
                    {updateProjectMutation.isPending ? T.updating : T.updateStatus}
                  </button>
                </section>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
