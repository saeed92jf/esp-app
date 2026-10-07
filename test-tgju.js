// using native fetch
fetch('https://www.tgju.org/')
  .then(r => r.text())
  .then(html => {
    const trRegex = /<tr[^>]*data-market-nameslug="([^"]+)"[^>]*data-price="([^"]+)"[^>]*>([\s\S]*?)<\/tr>/g;
    let match;
    const prices = {};
    while((match = trRegex.exec(html)) !== null) {
      const id = match[1];
      const price = match[2].replace(/,/g, '');
      const innerHtml = match[3];
      
      let trend = 'neutral';
      if (innerHtml.includes('class="high"')) trend = 'up';
      else if (innerHtml.includes('class="low"')) trend = 'down';
      
      let change = 0, percentChange = 0;
      if (trend !== 'neutral') {
        const changeMatch = innerHtml.match(/class="(?:high|low)"[^>]*>\(([\d.]+)%\)\s*([\d,.]+)/);
        if (changeMatch) {
          percentChange = parseFloat(changeMatch[1]);
          change = parseFloat(changeMatch[2].replace(/,/g, ''));
          if (trend === 'down') {
             change = -change;
             percentChange = -percentChange;
          }
        }
      }
      prices[id] = { price, trend, change, percentChange };
    }
    console.log('geram18:', prices['geram18']);
    console.log('ons:', prices['ons']);
    console.log('price_dollar_rl:', prices['price_dollar_rl']);
    console.log('Total extracted:', Object.keys(prices).length);
  })
  .catch(console.error);
