(function(){
  "use strict";

  // ============================================
  // 0. 유틸리티 및 전역 상태 객체 (App)
  // ============================================
  const App = {
    undoStack: [],
    allHighlightedTexts: [],
    highlightGroups: [],
    currentGroupIndex: 0,
    searchCounts: new Map(),
    originalOrder: [], // { index, container } 객체 배열
  };

  function pushUndo(action) { App.undoStack.push(action); }
  function popUndo() { return App.undoStack.pop(); }

  // ============================================
  // 1. #root 요소 보장 (없으면 생성)
  // ============================================
  let root = document.getElementById("root");
  if (!root) {
    root = document.createElement("div");
    root.id = "root";
    document.body.appendChild(root);
    console.info("#root 요소가 없어 새로 생성했습니다.");
  }

  // ============================================
  // 2. 동적 CSS 삽입 (중복 방지)
  // ============================================
  if (!document.getElementById("dynamic-css")) {
    const style = document.createElement("style");
    style.id = "dynamic-css";
    style.textContent = `
      body {
        margin: 0;
        padding-top: 160px; 
        font-family: sans-serif;
        background-color: #ffffff;
        color: #000000;
        transition: background-color 0.3s, color 0.3s;
      }
      body.dark-mode {
        background-color: #444;
        color: #eeeeee;
      }
      .toggle-controls {
        position: fixed; 
        top: 0; left: 0;
        width: 100%;
        z-index: 9999;
        background: rgba(240,240,240,0.8);
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        display: flex; 
        flex-wrap: wrap; 
        align-items: center;
        gap: 8px; 
        padding: 10px; 
        font-size: 14px;
        transition: background-color 0.3s, color 0.3s;
      }
      body.dark-mode .toggle-controls {
        background: rgba(60,60,60,0.8);
        color: #fff;
      }
      .toggle-controls button {
        cursor: pointer;
        background: #eee;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 5px 8px;
        transition: background-color 0.3s, color 0.3s, border 0.3s;
      }
      body.dark-mode .toggle-controls button {
        background: #666;
        color: #ddd;
        border: 1px solid #777;
      }
      .search-box {
        width: 150px;
        padding: 4px;
        transition: background-color 0.3s, color 0.3s, border 0.3s;
      }
      body.dark-mode .search-box {
        background: #555; 
        color: #eee; 
        border: 1px solid #777;
      }
      .content-box {
        display: none;
        padding: 12px;
        border-radius: 8px;
        border: 1px solid #ddd;
        max-height: 500px;
        overflow-y: auto;
        transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
        opacity: 0;
        background-color: #f9f9f9;
        color: #000;
        position: relative;
      }
      .content-box.open {
        display: block;
        max-height: 500px;
        opacity: 1;
      }
      .title-box {
        display: flex; 
        align-items: center; 
        justify-content: center;
        background: linear-gradient(to right, #6a82fb, #fc5c7d);
        padding: 10px; 
        border-radius: 8px; 
        font-size: 16px;
        color: white; 
        text-align: center; 
        box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
        margin-bottom: 5px; 
        position: relative;
      }
      .delete-conversation-btn {
        position: absolute; 
        right: 10px; 
        top: 10px;
        background: rgba(255,255,255,0.3); 
        color: #fff;
        border: 1px solid #ccc; 
        border-radius: 4px;
        padding: 3px 6px; 
        cursor: pointer; 
        font-size: 12px;
      }
      .highlight {
        font-weight: bold; 
        padding: 2px;
        background-color: #ffeb99; 
        border-radius: 3px;
      }
      .search-highlight {
        background-color: yellow;
      }
      .search-result-count {
        text-align: center; 
        font-size: 14px; 
        margin: 0 8px;
        transition: color 0.3s; 
        color: #333;
      }
      body.dark-mode .search-result-count {
        color: #ccc;
      }
      .conversation-checkbox {
        margin-right: 8px; 
        transform: scale(1.2);
      }
      body.dark-mode .conversation-checkbox {
        accent-color: #bbb;
      }
      .message {
        position: relative;
        margin-bottom: 4px;
        padding-right: 100px;
        border-bottom: 1px solid #ccc;
        white-space: pre-line;
      }
      body.dark-mode .message {
        border-bottom: 1px solid #777;
      }
      .message-text {
        display: inline-block;
        vertical-align: top;
        max-width: calc(100% - 120px);
        overflow-wrap: break-word;
      }
      .edit-btn, .delete-btn {
        position: absolute; 
        top: 50%; 
        transform: translateY(-50%);
        background: #ddd; 
        border: 1px solid #999; 
        border-radius: 4px;
        cursor: pointer; 
        font-size: 12px; 
        padding: 2px 4px;
      }
      .delete-btn { 
        right: 50px; 
      }
      .edit-btn { 
        right: 10px; 
      }
      body.dark-mode .edit-btn, 
      body.dark-mode .delete-btn {
        background: #555; 
        color: #eee; 
        border: 1px solid #999;
      }
      .modal-overlay {
        position: fixed; 
        z-index: 99999; 
        top: 0; 
        left: 0;
        width: 100%; 
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: none;
        align-items: center;
        justify-content: center;
      }
      .modal-overlay.active {
        display: flex;
      }
      .modal-box {
        background: #fff; 
        border-radius: 8px; 
        padding: 16px;
        width: 400px; 
        max-width: 80%;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        display: flex; 
        flex-direction: column; 
        gap: 8px;
      }
      body.dark-mode .modal-box {
        background: #333; 
        color: #fff;
      }
      .modal-box textarea {
        width: 100%; 
        height: 150px; 
        resize: vertical; 
        padding: 8px;
      }
      .modal-buttons {
        display: flex; 
        justify-content: flex-end; 
        gap: 8px;
      }
      .modal-buttons button {
        min-width: 60px; 
        padding: 6px 12px;
      }
      .mini-result-panel {
        position: fixed; 
        min-width: 200px; 
        min-height: 120px;
        overflow: hidden; 
        background: #f0f0f0;
        box-shadow: -2px 0 5px rgba(0,0,0,0.2);
        transition: background-color 0.3s, color 0.3s;
        top: 160px; 
        left: calc(100% - 320px);
        cursor: move; 
        user-select: none;
      }
      body.dark-mode .mini-result-panel {
        background: #666; 
        color: #eee;
      }
      .mini-panel-header {
        background: rgba(0,0,0,0.1); 
        padding: 4px;
        text-align: center; 
        font-size: 14px;
      }
      body.dark-mode .mini-panel-header {
        background: rgba(255,255,255,0.2);
      }
      .mini-panel-body {
        width: 100%; 
        height: calc(100% - 20px);
        overflow-y: auto; 
        padding: 8px; 
        box-sizing: border-box;
        cursor: default; 
        user-select: text;
      }
      .mini-result {
        padding: 4px 0; 
        border-bottom: 1px solid #ccc;
        font-size: 13px; 
        cursor: pointer;
      }
      body.dark-mode .mini-result {
        border-bottom: 1px solid #999;
      }
      .mini-result:hover {
        background: rgba(0,0,0,0.05);
      }
      body.dark-mode .mini-result:hover {
        background: rgba(255,255,255,0.1);
      }
      .mini-resizer {
        position: absolute; 
        bottom: 0; 
        right: 0;
        width: 16px; 
        height: 16px;
        background: rgba(0,0,0,0.2);
        cursor: se-resize; 
        user-select: none;
      }
      body.dark-mode .mini-resizer {
        background: rgba(255,255,255,0.3);
      }
    `;
    document.head.appendChild(style);
  }

  // ============================================
  // 3. 상단 컨트롤 박스 및 수정 모달 생성
  // ============================================
  if (!document.querySelector(".toggle-controls")) {
    const controls = document.createElement("div");
    controls.classList.add("toggle-controls");

    // 검색 입력창
    const searchBox = document.createElement("input");
    searchBox.type = "text";
    searchBox.id = "searchInput";
    searchBox.placeholder = "키워드(,로 구분)";
    searchBox.classList.add("search-box");

    // AND/OR 라디오 버튼
    const radioAnd = document.createElement("input");
    radioAnd.type = "radio";
    radioAnd.name = "searchLogic";
    radioAnd.id = "searchLogicAnd";
    radioAnd.value = "AND";
    const labelAnd = document.createElement("label");
    labelAnd.textContent = "AND";
    labelAnd.setAttribute("for", "searchLogicAnd");

    const radioOr = document.createElement("input");
    radioOr.type = "radio";
    radioOr.name = "searchLogic";
    radioOr.id = "searchLogicOr";
    radioOr.value = "OR";
    radioOr.checked = true;
    const labelOr = document.createElement("label");
    labelOr.textContent = "OR";
    labelOr.setAttribute("for", "searchLogicOr");

    // 대소문자, 정규식 체크박스
    const caseCheck = document.createElement("input");
    caseCheck.type = "checkbox";
    caseCheck.id = "caseSensitiveCheck";
    const labelCase = document.createElement("label");
    labelCase.textContent = "CaseSensitive";
    labelCase.setAttribute("for", "caseSensitiveCheck");

    const regexCheck = document.createElement("input");
    regexCheck.type = "checkbox";
    regexCheck.id = "regexCheck";
    const labelRegex = document.createElement("label");
    labelRegex.textContent = "Regex";
    labelRegex.setAttribute("for", "regexCheck");

    // 다크 모드 토글
    const darkModeCheck = document.createElement("input");
    darkModeCheck.type = "checkbox";
    darkModeCheck.id = "darkModeCheck";
    const labelDark = document.createElement("label");
    labelDark.textContent = "DarkMode";
    labelDark.setAttribute("for", "darkModeCheck");

    // 버튼들
    const expandAllBtn = document.createElement("button");
    expandAllBtn.id = "expandAllBtn";
    expandAllBtn.textContent = "전체 펼치기";

    const collapseAllBtn = document.createElement("button");
    collapseAllBtn.id = "collapseAllBtn";
    collapseAllBtn.textContent = "전체 접기";

    const sortByCountBtn = document.createElement("button");
    sortByCountBtn.id = "sortByCountBtn";
    sortByCountBtn.textContent = "검색 개수 순 정렬";

    const resetOrderBtn = document.createElement("button");
    resetOrderBtn.id = "resetOrderBtn";
    resetOrderBtn.textContent = "원래 순서 복원";

    // 검색 초기화 버튼 – 검색 하이라이트만 제거 (원래 순서 복원 호출 X)
    const clearSearchBtn = document.createElement("button");
    clearSearchBtn.id = "clearSearchBtn";
    clearSearchBtn.textContent = "검색 초기화";

    const highlightPrevBtn = document.createElement("button");
    highlightPrevBtn.id = "highlightPrevBtn";
    highlightPrevBtn.textContent = "이전 결과";

    const highlightNextBtn = document.createElement("button");
    highlightNextBtn.id = "highlightNextBtn";
    highlightNextBtn.textContent = "다음 결과";

    const undoBtn = document.createElement("button");
    undoBtn.id = "undoBtn";
    undoBtn.textContent = "Undo";

    // 내보내기 옵션
    const exportRangeSelect = document.createElement("select");
    exportRangeSelect.id = "exportRangeSelect";
    ["All","Matched","Open","Selected"].forEach(opt => {
      const option = document.createElement("option");
      option.value = opt;
      option.text = opt;
      exportRangeSelect.appendChild(option);
    });

    const exportTypeSelect = document.createElement("select");
    exportTypeSelect.id = "exportTypeSelect";
    ["TEXT","JSON","CSV","Markdown","HTML"].forEach(opt => {
      const option = document.createElement("option");
      option.value = opt;
      option.text = opt;
      exportTypeSelect.appendChild(option);
    });

    const exportBtn = document.createElement("button");
    exportBtn.id = "exportBtn";
    exportBtn.textContent = "내보내기";

    // 배경색 선택 (추가: 아주 옅은 회색, 파스텔톤 회색 추가)
    const bgColorSelect = document.createElement("select");
    bgColorSelect.id = "bgColorSelect";
    [
      { value: "white", label: "White" },
      { value: "#fff0f5", label: "LavenderBlush" },
      { value: "#f0fff0", label: "Honeydew" },
      { value: "#f5fffa", label: "MintCream" },
      { value: "#f0f8ff", label: "AliceBlue" },
      { value: "#fafad2", label: "LightGoldenrodYellow" },
      { value: "#ffe4e1", label: "MistyRose" },
      { value: "#ffffe0", label: "LightYellow2" },
      { value: "#fffdd0", label: "Cream (#fffdd0)" },
      { value: "#fffde7", label: "ExtraLightYellow (#fffde7)" },
      { value: "#fdfd96", label: "Pastel Yellow (#fdfd96)" },
      { value: "#e6e6fa", label: "Lavender (#e6e6fa)" },
      { value: "#ffe5b4", label: "Pastel Peach (#ffe5b4)" },
      { value: "#e0ffff", label: "LightCyan (#e0ffff)" },
      { value: "#d3d3d3", label: "LightGray (#d3d3d3)" },
      { value: "#a9a9a9", label: "DarkGray (#a9a9a9)" },
      { value: "#f5f5f5", label: "Very Light Gray (#f5f5f5)" },
      { value: "#e0e0e0", label: "Pastel Gray (#e0e0e0)" },
    ].forEach(({ value, label }) => {
      const op = document.createElement("option");
      op.value = value;
      op.textContent = label;
      bgColorSelect.appendChild(op);
    });
    const bgColorLabel = document.createElement("label");
    bgColorLabel.textContent = "배경색:";
    bgColorLabel.setAttribute("for", "bgColorSelect");

    // 검색 결과 표시
    const resultCount = document.createElement("div");
    resultCount.classList.add("search-result-count");
    resultCount.id = "resultCount";
    resultCount.textContent = "검색 결과 없음";

    // 컨트롤 박스 구성
    controls.appendChild(searchBox);
    controls.appendChild(radioAnd);
    controls.appendChild(labelAnd);
    controls.appendChild(radioOr);
    controls.appendChild(labelOr);
    controls.appendChild(caseCheck);
    controls.appendChild(labelCase);
    controls.appendChild(regexCheck);
    controls.appendChild(labelRegex);
    controls.appendChild(darkModeCheck);
    controls.appendChild(labelDark);
    controls.appendChild(expandAllBtn);
    controls.appendChild(collapseAllBtn);
    controls.appendChild(sortByCountBtn);
    controls.appendChild(resetOrderBtn);
    controls.appendChild(clearSearchBtn);
    controls.appendChild(highlightPrevBtn);
    controls.appendChild(highlightNextBtn);
    controls.appendChild(undoBtn);
    controls.appendChild(bgColorLabel);
    controls.appendChild(bgColorSelect);
    controls.appendChild(exportRangeSelect);
    controls.appendChild(exportTypeSelect);
    controls.appendChild(exportBtn);
    controls.appendChild(resultCount);

    document.body.appendChild(controls);
  }

  // 수정 모달 생성 (중복 방지)
  if (!document.querySelector(".modal-overlay")) {
    const overlay = document.createElement("div");
    overlay.classList.add("modal-overlay");
    overlay.id = "editModalOverlay";

    const modal = document.createElement("div");
    modal.classList.add("modal-box");

    const textarea = document.createElement("textarea");
    textarea.id = "editModalTextarea";

    const buttonWrap = document.createElement("div");
    buttonWrap.classList.add("modal-buttons");
    const btnSave = document.createElement("button");
    btnSave.id = "editModalSave";
    btnSave.textContent = "저장";
    const btnCancel = document.createElement("button");
    btnCancel.id = "editModalCancel";
    btnCancel.textContent = "취소";
    buttonWrap.appendChild(btnSave);
    buttonWrap.appendChild(btnCancel);

    modal.appendChild(textarea);
    modal.appendChild(buttonWrap);
    overlay.appendChild(modal);

    document.body.appendChild(overlay);
  }

  // ============================================
  // 4. 자주 사용하는 DOM 요소 캐싱
  // ============================================
  const searchBox = document.getElementById("searchInput");
  const radioAnd = document.getElementById("searchLogicAnd");
  const radioOr = document.getElementById("searchLogicOr");
  const caseCheck = document.getElementById("caseSensitiveCheck");
  const regexCheck = document.getElementById("regexCheck");
  const darkModeCheck = document.getElementById("darkModeCheck");
  const expandAllBtn = document.getElementById("expandAllBtn");
  const collapseAllBtn = document.getElementById("collapseAllBtn");
  const sortByCountBtn = document.getElementById("sortByCountBtn");
  const resetOrderBtn = document.getElementById("resetOrderBtn");
  const clearSearchBtn = document.getElementById("clearSearchBtn");
  const highlightPrevBtn = document.getElementById("highlightPrevBtn");
  const highlightNextBtn = document.getElementById("highlightNextBtn");
  const undoBtn = document.getElementById("undoBtn");
  const bgColorSelect = document.getElementById("bgColorSelect");
  const exportRangeSelect = document.getElementById("exportRangeSelect");
  const exportTypeSelect = document.getElementById("exportTypeSelect");
  const exportBtn = document.getElementById("exportBtn");
  const resultCount = document.getElementById("resultCount");
  const modalOverlay = document.getElementById("editModalOverlay");
  const modalTextarea = document.getElementById("editModalTextarea");
  const modalSaveBtn = document.getElementById("editModalSave");
  const modalCancelBtn = document.getElementById("editModalCancel");

  // ============================================
  // 5. 다크 모드 토글
  // ============================================
  darkModeCheck.addEventListener("change", () => {
    if (darkModeCheck.checked)
      document.body.classList.add("dark-mode");
    else
      document.body.classList.remove("dark-mode");
  });

  // ============================================
  // 6. 수정 모달 관련 기능 및 이벤트 핸들러
  // ============================================
  let currentEditSpan = null;
  function openEditModal(oldText) {
    modalOverlay.classList.add("active");
    modalTextarea.value = oldText;
    modalTextarea.focus();
  }
  function closeEditModal() {
    modalOverlay.classList.remove("active");
    currentEditSpan = null;
  }
  modalSaveBtn.addEventListener("click", () => {
    if (!currentEditSpan) {
      closeEditModal();
      return;
    }
    const oldText = currentEditSpan.innerText;
    const newText = modalTextarea.value;
    const trimmed = newText.trim().replace(/[:?!]*$/, "");
    pushUndo({ action: "edit", target: currentEditSpan, oldText, newText });
    if (trimmed === "User" || trimmed === "ChatGPT") {
      currentEditSpan.innerHTML = "<b>" + newText + "</b>";
    } else {
      currentEditSpan.innerText = newText;
    }
    closeEditModal();
  });
  modalCancelBtn.addEventListener("click", closeEditModal);

  function handleEditClick(e) {
    const messageElem = e.target.closest(".message");
    if (!messageElem) return;
    const textSpan = messageElem.querySelector(".message-text");
    if (!textSpan) return;
    currentEditSpan = textSpan;
    openEditModal(textSpan.innerText);
  }

  function handleDeleteClick(e) {
    const msg = e.target.closest(".message");
    if (!msg) return;
    if (!confirm("정말 이 메시지를 삭제하시겠습니까?")) return;
    pushUndo({ action: "delete", target: msg, oldParent: msg.parentNode, oldNextSibling: msg.nextSibling });
    msg.remove();
  }

  undoBtn.addEventListener("click", () => {
    if (App.undoStack.length === 0) {
      alert("더 이상 되돌릴 작업이 없습니다.");
      return;
    }
    const last = popUndo();
    switch (last.action) {
      case "edit":
        last.target.innerText = last.oldText;
        break;
      case "delete":
        if (last.oldParent) {
          if (last.oldNextSibling) {
            last.oldParent.insertBefore(last.target, last.oldNextSibling);
          } else {
            last.oldParent.appendChild(last.target);
          }
        }
        break;
      case "deleteConversation":
        if (last.oldParent) {
          if (last.oldNextSibling) {
            last.oldParent.insertBefore(last.target, last.oldNextSibling);
          } else {
            last.oldParent.appendChild(last.target);
          }
        }
        if (last.originalObj) {
          App.originalOrder.push(last.originalObj);
        }
        break;
      default:
        console.warn("알 수 없는 Undo 액션:", last.action);
    }
  });

  // ============================================
  // 7. 대화 박스 초기화 및 처리 (#root 내 conversation 처리)
  // ============================================
  const conversationNodes = document.querySelectorAll("#root > .conversation");
  conversationNodes.forEach((container, index) => {
    const titleElement = container.querySelector("h4");
    if (!titleElement) return;
    titleElement.classList.add("title-box");

    const delConvBtn = document.createElement("button");
    delConvBtn.classList.add("delete-conversation-btn");
    delConvBtn.textContent = "이 박스 삭제";

    const convCheck = document.createElement("input");
    convCheck.type = "checkbox";
    convCheck.classList.add("conversation-checkbox");
    convCheck.dataset.index = index;

    const oldTitle = titleElement.innerText.replace("이 박스 삭제", "").trim();
    titleElement.innerHTML = "";
    titleElement.appendChild(convCheck);

    const spanText = document.createElement("span");
    spanText.style.marginLeft = "8px";
    spanText.textContent = oldTitle;
    titleElement.appendChild(spanText);
    titleElement.appendChild(delConvBtn);

    const contentBox = document.createElement("div");
    contentBox.classList.add("content-box");

    container.querySelectorAll(".message").forEach(m => {
      let textSpan = m.querySelector(".message-text");
      if (!textSpan) {
        const rawTxt = m.innerText.replace(/수정\s*삭제\s*$/, "").trim();
        m.innerHTML = "";
        textSpan = document.createElement("span");
        textSpan.classList.add("message-text");
        textSpan.textContent = rawTxt;
        m.appendChild(textSpan);
      }
      let raw = textSpan.innerText.trim().replace(/[:?!]*$/, "");
      if (raw === "User" || raw === "ChatGPT") {
        textSpan.innerHTML = "<b>" + textSpan.innerText + "</b>";
      }
      if (!m.querySelector(".edit-btn")) {
        const eb = document.createElement("button");
        eb.classList.add("edit-btn");
        eb.textContent = "수정";
        eb.addEventListener("click", handleEditClick);
        m.appendChild(eb);
      }
      if (!m.querySelector(".delete-btn")) {
        const db = document.createElement("button");
        db.classList.add("delete-btn");
        db.textContent = "삭제";
        db.addEventListener("click", handleDeleteClick);
        m.appendChild(db);
      }
      contentBox.appendChild(m);
    });

    container.appendChild(contentBox);

    titleElement.addEventListener("click", (evt) => {
      if (evt.target === convCheck || evt.target === delConvBtn) {
        evt.stopPropagation();
        return;
      }
      contentBox.classList.toggle("open");
      if (contentBox.classList.contains("open")) {
        const chosenColor = bgColorSelect.value || "white";
        contentBox.style.backgroundColor = chosenColor;
        contentBox.scrollTop = 0;
      }
    });

    delConvBtn.addEventListener("click", () => {
      if (!confirm("정말 이 대화 박스를 삭제하시겠습니까?")) return;
      const originalObj = App.originalOrder.find(obj => obj.container === container);
      pushUndo({ action: "deleteConversation", target: container, oldParent: container.parentNode, oldNextSibling: container.nextSibling, originalObj });
      container.remove();
      App.originalOrder = App.originalOrder.filter(obj => obj.container !== container);
    });

    App.originalOrder.push({ index, container });
  });

  // ============================================
  // 8. 전체 펼치기/접기 및 정렬/순서 복원 기능
  // ============================================
  expandAllBtn.addEventListener("click", () => {
    document.querySelectorAll(".content-box").forEach(box => {
      box.classList.add("open");
      const chosenColor = bgColorSelect.value || "white";
      box.style.backgroundColor = chosenColor;
      box.scrollTop = 0;
    });
  });
  collapseAllBtn.addEventListener("click", () => {
    document.querySelectorAll(".content-box").forEach(box => {
      box.classList.remove("open");
    });
  });

  sortByCountBtn.addEventListener("click", () => {
    if (App.searchCounts.size === 0) {
      resultCount.textContent = "정렬할 검색 결과가 없습니다.";
      return;
    }
    applySearchSortingAndIntensity();
  });

  resetOrderBtn.addEventListener("click", () => {
    const remainingOrder = App.originalOrder.filter(obj => document.body.contains(obj.container));
    if (!remainingOrder.length) {
      resultCount.textContent = "대화 박스가 없습니다.";
      return;
    }
    remainingOrder.sort((a, b) => a.index - b.index).forEach(obj => root.appendChild(obj.container));
    resultCount.textContent = "원래 순서 복원 완료";
  });

  // ============================================
  // 9. 검색 및 하이라이트 관련 함수 (정규식 캐싱 및 그룹화 적용)
  // ============================================
  function clearAllHighlights() {
    document.querySelectorAll(".search-highlight").forEach(sh => {
      const parent = sh.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(sh.textContent), sh);
      }
    });
    document.querySelectorAll(".content-box").forEach(box => {
      box.style.backgroundColor = "";
    });
    App.allHighlightedTexts = [];
    App.highlightGroups = [];
    App.currentGroupIndex = 0;
    App.searchCounts.clear();
    resultCount.textContent = "검색 결과 없음";
    if (miniPanelBody) miniPanelBody.innerHTML = "<h4>결과 없음</h4>";
  }

  function highlightDomTree(element, regex) {
    if (!element || !element.childNodes) return;
    Array.from(element.childNodes).forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        highlightTextNode(node, regex);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        highlightDomTree(node, regex);
      }
    });
  }

  function highlightTextNode(textNode, regex) {
    const text = textNode.nodeValue;
    let match;
    let lastIndex = 0;
    const frag = document.createDocumentFragment();
    regex.lastIndex = 0;
    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const end = regex.lastIndex;
      if (start > lastIndex) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex, start)));
      }
      const highlighted = document.createElement("span");
      highlighted.classList.add("highlight", "search-highlight");
      highlighted.appendChild(document.createTextNode(text.slice(start, end)));
      frag.appendChild(highlighted);
      lastIndex = end;
    }
    if (lastIndex < text.length) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
    textNode.parentNode.replaceChild(frag, textNode);
  }

  // 주어진 검색어 목록에 대해 정규식 배열 생성
  function buildRegexArray(terms, caseSensitive, isRegex) {
    return terms.map(term => {
      if (!isRegex) {
        term = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }
      const flags = caseSensitive ? "g" : "gi";
      return new RegExp(term, flags);
    });
  }

  // === 그룹화 함수 ===
  function groupHighlights(highlights, threshold = 100) {
    const sorted = highlights.slice().sort((a, b) => {
      const boxA = a.closest('.content-box');
      const boxB = b.closest('.content-box');
      if (boxA !== boxB) {
        return boxA ? boxA.offsetTop - boxB.offsetTop : 0;
      }
      return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
    });
    const groups = [];
    let currentGroup = [];
    for (let i = 0; i < sorted.length; i++) {
      const elem = sorted[i];
      if (currentGroup.length === 0) {
        currentGroup.push(elem);
      } else {
        const lastElem = currentGroup[currentGroup.length - 1];
        const sameContainer = elem.closest('.content-box') === lastElem.closest('.content-box');
        const diff = Math.abs(elem.getBoundingClientRect().top - lastElem.getBoundingClientRect().top);
        if (sameContainer && diff <= threshold) {
          currentGroup.push(elem);
        } else {
          groups.push(currentGroup);
          currentGroup = [elem];
        }
      }
    }
    if (currentGroup.length > 0) groups.push(currentGroup);
    return groups;
  }

  // ★ 새롭게 추가: 검색 결과에 따른 정렬 및 배경색 강도 적용 함수 ★
function applySearchSortingAndIntensity() {
  if (App.searchCounts.size === 0) return;
  const counts = Array.from(App.searchCounts.values());
  const maxCount = Math.max(...counts);
  // 검색어 포함 대화 상자들을 검색 개수 내림차순 정렬
  const sortedMatched = Array.from(App.searchCounts.entries())
       .sort((a, b) => b[1] - a[1])
       .map(e => e[0]);
       
  sortedMatched.forEach((conv, index) => {
    const contentBox = conv.querySelector(".content-box");
    if (contentBox) {
      if (index === 0) {
        // 가장 상위 그룹은 고정으로 Cream 색상
        contentBox.style.backgroundColor = "#fffdd0";
      } else {
        const count = App.searchCounts.get(conv);
        const factor = count / maxCount; // 0 ~ 1 사이
        // 새로운 범위: 최고(가장 많은 매치)일 때 92.5%, 최저일 때 95% (첫 그룹인 Cream(#fffdd0, 약 91%)보다 옅음)
        const newLightness = 95 - factor * 2.5;
        contentBox.style.backgroundColor = `hsl(50, 70%, ${newLightness}%)`;
      }
    }
  });
  // 검색어가 포함되지 않은 대화 상자들은 원래 순서대로 재배치
  const unmatched = App.originalOrder.filter(obj => !App.searchCounts.has(obj.container))
                     .sort((a, b) => a.index - b.index)
                     .map(obj => obj.container);
  sortedMatched.forEach(conv => {
    root.appendChild(conv);
  });
  unmatched.forEach(conv => {
    root.appendChild(conv);
  });
}



  function performSearch() {
    clearAllHighlights();
    const val = searchBox.value.trim();
    if (!val) {
      resultCount.textContent = "검색어가 없습니다.";
      if (miniPanelBody) miniPanelBody.innerHTML = "<h4>결과 없음</h4>";
      return;
    }
    const terms = val.split(",").map(t => t.trim()).filter(t => t);
    if (!terms.length) {
      resultCount.textContent = "검색어가 없습니다.";
      if (miniPanelBody) miniPanelBody.innerHTML = "<h4>결과 없음</h4>";
      return;
    }
    const caseSensitive = caseCheck.checked;
    const isAnd = radioAnd.checked;
    const isRegex = regexCheck.checked;
    const regexArray = buildRegexArray(terms, caseSensitive, isRegex);
    let totalMatches = 0;
    document.querySelectorAll("#root > .conversation").forEach(conv => {
      const contentBox = conv.querySelector(".content-box");
      if (!contentBox) return;
      const textSpans = contentBox.querySelectorAll(".message-text");
      textSpans.forEach(span => {
        let matchedAll = true;
        let matchedAny = false;
        regexArray.forEach(regex => {
          regex.lastIndex = 0;
          if (regex.test(span.textContent)) {
            matchedAny = true;
          } else {
            matchedAll = false;
          }
        });
        const finalMatch = isAnd ? matchedAll : matchedAny;
        if (finalMatch) {
          regexArray.forEach(regex => highlightDomTree(span, regex));
        }
      });
      const matchedInBox = contentBox.querySelectorAll(".search-highlight").length;
      if (matchedInBox > 0) {
        totalMatches += matchedInBox;
        App.searchCounts.set(conv, matchedInBox);
        contentBox.classList.add("open");
      }
    });
    App.allHighlightedTexts = Array.from(document.querySelectorAll("#root .search-highlight"));
    App.highlightGroups = groupHighlights(App.allHighlightedTexts);
    App.currentGroupIndex = 0;
    if (totalMatches > 0) {
      // 검색 성공 시, 검색 결과 정렬 및 배경색(파스텔톤) 적용과 함께
      applySearchSortingAndIntensity();
      resultCount.textContent = `총 ${totalMatches}개.`;
      moveToGroupHighlight();
      buildMiniList();
    } else {
      resultCount.textContent = "검색 결과 없음";
      if (miniPanelBody) miniPanelBody.innerHTML = "<h4>결과 없음</h4>";
    }
  }

  // 그룹 단위로 하이라이트 이동 (한 그룹 내의 첫 번째 하이라이트로 이동)
  function moveToGroupHighlight() {
    if (!App.highlightGroups || App.highlightGroups.length === 0) return;
    const group = App.highlightGroups[App.currentGroupIndex];
    const target = group[0];
    if (!target) return;
    const cbox = target.closest(".content-box");
    if (cbox && !cbox.classList.contains("open")) {
      cbox.classList.add("open");
    }
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    let cumulative = 0;
    for (let i = 0; i <= App.currentGroupIndex; i++) {
      cumulative += App.highlightGroups[i].length;
    }
    const total = App.allHighlightedTexts.length;
    resultCount.textContent = `총 ${total}개. 현재 그룹 ${App.currentGroupIndex+1}/${App.highlightGroups.length} (누적: ${cumulative}/${total})`;
  }

  function gotoNextHighlight() {
    if (!App.highlightGroups || App.highlightGroups.length === 0) {
      resultCount.textContent = "검색된 하이라이트가 없습니다.";
      return;
    }
    if (App.currentGroupIndex < App.highlightGroups.length - 1) {
      App.currentGroupIndex++;
    } else {
      App.currentGroupIndex = 0;
    }
    moveToGroupHighlight();
  }

  function gotoPrevHighlight() {
    if (!App.highlightGroups || App.highlightGroups.length === 0) {
      resultCount.textContent = "검색된 하이라이트가 없습니다.";
      return;
    }
    if (App.currentGroupIndex > 0) {
      App.currentGroupIndex--;
    } else {
      App.currentGroupIndex = App.highlightGroups.length - 1;
    }
    moveToGroupHighlight();
  }

  // ============================================
  // 10. 미니 결과 패널 (문맥 미리보기) 생성 및 기능
  // ============================================
  let miniPanel = document.querySelector(".mini-result-panel");
  let miniPanelBody;
  if (!miniPanel) {
    miniPanel = document.createElement("div");
    miniPanel.classList.add("mini-result-panel");
    miniPanel.style.width = "300px";
    miniPanel.style.height = "320px";
    miniPanel.style.top = "160px";
    miniPanel.style.left = "calc(100% - 320px)";
    const panelHeader = document.createElement("div");
    panelHeader.classList.add("mini-panel-header");
    panelHeader.textContent = "검색 결과";
    miniPanel.appendChild(panelHeader);
    miniPanelBody = document.createElement("div");
    miniPanelBody.classList.add("mini-panel-body");
    miniPanelBody.innerHTML = "<h4>결과 없음</h4>";
    miniPanel.appendChild(miniPanelBody);
    const resizer = document.createElement("div");
    resizer.classList.add("mini-resizer");
    miniPanel.appendChild(resizer);
    document.body.appendChild(miniPanel);

    let isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
    miniPanel.addEventListener("mousedown", (e) => {
      if (e.target === resizer) return;
      isDragging = true;
      dragOffsetX = e.clientX - miniPanel.offsetLeft;
      dragOffsetY = e.clientY - miniPanel.offsetTop;
    });
    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      let newLeft = e.clientX - dragOffsetX;
      let newTop = e.clientY - dragOffsetY;
      if (newLeft < 0) newLeft = 0;
      if (newTop < 0) newTop = 0;
      miniPanel.style.left = newLeft + "px";
      miniPanel.style.top = newTop + "px";
    });
    document.addEventListener("mouseup", () => { isDragging = false; });

    let isResizing = false, startW = 0, startH = 0, startX = 0, startY = 0;
    resizer.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startW = miniPanel.offsetWidth;
      startH = miniPanel.offsetHeight;
    });
    document.addEventListener("mousemove", (e) => {
      if (!isResizing) return;
      let dx = e.clientX - startX;
      let dy = e.clientY - startY;
      let newW = startW + dx;
      let newH = startH + dy;
      if (newW < 200) newW = 200;
      if (newH < 120) newH = 120;
      miniPanel.style.width = newW + "px";
      miniPanel.style.height = newH + "px";
    });
    document.addEventListener("mouseup", () => { isResizing = false; });
  } else {
    miniPanelBody = miniPanel.querySelector(".mini-panel-body");
  }

  function buildMiniList() {
    if (!miniPanelBody) return;
    if (!App.allHighlightedTexts.length) {
      miniPanelBody.innerHTML = "<h4>결과 없음</h4>";
      return;
    }
    let html = "";
    App.allHighlightedTexts.forEach((highlightElem, idx) => {
      const parentText = highlightElem.parentNode.textContent;
      const word = highlightElem.textContent;
      const pos = parentText.indexOf(word);
      let snippet = "";
      if (pos >= 0) {
        const start = Math.max(pos - 60, 0);
        const end = Math.min(pos + word.length + 60, parentText.length);
        snippet = parentText.slice(start, end);
        const reEscaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(reEscaped, "i");
        snippet = snippet.replace(re, `<b>$&</b>`);
      } else {
        snippet = parentText.substring(0, 50);
      }
      html += `<div class="mini-result" data-index="${idx}">[${idx+1}] ${snippet}</div>`;
    });
    miniPanelBody.innerHTML = html;
    miniPanelBody.querySelectorAll(".mini-result").forEach(item => {
      item.addEventListener("click", (e) => {
        const i = parseInt(e.currentTarget.getAttribute("data-index"));
        let count = 0, targetGroup = 0;
        for (let g = 0; g < App.highlightGroups.length; g++) {
          const group = App.highlightGroups[g];
          if (count + group.length > i) {
            targetGroup = g;
            break;
          }
          count += group.length;
        }
        App.currentGroupIndex = targetGroup;
        moveToGroupHighlight();
      });
    });
  }

  // ============================================
  // 11. 내보내기 기능
  // ============================================
  exportBtn.addEventListener("click", () => {
    const range = exportRangeSelect.value;
    const fmt = exportTypeSelect.value;
    if (!root) {
      alert("#root가 없어 내보낼 내용이 없습니다.");
      return;
    }
    const convList = document.querySelectorAll("#root > .conversation");
    const exportData = [];
    convList.forEach((container, idx) => {
      const titleEl = container.querySelector("h4");
      if (!titleEl) return;
      const title = titleEl.innerText.replace("이 박스 삭제", "").trim() || `대화${idx+1}`;
      const contentBox = container.querySelector(".content-box");
      if (range === "Open" && !contentBox.classList.contains("open")) return;
      if (range === "Selected") {
        const ck = titleEl.querySelector(".conversation-checkbox");
        if (ck && !ck.checked) return;
      }
      let msgs = Array.from(contentBox.querySelectorAll(".message"));
      if (range === "Matched") {
        msgs = msgs.filter(m => m.querySelector(".search-highlight"));
        if (!msgs.length) return;
      }
      if (!msgs.length) return;
      const messageTexts = msgs.map(m => {
        const textSpan = m.querySelector(".message-text");
        return textSpan ? textSpan.innerText : "";
      });
      exportData.push({ title, messages: messageTexts });
    });
    if (!exportData.length) {
      alert("내보낼 대화가 없습니다.");
      return;
    }
    let fileContent = "";
    let fileName = "대화로그_내보내기";
    if (fmt === "JSON") {
      fileContent = JSON.stringify(exportData, null, 2);
      fileName += ".json";
    } else if (fmt === "TEXT") {
      const arr = exportData.map(b => `[${b.title}]\n` + b.messages.join("\n"));
      const BOM = "\uFEFF";
      fileContent = BOM + arr.join("\n--------------------------------\n");
      fileName += ".txt";
    } else if (fmt === "CSV") {
      const lines = [`"title","message"`];
      exportData.forEach(d => {
        d.messages.forEach(msg => {
          const st = d.title.replace(/"/g, '""');
          const sm = msg.replace(/"/g, '""');
          lines.push(`"${st}","${sm}"`);
        });
      });
      const BOM = "\uFEFF";
      fileContent = BOM + lines.join("\n");
      fileName += ".csv";
    } else if (fmt === "Markdown") {
      const md = exportData.map(d => {
        const msgs = d.messages.map(m => `- ${m}`).join("\n");
        return `### ${d.title}\n\n${msgs}\n`;
      });
      fileContent = md.join("\n---\n");
      fileName += ".md";
    } else if (fmt === "HTML") {
      function escapeHTML(str) {
        return str.replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/"/g, "&quot;");
      }
      const htmlArray = exportData.map(block => {
        const msgsHtml = block.messages.map(m => `<div class="message">${escapeHTML(m)}</div>`).join("\n");
        return `<div class="conversation">
  <h4>${escapeHTML(block.title)}</h4>
  ${msgsHtml}
</div>`;
      });
      fileContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8"/>
  <title>내보낸 대화</title>
  <style>
    body { font-family: sans-serif; margin: 16px; }
    .conversation { margin-bottom: 24px; }
    .conversation h4 { background: #ccc; padding: 8px; }
    .message { padding: 4px 8px; border-bottom: 1px solid #aaa; white-space: pre-line; }
  </style>
</head>
<body>
<div id="root">
${htmlArray.join("\n")}
</div>
</body>
</html>`;
      fileName += ".html";
    }
    let contentType = "text/plain;charset=utf-8";
    if (fmt === "CSV") contentType = "text/csv;charset=utf-8";
    else if (fmt === "JSON") contentType = "application/json;charset=utf-8";
    else if (fmt === "HTML") contentType = "text/html;charset=utf-8";
    const blob = new Blob([fileContent], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 0);
  });

  // ============================================
  // 12. 검색 및 결과 이동, 방향키 이벤트 (중복 제거)
  // ============================================
  searchBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter") performSearch();
  });
  clearSearchBtn.addEventListener("click", () => {
    clearAllHighlights();
  });
  highlightPrevBtn.addEventListener("click", gotoPrevHighlight);
  highlightNextBtn.addEventListener("click", gotoNextHighlight);
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "ArrowDown") {
      ev.preventDefault();
      gotoNextHighlight();
    } else if (ev.key === "ArrowUp") {
      ev.preventDefault();
      gotoPrevHighlight();
    }
  });

})();
