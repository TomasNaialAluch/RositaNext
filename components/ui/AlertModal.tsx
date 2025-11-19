'use client'

import { HiCheckCircle, HiExclamationCircle, HiInformationCircle, HiXCircle } from 'react-icons/hi2'
import RositaModal from './RositaModal'

export type AlertType = 'success' | 'error' | 'warning' | 'info'

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  type: AlertType
  title: string
  message: string
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
}

export default function AlertModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  onConfirm,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  showCancel = false
}: AlertModalProps) {
  const getIcon = () => {
    const iconClass = 'rosita-alert-icon'
    switch (type) {
      case 'success':
        return <HiCheckCircle className={`${iconClass} rosita-alert-success`} />
      case 'error':
        return <HiXCircle className={`${iconClass} rosita-alert-error`} />
      case 'warning':
        return <HiExclamationCircle className={`${iconClass} rosita-alert-warning`} />
      case 'info':
        return <HiInformationCircle className={`${iconClass} rosita-alert-info`} />
    }
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onClose()
  }

  return (
    <RositaModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
    >
      <div className="rosita-alert-content">
        {getIcon()}
        <p className="rosita-alert-message">{message}</p>
        <div className="rosita-alert-actions">
          {showCancel && (
            <button
              className="rosita-alert-button rosita-alert-button-cancel"
              onClick={onClose}
            >
              {cancelText}
            </button>
          )}
          <button
            className={`rosita-alert-button rosita-alert-button-${type}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </RositaModal>
  )
}

