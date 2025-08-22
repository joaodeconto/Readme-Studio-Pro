'use client'


import React, { PropsWithChildren } from 'react'


// ⬇️ Se você estiver fazendo import dinâmico do PostHogProvider em outro arquivo,
// copie apenas o trecho do *type* e o uso do componente. A ideia é garantir que o
// PostHogProvider aceite `children` no nível de tipos.


// 1) Defina um tipo que inclua `children` de forma explícita
export type PHProviderType = React.ComponentType<
PropsWithChildren<{ client: any }>
>


// 2) Garanta que a variável que guarda o provider use esse tipo
// (se você já tem isso em outro lugar, ajuste apenas o *as PHProviderType*)
let PostHogProviderTyped: PHProviderType | null = null
let posthogClient: any = null


// Exemplo de inicialização (opcional) — ajuste ao seu projeto
// Se você já inicializa em outro arquivo, remova este bloco.
if (typeof window !== 'undefined') {
;(async () => {
const ph = await import('posthog-js')
const react = await import('posthog-js/react')


// Inicialize somente se tiver chave
const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
if (key) {
ph.default.init(key, { api_host: 'https://app.posthog.com' })
posthogClient = ph.default
PostHogProviderTyped = (react as any).PostHogProvider as PHProviderType
}
})()
}


// 3) Provider raiz da sua aplicação
// Uso: envolva seu layout com <Providers> ... </Providers>
export function Providers({ children }: PropsWithChildren) {
// Conteúdo bruto (sem PostHog)
const content = <>{children}</>


// Se não deu para inicializar PostHog, retorna direto
if (!PostHogProviderTyped || !posthogClient) return content


// ✅ Aqui o tipo do componente aceita `children`
return (
<PostHogProviderTyped client={posthogClient}>{content}</PostHogProviderTyped>
)
}