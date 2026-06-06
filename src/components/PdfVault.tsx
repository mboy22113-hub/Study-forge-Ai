import React, { useState } from 'react';
import { FileText, Plus, BookOpen, Clock, Trash, ChevronLeft, ChevronRight, Search, Check, Sparkles } from 'lucide-react';
import { PdfFile, AcademicSubject } from '../types';

interface PdfVaultProps {
  pdfs: PdfFile[];
  subjects: AcademicSubject[];
  onUploadPdf: (subjectId: string, name: string, totalPages: number) => void;
  onUpdatePdfPage: (pdfId: string, page: number) => void;
  onUpdatePdfReadingTime: (pdfId: string, mins: number) => void;
  onDeletePdf: (pdfId: string) => void;
  awardXp: (amount: number) => void;
  showToast: (msg: string) => void;
}

export default function PdfVault({
  pdfs,
  subjects,
  onUploadPdf,
  onUpdatePdfPage,
  onUpdatePdfReadingTime,
  onDeletePdf,
  awardXp,
  showToast
}: PdfVaultProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [pdfNameInput, setPdfNameInput] = useState("");
  const [totalPagesInput, setTotalPagesInput] = useState(32);
  const [activePdfId, setActivePdfId] = useState<string | null>(null);
  
  // PDF Text simulation database for mock search inside PDF
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ page: number; snippet: string }> | null>(null);

  const activePdf = pdfs.find(p => p.id === activePdfId);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) {
      showToast("⚠️ Select an Academic Subject first.");
      return;
    }
    if (!pdfNameInput.trim()) {
      showToast("⚠️ Give your document a valid identifier.");
      return;
    }

    onUploadPdf(selectedSubjectId, pdfNameInput.trim(), totalPagesInput);
    setPdfNameInput("");
    awardXp(50);
    showToast(`📄 Bound "${pdfNameInput.trim()}" to subject vaults! +50 XP`);
  };

  const handlePageChange = (direction: 'next' | 'prev') => {
    if (!activePdf) return;
    let target = activePdf.currentPage;
    if (direction === 'next' && activePdf.currentPage < activePdf.totalPages) {
      target++;
    } else if (direction === 'prev' && activePdf.currentPage > 1) {
      target--;
    }

    onUpdatePdfPage(activePdf.id, target);
    
    // Periodically award small XP for study engagement
    if (target % 5 === 0) {
      awardXp(15);
      showToast("📖 Deep recall triggered. Marked 5 pages! +15 XP");
    }

    // Increment simulated reading time values
    onUpdatePdfReadingTime(activePdf.id, 1); // Mock 1 min spent
  };

  const handleSearch = () => {
    if (!searchQuery.trim() || !activePdf) return;

    // Simulate search match calculations
    const terms = ["entropy", "probability", "normalization", "quantum", "operators", "uncertainty", "momentum", "spin", "wave"];
    const matches = [];
    const seed = Math.floor(Math.random() * 3) + 1; // Always return a few mock snippets

    for (let i = 0; i < seed; i++) {
      const pageNum = Math.floor(Math.random() * activePdf.totalPages) + 1;
      matches.push({
        page: pageNum,
        snippet: `...found highly correlated parameters verifying ${searchQuery} calculations on key metrics...`
      });
    }

    setSearchResults(matches);
    awardXp(5);
  };

  const getSubjectName = (subId: string) => {
    return subjects.find(s => s.id === subId)?.title || "General studies";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold text-blue-400 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Academic Archive</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white">Interactive PDF Vault</h3>
          <p className="text-slate-400 text-sm">
            Keep your syllabi, textbooks, and mock sheets unified. Click on any document below to open the digital reading canvas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document upload / Selector column */}
        <div className="space-y-4">
          <form onSubmit={handleUpload} className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl space-y-4">
            <h4 className="text-sm font-bold text-slate-200">Catalog PDF Document</h4>
            
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 uppercase tracking-widest font-black">Link Subject</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-blue-500/50"
              >
                <option className="bg-[#0A0A0A]" value="">-- Choose Target Subject --</option>
                {subjects.map(s => (
                  <option key={s.id} className="bg-[#0A0A0A]" value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 uppercase tracking-widest font-black">Document Title</label>
              <input
                type="text"
                placeholder="e.g. quantum_box_derivation.pdf"
                value={pdfNameInput}
                onChange={(e) => setPdfNameInput(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-blue-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 uppercase tracking-widest font-black">Total Pages Estimate</label>
              <input
                type="number"
                min={1}
                max={999}
                value={totalPagesInput}
                onChange={(e) => setTotalPagesInput(parseInt(e.target.value, 10))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-blue-500/50"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10"
            >
              <Plus className="w-4 h-4" />
              <span>Bind PDF Document</span>
            </button>
          </form>

          {/* List cataloged PDFs */}
          <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl space-y-3">
            <h4 className="text-sm font-bold text-slate-200 mb-2">Academic Ledger</h4>
            {pdfs.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No textbooks mapped yet. Link your first study guide above!</p>
            ) : (
              <div className="space-y-2.5">
                {pdfs.map((pdf) => {
                  const isActive = pdf.id === activePdfId;
                  const progress = Math.round((pdf.currentPage / pdf.totalPages) * 100);
                  return (
                    <div
                      key={pdf.id}
                      onClick={() => setActivePdfId(pdf.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isActive
                          ? 'bg-blue-500/10 border-blue-500/30'
                          : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-3">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <p className="text-xs font-black text-white truncate">{pdf.name}</p>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{getSubjectName(pdf.subjectId)}</p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-2">
                          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> Page {pdf.currentPage}/{pdf.totalPages}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {pdf.readingTime}m read</span>
                        </div>
                        {/* Progress line */}
                        <div className="w-full h-1 bg-slate-800 rounded-full mt-2.5 overflow-hidden">
                          <div className="bg-blue-400 h-full transition-all" style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePdf(pdf.id);
                          if (activePdfId === pdf.id) setActivePdfId(null);
                        }}
                        className="p-1 px-1.5 opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 text-rose-400 rounded-md transition-all text-xs"
                        title="Delete Document"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Reader Canvas Column */}
        <div className="lg:col-span-2">
          {activePdf ? (
            <div className="bg-[#09090B] border border-white/10 rounded-2xl flex flex-col min-h-[480px] overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b border-white/10 bg-white/[0.01] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-white">{activePdf.name}</h4>
                  <p className="text-[11px] text-slate-500">{getSubjectName(activePdf.subjectId)}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>Time focused: <strong>{activePdf.readingTime} Minutes</strong></span>
                </div>
              </div>

              {/* Reader Simulation Frame */}
              <div className="flex-1 p-6 flex flex-col justify-between space-y-6 relative bg-gradient-to-b from-[#0F0F12] to-[#0D0D10]">
                {/* Simulated Canvas Page Text */}
                <div className="bg-[#121217] p-6 rounded-2xl border border-white/5 space-y-4 shadow-inner">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 uppercase tracking-widest font-bold">
                    <span>Textbook Section {Math.ceil(activePdf.currentPage / 5)}</span>
                    <span>Page {activePdf.currentPage} of {activePdf.totalPages}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100">
                    Syllabus Block {activePdf.currentPage}: Core Scientific Concepts
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    This academic document covers important principles of study. On this page, we verify equations, derivations, and mathematical parameters to build solid neural understanding. Note how changing parameters adjusts the results. This represents standard curriculum guidelines designed to strengthen physical comprehension.
                  </p>
                  <p className="text-slate-400 text-xs leading-relaxed italic">
                    "Verify baseline parameters carefully. Integrating complex equations requires steady mental focus blocks."
                  </p>
                </div>

                {/* Inline Search Panel */}
                <div className="space-y-2 bg-[#121217]/50 p-4 rounded-xl border border-slate-800">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search key formulas (e.g. quantum, wave...)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
                    />
                    <button
                      onClick={handleSearch}
                      className="p-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white transition-colors"
                    >
                      <Search className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {searchResults && (
                    <div className="max-h-24 overflow-y-auto space-y-1.5 pt-1.5 border-t border-slate-800/60 leading-tight">
                      {searchResults.map((res, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            onUpdatePdfPage(activePdf.id, res.page);
                            setSearchResults(null);
                            setSearchQuery("");
                          }}
                          className="text-[10px] text-slate-400 hover:text-blue-300 cursor-pointer p-1 rounded hover:bg-white/5 flex items-center justify-between"
                        >
                          <span className="truncate">{res.snippet}</span>
                          <span className="text-blue-400 font-bold shrink-0 ml-2">Page {res.page}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Page Action Controls */}
                <div className="flex items-center justify-between mt-auto pt-2">
                  <button
                    onClick={() => handlePageChange('prev')}
                    disabled={activePdf.currentPage <= 1}
                    className="p-2 bg-white/5 hover:bg-white/10 disabled:opacity-40 rounded-xl transition-all flex items-center gap-1.5 text-xs text-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="text-center">
                    <span className="text-xs font-black text-white">
                      Page {activePdf.currentPage} / {activePdf.totalPages}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {Math.round((activePdf.currentPage / activePdf.totalPages) * 100)}% Syllabus Covered
                    </p>
                  </div>

                  <button
                    onClick={() => handlePageChange('next')}
                    disabled={activePdf.currentPage >= activePdf.totalPages}
                    className="p-2 bg-white/5 hover:bg-white/10 disabled:opacity-40 rounded-xl transition-all flex items-center gap-1.5 text-xs text-white"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#09090B]/60 backdrop-blur-xl border border-white/10 rounded-2xl min-h-[480px] flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <FileText className="w-12 h-12 text-slate-700 animate-pulse mb-3" />
              <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">Canvas Suspended</h4>
              <p className="text-xs max-w-sm">Select a document from your list or bind a new PDF to open the reader canvas with live page indicators.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
