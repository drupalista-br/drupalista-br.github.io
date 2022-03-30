# [Bót.online](https://bót.online) | Anti-bots

Esta extensão transfere para um humano a tarefa de resolver o desafio
anti-robô, tais como o [hcaptcha](https://www.hcaptcha.com) e o [recaptcha](https://www.google.com/recaptcha).

## Após a resolução do desafio pelo humano, são capturados:
- Os [cookies](https://pt.wikipedia.org/wiki/Cookie_%28inform%C3%A1tica%29) ou;
- A [paǵina HTML](https://pt.wikipedia.org/wiki/P%C3%A1gina_de_rede) carregadas após a resolução do desafio,
tais como consultas do CNPJ e do CPF ou;
- Ambos os cookies e a página HTML resultante. Normalemente é capturado apenas um dos itens anteriores.

Os dados capturados são então enviadas ao nosso servidor no endereço https://api.bót.online/browser .
