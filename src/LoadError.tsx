interface LoadErrorProps {
  message: string;
  onRetry: () => void;
}

export function LoadError({ message, onRetry }: LoadErrorProps) {
  return (
    <div className="load-error">
      <p role="alert">{message}</p>
      <button type="button" onClick={onRetry}>Reintentar</button>
    </div>
  );
}
