// Switch a feature off with false, then reload the page.
export const siteConfig = {
  features: {
    header: true,
    logo: true,
    auth: true,
    authButtons: true,
    carousel: true,
    promotions: false,
    footer: true,
  },
  footer: {
    "groups": [
      {
        "title": "Policies",
        "links": [
          {
            "id": "terms",
            "label": "Terms & Conditions"
          },
          {
            "id": "sweepstakes",
            "label": "Sweepstake Rules"
          },
          {
            "id": "responsible",
            "label": "Responsible Social Gameplay Policy"
          },
          {
            "id": "privacy",
            "label": "Privacy Policy"
          }
        ]
      },
      {
        "title": "About WireCoin",
        "links": [
          {
            "id": "about",
            "label": "About Us"
          },
          {
            "id": "faq",
            "label": "FAQ"
          },
          {
            "id": "affiliate",
            "label": "Become an Affiliate"
          }
        ]
      }
    ],
    "socials": [
      {
        "id": "instagram",
        "label": "Instagram"
      },
      {
        "id": "facebook",
        "label": "Facebook"
      },
      {
        "id": "threads",
        "label": "Threads"
      },
      {
        "id": "x",
        "label": "X"
      }
    ],
    "legalText": "WireCoin is a social gaming preview for adults aged 21+. This demo is for entertainment only and does not offer real-money play, purchases or prizes. No purchase is available or required.",
    "operatorText": "Operator name and registered address: to be added."
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
