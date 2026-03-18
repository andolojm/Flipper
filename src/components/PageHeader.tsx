import type { ReactNode } from 'react';
import BackButton from '@/components/BackButton';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  legend?: ReactNode;
  titleSize?: string;
}

export default function PageHeader({ title, subtitle, legend, titleSize = 'text-4xl' }: PageHeaderProps) {
  return (
    <div className="flex items-start gap-3 mb-10">
      <div className="flex-1">
        <div className="flex items-stretch gap-3 mb-1">
          <BackButton />
          <h2 className={`${titleSize} font-semibold text-violet-600 dark:text-violet-400`}>{title}</h2>
        </div>
        {subtitle && (
          <p className="text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        )}
      </div>
      {legend}
    </div>
  );
}
