Escopo

Integrações com GitHub App e API.

OAuth, repository dispatch, PRs, análises.

Responsabilidades

Reusar analisarRepo e proporPR se já implementados.

Modernizar chamadas → fetch com error handling + React Query / SWR.

Validar permissões e tokens.

Substituir rotas API legacy por /app/api/* no Next.

Checks

 OAuth funcionando.

 Botão "Conectar GitHub" → redireciona corretamente.

 PR criado e linkado no app.

 Lidar com 404 (repo privado/inexistente).