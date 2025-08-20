# validateRelPaths performance

Medimos a função `validateRelPaths` com 5 caminhos simulando uma chamada de 100ms cada.

| implementação | tempo (ms) |
| --- | ---: |
| sequencial | 503 |
| concorrente (Promise.all) | 101 |

O mapeamento para promessas e a resolução com `Promise.all` reduziu o tempo total de ~500ms para ~100ms no cenário testado.
