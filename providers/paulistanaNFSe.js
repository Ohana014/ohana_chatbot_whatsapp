import https from "https";
import fs from "fs";
import soapRequest from "easy-soap-request";
import { create } from "xmlbuilder2";

// Endpoints (produção)
const WSDL_URL = "https://nfe.prefeitura.sp.gov.br/ws/lotenfe.asmx?WSDL";
const SERVICE_URL = "https://nfe.prefeitura.sp.gov.br/ws/lotenfe.asmx";

/**
 * Gera XML do Lote RPS mínimo (ABRASF/Paulistana).
 * Ajuste as tags segundo o manual oficial.
 */
function buildEnvioLoteRPS(nf, creds) {
  const xmlObj = {
    "EnviarLoteRPSRequest": {
      "@xmlns": "http://www.prefeitura.sp.gov.br/nfe",
      "VersaoSchema": "1",
      "LoteRPS": {
        "@Id": "L1",
        "NumeroLote": "1",
        "CNPJ": nf.cnpj.replace(/\D/g, ""),
        "InscricaoMunicipal": creds.im || "",
        "QuantidadeRPS": "1",
        "ListaRPS": {
          "RPS": {
            "IdentificacaoRPS": {
              "Numero": "1",
              "Serie": "RPS",
              "Tipo": "RPS"
            },
            "DataEmissao": new Date().toISOString().substring(0,10),
            "Status": "N",
            "Servico": {
              "Valores": {
                "ValorServicos": Number(nf.valor).toFixed(2),
                "ValorDeducoes": "0.00",
                "ValorPIS": "0.00",
                "ValorCOFINS": "0.00",
                "ValorINSS": "0.00",
                "ValorIR": "0.00",
                "ValorCSLL": "0.00",
                "IssRetido": "2",
                "ValorISS": "0.00",
                "ValorLiquidoNfse": Number(nf.valor).toFixed(2)
              },
              "ItemListaServico": creds.item_lista_servico || "0107",
              "CodigoCNAE": creds.cnae || "",
              "CodigoTributacaoMunicipio": creds.codigo_tributacao || "",
              "Discriminacao": nf.descricao || nf.servico,
              "CodigoMunicipio": creds.municipality_code || "3550308"
            },
            "Prestador": {
              "CNPJ": nf.cnpj.replace(/\D/g, ""),
              "InscricaoMunicipal": creds.im || ""
            },
            "Tomador": {
              "IdentificacaoTomador": {
                "CpfCnpj": { "CNPJ": (nf.tomador || "").replace(/\D/g, "") }
              },
              "RazaoSocial": nf.tomador_razao || "TOMADOR"
            }
          }
        }
      }
    }
  };
  const xml = create(xmlObj).end({ prettyPrint: true, headless: false });
  return xml;
}

function buildSoapEnvelope(xmlBody) {
  return `<?xml version="1.0" encoding="utf-8"?>
  <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                 xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      ${xmlBody}
    </soap:Body>
  </soap:Envelope>`;
}

function getHttpsAgent() {
  // Prefer PFX when provided
  const pfxPath = process.env.PAUL_CERT_PFX;
  const pass = process.env.PAUL_CERT_PASS;
  const certPem = process.env.PAUL_CERT_PEM;
  const keyPem = process.env.PAUL_KEY_PEM;

  if (pfxPath && pass) {
    const pfx = fs.readFileSync(pfxPath);
    return new https.Agent({ pfx, passphrase: pass, rejectUnauthorized: true });
  }
  if (certPem && keyPem) {
    return new https.Agent({
      cert: fs.readFileSync(certPem),
      key: fs.readFileSync(keyPem),
      rejectUnauthorized: true
    });
  }
  throw new Error("Configure PAUL_CERT_PFX/PAUL_CERT_PASS ou PAUL_CERT_PEM/PAUL_KEY_PEM no .env");
}

/**
 * Envia Lote de RPS (síncrono/assíncrono depende de configuração do WS).
 * Retorna padrão unificado para o bot.
 */
export async function issueNFSe_PAULISTANA(nf, creds) {
  try {
    const xmlLote = buildEnvioLoteRPS(nf, creds);
    const soapEnvelope = buildSoapEnvelope(xmlLote);
    const agent = getHttpsAgent();

    const headers = {
      "Content-Type": "text/xml; charset=utf-8",
      // Algumas instalações exigem SOAPAction. Ajuste conforme o WSDL/método.
      "SOAPAction": "http://www.prefeitura.sp.gov.br/nfe/ws/lotenfe/EnviarLoteRPS"
    };

    const { response } = await soapRequest({
      url: SERVICE_URL,
      headers,
      xml: soapEnvelope,
      timeout: 30000,
      httpsAgent: agent
    });

    const { statusCode, body } = response;
    const ok = statusCode >= 200 && statusCode < 300;

    if (!ok) {
      return { ok: false, message: `HTTP ${statusCode}` };
    }

    // TODO: Parsear XML de retorno para extrair número/recibo/RPS/NFSe (usar xmlbuilder2 ou xml2js)
    // Por ora, retornamos o corpo para inspeção manual e tratamos como "enviado para processamento".
    return { ok: true, number: null, pdf_url: null, message: "Lote enviado. Consulte situação do lote.", raw: body };
  } catch (e) {
    return { ok: false, message: e.message || e.toString() };
  }
}
