// services/taxSimulator.js
// Motor de cálculo do Simulador Tributário e Planejamento Tributário (Ohana).
//
// Objetivo: estimar a carga tributária ATUAL (Simples Nacional / Lucro Presumido)
// e a carga tributária ESTIMADA após a Reforma Tributária (EC 132/2023 + LC 214/2025),
// que substitui PIS, Cofins, ICMS, ISS e IPI por CBS e IBS (e cria o Imposto Seletivo
// para itens específicos), com transição gradual entre 2026 e 2033.
//
// IMPORTANTE: os percentuais/tabelas abaixo refletem referências oficiais publicadas
// até a criação deste módulo. Como a regulamentação da Reforma ainda está em produção
// (leis complementares, decretos, alíquotas de referência por Estado/Município), os
// resultados são ESTIMATIVAS para fins de simulação e geração de leads, não substituem
// um Planejamento Tributário formal feito com os dados contábeis reais da empresa.

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const PCT = (v) => `${(v * 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;

export function formatCurrency(v) {
  return BRL.format(Number(v) || 0);
}

export function formatPercent(v) {
  return PCT(Number(v) || 0);
}

// Converte texto digitado no WhatsApp ("50000", "50.000,00", "R$ 50.000") em número.
export function parseCurrencyBR(input) {
  if (input == null) return NaN;
  let s = String(input).trim().replace(/[Rr]\$/g, "").replace(/\s/g, "");
  if (!s) return NaN;
  const hasComma = s.includes(",");
  const hasDot = s.includes(".");
  if (hasComma && hasDot) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (hasComma) {
    s = s.replace(",", ".");
  } else if (hasDot) {
    // múltiplos pontos => separador de milhar (ex.: 1.800.000)
    const parts = s.split(".");
    if (parts.length > 2 || parts[parts.length - 1].length === 3) {
      s = parts.join("");
    }
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

// ===== Simples Nacional (LC 123/2006, Anexos I a V — tabela vigente desde 2018) =====
export const ANEXOS_SIMPLES = {
  I: [ // Comércio
    { ate: 180000, aliquota: 0.04, pd: 0 },
    { ate: 360000, aliquota: 0.073, pd: 5940 },
    { ate: 720000, aliquota: 0.095, pd: 13860 },
    { ate: 1800000, aliquota: 0.107, pd: 22500 },
    { ate: 3600000, aliquota: 0.143, pd: 87300 },
    { ate: 4800000, aliquota: 0.19, pd: 378000 }
  ],
  II: [ // Indústria
    { ate: 180000, aliquota: 0.045, pd: 0 },
    { ate: 360000, aliquota: 0.078, pd: 5940 },
    { ate: 720000, aliquota: 0.10, pd: 13860 },
    { ate: 1800000, aliquota: 0.112, pd: 22500 },
    { ate: 3600000, aliquota: 0.147, pd: 85500 },
    { ate: 4800000, aliquota: 0.30, pd: 720000 }
  ],
  III: [ // Serviços (fator R >= 28%)
    { ate: 180000, aliquota: 0.06, pd: 0 },
    { ate: 360000, aliquota: 0.112, pd: 9360 },
    { ate: 720000, aliquota: 0.135, pd: 17640 },
    { ate: 1800000, aliquota: 0.16, pd: 35640 },
    { ate: 3600000, aliquota: 0.21, pd: 125640 },
    { ate: 4800000, aliquota: 0.33, pd: 648000 }
  ],
  V: [ // Serviços (fator R < 28%)
    { ate: 180000, aliquota: 0.155, pd: 0 },
    { ate: 360000, aliquota: 0.18, pd: 4500 },
    { ate: 720000, aliquota: 0.195, pd: 9900 },
    { ate: 1800000, aliquota: 0.205, pd: 17100 },
    { ate: 3600000, aliquota: 0.23, pd: 62100 },
    { ate: 4800000, aliquota: 0.305, pd: 540000 }
  ]
};

export const LIMITE_SIMPLES_ANUAL = 4800000;

export function pickAnexoSimples({ setor, fatorR }) {
  if (setor === "comercio") return "I";
  if (setor === "industria") return "II";
  return fatorR >= 0.28 ? "III" : "V";
}

function faixaSimples(anexo, rbt12) {
  const tabela = ANEXOS_SIMPLES[anexo];
  return tabela.find((f) => rbt12 <= f.ate) || tabela[tabela.length - 1];
}

export function calcSimplesNacional({ faturamentoMensal, setor, fatorR = 0 }) {
  const rbt12 = faturamentoMensal * 12;
  if (rbt12 > LIMITE_SIMPLES_ANUAL) {
    return { elegivel: false, motivo: `Faturamento anual estimado (${formatCurrency(rbt12)}) acima do limite do Simples Nacional (${formatCurrency(LIMITE_SIMPLES_ANUAL)}).` };
  }
  const anexo = pickAnexoSimples({ setor, fatorR });
  const faixa = faixaSimples(anexo, rbt12);
  const aliquotaEfetiva = Math.max(0, (rbt12 * faixa.aliquota - faixa.pd) / rbt12);
  return {
    elegivel: true,
    anexo,
    rbt12,
    aliquotaNominal: faixa.aliquota,
    parcelaDeduzir: faixa.pd,
    aliquotaEfetiva,
    totalMensal: faturamentoMensal * aliquotaEfetiva
  };
}

// ===== Lucro Presumido (e aproximação de Lucro Real, sem dados de despesas reais) =====
const PRESUNCAO_IRPJ = { comercio: 0.08, industria: 0.08, servicos: 0.32 };
const PRESUNCAO_CSLL = { comercio: 0.12, industria: 0.12, servicos: 0.32 };
const ICMS_MEDIO_SETOR = { comercio: 0.18, industria: 0.12, servicos: 0 };
const ISS_MEDIO_SETOR = { comercio: 0, industria: 0, servicos: 0.05 };

export function calcPresumido({ faturamentoMensal, setor, icmsAliq, issAliq }) {
  const baseIRPJ = faturamentoMensal * (PRESUNCAO_IRPJ[setor] ?? 0.32);
  const baseCSLL = faturamentoMensal * (PRESUNCAO_CSLL[setor] ?? 0.32);
  const limiteAdicional = 20000; // R$20.000/mês (proporcional aos R$60.000/trimestre)
  const irpj = baseIRPJ * 0.15 + Math.max(0, baseIRPJ - limiteAdicional) * 0.10;
  const csll = baseCSLL * 0.09;
  const pis = faturamentoMensal * 0.0065;
  const cofins = faturamentoMensal * 0.03;
  const aliqIcms = icmsAliq > 0 ? icmsAliq : (ICMS_MEDIO_SETOR[setor] ?? 0);
  const aliqIss = issAliq > 0 ? issAliq : (ISS_MEDIO_SETOR[setor] ?? 0);
  const icms = faturamentoMensal * aliqIcms;
  const iss = faturamentoMensal * aliqIss;
  const totalMensal = irpj + csll + pis + cofins + icms + iss;
  return {
    irpj, csll, pis, cofins, icms, iss, totalMensal,
    aliquotaEfetiva: faturamentoMensal > 0 ? totalMensal / faturamentoMensal : 0,
    icmsAliqUsada: aliqIcms,
    issAliqUsada: aliqIss
  };
}

// ===== Lucro Real =====
// Diferente do Presumido, o IRPJ/CSLL incidem sobre o lucro líquido contábil
// real (informado pelo usuário como margem estimada), e o PIS/Cofins passam
// a ser não cumulativos (alíquotas maiores, mas com direito a créditos).
export function calcLucroReal({ faturamentoMensal, setor, margemLucro, icmsAliq, issAliq }) {
  const baseReal = faturamentoMensal * margemLucro;
  const limiteAdicional = 20000; // R$20.000/mês (proporcional aos R$60.000/trimestre)
  const irpj = baseReal * 0.15 + Math.max(0, baseReal - limiteAdicional) * 0.10;
  const csll = baseReal * 0.09;
  const credito = CREDITO_ESTIMADO_SETOR[setor] ?? 0.30;
  const baseNaoCumulativa = faturamentoMensal * (1 - credito);
  const pis = baseNaoCumulativa * 0.0165;
  const cofins = baseNaoCumulativa * 0.076;
  const aliqIcms = icmsAliq > 0 ? icmsAliq : (ICMS_MEDIO_SETOR[setor] ?? 0);
  const aliqIss = issAliq > 0 ? issAliq : (ISS_MEDIO_SETOR[setor] ?? 0);
  const icms = faturamentoMensal * aliqIcms;
  const iss = faturamentoMensal * aliqIss;
  const totalMensal = irpj + csll + pis + cofins + icms + iss;
  return {
    margemLucro, irpj, csll, pis, cofins, icms, iss, totalMensal,
    aliquotaEfetiva: faturamentoMensal > 0 ? totalMensal / faturamentoMensal : 0,
    creditoEstimadoPct: credito,
    icmsAliqUsada: aliqIcms,
    issAliqUsada: aliqIss
  };
}

// ===== Reforma Tributária (EC 132/2023 / LC 214/2025) =====
// CBS (federal) + IBS (estadual/municipal) substituem PIS, Cofins, ICMS, ISS e IPI.
// Alíquota de referência combinada estimada pelo governo/Senado: ~26,5% (CBS 8,8% + IBS 17,7%).
export const REFORMA = {
  aliquotaReferencia: 0.265,
  cbs: 0.088,
  ibs: 0.177
};

// Percentual estimado de créditos tributários (insumos/compras) sobre o faturamento,
// usado para aproximar o efeito da não cumulatividade plena do CBS/IBS por setor.
const CREDITO_ESTIMADO_SETOR = { comercio: 0.55, industria: 0.45, servicos: 0.20 };

// Cronograma de transição (ADCT, arts. 125-130 da EC 132/2023): percentual da carga
// "antiga" (PIS/Cofins/ICMS/ISS/IPI) que ainda incide vs. percentual já migrado para CBS/IBS.
export const CRONOGRAMA_TRANSICAO = [
  { ano: 2026, antigo: 1.00, novo: 0.00, nota: "Fase de testes: CBS (0,9%) e IBS (0,1%) cobrados de forma simbólica e compensável, sem aumento de carga." },
  { ano: 2027, antigo: 0.90, novo: 0.10, nota: "PIS/Cofins extintos e substituídos pela CBS; IPI zerado (exceto Zona Franca de Manaus)." },
  { ano: 2028, antigo: 0.90, novo: 0.10, nota: "Mantém-se a estrutura de 2027 enquanto o IBS é ajustado." },
  { ano: 2029, antigo: 0.90, novo: 0.10, nota: "Início da redução gradual de ICMS e ISS (-10%)." },
  { ano: 2030, antigo: 0.80, novo: 0.20, nota: "ICMS e ISS reduzidos em 20% frente aos valores atuais." },
  { ano: 2031, antigo: 0.70, novo: 0.30, nota: "ICMS e ISS reduzidos em 30% frente aos valores atuais." },
  { ano: 2032, antigo: 0.60, novo: 0.40, nota: "ICMS e ISS reduzidos em 40% frente aos valores atuais." },
  { ano: 2033, antigo: 0.00, novo: 1.00, nota: "ICMS e ISS extintos. CBS e IBS plenamente vigentes." }
];

export function calcReformaPlena({ faturamentoMensal, setor }) {
  const credito = CREDITO_ESTIMADO_SETOR[setor] ?? 0.30;
  const baseTributavel = faturamentoMensal * (1 - credito);
  const totalMensal = baseTributavel * REFORMA.aliquotaReferencia;
  return {
    aliquotaReferencia: REFORMA.aliquotaReferencia,
    creditoEstimadoPct: credito,
    baseTributavel,
    totalMensal,
    aliquotaEfetivaSobreFaturamento: faturamentoMensal > 0 ? totalMensal / faturamentoMensal : 0
  };
}

// Orquestra o cálculo completo: regime(s) hoje + estimativa na reforma plena (2033).
export function simulate({ regimeAtual, setor, faturamentoMensal, folhaMensal = 0, icmsAliq = 0, issAliq = 0, margemLucro = null }) {
  const fatorR = faturamentoMensal > 0 ? folhaMensal / faturamentoMensal : 0;
  const simples = calcSimplesNacional({ faturamentoMensal, setor, fatorR });
  const presumido = calcPresumido({ faturamentoMensal, setor, icmsAliq, issAliq });
  const real = regimeAtual === "real" && margemLucro != null
    ? calcLucroReal({ faturamentoMensal, setor, margemLucro, icmsAliq, issAliq })
    : null;

  const opcoesHoje = [
    simples.elegivel ? { nome: "Simples Nacional", totalMensal: simples.totalMensal, aliquotaEfetiva: simples.aliquotaEfetiva } : null,
    { nome: "Lucro Presumido", totalMensal: presumido.totalMensal, aliquotaEfetiva: presumido.aliquotaEfetiva },
    real ? { nome: "Lucro Real", totalMensal: real.totalMensal, aliquotaEfetiva: real.aliquotaEfetiva } : null
  ].filter(Boolean);

  const melhorRegimeHoje = opcoesHoje.reduce((a, b) => (b.totalMensal < a.totalMensal ? b : a));

  const regimeLabel = {
    simples: "Simples Nacional",
    presumido: "Lucro Presumido",
    real: "Lucro Real",
    naosei: "Não informado"
  }[regimeAtual] || "Não informado";

  const totalHojeRegimeAtual =
    regimeAtual === "simples" && simples.elegivel ? simples.totalMensal :
    regimeAtual === "real" && real ? real.totalMensal :
    (regimeAtual === "presumido" || regimeAtual === "real" || regimeAtual === "naosei") ? presumido.totalMensal :
    melhorRegimeHoje.totalMensal;

  const reforma = calcReformaPlena({ faturamentoMensal, setor });

  return {
    setor,
    fatorR,
    faturamentoMensal,
    faturamentoAnual: faturamentoMensal * 12,
    regimeAtual,
    regimeLabel,
    simples,
    presumido,
    real,
    melhorRegimeHoje,
    totalHojeRegimeAtual,
    reforma,
    cronograma: CRONOGRAMA_TRANSICAO
  };
}

const SETOR_LABEL = { comercio: "Comércio", industria: "Indústria", servicos: "Serviços" };

export function buildReportText(sim) {
  const lines = [];
  lines.push("📊 *Simulador Tributário Ohana — Antes x Depois da Reforma*");
  lines.push("");
  lines.push(`Setor: *${SETOR_LABEL[sim.setor] || sim.setor}*`);
  lines.push(`Faturamento médio mensal: *${formatCurrency(sim.faturamentoMensal)}*`);
  lines.push(`Regime informado: *${sim.regimeLabel}*`);
  lines.push("");
  lines.push("💰 *Carga tributária HOJE (estimada)*");
  if (sim.simples.elegivel) {
    lines.push(`• Simples Nacional (Anexo ${sim.simples.anexo}): ${formatCurrency(sim.simples.totalMensal)}/mês — alíquota efetiva ${formatPercent(sim.simples.aliquotaEfetiva)}`);
  } else {
    lines.push(`• Simples Nacional: não elegível (${sim.simples.motivo})`);
  }
  lines.push(`• Lucro Presumido: ${formatCurrency(sim.presumido.totalMensal)}/mês — alíquota efetiva ${formatPercent(sim.presumido.aliquotaEfetiva)}`);
  if (sim.real) {
    lines.push(`• Lucro Real (margem informada ${formatPercent(sim.real.margemLucro)}): ${formatCurrency(sim.real.totalMensal)}/mês — alíquota efetiva ${formatPercent(sim.real.aliquotaEfetiva)}`);
  }
  lines.push(`➡️ Regime hoje mais vantajoso na simulação: *${sim.melhorRegimeHoje.nome}* (${formatCurrency(sim.melhorRegimeHoje.totalMensal)}/mês)`);
  lines.push("");
  lines.push("🔄 *Estimativa na Reforma Tributária plena (2033)*");
  lines.push(`CBS + IBS (alíquota de referência ${formatPercent(sim.reforma.aliquotaReferencia)}) substituindo PIS/Cofins/ICMS/ISS/IPI:`);
  lines.push(`• Estimativa: ${formatCurrency(sim.reforma.totalMensal)}/mês — alíquota efetiva ${formatPercent(sim.reforma.aliquotaEfetivaSobreFaturamento)} sobre o faturamento`);
  const diff = sim.reforma.totalMensal - sim.totalHojeRegimeAtual;
  const diffPct = sim.totalHojeRegimeAtual > 0 ? diff / sim.totalHojeRegimeAtual : 0;
  lines.push(`• Variação frente ao regime atual: ${diff >= 0 ? "aumento" : "redução"} de ${formatCurrency(Math.abs(diff))}/mês (${formatPercent(Math.abs(diffPct))})`);
  lines.push("");
  lines.push("📅 *Linha do tempo da transição (2026-2033)*");
  lines.push("2026: testes (sem aumento de carga) → 2027/28: CBS substitui PIS/Cofins → 2029-2032: redução gradual de ICMS/ISS → 2033: vigência plena do CBS/IBS.");
  lines.push("");
  lines.push("⚠️ _Simulação estimativa para fins de orientação inicial, com base em tabelas oficiais e na alíquota de referência divulgada para a Reforma Tributária. Não substitui um Planejamento Tributário com seus dados contábeis reais._");
  return lines.join("\n");
}
