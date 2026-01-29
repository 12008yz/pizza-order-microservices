export type RouterNeedOption = 'need' | 'from_operator' | 'own' | 'no_thanks';
export type RouterPurchaseOption = 'buy' | 'installment' | 'rent';
export type RouterConfigOption = 'no_config' | 'with_config';
export type RouterOperatorOption = 'beeline' | 'domru' | 'megafon' | 'mts' | 'rostelecom';

export interface RouterSelection {
  need: RouterNeedOption | null;
  purchase?: RouterPurchaseOption | null;
  operator?: RouterOperatorOption | null;
  config?: RouterConfigOption | null;
}

export interface EquipmentState {
  router: RouterSelection;
}
