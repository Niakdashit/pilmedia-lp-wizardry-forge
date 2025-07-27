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
  ctx.arc(center, center, radius + 15, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.lineWidth = 8;
  ctx.strokeStyle = borderOutlineColor;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Inner border (finesse, couleur principale)
  ctx.beginPath();
  ctx.arc(center, center, radius + 8, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = borderColor;
  ctx.stroke();
};
