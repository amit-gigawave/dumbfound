const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1024 });
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 15000 });
    
    // Scroll down the page to trigger animations
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight - window.innerHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 50);
      });
    });
    
    await new Promise(r => setTimeout(r, 2000)); // wait for animations to settle
    
    // Scroll back to top
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    
    await new Promise(r => setTimeout(r, 1000));
    
    await page.screenshot({ path: 'screenshot_scrolled.png', fullPage: true });
    console.log('Screenshot saved as screenshot_scrolled.png');
  } catch (err) {
    console.error('Error taking screenshot:', err);
  } finally {
    await browser.close();
  }
})();
