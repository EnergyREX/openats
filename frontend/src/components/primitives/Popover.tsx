import React from 'react'
import { Popover as BPopover } from '@base-ui/react'
import { Bell } from 'lucide-react'

const Popover = () => {
  return (
    <BPopover.Root>
      <BPopover.Trigger className="flex items-center justify-center rounded-md p-2 text-text-secondary transition-colors hover:bg-surface-overlay hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive">
        <Bell size={18} />
      </BPopover.Trigger>
      <BPopover.Portal>
        <BPopover.Positioner sideOffset={8}>
          <BPopover.Popup className="relative flex max-w-[320px] flex-col gap-1 rounded-xl border border-border-subtle bg-surface-raised p-4 text-text-primary shadow-lg outline-none transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
            <BPopover.Arrow className="relative block h-1.5 w-3 overflow-clip data-[side=bottom]:top-[-6px] data-[side=left]:right-[-9px] data-[side=left]:rotate-90 data-[side=right]:left-[-9px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-6px] data-[side=top]:rotate-180 before:absolute before:bottom-0 before:left-1/2 before:h-[calc(6px*sqrt(2))] before:w-[calc(6px*sqrt(2))] before:border before:border-border-subtle before:bg-surface-raised before:content-['']" />
            <BPopover.Title className="font-mono text-xs uppercase tracking-[0.2em] text-interactive">
              Notificaciones
            </BPopover.Title>
            <BPopover.Description className="text-sm text-text-muted">
              Estás al día. No hay nada nuevo por ahora.
            </BPopover.Description>
          </BPopover.Popup>
        </BPopover.Positioner>
      </BPopover.Portal>
    </BPopover.Root>
  )
}

export default Popover
