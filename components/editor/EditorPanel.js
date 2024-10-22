// app/components/EditorPanel.js
import React from "react";

const EditorPanel = ({ subtitleSettings, onSettingsChange }) => {
  const handleChange = (setting, value) => {
    onSettingsChange({ ...subtitleSettings, [setting]: value });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Subtitle Editor</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Font Family
          </label>
          <select
            value={subtitleSettings.fontFamily}
            onChange={(e) => handleChange("fontFamily", e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="The Bold Font">The Bold Font</option>
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Font Size
          </label>
          <input
            type="range"
            min="12"
            max="48"
            value={subtitleSettings.fontSize}
            onChange={(e) => handleChange("fontSize", e.target.value)}
            className="w-full"
          />
          <span>{subtitleSettings.fontSize}px</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Font Weight
          </label>
          <select
            value={subtitleSettings.fontWeight}
            onChange={(e) => handleChange("fontWeight", e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Color
          </label>
          <input
            type="color"
            value={subtitleSettings.color}
            onChange={(e) => handleChange("color", e.target.value)}
            className="mt-1 block w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Position
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={subtitleSettings.position}
            onChange={(e) => handleChange("position", e.target.value)}
            className="w-full"
          />
          <span>{subtitleSettings.position}%</span>
        </div>
      </div>
    </div>
  );
};

export default EditorPanel;
