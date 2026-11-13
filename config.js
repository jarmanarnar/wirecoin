// Switch a feature off with false, then reload the page.
export const siteConfig = {
  features: {
    header: true,
    logo: true,
    auth: true,
    authButtons: true,
    carousel: true,
    promotions: true,
  },
  promotions: {
    items: [
      { id: 'promotion-1' },
      { id: 'promotion-2' },
      { id: 'promotion-3' },
      { id: 'promotion-4' },
    ],
  },
  carousel: {
    slideCount: 4,
    rotationDuration: 6000,
  },
};
