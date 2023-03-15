import React from 'react';
import { Alert } from '../components/Alert/Alert';

export const ReactEnviroment = () => {
  const [showAlert, setShowAlert] = React.useState(true)

  return (
    showAlert && (
      <Alert type="warning" onDismiss={() => setShowAlert(false)}>
        You need to reset your password!
      </Alert>
    )
  )
}
