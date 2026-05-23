import { useConfirmStore } from '@/stores/useConfirmStore' // El store de Zustand que creamos antes
import { ConfirmDialog } from '@/components/confirm-dialog' // <-- RUTA CORREGIDA

export function GlobalConfirm() {
    const { isOpen, title, description, onConfirm, closeConfirm } = useConfirmStore()

    return (
        <ConfirmDialog
            open={isOpen}
            onOpenChange={(open) => !open && closeConfirm()}
            title={title}
            desc={description}
            handleConfirm={() => {
                onConfirm()
                closeConfirm()
            }}
        />
    )
}