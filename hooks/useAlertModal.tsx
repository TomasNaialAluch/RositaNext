'use client'

import { useState, useCallback } from 'react'
import AlertModal from '@/components/ui/AlertModal'
import type { AlertType } from '@/components/ui/AlertModal'

interface AlertModalState {
  isOpen: boolean
  type: AlertType
  title: string
  message: string
}

export function useAlertModal() {
  const [alertModal, setAlertModal] = useState<AlertModalState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  })

  const showAlert = useCallback((
    type: AlertType,
    title: string,
    message: string
  ) => {
    setAlertModal({
      isOpen: true,
      type,
      title,
      message
    })
  }, [])

  const showSuccess = useCallback((title: string, message: string) => {
    showAlert('success', title, message)
  }, [showAlert])

  const showError = useCallback((title: string, message: string) => {
    showAlert('error', title, message)
  }, [showAlert])

  const showWarning = useCallback((title: string, message: string) => {
    showAlert('warning', title, message)
  }, [showAlert])

  const showInfo = useCallback((title: string, message: string) => {
    showAlert('info', title, message)
  }, [showAlert])

  const closeAlert = useCallback(() => {
    setAlertModal(prev => ({ ...prev, isOpen: false }))
  }, [])

  const AlertModalComponent = () => (
    <AlertModal
      isOpen={alertModal.isOpen}
      onClose={closeAlert}
      type={alertModal.type}
      title={alertModal.title}
      message={alertModal.message}
    />
  )

  return {
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeAlert,
    AlertModalComponent
  }
}

