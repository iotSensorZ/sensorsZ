// components/ui/card.tsx
import { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

type CardContentProps = {
  children: ReactNode;
};

type CardTitleProps = {
  children: ReactNode;
};

type CardDescriptionProps = {
  children: ReactNode;
};

export const Card = ({ children, className, onClick }: CardProps) => (
  <div onClick={onClick} className={`rounded-lg shadow-md p-4 ${className} ${onClick ? 'cursor-pointer' : ''}`}>
    {children}
  </div>
);

export const CardContent = ({ children }: CardContentProps) => (
  <div className="p-4">{children}</div>
);

export const CardTitle = ({ children }: CardTitleProps) => (
  <h3 className="text-lg font-bold">{children}</h3>
);

export const CardDescription = ({ children }: CardDescriptionProps) => (
  <p className="text-sm text-gray-600">{children}</p>
);
