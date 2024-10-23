---
hide:
  - navigation
---
# Para Contadores e Escritórios de Contabilidade
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
        * Da DCTF;
        * Da Dirbi;
        * Do LCDPR.
    * Da apuração/disponibilização das guias:
        * DAM do issqn mensal e do alvará de licença anual;
        * DAS do simples nacional;
        * DARF do pis, da cofins, do irpj e da csll;
        * Mais detalhes.
    * Do recálculo de guias atrasadas.
* Todos os dados/documentos que produzimos são disponibilizados via :simple-googledrive: google drive. Mais detalhes.

#### A Bót faz a escrita fiscal do produtor rural?
* Sim. Inclusive o LCDPR.

### Como é feita a interação de dados / documentos / relatórios?
#### Entre a Bót e o contador / escritório?
* Todos os dados, relatórios e documentos são coletados/elaborados, manipulados, guardados e disponibilizados via :simple-googledrive: google drive. Mais detalhes;
* :fontawesome-regular-user: Painel do usuário integrado ao :simple-googledrive: google drive.
    * Aqui explica como instalar/configurar o painel;
    * Aqui explica as funcionalidades do painel.

#### Entre a Bót e os clientes do contador / escritório?
* (Opcional) Painel do cliente disponível em <a href="https://bot-cliente.github.io/" target="_blank">https://bot-cliente.github.io</a>. Mais detalhes.
* Aqui explica como dados e arquivos devem ser entregues/disponibilizados à Bót nos casos em que o cliente NÃO queira usar o painel;
* Aqui explica os procedimentos para as entregas de guias e o registro de protocolo.

### Por que o usuário do painel Bót tem que instalar um software da Bót em sua máquina?
* O software ( :material-robot-outline: um <a href="https://pt.wikipedia.org/wiki/Proxy" target="_blank">proxy</a> ) se coloca no meio entre o firefox e a internet para interceptar o tráfego. Isso é necessário por três razões:
    1. Captchas. Por exemplo:
        1. Ao inserir um novo cliente, o usuário do painel é direcionado para a página de consulta do CNPJ da receita federal;
        1. É necessário um humano para resolver o desafio do captcha para então os dados contidos no cartão do CNPJ serem revelados;
        1. O proxy fica observando o tráfigo e, ao notar que o cartão do CNPJ foi revelado, coleta a página retornada pela receita federal e a envia para o servidor da Bót;
        1. No servidor da Bót os dados contidos na página do cartão do CNPJ são extraídos e inseridos nas :material-google-spreadsheet: planilhas google correspondentes.
    1. Certificados digitais e senhas. O usuário do painel NÃO precisa instalar no navegador dezenas de certificados digitais e NEM gerenciar senhas de acesso a serviços online. Por exemplo, para logar aos serviços do eCAC, do emissor de NFSe da prefeitura, da plataforma da SEFAZ/SEFA, etc:
        1. O usuário do painel seleciona o cliente/serviço e a página do serviço é aberto em uma nova aba do firefox;
        1. Em plano de fundo o proxy transfere o processo de login para o servidor da Bót;
        1. O certificado do cliente ou o certificado do contador ou os dados de usuário e senha, que estão guardados no servidor da Bót, é usado no processo de login;
        1. Após logado ao serviço, o servidor da Bót devolve a sessão (os cookies) para o proxy e voilá, o firefox do usuário estará logado ao serviço.
            1. O usuário do painel precisará resolver o captcha caso o serviço imponha essa exigência.
    1. Validação das credenciais junto ao :simple-googledrive: google drive, para certificar que o usuário do painel está autorizado a acessar o :simple-googledrive: google drive do contador / escritório.

#### O software da Bót intercepta / monitora todo o tráfego de internet da máquina?
* Não. O usuário é instruído a criar um perfil no firefox. Somente o perfil especificado sofrerá a intercepção e monitoramento;
* Aqui explica como instalar o software da Bót, criar e configurar o perfil no firefox que terá o tráfego monitorado.

#### Posso autorizar mais de um colaborador a logar à conta do contador / escritório?
* Sim. A quantidade de usuários é ilimitada e SEM custos adicionais;
* Aqui explica o procedimento de autorização.

### Como o contador / escritório contrata a Bót?
* Basta instalar o painel do usuário ( instrulções aqui ). Ao informar o CPF ou CNPJ do contador e este NÃO esteja cadastrado:
    1. Você será direcionado para a página de consulta do CNPJ da receita federal para extraírmos os dados cadastrais da sua empresa de contabilidade ou;
        1. Se tiver informado um CPF, você será apresentado um formulário para informar os dados do contador.
    1. TODO.

#### Quanto custa os serviços da Bót?

#### Há cobrança de taxa de adesão? Taxa de cancelamento?
* Não. Só cobramos a mensalidade mensal acordada.

#### Há cobrança de mensalidade 13o?
* Não. Somente a mensalidade acordada.

#### A Bót presta serviços diretamente ao cliente / empresário?
* Não. Somente para contadores e escritórios de contabilidade.

### Como cadastro um novo cliente?
#### Como removo / desativo um cliente para a Bót parar de executar os serviços mensais/anuais?
#### Foi feito alteração cadastral do cliente, como informo / atualizo a Bót?
#### Como transfiro um cliente para outro contador / escritório?
### Como peço o recálculo de uma guia de imposto atrasada?