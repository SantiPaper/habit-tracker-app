import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'

import { QueryProvider } from '@/core/providers/query-provider'

import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <QueryProvider>
            <App />
        </QueryProvider>
    </React.StrictMode>
)
