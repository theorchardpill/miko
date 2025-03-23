/**
 * ChatGPT 질문추출도구.js | ChatGPT Question Extractor
 * 버전: 1.0.0
 * 설명: ChatGPT에서 내보낸 HTML 파일 중 사용자의 질문만 추출하여 간단하고 읽기 쉬운 형식으로 보여주는 도구입니다.
 *
 * 제작자: Vincent
 * 블로그: https://mikkorimimi.blogspot.com/
 *
 * 라이선스: MIT License
 *
 * Copyright (c) 2025 Vincent
 *
 * 본 소프트웨어 및 관련 문서 파일(이하 "소프트웨어")의 사본을 취득하는 모든 사람에게,
 * 소프트웨어를 제한 없이 사용, 복사, 수정, 병합, 게시, 배포, 서브라이선스 및 판매할 수 있는 권한을 무료로 부여합니다.
 * 또한 소프트웨어가 제공된 대상에게 동일한 권한을 허용할 수 있습니다.
 *
 * 단, 위 저작권 고지 및 이 허가 고지를 소프트웨어의 모든 사본 또는 주요 부분에 반드시 포함해야 합니다.
 *
 * 이 소프트웨어는 상품성, 특정 목적에의 적합성, 권리 비침해 여부에 대한 보증 없이 "있는 그대로(as is)" 제공됩니다.
 * 어떠한 경우에도 저작권자 또는 권리 보유자는 계약, 불법행위 또는 기타 행위로 인해
 * 소프트웨어 또는 소프트웨어의 사용이나 기타 처리와 관련하여 발생하는 손해나 기타 책임에 대해 책임을 지지 않습니다.
 */


(function(){
  "use strict";

  // 1. Extract the full text from the current page
  const fullText = document.body.innerText;

  // 2. Use regex to extract text between 'User' and 'ChatGPT'
  const regex = /\bUser\b([\s\S]*?)\bChatGPT\b/g;
  let matches = [];
  let match;
  while ((match = regex.exec(fullText)) !== null) {
    // Trim whitespace from the extracted text and add to array
    matches.push(match[1].trim());
  }

  // 3. Construct a new HTML document (with CSS for better display)
  let newHtml = `
<html>
  <head>
    <meta charset="UTF-8">
    <title>Extracted Results</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.5; }
      h1 { text-align: center; }
      .result {
        border: 1px solid #ccc;
        margin: 10px auto;
        padding: 10px;
        width: 80%;
        background-color: #f9f9f9;
        white-space: pre-wrap; /* Preserve whitespace and line breaks */
      }
    </style>
  </head>
  <body>
    <h1>Extracted Results</h1>
`;

  // Wrap each result in a <div class="result"> tag
  matches.forEach(segment => {
    newHtml += `<div class="result">${segment}</div>\n`;
  });

  newHtml += `
  </body>
</html>
`;

  // 4. (Optional) Open a new window to display the results
  // let newWindow = window.open();
  // newWindow.document.open();
  // newWindow.document.write(newHtml);
  // newWindow.document.close();

  // 5. Save the HTML content as a file using a Blob
  const blob = new Blob([newHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  // Create a temporary link element to trigger the download
  const a = document.createElement('a');
  a.href = url;
  a.download = "extracted_results.html"; // Specify the filename
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
})();
