interface WheelBorderDrawerProps {
  ctx: CanvasRenderingContext2D;
  center: number;
  radius: number;
  borderColor: string;
  borderOutlineColor: string;
  fullBorder?: boolean;
}

export const drawWheelBorders = ({
  ctx,
  center,
  radius,
  borderColor,
  borderOutlineColor,
  fullBorder = false
}: WheelBorderDrawerProps) => {
  if (fullBorder) {
    // Bordure pleine : une seule couleur sur toute l'épaisseur
    ctx.beginPath();
    ctx.arc(center, center, radius + 15, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.lineWidth = 16; // Épaisseur totale (8 + 8)
    ctx.strokeStyle = borderColor;
    ctx.lineJoin = 'round';
    ctx.stroke();
  } else {
    // Bordure mixte : blanc + couleur (comportement original)
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
  }
};
