function ellipsize(text: string, lengthLimit: number): string {
  const limitedText = text.substring(0, lengthLimit);
  return `${limitedText}${limitedText.length < text.length ? "..." : ""}`;
}

export default ellipsize;
