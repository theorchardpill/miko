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
