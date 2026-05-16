import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter } from "react-router-dom"

import App from "@/App"

import "@fontsource/space-grotesk"
import "@fontsource/inclusive-sans"
import "@fontsource/be-vietnam-pro"
import "@fontsource/plus-jakarta-sans"
import "@fontsource/hanken-grotesk"
import "@fontsource/work-sans"
import "@fontsource/space-mono"
import "@fontsource/roboto-mono"
import "@fontsource/fira-code"
import "@fontsource/dm-mono"
import "@/assets/fonts/standardBook.css"
import "./styles/global.scss"

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60,
            retry: 1,
        },
    },
})

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                <App />
            </QueryClientProvider>
        </BrowserRouter>
    </StrictMode>,
)
