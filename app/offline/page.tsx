"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-dvh grid place-items-center bg-neutral-900 text-white">
      <div className="text-center space-y-5">
        <div className="mx-auto h-20 w-20 rounded-2xl" style={{ backgroundColor: "#0A66FF" }} />
        <h1 className="text-3xl font-bold">Você está off-line</h1>
        <p className="text-white/80">
          Sem internet no momento. Alguns dados locais continuam disponíveis.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            className="btn-primary !bg-white !text-black"
            onClick={() => location.reload()}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    </div>
  );
}
