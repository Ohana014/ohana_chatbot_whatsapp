    import { sendText } from "../services/whatsapp.js";
    import { answerWithOpenAI } from "../services/openai.js";
    import { sendEmail } from "../services/email.js";
    import { gerarProtocolo } from "../utils/protocol.js";

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
      "👋 Olá! Sou o Assistente Contábil Automatizado (IA) da *Ohana*.
Você já é cliente?

1) Sim
2) Não";

    const menuServicos = () =>
      "*Selecione o serviço desejado:*
" +
      "1) Emissão de Nota Fiscal (NFSe / NFe)
" +
      "2) Folha de Pagamento / RH
" +
      "3) Recalcular Impostos (INSS, DAS, etc.)
" +
      "4) Outras dúvidas contábeis";

    const menuRH = () =>
      "*Folha de Pagamento / RH:*
" +
      "1) Admissão
" +
      "2) Demissão
" +
      "3) Férias
" +
      "4) Recálculo (diferenças, horas, etc.)";

    const menuImpostos = () =>
      "*Recalcular Impostos:*
" +
      "1) INSS
" +
      "2) DAS / Simples Nacional
" +
      "3) Outros impostos (IRPJ, CSLL, PIS, COFINS)";

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
            await sendText(from, `Sem problemas! Vou te direcionar para o *Comercial/Planos*.
${url}`);
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
            await sendText(from, "🧾 *Emissão de Nota Fiscal*
Informe o *CNPJ* do prestador (sua empresa).");
          } else if (choice === 2) {
            session.step = "rh_menu";
            await sendText(from, menuRH());
          } else if (choice === 3) {
            session.step = "tax_menu";
            await sendText(from, menuImpostos());
          } else if (choice === 4) {
            session.step = "other_question";
            await sendText(from, "Pode enviar sua dúvida contábil. Vou analisar e te responder.");
          } else {
            await sendText(from, "Opção inválida. Selecione uma das opções:
" + menuServicos());
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
          await sendText(from, "Dados do *tomador*:
Envie *CNPJ/CPF e Razão/Nome* (na mesma mensagem).");
          break;
        }
        case "nf_tomador": {
          session.data.nf.tomador = msg;
          session.step = "nf_confirm";
          const n = session.data.nf;
          await sendText(
            from,
            "✅ *Confirme os dados para emissão:*
" +
              `Prestador (CNPJ): ${n.cnpj}
` +
              `Município: ${n.municipio}
` +
              `Serviço: ${n.servico}
` +
              `Valor: ${n.valor}
` +
              `Descrição: ${n.descricao}
` +
              `Tomador: ${n.tomador}

` +
              "Digite *1* para Confirmar ou *2* para Corrigir (recomeçar)."
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
            await sendText(from, `🎉 Nota enviada para emissão!
*Protocolo:* ${protocolo}
Quando autorizado, você receberá o link do PDF aqui.`);
            resetSession(from);
          } else if (choice === 2) {
            session.step = "nf_cnpj";
            session.data.nf = {};
            await sendText(from, "Sem problemas. Vamos recomeçar a *Emissão de NF*.
Informe o *CNPJ* do prestador.");
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
          await sendText(from, `✅ Pedido registrado no RH!
*Protocolo:* ${protocolo}
Você receberá atualizações por aqui.`);
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
          await sendText(from, `📊 Solicitação de *${session.data.tax.tipo}* registrada.
*Protocolo:* ${protocolo}
Nossa equipe/robô fará o cálculo e enviarei o valor/guia aqui.`);
          resetSession(from);
          break;
        }

        // ===== Outras Dúvidas =====
        case "other_question": {
          const protocolo = gerarProtocolo("CTB");
          // Tenta responder com IA
          const ai = await answerWithOpenAI(msg);
          await sendText(from, `🤖 *Resposta (IA):*
${ai}`);
          // Encaminha à contabilidade por e-mail para conferência
          const html = `<p><b>Dúvida do cliente:</b></p><p>${msg.replace(/\n/g, "<br>")}</p><p><b>Resposta IA:</b></p><p>${ai.replace(/\n/g, "<br>")}</p><p><b>WhatsApp:</b> ${from}</p><p><b>Protocolo:</b> ${protocolo}</p>`;
          await sendEmail({
            subject: `[OHANA CONTÁBIL] Dúvida - ${protocolo}`,
            html,
            to: process.env.CONT_EMAIL_TO || process.env.RH_EMAIL_TO
          });
          await sendText(from, `📨 Encaminhei sua dúvida à equipe para validação.
*Protocolo:* ${protocolo}`);
          resetSession(from);
          break;
        }

        default: {
          resetSession(from);
          await sendText(from, welcomeMsg());
        }
      }
    }
