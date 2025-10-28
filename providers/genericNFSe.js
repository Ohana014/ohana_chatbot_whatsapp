import axios from "axios";

/**
 * Adapter GENÉRICO de NFSe
 * Configure em creds: { base_url, api_key, headers: { ... }, paths: { issue: "/nfse" } }
 */
export async function issueNFSe_GENERIC(nf, creds) {
  try {
    const url = (creds.base_url || "").replace(/\/$/, "") + (creds.paths?.issue || "/nfse");
    const headers = Object.assign(
      { "Content-Type": "application/json" },
      creds.headers || {},
      creds.api_key ? { Authorization: `Bearer ${creds.api_key}` } : {}
    );

    const payload = {
      cnpj: nf.cnpj,
      municipio: nf.municipio,
      servico: nf.servico,
      descricao: nf.descricao,
      valor: Number(nf.valor),
      tomador: nf.tomador
    };

    const r = await axios.post(url, payload, { headers });
    const ok = r.status >= 200 && r.status < 300;
    const number = r.data?.numero || r.data?.id || null;
    const pdf_url = r.data?.pdf || r.data?.link_pdf || null;
    return ok ? { ok: true, number, pdf_url } : { ok: false, message: "Falha na emissão NFSe (Generic)" };
  } catch (e) {
    return { ok: false, message: e.response?.data?.message || e.toString() };
  }
}
