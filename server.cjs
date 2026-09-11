var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");

// src/data/sampleStudents.ts
var SAMPLE_STUDENTS = [
  {
    id: "s1",
    name: "\uAE40\uBBFC\uC6B0",
    nickname: "\uCD95\uAD6C\uC655",
    gender: "\uB0A8\uD559\uC0DD",
    glasses: "\uC548\uACBD \uC548 \uC500",
    clothingColor: "\uC720\uCC44\uC0C9(\uD30C\uB791\xB7\uBE68\uAC15 \uB4F1)",
    mbtiStyle: "E (\uD65C\uBC1C\xB7\uC0AC\uAD50\uC801)",
    socksColor: "\uD770\uC0C9",
    interest: "\uC6B4\uB3D9\xB7\uC2A4\uD3EC\uCE20",
    subject: "\uCCB4\uC721\xB7\uC74C\uC545\xB7\uBBF8\uC220",
    avatarBg: "bg-blue-100 text-blue-700 border-blue-300",
    note: "\uC810\uC2EC\uC2DC\uAC04\uB9C8\uB2E4 \uC6B4\uB3D9\uC7A5\uC73C\uB85C \uC81C\uC77C \uBA3C\uC800 \uB6F0\uC5B4\uAC00\uB294 \uCE5C\uAD6C"
  },
  {
    id: "s2",
    name: "\uC774\uC9C0\uD638",
    nickname: "\uC218\uD559\uCC9C\uC7AC",
    gender: "\uB0A8\uD559\uC0DD",
    glasses: "\uC548\uACBD \uC500",
    clothingColor: "\uBB34\uCC44\uC0C9(\uAC80\uC815\xB7\uD770\xB7\uD68C\uC0C9)",
    mbtiStyle: "I (\uCC28\uBD84\xB7\uC9D1\uC911\uC801)",
    socksColor: "\uC5B4\uB450\uC6B4\uC0C9(\uAC80\uC815\xB7\uB0A8\uC0C9\xB7\uD68C\uC0C9)",
    interest: "\uAC8C\uC784\xB7e\uC2A4\uD3EC\uCE20",
    subject: "\uC218\uD559\xB7\uACFC\uD559",
    avatarBg: "bg-indigo-100 text-indigo-700 border-indigo-300",
    note: "\uC5B4\uB824\uC6B4 \uC218\uD559 \uBB38\uC81C\uB97C \uB9C9\uD798\uC5C6\uC774 \uC220\uC220 \uD478\uB294 \uCE5C\uAD6C"
  },
  {
    id: "s3",
    name: "\uBC15\uC11C\uC5F0",
    nickname: "\uB304\uC2F1\uBA38\uC2E0",
    gender: "\uC5EC\uD559\uC0DD",
    glasses: "\uC548\uACBD \uC548 \uC500",
    clothingColor: "\uD30C\uC2A4\uD154\xB7\uBC1D\uC740\uC0C9",
    mbtiStyle: "E (\uD65C\uBC1C\xB7\uC0AC\uAD50\uC801)",
    socksColor: "\uD654\uB824\uD55C \uC0C9\xB7\uBB34\uB2AC",
    interest: "K-POP\xB7\uC544\uC774\uB3CC",
    subject: "\uCCB4\uC721\xB7\uC74C\uC545\xB7\uBBF8\uC220",
    avatarBg: "bg-pink-100 text-pink-700 border-pink-300",
    note: "\uCD5C\uC2E0 \uC544\uC774\uB3CC \uB304\uC2A4 \uCC4C\uB9B0\uC9C0\uB97C \uBAA8\uB450 \uC12D\uB835\uD55C \uCE5C\uAD6C"
  },
  {
    id: "s4",
    name: "\uCD5C\uD558\uC740",
    nickname: "\uC6F9\uD230\uC791\uAC00",
    gender: "\uC5EC\uD559\uC0DD",
    glasses: "\uC548\uACBD \uC500",
    clothingColor: "\uBB34\uCC44\uC0C9(\uAC80\uC815\xB7\uD770\xB7\uD68C\uC0C9)",
    mbtiStyle: "I (\uCC28\uBD84\xB7\uC9D1\uC911\uC801)",
    socksColor: "\uD770\uC0C9",
    interest: "\uB9CC\uD654\xB7\uC6F9\uD230\xB7\uC560\uB2C8",
    subject: "\uAD6D\uC5B4\xB7\uC0AC\uD68C\xB7\uC601\uC5B4",
    avatarBg: "bg-purple-100 text-purple-700 border-purple-300",
    note: "\uACF5\uCC45 \uC5EC\uBC31\uC5D0 \uADC0\uC5EC\uC6B4 \uCE90\uB9AD\uD130\uB97C \uB69D\uB531 \uADF8\uB9AC\uB294 \uCE5C\uAD6C"
  },
  {
    id: "s5",
    name: "\uC815\uB3C4\uD604",
    nickname: "\uCF54\uB529\uB9C8\uC2A4\uD130",
    gender: "\uB0A8\uD559\uC0DD",
    glasses: "\uC548\uACBD \uC500",
    clothingColor: "\uBB34\uCC44\uC0C9(\uAC80\uC815\xB7\uD770\xB7\uD68C\uC0C9)",
    mbtiStyle: "I (\uCC28\uBD84\xB7\uC9D1\uC911\uC801)",
    socksColor: "\uD770\uC0C9",
    interest: "\uAC8C\uC784\xB7e\uC2A4\uD3EC\uCE20",
    subject: "\uC815\uBCF4(\uCEF4\uD4E8\uD130)",
    avatarBg: "bg-cyan-100 text-cyan-700 border-cyan-300",
    note: "\uC5D4\uD2B8\uB9AC\uC640 \uD30C\uC774\uC36C\uC73C\uB85C \uBBF8\uB2C8\uAC8C\uC784\uC744 \uB9CC\uB4DC\uB294 \uC2E4\uB825\uC790"
  },
  {
    id: "s6",
    name: "\uAC15\uC720\uC9C4",
    nickname: "\uBBF8\uC18C\uCC9C\uC0AC",
    gender: "\uC5EC\uD559\uC0DD",
    glasses: "\uC548\uACBD \uC548 \uC500",
    clothingColor: "\uD30C\uC2A4\uD154\xB7\uBC1D\uC740\uC0C9",
    mbtiStyle: "E (\uD65C\uBC1C\xB7\uC0AC\uAD50\uC801)",
    socksColor: "\uD770\uC0C9",
    interest: "\uCC3D\uC791\xB7\uB3C5\uC11C\xB7\uC694\uB9AC",
    subject: "\uAD6D\uC5B4\xB7\uC0AC\uD68C\xB7\uC601\uC5B4",
    avatarBg: "bg-amber-100 text-amber-700 border-amber-300",
    note: "\uD56D\uC0C1 \uBC1D\uC740 \uBBF8\uC18C\uB85C \uBC18 \uCE5C\uAD6C\uB4E4\uC5D0\uAC8C \uBA3C\uC800 \uC778\uC0AC\uD558\uB294 \uBD84\uC704\uAE30 \uBA54\uC774\uCEE4"
  },
  {
    id: "s7",
    name: "\uC724\uC900\uD601",
    nickname: "3\uC810\uC288\uD130",
    gender: "\uB0A8\uD559\uC0DD",
    glasses: "\uC548\uACBD \uC548 \uC500",
    clothingColor: "\uC720\uCC44\uC0C9(\uD30C\uB791\xB7\uBE68\uAC15 \uB4F1)",
    mbtiStyle: "E (\uD65C\uBC1C\xB7\uC0AC\uAD50\uC801)",
    socksColor: "\uD654\uB824\uD55C \uC0C9\xB7\uBB34\uB2AC",
    interest: "\uC6B4\uB3D9\xB7\uC2A4\uD3EC\uCE20",
    subject: "\uCCB4\uC721\xB7\uC74C\uC545\xB7\uBBF8\uC220",
    avatarBg: "bg-orange-100 text-orange-700 border-orange-300",
    note: "\uB18D\uAD6C\uACF5\uB9CC \uC7A1\uC73C\uBA74 3\uC810 \uC29B\uC744 \uAF42\uC544 \uB123\uB294 \uC7A5\uC2E0 \uC288\uD130"
  },
  {
    id: "s8",
    name: "\uC784\uC18C\uC728",
    nickname: "\uACFC\uD559\uD0D0\uD5D8\uAC00",
    gender: "\uC5EC\uD559\uC0DD",
    glasses: "\uC548\uACBD \uC500",
    clothingColor: "\uC720\uCC44\uC0C9(\uD30C\uB791\xB7\uBE68\uAC15 \uB4F1)",
    mbtiStyle: "I (\uCC28\uBD84\xB7\uC9D1\uC911\uC801)",
    socksColor: "\uC5B4\uB450\uC6B4\uC0C9(\uAC80\uC815\xB7\uB0A8\uC0C9\xB7\uD68C\uC0C9)",
    interest: "\uCC3D\uC791\xB7\uB3C5\uC11C\xB7\uC694\uB9AC",
    subject: "\uC218\uD559\xB7\uACFC\uD559",
    avatarBg: "bg-emerald-100 text-emerald-700 border-emerald-300",
    note: "\uACFC\uD559 \uC2E4\uD5D8 \uC2DC\uAC04\uB9C8\uB2E4 \uD638\uAE30\uC2EC \uAC00\uB4DD\uD55C \uB208\uC73C\uB85C \uAD00\uCC30\uD558\uB294 \uD0D0\uAD6C\uD30C"
  },
  {
    id: "s9",
    name: "\uC1A1\uD0DC\uC724",
    nickname: "\uC74C\uC545\uB300\uC7A5",
    gender: "\uB0A8\uD559\uC0DD",
    glasses: "\uC548\uACBD \uC548 \uC500",
    clothingColor: "\uBB34\uCC44\uC0C9(\uAC80\uC815\xB7\uD770\xB7\uD68C\uC0C9)",
    mbtiStyle: "E (\uD65C\uBC1C\xB7\uC0AC\uAD50\uC801)",
    socksColor: "\uC5B4\uB450\uC6B4\uC0C9(\uAC80\uC815\xB7\uB0A8\uC0C9\xB7\uD68C\uC0C9)",
    interest: "K-POP\xB7\uC544\uC774\uB3CC",
    subject: "\uCCB4\uC721\xB7\uC74C\uC545\xB7\uBBF8\uC220",
    avatarBg: "bg-violet-100 text-violet-700 border-violet-300",
    note: "\uC74C\uC545 \uC2DC\uAC04\uC5D0 \uB9AC\uCF54\uB354\uC640 \uD53C\uC544\uB178\uB97C \uC644\uBCBD\uD558\uAC8C \uC5F0\uC8FC\uD558\uB294 \uCE5C\uAD6C"
  },
  {
    id: "s10",
    name: "\uC624\uB2E4\uC740",
    nickname: "\uD1A0\uB860\uC655",
    gender: "\uC5EC\uD559\uC0DD",
    glasses: "\uC548\uACBD \uC548 \uC500",
    clothingColor: "\uBB34\uCC44\uC0C9(\uAC80\uC815\xB7\uD770\xB7\uD68C\uC0C9)",
    mbtiStyle: "E (\uD65C\uBC1C\xB7\uC0AC\uAD50\uC801)",
    socksColor: "\uD770\uC0C9",
    interest: "\uCC3D\uC791\xB7\uB3C5\uC11C\xB7\uC694\uB9AC",
    subject: "\uAD6D\uC5B4\xB7\uC0AC\uD68C\xB7\uC601\uC5B4",
    avatarBg: "bg-rose-100 text-rose-700 border-rose-300",
    note: "\uAD6D\uC5B4 \uC0AC\uD68C \uC2DC\uAC04 \uD1A0\uB860\uC5D0\uC11C \uB611 \uBD80\uB7EC\uC9C0\uAC8C \uC758\uACAC\uC744 \uB9D0\uD558\uB294 \uCE5C\uAD6C"
  },
  {
    id: "s11",
    name: "\uC2E0\uC2DC\uC6B0",
    nickname: "\uBCF4\uB4DC\uAC8C\uC784\uB7EC",
    gender: "\uB0A8\uD559\uC0DD",
    glasses: "\uC548\uACBD \uC500",
    clothingColor: "\uD30C\uC2A4\uD154\xB7\uBC1D\uC740\uC0C9",
    mbtiStyle: "I (\uCC28\uBD84\xB7\uC9D1\uC911\uC801)",
    socksColor: "\uD654\uB824\uD55C \uC0C9\xB7\uBB34\uB2AC",
    interest: "\uAC8C\uC784\xB7e\uC2A4\uD3EC\uCE20",
    subject: "\uC218\uD559\xB7\uACFC\uD559",
    avatarBg: "bg-teal-100 text-teal-700 border-teal-300",
    note: "\uC26C\uB294 \uC2DC\uAC04\uB9C8\uB2E4 \uB8E8\uBBF8\uD050\uBE0C\uC640 \uCCB4\uC2A4\uB85C \uBC18 \uCE5C\uAD6C\uB4E4\uC744 \uC774\uAE30\uB294 \uC804\uB7B5\uAC00"
  },
  {
    id: "s12",
    name: "\uD55C\uC608\uB9B0",
    nickname: "\uCC45\uBC8C\uB808",
    gender: "\uC5EC\uD559\uC0DD",
    glasses: "\uC548\uACBD \uC500",
    clothingColor: "\uD30C\uC2A4\uD154\xB7\uBC1D\uC740\uC0C9",
    mbtiStyle: "I (\uCC28\uBD84\xB7\uC9D1\uC911\uC801)",
    socksColor: "\uD770\uC0C9",
    interest: "\uCC3D\uC791\xB7\uB3C5\uC11C\xB7\uC694\uB9AC",
    subject: "\uAD6D\uC5B4\xB7\uC0AC\uD68C\xB7\uC601\uC5B4",
    avatarBg: "bg-sky-100 text-sky-700 border-sky-300",
    note: "\uD55C \uB2EC\uC5D0 \uB3C4\uC11C\uAD00 \uCC45\uC744 20\uAD8C\uC529 \uC77D\uB294 \uB2E4\uB3C5\uC655"
  },
  {
    id: "s13",
    name: "\uBB38\uD604\uC6B0",
    nickname: "\uC2A4\uD53C\uB4DC\uC2A4\uD0C0",
    gender: "\uB0A8\uD559\uC0DD",
    glasses: "\uC548\uACBD \uC548 \uC500",
    clothingColor: "\uC720\uCC44\uC0C9(\uD30C\uB791\xB7\uBE68\uAC15 \uB4F1)",
    mbtiStyle: "E (\uD65C\uBC1C\xB7\uC0AC\uAD50\uC801)",
    socksColor: "\uD770\uC0C9",
    interest: "\uC6B4\uB3D9\xB7\uC2A4\uD3EC\uCE20",
    subject: "\uAD6D\uC5B4\xB7\uC0AC\uD68C\xB7\uC601\uC5B4",
    avatarBg: "bg-lime-100 text-lime-700 border-lime-300",
    note: "50\uBBF8\uD130 \uB2EC\uB9AC\uAE30 1\uB4F1! \uCCB4\uC721\uB300\uD68C \uACC4\uC8FC \uB9C8\uC9C0\uB9C9 \uC8FC\uC790"
  },
  {
    id: "s14",
    name: "\uAD8C\uC218\uC544",
    nickname: "\uAC10\uC131\uC791\uAC00",
    gender: "\uC5EC\uD559\uC0DD",
    glasses: "\uC548\uACBD \uC548 \uC500",
    clothingColor: "\uD30C\uC2A4\uD154\xB7\uBC1D\uC740\uC0C9",
    mbtiStyle: "I (\uCC28\uBD84\xB7\uC9D1\uC911\uC801)",
    socksColor: "\uD654\uB824\uD55C \uC0C9\xB7\uBB34\uB2AC",
    interest: "\uB9CC\uD654\xB7\uC6F9\uD230\xB7\uC560\uB2C8",
    subject: "\uCCB4\uC721\xB7\uC74C\uC545\xB7\uBBF8\uC220",
    avatarBg: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300",
    note: "\uC77C\uAE30\uC7A5\uC5D0 \uAC10\uC131 \uAC00\uB4DD\uD55C \uB3D9\uC2DC\uC640 \uC77C\uB7EC\uC2A4\uD2B8\uB97C \uB0A8\uAE30\uB294 \uCE5C\uAD6C"
  },
  {
    id: "s15",
    name: "\uC870\uAC74\uC6B0",
    nickname: "\uAC8C\uC784\uC7A5\uC778",
    gender: "\uB0A8\uD559\uC0DD",
    glasses: "\uC548\uACBD \uC500",
    clothingColor: "\uBB34\uCC44\uC0C9(\uAC80\uC815\xB7\uD770\xB7\uD68C\uC0C9)",
    mbtiStyle: "E (\uD65C\uBC1C\xB7\uC0AC\uAD50\uC801)",
    socksColor: "\uC5B4\uB450\uC6B4\uC0C9(\uAC80\uC815\xB7\uB0A8\uC0C9\xB7\uD68C\uC0C9)",
    interest: "\uAC8C\uC784\xB7e\uC2A4\uD3EC\uCE20",
    subject: "\uC815\uBCF4(\uCEF4\uD4E8\uD130)",
    avatarBg: "bg-slate-100 text-slate-700 border-slate-300",
    note: "\uCE5C\uAD6C\uB4E4\uACFC \uD611\uB3D9 \uAC8C\uC784\uD560 \uB54C \uBE0C\uB9AC\uD551\uC744 \uAC00\uC7A5 \uC798\uD558\uB294 \uC624\uB354\uB9E8"
  },
  {
    id: "s16",
    name: "\uBC30\uCC44\uC6D0",
    nickname: "\uC601\uC5B4\uC2A4\uD0C0",
    gender: "\uC5EC\uD559\uC0DD",
    glasses: "\uC548\uACBD \uC500",
    clothingColor: "\uC720\uCC44\uC0C9(\uD30C\uB791\xB7\uBE68\uAC15 \uB4F1)",
    mbtiStyle: "E (\uD65C\uBC1C\xB7\uC0AC\uAD50\uC801)",
    socksColor: "\uC5B4\uB450\uC6B4\uC0C9(\uAC80\uC815\xB7\uB0A8\uC0C9\xB7\uD68C\uC0C9)",
    interest: "K-POP\xB7\uC544\uC774\uB3CC",
    subject: "\uAD6D\uC5B4\xB7\uC0AC\uD68C\xB7\uC601\uC5B4",
    avatarBg: "bg-yellow-100 text-yellow-800 border-yellow-300",
    note: "\uD31D\uC1A1 \uAC00\uC0AC\uB97C \uC220\uC220 \uC678\uC6B0\uBA70 \uC6D0\uC5B4\uBBFC \uBC1C\uC74C\uC73C\uB85C \uB7A9\uC744 \uD558\uB294 \uCE5C\uAD6C"
  }
];

// server.ts
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var DATA_DIR = import_path.default.join(process.cwd(), "data");
var STUDENTS_FILE = import_path.default.join(DATA_DIR, "students.json");
var CONFIG_FILE = import_path.default.join(DATA_DIR, "config.json");
if (!import_fs.default.existsSync(DATA_DIR)) {
  import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
}
var teacherPin = "1234";
if (import_fs.default.existsSync(CONFIG_FILE)) {
  try {
    const config = JSON.parse(import_fs.default.readFileSync(CONFIG_FILE, "utf-8"));
    if (config.teacherPin) {
      teacherPin = config.teacherPin;
    }
  } catch (err) {
    console.error("Error reading config file:", err);
  }
}
function saveConfig() {
  try {
    import_fs.default.writeFileSync(CONFIG_FILE, JSON.stringify({ teacherPin }, null, 2));
  } catch (err) {
    console.error("Error saving config:", err);
  }
}
var students = [];
if (import_fs.default.existsSync(STUDENTS_FILE)) {
  try {
    const loaded = JSON.parse(import_fs.default.readFileSync(STUDENTS_FILE, "utf-8"));
    if (Array.isArray(loaded) && loaded.length > 0) {
      students = loaded.map((s) => {
        const sampleMatch = SAMPLE_STUDENTS.find((sample) => sample.id === s.id);
        if (sampleMatch && (s.nickname.includes(s.name) || !s.name || s.nickname === s.name)) {
          return {
            ...s,
            name: sampleMatch.name,
            nickname: sampleMatch.nickname
          };
        }
        return {
          ...s,
          name: s.name || s.nickname || "\uC774\uB984 \uC5C6\uC74C",
          nickname: s.nickname || s.name || "\uBCC4\uBA85 \uC5C6\uC74C"
        };
      });
      saveStudents();
    } else {
      students = SAMPLE_STUDENTS;
      saveStudents();
    }
  } catch (err) {
    console.error("Error reading students file:", err);
    students = SAMPLE_STUDENTS;
    saveStudents();
  }
} else {
  students = SAMPLE_STUDENTS;
  saveStudents();
}
function saveStudents() {
  try {
    import_fs.default.writeFileSync(STUDENTS_FILE, JSON.stringify(students, null, 2));
  } catch (err) {
    console.error("Error saving students:", err);
  }
}
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});
app.get("/api/students", (req, res) => {
  res.json(students);
});
app.post("/api/students", (req, res) => {
  const {
    id,
    name,
    nickname,
    gender,
    glasses,
    clothingColor,
    mbtiStyle,
    socksColor,
    interest,
    subject,
    note,
    avatarBg
  } = req.body;
  const validName = name && typeof name === "string" && name.trim() || nickname && typeof nickname === "string" && nickname.trim();
  const validNickname = nickname && typeof nickname === "string" && nickname.trim() || validName;
  if (!validName || !validNickname) {
    return res.status(400).json({ error: "\uC774\uB984\uACFC \uB2C9\uB124\uC784\uC744 \uBAA8\uB450 \uC785\uB825\uD574 \uC8FC\uC138\uC694." });
  }
  if (id && typeof id === "string") {
    const existingIndex = students.findIndex((s) => s.id === id);
    if (existingIndex !== -1) {
      const updated = {
        ...students[existingIndex],
        name: validName,
        nickname: validNickname,
        gender: gender || students[existingIndex].gender,
        glasses: glasses || students[existingIndex].glasses,
        clothingColor: clothingColor || students[existingIndex].clothingColor,
        mbtiStyle: mbtiStyle || students[existingIndex].mbtiStyle,
        socksColor: socksColor || students[existingIndex].socksColor,
        interest: interest || students[existingIndex].interest,
        subject: subject || students[existingIndex].subject,
        note: note !== void 0 ? String(note).trim() : students[existingIndex].note,
        avatarBg: avatarBg || students[existingIndex].avatarBg
      };
      students[existingIndex] = updated;
      saveStudents();
      return res.json(updated);
    }
  }
  const newStudent = {
    id: id || `student-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name: validName,
    nickname: validNickname,
    gender: gender || "\uB0A8\uD559\uC0DD",
    glasses: glasses || "\uC548\uACBD \uC548 \uC500",
    clothingColor: clothingColor || "\uBB34\uCC44\uC0C9(\uAC80\uC815\xB7\uD770\xB7\uD68C\uC0C9)",
    mbtiStyle: mbtiStyle || "E (\uD65C\uBC1C\xB7\uC0AC\uAD50\uC801)",
    socksColor: socksColor || "\uD770\uC0C9",
    interest: interest || "\uAC8C\uC784\xB7e\uC2A4\uD3EC\uCE20",
    subject: subject || "\uC218\uD559\xB7\uACFC\uD559",
    note: note ? String(note).trim() : void 0,
    avatarBg: avatarBg || "bg-indigo-100 text-indigo-700 border-indigo-300",
    submittedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  students.unshift(newStudent);
  saveStudents();
  res.status(201).json(newStudent);
});
app.delete("/api/students/:id", (req, res) => {
  const { id } = req.params;
  students = students.filter((s) => s.id !== id);
  saveStudents();
  res.json({ success: true, count: students.length });
});
app.post("/api/students/bulk", (req, res) => {
  const { action, sampleData } = req.body;
  if (action === "clear") {
    students = [];
    saveStudents();
    return res.json({ success: true, students: [] });
  } else if (action === "sample" && Array.isArray(sampleData)) {
    students = sampleData;
    saveStudents();
    return res.json({ success: true, students });
  }
  res.status(400).json({ error: "\uC798\uBABB\uB41C \uC791\uC5C5 \uC694\uCCAD\uC785\uB2C8\uB2E4." });
});
app.post("/api/teacher/verify", (req, res) => {
  const { pin } = req.body;
  const inputPin = typeof pin === "string" ? pin.trim() : String(pin || "").trim();
  if (inputPin === teacherPin) {
    res.json({ success: true, pin: teacherPin });
  } else {
    res.status(401).json({ success: false, error: "\uBE44\uBC00\uBC88\uD638\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4." });
  }
});
app.post("/api/teacher/change-pin", (req, res) => {
  const { oldPin, newPin } = req.body;
  const inputOldPin = typeof oldPin === "string" ? oldPin.trim() : String(oldPin || "").trim();
  const inputNewPin = typeof newPin === "string" ? newPin.trim() : String(newPin || "").trim();
  if (inputOldPin !== teacherPin) {
    return res.status(401).json({
      success: false,
      error: "\uD604\uC7AC \uBE44\uBC00\uBC88\uD638\uAC00 \uC77C\uCE58\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. (\uCD08\uAE30 \uAE30\uBCF8 \uBE44\uBC00\uBC88\uD638: 1234)"
    });
  }
  if (!inputNewPin || inputNewPin.length < 4) {
    return res.status(400).json({
      success: false,
      error: "\uC0C8 \uBE44\uBC00\uBC88\uD638\uB294 \uCD5C\uC18C 4\uC790\uB9AC \uC774\uC0C1\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4."
    });
  }
  teacherPin = inputNewPin;
  saveConfig();
  res.json({ success: true });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
