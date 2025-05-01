// src/components/PreviewPane.tsx
import { PreviewPaneProps } from "../types";

export default function PreviewPane({ htmlContent, theme }: PreviewPaneProps) {
  return (
    <div className={`w-full h-96 border rounded-lg overflow-auto ${
      theme === "dark" ? "bg-gray-800 text-white" : "bg-white"
    }`}>
      {htmlContent ? (
        <iframe
          title="Website Preview"
          srcDoc={htmlContent}
          className="w-full h-full"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          Preview will appear here
        </div>
      )}
    </div>
  );
}