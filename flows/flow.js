import { sendText } from "../services/whatsapp.js";
import { answerWithOpenAI } from "../services/openai.js";
import { sendEmail } from "../services/email.js";
import { gerarProtocolo } from "../utils/protocol.js";
import { simulate, buildReportText, parseCurrencyBR, formatCurrency } from "../services/taxSimulator.js";

// Sessões em memória (para produção, use Redis/DB)
const sessions = new Map();

function getSession(user) {
  if (!sessions.has(user)) sessions.set(user, { step: "start", data: {} });
  return sessions.get(user);
}

function resetSession(user) {
  sessions.set(user, { step: "start", data: {} });
}

// Menus
const welcomeMsg = () =>
  `👋 Olá! Sou o Assistente Contábil Automatizado (IA) da *Ohana*.
Você já é cliente?

1) Sim
2) Não`;

const menuServicos = () =>
  `*Selecione o serviço desejado:*
1) Emissão de Nota Fiscal (NFSe / NFe)
2) Folha de Pagamento / RH
3) Recalcular Impostos (INSS, DAS, etc.)
4) Outras dúvidas contábeis
5) Simulador Tributário e Planejamento (Reforma Tributária)`;

const menuRH = () =>
  `*Folha de Pagamento / RH:*
1) Admissão
2) Demissão
3) Férias
4) Recálculo (diferenças, horas, etc.)`;

const menuImpostos = () =>
  `*Recalcular Impostos:*
1) INSS
2) DAS / Simples Nacional
3) Outros impostos (IRPJ, CSLL, PIS, COFINS)`;

export async function handleIncoming(from, text) {
  const session = getSession(from);
  const msg = (text || "").trim();

  // Normaliza escolha numérica
  const isNumber = /^[0-9]+$/.test(msg);
  const choice = isNumber ? Number(msg) : null;

  // Roteamento por etapa
  switch (session.step) {
    case "start": {
      await sendText(from, "Bem-vindo ao *Organograma de Atendimento Contábil Automatizado*.");
      await sendText(from, welcomeMsg());
      session.step = "ask_client";
      break;
    }

    case "ask_client": {
      if (choice === 1) {
        session.step = "service_menu";
        await sendText(from, "Perfeito! Vamos prosseguir.");
        await sendText(from, menuServicos());
      } else if (choice === 2) {
        const url = process.env.COMERCIAL_URL || "https://seudominio.com/planos";
        await sendText(from, `Sem problemas! Vou te direcionar para o *Comercial/Planos*.\n${url}`);
        await sendText(from, "Se preferir já contratar pelo WhatsApp, digite: *Quero falar com o Comercial*.");
        resetSession(from);
      } else {
        await sendText(from, "Por favor, responda *1* (Sim) ou *2* (Não).");
      }
      break;
    }

    case "service_menu": {
      if (choice === 1) {
        session.step = "nf_cnpj";
        await sendText(from, "🧾 *Emissão de Nota Fiscal*\nInforme o *CNPJ* do prestador (sua empresa).");
      } else if (choice === 2) {
        session.step = "rh_menu";
        await sendText(from, menuRH());
      } else if (choice === 3) {
        session.step = "tax_menu";
        await sendText(from, menuImpostos());
      } else if (choice === 4) {
        session.step = "other_question";
        await sendText(from, "Pode enviar sua dúvida contábil. Vou analisar e te responder.");
      } else if (choice === 5) {
        session.step = "taxsim_regime";
        session.data.taxsim = {};
        await sendText(
          from,
          `📊 *Simulador Tributário e Planejamento (Reforma Tributária)*
Vou estimar sua carga tributária *hoje* e *após a Reforma Tributária* (CBS/IBS).

Qual o seu *regime tributário atual*?
1) Simples Nacional
2) Lucro Presumido
3) Lucro Real
4) Não sei`
        );
      } else {
        await sendText(from, "Opção inválida. Selecione uma das opções:\n" + menuServicos());
      }
      break;
    }

    // ===== Emissão NF =====
    case "nf_cnpj": {
      session.data.nf = { cnpj: msg };
      session.step = "nf_municipio";
      await sendText(from, "Informe o *município* do prestador (ou da incidência).");
      break;
    }
    case "nf_municipio": {
      session.data.nf.municipio = msg;
      session.step = "nf_servico";
      await sendText(from, "Descreva o *serviço* prestado.");
      break;
    }
    case "nf_servico": {
      session.data.nf.servico = msg;
      session.step = "nf_valor";
      await sendText(from, "Qual o *valor* (ex.: 1500,00)?");
      break;
    }
    case "nf_valor": {
      session.data.nf.valor = msg.replace(",", ".");
      session.step = "nf_descricao";
      await sendText(from, "Informe a *descrição detalhada* da nota.");
      break;
    }
    case "nf_descricao": {
      session.data.nf.descricao = msg;
      session.step = "nf_tomador";
      await sendText(from, "Dados do *tomador*:\nEnvie *CNPJ/CPF e Razão/Nome* (na mesma mensagem).");
      break;
    }
    case "nf_tomador": {
      session.data.nf.tomador = msg;
      session.step = "nf_confirm";
      const n = session.data.nf;
      await sendText(
        from,
        `✅ *Confirme os dados para emissão:*
Prestador (CNPJ): ${n.cnpj}
Município: ${n.municipio}
Serviço: ${n.servico}
Valor: ${n.valor}
Descrição: ${n.descricao}
Tomador: ${n.tomador}

Digite *1* para Confirmar ou *2* para Corrigir (recomeçar).`
      );
      break;
    }
    case "nf_confirm": {
      if (choice === 1) {
        // Aqui integra com o provedor de NFSe/NFe (ponto flexível)
        const protocolo = gerarProtocolo("NF");
        // Simulação de sucesso:
        await sendText(from, `🔗 Enviando dados ao emissor de NF...`);
        await new Promise(r => setTimeout(r, 500));
        await sendText(from, `🎉 Nota enviada para emissão!\n*Protocolo:* ${protocolo}\nQuando autorizado, você receberá o link do PDF aqui.`);
        resetSession(from);
      } else if (choice === 2) {
        session.step = "nf_cnpj";
        session.data.nf = {};
        await sendText(from, "Sem problemas. Vamos recomeçar a *Emissão de NF*.\nInforme o *CNPJ* do prestador.");
      } else {
        await sendText(from, "Digite *1* para Confirmar ou *2* para Corrigir.");
      }
      break;
    }

    // ===== RH =====
    case "rh_menu": {
      if (choice === 1) {
        session.step = "rh_adm_dados";
        session.data.rh = { tipo: "Admissão" };
        await sendText(from, "Para *Admissão*, envie: Nome completo, CPF, Cargo, Salário, Data de início.");
      } else if (choice === 2) {
        session.step = "rh_dem_dados";
        session.data.rh = { tipo: "Demissão" };
        await sendText(from, "Para *Demissão*, envie: Nome, CPF, Data de saída, Motivo (pedido/sem justa/com justa).");
      } else if (choice === 3) {
        session.step = "rh_ferias_dados";
        session.data.rh = { tipo: "Férias" };
        await sendText(from, "Para *Férias*, envie: Nome, CPF, Período aquisitivo, Datas de gozo.");
      } else if (choice === 4) {
        session.step = "rh_recalc_dados";
        session.data.rh = { tipo: "Recálculo" };
        await sendText(from, "Para *Recálculo*, descreva a demanda (competências, horas, diferenças, etc.).");
      } else {
        await sendText(from, "Opção inválida. " + menuRH());
      }
      break;
    }

    case "rh_adm_dados":
    case "rh_dem_dados":
    case "rh_ferias_dados":
    case "rh_recalc_dados": {
      session.data.rh.detalhes = msg;
      const protocolo = gerarProtocolo("RH");
      // Envia por e-mail para RH
      const html = `<p><b>Tipo:</b> ${session.data.rh.tipo}</p><p><b>Telefone:</b> ${from}</p><p><b>Detalhes:</b><br>${msg.replace(/\n/g, "<br>")}</p><p><b>Protocolo:</b> ${protocolo}</p>`;
      await sendEmail({
        subject: `[OHANA RH] ${session.data.rh.tipo} - ${protocolo}`,
        html,
        to: process.env.RH_EMAIL_TO,
        from: process.env.RH_EMAIL_FROM
      });
      await sendText(from, `✅ Pedido registrado no RH!\n*Protocolo:* ${protocolo}\nVocê receberá atualizações por aqui.`);
      resetSession(from);
      break;
    }

    // ===== Impostos =====
    case "tax_menu": {
      if (choice === 1) {
        session.step = "tax_inss";
        session.data.tax = { tipo: "INSS" };
        await sendText(from, "Para *INSS*, informe: Competência (MM/AAAA) e base de cálculo ou salário.");
      } else if (choice === 2) {
        session.step = "tax_das";
        session.data.tax = { tipo: "DAS" };
        await sendText(from, "Para *DAS/Simples*, informe: Faturamento do período e Anexo/Atividade se souber.");
      } else if (choice === 3) {
        session.step = "tax_outros";
        session.data.tax = { tipo: "Outros" };
        await sendText(from, "Descreva o imposto (IRPJ, CSLL, PIS, COFINS) e os dados necessários.");
      } else {
        await sendText(from, "Opção inválida. " + menuImpostos());
      }
      break;
    }

    case "tax_inss":
    case "tax_das":
    case "tax_outros": {
      session.data.tax.detalhes = msg;
      const protocolo = gerarProtocolo("TAX");
      // Aqui você pode integrar com um módulo de cálculo/ERP/planilha
      await sendText(from, `📊 Solicitação de *${session.data.tax.tipo}* registrada.\n*Protocolo:* ${protocolo}\nNossa equipe/robô fará o cálculo e enviarei o valor/guia aqui.`);
      resetSession(from);
      break;
    }

    // ===== Outras Dúvidas =====
    case "other_question": {
      const protocolo = gerarProtocolo("CTB");
      // Tenta responder com IA
      const ai = await answerWithOpenAI(msg);
      await sendText(from, `🤖 *Resposta (IA):*\n${ai}`);
      // Encaminha à contabilidade por e-mail para conferência
      const html = `<p><b>Dúvida do cliente:</b></p><p>${msg.replace(/\n/g, "<br>")}</p><p><b>Resposta IA:</b></p><p>${ai.replace(/\n/g, "<br>")}</p><p><b>WhatsApp:</b> ${from}</p><p><b>Protocolo:</b> ${protocolo}</p>`;
      await sendEmail({
        subject: `[OHANA CONTÁBIL] Dúvida - ${protocolo}`,
        html,
        to: process.env.CONT_EMAIL_TO || process.env.RH_EMAIL_TO
      });
      await sendText(from, `📨 Encaminhei sua dúvida à equipe para validação.\n*Protocolo:* ${protocolo}`);
      resetSession(from);
      break;
    }

    // ===== Simulador Tributário / Planejamento (Reforma Tributária) =====
    case "taxsim_regime": {
      const map = { 1: "simples", 2: "presumido", 3: "real", 4: "naosei" };
      if (!map[choice]) {
        await sendText(from, "Por favor, responda *1*, *2*, *3* ou *4*.");
        break;
      }
      session.data.taxsim.regimeAtual = map[choice];
      session.step = "taxsim_setor";
      await sendText(
        from,
        `Qual o *setor* da sua empresa?
1) Comércio
2) Indústria
3) Serviços`
      );
      break;
    }

    case "taxsim_setor": {
      const map = { 1: "comercio", 2: "industria", 3: "servicos" };
      if (!map[choice]) {
        await sendText(from, "Por favor, responda *1*, *2* ou *3*.");
        break;
      }
      session.data.taxsim.setor = map[choice];
      session.step = "taxsim_faturamento";
      await sendText(from, "Qual o *faturamento médio mensal* da empresa? (ex.: 50000 ou 50.000,00)");
      break;
    }

    case "taxsim_faturamento": {
      const valor = parseCurrencyBR(msg);
      if (!Number.isFinite(valor) || valor <= 0) {
        await sendText(from, "Não entendi o valor. Informe o *faturamento médio mensal* (ex.: 50000).");
        break;
      }
      session.data.taxsim.faturamentoMensal = valor;
      session.step = "taxsim_folha";
      await sendText(from, "Qual o *custo total mensal com folha de pagamento* (salários + encargos + pró-labore)? Se não tiver funcionários, digite 0.");
      break;
    }

    case "taxsim_folha": {
      const valor = parseCurrencyBR(msg);
      if (!Number.isFinite(valor) || valor < 0) {
        await sendText(from, "Não entendi o valor. Informe o custo mensal com folha (ou 0).");
        break;
      }
      session.data.taxsim.folhaMensal = valor;
      session.step = "taxsim_aliquota";
      await sendText(
        from,
        "Você conhece sua *alíquota efetiva atual de ICMS/ISS*? Se souber, informe em % (ex.: 12). Se não souber, digite 0 que usaremos uma média do seu setor."
      );
      break;
    }

    case "taxsim_aliquota": {
      const raw = parseCurrencyBR(msg);
      if (!Number.isFinite(raw) || raw < 0) {
        await sendText(from, "Não entendi. Informe a alíquota em % (ex.: 12) ou 0 para usar a média do setor.");
        break;
      }
      const aliq = raw > 1 ? raw / 100 : raw;
      const t = session.data.taxsim;
      t.icmsAliq = t.setor !== "servicos" ? aliq : 0;
      t.issAliq = t.setor === "servicos" ? aliq : 0;

      const sim = simulate({
        regimeAtual: t.regimeAtual,
        setor: t.setor,
        faturamentoMensal: t.faturamentoMensal,
        folhaMensal: t.folhaMensal,
        icmsAliq: t.icmsAliq,
        issAliq: t.issAliq
      });
      t.resultado = sim;

      await sendText(from, buildReportText(sim));
      session.step = "taxsim_cta";
      await sendText(
        from,
        `Quer que nossos especialistas façam um *Planejamento Tributário completo*, validando esses números com os dados reais da sua empresa e buscando a melhor estratégia diante da Reforma Tributária?

1) Sim, quero o Planejamento Tributário
2) Não, por agora`
      );
      break;
    }

    case "taxsim_cta": {
      if (choice === 1) {
        session.step = "taxsim_lead_nome";
        await sendText(from, "Ótimo! Informe seu *nome* e o *melhor horário* para nosso especialista te ligar.");
      } else if (choice === 2) {
        await sendText(from, "Sem problemas! Ficamos à disposição se quiser revisitar a simulação.");
        resetSession(from);
      } else {
        await sendText(from, "Digite *1* para falar com um especialista ou *2* para encerrar.");
      }
      break;
    }

    case "taxsim_lead_nome": {
      const t = session.data.taxsim;
      const protocolo = gerarProtocolo("TRIB");
      const sim = t.resultado;
      const html =
        `<p><b>Lead - Planejamento Tributário</b></p>` +
        `<p><b>WhatsApp:</b> ${from}</p>` +
        `<p><b>Nome/Contato informado:</b> ${msg}</p>` +
        `<p><b>Regime atual informado:</b> ${sim.regimeLabel}</p>` +
        `<p><b>Setor:</b> ${sim.setor}</p>` +
        `<p><b>Faturamento médio mensal:</b> ${formatCurrency(sim.faturamentoMensal)}</p>` +
        `<p><b>Melhor regime hoje (simulação):</b> ${sim.melhorRegimeHoje.nome} (${formatCurrency(sim.melhorRegimeHoje.totalMensal)}/mês)</p>` +
        `<p><b>Estimativa na Reforma (2033):</b> ${formatCurrency(sim.reforma.totalMensal)}/mês</p>` +
        `<p><b>Protocolo:</b> ${protocolo}</p>`;
      await sendEmail({
        subject: `[OHANA TRIBUTÁRIO] Lead Planejamento Tributário - ${protocolo}`,
        html,
        to: process.env.TAX_PLANNING_EMAIL_TO || process.env.CONT_EMAIL_TO
      });
      await sendText(
        from,
        `✅ Recebemos seus dados! Nossa equipe de Planejamento Tributário vai te contatar em breve.\n*Protocolo:* ${protocolo}`
      );
      resetSession(from);
      break;
    }

    default: {
      resetSession(from);
      await sendText(from, welcomeMsg());
    }
  }
}
