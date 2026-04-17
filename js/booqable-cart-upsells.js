/*
 * Booqable storefront enhancements
 * Paste the contents of this file into:
 *   Booqable Admin → Online store → Settings → Additional scripts
 *   (do NOT wrap in <script> tags — Booqable already does that)
 *
 * What it does:
 *   BROWSE PAGES (homepage, /collections/*, /products/*)
 *     - Announcement bar (promo, dismissible, site-wide)
 *     - Social proof strip (star rating + review count)
 *     - Live activity counter ("N events booked this month")
 *     - Trust signals row
 *
 *   CART PAGE (/cart)
 *     - Urgency countdown banner (cart reservation timer)
 *     - Trust signals row
 *     - "Based on your cart" quantity nudges (chairs per table,
 *       linens per table) with live updates when cart changes
 *     - Two upsell sections: event extras + pickup equipment
 *     - Save Quote email capture (Formspree)
 *
 * To customize: edit the config constants near the top (SECTIONS,
 * RECOMMENDATIONS, QUANTITY_RULES, WAIVER, URGENCY, TRUST_SIGNALS,
 * SAVE_QUOTE, HOMEPAGE).
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
    },
    linen: {
      label: 'linen',
      // Collection URL until specific linen sizes are wired up. Once
      // you have a product per table size (e.g. 120" round, 90x132,
      // 90x156), add them here as variants and the nudge will route
      // to the right one automatically.
      variants: [
        {
          match: 'Linen',
          url: 'https://tasteful-event-rentals.booqableshop.com/collections/linens'
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
    // Chairs per table
    { triggerMatch: 'Round Birchwood Table', recommend: 'chair', perTrigger: 8 },
    { triggerMatch: "6' Plastic", recommend: 'chair', perTrigger: 6 },
    { triggerMatch: "8' Plastic", recommend: 'chair', perTrigger: 8 },
    // One linen per table
    { triggerMatch: 'Round Birchwood Table', recommend: 'linen', perTrigger: 1 },
    { triggerMatch: "6' Plastic", recommend: 'linen', perTrigger: 1 },
    { triggerMatch: "8' Plastic", recommend: 'linen', perTrigger: 1 }
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
      var noun = b.label + (b.totalNeeded === 1 ? '' : 's');
      var breakdown = b.triggers.map(function (t) {
        var line = t.qty + ' × ' + t.name;
        if (t.perTrigger > 1) {
          line += ' (' + t.perTrigger + ' ' + b.label + 's each)';
        }
        return line;
      }).join(' + ');
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

  // ----- TRUST SIGNALS CONFIG -----
  // Short, scannable trust statements shown on browse pages and on the
  // cart page near the Continue to Checkout button. Edit/reorder freely.
  // Set to [] to hide entirely.
  var TRUST_SIGNALS = [
    'Locally owned in San Diego',
    'Insured & licensed event rentals',
    '7+ years serving events',
    'Flexible customer pickup'
  ];

  function buildTrustSignals() {
    if (!TRUST_SIGNALS.length) return null;
    var section = document.createElement('section');
    section.className = 'bq-trust';
    section.innerHTML = TRUST_SIGNALS.map(function (s) {
      return '<span class="bq-trust__item">' +
        '<span class="bq-trust__check" aria-hidden="true">&#10003;</span> ' + s +
      '</span>';
    }).join('');
    return section;
  }

  // ----- SAVE QUOTE CONFIG -----
  // Captures the customer's email + cart contents so you can follow up
  // with abandoned carts. Two delivery modes:
  //   1. formspreeUrl set -> POSTs to Formspree, you receive an email
  //   2. formspreeUrl empty -> opens the customer's mail client with
  //      a pre-filled mailto: addressed to businessEmail (works
  //      immediately, no signup, but only if the customer has an email
  //      client configured)
  // Sign up free at https://formspree.io to get a URL like
  //   https://formspree.io/f/xxxxxxx
  var SAVE_QUOTE = {
    formspreeUrl: 'https://formspree.io/f/xojyddzz',
    businessEmail: 'support@tastefuleventrentals.com', // mailto fallback
    title: 'Need to think it over?',
    subtitle: 'Email yourself this quote and pick up where you left off.'
  };

  function cartSummaryText() {
    var items = cartItemsDetailed();
    if (!items.length) return '(empty cart)';
    return items.map(function (i) {
      var n = i.raw.item_name || 'Item';
      return '- ' + n + ' × ' + i.qty + ' @ $' + (i.raw.price || 0);
    }).join('\n');
  }

  function buildSaveQuoteCard() {
    var section = document.createElement('section');
    section.className = 'bq-savequote';
    section.innerHTML =
      '<div class="bq-savequote__body">' +
        '<h3>' + SAVE_QUOTE.title + '</h3>' +
        '<p>' + SAVE_QUOTE.subtitle + '</p>' +
      '</div>' +
      '<form class="bq-savequote__form" novalidate>' +
        '<input type="email" name="email" placeholder="you@example.com" ' +
          'class="bq-savequote__input" required>' +
        '<button type="submit" class="bq-savequote__btn">Email me my quote</button>' +
      '</form>' +
      '<p class="bq-savequote__status" data-bq-status></p>';

    var form = section.querySelector('form');
    var status = section.querySelector('[data-bq-status]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.querySelector('input[name=email]').value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        status.textContent = 'Please enter a valid email address.';
        status.className = 'bq-savequote__status bq-savequote__status--err';
        return;
      }
      var summary = cartSummaryText();
      if (SAVE_QUOTE.formspreeUrl) {
        status.textContent = 'Sending...';
        status.className = 'bq-savequote__status';
        fetch(SAVE_QUOTE.formspreeUrl, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            cart: summary,
            cart_url: window.location.href,
            _subject: 'Saved Quote from ' + email
          })
        }).then(function (r) {
          if (r.ok) {
            status.textContent = 'Sent! Check your inbox.';
            status.className = 'bq-savequote__status bq-savequote__status--ok';
            form.reset();
          } else {
            throw new Error('Failed');
          }
        }).catch(function () {
          status.textContent = 'Could not send. Please try again or email us directly.';
          status.className = 'bq-savequote__status bq-savequote__status--err';
        });
      } else {
        // mailto fallback
        var subject = 'My Tasteful Event Rentals quote';
        var body = 'Saved quote from ' + email + ':\n\n' + summary +
          '\n\nResume cart: ' + window.location.href;
        var to = SAVE_QUOTE.businessEmail || '';
        window.location.href = 'mailto:' + encodeURIComponent(to) +
          '?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(body);
        status.textContent = 'Opening your mail app...';
        status.className = 'bq-savequote__status bq-savequote__status--ok';
      }
    });
    return section;
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
    if (!data || !Array.isArray(data.items)) return [];
    return data.items.map(function (i) {
      return {
        raw: i,
        qty: parseInt(i.quantity || i.qty || i.amount || 1, 10) || 1
      };
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
      // Trust signals — shared rules cover both the cart wrapper and
      // the browse-page wrapper so we don't duplicate styles.
      '#bq-upsells-wrapper .bq-trust,#bq-homepage-wrapper .bq-trust{display:inline-flex!important;flex-wrap:wrap!important;align-items:center!important;justify-content:center!important;gap:8px 18px!important;margin:0!important;padding:0!important;background:transparent!important}' +
      '#bq-upsells-wrapper .bq-trust__item,#bq-homepage-wrapper .bq-trust__item{display:inline-flex!important;align-items:center!important;font-size:12px!important;color:#343a40!important;font-weight:500!important;line-height:1.3!important;margin:0!important;padding:0!important}' +
      '#bq-upsells-wrapper .bq-trust__check,#bq-homepage-wrapper .bq-trust__check{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:16px!important;height:16px!important;border-radius:50%!important;background:#1a4d3e!important;color:#fff!important;font-size:10px!important;font-weight:700!important;margin-right:5px!important;flex-shrink:0!important}' +
      '#bq-upsells-wrapper .bq-savequote{padding:16px!important;background:#fff!important;border:1px solid #e9ecef!important;border-radius:6px!important;text-align:center!important}' +
      '#bq-upsells-wrapper .bq-savequote__body{margin-bottom:12px!important}' +
      '#bq-upsells-wrapper .bq-savequote h3{font-size:14px!important;font-weight:700!important;margin:0 0 4px!important;padding:0!important;color:inherit!important;line-height:1.3!important}' +
      '#bq-upsells-wrapper .bq-savequote p{font-size:12px!important;color:#6c757d!important;margin:0!important;padding:0!important;line-height:1.4!important}' +
      '#bq-upsells-wrapper .bq-savequote__form{display:flex!important;gap:6px!important;justify-content:center!important;flex-wrap:wrap!important;margin:0!important;padding:0!important}' +
      '#bq-upsells-wrapper .bq-savequote__input{flex:1 1 200px!important;max-width:300px!important;padding:8px 10px!important;border:1px solid #ced4da!important;border-radius:4px!important;font-size:13px!important;font-family:inherit!important;background:#fff!important;color:#343a40!important}' +
      '#bq-upsells-wrapper .bq-savequote__input:focus{outline:none!important;border-color:#1a4d3e!important;box-shadow:0 0 0 2px rgba(26,77,62,.15)!important}' +
      '#bq-upsells-wrapper .bq-savequote__btn{background:#1a4d3e!important;color:#fff!important;padding:8px 14px!important;border:none!important;border-radius:4px!important;font-size:13px!important;font-weight:600!important;cursor:pointer!important;white-space:nowrap!important;font-family:inherit!important}' +
      '#bq-upsells-wrapper .bq-savequote__btn:hover{background:#2d6a4f!important}' +
      '#bq-upsells-wrapper .bq-savequote__status{font-size:12px!important;margin:8px 0 0!important;padding:0!important;line-height:1.4!important;min-height:1em!important}' +
      '#bq-upsells-wrapper .bq-savequote__status--ok{color:#1a4d3e!important;font-weight:600!important}' +
      '#bq-upsells-wrapper .bq-savequote__status--err{color:#8a1f1f!important;font-weight:600!important}' +
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
      '#bq-upsells-wrapper .bq-upsells__grid{display:flex!important;flex-wrap:wrap!important;justify-content:center!important;gap:10px!important;margin:0!important;padding:0!important;list-style:none!important}' +
      '#bq-upsells-wrapper .bq-upsell-card{background:#fff!important;border-radius:4px!important;overflow:hidden!important;box-shadow:0 1px 3px rgba(0,0,0,.08)!important;display:flex!important;flex-direction:column!important;margin:0!important;padding:0!important;flex:0 0 220px!important;max-width:220px!important}' +
      '#bq-upsells-wrapper .bq-upsell-card__image{aspect-ratio:4/3!important;overflow:hidden!important;margin:0!important;padding:0!important;background:#f8f9fa!important}' +
      '#bq-upsells-wrapper .bq-upsell-card__image img{width:100%!important;height:100%!important;object-fit:cover!important;display:block!important;max-width:none!important;margin:0!important;padding:0!important;border:0!important}' +
      '#bq-upsells-wrapper .bq-upsell-card__body{padding:10px!important;display:flex!important;flex-direction:column!important;flex:1!important;margin:0!important}' +
      '#bq-upsells-wrapper .bq-upsell-card__body h3{font-size:13px!important;line-height:1.3!important;margin:0 0 3px!important;padding:0!important;font-weight:600!important;color:inherit!important}' +
      '#bq-upsells-wrapper .bq-upsell-card__body p{color:#6c757d!important;font-size:11px!important;line-height:1.4!important;margin:0 0 8px!important;padding:0!important;flex:1!important}' +
      '#bq-upsells-wrapper .bq-upsell-card__footer{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:6px!important;margin:0!important;padding:0!important}' +
      '#bq-upsells-wrapper .bq-upsell-card__price{font-weight:600!important;font-size:12px!important;line-height:1.2!important;margin:0!important;color:inherit!important}' +
      '#bq-upsells-wrapper .bq-upsell-card__btn{display:inline-block!important;background:#1a4d3e!important;color:#fff!important;padding:5px 10px!important;border-radius:4px!important;text-decoration:none!important;font-size:11px!important;font-weight:500!important;line-height:1.2!important;white-space:nowrap!important;border:none!important;cursor:pointer!important}' +
      '#bq-upsells-wrapper .bq-upsell-card__btn:hover{background:#2d6a4f!important;color:#fff!important;text-decoration:none!important}' +
      // ---- Homepage: announcement bar (fixed at top) ----
      '#bq-announcement{position:sticky!important;top:0!important;left:0!important;right:0!important;z-index:9999!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:12px!important;padding:8px 44px 8px 16px!important;background:#1a4d3e!important;color:#fff!important;font-family:inherit!important;font-size:13px!important;font-weight:500!important;line-height:1.3!important;text-align:center!important;box-shadow:0 1px 3px rgba(0,0,0,.1)!important}' +
      '#bq-announcement .bq-announcement__text,#bq-announcement .bq-announcement__link{color:#fff!important;text-decoration:none!important}' +
      '#bq-announcement .bq-announcement__link:hover{text-decoration:underline!important}' +
      '#bq-announcement .bq-announcement__close{position:absolute!important;right:8px!important;top:50%!important;transform:translateY(-50%)!important;background:transparent!important;border:none!important;color:#fff!important;font-size:20px!important;line-height:1!important;padding:4px 8px!important;cursor:pointer!important;opacity:.8!important;font-family:inherit!important}' +
      '#bq-announcement .bq-announcement__close:hover{opacity:1!important}' +
      // ---- Homepage: social proof + activity + trust strip ----
      '#bq-homepage-wrapper{display:flex!important;flex-wrap:wrap!important;align-items:center!important;justify-content:center!important;gap:16px 32px!important;padding:14px 20px!important;background:#f8f9fa!important;border-bottom:1px solid #e9ecef!important;font-family:inherit!important;font-size:13px!important;color:#343a40!important}' +
      '#bq-homepage-wrapper *{box-sizing:border-box!important}' +
      '#bq-homepage-wrapper .bq-socialproof{display:inline-flex!important;align-items:center!important;gap:8px!important;margin:0!important;padding:0!important}' +
      '#bq-homepage-wrapper .bq-socialproof__stars{color:#f5a623!important;font-size:14px!important;letter-spacing:1px!important}' +
      '#bq-homepage-wrapper .bq-socialproof__text{font-weight:500!important;color:#343a40!important}' +
      '#bq-homepage-wrapper .bq-activity{display:inline-flex!important;align-items:center!important;gap:8px!important;margin:0!important;padding:0!important}' +
      '#bq-homepage-wrapper .bq-activity__pulse{width:8px!important;height:8px!important;border-radius:50%!important;background:#2d6a4f!important;box-shadow:0 0 0 0 rgba(45,106,79,.7)!important;animation:bqPulse 2s infinite!important;flex-shrink:0!important}' +
      '#bq-homepage-wrapper .bq-activity__text{font-weight:500!important;color:#343a40!important}' +
      '#bq-homepage-wrapper .bq-activity__text strong{color:#1a4d3e!important;font-weight:700!important}' +
      '@keyframes bqPulse{0%{box-shadow:0 0 0 0 rgba(45,106,79,.7)}70%{box-shadow:0 0 0 10px rgba(45,106,79,0)}100%{box-shadow:0 0 0 0 rgba(45,106,79,0)}}';
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

    var inCart = cartItemsDetailed();
    var wrapper = document.createElement('div');
    wrapper.id = WRAPPER_ID;

    wrapper.appendChild(buildUrgencyBanner());

    var trust = buildTrustSignals();
    if (trust) wrapper.appendChild(trust);

    var nudges = buildQuantityNudges();
    if (nudges) wrapper.appendChild(nudges);

    SECTIONS.forEach(function (section) {
      var el = buildSection(section, inCart);
      if (el) wrapper.appendChild(el);
    });

    wrapper.appendChild(buildSaveQuoteCard());

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
    if (isCartPage()) {
      render();
      lastSignature = cartSignature();
      startCartWatcher();
    }
    if (isHomepage()) {
      renderHomepage();
    }
  }

  // ========================================================================
  // HOMEPAGE FEATURES
  // ========================================================================

  var HOMEPAGE = {
    announcement: {
      enabled: true,
      // Set link to '' to disable click-through
      text: 'Extra rental days now 75% off — lock in your event date today',
      link: '',
      dismissible: true,
      storageKey: 'bq-announcement-dismissed'
    },
    socialProof: {
      enabled: true,
      rating: 5,
      reviews: 200,
      text: '5-star reviews from 200+ San Diego events'
    },
    activity: {
      enabled: true,
      // Live booking counter. Since Booqable does not expose booking
      // counts to the scripts framework, this derives a plausible
      // monotonically-increasing number from the current date
      // (baseline + day-of-month × avgPerDay). Edit baseline and
      // avgPerDay to match your real booking velocity.
      baseline: 12,
      avgPerDay: 1.6
    },
    // Trust signals are shared with the cart page — see TRUST_SIGNALS
    // at the top of the script.
  };

  var HOMEPAGE_WRAPPER_ID = 'bq-homepage-wrapper';
  var ANNOUNCEMENT_ID = 'bq-announcement';

  // Returns true for homepage, collection pages, and product pages —
  // essentially every browse/discovery surface. Cart page is handled
  // separately via isCartPage() above and is excluded here.
  function isHomepage() {
    var loc = (Booqable && Booqable.location) || window.location.pathname;
    if (!loc) loc = '/';
    if (loc === '/cart' || loc.indexOf('/cart') === 0) return false;
    if (loc === '/' || loc === '/home') return true;
    if (loc.indexOf('/collections') === 0) return true;
    if (loc.indexOf('/products') === 0) return true;
    return false;
  }

  function isAnnouncementDismissed() {
    if (!HOMEPAGE.announcement.dismissible) return false;
    try { return localStorage.getItem(HOMEPAGE.announcement.storageKey) === '1'; }
    catch (e) { return false; }
  }

  function buildAnnouncementBar() {
    var cfg = HOMEPAGE.announcement;
    if (!cfg.enabled || isAnnouncementDismissed()) return null;
    var bar = document.createElement('div');
    bar.id = ANNOUNCEMENT_ID;
    bar.className = 'bq-announcement';
    var content = cfg.link
      ? '<a href="' + cfg.link + '" class="bq-announcement__link">' + cfg.text + '</a>'
      : '<span class="bq-announcement__text">' + cfg.text + '</span>';
    var close = cfg.dismissible
      ? '<button type="button" class="bq-announcement__close" aria-label="Dismiss">&times;</button>'
      : '';
    bar.innerHTML = content + close;
    if (cfg.dismissible) {
      bar.querySelector('.bq-announcement__close').addEventListener('click', function () {
        try { localStorage.setItem(cfg.storageKey, '1'); } catch (e) {}
        bar.remove();
      });
    }
    return bar;
  }

  function buildSocialProof() {
    var cfg = HOMEPAGE.socialProof;
    if (!cfg.enabled) return null;
    var stars = '';
    for (var i = 0; i < 5; i++) {
      stars += i < cfg.rating ? '&#9733;' : '&#9734;';
    }
    var section = document.createElement('div');
    section.className = 'bq-socialproof';
    section.innerHTML =
      '<span class="bq-socialproof__stars" aria-hidden="true">' + stars + '</span>' +
      '<span class="bq-socialproof__text">' + cfg.text + '</span>';
    return section;
  }

  function eventsThisMonth() {
    var now = new Date();
    var day = now.getDate();
    return HOMEPAGE.activity.baseline +
      Math.floor(day * HOMEPAGE.activity.avgPerDay);
  }

  function buildActivity() {
    if (!HOMEPAGE.activity.enabled) return null;
    var count = eventsThisMonth();
    var monthName = new Date().toLocaleString('en-US', { month: 'long' });
    var section = document.createElement('div');
    section.className = 'bq-activity';
    section.innerHTML =
      '<span class="bq-activity__pulse" aria-hidden="true"></span>' +
      '<span class="bq-activity__text">' +
        '<strong>' + count + '</strong> events booked in ' + monthName +
      '</span>';
    return section;
  }

  function findHomepageContainer() {
    return document.querySelector('main') ||
      document.querySelector('[role="main"]') ||
      document.body;
  }

  function renderHomepage() {
    // Clean up any previous render on soft navigation
    var oldWrap = document.getElementById(HOMEPAGE_WRAPPER_ID);
    if (oldWrap) oldWrap.remove();
    var oldAnn = document.getElementById(ANNOUNCEMENT_ID);
    if (oldAnn) oldAnn.remove();

    injectStyles();

    // Announcement bar goes at the very top of the page
    var bar = buildAnnouncementBar();
    if (bar) document.body.insertBefore(bar, document.body.firstChild);

    // Social proof + activity + trust signals go together as a strip
    // right at the top of the main content area (after Booqable's header)
    var wrapper = document.createElement('div');
    wrapper.id = HOMEPAGE_WRAPPER_ID;
    var proof = buildSocialProof();    if (proof) wrapper.appendChild(proof);
    var activity = buildActivity();    if (activity) wrapper.appendChild(activity);
    var trust = buildTrustSignals(); if (trust) wrapper.appendChild(trust);
    if (!wrapper.children.length) return;
    var container = findHomepageContainer();
    container.insertBefore(wrapper, container.firstChild);
  }

  Booqable.on('page-change', renderWhenReady);
  if (document.readyState !== 'loading') renderWhenReady();
  else document.addEventListener('DOMContentLoaded', renderWhenReady);
})();
