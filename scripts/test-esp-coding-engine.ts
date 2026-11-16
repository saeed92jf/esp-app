// scripts/test-esp-coding-engine.ts
import { CodingEngineService } from "../src/modules/esp-coding/services/coding-engine.service";
import { CodingFormulaVersion, CodingFormulaSegmentConfig } from "../src/modules/esp-coding/types";
import { EspCodingStore } from "../src/lib/server/esp-coding-store";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log("==========================================");
console.log("🧪 TESTING ESP CODING ENGINE (PART 25)");
console.log("==========================================\n");

// Test Case 1: Standard 8-segment Production Code Concatenation
console.log("--- Test 1: Baseline 8-segment Concatenation ---");
const testSegments: CodingFormulaSegmentConfig[] = [
  { segmentId: "1", fieldKey: "ESP_Code", labelEn: "ESP", labelFa: "ESP", sourceEntity: "product", position: 0, enabled: true, required: true },
  { segmentId: "2", fieldKey: "Production_Code", labelEn: "Prod", labelFa: "Prod", sourceEntity: "product", position: 1, enabled: true, required: true },
  { segmentId: "3", fieldKey: "Internal_Product_Code", labelEn: "IntProd", labelFa: "IntProd", sourceEntity: "product", position: 2, enabled: true, required: true },
  { segmentId: "4", fieldKey: "Product_Type_Code", labelEn: "ProdType", labelFa: "ProdType", sourceEntity: "product", position: 3, enabled: true, required: true },
  { segmentId: "5", fieldKey: "Shape_Code", labelEn: "Shape", labelFa: "Shape", sourceEntity: "product", position: 4, enabled: true, required: true },
  { segmentId: "6", fieldKey: "Type_Code", labelEn: "Type", labelFa: "Type", sourceEntity: "product", position: 5, enabled: true, required: true },
  { segmentId: "7", fieldKey: "Lift_Size_Code", labelEn: "Lift", labelFa: "Lift", sourceEntity: "product", position: 6, enabled: true, required: true },
  { segmentId: "8", fieldKey: "Thk_Code", labelEn: "Thk", labelFa: "Thk", sourceEntity: "product", position: 7, enabled: true, required: true },
];

const formulaV1: CodingFormulaVersion = {
  versionId: "v1",
  profileId: "p1",
  versionNumber: "1.0",
  status: "active",
  separator: "none",
  targetEntity: "product",
  segments: testSegments,
  createdBy: "TEST",
  createdAt: new Date().toISOString(),
};

const sampleRow1 = {
  ESP_Code: "E",
  Production_Code: "1",
  Internal_Product_Code: "1",
  Product_Type_Code: "01",
  Shape_Code: "1",
  Type_Code: "01",
  Lift_Size_Code: "01",
  Thk_Code: "1",
};

const res1 = CodingEngineService.generateCode(formulaV1, sampleRow1);
assert(res1.code === "E1101101011", `Expected E1101101011, got ${res1.code}`);
assert(res1.isValid === true, "Result should be valid");
assert(res1.segments.length === 8, "Breakdown should have 8 segments");

// Test Case 2: Leading Zeros Preservation
console.log("\n--- Test 2: Leading Zeros Preservation ---");
const ptSegment = res1.segments.find(s => s.fieldKey === "Product_Type_Code");
assert(ptSegment?.formattedValue === "01", "Leading zero must not be stripped from 01");

// Test Case 3: Separators (Hyphen & Custom)
console.log("\n--- Test 3: Separators Handling ---");
const formulaHyphen: CodingFormulaVersion = {
  ...formulaV1,
  separator: "hyphen",
};
const resHyphen = CodingEngineService.generateCode(formulaHyphen, sampleRow1);
assert(resHyphen.code === "E-1-1-01-1-01-01-1", `Expected E-1-1-01-1-01-01-1, got ${resHyphen.code}`);

const formulaDot: CodingFormulaVersion = {
  ...formulaV1,
  separator: "dot",
};
const resDot = CodingEngineService.generateCode(formulaDot, sampleRow1);
assert(resDot.code === "E.1.1.01.1.01.01.1", `Expected E.1.1.01.1.01.01.1, got ${resDot.code}`);

// Test Case 4: Dynamic Reordering
console.log("\n--- Test 4: Dynamic Segment Reordering ---");
// Rearrange: Thk first, then ESP
const reorderedSegments = [...testSegments];
reorderedSegments[0] = { ...testSegments[7], position: 0 };
reorderedSegments[7] = { ...testSegments[0], position: 7 };

const formulaReordered: CodingFormulaVersion = {
  ...formulaV1,
  segments: reorderedSegments,
};
const resReordered = CodingEngineService.generateCode(formulaReordered, sampleRow1);
assert(resReordered.code.startsWith("1"), `Expected code to start with Thk (1), got ${resReordered.code}`);
assert(resReordered.code.endsWith("E"), `Expected code to end with ESP (E), got ${resReordered.code}`);

// Test Case 5: Required Missing Value Detection
console.log("\n--- Test 5: Missing Required Segment Handling ---");
const missingRow = { ...sampleRow1, Shape_Code: "" };
const resMissing = CodingEngineService.generateCode(formulaV1, missingRow);
assert(resMissing.isValid === false, "Missing required segment should invalidate code");
assert(resMissing.errors.length > 0, "Errors array should contain missing segment error");

// Test Case 6: Duplicate Collision Detection
console.log("\n--- Test 6: Duplicate Collision Detection ---");
const existingCodes = ["E1101101011"];
const resDup = CodingEngineService.generateCode(formulaV1, sampleRow1, existingCodes);
assert(resDup.isDuplicate === true, "Code should be flagged as duplicate");
assert(resDup.warnings.length > 0, "Duplicate warning should be present");

// Test Case 7: Super Admin Security Check
console.log("\n--- Test 7: Super Admin Security Authorization ---");
let caughtError = false;
try {
  EspCodingStore.assertSuperAdmin("admin"); // regular admin
} catch (err: any) {
  caughtError = true;
  assert(err.message.includes("SUPER ADMIN"), "Error must mention SUPER ADMIN requirement");
}
assert(caughtError === true, "Regular admin must be rejected by assertSuperAdmin");

let superadminPassed = false;
try {
  EspCodingStore.assertSuperAdmin("superadmin");
  superadminPassed = true;
} catch {}
assert(superadminPassed === true, "superadmin role must pass assertSuperAdmin");

console.log("\n==========================================");
console.log("🎉 ALL TESTS PASSED SUCCESSFULLY! (100%)");
console.log("==========================================");
