---
title: escritorio.tec.br
description: Nós cuidamos das obrigações periódicas &mdash; você cuida do seu cliente!
params:
  body_class: td-navbar-links-all-active
---

{{% blocks/cover
  title="data:company.moto"
  height="full td-below-navbar"
  image_anchor="top"
%}}

<!--
  Want a cover without an image?
  Add the following argument to the blocks/cover shortcode:
    color="primary bg-gradient td-below-navbar"
-->

<!-- prettier-ignore -->
{{% _param description %}}
{.display-6}

<!-- prettier-ignore -->
<div class="td-cta-buttons my-5">
  <a {{% _param btn-lg primary %}} href="servicos/">
    Serviços
    {{% _param FA solid briefcase "" %}}
  </a>
  <a {{% _param btn-lg secondary %}}
    href="docs/"
    target="_blank" rel="noopener noreferrer">
    Instalação
    {{% _param FA solid download "" %}}
  </a>
</div>
{{% /blocks/cover %}}
