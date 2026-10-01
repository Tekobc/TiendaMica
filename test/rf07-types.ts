import type { PagoEstado } from "../lib/types";

const estado: PagoEstado = "pendiente";

if (estado !== "pendiente") {
  throw new Error("RF-07 requiere que el estado base de compra sea pendiente.");
}

console.log("RF-07 type check ok");
