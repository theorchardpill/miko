# miko

ChatGPT와의 여정에서 이 도구가 유용하고 의미가 있길 바랍니다.  
_Built in collaboration with ChatGPT through real, hands-on refinement, this snippet reflects a real user’s needs.
I hope it makes your experience a little easier and more meaningful._

---

## 📚 Table of Contents

- [ChatGPT 대화관리도구.js | ChatGPT Conversation Organizer](#-chatgpt-대화관리도구js--chatgpt-conversation-organizer)
  - [주요 기능 | Features](#-주요-기능--features)
  - [사용 방법 | How to Use](#-사용-방법--how-to-use)
- [ChatGPT 질문추출도구.js | ChatGPT Question Extractor](#-chatgpt-질문추출도구js-question_extractionjs--chatgpt-question-extractor)
  - [주요 기능 | Features](#-주요-기능--features-1)
  - [사용 방법 | How to Use](#-사용-방법--how-to-use-1)
- [라이선스 | License](#-라이선스--license)
- [제작자 | Author](#-제작자--author)


## 🧾 ChatGPT 대화관리도구.js | ChatGPT Conversation Organizer

ChatGPT에서 HTML로 내보낸 대화를 더 쉽게 읽고, 검색하고, 정리할 수 있게 도와주는 간단한 자바스크립트 유틸리티입니다.  
_A simple JavaScript utility to enhance, search, and organize ChatGPT-exported HTML conversations._

### ✨ 주요 기능 | Features

- 대화 내용 검색 (질문/답변 필터링)  
- 개별 질문/답변 수정 및 삭제  
- 읽기 편한 레이아웃 스타일링  
- HTML 구조를 건드리지 않고 브라우저에서 바로 실행 가능

- Search within conversations (filter by questions or answers)  
- Edit or delete individual message blocks  
- Clean and readable layout  
- Works directly in the browser without modifying the HTML structure

### 🛠️ 사용 방법 | How to Use

1. ChatGPT에서 대화를 HTML로 내보냅니다.  
   _Export your ChatGPT conversation as an HTML file._

2. 브라우저에서 해당 HTML을 열고, F12 또는 Ctrl+Shift+I로 개발자 도구를 엽니다.  
   _Open the HTML file in Chrome, press F12 (or Ctrl+Shift+I) to open DevTools._

3. Console 탭에 `conversation_manager.js`의 내용을 붙여넣고 Enter 키를 누릅니다.  
   _Paste the contents of `conversation_manager.js` into the Console tab and press Enter._

대화 페이지가 정돈된 인터페이스로 변환됩니다.  
_The conversation will be enhanced with an improved interface._

---

## 🧾 ChatGPT 질문추출도구.js (`question_extraction.js`) | ChatGPT Question Extractor

ChatGPT에서 내보낸 HTML 대화 파일에서 **사용자가 입력한 질문만 추출하여**  
별도 화면에 깔끔하게 출력하고, 자동으로 저장해주는 스니펫입니다.  
_A lightweight JavaScript snippet that extracts only the user's questions from a ChatGPT-exported HTML file and saves them cleanly._

### ✨ 주요 기능 | Features

- 사용자 질문만 자동 추출  
- 복습, 요약, 재사용 시 유용  
- 깔끔한 리스트 형태로 출력  
- 브라우저에서 실행, 원본 HTML은 수정되지 않음

- Automatically extracts only user-input questions  
- Useful for reviewing, summarizing, or reusing prompts  
- Displays results in a clean, minimal layout  
- Runs in the browser without altering the original HTML

### 🛠️ 사용 방법 | How to Use

1. ChatGPT에서 대화를 HTML로 내보냅니다.  
   _Export your conversation as an HTML file._

2. Chrome에서 HTML을 열고, F12 또는 Ctrl+Shift+I로 **개발자 도구(DevTools)**를 엽니다.  
   _Open the file in Chrome, press F12 (or Ctrl+Shift+I) to launch DevTools._

3. Console 탭에 이 스크립트를 붙여넣고 Enter 키를 누릅니다.  
   _Paste the script into the Console tab and hit Enter._

4. 스니펫을 사용하면 질문만 추출된 HTML 파일이 자동 저장됩니다.  
   _If used as a Snippet, a new HTML file containing only your questions will be downloaded automatically._

---

## 📄 라이선스 | License

**MIT License**  
자유롭게 사용, 수정, 배포할 수 있으며, 제작자 표기와 라이선스 고지를 유지해 주세요.  
_Free to use, modify, and distribute — just keep the creator credit and license notice._

---

## 👤 제작자 | Author

**Vincent**  
🔗 [https://mikkorimimi.blogspot.com/](https://mikkorimimi.blogspot.com/)


