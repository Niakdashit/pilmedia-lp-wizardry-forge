import React from "react";
import type { DeviceType } from "../QualifioEditorLayout";
import { DEVICE_CONSTRAINTS } from "../../QuickCampaign/Preview/utils/previewConstraints";
interface DeviceFrameProps {
  device: DeviceType;
  children: React.ReactNode;
}
const DeviceFrame: React.FC<DeviceFrameProps> = ({ device, children }) => {
  const { maxWidth, maxHeight } = DEVICE_CONSTRAINTS[device];

  const getFrameBorders = () => {
    switch (device) {
      case "mobile":
        return { border: "8px solid #333", borderRadius: "25px" };
      case "tablet":
        return { border: "12px solid #333", borderRadius: "20px" };
      case "desktop":
      default:
        return { border: "2px solid #ddd", borderRadius: "8px" };
    }
  };

  const frameStyles: React.CSSProperties = {
    width: Math.min(maxWidth, window.innerWidth),
    height: Math.min(maxHeight, window.innerHeight),
    ...getFrameBorders(),
    overflow: "hidden",
  };

  const innerStyles: React.CSSProperties = {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    position: "relative",
  };

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      <div style={frameStyles}>
        <div style={innerStyles}>{children}</div>
      </div>
    </div>
  );
};
export default DeviceFrame;
