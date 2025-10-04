"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface CustomAlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type?: "success" | "error" | "confirm"
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}

export function CustomAlertDialog({
  open,
  onOpenChange,
  type = "success",
  title,
  description,
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
}: CustomAlertDialogProps) {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "confirm":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {getIcon()}
            {title ||
              (type === "success"
                ? "Acción realizada correctamente"
                : type === "error"
                ? "Ocurrió un error"
                : "¿Estás seguro?")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description ||
              (type === "success"
                ? "La operación fue exitosa."
                : type === "error"
                ? "Hubo un problema al ejecutar la acción."
                : "Esta acción no se puede deshacer.")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {type === "confirm" && (
            <AlertDialogCancel
              onClick={() => {
                if (onCancel) onCancel()
                onOpenChange(false)
              }}
            >
              {cancelText}
            </AlertDialogCancel>
          )}
          <AlertDialogAction
            onClick={() => {
              if (onConfirm) onConfirm()
              onOpenChange(false)
            }}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
