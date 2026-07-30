document.addEventListener('DOMContentLoaded', () => {

  // FORCE: ensure popups are hidden on load (prevents accidental auto-show)
  const popupChoose = document.getElementById('popupChoose');
  const popupComplete = document.getElementById('popupComplete');
  if (popupChoose) {
    popupChoose.classList.add('hidden');
    popupChoose.setAttribute('aria-hidden','true');
  }
  if (popupComplete) {
    popupComplete.classList.add('hidden');
    popupComplete.setAttribute('aria-hidden','true');
  }

  /* ---------- PAGES & NAV ---------- */
  const pages = Array.from(document.querySelectorAll('.page'));
  const navBtns = Array.from(document.querySelectorAll('.nav-btn'));

  function showPage(id){
    pages.forEach(p => p.classList.add('hidden'));
    const el = document.getElementById(id);
    if(el) {
      el.classList.remove('hidden');
      el.setAttribute('tabindex', '-1');
      el.focus({preventScroll:true});
    }
    window.scrollTo({top:0, behavior:'smooth'});
  }

  navBtns.forEach(b => b.addEventListener('click', () => showPage(b.dataset.page)));
  document.getElementById('enterSite').addEventListener('click', () => showPage('home'));

  /* ---------- CAROUSEL ---------- */
  const track = document.getElementById('carouselTrack');
  const items = Array.from(track.children);
  let index = 0;
  const ITEM_W = 254;
  let autoplayInterval = null;

  function updateCarousel(){
    const x = index * ITEM_W;
    track.style.transform = `translateX(-${x}px)`;
  }

  function startAutoplay(){
    if(autoplayInterval) clearInterval(autoplayInterval);
    autoplayInterval = setInterval(() => {
      index = (index + 1) % items.length;
      updateCarousel();
    }, 3000);
  }
  startAutoplay();

  document.getElementById('prevSlide').addEventListener('click', () => {
    index = (index - 1 + items.length) % items.length;
    updateCarousel();
  });
  document.getElementById('nextSlide').addEventListener('click', () => {
    index = (index + 1) % items.length;
    updateCarousel();
  });

  items.forEach(it => {
    it.addEventListener('click', () => {
      const styleName = it.dataset.style;
      openStylesAndSelect(styleName);
    });
  });

  /* ---------- STYLE DB (from visio) ---------- */
  const STYLE_DB = [
    { key: 'Coquette', body:['petite','medium','curvy'], hijab:'yes', season: ['spring','summer'], go:['date'] },
    { key: 'Dark Coquette', body:['petite','medium','curvy'], hijab:'no', season: ['winter','autumn'], go:['college'] },
    { key: 'Preppy', body:['petite','medium'], hijab:'yes', season:['all'], go:['college','formal'] },
    { key: 'Downtown', body:['petite'], hijab:'yes', season:['all'], go:['date','formal'] },
    { key: 'Mori Kei', body:['petite','medium','curvy'], hijab:'yes', season:['autumn','rain'], go:['college','date'] },
    { key: 'Y2K Grunge', body:['petite','medium'], hijab:'no', season:['all'], go:['date'] }
  ];

  /* ---------- STYLE GRID & FILTERS ---------- */
  const styleGrid = document.getElementById('styleGrid');
  const filterBody = document.getElementById('filterBody');
  const filterHijab = document.getElementById('filterHijab');
  const filterSeason = document.getElementById('filterSeason');
  const filterGo = document.getElementById('filterGo');

  function styleImgFile(key){
    return `assets/images/style_lv1/${key.toLowerCase().replace(/\s+/g,'')}_style_lv1.jpg`;
  }

  function renderStyles(){
    const body = filterBody.value;
    const hijab = filterHijab.value;
    const season = filterSeason.value;
    const go = filterGo.value;
    styleGrid.innerHTML = '';

    STYLE_DB.forEach(s => {
      const bodyOk = (body === 'all') || s.body.includes(body);
      const hijabOk = (hijab === 'all') || (s.hijab === hijab);
      const seasonOk = (season === 'all') || (s.season.includes('all') || s.season.includes(season));
      const goOk = (go === 'all') || s.go.includes(go);
      if(bodyOk && hijabOk && seasonOk && goOk){
        const card = document.createElement('div');
        card.className = 'style-card';
        card.innerHTML = `
          <img src="${styleImgFile(s.key)}" alt="${s.key}">
          <div class="style-name">${s.key}</div>
        `;
        card.addEventListener('click', () => openStyle2(s.key));
        styleGrid.appendChild(card);
      }
    });

    if(!styleGrid.children.length){
      const p = document.createElement('p');
      p.textContent = 'No styles match the selected filters.';
      p.style.color = '#666';
      styleGrid.appendChild(p);
    }
  }
  [filterBody, filterHijab, filterSeason, filterGo].forEach(el => el.addEventListener('change', renderStyles));
  renderStyles();

  function openStylesAndSelect(styleName){
    filterBody.value = 'all'; filterHijab.value = 'all'; filterSeason.value = 'all'; filterGo.value = 'all';
    renderStyles();
    showPage('styles');
    setTimeout(() => {
      const cards = Array.from(styleGrid.querySelectorAll('.style-card'));
      const match = cards.find(c => c.querySelector('.style-name').textContent.trim() === styleName);
      if(match){
        match.scrollIntoView({behavior:'smooth', block:'center'});
        match.classList.add('pulse');
        setTimeout(()=> match.classList.remove('pulse'), 1200);
      }
    }, 220);
  }

  /* ---------- STYLE2 -> STYLE3 flow ---------- */
  const currentStyleEl = document.getElementById('currentStyle');
  let CURRENT_STYLE = null;

  function openStyle2(styleKey){
    CURRENT_STYLE = styleKey;
    currentStyleEl.textContent = `Current Style : ${styleKey}`;
    showPage('style2');
  }

  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openStyle3(CURRENT_STYLE, btn.dataset.cat);
    });
  });
  document.getElementById('backToStyles').addEventListener('click', () => showPage('styles'));

  /* ---------- ITEMS BY STYLE (names from visio) ---------- */
  const ITEMS_BY_STYLE = {
    'Dark Coquette': {
      'Tops': [{name:'Milkmaid Top', img:'darkcoquette_style_lv1.jpg'}],
      'Bottoms': [{name:'Black Lace Miniskirt', img:'darkcoquette_style_lv1.jpg'}],
      'Dress': [{name:'Velvet Corset Dress', img:'darkcoquette_style_lv1.jpg'}],
      'Accessories': [{name:'Choker Ribbon', img:'darkcoquette_style_lv1.jpg'}]
    },
    'Coquette': {
      'Tops': [{name:'Pink Milkmaid Top', img:'coquette_style_lv1.jpg'}],
      'Bottoms': [{name:'White Lace Miniskirt', img:'coquette_style_lv1.jpg'}],
      'Dress': [{name:'Pink Minidress', img:'coquette_style_lv1.jpg'}],
      'Accessories': [{name:'Mary Jane Shoes', img:'coquette_style_lv1.jpg'}]
    },
    'Downtown': {
      'Tops': [{name:'Maroon Henley Top', img:'downtown_style_lv1.jpg'}],
      'Bottoms': [{name:'Vintage Flare Jeans', img:'downtown_style_lv1.jpg'}],
      'Dress': [{name:'Plaid Black Dress', img:'downtown_style_lv1.jpg'}],
      'Accessories': [{name:'Brown Chunky Boots', img:'downtown_style_lv1.jpg'}]
    },
    'Mori Kei': {
      'Tops': [{name:'Brown Plaid Blouse', img:'morikei_style_lv1.jpg'}],
      'Bottoms': [{name:'Brown Lace Miniskirt', img:'morikei_style_lv1.jpg'}],
      'Dress': [{name:'Green Layered Dress', img:'morikei_style_lv1.jpg'}],
      'Accessories': [{name:'Neapolitan Bag', img:'morikei_style_lv1.jpg'}]
    },
    'Preppy': {
      'Tops': [{name:'White Slimfit Shirt', img:'preppy_style_lv1.jpg'}],
      'Bottoms': [{name:'Brown Plaid Skirt', img:'preppy_style_lv1.jpg'}],
      'Dress': [{name:'Black Blazer Dress', img:'preppy_style_lv1.jpg'}],
      'Accessories': [{name:'Plaid Hairband', img:'preppy_style_lv1.jpg'}]
    },
    'Y2K Grunge': {
      'Tops': [{name:'Emo Grunge T-shirt', img:'y2kgrunge_style_lv1.jpg'}],
      'Bottoms': [{name:'Gothic Bow Flare Jeans', img:'y2kgrunge_style_lv1.jpg'}],
      'Dress': [{name:'Black Zip-up Shirtdress', img:'y2kgrunge_style_lv1.jpg'}],
      'Accessories': [{name:'Studded Belt', img:'y2kgrunge_style_lv1.jpg'}]
    }
  };

  const itemsGrid = document.getElementById('itemsGrid');

  function openStyle3(styleKey, category){
    CURRENT_STYLE = styleKey;
    const header = document.getElementById('style3Header');
    header.textContent = `${styleKey} · ${category}`;
    itemsGrid.innerHTML = '';
    const list = (ITEMS_BY_STYLE[styleKey] && ITEMS_BY_STYLE[styleKey][category]) || [];
    list.forEach(it => {
      const card = document.createElement('div');
      card.className = 'item-card fade';
      card.innerHTML = `
        <img src="assets/images/style_lv1/${it.img}" alt="${it.name}">
        <h4>${it.name}</h4>
        <p class="small">Style: ${styleKey}</p>
      `;
      card.addEventListener('click', () => openChoosePopup(it.name, styleKey, it.img));
      itemsGrid.appendChild(card);
    });
    showPage('style3');
  }

  document.getElementById('backToCats').addEventListener('click', () => showPage('style2'));

  /* ---------- POPUPS: choose, save, complete ---------- */
  const popupChooseEl = document.getElementById('popupChoose');
  const popupChooseContent = document.getElementById('popupChooseContent');
  const favBtn = document.getElementById('favBtn');
  const chooseAnother = document.getElementById('chooseAnother');
  const popupCompleteEl = document.getElementById('popupComplete');
  const okComplete = document.getElementById('okComplete');
  let selectionCount = 0;
  let lastChosen = null;

  const STORAGE_KEY = 'elzy_saved_outfits_vfinal';
  function getSaved(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] } }
  function saveSaved(arr){ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)) }

  function openChoosePopup(itemName, styleKey, imageFile){
    lastChosen = { name: itemName, style: styleKey, img: imageFile };
    popupChooseContent.innerHTML = `<h3>You chose "${itemName}"</h3>
      <p>Style: ${styleKey}</p>
      <img src="assets/images/style_lv1/${imageFile}" alt="${itemName}" style="width:100%;border-radius:8px;margin-top:8px">`;
    // show modal (only on user click)
    if (popupChooseEl) {
      popupChooseEl.classList.remove('hidden');
      popupChooseEl.setAttribute('aria-hidden','false');
    }
  }

  document.querySelectorAll('.close-x').forEach(x => x.addEventListener('click', () => {
    x.closest('.modal').classList.add('hidden');
  }));

  chooseAnother.addEventListener('click', () => {
    if (popupChooseEl) {
      popupChooseEl.classList.add('hidden');
      popupChooseEl.setAttribute('aria-hidden','true');
    }
  });

  favBtn.addEventListener('click', () => {
    if(!lastChosen) return;
    const saved = getSaved();
    saved.push(lastChosen);
    saveSaved(saved);
    selectionCount++;
    if (popupChooseEl) {
      popupChooseEl.classList.add('hidden');
      popupChooseEl.setAttribute('aria-hidden','true');
    }

    if(selectionCount >= 3){
      if (popupCompleteEl) {
        popupCompleteEl.classList.remove('hidden');
        popupCompleteEl.setAttribute('aria-hidden','false');
      }
      selectionCount = 0;
    } else {
      toast(`Saved "${lastChosen.name}"`);
    }
    updateSavedListUI(false);
  });

  okComplete.addEventListener('click', () => {
    if (popupCompleteEl) {
      popupCompleteEl.classList.add('hidden');
      popupCompleteEl.setAttribute('aria-hidden','true');
    }
    showPage('profile');
    updateSavedListUI(true);
  });

  // outside click to close modal
  document.querySelectorAll('.modal').forEach(mod => {
    mod.addEventListener('click', (e) => {
      if(e.target === mod){
        mod.classList.add('hidden');
      }
    });
  });

  function toast(msg){
    const el = document.createElement('div');
    el.textContent = msg;
    Object.assign(el.style, { position:'fixed', bottom:'28px', left:'50%', transform:'translateX(-50%)', background:'#111', color:'#fff', padding:'10px 14px', borderRadius:'12px', zIndex:140, opacity:0.95 });
    document.body.appendChild(el);
    setTimeout(()=> el.remove(), 1400);
  }

  /* ---------- PROFILE: saved outfits ---------- */
  const viewSavedBtn = document.getElementById('viewSavedBtn');
  const savedListEl = document.getElementById('savedList');

  viewSavedBtn.addEventListener('click', () => updateSavedListUI(true));

  function updateSavedListUI(show = true){
    const saved = getSaved();
    if(!saved.length){
      savedListEl.innerHTML = '<p>No saved outfits yet.</p>';
    } else {
      savedListEl.innerHTML = saved.map((s, idx) => `
        <div class="saved-item" style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
          <img src="assets/images/style_lv1/${s.img}" alt="${s.name}" style="width:70px;height:70px;object-fit:cover;border-radius:8px">
          <div>
            <strong>${s.name}</strong><div style="font-size:12px;color:#666">${s.style}</div>
          </div>
          <button data-idx="${idx}" class="btn-remove" style="margin-left:auto;border:0;background:transparent;cursor:pointer">Remove</button>
        </div>
      `).join('');
      Array.from(savedListEl.querySelectorAll('.btn-remove')).forEach(btn => {
        btn.addEventListener('click', e => {
          const idx = +e.target.dataset.idx;
          const arr = getSaved();
          arr.splice(idx,1);
          saveSaved(arr);
          updateSavedListUI(show);
          toast('Removed saved outfit');
        });
      });
    }
    if(show) savedListEl.classList.remove('hidden');
  }

  document.getElementById('loginBtn').addEventListener('click', () => toast('Logged in (demo)'));
  document.getElementById('logoutBtn').addEventListener('click', () => toast('Logged out (demo)'));

  /* ---------- TIPS ---------- */
  const tipsDetail = document.getElementById('tipsDetail');
  const tipCards = Array.from(document.querySelectorAll('.tip-card'));
  const TIP_CONTENT = {
    1: `<h4>Hijab Friendly layering for Petite Frame</h4>
        <ol>
          <li>Focus on balanced proportions: cropped outerwear + high-waist bottoms.</li>
          <li>Soft, flowy fabrics that move but don't overwhelm.</li>
          <li>Add light layers (vest/bolero) for dimension without bulk.</li>
        </ol>`,
    2: `<h4>Layering Dark Coquette for colder weather</h4>
        <ol>
          <li>Start with a thermal base layer.</li>
          <li>Use velvet or fine knits for the main piece.</li>
          <li>Add a short, structured jacket or capelet to keep the silhouette sharp.</li>
        </ol>`,
    3: `<h4>How to balance accessories & proportions</h4>
        <ol>
          <li>Don't overdo it: Choose one statement piece (e.g., a large necklace OR chunky shoes).</li>
          <li>If your outfit is long/flowy, use a belt or fitted accessory to define the waist.</li>
          <li>Use small bags if you have a petite frame, avoid large, overwhelming totes.</li>
        </ol>`
  };

  tipCards.forEach(card => {
    card.addEventListener('click', () => {
      const tipId = card.dataset.tip;
      tipsDetail.innerHTML = TIP_CONTENT[tipId];
      tipsDetail.classList.remove('hidden');
      tipsDetail.scrollIntoView({behavior:'smooth', block:'center'});
    });
  });

});
