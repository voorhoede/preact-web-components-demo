import React, { useEffect } from 'react';
import '../components/Alert/alert.wc.js'

// yeah this is a React component, but it's just used a wrapper for the web component for demo purposes
export const WebComponentEnvironment = () => {
    useEffect(() => {
        const alert = document.querySelector('acme-alert')

        alert.addEventListener('acme-dismiss', (event) => {
            alert.remove()
        })
    }, [])

    return (
        <acme-alert type="warning">You need to reset your password!</acme-alert>
    )
}
