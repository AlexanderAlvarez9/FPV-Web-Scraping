const puppeteer = require('puppeteer');
const fs = require('fs');

async function run() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage()
  let reviews = [];
  //Nombre para creacion de archivos
  let url = 'trueRC'

  //Funcion principal
  async function getPageData(pageNumber = 1) {
    //Pagina a consultar
    await page.goto(`https://www.truerc.ca/shop/page/${pageNumber}`)
    const data = await page.evaluate((pageNumber) => {
      //Elemento contenedor de datos
      const $items = document.querySelectorAll('.product-item-wrapper');
      const page = pageNumber;
      //Clase de paginacion
      const $pagination = document.querySelectorAll('.page-numbers');
      const totalPages = 9
      //const totalPages = Number($pagination[$pagination.length - 1].textContent.trim())
      const data = [];
      //contador para id de producto
      let counter = 1;

      $items.forEach(($item) => {
        data.push({
          id: `${counter}-${Date.now()}`,
          name: $item.querySelector('.product-name').text,
          category: $item.querySelector('.product-cat a').text,
          description: `${$item.querySelector('.product-name').text} - ${$item.querySelector('.product-cat a').text}`,
          //si objeto esta vacio, precio 0
          ...($item.querySelector('.amount') === null ? { price: 0 } : { price: parseFloat($item.querySelector('.amount').textContent.trim()) }),
          //si objeto esta vacio, imagen vacia
          ...($item.querySelector('.attachment-woocommerce_thumbnail') === null ? { originpath: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/No-image-available.png' } : { originpath: $item.querySelector('.attachment-woocommerce_thumbnail').getAttribute("src") }),

        })
        counter = counter + 1;
      })
      return {
        reviews: data,
        totalPages,
      }
    })
    reviews = [...reviews, ...data.reviews]
    console.log(`page ${pageNumber} of ${data.totalPages} completed`)
    if (pageNumber < data.totalPages) {
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

/*
/   Link Guia VIdeo Youtube
/   https://www.youtube.com/watch?v=RDrm7ZD6z0Y&vl=es-419
*/