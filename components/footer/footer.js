import { createButton } from '../button/button.js';

const instagramIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".75" fill="currentColor" stroke="none"/></svg>';

export function createFooter({ logo = null, groups = [], socials = [], legalText = '', operatorText = '' } = {}) {
  const element = document.createElement('footer');
  element.className = 'site-footer';
  element.setAttribute('aria-label', 'Site footer');
  element.setAttribute('role', 'contentinfo');
  const controller = new AbortController();
  element.innerHTML = '<div class="site-footer__surface"><div class="site-footer__inner"><div class="site-footer__grid"><div class="site-footer__brand"><div class="site-footer__responsible"><span class="site-footer__age" aria-label="Ages 21 and over">21+</span><span>Responsible Gaming</span></div></div></div><div class="site-footer__legal"></div><p class="site-footer__status" role="status" hidden></p><div class="site-footer__bottom"><span>© ' + new Date().getFullYear() + ' WireCoin. All rights reserved.</span></div></div></div>';
  const grid = element.querySelector('.site-footer__grid');
  const brand = element.querySelector('.site-footer__brand');
  if (logo) brand.prepend(logo);
  const status = element.querySelector('.site-footer__status');

  function createLink(item, social = false) {
    let control;
    if (item.href) {
      control = document.createElement('a');
      control.href = item.href;
      control.className = social ? 'button button--secondary site-footer__social' : 'button button--text site-footer__link';
      if (/^https?:/.test(item.href)) {
        control.target = '_blank';
        control.rel = 'noopener noreferrer';
      }
    } else {
      control = createButton({
        variant: social ? 'secondary' : 'text',
        className: social ? 'site-footer__social' : 'site-footer__link',
      });
      control.addEventListener('click', () => {
        status.textContent = item.label + ' is not available in this demo yet.';
        status.hidden = false;
      }, { signal: controller.signal });
    }
    if (social) {
      control.setAttribute('aria-label', item.label);
      control.title = item.label;
      if (item.id === 'instagram') control.innerHTML = instagramIcon;
      else {
        const glyph = document.createElement('span');
        glyph.setAttribute('aria-hidden', 'true');
        glyph.textContent = item.id === 'facebook' ? 'f' : item.id === 'threads' ? '@' : 'X';
        control.append(glyph);
      }
    } else control.textContent = item.label;
    return control;
  }

  for (const group of groups) {
    const nav = document.createElement('nav');
    nav.className = 'site-footer__group';
    nav.setAttribute('aria-label', group.title);
    const list = document.createElement('ul');
    for (const item of group.links) {
      const row = document.createElement('li');
      row.append(createLink(item));
      list.append(row);
    }
    nav.append(list);
    grid.append(nav);
  }
  const socialGroup = document.createElement('div');
  socialGroup.className = 'site-footer__group site-footer__community';
  const socialRow = document.createElement('div');
  socialRow.className = 'site-footer__socials';
  socialRow.setAttribute('aria-label', 'Social media');
  for (const item of socials) socialRow.append(createLink(item, true));
  socialGroup.append(socialRow);
  grid.append(socialGroup);

  const legal = element.querySelector('.site-footer__legal');
  for (const text of [legalText, operatorText].filter(Boolean)) {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    legal.append(paragraph);
  }
  const privacy = groups.flatMap(group => group.links).find(item => item.id === 'privacy');
  if (privacy) element.querySelector('.site-footer__bottom').append(createLink(privacy));

  return {
    element,
    destroy() {
      controller.abort();
      element.remove();
    },
  };
}
