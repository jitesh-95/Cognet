export const getTimestamp = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}_${hh}${min}${ss}`;
};

export const getFileName = (prefix, extension) => {
  return `${prefix}_${getTimestamp()}.${extension}`;
};

export function getDynamicNodeHeight(content, ctx = null, {
  baseNodeHeight = 70,
  nodeWidth = 250,
  contentFontSize = 12,
  lineHeight = 18,
} = {}) {
  if (!ctx) {
    const measureCanvas = document.createElement("canvas");
    ctx = measureCanvas.getContext("2d");
  }
  if (!content) return baseNodeHeight;

  ctx.font = `${contentFontSize}px Arial`;

  const words = content.split(" ");
  let lineCount = 1, testLine = "";

  words.forEach(w => {
    const tmp = testLine + w + " ";
    if (ctx.measureText(tmp).width > nodeWidth - 20) {
      lineCount++;
      testLine = w + " ";
    } else {
      testLine = tmp;
    }
  });

  return baseNodeHeight + (lineCount - 1) * lineHeight + 20; // add padding
}
