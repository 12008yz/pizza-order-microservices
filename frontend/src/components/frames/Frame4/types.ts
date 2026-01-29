export type RouterNeedOption = 'need' | 'from_operator' | 'own' | 'no_thanks';
export type RouterPurchaseOption = 'buy' | 'installment' | 'rent';
export type RouterConfigOption = 'no_config' | 'with_config';

export interface RouterSelection {
  need: RouterNeedOption | null;
  purchase?: RouterPurchaseOption | null;
  operator?: string | null;
  config?: RouterConfigOption | null;
}

export interface EquipmentState {
  router: RouterSelection;
}
