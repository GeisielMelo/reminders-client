import React, { createContext, useContext, useState } from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

const AlertContext = createContext()

export const useAlert = () => {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider')
  }
  return context
}

export const AlertProvider = ({ children }) => {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState('info')

  const showAlert = (newMessage, newSeverity = 'info') => {
    setMessage(newMessage)
    setSeverity(newSeverity)
    setOpen(true)
  }

  const hideAlert = () => {
    setOpen(false)
  }

  return (
    <AlertContext.Provider value={showAlert}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={2000}
        onClose={hideAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center', }}
        ContentProps={{ style: { whiteSpace: 'pre-line' }, }}
        bodystyle={{ whiteSpace: 'pre-line' }}
      >
        <Alert onClose={hideAlert} severity={severity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </AlertContext.Provider>
  )
}

// This is a hook for displaying user feedback messages.

// To use it, wrap your App.jsx component with the AlertProvider.

// Import AlertProvider at the beginning of your file:
// import { AlertProvider } from './hook/useAlert'

// Wrap your App component with the AlertProvider:
// <AlertProvider>
//    <App />
// </AlertProvider>

// Inside your component, import the useAlert hook and use it like this:
// const { showAlert } = useAlert();

// Now, you can use the showAlert function to display messages to the user:
// showAlert('This is a success message', 'success');

// Reference
// https://medium.com/@alokjain.dev/creating-custom-alert-notifications-in-react-with-material-ui-snackbar-73effbedbd40
// https://stackoverflow.com/questions/72640471/cant-make-this-message-hook-work-in-react