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

  // ----- QUANTITY NUDGE CONFIG -----
  // When the cart contains `triggerSlug` with some quantity, recommend
  // `recommendSlug` if the recommended quantity isn't already met.
  // Replace the placeholder slugs with your real Booqable product slugs.
  var QUANTITY_RULES = [
    {
      triggerSlug: '60-inch-round-table',
      recommendSlug: 'white-folding-chair',
      recommendUrl: 'https://tasteful-event-rentals.booqableshop.com/products/white-folding-chair',
      recommendName: 'white folding chairs',
      // 8 chairs per round table is standard for dinner seating
      perTrigger: 8,
      messageFn: function (triggerQty, shortfall) {
        return 'Most ' + triggerQty + '-table events seat 8 per table. You look ' +
          shortfall + ' chair' + (shortfall === 1 ? '' : 's') + ' short.';
      }
    },
    {
      triggerSlug: '6ft-rectangular-table',
      recommendSlug: 'white-folding-chair',
      recommendUrl: 'https://tasteful-event-rentals.booqableshop.com/products/white-folding-chair',
      recommendName: 'white folding chairs',
      perTrigger: 6,
      messageFn: function (triggerQty, shortfall) {
        return 'Guests typically seat 6 per 6ft table. Add ' + shortfall +
          ' more chair' + (shortfall === 1 ? '' : 's') + '?';
      }
    }
  ];

  function cartItemsDetailed() {
    var data = Booqable && Booqable.cartData;
    if (!data || !Array.isArray(data.items)) return [];
    return data.items.map(function (i) {
      return {
        slug: (i.product_slug || i.slug || i.product_id || '').toString(),
        qty: parseInt(i.quantity || i.qty || 1, 10) || 1
      };
    });
  }

  function buildQuantityNudges() {
    var items = cartItemsDetailed();
    if (!items.length) return null;

    var suggestions = [];
    QUANTITY_RULES.forEach(function (rule) {
      var trigger = items.filter(function (i) { return i.slug === rule.triggerSlug; })[0];
      if (!trigger) return;
      var existing = items.filter(function (i) { return i.slug === rule.recommendSlug; })[0];
      var existingQty = existing ? existing.qty : 0;
      var targetQty = trigger.qty * rule.perTrigger;
      var shortfall = targetQty - existingQty;
      if (shortfall <= 0) return;
      suggestions.push({
        message: rule.messageFn(trigger.qty, shortfall),
        url: rule.recommendUrl,
        label: 'Add ' + shortfall + ' more'
      });
    });

    if (!suggestions.length) return null;

    var section = document.createElement('section');
    section.className = 'bq-nudges';
    section.innerHTML =
      '<div class="bq-nudges__header">' +
        '<span class="bq-nudges__icon" aria-hidden="true">&#128161;</span>' +
        '<h3>Based on your cart</h3>' +
      '</div>' +
      '<ul class="bq-nudges__list"></ul>';

    var list = section.querySelector('.bq-nudges__list');
    suggestions.forEach(function (s) {
      var li = document.createElement('li');
      li.className = 'bq-nudge';
      li.innerHTML =
        '<span class="bq-nudge__msg">' + s.message + '</span>' +
        '<a href="' + s.url + '" class="bq-nudge__btn">' + s.label + '</a>';
      list.appendChild(li);
    });
    return section;
  }

  // ----- DAMAGE WAIVER CONFIG -----
  // Create a "Damage Protection" product in Booqable priced at ~10% of
  // typical rental subtotals (or a flat fee like $25). Then fill in the
  // slug + url below. If the slug matches an item already in the cart,
  // the card switches to a confirmation state.
  var WAIVER = {
    slug: 'damage-protection-waiver', // replace with your real Booqable product slug
    url: 'https://tasteful-event-rentals.booqableshop.com/products/damage-protection-waiver',
    title: 'Add Damage Protection',
    percentLabel: '10% of your rental',
    benefits: [
      'Covers accidental damage to your rentals',
      'Caps your liability at $500 — peace of mind',
      'One click to add, no paperwork'
    ],
    disclaimer: 'Not insurance. Does not cover tires, intentional misuse, or theft.'
  };

  function waiverInCart(inCart) {
    return inCart.indexOf(WAIVER.slug) !== -1;
  }

  function buildWaiverCard(inCart) {
    var card = document.createElement('section');
    card.className = 'bq-waiver';
    if (waiverInCart(inCart)) {
      card.classList.add('bq-waiver--added');
      card.innerHTML =
        '<div class="bq-waiver__check" aria-hidden="true">&#10003;</div>' +
        '<div class="bq-waiver__body">' +
          '<h3>Damage Protection Added</h3>' +
          '<p>Your rental is covered. Thank you!</p>' +
        '</div>';
      return card;
    }
    var benefitsHtml = WAIVER.benefits.map(function (b) {
      return '<li>' + b + '</li>';
    }).join('');
    card.innerHTML =
      '<div class="bq-waiver__body">' +
        '<div class="bq-waiver__head">' +
          '<h3>' + WAIVER.title + '</h3>' +
          '<span class="bq-waiver__price">' + WAIVER.percentLabel + '</span>' +
        '</div>' +
        '<ul class="bq-waiver__benefits">' + benefitsHtml + '</ul>' +
        '<div class="bq-waiver__actions">' +
          '<a href="' + WAIVER.url + '" class="bq-waiver__btn">Add Protection</a>' +
          '<span class="bq-waiver__disclaimer">' + WAIVER.disclaimer + '</span>' +
        '</div>' +
      '</div>';
    return card;
  }

  // ----- URGENCY COUNTDOWN CONFIG -----
  var URGENCY = {
    holdMinutes: 15,
    storageKey: 'bq-cart-hold-expires'
  };

  function getHoldExpiry() {
    try {
      var stored = localStorage.getItem(URGENCY.storageKey);
      if (stored) {
        var ts = parseInt(stored, 10);
        if (ts > Date.now()) return ts;
      }
    } catch (e) {}
    var expiry = Date.now() + URGENCY.holdMinutes * 60 * 1000;
    try { localStorage.setItem(URGENCY.storageKey, String(expiry)); } catch (e) {}
    return expiry;
  }

  function formatRemaining(ms) {
    if (ms <= 0) return '00:00';
    var total = Math.floor(ms / 1000);
    var mm = Math.floor(total / 60);
    var ss = total % 60;
    return (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss;
  }

  function buildUrgencyBanner() {
    var expiry = getHoldExpiry();
    var banner = document.createElement('div');
    banner.className = 'bq-urgency';
    banner.innerHTML =
      '<span class="bq-urgency__icon" aria-hidden="true">&#9201;</span>' +
      '<span class="bq-urgency__text">Your cart is reserved for</span>' +
      '<span class="bq-urgency__time" data-bq-countdown>--:--</span>';

    var timeEl = banner.querySelector('[data-bq-countdown]');
    function tick() {
      var remaining = expiry - Date.now();
      if (remaining <= 0) {
        banner.classList.add('bq-urgency--expired');
        timeEl.textContent = 'expired';
        banner.querySelector('.bq-urgency__text').textContent = 'Cart reservation';
        clearInterval(interval);
        return;
      }
      timeEl.textContent = formatRemaining(remaining);
    }
    tick();
    var interval = setInterval(tick, 1000);
    return banner;
  }

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
      '#bq-upsells-wrapper .bq-urgency{display:flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;padding:10px 14px!important;background:#fff7e6!important;border:1px solid #ffe0a3!important;border-radius:4px!important;color:#7a4a00!important;font-size:13px!important;font-weight:500!important}' +
      '#bq-upsells-wrapper .bq-urgency__icon{font-size:16px!important;line-height:1!important}' +
      '#bq-upsells-wrapper .bq-urgency__time{font-variant-numeric:tabular-nums!important;font-weight:700!important}' +
      '#bq-upsells-wrapper .bq-urgency--expired{background:#fdecea!important;border-color:#f5c2c0!important;color:#8a1f1f!important}' +
      '#bq-upsells-wrapper .bq-waiver{display:flex!important;gap:12px!important;padding:14px!important;background:#fff!important;border:1px solid #e9ecef!important;border-left:4px solid #1a4d3e!important;border-radius:4px!important}' +
      '#bq-upsells-wrapper .bq-waiver__body{flex:1!important}' +
      '#bq-upsells-wrapper .bq-waiver__head{display:flex!important;align-items:baseline!important;justify-content:space-between!important;gap:8px!important;margin-bottom:6px!important}' +
      '#bq-upsells-wrapper .bq-waiver h3{font-size:14px!important;font-weight:700!important;margin:0!important;padding:0!important;color:inherit!important;line-height:1.3!important}' +
      '#bq-upsells-wrapper .bq-waiver__price{font-size:12px!important;font-weight:600!important;color:#1a4d3e!important;white-space:nowrap!important}' +
      '#bq-upsells-wrapper .bq-waiver__benefits{list-style:none!important;margin:0 0 10px!important;padding:0!important;display:flex!important;flex-direction:column!important;gap:3px!important}' +
      '#bq-upsells-wrapper .bq-waiver__benefits li{position:relative!important;padding-left:16px!important;font-size:12px!important;color:#343a40!important;line-height:1.4!important;margin:0!important}' +
      '#bq-upsells-wrapper .bq-waiver__benefits li:before{content:"\\2713"!important;position:absolute!important;left:0!important;top:0!important;color:#1a4d3e!important;font-weight:700!important}' +
      '#bq-upsells-wrapper .bq-waiver__actions{display:flex!important;align-items:center!important;gap:10px!important;flex-wrap:wrap!important}' +
      '#bq-upsells-wrapper .bq-waiver__btn{display:inline-block!important;background:#1a4d3e!important;color:#fff!important;padding:6px 14px!important;border-radius:4px!important;text-decoration:none!important;font-size:12px!important;font-weight:600!important;white-space:nowrap!important}' +
      '#bq-upsells-wrapper .bq-waiver__btn:hover{background:#2d6a4f!important;color:#fff!important;text-decoration:none!important}' +
      '#bq-upsells-wrapper .bq-waiver__disclaimer{font-size:10px!important;color:#6c757d!important;line-height:1.3!important}' +
      '#bq-upsells-wrapper .bq-waiver--added{background:#e8f5ee!important;border-color:#b7dcc4!important;border-left-color:#1a4d3e!important;align-items:center!important}' +
      '#bq-upsells-wrapper .bq-waiver__check{width:28px!important;height:28px!important;border-radius:50%!important;background:#1a4d3e!important;color:#fff!important;display:flex!important;align-items:center!important;justify-content:center!important;font-weight:700!important;font-size:14px!important;flex-shrink:0!important}' +
      '#bq-upsells-wrapper .bq-waiver--added p{margin:0!important;font-size:12px!important;color:#2d6a4f!important}' +
      '#bq-upsells-wrapper .bq-nudges{padding:12px 14px!important;background:#f0f5ff!important;border:1px solid #d6e4ff!important;border-radius:4px!important}' +
      '#bq-upsells-wrapper .bq-nudges__header{display:flex!important;align-items:center!important;gap:6px!important;margin-bottom:8px!important}' +
      '#bq-upsells-wrapper .bq-nudges__header h3{font-size:13px!important;font-weight:700!important;margin:0!important;padding:0!important;color:#1a2a5e!important;line-height:1.3!important}' +
      '#bq-upsells-wrapper .bq-nudges__icon{font-size:14px!important;line-height:1!important}' +
      '#bq-upsells-wrapper .bq-nudges__list{list-style:none!important;margin:0!important;padding:0!important;display:flex!important;flex-direction:column!important;gap:6px!important}' +
      '#bq-upsells-wrapper .bq-nudge{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;padding:8px 10px!important;background:#fff!important;border-radius:3px!important;margin:0!important}' +
      '#bq-upsells-wrapper .bq-nudge__msg{font-size:12px!important;color:#343a40!important;line-height:1.4!important;flex:1!important}' +
      '#bq-upsells-wrapper .bq-nudge__btn{display:inline-block!important;background:#2541b2!important;color:#fff!important;padding:4px 10px!important;border-radius:3px!important;text-decoration:none!important;font-size:11px!important;font-weight:600!important;white-space:nowrap!important}' +
      '#bq-upsells-wrapper .bq-nudge__btn:hover{background:#1a2a5e!important;color:#fff!important;text-decoration:none!important}' +
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

    wrapper.appendChild(buildUrgencyBanner());
    wrapper.appendChild(buildWaiverCard(inCart));

    var nudges = buildQuantityNudges();
    if (nudges) wrapper.appendChild(nudges);

    SECTIONS.forEach(function (section) {
      var el = buildSection(section, inCart);
      if (el) wrapper.appendChild(el);
    });

    injectStyles();
    findCartContainer().appendChild(wrapper);
  }

  Booqable.on('page-change', render);
  if (document.readyState !== 'loading') render();
  else document.addEventListener('DOMContentLoaded', render);
})();
