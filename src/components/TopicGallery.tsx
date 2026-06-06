import React, { useState } from 'react';
import { Image as ImageIcon, Plus, ZoomIn, Trash, Edit3, X, Sparkles, FolderOpen } from 'lucide-react';
import { GalleryImage, AcademicSubject } from '../types';

interface TopicGalleryProps {
  images: GalleryImage[];
  subjects: AcademicSubject[];
  onAddImage: (subjectId: string, chapter: string, title: string, dataUrl: string) => void;
  onRenameImage: (id: string, newTitle: string) => void;
  onDeleteImage: (id: string) => void;
  awardXp: (amount: number) => void;
  showToast: (msg: string) => void;
}

export default function TopicGallery({
  images,
  subjects,
  onAddImage,
  onRenameImage,
  onDeleteImage,
  awardXp,
  showToast
}: TopicGalleryProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [chapterInput, setChapterInput] = useState("");
  const [imageTitle, setImageTitle] = useState("");
  
  // Base64 image payload logic
  const [base64File, setBase64File] = useState<string>("");
  
  // Zoom Viewer states
  const [fullscreenImage, setFullscreenImage] = useState<GalleryImage | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [newTitleVal, setNewTitleVal] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setBase64File(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) {
      showToast("⚠️ Assign your diagram to an Academic Subject.");
      return;
    }
    if (!chapterInput.trim()) {
      showToast("⚠️ Specify the associated Subject Chapter.");
      return;
    }
    if (!imageTitle.trim()) {
      showToast("⚠️ Provide a title description.");
      return;
    }

    // Default sample image fallback if base64 file is not uploaded
    const filePayload = base64File || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'><rect width='400' height='250' fill='%23121217'/><text x='110' y='130' fill='%233B82F6' font-family='monospace' font-size='16'>STUDYFORGE VECTOR SCHEMATIC</text></svg>";

    onAddImage(selectedSubjectId, chapterInput.trim(), imageTitle.trim(), filePayload);
    
    setImageTitle("");
    setChapterInput("");
    setBase64File("");
    awardXp(60);
    showToast(`🖼 Added diagram "${imageTitle.trim()}" to topic collections! +60 XP`);
  };

  const startRename = (img: GalleryImage) => {
    setRenameId(img.id);
    setNewTitleVal(img.title);
  };

  const saveRename = (id: string) => {
    if (!newTitleVal.trim()) return;
    onRenameImage(id, newTitleVal.trim());
    setRenameId(null);
    showToast("✏️ Diagram title redefined.");
  };

  const getSubjectName = (subId: string) => {
    return subjects.find(s => s.id === subId)?.title || "General";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold text-amber-400 mb-2">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Interactive Visualizer</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white">Topic Screen & Mind Map Gallery</h3>
          <p className="text-slate-400 text-sm">
            Keep formulas, mental maps, and notes photos arranged by chapter. Zoom inside key areas to construct visual understanding.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Upload form Panel */}
        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl h-fit space-y-4">
          <h4 className="text-sm font-bold text-slate-200">Catalog Diagram Asset</h4>

          <form onSubmit={handleUpload} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 uppercase tracking-widest font-black">Link Subject</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-amber-500/50"
              >
                <option className="bg-[#0A0A0A]" value="">-- Choose Subject --</option>
                {subjects.map(s => (
                  <option key={s.id} className="bg-[#0A0A0A]" value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 uppercase tracking-widest font-black">Chapter Reference</label>
              <input
                type="text"
                placeholder="e.g. Chapter 1: Foundations"
                value={chapterInput}
                onChange={(e) => setChapterInput(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 uppercase tracking-widest font-black">Diagram Title</label>
              <input
                type="text"
                placeholder="e.g. UV Catastrophe Proof Model"
                value={imageTitle}
                onChange={(e) => setImageTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="text-xs text-slate-400 uppercase tracking-widest font-black block">Choose image file (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-black hover:file:bg-amber-400 cursor-pointer w-full"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
            >
              <Plus className="w-4 h-4" />
              <span>Catalog Mind Map</span>
            </button>
          </form>
        </div>

        {/* Gallery Display column */}
        <div className="lg:col-span-3">
          {images.length === 0 ? (
            <div className="bg-[#09090B]/60 border border-white/10 p-12 rounded-3xl text-center text-slate-500 flex flex-col items-center justify-center">
              <ImageIcon className="w-12 h-12 text-slate-700 mb-3 animate-pulse" />
              <h4 className="text-sm font-black text-white uppercase tracking-widest">Gallery Unseeded</h4>
              <p className="text-xs mt-1">Catalog your screenshots, notebooks, or formula guides to populate clean dashboard tiles.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl hover:border-white/10 transition-all flex flex-col justify-between group overflow-hidden"
                >
                  <div className="relative rounded-xl overflow-hidden aspect-video bg-black/40 flex items-center justify-center">
                    <img
                      src={img.dataUrl}
                      alt={img.title}
                      referrerPolicy="no-referrer"
                      className="object-cover w-full h-full group-hover:scale-105 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                      <button
                        onClick={() => { setFullscreenImage(img); setZoomLevel(1); }}
                        className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                        title="Zoom / Fullscreen"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => startRename(img)}
                        className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                        title="Rename Diagram"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteImage(img.id)}
                        className="p-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-xl transition-colors"
                        title="Delete Diagram"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 space-y-1">
                    {renameId === img.id ? (
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={newTitleVal}
                          onChange={(e) => setNewTitleVal(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded px-2 py-0.5 text-xs text-white"
                        />
                        <button
                          onClick={() => saveRename(img.id)}
                          className="bg-emerald-500 hover:bg-emerald-400 text-black px-1.5 py-0.5 text-[10px] uppercase font-black rounded"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <h5 className="text-xs font-bold text-slate-100 truncate">{img.title}</h5>
                    )}
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                      <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
                      <span>{img.chapter}</span>
                    </div>
                    <p className="text-[9px] text-slate-500 mt-0.5">{getSubjectName(img.subjectId)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Zoom overlay Modal */}
      {fullscreenImage && (
        <div className="fixed inset-0 bg-black/90 z-50 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="absolute top-4 right-4 flex items-center gap-3">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.5, 3))}
              className="p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase"
              title="Zoom In"
            >
              Zoom In ({zoomLevel}x)
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase"
              title="Reset Zoom"
            >
              Reset
            </button>
            <button
              onClick={() => setFullscreenImage(null)}
              className="p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl"
              title="Dismiss Canvas"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="max-w-4xl max-h-[80vh] overflow-auto rounded-3xl border border-white/15 bg-black/40 p-2 flex items-center justify-center shadow-2xl">
            <img
              src={fullscreenImage.dataUrl}
              alt={fullscreenImage.title}
              referrerPolicy="no-referrer"
              style={{ transform: `scale(${zoomLevel})` }}
              className="max-h-[70vh] object-contain transition-transform"
            />
          </div>

          <div className="text-center mt-4">
            <h4 className="text-sm font-black text-white">{fullscreenImage.title}</h4>
            <p className="text-xs text-slate-400 mt-0.5">{fullscreenImage.chapter} — {getSubjectName(fullscreenImage.subjectId)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
