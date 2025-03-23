/**
 * ChatGPT 질문추출도구.js | ChatGPT Question Extractor
 * Version: 1.0.0
 * Description: Extracts only the user's questions from ChatGPT-exported HTML files and displays them in a simple, readable format.
 *
 * Author: Vincent
 * Blog: https://mikkorimimi.blogspot.com/
 *
 * License: MIT License
 *
 * Copyright (c) 2025 Vincent
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
