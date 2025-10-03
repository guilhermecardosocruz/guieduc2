export default function Offline() {
  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <div className="card text-center">
        <h1 className="form-title">Você está offline</h1>
        <p className="form-subtitle">Algumas funções podem não estar disponíveis. Tente novamente quando a conexão voltar.</p>
      </div>
    </div>
  );
}
