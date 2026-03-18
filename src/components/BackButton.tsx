import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      aria-label="Go back"
      className="self-stretch px-2.5 rounded-md border border-violet-500/50 text-violet-500 dark:text-violet-400 bg-transparent hover:border-violet-400 hover:text-violet-400 dark:hover:border-violet-300 dark:hover:text-violet-300 active:bg-violet-500/10 transition-colors"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
    </button>
  );
}
