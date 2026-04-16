/*
 * Booqable cart upsells
 * Paste the contents of this file into:
 *   Booqable Admin → Online store → Settings → Additional scripts
 *   (do NOT wrap in <script> tags — Booqable already does that)
 *
 * What it does:
 *   - Detects when the customer is on the cart page
 *   - Injects an "Add these to your order" upsell section
 *   - Each upsell links to its Booqable product page so the customer
 *     can pick dates / quantity and add it to the same cart
 *   - When they return to the cart, the upsell section hides items
 *     already in their cart (read from Booqable.cartData.items)
 *
 * To customize: edit the UPSELLS array below.
 */

(function () {
  // ----- CONFIGURE YOUR UPSELLS HERE -----
  // `slug` must match the product slug in your Booqable shop
  // (the part of the URL after /products/).
  var UPSELLS = [
    {
      slug: 'backyard-lawn-games',
      name: 'Backyard Lawn Games Bundle',
      blurb: 'Cornhole, ladder toss & giant Jenga. Keep guests entertained.',
      price: 'from $75',
      image: 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=600&h=400&fit=crop&q=80'
    },
    {
      slug: 'chiavari-chair-upgrade',
      name: 'Chiavari Chair Upgrade',
      blurb: 'Swap standard folding chairs for elegant chiavari chairs.',
      price: '+$3 / chair',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&h=400&fit=crop&q=80'
    },
    {
      slug: 'string-light-package',
      name: 'String Light Package',
      blurb: '100ft of warm bistro lights for a magical evening setting.',
      price: 'from $50',
      image: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=600&h=400&fit=crop&q=80'
    }
  ];

  var CART_PATH = '/cart';
  var SECTION_ID = 'upsell-section';

  function isCartPage() {
    var loc = (Booqable && Booqable.location) || window.location.pathname;
    return loc && loc.indexOf(CART_PATH) === 0;
  }

  function itemsInCart() {
    var data = Booqable && Booqable.cartData;
    if (!data || !Array.isArray(data.items)) return [];
    return data.items.map(function (i) {
      return (i.product_slug || i.slug || i.product_id || '').toString();
    });
  }

  function buildSection() {
    var inCart = itemsInCart();
    var available = UPSELLS.filter(function (u) {
      return inCart.indexOf(u.slug) === -1;
    });
    if (available.length === 0) return null;

    var section = document.createElement('section');
    section.id = SECTION_ID;
    section.className = 'bq-upsells';
    section.innerHTML =
      '<div class="bq-upsells__header">' +
        '<h2>Add these to your order</h2>' +
        '<p>Last-minute extras our customers love.</p>' +
      '</div>' +
      '<div class="bq-upsells__grid"></div>';

    var grid = section.querySelector('.bq-upsells__grid');
    available.forEach(function (u) {
      var card = document.createElement('article');
      card.className = 'bq-upsell-card';
      card.innerHTML =
        '<div class="bq-upsell-card__image">' +
          '<img src="' + u.image + '" alt="' + u.name + '" loading="lazy">' +
        '</div>' +
        '<div class="bq-upsell-card__body">' +
          '<h3>' + u.name + '</h3>' +
          '<p>' + u.blurb + '</p>' +
          '<div class="bq-upsell-card__footer">' +
            '<span class="bq-upsell-card__price">' + u.price + '</span>' +
            '<a href="/products/' + u.slug + '" class="bq-upsell-card__btn">Add to cart</a>' +
          '</div>' +
        '</div>';
      grid.appendChild(card);
    });
    return section;
  }

  function injectStyles() {
    if (document.getElementById('bq-upsells-styles')) return;
    var css =
      '.bq-upsells{margin:32px 0;padding:32px;background:#f8f9fa;border-radius:8px;font-family:inherit}' +
      '.bq-upsells__header{text-align:center;margin-bottom:24px}' +
      '.bq-upsells__header h2{font-size:1.5rem;margin:0 0 8px}' +
      '.bq-upsells__header p{color:#6c757d;margin:0}' +
      '.bq-upsells__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px}' +
      '.bq-upsell-card{background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,.08);display:flex;flex-direction:column}' +
      '.bq-upsell-card__image{aspect-ratio:3/2;overflow:hidden}' +
      '.bq-upsell-card__image img{width:100%;height:100%;object-fit:cover;display:block}' +
      '.bq-upsell-card__body{padding:16px;display:flex;flex-direction:column;flex:1}' +
      '.bq-upsell-card__body h3{font-size:1.1rem;margin:0 0 6px}' +
      '.bq-upsell-card__body p{color:#6c757d;font-size:.9rem;margin:0 0 12px;flex:1}' +
      '.bq-upsell-card__footer{display:flex;align-items:center;justify-content:space-between;gap:12px}' +
      '.bq-upsell-card__price{font-weight:600}' +
      '.bq-upsell-card__btn{background:#1a4d3e;color:#fff;padding:8px 16px;border-radius:4px;text-decoration:none;font-size:.9rem;font-weight:500;white-space:nowrap}' +
      '.bq-upsell-card__btn:hover{background:#2d6a4f}';
    var style = document.createElement('style');
    style.id = 'bq-upsells-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function findCartContainer() {
    return document.querySelector('[data-cart-summary]') ||
      document.querySelector('.cart-summary') ||
      document.querySelector('main') ||
      document.body;
  }

  function render() {
    if (!isCartPage()) return;
    var existing = document.getElementById(SECTION_ID);
    if (existing) existing.remove();
    var section = buildSection();
    if (!section) return;
    injectStyles();
    var container = findCartContainer();
    container.appendChild(section);
  }

  Booqable.on('page-change', render);
  // Also run once on initial load in case page-change already fired
  if (document.readyState !== 'loading') render();
  else document.addEventListener('DOMContentLoaded', render);
})();
