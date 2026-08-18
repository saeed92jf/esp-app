const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '../messages/en.json');
const faPath = path.join(__dirname, '../messages/fa.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const fa = JSON.parse(fs.readFileSync(faPath, 'utf8'));

const enPlaceholders = {
  date: "Select date",
  email: "contact@company.com",
  document: "Select document / spec file...",
  indentNo: "IND-001",
  quotationNo: "QT-2026-001",
  rev: "0",
  customer: "Select customer",
  endUser: "Select end user",
  plant: "Select plant",
  title: "Project title...",
  preparedByTitle: "Title",
  preparedByName: "Full name",
  equipmentType: "Equipment Type",
  tagNo: "e.g. V-101",
  qty: "1",
  description: "Description / Remarks..."
};

const faPlaceholders = {
  date: "انتخاب تاریخ",
  email: "contact@company.com",
  document: "انتخاب سند / فایل مشخصات...",
  indentNo: "IND-001",
  quotationNo: "QT-2026-001",
  rev: "0",
  customer: "انتخاب مشتری",
  endUser: "انتخاب کاربر نهایی",
  plant: "انتخاب سایت (واحد)",
  title: "عنوان پروژه...",
  preparedByTitle: "عنوان شغلی",
  preparedByName: "نام کامل",
  equipmentType: "نوع تجهیز",
  tagNo: "مثال: V-101",
  qty: "1",
  description: "توضیحات / ملاحظات..."
};

if (!en.Flow.nodes.projectDataNode) en.Flow.nodes.projectDataNode = {};
en.Flow.nodes.projectDataNode.placeholders = enPlaceholders;

if (!fa.Flow.nodes.projectDataNode) fa.Flow.nodes.projectDataNode = {};
fa.Flow.nodes.projectDataNode.placeholders = faPlaceholders;

fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync(faPath, JSON.stringify(fa, null, 2) + '\n');

console.log("Translations updated");
