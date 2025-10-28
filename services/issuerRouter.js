import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { issueNFSe_MOCK } from "../providers/mockNFSe.js";
import { issueNFSe_BLING } from "../providers/blingNFSe.js";
import { issueNFSe_TINY } from "../providers/tinyNFSe.js";
import { issueNFSe_GENERIC } from "../providers/genericNFSe.js";
import { issueNFSe_PAULISTANA } from "../providers/paulistanaNFSe.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, "..", "config", "issuers.json");
let CONFIG = { companies: [] };

if (fs.existsSync(configPath)) {
  CONFIG = JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

function findCompany(cnpj) {
  const clean = (cnpj || "").replace(/\D/g, "");
  return CONFIG.companies.find(c => c.cnpj === clean);
}

export async function issueNFSeByCNPJ(nf) {
  const company = findCompany(nf.cnpj);
  if (!company) {
    return { ok: false, message: `CNPJ ${nf.cnpj} não mapeado em config/issuers.json` };
  }

  const prov = (company.provider || "mock").toLowerCase();
  const creds = company.credentials || {};

  if (prov === "mock") return issueNFSe_MOCK(nf, creds);
  if (prov === "bling") return issueNFSe_BLING(nf, creds);
  if (prov === "tiny") return issueNFSe_TINY(nf, creds);
  if (prov === "generic") return issueNFSe_GENERIC(nf, creds);
      if (prov === "paulistana") return issueNFSe_PAULISTANA(nf, creds);

  return { ok: false, message: `Provider desconhecido: ${prov}` };
}
