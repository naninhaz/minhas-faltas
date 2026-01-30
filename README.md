# minhas-faltas

Aplicação para gerenciar suas ausências no SENAI e UFBA.

## Sobre

Controle de Faltas é uma aplicação web moderna que permite gerenciar suas ausências em disciplinas de duas instituições:
- **SENAI**: 1 falta = 4 horas
- **UFBA**: 
  - Disciplinas com 60+ horas: 1 falta = 4 horas
  - Disciplinas com menos de 60 horas: 1 falta = 2 horas

A aplicação calcula automaticamente se você está dentro do limite de 25% de faltas permitidas.

## Funcionalidades

- ✅ Adicionar disciplinas com total de horas
- ✅ Registrar faltas com justificativas
- ✅ Visualizar histórico de faltas por disciplina
- ✅ Cálculo automático de horas faltadas
- ✅ Status visual (Ok, Atenção, Reprovado)
- ✅ Indicador de faltas restantes
- ✅ Armazenamento local (localStorage)
- ✅ Design responsivo e moderno

## Tecnologias

- React 18
- Vite
- JavaScript ES6+

## Como instalar e rodar

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

A aplicação abrirá automaticamente em `http://localhost:3000`

### Build para produção

```bash
npm run build
```

## Como usar

1. **Adicione uma disciplina**: Preencha o nome, total de horas e selecione a instituição
2. **Registre uma falta**: Clique em "+ Registrar Falta", indique o número de faltas e a justificativa
3. **Acompanhe o status**: A barra de progresso mostra seu percentual de ausência
4. **Remova faltas**: Clique no "×" para remover uma falta específica
5. **Limpe tudo**: Use o botão "Limpar Todos os Dados" para recomeçar

## Dados

Todos os seus dados são armazenados localmente no navegador (localStorage). Nenhum dado é enviado para servidores.

## Licença

MIT
