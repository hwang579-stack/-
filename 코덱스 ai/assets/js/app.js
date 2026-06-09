(function () {
  "use strict";

  const state = {
    file: null,
    previewUrl: null,
    isWorking: false
  };

  const elements = {
    dropZone: document.getElementById("dropZone"),
    imageInput: document.getElementById("imageInput"),
    previewFrame: document.getElementById("previewFrame"),
    previewImage: document.getElementById("previewImage"),
    fileName: document.getElementById("fileName"),
    resultText: document.getElementById("resultText"),
    extractButton: document.getElementById("extractButton"),
    copyButton: document.getElementById("copyButton"),
    clearButton: document.getElementById("clearButton"),
    languageSelect: document.getElementById("languageSelect"),
    progressText: document.getElementById("progressText"),
    progressPercent: document.getElementById("progressPercent"),
    progressBar: document.getElementById("progressBar"),
    statusPill: document.getElementById("statusPill")
  };

  function setProgress(progress, label) {
    const percent = Math.max(0, Math.min(100, Math.round(progress * 100)));
    elements.progressText.textContent = label;
    elements.progressPercent.textContent = `${percent}%`;
    elements.progressBar.style.width = `${percent}%`;
  }

  function setStatus(label, mode) {
    elements.statusPill.textContent = label;
    elements.statusPill.dataset.mode = mode || "idle";
  }

  function setWorking(isWorking) {
    state.isWorking = isWorking;
    elements.extractButton.disabled = isWorking || !state.file;
    elements.imageInput.disabled = isWorking;
    elements.languageSelect.disabled = isWorking;
  }

  function selectFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      setStatus("이미지 필요", "warning");
      setProgress(0, "이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    if (state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl);
    }

    state.file = file;
    state.previewUrl = URL.createObjectURL(file);
    elements.previewImage.src = state.previewUrl;
    elements.fileName.textContent = `${file.name} · ${Math.round(file.size / 1024).toLocaleString()}KB`;
    elements.previewFrame.hidden = false;
    setStatus("이미지 준비", "ready");
    setProgress(0, "추출 버튼을 누르면 OCR을 시작합니다.");
    setWorking(false);
  }

  async function extractText() {
    if (!state.file || state.isWorking) {
      return;
    }

    setWorking(true);
    setStatus("추출중", "working");
    elements.resultText.value = "";
    setProgress(0.02, "OCR 엔진을 준비하는 중입니다.");

    try {
      const language = elements.languageSelect.value;
      const text = await window.SpaceOcr.recognizeImage(state.file, language, (event) => {
        const readableStatus = event.status === "recognizing text"
          ? "이미지에서 텍스트를 인식하는 중입니다."
          : "OCR 데이터를 불러오는 중입니다.";
        setProgress(event.progress, readableStatus);
      });

      elements.resultText.value = text || "인식된 텍스트가 없습니다. 더 선명한 이미지를 사용하거나 언어 설정을 변경해 보세요.";
      setProgress(1, `${window.SpaceOcr.languageLabels[language]} 텍스트 추출이 완료되었습니다.`);
      setStatus("완료", "done");
    } catch (error) {
      elements.resultText.value = "";
      setStatus("오류", "error");
      setProgress(0, error.message || "텍스트 추출 중 문제가 발생했습니다.");
    } finally {
      setWorking(false);
    }
  }

  async function copyResult() {
    const text = elements.resultText.value.trim();
    if (!text) {
      setStatus("복사할 텍스트 없음", "warning");
      return;
    }

    await navigator.clipboard.writeText(text);
    setStatus("복사 완료", "done");
  }

  function clearAll() {
    if (state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl);
    }

    state.file = null;
    state.previewUrl = null;
    elements.imageInput.value = "";
    elements.previewImage.removeAttribute("src");
    elements.previewFrame.hidden = true;
    elements.resultText.value = "";
    setStatus("대기중", "idle");
    setProgress(0, "이미지를 기다리는 중입니다.");
    setWorking(false);
  }

  elements.imageInput.addEventListener("change", (event) => {
    selectFile(event.target.files[0]);
  });

  elements.dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    elements.dropZone.classList.add("is-dragging");
  });

  elements.dropZone.addEventListener("dragleave", () => {
    elements.dropZone.classList.remove("is-dragging");
  });

  elements.dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    elements.dropZone.classList.remove("is-dragging");
    selectFile(event.dataTransfer.files[0]);
  });

  elements.extractButton.addEventListener("click", extractText);
  elements.copyButton.addEventListener("click", copyResult);
  elements.clearButton.addEventListener("click", clearAll);

  setWorking(false);
})();
