"use client";

export default function ShareButtons({ text, url }: { text: string; url: string }) {
  const share = (platform: "whatsapp" | "twitter" | "facebook" | "copy") => {
    const msg = `${text} ${url}`;
    if (platform === "copy") {
      navigator.clipboard.writeText(msg);
      alert("¡Enlace copiado!");
      return;
    }
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(msg)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
    };
    window.open(urls[platform], "_blank", "width=600,height=500");
  };

  return (
    <div className="mt-10 space-y-3">
      <p className="text-center font-semibold">Comparte tu resultado:</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => share("whatsapp")}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-3 rounded-full font-semibold transition-all"
        >
          💬 WhatsApp
        </button>
        <button
          onClick={() => share("twitter")}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-3 rounded-full font-semibold transition-all"
        >
          𝕏 Twitter
        </button>
        <button
          onClick={() => share("facebook")}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-3 rounded-full font-semibold transition-all"
        >
          📘 Facebook
        </button>
        <button
          onClick={() => share("copy")}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-3 rounded-full font-semibold transition-all"
        >
          🔗 Copiar
        </button>
      </div>
    </div>
  );
}
