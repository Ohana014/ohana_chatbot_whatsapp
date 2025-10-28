import axios from "axios";

/**
 * Adapter TINY NFSe (esqueleto)
 * Preencha as URLs e headers conforme sua conta Tiny.
 */
export async function issueNFSe_TINY(nf, creds) {
  try {
    const payload = {
      cnpj_prestador: nf.cnpj,
      municipio_codigo: creds.municipality_code,
      servico: nf.servico,
      descricao: nf.descricao,
      valor: Number(nf.valor),
      tomador: nf.tomador
    };

    const r = await axios.post(
      "https://api.tiny.com.br/nfse", // AJUSTAR
      payload,
      {
        headers: {
          "X-Api-Key": creds.api_key,
          "Content-Type": "application/json"
        }
      }
    );

    const ok = r.status >= 200 && r.status < 300;
    const number = r.data?.numero || r.data?.id || null;
    const pdf_url = r.data?.pdf || r.data?.link_pdf || null;

    return ok ? { ok: true, number, pdf_url } : { ok: false, message: "Falha na emissão NFSe (Tiny)" };
  } catch (e) {
    return { ok: false, message: e.response?.data?.message || e.toString() };
  }
}
