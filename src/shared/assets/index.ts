import type { ImageSourcePropType } from 'react-native';

type AppImageKey =
  | 'courseInterfaceOne'
  | 'courseInterfaceThree'
  | 'courseInterfaceFour'
  | 'hotelOne'
  | 'hotelTwo'
  | 'hotelThree'
  | 'onboardingIntro'
  | 'onboardingRelax'
  | 'onboardingCare'
  | 'profile';

export const AppImages: Record<AppImageKey, ImageSourcePropType> = {
  courseInterfaceOne: require('./images/interFace1.png'),
  courseInterfaceThree: require('./images/interFace3.png'),
  courseInterfaceFour: require('./images/interFace4.png'),
  hotelOne: require('./images/hotel_1.png'),
  hotelTwo: require('./images/hotel_2.png'),
  hotelThree: require('./images/hotel_3.png'),
  onboardingIntro: require('./images/introduction_image.png'),
  onboardingRelax: require('./images/relax_image.png'),
  onboardingCare: require('./images/care_image.png'),
  profile: require('./images/profile_user_image.png'),
};
