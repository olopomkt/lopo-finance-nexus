
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';

interface FormWrapperProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  onCancel: () => void;
  isSubmitting?: boolean;
  className?: string;
}

export const FormWrapper = ({ 
  title, 
  icon, 
  children, 
  onCancel, 
  isSubmitting = false,
  className = "w-full max-w-2xl mx-auto"
}: FormWrapperProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card className="neon-border bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
};
