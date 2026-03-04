export async function parseImportFile(file: File): Promise<unknown[]> {
  if (!file.name.toLowerCase().endsWith(".json")) {
    throw new Error("仅支持 JSON 文件");
  }

  let text = "";
  if (typeof file.text === "function") {
    text = await file.text();
  } else if (typeof (file as Blob).arrayBuffer === "function") {
    const buffer = await (file as Blob).arrayBuffer();
    text = new TextDecoder().decode(buffer);
  } else if (typeof FileReader !== "undefined") {
    text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("无法读取文件内容"));
      reader.readAsText(file);
    });
  } else {
    throw new Error("无法读取文件内容");
  }
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("JSON 解析失败");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("导入文件必须是题目数组");
  }

  return parsed;
}
