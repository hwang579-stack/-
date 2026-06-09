(function () {
  "use strict";

  const languageLabels = {
    "kor+eng": "한국어 + 영어",
    kor: "한국어",
    eng: "영어"
  };

  async function recognizeImage(file, language, onProgress) {
    if (!window.Tesseract) {
      throw new Error("OCR 라이브러리를 불러오지 못했습니다. 인터넷 연결 또는 CDN 차단 여부를 확인해 주세요.");
    }

    const worker = await window.Tesseract.createWorker(language, 1, {
      logger(message) {
        if (typeof onProgress === "function") {
          onProgress({
            status: message.status || "processing",
            progress: typeof message.progress === "number" ? message.progress : 0
          });
        }
      }
    });

    try {
      const result = await worker.recognize(file);
      return result.data.text.trim();
    } finally {
      await worker.terminate();
    }
  }

  window.SpaceOcr = {
    recognizeImage,
    languageLabels
  };
})();
