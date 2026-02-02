'use client';

// ============ ROUTER TYPES ============
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

export interface RouterWizardState {
  need: RouterNeedOption | null;
  purchaseOption: RouterPurchaseOption | null;
  operatorId: RouterOperatorOption | null;
  configOption: RouterConfigOption | null;
  configComplete: boolean;
}

// ============ TV BOX TYPES ============
export type TvBoxNeedOption = 'need' | 'have_from_operator' | 'have_own' | 'smart_tv';
export type TvBoxPurchaseOption = 'buy' | 'installment' | 'rent';
export type TvCountOption = 1 | 2 | 3 | 4;
export type TvBoxOperatorOption = 'beeline' | 'domru' | 'megafon' | 'mts' | 'rostelecom';

export interface TvBoxWizardState {
  need: TvBoxNeedOption | null;
  tvCount: TvCountOption | null;
  purchaseOption: TvBoxPurchaseOption | null;
  operatorId: TvBoxOperatorOption | null;
}

// ============ SIM CARD TYPES ============
export type SimConnectionType = 'new_number' | 'keep_number' | 'no_thanks';
export type SimClientStatus = 'new_client' | 'existing_client';
export type SimSmartphoneCount = 1 | 2 | 3 | 4 | 5;
export type SimOperatorOption = 'beeline' | 'megafon' | 'mts' | 'tele2' | 'yota';

export interface SimCardWizardState {
  connectionType: SimConnectionType | null;
  clientStatus: SimClientStatus | null;
  smartphoneCount: SimSmartphoneCount | null;
  currentOperator: SimOperatorOption | null;
}

// ============ COMBINED EQUIPMENT STATE ============
export interface EquipmentState {
  router: RouterSelection;
  tvBox?: TvBoxWizardState;
  simCard?: SimCardWizardState;
}

export interface FullEquipmentWizardState {
  router: RouterWizardState;
  tvBox: TvBoxWizardState;
  simCard: SimCardWizardState;
}
