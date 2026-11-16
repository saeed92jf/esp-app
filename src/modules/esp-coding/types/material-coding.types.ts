// src/modules/esp-coding/types/material-coding.types.ts

export interface MaterialMasterRecord {
  matId: string;
  basicMaterial: string;
  basicMaterialId: string;
  basicMaterialCode: string;
  standardGroup: string;
  standardGroupId: string;
  subMaterial: string;
  subMaterialId: string;
  subMaterialCode: string;
  groupMatId: string;
  groupMat: string;
  groupMatId1: string;
  groupMat1: string;
  groupMatCode1: string;
  schMat?: string;
  schMatId?: string;
  specId: string;
  spec: string;
  specCode: string;
  grade: string;
  gradeId: string;
  gradeCode: string;
  classVal: string;
  classId: string;
  classCode: string;
  uns: string;
  form: string;
  formId?: string;
  density?: string;
  poissonsRatio?: string;
  elongation50?: string;
  elongation200?: string;
  tensileMpa?: string;
  yieldMpa?: string;
  sAllowTensile?: string;
  sAllowYield?: string;
  elasticModulus?: string;
  pren?: string;
  carbonEquivalent?: string;
  meltingPoint?: string;
  minTemp?: string;
  maxTemp?: string;
  pwht?: string;
  iso15608?: string;
  pNoRef?: string;
  aNo?: string;
  nominalComposition?: string;
  smaw?: string;
  gtaw?: string;
  gmaw?: string;
  saw?: string;
  fcaw?: string;
  hardnessMin?: string;
  hardnessMax?: string;
  dinName?: string;
  dinNumber?: string;
  dinEnNumber?: string;
  refMaterial?: string;
  refHeatTreatment?: string;
  // All 165 source fields can be preserved in rawProperties for full fidelity
  rawProperties: Record<string, string>;
}

export interface MaterialFormRecord {
  id: string;
  generalFormId: string;
  generalForm: string;
  categoryFormId: string;
  categoryForm: string;
  subFormId: string;
  subForm: string;
  defaultDetailForms?: string;
  titleDetailsForm?: string;
  materialFormName?: string;
  subFormIdOtherTbl?: string;
  subAdditional?: string;
  refPic?: string;
  materialForm?: string;
  materialNonMetal?: string;
  reference?: string;
  referenceName?: string;
  referenceDescription?: string;
  unitRelation?: string;
  mtoDoc?: string;
  mtoFormat?: string;
  mtoFormatDescription?: string;
}

export interface ProductMaterialRelation {
  id: string;
  productId: string;
  matId: string;
  componentName: string; // e.g. "Tray Deck", "Downcomer", "Support Beam"
  role: "primary" | "secondary" | "bolting" | "gasket" | "cladding";
  quantity?: number;
  unit?: string;
  technicalNotes?: string;
}
