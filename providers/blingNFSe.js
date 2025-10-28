import axios from "axios";

/**
 * Adapter BLING NFSe (esqueleto)
 * Preencha as URLs e headers conforme sua conta Bling.
 * @param {object} nf - { cnpj, municipio, servico, valor, descricao, tomador }
 * @param {object} creds - { api_key, company_id, municipality_code }
 */
export async function issueNFSe_BLING(nf, creds) {
  try {
    // Exemplo ilustrativo (ajuste segundo a documentação do seu emissor)
    const payload = {
      prestador_cnpj: nf.cnpj,
      municipio_codigo: creds.municipality_code,
      servico: nf.servico,
      descricao: nf.descricao,
      valor: Number(nf.valor),
      tomador: nf.tomador
    };

    const r = await axios.post(
      "https://api.bling.com.br/servico/nfse", // AJUSTAR
      payload,
      {
        headers: {
          Authorization: `Bearer ${creds.api_key}`,
          "Content-Type": "application/json"
        }
      }
    );

    // Adapte aos campos reais do retorno da API do emissor
    const ok = r.status >= 200 && r.status < 300;
    const number = r.data?.numero || r.data?.id || null;
    const pdf_url = r.data?.pdf || r.data?.link_pdf || null;

    return ok ? { ok: true, number, pdf_url } : { ok: false, message: "Falha na emissão NFSe (Bling)" };
  } catch (e) {
    return { ok: false, message: e.response?.data?.message || e.toString() };
  }
}
