import type { ImageSourcePropType } from 'react-native';

import { AppImages } from '../../../../shared/assets';

export type DashboardFeature = {
  id: string;
  title: string;
  subtitle: string;
  image: ImageSourcePropType;
  meta: string;
  rating: number;
};

export type DashboardPattern = {
  id: string;
  title: string;
  subtitle: string;
  image: ImageSourcePropType;
  badge: string;
  rating: number;
};

export const dashboardFeatures: DashboardFeature[] = [
  {
    id: 'course-card',
    title: 'Learning Card',
    subtitle: 'Derived from design course cards',
    image: AppImages.courseInterfaceThree,
    meta: '24 lessons',
    rating: 4.8,
  },
  {
    id: 'destination-card',
    title: 'Destination Card',
    subtitle: 'Derived from hotel booking cards',
    image: AppImages.hotelOne,
    meta: '$180',
    rating: 4.4,
  },
];

export const dashboardPatterns: DashboardPattern[] = [
  {
    id: 'onboarding',
    title: 'Onboarding layout',
    subtitle: 'Fluid intro flow, prepared for product education',
    image: AppImages.onboardingRelax,
    badge: 'Motion',
    rating: 4.9,
  },
  {
    id: 'catalog',
    title: 'Catalog layout',
    subtitle: 'Horizontal list, badges, rating and compact metadata',
    image: AppImages.courseInterfaceOne,
    badge: 'Reusable',
    rating: 4.7,
  },
  {
    id: 'detail',
    title: 'Detail layout',
    subtitle: 'Header, hero content, metrics and action area',
    image: AppImages.hotelTwo,
    badge: 'Production',
    rating: 4.8,
  },
];
