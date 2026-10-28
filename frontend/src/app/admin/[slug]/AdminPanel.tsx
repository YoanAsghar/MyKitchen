const AdminPanel = () => {
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-ink">Panel de administración</h1>
        <p className="mt-1 text-sm text-muted">
          Gestiona tu restaurante desde un único lugar.
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8 text-center shadow-sm">
        <p className="text-sm text-muted">Resumen y accesos rápidos próximamente.</p>
      </div>
    </div>
  );
};

export default AdminPanel;