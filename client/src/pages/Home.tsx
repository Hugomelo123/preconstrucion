import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
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
  X
} from "lucide-react";

// Types
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
};

// Mock Data
const PIPELINE_COLUMNS = [
  { id: "lead", title: "Nouveau Lead" },
  { id: "visite", title: "Visite Technique" },
  { id: "devis", title: "Devis Envoyé" },
  { id: "relance", title: "Relance Client" },
  { id: "accepte", title: "Accepté" },
];

const PROJECTS: Project[] = [
  {
    id: "p1",
    title: "Isolation façade",
    client: "Jean Dupont",
    value: 38500,
    status: "lead",
    daysInStatus: 2,
    type: "Rénovation Extérieure",
    location: "Lyon, 69003",
    phone: "06 12 34 56 78",
    email: "jean.dupont@email.com",
    measures: "Surface estimée: 120m2. Échafaudage nécessaire sur 2 faces.",
    notes: "Client très intéressé par les aides d'état (MaPrimeRénov'). À mentionner lors de la visite.",
    expectedQuoteDate: "-",
  },
  {
    id: "p2",
    title: "Rénovation toiture",
    client: "Marie Martin",
    value: 62000,
    status: "visite",
    daysInStatus: 5,
    type: "Couverture",
    location: "Villeurbanne, 69100",
    phone: "06 98 76 54 32",
    email: "m.martin@email.com",
    measures: "Toiture 2 pans, 150m2. Remplacement tuiles + isolation rampants.",
    notes: "Accès difficile par la cour arrière. Prévoir nacelle spécifique.",
    expectedQuoteDate: "15 Oct 2023",
  },
  {
    id: "p3",
    title: "Extension maison",
    client: "Famille Dubois",
    value: 85000,
    status: "devis",
    daysInStatus: 16, // Alert!
    type: "Gros Oeuvre",
    location: "Écully, 69100",
    phone: "06 11 22 33 44",
    email: "famille.dubois@email.com",
    measures: "Extension ossature bois 35m2 sur dalle béton.",
    notes: "Permis de construire déjà validé. En attente de notre devis pour accord banque.",
    expectedQuoteDate: "Envoyé le 01 Oct 2023",
  },
  {
    id: "p4",
    title: "Aménagement combles",
    client: "Luc Bernard",
    value: 45000,
    status: "relance",
    daysInStatus: 8,
    type: "Aménagement Intérieur",
    location: "Bron, 69500",
    phone: "07 55 66 77 88",
    email: "l.bernard@email.com",
    measures: "Création de 2 chambres et 1 SDB. Surface plancher 60m2.",
    notes: "A demandé une modification sur le choix des velux (plus grands).",
    expectedQuoteDate: "Envoyé le 10 Oct 2023",
  },
  {
    id: "p5",
    title: "Rénovation complète appartement",
    client: "Sophie Leroy",
    value: 110000,
    status: "accepte",
    daysInStatus: 1,
    type: "Rénovation Globale",
    location: "Lyon, 69006",
    phone: "06 44 55 66 77",
    email: "sophie.leroy@email.com",
    measures: "Appartement 85m2. Démolition cloisons, refonte élec/plomberie, sols, peintures.",
    notes: "Acompte de 30% reçu. Début des travaux prévu le 15 Nov.",
    expectedQuoteDate: "Signé le 16 Oct 2023",
  },
  {
    id: "p6",
    title: "Changement menuiseries",
    client: "Pierre Morel",
    value: 18000,
    status: "visite",
    daysInStatus: 1,
    type: "Menuiserie",
    location: "Vénissieux, 69200",
    phone: "06 22 33 44 55",
    email: "p.morel@email.com",
    measures: "5 fenêtres standard, 2 portes-fenêtres, 1 porte d'entrée.",
    notes: "Souhaite de l'alu gris anthracite extérieur, blanc intérieur.",
    expectedQuoteDate: "20 Oct 2023",
  },
  {
    id: "p7",
    title: "Création terrasse béton",
    client: "Antoine Roux",
    value: 12500,
    status: "devis",
    daysInStatus: 18, // Alert!
    type: "Maçonnerie",
    location: "Saint-Priest, 69800",
    phone: "06 33 44 55 66",
    email: "a.roux@email.com",
    measures: "Terrasse 40m2 avec fondations et escalier 3 marches.",
    notes: "Devis envoyé il y a plus de 2 semaines, pas de retour malgré messages.",
    expectedQuoteDate: "Envoyé le 28 Sep 2023",
  }
];

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-200">
      
      {/* 1. Top Section - Realidade Financeira */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-slate-800 tracking-tight">Example – Pre-Construction Tracking</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* KPI 1 */}
            <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
              <div className="flex items-center gap-3 text-slate-500 mb-3">
                <Euro className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium uppercase tracking-wider">Devis Pendentes</span>
              </div>
              <div className="text-4xl font-bold text-slate-900 tracking-tight">
                620 000 €
              </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-white rounded-xl p-6 border border-rose-100 shadow-[0_2px_10px_-3px_rgba(225,29,72,0.05)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
              <div className="flex items-center gap-3 text-rose-600 mb-3">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium uppercase tracking-wider">Sem resposta &gt; 14 dias</span>
              </div>
              <div className="text-4xl font-bold text-slate-900 tracking-tight">
                210 000 €
              </div>
            </div>

            {/* KPI 3 */}
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

      {/* 2. Middle Section - Pipeline */}
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="flex gap-6 pb-8 overflow-x-auto">
          {PIPELINE_COLUMNS.map((column) => {
            const columnProjects = PROJECTS.filter(p => p.status === column.id);
            const totalValue = columnProjects.reduce((sum, p) => sum + p.value, 0);

            return (
              <div key={column.id} className="w-[320px] flex-shrink-0 flex flex-col">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">{column.title}</h2>
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
                        onClick={() => {
                          console.log("Clicking project:", project.id);
                          setSelectedProject(project);
                        }}
                        className={`
                          bg-white p-5 rounded-xl border cursor-pointer
                          transition-all duration-200 hover:shadow-md
                          relative z-20
                          ${isDelayed 
                            ? 'border-rose-200 shadow-[0_2px_10px_-3px_rgba(225,29,72,0.1)]' 
                            : 'border-slate-200 shadow-sm hover:border-slate-300'}
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
                        <h3 className="text-base font-semibold text-slate-900 mb-3 pointer-events-none">{project.title}</h3>
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
      </main>

      {/* 3. Modal / Side Panel - Ficha de Visita */}
      <AnimatePresence>
        {selectedProject && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
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
                  onClick={() => setSelectedProject(null)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 flex-1 flex flex-col gap-8">
                {/* Header Info */}
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">{selectedProject.title}</h1>
                  <div className="text-xl font-semibold text-slate-600 mb-4">{formatCurrency(selectedProject.value)}</div>
                  
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    {PIPELINE_COLUMNS.find(c => c.id === selectedProject.status)?.title}
                    <span className="text-slate-400 font-normal ml-2">({selectedProject.daysInStatus} dias)</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid gap-6">
                  {/* Client */}
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

                  {/* Project Specs */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Especificações</h3>
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
                          <div className="text-sm text-slate-600 mt-1 leading-relaxed">{selectedProject.measures}</div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Calendar className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-slate-900">Data Prevista Devis</div>
                          <div className="text-sm text-slate-600 mt-1">{selectedProject.expectedQuoteDate}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Observations */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Observações</h3>
                    <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100/50 text-sm text-slate-700 leading-relaxed">
                      {selectedProject.notes}
                    </div>
                  </div>

                  {/* Photos Placeholder */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      Fotos da Visita
                      <button className="text-blue-600 hover:text-blue-700 normal-case text-xs font-medium bg-blue-50 px-2 py-1 rounded">
                        Adicionar
                      </button>
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="aspect-square bg-slate-100 rounded-lg border border-slate-200 border-dashed flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div className="aspect-square bg-slate-100 rounded-lg border border-slate-200 border-dashed flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer">
                        <Camera className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Bottom Action Area */}
                <div className="mt-4 pt-6 border-t border-slate-100 pb-8">
                  <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition-colors shadow-sm">
                    Atualizar Estado
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
