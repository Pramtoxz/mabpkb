export const Images = {
  lgHondaKecil: require('../assets/images/lg_honda_kecil.webp'),
  lgHonda: require('../assets/images/lg_honda.webp'),
  logoMD: require('../assets/images/logomd.webp'),
  maLogo: require('../assets/images/malogo.webp'),
  scannerMascot: require('../assets/images/3.webp'),
  mascotHome: require('../assets/images/3.webp'),
  mascot1: require('../assets/images/1.webp'),
  mascot2: require('../assets/images/2.webp'),
  appLauncher: require('../assets/images/aciax.webp'),
  scanner3DDevice: require('../assets/images/scanner.webp'),
  scannerOn: require('../assets/images/on.webp'),
  scannerOff: require('../assets/images/off.webp'),
  devDito: require('../assets/images/dev/dito.webp'),
  devRafi: require('../assets/images/dev/rafi.webp'),
  devRezi: require('../assets/images/dev/rezi.webp'),
  devSurya: require('../assets/images/dev/surya.webp'),
} as const;

export const Animations = {
  bluetooth: require('../assets/lottie/bluetooth.json'),
  success: require('../assets/lottie/success.json'),
  rocket: require('../assets/lottie/rocket.json'),
  frame: require('../assets/lottie/frame.json'),
  business: require('../assets/lottie/business.json'),
} as const;

export function getRandomOtherMascot() {
  return Math.random() < 0.5 ? Images.mascot1 : Images.mascot2;
}
