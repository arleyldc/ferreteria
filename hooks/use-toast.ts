import { toast as sonnerToast } from "sonner";

export interface Toast {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

export function useToast() {
  const toast = (data: Toast) => {
    const { title, description, variant = "default", duration = 3000 } = data;

    if (variant === "destructive") {
      sonnerToast.error(title || description, {
        description: title ? description : undefined,
        duration,
      });
    } else {
      sonnerToast.success(title || description, {
        description: title ? description : undefined,
        duration,
      });
    }
  };

  return { toast };
}
