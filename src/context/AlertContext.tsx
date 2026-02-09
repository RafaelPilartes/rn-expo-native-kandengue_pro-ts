import React, { createContext, useContext, useState } from 'react'

export type AlertType = 'success' | 'error' | 'warning' | 'info'

interface AlertButton {
  text: string
  style?: 'default' | 'cancel' | 'destructive'
  onPress?: () => void
}

interface AlertOptions {
  title: string
  message: string
  type?: AlertType
  buttons?: AlertButton[]
  cancelable?: boolean
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void
  hideAlert: () => void
  alertState: AlertOptions & { visible: boolean }
}

const AlertContext = createContext<AlertContextType>({} as AlertContextType)

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [alertState, setAlertState] = useState<
    AlertOptions & { visible: boolean }
  >({
    visible: false,
    title: '',
    message: ''
  })

  // Keep track of the timeout/animation if needed, or simple state for now
  const showAlert = (options: AlertOptions) => {
    setAlertState({
      ...options,
      visible: true
    })
  }

  const hideAlert = () => {
    setAlertState(prev => ({ ...prev, visible: false }))
  }

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert, alertState }}>
      {children}
    </AlertContext.Provider>
  )
}

export const useAlert = () => useContext(AlertContext)
