'use client'


import React, { type PropsWithChildren } from 'react'
import type { PostHog } from 'posthog-js'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'


// ⬇️ Se você estiver fazendo import dinâmico do PostHogProvider em outro arquivo,
// copie apenas o trecho do *type* e o uso do componente. A ideia é garantir que o
// PostHogProvider aceite `children` no nível de tipos.


// 1) Defina um tipo que inclua `children` de forma explícita
export type PHProviderType = React.ComponentType<
    PropsWithChildren<{ client: PostHog }>
>


// 2) Garanta que a variável que guarda o provider use esse tipo
// (se você já tem isso em outro lugar, ajuste apenas o *as PHProviderType*)
let PostHogProviderTyped: PHProviderType | null = null
let posthogClient: PostHog | null = null

// Shared query client for React Query
const queryClient = new QueryClient()


// Exemplo de inicialização (opcional) — ajuste ao seu projeto
// Se você já inicializa em outro arquivo, remova este bloco.
if (typeof window !== 'undefined') {
    ; (async () => {
        const ph = await import('posthog-js')
        const { PostHogProvider } = await import('posthog-js/react')

        // Inicialize somente se tiver chave
        const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
        if (key) {
            ph.default.init(key, { api_host: 'https://app.posthog.com' })
            posthogClient = ph.default
            PostHogProviderTyped = PostHogProvider as PHProviderType
        }
    })()
}


// 3) Provider raiz da sua aplicação
// Uso: envolva seu layout com <Providers> ... </Providers>
/**
 * Global context providers for the application. Supplies a shared React Query client
 * and nests the PostHog analytics provider when available.
 */
export function Providers({ children }: PropsWithChildren) {
    // Conteúdo bruto (sem PostHog)
    const content = <>{children}</>

    // ✅ Garante PostHog somente se inicializado
    const wrapped =
        PostHogProviderTyped && posthogClient ? (
            <PostHogProviderTyped client={posthogClient}>{content}</PostHogProviderTyped>
        ) : (
            content
        )

    return <QueryClientProvider client={queryClient}>{wrapped}</QueryClientProvider>
}