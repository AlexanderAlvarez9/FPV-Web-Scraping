const puppeteer = require('puppeteer');
const fs = require('fs');

async function run() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage()
  let reviews = [];
  let url = 'sistemas-fpv-y-camaras'
  async function getPageData(pageNumber = 1) {
    await page.goto(`https://fpvstore.co/${url}.html?limit=all`)
    const data = await page.evaluate(() => {
      const $items = document.querySelectorAll('.item')
      // const $pagination = document.querySelectorAll('.Pagination .Pagination-number');
      // const totalPages = Number($pagination[$pagination.length - 1].textContent.trim())
      const data = [];
      let counter = 1;

      $items.forEach(($item) => {
        data.push({
          id: counter,
          product: $item.querySelector('.product-name a').text,
          description: $item.querySelector('.product-name a').text,
          price: $item.querySelector('.price').textContent.replace(".", "").replace("$", "").trim(),
          category: 'Sistemas-fpv-y-camaras',
          image: $item.querySelector('.front-img').getAttribute("src"),
        })
        counter = counter + 1;
      })
      return {
        reviews: data,
        // totalPages
      }
    })
    reviews = [...reviews, ...data.reviews]
    // console.log(`page ${pageNumber} of ${data.totalPages} completed`);
    // if (pageNumber <= data.totalPages) {
    if (false) {
      getPageData(pageNumber + 1)
    } else {
      fs.writeFile(`${url}-data.json`, `${JSON.stringify(reviews)}`, () => {
        console.log('Todo correcto, capturando imagen, espere...');
      })
      await page.screenshot({
        path: `${url}-screenshot.png`,
        fullPage: true
      }) // take screenshot
      console.log('Finalizado, hasta pronto');
      await browser.close();
    }
  }
  getPageData()
};

run();