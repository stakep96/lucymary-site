/** Contrato futuro do carrinho: cada sessão deve usar seu próprio Cart-Token. */
export interface CartSession {
  token: string;
}
