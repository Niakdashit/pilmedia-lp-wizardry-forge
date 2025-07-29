interface WheelBorderDrawerProps {
  ctx: CanvasRenderingContext2D;
  center: number;
  radius: number;
  borderColor: string;
  borderOutlineColor: string;
}

export const drawWheelBorders = ({
  ctx,
  center,
  radius,
  borderColor,
  borderOutlineColor
}: WheelBorderDrawerProps) => {
  // Outer outline (épaisse, couleur accent)
  ctx.beginPath();
  ctx.arc(center, center, radius + 25, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.lineWidth = 16;
  ctx.strokeStyle = borderOutlineColor;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Inner border (finesse, couleur principale)
  ctx.beginPath();
  ctx.arc(center, center, radius + 12, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.lineWidth = 6;
  ctx.strokeStyle = borderColor;
  ctx.stroke();
};
