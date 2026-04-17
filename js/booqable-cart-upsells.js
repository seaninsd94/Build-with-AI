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
          matchName: 'White Padded',
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
          matchName: 'Dolly',
          url: 'https://tasteful-event-rentals.booqableshop.com/products/equipment-dolly-rental-event-rentals-san-diego',
          name: 'Moving Dolly',
          blurb: 'Heavy-duty dolly for moving tables, chairs & equipment with ease.',
          price: 'from $25',
          image: 'https://images.booqablecdn.com/w500/uploads/356c11211e03252a4edb0acdcb0ff49d/photo/photo/698f9546-c0f7-4793-8959-5eaeedfd42bb/dolly-rental-event-rentals-san-diego.png'
        },
        {
          matchName: 'Ratchet Strap',
          url: 'https://tasteful-event-rentals.booqableshop.com/products/ratchet-strap-rental-event-rentals-san-diego',
          name: 'Ratchet Strap',
          blurb: 'Secure your load safely in the truck or trailer.',
          price: 'from $4',
          image: 'https://images.booqablecdn.com/w500/uploads/356c11211e03252a4edb0acdcb0ff49d/photo/photo/27bbbf15-290c-4607-96ef-11e84f02ed20/ratchet-strap-event-rentals-san-diego.png'
        },
        {
          matchName: 'Moving Blanket',
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
  // Rules are matched against the cart item's display name (item_name),
  // not URL slugs — Booqable only exposes names on the cart page.
  // `triggerMatch` and `recommendMatch` are case-insensitive substrings.
  // Shared list of recommended product variants. Quantity rules reference
  // a key here (e.g. recommend: 'chair') so that "Add more" routes to the
  // variant the customer already has in their cart, rather than always
  // linking to one hardcoded product.
  //
  // Matching precedence: the first variant found in the cart wins. If
  // none are in the cart, the LAST variant is used as a cheapest-default
  // fallback (so new customers get the lower-priced option).
  var RECOMMENDATIONS = {
    chair: {
      label: 'chair',
      variants: [
        {
          match: 'Padded Resin',
          url: 'https://tasteful-event-rentals.booqableshop.com/products/white-padded-resin-folding-chair-rental-event-rentals-san-diego'
        },
        {
          match: 'Plastic Folding Chair',
          url: 'https://tasteful-event-rentals.booqableshop.com/products/white-folding-chair-rental-event-rentals-san-diego'
        }
      ]
    }
  };

  function resolveRecommendation(rec, items) {
    var preferredUrl = null;
    var existingQty = 0;
    rec.variants.forEach(function (v) {
      var found = findCartItem(items, v.match);
      if (found) {
        existingQty += found.qty;
        if (!preferredUrl) preferredUrl = v.url;
      }
    });
    if (!preferredUrl) preferredUrl = rec.variants[rec.variants.length - 1].url;
    return { url: preferredUrl, existingQty: existingQty };
  }

  var QUANTITY_RULES = [
    {
      triggerMatch: 'Round Birchwood Table',
      recommend: 'chair',
      // 8 chairs per 60" round table is standard for dinner seating
      perTrigger: 8
    },
    {
      triggerMatch: "6' Plastic",
      recommend: 'chair',
      // 6 chairs per 6ft rectangular table (2 per side + 1 per end)
      perTrigger: 6
    },
    {
      triggerMatch: "8' Plastic",
      recommend: 'chair',
      // 8 chairs per 8ft rectangular table (3 per side + 1 per end)
      perTrigger: 8
    }
  ];

  function buildQuantityNudges() {
    var items = cartItemsDetailed();
    if (!items.length) return null;

    // Group rules by recommendation key so overlapping rules (e.g. round
    // tables + 6ft tables both suggesting chairs) aggregate into a single
    // correct shortfall. The recommended URL is resolved against the cart
    // so "Add more" links to the chair variant the customer already has.
    var buckets = {};
    QUANTITY_RULES.forEach(function (rule) {
      var trigger = findCartItem(items, rule.triggerMatch);
      if (!trigger) return;
      var rec = RECOMMENDATIONS[rule.recommend];
      if (!rec) return;
      var key = rule.recommend;
      if (!buckets[key]) {
        var resolved = resolveRecommendation(rec, items);
        buckets[key] = {
          url: resolved.url,
          existingQty: resolved.existingQty,
          label: rec.label,
          totalNeeded: 0,
          triggers: []
        };
      }
      buckets[key].totalNeeded += trigger.qty * rule.perTrigger;
      buckets[key].triggers.push({
        qty: trigger.qty,
        perTrigger: rule.perTrigger,
        name: trigger.raw.item_name || rule.triggerMatch
      });
    });

    var suggestions = [];
    Object.keys(buckets).forEach(function (key) {
      var b = buckets[key];
      var shortfall = b.totalNeeded - b.existingQty;
      if (shortfall <= 0) return;
      var breakdown = b.triggers.map(function (t) {
        return t.qty + ' × ' + t.name + ' (' + t.perTrigger + ' seats each)';
      }).join(' + ');
      var noun = b.label + (b.totalNeeded === 1 ? '' : 's');
      suggestions.push({
        message: breakdown + ' = ' + b.totalNeeded + ' ' + noun + ' recommended. You have ' + b.existingQty + '.',
        url: b.url,
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
      '<p class="bq-nudges__intro">Make sure your guests have a seat at the table.</p>' +
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
    // matchName is a case-insensitive substring of the product's name as
    // it appears in the cart (Booqable exposes `item_name`, not slugs).
    matchName: 'Rental Protection Plan',
    url: 'https://tasteful-event-rentals.booqableshop.com/products/rental-protection-plan',
    title: 'Add Rental Protection Plan',
    percentLabel: '10% of your rental',
    benefits: [
      'Covers accidental damage to your rentals',
      'Caps your liability at $500 — peace of mind',
      'One click to add, no paperwork'
    ],
    disclaimer: 'Not insurance. Does not cover tires, intentional misuse, or theft.'
  };

  function waiverInCart() {
    var items = cartItemsDetailed();
    return !!findCartItem(items, WAIVER.matchName);
  }

  function buildWaiverCard() {
    var card = document.createElement('section');
    card.className = 'bq-waiver';
    if (waiverInCart()) {
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
    return cartItemsDetailed();
  }

  function normalize(s) {
    return (s || '').toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function itemMatches(item, query) {
    if (!item || !query) return false;
    var name = (item.item_name || item.name || item.title || '').toString().toLowerCase();
    if (!name) return false;
    return name.indexOf(query.toString().toLowerCase()) !== -1;
  }

  function findCartItem(items, slug) {
    for (var i = 0; i < items.length; i++) {
      if (itemMatches(items[i].raw, slug)) return items[i];
    }
    return null;
  }

  function cartItemsDetailed() {
    var data = Booqable && Booqable.cartData;
    if (data && Array.isArray(data.items) && data.items.length) {
      return data.items.map(function (i) {
        return {
          raw: i,
          qty: parseInt(i.quantity || i.qty || i.amount || 1, 10) || 1
        };
      });
    }
    // Fallback: scrape the rendered cart DOM. Booqable cart pages render
    // each line as an element containing the product name and a quantity
    // input. The exact selectors vary by theme; try several common ones.
    return cartItemsFromDom();
  }

  function cartItemsFromDom() {
    var items = [];
    var lineSelectors = [
      '[data-cart-item]',
      '[data-line-item]',
      '.cart-item',
      '.cart__item',
      '.line-item',
      'tr.cart-line',
      'li.cart-line'
    ];
    var lines = [];
    for (var s = 0; s < lineSelectors.length && !lines.length; s++) {
      lines = Array.prototype.slice.call(document.querySelectorAll(lineSelectors[s]));
    }
    if (!lines.length) {
      // Last resort: any link to /products/ inside what looks like a cart container
      var cart = document.querySelector('[data-cart], .cart, #cart, main');
      if (cart) {
        var links = cart.querySelectorAll('a[href*="/products/"]');
        for (var k = 0; k < links.length; k++) {
          var href = links[k].getAttribute('href') || '';
          var slug = (href.split('/products/')[1] || '').split(/[?#/]/)[0];
          if (!slug) continue;
          items.push({ raw: { handle: slug, name: links[k].textContent.trim() }, qty: 1 });
        }
      }
      return items;
    }
    lines.forEach(function (line) {
      var qty = 1;
      var qInput = line.querySelector('input[type="number"], input[name*="quantity" i]');
      if (qInput && qInput.value) qty = parseInt(qInput.value, 10) || 1;
      var qText = line.querySelector('[data-quantity], .quantity, .cart-line-qty');
      if (qText && qText.textContent) {
        var n = parseInt(qText.textContent.replace(/\D+/g, ''), 10);
        if (n) qty = n;
      }
      var link = line.querySelector('a[href*="/products/"]');
      var slug = '';
      if (link) {
        var href2 = link.getAttribute('href') || '';
        slug = (href2.split('/products/')[1] || '').split(/[?#/]/)[0];
      }
      var nameEl = line.querySelector('[data-product-name], .product-name, .cart-line-info h3, h3, h4, .title');
      var name = (nameEl && nameEl.textContent.trim()) || (link && link.textContent.trim()) || '';
      if (!slug && !name) return;
      items.push({ raw: { handle: slug, name: name }, qty: qty });
    });
    return items;
  }

  // Debug: log cart structure once per page so you can see actual keys.
  // Open DevTools console on the cart page to inspect.
  function debugLogCart() {
    try {
      var d = Booqable && Booqable.cartData;
      if (d && Array.isArray(d.items) && d.items.length) {
        console.log('[bq-upsells] cartData.items[0] keys: ' +
          Object.keys(d.items[0]).join(', '));
        console.log('[bq-upsells] cartData.items JSON:\n' +
          JSON.stringify(d.items, null, 2));
      } else {
        var dom = cartItemsFromDom();
        console.log('[bq-upsells] cartData unavailable. DOM scraped ' +
          dom.length + ' items: ' + JSON.stringify(dom, null, 2));
      }
    } catch (e) {
      console.log('[bq-upsells] debug error:', e && e.message);
    }
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

  function buildSection(section, items) {
    var available = section.items.filter(function (u) {
      var query = u.matchName || u.slug;
      return !query || !findCartItem(items, query);
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
      '#bq-upsells-wrapper .bq-nudges{padding:18px 18px 16px!important;background:linear-gradient(135deg,#2541b2 0%,#1a2a5e 100%)!important;border-radius:6px!important;box-shadow:0 4px 12px rgba(26,42,94,.25)!important;color:#fff!important}' +
      '#bq-upsells-wrapper .bq-nudges__header{display:flex!important;align-items:center!important;gap:8px!important;margin-bottom:4px!important}' +
      '#bq-upsells-wrapper .bq-nudges__header h3{font-size:16px!important;font-weight:700!important;margin:0!important;padding:0!important;color:#fff!important;line-height:1.2!important;letter-spacing:.2px!important}' +
      '#bq-upsells-wrapper .bq-nudges__icon{font-size:18px!important;line-height:1!important}' +
      '#bq-upsells-wrapper .bq-nudges__intro{font-size:12px!important;color:rgba(255,255,255,.8)!important;margin:0 0 10px!important;padding:0!important;line-height:1.4!important}' +
      '#bq-upsells-wrapper .bq-nudges__list{list-style:none!important;margin:0!important;padding:0!important;display:flex!important;flex-direction:column!important;gap:8px!important}' +
      '#bq-upsells-wrapper .bq-nudge{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;padding:10px 12px!important;background:rgba(255,255,255,.12)!important;border:1px solid rgba(255,255,255,.18)!important;border-radius:4px!important;margin:0!important;backdrop-filter:blur(4px)!important}' +
      '#bq-upsells-wrapper .bq-nudge__msg{font-size:13px!important;color:#fff!important;line-height:1.4!important;flex:1!important;font-weight:500!important}' +
      '#bq-upsells-wrapper .bq-nudge__btn{display:inline-block!important;background:#fff!important;color:#1a2a5e!important;padding:7px 14px!important;border-radius:4px!important;text-decoration:none!important;font-size:12px!important;font-weight:700!important;white-space:nowrap!important;box-shadow:0 1px 3px rgba(0,0,0,.15)!important}' +
      '#bq-upsells-wrapper .bq-nudge__btn:hover{background:#f8f9fa!important;color:#1a2a5e!important;text-decoration:none!important;transform:translateY(-1px)!important}' +
      '#bq-upsells-wrapper .bq-upsells{padding:16px 12px!important;background:#f8f9fa!important;border-radius:4px!important;margin:0!important}' +
      '#bq-upsells-wrapper .bq-upsells[data-section="pickup-equipment"]{background:#fff!important;border:1px solid #e9ecef!important;border-top:3px solid #2541b2!important}' +
      '#bq-upsells-wrapper .bq-upsells__header{text-align:center!important;margin:0 0 12px!important;padding:0!important}' +
      '#bq-upsells-wrapper .bq-upsells__header h2{font-size:15px!important;line-height:1.3!important;margin:0 0 2px!important;padding:0!important;font-weight:600!important;color:inherit!important}' +
      '#bq-upsells-wrapper .bq-upsells__header p{color:#6c757d!important;font-size:12px!important;line-height:1.4!important;margin:0!important;padding:0!important}' +
      '#bq-upsells-wrapper .bq-upsells__grid{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(180px,220px))!important;gap:10px!important;margin:0!important;padding:0!important;list-style:none!important;justify-content:center!important}' +
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

    debugLogCart();

    wrapper.appendChild(buildUrgencyBanner());
    wrapper.appendChild(buildWaiverCard());

    var nudges = buildQuantityNudges();
    if (nudges) wrapper.appendChild(nudges);

    SECTIONS.forEach(function (section) {
      var el = buildSection(section, inCart);
      if (el) wrapper.appendChild(el);
    });

    injectStyles();
    findCartContainer().appendChild(wrapper);
  }

  // Signature of current cart state — changes when items or quantities
  // change, so we can detect cart mutations and re-render.
  function cartSignature() {
    var d = Booqable && Booqable.cartData;
    if (!d || !Array.isArray(d.items)) return '';
    return d.items.map(function (i) {
      return (i.item_id || i.item_name || '') + ':' + (i.quantity || 0);
    }).join('|');
  }

  var lastSignature = null;
  var watchTimer = null;

  // Continuous cart watcher: re-renders whenever cart items or quantities
  // change (customer adds, removes, or updates qty) so the "Based on
  // your cart" nudge stays accurate without requiring a page refresh.
  function startCartWatcher() {
    if (watchTimer) return;
    watchTimer = setInterval(function () {
      if (!isCartPage()) return;
      var sig = cartSignature();
      if (sig !== lastSignature) {
        lastSignature = sig;
        render();
      }
    }, 1000);
  }

  function renderWhenReady() {
    if (!isCartPage()) return;
    render(); // initial render with whatever's available right now
    lastSignature = cartSignature();
    startCartWatcher();
  }

  Booqable.on('page-change', renderWhenReady);
  if (document.readyState !== 'loading') renderWhenReady();
  else document.addEventListener('DOMContentLoaded', renderWhenReady);
})();
