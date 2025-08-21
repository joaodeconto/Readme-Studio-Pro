Escopo

Substituir código legacy (DOM + Vanilla JS) por Next.js App Router.

Coordenar migração gradual → sem quebra.

Responsabilidades

Antes de criar novo, procurar se já existe função.

Se legacy → substituir por versão modular React.

Migrar pages/ → app/ no Next.

Revisar imports (@/components/*, @/state/*).

Validar que o fluxo user → análise → preview → PR continua íntegro.

Checks

 Estrutura app/ criada.

 Todos os eventos DOM substituídos.

 Components isolados por função.

 Legacy removido quando equivalente já existir.