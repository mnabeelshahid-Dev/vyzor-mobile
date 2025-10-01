import { getScreenInfo } from "./screenInfo";

export function responsiveScale(size: number) {
  const { diagonalInches } = getScreenInfo();

  if (diagonalInches < 4.7) {
    // Small phones
    return size * 0.85;
  } else if (diagonalInches >= 4.7 && diagonalInches <= 6.5) {
    // Normal smartphones
    return size;
  } else {
    // Tablets or large devices
    return size * 1.2;
  }
}
