/*
 * Booqable cart upsells
 * Paste the contents of this file into:
 *   Booqable Admin → Online store → Settings → Additional scripts
 *   (do NOT wrap in <script> tags — Booqable already does that)
 *
 * What it does:
 *   - Detects when the customer is on the cart page
 *   - Injects two upsell sections (event extras, pickup equipment)
 *   - Each upsell links to its Booqable product/collection page so the
 *     customer can pick dates / quantity and add it to the same cart
 *   - When they return to the cart, upsells they already added hide
 *     (read from Booqable.cartData.items)
 *
 * To customize: edit the SECTIONS array below.
 */

(function () {
  // ----- CONFIGURE YOUR UPSELLS HERE -----
  // Each section is rendered as its own card grid with its own heading.
  // `url`  - full URL the "Add to cart" button links to
  // `slug` - (optional) product slug for dedupe so the upsell hides
  //          once the item is in the cart. Omit for collection links.
  var SECTIONS = [
    {
      id: 'event-extras',
      heading: 'Add these to your order',
      subheading: 'Last-minute extras our customers love.',
      items: [
        {
          url: 'https://tasteful-event-rentals.booqableshop.com/collections/backyard-lawn-games',
          name: 'Backyard Lawn Games Bundle',
          blurb: 'Cornhole, Connect Four & giant Jenga. Keep guests entertained.',
          price: 'from $30',
          image: 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=600&h=400&fit=crop&q=80'
        },
        {
          slug: 'white-padded-resin-folding-chair-rental-event-rentals-san-diego',
          url: 'https://tasteful-event-rentals.booqableshop.com/products/white-padded-resin-folding-chair-rental-event-rentals-san-diego',
          name: 'White Padded Chair Upgrade',
          blurb: 'Upgrade from standard folding chairs to white padded resin chairs.',
          price: '+$2 / chair',
          image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=400&fit=crop&q=80'
        },
        {
          url: 'https://tasteful-event-rentals.booqableshop.com/collections/linens',
          name: 'Linen Package',
          blurb: 'Tablecloths, runners & napkins in a range of colors to match your theme.',
          price: 'from $12',
          image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&h=400&fit=crop&q=80'
        }
      ]
    },
    {
      id: 'pickup-equipment',
      heading: 'Make loading easier & safer',
      subheading: 'Handy equipment to help you transport your rentals.',
      items: [
        {
          slug: 'equipment-dolly-rental-event-rentals-san-diego',
          url: 'https://tasteful-event-rentals.booqableshop.com/products/equipment-dolly-rental-event-rentals-san-diego',
          name: 'Moving Dolly',
          blurb: 'Heavy-duty dolly for moving tables, chairs & equipment with ease.',
          price: 'from $15',
          image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=400&fit=crop&q=80'
        },
        {
          slug: 'ratchet-strap-rental-event-rentals-san-diego',
          url: 'https://tasteful-event-rentals.booqableshop.com/products/ratchet-strap-rental-event-rentals-san-diego',
          name: 'Ratchet Strap',
          blurb: 'Secure your load safely in the truck or trailer.',
          price: 'from $10',
          image: 'https://images.unsplash.com/photo-1609205807107-e8ec2120f9de?w=600&h=400&fit=crop&q=80'
        },
        {
          slug: 'moving-blanket-rental-event-rentals-san-diego',
          url: 'https://tasteful-event-rentals.booqableshop.com/products/moving-blanket-rental-event-rentals-san-diego',
          name: 'Moving Blanket',
          blurb: 'Quilted padding to protect rentals during transport.',
          price: 'from $8',
          image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&q=80'
        }
      ]
    }
  ];

  var CART_PATH = '/cart';
  var WRAPPER_ID = 'bq-upsells-wrapper';

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

  function buildCard(u) {
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
          '<a href="' + u.url + '" class="bq-upsell-card__btn">Add to cart</a>' +
        '</div>' +
      '</div>';
    return card;
  }

  function buildSection(section, inCart) {
    var available = section.items.filter(function (u) {
      return !u.slug || inCart.indexOf(u.slug) === -1;
    });
    if (available.length === 0) return null;

    var el = document.createElement('section');
    el.className = 'bq-upsells';
    el.setAttribute('data-section', section.id);
    el.innerHTML =
      '<div class="bq-upsells__header">' +
        '<h2>' + section.heading + '</h2>' +
        '<p>' + section.subheading + '</p>' +
      '</div>' +
      '<div class="bq-upsells__grid"></div>';

    var grid = el.querySelector('.bq-upsells__grid');
    available.forEach(function (u) { grid.appendChild(buildCard(u)); });
    return el;
  }

  function injectStyles() {
    if (document.getElementById('bq-upsells-styles')) return;
    var css =
      '#bq-upsells-wrapper{display:flex;flex-direction:column;gap:24px;margin:32px 0}' +
      '.bq-upsells{padding:32px;background:#f8f9fa;border-radius:8px;font-family:inherit}' +
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
    var existing = document.getElementById(WRAPPER_ID);
    if (existing) existing.remove();

    var inCart = itemsInCart();
    var wrapper = document.createElement('div');
    wrapper.id = WRAPPER_ID;

    SECTIONS.forEach(function (section) {
      var el = buildSection(section, inCart);
      if (el) wrapper.appendChild(el);
    });

    if (!wrapper.children.length) return;
    injectStyles();
    findCartContainer().appendChild(wrapper);
  }

  Booqable.on('page-change', render);
  if (document.readyState !== 'loading') render();
  else document.addEventListener('DOMContentLoaded', render);
})();
