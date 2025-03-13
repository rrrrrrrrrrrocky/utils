const fs = require("fs-extra");
const path = require("path");
const babelParser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

const directory = "./src"; // 분석할 프로젝트 디렉터리 경로

// 특정 디렉터리 내 .js 파일 검색
const getJSFiles = (dir) => {
  let files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files = files.concat(getJSFiles(fullPath)); // 재귀적으로 탐색
    } else if (fullPath.endsWith(".js")) {
      files.push(fullPath);
    }
  }

  return files;
};

// 파일 내 JSX 코드 존재 여부 확인
const containsJSX = (filePath) => {
  const code = fs.readFileSync(filePath, "utf8");

  try {
    const ast = babelParser.parse(code, {
      sourceType: "module",
      plugins: ["jsx"],
    });

    let hasJSX = false;

    traverse(ast, {
      JSXElement() {
        hasJSX = true;
      },
    });

    return hasJSX;
  } catch (error) {
    console.error(`❌ Failed to parse ${filePath}:`, error.message);
    return false;
  }
};

// JSX 포함된 파일 확장자 변경
const convertFiles = () => {
  const jsFiles = getJSFiles(directory);

  jsFiles.forEach((filePath) => {
    if (containsJSX(filePath)) {
      const newFilePath = filePath.replace(/\.js$/, ".jsx");
      fs.renameSync(filePath, newFilePath);
      console.log(`✅ Renamed: ${filePath} → ${newFilePath}`);
    }
  });

  console.log("🎉 Conversion complete!");
};

// 실행
convertFiles();
