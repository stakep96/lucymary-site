export default function Loading() {
  return (
    <div className="shell loading-page" role="status" aria-label="Carregando produtos">
      <div className="loading-hero skeleton" />
      <div className="loading-heading skeleton" />
      <div className="product-grid" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="loading-card" key={index}>
            <div className="loading-image skeleton" />
            <div className="loading-line skeleton" />
            <div className="loading-line short skeleton" />
          </div>
        ))}
      </div>
      <span className="sr-only">Carregando produtos…</span>
    </div>
  );
}
