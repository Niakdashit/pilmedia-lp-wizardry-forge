
export const getThemeColors = (theme: string): string[] => {
  switch (theme) {
    case 'promo':
      return ['#FFD700', '#E0004D', '#FF6F61'];
    case 'food':
      return ['#f4d35e', '#ee964b', '#e63946'];
    case 'casino':
      return ['#000000', '#FFD700', '#FF0000'];
    case 'child':
      return ['#fcd5ce', '#cdb4db', '#b5ead7'];
    case 'gaming':
      return ['#1f1f2e', '#841bff', '#13aae2'];
    case 'luxury':
      return ['#0d0d0d', '#d4af37', '#ffffff'];
    case 'halloween':
      return ['#ff7518', '#1b1b1b', '#fffacd'];
    case 'noel':
      return ['#e74c3c', '#27ae60', '#fff'];
    default:
      return ['#f9e5e5', '#dbeaff', '#e8f9e6', '#fff1e6', '#e6ffe6'];
  }
};
