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
          price: 'from $25',
          image: 'https://images.booqablecdn.com/w500/uploads/356c11211e03252a4edb0acdcb0ff49d/photo/photo/698f9546-c0f7-4793-8959-5eaeedfd42bb/dolly-rental-event-rentals-san-diego.png'
        },
        {
          slug: 'ratchet-strap-rental-event-rentals-san-diego',
          url: 'https://tasteful-event-rentals.booqableshop.com/products/ratchet-strap-rental-event-rentals-san-diego',
          name: 'Ratchet Strap',
          blurb: 'Secure your load safely in the truck or trailer.',
          price: 'from $4',
          image: 'https://images.booqablecdn.com/w500/uploads/356c11211e03252a4edb0acdcb0ff49d/photo/photo/27bbbf15-290c-4607-96ef-11e84f02ed20/ratchet-strap-event-rentals-san-diego.png'
        },
        {
          slug: 'moving-blanket-rental-event-rentals-san-diego',
          url: 'https://tasteful-event-rentals.booqableshop.com/products/moving-blanket-rental-event-rentals-san-diego',
          name: 'Moving Blanket',
          blurb: 'Quilted padding to protect rentals during transport.',
          price: 'from $5',
          image: 'https://images.booqablecdn.com/w500/uploads/356c11211e03252a4edb0acdcb0ff49d/photo/photo/d97ac621-3bb8-4d98-acb7-76d28d094b7d/moving-blanket-event-rentals-san-diego.png'
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
      '#bq-upsells-wrapper{display:flex!important;flex-direction:column!important;gap:12px!important;margin:20px 0!important;font-family:inherit!important;font-size:14px!important;line-height:1.4!important}' +
      '#bq-upsells-wrapper *{box-sizing:border-box!important}' +
      '#bq-upsells-wrapper .bq-upsells{padding:16px 12px!important;background:#f8f9fa!important;border-radius:4px!important;margin:0!important}' +
      '#bq-upsells-wrapper .bq-upsells[data-section="pickup-equipment"]{background:#fff!important;border:1px solid #e9ecef!important;border-top:3px solid #2541b2!important}' +
      '#bq-upsells-wrapper .bq-upsells__header{text-align:center!important;margin:0 0 12px!important;padding:0!important}' +
      '#bq-upsells-wrapper .bq-upsells__header h2{font-size:15px!important;line-height:1.3!important;margin:0 0 2px!important;padding:0!important;font-weight:600!important;color:inherit!important}' +
      '#bq-upsells-wrapper .bq-upsells__header p{color:#6c757d!important;font-size:12px!important;line-height:1.4!important;margin:0!important;padding:0!important}' +
      '#bq-upsells-wrapper .bq-upsells__grid{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(180px,1fr))!important;gap:10px!important;margin:0!important;padding:0!important;list-style:none!important}' +
      '#bq-upsells-wrapper .bq-upsell-card{background:#fff!important;border-radius:4px!important;overflow:hidden!important;box-shadow:0 1px 3px rgba(0,0,0,.08)!important;display:flex!important;flex-direction:column!important;margin:0!important;padding:0!important;max-width:100%!important}' +
      '#bq-upsells-wrapper .bq-upsell-card__image{aspect-ratio:4/3!important;overflow:hidden!important;margin:0!important;padding:0!important;background:#f8f9fa!important}' +
      '#bq-upsells-wrapper .bq-upsell-card__image img{width:100%!important;height:100%!important;object-fit:cover!important;display:block!important;max-width:none!important;margin:0!important;padding:0!important;border:0!important}' +
      '#bq-upsells-wrapper .bq-upsell-card__body{padding:10px!important;display:flex!important;flex-direction:column!important;flex:1!important;margin:0!important}' +
      '#bq-upsells-wrapper .bq-upsell-card__body h3{font-size:13px!important;line-height:1.3!important;margin:0 0 3px!important;padding:0!important;font-weight:600!important;color:inherit!important}' +
      '#bq-upsells-wrapper .bq-upsell-card__body p{color:#6c757d!important;font-size:11px!important;line-height:1.4!important;margin:0 0 8px!important;padding:0!important;flex:1!important}' +
      '#bq-upsells-wrapper .bq-upsell-card__footer{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:6px!important;margin:0!important;padding:0!important}' +
      '#bq-upsells-wrapper .bq-upsell-card__price{font-weight:600!important;font-size:12px!important;line-height:1.2!important;margin:0!important;color:inherit!important}' +
      '#bq-upsells-wrapper .bq-upsell-card__btn{display:inline-block!important;background:#1a4d3e!important;color:#fff!important;padding:5px 10px!important;border-radius:4px!important;text-decoration:none!important;font-size:11px!important;font-weight:500!important;line-height:1.2!important;white-space:nowrap!important;border:none!important;cursor:pointer!important}' +
      '#bq-upsells-wrapper .bq-upsell-card__btn:hover{background:#2d6a4f!important;color:#fff!important;text-decoration:none!important}';
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
