import { useState } from "react";
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

// Tipo alinhado à API
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

const PIPELINE_COLUMNS = [
  { id: "lead", title: "Nouveau Lead" },
  { id: "visite", title: "Visite Technique" },
  { id: "devis", title: "Devis Envoyé" },
  { id: "relance", title: "Relance Client" },
  { id: "accepte", title: "Accepté" },
];

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const queryClient = useQueryClient();

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const pendingValue = projects
    .filter((p) => p.status !== "accepte")
    .reduce((sum, p) => sum + p.value, 0);
  const delayedValue = projects
    .filter((p) => p.daysInStatus > 14)
    .reduce((sum, p) => sum + p.value, 0);

  const handleUpdateStatus = () => {
    if (!selectedProject || !newStatus) return;
    updateProjectMutation.mutate({ id: selectedProject.id, status: newStatus });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <p className="text-rose-600">Erro ao carregar projetos. Verifique a ligação ao servidor.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-200">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
              Pre-Construction Tracker
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
              <div className="flex items-center gap-3 text-slate-500 mb-3">
                <Euro className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium uppercase tracking-wider">Devis Pendentes</span>
              </div>
              <div className="text-4xl font-bold text-slate-900 tracking-tight">
                {isLoading ? "—" : formatCurrency(pendingValue)}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-rose-100 shadow-[0_2px_10px_-3px_rgba(225,29,72,0.05)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
              <div className="flex items-center gap-3 text-rose-600 mb-3">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium uppercase tracking-wider">Sem resposta &gt; 14 dias</span>
              </div>
              <div className="text-4xl font-bold text-slate-900 tracking-tight">
                {isLoading ? "—" : formatCurrency(delayedValue)}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
              <div className="flex items-center gap-3 text-slate-500 mb-3">
                <Clock className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium uppercase tracking-wider">Tempo médio envio devis</span>
              </div>
              <div className="text-4xl font-bold text-slate-900 tracking-tight flex items-baseline gap-2">
                6 <span className="text-xl font-medium text-slate-500">dias</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {isLoading ? (
          <p className="text-slate-500">A carregar projetos…</p>
        ) : (
          <div className="flex gap-6 pb-8 overflow-x-auto">
            {PIPELINE_COLUMNS.map((column) => {
              const columnProjects = projects.filter((p) => p.status === column.id);
              const totalValue = columnProjects.reduce((sum, p) => sum + p.value, 0);

              return (
                <div key={column.id} className="w-[320px] flex-shrink-0 flex flex-col">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                      {column.title}
                    </h2>
                    <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                      {formatCurrency(totalValue)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {columnProjects.map((project) => {
                      const isDelayed = project.daysInStatus > 14;
                      return (
                        <div
                          key={project.id}
                          onClick={() => setSelectedProject(project)}
                          className={`
                            bg-white p-5 rounded-xl border cursor-pointer
                            transition-all duration-200 hover:shadow-md
                            relative z-20
                            ${
                              isDelayed
                                ? "border-rose-200 shadow-[0_2px_10px_-3px_rgba(225,29,72,0.1)]"
                                : "border-slate-200 shadow-sm hover:border-slate-300"
                            }
                          `}
                        >
                          <div className="flex justify-between items-start mb-2 pointer-events-none">
                            <span className="text-sm font-medium text-slate-500">{project.client}</span>
                            {isDelayed && (
                              <span className="flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                                <Clock className="w-3 h-3" />
                                {project.daysInStatus}d
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-semibold text-slate-900 mb-3 pointer-events-none">
                            {project.title}
                          </h3>
                          <div className="text-lg font-bold text-slate-700 tracking-tight pointer-events-none">
                            {formatCurrency(project.value)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
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
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl border-l border-slate-200 z-50 overflow-y-auto flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <h2 className="text-lg font-semibold text-slate-900">Ficha de Visita</h2>
                <button
                  onClick={() => {
                    setNewStatus("");
                    setSelectedProject(null);
                  }}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 flex-1 flex flex-col gap-8">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">{selectedProject.title}</h1>
                  <div className="text-xl font-semibold text-slate-600 mb-4">
                    {formatCurrency(selectedProject.value)}
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    {PIPELINE_COLUMNS.find((c) => c.id === selectedProject.status)?.title}
                    <span className="text-slate-400 font-normal ml-2">
                      ({selectedProject.daysInStatus} dias)
                    </span>
                  </div>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Cliente</h3>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                      <div className="font-medium text-slate-900">{selectedProject.client}</div>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Phone className="w-4 h-4 text-slate-400" />
                        {selectedProject.phone}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Mail className="w-4 h-4 text-slate-400" />
                        {selectedProject.email}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {selectedProject.location}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                      Especificações
                    </h3>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <Hammer className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-slate-900">Tipo de obra</div>
                          <div className="text-sm text-slate-600 mt-1">{selectedProject.type}</div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <FileText className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-slate-900">Medidas & Quantidades</div>
                          <div className="text-sm text-slate-600 mt-1 leading-relaxed">
                            {selectedProject.measures}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Calendar className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-slate-900">Data Prevista Devis</div>
                          <div className="text-sm text-slate-600 mt-1">
                            {selectedProject.expectedQuoteDate}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                      Observações
                    </h3>
                    <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100/50 text-sm text-slate-700 leading-relaxed">
                      {selectedProject.notes}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      Fotos da Visita
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-700 normal-case text-xs font-medium bg-blue-50 px-2 py-1 rounded"
                      >
                        Adicionar
                      </button>
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {(selectedProject.photoUrls?.length
                        ? selectedProject.photoUrls
                        : [null, null]
                      ).map((url, i) =>
                        url ? (
                          <div
                            key={i}
                            className="aspect-square rounded-lg border border-slate-200 bg-slate-100 overflow-hidden"
                          >
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div
                            key={i}
                            className="aspect-square bg-slate-100 rounded-lg border border-slate-200 border-dashed flex items-center justify-center text-slate-400"
                          >
                            <Camera className="w-6 h-6" />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-6 border-t border-slate-100 pb-8 space-y-3">
                  <label className="block text-sm font-medium text-slate-700">Novo estado</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    <option value="">— Escolher —</option>
                    {PIPELINE_COLUMNS.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.title}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleUpdateStatus}
                    disabled={!newStatus || updateProjectMutation.isPending}
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none text-white font-medium py-3 rounded-xl transition-colors shadow-sm"
                  >
                    {updateProjectMutation.isPending ? "A atualizar…" : "Atualizar Estado"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
