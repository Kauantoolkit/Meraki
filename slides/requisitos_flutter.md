Tema da atividade

Desenvolvimento de um aplicativo Flutter com foco em arquitetura, integração e persistência de dados.

 

Contexto

Nesta atividade, você deverá projetar e implementar um aplicativo mobile em Flutter aplicando princípios de organização arquitetural e padrões de projeto. A proposta busca avaliar não apenas o funcionamento da aplicação, mas também a qualidade técnica das decisões adotadas e sua justificativa.

 

Objetivo

Construir um aplicativo funcional em Flutter que utilize:

Arquitetura MVVM (obrigatório);
Pelo menos 1 padrão de projeto adicional (obrigatório);
Comunicação com API remota (obrigatório);
Armazenamento local de dados (obrigatório);
Relatório técnico descrevendo e justificando as escolhas (obrigatório).
 

Requisitos obrigatórios do projeto

1) Arquitetura

O aplicativo deve estar organizado no padrão MVVM.
Deve ficar clara a separação entre Model, ViewModel e View.
O código da interface não deve concentrar regras de negócio.
 

2) Padrão de projeto adicional

Além do MVVM, a equipe deve implementar ao menos um dos padrões abaixo:

Factory
Singleton
Adapter
Facade
Observer (ou equivalente de notificação/reatividade)
A escolha deve ser coerente com o problema resolvido no app.

 

3) Comunicação com API

Consumir pelo menos 1 endpoint HTTP real ou simulado.
Exibir dados da API na interface.
Implementar tratamento de:
carregamento;
sucesso;
erro (falha de conexão, timeout, resposta inválida etc.).
 

4) Armazenamento local

Implementar persistência local;
Persistir dados úteis da aplicação;
Recuperar os dados persistidos ao reabrir o app.
 

5) Escopo mínimo funcional

Mínimo de 2 telas.
Fluxo funcional completo de uso.
Ao menos uma operação de interação do usuário (ex.: cadastrar, editar, marcar concluído, favoritar, sincronizar etc.).
 

Entregáveis

Código-fonte em repositório Git;
Aplicativo funcional;
README.md contendo:
descrição do app;
como executar;
padrão escolhido;
API utilizada;
solução de armazenamento local.
Relatório técnico com explicação das escolhas e da implementação.
 

Estrutura mínima do relatório técnico

O relatório deve conter:

Introdução do aplicativo
problema abordado;
proposta da solução.
Arquitetura MVVM
como foi organizada;
divisão de responsabilidades.
Padrão de projeto adicional
qual padrão foi escolhido;
por que foi escolhido;
onde foi aplicado.
Integração com API
endpoint(s) e fluxo de consumo;
tratamento de erros/estados.
Persistência local
tecnologia adotada;
quais dados são persistidos e por quê.
Conclusão
principais decisões;
limitações e melhorias futuras.
 

Critérios de avaliação

A avaliação considerará:

organização e aplicação do MVVM;
qualidade da aplicação do padrão adicional;
funcionamento da integração com API;
uso adequado de armazenamento local;
qualidade do código (legibilidade, separação de responsabilidades, organização);
clareza técnica do relatório e justificativas.
 

Observações importantes

Projetos que não implementarem MVVM, API e persistência local estarão incompletos.