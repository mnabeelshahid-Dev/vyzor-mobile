import { Dimensions, PixelRatio } from 'react-native';

export function getScreenInfo() {
  const { width, height } = Dimensions.get('window');
  const pixelDensity = PixelRatio.get();
  
  // DPI (dots per inch) = pixels per inch
  const dpi = pixelDensity * 160;

  // Convert pixels to inches
  const widthInches = width / dpi;
  const heightInches = height / dpi;

  // Diagonal size (Pythagoras)
  const diagonalInches = Math.sqrt(widthInches ** 2 + heightInches ** 2);

  return {
    width,
    height,
    pixelDensity,
    dpi,
    widthInches,
    heightInches,
    diagonalInches,
  };
}
