import { gerarProtocolo } from "../utils/protocol.js";

/**
 * Emissor MOCK de NFSe - retorna sucesso simulado
 * @param {object} nf - { cnpj, municipio, servico, valor, descricao, tomador }
 * @param {object} creds - { api_key, company_id, municipality_code }
 * @returns {Promise<{ok:boolean, number?:string, rps?:string, pdf_url?:string, message?:string}>}
 */
export async function issueNFSe_MOCK(nf, creds) {
  // Simula latência e sucesso
  await new Promise(r => setTimeout(r, 600));
  const protocolo = gerarProtocolo("RPS");
  const number = Math.floor(100000 + Math.random() * 900000).toString();
  const pdf_url = `https://example.com/nfse/${number}.pdf`;
  return { ok: true, number, rps: protocolo, pdf_url };
}
