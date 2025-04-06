class GachaSimulator {
  constructor() {
    this.fiveStarPity = 0;
    this.fourStarPity = 0;
    this.guaranteedFiveStar = false; // true = next 5-star is guaranteed to be featured
    this.results = [];
  }

  pull() {
    this.fiveStarPity++;
    this.fourStarPity++;

    let roll = Math.random();

    // 5-star logic
    let fiveStarRate = this.fiveStarPity >= 75 ? this.getSoftPityRate(this.fiveStarPity) : 0.006;

    if (this.fiveStarPity >= 90 || roll < fiveStarRate) {
      this.fiveStarPity = 0;
      this.fourStarPity = 0;
      const isFeatured = this.guaranteedFiveStar || Math.random() < 0.5;
      this.guaranteedFiveStar = !isFeatured;
      const result = isFeatured ? "5★ Featured Character" : "5★ Off-Banner Character";
      this.results.push(result);
      return result;
    }

    // 4-star logic
    if (this.fourStarPity >= 10 || roll < 0.051) {
      this.fourStarPity = 0;
      this.results.push("4★ Character or Weapon");
      return "4★ Character or Weapon";
    }

    // 3-star pull
    this.results.push("3★ Weapon");
    return "3★ Weapon";
  }

  // Soft pity curve: increases 5★ chance from ~75 to 90 pulls
  getSoftPityRate(pityCount) {
    const baseRate = 0.006;
    if (pityCount < 75) return baseRate;
    const extraChance = (pityCount - 74) * 0.06; // increase 6% per pull after 74
    return Math.min(baseRate + extraChance, 1);
  }

  // Pull multiple times
  multiPull(times = 10) {
    const pulls = [];
    for (let i = 0; i < times; i++) {
      pulls.push(this.pull());
    }
    return pulls;
  }

  // Get 5-star stats and win rate
  getFiveStarStats() {
    const fiveStars = this.results.filter(r => r.includes("5★"));
    const featured = fiveStars.filter(r => r === "5★ Featured Character").length;
    const offBanner = fiveStars.filter(r => r === "5★ Off-Banner Character").length;
    const total = fiveStars.length;
    const winRate = total > 0 ? (featured / total * 100).toFixed(2) : "0.00";

    return {
      totalFiveStars: total,
      featuredCount: featured,
      offBannerCount: offBanner,
      featuredWinRate: winRate + '%',
      totalWishes: this.results.length,
    };
  }
}

function createWishCardResult(text) {
	const div = document.createElement("div");
	const node = document.createTextNode(text);
	div.classList.add('banner-card')
	if (text.startsWith('5')) {
		div.classList.add('gold')
	} else if (text.startsWith('4')) {
		div.classList.add('purple')
	} else {
		div.classList.add('blue')
	}
	div.appendChild(node);
	return div;
}

function removeDOMChildren(element) {
	while (element.firstChild) {
	    element.removeChild(element.lastChild);
	}
}

const sim = new GachaSimulator();

const bannerIntro = document.getElementById('banner-intro');
const bannerWish = document.getElementById('banner-wish');
const bannerSummary = document.getElementById('banner-summary');
const buttonWish1 = document.getElementById('button-wish-1');
const buttonWish10 = document.getElementById('button-wish-10');
const buttonSummary = document.getElementById('button-summary');
const pityCounter = document.getElementById('pity-counter')
const bannerCardsContainer = document.getElementById('banner-cards');

buttonWish1.addEventListener('click', function(e) {
	bannerIntro.style.display = 'none';	
	bannerWish.style.display = 'block';
	bannerSummary.style.display = 'none';
	removeDOMChildren(bannerCardsContainer);

	const res = sim.pull();

	const newWishResultDiv = createWishCardResult(res);
	bannerCardsContainer.appendChild(newWishResultDiv);

	pityCounter.innerHTML = 'Pity counter: ' + sim.fiveStarPity;
});

buttonWish10.addEventListener('click', function(e) {
	bannerIntro.style.display = 'none';	
	bannerWish.style.display = 'block';
	bannerSummary.style.display = 'none';
	removeDOMChildren(bannerCardsContainer);

	const res = sim.multiPull();

	for (let i = 0; i < res.length; i++) {
		const newWishResultDiv = createWishCardResult(res[i]);
		bannerCardsContainer.appendChild(newWishResultDiv);
	};

	pityCounter.innerHTML = 'Pity counter: ' + sim.fiveStarPity;
});

buttonSummary.addEventListener('click', function(e) {
	bannerIntro.style.display = 'none';	
	bannerWish.style.display = 'none';
	bannerSummary.style.display = 'block';
	removeDOMChildren(bannerCardsContainer);

	const res = sim.getFiveStarStats();

	const totalFiveStarsText = '<strong>Total Five Stars</strong>: ' + res.totalFiveStars;
	const featuredCountText = '<strong>Total Win</strong>: ' + res.featuredCount;
	const offBannerCountText = '<strong>Total Lose</strong>: ' + res.offBannerCount;
	const featuredWinRateText = '<strong>Win Rate</strong>: ' + res.featuredWinRate;
	const totalWishesText = '<strong>Total Wishes</strong>: ' + res.totalWishes;

	document.getElementById('totalFiveStars').innerHTML = totalFiveStarsText;
	document.getElementById('featuredCount').innerHTML = featuredCountText;
	document.getElementById('offBannerCount').innerHTML = offBannerCountText;
	document.getElementById('featuredWinRate').innerHTML = featuredWinRateText;
	document.getElementById('totalWishes').innerHTML = totalWishesText;
});