---
hide:
  - navigation
---
# Para Contadores e Escritórios de Contabilidade
### Por que terceirizar?

> Redução do custo e do tempo com treinamentos e capacitações

* Softwares e plataformas do governo, tais como, os PVAs das EFDs, da ECF e da ECD, a DCTF, a SEDIF, o PGDAS, etc, tem uma longa curva de aprentizado;
* Menos tempo gasto com:
    * Instalações, atualizações, diagnósticos e correções de falhas em softwares e plataformas eletrônicas;
    * Implementações e manutenção de configurações para a coleta/exportação/importação de dados entre softwares/plataformas;
    * Busca, interpretação e atualização da legislação tributária.

> Menos stress no manejamento dos seus recursos humanos

* As tarefas essenciais serão feitas/concluídas mesmo quando:
    * Seus colaboradores chaves estiverem gozando férias;
    * Ocorrer pedido de demissão e/ou desfalque na sua equipe.

> Eficiência e qualidade

* Mais tempo para aprimorar e focar no atendimento ao seu cliente.

### Quais serviços a Bót presta?
* Nós cuidamos:
    * Dos download dos XMLs/dados das:
        * NFe de entradas e saídas junto às SEFAZ/SEFA de cada Estado;
        * NFSe junto às prefeituras;
        * Mais detalhes.
    * Das classificações fiscais. Mais detalhes;
    * Das elaborações/preenchimentos e entregas/transmissões:
        * Do PGDAS mensal e da DEFIS anual;
        * Da DeSTDA via SEDIF;
        * Das EFDs Fiscal e Contribuições;
        * Da ECD e da ECF;
        * Da DCTF.
    * Da apuração/disponibilização das guias:
        * DAM do issqn mensal e do alvará de licença anual;
        * DAS do simples nacional;
        * DARF do pis, da cofins, do irpj e da csll;
        * Mais detalhes.
* Todos os dados/documentos que produzimos são disponibilizados via google drive. Mais detalhes.

### Como é feita a interação de dados / documentos / relatórios?
#### Entre a Bót e o contador/escritório?
* Todos os dados, relatórios e documentos são coletados/elaborados, manipulados, guardados e disponibilizados via google drive. Mais detalhes;
* Painel de controle integrado ao google drive.
    * Aqui explica como instalar/configurar o painel;
    * Aqui explica as funcionalidades do painel.

#### Entre a Bót e os clientes do contador/escritório?
* (Opcional) Painel do cliente disponível em <a href="https://bot-cliente.github.io/" target="_blank">https://bot-cliente.github.io</a>. Mais detalhes.
* Aqui explica como dados e arquivos devem ser entregues/disponibilizados à Bót nos casos em que o cliente NÃO queira usar o painel;
* Aqui explica os procedimentos para as entregas de guias e o registro de protocolo.

### Por que o usuário do painel Bót tem que instalar um software da Bót em sua máquina?
* O programa (um <a href="https://pt.wikipedia.org/wiki/Proxy" target="_blank">proxy</a>) se coloca no meio entre o Firefox e a internet para interceptar todo o tráfego. Isso é necessário por três razões:
    1. Captchas. Por exemplo:
        1. Ao inserir um novo cliente, o usuário do painel é direcionado para a página de consulta do CNPJ da receita federal;
        1. É necessário um humano para resolver o desafio do captcha para então os dados contidos no cartão do CNPJ serem revelados;
        1. O proxy fica observando o tráfigo e, ao notar que o cartão do CNPJ foi revelado, coleta a página retornada pela receita federal e a envia para o servidor da Bót;
        1. No servidor da Bót os dados contidos na página do cartão do CNPJ são extraídos e inseridos nas planilhas google correspondentes.
    1. Certificados digitais e senhas. O usuário do painel NÃO precisa instalar no navegador dezenas de certificados digitais e NEM gerenciar senhas de acesso a serviços online. Por exemplo, para logar aos serviços do eCAC, do emissor de NFSe da prefeitura, da plataforma da SEFAZ/SEFA, etc:
        1. O usuário do painel seleciona o cliente/serviço e a página do serviço é aberto em uma nova aba do firefox;
        1. Em plano de fundo o proxy transfere o processo de login para o servidor da Bót;
        1. O certificado do cliente ou o certificado do contador ou os dados de usuário e senha, que estão guardados no servidor da Bót, é usado no processo de login;
        1. Após logado ao serviço, o servidor da Bót devolve a sessão (os cookies) para o proxy e voilá, o firefox do usuário estará logado ao serviço.
            1. O usuário do painel precisará resolver o captcha caso o serviço imponha essa exigência.
    1. Validação das credenciais do usuário do painel junto ao google drive, para certificar que o usuário está autorizado a acessar o google drive do contador/escritório.

### Como contratar a Bót?
#### Quanto custa os serviços da Bót?
