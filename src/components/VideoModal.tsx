import { X } from 'lucide-react';

export default function VideoModal({ videoId, onClose }: { videoId: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#123c40]/70 p-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="MAYUR video player"
    >
      <div
        className="relative w-full max-w-4xl overflow-hidden rounded-[24px] border border-white/20 bg-black shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="focus-ring absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2.5 text-white transition hover:bg-black/80"
          aria-label="Close video"
        >
          <X size={22} />
        </button>
        <div className="relative aspect-video w-full">
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title="MAYUR cultural heritage video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
